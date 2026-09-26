/* Plan-derived presentation geometry. Elevations and materials are interpretive.
 * Source mapping and coordinate convention: docs/hotel-brassus.md. */
(() => {
  const background=new URLSearchParams(location.search).has('background');let viewport=null;
  if(background)document.body.classList.add('background');
  const T=window.THREE, canvas=document.getElementById('scene');
  let renderer;
  try {renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:false});} catch {
    document.body.insertAdjacentHTML('beforeend','<p class="error">La 3D nécessite WebGL sur ce navigateur.</p>');return;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.outputColorSpace=T.SRGBColorSpace;
  renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
  const scene=new T.Scene();scene.background=new T.Color('#263f46');scene.fog=new T.Fog('#263f46',105,260);
  if(background){scene.fog.near=300;scene.fog.far=700;}
  const camera=new T.PerspectiveCamera(38,1,.1,800),target=new T.Vector3(0,-1,0);
  const hemi=new T.HemisphereLight(0xdceaff,0x647356,2.5);scene.add(hemi);
  const sun=new T.DirectionalLight(0xffe2b9,3.3);sun.position.set(-30,60,35);scene.add(sun);
  const mats={};
  for(const [key,color,roughness] of [['wood',0x97724b,.7],['oak',0xd1b08a,.75],['stone',0xbbb9a9,.9],['concrete',0xc9c5b9,.92],['dark',0x233832,.75],['metal',0x27332f,.35],['green',0x527057,.95],['roofgreen',0x68846a,.98],['linen',0xe6ddcb,.95],['gold',0xc0a466,.35],['floor',0xab9271,.9],['water',0x568d90,.3],['pv',0x16272d,.28]])mats[key]=new T.MeshStandardMaterial({color,roughness});
  mats.glass=new T.MeshStandardMaterial({color:0x8bbfc4,transparent:true,opacity:.25,roughness:.1,depthWrite:false});
  mats.glow=new T.MeshStandardMaterial({color:0xffdaa0,emissive:0xffbc66,emissiveIntensity:1.2});
  mats.curtain=new T.MeshStandardMaterial({color:0x7c3934,roughness:.88,emissive:0x160706,emissiveIntensity:.28,side:T.DoubleSide});
  mats.curtainFold=new T.MeshStandardMaterial({color:0xa75a4e,roughness:.82,side:T.DoubleSide});
  const geo=new T.BoxGeometry(1,1,1),cyl=new T.CylinderGeometry(1,1,1,16),levels={},roofs=[],lights=[],roomLighting=new Map(),curtains=new Map();
  const shell=new T.Group();shell.name='hotel-envelope';scene.add(shell);
  function box(parent,x,y,z,w,h,d,mat='wood'){const m=new T.Mesh(geo,typeof mat==='string'?mats[mat]:mat);m.position.set(x,y,z);m.scale.set(w,h,d);parent.add(m);return m;}
  function round(parent,x,y,z,r,h,mat='oak'){const m=new T.Mesh(cyl,typeof mat==='string'?mats[mat]:mat);m.position.set(x,y,z);m.scale.set(r,h,r);parent.add(m);return m;}
  function label(parent,text,x,y,z){const c=document.createElement('canvas');c.width=768;c.height=100;const ctx=c.getContext('2d');ctx.fillStyle='#152d28e8';ctx.fillRect(0,0,768,100);ctx.fillStyle='#eee6d4';ctx.font='500 36px system-ui';ctx.textAlign='center';ctx.fillText(text,384,64);const tx=new T.CanvasTexture(c);tx.colorSpace=T.SRGBColorSpace;const s=new T.Sprite(new T.SpriteMaterial({map:tx,depthTest:true,transparent:true}));s.userData.roomLabel=true;s.position.set(x,y,z);s.scale.set(11,1.43,1);parent.add(s);return s;}
  function chair(g,x,z,angle=0){const c=new T.Group();c.position.set(x,0,z);c.rotation.y=angle;g.add(c);box(c,0,.55,0,.62,.17,.62,'linen');box(c,0,.95,-.26,.65,.7,.13,'wood');for(const dx of [-.23,.23])for(const dz of [-.23,.23])box(c,dx,.25,dz,.065,.5,.065,'metal');}
  function table(g,x,z,r=.9){round(g,x,.8,z,r,.13);round(g,x,.4,z,.12,.8,'metal');for(let a=0;a<4;a++){const q=a*Math.PI/2;chair(g,x+Math.sin(q)*(r+.45),z+Math.cos(q)*(r+.45),q);}}
  function sofa(g,x,z,w=2.6){box(g,x,.3,z,w,.45,1,'dark');box(g,x,.62,z,w-.15,.25,.82,'linen');box(g,x,.98,z-.43,w,.65,.18,'oak');box(g,x-w/2,.7,z,.17,.7,1,'oak');box(g,x+w/2,.7,z,.17,.7,1,'oak');}
  function plant(g,x,z){round(g,x,.38,z,.4,.75,'stone');const m=new T.Mesh(new T.SphereGeometry(.75,8,6),mats.green);m.position.set(x,1.35,z);m.scale.y=1.25;g.add(m);}
  function room(g,x,z,w,d,name,kind){box(g,x,.03,z,w,.08,d,'floor');box(g,x,1.3,z-d/2,w,2.6,.15,'stone');box(g,x-w/2,1.3,z,.15,2.6,d,'stone');
    // Glazed valley facade with timber mullions; low sill keeps cutaway readable.
    box(g,x,.22,z+d/2,w,.4,.18,'wood');box(g,x,1.45,z+d/2,w,2.4,.05,'glass');
    for(let t=-w/2;t<=w/2;t+=2.4)box(g,x+t,1.55,z+d/2,.08,2.8,.12,'wood');
    label(g,name,x,3.25,z-d/2+.3);
    const zone=/BAR/.test(name)?'bar':/LOBBY/.test(name)?'entrance':/RESTAURANT/.test(name)?'restaurant':/PETIT SALON/.test(name)?'salon':/PRIVÉE/.test(name)?'pdr':/SÉMINAIRE/.test(name)?'seminar':g.userData.id==='250'?'wellness':`${g.userData.id}-${name}`;
    const lighting=roomLighting.get(zone)||{materials:[],points:[],level:65,scene:null,fade:null};roomLighting.set(zone,lighting);
    const fixture=(type,color=0xffc477,factor=1)=>{let item=lighting.materials.find(v=>v.type===type);if(!item){item={type,factor,material:new T.MeshStandardMaterial({color,emissive:color,emissiveIntensity:factor,roughness:.28})};lighting.materials.push(item);}return item.material;};
    const cornice=fixture('cornice',0xffbd70,1.15),spot=fixture('spot',0xffe2b0,1.6),wall=fixture('wall',0xffb86b,1.3),nightlight=fixture('nightlight',0xffa85a,.85),pendant=fixture('pendant',0xffcf86,1.8);
    // Cornices, ceiling spots, wall sconces, foot-level nightlights and pendants.
    lights.push(box(g,x,2.56,z-d/2+.22,w-.35,.055,.08,cornice),box(g,x-w/2+.22,2.56,z,.08,.055,d-.35,cornice));
    for(let a=-w/2+1.15;a<w/2;a+=2.25){lights.push(box(g,x+a,2.72,z-.9,.16,.055,.16,spot),box(g,x+a,2.72,z+1.25,.16,.055,.16,spot));box(g,x+a,2.78,z-.9,.31,.045,.31,'metal');box(g,x+a,2.78,z+1.25,.31,.045,.31,'metal');}
    for(let a=-w/2+1.25;a<w/2;a+=3.2){lights.push(box(g,x+a,1.55,z-d/2+.18,.16,.42,.1,wall));box(g,x+a,1.55,z-d/2+.1,.34,.62,.08,'gold');}
    for(let a=-w/2+.8;a<w/2;a+=1.65)lights.push(box(g,x+a,.27,z-d/2+.2,.2,.12,.08,nightlight));
    const chandelierCount=w>13?3:w>8?2:1;for(let i=0;i<chandelierCount;i++){const px=x+(i-(chandelierCount-1)/2)*Math.min(5,w/3);round(g,px,2.25,z,.025,.92,'metal');for(let arm=0;arm<6;arm++){const angle=arm*Math.PI/3,bulb=round(g,px+Math.cos(angle)*.5,1.82,z+Math.sin(angle)*.5,.1,.16,pendant);lights.push(bulb);}lights.push(round(g,px,1.9,z,.14,.2,pendant));}
    const point=new T.PointLight(0xffc77e,1,Math.max(w,d)*1.2,2);point.position.set(x,2.3,z);g.add(point);lighting.points.push(point);
    if(['bar','entrance','restaurant','salon','pdr','wellness','seminar'].includes(zone)){const panels=[];for(const side of [-1,1]){const panel=box(g,x+side*(w/2-.22),1.42,z+d/2+.1,.38,2.38,.12,'curtain');panel.userData={curtain:true,side,center:x,width:w};for(let fold=-4;fold<=4;fold++){const stripe=box(panel,fold*.105,0,.58,.018,1.02,.05,'curtainFold');stripe.userData.curtainPart=true;}panels.push(panel);}curtains.set(zone,(curtains.get(zone)||[]).concat(panels));}
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
  function level(id,y,z,rooms){const g=new T.Group();g.position.set(0,y,z);g.userData.id=id;scene.add(g);levels[id]=g;box(g,0,-.22,0,46,.4,11,'stone');box(g,0,-.15,6.4,46,.25,2,'wood');for(const r of rooms)room(g,...r);return g;}
  level('250',-7.8,18,[[-18,0,8,8,'VESTIAIRES',''],[-9,0,9,8,'ACCUEIL · HAMMAM','lounge'],[0,0,8,8,'SAUNA','sauna'],[8,0,7,8,'RELAX','relax'],[17,0,10,8,'FITNESS / YOGA','fitness']]);
  level('350',-3.92,6,[[-9,0,26,8,'303 · RESTAURANT','restaurant'],[8,0,8,8,'PETIT SALON','lounge'],[17,0,10,8,'SALLE PRIVÉE','private']]);
  level('450',-1.8,-6,[[-15,0,14,8,'410 · FOYER','lounge'],[-4,0,8,8,'OFFICE / ESCALIER',''],[5,0,10,8,'408 · SÉMINAIRE 1','seminar'],[16,0,12,8,'408 · SÉMINAIRE 2','seminar']]);
  level('550',0,-18,[[-16,0,12,8,'BAR · DOUBLE HAUTEUR','bar'],[-3,0,14,8,'BUREAUX / ESCALIER',''],[13,0,18,8,'LOBBY · DOUBLE HAUTEUR','lounge']]);
  // Suite samples are separate documented excerpts; their global placement is interpretive.
  level('300B',-4.1,32,[[-17,0,10,8,'333 · DOUBLE','suite'],[-3,0,18,8,'334 · OBLIQUE SUITE','suite'],[12,0,10,8,'335 · DOUBLE','suite']]);
  level('400',-.84,-32,[[-12,0,18,8,'431 · PERPENDICULAIRE','suite'],[8,0,18,8,'CHAMBRES · EXTRAIT','suite']]);
  // Enveloppe de présentation inspirée du bâtiment construit : rubans vitrés,
  // dalles en béton, lames verticales en bois et promenade végétalisée en zigzag.
  // Les plans disponibles étant des extraits AV, cette enveloppe reste interprétée.
  const shellLevels=[['250',-7.8,18],['300B',-4.1,32],['350',-3.92,6],['450',-1.8,-6],['400',-.84,-32],['550',0,-18]];
  function exteriorBand(y,z,index){
    box(shell,0,y-.3,z,49,.48,12.6,'concrete');
    box(shell,0,y+1.35,z-5.45,48,2.8,.3,'concrete');
    box(shell,-24.15,y+1.35,z,0.3,2.8,11,'concrete');
    box(shell,24.15,y+1.35,z,0.3,2.8,11,'concrete');
    box(shell,0,y+.3,z+5.45,48,.55,.35,'wood');
    box(shell,0,y+1.65,z+5.58,47.5,2.25,.08,'glass');
    for(let x=-23;x<=23;x+=2.35){box(shell,x,y+1.65,z+5.7,.09,2.55,.14,'wood');if((Math.round((x+23)/2.35)+index)%3===0)box(shell,x+.38,y+1.66,z+5.78,.1,2.45,.2,'oak');}
    const roof=box(shell,0,y+3.02,z,50,.34,13.4,'roofgreen');roof.rotation.z=(index%2?-.012:.012);roofs.push(roof);
    // La rive de toiture forme le chemin continu visible sur les photographies.
    box(shell,0,y+3.24,z+5.2,49,.12,2.2,'green');
    box(shell,-23.5,y+3.58,z+5.2,1.2,.72,2.2,'green');
    box(shell,23.5,y+3.58,z+5.2,1.2,.72,2.2,'green');
  }
  shellLevels.forEach(([,y,z],i)=>exteriorBand(y,z,i));
  // Toiture haute et panneaux photovoltaïques — 126 panneaux existent sur le
  // bâtiment réel ; un échantillon lisible représente ici leur implantation.
  for(let x=-18;x<=18;x+=4.5)for(let z=-21;z<=-15;z+=3){const pv=box(shell,x,3.42,z,3.5,.1,1.8,'pv');pv.rotation.x=-.12;}
  // Escaliers/rampes végétalisés qui relient visuellement les terrasses.
  for(let i=0;i<shellLevels.length-1;i++){
    const [,y1,z1]=shellLevels[i],[,y2,z2]=shellLevels[i+1],r=new T.Group();shell.add(r);
    const length=Math.hypot(z2-z1,y2-y1),midY=(y1+y2)/2+3.18,midZ=(z1+z2)/2+5.15;
    const deck=box(r,0,midY,midZ,8,.22,length,'roofgreen');deck.rotation.x=Math.atan2(y2-y1,z2-z1);
    for(const side of [-1,1])box(r,side*4,midY+.35,midZ,.12,.7,length,'wood').rotation.x=deck.rotation.x;
  }
  const ground=new T.Mesh(new T.PlaneGeometry(250,250),new T.MeshStandardMaterial({color:0x526854,roughness:1}));ground.rotation.x=-Math.PI/2;ground.position.y=-9;scene.add(ground);
  // A single triangulated terrain avoids coplanar flicker.
  const terrainGeo=new T.PlaneGeometry(230,120,36,20);terrainGeo.rotateX(-Math.PI/2);const positions=terrainGeo.attributes.position;
  for(let i=0;i<positions.count;i++){const x=positions.getX(i),z=positions.getZ(i);positions.setY(i,Math.max(0,(Math.abs(x)-45)*.16)+Math.sin(x*.08)*Math.sin(z*.07)*2-9.2);}terrainGeo.computeVertexNormals();const terrain=new T.Mesh(terrainGeo,mats.green);terrain.position.z=-10;scene.add(terrain);
  const pineGeo=new T.ConeGeometry(1.3,6,7);
  for(let i=0;i<100;i++){const side=i%2?-1:1,x=side*(35+(i*13%57)),z=(i*17%130)-65;const tree=new T.Mesh(pineGeo,mats.dark);tree.position.set(x,-5+(Math.abs(x)-45)*.1,z);scene.add(tree);}
  // Batch furniture independently for each level; keep roofs and lighting controllable.
  function batch(group,deep=true){
    group.updateMatrixWorld(true);const groups=new Map(),inverse=group.matrixWorld.clone().invert();
    const collect=o=>{if(!o.isMesh||o.isInstancedMesh||o.userData.curtain||o.userData.curtainPart||roofs.includes(o)||lights.includes(o))return;const key=o.geometry.uuid+o.material.uuid;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(o);};
    if(deep)group.traverse(collect);else group.children.forEach(collect);
    for(const list of groups.values()){if(list.length<2)continue;const inst=new T.InstancedMesh(list[0].geometry,list[0].material,list.length);list.forEach((m,i)=>{inst.setMatrixAt(i,new T.Matrix4().multiplyMatrices(inverse,m.matrixWorld));m.removeFromParent();});inst.instanceMatrix.needsUpdate=true;group.add(inst);}
  }
  Object.values(levels).forEach(g=>batch(g));batch(scene,false);
  let radius=145,theta=.64,phi=.85,auto=false,night=false,dayNightCycle=true,cut=true,drag=null,visible=true;
  let selectedId='550',selectedZone='bar',view='overview',tween=null,lastPhase='';
  const zoneTargets={bar:{id:'550',x:-16,radius:30},entrance:{id:'550',x:13,radius:38},restaurant:{id:'350',x:-9,radius:43},salon:{id:'350',x:8,radius:27},pdr:{id:'350',x:17,radius:27},wellness:{id:'250',x:4,radius:45},seminar:{id:'450',x:10,radius:42}};
  const overviewPose=()=>({target:new T.Vector3(0,-1,0),radius:150,theta:.68,phi:1.04});
  const roomPose=(id,zone)=>{const z=zoneTargets[zone],x=z?.id===id?z.x:0;return{target:new T.Vector3(x,levels[id].position.y+1.15,levels[id].position.z),radius:z?.id===id?z.radius:55,theta:.66,phi:.84};};
  const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
  function showView(mode,id){
    view=mode;selectedId=id||selectedId;const all=mode==='overview';
    for(const [key,g]of Object.entries(levels)){g.visible=all||key===selectedId;g.traverse(o=>{if(o.userData.roomLabel)o.visible=!all&&key===selectedId;});}
    shell.visible=all;roofs.forEach(r=>r.visible=all||(!cut&&r.parent===levels[selectedId]));
    document.getElementById('status').textContent=all?'Vue complète de l’hôtel · enveloppe interprétée':'Niveau '+selectedId+' · aménagement d’après le plan';
  }
  function fly(pose,duration=.95,onDone){tween={from:{target:target.clone(),radius,theta,phi},to:pose,start:performance.now(),duration:duration*1000,onDone};}
  function overview(){showView('overview');fly(overviewPose(),1.25);}
  function focus(id=selectedId,zone=selectedZone,immediate=false){if(!levels[id])return;selectedId=id;selectedZone=zone||selectedZone;showView('room',id);const p=roomPose(id,selectedZone);if(immediate){target.copy(p.target);radius=p.radius;theta=p.theta;phi=p.phi;tween=null;}else fly(p,1.35);}
  function progressiveFocus(){focus(selectedId,selectedZone);}
  function select(id){if(id==='all'){overview();return;}focus(id,null);}
  const floor=document.getElementById('floor');floor.onchange=()=>select(floor.value);
  document.getElementById('cut').onclick=e=>{cut=!cut;roofs.forEach(r=>r.visible=view==='overview'||!cut);e.currentTarget.setAttribute('aria-pressed',cut)};
  document.getElementById('night').onclick=e=>{dayNightCycle=!dayNightCycle;e.currentTarget.setAttribute('aria-pressed',dayNightCycle);e.currentTarget.textContent=dayNightCycle?'Cycle jour/nuit':'Cycle en pause'};
  document.getElementById('rotate').onclick=e=>{auto=!auto;e.currentTarget.setAttribute('aria-pressed',auto)};
  document.getElementById('reset').onclick=()=>{theta=.64;phi=.85;select(floor.value)};
  canvas.onpointerdown=e=>{drag={x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId)};
  canvas.onpointermove=e=>{if(!drag)return;theta-=(e.clientX-drag.x)*.006;phi=Math.max(.22,Math.min(1.4,phi+(e.clientY-drag.y)*.004));drag={x:e.clientX,y:e.clientY};};canvas.onpointerup=canvas.onpointercancel=()=>{drag=null};
  canvas.addEventListener('wheel',e=>{e.preventDefault();if(background)return;if(e.deltaY>0)overview();else focus(selectedId,selectedZone);},{passive:false});
  function paintRoomLighting(group,level){group.level=level;group.materials.forEach(item=>{item.material.emissiveIntensity=item.factor*(.05+level/42);item.material.color.setHex(level?item.material.emissive.getHex():0x302b27)});group.points.forEach(light=>{light.intensity=level*.075});}
  function setRoomLighting(zone,level,sceneId=null){const group=roomLighting.get(zone);if(!group)return;const targetLevel=Math.max(0,Math.min(100,Number(level)||0)),sceneChanged=sceneId!==null&&sceneId!==group.scene;if(sceneChanged){group.fade={from:group.level,to:targetLevel,start:performance.now(),duration:4000};group.scene=sceneId;}else if(!group.fade||sceneId===null){group.fade=null;group.scene=sceneId;paintRoomLighting(group,targetLevel);}}
  function updateRoomLighting(now){roomLighting.forEach(group=>{if(!group.fade)return;const q=Math.min(1,(now-group.fade.start)/group.fade.duration),k=q*q*(3-2*q);paintRoomLighting(group,T.MathUtils.lerp(group.fade.from,group.fade.to,k));if(q>=1)group.fade=null;});}
  function setCurtains(zone,closed){const value=Math.max(0,Math.min(100,Number(closed)||0))/100;for(const panel of curtains.get(zone)||[]){const width=.38+(panel.userData.width/2-.38)*value;panel.scale.x=width;panel.position.x=panel.userData.center+panel.userData.side*(panel.userData.width/2-width/2);}}
  window.addEventListener('message',e=>{if(e.origin!==location.origin||e.source!==parent)return;const m=e.data;if(m?.channel==='hdh-view'){if(typeof m.visible==='boolean')visible=m.visible;if(m.viewport)viewport=m.viewport;if(Number.isFinite(m.zoom)){if(m.zoom>0)overview();else focus(selectedId,selectedZone);}}if(m?.channel==='hdh-demo'){const z=zoneTargets[m.zone],id=z?.id;if(background&&m.focus&&id&&m.zone!==window.HDH_ZONE){window.HDH_ZONE=m.zone;focus(id,m.zone)}setRoomLighting(m.zone,m.level,m.scene);setCurtains(m.zone,m.blinds);}});
  window.addEventListener('keydown',e=>{if(e.key==='Escape')parent.postMessage({channel:'hdh-close'},location.origin)});
  let last=0;
  function frame(now){requestAnimationFrame(frame);if(document.hidden||!visible)return;const w=canvas.clientWidth,h=canvas.clientHeight;if(!w||!h)return;if(canvas.width!==Math.round(w*renderer.getPixelRatio())||canvas.height!==Math.round(h*renderer.getPixelRatio())){renderer.setSize(w,h,false);}camera.aspect=w/h;updateRoomLighting(now);if(dayNightCycle){const phase=Math.floor(now/30000)%2?'night':'day';if(phase!==lastPhase){lastPhase=phase;night=phase==='night';document.body.dataset.phase=phase;}const goalHemi=night?.45:2.5,goalSun=night?.05:3.3;hemi.intensity+= (goalHemi-hemi.intensity)*.035;sun.intensity+=(goalSun-sun.intensity)*.035;scene.background.lerp(new T.Color(night?'#07111c':'#263f46'),.035);scene.fog.color.copy(scene.background);}if(tween){const q=Math.min(1,(now-tween.start)/tween.duration),k=ease(q);target.copy(tween.from.target).lerp(tween.to.target,k);radius=T.MathUtils.lerp(tween.from.radius,tween.to.radius,k);theta=T.MathUtils.lerp(tween.from.theta,tween.to.theta,k);phi=T.MathUtils.lerp(tween.from.phi,tween.to.phi,k);if(q===1){const done=tween.onDone;tween=null;done?.();}}if(auto&&!matchMedia('(prefers-reduced-motion: reduce)').matches)theta+=Math.min((now-last)/1000,.05)*.1;last=now;const distance=background&&viewport?radius*1.18/Math.min(1,viewport.w/viewport.h):radius;camera.position.set(target.x+distance*Math.sin(phi)*Math.sin(theta),target.y+distance*Math.cos(phi),target.z+distance*Math.sin(phi)*Math.cos(theta));camera.lookAt(target);if(background&&viewport){const v=viewport;camera.setViewOffset(w,h,w/2-(v.x+v.w/2),h/2-(v.y+v.h/2),w,h);}else if(camera.view?.enabled)camera.clearViewOffset();camera.updateProjectionMatrix();renderer.render(scene,camera);}
  roomLighting.forEach((_,zone)=>setRoomLighting(zone,65));curtains.forEach((_,zone)=>setCurtains(zone,0));showView('overview');const initial=overviewPose();target.copy(initial.target);radius=initial.radius;theta=initial.theta;phi=initial.phi;requestAnimationFrame(frame);window.HDH_MODEL={levels,roofs,shell,lights,select,overview,focus,progressiveFocus,renderer,scene,camera,roomLighting,curtains,navigation:()=>({view,selectedId,selectedZone,radius,phase:document.body.dataset.phase,dayNightCycle})};parent.postMessage({channel:'hdh-ready'},location.origin);
})();
