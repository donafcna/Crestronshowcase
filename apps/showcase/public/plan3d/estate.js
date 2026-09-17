import * as T from './vendor/three.module.min.js';

// Assembled architecture and landscape; deterministic, local, batched geometry.
export function createEstate(scene, rooms, kit, renderer) {
  const group=new T.Group(),garden=new T.Group();group.name='Alpine residence';garden.name='Estate landscape';scene.add(group,garden);
  let opacity=1,disposed=false,nightLevel=0;
  const wallLights=[];
  const A=kit.materials,rand=kit.random,facadeMaterials=new Set(),textures=new Set(),geometries=new Map();
  const material=(color,roughness=.65,extra={})=>new T.MeshStandardMaterial({color,roughness,...extra});
  const loader=new T.TextureLoader();
  function load(name,color){const t=loader.load(new URL('./textures/stone-'+name+'.webp',import.meta.url).href,t=>{if(disposed)t.dispose();else renderer.shadowMap.needsUpdate=true;});t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=4;if(color)t.colorSpace=T.SRGBColorSpace;textures.add(t);return t;}
  const stone=material(0xd8cfbc,.86,{map:load('color',true),normalMap:load('normal'),roughnessMap:load('roughness'),normalScale:new T.Vector2(.32,.32)});
  const lime=A.stone.clone();lime.color.setHex(0xdcd3bf);
  const timber=A.oak.clone();timber.color.setHex(0x76614b);
  const bronze=material(0x746249,.32,{metalness:.75}),black=material(0x24292b,.42,{metalness:.45});
  const white=material(0xe6e0d4,.82),roof=material(0x555952,.95),gravel=material(0x9a9886,1);
  const grass=material(0x435c34,1),leaf=material(0x314c35,.95),leafLight=material(0x5b7041,.95),soil=material(0x393c2e,1);
  const glow=material(0xffe1a4,.6,{emissive:0xffc77c,emissiveIntensity:1.5});
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=256;const ctx=canvas.getContext('2d');
  const gradient=ctx.createLinearGradient(0,0,0,256);gradient.addColorStop(0,'#749bb5');gradient.addColorStop(.45,'#dde7df');gradient.addColorStop(.51,'#b6bca3');gradient.addColorStop(1,'#36443e');ctx.fillStyle=gradient;ctx.fillRect(0,0,512,256);
  ctx.fillStyle='#fff3cc';ctx.fillRect(95,45,35,40);ctx.fillStyle='#657765';for(let i=0;i<9;i++)ctx.fillRect(i*70,128,20,30);
  const envTexture=new T.CanvasTexture(canvas);envTexture.colorSpace=T.SRGBColorSpace;envTexture.mapping=T.EquirectangularReflectionMapping;
  const pmrem=new T.PMREMGenerator(renderer),environment=pmrem.fromEquirectangular(envTexture);pmrem.dispose();envTexture.dispose();
  const glassCanvas=document.createElement('canvas');glassCanvas.width=256;glassCanvas.height=512;const gg=glassCanvas.getContext('2d');
  const reflection=gg.createLinearGradient(0,0,0,512);reflection.addColorStop(0,'#516774');reflection.addColorStop(.34,'#9faeae');reflection.addColorStop(.48,'#526969');reflection.addColorStop(1,'#333f3a');gg.fillStyle=reflection;gg.fillRect(0,0,256,512);
  gg.fillStyle='rgba(226,212,176,.19)';gg.fillRect(12,22,44,475);gg.fillRect(217,22,28,475);
  for(let i=0;i<6;i++){gg.fillStyle='rgba(255,255,240,.035)';gg.fillRect(14+i*6,24,2,470);}
  gg.fillStyle='rgba(16,23,24,.28)';gg.fillRect(66,351,124,57);gg.fillRect(59,373,139,44);
  const glazingTexture=new T.CanvasTexture(glassCanvas);glazingTexture.colorSpace=T.SRGBColorSpace;textures.add(glazingTexture);
  const glass=material(0xb9c6c6,.19,{map:glazingTexture,metalness:.28,envMap:environment.texture,envMapIntensity:1.25});
  const water=material(0x397f82,.19,{metalness:.5,envMap:environment.texture,envMapIntensity:1.1,side:T.DoubleSide});
  function facade(m){const clone=m.clone();clone.userData.baseOpacity=m.opacity;clone.userData.baseTransparent=m.transparent;facadeMaterials.add(clone);return clone;}
  const F={stone:facade(stone),lime:facade(lime),wood:facade(timber),metal:facade(black),bronze:facade(bronze),white:facade(white),roof:facade(roof),glass:facade(glass),glow:facade(glow),gravel:facade(gravel),green:facade(leafLight)};
  F.rail=facade(material(0xc1d7da,.15,{transparent:true,opacity:.32,depthWrite:false,metalness:.15,envMap:environment.texture,envMapIntensity:.55,side:T.DoubleSide}));
  function boxGeo(w,h,d){const key=[w,h,d].join('/');if(geometries.has(key))return geometries.get(key);const g=new T.BoxGeometry(w,h,d),p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i);uv.setXY(i,(Math.abs(n.getX(i))>.5?z:x)/3,(Math.abs(n.getY(i))>.5?z:y)/3);}geometries.set(key,g);return g;}
  const sphere=new T.IcosahedronGeometry(1,2),cylinder=new T.CylinderGeometry(1,1,1,12);
  function mesh(parent,m,geo,x,y,z,sx=1,sy=1,sz=1){const o=new T.Mesh(geo,m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
  const box=(p,m,x,y,z,w,h,d)=>mesh(p,m,m===F.glass?new T.BoxGeometry(w,h,d):boxGeo(w,h,d),x,y,z);
  const ball=(p,m,x,y,z,r,ry=r,rz=r)=>mesh(p,m,sphere,x,y,z,r,ry,rz);
  const cyl=(p,m,x,y,z,r,h)=>mesh(p,m,cylinder,x,y,z,r,h,r);
  function line(p,m,a,b,r){const start=new T.Vector3(...a),end=new T.Vector3(...b),o=cyl(p,m,...start.clone().add(end).multiplyScalar(.5).toArray(),r,start.distanceTo(end));o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),end.sub(start).normalize());return o;}
  function sconce(parent,x,y,z,rotation=0){
    const q=new T.Group();q.position.set(x,y,z);q.rotation.y=rotation;parent.add(q);wallLights.push(q);
    box(q,F.bronze,0,0,-.052,.22,.44,.06);box(q,F.metal,0,0,0,.19,.4,.16);
    for(const side of [-1,1])box(q,F.glow,0,side*.205,.005,.14,.018,.1);
  }
  function elevation(x,y,z,length,side=false){
    const g=new T.Group();g.position.set(x,y,z);if(side)g.rotation.y=Math.PI/2;group.add(g);
    box(g,F.stone,length/2,1.5,0,length,3,.28);
    const bays=Math.max(1,Math.floor(length/3.7)),bay=length/bays;
    for(let i=0;i<bays;i++){
      const cx=(i+.5)*bay;box(g,F.metal,cx,1.52,.18,bay-.38,2.64,.12);box(g,F.glass,cx,1.52,.251,bay-.51,2.49,.014);
      for(const k of [-1,0,1])box(g,F.bronze,cx+k*(bay-.48)/2,1.52,.278,.045,2.54,.05);
      box(g,F.stone,i*bay,1.5,.34,.64,3,.64);box(g,F.glow,cx,2.87,.31,bay-.66,.018,.025);
      sconce(g,i*bay,1.75,.76);
    }
    box(g,F.stone,length,1.5,.34,.64,3,.64);sconce(g,length,1.75,.76);
  }
  function railing(x,y,z,length,side=false){
    const g=new T.Group();g.position.set(x,y,z);if(side)g.rotation.y=Math.PI/2;group.add(g);
    const pane=box(g,F.rail,length/2,.53,0,length,1.02,.025);pane.castShadow=false;box(g,F.bronze,length/2,1.06,0,length,.035,.04);
    for(let x=0;x<=length;x+=1.6)box(g,F.metal,x,.1,0,.045,.2,.085);
  }
  function volume(x,z,w,d,level){
    const y=level*3.6;box(group,F.lime,x+w/2,y-.16,z+d/2,w+.9,.32,d+.9);
    box(group,F.stone,x+w/2,y+1.5,z-.15,w,3,.3);box(group,F.stone,x-.15,y+1.5,z+d/2,.3,3,d);
    elevation(x,y,z+d,w);elevation(x+w,y,z+d,d,true);
    // Opaque north/west walls also have real fixtures, clear of the windows.
    for(let dx=2;dx<w;dx+=5)sconce(group,x+dx,y+1.75,z-.4,Math.PI);
    for(let dz=2;dz<d;dz+=4)sconce(group,x-.4,y+1.75,z+dz,-Math.PI/2);
    const wing=level===1&&z===6,roofZ=z+d/2+(wing?.5:0),roofDepth=d+(wing?0:1);
    box(group,F.roof,x+w/2,y+3.35,roofZ,w+1,.26,roofDepth);
    box(group,F.wood,x+w/2,y+3.17,z+d+.42,w+1,.12,.16);box(group,F.glow,x+w/2,y+3.12,z+d+.35,w+.5,.018,.02);
    box(group,F.gravel,x+w/2,y+3.5,roofZ,w+.5,.025,roofDepth-.5);
    for(const dx of [-.45,w+.45])box(group,F.lime,x+dx,y+3.6,z+d/2,.12,.28,d+1);
    for(const dz of wing?[d+.45]:[-.45,d+.45])box(group,F.lime,x+w/2,y+3.6,z+dz,w+1,.28,.12);
  }
  volume(0,0,18.6,11.4,0);volume(0,0,18.1,6,1);volume(0,6,6.5,5.4,1);volume(0,0,12.3,6,2);
  box(group,F.lime,12.55,3.56,9.5,12.5,.22,7.1);railing(6.5,3.68,13.05,12.3);railing(18.8,3.68,13.05,6.9,true);
  box(group,F.lime,9.1,7.12,8.05,18.8,.22,3.5);railing(-.3,7.24,9.8,18.8);railing(18.5,7.24,9.8,9.8,true);
  for(const [x,y,z,w,d] of [[15.4,7.25,3,4.5,3.8],[8,7.25,8.4,2.7,.7],[17,3.8,11,1.7,.7]]){box(group,F.lime,x,y+.16,z,w,.32,d);box(group,F.green,x,y+.34,z,w-.18,.07,d-.18);}
  for(let i=0;i<22;i++)box(group,F.wood,-.28,5.1,.4+i*.24,.13,2.8,.075);
  for(let i=0;i<18;i++)box(group,F.wood,13.25+i*.23,1.5,11.72,.075,2.95,.13);
  // Two substantial stone blades anchor the lighter glazed volumes.
  box(group,F.stone,12.2,5.2,6.22,.85,10.4,.55);
  box(group,F.stone,17,1.5,11.78,2.7,3,.34);
  box(group,F.bronze,12.2,10.43,6.22,.92,.07,.64);
  sconce(group,17,1.75,12.05);
  for(const y of [5.35,8.95])sconce(group,12.2,y,6.595);
  // Outdoor lounges animate the inhabited terraces without adding live lights.
  function lounge(x,y,z){
    box(group,F.wood,x,y+.23,z,2.7,.36,.85);box(group,F.white,x,y+.47,z,2.58,.13,.76);
    box(group,F.white,x,y+.7,z-.36,2.6,.52,.15);
    for(const side of [-1,1])box(group,F.wood,x+side*1.34,y+.5,z,.09,.55,.9);
    box(group,F.lime,x,y+.28,z+1.35,1.25,.18,.65);box(group,F.metal,x,y+.37,z+1.35,.72,.04,.22);
    for(let i=0;i<4;i++)ball(group,F.glow,x-.25+i*.17,y+.46,z+1.35,.05,.13,.035);
  }
  lounge(11.3,3.72,10);lounge(3.8,7.24,7.6);
  for(const [x,y,z] of [[17.5,3.8,11.6],[7.5,3.8,11.6],[16,7.3,4],[14,7.3,1.5]]){
    cyl(group,F.lime,x,y+.28,z,.32,.55);for(let i=0;i<7;i++){const a=i*.9;ball(group,F.green,x+Math.cos(a)*.23,y+.75+rand()*.3,z+Math.sin(a)*.23,.08,.48,.1);}
  }
  function awning(x,y,z,width,reach){
    box(group,F.metal,x,y,z,width,.16,.2);const cloth=box(group,F.white,x,y-.15,z+reach/2,width-.1,.035,reach);cloth.rotation.x=.09;
    box(group,F.white,x,y-.28,z+reach,width,.18,.045);
    for(const side of [-1,1]){const sx=x+side*(width/2-.2);line(group,F.metal,[sx,y-.06,z],[sx+side*.24,y-.16,z+reach*.5],.023);line(group,F.metal,[sx+side*.24,y-.16,z+reach*.5],[sx,y-.26,z+reach],.023);}
    box(group,F.bronze,x+width/2,y,z,.12,.19,.24);
  }
  awning(3.2,2.87,11.9,5.5,2.2);
  for(const r of Object.values(rooms).filter(r=>r.cfg.niveau===0&&!r.ext&&r.win)){
    const {x,z}=r.cfg,win=r.win,before=new Set(group.children);
    awning(win.x,2.87,0,win.w+1.1,2.2);
    const q=new T.Group();group.add(q);
    for(const o of [...group.children])if(o!==q&&!before.has(o))q.attach(o);
    q.rotation.y=win.wall==='west'?-Math.PI/2:Math.PI;
    q.position.set(win.wall==='west'?x:x+win.x*2,0,win.wall==='west'?z+r.cfg.d:z);
  }
