/* global hullMesh, renderer, sky, scene, camera */
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
const base=process.env.ASTERIA_BASE||'http://127.0.0.1:4173',out='test-results/asteria';await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-webgl','--enable-unsafe-swiftshader']});
const errors=[],checks=[],renders=[];let activePage;
function collect(page){activePage=page;page.on('pageerror',e=>errors.push(e.message));page.on('console',e=>{if(e.type()==='error'&&!e.text().includes('favicon'))errors.push(e.text());});}
// Functional/visual evidence, NOT a hardware frame-rate benchmark. Pause the
// animation between captures so SwiftShader's queue cannot starve screenshots.
async function modelCapture(page,name,time,angle=-.7){
  const result=await page.evaluate(({time,angle})=>{
    window.__ftvPaused=true;if(window.__ftvYachtExterior&&time!==null)window.__ftvYachtExterior.setTestTime(time);
    camera.position.set(Math.sin(angle)*135,48,Math.cos(angle)*135);camera.lookAt(-2,9,0);camera.updateMatrixWorld();
    renderer.render(scene,camera);
    return {image:renderer.domElement.toDataURL('image/png'),calls:renderer.info.render.calls,triangles:renderer.info.render.triangles};
  },{time,angle});
  await writeFile(`${out}/${name}.png`,Buffer.from(result.image.split(',')[1],'base64'));
  renders.push({name,calls:result.calls,triangles:result.triangles});console.log('Captured',name,result.calls,'draw calls');
}
async function pauseModels(page){
  for(const frame of page.frames())await frame.evaluate(()=>{if(window.__ftvModel)window.__ftvPaused=true;}).catch(()=>{});
}
try{
  const page=await browser.newPage({viewport:{width:1280,height:800},deviceScaleFactor:1});collect(page);
  await page.goto(base+'/ftv-luxury/models/yacht.html');
  await page.waitForFunction(()=>!!window.__ftvYachtExterior?.finalized,null,{timeout:90000});
  await page.evaluate(()=>{window.__ftvPaused=true;});
  for(const [name,time]of[['day',10],['dusk',35],['night',50],['dawn',75]]){
    await modelCapture(page,'model-'+name,time);
    const info=await page.evaluate(()=>window.__ftvYachtExterior.inspect());
    assert.equal(info.circuits,40);assert.ok(Object.values(info.fixtures).every(n=>n>0));assert.equal(info.extraLights,6);
    if(name==='day')assert.ok(Object.values(info.state.levels).every(n=>n===0));
    if(name==='night')assert.ok(Object.values(info.state.levels).every(n=>n>0));checks.push('model-'+name);
  }
  const optimized=await page.evaluate(()=>window.__ftvYachtExterior.finalized);assert.ok(optimized.legacyCount>0);assert.ok(optimized.instancedFixtures>0);
  await page.evaluate(()=>{window.__ftvYachtExterior.setTestTime(50);window.__ftvModel.exterior({action:'level',id:'name_port',value:0});});
  const manual=await page.evaluate(()=>window.__ftvYachtExterior.inspect().state);assert.equal(manual.levels.name_port,0);assert.equal(manual.stage,'night');assert.equal(manual.automatic,false);
  await page.evaluate(()=>window.__ftvModel.exterior({action:'automatic',value:true}));assert.equal((await page.evaluate(()=>window.__ftvYachtExterior.inspect().state)).levels.name_port,100);
  for(const [label,angle]of[['bow',1.05],['port',2.45],['stern',-2.0]])await modelCapture(page,'night-'+label,50,angle);
  const depth=await page.evaluate(()=>({transparent:hullMesh.material.transparent,opacity:hullMesh.material.opacity,write:hullMesh.material.depthWrite,test:hullMesh.material.depthTest,side:hullMesh.material.side,shaderFailures:renderer.info.programs.filter(p=>p.diagnostics&&p.diagnostics.runnable===false).length}));
  assert.deepEqual(depth,{transparent:false,opacity:1,write:true,test:true,side:0,shaderFailures:0});checks.push('opaque-depth-and-shaders');
  const skyBefore=await page.evaluate(()=>sky.uniforms.zenith.value.getHex());await page.evaluate(()=>window.__ftvModel.scene('cruise'));
  assert.equal(await page.evaluate(()=>sky.uniforms.zenith.value.getHex()),skyBefore);checks.push('lighting-not-environment');await page.close();
  // Capture the actual unchanged baseline with its original bridge and sea.
  const before=await browser.newPage({viewport:{width:1280,height:800},deviceScaleFactor:1});collect(before);
  for(const file of ['model-bridge.js','sea.js']){
    const body=execFileSync('git',['show',`04ec427a6c509fe34e622dff14cbc3014a7aa440:apps/showcase/public/ftv-luxury/${file}`],{encoding:'utf8'});
    await before.route('**/ftv-luxury/'+file,route=>route.fulfill({contentType:'application/javascript',body}));
  }
  await before.goto(base+'/ftv-luxury/models/yacht.html');await before.waitForFunction(()=>!!window.__ftvModel,null,{timeout:90000});await modelCapture(before,'baseline-day',null);await before.close();checks.push('baseline-captured');
  for(const [device,size]of[['phone',{width:393,height:852}],['wallpanel_hd',{width:1280,height:800}],['tablet',{width:1180,height:820}]]){
    const gui=await browser.newPage({viewport:size,deviceScaleFactor:1});collect(gui);await gui.goto(`${base}/ftv-luxury/gui.html?project=yacht-monaco&device=${device}`);
    await gui.waitForFunction(()=>window.ftvYachtExteriorGui?.ready,null,{timeout:90000});await pauseModels(gui);
    for(const theme of ['dark','light','glass']){
      await gui.evaluate(t=>window.ftvGui.setTheme(t),theme);await gui.locator('[data-exterior-open]').click();
      await gui.locator('[data-exterior-preset="night"]').click();await gui.waitForFunction(()=>Object.values(window.ftvYachtExteriorGui.state.levels).every(n=>n>0));
      await gui.locator('[data-exterior-group]').selectOption('water');await gui.locator('[data-exterior-id="underwater_port"]').evaluate(el=>{el.value='23';el.dispatchEvent(new Event('input',{bubbles:true}));});
      await gui.waitForFunction(()=>window.ftvYachtExteriorGui.state.levels.underwater_port===23);assert.equal(await gui.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
      if(size.width>650)assert.equal(await gui.locator('.yacht-exterior-panel').evaluate(el=>el.scrollHeight<=el.clientHeight+1),true,'Desktop circuit page overflow');
      await pauseModels(gui);await gui.screenshot({path:`${out}/gui-${device}-${theme}.png`,timeout:90000});
      await gui.locator('[data-exterior-auto]').check();await gui.waitForFunction(()=>window.ftvYachtExteriorGui.state.automatic);await gui.locator('[data-exterior-close]').click();checks.push(`${device}-${theme}-controls`);
    }
    await gui.evaluate(()=>{window.ftvGui.selectRoom('10');window.ftvGui.chooseTab('light');});await gui.locator('[data-exterior-open]').waitFor();checks.push(device+'-launcher-after-zone-change');await gui.close();
  }
  assert.deepEqual(errors,[],'JavaScript/WebGL errors');
}catch(e){
  errors.push(String(e.stack||e));if(activePage&&!activePage.isClosed()){await pauseModels(activePage);await activePage.screenshot({path:`${out}/failure.png`,timeout:60000}).catch(()=>{});}throw e;
}finally{await writeFile(`${out}/report.json`,JSON.stringify({checks,errors,renders},null,2));console.log(JSON.stringify({checks,errors,renders},null,2));await browser.close();}
