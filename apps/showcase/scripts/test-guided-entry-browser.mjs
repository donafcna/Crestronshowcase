// Real menu, GUI, scene clicks and rendering. No replacement clocks/renderers.
// Exact configured delays are unit-tested; report real latency separately on
// software WebGL, where a render can delay a timer by several seconds.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const base=process.env.BASE_URL||'http://127.0.0.1:4173',out=process.env.TEST_OUTPUT||'test-results/guided-entry';
await mkdir(out,{recursive:true});
const report={base,cases:[],errors:[]};let activePage;
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
function checkGap(sleeps,from,to,expected){
 const ticks=sleeps.filter(s=>s.at>=from-1&&s.at<to);
 assert.ok(ticks.length>0,'actual tour sleep callbacks observed');
 const programmed=ticks.reduce((n,s)=>n+s.ms,0),late=ticks.reduce((n,s)=>n+(s.late||0),0);
 assert.ok(programmed<=expected+60,`No extra programmed wait: ${programmed} / ${expected}`);
 assert.ok(to-from>=expected-50,`No early click: ${to-from}`);
 assert.ok(to-from<90000,'next action must complete rather than stall indefinitely');
 return {targetMs:expected,actualMs:to-from,programmedMs:programmed,lateTimersMs:late,otherRuntimeDelayMs:Math.max(0,to-from-expected-late)};
}
try{
 for(const [sector,project,firstZone,scenes] of [
  ['boutique','boutique-hermes','hall',['private','gala','opening']],
  ['restaurant','sushi-bar-kyoto','accueil',['dinner','rooftop','welcome']],
  ['yacht','yacht-monaco','0',['sunset','dinner','cruise']]
 ]){
  if(process.env.SECTOR&&process.env.SECTOR!==sector)continue;
  for(const [theme,mode] of (process.env.SMOKE==='1'?[['dark','normal']]:[['dark','normal'],['light','normal'],['glass','scene']])){
   const context=await browser.newContext({viewport:{width:1536,height:1000},deviceScaleFactor:.5,reducedMotion:'reduce',serviceWorkers:'block'});
   const page=await context.newPage();activePage=page;page.setDefaultTimeout(120000);
   const result={sector,project,theme,mode,events:[],checks:[]};report.cases.push(result);
   page.on('pageerror',e=>report.errors.push(`${project}: ${e.message}`));
   await context.addInitScript(({theme})=>{
    localStorage.setItem('ftv-luxury-theme',theme);
    window.__guidedTrace=[];window.__guidedSleeps=[];
    const stamp=()=>performance.timeOrigin+performance.now();
    const record=e=>window.__guidedTrace.push({...e,at:stamp()});
    const timeout=window.setTimeout.bind(window);
    window.setTimeout=function(callback,delay,...args){
     if(typeof callback==='function'&&callback.toString().includes('cancels')){
      const entry={at:stamp(),ms:Number(delay)||0};window.__guidedSleeps.push(entry);
      return timeout(function(...values){entry.ranAt=stamp();entry.late=Math.max(0,entry.ranAt-entry.at-entry.ms);return callback.apply(this,values);},delay,...args);
     }
     return timeout(callback,delay,...args);
    };
    const nativeClick=HTMLElement.prototype.click;
    HTMLElement.prototype.click=function(...args){
     const b=this.closest?.('[data-preset],[data-scene]');
     if(b)record({type:'scene',id:b.dataset.preset||b.dataset.scene});
     return nativeClick.apply(this,args);
    };
    window.addEventListener('ftv:control',e=>{
     if(e.detail?.name==='selectRoom'&&e.detail.value!=='all')record({type:'zone',id:e.detail.value});
     if(e.detail?.name==='scene')record({type:'feedback',id:e.detail.value});
    });
    document.addEventListener('click',e=>{const link=e.target.closest?.('.sidebar-nav .sector-btn');if(link)record({type:'entry',id:link.getAttribute('href')});},true);
    let watchedApi;
    const inspect=()=>{
     if(window.__restaurantGui&&watchedApi!==window.__restaurantGui){watchedApi=window.__restaurantGui;const select=watchedApi.selectZone;watchedApi.selectZone=id=>{record({type:'zone',id});return select(id);};}
     if(document.querySelector('.demo-cursor.visible')&&!window.__firstCursorAt)window.__firstCursorAt=stamp();
    };
    new MutationObserver(inspect).observe(document,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
   },{theme});
   await page.goto(base+'/contact?lang=fr',{waitUntil:'domcontentloaded'});
   await page.locator(`.sidebar-nav .sector-btn[href="/interfaces/${sector}"]`).click();await page.waitForURL(new RegExp(project));
   const restaurant=sector==='restaurant';
   const frame=async()=>restaurant?page:await (await page.locator('iframe.ftv-luxury-interface').elementHandle()).contentFrame();
   const gui=await frame();
   const read=()=>gui.evaluate(()=>window.__guidedTrace.filter(e=>e.type==='zone'||e.type==='scene'));
   await gui.waitForFunction(()=>window.__guidedTrace.filter(e=>e.type==='scene').length>=2,null,{polling:100,timeout:120000});
   result.events=await read();
   const zone=result.events.find(e=>e.type==='zone'),[first,second]=result.events.filter(e=>e.type==='scene');
   assert.equal(zone.id,firstZone);assert.equal(first.id,scenes[0]);assert.equal(second.id,scenes[1]);
   const host=await page.evaluate(()=>({sleeps:window.__guidedSleeps,entry:window.__guidedTrace.find(e=>e.type==='entry')?.at,cursor:window.__firstCursorAt}));
   assert.ok(host.sleeps.some(s=>s.ms===3000),'actual initial 3000 ms sleep');
   result.cursorAfterEntry=host.cursor-host.entry;assert.ok(result.cursorAfterEntry>=2950&&result.cursorAfterEntry<90000);
   result.firstGap=checkGap(host.sleeps,zone.at,first.at,1000);result.nextGap=checkGap(host.sleeps,first.at,second.at,5000);
   result.checks.push('3-second entry scheduled','first scene scheduled after 1 second','next scene scheduled after 5 seconds');
   if(!restaurant){const feedback=await gui.evaluate(()=>window.__guidedTrace.filter(e=>e.type==='feedback'));for(const press of [first,second])assert.ok(feedback.some(f=>f.id===press.id&&f.at>=press.at&&f.at-press.at<500),'native scene press reaches GUI feedback');}
   if(sector==='yacht'){assert.equal(await gui.evaluate(()=>window.ftvYachtExteriorGui.state.automatic),true);result.checks.push('exterior Auto preserved');}
   await gui.locator(restaurant?'.rk-zone select':'#zone').click();await page.keyboard.press('Escape');
   const count=(await read()).filter(e=>e.type==='scene').length;await page.waitForTimeout(5500);
   assert.equal((await read()).filter(e=>e.type==='scene').length,count);result.checks.push('manual input cancels pending presses');
   if(mode==='scene'){
    await page.locator('.btn-exit-fullscreen-device-corner').click();await page.waitForTimeout(500);await page.locator('.demo-countdown').click();
    const f=await frame(),old=await f.evaluate(()=>window.__guidedTrace.length);
    await f.waitForFunction(n=>window.__guidedTrace.slice(n).some(e=>e.type==='scene'),old,{polling:100});
    const events=await f.evaluate(n=>window.__guidedTrace.slice(n),old),z=events.find(e=>e.type==='zone'),s=events.find(e=>e.type==='scene');
    assert.equal(s.id,scenes[0]);result.sceneModeGap=checkGap(await page.evaluate(()=>window.__guidedSleeps),z.at,s.at,1000);result.checks.push('Mode Scene same schedule');
   }
   await page.screenshot({path:`${out}/${sector}-${theme}-${mode}.png`,timeout:90000});await context.close();console.log(JSON.stringify(result));
  }
 }
 assert.deepEqual(report.errors,[]);
}catch(e){
 report.failure=e.stack||String(e);process.exitCode=1;
 if(activePage&&!activePage.isClosed()){
  report.diagnostics=[];
  for(const f of activePage.frames())report.diagnostics.push(await f.evaluate(()=>({url:location.href,trace:window.__guidedTrace,sleeps:window.__guidedSleeps,ready:window.ftvGui?.ready,state:window.ftvGui?.state})).catch(()=>({url:f.url()})));
  await activePage.screenshot({path:out+'/failure.png',timeout:30000}).catch(()=>{});
 }
}finally{await writeFile(out+'/report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));await browser.close();}
