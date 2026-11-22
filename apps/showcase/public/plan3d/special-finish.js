import * as T from './vendor/three.module.min.js';
import { bevelBox } from './furniture-finish.js?v=2026-11-22-villa-4';

// Villa-only static finish, before material batching. No animation or extra light.
export function finishSpecialRoom(R,M,A,polish=false) {
  if(![11,12,13,15,16,17].includes(R.id))return;
  const {w,d,type}=R.cfg,g=R.group;
  const detail=new T.Group();detail.name='Special-space finish';g.add(detail);
  const box=(m,x,y,z,a,b,c)=>{const soft=m===A.cream;const o=new T.Mesh(soft?bevelBox(a,b,c,true):new T.BoxGeometry(a,b,c),m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;detail.add(o);return o;};
  const tube=(m,points,r=.012)=>{const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));const o=new T.Mesh(new T.TubeGeometry(curve,10,r,5,false),m);detail.add(o);return o;};
  const contacts=[];
  if(type==='terrasse'){
    for(const o of g.children){
      const p=o.geometry?.parameters;
      if(o.isMesh&&o.material===M.boisClair&&p?.width===.7&&p.depth===1.9){o.scale.y=.4;o.position.y=.37;}
    }
    // Existing chaise cushions are horizontal: add matching back pads and open legs.
    for(let i=0;i<2;i++){
      const x=w*.35+i,z=d*.5;
      const pad=box(A.cream,x,.62,z-.50,.64,.35,.11);pad.rotation.x=-.12;
      for(const side of [-1,1]){
        box(M.bois,x+side*.31,.35,z,.055,.09,1.7);
        box(M.boisClair,x+side*.39,.62,z+.03,.055,.055,1.18);
        for(const end of [-1,1])box(M.bois,x+side*.31,.18,z+end*.68,.06,.36,.06);
      }
      // Woven towel at the foot, with two understated stitched bands.
      box(A.cream,x,.49,z+.62,.62,.025,.38);
      for(const dz of [.49,.73])box(A.moss,x,.505,z+dz,.62,.007,.02);
      contacts.push([x,z,.46,1.05]);
    }
    // Pergola corner brackets and visible joinery, away from the moving canopy.
    for(const x of [.4,w-.4])for(const z of [.4,d-.4]){
      box(M.alu,x,2.5,z,.19,.22,.19);
      box(M.metal,x,2.49,z+.103,.07,.07,.015);
    }
  }
  if(type==='piscine'){
    // Coping must sit above the existing animated water crest, not below it.
    for(const o of g.children){
      const p=o.geometry?.parameters;
      if(o.isMesh&&o.material===M.blanc&&p?.width>w*.7&&p.height<.1){o.position.y=.39;o.material=A.stone;}
    }
    g.traverse(o=>{if(o.isMesh&&o.material===A.stone&&o.position.y===.13)o.position.y=.39;});
    const x0=w*.15-.18,x1=w*.85+.18,z0=d*.225-.12,z1=d*.775+.12;
    // Slab joints and a recessed linear overflow drain on the outside edge.
    for(const z of [z0,z1]){
      box(A.charcoal,w/2,.37,z+(z<d/2?-.17:.17),w*.72,.018,.035);
      for(let i=1;i<9;i++)box(A.ceramic,w*.14+i*w*.72/9,.433,z,.009,.006,.2);
    }
    for(const x of [x0,x1])for(let i=0;i<7;i++)box(A.ceramic,x,.463,d*.225+i*d*.55/6,.34,.007,.009);
    for(let i=0;i<3;i++){
      const z=.9+i*1.6;contacts.push([.7,z,.4,.91]);
      const pad=box(A.cream,.7,.52,z-.55,.56,.28,.09);pad.rotation.x=-.22;
    }
    // Ladder rungs now connect the existing handrails.
    for(let i=0;i<3;i++)box(A.brass,w*.6+.225,.27-i*.11,d*.78-.13,.45,.025,.065);
    R.specialWater=true;
  }
  if(type==='sauna'){
    const cw=(w-.75)/2;
    // Cedar backrests and bench aprons make the stepped seating read as joinery.
    for(const y of [1.12,1.27,1.42])box(M.boisClair,.25+cw/2,y,.39,cw-.35,.095,.055);
    for(const z of [.72,1.25]){
      box(M.bois,.25+cw/2,z===.72?.73:.3,z+.31,cw-.4,.19,.045);
      for(const x of [.55,cw-.1])box(M.bois,x,z===.72?.43:.21,z,.07,z===.72?.86:.42,.45);
    }
    for(let i=0;i<3;i++)box(A.cream,1.1,.98+i*.055,.78,.65,.045,.42);
    const center=.25+(cw+.22)+cw/2;
    // Hammam seat edge and shower drain already exist; refine their material maps.
    contacts.push([1.45,d-.65,1.2,.42],[center,.77,cw/2,.55],[w-1.25,d-1.05,1,.9]);
    g.traverse(o=>{
      if(!o.isMesh||!o.material.map?.image?.getContext||o.material.map.image.width!==256)return;
      const image=o.material.map.image;if(image.dataset.finished)return;image.dataset.finished='true';
      const c=image.getContext('2d');
      // Preserve the existing atlas and dimensions; add inset grout and mineral pores.
      for(let y=0;y<256;y+=16)for(let x=0;x<256;x+=16){
        c.fillStyle=`rgba(255,255,240,${.025+((x*7+y*13)%17)/170})`;c.fillRect(x+2,y+2,12,12);
        c.fillStyle='rgba(27,47,43,.12)';c.fillRect(x,y,1,16);c.fillRect(x,y,16,1);
      }
      o.material.map.needsUpdate=true;
    });
  }
  if(type==='garage'){
    // Reuse workshop metals/rubber; no transparent clearcoat rendering pass.
    for(const car of g.children.filter(o=>/sports coupe|grand tourer/.test(o.name))){
      contacts.push([car.position.x,car.position.z,1.02,2.08]);
      const paint=car.children.find(o=>o.isMesh)?.material;
      if(paint){paint.roughness=.19;paint.metalness=.62;}
      const cx=car.position.x,cz=car.position.z;
      // Hood shut-lines, wiper and rear ventilation visibly break up the body shell.
      for(const side of [-1,1]){
        tube(M.alu,[[cx+side*.49,.76,cz+.9],[cx+side*.53,.7,cz+1.35],[cx+side*.49,.59,cz+1.78]],.007);
        box(M.alu,cx+side*.71,.29,cz, .055,.035,1.5);
      }
      for(let i=0;i<5;i++)box(M.alu,cx,.88,cz-1.02-i*.07,.64,.012,.022);
    }
    for(let i=0;i<8;i++){
      const x=.5+i*(w-1)/8;
      for(const y of [.22,.4,.58])box(M.alu,x,y,.718,(w-.9)/8-.045,.012,.015);
    }
    // Floor is the existing tile mesh, shaded below cars instead of floating cars.
  }
  if(type==='golf'){
    const turf=[];g.traverse(o=>{if(o.isMesh&&o.material===M.gazon)turf.push(o);});
    for(const o of turf){
      const p=o.geometry.parameters,geo=new T.BoxGeometry(p.width,p.height,p.depth,32,1,24);
      o.geometry.dispose();o.geometry=geo;const pos=geo.attributes.position,col=new Float32Array(pos.count*3);
      for(let i=0;i<pos.count;i++){
        const x=pos.getX(i),grain=.94+.035*Math.sin(i*63.4);
        const stripe=(Math.floor((x+p.width/2)/.7)%2)?.9:1;
        col.set([grain*stripe*.78,grain*stripe,grain*stripe*.84],i*3);
      }
      o.material=o.material.clone();o.material.vertexColors=true;o.material.roughness=1;geo.setAttribute('color',new T.BufferAttribute(col,3));
    }
    // Real stance mat, rubber perimeter and tee; remain below the projection sightline.
    box(M.noir,w/2,.095,d*.65,1.65,.04,1.22);
    box(M.gazon,w/2,.12,d*.65,1.55,.025,1.12);
    box(M.blanc,w/2,.145,d*.65,.035,.05,.035);
    for(const side of [-1,1]){
      const x=w/2+side*(w/2-.45);
      for(let i=0;i<7;i++)box(M.tissuFonce,x,1.42,.48+i*.13,.16,2.66,.06);
    }
    // Clubs gain grips and heads; existing shafts and projector stay in place.
    for(let i=0;i<3;i++){
      box(M.noir,.65+i*.12-.075,1.22,d-.65,.04,.2,.04);
      box(M.metal,.65+i*.12+.075,.12,d-.65,.12,.07,.055);
    }
  }
  if(type==='technique'){
    // Technical spaces use a mineral floor, rather than residential parquet.
    for(const o of g.children){
      const p=o.geometry?.parameters;
      if(o.isMesh&&p?.height<.03&&p.width>w-.3&&o.position.y>0){o.material=A.stone;}
    }
    for(const x of [.65,1.45]){
      contacts.push([x,.55,.37,.43]);
      // Patch leads and rack uprights, inset to leave ports readable.
      for(const dx of [-.3,.3])box(M.metal,x+dx,1.12,.94,.018,2.13,.022);
      for(let u=0;u<5;u++){
        const y=.35+u*.35;
        tube(u%2?M.plante:M.metal,[[x-.18,y,.95],[x-.18,y-.08,1.02],[x+.08,y-.1,1.02],[x+.08,y,.95]],.009);
        for(let vent=0;vent<4;vent++)box(M.noir,x-.16+vent*.08,y+.12,.942,.045,.008,.01);
      }
    }
    // Ladder cable tray with separated bundles and cabinet hinges.
    for(let i=0;i<9;i++)box(M.metal,.3+i*(w-.6)/8,2.85,.55,.018,.035,.3);
    for(const x of [.65,1.45])tube(M.plante,[[x,2.1,.57],[x,2.64,.57],[x+.14,2.87,.57],[w-.4,2.87,.57]],.014);
    for(const y of [.94,1.78])box(M.metal,w-.91,y,.48,.04,.08,.025);
  }
  // Bake contact occlusion into the existing floor only, no shadow pass or texture.
  if(contacts.length){
    const floors=g.children.filter(o=>o.isMesh&&o.geometry.parameters?.height<.05&&o.geometry.parameters?.width>w-.3&&o.position.y<.07);
    const floor=floors.sort((a,b)=>b.position.y-a.position.y)[0];
    if(floor){
      const p=floor.geometry.parameters,geo=new T.BoxGeometry(p.width,p.height,p.depth,type==='sauna'?16:32,1,type==='sauna'?12:24),pos=geo.attributes.position,c=new Float32Array(pos.count*3);
      for(let i=0;i<pos.count;i++){
        const x=pos.getX(i)+floor.position.x,z=pos.getZ(i)+floor.position.z;let shade=1;
        for(const [cx,cz,rx,rz] of contacts){const dx=Math.max(0,Math.abs(x-cx)-rx),dz=Math.max(0,Math.abs(z-cz)-rz);shade=Math.min(shade,1-.4*Math.exp(-(dx*dx+dz*dz)/.045));}
        c.set([shade,shade,shade],i*3);
      }
      geo.setAttribute('color',new T.BufferAttribute(c,3));floor.geometry=geo;floor.material=floor.material.clone();floor.material.vertexColors=true;
    }
  }
  if(polish)polishSpecialRoom(R,M,A);
  R.decor={...R.decor,specialFinish:true};
}


