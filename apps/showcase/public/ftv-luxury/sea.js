/* Procedural sea for the showcase only. No texture downloads or extra render pass. */
window.createFtvSea=function(THREE,scene){
 const time={value:0};
 const geometry=new THREE.PlaneGeometry(1800,1800,240,240);
 geometry.rotateX(-Math.PI/2);
 const material=new THREE.MeshPhysicalMaterial({
  name:'Animated open sea',color:0x083e50,roughness:.28,metalness:.08,
  clearcoat:.3,clearcoatRoughness:.27,envMapIntensity:.8
 });
 material.onBeforeCompile=shader=>{
  shader.uniforms.seaTime=time;
  shader.vertexShader='uniform float seaTime; varying vec3 seaPosition;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
   float t=seaTime;
   transformed.y += .16*sin(dot(position.xz,vec2(.14,.07))-t*.64)
    + .09*sin(dot(position.xz,vec2(-.09,.23))-t*.79)
    + .045*sin(dot(position.xz,vec2(.31,.18))-t*1.03);
   seaPosition=vec3(position.x,transformed.y,position.z);
  `);
  shader.fragmentShader=`uniform float seaTime; varying vec3 seaPosition;
   vec2 seaSlope(vec2 p,vec2 direction,float amplitude,float speed){
    return direction*amplitude*cos(dot(p,direction)-seaTime*speed);
   }
  `+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_begin>',`#include <normal_fragment_begin>
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
  shader.fragmentShader=shader.fragmentShader.replace('#include <clearcoat_normal_fragment_begin>',`#include <clearcoat_normal_fragment_begin>
   #ifdef USE_CLEARCOAT
    clearcoatNormal=normal;
   #endif
  `);
  shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
   float patches=sin(seaPosition.x*.036+sin(seaPosition.z*.024))*sin(seaPosition.z*.041-seaTime*.03);
   diffuseColor.rgb*=.91+.09*patches;
  `);
  // Blend the distant surface into the current scene sky, avoiding a hard plane edge.
  shader.fragmentShader=shader.fragmentShader.replace('#include <fog_fragment>',`
   #ifdef USE_FOG
    float seaFog=1.0-exp(-.000019* vFogDepth*vFogDepth);
    gl_FragColor.rgb=mix(gl_FragColor.rgb,fogColor,seaFog);
   #endif
  `);
 };
 material.customProgramCacheKey=()=> 'ftv-sea-2026-09-20-v1';
 const mesh=new THREE.Mesh(geometry,material);
 mesh.name='Sea · animated swell and sky reflections';mesh.position.y=-1.15;
 mesh.receiveShadow=true;mesh.castShadow=false;scene.add(mesh);
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 return {mesh,material,time,update(dt){if(mesh.visible&&!motion.matches)time.value+=Math.min(dt,.05);}};
};
