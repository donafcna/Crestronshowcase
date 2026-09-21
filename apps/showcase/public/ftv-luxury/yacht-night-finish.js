/* global skin, scene, sea, sky, M, pearlPaint, skinGlass, hemisphere, sun, fill, yachtShape, mode */
/* Night art direction for the existing interactive yacht. No camera changes,
 * no new renderer, no bloom pass and no texture downloads. Surface illumination
 * is an analytic, circuit-driven approximation of baked indirect light, not GI.
 */
(function () {
  'use strict';
  const ext = window.__ftvYachtExterior, T = window.THREE, core = window.FTV_YACHT_EXTERIOR;
  if (!ext?.finalized || ext.nightFinish) return;
  const root = ext.root, warm = new T.Color('#ffcb8b');
  const materialById = new Map();
  root.traverse(o => {
    if (o.material?.name.startsWith('Exterior · ') && !o.material.map) materialById.set(o.material.name.slice(11), o.material);
  });
  // Use the ACTUAL cap shapes. Earlier curves were recessed inside the opaque
  // deck slabs, hiding most of the warm strips at the overview camera distance.
  const rows = [
    { id:'led_swim', a:-42.7, b:-37.4, w:10.1, y:.61, nose:1.2, tail:1.8, paths:['stairs_stern_port','stairs_stern_starboard'], lounge:'lounge_main' },
    { id:'led_main', a:-38.5, b:-24.7, w:13.15, y:3.91, nose:2, tail:3, paths:['walk_main_port','walk_main_starboard'], lounge:'lounge_main' },
    { id:'led_owner', a:-33.2, b:25.2, w:13.2, y:7.35, nose:5.2, tail:3, paths:['walk_owner_port','walk_owner_starboard'], lounge:'lounge_owner' },
    { id:'led_bridge', a:-27, b:21.7, w:11.9, y:10.79, nose:5.3, tail:3.2, paths:['walk_bridge_port','walk_bridge_starboard'], lounge:'lounge_bridge' },
    { id:'led_sundeck', a:-21.8, b:15.7, w:10, y:14.18, nose:4.1, tail:3.4, paths:['walk_sundeck_port','walk_sundeck_starboard'], lounge:'bar_sundeck' },
    { id:'led_roof', a:-7.1, b:5.2, w:9.2, y:17.12, nose:4, tail:4.2, paths:['mast_uplight','mast_crown'], lounge:'mast_uplight' }
  ];
  const ids = new Set(rows.map(r => r.id));
  const removed = [];
  root.traverse(o => {
    if (!o.isMesh) return;
    const id = o.material?.name.slice(11);
    if (o.geometry.type === 'TubeGeometry' && (ids.has(id) || o.material.isMeshBasicMaterial)) removed.push(o);
    // Remove visible air cones only; keep the moving-head fixtures and lenses.
    if (o.material.isShaderMaterial && o.geometry.type === 'CylinderGeometry' && o.geometry.parameters.height === 9) removed.push(o);
  });
  for (const o of removed) o.removeFromParent();
  const glows = [], edges = [];
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const ctx = c.getContext('2d'), gradient = ctx.createRadialGradient(32,32,0,32,32,32);
  gradient.addColorStop(0,'rgba(255,255,255,1)'); gradient.addColorStop(.15,'rgba(255,255,255,.65)'); gradient.addColorStop(.45,'rgba(255,255,255,.13)'); gradient.addColorStop(1,'rgba(255,255,255,0)');
  ctx.fillStyle = gradient; ctx.fillRect(0,0,64,64);
  const glowTexture = new T.CanvasTexture(c); glowTexture.colorSpace = T.SRGBColorSpace;
  for (const r of rows) {
    const points = yachtShape(r.a-.025,r.b+.025,r.w+.10,r.nose,r.tail).getSpacedPoints(160).slice(0,-1).map(p => new T.Vector3(p.x,r.y-.035,p.y));
    const curve = new T.CatmullRomCurve3(points,true,'centripetal');
    const edge = new T.Mesh(new T.TubeGeometry(curve,320,.065,6,true),materialById.get(r.id));
    edge.name = 'Visible deck lip · '+r.id; edge.castShadow = false; root.add(edge); edges.push(edge);
    const positions = curve.getSpacedPoints(400).map(p => [p.x,p.y,p.z]).flat();
    const g = new T.BufferGeometry(); g.setAttribute('position',new T.Float32BufferAttribute(positions,3));
    const m = new T.PointsMaterial({color:warm,map:glowTexture,transparent:true,opacity:0,size:.62,sizeAttenuation:true,depthTest:true,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false});
    const glow = new T.Points(g,m); glow.name='Soft deck optics · '+r.id; root.add(glow); glows.push({id:r.id,mesh:glow});
  }
  const U = {
    nightDecks:{value:rows.map(r => new T.Vector4(r.a,r.b,r.y,r.w))},
    nightLevels:{value:rows.map(() => new T.Vector4())},
    nightPools:{value:new T.Vector2()},
    nightTime:{value:0},nightWarm:{value:warm}
  };
  const declarations = 'varying vec3 nightWorld,nightNormal; uniform vec4 nightDecks[6],nightLevels[6]; uniform vec2 nightPools; uniform vec3 nightWarm; uniform float nightTime;\n';
  const clones = new Map(), surfaces = [];
  function surfaceMaterial(original,kind) {
    const key=original.uuid+'|'+kind;
    if (clones.has(key)) return clones.get(key);
    const m=original.clone();m.name=original.name+' · night surface';
    const prior=original.onBeforeCompile;
    m.onBeforeCompile = shader => {
      prior?.call(m,shader);
      Object.assign(shader.uniforms,U);
      shader.vertexShader='varying vec3 nightWorld,nightNormal;\n'+shader.vertexShader;
      shader.vertexShader=shader.vertexShader.replace('#include <worldpos_vertex>',`#include <worldpos_vertex>
        vec4 nw=vec4(transformed,1.);
        #ifdef USE_INSTANCING
          nw=instanceMatrix*nw;
        #endif
        nightWorld=(modelMatrix*nw).xyz;
        nightNormal=normalize(mat3(modelMatrix)*objectNormal);
      `);
      shader.fragmentShader=declarations+shader.fragmentShader;
      let effect='';
      if(kind==='pool')effect=`
        float level=nightWorld.y>12.?nightPools.y:nightPools.x;
        float ripples=.78+.12*sin(nightWorld.x*9.+sin(nightWorld.z*5.)+nightTime*.7)+.10*sin(nightWorld.z*8.-nightTime*.6);
        totalEmissiveRadiance+=vec3(.015,.48,.64)*level*ripples;
      `;
      else if(kind==='glazing')effect=`
        float level=nightWorld.y>13.?nightLevels[4].w:nightWorld.y>10.?nightLevels[3].w:nightWorld.y>7.5?nightLevels[2].w:nightLevels[1].w;
        float cell=floor(nightWorld.x*.38),pane=fract(nightWorld.x*.38);
        float lit=step(.36,fract(sin(cell*12.9898)*43758.5453));
        float mullion=smoothstep(.025,.075,pane)*(1.-smoothstep(.92,.98,pane));
        totalEmissiveRadiance+=nightWarm*level*mullion*(.035+.46*lit);
      `;
      else effect=`
        vec3 p=nightWorld;float bounce=0.;
        for(int i=0;i<6;i++){
          vec4 d=nightDecks[i],l=nightLevels[i];float dy=p.y-d.z;
          float along=smoothstep(d.x-1.,d.x+1.,p.x)*(1.-smoothstep(d.y-1.,d.y+1.,p.x));
          float height=smoothstep(-.25,.03,dy)*exp(-max(0.,dy)*.66);
          float lateral=exp(-pow((abs(p.z)-d.w*.5)/1.6,2.));
          float spot=pow(.5+.5*cos((p.x-d.x)*2.513),4.);
          float path=p.z<0.?l.y:l.z;
          float terrace=exp(-pow((p.x-(d.x+5.))/6.5,2.));
          bounce+=along*height*(l.x*.72*lateral+path*.95*lateral*(.25+.75*spot)+l.w*.65*terrace);
        }
        float facing=.48+.52*max(0.,normalize(nightNormal).y);
        totalEmissiveRadiance+=diffuseColor.rgb*nightWarm*bounce*facing;
      `;
      shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n'+effect);
    };
    m.customProgramCacheKey=()=> 'asteria-night-surfaces-v1-'+kind;
    clones.set(key,m);surfaces.push(m);return m;
  }
  const reflectors=new Set([M.white,M.teak,M.wood,M.gold,M.cream,M.taupe,M.marble,M.wall,pearlPaint]);
  // Only the exterior copies receive baked-style warm light. The cutaway rooms
  // retain their own materials and their independently controlled channels.
  skin.traverse(o => {
    if(!o.isMesh||!o.material||o.material.name?.startsWith('Exterior · '))return;
    const m=o.material;
    if(m===M.sea)o.material=surfaceMaterial(m,'pool');
    else if(m===skinGlass)o.material=surfaceMaterial(m,'glazing');
    else if(reflectors.has(m))o.material=surfaceMaterial(m,'solid');
  });
  // Reuse the existing six bounded real lights. No new shadow maps or lights.
  const pointLights=[];root.traverse(o=>{if(o.isPointLight)pointLights.push(o);});
  const beforeSea=sea.material.onBeforeCompile;
  sea.material.onBeforeCompile = shader => {
    beforeSea(shader);Object.assign(shader.uniforms,U);
    shader.fragmentShader='uniform vec4 nightDecks[6],nightLevels[6]; uniform vec3 nightWarm;\n'+shader.fragmentShader;
    shader.fragmentShader=shader.fragmentShader.replace('vec2(2.1,3.1)','vec2(1.55,3.65)');
    shader.fragmentShader=shader.fragmentShader.replace('min(1.6,glow)*caustic*1.7','min(2.2,glow)*caustic*2.4');
    shader.fragmentShader=shader.fragmentShader.replace('if(yachtWarm>.001){float along=', 'if(false){float along=');
    shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
      if(yachtActive>.5&&yachtWarm>.001&&abs(seaPosition.x)<90.&&abs(seaPosition.z)<65.){
        vec3 wp=vec3(seaPosition.x,seaPosition.y-1.15,seaPosition.z);
        vec3 toward=normalize(cameraPosition-wp);
        vec3 rippleNormal=normalize(vec3(.024*sin(wp.x*3.1+wp.z*1.7-seaTime),1.,.035*sin(wp.z*4.4+sin(wp.x*1.5)+seaTime*.8)));
        vec3 ray=reflect(-toward,rippleNormal);
        float gold=0.;
        if(ray.y>.035){
          for(int i=0;i<6;i++){
            vec4 d=nightDecks[i];float distance=(d.z-wp.y)/ray.y;
            vec2 hit=wp.xz+ray.xz*distance;
            float along=smoothstep(d.x,d.x+3.,hit.x)*(1.-smoothstep(d.y-4.,d.y,hit.x));
            float edge=exp(-pow((abs(hit.y)-d.w*.5)/.72,2.));
            gold+=edge*along*nightLevels[i].x*exp(-distance*.018);
          }
        }
        float shimmer=.2+.8*pow(.5+.5*sin(wp.x*7.2+wp.z*8.3+seaTime),3.);
        totalEmissiveRadiance+=nightWarm*min(2.,gold)*shimmer*1.65;
      }
    `);
  };
  sea.material.customProgramCacheKey=()=> 'asteria-sea-night-reflections-v1';sea.material.needsUpdate=true;
  // Small procedural moon and halo. No backdrop replacement or beam into sky.
  sky.mesh.material.fragmentShader=sky.mesh.material.fragmentShader.replace('gl_FragColor=vec4(col,1.);',`
    vec3 moonDir=normalize(vec3(.60,.31,-.74));float md=dot(d,moonDir);
    float disk=smoothstep(.99976,.99982,md);
    float crater=.88+.12*noise(d.xz*420.);
    col+=vec3(.76,.85,1.)*night*(disk*crater*.8+pow(max(md,0.),360.)*.07)*(1.-clouds*.72);
    gl_FragColor=vec4(col,1.);
  `);sky.mesh.material.needsUpdate=true;
  const before=scene.onBeforeRender;
  function update() {
    const s=ext.controller.state(),n=s.night,l=s.levels;
    U.nightTime.value=sea.time.value;
    rows.forEach((r,i)=>U.nightLevels.value[i].set(l[r.id]/100,l[r.paths[0]]/100,l[r.paths[1]]/100,l[r.lounge]/100));
    U.nightPools.value.set(l.jacuzzi_water/100,l.pool_sundeck/100);
    for(const [id,m] of materialById){
      const f=l[id]/100;
      if(core.byId[id].group!=='water'&&core.byId[id].group!=='party')m.emissive.copy(warm);
      m.emissiveIntensity=f*(id.startsWith('led_')||id==='upper_rail'?4.6:id.startsWith('stairs_')?4.1:3.1);
    }
    root.traverse(o=>{if(o.isMesh&&o.material?.map&&o.material.name.startsWith('Exterior · name_')){o.material.emissive.copy(warm);o.material.emissiveIntensity=l[o.material.name.slice(11)]/100*3.8;}});
    for(const {id,mesh} of glows){mesh.material.opacity=l[id]/100*.34;mesh.visible=l[id]>0;}
    for(const lamp of pointLights)lamp.intensity*=2.4;
    for(const m of surfaces){m.envMapIntensity=.035+.465*s.day;}
    // Suppress the solar-looking white streak on night water. Keep a modest
    // blue fill so the dark hull still reads against the ocean.
    sun.intensity=.004+3.196*s.day;hemisphere.intensity=.25+2.10*s.day;fill.intensity=.16+.94*s.day;
    sea.material.roughness=.28+.14*n;sea.material.clearcoat=.30-.23*n;
    sea.material.envMapIntensity=.014+.786*s.day;
  }
  scene.onBeforeRender=function(...args){before?.apply(this,args);update();};
  ext.nightFinish={version:'2026-09-21-golden-night-1',edges:edges.length,removedAirCones:removed.filter(o=>o.geometry.type==='CylinderGeometry').length,additionalLights:0,update};
})();
