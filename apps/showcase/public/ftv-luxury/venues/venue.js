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
const beams=[],smoke=new T.Group();model.add(smoke);let screenContext,screenTexture;
function makeScreen(w,h,x,y,z){const c=document.createElement('canvas');c.width=1024;c.height=512;screenContext=c.getContext('2d');screenTexture=new T.CanvasTexture(c);screenTexture.colorSpace=T.SRGBColorSpace;screenMat.map=screenTexture;screenMat.emissiveMap=screenTexture;box('LED screen',x,y,z,w,h,.09,screenMat);box('Screen frame',x,y,z-.12,w+.25,h+.25,.16,M.black)}
function drawScreen(source){const c=screenContext;c.fillStyle=club?'#271153':'#102c42';c.fillRect(0,0,1024,512);c.fillStyle=club?'#b38cff':'#7acadc';for(let i=0;i<9;i++)c.fillRect(60+i*110,310-Math.sin(i*.8)*60,44,100+Math.sin(i*.8)*60);c.fillStyle='#fff';c.font='bold 65px sans-serif';c.fillText(club?'L’ÉTOILE':'RICHMOND',65,115);c.font='28px sans-serif';c.fillText(club?'AFTER DARK · PRIVATE CLUB':({pc_lectern:'CONFÉRENCE · PRÉSENTATION',regie_hdmi:'RÉGIE · HDMI',cam_feed:'CAMÉRA · LIVE',logo:'FRÉQUENCE TV'}[source]||'CONFÉRENCE'),65,182);screenTexture.needsUpdate=true}
if(!club){
 box('Stage',0,.38,-8.8,17,.75,6,M.wood);box('Stage step',0,.15,-5.4,10,.3,.8,M.wood);box('Stage edge',0,.77,-5.82,17,.04,.08,accent);
 makeScreen(10,4.1,0,3.5,-12.65);sign('AUDITORIUM · RICHMOND',0,5.75,-12.62,9,.55);
 // Staggered rows with a clear central aisle and accessible side aisles.
 for(let row=0;row<6;row++){const z=-3+row*2.35,y=row*.19;box('Seating riser',0,y-.1,z,19,.2,2.3,M.floor);for(let col=0;col<10;col++){const x=(col-4.5)*1.65+(col<5?-.65:.65);box('Seat cushion',x,y+.65,z,.98,.18,.85,M.seat);box('Seat back',x,y+1.12,z+.4,.98,.95,.18,M.seat);for(const dx of [-.56,.56]){box('Armrest',x+dx,y+.85,z,.1,.1,.8,M.wood);box('Seat support',x+dx,y+.35,z,.06,.65,.5,M.black)}}box('Aisle light',0,y+.025,z,1.1,.035,.09,accent)}
 box('Lectern',-5,1.32,-8,1.2,1.15,.75,M.black);box('Lectern top',-5,1.96,-8,1.5,.12,1,M.wood);cylinder('Lectern microphone',-5,2.25,-8,.025,.6);box('Lectern monitor',-5,2.1,-8.25,.7,.4,.06,M.black);
 for(const x of [-8.5,8.5])for(let i=0;i<4;i++)box('Line array speaker',x,4-i*.46,-10,.55,.4,.6,M.black);
 for(const x of [-7,0,7]){cylinder('PTZ pedestal',x,2.2,11,.08,1.2);cylinder('PTZ camera',x,2.92,11,.23,.25,M.black);box('PTZ lens',x,2.95,10.76,.2,.15,.2,M.metal)}
 for(let i=0;i<5;i++)box('Stage luminaire',-7+i*3.5,5,-5.5,.5,.2,.6,lightMat);
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
drawScreen('pc_lectern');
function frame(){const w=innerWidth,h=innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.position.set(30*zoom,28*zoom,37*zoom);camera.lookAt(target);camera.clearViewOffset();if(viewport){const cx=viewport.x+viewport.w/2,cy=viewport.y+viewport.h/2;camera.setViewOffset(w,h,w/2-cx,h/2-cy,w,h);const fit=Math.max(1,Math.max(w/Math.max(200,viewport.w),h/Math.max(200,viewport.h))*.86);camera.position.copy(target).add(new T.Vector3(30,28,37).multiplyScalar(zoom*fit));camera.lookAt(target)}camera.updateProjectionMatrix()}
let lastSource='';function apply(s){
 if(club){smoke.visible=!!s.smokeActive;accent.emissiveIntensity=s.strobeActive?1.7:.8;beams.forEach(b=>b.material.opacity=s.strobeActive?.1:.045);stageLight.intensity=s.strobeActive?130:80;floorLights.forEach(m=>m.emissiveIntensity=s.strobeActive?.9:.4)}
 else{const d=s.dimmers||{faceSpots:85,backlights:60,audienceLights:40};stageLight.intensity=d.faceSpots*1.5;fill.intensity=d.audienceLights*1.5;accent.color.set(s.lightsColor||'#e6c997');accent.emissive.copy(accent.color);accent.emissiveIntensity=d.backlights/70;lightMat.emissiveIntensity=d.faceSpots/60;screenMat.emissiveIntensity=(s.ledWallBrightness??90)/100;screenMat.color.setScalar((s.ledWallBrightness??90)/100);if(lastSource!==s.ledWallSource){lastSource=s.ledWallSource;drawScreen(lastSource)}}
 window.__venue.state=s;
}
window.__venue={scene,renderer,camera,model,apply,state:{},beams,smoke};
window.addEventListener('message',e=>{if(e.origin!==location.origin||e.source!==parent||e.data?.channel!==channel||e.data.project!==project)return;const d=e.data;if(d.type==='hello')send('ready');if(d.type==='state'&&d.state)apply(d.state);if(d.type==='viewport'&&d.viewport&&Object.values(d.viewport).every(Number.isFinite)){viewport=d.viewport;frame()}if(d.type==='visibility')visible=!!d.visible;if(d.type==='zoom'){zoom=T.MathUtils.clamp(zoom+d.delta*.06,.75,1.3);frame()}});
window.addEventListener('resize',frame);frame();
let previous=0;function animate(t){requestAnimationFrame(animate);if(!visible||document.hidden||t-previous<33)return;previous=t;renderer.render(scene,camera)}requestAnimationFrame(animate);send('ready');
}catch(e){send('error');console.error(e)}
})();
