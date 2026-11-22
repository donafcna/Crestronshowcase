import * as T from './vendor/three.module.min.js';

// Stable world-space grain: no animated noise, random specular points or external assets.
const noise=`
float chHash(vec2 p){vec3 q=fract(vec3(p.xyx)*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}
float chNoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(chHash(i),chHash(i+vec2(1,0)),f.x),mix(chHash(i+vec2(0,1)),chHash(i+vec2(1)),f.x),f.y);}
vec3 chBump(vec3 p,vec3 n,float h){vec3 sx=dFdx(p),sy=dFdy(p),r1=cross(sy,n),r2=cross(n,sx);float det=dot(sx,r1);return normalize(abs(det)*n-sign(det)*(dFdx(h)*r1+dFdy(h)*r2));}
`;
function worldShader(shader) {
  shader.vertexShader=shader.vertexShader.replace('#include <common>',`#include <common>
varying vec3 vChWorld;varying vec3 vChNormal;varying vec2 vChUv;`)
    .replace('#include <project_vertex>',`#include <project_vertex>
vec4 chPoint=vec4(transformed,1.);
#ifdef USE_INSTANCING
chPoint=instanceMatrix*chPoint;
#endif
vChWorld=(modelMatrix*chPoint).xyz;vChNormal=normalize(mat3(modelMatrix)*objectNormal);vChUv=uv;`);
  shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>
varying vec3 vChWorld;varying vec3 vChNormal;varying vec2 vChUv;
${noise}`);
}

export function createChaletMaterials(environment) {
  const night={value:0};
  function wood(axis=0,color=0x99836e,width=.19) {
    const material=new T.MeshStandardMaterial({color,roughness:.82});
    material.name=axis===0?'Chêne vieilli — veinage vertical':'Bois de charpente et platelage';
    material.userData.chaletBevel=true;
    material.onBeforeCompile=shader=>{
      worldShader(shader);
      shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
vec3 cn=abs(vChNormal);vec2 wp;
${axis===0?'wp=vec2(cn.x>cn.z?vChWorld.z:vChWorld.x,vChWorld.y);':axis===1?'wp=vec2(vChWorld.z,vChWorld.x);':'wp=vec2(vChWorld.x,vChWorld.z);'}
float board=floor(wp.x/${width.toFixed(3)});
float boardTone=chHash(vec2(board,floor(wp.y/3.5)));
float drift=chNoise(vec2(wp.x*3.,wp.y*.37))*.13;
vec2 grainUV=vec2((wp.x+drift)*165.,wp.y*.8);
float grainVisibility=1.-smoothstep(.35,1.5,length(fwidth(grainUV)));
float grain=mix(.43,chNoise(grainUV)*.55+chNoise(grainUV*vec2(2.3,.5))*.3,grainVisibility);
vec2 knotCell=vec2(floor(wp.x/.65),floor(wp.y/1.6));
vec2 knotCenter=(knotCell+vec2(.25,.45)+vec2(chHash(knotCell),chHash(knotCell+17.))*.35)*vec2(.65,1.6);
vec2 kd=(wp-knotCenter)*vec2(11.,2.5);float knot=exp(-dot(kd,kd)*1.4);
float rings=mix(.5,.5+.5*sin(length(kd)*27.+grain*2.),grainVisibility);
float endGrain=${axis===0?'smoothstep(.75,.98,cn.y)':'smoothstep(.75,.98,cn.'+(axis===1?'x':'z')+')'};
float growth=.5+.5*sin(length(vChWorld.xz*12.)*2.+grain);
diffuseColor.rgb*=.76+boardTone*.20+grain*.19-knot*(.16+rings*.09);
diffuseColor.rgb*=1.-endGrain*(.08+growth*.09);
float woodRelief=(grain*.0016+knot*rings*.0005)*(1.-smoothstep(.7,2.,length(fwidth(grainUV))));
`)
        .replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
