import * as T from './vendor/three.module.min.js';

/* Enveloppe « résidence de montagne » : socle hôtelier de cinq niveaux (rez-de-chaussée vitré avec auvent,
 * quatre étages béton + bois avec balcons côté vallée), puis le duplex des deux derniers niveaux : baies vitrées
 * sud/est, façades nord/ouest en béton habillé de chêne vieilli, balcons sur trois côtés avec garde-corps vitrés et
 * séparations bois, toiture deux pans en charpente bois couverte de pierres naturelles.
 * Même API que createEstate : bounds, opacity, setOpacity, setNight, lighting, dispose (+ focusY, shadow).
 * Le groupe `group` (duplex + toiture) s'efface au zoom ; `garden` (socle + parvis) reste visible comme contexte.
 * Géométrie déterministe, matériaux regroupés, aucune ressource distante (textures locales oak/stone). */
export function createResidence(scene, rooms, kit, renderer, options) {
  options=options||{};
  const group=new T.Group(),garden=new T.Group();group.name='Mountain residence duplex';garden.name='Hotel base and forecourt';scene.add(group,garden);
  let opacity=1,disposed=false,nightLevel=0;
  const A=kit.materials,rand=kit.random,facadeMaterials=new Set(),textures=new Set(),geometries=new Map();
  const material=(color,roughness=.65,extra={})=>new T.MeshStandardMaterial({color,roughness,...extra});
  const loader=new T.TextureLoader();
  function load(name,color){const t=loader.load(new URL('./textures/stone-'+name+'.webp',import.meta.url).href,t=>{if(disposed)t.dispose();else renderer.shadowMap.needsUpdate=true;});t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=4;if(color)t.colorSpace=T.SRGBColorSpace;textures.add(t);return t;}
  // Emprise du duplex (murs à 0,5 m autour des pièces) et niveaux.
  const list=Object.values(rooms),H=3.6,BASE=options.base??18,HOTEL_LEVELS=5;
  const minX=Math.min(...list.map(r=>r.cfg.x)),maxX=Math.max(...list.map(r=>r.cfg.x+r.cfg.w)),minZ=Math.min(...list.map(r=>r.cfg.z)),maxZ=Math.max(...list.map(r=>r.cfg.z+r.cfg.d));
  const X0=minX-.5,X1=maxX+.5,Z0=minZ-.5,Z1=maxZ+.5,W=X1-X0,D=Z1-Z0,CX=(X0+X1)/2,CZ=(Z0+Z1)/2;
  const terrace=list.find(r=>r.ext);
  /* ---------- Matériaux ---------- */
  const concrete=material(0xb7b3aa,.93),concreteDark=material(0x8e8b84,.95),plinth=material(0x6f6d68,.95);
  // La texture de chêne est sombre (moyenne sRGB 128/96/66) : les multiplicateurs > 1 la ramènent à un chêne vieilli gris-brun.
  const oak=A.oak.clone();oak.color.setRGB(1.15,1.4,1.8);            // chêne vieilli
  const oakLight=A.oak.clone();oakLight.color.setRGB(1.5,1.8,2.2);   // séparations, sous-face, platelage
  const timber=material(0x5f4d3b,.85);                           // charpente
  const bronze=material(0x6f5e46,.32,{metalness:.75}),black=material(0x24292b,.42,{metalness:.45}),white=material(0xe6e0d4,.82);
  const stoneRoof=material(0xffffff,.95,{map:load('color',true),normalMap:load('normal'),roughnessMap:load('roughness'),normalScale:new T.Vector2(.5,.5)});
  stoneRoof.color.setRGB(.85,1.0,1.45);   // neutralise le beige du grès : lauzes gris clair
  for(const t of [stoneRoof.map,stoneRoof.normalMap,stoneRoof.roughnessMap])t.repeat.set(2.5,2.5);
  const paving=A.stone.clone();paving.color.setHex(0xcfc8b8);
  const grass=material(0x4d6a3a,1),leaf=material(0x314c35,.95),leafLight=material(0x5b7041,.95),soil=material(0x393c2e,1);
  const glow=material(0xffe1a4,.6,{emissive:0xffc77c,emissiveIntensity:0});
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=256;const ctx=canvas.getContext('2d');
  const gradient=ctx.createLinearGradient(0,0,0,256);gradient.addColorStop(0,'#749bb5');gradient.addColorStop(.45,'#dde7df');gradient.addColorStop(.51,'#b6bca3');gradient.addColorStop(1,'#36443e');ctx.fillStyle=gradient;ctx.fillRect(0,0,512,256);
  ctx.fillStyle='#fff3cc';ctx.fillRect(95,45,35,40);ctx.fillStyle='#657765';for(let i=0;i<9;i++)ctx.fillRect(i*70,128,20,30);
  const envTexture=new T.CanvasTexture(canvas);envTexture.colorSpace=T.SRGBColorSpace;envTexture.mapping=T.EquirectangularReflectionMapping;
  const pmrem=new T.PMREMGenerator(renderer),environment=pmrem.fromEquirectangular(envTexture);pmrem.dispose();envTexture.dispose();
  const glassCanvas=document.createElement('canvas');glassCanvas.width=256;glassCanvas.height=512;const gg=glassCanvas.getContext('2d');
  const reflection=gg.createLinearGradient(0,0,0,512);reflection.addColorStop(0,'#516774');reflection.addColorStop(.34,'#9faeae');reflection.addColorStop(.48,'#526969');reflection.addColorStop(1,'#333f3a');gg.fillStyle=reflection;gg.fillRect(0,0,256,512);
  gg.fillStyle='rgba(226,212,176,.19)';gg.fillRect(12,22,44,475);gg.fillRect(217,22,28,475);
  for(let i=0;i<6;i++){gg.fillStyle='rgba(255,255,240,.035)';gg.fillRect(14+i*6,24,2,470);}
  const glazingTexture=new T.CanvasTexture(glassCanvas);glazingTexture.colorSpace=T.SRGBColorSpace;textures.add(glazingTexture);
  const glassBase=material(0xb9c6c6,.19,{map:glazingTexture,metalness:.28,envMap:environment.texture,envMapIntensity:1.25,emissive:0xffd9a0,emissiveIntensity:0});
  const hotelGlass=glassBase.clone(),hotelGlassLit=glassBase.clone(),lobbyGlass=glassBase.clone();
  const railBase=material(0xc1d7da,.15,{transparent:true,opacity:.32,depthWrite:false,metalness:.15,envMap:environment.texture,envMapIntensity:.55,side:T.DoubleSide});
  function facade(m){const clone=m.clone();clone.userData.baseOpacity=m.opacity;clone.userData.baseTransparent=m.transparent;facadeMaterials.add(clone);return clone;}
  const F={concrete:facade(concrete),concreteDark:facade(concreteDark),wood:facade(oak),woodLight:facade(oakLight),timber:facade(timber),metal:facade(black),bronze:facade(bronze),white:facade(white),roof:facade(stoneRoof),glass:facade(glassBase),glow:facade(glow),rail:facade(railBase)};
  /* ---------- Primitives ---------- */
  function boxGeo(w,h,d){const key=[w,h,d].join('/');if(geometries.has(key))return geometries.get(key);const g=new T.BoxGeometry(w,h,d),p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i);uv.setXY(i,(Math.abs(n.getX(i))>.5?z:x)/3,(Math.abs(n.getY(i))>.5?z:y)/3);}geometries.set(key,g);return g;}
  const sphere=new T.IcosahedronGeometry(1,2),cylinder=new T.CylinderGeometry(1,1,1,12);
  function mesh(parent,m,geo,x,y,z,sx=1,sy=1,sz=1){const o=new T.Mesh(geo,m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
  const isGlass=m=>m===F.glass||m===hotelGlass||m===hotelGlassLit||m===lobbyGlass;
  const box=(p,m,x,y,z,w,h,d)=>mesh(p,m,isGlass(m)?new T.BoxGeometry(w,h,d):boxGeo(w,h,d),x,y,z);
  const ball=(p,m,x,y,z,r,ry=r,rz=r)=>mesh(p,m,sphere,x,y,z,r,ry,rz);
  const cyl=(p,m,x,y,z,r,h)=>mesh(p,m,cylinder,x,y,z,r,h,r);
  // Les vitrages de garde-corps (transparents) sont fusionnés en un seul maillage par groupe.
  const railPanes={group:[],garden:[]};
  function railPane(parent,x,y,z,w,h,d){(parent===group?railPanes.group:railPanes.garden).push(new T.Matrix4().compose(new T.Vector3(x,y,z),new T.Quaternion(),new T.Vector3(w,h,d)));}
  function mergeRails(parent,matrices,m){
    if(!matrices.length)return null;
    const unit=new T.BoxGeometry(1,1,1).toNonIndexed(),pos=[],nor=[];
    for(const mat of matrices){const g=unit.clone().applyMatrix4(mat);pos.push(...g.attributes.position.array);nor.push(...g.attributes.normal.array);g.dispose();}
    unit.dispose();const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setAttribute('normal',new T.Float32BufferAttribute(nor,3));
    const o=new T.Mesh(geo,m);o.name='Glass balustrades';o.receiveShadow=true;parent.add(o);geometries.set('rails-'+parent.name,geo);return o;
  }
  const wallLights=[],baseLights=[];
  function sconce(parent,x,y,z,rotation=0){
    const q=new T.Group();q.position.set(x,y,z);q.rotation.y=rotation;parent.add(q);(parent===group?wallLights:baseLights).push(q);
    box(q,F.bronze,0,0,-.052,.22,.44,.06);box(q,F.metal,0,0,0,.19,.4,.16);
    for(const side of [-1,1])box(q,F.glow,0,side*.205,.005,.14,.018,.1);
  }
  // Repère d'une façade : origine au début du côté, axe u le long du mur, +n vers l'extérieur.
  const SIDE={S:{origin:[X0,Z1],u:[1,0],n:[0,1],length:W},E:{origin:[X1,Z0],u:[0,1],n:[1,0],length:D},N:{origin:[X0,Z0],u:[1,0],n:[0,-1],length:W},W:{origin:[X0,Z0],u:[0,1],n:[-1,0],length:D}};
  function place(side,u,n){const s=SIDE[side];return [s.origin[0]+s.u[0]*u+s.n[0]*n,s.origin[1]+s.u[1]*u+s.n[1]*n];}
  // Boîte alignée sur une façade : u = position le long du mur, n = décalage vers l'extérieur (centre), lu/ln = dimensions.
  function fbox(parent,m,side,u,y,n,lu,h,ln){const s=SIDE[side],[x,z]=place(side,u,n);const along=Math.abs(s.u[0])>.5;return box(parent,m,x,y,z,along?lu:ln,h,along?ln:lu);}
  function frot(side){const s=SIDE[side];return Math.atan2(s.n[0],s.n[1]);}
  /* ---------- Éléments de façade ---------- */
  function balcony(parent,side,y,from,to,separators){
    const depth=1.75,len=to-from,mid=(from+to)/2;
    fbox(parent,F.concrete,side,mid,y-.12,depth/2,len,.24,depth);
    fbox(parent,F.woodLight,side,mid,y-.02,depth/2,len-.1,.04,depth-.25);   // platelage
    const [rx,rz]=place(side,mid,depth-.03),s=SIDE[side],along=Math.abs(s.u[0])>.5;
    railPane(parent,rx,y+.53,rz,along?len:.025,1.02,along?.025:len);
    fbox(parent,F.bronze,side,mid,y+1.06,depth-.03,len,.035,.05);
    for(let u=from+.02;u<=to;u+=1.7)fbox(parent,F.metal,side,Math.min(u,to-.02),y+.1,depth-.03,.045,.2,.085);
    for(const u of separators)fbox(parent,F.wood,side,u,y+1,depth/2-.1,.07,2,depth-.4);
  }
  function glazedElevation(parent,side,y,from,to,options={}){
    const len=to-from,bays=Math.max(1,Math.round(len/3.7)),bay=len/bays,h=options.height||3.28;
    fbox(parent,F.concrete,side,(from+to)/2,y+.22,.15,len,.44,.3);          // allège béton
    fbox(parent,F.wood,side,(from+to)/2,y+h-.14,.15,len,.28,.3);            // bandeau bois
    for(let i=0;i<bays;i++){
      const u0=from+i*bay,cu=u0+bay/2;
      fbox(parent,F.metal,side,cu,y+.44+(h-.72)/2,.16,bay-.5,h-.72,.1);
      fbox(parent,F.glass,side,cu,y+.44+(h-.72)/2,.24,bay-.62,h-.84,.014);
      for(const k of [-1,0,1])fbox(parent,F.bronze,side,cu+k*(bay-.58)/2,y+.44+(h-.72)/2,.27,.045,h-.8,.05);
      fbox(parent,F.wood,side,u0,y+h/2,.24,.5,h,.5);                       // pied-droit bois
      pierLight(u0);
    }
    fbox(parent,F.wood,side,to,y+h/2,.24,.5,h,.5);pierLight(to);
    function pierLight(u){if(options.sconces===false)return;const [x,z]=place(side,u,.55);sconce(parent,x,y+1.9,z,frot(side));}
  }
  function claddedElevation(parent,side,y,windows,h=3.28){
    const s=SIDE[side],len=s.length;
    fbox(parent,F.concrete,side,len/2,y+h/2,.15,len,h,.3);
    fbox(parent,F.wood,side,len/2,y+h/2,.34,len,h-.2,.07);                // bardage chêne vieilli
    for(let u=1.2;u<len;u+=1.2)fbox(parent,F.woodLight,side,u,y+h/2,.39,.06,h-.4,.03);   // couvre-joints
    for(const w of windows){
      fbox(parent,F.bronze,side,w.u,y+w.sill+w.h/2,.4,w.w+.16,w.h+.16,.08);
      fbox(parent,F.glass,side,w.u,y+w.sill+w.h/2,.42,w.w,w.h,.02);
      fbox(parent,F.concrete,side,w.u,y+w.sill-.05,.45,w.w+.3,.08,.2);  // appui
    }
    fbox(parent,F.concreteDark,side,len/2,y+h+.02,.2,len,.12,.5);        // nez de dalle
  }
  function hotelElevation(parent,side,y,balconyFront){
    const s=SIDE[side],len=s.length,bays=Math.max(1,Math.round(len/3.6)),bay=len/bays,h=H-.32;
    fbox(parent,concrete,side,len/2,y+.45,.15,len,.9,.3);fbox(parent,concrete,side,len/2,y+h-.29,.15,len,.58,.3);
    fbox(parent,concreteDark,side,len/2,y+h+.02,.2,len,.12,.5);
    const seps=[];
    for(let i=0;i<bays;i++){
      const u0=i*bay,cu=u0+bay/2;seps.push(u0);
      fbox(parent,oak,side,u0+.55,y+1.8,.2,1.1,1.8,.2);                     // panneau bois
      const lit=rand()<.55?hotelGlassLit:hotelGlass;
      fbox(parent,bronze,side,cu+.55,y+1.8,.17,bay-1.16,1.86,.08);
      fbox(parent,lit,side,cu+.55,y+1.8,.2,bay-1.3,1.72,.02);
    }
    seps.push(len);
    if(balconyFront)balcony(parent,side,y,0,len,seps);
  }
  /* ---------- Socle hôtelier (persistant) ---------- */
  const socle=new T.Group();socle.name='Hotel base';garden.add(socle);
  box(socle,plinth,CX,-.4,CZ,W+.4,.7,D+.4);
  // Rez-de-chaussée vitré : dalle, colonnes d'angle, vitrage continu, portes et auvent côté sud.
  box(socle,concrete,CX,-.12,CZ,W,.24,D);
  for(const [x,z] of [[X0+.35,Z0+.35],[X1-.35,Z0+.35],[X0+.35,Z1-.35],[X1-.35,Z1-.35]])box(socle,concrete,x,H/2,z,.7,H,.7);
  for(const side of ['S','E','N','W']){
    const len=SIDE[side].length;
    fbox(socle,lobbyGlass,side,len/2,H/2-.05,.1,len-.9,H-.5,.03);
    fbox(socle,bronze,side,len/2,.3,.13,len-.9,.08,.12);fbox(socle,bronze,side,len/2,H-.32,.13,len-.9,.1,.14);
    for(let u=1.8;u<len-.5;u+=1.8)fbox(socle,bronze,side,u,H/2-.05,.14,.06,H-.5,.1);
    const [sx,sz]=place(side,len/2,.45);sconce(socle,sx-SIDE[side].u[0]*6,2.3,sz-SIDE[side].u[1]*6,frot(side));sconce(socle,sx+SIDE[side].u[0]*6,2.3,sz+SIDE[side].u[1]*6,frot(side));
  }
  fbox(socle,black,'S',W/2,1.1,.16,2.6,2.2,.06);fbox(socle,bronze,'S',W/2,1.1,.19,.05,2.2,.05);   // portes d'entrée
  const canopyW=9.5,canopyReach=3.4;
  fbox(socle,concrete,'S',W/2,3.32,canopyReach/2+.1,canopyW,.22,canopyReach+.2);
  fbox(socle,oakLight,'S',W/2,3.19,canopyReach/2+.1,canopyW-.2,.05,canopyReach-.1);            // sous-face bois
  for(const u of [W/2-canopyW/2+.4,W/2+canopyW/2-.4]){fbox(socle,bronze,'S',u,1.65,canopyReach-.3,.14,3.3,.14);}
  for(let i=0;i<4;i++)fbox(socle,glow,'S',W/2-canopyW/2+1.2+i*(canopyW-2.4)/3,3.15,canopyReach*.55,.3,.02,.3);   // spots de l'auvent
  // Quatre étages d'hôtel : béton + bois, fenêtres, balcons continus côté vallée (sud) et séparations bois.
  for(let k=1;k<HOTEL_LEVELS;k++){
    const y=k*H;
    box(socle,concrete,CX,y-.16,CZ,W,.32,D);
    for(const side of ['S','E','N','W'])hotelElevation(socle,side,y,side==='S'||side==='E');
  }
  box(socle,concrete,CX,BASE-.5,CZ,W,.32,D);   // plancher haut du socle (reste visible quand le duplex s'efface)
  /* ---------- Duplex (s'efface au zoom) ---------- */
  const level0=BASE,level1=BASE+H,eave=level1+3.35,slope=.3,overhang=2.2;
  const northWindows=[],westWindows=[];
  for(const r of list){
    if(!r.win)continue;
    const p=r.cfg,entry={sill:.95,h:1.4,w:r.win.w+.2,level:p.niveau};
    if(r.win.wall==='north'&&p.z===minZ)northWindows.push({...entry,u:p.x+r.win.x-X0});
    if(r.win.wall==='west'&&p.x===minX)westWindows.push({...entry,u:p.z+p.d-r.win.x-Z0});
  }
  const tSpan=terrace?{u0:terrace.cfg.x-X0,u1:terrace.cfg.x+terrace.cfg.w-X0,z0:terrace.cfg.z-Z0,z1:terrace.cfg.z+terrace.cfg.d-Z0}:null;
  for(const [level,y] of [[0,level0],[1,level1]]){
    box(group,F.concrete,CX,y-.16,CZ,W+.2,.32,D+.2);
    claddedElevation(group,'N',y,northWindows.filter(w=>w.level===level));
    claddedElevation(group,'W',y,westWindows.filter(w=>w.level===level));
    const openS=level===0&&tSpan&&tSpan.z1>=D-.6,openE=level===0&&tSpan&&tSpan.u1>=W-.6;
    // Façades sud et est : baies vitrées et balcons ; au niveau 0 la terrasse d'angle (pièce ext) reste une loggia
    // ouverte avec ses propres garde-corps, séparée du balcon du salon par une cloison bois.
    const endS=openS?tSpan.u0:W,endE=openE?tSpan.z0:D;
    glazedElevation(group,'S',y,0,endS);balcony(group,'S',y,0,endS,[0,endS*.5,endS]);
    if(endE>2){glazedElevation(group,'E',y,0,endE);balcony(group,'E',y,0,endE,[0,endE*.5,endE]);}
    balcony(group,'W',y,1.75,D-1.75,[1.75,D/2,D-1.75]);
    if(openS)fbox(group,F.wood,'S',tSpan.u0,y+1.1,-1.4,.08,2.2,2.8);
  }
  // Frise et toiture deux pans, faîtage est-ouest, débords couvrant les balcons ; gables en bardage bois.
  const ridgeY=eave+(D/2+overhang)*slope,wallRoofY=eave+overhang*slope,angle=Math.atan(slope),panLen=Math.hypot(D/2+overhang,(D/2+overhang)*slope);
  for(const side of ['N','S'])fbox(group,F.wood,side,W/2,(eave+wallRoofY)/2+.05,.15,W,wallRoofY-eave+.1,.3);
  for(const sign of [1,-1]){   // pan sud (+z) puis pan nord
    const zc=CZ+sign*(D/2+overhang)/2,yc=(eave+ridgeY)/2;
    const pan=box(group,F.roof,CX,yc+.17,zc,W+1.8,.32,panLen);pan.rotation.x=sign*angle;
    const boards=box(group,F.woodLight,CX,yc-.02,zc,W+1.7,.05,panLen-.1);boards.rotation.x=sign*angle;
    for(let x=X0-.7;x<=X1+.7;x+=1.15){const r=box(group,F.timber,x,yc-.12,zc,.12,.2,panLen-.3);r.rotation.x=sign*angle;}   // chevrons
    for(const f of [.25,.62]){const purlin=box(group,F.timber,CX,eave+(D/2+overhang)*slope*f-.28,CZ+sign*(D/2+overhang)*(1-f),W+1.6,.24,.24);purlin.rotation.x=sign*angle;}   // pannes
    box(group,F.timber,CX,eave-.1,CZ+sign*(D/2+overhang),W+1.8,.22,.16);   // planche de rive
  }
  box(group,F.timber,CX,ridgeY-.05,CZ,W+1.8,.3,.3);                     // panne faîtière
  box(group,F.roof,CX,ridgeY+.24,CZ,W+1.9,.2,.9);                       // faîtage
  const gableShape=new T.Shape();gableShape.moveTo(Z0,eave);gableShape.lineTo(Z1,eave);gableShape.lineTo(Z1,wallRoofY);gableShape.lineTo(CZ,ridgeY-.06);gableShape.lineTo(Z0,wallRoofY);gableShape.closePath();
  const gableGeo=new T.ExtrudeGeometry(gableShape,{depth:.3,bevelEnabled:false});geometries.set('gable',gableGeo);
  for(const x of [X0+.3,X1+.3]){const gable=new T.Mesh(gableGeo,F.wood);gable.rotation.y=-Math.PI/2;gable.position.set(x,0,0);gable.castShadow=gable.receiveShadow=true;group.add(gable);}
  /* ---------- Parvis (persistant) ---------- */
  box(garden,paving,12.5,-.51,17.5,38,.24,44);
  for(const [x,z,w,d] of [[-3.5,8,4,24],[29,8,4,24],[4,28,10,8],[21,28,10,8]]){box(garden,grass,x,-.365,z,w,.035,d);}
  for(let z=21;z<38;z+=1.1)box(garden,paving,12.5,-.36,z,3.2,.03,1.05);      // cheminement vers l'entrée
  function tree(x,z,h){cyl(garden,timber,x,h*.35,z,.11,h*.8);for(let i=0;i<5;i++){const a=i*2.4,cx=x+Math.cos(a)*h*.23,cz=z+Math.sin(a)*h*.23,y=h*(.54+i*.08);for(let j=0;j<3;j++)ball(garden,j%2?leaf:leafLight,cx+(rand()-.5)*.45,y+(rand()-.5)*.2,cz+(rand()-.5)*.45,h*.23,h*.085,h*.2);}}
  for(const [x,z,h] of [[-3.5,2,3.2],[-3.5,14,3.6],[29,2,3.3],[29,14,3.4],[4,26,2.9],[21,26,3.1],[6,31,3.4],[19,31,3.2]])tree(x,z,h);
  for(const [x,z,w,d] of [[-3.5,21,4,.8],[29,21,4,.8]]){box(garden,soil,x,-.3,z,w,.08,d);for(let i=0;i<w/.55;i++)ball(garden,i%3?leaf:leafLight,x+i*.55-w/2,.14,z,.42,.6,.42);}
  for(const [x,z] of [[2,23],[9,23],[16,23],[23,23],[-2,34],[27,34],[9,37],[16,37]]){box(garden,black,x,.13,z,.12,.9,.12);box(garden,glow,x,.57,z,.14,.035,.14);}
  const glowCanvas=document.createElement('canvas');glowCanvas.width=glowCanvas.height=64;const gc=glowCanvas.getContext('2d'),gr=gc.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,230,175,.8)');gr.addColorStop(.3,'rgba(255,215,130,.3)');gr.addColorStop(1,'rgba(255,200,100,0)');gc.fillStyle=gr;gc.fillRect(0,0,64,64);
  const glowTexture=new T.CanvasTexture(glowCanvas);textures.add(glowTexture);
  const poolGlow=new T.MeshBasicMaterial({map:glowTexture,color:0xffdc99,transparent:true,opacity:0,depthWrite:false,blending:T.AdditiveBlending});
  for(const [x,z] of [[2,23],[9,23],[16,23],[23,23],[-2,34],[27,34],[9,37],[16,37],[12.5,21.5]]){const halo=new T.Mesh(new T.PlaneGeometry(3,3),poolGlow);halo.rotation.x=-Math.PI/2;halo.position.set(x,-.325,z);garden.add(halo);}
  /* ---------- Lavage mural des appliques (un maillage par groupe) ---------- */
  const washCanvas=document.createElement('canvas');washCanvas.width=64;washCanvas.height=128;const wc=washCanvas.getContext('2d');
  for(let y=0;y<128;y++){const t=y/127,width=3+28*t,alpha=(1-t)*.86,fade=wc.createLinearGradient(32-width,0,32+width,0);fade.addColorStop(0,'rgba(255,255,255,0)');fade.addColorStop(.22,`rgba(255,255,255,${alpha*.6})`);fade.addColorStop(.5,`rgba(255,255,255,${alpha})`);fade.addColorStop(.78,`rgba(255,255,255,${alpha*.6})`);fade.addColorStop(1,'rgba(255,255,255,0)');wc.fillStyle=fade;wc.fillRect(0,y,64,1);}
  const washTexture=new T.CanvasTexture(washCanvas);textures.add(washTexture);
  function wash(parent,lights,name){
    const mat=new T.MeshBasicMaterial({map:washTexture,color:0xffdca2,transparent:true,opacity:0,depthWrite:false,blending:T.AdditiveBlending});mat.color.multiplyScalar(2.2);
    const positions=[],uvs=[];parent.updateMatrixWorld(true);
    for(const q of lights)for(const direction of [-1,1]){const length=direction>0?.97:1.43,geometry=new T.PlaneGeometry(.62,length).toNonIndexed();if(direction>0)geometry.rotateZ(Math.PI);geometry.translate(0,direction*(.21+length/2),-.087);geometry.applyMatrix4(q.matrixWorld);positions.push(...geometry.attributes.position.array);uvs.push(...geometry.attributes.uv.array);geometry.dispose();}
    const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));geometries.set(name,geo);
    const o=new T.Mesh(geo,mat);o.name=name;parent.add(o);return mat;
  }
  const duplexWash=wash(group,wallLights,'Duplex wall wash'),baseWash=wash(garden,baseLights,'Base wall wash');
  mergeRails(group,railPanes.group,F.rail);mergeRails(garden,railPanes.garden,railBase);
  kit.batch(group);kit.batch(garden);
  /* ---------- Vues d'ensemble des pièces (écorché éclaté) ---------- */
  const lodPale=material(0xe4ded2,.9),lodWood=A.oak.clone(),lodDark=material(0x343c3c,.85),lodGreen=material(0x66745a,.95),lodMetal=material(0x898272,.5,{metalness:.3});
  lodWood.color.setHex(0xc7b79d);
  for(const r of list){
    if(r.ext)continue;const lod=new T.Group();lod.name='Overview room '+r.id;
    r.group.updateMatrixWorld(true);const inverse=new T.Matrix4().copy(r.group.matrixWorld).invert();
    r.group.traverse(o=>{
      if(!o.isMesh||!o.visible||o.material.transparent)return;
      const src=o.material,c=src.color||new T.Color(0xffffff);
      const m=src.map===A.oak.map?lodWood:src.metalness>.5?lodMetal:c.g>c.r*1.12?lodGreen:c.r>.6&&c.g>.55?lodPale:c.r>.4&&c.g>.25?lodWood:lodDark;
      const clone=new T.Mesh(o.geometry,m);new T.Matrix4().multiplyMatrices(inverse,o.matrixWorld).decompose(clone.position,clone.quaternion,clone.scale);lod.add(clone);
    });
    kit.batch(lod);r.lod=lod;r.lodLabel=r.label.clone();lod.add(r.lodLabel);lod.position.copy(r.group.position);r.group.parent.add(lod);lod.visible=false;
  }
  const bounds=new T.Box3(new T.Vector3(-6.5,-1,-4.5),new T.Vector3(31.5,ridgeY+1,30));
  return {group,garden,bounds,focusY:BASE*.62,shadow:{position:[-22,66,44],target:[CX,BASE*.6,CZ],size:44,far:160},get opacity(){return opacity;},
    setOpacity(v){opacity=Math.max(0,Math.min(1,v));group.visible=opacity>.001;duplexWash.opacity=nightLevel*opacity;for(const m of facadeMaterials){const transparent=m.userData.baseTransparent||opacity<.999;if(m.transparent!==transparent){m.transparent=transparent;m.needsUpdate=true;}m.opacity=opacity*m.userData.baseOpacity;m.depthWrite=!transparent;}},
    setNight(night){nightLevel=night;glow.emissiveIntensity=night*3;F.glow.emissiveIntensity=night*3;F.glass.emissiveIntensity=night*.5;hotelGlassLit.emissiveIntensity=night*.9;lobbyGlass.emissiveIntensity=night*.7;poolGlow.opacity=night;duplexWash.opacity=night*opacity;baseWash.opacity=night;},
    lighting(){return {sconces:wallLights.length+baseLights.length,washDrawCalls:2,intensity:duplexWash.opacity};},
    dispose(){disposed=true;environment.dispose();textures.forEach(t=>t.dispose());geometries.forEach(g=>g.dispose());sphere.dispose();cylinder.dispose();duplexWash.dispose();baseWash.dispose();}
  };
}
