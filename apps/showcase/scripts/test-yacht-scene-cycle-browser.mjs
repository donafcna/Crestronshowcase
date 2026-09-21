import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const base=process.env.BASE_URL||'http://127.0.0.1:4173',out='test-results/scene-cycle';
const checks=[],errors=[];
await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 for(const kind of ['phone-host','tablet']){
  const context=await browser.newContext({viewport:{width:1280,height:800},deviceScaleFactor:1,reducedMotion:'reduce'});
  const page=await context.newPage();page.setDefaultTimeout(90000);
  page.on('pageerror',e=>errors.push(kind+': '+e.message));
  await page.goto(base+(kind==='phone-host'?'/interfaces/yacht/yacht-monaco/phone?lang=fr':'/ftv-luxury/gui.html?project=yacht-monaco&device=tablet'),{waitUntil:'domcontentloaded'});
  if(kind==='phone-host')await page.waitForFunction(()=>document.querySelector('.luxury-background')?.dataset.ready==='true',null,{timeout:90000});
  let gui=kind==='phone-host'?await (await page.locator('iframe.ftv-luxury-interface').elementHandle()).contentFrame():page;
  await gui.waitForFunction(()=>window.ftvYachtExteriorGui?.ready,null,{timeout:90000});
  let model=await (await page.locator(kind==='phone-host'?'.luxury-background-frame':'#model').elementHandle()).contentFrame();
  // CPU runner: pause 3D after its real startup; still exercise real clock messages,
  // GUI, scene callbacks and model state, not a mocked lighting implementation.
  await model.evaluate(()=>{window.__ftvPaused=true;renderer.setPixelRatio(.45);});
  if(kind==='phone-host'){
   const p=await page.locator('.phone-device-frame').boundingBox();
   await page.mouse.move(p.x+p.width/2,p.y+p.height/2);await page.mouse.wheel(0,1);
  }
  await gui.evaluate(()=>{window.__cycleCalls=[];window.addEventListener('ftv:control',e=>{if(e.detail.name==='scene')window.__cycleCalls.push(e.detail.value);});});
  async function phase(time,stage){
   await page.waitForTimeout(400);
   await model.evaluate(t=>window.__ftvYachtExterior.setTestTime(t),time);
   await gui.waitForFunction(s=>window.ftvYachtExteriorGui.state.stage===s,stage,{polling:100});
   await page.waitForTimeout(100);
  }
  await phase(2,'day');assert.equal(await gui.evaluate(()=>window.ftvGui.state.preset),'cruise');
  await gui.evaluate(()=>{window.__cycleCalls=[];window.ftvGui.selectRoom('11');});
  await page.waitForTimeout(150);
  const selection=await model.evaluate(()=>window.__ftvModel.state());
  await phase(9.5,'dusk');assert.deepEqual(await gui.evaluate(()=>window.__cycleCalls),[]);
  await phase(10,'night');
  assert.equal(await gui.evaluate(()=>window.ftvGui.state.preset),'dinner');
  assert.equal(await model.evaluate(()=>window.__ftvModel.exteriorState().automatic),true);
  assert.ok(Object.values(await model.evaluate(()=>window.__ftvModel.exteriorState().levels)).every(v=>v>0));
  assert.deepEqual(await model.evaluate(()=>window.__ftvModel.state()),selection);
  assert.equal(await gui.evaluate(()=>{const p=window.ftvGui.config.presets.find(p=>p.id==='dinner');return Object.values(window.ftvGui.state.zones).every(z=>Object.entries(p.values).every(([k,v])=>z.lights[k]===v));}),true);
  checks.push(kind+': night selects dinner on all zones, keeps selection and exterior Auto');
  for(const t of [11,15,18])await phase(t,'night');
  assert.deepEqual(await gui.evaluate(()=>window.__cycleCalls),['dinner']);
  await phase(19.5,'dawn');assert.deepEqual(await gui.evaluate(()=>window.__cycleCalls),['dinner']);
  await phase(20,'day');assert.deepEqual(await gui.evaluate(()=>window.__cycleCalls),['dinner','cruise']);
  assert.ok(Object.values(await model.evaluate(()=>window.__ftvModel.exteriorState().levels)).every(v=>v===0));
  checks.push(kind+': no repeated calls, dusk/dawn untouched, daylight selects cruise');
  await gui.locator('[data-preset="sunset"]').click();await page.waitForTimeout(450);
  assert.equal(await model.evaluate(()=>window.__ftvModel.exteriorState().automatic),false);
  await phase(30,'night');assert.equal(await gui.evaluate(()=>window.ftvGui.state.preset),'sunset');
  await gui.evaluate(()=>window.ftvYachtExteriorGui.show(true));
  await gui.locator('[data-exterior-auto]').check();
  await gui.waitForFunction(()=>window.ftvGui.state.preset==='dinner',null,{polling:100});
  checks.push(kind+': manual priority and explicit Auto restore');
  await gui.evaluate(()=>window.ftvYachtExteriorGui.show(false));
  for(const theme of ['dark','light','glass']){
   await gui.evaluate(t=>window.ftvGui.setTheme(t),theme);
   await page.waitForTimeout(200);
   await gui.locator('#controls').screenshot({path:`${out}/${kind}-${theme}-dinner.png`});
   assert.equal(await gui.locator('[data-preset="dinner"]').getAttribute('aria-pressed'),'true');
  }
  checks.push(kind+': active dinner feedback in all three themes');
  await context.close();
 }
 // The 2D TSW has no WebGL model. Advance its existing timer, no extra scheduler.
 const context=await browser.newContext({viewport:{width:1280,height:800}});
 await context.addInitScript(()=>{
  const interval=window.setInterval.bind(window),callbacks=[];let now=0;
  Object.defineProperty(performance,'now',{value:()=>now});
  window.setInterval=(fn,ms,...args)=>ms===350?(callbacks.push(()=>fn(...args)),callbacks.length):interval(fn,ms,...args);
  window.__advanceCycle=ms=>{now=ms;callbacks.forEach(fn=>fn());};
 });
 const page=await context.newPage();page.on('pageerror',e=>errors.push('TSW: '+e.message));
 await page.goto(base+'/ftv-luxury/gui.html?project=yacht-monaco&device=wallpanel_hd');
 await page.waitForFunction(()=>window.ftvYachtExteriorGui?.ready);
 for(const [ms,preset] of [[0,'cruise'],[9999,'cruise'],[10000,'dinner'],[19999,'dinner'],[20000,'cruise'],[30000,'dinner'],[40000,'cruise']]){
  await page.evaluate(t=>window.__advanceCycle(t),ms);
  assert.equal(await page.evaluate(()=>window.ftvGui.state.preset),preset);
 }
 checks.push('TSW 2D: existing simulated clock also selects dinner/cruise');
 await context.close();assert.deepEqual(errors,[]);
}catch(e){errors.push(e.stack||String(e));process.exitCode=1;}
finally{console.log(JSON.stringify({checks,errors},null,2));await writeFile(`${out}/report.json`,JSON.stringify({checks,errors},null,2));await browser.close();}
