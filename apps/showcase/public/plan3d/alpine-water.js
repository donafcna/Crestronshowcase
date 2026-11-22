import * as T from './vendor/three.module.min.js';
import { createSnowMaterial, snowAttributes } from './alpine-snow.js?v=2026-11-22-detail-1';

const vertex=`
uniform float waterTime;
varying vec3 waterWorld;varying vec2 flowUV;varying vec3 bedTint;
#include <fog_pars_vertex>
void main(){
  flowUV=uv;bedTint=color;
  vec3 p=position;
  p.y+=sin(uv.y*2.3-waterTime*1.7+uv.x*3.)*.009+sin(uv.y*5.8-waterTime*2.4)*.004;
  vec4 world=modelMatrix*vec4(p,1.);waterWorld=world.xyz;
  vec4 mvPosition=viewMatrix*world;gl_Position=projectionMatrix*mvPosition;
  #include <fog_vertex>
}`;
const fragment=`
uniform float waterTime;uniform float waterDay;uniform float lakeMode;
varying vec3 waterWorld;varying vec2 flowUV;varying vec3 bedTint;
#include <fog_pars_fragment>
float hash(vec2 p){vec3 q=fract(vec3(p.xyx)*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1)),f.x),f.y);}
void main(){
  float travel=flowUV.y-waterTime*.68;
  vec2 p=vec2(flowUV.x*3.,travel);
  float n=noise(p*2.4+vec2(sin(travel*.7),0.));
  float wave1=sin(p.y*4.2+p.x*2.2+n*2.);
  float wave2=cos(p.x*6.-p.y*2.7+waterTime*.35);
  vec3 normal=normalize(vec3(wave1*.105,1.,wave2*.075));
  vec3 eye=normalize(cameraPosition-waterWorld);
  float fresnel=.045+.955*pow(1.-max(0.,dot(normal,eye)),4.5);
  float edge=smoothstep(.35,.98,abs(flowUV.x));
  float pebble=noise(waterWorld.xz*13.);
  vec3 gravel=mix(vec3(.05,.075,.08),vec3(.25,.29,.25),pebble);
  vec3 deep=mix(vec3(.006,.038,.049),vec3(.025,.13,.15),.35+.45*n);
  vec3 transmitted=mix(deep,gravel*.66,edge*.68);
  transmitted=mix(transmitted,bedTint*.25,.12);
  float horizon=clamp(eye.y,0.,1.);
  vec3 sky=mix(vec3(.44,.57,.64),vec3(.66,.78,.86),horizon);
  float reflectedRidge=smoothstep(.1,.8,noise(vec2(waterWorld.x*.035,waterWorld.z*.025)))*.3;
  sky*=1.-reflectedRidge;
  vec3 col=mix(transmitted,sky,fresnel*.65);
  vec3 sun=normalize(vec3(-.35,.83,.42));
  float reflection=pow(max(0.,dot(reflect(-sun,normal),eye)),150.);
  col+=vec3(1.,.94,.82)*reflection*.8;
  float filaments=pow(.5+.5*sin(p.x*10.+noise(vec2(p.y*.5,p.x))*9.),10.);
  float broken=smoothstep(.57,.82,noise(vec2(p.x*3.,travel*5.)));
  float rapid=clamp((bedTint.b-.28)*4.,0.,1.);
  float foam=(edge*.35+filaments*(.13+rapid*.65))*broken*(1.-lakeMode*.7);
  col=mix(col,vec3(.78,.88,.90),foam*.58);
  col*=mix(vec3(.10,.18,.29),vec3(1.),waterDay);
  gl_FragColor=vec4(col,1.);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #include <fog_fragment>
}`;