awning(10,6.48,6.5,5.3,2.4);awning(15.5,6.48,6.5,4.8,2.4);
  for(const x of [20,25])for(const z of [-.2,5.7])box(group,F.wood,x,1.4,z,.17,2.8,.17);
  for(let i=0;i<25;i++)box(group,F.wood,22.5,2.85,-.35+i*.26,5.7,.15,.095);
  box(group,F.white,22.5,2.98,1.6,5.3,.045,3.9);volume(26,0,4,6,0);
  // Arrival court, terraces and lawn occupy separate, deliberate garden zones.
  // Keep the vehicle ramp genuinely open through the ground slab.
  box(garden,lime,3.15,-.51,17.25,19.3,.24,43.5);
  box(garden,lime,24.85,-.51,17.25,13.3,.24,43.5);
  box(garden,lime,15.5,-.51,3.45,5.4,.24,15.9);box(garden,grass,7,-.365,17.5,10,.035,5);box(garden,grass,24.5,-.365,17.5,11,.035,5);box(garden,grass,-3,-.36,5,3,.04,18);
  for(let x=-1;x<30;x+=1.2)for(let z=12;z<15;z+=1.2)if(x<12.1||x>18.8)box(garden,lime,x,-.36,z,1.16,.03,1.16);
  for(let i=0;i<6;i++)box(garden,lime,3.2,-.28+i*.07,16-i*.58,5.7,.09,.62);
  const pool=rooms[12];if(pool?.eau){pool.eau.material.roughness=.17;pool.eau.material.metalness=.45;pool.eau.material.envMap=environment.texture;pool.eau.material.envMapIntensity=.7;}
  for(const [x,z,w,d] of [[24,7.85,6.8,.25],[24,11.95,6.8,.25],[20.7,9.9,.25,4.35],[27.3,9.9,.25,4.35]])box(garden,lime,x,.36,z,w,.12,d);
  box(garden,black,24,-.08,12.12,6.7,.5,.09);box(garden,water,24,.02,12.15,6.5,.03,.2);
  for(let i=0;i<4;i++){const x=21+i*2.1;box(garden,timber,x,.02,14.3,.8,.32,1.9);box(garden,white,x,.22,14.3,.73,.13,1.8);const back=box(garden,white,x,.47,13.65,.73,.65,.12);back.rotation.x=-.2;if(i<3)cyl(garden,bronze,x+1.02,.12,14.1,.27,.07);}
  cyl(garden,lime,10,-.19,17.2,1.7,.35);cyl(garden,water,10,.001,17.2,1.53,.025);box(garden,stone,10,.35,17.2,.72,.7,.72);
  const sculpture=mesh(garden,bronze,new T.TorusKnotGeometry(.6,.12,80,10,2,3),10,1.6,17.2);sculpture.rotation.z=.3;
  const stream=new T.Shape(),left=[],right=[];
  for(let i=0;i<=24;i++){const z=-3+i*.94,x=-5.1+Math.sin(i*.4)*.55;left.push([x-.45,z]);right.push([x+.45,z]);}
  stream.moveTo(...left[0]);left.slice(1).forEach(v=>stream.lineTo(...v));right.reverse().forEach(v=>stream.lineTo(...v));stream.closePath();
  const streamGeo=new T.ShapeGeometry(stream);streamGeo.rotateX(Math.PI/2);mesh(garden,water,streamGeo,0,-.34,0);
  for(let i=0;i<38;i++){const z=-3+rand()*23,x=-5.1+Math.sin((z+3)/.94*.4)*.55+(i%2?-.58:.58);ball(garden,stone,x,-.24,z,.2+rand()*.25,.16,.3);}
  for(let i=0;i<11;i++)box(garden,timber,-5.1,-.14,9.3+i*.11,2,.13,.095);
  for(const z of [-4,39]){
    for(const [cx,width] of z===39?[[1.4,14.8],[11.7,1],[24.7,12.6]]:[[12.5,37]]){
      box(garden,stone,cx,.02,z,width,.78,.3);box(garden,lime,cx,.44,z,width,.08,.4);
      box(garden,glow,cx,.39,z-.18,width,.022,.025);
      for(let x=cx-width/2;x<cx+width/2;x+=.25)box(garden,black,x,1,z,.025,1.05,.03);
    }
  }
  for(const x of [-6,31]){box(garden,stone,x,.02,17.5,.3,.78,43);box(garden,glow,x+(x<0?.18:-.18),.39,17.5,.025,.022,43);for(let i=0;i<172;i++)box(garden,black,x,1,-4+i*.25,.03,1.05,.025);}
  // Sliding gate parked beside a clear 5.4 m vehicle entrance.
  box(garden,black,9.7,.73,39.18,5.2,1.5,.09);for(let i=0;i<27;i++)box(garden,timber,7.2+i*.19,.78,39.25,.11,1.35,.055);
  for(const [x,z] of [[-5.8,-3.8],[30.8,-3.8],[-5.8,38.8],[30.8,38.8],[12.4,39],[18.6,39]]){
    box(garden,stone,x,.55,z,.44,1.8,.44);cyl(garden,black,x,1.72,z,.035,.65);const housing=box(garden,white,x,2.01,z,.27,.12,.13);housing.rotation.y=-.7;ball(garden,black,x+.11,2.01,z+.055,.045);box(garden,glow,x,1.13,z+.235,.14,.2,.015);
  }
  for(const [x,z,w,d] of [[7,19.8,9,.8],[24,19.8,11,.8],[29.7,8.5,.9,19],[-3.2,-2.6,4,.8]]){
    box(garden,soil,x,-.3,z,w,.08,d);for(let i=0;i<Math.max(w,d)/.55;i++)ball(garden,i%3?leaf:leafLight,x+(w>d?(i*.55-w/2):0),.14,z+(d>w?(i*.55-d/2):0),w>d?.42:.55,.6,d>w?.42:.55);
  }
  function tree(x,z,h){cyl(garden,timber,x,h*.35,z,.11,h*.8);for(let i=0;i<5;i++){const a=i*2.4,cx=x+Math.cos(a)*h*.23,cz=z+Math.sin(a)*h*.23,y=h*(.54+i*.08);line(garden,timber,[x,y-.2,z],[cx,y,cz],.045);for(let j=0;j<3;j++)ball(garden,j%2?leaf:leafLight,cx+(rand()-.5)*.45,y+(rand()-.5)*.2,cz+(rand()-.5)*.45,h*.23,h*.085,h*.2);}}
  for(const [x,z,h] of [[-3,0,3.1],[-3,15,3.7],[29,17,3.3],[28,-2,3.4],[20,18.4,2.7],[18,-2.5,3.2]])tree(x,z,h);
  for(let i=0;i<26;i++){const x=19.3+rand()*8.5,z=18+rand()*1.2;cyl(garden,soil,x,-.27,z,.17,.08);for(let j=0;j<3;j++)ball(garden,leafLight,x+(rand()-.5)*.3,.05+rand()*.25,z+(rand()-.5)*.3,.06,.35,.08);}
  for(const [x,z] of [[-1,12],[7,15],[19,15],[28,12],[-2,19],[19,20]]){box(garden,black,x,.13,z,.12,.9,.12);box(garden,glow,x,.57,z,.14,.035,.14);}
  // Habitable basement under the main volume; its garage faces the approach ramp.
  box(group,F.stone,9.3,-2.05,-.15,18.6,3.1,.3);
  box(group,F.stone,-.15,-2.05,5.7,.3,3.1,11.4);
  box(group,F.stone,18.75,-2.05,5.7,.3,3.1,11.4);
  box(group,F.stone,6.4,-2.05,11.55,12.8,3.1,.3);
  box(group,F.stone,18.45,-2.05,11.55,.5,3.1,.3);
  box(group,F.stone,15.5,-.65,11.55,5.4,.35,.3);
  box(group,F.metal,15.5,-2.13,11.59,5.25,2.7,.06);
  for(let i=0;i<8;i++)box(group,F.bronze,15.5,-3.38+i*.34,11.64,5.2,.018,.03);
  // 27.6 m ramp, gentle sinusoidal grade variation (about 10-13%).
  const rampY=z=>{const a=Math.max(0,Math.min(1,(z-11.4)/27.6));return -3.58+3.2*(a-Math.sin(a*Math.PI*2)*.12/(Math.PI*2));};
  const positions=[],uv=[];
  for(let i=0;i<46;i++){
    const a=11.4+i*.6,b=a+.6,ya=rampY(a),yb=rampY(b);
    positions.push(12.8,ya,a,18.2,yb,b,18.2,ya,a,12.8,ya,a,12.8,yb,b,18.2,yb,b);uv.push(0,0,1,1,1,0,0,0,0,1,1,1);
    for(const x of [12.66,18.34])box(garden,stone,x,(ya-.35)/2,a+.3,.25,-.35-ya+.2,.61);
    if(i%4===0)for(const x of [12.83,18.17])box(garden,glow,x,ya+.28,a+.3,.018,.06,.2);
  }
  // Trench bottom and entrance apron also cover the coarse landscape cut's border triangles.
  box(garden,stone,15.5,-3.85,25,11,.15,36);
  box(garden,roof,15.5,-.39,41,10,.12,4.1);
  const rampGeo=new T.BufferGeometry();rampGeo.setAttribute('position',new T.Float32BufferAttribute(positions,3));rampGeo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));rampGeo.computeVertexNormals();mesh(garden,roof,rampGeo,0,0,0);
  // Separate pedestrian approach and planting, clear of the car route.
  box(garden,grass,3,-.365,28,14,.035,15);box(garden,grass,24.5,-.365,28,10,.035,15);
  for(let z=21;z<39;z+=1.1)box(garden,lime,9.8,-.36,z,2,.03,1.05);
  // Camera brackets on ground-floor facades, independent of the sconces.
  for(const x of [.45,6.1,12.2,18.1]){
    box(group,F.metal,x,2.66,11.75,.06,.08,.38);const housing=box(group,F.white,x,2.59,11.98,.25,.12,.16);housing.rotation.y=.35;ball(group,F.metal,x+.06,2.59,12.07,.044);
  }
  // Tall four-corner camera portals: cantilever arms keep lenses clear of plants.
  for(const [x,z] of [[-5.6,-3.6],[30.6,-3.6],[-5.6,38.6],[30.6,38.6]]){
    box(garden,black,x,1.55,z,.12,3.8,.12);box(garden,black,x+(x<0?.4:-.4),3.43,z,.85,.09,.09);
    box(garden,white,x+(x<0?.73:-.73),3.31,z,.2,.18,.26);ball(garden,black,x+(x<0?.73:-.73),3.26,z+.11,.075);
  }
  // Night lighting uses emissive batches and soft pools instead of dozens of live lights.
  const glowCanvas=document.createElement('canvas');glowCanvas.width=glowCanvas.height=64;const gc=glowCanvas.getContext('2d'),gr=gc.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,230,175,.8)');gr.addColorStop(.3,'rgba(255,215,130,.3)');gr.addColorStop(1,'rgba(255,200,100,0)');gc.fillStyle=gr;gc.fillRect(0,0,64,64);
  const glowTexture=new T.CanvasTexture(glowCanvas);textures.add(glowTexture);
  const poolGlow=new T.MeshBasicMaterial({map:glowTexture,color:0xffdc99,transparent:true,opacity:0,depthWrite:false,blending:T.AdditiveBlending});
  for(const [x,z] of [[0,13],[5,13],[10,13],[20,15],[24,15],[28,15],[-2,20],[-2,28],[-2,35],[22,35],[28,28],[9,23],[9,29],[9,35]]){
    box(garden,black,x,.03,z,.09,.8,.09);box(garden,glow,x,.44,z,.13,.035,.13);
    const halo=new T.Mesh(new T.PlaneGeometry(3,3),poolGlow);halo.rotation.x=-Math.PI/2;halo.position.set(x,-.325,z);garden.add(halo);
  }
  // Warm up/down wall wash on stone, consolidated into one draw call.
  // No extra live lights/shadow maps and no external image downloads.
  const washCanvas=document.createElement('canvas');washCanvas.width=64;washCanvas.height=128;
  const wc=washCanvas.getContext('2d');
  for(let y=0;y<128;y++){
    const t=y/127,width=3+28*t,alpha=(1-t)*.86,fade=wc.createLinearGradient(32-width,0,32+width,0);
    fade.addColorStop(0,'rgba(255,255,255,0)');fade.addColorStop(.22,`rgba(255,255,255,${alpha*.6})`);
    fade.addColorStop(.5,`rgba(255,255,255,${alpha})`);fade.addColorStop(.78,`rgba(255,255,255,${alpha*.6})`);fade.addColorStop(1,'rgba(255,255,255,0)');wc.fillStyle=fade;wc.fillRect(0,y,64,1);
  }
  const washTexture=new T.CanvasTexture(washCanvas);textures.add(washTexture);
  const facadeGlow=new T.MeshBasicMaterial({map:washTexture,color:0xffdca2,transparent:true,opacity:0,depthWrite:false,blending:T.AdditiveBlending});
  facadeGlow.color.multiplyScalar(2.2);
  const washPositions=[],washUV=[];group.updateMatrixWorld(true);
  for(const q of wallLights)for(const direction of [-1,1]){
    const length=direction>0?.97:1.43,geometry=new T.PlaneGeometry(.62,length).toNonIndexed();
    if(direction>0)geometry.rotateZ(Math.PI);
    geometry.translate(0,direction*(.21+length/2),-.087);geometry.applyMatrix4(q.matrixWorld);
    washPositions.push(...geometry.attributes.position.array);washUV.push(...geometry.attributes.uv.array);geometry.dispose();
  }
  const washGeometry=new T.BufferGeometry();washGeometry.setAttribute('position',new T.Float32BufferAttribute(washPositions,3));washGeometry.setAttribute('uv',new T.Float32BufferAttribute(washUV,2));
  const wallWash=new T.Mesh(washGeometry,facadeGlow);wallWash.name='Facade up-down wall wash';group.add(wallWash);
  const poolLight=material(0x94dded,.35,{emissive:0x35baff,emissiveIntensity:0});
  for(const z of [7.78,12.02])box(garden,glow,24,.43,z,6.9,.022,.026);
  for(const x of [20.63,27.37])box(garden,glow,x,.43,9.9,.026,.022,4.25);
  for(let i=0;i<5;i++)box(garden,poolLight,21.5+i*1.2,.13,11.68,.13,.13,.03);
  const poolNight=rooms[12]?.eau?.material;
  kit.batch(group);kit.batch(garden);
  // Lightweight cutaways for the exploded view; details appear on approach.
  const lodPale=material(0xe4ded2,.9),lodWood=A.oak.clone(),lodDark=material(0x343c3c,.85),lodGreen=material(0x66745a,.95),lodMetal=material(0x898272,.5,{metalness:.3});
  lodWood.color.setHex(0xc7b79d);
  for(const r of Object.values(rooms)){
    if(r.ext)continue;const lod=new T.Group();lod.name='Overview room '+r.id;
    r.group.updateMatrixWorld(true);const inverse=new T.Matrix4().copy(r.group.matrixWorld).invert();
    // Retain the actual furniture/window geometry, consolidating its many
    // materials into five shared finishes. No empty placeholder bedrooms.
    r.group.traverse(o=>{
      if(!o.isMesh||!o.visible||o.material.transparent)return;
      const src=o.material,c=src.color||new T.Color(0xffffff);
      const m=src.map===A.oak.map?lodWood:src.metalness>.5?lodMetal:c.g>c.r*1.12?lodGreen:c.r>.6&&c.g>.55?lodPale:c.r>.4&&c.g>.25?lodWood:lodDark;
      const clone=new T.Mesh(o.geometry,m);new T.Matrix4().multiplyMatrices(inverse,o.matrixWorld).decompose(clone.position,clone.quaternion,clone.scale);lod.add(clone);
    });
    kit.batch(lod);r.lod=lod;r.lodLabel=r.label.clone();lod.add(r.lodLabel);lod.position.copy(r.group.position);r.group.parent.add(lod);lod.visible=false;
  }
  const bounds=new T.Box3(new T.Vector3(-6.5,-3.8,-4.5),new T.Vector3(31.5,11.5,39.5));
  return {group,garden,bounds,get opacity(){return opacity;},
    setOpacity(v){opacity=Math.max(0,Math.min(1,v));group.visible=opacity>.001;facadeGlow.opacity=nightLevel*opacity;for(const m of facadeMaterials){const transparent=m.userData.baseTransparent||opacity<.999;if(m.transparent!==transparent){m.transparent=transparent;m.needsUpdate=true;}m.opacity=opacity*m.userData.baseOpacity;m.depthWrite=!transparent;}},
    setNight(night){nightLevel=night;glow.emissiveIntensity=night*3;F.glow.emissiveIntensity=night*3;poolLight.emissiveIntensity=night*4;poolGlow.opacity=night;facadeGlow.opacity=night*opacity;if(poolNight)poolNight.emissiveIntensity=.05+night*1.4;},
    lighting(){return {sconces:wallLights.length,washDrawCalls:1,intensity:facadeGlow.opacity};},
    dispose(){disposed=true;environment.dispose();textures.forEach(t=>t.dispose());geometries.forEach(g=>g.dispose());sphere.dispose();cylinder.dispose();washGeometry.dispose();facadeGlow.dispose();}
  };
}
