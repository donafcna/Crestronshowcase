/* global skin, scene, sea, M */
/* Finish exterior fixtures after construction: bind legacy outdoor luminaires,
 * keep existing basin access geometry, and instance repeated static fittings.
 * No additional renderer or animation loop, and no changes to interior rooms.
 */
(function(){
  'use strict';
  const ext=window.__ftvYachtExterior,T=window.THREE;if(!ext||ext.finalized)return;
  const root=ext.root,materialByCircuit=new Map(),newObjects=new Set();
  root.traverse(o=>{newObjects.add(o);const m=o.material;if(m?.name.startsWith('Exterior · ')&&!m.map)materialByCircuit.set(m.name.slice(11),m);});
  const vector=new T.Vector3();let legacyCount=0;
  skin.updateMatrixWorld(true);
  skin.traverse(o=>{
    if(newObjects.has(o)||!o.isMesh||!o.material?.name.startsWith('Light '))return;
    o.getWorldPosition(vector);const {x,y,z}=vector,side=z<0?'port':'starboard',kind=o.material.name.slice(6);
    const deck=y>13?'sundeck':y>9.6?'bridge':y>6.4?'owner':'main';
    const id=kind==='pool'?(y>13?'pool_sundeck':'jacuzzi_water'):kind==='night'?(x< -35&&y<4.2?'stairs_stern_'+side:`walk_${deck}_${side}`):deck==='sundeck'?'bar_sundeck':'lounge_'+deck;
    const material=materialByCircuit.get(id);if(material){o.material=material;legacyCount++;}
  });
  // Use the existing three basin-access steps on the upper deck. Do not invent
  // a flight crossing the solid sun-deck slab or a lounge/circulation footprint.
  for(const mesh of [...root.children]){
    if(!mesh.isMesh)continue;
    if(mesh.material===M.teak&&Math.abs(Math.abs(mesh.position.z)-4.62)<.001&&Math.abs(mesh.scale.y-.18)<.001)root.remove(mesh);
    if(/^Exterior · stairs_upper_/.test(mesh.material?.name||''))root.remove(mesh);
  }
  const stepGeometry=new T.BoxGeometry(1,1,1);
  for(const side of [-1,1]){
    const id='stairs_upper_'+(side<0?'port':'starboard'),material=materialByCircuit.get(id);
    if(!material)throw new Error('Missing upper-step circuit material.');
    for(let i=0;i<3;i++){
      const strip=new T.Mesh(stepGeometry,material);strip.name=id+' · basin step '+(i+1);
      strip.position.set(5.49,14.495+i*.1,side*.6);strip.scale.set(.025,.025,.30);strip.receiveShadow=true;root.add(strip);
    }
    ext.fixtures[id]=3;
  }
  // Built-in materials support instanceMatrix. Custom beam/wash shaders are
  // deliberately excluded; batching those without shader support breaks them.
  const groups=new Map();
  for(const mesh of root.children){
    if(!mesh.isMesh||mesh.isInstancedMesh||mesh.material.isShaderMaterial||mesh.material.map||mesh.material.transparent||!['BoxGeometry','CylinderGeometry','SphereGeometry'].includes(mesh.geometry.type))continue;
    const key=mesh.material.uuid+'|'+mesh.geometry.type+'|'+JSON.stringify(mesh.geometry.parameters);
    if(!groups.has(key))groups.set(key,[]);groups.get(key).push(mesh);
  }
  let instancedFixtures=0,batches=0;
  for(const meshes of groups.values()){
    if(meshes.length<2)continue;
    const batch=new T.InstancedMesh(meshes[0].geometry,meshes[0].material,meshes.length);
    batch.name='Instanced exterior · '+meshes[0].material.name;batch.castShadow=false;batch.receiveShadow=true;
    meshes.forEach((mesh,i)=>{mesh.updateMatrix();batch.setMatrixAt(i,mesh.matrix);root.remove(mesh);});
    batch.instanceMatrix.needsUpdate=true;batch.computeBoundingBox();batch.computeBoundingSphere();root.add(batch);instancedFixtures+=meshes.length;batches++;
  }
  const optical=[];root.traverse(o=>{if(o.isMesh&&(o.material?.isShaderMaterial&&o.material.uniforms.amount||o.material?.isMeshBasicMaterial&&o.material.transparent))optical.push(o);});
  const before=scene.onBeforeRender;
  scene.onBeforeRender=function(...args){
    before?.apply(this,args);
    const day=window.FTV_YACHT_EXTERIOR.cycle(ext.controller.state().seconds).day;
    sea.material.envMapIntensity=.035+.765*day;
    for(const mesh of optical)mesh.visible=mesh.material.uniforms?.amount?mesh.material.uniforms.amount.value>.001:mesh.material.opacity>.001;
  };
  ext.finalized={legacyCount,instancedFixtures,batches};
})();
