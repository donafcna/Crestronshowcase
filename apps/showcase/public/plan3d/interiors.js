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
    glass:mat(0xabc5ca,.18,{metalness:.15,transparent:true,opacity:.22,depthWrite:false,side:T.DoubleSide}), earth:mat(0x292c21,1),
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
  function bookcase(parent,x,z,width=1.5,height=2.35,rotation=0){
    const g=new T.Group();g.name='Library with books';g.position.set(x,0,z);g.rotation.y=rotation;parent.add(g);
    box(g,A.oak,0,height/2,-.15,width,height,.04);
    for(const side of [-1,1])box(g,A.oak,side*width/2,height/2,0,.055,height,.4);
    for(let i=0;i<5;i++){
      const y=.15+i*(height-.2)/4;box(g,A.oak,0,y,0,width,.045,.4);
      if(i<4){books(g,-width/2+.12,y+.03,.02,Math.floor((width-.25)/.09));cylinder(g,A.ceramic,width/2-.16,y+.12,.02,.09,.18,.055);}
    }
    return g;
  }
  function wallArt(parent,z,roomId,count=1){
    const schemes={4:['#ddd5bf','#a89570','#544b40'],5:['#dbe0cb','#446958','#a6b27d'],6:['#e3baa0','#ad684e','#234452'],9:['#d5e0e2','#466a7a','#b29361'],10:['#d8ced6','#78677e','#b19b87']};
    const colors=schemes[roomId]||['#dad0bd','#6c7f81','#9d7054'];
    for(let i=0;i<count;i++){
      const map=canvasTexture(256,(c,s)=>{c.fillStyle=colors[0];c.fillRect(0,0,s,s);for(let j=0;j<5;j++){c.fillStyle=colors[1+j%2];c.beginPath();if(roomId===5)c.ellipse(60+j*32,150,20,70,j*.6,0,7);else{c.moveTo(0,s);c.lineTo(40+j*38,50+((j+roomId+i)*31)%110);c.lineTo(s,s);}c.fill();}});
      const pz=z+(i-(count-1)/2)*.73;
      box(parent,A.brass,.185,1.86,pz,.04,.9,.59);box(parent,mat(0xffffff,1,{map}),.21,1.86,pz,.008,.84,.53);
    }
  }
  function personalize(R,parent,emit){
    const {w,d,type}=R.cfg,g=new T.Group();g.name='Room-specific design '+R.id;parent.add(g);
    R.decor={style:type,bookshelves:0};
    if(type==='salon'){
      R.decor.style='stone-fireplace-library';R.decor.bookshelves=1;
      bookcase(g,.4,d-.95,1.5,2.4,Math.PI/2);
      // A stone hearth on the west wall, separate from the TV wall and sofa.
      box(g,A.stone,.43,1.42,2.65,.56,2.84,1.9);box(g,A.charcoal,.73,.79,2.65,.045,.67,1.4);
      box(g,A.stone,.73,.34,2.65,.72,.14,2.04);box(g,A.black,.78,.73,2.65,.03,.5,1.25);
      const fire=mat(0x252221,1,{emissive:0xff6b12,emissiveIntensity:0});let flame;
      for(let i=0;i<7;i++){const z=2.14+i*.16;cylinder(g,A.oak,.8,.55,z,.045,.24).rotation.x=Math.PI/2;flame=ball(g,fire,.82,.65+(i%3)*.04,z,.018,.16,.035);flame.rotation.x=i*.4;}
      R.lamps.push({mesh:flame,mat:fire,circuit:1,litColor:new T.Color(0xffa638)});
      box(g,A.brass,.745,1.18,2.65,.025,.018,1.55);
      R.decor.fireplace={wall:'west',z:2.65};
      const lx=w*.55+1.85,lz=d*.62+.35;
      cylinder(g,A.black,lx,.03,lz,.22,.06);cylinder(g,A.brass,lx,.91,lz,.022,1.78);cylinder(g,A.cream,lx,1.77,lz,.28,.38,.19);ball(g,emit,lx,1.65,lz,.09);R.decor.floorLamp=true;
      plant(g,1.25,d-.45,.85);plant(g,w-1.4,.9,.7);
      box(g,A.oak,w-1.15,.4,d-1.7,1.1,.65,.5);books(g,w-1.55,.74,d-1.7,8);
    }else if(type==='cuisine'){
      R.decor.style='ceramic-pantry-and-copper';
      box(g,A.moss,.47,.43,3.6,.58,.86,3.75);box(g,A.stone,.5,.89,3.6,.7,.06,3.85);
      for(let i=0;i<5;i++)box(g,A.brass,.78,.63,2.1+i*.73,.025,.035,.27);
      for(let row=0;row<3;row++)for(let col=0;col<12;col++)box(g,(row+col)%3?A.white:A.moss,.167,1.06+row*.12,1.85+col*.3,.02,.11,.28);
      for(const y of [1.48,2.08]){
        box(g,A.oak,.36,y,3.6,.42,.055,3.65);
        for(let i=0;i<10;i++){const z=2+i*.32;if(y<2){cylinder(g,A.glass,.4,y+.14,z,.055,.22);cylinder(g,A.brass,.4,y+.025,z,.06,.012);}else{cylinder(g,i%3?A.moss:A.clay,.4,y+.17,z,.07,.28,.048);cylinder(g,A.brass,.4,y+.33,z,.022,.08);}}
      }
      for(let i=0;i<5;i++)cylinder(g,A.white,.52,.94+i*.015,4.7,.2,.012);
      for(const z of [2.4,2.75,3.1])cylinder(g,A.brass,.53,1.04,z,.045,.19,.04);
      plant(g,w-.75,d-1.25,.55);
    }else if(type==='repas'){
      R.decor.style='wine-gallery-and-sconces';R.decor.sconces=10;
      for(let i=0;i<5;i++){box(g,[A.brass,A.cream,A.clay][i%3],w*.24-1.5+i*.75,1.51,.185,.47,.65,.025);}
      plant(g,w-1.25,d-.75,1.1);
    }else if(type==='bureau'){
      R.decor.style='three-wall-libraries';R.decor.bookshelves=3;
      bookcase(g,3.25,.38,1.55,2.55);bookcase(g,w-1,.38,1.45,2.55);bookcase(g,.39,d-.65,1.0,2.45,Math.PI/2);
      box(g,A.oak,w-1.3,.45,d-.7,1.5,.75,.55);books(g,w-1.9,.84,d-.7,12);
    }else if(type==='chambre'||type==='suite'){
      const style={4:'suite-ivory-brass',5:'botanical-sage',6:'terracotta-studio',9:'alpine-traveller',10:'guest-lilac-linen'}[R.id];R.decor.style=style;
      const accent=R.id===5?A.moss:R.id===6?A.clay:R.id===9?A.ink:R.id===10?mat(0x88778e,1,{map:linen}):A.cream;
      // Distinct fabrics in each room; headboard/pillows stay aligned with the rotated bed.
      const bed=new T.Group();bed.position.set(w/2+d/2,0,d/2-w/2);bed.rotation.y=-Math.PI/2;g.add(bed);
      box(bed,accent,w/2,.64,d*.5+.56,R.cfg.type==='suite'?1.9:1.6,.045,.67);
      box(bed,accent,w/2,.78,d*.5-1.035,(R.cfg.type==='suite'?2:1.7)+.13,1.27,.18);
      wallArt(g,2.65,R.id,R.id===5||R.id===9?3:R.id===6?2:1);
      if(R.id===5){plant(g,1.05,1.05,.75);chair(g,w-1,1.5,.25);bookcase(g,w-1.1,.35,1.2,1.1);R.decor.bookshelves=1;}
      if(R.id===6){box(g,A.oak,.55,.75,1.2,.65,.055,1.1);for(const z of [.75,1.65])box(g,A.brass,.55,.37,z,.035,.74,.035);chair(g,1.35,1.2,Math.PI/2);for(const y of [1.35,1.85])box(g,A.oak,.36,y,1.35,.4,.04,1.0);}
      if(R.id===9){bookcase(g,w-1.1,.35,1.2,1.7);R.decor.bookshelves=1;chair(g,w-1.05,2.05,-.3);cylinder(g,A.brass,w-1.3,.54,1.55,.25,.035);plant(g,1.05,1.1,.65);}
      if(R.id===4){for(let i=0;i<9;i++)box(g,A.brass,.19,1.73,1.1+i*.11,.02,1.2,.022);plant(g,w-1.2,1.2,.95);cylinder(g,A.stone,w-1.1,.45,d-1.7,.35,.07);}
      if(R.id===10){box(g,A.oak,.48,.82,1.3,.58,.07,1.65);box(g,A.glass,.185,1.8,1.4,.015,1.2,.74);plant(g,w-1,1.4,.6);books(g,w-1.2,.44,d-.8,5);}
    }else if(type==='cinema')R.decor.style='acoustic-cinema';
    else if(type==='technique')R.decor.style='av-racks-and-distribution';
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
    const cornice=R.lamps.find(l=>l.circuit===2)?.mat||e1,strip=R.lamps.find(l=>l.circuit===4)?.mat||e1;
    if(type==='sauna'||type==='garage')return details;
    if(!R.ext){
      // Plinths and timber cornice give the cutaway a credible architectural thickness.
      box(details,A.oak,.164,.085,d/2,.025,.16,d-.12);
      box(details,A.oak,w/2,.085,.168,w-.15,.16,.025);
      box(details,A.oak,.16,2.94,d/2,.09,.12,d);
      box(details,A.oak,w/2,2.94,.16,w,.12,.09);
      if(type==='poolhouse')picture(details,d*.72);
      keypad(details,R.cfg.windowWall==='west'||['salon','cuisine'].includes(type)?.95:d*.35+.4);
      if(type!=='sauna'){
        plant(details,w-.52,d-.55,.85);
        // Recessed wall speaker, distinct from hi-fi columns and the soundbar.


        // Track with three adjustable downlights, warm indirect LED cornice.
        if(type!=='cinema'){
          const trackZ=d*.6;
          box(details,A.black,w*.6,2.88,trackZ,w*.5,.025,.045);
          for(let i=0;i<3;i++){const x=w*.4+i*w*.2;cylinder(details,A.black,x,2.79,trackZ,.065,.17);cylinder(details,e0,x,2.697,trackZ,.051,.008);}
        }
        box(details,cornice,.215,2.84,d/2,.012,.014,d-.35);
        // Details on the HVAC case and the existing live thermostat.
        if(R.hvac){
          for(let i=0;i<10;i++)box(details,A.charcoal,w-.75-.36+i*.08,2.405,.429,.045,.015,.005);
          const thermostatZ=R.cfg.windowWall==='west'||['salon','cuisine'].includes(type)?.55:d*.35;
          R.hvac.mesh.position.z=thermostatZ;
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
          const bedDetails=new T.Group();bedDetails.position.set(w/2+d/2,0,d/2-w/2);bedDetails.rotation.y=-Math.PI/2;details.add(bedDetails);
          const bw=type==='suite'?2:1.7,bz=d*.5;
          // Upholstered headboard, two pillows, folded throw and bedside pendants.
          box(bedDetails,A.moss,w/2,.75,bz-1.04,bw+.14,1.3,.16);
          for(const side of [-1,1]){
            cushion(bedDetails,A.cream,w/2+side*bw*.22,.72,bz-.69,bw*.43,.24,.55,side*.04);
            cushion(bedDetails,A.clay,w/2+side*bw*.18,.81,bz-.43,.39,.2,.32);
            tableLamp(bedDetails,w/2+side*(bw/2+.4),.51,bz-.8,e1);
            box(bedDetails,A.brass,w/2+side*(bw/2+.4),.36,bz-.543,.18,.013,.015);
          }
          box(bedDetails,A.clay,w/2,.611,bz+.57,bw-.07,.035,.65);
          for(let i=0;i<9;i++)box(bedDetails,A.cream,w/2-bw*.43+i*bw*.105,.63,bz+.86,.023,.012,.08);
          box(details,A.stone,w/2,.035,bz+.15,bw+1.4,.012,2.8);
          cylinder(details,A.clay,w-1,.28,d-1,.42,.5);
          contact(details,w/2,bz,bw+1.1,2.9);
        }
        if(type==='repas'){
          for(let i=0;i<12;i++){
            const x=w/2-2.3+(i%6)*.92,z=d/2+(i<6?-1.05:1.05);
            chair(details,x,z,i<6?Math.PI:0);
            cylinder(details,A.white,x,.805,d/2+(i<6?-.47:.47),.17,.012);
            cylinder(details,A.glass,x+.22,.88,d/2+(i<6?-.47:.47),.036,.16);
          }
          for(const x of [w/2-1.5,w/2+1.5])cylinder(details,A.ceramic,x,.97,d/2,.11,.35,.065);
          contact(details,w/2,d/2,6.8,3.2);
          box(details,A.oak,w*.24,.45,.45,4.2,.9,.55);box(details,A.stone,w*.24,.93,.45,4.3,.06,.6);
          for(let i=0;i<6;i++){const x=w*.24-1.75+i*.7;box(details,A.brass,x,.6,.74,.23,.018,.02);}
          for(let i=0;i<7;i++){const x=w*.76-1.4+i*.45;box(details,A.oak,x,1.4,.4,.05,2.6,.55);for(let j=0;j<5;j++)cylinder(details,A.moss,x, .5+j*.43,.43,.08,.3);}
          box(details,A.glass,w*.76,1.4,.72,3.3,2.6,.015);
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

          box(details,strip,w/2,.08,d-.3,w-.8,.028,.03);
        }
      } else {
        for(let i=0;i<28;i++)box(details,A.oak,.216,1.5,.2+i*(d-.4)/28,.035,2.8,.03);
        for(let i=0;i<8;i++)box(details,A.cream,w*.4,.53,.38+i*.062,.6,.015,.043);
        cylinder(details,A.oak,w*.3,.65,1.3,.16,.28,.2);
        for(let i=0;i<8;i++)ball(details,A.charcoal,w-.85+rand()*.3,.94+rand()*.05,d-.86+rand()*.3,.085,.065,.075);
        box(details,strip,w/2,.32,.3,w-.5,.025,.03);
        box(details,A.stone,w-1.6,.07,d-1.5,2.7,.1,2.6);
        box(details,A.stone,w-.45,1.25,d-1.5,.12,2.5,2.6);
        box(details,A.glass,w-2.9,1.2,d-1.5,.018,2.4,2.5);
        box(details,A.glass,w-1.6,1.2,d-.25,2.7,2.4,.018);
        box(details,A.stone,w-1.45,.4,d-.7,2.2,.65,.6);
        cylinder(details,A.brass,w-.55,2.25,d-1.5,.18,.025);
        for(const x of [w*.28,w*.48]){box(details,A.oak,x,.22,d-1.15,.75,.35,1.7);box(details,A.cream,x,.42,d-1.15,.7,.06,1.65);}

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
    if(!R.ext)personalize(R,details,e1);
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
