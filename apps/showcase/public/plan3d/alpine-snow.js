import * as T from './vendor/three.module.min.js';

// Continuous, seeded terrain detail. No random value changes between frames.
const fract = x => x - Math.floor(x);
const hash = (x,z) => fract(Math.sin(x*127.1+z*311.7)*43758.5453);
export function alpineNoise(x,z) {
  const ix=Math.floor(x),iz=Math.floor(z),fx=x-ix,fz=z-iz;
  const u=fx*fx*(3-2*fx),v=fz*fz*(3-2*fz);
  return T.MathUtils.lerp(T.MathUtils.lerp(hash(ix,iz),hash(ix+1,iz),u),T.MathUtils.lerp(hash(ix,iz+1),hash(ix+1,iz+1),u),v);
}
export function snowRelief(x,z) {
  // Large soft pillows, wind-built ridges and eroded gullies, not white noise.
  const mountain=T.MathUtils.smoothstep(-z,12,45);
  const ridges=1-Math.abs(alpineNoise(x*.19,z*.055)*2-1);
  return mountain*((ridges-.5)*1.1+(alpineNoise(x*.42,z*.29)-.5)*.38)
    +(alpineNoise(x*.2,z*.17)-.5)*.12;
}
export function pisteDistance(x,z) {
  return x-((x<0?-52:65)+Math.sin((z+65)*.055)*14);
}

const noiseGLSL=`
float aHash(vec2 p){vec3 q=fract(vec3(p.xyx)*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}
float aNoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(aHash(i),aHash(i+vec2(1,0)),f.x),mix(aHash(i+vec2(0,1)),aHash(i+vec2(1)),f.x),f.y);}
float aFbm(vec2 p){return .55*aNoise(p)+.28*aNoise(p*2.03+17.)+.12*aNoise(p*4.07+31.)+.05*aNoise(p*8.1);}
`;

export function snowAttributes(geometry,cover=1) {
  const n=geometry.attributes.position.count;
  geometry.setAttribute('alpineCover',new T.Float32BufferAttribute(new Float32Array(n).fill(cover),1));
  if(!geometry.attributes.color)geometry.setAttribute('color',new T.Float32BufferAttribute(new Float32Array(n*3).fill(1),3));
  return geometry;
}

