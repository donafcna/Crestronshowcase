import * as T from './vendor/three.module.min.js';

// Five independent lighting circuits, spatial audio and room-specific equipment.
// Static geometry is consolidated by the caller; no additional shadow maps.
export function enrichRoom(R, M) {
  const g=R.group,{w,d,type,niveau}=R.cfg;
  const box=(p,m,x,y,z,a,b,c)=>{const o=new T.Mesh(new T.BoxGeometry(a,b,c),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;p.add(o);return o;};
  const cyl=(p,m,x,y,z,r,h)=>{const o=new T.Mesh(new T.CylinderGeometry(r,r,h,16),m);o.position.set(x,y,z);p.add(o);return o;};
  const features=new T.Group();features.name='Lighting circuits and equipment';g.add(features);
  for(let circuit=2;circuit<5;circuit++){
    const mat=new T.MeshStandardMaterial({color:0xfff1dc,emissive:circuit===4?0xffd9a7:0xffdfb4,emissiveIntensity:0,roughness:.65});
    let fixture;
    if(circuit===2){
      // Recessed cornice: opaque lip and continuous light above it.
      const h=R.ext? .23:2.77;
      box(features,M.bois,.24,h,d/2,.16,.09,d-.45);
      fixture=box(features,mat,.27,h+.06,d/2,.045,.025,d-.52);
      box(features,M.bois,w/2,h,.23,w-.45,.09,.16);
      box(features,mat,w/2,h+.06,.27,w-.52,.025,.045);
    }else if(circuit===3){
      // Sconces sit clear of both the window aperture and the television.
      for(const z of [.45,d-.48]){
        box(features,M.alu,.24,1.92,z,.18,.4,.19);
        fixture=box(features,mat,.25,2.13,z,.16,.022,.16);
        box(features,mat,.25,1.71,z,.16,.022,.16);
      }
    }else{
      fixture=box(features,mat,w/2,.13,d-.18,w-.6,.026,.028);
      box(features,mat,w-.18,.13,d/2,.028,.026,d-.6);
      if(type==='cuisine'||type==='poolhouse')box(features,mat,w/2,.23,d*.55+.52,2.3,.025,.03);
      if(type==='sauna')box(features,mat,w/2,.39,.92,w-.7,.025,.025);
    }
    R.lamps.push({mesh:fixture,mat,circuit,pos:new T.Vector3(w/2,circuit===2?2.7:1.4,d/2)});
  }
  // Additional channels share exactly the same per-room playback and volume state.
  function speaker(kind,x,y,z,rotation=0,ceiling=false){
    const s=new T.Group();s.position.set(x,y,z);s.rotation.y=rotation;if(ceiling)s.rotation.x=-Math.PI/2;g.add(s);
    const body=box(s,M.noir,0,0,0,ceiling?.32:.24,ceiling?.32:.4,.12);
    const cone=cyl(s,M.metal,0,0,.072,.083,.016);cone.rotation.x=Math.PI/2;
    const ring=new T.Mesh(new T.RingGeometry(.1,.15,28),new T.MeshBasicMaterial({color:0x10b981,transparent:true,opacity:0,depthWrite:false,side:T.DoubleSide}));ring.position.z=.087;s.add(ring);
    body.userData.animated=true;ring.userData.animated=true;
    R.speakers.push({body,ring,phase:R.speakers.length*.7,kind});
  }
  R.speakers.forEach(s=>{s.kind='front';});
  if(type==='cinema'){
    speaker('center',w/2,.67,.25);
    for(const side of [-1,1]){
      const x=side<0?.25:w-.25;
      speaker('surround',x,1.9,d*.62,side<0?Math.PI/2:-Math.PI/2);
      // Low rear pedestals preserve the cutaway view without inventing floating speakers.
      box(features,M.alu,w/2+side*1.5,.68,d-.35,.045,1.36,.045);
      speaker('rear',w/2+side*1.5,1.45,d-.35,Math.PI);
      for(const z of [d*.36,d*.72]){
        box(features,M.alu,w/2+side*1.55,2.98,z,.46,.06,.46);
        speaker('ceiling',w/2+side*1.55,2.94,z,0,true);
      }
    }
  }else{
    speaker(R.ext?'outdoor':'ceiling',w*.7,R.ext?1.65:2.94,d*.65,0,!R.ext);
  }
  if(R.win && niveau<0){
    // Cour anglaise: daylight has an explicit open-to-sky path to the basement.
    const q=R.win.group,cx=R.win.x,span=R.win.w+1.3;
    box(q,M.dalle,cx,-.1,-1.15,span,.14,2.1);
    box(q,M.mur,cx,1.05,-2.15,span,2.3,.15);
    for(const side of [-1,1])box(q,M.mur,cx+side*span/2,1.05,-1.1,.15,2.3,2.1);
    for(let i=0;i<4;i++)cyl(q,M.plante,cx-span*.3+i*span*.2,.2,-1.7,.14,.4);
  }
  if(niveau===0&&!R.ext){
    // South-facing retractable awning, retained in the room cutaway.
    const aw=new T.Group();aw.name='Store banne extérieur';R.win.group.add(aw);
    aw.rotation.y=Math.PI;aw.position.x=R.win.x*2;
    const width=R.win.w+1.1,cx=R.win.x,z=.13,reach=2.3;
    box(aw,M.alu,cx,2.85,z,width,.18,.22);
    const cloth=box(aw,M.blanc,cx,2.74,z,width-.1,.04,reach);cloth.geometry.translate(0,0,reach/2);cloth.scale.z=.02;cloth.userData.animated=true;
    const bar=box(aw,M.alu,cx,2.62,z,width,.08,.07);bar.userData.animated=true;
    const arms=[];for(const side of [-1,1]){const arm=box(aw,M.alu,cx+side*(width/2-.3),2.67,z,.04,.055,reach);arm.geometry.translate(0,0,reach/2);arm.userData.animated=true;arms.push(arm);}
    R.shades ||= {};
    R.shades.banne={mesh:cloth,axis:'z',min:.02,pos:0,cible:0,update(o,sc){bar.position.z=z+reach*sc;arms.forEach(a=>a.scale.z=sc);}};
    R.shades.banne.update(R.shades.banne,.02);
  }
  if(type==='garage'){
    for(const x of [w*.28,w*.7]){
      const car=new T.Group();car.name='Electric grand tourer';car.position.set(x,0,d*.5);g.add(car);
      box(car,M.metal,0,.5,0,1.8,.5,3.7);box(car,M.noir,0,.95,-.15,1.5,.5,1.8);
      box(car,M.verreExt,0,1.05,.79,1.42,.35,.03);
      for(const sx of [-.92,.92])for(const sz of [-1.1,1.1]){const wheel=cyl(car,M.noir,sx,.33,sz,.32,.18);wheel.rotation.z=Math.PI/2;}
      for(const sx of [-.62,.62])box(car,M.blanc,sx,.56,1.87,.4,.1,.035);
    }
    box(features,M.noir,w-.2,1.25,.8,.16,.45,.3);box(features,M.plante,w-.1,1.27,.8,.01,.14,.17);
    box(features,M.alu,w/2,1.1,.3,3,2.2,.35);
    for(let i=0;i<4;i++)box(features,M.noir,w/2-1.1+i*.73,1.1,.49,.018,2,.012);
  }
  if(type==='golf'){
    box(features,M.tissuFonce,w/2,1.5,.24,w-1,2.85,.2);
    box(features,M.gazon,w/2,.055,d*.55,w-1,.06,d-1);
    const canvas=document.createElement('canvas');canvas.width=768;canvas.height=432;const c=canvas.getContext('2d');
    const sky=c.createLinearGradient(0,0,0,270);sky.addColorStop(0,'#709eb6');sky.addColorStop(1,'#dae7e0');c.fillStyle=sky;c.fillRect(0,0,768,432);
    c.fillStyle='#375d38';c.beginPath();c.moveTo(0,220);c.lineTo(170,165);c.lineTo(340,208);c.lineTo(590,142);c.lineTo(768,200);c.lineTo(768,432);c.lineTo(0,432);c.fill();
    c.fillStyle='#7d9957';c.beginPath();c.moveTo(155,432);c.lineTo(382,238);c.lineTo(453,238);c.lineTo(650,432);c.fill();c.fillStyle='#bccb83';c.beginPath();c.ellipse(421,272,60,12,0,0,7);c.fill();c.strokeStyle='#fff';c.beginPath();c.moveTo(428,273);c.lineTo(428,205);c.stroke();c.fillStyle='#d55543';c.fillRect(428,205,23,13);
    c.fillStyle='#102a24';c.fillRect(0,0,768,49);c.fillStyle='#fff';c.font='20px sans-serif';c.fillText('ALPINE GOLF   ·   PAR 4   ·   342 m',25,32);
    const tex=new T.CanvasTexture(canvas);tex.colorSpace=T.SRGBColorSpace;
    box(features,new T.MeshBasicMaterial({map:tex}),w/2,1.55,.36,w-1.25,2.6,.025);
    box(features,M.noir,w/2,2.83,d*.63,.42,.19,.33);cyl(features,M.blanc,w/2,.1,d*.65,.025,.03);
    box(features,M.noir,w-.65,.2,d*.7,.15,.4,.25);
    for(let i=0;i<3;i++){const club=cyl(features,M.metal,.65+i*.12,.7,d-.65,.018,1.2);club.rotation.z=.13;}
  }
}
