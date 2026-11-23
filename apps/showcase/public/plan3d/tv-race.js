import { raceMaterials } from './tv-race-materials.js?v=2026-11-23-race-2';
import * as T from './vendor/three.module.min.js';

// Compact broadcast scene: baked geometry/colour, no real-time shadow pass.
export function buildRaceBroadcast(scene,camera,{detailedMaterials=true}={}){
  const owned=[],textures=[],cars=[],staticParts=[];
  const finish=detailedMaterials?raceMaterials(textures):null;
  const paint=new T.MeshStandardMaterial({vertexColors:true,roughness:.58,metalness:.16});
  const matte=new T.MeshLambertMaterial({vertexColors:true,map:finish?.atlasMap||null});
  const color=new T.Color(),matrix=new T.Matrix4();
  function part(parts,geo,hex,x,y,z,rx=0,ry=0,rz=0){
    matrix.compose(new T.Vector3(x,y,z),new T.Quaternion().setFromEuler(new T.Euler(rx,ry,rz)),new T.Vector3(1,1,1));
    const q=geo.index?geo.toNonIndexed():geo; q.applyMatrix4(matrix);color.setHex(hex);
    const c=new Float32Array(q.attributes.position.count*3);for(let i=0;i<c.length;i+=3){c[i]=color.r;c[i+1]=color.g;c[i+2]=color.b;}
    q.setAttribute('color',new T.BufferAttribute(c,3));if(finish&&parts===staticParts){const tile=hex===0xb4b5ac||hex===0xccccbf?1:hex===0x293c46?2:hex===0x69818a?3:0;finish.atlasUV(q,tile);}parts.push(q);if(q!==geo)geo.dispose();
  }
  const box=(parts,c,x,y,z,w,h,d,ry=0)=>part(parts,new T.BoxGeometry(w,h,d),c,x,y,z,0,ry);
  function merged(parts){
    const g=new T.BufferGeometry();for(const key of ['position','normal','uv','color']){
      const arrays=parts.map(p=>p.attributes[key].array),out=new Float32Array(arrays.reduce((n,a)=>n+a.length,0));let offset=0;
      for(const a of arrays){out.set(a,offset);offset+=a.length;}g.setAttribute(key,new T.BufferAttribute(out,key==='uv'?2:3));
    }parts.forEach(p=>p.dispose());owned.push(g);return g;
  }
  scene.background=new T.Color(0xb6cbd5);scene.fog=new T.Fog(0xb6cbd5,120,260);
  scene.traverse(o=>{if(o.isHemisphereLight)o.intensity=1.1;if(o.isDirectionalLight){o.intensity=1.6;o.position.set(-60,80,30);}});
  camera.far=400;camera.fov=34;camera.updateProjectionMatrix();
  const curve=new T.CatmullRomCurve3([[-72,-31],[-10,-37],[53,-28],[76,-2],[51,32],[-18,43],[-73,26],[-88,0]].map(([x,z])=>new T.Vector3(x,0,z)),true,'centripetal');
  // Precompute the racing line: sampling it during animation allocates no geometry.
  const samples=256,points=curve.getSpacedPoints(samples),tangents=points.map((p,i)=>points[(i+1)%samples].clone().sub(points[(i+samples-1)%samples]).normalize());
  function ribbon(inner,outer,height,hex,striped=false){
    const positions=[],colors=[],uv=[];
    for(let i=0;i<samples;i++){
      const vertices=[];for(const j of [i,i+1]){const k=j%samples,p=points[k],t=tangents[k];for(const side of [inner,outer])vertices.push([p.x+t.z*side,height,p.z-t.x*side]);}
      color.setHex(striped?(i%4<2?0xe6e4d9:0x9d3328):hex);
      if(finish&&striped)color.multiplyScalar(.8+.18*Math.abs(Math.sin(i*1.91)));
      for(const n of [0,2,1,1,2,3]){positions.push(...vertices[n]);colors.push(color.r,color.g,color.b);uv.push((i+(n>1?1:0))*.3,n%2);}
    }
    const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setAttribute('color',new T.Float32BufferAttribute(colors,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.computeVertexNormals();owned.push(geo);return geo;
  }
  if(finish){const ground=new T.PlaneGeometry(360,280);ground.rotateX(-Math.PI/2);owned.push(ground);const m=new T.Mesh(ground,new T.MeshLambertMaterial({map:finish.grassMap}));m.position.y=-.07;scene.add(m);}else box(staticParts,0x65704c,0,-.22,0,360,.3,280);
  // Asphalt grain drawn once into a small repeating texture.
  const canvas=document.createElement('canvas');canvas.width=canvas.height=128;const ctx=canvas.getContext('2d');
  ctx.fillStyle='#b4b6b7';ctx.fillRect(0,0,128,128);let seed=9127;
  for(let i=0;i<2800;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const x=seed%128,y=(seed>>>8)%128;ctx.fillStyle=i%2?'#9da0a2':'#c8c9c7';ctx.fillRect(x,y,1,1);}
  const grain=new T.CanvasTexture(finish?.asphalt||canvas);grain.colorSpace=T.SRGBColorSpace;grain.wrapS=grain.wrapT=T.RepeatWrapping;grain.repeat.set(1,4);textures.push(grain);
  const asphalt=new T.MeshLambertMaterial({color:0x52575b,map:grain,vertexColors:true});
  scene.add(new T.Mesh(ribbon(-5.5,5.5,.005,0xffffff),asphalt));
  for(const side of [-1,1]){
    scene.add(new T.Mesh(ribbon(side*5.5,side*6.35,.015,0xffffff,true),new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide})));
    scene.add(new T.Mesh(ribbon(side*6.35,side*10.5,-.025,0xb8ac89),new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide})));
  }
  // Rubbered-in racing line and continuous white edge markings, not reflective paint.
  const lineMat=new T.MeshLambertMaterial({color:0x282e32,transparent:true,opacity:.28,depthWrite:false,side:T.DoubleSide});
  scene.add(new T.Mesh(ribbon(-.6,.6,.012,0xffffff),lineMat));
  for(const side of [-1,1])scene.add(new T.Mesh(ribbon(side*5.2,side*5.28,.02,0xe4e3d9),new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide})));
  for(let i=0;i<samples;i+=2){const p=points[i],t=tangents[i],yaw=Math.atan2(t.x,t.z);for(const s of [-1,1]){
    const x=p.x+t.z*11.5*s,z=p.z-t.x*11.5*s;
    box(staticParts,0x9ca3a0,x,.43,z,.18,.55,3.8,yaw);
    if(i%6===0)box(staticParts,0x596260,x,1.2,z,.08,2.4,.08);
  }}
  // Pit buildings, safety wall and grandstand kept behind the action.
  for(let i=0;i<12;i++){
    const x=-41+i*6;
    box(staticParts,0xb4b5ac,x,2.3,-56,5.9,4.6,8);
    box(staticParts,0x293c46,x,1.7,-51.95,4.7,3.2,.08);
    box(staticParts,[0x9d3e32,0x325a76,0xc3973a][i%3],x,3.9,-51.85,5,.45,.08);
    box(staticParts,0x69818a,x,5.3,-55,5.8,1.1,7.6);
  }
  box(staticParts,0xccccbf,-8,6.05,-55,74,.18,9);
  for(let row=0;row<6;row++){
    box(staticParts,0x777e79,0,.5+row*.6,64+row*1.2,95,.25,1.3);
    for(let seat=0;seat<72;seat++){const x=-45+seat*1.27;box(staticParts,(seat+row)%4?0x354b5b:0x9b614b,x,1+row*.6,64+row*1.2,.45,.65,.35);}
  }
  scene.add(new T.Mesh(merged(staticParts),matte));
  // One merged mesh per car: nose, sidepods, cockpit, wings, tyre shoulders, rims.
  for(let i=0;i<7;i++){
    const pieces=[],c=[0xac211c,0x217a82,0xe2a633,0x253e72,0xd9d7cd,0x468241,0xa44528][i];
    box(pieces,0x171d20,0,.24,0,1.55,.13,4.1);
    part(pieces,new T.SphereGeometry(1,16,8).scale(.41,.25,1.45),c,0,.45,-.3);
    const nose=new T.CylinderGeometry(.16,.36,1.6,4);part(pieces,nose,c,0,.43,1.25,Math.PI/2,0,Math.PI/4);
    for(const s of [-1,1]){
      part(pieces,new T.SphereGeometry(1,12,8).scale(.3,.22,.94),c,s*.6,.44,-.5);
      box(pieces,0x16232a,s*.62,.47,.25,.35,.18,.06);
      box(pieces,0x11191d,s*.4,.69,-.4,.08,.12,.85);
      for(const z of [-1.3,1.3]){
        part(pieces,new T.CylinderGeometry(.38,.38,.38,16),0x171a1b,s*.94,.38,z,0,0,Math.PI/2);
        part(pieces,new T.CylinderGeometry(.18,.18,.395,12),0x7e8587,s*.94,.38,z,0,0,Math.PI/2);
        box(pieces,0x353c3e,s*.55,.3,z,.65,.04,.07);
      }
      box(pieces,c,s*.75,.78,-1.64,.07,.38,.45);
    }
    box(pieces,0x17232a,0,.7,-.25,.48,.17,.65);
    part(pieces,new T.SphereGeometry(.18,12,8),0xe7e4d9,0,.84,-.25);
    box(pieces,0x1c2d37,0,.87,-.08,.27,.08,.06);
    box(pieces,c,0,.21,1.96,1.95,.07,.34);box(pieces,c,0,.97,-1.65,1.6,.09,.48);
    box(pieces,0xe7e5d9,0,.69,.67,.16,.015,.7);
    const car=new T.Mesh(merged(pieces),paint);scene.add(car);cars.push(car);
  }
  // One instanced batch of soft contact shadows; no extra shadow camera.
  const sc=document.createElement('canvas');sc.width=sc.height=64;const sg=sc.getContext('2d'),grad=sg.createRadialGradient(32,32,5,32,32,32);grad.addColorStop(0,'rgba(0,0,0,.62)');grad.addColorStop(1,'rgba(0,0,0,0)');sg.fillStyle=grad;sg.fillRect(0,0,64,64);
  const shadowTex=new T.CanvasTexture(sc);textures.push(shadowTex);const shadowMat=new T.MeshBasicMaterial({map:shadowTex,transparent:true,depthWrite:false});
  const shadowGeo=new T.PlaneGeometry(3.6,5.8);shadowGeo.rotateX(-Math.PI/2);owned.push(shadowGeo);const shadows=new T.InstancedMesh(shadowGeo,shadowMat,7);shadows.frustumCulled=false;scene.add(shadows);
  const p=new T.Vector3(),t=new T.Vector3(),normal=new T.Vector3(),cam=new T.Vector3(),aim=new T.Vector3(),dummy=new T.Object3D();
  function position(u,out,tan){const f=((u%1+1)%1)*samples,k=Math.floor(f),a=f-k;out.copy(points[k]).lerp(points[k+1],a);tan.copy(tangents[k]).lerp(tangents[(k+1)%samples],a).normalize();}
  return {
    update(time){
      for(let i=0;i<cars.length;i++){
        position(time*.026-i*.019,p,t);normal.set(t.z,0,-t.x);p.addScaledVector(normal,(i%3-1)*1.05);
        cars[i].position.copy(p);cars[i].rotation.y=Math.atan2(t.x,t.z);
        dummy.position.copy(p);dummy.position.y=.035;dummy.rotation.y=cars[i].rotation.y;dummy.updateMatrix();shadows.setMatrixAt(i,dummy.matrix);
      }
      shadows.instanceMatrix.needsUpdate=true;
      position(time*.026-.022,p,t);normal.set(t.z,0,-t.x);
      // Two broadcast tracking angles, with a deliberate cut every 12 seconds.
      const aerial=Math.floor(time/12)%2===1;
      cam.copy(p).addScaledVector(normal,aerial?-32:-19).addScaledVector(t,aerial?-18:-13);cam.y=aerial?17:5.3;
      aim.copy(p).addScaledVector(t,4);aim.y=.45;camera.position.copy(cam);camera.lookAt(aim);
    },
    metrics:{cars:7,staticDrawCalls:finish?10:9,materials:finish?'textured':'baseline',style:'broadcast',trackSamples:samples},
    dispose(){owned.forEach(g=>g.dispose());textures.forEach(t=>t.dispose());shadows.dispose();const mats=new Set();scene.traverse(o=>{if(o.material)mats.add(o.material);});mats.forEach(m=>m.dispose());}
  };
}
