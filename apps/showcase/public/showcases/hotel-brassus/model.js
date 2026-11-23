/* Plan-derived presentation geometry. Elevations and materials are interpretive.
 * Source mapping and coordinate convention: docs/hotel-brassus.md. */
(async () => {
  const background=new URLSearchParams(location.search).has('background');let viewport=null;
  if(background)document.body.classList.add('background');
  const T=window.THREE, canvas=document.getElementById('scene');
  let renderer;
  try {renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:false});} catch {
    document.body.insertAdjacentHTML('beforeend','<p class="error">La 3D nécessite WebGL sur ce navigateur.</p>');return;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.outputColorSpace=T.SRGBColorSpace;
  renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;
  const scene=new T.Scene();scene.background=new T.Color('#93a6aa');scene.fog=new T.Fog('#93a6aa',105,260);
  if(background){scene.fog.near=85;scene.fog.far=230;}
  const camera=new T.PerspectiveCamera(38,1,.1,800),target=new T.Vector3(0,-1,0);
  const hemi=new T.HemisphereLight(0xdceaff,0x59604a,1.2);scene.add(hemi);
  const sun=new T.DirectionalLight(0xffecd1,1.9);sun.position.set(-30,60,35);scene.add(sun);
  const mats={};
  for(const [key,color,roughness] of [['wood',0x775137,.72],['oak',0xb58b58,.7],['stone',0xbbb9a9,.9],['concrete',0xc9c5b9,.92],['dark',0x233832,.75],['metal',0x27332f,.35],['green',0x527057,.95],['roofgreen',0x68846a,.98],['linen',0xc5b8a2,.95],['gold',0xc0a466,.35],['floor',0xab9271,.9],['water',0x568d90,.3],['pv',0x16272d,.28]])mats[key]=new T.MeshStandardMaterial({color,roughness});
  mats.glass=new T.MeshStandardMaterial({color:0x8bbfc4,transparent:true,opacity:.25,roughness:.1,depthWrite:false});
  mats.glow=new T.MeshStandardMaterial({color:0xffdaa0,emissive:0xffbc66,emissiveIntensity:1.2});
  mats.curtain=new T.MeshStandardMaterial({color:0x7c3934,roughness:.88,emissive:0x160706,emissiveIntensity:.28,side:T.DoubleSide});
  mats.curtainFold=new T.MeshStandardMaterial({color:0xa75a4e,roughness:.82,side:T.DoubleSide});
  // Small, shared, deterministic finishes: generated once, mipmapped by Three.
  // No normal maps, extra lights, geometry or per-frame texture updates.
  function finish(kind){
    const size=128,c=document.createElement('canvas');c.width=c.height=size;
    const ctx=c.getContext('2d'),image=ctx.createImageData(size,size);
    for(let y=0;y<size;y++)for(let x=0;x<size;x++){
      const noise=((x*73+y*151+x*y*19)%101)/100-.5;
      let v=245;
      if(kind==='wood')v=239+7*Math.sin(x*.38+Math.sin(y*.049)*1.3)+4*Math.sin(x*1.7+y*.024)+noise*5;
      if(kind==='floor'){
        const row=Math.floor(y/32),joint=(x+row*43)%128;
        v=240+6*Math.sin(y*.8+Math.sin(x*.049))+noise*5;
        if(y%32===0||joint<1)v=199;
      }
      if(kind==='stone')v=245+noise*12+2*Math.sin(x*.17)*Math.cos(y*.23);
      if(kind==='linen')v=241+((x%2===y%2)?5:-5)+noise*3;
      const i=(y*size+x)*4;image.data[i]=image.data[i+1]=image.data[i+2]=Math.max(0,Math.min(255,v));image.data[i+3]=255;
    }
    ctx.putImageData(image,0,0);const texture=new T.CanvasTexture(c);
    texture.colorSpace=T.SRGBColorSpace;texture.wrapS=texture.wrapT=T.RepeatWrapping;
    texture.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());
    return texture;
  }
  const timberFinish=finish('wood'),stoneFinish=finish('stone');
  mats.wood.map=mats.oak.map=timberFinish;mats.stone.map=mats.concrete.map=stoneFinish;
  mats.floor.map=finish('floor');mats.linen.map=finish('linen');
  const textureLoader=new T.TextureLoader();
  const scanned=await Promise.all(['oak-color','oak-normal','oak-roughness'].map(name=>textureLoader.loadAsync('/plan3d/textures/'+name+'.webp').catch(()=>null)));
  scanned.forEach((texture,i)=>{if(!texture)return;texture.colorSpace=i===0?T.SRGBColorSpace:T.NoColorSpace;texture.wrapS=texture.wrapT=T.RepeatWrapping;texture.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());});
  const [oakColor,oakNormal,oakRoughness]=scanned;
  const groundScan=await textureLoader.loadAsync('/showcases/hotel-brassus/textures/meadow-color.webp').catch(()=>null);
  if(oakColor){
    const c=document.createElement('canvas');c.width=256;c.height=512;
    c.getContext('2d').drawImage(oakColor.image,350,12,90,1000,0,0,256,512);
    const grain=new T.CanvasTexture(c);grain.colorSpace=T.SRGBColorSpace;grain.wrapS=grain.wrapT=T.RepeatWrapping;grain.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());
    mats.oak.map=mats.wood.map=grain;mats.oak.color.setHex(0xffffff);mats.wood.color.setHex(0x9a8064);
  }
  mats.linen.map.repeat.set(8,8);mats.linen.bumpMap=mats.linen.map;mats.linen.bumpScale=.003;
  mats.upholstery=mats.linen.clone();mats.upholstery.color.setHex(0x8f9989);
  mats.cushion=mats.linen.clone();mats.cushion.color.setHex(0xbb805a);
  mats.rug=mats.linen.clone();mats.rug.color.setHex(0x6e7469);
  mats.porcelain=new T.MeshStandardMaterial({color:0xeee9df,roughness:.22});
  mats.stemware=new T.MeshStandardMaterial({color:0xdfe9e5,roughness:.12,metalness:.12,transparent:true,opacity:.32,depthWrite:false});
  mats.oak.roughness=.62;mats.wood.roughness=.76;mats.metal.roughness=.42;mats.stone.roughness=.44;mats.stone.color.setHex(0xd1c7b7);
  mats.metal.metalness=.72;mats.gold.metalness=.76;mats.gold.roughness=.36;
  // A small static studio environment: broad window reflections, generated once.
  const cubeFaces=Array.from({length:6},(_,face)=>{
    const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');
    const gradient=g.createLinearGradient(0,0,0,64);
    gradient.addColorStop(0,face===2?'#bdc8ce':'#aebec7');gradient.addColorStop(1,face===3?'#343a34':'#59615d');g.fillStyle=gradient;g.fillRect(0,0,64,64);
    if(face===0||face===4){
      // Broad, feathered windows instead of a bright rectangular specular stamp.
      g.save();g.filter='blur(3px)';g.fillStyle=face===4?'#dfe6e8':'#cec9b8';g.fillRect(face===4?8:14,6,face===4?43:29,45);g.restore();
      g.save();g.globalAlpha=.12;g.fillStyle='#76827f';g.fillRect(28,7,1,43);g.fillRect(10,27,39,1);g.restore();
    }
    return c;
  });
  const cube=new T.CubeTexture(cubeFaces);cube.colorSpace=T.SRGBColorSpace;cube.needsUpdate=true;
  const pmrem=new T.PMREMGenerator(renderer),environment=pmrem.fromCubemap(cube);
  scene.environment=environment.texture;pmrem.dispose();cube.dispose();
  Object.values(mats).forEach(material=>{material.envMapIntensity=.18;});for(const key of ['linen','upholstery','cushion'])mats[key].envMapIntensity=.08;mats.rug.envMapIntensity=.04;mats.stone.envMapIntensity=.23;mats.metal.envMapIntensity=.4;mats.gold.envMapIntensity=.45;mats.stemware.envMapIntensity=.42;
  // Static geometry casts one cached sunlight shadow, refreshed only on a view change.
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.VSMShadowMap;renderer.shadowMap.autoUpdate=false;
  sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.bias=-.00015;sun.shadow.normalBias=.035;sun.shadow.camera.near=1;sun.shadow.camera.far=180;
  sun.shadow.radius=3;sun.shadow.blurSamples=6;sun.shadow.autoUpdate=false;
  const facadeProbe={captures:0,texture:null};
  mats.facadeGlass=mats.glass.clone();
  for(const material of [mats.glass,mats.facadeGlass]){
    material.color.setHex(0x263e40);material.opacity=.18;material.roughness=.14;material.side=T.DoubleSide;material.forceSinglePass=true;
    // Preserve grazing-angle reflections without a real-time transmission buffer.
    material.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',`
      float glassGrazing = pow(1.0 - clamp(abs(dot(normal, geometryViewDir)), 0.0, 1.0), 5.0);
      diffuseColor.a = mix(opacity, 0.66, glassGrazing);
      outgoingLight += (reflectedLight.directSpecular + reflectedLight.indirectSpecular) * (1.0 / max(diffuseColor.a, 0.05) - 1.0) * 0.65;
      #include <opaque_fragment>
    `);};
    material.customProgramCacheKey=()=> 'hdh-glass-fresnel-1';
  }
  mats.facadeGlass.opacity=.3;
  const concreteCanvas=document.createElement('canvas');concreteCanvas.width=concreteCanvas.height=128;
  const concreteContext=concreteCanvas.getContext('2d'),concretePixels=concreteContext.createImageData(128,128);
  for(let i=0;i<128*128;i++){
    const hash=Math.sin(i*12.9898+Math.floor(i/128)*78.233)*43758.5453,grain=hash-Math.floor(hash)-.5;
    concretePixels.data[i*4]=237+grain*11;concretePixels.data[i*4+1]=235+grain*11;concretePixels.data[i*4+2]=229+grain*11;concretePixels.data[i*4+3]=255;
  }
  concreteContext.putImageData(concretePixels,0,0);
  const facadeConcreteMap=new T.CanvasTexture(concreteCanvas);facadeConcreteMap.colorSpace=T.SRGBColorSpace;facadeConcreteMap.wrapS=facadeConcreteMap.wrapT=T.RepeatWrapping;
  facadeConcreteMap.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());
  mats.facadeConcrete=new T.MeshStandardMaterial({color:0xc2c2b9,map:facadeConcreteMap,bumpMap:facadeConcreteMap,bumpScale:.008,roughness:.86,envMapIntensity:.12});
  mats.facadeWood=mats.wood.clone();mats.facadeWood.map=mats.wood.map.clone();mats.facadeWood.map.repeat.set(8,1);mats.facadeWood.color.setHex(0xc8bca5);mats.facadeWood.roughness=.75;mats.facadeWood.bumpMap=mats.facadeWood.map;mats.facadeWood.bumpScale=.004;
  mats.facadeMetal=mats.metal.clone();mats.facadeMetal.color.setHex(0x35413f);mats.facadeMetal.roughness=.38;mats.facadeMetal.envMapIntensity=.3;
  mats.facadeJoint=new T.MeshStandardMaterial({color:0x4a504b,roughness:.96,envMapIntensity:.04});
  const paneGeometry=new T.PlaneGeometry(1,1),facadePanes=[];
  const roomGroups=[],surfaceGeometry=new Map();
  // Static, deterministic landscape fields; no noise evaluation in the frame loop.
  const landscapeHash=n=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v);};
  const smoothField=(x,z)=>{
    const ix=Math.floor(x),iz=Math.floor(z),u=x-ix,v=z-iz,su=u*u*(3-2*u),sv=v*v*(3-2*v);
    return T.MathUtils.lerp(T.MathUtils.lerp(landscapeHash(ix+iz*157),landscapeHash(ix+1+iz*157),su),T.MathUtils.lerp(landscapeHash(ix+(iz+1)*157),landscapeHash(ix+1+(iz+1)*157),su),sv);
  };
  const periodicField=(x,z,period)=>{
    const ix=Math.floor(x),iz=Math.floor(z),u=x-ix,v=z-iz,su=u*u*(3-2*u),sv=v*v*(3-2*v),h=(a,b)=>landscapeHash(((a%period)+period)%period+(((b%period)+period)%period)*157);
    return T.MathUtils.lerp(T.MathUtils.lerp(h(ix,iz),h(ix+1,iz),su),T.MathUtils.lerp(h(ix,iz+1),h(ix+1,iz+1),su),sv);
  };
  function vegetationMap(roof=false){
    const c=document.createElement('canvas');c.width=roof?512:256;c.height=roof?128:256;
    const g=c.getContext('2d'),pixels=g.createImageData(c.width,c.height);
    for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++){
      const broad=periodicField(x/c.width*4,y/c.height*4,4),fine=periodicField(x/c.width*16,y/c.height*16,16),grain=landscapeHash(x+y*c.width);
      const i=(y*c.width+x)*4,soil=Math.max(0,.43-broad)*42;
      pixels.data[i]=99+broad*30+grain*15+soil;pixels.data[i+1]=108+broad*33+fine*15;pixels.data[i+2]=66+broad*23+grain*12;
      if(roof&&(x<3||x>=c.width-3||y<3||y>=c.height-3)){
        const stone=132+grain*41;pixels.data[i]=stone;pixels.data[i+1]=stone*.98;pixels.data[i+2]=stone*.9;
      }
      pixels.data[i+3]=255;
    }
    g.putImageData(pixels,0,0);
    if(groundScan){
      g.save();if(roof){g.beginPath();g.rect(3,3,c.width-6,c.height-6);g.clip();}
      const tile=roof?128:256;
      for(let x=0;x<c.width;x+=tile)g.drawImage(groundScan.image,x,0,tile,c.height);
      g.fillStyle=roof?'rgba(106,142,65,.36)':'rgba(106,142,65,.25)';g.fillRect(0,0,c.width,c.height);g.restore();
    }

    // Broad overlapping sedum rosettes survive mip filtering; no tiny alpha cards.
    for(let i=0;i<(roof?2600:1800);i++){
      const x=5+landscapeHash(i+31)*(c.width-10),y=5+landscapeHash(i+907)*(c.height-10),r=.6+landscapeHash(i+471)*1.4;
      g.fillStyle=i%4?'rgba(179,188,121,.19)':'rgba(73,83,46,.25)';g.beginPath();g.ellipse(x,y,r,r*.6,landscapeHash(i)*Math.PI,0,Math.PI*2);g.fill();
    }
    const texture=new T.CanvasTexture(c);texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());return texture;
  }
  const vegetationTexture=vegetationMap();vegetationTexture.wrapS=vegetationTexture.wrapT=T.RepeatWrapping;vegetationTexture.repeat.set(.25,.25);
  mats.green.map=vegetationTexture;mats.green.color.setHex(0xffffff);
  mats.roofgreen.map=vegetationMap(true);mats.roofgreen.color.setHex(0xffffff);
  const roofPlantMatrices=[],roofPlantColors=[];
  const geo=new T.BoxGeometry(1,1,1),cyl=new T.CylinderGeometry(1,1,1,16),levels={},roofs=[],lights=[],roomLighting=new Map(),curtains=new Map();
  const curtainGeometry=new T.PlaneGeometry(1,1,36,1);
  const curtainVertices=curtainGeometry.attributes.position;
  for(let i=0;i<curtainVertices.count;i++)curtainVertices.setZ(i,Math.sin((curtainVertices.getX(i)+.5)*Math.PI*18)*.5);
  curtainGeometry.computeVertexNormals();
  const chairShell=new T.BufferGeometry(),shellVertices=[],shellNormals=[],shellUV=[];
  const shellPoint=(a,y,outer)=>new T.Vector3(Math.sin(a)*(.34+outer),y, -Math.cos(a)*(.3+outer));
  for(let i=0;i<12;i++)for(const outer of [0,.045]){
    const a=-1.2+i*.2,b=a+.2;
    const points=[shellPoint(a,.6,outer),shellPoint(b,.6,outer),shellPoint(b,1.16,outer),shellPoint(a,1.16,outer)];
    for(const j of (outer?[0,1,2,0,2,3]:[2,1,0,3,2,0])){
      shellVertices.push(...points[j]);const p=points[j];const normal=new T.Vector3(p.x,0,p.z).normalize().multiplyScalar(outer?1:-1);shellNormals.push(...normal);shellUV.push((j===1||j===2?(i+1):i)/12,j>1?1:0);
    }
  }
  for(let i=0;i<12;i++){
    const a=-1.2+i*.2,b=a+.2,points=[shellPoint(a,1.16,0),shellPoint(b,1.16,0),shellPoint(b,1.16,.045),shellPoint(a,1.16,.045)];
    for(const j of [0,2,1,0,3,2]){shellVertices.push(...points[j]);shellNormals.push(0,1,0);shellUV.push(i/12,j<2?0:1);}
  }
  chairShell.setAttribute('position',new T.Float32BufferAttribute(shellVertices,3));chairShell.setAttribute('normal',new T.Float32BufferAttribute(shellNormals,3));chairShell.setAttribute('uv',new T.Float32BufferAttribute(shellUV,2));
  const turnedTop=new T.LatheGeometry([[0,-.5],[.94,-.5],[1,-.24],[1,.24],[.94,.5],[0,.5]].map(p=>new T.Vector2(...p)),32);
  const glassGeometry=new T.LatheGeometry([[0,0],[.1,0],[.1,.012],[.014,.025],[.012,.12],[.085,.16],[.09,.25],[.07,.28]].map(p=>new T.Vector2(...p)),12);
  const footRing=new T.TorusGeometry(.21,.014,5,20),chandelierRing=new T.TorusGeometry(.5,.012,6,24),opalGlobe=new T.SphereGeometry(1,8,6);
  const shell=new T.Group();shell.name='hotel-envelope';scene.add(shell);
  // Chamfered silhouettes and real-world UVs, shared by size for instancing.
  function solidGeometry(w,h,d,soft=false){
    const key=[w,h,d,soft].join('/');if(surfaceGeometry.has(key))return surfaceGeometry.get(key);
    const rounded=soft&&Math.min(w,h,d)>.075;
    const geometry=new T.BoxGeometry(w,h,d,rounded?3:1,rounded?3:1,rounded?3:1);
    const p=geometry.attributes.position,n=geometry.attributes.normal,uv=geometry.attributes.uv;
    if(rounded){const r=Math.min(typeof soft==='number'?soft:.08,Math.min(w,h,d)*.23),half=[w/2,h/2,d/2];
      for(let i=0;i<p.count;i++){
        const v=[p.getX(i),p.getY(i),p.getZ(i)].map((a,j)=>Math.abs(a)<half[j]*.9?Math.sign(a)*(half[j]-r):a);
        const inner=v.map((a,j)=>T.MathUtils.clamp(a,-half[j]+r,half[j]-r));
        const normal=new T.Vector3(...v.map((a,j)=>a-inner[j])).normalize();
        p.setXYZ(i,inner[0]+normal.x*r,inner[1]+normal.y*r,inner[2]+normal.z*r);n.setXYZ(i,normal.x,normal.y,normal.z);
      }
    }
    for(let i=0;i<uv.count;i++){
      const face=Math.floor(i/(rounded?16:4)),u=uv.getX(i),v=uv.getY(i);
      uv.setXY(i,u*(face<2?d:w)/2,v*(face===2||face===3?d:h)/2);
    }
    geometry.computeBoundingBox();surfaceGeometry.set(key,geometry);return geometry;
  }
  function box(parent,x,y,z,w,h,d,mat='wood'){
    const material=typeof mat==='string'?mats[mat]:mat;
    const detailed=['linen','upholstery','cushion','rug','oak','wood','stone','concrete','floor','green'].includes(mat);
    const soft=['linen','upholstery','cushion'].includes(mat)||(mat==='oak'&&Math.max(w,h,d)<4);
    const m=new T.Mesh(detailed?solidGeometry(w,h,d,soft):geo,material);
    m.position.set(x,y,z);if(!detailed)m.scale.set(w,h,d);parent.add(m);return m;
  }
  function glazing(parent,x,y,z,w,h,exterior=false){
    const m=new T.Mesh(paneGeometry,exterior?mats.facadeGlass:mats.glass);m.position.set(x,y,z);m.scale.set(w,h,1);m.name=exterior?'facade-glazing':'room-glazing';parent.add(m);
    if(exterior)facadePanes.push({x,y,z,w,h});return m;
  }
  function facadeSolid(parent,x,y,z,w,h,d,material,bevel=false){
    const m=new T.Mesh(solidGeometry(w,h,d,bevel?.025:false),material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;
  }
  function round(parent,x,y,z,r,h,mat='oak'){const m=new T.Mesh(mat==='oak'&&h<.2?turnedTop:cyl,typeof mat==='string'?mats[mat]:mat);m.position.set(x,y,z);m.scale.set(r,h,r);parent.add(m);return m;}
  function label(parent,text,x,y,z){const c=document.createElement('canvas');c.width=768;c.height=100;const ctx=c.getContext('2d');ctx.fillStyle='#152d28e8';ctx.fillRect(0,0,768,100);ctx.fillStyle='#eee6d4';ctx.font='500 36px system-ui';ctx.textAlign='center';ctx.fillText(text,384,64);const tx=new T.CanvasTexture(c);tx.colorSpace=T.SRGBColorSpace;const s=new T.Sprite(new T.SpriteMaterial({map:tx,depthTest:true,transparent:true}));s.userData.roomLabel=true;s.position.set(x,y,z);s.scale.set(6.5,.85,1);parent.add(s);return s;}
  function chair(g,x,z,angle=0){
    const c=new T.Group();c.position.set(x,0,z);c.rotation.y=angle;g.add(c);
    box(c,0,.54,0,.61,.14,.57,'upholstery');
    c.add(new T.Mesh(chairShell,mats.upholstery));
    for(const dx of [-.21,.21])for(const dz of [-.2,.2]){const leg=box(c,dx,.23,dz,.035,.46,.035,'wood');leg.rotation.z=-Math.sign(dx)*.075;leg.rotation.x=Math.sign(dz)*.09;}
  }
  function table(g,x,z,r=.9){
    round(g,x,.8,z,r,.07);
    round(g,x,.4,z,.1,.76,'metal');round(g,x,.035,z,.34,.035,'metal');
    for(let a=0;a<4;a++){
      const q=a*Math.PI/2,px=x+Math.sin(q)*r*.65,pz=z+Math.cos(q)*r*.65;
      round(g,px,.844,pz,.15,.012,'porcelain');
      const glass=new T.Mesh(glassGeometry,mats.stemware);glass.position.set(px+Math.cos(q)*.18,.845,pz-Math.sin(q)*.18);g.add(glass);
      box(g,px-Math.cos(q)*.16,.85,pz+Math.sin(q)*.16,.07,.008,.17,'linen');
      chair(g,x+Math.sin(q)*(r+.43),z+Math.cos(q)*(r+.43),q);
    }
    round(g,x,.93,z,.045,.19,'gold');
  }
  function sofa(g,x,z,w=2.6){
    box(g,x,.28,z,w,.28,1,'wood');
    const count=Math.max(2,Math.round(w/.9));
    for(let i=0;i<count;i++){
      const px=x+(i-(count-1)/2)*(w-.3)/count;
      box(g,px,.51,z,(w-.3)/count-.025,.27,.79,'linen');
      const back=box(g,px,.86,z-.38,(w-.3)/count-.025,.65,.26,'linen');back.rotation.x=-.11;
    }
    box(g,x-w/2+.03,.57,z,.22,.57,1,'linen');box(g,x+w/2-.03,.57,z,.22,.57,1,'linen');
    const pillow=box(g,x-w*.27,.82,z-.12,.42,.42,.16,'cushion');pillow.rotation.set(-.18,0,-.16);
    for(const dx of [-w/2+.22,w/2-.22])for(const dz of [-.32,.32])round(g,x+dx,.09,z+dz,.028,.18,'metal');
  }
  const leafGeometry=new T.SphereGeometry(1,8,4),plantMaterial=new T.MeshStandardMaterial({color:0x344e35,roughness:.76});
  function plant(g,x,z){
    round(g,x,.26,z,.28,.5,'stone');round(g,x,.82,z,.022,1.15,'wood');
    for(let i=0;i<13;i++){
      const angle=i*2.399,y=.65+i*.068,leaf=new T.Mesh(leafGeometry,plantMaterial);
      leaf.position.set(x+Math.cos(angle)*.2,y,z+Math.sin(angle)*.2);leaf.scale.set(.34,.045,.13);leaf.rotation.set(.2,angle,.25+(i%3)*.2);g.add(leaf);
    }
  }
  function room(levelGroup,x,z,w,d,name,kind){const g=new T.Group();g.userData={id:levelGroup.userData.id,x,z,w,d,name};levelGroup.add(g);roomGroups.push(g);const floorMesh=box(g,x,.03,z,w,.08,d,'floor');g.userData.floor=floorMesh;box(g,x,1.3,z-d/2,w,2.6,.15,'stone');box(g,x-w/2,1.3,z,.15,2.6,d,'stone');
    // Glazed valley facade with timber mullions; low sill keeps cutaway readable.
    box(g,x,.22,z+d/2,w,.4,.18,'wood');glazing(g,x,1.45,z+d/2,w,2.4);
    for(let t=-w/2;t<=w/2;t+=2.4)box(g,x+t,1.55,z+d/2,.08,2.8,.12,'wood');
    label(g,name,x,3.25,z-d/2+.3);
    const zone=/BAR/.test(name)?'bar':/LOBBY/.test(name)?'entrance':/RESTAURANT/.test(name)?'restaurant':/PETIT SALON/.test(name)?'salon':/PRIVÉE/.test(name)?'pdr':/SÉMINAIRE/.test(name)?'seminar':g.userData.id==='250'?'wellness':`${g.userData.id}-${name}`;
    const lighting=roomLighting.get(zone)||{materials:[],points:[],darkness:[],natural:[],beams:[],level:65,blinds:0,scene:null,fade:null};roomLighting.set(zone,lighting);g.userData.zone=zone;
    const fixture=(type,color=0xffc477,factor=1)=>{let item=lighting.materials.find(v=>v.type===type);if(!item){item={type,factor,material:new T.MeshStandardMaterial({color,emissive:color,emissiveIntensity:factor,roughness:.28})};lighting.materials.push(item);}return item.material;};
    const cornice=fixture('cornice',0xffbd70,1.15),spot=fixture('spot',0xffe2b0,1.6),wall=fixture('wall',0xffb86b,1.3),nightlight=fixture('nightlight',0xffa85a,.85),pendant=fixture('pendant',0xffcf86,1.05);
    // Cornices, ceiling spots, wall sconces, foot-level nightlights and pendants.
    lights.push(box(g,x,2.56,z-d/2+.22,w-.35,.055,.08,cornice),box(g,x-w/2+.22,2.56,z,.08,.055,d-.35,cornice));
    for(let a=-w/2+1.15;a<w/2;a+=2.25){lights.push(box(g,x+a,2.72,z-.9,.16,.055,.16,spot),box(g,x+a,2.72,z+1.25,.16,.055,.16,spot));box(g,x+a,2.78,z-.9,.31,.045,.31,'metal');box(g,x+a,2.78,z+1.25,.31,.045,.31,'metal');}
    for(let a=-w/2+1.25;a<w/2;a+=3.2){lights.push(box(g,x+a,1.55,z-d/2+.18,.16,.42,.1,wall));box(g,x+a,1.55,z-d/2+.1,.34,.62,.08,'gold');}
    for(let a=-w/2+.8;a<w/2;a+=1.65)lights.push(box(g,x+a,.27,z-d/2+.2,.2,.12,.08,nightlight));
    const chandelierCount=w>13?3:w>8?2:1;for(let i=0;i<chandelierCount;i++){const px=x+(i-(chandelierCount-1)/2)*Math.min(5,w/3);round(g,px,2.25,z,.009,.92,'metal');const ring=new T.Mesh(chandelierRing,mats.gold);ring.position.set(px,1.87,z);ring.rotation.x=Math.PI/2;g.add(ring);for(let arm=0;arm<6;arm++){const angle=arm*Math.PI/3,bulb=new T.Mesh(opalGlobe,pendant);bulb.position.set(px+Math.cos(angle)*.5,1.82,z+Math.sin(angle)*.5);bulb.scale.setScalar(.105);g.add(bulb);lights.push(bulb);}round(g,px,1.87,z,.045,.08,'gold');}
    const point=new T.PointLight(0xffc77e,1,Math.max(w,d)*1.2,2);point.position.set(x,2.3,z);g.add(point);lighting.points.push(point);
    // Daylight enters from the glazed valley façade. A dark veil on that same
    // plane produces near-black silhouettes only when the room is off and its
    // curtains are closed.
    const darkMat=new T.MeshBasicMaterial({color:0x000000,transparent:true,opacity:0,depthWrite:false,side:T.DoubleSide});
    const darkScreen=meshEffect(g,new T.PlaneGeometry(w,2.75),darkMat,x,1.48,z+d/2+.28);darkScreen.renderOrder=12;lighting.darkness.push(darkScreen);
    const darkCanopy=meshEffect(g,new T.BoxGeometry(w,.04,d),darkMat.clone(),x,3.08,z);darkCanopy.userData.darknessScale=.86;darkCanopy.renderOrder=13;lighting.darkness.push(darkCanopy);
    const beamMat=new T.MeshBasicMaterial({color:0xffe4b5,transparent:true,opacity:.12,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide});
    const beam=meshEffect(g,new T.BoxGeometry(w*.78,2.05,d*.68),beamMat,x,1.35,z+d*.12);beam.renderOrder=4;lighting.beams.push(beam);
    const daylight=new T.SpotLight(0xffe3b5,5.5,Math.max(16,d*2.1),Math.PI/3,.55,1.2);daylight.position.set(x,3,z+d/2+2.2);daylight.target.position.set(x,.65,z-d*.18);g.add(daylight,daylight.target);lighting.natural.push(daylight);
    if(['bar','entrance','restaurant','salon','pdr','wellness','seminar'].includes(zone)){const panels=[];for(const side of [-1,1]){const panel=box(g,x+side*(w/2-.22),1.42,z+d/2+.1,.38,2.38,.12,'curtain');panel.userData={curtain:true,side,center:x,width:w};panel.geometry=curtainGeometry;panels.push(panel);}curtains.set(zone,(curtains.get(zone)||[]).concat(panels));}
    if(kind==='restaurant'){for(let xx=x-w/2+2;xx<x+w/2-1;xx+=3.5)for(let zz=z-d/2+2;zz<z+d/2-1;zz+=3.4)table(g,xx,zz,.8);}
    if(kind==='lounge'){box(g,x+.3,.078,z-.3,Math.min(w-1,5.2),.012,4,'rug');sofa(g,x-1,z,3);sofa(g,x+2,z-2,2);round(g,x,.45,z+1,.8,.12);plant(g,x+w/2-1,z-d/2+1);}
    if(kind==='private'){box(g,x,.83,z,Math.min(w-3,7),.16,1.4,'oak');for(let q=-2.4;q<=2.4;q+=1.2){chair(g,x+q,z-1.15);chair(g,x+q,z+1.15,Math.PI);}}
    if(kind==='bar'){box(g,x+2,.6,z,1.4,1.2,d-2,'wood');box(g,x+2,1.25,z,1.6,.13,d-1.8,'stone');for(let zz=z-d/2+1.5;zz<z+d/2-1;zz+=1.3){round(g,x+.6,.75,zz,.3,.12,'dark');round(g,x+.6,.4,zz,.035,.76,'metal');const rest=new T.Mesh(footRing,mats.metal);rest.position.set(x+.6,.32,zz);rest.rotation.x=Math.PI/2;g.add(rest);const back=new T.Mesh(chairShell,mats.upholstery);back.position.set(x+.6,.49,zz);back.scale.set(.85,.45,.85);back.rotation.y=Math.PI/2;g.add(back);}sofa(g,x-3,z-1);table(g,x-2,z+2,.7);}
    if(kind==='seminar'){for(let xx=x-w/2+1.5;xx<x+w/2-1;xx+=2.5)for(let zz=z-d/2+2;zz<z+d/2-1;zz+=1.8){box(g,xx,.8,zz,1.6,.08,.65,'oak');chair(g,xx,zz+.7,Math.PI);}box(g,x,1.65,z-d/2+.14,Math.min(w-2,5),2,.08,'metal');box(g,x,1.65,z-d/2+.2,Math.min(w-2.2,4.8),1.8,.025,'linen');}
    if(kind==='sauna'){for(let q=0;q<3;q++)box(g,x,.35+q*.25,z-d/2+.6+q*.6,w-1,.17,.6,'oak');for(let q=0;q<20;q++)box(g,x-w/2+.3+q*(w-.6)/20,1.4,z-d/2+.12,.1,2.5,.06,'wood');}
    if(kind==='relax'){for(let xx=x-w/2+1;xx<x+w/2-.5;xx+=1.6){const bed=box(g,xx,.5,z,.85,.2,2,'linen');bed.rotation.x=.08;box(g,xx,.6,z-.6,.8,.2,.6,'linen');}}
    if(kind==='fitness'){for(let xx=x-w/2+1.5;xx<x+w/2-.5;xx+=2){box(g,xx,.28,z,.8,.2,1.8,'metal');box(g,xx,1,z-.6,.06,1.5,.08,'metal');box(g,xx,1.65,z-.55,.65,.08,.3,'metal');}}
    if(kind==='suite'){box(g,x+1,.4,z,2,.6,2.4,'oak');box(g,x+1,.75,z,1.9,.25,2.3,'linen');box(g,x+1,1.1,z-1.15,2.1,1.2,.15,'wood');for(let dx of [.5,1.5])box(g,x+dx,.95,z-.75,.75,.12,.5,'linen');table(g,x-w/2+2,z+1,.65);box(g,x+w/2-1,.5,z+1,1.2,.6,2,'stone');plant(g,x-w/2+.7,z-d/2+.7);}
    box(g,x,.12,z-d/2+.11,w-.2,.16,.08,'wood');
    box(g,x-w/2+.11,.12,z,.08,.16,d-.2,'wood');
    box(g,x,2.58,z-d/2+.11,w-.2,.12,.09,'oak');
    for(let a=-w/2+.7;a<w/2-.4;a+=1.15){
      box(g,x+a,1.15,z-d/2+.12,.82,1.75,.055,kind==='sauna'?'wood':'oak');
    }
    box(g,x,-.09,z,w+.16,.2,d+.16,'concrete');
    g.children.forEach(o=>{if(o.isMesh&&o.position.y>=2.65&&o.position.y<=2.82)o.userData.ceilingFixed=true;});
    const roof=box(g,x,2.95,z,w+.3,.22,d+.3,'green');roofs.push(roof);
  }
  function meshEffect(parent,geometry,material,x,y,z){const m=new T.Mesh(geometry,material);m.position.set(x,y,z);m.userData.lightingEffect=true;parent.add(m);return m;}
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
    const concrete=mats.facadeConcrete,timber=mats.facadeWood,metal=mats.facadeMetal,joint=mats.facadeJoint;
    facadeSolid(shell,0,y-.3,z,49,.48,12.6,concrete,true);
    facadeSolid(shell,0,y+1.35,z-5.45,48,2.8,.3,concrete);
    facadeSolid(shell,-24.15,y+1.35,z,.3,2.8,11,concrete);
    facadeSolid(shell,24.15,y+1.35,z,.3,2.8,11,concrete);
    for(const side of [-1,1])facadeSolid(shell,side*23.9,y+1.35,z+5.45,.3,2.82,.5,concrete);
    // Drip edge and a small recessed line articulate the terrace slab.
    facadeSolid(shell,0,y-.07,z+6.27,48.9,.06,.12,concrete);
    facadeSolid(shell,0,y-.18,z+6.31,48.8,.022,.035,joint);
    facadeSolid(shell,0,y+.3,z+5.45,48,.55,.35,timber);
    facadeSolid(shell,0,y+2.84,z+5.68,47.8,.16,.36,timber);
    facadeSolid(shell,0,y+.61,z+5.47,47.5,.06,.08,metal);
    facadeSolid(shell,0,y+2.76,z+5.47,47.5,.06,.08,metal);
    const bays=20,pitch=47.5/bays;
    for(let i=0;i<=bays;i++){
      const x=-23.75+i*pitch;
      facadeSolid(shell,x,y+1.65,z+5.72,.11,2.55,.32,timber);
      facadeSolid(shell,x,y+1.685,z+5.47,.14,2.22,.08,metal);
      if(i<bays){
        glazing(shell,x+pitch/2,y+1.685,z+5.43,pitch-.14,2.07,true);
        if((i+index)%3===0)for(const offset of [.34,.62]){
          const fin=facadeSolid(shell,x+offset,y+1.66,z+5.9,.12,2.42,.34,timber);fin.rotation.y=(index%2?-.12:.12);
        }
      }
    }
    // Construction joints on the opaque rear facade, no invented rear windows.
    for(let x=-21;x<=21;x+=3)facadeSolid(shell,x,y+1.35,z-5.609,.018,2.6,.012,joint);
    const roof=box(shell,0,y+3.02,z,50,.34,13.4,'roofgreen');roof.rotation.z=(index%2?-.012:.012);roofs.push(roof);
    roof.name='planted-roof-'+index;roof.receiveShadow=true;roof.geometry=geo.clone();
    const roofUV=roof.geometry.attributes.uv;
    for(let i=0;i<roofUV.count;i++)if(Math.floor(i/4)!==2)roofUV.setXY(i,roofUV.getX(i),.008);else roofUV.setXY(i,index%2?1-roofUV.getX(i):roofUV.getX(i),index%3?roofUV.getY(i):1-roofUV.getY(i));
    for(let i=0;i<280;i++){
      const seed=i+index*401,px=(landscapeHash(seed+73)-.5)*48,pz=(landscapeHash(seed+1091)-.5)*12;
      if(index===5&&Math.abs(px)<20&&Math.abs(pz)<4.2)continue;
      const plant=new T.Object3D(),size=.75+landscapeHash(seed+311)*.7;
      plant.position.set(px*Math.cos(roof.rotation.z)-.17*Math.sin(roof.rotation.z),y+3.02+px*Math.sin(roof.rotation.z)+.17*Math.cos(roof.rotation.z),z+pz);
      plant.rotation.y=landscapeHash(seed+127)*Math.PI*2;plant.scale.set(size,size,size);plant.updateMatrix();roofPlantMatrices.push(plant.matrix.clone());
      roofPlantColors.push(new T.Color().setRGB(.75+landscapeHash(seed+61)*.25,.8+landscapeHash(seed+41)*.2,.62+landscapeHash(seed+71)*.25));
    }
    // La rive de toiture forme le chemin continu visible sur les photographies.
    box(shell,0,y+3.24,z+5.2,49,.12,2.2,'green');
    box(shell,-23.5,y+3.58,z+5.2,1.2,.72,2.2,'green');
    box(shell,23.5,y+3.58,z+5.2,1.2,.72,2.2,'green');
  }
  shellLevels.forEach(([,y,z],i)=>exteriorBand(y,z,i));
  // Toiture haute et panneaux photovoltaïques — 126 panneaux existent sur le
  // bâtiment réel ; un échantillon lisible représente ici leur implantation.
  for(let x=-18;x<=18;x+=4.5)for(let z=-21;z<=-15;z+=3){const pv=box(shell,x,3.02+Math.sin(-.012)*x+.17*Math.cos(-.012)+.28,z,3.5,.1,1.8,'pv');pv.rotation.set(-.12,0,-.012);pv.castShadow=true;pv.receiveShadow=true;}
  // Escaliers/rampes végétalisés qui relient visuellement les terrasses.
  for(let i=0;i<shellLevels.length-1;i++){
    const [,y1,z1]=shellLevels[i],[,y2,z2]=shellLevels[i+1],r=new T.Group();shell.add(r);
    const length=Math.hypot(z2-z1,y2-y1),midY=(y1+y2)/2+3.18,midZ=(z1+z2)/2+5.15;
    const deck=box(r,0,midY,midZ,8,.22,length,'roofgreen');deck.rotation.x=Math.atan2(y2-y1,z2-z1);
    for(const side of [-1,1])box(r,side*4,midY+.35,midZ,.12,.7,length,'wood').rotation.x=deck.rotation.x;
  }
  const tuftVertices=[];
  for(let leaf=0;leaf<3;leaf++){
    const angle=leaf*Math.PI*2/3,dx=Math.cos(angle),dz=Math.sin(angle),sx=-dz*.085,sz=dx*.085;
    const a=[-dx*.05,0,-dz*.05],b=[dx*.12+sx,.06,dz*.12+sz],tip=[dx*.25,.13,dz*.25],c=[dx*.12-sx,.06,dz*.12-sz];
    for(const v of [a,b,tip,a,tip,c])tuftVertices.push(...v);
  }
  const tuftGeometry=new T.BufferGeometry();tuftGeometry.setAttribute('position',new T.Float32BufferAttribute(tuftVertices,3));tuftGeometry.computeVertexNormals();
  const plantedRoofs=new T.InstancedMesh(tuftGeometry,new T.MeshStandardMaterial({color:0x82916b,roughness:1,envMapIntensity:.08,side:T.DoubleSide}),roofPlantMatrices.length);
  plantedRoofs.name='roof-sedum-clumps';plantedRoofs.receiveShadow=false;
  roofPlantMatrices.forEach((matrix,i)=>{plantedRoofs.setMatrixAt(i,matrix);plantedRoofs.setColorAt(i,roofPlantColors[i]);});plantedRoofs.instanceMatrix.needsUpdate=true;plantedRoofs.instanceColor.needsUpdate=true;shell.add(plantedRoofs);
  const landscape=new T.Group();landscape.name='jura-landscape';scene.add(landscape);
  const heightAt=(x,z)=>{
    const outside=Math.max(T.MathUtils.smoothstep(Math.abs(x),28,58),T.MathUtils.smoothstep(Math.abs(z),46,95));
    const broad=smoothField(x*.014+17,z*.014+9),medium=smoothField(x*.047-5,z*.047+11);
    return -9.1+outside*(2+broad*10+medium*1.8)+Math.sin(x*.03)*Math.sin(z*.028)*.32;
  };
  const clusters=[[-53,39],[-67,-24],[-45,-73],[58,37],[77,-24],[49,-74]];
  const trees=Array.from({length:100},(_,i)=>{
    const center=clusters[i%clusters.length];let x=Math.sign(center[0])*Math.max(32,Math.abs(center[0])+(landscapeHash(i+17)-.5)*31),z=center[1]+(landscapeHash(i+83)-.5)*49;
    // Leave the foreground sightline to the hotel open, including the crown width.
    if(x>0&&.63*x+.78*z>48)x=Math.max(x,(35+.63*z)/.78);
    return{x,z,width:.8+landscapeHash(i+221)*.45,height:.74+landscapeHash(i+317)*.8};
  });
  const terrainGeo=new T.PlaneGeometry(320,280,64,56);terrainGeo.rotateX(-Math.PI/2);
  const positions=terrainGeo.attributes.position,colors=new Float32Array(positions.count*3),tone=new T.Color();
  for(let i=0;i<positions.count;i++){
    const x=positions.getX(i),z=positions.getZ(i);positions.setY(i,heightAt(x,z));
    const meadow=smoothField(x*.025+8,z*.025-4),patch=smoothField(x*.085,z*.085),variation=.76+meadow*.32;
    let contact=0;for(const tree of trees){const d=(x-tree.x)**2+(z-tree.z)**2;contact=Math.max(contact,.16*Math.exp(-d/13));}
    tone.setRGB((variation+patch*.025)*(1-contact),(variation+.04)*(1-contact),(variation-.08+patch*.07)*(1-contact));tone.toArray(colors,i*3);
  }
  terrainGeo.setAttribute('color',new T.BufferAttribute(colors,3));terrainGeo.computeVertexNormals();
  const grassMap=groundScan||vegetationMap();grassMap.colorSpace=T.SRGBColorSpace;grassMap.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());grassMap.wrapS=grassMap.wrapT=T.RepeatWrapping;grassMap.repeat.set(40,35);
  const terrain=new T.Mesh(terrainGeo,new T.MeshStandardMaterial({map:grassMap,vertexColors:true,roughness:1,envMapIntensity:.08}));terrain.name='jura-meadow';terrain.receiveShadow=true;landscape.add(terrain);
  // Serrated, drooping boughs: a full crown with fewer triangles than the old fans.
  const vertices=[],treeColors=[];
  const triangle=(a,b,c,shade)=>{for(const p of [a,b,c]){vertices.push(...p);treeColors.push(.075*shade,.155*shade,.085*shade);}};
  for(let tier=0;tier<8;tier++){
    const y=.85+tier*.69,r=(1-tier/9)*1.35;
    for(let branch=0;branch<6;branch++){
      const seed=tier*31+branch*7,angle=branch*Math.PI/3+tier*1.91,length=r*(.78+landscapeHash(seed+5)*.25),root=[0,y+.22,0];
      const edge=[[-.48,.68,-.12],[-.18,.96,-.16],[0,1.1,-.27],[.18,.94,-.18],[.48,.67,-.13]].map(([a,l,h])=>[Math.cos(angle+a)*length*l,y+h,Math.sin(angle+a)*length*l]);
      for(let i=0;i<edge.length-1;i++)triangle(root,edge[i],edge[i+1],.85+tier*.025+(i%2)*.17);
    }
  }
  triangle([0,6.15,0],[-.17,5.45,.08],[.17,5.45,-.08],1.1);
  triangle([0,6.15,0],[.08,5.45,.17],[-.08,5.45,-.17],.95);
  const treeGeo=new T.BufferGeometry();treeGeo.setAttribute('position',new T.Float32BufferAttribute(vertices,3));treeGeo.setAttribute('color',new T.Float32BufferAttribute(treeColors,3));treeGeo.computeVertexNormals();
  const forest=new T.InstancedMesh(treeGeo,new T.MeshStandardMaterial({vertexColors:true,roughness:1,envMapIntensity:.08,side:T.DoubleSide}),trees.length);forest.name='jura-firs';forest.castShadow=true;forest.receiveShadow=true;
  const trunks=new T.InstancedMesh(new T.CylinderGeometry(.035,.14,6.1,6),new T.MeshStandardMaterial({map:timberFinish,color:0x665548,roughness:1,envMapIntensity:.08}),trees.length);trunks.name='jura-trunks';trunks.castShadow=true;trunks.receiveShadow=true;
  const dummy=new T.Object3D(),groundRay=new T.Raycaster();groundRay.ray.direction.set(0,-1,0);terrain.updateMatrixWorld(true);
  trees.forEach((tree,i)=>{
    groundRay.ray.origin.set(tree.x,50,tree.z);const groundHit=groundRay.intersectObject(terrain,false)[0];
    dummy.position.set(tree.x,groundHit?.point.y??heightAt(tree.x,tree.z),tree.z);dummy.rotation.set(0,i*2.399,0);dummy.scale.set(tree.width,tree.height,tree.width);dummy.updateMatrix();forest.setMatrixAt(i,dummy.matrix);
    forest.setColorAt(i,new T.Color().setRGB(.83+landscapeHash(i+811)*.17,.86+landscapeHash(i+947)*.14,.76+landscapeHash(i+411)*.18));
    dummy.position.y+=3.05*tree.height;dummy.updateMatrix();trunks.setMatrixAt(i,dummy.matrix);
  });
  forest.instanceColor.needsUpdate=true;forest.instanceMatrix.needsUpdate=true;trunks.instanceMatrix.needsUpdate=true;landscape.add(forest,trunks);
  // Baked contact occlusion; scanned floor maps are shared and sun shadows cached separately.
  for(const room of roomGroups){
    const {x,z,w,d,floor:floorMesh}=room.userData,c=document.createElement('canvas');
    c.width=w>19?512:256;c.height=128;const ctx=c.getContext('2d'),sx=c.width/w,sz=c.height/d;
    ctx.fillStyle='#ffffff';ctx.fillRect(0,0,c.width,c.height);
    room.updateMatrixWorld(true);const inverse=room.matrixWorld.clone().invert();
    room.traverse(o=>{
      if(!o.isMesh||o===floorMesh||o.userData.lightingEffect||o.material.transparent)return;
      o.geometry.computeBoundingBox();const b=o.geometry.boundingBox.clone().applyMatrix4(new T.Matrix4().multiplyMatrices(inverse,o.matrixWorld));
      const size=b.getSize(new T.Vector3());if(b.min.y<.05||b.min.y>.9||b.max.y>1.9||size.x>8||size.z>5)return;
      const cx=(b.min.x+b.max.x)/2,cz=(b.min.z+b.max.z)/2,rx=Math.max(.22,size.x*.7)*sx,rz=Math.max(.22,size.z*.7)*sz;
      ctx.save();ctx.translate((cx-x+w/2)*sx,(cz-z+d/2)*sz);ctx.scale(rx,rz);
      const gradient=ctx.createRadialGradient(0,0,.12,0,0,1);gradient.addColorStop(0,'rgba(21,14,9,.44)');gradient.addColorStop(.5,'rgba(21,14,9,.23)');gradient.addColorStop(1,'rgba(21,14,9,0)');ctx.fillStyle=gradient;ctx.fillRect(-1,-1,2,2);ctx.restore();
    });
    const edge=ctx.createLinearGradient(0,0,0,sz*.65);edge.addColorStop(0,'rgba(25,17,11,.47)');edge.addColorStop(1,'rgba(25,17,11,0)');ctx.fillStyle=edge;ctx.fillRect(0,0,c.width,sz*.65);
    const side=ctx.createLinearGradient(0,0,sx*.6,0);side.addColorStop(0,'rgba(25,17,11,.33)');side.addColorStop(1,'rgba(25,17,11,0)');ctx.fillStyle=side;ctx.fillRect(0,0,sx*.6,c.height);
    const texture=new T.CanvasTexture(c);texture.channel=1;
    const geometry=geo.clone(),uv=geometry.attributes.uv;geometry.setAttribute('uv1',uv.clone());
    for(let i=0;i<uv.count;i++){const face=Math.floor(i/4);uv.setXY(i,uv.getX(i)*(face<2?d:w)/1.7,uv.getY(i)*(face===2||face===3?d:.08)/1.7);}
    const material=new T.MeshStandardMaterial({color:oakColor?0xffffff:0x957557,map:oakColor,normalMap:oakNormal,normalScale:new T.Vector2(.32,.32),roughnessMap:oakRoughness,roughness:.94,aoMap:texture,aoMapIntensity:1,envMapIntensity:.16});
    floorMesh.geometry=geometry;floorMesh.scale.set(w,.08,d);floorMesh.material=material;
  }
  // Keep light slots stable across room selection, disabling unused contributions.
  // This avoids separate shader families for 1, 2, 5 and 20 visible room lights.
  scene.updateMatrixWorld(true);
  for(const room of roomGroups){
    const sources=[];room.traverse(o=>{if(o.isPointLight||o.isSpotLight)sources.push(o);});
    for(const light of sources){
      light.userData.room=room;scene.attach(light);
      if(light.isSpotLight)scene.attach(light.target);
    }
  }
  // Batch furniture independently for each level; keep roofs and lighting controllable.
  function batch(group,deep=true){
    group.updateMatrixWorld(true);const groups=new Map(),inverse=group.matrixWorld.clone().invert();
    const collect=o=>{if(!o.isMesh||o.isInstancedMesh||o.userData.curtain||o.userData.curtainPart||o.userData.lightingEffect||roofs.includes(o))return;const key=o.geometry.uuid+o.material.uuid+Boolean(o.userData.ceilingFixed);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(o);};
    if(deep)group.traverse(collect);else group.children.forEach(collect);
    for(const list of groups.values()){if(list.length<2)continue;const inst=new T.InstancedMesh(list[0].geometry,list[0].material,list.length);inst.name=list[0].name;inst.castShadow=list[0].castShadow;inst.receiveShadow=list[0].receiveShadow;inst.userData.ceilingFixed=Boolean(list[0].userData.ceilingFixed);list.forEach((m,i)=>{inst.setMatrixAt(i,new T.Matrix4().multiplyMatrices(inverse,m.matrixWorld));m.removeFromParent();});inst.instanceMatrix.needsUpdate=true;group.add(inst);}
  }
  for(const g of roomGroups)g.traverse(o=>{if(o.isMesh){o.castShadow=!o.material.transparent&&!o.material.emissive?.getHex()&&!o.userData.lightingEffect&&!o.userData.curtain&&!o.userData.ceilingFixed&&!roofs.includes(o);o.receiveShadow=!o.material.transparent&&!o.userData.lightingEffect;}});
  roomGroups.forEach(g=>batch(g));Object.values(levels).forEach(g=>batch(g,false));batch(shell);batch(scene,false);
  let radius=145,theta=.64,phi=.85,auto=false,night=false,dayNightCycle=true,cut=true,drag=null,visible=true;
  let selectedId='550',selectedZone='bar',view='overview',tween=null,lastPhase='',detailZoom=0;
  let warming=true,pendingFocus=null;
  const zoneTargets={bar:{id:'550',x:-16,radius:30},entrance:{id:'550',x:13,radius:38},restaurant:{id:'350',x:-9,radius:43},salon:{id:'350',x:8,radius:27},pdr:{id:'350',x:17,radius:27},wellness:{id:'250',x:4,radius:45},seminar:{id:'450',x:10,radius:42}};
  const overviewPose=()=>({target:new T.Vector3(0,-1,0),radius:150,theta:.68,phi:1.04});
  function fittedRadius(center,bounds,theta,phi){
    const v=background&&viewport?viewport:{w:canvas.clientWidth,h:canvas.clientHeight};
    const tangent=Math.tan(camera.fov*Math.PI/360),height=canvas.clientHeight||900;
    const direction=new T.Vector3(Math.sin(phi)*Math.sin(theta),Math.cos(phi),Math.sin(phi)*Math.cos(theta));
    const right=new T.Vector3().crossVectors(new T.Vector3(0,1,0),direction).normalize(),up=new T.Vector3().crossVectors(direction,right);
    let distance=1;
    for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z]){
      const q=new T.Vector3(x,y,z).sub(center),depth=q.dot(direction);
      distance=Math.max(distance,depth+Math.abs(q.dot(right))*height/(Math.max(120,v.w)*tangent)*1.12,depth+Math.abs(q.dot(up))*height/(Math.max(120,v.h)*tangent)*1.12);
    }
    return distance;
  }
  const focusedRooms=(id,zone)=>roomGroups.filter(g=>g.userData.id===id&&g.userData.zone===zone);
  const roomPose=(id,zone)=>{
    let rooms=focusedRooms(id,zone);if(!rooms.length)rooms=roomGroups.filter(g=>g.userData.id===id);
    const bounds=new T.Box3();
    for(const g of rooms){const {x,z,w,d}=g.userData,y=levels[id].position.y;bounds.expandByPoint(new T.Vector3(x-w/2-.4,y-.3,levels[id].position.z+z-d/2-.3));bounds.expandByPoint(new T.Vector3(x+w/2+.4,y+3.3,levels[id].position.z+z+d/2+.4));}
    const center=bounds.getCenter(new T.Vector3()),theta=.25,phi=1.08;
    return{target:center,radius:fittedRadius(center,bounds,theta,phi)*.78,theta,phi};
  };
  const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
  function showView(mode,id){
    view=mode;selectedId=id||selectedId;const all=mode==='overview';
    for(const [key,g]of Object.entries(levels)){g.visible=all||key===selectedId;g.traverse(o=>{if(o.userData.roomLabel)o.visible=!all&&key===selectedId;if(o.name==='room-glazing')o.visible=!all&&key===selectedId;if(o.userData.ceilingFixed)o.visible=all||!cut;});}
    const isolated=focusedRooms(selectedId,selectedZone);
    roomGroups.forEach(g=>{g.visible=all||g.userData.id===selectedId&&(!isolated.length||isolated.includes(g));});
    Object.values(levels).forEach(g=>g.children.forEach(o=>{if(o.isMesh)o.visible=all;}));
    roomLighting.forEach(group=>updateRoomEnvironment(group));
    landscape.visible=all;
    shell.visible=all;roofs.forEach(r=>r.visible=all?r.parent===shell:!cut&&r.parent.userData.id===selectedId);
    const active=all?roomGroups:roomGroups.filter(g=>g.visible&&g.userData.id===selectedId);
    const bounds=new T.Box3();
    for(const g of active){const {x,z,w,d}=g.userData,y=levels[g.userData.id].position.y,oz=levels[g.userData.id].position.z;bounds.expandByPoint(new T.Vector3(x-w/2,y-.4,z+oz-d/2));bounds.expandByPoint(new T.Vector3(x+w/2,y+3,z+oz+d/2));}
    const center=bounds.getCenter(new T.Vector3()),size=bounds.getSize(new T.Vector3()),extent=Math.max(size.x,size.z)*.75+3;
    sun.target.position.copy(center);sun.position.copy(center).add(new T.Vector3(-30,60,35));scene.add(sun.target);
    Object.assign(sun.shadow.camera,{left:-extent,right:extent,top:extent,bottom:-extent});sun.shadow.camera.updateProjectionMatrix();sun.shadow.needsUpdate=true;renderer.shadowMap.needsUpdate=true;
    document.getElementById('status').textContent=all?'Vue complète de l’hôtel · enveloppe interprétée':'Niveau '+selectedId+' · aménagement d’après le plan';
  }
  function fly(pose,duration=.95,onDone){tween={from:{target:target.clone(),radius,theta,phi},to:pose,start:performance.now(),duration:duration*1000,onDone};}
  function overview(){detailZoom=0;showView('overview');fly(overviewPose(),1.25);}
  function focus(id=selectedId,zone=selectedZone,immediate=false){if(!levels[id])return;detailZoom=0;selectedId=id;selectedZone=zone||selectedZone;showView('room',id);const p=roomPose(id,selectedZone);if(immediate){target.copy(p.target);radius=p.radius;theta=p.theta;phi=p.phi;tween=null;}else fly(p,1.35);}
  function progressiveFocus(){if(view!=='room'){focus(selectedId,selectedZone);return;}detailZoom=Math.min(3,detailZoom+1);const pose=roomPose(selectedId,selectedZone);pose.radius*=Math.pow(.84,detailZoom);fly(pose,.7);}
  function select(id){if(id==='all'){overview();return;}focus(id,null);}
  const floor=document.getElementById('floor');floor.onchange=()=>select(floor.value);
  document.getElementById('cut').onclick=e=>{cut=!cut;roofs.forEach(r=>r.visible=view==='overview'?r.parent===shell:!cut&&r.parent.userData.id===selectedId);roomGroups.forEach(g=>g.traverse(o=>{if(o.userData.ceilingFixed)o.visible=view==='overview'||!cut;}));sun.shadow.needsUpdate=true;renderer.shadowMap.needsUpdate=true;e.currentTarget.setAttribute('aria-pressed',cut)};
  document.getElementById('night').onclick=e=>{dayNightCycle=!dayNightCycle;e.currentTarget.setAttribute('aria-pressed',dayNightCycle);e.currentTarget.textContent=dayNightCycle?'Cycle jour/nuit':'Cycle en pause'};
  document.getElementById('rotate').onclick=e=>{auto=!auto;e.currentTarget.setAttribute('aria-pressed',auto)};
  document.getElementById('reset').onclick=()=>{theta=.64;phi=.85;select(floor.value)};
  canvas.onpointerdown=e=>{drag={x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId)};
  canvas.onpointermove=e=>{if(!drag)return;theta-=(e.clientX-drag.x)*.006;phi=Math.max(.22,Math.min(1.4,phi+(e.clientY-drag.y)*.004));drag={x:e.clientX,y:e.clientY};};canvas.onpointerup=canvas.onpointercancel=()=>{drag=null};
  canvas.addEventListener('wheel',e=>{e.preventDefault();if(background)return;if(e.deltaY>0)overview();else progressiveFocus();},{passive:false});
  function updateRoomEnvironment(group){group.points.forEach(light=>{light.intensity=light.userData.room.visible?group.level*.045:0});const closed=Math.max(0,Math.min(1,(group.blinds||0)/100)),off=1-Math.max(0,Math.min(1,group.level/100)),dayFactor=night?.08:1;const blackness=Math.min(.965,off*closed*.965);group.darkness.forEach(screen=>{screen.material.opacity=blackness*(screen.userData.darknessScale??1);screen.visible=blackness>.008});group.natural.forEach(light=>{light.intensity=light.userData.room.visible?(1-closed)*2.1*dayFactor:0});group.beams.forEach(beam=>{beam.material.opacity=(1-closed)*.012*dayFactor;beam.visible=beam.material.opacity>.005});}
  function paintRoomLighting(group,level){group.level=level;group.materials.forEach(item=>{item.material.emissiveIntensity=item.factor*(.015+level/65);item.material.color.setHex(level?item.material.emissive.getHex():0x211e1b)});group.points.forEach(light=>{light.intensity=level*.045});updateRoomEnvironment(group);}
  function setRoomLighting(zone,level,sceneId=null){const group=roomLighting.get(zone);if(!group)return;const targetLevel=Math.max(0,Math.min(100,Number(level)||0)),sceneChanged=sceneId!==null&&sceneId!==group.scene;if(sceneChanged){group.fade={from:group.level,to:targetLevel,start:performance.now(),duration:4000};group.scene=sceneId;}else if(!group.fade||sceneId===null){group.fade=null;group.scene=sceneId;paintRoomLighting(group,targetLevel);}}
  function updateRoomLighting(now){roomLighting.forEach(group=>{if(group.fade){const q=Math.min(1,(now-group.fade.start)/group.fade.duration),k=q*q*(3-2*q);paintRoomLighting(group,T.MathUtils.lerp(group.fade.from,group.fade.to,k));if(q>=1)group.fade=null;}else updateRoomEnvironment(group);});}
  function setCurtains(zone,closed){const percent=Math.max(0,Math.min(100,Number(closed)||0)),value=percent/100;for(const panel of curtains.get(zone)||[]){const width=.38+(panel.userData.width/2-.38)*value;panel.scale.x=width;panel.position.x=panel.userData.center+panel.userData.side*(panel.userData.width/2-width/2);}const group=roomLighting.get(zone);if(group){group.blinds=percent;updateRoomEnvironment(group);}}
  window.addEventListener('message',e=>{if(e.origin!==location.origin||e.source!==parent)return;const m=e.data;if(m?.channel==='hdh-view'){if(typeof m.visible==='boolean')visible=m.visible;if(m.viewport){viewport=m.viewport;if(view==='room'){const pose=roomPose(selectedId,selectedZone);pose.radius*=Math.pow(.84,detailZoom);fly(pose,.25);}}if(Number.isFinite(m.zoom)){if(m.zoom>0)overview();else progressiveFocus();}}if(m?.channel==='hdh-demo'){const z=zoneTargets[m.zone],id=z?.id;if(background&&m.focus&&id){if(warming)pendingFocus={id,zone:m.zone};else if(m.zone!==window.HDH_ZONE){window.HDH_ZONE=m.zone;focus(id,m.zone)}}setRoomLighting(m.zone,m.level,m.scene);setCurtains(m.zone,m.blinds);}});
  window.addEventListener('keydown',e=>{if(e.key==='Escape')parent.postMessage({channel:'hdh-close'},location.origin)});
  const dayColor=new T.Color('#283d43'),exteriorDayColor=new T.Color('#93a6aa'),nightColor=new T.Color('#07111c'),reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
  let last=0;
  function frame(now){requestAnimationFrame(frame);if(document.hidden||!visible)return;const w=canvas.clientWidth,h=canvas.clientHeight;if(!w||!h)return;if(canvas.width!==Math.round(w*renderer.getPixelRatio())||canvas.height!==Math.round(h*renderer.getPixelRatio())){renderer.setSize(w,h,false);}camera.aspect=w/h;updateRoomLighting(now);const reflectionDay=T.MathUtils.clamp(hemi.intensity/1.2,.15,1);mats.glass.envMapIntensity=.75*reflectionDay;mats.facadeGlass.envMapIntensity=.9*reflectionDay;mats.facadeMetal.envMapIntensity=.3*reflectionDay;if(dayNightCycle){const phase=Math.floor(now/30000)%2?'night':'day';if(phase!==lastPhase){lastPhase=phase;night=phase==='night';document.body.dataset.phase=phase;}const goalHemi=night?.25:1.2,goalSun=night?.04:1.9;hemi.intensity+= (goalHemi-hemi.intensity)*.035;sun.intensity+=(goalSun-sun.intensity)*.035;}scene.background.lerp(night?nightColor:view==='overview'?exteriorDayColor:dayColor,.035);scene.fog.color.copy(scene.background);if(tween){const q=Math.min(1,(now-tween.start)/tween.duration),k=ease(q);target.copy(tween.from.target).lerp(tween.to.target,k);radius=T.MathUtils.lerp(tween.from.radius,tween.to.radius,k);theta=T.MathUtils.lerp(tween.from.theta,tween.to.theta,k);phi=T.MathUtils.lerp(tween.from.phi,tween.to.phi,k);if(q===1){const done=tween.onDone;tween=null;done?.();}}if(auto&&!reducedMotion.matches)theta+=Math.min((now-last)/1000,.05)*.1;last=now;const distance=view==='room'?radius:background&&viewport?radius*1.18/Math.min(1,viewport.w/viewport.h):radius;camera.position.set(target.x+distance*Math.sin(phi)*Math.sin(theta),target.y+distance*Math.cos(phi),target.z+distance*Math.sin(phi)*Math.cos(theta));camera.lookAt(target);if(background&&viewport){const v=viewport;camera.setViewOffset(w,h,w/2-(v.x+v.w/2),h/2-(v.y+v.h/2),w,h);}else if(camera.view?.enabled)camera.clearViewOffset();camera.updateProjectionMatrix();renderer.render(scene,camera);}
  roomLighting.forEach((_,zone)=>setRoomLighting(zone,65));curtains.forEach((_,zone)=>setCurtains(zone,0));
  const probeStart=performance.now();
  showView('overview');
  const probeTarget=new T.WebGLCubeRenderTarget(128,{generateMipmaps:false});probeTarget.texture.colorSpace=T.SRGBColorSpace;
  const probeCamera=new T.CubeCamera(.5,450,probeTarget);probeCamera.position.set(0,1.5,0);
  shell.visible=false;Object.values(levels).forEach(g=>g.visible=false);
  roomLighting.forEach(group=>{group.points.forEach(light=>{light.intensity=0;});group.natural.forEach(light=>{light.intensity=0;});});
  renderer.shadowMap.enabled=false;
  probeCamera.update(renderer,scene);facadeProbe.captures++;
  const reflectionFilter=new T.PMREMGenerator(renderer),reflection=reflectionFilter.fromCubemap(probeTarget.texture);
  facadeProbe.texture=reflection.texture;
  for(const material of [mats.glass,mats.facadeGlass,mats.facadeConcrete,mats.facadeWood,mats.facadeMetal])material.envMap=reflection.texture;
  reflectionFilter.dispose();probeTarget.dispose();renderer.shadowMap.enabled=true;
  showView('overview');facadeProbe.preparationMs=performance.now()-probeStart;
  // Compile once before exposing navigation; every view uses identical light slots.
  const warmupStart=performance.now();
  showView('overview');await renderer.compileAsync(scene,camera);
  const warmupMs=performance.now()-warmupStart;warming=false;
  const initial=overviewPose();target.copy(initial.target);radius=initial.radius;theta=initial.theta;phi=initial.phi;requestAnimationFrame(frame);window.HDH_MODEL={warmupMs,facadeProbe,facadePanes,levels,roofs,shell,lights,select,overview,focus,progressiveFocus,renderer,scene,camera,roomLighting,curtains,navigation:()=>({view,selectedId,selectedZone,radius,detailZoom,phase:document.body.dataset.phase,dayNightCycle})};if(pendingFocus){window.HDH_ZONE=pendingFocus.zone;focus(pendingFocus.id,pendingFocus.zone,true);}parent.postMessage({channel:'hdh-ready'},location.origin);
})();
