/* global desiredYaw, desiredPitch, hullMesh, renderer, sky */
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const base=process.env.ASTERIA_BASE||'http://127.0.0.1:4173',out='test-results/asteria';await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-webgl','--enable-unsafe-swiftshader']});
const errors=[],checks=[];let activePage;
function collect(page){activePage=page;page.on('pageerror',e=>errors.push(e.message));page.on('console',e=>{if(e.type()==='error'&&!e.text().includes('favicon'))errors.push(e.text());});}
try{
  const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});collect(page);
  await page.goto(base+'/ftv-luxury/models/yacht.html');
  await page.waitForFunction(()=>!!window.__ftvYachtExterior,null,{timeout:90000});
  for(const [name,time]of[['day',10],['dusk',35],['night',50],['dawn',75]]){
    await page.evaluate(t=>window.__ftvYachtExterior.setTestTime(t),time);await page.waitForTimeout(700);
    const info=await page.evaluate(()=>window.__ftvYachtExterior.inspect());
    assert.equal(info.circuits,40);assert.ok(Object.values(info.fixtures).every(n=>n>0));assert.equal(info.extraLights,6);
    if(name==='day')assert.ok(Object.values(info.state.levels).every(n=>n===0));
    if(name==='night')assert.ok(Object.values(info.state.levels).every(n=>n>0));
    await page.screenshot({path:`${out}/model-${name}.png`});checks.push('model-'+name);
  }
  await page.evaluate(()=>{window.__ftvYachtExterior.setTestTime(50);window.__ftvModel.exterior({action:'level',id:'name_port',value:0});});
  const manual=await page.evaluate(()=>window.__ftvYachtExterior.inspect().state);assert.equal(manual.levels.name_port,0);assert.equal(manual.stage,'night');assert.equal(manual.automatic,false);
  await page.evaluate(()=>window.__ftvModel.exterior({action:'automatic',value:true}));
  assert.equal((await page.evaluate(()=>window.__ftvYachtExterior.inspect().state)).levels.name_port,100);
  for(const [label,value]of[['bow',1.05],['port',2.45],['stern',-2.0]]){
    await page.evaluate(v=>{desiredYaw=v;desiredPitch=.25;},value);await page.waitForTimeout(1400);await page.screenshot({path:`${out}/night-${label}.png`});
  }
  const depth=await page.evaluate(()=>({transparent:hullMesh.material.transparent,opacity:hullMesh.material.opacity,write:hullMesh.material.depthWrite,test:hullMesh.material.depthTest,side:hullMesh.material.side,shaderFailures:renderer.info.programs.filter(p=>p.diagnostics&&p.diagnostics.runnable===false).length}));
  assert.deepEqual(depth,{transparent:false,opacity:1,write:true,test:true,side:0,shaderFailures:0});checks.push('opaque-depth-and-shaders');
  // GUI presets must only change fixtures, never the sky or clock.
  const skyBefore=await page.evaluate(()=>sky.uniforms.zenith.value.getHex());
  await page.evaluate(()=>window.__ftvModel.scene('cruise'));
  assert.equal(await page.evaluate(()=>sky.uniforms.zenith.value.getHex()),skyBefore);checks.push('lighting-not-environment');
  await page.close();
  for(const [device,size]of[['phone',{width:393,height:852}],['wallpanel_hd',{width:1280,height:800}],['tablet',{width:1180,height:820}]]){
    const gui=await browser.newPage({viewport:size,deviceScaleFactor:1});collect(gui);await gui.goto(`${base}/ftv-luxury/gui.html?project=yacht-monaco&device=${device}`);
    await gui.waitForFunction(()=>window.ftvYachtExteriorGui?.ready,null,{timeout:90000});
    for(const theme of ['dark','light','glass']){
      await gui.evaluate(t=>window.ftvGui.setTheme(t),theme);await gui.locator('[data-exterior-open]').click();
      await gui.locator('[data-exterior-preset="night"]').click();await gui.waitForFunction(()=>Object.values(window.ftvYachtExteriorGui.state.levels).every(n=>n>0));
      await gui.locator('[data-exterior-group]').selectOption('water');
      await gui.locator('[data-exterior-id="underwater_port"]').evaluate(el=>{el.value='23';el.dispatchEvent(new Event('input',{bubbles:true}));});
      await gui.waitForFunction(()=>window.ftvYachtExteriorGui.state.levels.underwater_port===23);
      assert.equal(await gui.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
      if(size.width>650)assert.equal(await gui.locator('.yacht-exterior-panel').evaluate(el=>el.scrollHeight<=el.clientHeight+1),true,'Desktop circuit page overflow');
      await gui.screenshot({path:`${out}/gui-${device}-${theme}.png`});
      await gui.locator('[data-exterior-auto]').check();await gui.waitForFunction(()=>window.ftvYachtExteriorGui.state.automatic);
      await gui.locator('[data-exterior-close]').click();checks.push(`${device}-${theme}-controls`);
    }
    await gui.evaluate(()=>window.ftvGui.selectRoom('10'));await gui.locator('[data-exterior-open]').waitFor();checks.push(device+'-launcher-after-zone-change');await gui.close();
  }
  assert.deepEqual(errors,[],'JavaScript/WebGL errors');
}catch(e){
  errors.push(String(e.stack||e));if(activePage&&!activePage.isClosed())await activePage.screenshot({path:`${out}/failure.png`}).catch(()=>{});throw e;
}finally{await writeFile(`${out}/report.json`,JSON.stringify({checks,errors},null,2));console.log(JSON.stringify({checks,errors},null,2));await browser.close();}
