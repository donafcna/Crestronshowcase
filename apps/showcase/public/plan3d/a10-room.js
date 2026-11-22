import * as T from './vendor/three.module.min.js';
export function configureA10Room(R) {
 const {w,d,circuits,a10Shades=[]}=R.cfg,old=new Set(R.lamps.map(l=>l.mat)),remove=[];
 R.group.traverse(o=>{if(o.isMesh&&old.has(o.material))remove.push(o);});remove.forEach(o=>o.removeFromParent());
 R.lamps=[];R.levels=circuits.map(()=>0);R.renderLevels=R.levels.slice();R.fadeTargets=R.levels.slice();
 function box(parent,mat,x,y,z,a,b,c){const o=new T.Mesh(new T.BoxGeometry(a,b,c),mat);o.position.set(x,y,z);parent.add(o);return o;}
 circuits.forEach((c,i)=>{
  const mat=new T.MeshStandardMaterial({color:0xddd4c2,emissive:0xffdfac,emissiveIntensity:0,roughness:.6}),g=new T.Group();
  g.name=c.name;g.userData={circuitIndex:c.index};R.group.add(g);
  const n=c.name.toLowerCase(),lane=(i+.5)/circuits.length;let mesh;
  if(/cove/.test(n)){mesh=box(g,mat,w/2,2.72,.3,w-.8,.035,.045);box(g,mat,.3,2.72,d/2,.045,.035,d-.8);}
  else if(/led|strip|headboard|niche|worktop|night/.test(n)){mesh=box(g,mat,.5+lane*(w-1),/night/.test(n)?.15:/headboard/.test(n)?1.05:1.5,/headboard/.test(n)?d*.64:d-.27,Math.min(1.15,w/circuits.length),.035,.04);}
  else if(/bedside|floor lamp|socket lamp/.test(n)){const x=/right/.test(n)?w*.77:/left/.test(n)?w*.28:w-.55,z=/bedside/.test(n)?d*.65:d-.6;mesh=box(g,mat,x,.95,z,.22,.2,.22);box(g,new T.MeshStandardMaterial({color:0x4c4944}),x,.48,z,.035,.85,.035);}
  else if(/wall|artwork|cupboard/.test(n)){mesh=box(g,mat,.22,1.8,.55+lane*(d-1.1),.06,.25,.18);}
  else{const count=/spot/.test(n)?3:1;for(let j=0;j<count;j++){mesh=new T.Mesh(new T.CylinderGeometry(.085,.085,.045,12),mat);mesh.position.set(.6+(j+.5)*(w-1.2)/count,2.68,.6+lane*(d-1.2));g.add(mesh);}}
  R.lamps.push({mesh,mat,circuit:i,pos:mesh.position.clone(),index:c.index,name:c.name});
 });
 Object.values(R.shades||{}).forEach(s=>(s.meshes||[s.mesh]).forEach(m=>m.removeFromParent()));R.shades={};R.a10Motors=[];
 if(!R.win)return;
 const win=R.win,orientation=s=>s.name.match(/east|south 1|south 2|north|south/)?.[0]||'main',directions=[...new Set(a10Shades.map(orientation))];
 a10Shades.forEach(s=>{
  const sheer=/sheer/i.test(s.name),blackout=/blackout/i.test(s.name),curtain=sheer||blackout,width=win.w/directions.length,x=win.x-win.w/2+width*(directions.indexOf(orientation(s))+.5);
  const mat=new T.MeshStandardMaterial({color:sheer?0xf3f1e9:blackout?0x716359:0x969fa6,roughness:.95,side:T.DoubleSide,transparent:sheer,opacity:sheer?.48:1}),g=new T.Group();g.name=s.name;g.userData.motorIndex=s.index;win.group.add(g);
  const z=sheer?.40:blackout?.30:.02,meshes=[];
  if(curtain)for(const side of [-1,1]){const m=box(g,mat,x+side*width/2,win.y,z,width/2,1.4,.035);m.geometry.translate(-side*width/4,0,0);meshes.push(m);}
  else{const m=box(g,mat,x,win.y+.7,z,width,1.4,.025);m.geometry.translate(0,-.7,0);meshes.push(m);}
  R.a10Motors.push({index:s.index,name:s.name,orientation:orientation(s),sheer,meshes,pos:0,apply(closed){this.pos=closed;meshes.forEach(m=>{if(curtain)m.scale.x=.06+.94*closed;else m.scale.y=.02+.98*closed;});}});
 });
}
export function syncA10Room(R,state){
 R.sceneOff=false;R.cfg.circuits.forEach((c,i)=>{R.levels[i]=T.MathUtils.clamp((state.lights[c.index-1]||0)/100,0,1);});
 R.a10Motors?.forEach(m=>{m.reference=1-T.MathUtils.clamp((state.shades[m.index-1]??100)/100,0,1);m.direction=state.shadeMotion?.[m.index-1]||0;m.referenceAt=state.shadeAt||Date.now();});
 animateA10Motors(R);
}

export function animateA10Motors(R,now=Date.now()){
 R.a10Motors?.forEach(m=>{if(m.reference===undefined)return;const elapsed=Math.max(0,now-m.referenceAt);m.apply(T.MathUtils.clamp(m.reference-m.direction*elapsed/20000,0,1));});
}
