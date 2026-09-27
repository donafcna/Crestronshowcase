// Observe actual visible frames; do not pause, jump or replace the renderer.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const base=process.env.BASE_URL||'http://127.0.0.1:4173';
const out=process.env.TEST_OUTPUT||'test-results/villa-entry';
await mkdir(out,{recursive:true});
const report={base,cases:[],errors:[]};
const browser=await chromium.launch({args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
let page;
try{
 const context=await browser.newContext({viewport:{width:1758,height:900},deviceScaleFactor:.5,serviceWorkers:'block'});
 page=await context.newPage();page.setDefaultTimeout(90000);
 page.on('pageerror',e=>report.errors.push(e.message));
 await context.addInitScript(()=>{
  if(window!==window.top)return;
  window.__villaVisibleFrames=[];
  const nativeRaf=window.requestAnimationFrame.bind(window);
  const sample=()=>{
   const canvas=document.querySelector('.villa-entry-background canvas');
   const parent=canvas?.parentElement,api=window.__plan3d;
   if(canvas&&Number(getComputedStyle(canvas).opacity)===0)window.__villaVisibleFrames=[];
   if(canvas&&Number(getComputedStyle(canvas).opacity)>0){
    const frame={at:performance.now(),ready:parent?.dataset.ready,nav:api?.navigation(),entry:api?.entry?.state()};
    const list=window.__villaVisibleFrames;
    if(list.length<350)list.push(frame);
   }
   nativeRaf(sample);
  };nativeRaf(sample);
 });
 const verify = async scenario => {
  await page.waitForFunction(()=>window.__plan3d?.entry?.ready,null,{polling:100});
  await page.waitForTimeout(900);
  const data=await page.evaluate(()=>({frames:window.__villaVisibleFrames,pose:__plan3d.entry.state().pose,metrics:__plan3d.metrics(),nav:__plan3d.navigation()}));
  assert.ok(data.frames.length>0,'at least one real visible frame');
  const first=data.frames[0];assert.equal(first.ready,'true');assert.equal(first.nav.phase,'overview-closed');assert.equal(first.nav.moving,false);
  const relevant=data.frames.filter(f=>f.at-first.at<750);
  for(const f of relevant){
   assert.equal(f.nav.phase,'overview-closed');assert.equal(f.nav.moving,false);
   for(const key of ['camera','target'])assert.ok(f.nav[key].every((v,i)=>Math.abs(v-data.pose[key][i])<.001),key+' must be final from the first visible frame');
  }
  assert.equal(first.entry.ready,true);assert.ok(data.metrics.renderedFrames>first.entry.fittedAtFrame);
  assert.ok(data.metrics.zone.w>260&&data.metrics.zone.h>100);
  report.cases.push({scenario,firstFrame:first,visibleSamples:relevant.length,checks:['complete villa in first visible frame','no initial camera movement','final free-space viewport applied']});
  await page.screenshot({path:`${out}/${scenario}.png`,timeout:90000});
 };
 for(const scenario of ['first-menu-entry','return-from-menu','resize-during-entry']){
  if(scenario==='return-from-menu')await page.locator('a[href="/contact"]').first().click();
  else await page.goto(base+'/contact?lang=fr',{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>{window.__villaVisibleFrames=[];});
  await page.locator('.sidebar-nav .sector-btn[href="/interfaces/residentiel"]').click();
  if(scenario==='resize-during-entry'){
   await page.waitForSelector('.villa-entry-background canvas',{state:'attached'});
   await page.setViewportSize({width:1440,height:950});
  }
  await verify(scenario);
 }
 await page.locator('.device-stage').click({position:{x:5,y:5}});
 const focus=await page.evaluate(()=>{__plan3d.holdOverview(false);__plan3d.setRoom(Object.keys(__plan3d.rooms)[0]);return __plan3d.navigation();});
 assert.notEqual(focus.phase,'overview-closed');
 await page.waitForFunction(()=>__plan3d.navigation().phase==='room',null,{polling:100,timeout:45000});
 // Repeat the sector click while the model is already mounted and zoomed.
 await page.evaluate(()=>{window.__previousVillaGate=__plan3d.entry;});
 await page.locator('.sidebar-nav .sector-btn[href="/interfaces/residentiel"]').click();
 await page.waitForFunction(()=>window.__plan3d?.entry?.ready&&__plan3d.entry!==window.__previousVillaGate,null,{polling:100});
 await verify('same-sector-reentry-from-room');
 // The entry-only snap must not disable later model navigation.
 await page.locator('.device-stage').click({position:{x:5,y:5}});
 await page.evaluate(()=>{__plan3d.holdOverview(false);__plan3d.setRoom(Object.keys(__plan3d.rooms)[0]);});
 await page.waitForFunction(()=>__plan3d.navigation().phase==='room',null,{polling:100,timeout:45000});
 const returning=await page.evaluate(()=>{__plan3d.overview();return __plan3d.navigation();});
 assert.equal(returning.moving,true,'later overview still animates');
 report.navigation='room focus and animated return preserved';
}catch(e){report.failure=e.stack||String(e);process.exitCode=1;if(page)await page.screenshot({path:out+'/failure.png',timeout:30000}).catch(()=>{});}
finally{await writeFile(out+'/report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));await browser.close();}