normal=chBump(-vViewPosition,normal,woodRelief);`)
        .replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>
roughnessFactor=clamp(.74+grain*.17+boardTone*.04,.65,.97);`);
    };
    material.customProgramCacheKey=()=>`chalet-wood-${axis}-${width}`;
    return material;
  }
  function mineral(color,stone=false) {
    const m=new T.MeshStandardMaterial({color,roughness:stone?.92:.87});
    m.name=stone?'Pierre alpine — strates et joints':'Béton minéral — pores et joints de banchage';
    m.onBeforeCompile=shader=>{
      worldShader(shader);
      shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
vec3 an=abs(vChNormal);vec2 mp=an.y>.6?vChWorld.xz:vec2(an.x>an.z?vChWorld.z:vChWorld.x,vChWorld.y);
float mineralCloud=chNoise(mp*1.8)*.6+chNoise(mp*9.7)*.25;
float pore=chNoise(mp*120.);float mineralRelief=(pore-.5)*.00065;
${stone?`float course=floor(mp.y/.24);float jointX=abs(fract(mp.x/.62+mod(course,2.)*.5)-.5);float jointY=abs(fract(mp.y/.24)-.5);float mortar=max(smoothstep(.477,.495,jointX),smoothstep(.466,.49,jointY));diffuseColor.rgb*=.79+mineralCloud*.3-mortar*.14;mineralRelief-=mortar*.002;`:`float formLine=smoothstep(.493,.499,abs(fract(mp.x/2.4)-.5));diffuseColor.rgb*=.85+mineralCloud*.18-formLine*.055;`}
mineralRelief*=1.-smoothstep(.4,1.3,length(fwidth(mp*120.)));
`)
        .replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
normal=chBump(-vViewPosition,normal,mineralRelief);`);
    };
    m.customProgramCacheKey=()=>`chalet-mineral-${stone}`;return m;
  }
  function glass(lit=false) {
    const m=new T.MeshPhysicalMaterial({color:0xa6b9c6,roughness:.145,metalness:0,clearcoat:1,clearcoatRoughness:.12,envMap:environment,envMapIntensity:.85,emissive:0xffddae,emissiveIntensity:0,side:T.FrontSide});
    m.name=lit?'Vitrage — pièce habitée':'Vitrage — reflets et profondeur';m.userData.chaletGlazing=true;
    m.onBeforeCompile=shader=>{
      worldShader(shader);shader.uniforms.chNight=night;
      shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nuniform float chNight;')
        .replace('#include <map_fragment>',`#include <map_fragment>
vec3 faceN=normalize(vChNormal);vec3 viewDirection=normalize(cameraPosition-vChWorld);
vec3 tangent=normalize(cross(vec3(0.,1.,0.),faceN));
float facing=max(.2,abs(dot(faceN,viewDirection)));
vec2 room=vChUv-vec2(dot(viewDirection,tangent),viewDirection.y)*.10/facing;
float curtain=1.-smoothstep(.11,.17,min(vChUv.x,1.-vChUv.x));
float pleat=.5+.5*cos(vChUv.x*110.);
float backwall=step(.12,room.x)*step(room.x,.88)*step(.12,room.y)*step(room.y,.94);
float floorShade=smoothstep(.04,.42,room.y);
vec3 interior=mix(vec3(.055,.065,.071),vec3(.15,.13,.105),floorShade);
interior*=.75+.25*backwall;
interior=mix(interior,vec3(.26,.25,.22)*(.7+pleat*.2),curtain*.72);
diffuseColor.rgb=mix(interior,diffuseColor.rgb,.27);
diffuseColor.rgb*=(.88+.12*facing)*(1.-chNight*.18);
`)
        .replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
float roomLight=${lit?'1.':'.16'};
float ceilingGlow=smoothstep(.65,.9,vChUv.y)*.18;
totalEmissiveRadiance*=roomLight*(.15+.55*backwall+.22*curtain+ceilingGlow);
`);
    };
    m.customProgramCacheKey=()=>`chalet-glass-${lit}`;return m;
  }
  const metal=new T.MeshStandardMaterial({color:0x393e40,roughness:.35,metalness:.78,envMap:environment,envMapIntensity:.6});metal.name='Aluminium thermolaqué';metal.userData.chaletBevel=true;
  const bronze=new T.MeshStandardMaterial({color:0x797263,roughness:.33,metalness:.8,envMap:environment,envMapIntensity:.5});bronze.name='Menuiseries bronze brossé';bronze.userData.chaletBevel=true;
  const rail=new T.MeshPhysicalMaterial({color:0xadc4cb,roughness:.16,metalness:0,clearcoat:1,envMap:environment,envMapIntensity:.85,transparent:true,opacity:.23,depthWrite:false,side:T.DoubleSide});rail.name='Garde-corps — verre feuilleté';
  return {wood:wood(),woodLight:wood(0,0xb6a18a),timber:wood(0,0x786252,.26),beam:wood(1,0x8a725c,.28),rafter:wood(2,0x8a725c,.22),deckX:wood(1,0xaa9379,.145),deckZ:wood(2,0xaa9379,.145),concrete:mineral(0xbebbb5),concreteDark:mineral(0x8a8985),stone:mineral(0x92938a,true),metal,bronze,rail,glass:glass(false),glassLit:glass(true),setNight(value){night.value=value;}};
}

export function bevelBox(w,h,d) {
  const b=Math.min(.009,w*.12,h*.12,d*.12),shape=new T.Shape();
  shape.moveTo(-w/2+b,-h/2+b);shape.lineTo(w/2-b,-h/2+b);shape.lineTo(w/2-b,h/2-b);shape.lineTo(-w/2+b,h/2-b);shape.closePath();
  const g=new T.ExtrudeGeometry(shape,{depth:Math.max(.001,d-2*b),steps:1,bevelEnabled:true,bevelSize:b,bevelThickness:b,bevelSegments:1,curveSegments:1});g.translate(0,0,-d/2+b);return g;
}
