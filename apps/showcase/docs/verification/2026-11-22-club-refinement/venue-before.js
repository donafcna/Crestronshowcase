/* Conceptual showcase architecture, not a construction or installation plan. */
(()=>{
'use strict';
const query=new URLSearchParams(location.search), project=query.get('project'), club=project==='club-etoile', channel='ftv-venue/v1';
const send=type=>parent.postMessage({channel,project,type},location.origin);
try {
const T=window.THREE,scene=new T.Scene();scene.background=new T.Color(club?'#101322':'#172a38');
const renderer=new T.WebGLRenderer({antialias:true,alpha:false});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;document.body.appendChild(renderer.domElement);
const camera=new T.PerspectiveCamera(38,innerWidth/innerHeight,.1,180),target=new T.Vector3(0,1.2,0);let zoom=1,viewport=null,visible=true;
const model=new T.Group();scene.add(model);
const material=(color,roughness=.65,metalness=.05)=>new T.MeshStandardMaterial({color,roughness,metalness});
const M={floor:material(club?'#1b2030':'#52565a',.38),wall:material(club?'#22283d':'#c4b79d'),wood:material('#68422b'),black:material('#111923'),seat:material('#234e61'),metal:material('#58616d',.3,.7),white:material('#dcdedb')};
const luminous=(color,intensity=1)=>new T.MeshStandardMaterial({color,emissive:color,emissiveIntensity:intensity,roughness:.3});
const accent=luminous(club?'#9258ff':'#e6c997',.8),lightMat=luminous('#fceacb',1.2),screenMat=luminous('#ffffff',.5),floorLights=[];
function box(name,x,y,z,w,h,d,mat=M.wall){const m=new T.Mesh(new T.BoxGeometry(w,h,d),mat);m.name=name;m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;model.add(m);return m}
function cylinder(name,x,y,z,r,h,mat=M.metal){const m=new T.Mesh(new T.CylinderGeometry(r,r,h,16),mat);m.name=name;m.position.set(x,y,z);m.castShadow=true;model.add(m);return m}
function sign(text,x,y,z,w,h,color='#e7eff4',bg='#152333'){
 const c=document.createElement('canvas');c.width=1024;c.height=256;const ctx=c.getContext('2d');ctx.fillStyle=bg;ctx.fillRect(0,0,1024,256);ctx.fillStyle=color;ctx.font='500 68px sans-serif';ctx.textAlign='center';ctx.fillText(text,512,151);const tx=new T.CanvasTexture(c);tx.colorSpace=T.SRGBColorSpace;const mat=new T.MeshBasicMaterial({map:tx});return box('Sign '+text,x,y,z,w,h,.025,mat);
}
box('Foundation',0,-.42,0,23,.7,27,M.black);box('Floor',0,-.04,0,22,.15,26,M.floor);
box('Rear wall',0,3,-13,22,6,.25);box('Side wall',-11,2,0,.22,4,26);box('Cutaway edge',11,.25,0,.2,.5,26);
for(let i=0;i<22;i++)box('Acoustic wall rib',-10.83,2,-12+i*1.12,.18,3.7,.085,club?M.black:M.wood);
box('Back cove',0,5.65,-12.8,21,.08,.1,accent);
scene.add(new T.HemisphereLight('#d6e9ff','#28303c',club?1.3:2));
const key=new T.DirectionalLight('#ffe7c4',club?1:2.5);key.position.set(10,22,16);key.castShadow=true;key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-18,right:18,top:18,bottom:-18,far:80});key.shadow.bias=-.001;scene.add(key);
const stageLight=new T.PointLight(club?'#a478ff':'#ffe5bf',100,32,2);stageLight.position.set(0,5,-7);scene.add(stageLight);
const fill=new T.PointLight('#44c9ee',60,30,2);fill.position.set(-7,4,2);scene.add(fill);
const beams=[],auditoriumLedMaterials=[],auditoriumSpots=[],smoke=new T.Group();model.add(smoke);let screenContext,screenTexture,currentScreenSource='pc_lectern';
const newsImage=new Image(),brandImage=new Image();
newsImage.src='/assets/auditorium-news-presenter.png';brandImage.src='/assets/logo-frequence-tv-5LGUrtbd.png';
const redrawLoadedScreen=()=>{if(screenContext)drawScreen(currentScreenSource)};newsImage.onload=redrawLoadedScreen;brandImage.onload=redrawLoadedScreen;
function drawCover(c,image,w,h){const scale=Math.max(w/image.naturalWidth,h/image.naturalHeight),sw=w/scale,sh=h/scale;c.drawImage(image,(image.naturalWidth-sw)/2,(image.naturalHeight-sh)/2,sw,sh,0,0,w,h)}
function drawContain(c,image,w,h,padding=50){const scale=Math.min((w-padding*2)/image.naturalWidth,(h-padding*2)/image.naturalHeight),dw=image.naturalWidth*scale,dh=image.naturalHeight*scale;c.drawImage(image,(w-dw)/2,(h-dh)/2,dw,dh)}
function makeScreen(w,h,x,y,z){const c=document.createElement('canvas');c.width=1024;c.height=512;screenContext=c.getContext('2d');screenTexture=new T.CanvasTexture(c);screenTexture.colorSpace=T.SRGBColorSpace;screenMat.map=screenTexture;screenMat.emissiveMap=screenTexture;box('LED screen',x,y,z,w,h,.09,screenMat);box('Screen frame',x,y,z-.12,w+.25,h+.25,.16,M.black)}
function drawScreen(source){currentScreenSource=source;const c=screenContext;if(club&&source==='club_visual'){c.fillStyle='#271153';c.fillRect(0,0,1024,512);c.fillStyle='#b38cff';for(let i=0;i<9;i++)c.fillRect(60+i*110,310-Math.sin(i*.8)*60,44,100+Math.sin(i*.8)*60);c.fillStyle='#fff';c.font='bold 65px sans-serif';c.fillText('L’ÉTOILE',65,115);c.font='28px sans-serif';c.fillText('AFTER DARK · PRIVATE CLUB',65,182)}
 else if(source==='pc_lectern'){c.fillStyle='#eef7f2';c.fillRect(0,0,1024,512);c.fillStyle='#123a38';c.font='700 62px sans-serif';c.fillText('LE CHANGEMENT',65,130);c.fillText('CLIMATIQUE',65,203);c.fillStyle='#39766e';c.font='25px sans-serif';c.fillText('COMPRENDRE · AGIR · TRANSFORMER',67,255);c.fillStyle='#b7ddcd';c.beginPath();c.arc(800,256,150,0,Math.PI*2);c.fill();c.fillStyle='#2a6173';c.beginPath();c.arc(800,256,108,0,Math.PI*2);c.fill();c.strokeStyle='#ff704d';c.lineWidth=16;c.beginPath();c.moveTo(635,385);c.lineTo(700,340);c.lineTo(760,355);c.lineTo(830,250);c.lineTo(950,150);c.stroke();c.fillStyle='#ff704d';c.font='700 38px sans-serif';c.fillText('+1,5°C',845,105)}
 else if(source==='regie_hdmi'){c.fillStyle='#07111d';c.fillRect(0,0,1024,512);if(newsImage.complete&&newsImage.naturalWidth)drawCover(c,newsImage,1024,512);c.fillStyle='#b51124e8';c.fillRect(28,438,296,49);c.fillStyle='#fff';c.font='700 23px sans-serif';c.fillText('HDMI RÉGIE · EN DIRECT',47,470)}
 else if(source==='cam_feed'){c.fillStyle='#17293a';c.fillRect(0,0,1024,512);c.fillStyle='#517f91';c.fillRect(180,65,664,230);c.strokeStyle='#111820';c.lineWidth=16;c.strokeRect(180,65,664,230);c.fillStyle='#dffaff';c.font='700 54px sans-serif';c.textAlign='center';c.fillText('SCÈNE · LIVE',512,200);c.fillStyle='#213f50';for(let row=0;row<4;row++)for(let col=0;col<12;col++){c.beginPath();c.roundRect(55+col*78,335+row*40,48,25,8);c.fill()}c.fillStyle='#ff416f';c.font='700 24px sans-serif';c.fillText('● EN DIRECT',512,42);c.textAlign='start'}
 else{c.fillStyle='#fff';c.fillRect(0,0,1024,512);if(brandImage.complete&&brandImage.naturalWidth)drawContain(c,brandImage,1024,512,90)}screenTexture.needsUpdate=true}
if(!club){
 box('Stage',0,.38,-8.8,17,.75,6,M.wood);box('Stage step',0,.15,-5.4,10,.3,.8,M.wood);box('Stage edge',0,.77,-5.82,17,.04,.08,accent);
 makeScreen(20.4,4.9,0,3.05,-12.65);sign('AUDITORIUM · RICHMOND',0,5.75,-12.62,9,.55);
 // Staggered rows with a clear central aisle and accessible side aisles.
 for(let row=0;row<6;row++){const z=-3+row*2.35,y=row*.19;box('Seating riser',0,y-.1,z,19,.2,2.3,M.floor);for(let col=0;col<10;col++){const x=(col-4.5)*1.65+(col<5?-.65:.65);box('Seat cushion',x,y+.65,z,.98,.18,.85,M.seat);box('Seat back',x,y+1.12,z+.4,.98,.95,.18,M.seat);for(const dx of [-.56,.56]){box('Armrest',x+dx,y+.85,z,.1,.1,.8,M.wood);box('Seat support',x+dx,y+.35,z,.06,.65,.5,M.black)}}box('Aisle light',0,y+.025,z,1.1,.035,.09,accent)}
 box('Lectern',-5,1.32,-8,1.2,1.15,.75,M.black);box('Lectern top',-5,1.96,-8,1.5,.12,1,M.wood);cylinder('Lectern microphone',-5,2.25,-8,.025,.6);box('Lectern monitor',-5,2.1,-8.25,.7,.4,.06,M.black);
 for(const x of [-10.65,10.65])for(let i=0;i<4;i++)box('Line array speaker',x,4-i*.46,-10,.55,.4,.6,M.black);
 for(const x of [-7,0,7]){cylinder('PTZ pedestal',x,2.2,11,.08,1.2);cylinder('PTZ camera',x,2.92,11,.23,.25,M.black);box('PTZ lens',x,2.95,10.76,.2,.15,.2,M.metal)}
 for(const x of [-10.3,10.3])for(const z of [-11.7,-4,3,11.7]){
 const speaker=box(Math.abs(z)>11?'Corner speaker':'Side wall speaker',x,3.1,z,.65,1.05,.6,M.black);
 box('Speaker grille',x,3.1,z+.31,.55,.9,.025,M.metal);speaker.userData.audio=true;
 }
 const addLed=(name,x,y,z,w,h,d)=>{const m=luminous('#e6c997',1);auditoriumLedMaterials.push(m);return box(name,x,y,z,w,h,d,m)};
 addLed('Proscenium LED top',0,5.58,-12.45,20.8,.09,.08);addLed('Proscenium LED bottom',0,.55,-12.45,20.8,.09,.08);
 for(const x of [-10.35,10.35])addLed('Proscenium LED side',x,3.05,-12.45,.09,5,.08);
 for(const z of [-10.8,-8.5,-6.2])addLed('Stage LED strip',0,.82,z,17,.045,.07);
 for(const x of [-10.72,10.72])for(const z of [-8,-1,6])addLed('Wall LED strip',x,2.6,z,.055,3.1,.09);
 for(const z of [-6,2,9]){addLed('Ceiling LED cove',0,5.82,z,19,.06,.08);for(const x of [-9.5,-4.75,0,4.75,9.5]){box('Ceiling lighting rail',x,5.9,z,.12,.12,2.5,M.metal);
 box('Ceiling moving head',x,5.65,z,.4,.45,.4,M.black);
 box('Luminaire lens',x,5.4,z,.3,.05,.3,lightMat);
 const beam=new T.Mesh(new T.ConeGeometry(1.35,5.3,20,1,true),new T.MeshBasicMaterial({color:'#ffe2a1',transparent:true,opacity:.07,depthWrite:false,side:T.DoubleSide}));
 beam.position.set(x,2.7,z);beam.userData.circuit=z<0?'faceSpots':z>5?'audienceLights':'backlights';model.add(beam);beams.push(beam);
 const spot=new T.PointLight('#ffe2a1',10,9,2);spot.position.set(x,4.8,z);scene.add(spot);auditoriumSpots.push(spot);
 }}
}else{
 box('Dance floor',0,.045,1,11,.08,12,M.black);
 for(let x=0;x<6;x++)for(let z=0;z<6;z++){const m=luminous((x+z)%3===0?'#1987b8':(x+z)%3===1?'#773bd2':'#c0498d',.5);floorLights.push(m);box('Dance floor tile',-4.5+x*1.8,.095,-3.5+z*1.8,1.69,.03,1.69,m)}
 box('DJ stage',0,.35,-9,12,.7,5,M.black);box('DJ booth',0,1.3,-8,7,1.5,1.5,M.black);box('DJ illuminated fascia',0,1.3,-7.23,6.7,.85,.035,accent);box('DJ worktop',0,2.1,-8,7.4,.15,1.7,M.metal);
 for(const x of [-2,2]){cylinder('Turntable',x,2.22,-8,.58,.08,M.black);cylinder('Platter',x,2.27,-8,.37,.02,M.metal)}box('Mixer',0,2.24,-8,1,.12,.8,M.black);for(let i=0;i<5;i++)box('Mixer fader',-.36+i*.18,2.31,-8,.05,.03,.5,lightMat);
 makeScreen(9,3.3,0,4.05,-12.65);
 box('Bar counter',-8.4,1.15,3,2.5,2.3,12,M.black);box('Bar top',-8.4,2.35,3,2.8,.18,12.3,M.wood);box('Bar light',-6.96,1.95,3,.04,.08,11.8,accent);
 for(let i=0;i<7;i++){const z=-2+i*1.65;cylinder('Bar stool',-5.8,.72,z,.07,1.4);cylinder('Stool cushion',-5.8,1.44,z,.38,.15,M.seat);for(let j=0;j<2;j++)cylinder('Bottle',-9+j*.5,2.6,z,.08,.4,j?M.seat:M.white)}
 for(const z of [0,5,10]){box('Lounge banquette',9,.55,z,2.4,1,3.6,M.seat);box('Lounge back',10,.95,z,.35,1.4,3.6,M.seat);cylinder('Cocktail table',7,.5,z,.06,1);cylinder('Table top',7,1.03,z,.65,.12,M.black)}
 for(const x of [-7,7]){box('Speaker stack',x,1.55,-9,1.2,2.4,1,M.black);for(let y=1;y<3;y+=.65)box('Speaker grille',x,y,-8.48,.95,.5,.03,M.metal)}
 for(const z of [-6,4]){box('Lighting truss',0,5.7,z,20,.15,.15,M.metal);for(const x of [-8,-4,0,4,8]){box('Moving head',x,5.35,z,.4,.45,.4,M.black);const beam=new T.Mesh(new T.ConeGeometry(1.5,5,20,1,true),new T.MeshBasicMaterial({color:x%8===0?'#847bff':'#ef58c8',transparent:true,opacity:.065,depthWrite:false,side:T.DoubleSide}));beam.position.set(x,2.65,z);beam.rotation.z=x*.028;model.add(beam);beams.push(beam)}}
 for(let i=0;i<12;i++){const puff=new T.Mesh(new T.SphereGeometry(.6+i*.065,12,8),new T.MeshBasicMaterial({color:'#b5b2dc',transparent:true,opacity:.025,depthWrite:false}));puff.position.set(-3+i*.55,.3+i*.16,-5+Math.sin(i)*.5);puff.scale.set(1.6,.8,1);smoke.add(puff)}smoke.visible=false;
 sign('LOUNGE',9,2.2,-12.6,3,.5);sign('BAR',-8,4,-12.6,3,.5);
}

const clubFloors=[],clubRooms=new Map(),movingHeads=[],mirrorBalls=[];
if(club){
 const original=new T.Group();original.name='Open dance hall';
 const discarded=new Set([...beams,smoke]);
 for(const child of [...model.children]){
  if(discarded.has(child)||['Lighting truss','Moving head','Speaker stack','Speaker grille'].includes(child.name)||(child.position.z>8&&['Lounge banquette','Lounge back','Cocktail table','Table top'].includes(child.name)))model.remove(child);
  else original.add(child);
 }
 beams.length=0;
 const definitions=[{"id": "original", "floor": 0, "name": "Studio 77 · Disco", "color": "#ffb54a", "mood": "Or & velours · Piste rétro · DJ"}, {"id": "neon", "floor": 1, "name": "Neon Foundry · Electro", "color": "#2ee7f2", "mood": "Béton & acier · Portiques néon · DJ"}, {"id": "sky", "floor": 2, "name": "Sky Garden · Panoramique", "color": "#7fe0bb", "mood": "Ivoire & jade · Piste ronde · DJ"}];
 const rgbw=['#ff426b','#46ed92','#559dff','#fff5df'];
 for(const r of definitions){
 const f=r.floor,floor=new T.Group(),g=original.clone(true);floor.name='Club level '+f;floor.position.y=f*9;model.add(floor);clubFloors.push(floor);g.name=r.name;floor.add(g);
 const mats=[],roomBeams=[],roomHeads=[],balls=[],smokes=[];
 const cloned=new Map();g.traverse(o=>{if(o.isMesh){o.castShadow=false;if(o.material.emissive&&o.material.emissiveIntensity>0){if(!cloned.has(o.material)){const m=o.material.clone();cloned.set(o.material,m);mats.push(m);}o.material=cloned.get(o.material);}}});
 const capture=(parent,fn)=>{const before=new Set(model.children);fn();for(const child of [...model.children])if(!before.has(child)){child.castShadow=false;parent.add(child);}};
 capture(g,()=>{
 // Four 4.5 m PA towers, each with a double subwoofer and stacked drivers.
 for(const x of [-9.5,9.5])for(const z of [-10.8,10.8]){
 const tower=box('Giant corner speaker',x,2.25,z,1.7,4.5,1.45,M.black);tower.userData.kind='cornerSpeaker';
 box('Dual subwoofer enclosure',x,.65,z,2.1,1.3,1.65,M.black);
 for(const y of [.5,1.15,2,2.8,3.65,4.15]){const driver=cylinder('PA driver',x,y,z+(z>0?-.84:.84),y<1.3?.32:.45,.07,M.metal);driver.rotation.x=Math.PI/2;}
 }
 for(const x of [-10.7,10.7])for(const z of [-6,-1,4,8]){
 const speaker=box('Wall speaker',x,3.8,z,.55,1.15,.8,M.black);speaker.userData.kind='wallSpeaker';box('Wall speaker grille',x+(x>0?-.29:.29),3.8,z,.035,.95,.65,M.metal);
 }
 for(const z of [-5,0,5,10]){
 box('DMX lighting truss',0,5.95,z,20,.13,.13,M.metal);
 for(let k=0;k<6;k++){
 const x=-8+k*3.2,color=rgbw[(k+Math.round(z/5)+f+8)%4],lens=luminous(color,1);mats.push(lens);
 box('Lyre suspension',x,5.75,z,.55,.2,.55,M.black);
 const head=new T.Group();head.name='DMX RGBW moving head';head.position.set(x,5.5,z);head.userData.floor=f;head.userData.aim=new T.Vector3(0,.16,1);head.userData.from=new T.Vector3(0,.16,1);head.userData.to=new T.Vector3(0,.16,1);head.userData.next=0;g.add(head);roomHeads.push(head);movingHeads.push(head);
 const body=new T.Mesh(new T.BoxGeometry(.48,.6,.48),M.black);body.position.y=-.12;head.add(body);
 const optic=new T.Mesh(new T.CylinderGeometry(.18,.18,.06,12),lens);optic.position.y=-.45;head.add(optic);
 const beam=new T.Mesh(new T.ConeGeometry(.95,4.9,12,1,true),new T.MeshBasicMaterial({color,transparent:true,opacity:.065,depthWrite:false,side:T.DoubleSide}));beam.name='RGBW light beam';beam.position.y=-2.9;head.add(beam);beams.push(beam);roomBeams.push(beam);
 }
 }
 for(const x of [-5,0,5]){
 cylinder('Mirror ball cable',x,5.5,2,.018,.7,M.metal);
 const ball=new T.Mesh(new T.SphereGeometry(.66,24,12).toNonIndexed(),new T.MeshStandardMaterial({color:'#d6e4f2',metalness:.9,roughness:.15,flatShading:true,emissive:r.color,emissiveIntensity:.13}));ball.name='Mirror ball';ball.position.set(x,4.75,2);model.add(ball);balls.push(ball);mirrorBalls.push(ball);
 // Individual mirror tiles pick up alternating white and coloured highlights.
 const tiles=new T.InstancedMesh(new T.BoxGeometry(.105,.105,.018),new T.MeshStandardMaterial({color:'#edf4ff',metalness:.75,roughness:.18,emissive:'#b8cbdf',emissiveIntensity:.18}),192);tiles.name='Mirror mosaic';const dummy=new T.Object3D();let n=0;
 for(let row=1;row<=8;row++)for(let col=0;col<24;col++){const phi=row*Math.PI/9,theta=col*Math.PI/12;dummy.position.set(.67*Math.sin(phi)*Math.cos(theta),.67*Math.cos(phi),.67*Math.sin(phi)*Math.sin(theta));dummy.lookAt(dummy.position.clone().multiplyScalar(2));dummy.updateMatrix();tiles.setMatrixAt(n++,dummy.matrix);}ball.add(tiles);mats.push(ball.material,tiles.material);
 }
 for(const x of [-10.6,10.6])for(let i=0;i<12;i++){const led=luminous(rgbw[(i+f)%4],.7);mats.push(led);box('RGBW wall LED bar',x,1.3,-9+i*1.7,.07,1.8,.12,led);}
 const dots=new T.InstancedMesh(new T.CircleGeometry(.09,6),new T.MeshBasicMaterial({color:r.color,transparent:true,opacity:.65,depthWrite:false}),64);dots.count=64;dots.name='Mirror ball light dots';const dummy=new T.Object3D();for(let i=0;i<64;i++){dummy.position.set(Math.sin(i*2.4)*4.7,.13,-3+((i*1.73)%12));dummy.rotation.x=-Math.PI/2;dummy.updateMatrix();dots.setMatrixAt(i,dummy.matrix);}model.add(dots);
 for(let i=0;i<8;i++){const puff=new T.Mesh(new T.SphereGeometry(.75,10,6),new T.MeshBasicMaterial({color:r.color,transparent:true,opacity:.035,depthWrite:false}));puff.name='Haze';puff.position.set(-3+i*.8,.5+Math.sin(i)*.15,-4);puff.visible=false;model.add(puff);smokes.push(puff);}
 });
 // Distinct architecture, furniture and dance-floor geometry for each level.
 const palette=f===0?{floor:'#3e2431',wall:'#582937',seat:'#9d2746',bar:'#9a672d'}:f===1?{floor:'#252a30',wall:'#5f6469',seat:'#202830',bar:'#454e57'}:{floor:'#b9c3bd',wall:'#c9dcd4',seat:'#4f9c8a',bar:'#c4a673'};
 g.traverse(o=>{if(!o.isMesh)return;const name=o.name;if(['Floor','Foundation'].includes(name))o.material=material(palette.floor);if(['Rear wall','Side wall'].includes(name))o.material=material(palette.wall);if(/Lounge|Stool cushion/.test(name))o.material=material(palette.seat);if(['Bar counter','DJ booth'].includes(name))o.material=material(palette.bar,.4,.2);});
 if(f>0){for(const child of [...g.children])if(['Dance floor','Dance floor tile','Bar counter','Bar top','Bar light','Bar stool','Stool cushion','Bottle','Lounge banquette','Lounge back','Cocktail table','Table top'].includes(child.name))g.remove(child);}
 capture(g,()=>{
 const glow=luminous(r.color,.9);mats.push(glow);
 if(f===0){
 for(let i=0;i<20;i++)box('Burgundy velvet wall pleat',-10.85,2,-11+i*1.1,.16,3.7,.6,material(i%2?'#722139':'#4c1c31'));
 for(const x of [-6.3,6.3])box('Disco gold pilaster',x,2.8,-12.6,.2,5.2,.12,material('#d4a447',.25,.75));
 box('Gold screen crown',0,5.8,-12.5,9.5,.1,.1,glow);for(const x of [-4.75,4.75])box('Gold screen frame',x,4,-12.5,.1,3.6,.1,glow);
 sign('STUDIO 77',0,4.05,-12.72,8.7,3.2,'#ffe4a0','#651e39');
 }else if(f===1){
 box('Concrete dance slab',0,.08,1,10,.12,12,material('#28323b'));
 for(const x of [-5,5])box('Cyan dance border',x,.16,1,.08,.05,12,glow);
 for(const z of [-5,7])box('Cyan dance border',0,.16,z,10,.05,.08,glow);
 for(const z of [-4,0,4,7]){box('Industrial portal',-5.4,2.8,z,.22,5.6,.22,M.metal);box('Industrial portal',5.4,2.8,z,.22,5.6,.22,M.metal);box('Neon portal beam',0,5.55,z,11,.08,.08,glow);}
 for(let i=0;i<7;i++)box('Floor circuit line',-3+i, .16,1,.04,.025,11,glow);
 box('Industrial island bar',-8.2,1.05,3,2.5,2.1,7,material('#424b53',.3,.7));
 for(const z of [-1,3,7]){box('Steel lounge bench',8.2,.6,z,2.5,1.2,2.2,M.black);box('Bench neon base',8.2,.12,z,2.5,.08,2.2,glow);}
 sign('NEON FOUNDRY',0,4.05,-12.72,8.7,3.2,'#65f3ff','#111d29');
 }else{
 cylinder('Circular dance floor',0,.08,1,5.2,.16,material('#2e7069',.28,.3));
 for(const radius of [3.6,4.4,5.15]){const ring=new T.Mesh(new T.TorusGeometry(radius,.045,6,64),glow);ring.name='Circular dance halo';ring.rotation.x=Math.PI/2;ring.position.set(0,.19,1);model.add(ring);}
 const glass=new T.MeshPhysicalMaterial({color:'#8dcdd5',transparent:true,opacity:.16,roughness:.12,depthWrite:false});box('Panoramic glazing',-10.95,2.3,0,.06,4.4,25,glass);
 const wall=g.getObjectByName('Side wall');if(wall)wall.visible=false;
 for(const o of g.children)if(o.name==='Acoustic wall rib')o.visible=false;
 for(const z of [-7,0,7]){cylinder('Round ivory lounge',8.2,.45,z,1.5,.8,material('#e5decf'));cylinder('Brass cocktail table',6.7,.85,z,.65,.12,material('#c5a362',.25,.65));}
 box('Jade cocktail bar',-8.3,1.1,2,2.7,2.2,6,material('#378779'));
 for(const x of [-8,8])for(const z of [-8,8]){cylinder('Garden planter',x,.4,z,.6,.8,material('#ded7c7'));for(let k=0;k<4;k++){const leaf=new T.Mesh(new T.SphereGeometry(.65,10,6),material(k%2?'#377b5d':'#549a72'));leaf.name='Tropical greenery';leaf.position.set(x+Math.sin(k)*.35,1.25+k*.25,z+Math.cos(k)*.3);leaf.scale.set(.55,1.1,.7);model.add(leaf);}}
 sign('SKY GARDEN',0,4.05,-12.72,8.7,3.2,'#dff9e9','#2a7068');
 }
 });
 // Service annex beside the single open hall, without partitioning its dance floor.
 capture(floor,()=>{
 box('Reception and landing',15,-.08,0,7,.2,26,M.floor);
 box('Landing balustrade',18.5,.6,-4,.1,1.2,15,M.metal);
 if(f===0){box('Reception desk',15,1,1,3.5,2,1.5,M.wood);sign('RÉCEPTION',15,2.4,1,4,.5);}
 if(f<2){for(let i=0;i<15;i++){box('Ascending stair',13.3,.15+i*.3,-3-i*.43,2.3,.3,.45,M.wood);box('Returning stair',16.5,4.65+i*.3,-9+i*.43,2.3,.3,.45,M.wood);}box('Stair landing',15,4.5,-9.7,6,.3,1.2,M.wood);}
 for(const [x,label] of [[13.2,'WC Hommes'],[16.7,'WC Femmes']]){box(label+' floor',x,.05,9.5,3.3,.15,6,M.floor);box(label+' side',x+1.65,1.5,9.5,.12,3,6,M.wall);box(label+' rear',x,1.5,12.5,3.3,3,.12,M.wall);sign(label,x,2.5,12.4,3,.5);for(const z of [9,11]){cylinder('Toilet bowl',x,.5,z,.38,.5,M.white);box('Cistern',x,.95,z+.45,.7,.9,.25,M.white);}box('Washbasin',x,.9,7,1.5,.2,.6,M.white);}
 });
 clubRooms.set(r.id,{group:g,floor:f,materials:mats,beams:roomBeams,heads:roomHeads,balls,smokes,level:.75});
 }
}

drawScreen(club?'club_visual':'pc_lectern');
// Fit the projected geometry to the usable viewport, with a 2% edge allowance.
let fitObject=model,cameraMotion=null;
function frame(){const w=innerWidth,h=innerHeight,v=viewport||{x:0,y:0,w,h},fromPos=camera.position.clone(),fromTarget=target.clone();renderer.setSize(w,h);camera.aspect=v.w/v.h;camera.clearViewOffset();
 const bounds=new T.Box3().setFromObject(fitObject),center=bounds.getCenter(new T.Vector3());
 const dir=new T.Vector3(30,28,37).normalize();let lo=1,hi=170;
 for(let i=0;i<22;i++){const distance=(lo+hi)/2;camera.position.copy(center).addScaledVector(dir,distance);camera.lookAt(center);camera.updateMatrixWorld();camera.updateProjectionMatrix();let extent=0;
 for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z]){const p=new T.Vector3(x,y,z).project(camera);extent=Math.max(extent,Math.abs(p.x),Math.abs(p.y));}
 if(extent>.98)lo=distance;else hi=distance;
 }const toPos=center.clone().addScaledVector(dir,hi*zoom);camera.setViewOffset(v.w,v.h,-v.x,-v.y,w,h);camera.updateProjectionMatrix();if(club&&window.__venue?.state?.clubRoom){camera.position.copy(fromPos);target.copy(fromTarget);camera.lookAt(target);cameraMotion={fromPos,fromTarget,toPos,toTarget:center,start:performance.now(),duration:900}}else{camera.position.copy(toPos);target.copy(center);camera.lookAt(target)}}
