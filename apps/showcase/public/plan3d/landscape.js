import * as T from './vendor/three.module.min.js';
import { alpineNoise, snowRelief, pisteDistance, createSnowMaterial, snowAttributes, buildWinterConifers } from './alpine-snow.js?v=2026-11-22-detail-1';
import { buildAlpineWater } from './alpine-water.js?v=2026-11-22-detail-1';

// Continuous coloured terrain: snow is part of the same surface as the rock.
// No overlapping caps, alpha dithering or moving noise; all randomness is seeded.
import { buildNeighborhood } from './neighborhood.js?v=2026-11-22-detail-1';
import { createValley, buildValleyWater } from './valley.js?v=2026-09-17-valley-1';

export function buildLandscape(scene, bounds, kit, options) {
  options=options||{};
  const winter=!!options.winter;
  const c=bounds.getCenter(new T.Vector3());
  const rand=kit.random,A=kit.materials;
  scene.fog=new T.Fog(0xaebfc3,175,400);
  const skyCanvas=document.createElement('canvas');skyCanvas.width=8;skyCanvas.height=256;
  const ctx=skyCanvas.getContext('2d'),gradient=ctx.createLinearGradient(0,0,0,256);
  gradient.addColorStop(0,'#dce1d7');gradient.addColorStop(.5,'#b3c8ce');gradient.addColorStop(1,'#426d8c');ctx.fillStyle=gradient;ctx.fillRect(0,0,8,256);
  const skyTex=new T.CanvasTexture(skyCanvas);skyTex.colorSpace=T.SRGBColorSpace;
  const sky=new T.Mesh(new T.SphereGeometry(270,32,16),new T.MeshBasicMaterial({map:skyTex,side:T.BackSide,depthWrite:false,fog:false}));sky.position.copy(c);sky.renderOrder=-10;scene.add(sky);
  const terrainX= winter ? 360 : 200,terrainZ= winter ? 210 : 110;
  const terrain=new T.PlaneGeometry(430,250,terrainX,terrainZ);terrain.rotateX(-Math.PI/2);
  const p=terrain.attributes.position,covers=new Float32Array(terrain.attributes.position.count),colors=new Float32Array(p.count*3),color=new T.Color();
  const grass=new T.Color(0x70805c),rock=new T.Color(0x727b7b),snow=new T.Color(0xe8edf0);
  function hills(x,z){
    const ridge=Math.exp(-Math.pow((z+68)/22,2));
    const peaks=19+9*Math.sin(x*.055)+7*Math.sin(x*.107+1.3)+4*Math.cos(x*.19);
    const erosion=(Math.sin(x*.48+z*.24)*Math.sin(z*.32)+Math.cos(x*.81-z*.47))*.85;
    const foothills=(Math.sin(x*.075+z*.07)*2.5+Math.cos(z*.13)*1.8)*Math.min(1,Math.max(0,(-z-15)/22));
    return -.63+ridge*(peaks+erosion)+foothills+(winter?snowRelief(x,z):0);
  }
  const valley=createValley((x,z)=>hills(x-c.x,z-c.z));
  const insideEstate=(x,z)=>x>-9&&x<34&&z>-7&&z<42;
  function forestWeight(x,z){
    if(insideEstate(x,z)||(z>18&&z<110&&x>-8&&x<80))return 0;
    const pattern=.5+.28*Math.sin(x*.065+z*.047)+.22*Math.cos(x*.034-z*.093);
    return T.MathUtils.smoothstep(pattern,.37,.72);
  }
  for(let i=0;i<p.count;i++){
    const x=p.getX(i),z=p.getZ(i),h=valley.height(x+c.x,z+c.z);p.setY(i,h);
    const slope=winter?Math.hypot((hills(x+.6,z)-hills(x-.6,z))/1.2,(hills(x,z+.6)-hills(x,z-.6))/1.2):Math.abs(hills(x+1,z)-h)+Math.abs(hills(x,z+1)-h);
    const snowline=(winter ? -3 : 15)+Math.sin(x*.14)*1.6+slope*1.7;
    color.copy(grass);
    const cover=(Math.sin(x*.17+Math.sin(z*.09)*2)+Math.cos(z*.12-x*.035))*.06;
    color.lerp(new T.Color(0x93935f),T.MathUtils.clamp(.18+cover,0,1));
    color.lerp(new T.Color(0x3f6044),forestWeight(x+c.x,z+c.z)*.55);
    color.lerp(rock,T.MathUtils.smoothstep(h,6,14));
    color.lerp(snow,T.MathUtils.smoothstep(h-snowline,-2,2.8));
    if(winter){
      const piste=(1-T.MathUtils.smoothstep(Math.abs(pisteDistance(x,z)),3,6))*T.MathUtils.smoothstep(-z,12,28);
      const crag=alpineNoise(x*.31,z*.28);
      const exposed=T.MathUtils.smoothstep(slope,.95,1.8)*T.MathUtils.smoothstep(crag,.48,.78)*(1-piste)*.72;
      covers[i]=1-exposed;
      color.setHex(0xe8f0fa).lerp(new T.Color(0x61686d),exposed*.86);
      color.lerp(new T.Color(0xf9fbff),piste*.5);
    }
    color.multiplyScalar(.95+.05*Math.sin(x*.4+z*.6));color.toArray(colors,i*3);
  }
  // Remove terrain triangles across the actual sloping driveway opening.
  // Enveloppe résidence : aucune rampe de garage, le terrain reste continu.
  const driveway=options.driveway!==false;
  const indices=[];for(let i=0;i<terrain.index.count;i+=3){const ids=[0,1,2].map(j=>terrain.index.getX(i+j));const xs=ids.map(j=>p.getX(j)+c.x),zs=ids.map(j=>p.getZ(j)+c.z);if(driveway&&Math.max(...xs)>12.1&&Math.min(...xs)<18.9&&Math.max(...zs)>10.8&&Math.min(...zs)<40)continue;indices.push(...ids);}terrain.setIndex(indices);
  terrain.setAttribute('color',new T.BufferAttribute(colors,3));terrain.computeVertexNormals();
  const soil=document.createElement('canvas');soil.width=soil.height=512;const sg=soil.getContext('2d');sg.fillStyle='#c5c5c5';sg.fillRect(0,0,512,512);
  for(let i=0;i<24000;i++){const v=(winter?225:135)+Math.floor(rand()*(winter?30:115));sg.strokeStyle=`rgb(${v},${v},${v})`;sg.lineWidth=.6+rand();const x=rand()*512,y=rand()*512;sg.beginPath();sg.moveTo(x,y);sg.lineTo(x+(rand()-.5)*4,y-2-rand()*6);sg.stroke();}
  const soilTex=new T.CanvasTexture(soil);soilTex.colorSpace=T.SRGBColorSpace;soilTex.wrapS=soilTex.wrapT=T.RepeatWrapping;soilTex.repeat.set(80,46);soilTex.anisotropy=4;
  const landMaterial=winter?createSnowMaterial(c,{tracks:true}):new T.MeshStandardMaterial({vertexColors:true,roughness:1,map:soilTex});
  if(winter){snowAttributes(terrain);terrain.setAttribute('alpineCover',new T.BufferAttribute(covers,1));}
  const land=new T.Mesh(terrain,landMaterial);land.name='Terrain alpin continu';land.position.set(c.x,-.02,c.z);land.receiveShadow=true;scene.add(land);
  // Crossed foliage cards: soft, detailed branches instead of faceted cones.
  // Alpha-to-coverage uses MSAA, not animated dithering. Only six triangles per tree.
  const foliage=document.createElement('canvas');foliage.width=512;foliage.height=1024;
  const fg=foliage.getContext('2d');
  fg.fillStyle='#655441';fg.beginPath();fg.moveTo(249,1000);fg.lineTo(263,1000);fg.lineTo(256,25);fg.fill();
  for(let row=0;row<30;row++){
    const y=60+row*28,span=14+row*6.8;
    for(const side of [-1,1]){
      const endX=256+side*span,endY=y+12+rand()*20;
      fg.fillStyle=row%2?'#34533c':'#476549';fg.beginPath();fg.moveTo(256,y-18);fg.lineTo(endX,endY);fg.lineTo(256+side*span*.58,endY+14);fg.lineTo(256,y+10);fg.fill();
      fg.strokeStyle='#414638';fg.lineWidth=1+row*.08;fg.beginPath();fg.moveTo(256,y-12);fg.lineTo(endX,endY);fg.stroke();
      for(let j=0;j<35;j++){
        const t=j/35,bx=256+side*span*t,by=y-12+(endY-y+12)*t;
        const length=12+(1-t)*17+rand()*12;
        for(let k=0;k<7;k++){
          const nx=bx+(rand()-.5)*9,ny=by+(rand()-.5)*10;
          fg.strokeStyle=(winter?['#c5d8df','#f1f5f8','#dce8ed','#567367','#e5edf3']:['#263c2e','#34533c','#476549','#567651','#637c55'])[Math.floor(rand()*5)];
          fg.lineWidth=1+rand()*1.5;fg.beginPath();fg.moveTo(nx,ny);fg.lineTo(nx+side*(7+rand()*length),ny-length*.45+rand()*18);fg.stroke();
        }
      }
    }
  }
  const foliageTex=new T.CanvasTexture(foliage);foliageTex.colorSpace=T.SRGBColorSpace;foliageTex.anisotropy=4;
  // Sample the actual triangulated terrain, not the analytic curve: paths must
  // follow the rendered surface even where the mesh approximates a steep slope.
  function surfaceHeight(x,z){
    const gx=T.MathUtils.clamp((x-c.x+215)/430*terrainX,0,terrainX-.001),gz=T.MathUtils.clamp((z-c.z+125)/250*terrainZ,0,terrainZ-.001);
    const ix=Math.floor(gx),iz=Math.floor(gz),u=gx-ix,v=gz-iz,stride=terrainX+1,a=iz*stride+ix;
    const h00=p.getY(a),h10=p.getY(a+1),h01=p.getY(a+stride),h11=p.getY(a+stride+1);
    return (u+v<=1?h00+(h10-h00)*u+(h01-h00)*v:h11+(h01-h11)*(1-u)+(h10-h11)*(1-v))-.02;
  }
  if(winter){
    // Piste markers follow the exact triangulated terrain; no coplanar snow overlays.
    const markers=new T.Group();markers.name='Pistes de ski balisées';scene.add(markers);
    const poleMat=new T.MeshStandardMaterial({color:0xdc3e36,roughness:.6});
    for(const side of [-52,65])for(let z=-88;z<-15;z+=8){
      const center=side+Math.sin((z+65)*.055)*14;
      for(const edge of [-4.5,4.5]){const x=c.x+center+edge,worldZ=c.z+z;
        const pole=new T.Mesh(new T.CylinderGeometry(.075,.075,1.5,6),poleMat);pole.position.set(x,surfaceHeight(x,worldZ)+.75,worldZ);markers.add(pole);
        const sign=new T.Mesh(new T.SphereGeometry(.22,8,6),poleMat);sign.position.copy(pole.position);sign.position.y+=.75;markers.add(sign);
      }
    }
  }
  const neighborhood=buildNeighborhood(scene,surfaceHeight,kit,valley,{winter});
  const waterGroup=new T.Group();waterGroup.name='Lacs et ruisseaux continus';scene.add(waterGroup);
  const alpineWater=winter?buildAlpineWater(waterGroup,valley,surfaceHeight,kit,c):null;
  if(!winter)buildValleyWater(waterGroup,valley,surfaceHeight,kit);
  // Meadows are colours in the same surface, never overlapping polygons.
  for(let i=0;i<p.count;i++){
    const x=p.getX(i)+c.x,z=p.getZ(i)+c.z;
    for(const f of neighborhood.fields){
      const edge=Math.min(f.w/2-Math.abs(x-f.x),f.d/2-Math.abs(z-f.z));
      const slope=Math.abs(surfaceHeight(x+1,z)-surfaceHeight(x-1,z))+Math.abs(surfaceHeight(x,z+1)-surfaceHeight(x,z-1));
      if(!winter&&edge>0&&p.getY(i)<3.5&&slope<.9&&!valley.wet(x,z,1)){color.fromArray(colors,i*3).lerp(f.color,.85*T.MathUtils.smoothstep(edge,0,2));color.multiplyScalar(.92+.08*Math.sin((x-f.x)*1.1));color.toArray(colors,i*3);}
    }
    const close=valley.nearest(x,z);
    if(!winter&&close.point&&close.distance<3.8){color.fromArray(colors,i*3).lerp(new T.Color(0x989b7b),(1-T.MathUtils.smoothstep(close.distance,1.6,3.8))*.75);color.toArray(colors,i*3);}
    for(const lake of valley.lakes){const r=valley.radius(lake,x,z);if(!winter&&r>.93&&r<1.35){color.fromArray(colors,i*3).lerp(new T.Color(0xaca78a),(1-T.MathUtils.smoothstep(r,1.03,1.35))*.7);color.toArray(colors,i*3);}}
  }
  terrain.attributes.color.needsUpdate=true;
  const positions=[],uvs=[];
  for(let j=0;j<3;j++){const a=j*Math.PI/3,x=Math.cos(a)*1.3,z=Math.sin(a)*1.3;positions.push(-x,-1.9,-z,x,-1.9,z,x,1.9,z,-x,-1.9,-z,x,1.9,z,-x,1.9,-z);uvs.push(0,0,1,0,1,1,0,0,1,1,0,1);}
  const crown=new T.BufferGeometry();crown.setAttribute('position',new T.Float32BufferAttribute(positions,3));crown.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));
  const trees=new T.InstancedMesh(crown,new T.MeshBasicMaterial({map:foliageTex,alphaTest:.3,alphaToCoverage:true,side:T.DoubleSide}),620);
  const trunks=new T.InstancedMesh(new T.CylinderGeometry(.09,.15,1.7,7),A.oak,620);
  const dummy=new T.Object3D(),tint=new T.Color();
  let treeCount=0;const treePlacements=[];
  for(let n=0;n<6500&&treeCount<620;n++){
    const x=-110+rand()*255,z=-38+rand()*161,base=surfaceHeight(x,z),density=forestWeight(x,z);
    if(insideEstate(x,z)||density<rand()*.9||base>11||neighborhood.reserved(x,z))continue;
    if(z>18&&z<110&&x>-8&&x<80)continue; // Meadow foreground keeps the room cutaway unobstructed.
    const height=.65+rand()*1.05,i=treeCount++;
    treePlacements.push({x,y:base,z,scale:height,rotation:i*2.399963});
    dummy.position.set(x,base+height*2,z);dummy.scale.set(height,height,height);dummy.rotation.y=rand()*6.28;dummy.updateMatrix();trees.setMatrixAt(i,dummy.matrix);
    tint.setHex(i%3?0xf0eee2:0xc9d5bf);trees.setColorAt(i,tint);
    dummy.position.y=base+.45*height;dummy.updateMatrix();trunks.setMatrixAt(i,dummy.matrix);
  }
  trees.count=trunks.count=treeCount;trees.computeBoundingSphere();trunks.computeBoundingSphere();trees.name='Bosquets alpins';
  const winterForest=winter?buildWinterConifers(scene,treePlacements,c):null;
  if(!winter)scene.add(trees,trunks);
  // Short, sparse foreground tufts give the meadows a readable scale. One draw.
  const blades=new T.BufferGeometry();blades.setAttribute('position',new T.Float32BufferAttribute([-.035,0,0,.035,0,0,.08,.23,0,0,0,-.025,0,0,.025,0,.18,-.06,-.09,0,.03,-.055,0,.03,-.11,.16,.06],3));blades.computeVertexNormals();
  const grassMat=new T.MeshStandardMaterial({color:0xa8b387,roughness:1,side:T.DoubleSide});
  const tufts=new T.InstancedMesh(blades,grassMat,1800);let grassCount=0;
  for(let n=0;!winter&&n<6000&&grassCount<1800;n++){const x=-70+rand()*180,z=-13+rand()*122;if(insideEstate(x,z)||neighborhood.reserved(x,z))continue;const y=surfaceHeight(x,z);if(y>9)continue;dummy.position.set(x,y+.015,z);const s=.5+rand();dummy.scale.set(s,s,s);dummy.rotation.y=rand()*6.28;dummy.updateMatrix();tufts.setMatrixAt(grassCount,dummy.matrix);tint.setHex(grassCount%3?0xd0d8a9:0x8ca776);tufts.setColorAt(grassCount++,tint);}
  tufts.count=grassCount;tufts.computeBoundingSphere();tufts.name='Touffes de prairie';scene.add(tufts);
  const metrics={winter,snowDetail:winter?'wind-sculpted':null,terrainVertices:p.count,volumetricTreeBranches:winterForest?.branches||0,water:alpineWater?.metrics||null,skiPistes:winter?2:0,lakes:valley.lakes.map(l=>({...l})),streams:valley.streams.map(s=>({source:s.lake.name,start:s.samples[0],end:s.samples.at(-1),downhill:s.samples.every((p,i)=>i===0||p.level<=s.samples[i-1].level)})),fields:neighborhood.fields.length,trees:treeCount,grassTufts:grassCount};
  return {skyTexture:skyTex,terrain:land,trees:winter?null:trees,metrics,update(seconds,day){alpineWater?.update(seconds,day);},setDay(day){if(winter){land.material.emissiveIntensity=.10*(1-day);winterForest.snowMaterial.emissiveIntensity=.10*(1-day);}sky.material.color.setRGB(.06+.94*day,.08+.92*day,.16+.84*day);trees.material.color.setRGB(.1+.9*day,.13+.87*day,.19+.81*day);scene.fog.color.setRGB(.045+.38*day,.065+.46*day,.11+.47*day);}};
}