// Static second pass: scoped material clones keep other rooms and lighting intact.
function polishSpecialRoom(R,M,A){
  const clones=new Map(),g=R.group;
  const tones=new Map([[M.blanc,0xb2b6b7],[M.mur,0xb3b6b0],[A.white,0xc8c4b9],
    [A.cream,0xd1c6b5],[A.stone,0xb8b7b1],[A.ceramic,0xb6afa0]]);
  if(R.cfg.type==='golf'){
    const lamp=R.lamps.find(l=>l.mesh?.geometry?.parameters?.radius===.14);
    if(lamp){lamp.mesh.position.x=.30;lamp.pos.x=.30;}
    for(const o of g.children)if(o.geometry?.parameters?.radiusTop===.05&&o.geometry.parameters.height===.2&&o.position.y>2.8)o.position.x=.30;
  }
  g.traverse(o=>{
    if(!o.isMesh)return;
    const original=o.material;
    if(original.map===A.stone.map&&!tones.has(original))tones.set(original,0xb8b7b1);
    if(tones.has(original)){
      if(!clones.has(original)){const m=original.clone();m.color.setHex(tones.get(original));m.roughness=Math.max(.68,m.roughness);clones.set(original,m);}
      o.material=clones.get(original);
    }
    const p=o.geometry.parameters;
    if(R.cfg.type==='golf'&&original===M.noir&&p?.width===.42&&p.height===.19){
      // Short-throw installation above the 2.85 m screen, not in its sightline.
      o.position.set(R.cfg.w/2,3.18,.30);o.name='Short-throw projector above screen';
    }
    if(original===M.plante&&o.geometry.type==='SphereGeometry'){
      // Replace the solid spherical crown with folded leaves. 128 triangles,
      // plus 32 stem triangles, below the sphere budget; no alpha texture or wind update.
      const r=p.radius,positions=[],colors=[];
      for(let k=0;k<16;k++){
        const a=k*2.399,y=-.45+(k%4)*.23,l=r*(.8+(k%3)*.16),wide=l*.20;
        const base=new T.Vector3(0,r*y,0),dir=new T.Vector3(Math.cos(a),.65+(k%3)*.25,Math.sin(a)).normalize();
        const side=new T.Vector3(-Math.sin(a),0,Math.cos(a));
        const mid=base.clone().addScaledVector(dir,l*.52),tip=base.clone().addScaledVector(dir,l);
        tip.y-=l*.22;
        const stem=new T.Vector3(0,-r*.75,0),edge=base.clone().addScaledVector(side,r*.018);
        for(const tri of [[stem,base,edge],[edge,base,stem]])for(const v of tri){positions.push(v.x,v.y,v.z);colors.push(.5,.39,.22);}
        const left=mid.clone().addScaledVector(side,wide),right=mid.clone().addScaledVector(side,-wide),ridge=mid.clone();ridge.y+=l*.10;
        for(const triangle of [[base,left,ridge],[left,tip,ridge],[tip,right,ridge],[right,base,ridge]]){
          for(const face of [triangle,[...triangle].reverse()])for(const v of face){positions.push(v.x,v.y,v.z);const shade=.65+(k%4)*.09+(v===ridge?.12:0);colors.push(shade*.84,shade,shade*.72);}
        }
      }
      const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setAttribute('color',new T.Float32BufferAttribute(colors,3));geo.computeVertexNormals();
      o.geometry=geo;
      if(!clones.has(original)){const m=original.clone();m.vertexColors=true;m.color.setHex(0x587c43);clones.set(original,m);}
      o.material=clones.get(original);
    }
  });
}