export function buildAlpineWater(parent,valley,surfaceHeight,kit,origin) {
  const uniforms={waterTime:{value:0},waterDay:{value:1},lakeMode:{value:0}};
  const material=new T.ShaderMaterial({uniforms,vertexShader:vertex,fragmentShader:fragment,vertexColors:true,fog:true,side:T.DoubleSide});
  // ShaderMaterial needs the renderer's fog uniforms as well as its fog shader chunks.
  Object.assign(material.uniforms,T.UniformsUtils.clone(T.UniformsLib.fog));
  const lakeMaterial=material.clone();lakeMaterial.uniforms.lakeMode.value=1;
  const snowMaterial=createSnowMaterial(origin);
  const stoneMaterial=new T.MeshStandardMaterial({color:0x555f63,roughness:.86});
  const iceMaterial=new T.MeshPhysicalMaterial({color:0xa2c4d1,roughness:.27,metalness:.08,clearcoat:.8,clearcoatRoughness:.18,transparent:true,opacity:.78,depthWrite:false});
  const rockGeometry=new T.IcosahedronGeometry(1,1),capGeometry=snowAttributes(new T.SphereGeometry(1,12,6,0,Math.PI*2,0,Math.PI/2));
  const rocks=[],iceChunks=[],banks=[],bedVertices=[],bedColors=[],bedIndices=[];
  const rand=kit.random;
  function geometry(v,ix,uv,colors){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setAttribute('color',new T.Float32BufferAttribute(colors,3));g.setIndex(ix);g.computeVertexNormals();return g;}
  function widthAt(n){return .91+.16*Math.sin(n*.13)+.10*Math.sin(n*.41);}
  let bankVertices=0;
  for(const stream of valley.streams){
    const v=[],ix=[],uv=[],colors=[];let along=0;
    stream.samples.forEach((p,n)=>{
      if(n){const prev=stream.samples[n-1];along+=Math.hypot(p.x-prev.x,p.z-prev.z);}
      const width=widthAt(n),cross=8;
      for(let j=0;j<=cross;j++){
        const side=j/cross*2-1;
        v.push(p.x+p.normal.x*width*side,p.level+.018,p.z+p.normal.y*width*side);uv.push(side,along);
        const next=stream.samples[Math.min(n+1,stream.samples.length-1)],rapid=Math.min(1,Math.max(0,(p.level-next.level)*7));
        colors.push(.13+.15*Math.abs(side),.27+.12*Math.abs(side),.28+rapid*.25);
        if(n<stream.samples.length-1&&j<cross){const a=n*(cross+1)+j,b=a+cross+1;ix.push(a,b,a+1,a+1,b,b+1);}
      }
      // Riverbed is visible at the irregular shallows, below a solid water surface.
      const a=bedVertices.length/3;
      for(const side of [-1,1]){bedVertices.push(p.x+p.normal.x*width*.98*side,p.level-.12,p.z+p.normal.y*width*.98*side);bedColors.push(.28,.31,.27);}
      if(n<stream.samples.length-1)bedIndices.push(a,a+2,a+1,a+1,a+2,a+3);
      if(n>5&&rand()<.18){
        const side=n%2?1:-1,size=.16+rand()*.34;
        rocks.push({x:p.x+p.normal.x*(width+.27+rand()*.55)*side,y:Math.max(p.level-.08,surfaceHeight(p.x+p.normal.x*1.6*side,p.z+p.normal.y*1.6*side)),z:p.z+p.normal.y*(width+.27+rand()*.55)*side,size,angle:rand()*6.28});
      }
      if(n>12&&rand()<.065){const side=n%3?1:-1;iceChunks.push({x:p.x+p.normal.x*width*.88*side,y:p.level+.035,z:p.z+p.normal.y*width*.88*side,size:.15+rand()*.23,angle:rand()*6.28});}
    });
    const surface=new T.Mesh(geometry(v,ix,uv,colors),material);surface.name='Eau courante — '+stream.lake.name;parent.add(surface);
    for(const side of [-1,1]){
      const bv=[],bi=[],bu=[],bc=[],cross=5;
      stream.samples.forEach((p,n)=>{
        const width=widthAt(n),bulge=.85+.15*Math.sin(n*.31);
        for(let j=0;j<cross;j++){
          const offset=[0,.15,.48,.92,1.45][j],x=p.x+p.normal.x*(width+offset)*side,z=p.z+p.normal.y*(width+offset)*side;
          const terrain=surfaceHeight(x,z),lip=[.09,.23,.29,.17,-.045][j]*bulge;
          const y=j<2?Math.max(p.level+lip,terrain+.025):terrain+lip;
          bv.push(x,y,z);bu.push(n*.3,j*.25);bc.push(.93,.97,1.);
          if(n<stream.samples.length-1&&j<cross-1){const a=n*cross+j,b=a+cross;bi.push(a,b,a+1,a+1,b,b+1);}
        }
      });
      if(side===1)for(let i=0;i<bi.length;i+=3){const tmp=bi[i+1];bi[i+1]=bi[i+2];bi[i+2]=tmp;}
      const geo=snowAttributes(geometry(bv,bi,bu,bc));bankVertices+=geo.attributes.position.count;
      const bank=new T.Mesh(geo,snowMaterial);bank.name='Berge — neige accumulée et lèvre surplombante';bank.receiveShadow=true;parent.add(bank);banks.push(bank);
    }
  }
  // Deep blue, mostly open lakes, with the same ripples but a slower optical flow.
  for(const lake of valley.lakes){
    const v=[lake.x,lake.level+.01,lake.z],ix=[],uv=[0,0],colors=[.08,.19,.24],rings=8,segments=96;
    for(let ring=1;ring<=rings;ring++)for(let j=0;j<=segments;j++){
      const a=j/segments*Math.PI*2,shape=1+.065*Math.sin(a*3)+.045*Math.cos(a*5),r=ring/rings;
      const x=lake.x+Math.cos(a)*lake.rx*shape*r,z=lake.z+Math.sin(a)*lake.rz*shape*r;
      v.push(x,lake.level+.01,z);uv.push(Math.cos(a)*r,Math.sin(a)*r*lake.rz);colors.push(.12+r*.13,.24+r*.12,.28+r*.1);
      const k=1+(ring-1)*(segments+1)+j;
      if(j<segments){if(ring===1)ix.push(0,k+1,k);else{const b=k-segments-1;ix.push(b,k,b+1,b+1,k,k+1);}}
    }
    const m=new T.Mesh(geometry(v,ix,uv,colors),lakeMaterial);m.name=lake.name+' — reflets et rides';parent.add(m);
    // Frosted shore fragments leave the flowing outlet clear.
    for(let j=0;j<80;j++){
      const a=j/80*Math.PI*2,r=1+.065*Math.sin(a*3)+.045*Math.cos(a*5),x=lake.x+Math.cos(a)*lake.rx*r,z=lake.z+Math.sin(a)*lake.rz*r;
      if(valley.nearest(x,z).distance<2.8||rand()<.28)continue;
      rocks.push({x,y:Math.max(lake.level-.12,surfaceHeight(x,z)),z,size:.25+rand()*.35,angle:a});
      if(j%2===0)iceChunks.push({x:lake.x+(x-lake.x)*.96,y:lake.level+.035,z:lake.z+(z-lake.z)*.96,size:.3+rand()*.35,angle:a});
    }
  }
  const dummy=new T.Object3D();
  const stone=new T.InstancedMesh(rockGeometry,stoneMaterial,rocks.length),caps=new T.InstancedMesh(capGeometry,snowMaterial,rocks.length);
  rocks.forEach((r,i)=>{
    dummy.position.set(r.x,r.y+r.size*.19,r.z);dummy.rotation.set(.12,r.angle,.08);dummy.scale.set(r.size*1.4,r.size*.7,r.size);dummy.updateMatrix();stone.setMatrixAt(i,dummy.matrix);
    dummy.position.y+=r.size*.42;dummy.rotation.x=0;dummy.rotation.z=0;dummy.scale.set(r.size*1.22,r.size*.26,r.size*.87);dummy.updateMatrix();caps.setMatrixAt(i,dummy.matrix);
  });
  stone.name='Galets et blocs humides des berges';caps.name='Calottes de neige sur les rochers';
  const ice=new T.InstancedMesh(new T.CylinderGeometry(1,.92,.07,7),iceMaterial,iceChunks.length);
  iceChunks.forEach((r,i)=>{dummy.position.set(r.x,r.y,r.z);dummy.rotation.set(0,r.angle,0);dummy.scale.set(r.size,1,r.size*.65);dummy.updateMatrix();ice.setMatrixAt(i,dummy.matrix);});ice.name='Glace translucide des rives';
  for(const m of [stone,caps,ice]){m.computeBoundingSphere();m.receiveShadow=true;parent.add(m);}
  const bed=new T.BufferGeometry();bed.setAttribute('position',new T.Float32BufferAttribute(bedVertices,3));bed.setAttribute('color',new T.Float32BufferAttribute(bedColors,3));bed.setIndex(bedIndices);bed.computeVertexNormals();
  parent.add(new T.Mesh(bed,new T.MeshStandardMaterial({vertexColors:true,roughness:1})));
  return {metrics:{animated:true,riverRocks:rocks.length,iceFragments:iceChunks.length,snowBanks:banks.length,bankVertices},
    update(seconds,day){uniforms.waterTime.value=seconds;uniforms.waterDay.value=day;lakeMaterial.uniforms.waterTime.value=seconds*.35;lakeMaterial.uniforms.waterDay.value=day;snowMaterial.emissiveIntensity=.12*(1-day);}};
}
