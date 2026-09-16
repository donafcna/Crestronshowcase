import * as T from './vendor/three.module.min.js';

// The retained north/west walls and these south/east façades close each volume.
// The exploded floors stay readable; no roof prevents the second click from
// selecting a room once the façade has opened.
export function createEnvelope(scene, rooms, palette) {
  const group = new T.Group(); group.name = 'Villa exterior envelope'; scene.add(group);
  const plaster = palette.mur.clone(), trim = palette.alu.clone(), wood = palette.bois.clone();
  const glass = new T.MeshStandardMaterial({color:0x6f8e98,roughness:.28,metalness:.3});
  const materials = [plaster, trim, wood, glass];
  const geometry = new T.BoxGeometry(1,1,1);
  const instances = new Map(materials.map(m=>[m,[]]));
  const dummy = new T.Object3D();
  function box(m,x,y,z,w,h,d){dummy.position.set(x,y,z);dummy.scale.set(w,h,d);dummy.updateMatrix();instances.get(m).push(dummy.matrix.clone());}
  for(const r of Object.values(rooms)){
    if(r.ext)continue;
    const {x,z,w,d}=r.cfg,y=r.y0;
    const opening=Math.min(2.4,w*.48),left=(w-opening)/2;
    // South elevation: opaque piers, glazing between sill and lintel.
    box(plaster,x+left/2,y+1.5,z+d-.075,left,3,.15);
    box(plaster,x+w-left/2,y+1.5,z+d-.075,left,3,.15);
    box(plaster,x+w/2,y+.4,z+d-.075,opening,.8,.15);
    box(plaster,x+w/2,y+2.75,z+d-.075,opening,.5,.15);
    box(glass,x+w/2,y+1.65,z+d-.075,opening,1.7,.06);
    for(const sx of [-1,0,1])box(trim,x+w/2+sx*opening/2,y+1.65,z+d-.02,.045,1.76,.05);
    for(const sy of [.8,2.5])box(trim,x+w/2,y+sy,z+d-.02,opening+.05,.045,.05);
    // East elevation and a timber fascia make the formerly missing walls explicit.
    box(plaster,x+w-.075,y+1.5,z+d/2,.15,3,d-.15);
    box(wood,x+w/2,y+2.96,z+d+.015,w,.12,.07);
    box(wood,x+w+.015,y+2.96,z+d/2,.07,.12,d);
  }
  for(const [m,matrices] of instances){
    const mesh=new T.InstancedMesh(geometry,m,matrices.length);
    matrices.forEach((matrix,i)=>mesh.setMatrixAt(i,matrix));group.add(mesh);
  }
  let opacity=1;
  return {
    group,
    get opacity(){return opacity;},
    setOpacity(value){
      opacity=Math.max(0,Math.min(1,value));group.visible=opacity>.001;
      for(const m of materials){const transparent=opacity<.999;if(m.transparent!==transparent){m.transparent=transparent;m.needsUpdate=true;}m.opacity=opacity;m.depthWrite=!transparent;}
    }
  };
}
