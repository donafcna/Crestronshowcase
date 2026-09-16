import * as T from './vendor/three.module.min.js';

// Continuous coloured terrain: snow is part of the same surface as the rock.
// No overlapping caps, alpha dithering or moving noise; all randomness is seeded.
export function buildLandscape(scene, bounds, kit) {
  const c=bounds.getCenter(new T.Vector3()),s=bounds.getSize(new T.Vector3());
  const rand=kit.random,A=kit.materials;
  scene.fog=new T.Fog(0xaebfc3,85,240);
  const skyCanvas=document.createElement('canvas');skyCanvas.width=8;skyCanvas.height=256;
  const ctx=skyCanvas.getContext('2d'),gradient=ctx.createLinearGradient(0,0,0,256);
  gradient.addColorStop(0,'#dce1d7');gradient.addColorStop(.5,'#b3c8ce');gradient.addColorStop(1,'#426d8c');ctx.fillStyle=gradient;ctx.fillRect(0,0,8,256);
  const skyTex=new T.CanvasTexture(skyCanvas);skyTex.colorSpace=T.SRGBColorSpace;
  const sky=new T.Mesh(new T.SphereGeometry(270,32,16),new T.MeshBasicMaterial({map:skyTex,side:T.BackSide,depthWrite:false,fog:false}));sky.position.copy(c);sky.renderOrder=-10;scene.add(sky);
  const terrain=new T.PlaneGeometry(430,250,200,110);terrain.rotateX(-Math.PI/2);
  const p=terrain.attributes.position,colors=new Float32Array(p.count*3),color=new T.Color();
  const grass=new T.Color(0x70805c),rock=new T.Color(0x727b7b),snow=new T.Color(0xe8edf0);
  function hills(x,z){
    const ridge=Math.exp(-Math.pow((z+68)/22,2));
    const peaks=19+9*Math.sin(x*.055)+7*Math.sin(x*.107+1.3)+4*Math.cos(x*.19);
    const erosion=(Math.sin(x*.48+z*.24)*Math.sin(z*.32)+Math.cos(x*.81-z*.47))*.85;
    const foothills=(Math.sin(x*.075+z*.07)*2.5+Math.cos(z*.13)*1.8)*Math.min(1,Math.max(0,(-z-15)/22));
    return -.63+ridge*(peaks+erosion)+foothills;
  }
  for(let i=0;i<p.count;i++){
    const x=p.getX(i),z=p.getZ(i),h=hills(x,z);p.setY(i,h);
    const slope=Math.abs(hills(x+1,z)-h)+Math.abs(hills(x,z+1)-h);
    const snowline=15+Math.sin(x*.14)*1.6+slope*1.7;
    color.copy(grass).lerp(rock,T.MathUtils.smoothstep(h,1,9));
    color.lerp(snow,T.MathUtils.smoothstep(h-snowline,-2,2.8));
    color.multiplyScalar(.95+.05*Math.sin(x*.4+z*.6));color.toArray(colors,i*3);
  }
  terrain.setAttribute('color',new T.BufferAttribute(colors,3));terrain.computeVertexNormals();
  const soil=document.createElement('canvas');soil.width=soil.height=256;const sg=soil.getContext('2d');sg.fillStyle='#e8e8e8';sg.fillRect(0,0,256,256);
  for(let i=0;i<12000;i++){const v=218+Math.floor(rand()*37);sg.fillStyle=`rgb(${v},${v},${v})`;sg.fillRect(rand()*256,rand()*256,1,1+rand()*3);}
  const soilTex=new T.CanvasTexture(soil);soilTex.colorSpace=T.SRGBColorSpace;soilTex.wrapS=soilTex.wrapT=T.RepeatWrapping;soilTex.repeat.set(48,28);soilTex.anisotropy=4;
  const land=new T.Mesh(terrain,new T.MeshStandardMaterial({vertexColors:true,roughness:1,map:soilTex}));land.position.set(c.x,-.02,c.z);land.receiveShadow=true;scene.add(land);
  // Crossed foliage cards: soft, detailed branches instead of faceted cones.
  // Alpha-to-coverage uses MSAA, not animated dithering. Only six triangles per tree.
  const foliage=document.createElement('canvas');foliage.width=512;foliage.height=1024;
  const fg=foliage.getContext('2d');
  fg.fillStyle='#655441';fg.beginPath();fg.moveTo(249,1000);fg.lineTo(263,1000);fg.lineTo(256,25);fg.fill();
  for(let row=0;row<30;row++){
    const y=60+row*28,span=14+row*6.8;
    for(const side of [-1,1]){
      const endX=256+side*span,endY=y+12+rand()*20;
      fg.strokeStyle='#414638';fg.lineWidth=1+row*.08;fg.beginPath();fg.moveTo(256,y-12);fg.lineTo(endX,endY);fg.stroke();
      for(let j=0;j<35;j++){
        const t=j/35,bx=256+side*span*t,by=y-12+(endY-y+12)*t;
        const length=12+(1-t)*17+rand()*12;
        for(let k=0;k<7;k++){
          const nx=bx+(rand()-.5)*9,ny=by+(rand()-.5)*10;
          fg.strokeStyle=['#263c2e','#34533c','#476549','#567651','#637c55'][Math.floor(rand()*5)];
          fg.lineWidth=1+rand()*1.5;fg.beginPath();fg.moveTo(nx,ny);fg.lineTo(nx+side*(7+rand()*length),ny-length*.45+rand()*18);fg.stroke();
        }
      }
    }
  }
  const foliageTex=new T.CanvasTexture(foliage);foliageTex.colorSpace=T.SRGBColorSpace;foliageTex.anisotropy=4;
  const positions=[],uvs=[];
  for(let j=0;j<3;j++){const a=j*Math.PI/3,x=Math.cos(a)*1.3,z=Math.sin(a)*1.3;positions.push(-x,-1.9,-z,x,-1.9,z,x,1.9,z,-x,-1.9,-z,x,1.9,z,-x,1.9,-z);uvs.push(0,0,1,0,1,1,0,0,1,1,0,1);}
  const crown=new T.BufferGeometry();crown.setAttribute('position',new T.Float32BufferAttribute(positions,3));crown.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));
  const trees=new T.InstancedMesh(crown,new T.MeshBasicMaterial({map:foliageTex,alphaTest:.3,alphaToCoverage:true,side:T.DoubleSide}),100);
  const trunks=new T.InstancedMesh(new T.CylinderGeometry(.09,.15,1.7,7),A.oak,100);
  const dummy=new T.Object3D(),tint=new T.Color();
  for(let i=0;i<100;i++){
    const angle=rand()*Math.PI*2,r=25+rand()*43,x=Math.cos(angle)*r,z=Math.sin(angle)*r;
    // The south-east foreground remains open for the architectural cutaway.
    const zz=z>5&&x>0?-z-20:z;
    const base=hills(x,zz),height=.65+rand()*.8;
    dummy.position.set(c.x+x,base+height*2,c.z+zz);dummy.scale.set(height,height,height);dummy.rotation.y=rand()*6.28;dummy.updateMatrix();trees.setMatrixAt(i,dummy.matrix);
    tint.setHex(i%3?0xf0eee2:0xc9d5bf);trees.setColorAt(i,tint);
    dummy.position.y=base+.45*height;dummy.updateMatrix();trunks.setMatrixAt(i,dummy.matrix);
  }
  scene.add(trees,trunks);
  const garden=new T.Group();scene.add(garden);
  const block=(m,x,y,z,w,h,d)=>{const o=new T.Mesh(new T.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.receiveShadow=true;garden.add(o);return o;};
  // Stone walk, border, lawn terraces and a low retaining wall.
  const front=c.z+s.z/2+1.7;
  for(let i=0;i<33;i++)block(A.stone,c.x-s.x*.5+i, -.48,front,.92,.1,1.35);
  for(let i=0;i<28;i++)block(A.stone,c.x-s.x*.5+i*1.15,-.4,front+3,1.1,.4,.42);
  for(let i=0;i<12;i++)block(A.stone,c.x-s.x*.5-1.2,-.48,c.z-s.z/2+i*1.1,1.2,.1,1);
  const bushes=new T.InstancedMesh(new T.IcosahedronGeometry(1,1),new T.MeshStandardMaterial({color:0x435c3f,roughness:1}),85);
  const blooms=new T.InstancedMesh(new T.IcosahedronGeometry(.055,0),new T.MeshStandardMaterial({color:0xb6a0bd,roughness:1}),255);
  for(let i=0;i<85;i++){
    const x=c.x-s.x*.5+rand()*(s.x+1),z=front+1.5+rand()*.55;
    dummy.position.set(x,-.25,z);dummy.scale.set(.18+rand()*.18,.3+rand()*.3,.25);dummy.updateMatrix();bushes.setMatrixAt(i,dummy.matrix);
    for(let j=0;j<3;j++){dummy.position.set(x+(rand()-.5)*.3,.02+rand()*.22,z+(rand()-.5)*.2);dummy.scale.set(.7,2,.7);dummy.updateMatrix();blooms.setMatrixAt(i*3+j,dummy.matrix);}
  }
  scene.add(bushes,blooms);kit.batch(garden);
  return {skyTexture:skyTex,terrain:land};
}
