/* Plan-derived presentation geometry. Elevations and materials are interpretive.
 * Source mapping and coordinate convention: docs/hotel-brassus.md. */
(() => {
  const T=window.THREE, canvas=document.getElementById('scene');
  let renderer;
  try {renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:false});} catch {
    document.body.insertAdjacentHTML('beforeend','<p class="error">La 3D nécessite WebGL sur ce navigateur.</p>');return;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.outputColorSpace=T.SRGBColorSpace;
  renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
  const scene=new T.Scene();scene.background=new T.Color('#263f46');scene.fog=new T.Fog('#263f46',105,260);
  const camera=new T.PerspectiveCamera(38,1,.1,350),target=new T.Vector3(0,-1,0);
  const hemi=new T.HemisphereLight(0xdceaff,0x647356,2.5);scene.add(hemi);
  const sun=new T.DirectionalLight(0xffe2b9,3.3);sun.position.set(-30,60,35);scene.add(sun);
  const mats={};
  for(const [key,color,roughness] of [['wood',0x97724b,.7],['oak',0xd1b08a,.75],['stone',0xbbb9a9,.9],['dark',0x233832,.75],['metal',0x27332f,.35],['green',0x527057,.95],['linen',0xe6ddcb,.95],['gold',0xc0a466,.35],['floor',0xab9271,.9],['water',0x568d90,.3]])mats[key]=new T.MeshStandardMaterial({color,roughness});
  mats.glass=new T.MeshStandardMaterial({color:0x8bbfc4,transparent:true,opacity:.25,roughness:.1,depthWrite:false});
  mats.glow=new T.MeshStandardMaterial({color:0xffdaa0,emissive:0xffbc66,emissiveIntensity:1.2});
  const geo=new T.BoxGeometry(1,1,1),cyl=new T.CylinderGeometry(1,1,1,16),levels={},roofs=[],lights=[];
  function box(parent,x,y,z,w,h,d,mat='wood'){const m=new T.Mesh(geo,mats[mat]);m.position.set(x,y,z);m.scale.set(w,h,d);parent.add(m);return m;}
  function round(parent,x,y,z,r,h,mat='oak'){const m=new T.Mesh(cyl,mats[mat]);m.position.set(x,y,z);m.scale.set(r,h,r);parent.add(m);return m;}
  function label(parent,text,x,y,z){const c=document.createElement('canvas');c.width=768;c.height=100;const ctx=c.getContext('2d');ctx.fillStyle='#152d28e8';ctx.fillRect(0,0,768,100);ctx.fillStyle='#eee6d4';ctx.font='500 36px system-ui';ctx.textAlign='center';ctx.fillText(text,384,64);const tx=new T.CanvasTexture(c);tx.colorSpace=T.SRGBColorSpace;const s=new T.Sprite(new T.SpriteMaterial({map:tx,depthTest:true,transparent:true}));s.position.set(x,y,z);s.scale.set(11,1.43,1);parent.add(s);return s;}
  function chair(g,x,z,angle=0){const c=new T.Group();c.position.set(x,0,z);c.rotation.y=angle;g.add(c);box(c,0,.55,0,.62,.17,.62,'linen');box(c,0,.95,-.26,.65,.7,.13,'wood');for(const dx of [-.23,.23])for(const dz of [-.23,.23])box(c,dx,.25,dz,.065,.5,.065,'metal');}
  function table(g,x,z,r=.9){round(g,x,.8,z,r,.13);round(g,x,.4,z,.12,.8,'metal');for(let a=0;a<4;a++){const q=a*Math.PI/2;chair(g,x+Math.sin(q)*(r+.45),z+Math.cos(q)*(r+.45),q);}}
  function sofa(g,x,z,w=2.6){box(g,x,.3,z,w,.45,1,'dark');box(g,x,.62,z,w-.15,.25,.82,'linen');box(g,x,.98,z-.43,w,.65,.18,'oak');box(g,x-w/2,.7,z,.17,.7,1,'oak');box(g,x+w/2,.7,z,.17,.7,1,'oak');}
  function plant(g,x,z){round(g,x,.38,z,.4,.75,'stone');const m=new T.Mesh(new T.SphereGeometry(.75,8,6),mats.green);m.position.set(x,1.35,z);m.scale.y=1.25;g.add(m);}
  function room(g,x,z,w,d,name,kind){box(g,x,.03,z,w,.08,d,'floor');box(g,x,1.3,z-d/2,w,2.6,.15,'stone');box(g,x-w/2,1.3,z,.15,2.6,d,'stone');
    // Glazed valley facade with timber mullions; low sill keeps cutaway readable.
    box(g,x,.22,z+d/2,w,.4,.18,'wood');box(g,x,1.45,z+d/2,w,2.4,.05,'glass');
    for(let t=-w/2;t<=w/2;t+=2.4)box(g,x+t,1.55,z+d/2,.08,2.8,.12,'wood');
    label(g,name,x,3.25,z-d/2+.3);lights.push(box(g,x,2.55,z+d/2-.12,w-.3,.045,.055,'glow'));
    for(let a=-w/2+1.4;a<w/2;a+=3){const l=box(g,x+a,2.7,z,.16,.08,.16,'glow');lights.push(l);box(g,x+a,2.77,z,.32,.05,.32,'metal');}
    if(kind==='restaurant'){for(let xx=x-w/2+2;xx<x+w/2-1;xx+=3.5)for(let zz=z-d/2+2;zz<z+d/2-1;zz+=3.4)table(g,xx,zz,.8);}
    if(kind==='lounge'){sofa(g,x-1,z,3);sofa(g,x+2,z-2,2);round(g,x,.45,z+1,.8,.12);plant(g,x+w/2-1,z-d/2+1);}
    if(kind==='private'){box(g,x,.83,z,Math.min(w-3,7),.16,1.4,'oak');for(let q=-2.4;q<=2.4;q+=1.2){chair(g,x+q,z-1.15);chair(g,x+q,z+1.15,Math.PI);}}
    if(kind==='bar'){box(g,x+2,.6,z,1.4,1.2,d-2,'wood');box(g,x+2,1.25,z,1.6,.13,d-1.8,'stone');for(let zz=z-d/2+1.5;zz<z+d/2-1;zz+=1.3){round(g,x+.6,.75,zz,.3,.12,'dark');round(g,x+.6,.4,zz,.06,.8,'metal');}sofa(g,x-3,z-1);table(g,x-2,z+2,.7);}
    if(kind==='seminar'){for(let xx=x-w/2+1.5;xx<x+w/2-1;xx+=2.5)for(let zz=z-d/2+2;zz<z+d/2-1;zz+=1.8){box(g,xx,.8,zz,1.6,.08,.65,'oak');chair(g,xx,zz+.7,Math.PI);}box(g,x,1.65,z-d/2+.14,Math.min(w-2,5),2,.08,'metal');box(g,x,1.65,z-d/2+.2,Math.min(w-2.2,4.8),1.8,.025,'linen');}
    if(kind==='sauna'){for(let q=0;q<3;q++)box(g,x,.35+q*.25,z-d/2+.6+q*.6,w-1,.17,.6,'oak');for(let q=0;q<20;q++)box(g,x-w/2+.3+q*(w-.6)/20,1.4,z-d/2+.12,.1,2.5,.06,'wood');}
    if(kind==='relax'){for(let xx=x-w/2+1;xx<x+w/2-.5;xx+=1.6){const bed=box(g,xx,.5,z,.85,.2,2,'linen');bed.rotation.x=.08;box(g,xx,.6,z-.6,.8,.2,.6,'linen');}}
    if(kind==='fitness'){for(let xx=x-w/2+1.5;xx<x+w/2-.5;xx+=2){box(g,xx,.28,z,.8,.2,1.8,'metal');box(g,xx,1,z-.6,.06,1.5,.08,'metal');box(g,xx,1.65,z-.55,.65,.08,.3,'metal');}}
    if(kind==='suite'){box(g,x+1,.4,z,2,.6,2.4,'oak');box(g,x+1,.75,z,1.9,.25,2.3,'linen');box(g,x+1,1.1,z-1.15,2.1,1.2,.15,'wood');for(let dx of [.5,1.5])box(g,x+dx,.95,z-.75,.75,.12,.5,'linen');table(g,x-w/2+2,z+1,.65);box(g,x+w/2-1,.5,z+1,1.2,.6,2,'stone');plant(g,x-w/2+.7,z-d/2+.7);}
    const roof=box(g,x,2.95,z,w+.3,.22,d+.3,'green');roofs.push(roof);
  }
  function level(id,y,z,rooms){const g=new T.Group();g.position.set(0,y,z);scene.add(g);levels[id]=g;box(g,0,-.22,0,46,.4,11,'stone');box(g,0,-.15,6.4,46,.25,2,'wood');for(const r of rooms)room(g,...r);return g;}
  level('250',-7.8,18,[[-18,0,8,8,'VESTIAIRES',''],[-9,0,9,8,'ACCUEIL · HAMMAM','lounge'],[0,0,8,8,'SAUNA','sauna'],[8,0,7,8,'RELAX','relax'],[17,0,10,8,'FITNESS / YOGA','fitness']]);
  level('350',-3.92,6,[[-9,0,26,8,'303 · RESTAURANT','restaurant'],[8,0,8,8,'PETIT SALON','lounge'],[17,0,10,8,'SALLE PRIVÉE','private']]);
  level('450',-1.8,-6,[[-15,0,14,8,'410 · FOYER','lounge'],[-4,0,8,8,'OFFICE / ESCALIER',''],[5,0,10,8,'408 · SÉMINAIRE 1','seminar'],[16,0,12,8,'408 · SÉMINAIRE 2','seminar']]);
  level('550',0,-18,[[-16,0,12,8,'BAR · DOUBLE HAUTEUR','bar'],[-3,0,14,8,'BUREAUX / ESCALIER',''],[13,0,18,8,'LOBBY · DOUBLE HAUTEUR','lounge']]);
  // Suite samples are separate documented excerpts; their global placement is interpretive.
  level('300B',-4.1,32,[[-17,0,10,8,'333 · DOUBLE','suite'],[-3,0,18,8,'334 · OBLIQUE SUITE','suite'],[12,0,10,8,'335 · DOUBLE','suite']]);
  level('400',-.84,-32,[[-12,0,18,8,'431 · PERPENDICULAIRE','suite'],[8,0,18,8,'CHAMBRES · EXTRAIT','suite']]);
  const ground=new T.Mesh(new T.PlaneGeometry(250,250),new T.MeshStandardMaterial({color:0x526854,roughness:1}));ground.rotation.x=-Math.PI/2;ground.position.y=-9;scene.add(ground);
  // A single triangulated terrain avoids coplanar flicker.
  const terrainGeo=new T.PlaneGeometry(230,120,36,20);terrainGeo.rotateX(-Math.PI/2);const positions=terrainGeo.attributes.position;
  for(let i=0;i<positions.count;i++){const x=positions.getX(i),z=positions.getZ(i);positions.setY(i,Math.max(0,(Math.abs(x)-45)*.16)+Math.sin(x*.08)*Math.sin(z*.07)*2-9.2);}terrainGeo.computeVertexNormals();const terrain=new T.Mesh(terrainGeo,mats.green);terrain.position.z=-10;scene.add(terrain);
  const pineGeo=new T.ConeGeometry(1.3,6,7);
  for(let i=0;i<100;i++){const side=i%2?-1:1,x=side*(35+(i*13%57)),z=(i*17%130)-65;const tree=new T.Mesh(pineGeo,mats.dark);tree.position.set(x,-5+(Math.abs(x)-45)*.1,z);scene.add(tree);}
  // Batch furniture independently for each level; keep roofs and lighting controllable.
  function batch(group,deep=true){
    group.updateMatrixWorld(true);const groups=new Map(),inverse=group.matrixWorld.clone().invert();
    const collect=o=>{if(!o.isMesh||o.isInstancedMesh||roofs.includes(o)||lights.includes(o))return;const key=o.geometry.uuid+o.material.uuid;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(o);};
    if(deep)group.traverse(collect);else group.children.forEach(collect);
    for(const list of groups.values()){if(list.length<2)continue;const inst=new T.InstancedMesh(list[0].geometry,list[0].material,list.length);list.forEach((m,i)=>{inst.setMatrixAt(i,new T.Matrix4().multiplyMatrices(inverse,m.matrixWorld));m.removeFromParent();});inst.instanceMatrix.needsUpdate=true;group.add(inst);}
  }
  Object.values(levels).forEach(g=>batch(g));batch(scene,false);
  let radius=120,theta=.64,phi=.85,auto=false,night=false,cut=true,drag=null,visible=true;
  function select(id){for(const [key,g]of Object.entries(levels))g.visible=id==='all'||key===id;target.set(0,id==='all'?-1:levels[id].position.y+1,id==='all'?0:levels[id].position.z);radius=id==='all'?120:64;document.getElementById('status').textContent=id==='all'?'Vue éclatée des niveaux · implantation interprétée':'Niveau '+id+' · aménagement d’après le plan';}
  const floor=document.getElementById('floor');floor.onchange=()=>select(floor.value);
  document.getElementById('cut').onclick=e=>{cut=!cut;roofs.forEach(r=>r.visible=!cut);e.currentTarget.setAttribute('aria-pressed',cut)};roofs.forEach(r=>r.visible=false);
  document.getElementById('night').onclick=e=>{night=!night;hemi.intensity=night?1.05:2.5;sun.intensity=night?.2:3.3;scene.background.set(night?'#0e1a24':'#263f46');scene.fog.color.copy(scene.background);mats.glow.emissiveIntensity=night?3:1.2;e.currentTarget.setAttribute('aria-pressed',night)};
  document.getElementById('rotate').onclick=e=>{auto=!auto;e.currentTarget.setAttribute('aria-pressed',auto)};
  document.getElementById('reset').onclick=()=>{theta=.64;phi=.85;select(floor.value)};
  canvas.onpointerdown=e=>{drag={x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId)};
  canvas.onpointermove=e=>{if(!drag)return;theta-=(e.clientX-drag.x)*.006;phi=Math.max(.22,Math.min(1.4,phi+(e.clientY-drag.y)*.004));drag={x:e.clientX,y:e.clientY};};canvas.onpointerup=canvas.onpointercancel=()=>{drag=null};
  canvas.addEventListener('wheel',e=>{e.preventDefault();radius=Math.max(24,Math.min(160,radius*Math.exp(e.deltaY*.001)));},{passive:false});
  window.addEventListener('message',e=>{if(e.origin!==location.origin||e.source!==parent)return;const m=e.data;if(m?.channel==='hdh-view'&&typeof m.visible==='boolean')visible=m.visible;if(m?.channel==='hdh-demo'){const id={bar:'550',entrance:'450',restaurant:'350',salon:'350',pdr:'350',wellness:'250',seminar:'450'}[m.zone];if(id)levels[id].traverse(o=>{if(o.isMesh&&o.material===mats.glow){o.visible=m.level>0;}});}});
  let last=0;
  function frame(now){requestAnimationFrame(frame);if(document.hidden||!visible)return;const w=canvas.clientWidth,h=canvas.clientHeight;if(!w||!h)return;if(canvas.width!==Math.round(w*renderer.getPixelRatio())||canvas.height!==Math.round(h*renderer.getPixelRatio())){renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}if(auto&&!matchMedia('(prefers-reduced-motion: reduce)').matches)theta+=Math.min((now-last)/1000,.05)*.1;last=now;camera.position.set(target.x+radius*Math.sin(phi)*Math.sin(theta),target.y+radius*Math.cos(phi),target.z+radius*Math.sin(phi)*Math.cos(theta));camera.lookAt(target);renderer.render(scene,camera);}
  requestAnimationFrame(frame);window.HDH_MODEL={levels,roofs,select,renderer,scene,camera};
})();
