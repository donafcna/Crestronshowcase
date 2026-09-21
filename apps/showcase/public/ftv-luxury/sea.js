/* Procedural sea for the showcase only. No texture downloads or extra render pass. */
window.createFtvSea = function (THREE, scene) {
 const time = { value: 0 };
 const yacht = {
  active: { value: 0 },
  sections: { value: Array.from({ length: 32 }, () => new THREE.Vector4()) },
  emitters: { value: Array.from({ length: 40 }, () => new THREE.Vector4()) },
  levels: { value: new THREE.Vector4() },
  color: { value: new THREE.Color('#15cfff') },
  warm: { value: 0 }
 };
 const geometry = new THREE.PlaneGeometry(1800, 1800, 240, 240);
 geometry.rotateX(-Math.PI / 2);
 const material = new THREE.MeshPhysicalMaterial({
  name: 'Animated open sea', color: 0x083e50, roughness: .28, metalness: .08,
  clearcoat: .3, clearcoatRoughness: .27, envMapIntensity: .8,
  transparent: false, opacity: 1, depthTest: true, depthWrite: true
 });
 material.onBeforeCompile = shader => {
  Object.assign(shader.uniforms, {
   seaTime: time, yachtActive: yacht.active, yachtSections: yacht.sections,
   yachtEmitters: yacht.emitters, yachtLevels: yacht.levels, yachtWaterColor: yacht.color, yachtWarm: yacht.warm
  });
  shader.vertexShader = 'uniform float seaTime; varying vec3 seaPosition;\n' + shader.vertexShader;
  shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
   float t=seaTime;
   transformed.y += .16*sin(dot(position.xz,vec2(.14,.07))-t*.64)
    + .09*sin(dot(position.xz,vec2(-.09,.23))-t*.79)
    + .045*sin(dot(position.xz,vec2(.31,.18))-t*1.03);
   seaPosition=vec3(position.x,transformed.y,position.z);
  `);
  shader.fragmentShader = `uniform float seaTime; varying vec3 seaPosition;
   uniform float yachtActive, yachtWarm;
   uniform vec4 yachtSections[32], yachtEmitters[40], yachtLevels;
   uniform vec3 yachtWaterColor;
   vec2 seaSlope(vec2 p,vec2 direction,float amplitude,float speed){
    return direction*amplitude*cos(dot(p,direction)-seaTime*speed);
   }
   float underwaterLevel(float channel){
    if(channel<.5)return yachtLevels.x;
    if(channel<1.5)return yachtLevels.y;
    if(channel<2.5)return yachtLevels.z;
    return yachtLevels.w;
   }
  ` + shader.fragmentShader;
  shader.fragmentShader = shader.fragmentShader.replace('#include <clipping_planes_fragment>', `#include <clipping_planes_fragment>
   // Exclude water INSIDE the actual hull at this wave height, not inside a box.
   // The small inset keeps all outside water; the opaque hull handles the seam.
   if(yachtActive>.5){
    float slice=clamp((seaPosition.y+.32)/.64,0.,1.);
    for(int i=0;i<31;i++){
     vec2 a=mix(yachtSections[i].xy,yachtSections[i].zw,slice);
     vec2 b=mix(yachtSections[i+1].xy,yachtSections[i+1].zw,slice);
     if(seaPosition.x>=a.x&&seaPosition.x<=b.x){
      float beam=mix(a.y,b.y,clamp((seaPosition.x-a.x)/max(.0001,b.x-a.x),0.,1.));
      if(abs(seaPosition.z)<max(0.,beam-.08))discard;
     }
    }
   }
  `);
  shader.fragmentShader = shader.fragmentShader.replace('#include <normal_fragment_begin>', `#include <normal_fragment_begin>
   vec2 p=seaPosition.xz;
   float distanceFade=1.0-smoothstep(90.0,420.0,length(vViewPosition));
   vec2 slope=seaSlope(p,vec2(.14,.07),.16,.64)
    +seaSlope(p,vec2(-.09,.23),.09,.79)
    +seaSlope(p,vec2(.31,.18),.045,1.03);
   vec2 q=p+vec2(sin(p.y*.13)+sin(p.x*.21+p.y*.07),cos(p.x*.11)+sin(p.y*.19-p.x*.08))*2.4;
   slope+=distanceFade*(seaSlope(q,vec2(1.2,.8),.045,1.12)
    +seaSlope(q,vec2(-.9,1.9),.027,1.43)
    +seaSlope(q,vec2(2.8,-1.2),.016,1.77)
    +seaSlope(q,vec2(4.1,3.7),.006,2.06));
   normal=normalize(mat3(viewMatrix)*vec3(-slope.x,1.0,-slope.y));
  `);
  shader.fragmentShader = shader.fragmentShader.replace('#include <clearcoat_normal_fragment_begin>', `#include <clearcoat_normal_fragment_begin>
   #ifdef USE_CLEARCOAT
    clearcoatNormal=normal;
   #endif
  `);
  shader.fragmentShader = shader.fragmentShader.replace('#include <color_fragment>', `#include <color_fragment>
   float patches=sin(seaPosition.x*.036+sin(seaPosition.z*.024))*sin(seaPosition.z*.041-seaTime*.03);
   diffuseColor.rgb*=.91+.09*patches;
  `);
  shader.fragmentShader = shader.fragmentShader.replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
   if(yachtActive>.5&&dot(yachtLevels,vec4(1.))>.001){
    float glow=0.;
    for(int i=0;i<40;i++){
     vec4 source=yachtEmitters[i];
     vec2 d=(seaPosition.xz-source.xy)/vec2(2.1,3.1);
     glow+=exp(-dot(d,d))*underwaterLevel(source.z)*source.w;
    }
    float caustic=.62+.23*sin(seaPosition.x*2.8+sin(seaPosition.z*3.3)-seaTime*.8)
     +.15*sin(seaPosition.z*4.1+seaPosition.x*1.7+seaTime*.65);
    totalEmissiveRadiance+=yachtWaterColor*min(1.6,glow)*caustic*1.7;
   }
   if(yachtActive>.5&&yachtWarm>.001){
    float along=smoothstep(-43.,-35.,seaPosition.x)*(1.-smoothstep(24.,40.,seaPosition.x));
    float band=exp(-abs(abs(seaPosition.z)-7.5)*.75)*along;
    float shimmer=.4+.6*pow(max(0.,sin(seaPosition.x*2.1+seaPosition.z*4.-seaTime*.7)),5.);
    totalEmissiveRadiance+=vec3(1.,.58,.21)*band*shimmer*yachtWarm*.28;
   }
  `);
  shader.fragmentShader = shader.fragmentShader.replace('#include <fog_fragment>', `
   #ifdef USE_FOG
    float seaFog=1.0-exp(-.000019*vFogDepth*vFogDepth);
    gl_FragColor.rgb=mix(gl_FragColor.rgb,fogColor,seaFog);
   #endif
  `);
 };
 material.customProgramCacheKey = () => 'ftv-sea-2026-09-21-yacht-v2';
 const mesh = new THREE.Mesh(geometry, material);
 mesh.name = 'Sea · animated swell and sky reflections'; mesh.position.y = -1.15;
 mesh.receiveShadow = true; mesh.castShadow = false; scene.add(mesh);
 const motion = matchMedia('(prefers-reduced-motion: reduce)');
 return {
  mesh, material, time, yacht,
  configureYacht(sections, emitters) {
   if (sections.length !== 32 || emitters.length !== 40) throw new Error('Invalid yacht sea-light geometry.');
   if (![...sections, ...emitters].every(v => v.length === 4 && v.every(Number.isFinite))) throw new Error('Non-finite yacht sea-light geometry.');
   sections.forEach((p, i) => yacht.sections.value[i].fromArray(p));
   emitters.forEach((p, i) => yacht.emitters.value[i].fromArray(p));
   yacht.active.value = 1;
  },
  update(dt) { if (mesh.visible && !motion.matches) time.value += Math.min(Math.max(dt, 0), .05); }
 };
};
