// Real navigation/cursor events. No fake clock and no change to production timing.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const base=process.env.BASE_URL||'http://127.0.0.1:4173';
const out=process.env.TEST_OUTPUT||'test-results/guided-entry';
await mkdir(out,{recursive:true});
const report={base,cases:[],errors:[]};
let activePage;
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 for(const [sector,project,firstZone,scenes] of [
  ['boutique','boutique-hermes','hall',['private','gala','opening']],
  ['restaurant','sushi-bar-kyoto','accueil',['dinner','rooftop','welcome']],
  ['yacht','yacht-monaco','0',['sunset','dinner','cruise']]
 ]){
  const variants=process.env.SMOKE==='1'?[['dark','normal']]:[['dark','normal'],['light','normal'],['glass','scene']];
  for(const [theme,mode] of variants){
   const context=await browser.newContext({viewport:{width:1536,height:1000},deviceScaleFactor:.5,reducedMotion:'reduce',serviceWorkers:'block'});
   const page=await context.newPage();activePage=page;page.setDefaultTimeout(90000);
   const result={sector,project,theme,mode,events:[],checks:[],console:[]};report.cases.push(result);
   page.on('pageerror',e=>report.errors.push(`${project}: ${e.message}`));
   page.on('console',e=>{if(['warning','error'].includes(e.type()))result.console.push(e.text());});
   await context.addInitScript(({theme})=>{
    localStorage.setItem('ftv-luxury-theme',theme);
    window.__guidedTrace=[];
    const stamp=()=>performance.timeOrigin+performance.now();
    const record=e=>window.__guidedTrace.push({...e,at:stamp()});
    // Observe the native call at the press, before handlers recreate controls.
    // Forward unchanged; do not synthesize extra clicks or invoke a preset here.
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
    document.addEventListener('click',e=>{
      const link=e.target.closest?.('.sidebar-nav .sector-btn');
      if(link)record({type:'entry',id:link.getAttribute('href')});
    },true);
    let watchedApi;
    const inspect=()=>{
      if(window.__restaurantGui&&watchedApi!==window.__restaurantGui){
        watchedApi=window.__restaurantGui;const select=watchedApi.selectZone;
        watchedApi.selectZone=id=>{record({type:'zone',id});return select(id);};
      }
      const c=document.querySelector('.demo-cursor.visible');
      if(c&&!window.__firstCursorAt)window.__firstCursorAt=stamp();
    };
    new MutationObserver(inspect).observe(document,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
   },{theme});
   await page.goto(base+'/contact?lang=fr',{waitUntil:'domcontentloaded'});
   await page.locator(`.sidebar-nav .sector-btn[href="/interfaces/${sector}"]`).click();
   await page.waitForURL(new RegExp(project));
   const isRestaurant=sector==='restaurant';
   const gui=isRestaurant?page:await (await page.locator('iframe.ftv-luxury-interface').elementHandle()).contentFrame();
   const read=()=>gui.evaluate(()=>window.__guidedTrace.filter(e=>e.type==='zone'||e.type==='scene'));
   await gui.waitForFunction(()=>window.__guidedTrace.filter(e=>e.type==='scene').length>=2,null,{polling:100,timeout:45000});
   result.events=await read();
   const z=result.events.find(e=>e.type==='zone');
   const first=result.events.find(e=>e.type==='scene');
   const second=result.events.filter(e=>e.type==='scene')[1];
   assert.equal(z.id,firstZone);assert.equal(first.id,scenes[0]);assert.equal(second.id,scenes[1]);
   result.firstGap=first.at-z.at;result.nextGap=second.at-first.at;
   assert.ok(result.firstGap>=950&&result.firstGap<1700,`First gap ${result.firstGap} ms`);
   assert.ok(result.nextGap>=4900&&result.nextGap<6000,`Next gap ${result.nextGap} ms`);
   const host=await page.evaluate(()=>({entry:window.__guidedTrace.find(e=>e.type==='entry')?.at,cursor:window.__firstCursorAt}));
   result.cursorAfterEntry=host.cursor-host.entry;
   assert.ok(result.cursorAfterEntry>=2950,'cursor must not start before the 3-second wait');
   assert.ok(result.cursorAfterEntry<30000,'no previous 60-second idle gate on yacht');
   result.checks.push('menu entry, first zone, one-second first scene, five-second continuation');
   if(!isRestaurant){
    const feedback=await gui.evaluate(()=>window.__guidedTrace.filter(e=>e.type==='feedback'));
    for(const press of [first,second])assert.ok(feedback.some(f=>f.id===press.id&&f.at>=press.at&&f.at-press.at<500),'scene press must reach real GUI feedback');
   }
   if(sector==='yacht'){
     assert.equal(await gui.evaluate(()=>window.ftvYachtExteriorGui.state.automatic),true);
     result.checks.push('guided scene clicks preserve exterior Auto');
   }
   const control=isRestaurant?'.rk-zone select':'#zone';
   await gui.locator(control).click();
   await page.keyboard.press('Escape');
   const count=(await read()).filter(e=>e.type==='scene').length;
   await page.waitForTimeout(5500);
   assert.equal((await read()).filter(e=>e.type==='scene').length,count);
   result.checks.push('manual interaction cancels the next automatic press');
   if(mode==='scene'){
     await page.locator('.btn-exit-fullscreen-device-corner').click();
     await page.waitForTimeout(500);
     await page.locator('.demo-countdown').click();
     const nextGui=isRestaurant?page:await (await page.locator('iframe.ftv-luxury-interface').elementHandle()).contentFrame();
     const old=await nextGui.evaluate(()=>window.__guidedTrace.length);
     await nextGui.waitForFunction(n=>window.__guidedTrace.slice(n).some(e=>e.type==='scene'),old,{polling:100});
     const tail=await nextGui.evaluate(n=>window.__guidedTrace.slice(n).filter(e=>e.type==='zone'||e.type==='scene'),old);
     const zone=tail.find(e=>e.type==='zone'),scene=tail.find(e=>e.type==='scene');
     assert.equal(scene.id,scenes[0]);assert.ok(scene.at-zone.at>=950&&scene.at-zone.at<1700);
     result.checks.push('same first-scene timing in Mode Scene');
   }
   for(const f of page.frames())await f.evaluate(()=>{if(window.__ftvModel)window.__ftvPaused=true;}).catch(()=>{});
   await page.screenshot({path:`${out}/${sector}-${theme}-${mode}.png`,timeout:90000});
   await context.close();console.log(JSON.stringify(result));
  }
 }
 assert.deepEqual(report.errors,[]);
}catch(e){
 report.errors.push(e.stack||String(e));process.exitCode=1;
 if(activePage&&!activePage.isClosed()){
  report.diagnostics=[];
  for(const f of activePage.frames()){
   report.diagnostics.push(await f.evaluate(()=>({url:location.href,trace:window.__guidedTrace,cursorAt:window.__firstCursorAt,
    guiReady:window.ftvGui?.ready,guiState:window.ftvGui?.state,model:window.__ftvModel?.state?.(),
    background:document.querySelector('.luxury-background')?.dataset.ready,countdown:document.querySelector('.demo-countdown')?.textContent,
    controls:[...document.querySelectorAll('#zone,[data-preset]')].map(el=>{const r=el.getBoundingClientRect();const top=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return {id:el.id||el.dataset.preset,connected:el.isConnected,rect:r.toJSON(),coveredBy:top?.outerHTML.slice(0,300),visibility:getComputedStyle(el).visibility};})
   })).catch(error=>({url:f.url(),error:String(error)})));
   await f.evaluate(()=>{if(window.__ftvModel)window.__ftvPaused=true;}).catch(()=>{});
  }
  await activePage.screenshot({path:out+'/failure.png',timeout:30000}).catch(()=>{});
 }
}
finally{await writeFile(`${out}/report.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));await browser.close();}