const auditoriumFade={duration:4000,active:false,start:0,scene:null,color:null,current:{faceSpots:85,backlights:60,audienceLights:40,color:new T.Color('#39ff14')},from:null,target:null};
function sampleAuditoriumFade(now){if(!auditoriumFade.active)return auditoriumFade.current;const q=Math.min(1,(now-auditoriumFade.start)/auditoriumFade.duration),ease=q*q*(3-2*q),a=auditoriumFade.from,b=auditoriumFade.target;for(const key of ['faceSpots','backlights','audienceLights'])auditoriumFade.current[key]=T.MathUtils.lerp(a[key],b[key],ease);auditoriumFade.current.color.copy(a.color).lerp(b.color,ease);if(q>=1)auditoriumFade.active=false;return auditoriumFade.current}
function paintAuditoriumLighting(now){if(club)return;const d=sampleAuditoriumFade(now);stageLight.intensity=d.faceSpots*1.7;fill.intensity=d.audienceLights*1.65;accent.color.copy(d.color);accent.emissive.copy(d.color);accent.emissiveIntensity=d.backlights/48;lightMat.color.copy(d.color);lightMat.emissive.copy(d.color);lightMat.emissiveIntensity=.35+d.faceSpots/48;auditoriumLedMaterials.forEach((m,i)=>{m.color.copy(d.color);m.emissive.copy(d.color);m.emissiveIntensity=(i<4?d.backlights:i<7?d.faceSpots:d.audienceLights)/42});beams.forEach(b=>{const level=d[b.userData.circuit||'audienceLights'];b.material.opacity=level/100*.14;b.material.color.copy(d.color)});auditoriumSpots.forEach((light,i)=>{const circuit=beams[i]?.userData.circuit||'audienceLights';light.color.copy(d.color);light.intensity=d[circuit]*.32})}
function targetAuditoriumLighting(s){const d=s.dimmers||{faceSpots:85,backlights:60,audienceLights:40},color=s.lightsColor||'#e6c997',sceneChanged=auditoriumFade.scene!==null&&(auditoriumFade.scene!==s.stageScene||auditoriumFade.color!==color);if(auditoriumFade.scene===null){Object.assign(auditoriumFade.current,d);auditoriumFade.current.color.set(color)}else if(sceneChanged){sampleAuditoriumFade(performance.now());auditoriumFade.from={faceSpots:auditoriumFade.current.faceSpots,backlights:auditoriumFade.current.backlights,audienceLights:auditoriumFade.current.audienceLights,color:auditoriumFade.current.color.clone()};auditoriumFade.target={faceSpots:d.faceSpots,backlights:d.backlights,audienceLights:d.audienceLights,color:new T.Color(color)};auditoriumFade.start=performance.now();auditoriumFade.active=true}else if(!auditoriumFade.active){Object.assign(auditoriumFade.current,d)}auditoriumFade.scene=s.stageScene;auditoriumFade.color=color}
let lastSource='';function apply(s){
 if(club){
 const floor=Math.max(0,Math.min(2,Number(s.clubFloor)||0)),fallback=[...clubRooms.values()].find(r=>r.floor===floor),room=clubRooms.get(s.clubRoom)||fallback,view=s.clubView||'building';
 clubFloors.forEach((g,i)=>{g.visible=view==='building'||i===room.floor;});
 clubRooms.forEach((r,id)=>{
 r.group.visible=view!=='room'||r===room;const setting=s.roomSettings?.[id]||{scene:'signature',level:75};r.level=setting.scene==='off'?0:setting.level/100*(setting.scene==='party'?1.25:setting.scene==='calm'?.3:.8);
 r.materials.forEach(m=>m.emissiveIntensity=r.level);r.beams.forEach(b=>b.material.opacity=r.level*(s.strobeActive?.11:.075));r.group.getObjectByName('Mirror ball light dots').material.opacity=r.level*.65;r.smokes.forEach(p=>p.visible=!!s.smokeActive&&r.level>0);
 });
 const nextFit=view==='room'?room.group:view==='floor'?clubFloors[room.floor]:model;if(fitObject!==nextFit){fitObject=nextFit;frame();}
 if(lastSource!==s.clubScreenSource){lastSource=s.clubScreenSource;drawScreen(lastSource||'club_visual')}
 smoke.visible=!!s.smokeActive;stageLight.intensity=80*room.level;stageLight.position.y=room.floor*9+5;fill.intensity=45*room.level;fill.position.y=room.floor*9+4;
 }

 else{targetAuditoriumLighting(s);screenMat.emissiveIntensity=(s.ledWallBrightness??90)/100;screenMat.color.setScalar((s.ledWallBrightness??90)/100);if(lastSource!==s.ledWallSource){lastSource=s.ledWallSource;drawScreen(lastSource)}}
 window.__venue.state=s;
}
window.__venue={scene,renderer,camera,model,apply,state:{},beams,smoke,clubFloors,clubRooms,movingHeads,mirrorBalls,auditoriumLedMaterials,auditoriumSpots,lightingFade:auditoriumFade};
window.addEventListener('message',e=>{if(e.origin!==location.origin||e.source!==parent||e.data?.channel!==channel||e.data.project!==project)return;const d=e.data;if(d.type==='hello')send('ready');if(d.type==='state'&&d.state)apply(d.state);if(d.type==='viewport'&&d.viewport&&Object.values(d.viewport).every(Number.isFinite)){viewport=d.viewport;frame()}if(d.type==='visibility')visible=!!d.visible;if(d.type==='zoom'){zoom=T.MathUtils.clamp(zoom+d.delta*.06,.75,1.3);frame()}});
window.addEventListener('resize',frame);frame();
const down=new T.Vector3(0,-1,0),aimDirection=new T.Vector3();
function aimHead(head){const direction=aimDirection.copy(head.userData.aim).sub(head.position),distance=direction.length();head.quaternion.setFromUnitVectors(down,direction.normalize());const beam=head.getObjectByName('RGBW light beam');beam.scale.y=(distance-.45)/4.9;beam.position.y=-(distance+.45)/2;}
for(const head of movingHeads)aimHead(head);
let previous=0;function animate(t){requestAnimationFrame(animate);if(!visible||document.hidden||t-previous<33)return;previous=t;
 if(cameraMotion){const q=Math.min(1,(t-cameraMotion.start)/cameraMotion.duration),ease=q*q*(3-2*q);camera.position.lerpVectors(cameraMotion.fromPos,cameraMotion.toPos,ease);target.lerpVectors(cameraMotion.fromTarget,cameraMotion.toTarget,ease);camera.lookAt(target);if(q>=1)cameraMotion=null}
 if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
 if(club){clubRooms.forEach(r=>{if(!r.level)return;if(window.__venue.state.lyresActive!==false)r.heads.forEach(h=>{
 const u=h.userData;if(t>=u.next){u.from.copy(u.aim);const angle=Math.random()*Math.PI*2,radius=Math.sqrt(Math.random())*3.8;u.to.set(Math.cos(angle)*radius,.16,1+Math.sin(angle)*radius);u.start=t;u.duration=260+Math.random()*390;u.next=t+u.duration;}
 const progress=Math.min(1,(t-u.start)/u.duration),smooth=progress*progress*(3-2*progress);u.aim.lerpVectors(u.from,u.to,smooth);aimHead(h);
 });r.balls.forEach(ball=>ball.rotation.y=t*.00035);});
 }else beams.forEach((b,i)=>{b.rotation.z=Math.sin(t*.00035+i)*.12});
 }paintAuditoriumLighting(t);renderer.render(scene,camera)}requestAnimationFrame(animate);send('ready');
}catch(e){send('error');console.error(e)}
})();
