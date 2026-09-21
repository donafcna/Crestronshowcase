/* global renderer, scene, camera, sky */
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const base=process.env.BASE_URL||'http://127.0.0.1:4173',out='test-results/night';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const errors=[],checks=[],renders=[];
function collect(p){p.on('pageerror',e=>errors.push(e.message));p.on('console',e=>{if(e.type()==='error'&&!e.text().includes('favicon'))errors.push(e.text());});}
async function capture(page,name,seconds){
 const result=await page.evaluate(seconds=>{
  window.__ftvPaused=true;
  const ext=window.__ftvYachtExterior;ext.setTestTime(seconds);
  renderer.setPixelRatio(1);camera.clearViewOffset();camera.position.set(-68,36,88);camera.lookAt(-2,9,0);camera.updateProjectionMatrix();camera.updateMatrixWorld();sky.update(0,camera);
  for(let i=0;i<3;i++)renderer.render(scene,camera);
  const c=document.createElement('canvas');c.width=renderer.domElement.width;c.height=renderer.domElement.height;
  const ctx=c.getContext('2d');ctx.drawImage(renderer.domElement,0,0);const data=ctx.getImageData(0,0,c.width,c.height).data;
  let warm=0,bright=0;
  for(let i=0;i<data.length;i+=4){const r=data[i],g=data[i+1],b=data[i+2];if(r>65&&r>b*1.18&&g>r*.55&&g<r*1.05)warm++;if(r>200&&g>170)bright++;}
  return {image:renderer.domElement.toDataURL('image/png'),warm,bright,calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,state:ext.controller.state(),camera:camera.position.toArray(),finish:ext.nightFinish?{version:ext.nightFinish.version,edges:ext.nightFinish.edges,removedAirCones:ext.nightFinish.removedAirCones,additionalLights:ext.nightFinish.additionalLights}:null};
 },seconds);
 await writeFile(`${out}/${name}.png`,Buffer.from(result.image.split(',')[1],'base64'));delete result.image;
 renders.push({name,...result});return result;
}
try{
 for(const baseline of [true,false]){
  const p=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1,reducedMotion:'reduce'});collect(p);p.setDefaultTimeout(90000);
  await p.addInitScript(()=>{window.requestAnimationFrame=fn=>{window.__testAnimation=fn;return 1;};});
  if(baseline)await p.route('**/yacht-night-finish.js',r=>r.fulfill({contentType:'application/javascript',body:'/* exact prior renderer: finish absent */'}));
  await p.goto(base+'/ftv-luxury/models/yacht.html',{waitUntil:'load'});
  await p.waitForFunction(()=>window.__ftvYachtExterior?.finalized,null,{polling:100});
  const night=await capture(p,baseline?'before-night':'after-night',50);
  assert.ok(Object.values(night.state.levels).every(v=>v>0));checks.push((baseline?'before':'after')+' / exterior auto on at night');
  if(!baseline){
   assert.equal(night.finish.edges,6);assert.equal(night.finish.removedAirCones,4);assert.equal(night.finish.additionalLights,0);checks.push('visible deck edges / no air cones / no extra lights');
   const previous=renders.find(r=>r.name==='before-night');assert.deepEqual(night.camera,previous.camera);assert.ok(night.warm>previous.warm*1.3,`Warm footprint ${night.warm} vs ${previous.warm}`);checks.push('same camera / increased warm lighting footprint');
   for(const [label,t] of [['day',10],['dusk',35],['dawn',75]]){
    const r=await capture(p,'after-'+label,t);if(t===10)assert.ok(Object.values(r.state.levels).every(v=>v===0));checks.push('cycle '+label);
   }
   await p.evaluate(()=>window.__ftvModel.exterior({action:'preset',key:'off'}));
   const off=await capture(p,'after-night-exterior-off',50);assert.ok(Object.values(off.state.levels).every(v=>v===0));assert.ok(off.warm<night.warm);checks.push('manual OFF extinguishes circuit-driven surface light');
   await p.evaluate(()=>window.__ftvModel.exterior({action:'automatic',value:true}));
   const restored=await capture(p,'after-night-restored',50);assert.ok(Object.values(restored.state.levels).every(v=>v>0));checks.push('Auto restores exterior light');
   const failures=await p.evaluate(()=>renderer.info.programs.filter(p=>p.diagnostics?.runnable===false).length);assert.equal(failures,0);checks.push('all shaders runnable');
  }
  await p.close();
 }
 const gui=await browser.newPage({viewport:{width:1280,height:800},deviceScaleFactor:1,reducedMotion:'reduce'});collect(gui);gui.setDefaultTimeout(90000);
 await gui.goto(base+'/ftv-luxury/gui.html?project=yacht-monaco&device=tablet');
 await gui.waitForFunction(()=>window.ftvYachtExteriorGui?.ready,null,{timeout:90000});
 const frame=await (await gui.locator('#model').elementHandle()).contentFrame();
 await frame.evaluate(()=>{window.__ftvPaused=true;window.__ftvYachtExterior.setTestTime(50);});
 await gui.evaluate(()=>window.ftvGui.applyPreset('cruise'));
 await gui.waitForTimeout(300);
 assert.equal(await frame.evaluate(()=>window.__ftvModel.exteriorState().automatic),true);checks.push('automatic tour preset does not exit exterior Auto');
 await gui.locator('[data-preset="night"]').click();await gui.waitForTimeout(300);
 assert.equal(await frame.evaluate(()=>window.__ftvModel.exteriorState().automatic),false);checks.push('real user preset retains manual priority');
 await gui.close();assert.deepEqual(errors,[]);
}catch(e){errors.push(e.stack||String(e));process.exitCode=1;}
finally{await writeFile(`${out}/report.json`,JSON.stringify({checks,errors,renders},null,2));console.log(JSON.stringify({checks,errors,metrics:renders.map(({name,warm,bright,calls,triangles})=>({name,warm,bright,calls,triangles}))},null,2));await browser.close();}
