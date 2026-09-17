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
      const positions=type==='repas'?[.5,d-.5]:[.45,d-.48];
      for(const z of positions){
        box(features,M.alu,.24,1.92,z,.18,.4,.19);
        fixture=box(features,mat,.25,2.13,z,.16,.022,.16);
        box(features,mat,.25,1.71,z,.16,.022,.16);
      }
      if(type==='repas')for(let i=0;i<8;i++){
        const x=1.1+i*(w-2.2)/7;
        box(features,M.alu,x,2.28,.22,.17,.42,.16);
        box(features,mat,x,2.5,.23,.15,.025,.13);
        box(features,mat,x,2.06,.23,.15,.025,.13);
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
  function speaker(kind,x,y,z,rotation=0,model='compact'){
    const s=new T.Group();s.name=kind+' loudspeaker';s.position.set(x,y,z);s.rotation.y=rotation;g.add(s);
    const tower=model==='tower',sub=model==='sub',center=kind==='center';
    const width=sub?.5:center?.7:tower?.26:.22,height=sub?.5:center?.13:tower?.9:.34,depth=sub?.46:tower?.28:.15;
    const body=box(s,M.noir,0,0,0,width,height,depth);
    const cone=cyl(s,M.metal,0,tower?.14:0,depth/2+.01,sub?.16:center?.048:.08,.012);cone.rotation.x=Math.PI/2;
    if(tower){const bass=cyl(s,M.metal,0,-.17,depth/2+.01,.085,.012);bass.rotation.x=Math.PI/2;}
    const radius=sub?.165:center?.053:.086;
    const ring=new T.Mesh(new T.RingGeometry(radius,radius+.007,32),new T.MeshBasicMaterial({color:0xd1dedc,transparent:true,opacity:0,depthWrite:false,side:T.DoubleSide}));ring.position.set(0,tower?.14:0,depth/2+.023);s.add(ring);
    body.userData.animated=true;ring.userData.animated=true;
    R.speakers.push({body,ring,group:s,phase:R.speakers.length*.7,kind,model});
  }
  if(type==='cinema'){
    speaker('center',w/2,.115,.42);
    for(const side of [-1,1]){
      speaker('front',side<0?1.4:w-1.4,.45,.45,0,'tower');
      // Behind the west window (aperture z≈2–4), never over the glazing.
      const x=side<0?.25:w-.25;
      box(features,M.alu,x,.86,d-.5,.045,1.72,.045);
      speaker('surround',x,1.9,d-.5,side<0?Math.PI/2:-Math.PI/2);
      // Low rear pedestals preserve the cutaway view without inventing floating speakers.
      box(features,M.alu,w/2+side*1.5,.68,d-.35,.045,1.36,.045);
      speaker('rear',w/2+side*1.5,1.45,d-.35,Math.PI);
    }
  }else if(type==='salon'){
    for(const side of [-1,1]){
      speaker('front',w*.55+side*1.4,.45,.46,0,'tower');
      const x=w*.55+side*1.85;box(features,M.alu,x,.49,d-.55,.045,.98,.045);
      speaker('rear',x,1.12,d-.55,Math.PI);
    }
    speaker('subwoofer',w*.55-2.15,.25,.5,0,'sub');
  }else if(type==='repas'){
    speaker('front',.6,.45,.5,0,'tower');speaker('front',w-.6,.45,.5,0,'tower');
  }else if(type==='chambre'||type==='suite'){
    speaker('corner',.45,.45,.5,0,'tower');speaker('corner',w-.45,.45,.5,0,'tower');
  }else if(type==='bureau'){
    speaker('corner',.45,.45,.5,0,'tower');
  }else if(R.ext||type==='poolhouse'){
    speaker('outdoor',w-.4,1.6,.45);
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
  if(type==='technique'){
    // Two full-height AV/network racks and an electrical distribution cabinet.
    for(const x of [.65,1.45]){
      box(features,M.noir,x,1.12,.55,.65,2.2,.7);
      for(let u=0;u<11;u++){
        box(features,M.alu,x,.2+u*.175,.915,.55,.13,.02);
        for(let port=0;port<6;port++)box(features,M.noir,x-.22+port*.085,.21+u*.175,.93,.035,.035,.012);
        box(features,M.plante,x+.23,.21+u*.175,.945,.016,.015,.014);
      }
    }
    box(features,M.blanc,w-.53,1.36,.32,.74,1.1,.3);
    for(let i=0;i<4;i++)for(let j=0;j<5;j++)box(features,M.noir,w-.79+j*.13,1.01+i*.21,.485,.06,.11,.02);
    for(const x of [.65,1.45])box(features,M.alu,x,2.5,.55,.09,.6,.09);
    box(features,M.alu,w/2,2.79,.55,w-.4,.08,.3);
    box(features,M.bois,w/2,.77,d-1,w-.5,.08,.65);
    for(const x of [.35,w-.35])box(features,M.alu,x,.37,d-1,.06,.74,.55);
    box(features,M.noir,w/2,1.02,d-1.1,.58,.38,.045);
    box(features,M.noir,w/2,.83,d-.87,.42,.02,.14);
  }
}
