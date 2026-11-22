import * as T from './vendor/three.module.min.js';
import { scaleFloorUV } from './material-finish.js?v=2026-11-22-villa-1';

// Small bevels replace sharp boxes; no extra meshes, lights or per-frame work.
function bevelBox(w, h, d, soft) {
  const r = Math.min(soft ? .085 : .025, Math.min(w,h,d) * (soft ? .28 : .22));
  const geo = new T.BoxGeometry(w,h,d,3,3,3);
  const p=geo.attributes.position,n=geo.attributes.normal,half=[w/2,h/2,d/2];
  const colors=new Float32Array(p.count*3);
  for(let i=0;i<p.count;i++){
    const raw=[p.getX(i),p.getY(i),p.getZ(i)];
    const v=raw.map((a,j)=>Math.abs(a)<half[j]*.9?Math.sign(a)*(half[j]-r):a);
    const inner=v.map((a,j)=>T.MathUtils.clamp(a,-half[j]+r,half[j]-r));
    const normal=new T.Vector3(...v.map((a,j)=>a-inner[j])).normalize();
    p.setXYZ(i,inner[0]+normal.x*r,inner[1]+normal.y*r,inner[2]+normal.z*r);
    n.setXYZ(i,normal.x,normal.y,normal.z);
    // Baked cavity shading: restrained on timber, deeper on upholstery seams/base.
    const height=(p.getY(i)+h/2)/h;
    const shade=soft?.70+.30*Math.sqrt(height):.85+.15*height;
    colors.set([shade,shade,shade],i*3);
  }
  geo.setAttribute('color',new T.BufferAttribute(colors,3));
  return geo;
}

export function finishFurniture(R, palette, assets, protectedMeshes) {
  if(R.ext || ['sauna','garage','golf','technique'].includes(R.cfg.type))return;
  const soft=new Set([palette.tissu,palette.tissuFonce,palette.lit,palette.coussin,assets.cream,assets.moss,assets.clay]);
  const timber=new Set([palette.bois,palette.boisClair,assets.oak]);
  const room=R.group, occluders=[], owned=[];
  room.updateMatrixWorld(true);
  const inverse=room.matrixWorld.clone().invert();
  room.traverse(o=>{
    if(!o.isMesh || protectedMeshes.has(o) || o.userData.animated || o.material.transparent)return;
    if(!soft.has(o.material)&&!timber.has(o.material))return;
    o.geometry.computeBoundingBox();
    const bounds=o.geometry.boundingBox, size=bounds.getSize(new T.Vector3()).multiply(o.scale);
    // Only furniture-sized solids: leave rails, walls, doors and motor assemblies intact.
    if(Math.min(size.x,size.y,size.z)<.075 || Math.max(size.x,size.y,size.z)>3.2)return;
    const boxLike=['BoxGeometry','ExtrudeGeometry'].includes(o.geometry.type);
    if(boxLike){
      const geo=bevelBox(size.x,size.y,size.z,soft.has(o.material));
      const center=bounds.getCenter(new T.Vector3()).multiply(o.scale);
      geo.translate(center.x,center.y,center.z);
      o.geometry=geo;o.scale.set(1,1,1);owned.push(geo);
      o.material.vertexColors=true;
    }
    o.updateMatrixWorld(true);
    const local=new T.Matrix4().multiplyMatrices(inverse,o.matrixWorld);
    o.geometry.computeBoundingBox();
    const b=o.geometry.boundingBox.clone().applyMatrix4(local);
    if(b.min.y<.58&&b.max.y>.12)occluders.push(b);
  });
  // Contact shading baked into floor vertex colors; it follows static furniture only.
  // 24x24 grid is enough at this scale and adds no texture or draw call.
  for(const o of room.children){
    if(!o.isMesh || ![palette.sol,palette.solChambre].includes(o.material))continue;
    const a=o.geometry.parameters;if(!a?.width || a.height>.05)continue;
    const geo=new T.BoxGeometry(a.width,a.height,a.depth,24,1,24);
    o.geometry.dispose();o.geometry=geo;owned.push(geo);scaleFloorUV(o);
    const p=geo.attributes.position,colors=new Float32Array(p.count*3);
    for(let i=0;i<p.count;i++){
      const x=p.getX(i)+o.position.x,z=p.getZ(i)+o.position.z;
      let cavity=.19*Math.exp(-Math.max(0,Math.min(x-.15,z-.15))/.24);
      for(const b of occluders){
        const dx=Math.max(b.min.x-x,0,x-b.max.x),dz=Math.max(b.min.z-z,0,z-b.max.z);
        const distance=Math.hypot(dx,dz);
        cavity=Math.max(cavity,.42*Math.exp(-distance*distance/.065));
      }
      colors.set([1-cavity,1-cavity,1-cavity],i*3);
    }
    geo.setAttribute('color',new T.BufferAttribute(colors,3));o.material.vertexColors=true;
  }
  // Shared materials also occur on unmodified spheres/cylinders (pillows, shades).
  // Supply explicit white colors rather than relying on a missing GPU attribute.
  room.traverse(o=>{
    if(!o.isMesh||!o.material.vertexColors||o.geometry.getAttribute('color'))return;
    const colors=new Float32Array(o.geometry.attributes.position.count*3).fill(1);
    o.geometry.setAttribute('color',new T.BufferAttribute(colors,3));
  });
  return owned;
}
