/* Shared architectural assets. No external requests, no per-object animation loop.
 * Static meshes are batched by material; only the selected room needs detailed light.
 */
import * as T from './vendor/three.module.min.js';

export function createInteriors(renderer, palette) {
  let disposed = false;
  const textures = new Set();
  const anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
  function canvasTexture(size, draw) {
    const c = document.createElement('canvas'); c.width = c.height = size;
    draw(c.getContext('2d'), size);
    const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace;
    t.wrapS = t.wrapT = T.RepeatWrapping; t.anisotropy = anisotropy;
    textures.add(t); return t;
  }
  let seed = 6731;
  function rand() { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; }
  const linen = canvasTexture(256, (g, s) => {
    g.fillStyle = '#d6cfc1'; g.fillRect(0, 0, s, s);
    for (let i = 0; i < s; i += 2) {
      g.fillStyle = `rgba(65,48,32,${0.03 + rand() * 0.1})`; g.fillRect(i, 0, 1, s); g.fillRect(0, i, s, 1);
    }
  });
  const stone = canvasTexture(512, (g, s) => {
    g.fillStyle = '#dfd6c7'; g.fillRect(0, 0, s, s);
    for (let i = 0; i < 8000; i++) { const v = 140 + rand() * 85; g.fillStyle = `rgba(${v},${v-8},${v-20},.16)`; g.fillRect(rand()*s, rand()*s, rand()*7+1, 1); }
    for (let i = 0; i < 14; i++) { g.beginPath(); g.strokeStyle = 'rgba(103,87,69,.09)'; g.lineWidth = 0.8 + rand()*2; const y=rand()*s;g.moveTo(0,y);g.bezierCurveTo(s*.3,y-24,s*.6,y+20,s,y-12);g.stroke(); }
  });
  const grille = canvasTexture(128, (g,s) => {
    g.fillStyle='#292c2e';g.fillRect(0,0,s,s);g.fillStyle='#0f1113';
    for(let y=0;y<s;y+=5)for(let x=0;x<s;x+=5){g.beginPath();g.arc(x+(y%2)*2, y, 1.2, 0, Math.PI*2);g.fill();}
  });
  const art = canvasTexture(512, (g,s) => {
    g.fillStyle='#e4dfd3';g.fillRect(0,0,s,s);
    ['#b6ada0','#87958b','#394e4d','#bd8765'].forEach((c,i)=>{g.fillStyle=c;g.beginPath();g.ellipse(120+i*82,260+i*12,120,180-i*25,i*.8,0,Math.PI*2);g.fill();});
    g.strokeStyle='#ede8df';g.lineWidth=2;for(let i=0;i<9;i++){g.beginPath();g.moveTo(55,110+i*31);g.bezierCurveTo(130,40,320,510,450,120+i*22);g.stroke();}
  });
  const shadow = canvasTexture(128, (g,s)=>{const q=g.createRadialGradient(s/2,s/2,8,s/2,s/2,s/2);q.addColorStop(0,'rgba(0,0,0,.37)');q.addColorStop(.6,'rgba(0,0,0,.16)');q.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=q;g.fillRect(0,0,s,s);});
  const mat=(color,roughness=.75,extra={})=>new T.MeshStandardMaterial({color,roughness,...extra});
  const A = {
    oak: mat(0xd6b990), stone: mat(0xffffff,.6,{map:stone}), cream: mat(0xffffff,1,{map:linen}),
    moss: mat(0x637164,1,{map:linen}), clay: mat(0xa5745c,1,{map:linen}), charcoal: mat(0x202728,.86),
    brass: mat(0x9d8052,.32,{metalness:.75}), black:mat(0x101719,.45,{metalness:.3}),
    ceramic: mat(0xcac6b9,.28), white:mat(0xf0eee7,.42), leaf:mat(0x385943,.95),
    grill:mat(0xdddddd,.9,{map:grille}), art:mat(0xffffff,.9,{map:art}),
    glass:mat(0xabc5ca,.18,{metalness:.25}), earth:mat(0x292c21,1),
    paper:mat(0xe8e3d9,.9), ink:mat(0x32474a,.8)
  };
  const loader = new T.TextureLoader();
  function load(name, color) {
    const t = loader.load(new URL(`./textures/oak-${name}.webp`, import.meta.url).href, t => { if(disposed)t.dispose(); });
    t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(2,2);t.anisotropy=anisotropy;
    if(color)t.colorSpace=T.SRGBColorSpace;textures.add(t);return t;
  }
  A.oak.map=load('color',true); A.oak.normalMap=load('normal'); A.oak.normalScale=new T.Vector2(.22,.22);A.oak.roughnessMap=load('roughness');A.oak.color.setHex(0xffffff);
  for (const k of ['sol','solChambre','bois','boisClair']) { palette[k].map=A.oak.map;palette[k].normalMap=A.oak.normalMap;palette[k].normalScale=new T.Vector2(.13,.13);palette[k].roughnessMap=A.oak.roughnessMap;palette[k].color.setHex(k==='bois'?0xb1a08d:0xf3e5cd); }
  for(const k of ['tissu','tissuFonce','lit','coussin','tapis']){palette[k].map=linen;palette[k].roughness=1;}
  palette.mur.color.setHex(0xe8e3d9);palette.solExt.map=stone;palette.metal.roughness=.4;

  const unitBox=new T.BoxGeometry(1,1,1), sphere=new T.SphereGeometry(1,16,10), softGeometry=new Map();
  function rounded(w,h,d){
    const key=[w,h,d].join('/');if(softGeometry.has(key))return softGeometry.get(key);
    const r=Math.min(.055,w*.12,h*.2,d*.12),x=w/2-r,y=h/2-r,s=new T.Shape();
    s.moveTo(-x,-y);s.lineTo(x,-y);s.lineTo(x,y);s.lineTo(-x,y);s.closePath();
    const geo=new T.ExtrudeGeometry(s,{depth:Math.max(.01,d-2*r),bevelEnabled:true,bevelThickness:r,bevelSize:r,bevelSegments:3,steps:1});geo.center();
    softGeometry.set(key,geo);return geo;
  }
  function mesh(g,geo,m,x,y,z,sx=1,sy=1,sz=1){const o=new T.Mesh(geo,m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.castShadow=true;o.receiveShadow=true;g.add(o);return o;}
  const box=(g,m,x,y,z,w,h,d)=>mesh(g,unitBox,m,x,y,z,w,h,d);
  function cylinder(g,m,x,y,z,r,h,top=r){return mesh(g,new T.CylinderGeometry(top,r,h,16),m,x,y,z);}
  function ball(g,m,x,y,z,xs,ys=xs,zs=xs){return mesh(g,sphere,m,x,y,z,xs,ys,zs);}
  function cushion(g,m,x,y,z,w,h,d,angle=0){
    const o=ball(g,m,x,y,z,w/2,h/2,d/2);o.rotation.z=angle;return o;
  }
  function contact(g,x,z,w,d){const o=new T.Mesh(new T.PlaneGeometry(w,d),new T.MeshBasicMaterial({map:shadow,transparent:true,depthWrite:false,opacity:.8}));o.rotation.x=-Math.PI/2;o.position.set(x,.037,z);g.add(o);}
  function plant(g,x,z,size=1){
    cylinder(g,A.ceramic,x,.23*size,z,.23*size,.46*size,.29*size);cylinder(g,A.earth,x,.465*size,z,.245*size,.015);
    for(let i=0;i<8;i++){const a=i*2.399,r=.2+rand()*.18;const o=ball(g,A.leaf,x+Math.cos(a)*r*size,(.8+rand()*.45)*size,z+Math.sin(a)*r*size,.09*size,.34*size,.05*size);o.rotation.set(Math.cos(a)*.5,a,Math.sin(a)*.65);}
    cylinder(g,A.oak,x,.78*size,z,.018*size,.75*size);contact(g,x,z,size,size);
  }
  function books(g,x,y,z,n=5){for(let i=0;i<n;i++){const h=.17+(i%3)*.04;box(g,[A.ink,A.clay,A.paper][i%3],x+i*.065,y+h/2,z,.052,h,.15);}}
  function picture(g,z,w=.85,h=1.1){box(g,A.oak,.174,1.85,z,.045,h+.07,w+.07);box(g,A.art,.2,1.85,z,.008,h,w);}
  function tableLamp(g,x,y,z,emit){cylinder(g,A.brass,x,y+.015,z,.13,.03);cylinder(g,A.brass,x,y+.2,z,.018,.4);cylinder(g,A.cream,x,y+.43,z,.19,.22,.12);ball(g,emit,x,y+.38,z,.07);}
  function chair(g,x,z,rot=0){const c=new T.Group();c.position.set(x,0,z);c.rotation.y=rot;g.add(c);box(c,A.moss,0,.47,0,.46,.13,.48);cushion(c,A.moss,0,.75,.2,.48,.55,.15);for(const dx of [-.17,.17])for(const dz of [-.16,.16])box(c,A.oak,dx,.22,dz,.035,.44,.035);}
  function keypad(g,z){
    box(g,A.brass,.184,1.25,z,.025,.25,.16);box(g,A.charcoal,.202,1.25,z,.018,.235,.145);
    const map=canvasTexture(256,(c,s)=>{c.fillStyle='#343a39';c.fillRect(0,0,s,s);c.font='21px Arial';c.textAlign='center';['ACCUEIL','AMBIANCE','LECTURE','ÉTEINDRE'].forEach((v,i)=>{c.fillStyle='#48504d';c.fillRect(12,8+i*61,232,52);c.fillStyle='#e8e3d6';c.fillText(v,128,42+i*61);c.fillStyle=i===1?'#c5dfaf':'#74806c';c.fillRect(218,27+i*61,12,4);});});
    const face=new T.Mesh(new T.PlaneGeometry(.137,.224),new T.MeshStandardMaterial({map,roughness:.6}));face.rotation.y=Math.PI/2;face.position.set(.214,1.25,z);g.add(face);
  }
  function decorate(R){
    const {w,d,type}=R.cfg,g=R.group; const details=new T.Group();details.name='Architectural details';g.add(details);
    for(const o of [...g.children]){
      if(!o.isMesh||o.geometry.type!=='BoxGeometry')continue;
      const p=o.geometry.parameters;
      if(type==='cinema'&&p.width===.8&&p.height===.9){o.scale.y=.5;o.position.y-=.225;}
      if(type==='bureau'&&p.width===.5&&p.height===.95){o.removeFromParent();continue;}
      if([palette.tissu,palette.tissuFonce,palette.lit,palette.coussin].includes(o.material)&&p.height>.1){const old=o.geometry;o.geometry=rounded(p.width,p.height,p.depth);old.dispose();}
    }
    const e0=R.lamps.find(l=>!l.sousMarin)?.mat || A.white;
    const e1=R.lamps.filter(l=>!l.sousMarin)[1]?.mat || e0;
    if(!R.ext){
      // Plinths and timber cornice give the cutaway a credible architectural thickness.
      box(details,A.oak,.164,.085,d/2,.025,.16,d-.12);
      box(details,A.oak,w/2,.085,.168,w-.15,.16,.025);
      box(details,A.oak,.16,2.94,d/2,.09,.12,d);
      box(details,A.oak,w/2,2.94,.16,w,.12,.09);
      if(type!=='cinema')picture(details,d*.72);
      keypad(details,type==='cinema'?d-.8:d*.35+.4);
      if(type!=='sauna'){
        plant(details,w-.52,d-.55,.85);
        // Recessed wall speaker, distinct from hi-fi columns and the soundbar.
        const wallSpeakerZ=type==='cinema'?.6:d*.3;
        box(details,A.white,.17,2.25,wallSpeakerZ,.05,.42,.28);box(details,A.grill,.2,2.25,wallSpeakerZ,.01,.37,.23);
        // Track with three adjustable downlights, warm indirect LED cornice.
        if(type!=='cinema'){
          const trackZ=d*.6;
          box(details,A.black,w*.6,2.88,trackZ,w*.5,.025,.045);
          for(let i=0;i<3;i++){const x=w*.4+i*w*.2;cylinder(details,A.black,x,2.79,trackZ,.065,.17);cylinder(details,e0,x,2.697,trackZ,.051,.008);}
        }
        box(details,e1,.215,2.84,d/2,.012,.014,d-.35);
        // Details on the HVAC case and the existing live thermostat.
        if(R.hvac){
          for(let i=0;i<10;i++)box(details,A.charcoal,w-.75-.36+i*.08,2.405,.429,.045,.015,.005);
          const thermostatZ=type==='cinema'?d-.4:d*.35;
          if(type==='cinema')R.hvac.mesh.position.z=thermostatZ;
          box(details,A.brass,.167,1.45,thermostatZ,.022,.35,.35);
          box(details,A.black,.208,1.255,thermostatZ,.018,.019,.08);
          for(const dz of [-.055,.055])ball(details,A.white,.219,1.26,thermostatZ+dz,.006);
        }
        // Upholstered surfaces get soft cushions; no expensive cloth simulation.
        if(type==='salon'||type==='poolhouse'){
          const cx=type==='salon'?w*.55:w*.6,cz=type==='salon'?d*.62:d-1;
          for(let i=-1;i<=1;i++)cushion(details,A.cream,cx+i*.72,.49,cz,.69,.18,.75);
          for(const i of [-1,1])cushion(details,i<0?A.moss:A.clay,cx+i*.95,.74,cz+.1,.46,.48,.18,i*.12);
          cylinder(details,A.stone,cx+.67,.37,cz-1.16,.47,.055);cylinder(details,A.brass,cx+.67,.19,cz-1.16,.19,.34);
          books(details,cx-.28,.355,cz-1.55,4);
          cylinder(details,A.ceramic,cx+.66,.49,cz-1.16,.08,.19,.045);
          tableLamp(details,w-.8,.38,d*.6,e1);cylinder(details,A.oak,w-.8,.19,d*.6,.3,.38);
          contact(details,cx,cz,3.6,1.9);
          // Slatted media panel to the right of the window, with a floating cabinet.
          for(let i=0;i<18;i++)box(details,A.oak,w*.54+i*.12,1.43,.173,.07,2.55,.025);
        }
        if(type==='chambre'||type==='suite'){
          const bw=type==='suite'?2:1.7,bz=d*.5;
          // Upholstered headboard, two pillows, folded throw and bedside pendants.
          box(details,A.moss,w/2,.75,bz-1.04,bw+.14,1.3,.16);
          for(const side of [-1,1]){
            cushion(details,A.cream,w/2+side*bw*.22,.72,bz-.69,bw*.43,.24,.55,side*.04);
            cushion(details,A.clay,w/2+side*bw*.18,.81,bz-.43,.39,.2,.32);
            tableLamp(details,w/2+side*(bw/2+.4),.51,bz-.8,e1);
            box(details,A.brass,w/2+side*(bw/2+.4),.36,bz-.543,.18,.013,.015);
          }
          box(details,A.clay,w/2,.611,bz+.57,bw-.07,.035,.65);
          for(let i=0;i<9;i++)box(details,A.cream,w/2-bw*.43+i*bw*.105,.63,bz+.86,.023,.012,.08);
          box(details,A.stone,w/2,.035,bz+.15,bw+1.4,.012,2.8);
          cylinder(details,A.clay,w-1,.28,d-1,.42,.5);
          for(let i=0;i<3;i++){box(details,A.oak,.8,.5+i*.56,d-1.31,1.55,.023,.02);}
          contact(details,w/2,bz,bw+1.1,2.9);
        }
        if(type==='repas'){
          // Replace the original solid chair blocks with legged chairs.
          for(const o of [...g.children])if(o.isMesh&&o.geometry.parameters?.width===.42&&o.geometry.parameters?.height===.9)g.remove(o);
          for(let i=0;i<6;i++)chair(details,w/2-.85+(i%3)*.85,d/2+(i<3?-.85:.85),i<3?Math.PI:0);
          for(let i=0;i<6;i++){const x=w/2-.8+(i%3)*.8,z=d/2+(i<3?-.32:.32);cylinder(details,A.white,x,.805,z,.15,.012);cylinder(details,A.glass,x+.22,.88,z,.036,.16);box(details,A.brass,x-.2,.804,z,.016,.009,.22);}
          cylinder(details,A.ceramic,w/2,.97,d/2,.11,.35,.065);contact(details,w/2,d/2,3.2,2.8);
        }
        if(type==='cuisine'||type==='poolhouse'){
          const z=type==='cuisine'?d*.55:.75,y=type==='cuisine'?.97:1.07;
          box(details,A.stone,w/2,y,z,2.5,.045,1.08);
          for(let i=0;i<4;i++){box(details,A.oak,w/2-1+i*.66,.48,z+.509,.625,.84,.025);box(details,A.brass,w/2-1+i*.66,.79,z+.534,.23,.016,.015);}
          box(details,A.black,w/2+.5,y+.025,z,.63,.018,.55);
          for(let i=0;i<2;i++)cylinder(details,A.grill,w/2+.34+i*.3,y+.038,z,.115,.003);
          cylinder(details,A.black,w/2-.72,y+.09,z-.2,.035,.24);box(details,A.brass,w/2-.72,y+.24,z-.14,.024,.023,.19);
          cylinder(details,A.ceramic,w/2-.4,y+.035,z+.2,.18,.05);for(let i=0;i<3;i++)ball(details,A.clay,w/2-.51+i*.11,y+.1,z+.2,.065);
          books(details,.9,.96,.5,3);
        }
        if(type==='bureau'){
          for(let sh=0;sh<4;sh++)books(details,w-1.25,.53+sh*.5,.53,10);
          box(details,A.charcoal,w/2,.787,1.3,.55,.018,.18);
          for(let i=0;i<11;i++)box(details,A.paper,w/2-.24+i*.046,.799,1.3,.035,.005,.1);
          cylinder(details,A.white,w/2+.63,.83,1.25,.045,.1);tableLamp(details,w/2-.65,.78,.9,e1);
          chair(details,w/2,2);contact(details,w/2,1.25,2.4,1.5);
        }
        if(type==='cinema'){
          for(let row=0;row<2;row++)for(let c=0;c<3;c++){
            const x=w/2-1+c,z=d*.45+row*1.2,y=row*.15;
            cushion(details,A.charcoal,x,.53+y,z,.66,.24,.74);
            cushion(details,A.charcoal,x,.88+y,z+.35,.67,.63,.19);
            for(const s of [-1,1]){box(details,A.black,x+s*.38,.55+y,z,.1,.31,.83);cylinder(details,A.brass,x+s*.38,.71+y,z-.25,.041,.008);}
          }
          for(const x of [.55,1.05,w-1.05,w-.55])box(details,A.charcoal,x,1.55,.185,.38,1.8,.09);
          for(const z of [.6,d-.5]){box(details,A.black,.24,1.9,z,.16,.4,.27);box(details,A.grill,.329,1.9,z,.01,.35,.21);}
          box(details,e1,w/2,.08,d-.3,w-.8,.028,.03);
        }
      } else {
        for(let i=0;i<28;i++)box(details,A.oak,.216,1.5,.2+i*(d-.4)/28,.035,2.8,.03);
        for(let i=0;i<8;i++)box(details,A.cream,w*.4,.53,.38+i*.062,.6,.015,.043);
        cylinder(details,A.oak,w*.3,.65,1.3,.16,.28,.2);
        for(let i=0;i<8;i++)ball(details,A.charcoal,w-.85+rand()*.3,.94+rand()*.05,d-.86+rand()*.3,.085,.065,.075);
        box(details,e1,w/2,.32,.3,w-.5,.025,.03);
      }
    } else {
      // Terracotta planters, teak decking and soft upholstery outside.
      for(let i=0;i<Math.floor(d/.2);i++)box(details,A.oak,w/2,.036,.1+i*.2,w-.2,.018,.184);
      if(type==='piscine'){
        // Keep decking outside the basin, never across the water.
        details.clear();
        for(const side of [-1,1])box(details,A.stone,w*.5+side*(w*.35+.18),.13,d*.5,.35,.14,d*.55+.5);
        for(let i=0;i<3;i++){box(details,A.cream,.7,.365,.9+i*1.6,.57,.04,1.62);cushion(details,A.moss,.7,.44,.35+i*1.6,.51,.14,.39);}
        const ladder=new T.TorusGeometry(.22,.024,6,14,Math.PI);for(const x of [w*.6,w*.6+.45]){const m=mesh(details,ladder,A.brass,x,.3,d*.78);m.rotation.y=Math.PI/2;}
      }else{
        for(let i=0;i<2;i++)box(details,A.cream,w*.35+i,.445,d*.5,.66,.06,1.82);
        cylinder(details,A.stone,w*.65,.45,d*.65,.35,.045);cylinder(details,A.brass,w*.65,.22,d*.65,.04,.44);
        box(details,A.grill,w-.4,1.75,.56,.25,.42,.2);
      }
      plant(details,w-.65,d-.7,1.1);
    }
    return details;
  }
  function curtains(R){
    if(!R.shades?.rideau)return;
    R.shades.rideau.meshes.forEach((o,i)=>{
      const {width:w,height:h}=o.geometry.parameters;
      const geo=new T.PlaneGeometry(w,h,48,10),p=geo.attributes.position;
      for(let j=0;j<p.count;j++){const u=(p.getX(j)+w/2)/w,v=(p.getY(j)+h/2)/h;p.setXYZ(j,p.getX(j)+(i===0?w/2:-w/2),p.getY(j)-.018*Math.sin(u*Math.PI*12)*(1-v),.055*Math.cos(u*Math.PI*12)+.012*Math.sin(v*7));}
      geo.computeVertexNormals();o.geometry.dispose();o.geometry=geo;o.material.map=linen;o.material.color.setHex(R.id%2?0xc0b5a4:0x889790);o.material.side=T.DoubleSide;
    });
  }
  function batch(group,protectedMeshes=new Set()){
    const buckets=new Map();
    group.traverse(o=>{if(!o.isMesh||o.isInstancedMesh||o.material.transparent||Array.isArray(o.material)||protectedMeshes.has(o)||o.userData.animated)return;const list=buckets.get(o.material)||[];list.push(o);buckets.set(o.material,list);});
    group.updateMatrixWorld(true);const inv=new T.Matrix4().copy(group.matrixWorld).invert();
    for(const [material,objects] of buckets){
      if(objects.length<2)continue;
      const attributes={position:[],normal:[],uv:[]},lengths={position:0,normal:0,uv:0};
      for(const o of objects){const q=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();q.applyMatrix4(new T.Matrix4().multiplyMatrices(inv,o.matrixWorld));for(const key of Object.keys(attributes)){const a=q.getAttribute(key);const arr=a?a.array:new Float32Array(q.attributes.position.count*(key==='uv'?2:3));attributes[key].push(arr);lengths[key]+=arr.length;}q.dispose();}
      const geo=new T.BufferGeometry();for(const key of Object.keys(attributes)){const arr=new Float32Array(lengths[key]);let n=0;for(const a of attributes[key]){arr.set(a,n);n+=a.length;}geo.setAttribute(key,new T.BufferAttribute(arr,key==='uv'?2:3));}
      const m=new T.Mesh(geo,material);m.castShadow=!material.emissive?.getHex();m.receiveShadow=true;group.add(m);for(const o of objects)o.removeFromParent();
    }
  }
  function dispose(){disposed=true;textures.forEach(t=>t.dispose());Object.values(A).forEach(m=>m.dispose());unitBox.dispose();sphere.dispose();softGeometry.forEach(g=>g.dispose());}
  return {decorate,curtains,batch,dispose,materials:A,random:rand};
}