export function createSnowMaterial(origin=new T.Vector3(),{tracks=false}={}) {
  const material=new T.MeshStandardMaterial({vertexColors:true,color:0xf5f8fc,roughness:.86,emissive:0x6485b5,emissiveIntensity:0});
  material.name='Neige poudreuse — relief, cristaux et diffusion bleutée';
  material.onBeforeCompile=shader=>{
    shader.uniforms.alpineOrigin={value:new T.Vector2(origin.x,origin.z)};
    shader.uniforms.alpineTracks={value:tracks?1:0};
    shader.vertexShader=shader.vertexShader.replace('#include <common>',`#include <common>
attribute float alpineCover; varying vec3 vAlpineWorld; varying float vAlpineCover;`)
      .replace('#include <project_vertex>',`#include <project_vertex>
vec4 alpinePoint=vec4(transformed,1.);
#ifdef USE_INSTANCING
alpinePoint=instanceMatrix*alpinePoint;
#endif
vAlpineWorld=(modelMatrix*alpinePoint).xyz;vAlpineCover=alpineCover;`);
    shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>
uniform vec2 alpineOrigin;uniform float alpineTracks;varying vec3 vAlpineWorld;varying float vAlpineCover;
${noiseGLSL}
vec3 aBump(vec3 p,vec3 n,float height){vec3 sx=dFdx(p),sy=dFdy(p),r1=cross(sy,n),r2=cross(n,sx);float det=dot(sx,r1);return normalize(abs(det)*n-sign(det)*(dFdx(height)*r1+dFdy(height)*r2));}
`)
      .replace('#include <map_fragment>',`#include <map_fragment>
vec2 ap=vAlpineWorld.xz-alpineOrigin;
float snowMask=clamp(vAlpineCover,0.,1.);
float wind=aFbm(vec2(ap.x*.38+ap.y*.14,ap.y*1.6));
float dune=aFbm(ap*.13);
float snowCrystal=aNoise(ap*38.);
float crystalVisibility=1.-smoothstep(.2,1.1,length(fwidth(ap*38.)));
float pisteX=(ap.x<0.?-52.:65.)+sin((ap.y+65.)*.055)*14.;
float lateral=ap.x-pisteX;
float piste=(1.-smoothstep(3.2,5.8,abs(lateral)))*smoothstep(12.,26.,-ap.y)*alpineTracks;
float grooveFade=1.-smoothstep(.3,1.5,fwidth(lateral*32.));
float grooming=(.5+.5*sin(lateral*32.))*grooveFade;
float skiLine=lateral-sin(ap.y*.18)*1.1;
float skiTracks=(1.-smoothstep(.035,.14,abs(abs(skiLine)-.19)))*piste;
vec3 shade=mix(vec3(.79,.86,.96),vec3(1.),smoothstep(.24,.78,dune));
diffuseColor.rgb*=mix(vec3(1.),shade*(.96+.04*wind),snowMask);
diffuseColor.rgb*=1.-snowMask*piste*(grooming*.045+skiTracks*.13);
`)
      .replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
float granules=aNoise(ap*31.);
float relief=(wind*.028+dune*.045+granules*.0025*crystalVisibility)*(1.-piste*.8);
relief-=piste*(grooming*.003+skiTracks*.012);
normal=aBump(-vViewPosition,normal,relief*snowMask);
`)
      .replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>
roughnessFactor=mix(roughnessFactor,mix(.83,.68,piste)-smoothstep(.96,.99,snowCrystal)*.17*crystalVisibility,snowMask);
`);
  };
  material.customProgramCacheKey=()=>`alpine-snow-v2-${tracks}`;
  return material;
}

// Actual evergreen volumes with irregular branch skirts; snow lies above the branches.
export function buildWinterConifers(scene,placements,origin) {
  // Individual drooping boughs instead of stacked cone silhouettes.
  function boughGeometry(snow) {
    const v=[],ix=[],colors=[];
    for(let tier=0;tier<6;tier++)for(let branch=0;branch<7;branch++){
      const seed=tier*17+branch*11,angle=branch*Math.PI*2/7+tier*.81+hash(seed,9)*.25;
      const radius=(1.16-tier*.165)*(.85+hash(seed,2)*.25),height=.64+tier*.52+hash(seed,3)*.12;
      const offset=v.length/3;
      for(let section=0;section<4;section++){
        const t=section/3*(snow?.87:1),length=.10+radius*t;
        const halfWidth=(Math.sin((t*.9+.08)*Math.PI)*.31+.012)*radius*(snow?.79:1);
        for(const side of [-1,0,1]){
          const lateral=side*halfWidth*(.8+hash(seed,section*3+side)*.35);
          const x=Math.sin(angle)*length+Math.cos(angle)*lateral,z=Math.cos(angle)*length-Math.sin(angle)*lateral;
          const y=height+.23*(1-t)-.25*t*t+(side===0?.035:0)+(snow?.055:0);
          v.push(x,y,z);
          const tint=snow?1:.72+hash(seed,section)*.27;colors.push(tint,tint,tint);
        }
      }
      for(let section=0;section<3;section++)for(let side=0;side<2;side++){
        const a=offset+section*3+side,b=a+3;ix.push(a,a+1,b,a+1,b+1,b);
      }
    }
    const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(v,3));geometry.setAttribute('color',new T.Float32BufferAttribute(colors,3));geometry.setIndex(ix);geometry.computeVertexNormals();return snow?snowAttributes(geometry):geometry;
  }
  const needleMat=new T.MeshStandardMaterial({color:0x355343,roughness:.98,vertexColors:true,side:T.DoubleSide});
  const snowMat=createSnowMaterial(origin);snowMat.side=T.DoubleSide;
  const needles=new T.InstancedMesh(boughGeometry(false),needleMat,placements.length),caps=new T.InstancedMesh(boughGeometry(true),snowMat,placements.length);
  const trunks=new T.InstancedMesh(new T.CylinderGeometry(.045,.12,3.8,7),new T.MeshStandardMaterial({color:0x5c493c,roughness:1}),placements.length);
  const dummy=new T.Object3D();
  placements.forEach((p,i)=>{
    dummy.position.set(p.x,p.y,p.z);dummy.rotation.set(0,p.rotation,0);dummy.scale.set(p.scale*(.88+hash(i,6)*.2),p.scale,p.scale*(.88+hash(i,6)*.2));dummy.updateMatrix();needles.setMatrixAt(i,dummy.matrix);caps.setMatrixAt(i,dummy.matrix);
    dummy.position.y+=p.scale*1.7;dummy.scale.setScalar(p.scale);dummy.updateMatrix();trunks.setMatrixAt(i,dummy.matrix);
  });
  needles.name='Sapins — rameaux retombants en volume';caps.name='Sapins — neige posée sur les ramures';trunks.name='Troncs des sapins';
  for(const mesh of [needles,caps,trunks]){mesh.computeBoundingSphere();mesh.receiveShadow=true;scene.add(mesh);}
  return {trees:needles,snowMaterial:snowMat,branches:placements.length*42};
}
