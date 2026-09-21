import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const base=process.env.BASE_URL||'http://127.0.0.1:4173';
const results={checks:[],errors:[]};
await mkdir('test-results/wheel',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 for(const project of ['yacht-monaco','club-etoile']){
  const yacht=project==='yacht-monaco';
  const context=await browser.newContext({viewport:{width:1280,height:800},deviceScaleFactor:1,reducedMotion:'reduce'});
  const page=await context.newPage();page.setDefaultTimeout(90000);
  page.on('pageerror',error=>results.errors.push(project+': '+error.message));
  await page.goto(`${base}/interfaces/tous/${project}/phone?lang=fr`,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(yacht=>{
   const element=document.querySelector('.luxury-background-frame'),win=element?.contentWindow;
   return element?.parentElement.dataset.ready==='true'&&(yacht?win?.__ftvModel?.zoom&&win?.__ftvYachtExterior?.finalized:win?.__venue);
  },yacht,{timeout:90000});
  let frame=await (await page.locator('.luxury-background-frame').elementHandle()).contentFrame();
  // Functional wheel tests exercise the real DOM/message route and real camera.
  // Reduce resolution on the CPU-only runner, not in production code.
  await frame.evaluate(yacht=>{const r=yacht?renderer:window.__venue.renderer;r.setPixelRatio(.55);},yacht);
  const read=()=>frame.evaluate(yacht=>yacht?{distance:desiredRadius,selection:window.__ftvModel.state()}: {distance:window.__venue.camera.position.length(),selection:{room:window.__venue.state.clubRoom,view:window.__venue.state.clubView,floor:window.__venue.state.clubFloor}},yacht);
  const freePoint=()=>page.evaluate(()=>{
   const b=document.querySelector('.luxury-background-frame').getBoundingClientRect(),p=document.querySelector('.phone-device-frame').getBoundingClientRect(),s=document.querySelector('.workspace-device-sidebar')?.getBoundingClientRect();
   return {x:(p.right+(s?.left||b.right))/2,y:Math.max(b.top+130,Math.min(b.bottom-35,p.top+p.height*.55))};
  });
  async function moveWheel(delta){const p=await freePoint();await page.mouse.move(p.x,p.y);await page.mouse.wheel(0,delta);}
  async function changed(before,direction){
   await frame.waitForFunction(({before,direction,yacht})=>{const d=yacht?desiredRadius:window.__venue.camera.position.length();return direction<0?d<before-.0001:d>before+.0001;},{before,direction,yacht},{timeout:30000});
  }
  for(const mode of ['normal','scene']){
   if(mode==='scene'){
    await page.locator('.btn-exit-fullscreen-device-corner').click();
    await page.waitForFunction(()=>document.querySelector('.luxury-background-frame')?.parentElement.dataset.ready==='true');
    frame=await (await page.locator('.luxury-background-frame').elementHandle()).contentFrame();
    await frame.evaluate(yacht=>{const r=yacht?renderer:window.__venue.renderer;r.setPixelRatio(.55);},yacht);
   }
   await page.waitForTimeout(900);
   // Interact before the automatic tour starts/resumes.
   const point=await freePoint();await page.mouse.move(point.x,point.y);await page.mouse.wheel(0,1);
   await page.waitForTimeout(250);
   const start=await read();await moveWheel(-120);await changed(start.distance,-1);const near=await read();
   assert.deepEqual(near.selection,start.selection,'zoom in must preserve the selected zone');
   await page.waitForTimeout(700);const stable=await read();
   assert.ok(Math.abs(stable.distance-near.distance)<.001,'periodic layout must not reset zoom');
   await moveWheel(120);await changed(near.distance,1);const far=await read();
   assert.deepEqual(far.selection,near.selection,'zoom out must not force an overview');
   results.checks.push(`${project}/${mode}: real mouse wheel in/out, selection and layout persistence`);
   // Synthetic modifiers check cancelability without actually zooming the browser.
   const unchanged=await read();const p=await freePoint();
   for(const extra of [{ctrlKey:true},{metaKey:true},{deltaX:240}]){
    const canceled=await page.evaluate(({p,extra})=>{const e=new WheelEvent('wheel',{bubbles:true,cancelable:true,deltaY:-120,...extra});document.elementFromPoint(p.x,p.y).dispatchEvent(e);return e.defaultPrevented;},{p,extra});
    assert.equal(canceled,false);
   }
   await page.waitForTimeout(200);assert.ok(Math.abs((await read()).distance-unchanged.distance)<.001);
   // Scrolling the phone controls is not a camera command.
   const phone=await page.locator('.phone-device-frame').boundingBox();
   await page.mouse.move(phone.x+phone.width*.5,phone.y+phone.height*.55);await page.mouse.wheel(0,120);await page.waitForTimeout(250);
   assert.ok(Math.abs((await read()).distance-unchanged.distance)<.001);
   results.checks.push(`${project}/${mode}: GUI scroll and browser modifiers preserved`);
  }
  if(yacht){
   await frame.evaluate(()=>window.__ftvModel.select('11'));
   await page.waitForTimeout(350);const s=await read();assert.equal(s.selection.room,'11');
   await moveWheel(-60);await changed(s.distance,-1);assert.deepEqual((await read()).selection,s.selection);
   const before=await read();await moveWheel(60);await changed(before.distance,1);assert.deepEqual((await read()).selection,s.selection);
   results.checks.push('yacht: zoom in a selected room does not switch to exterior');
  }else{
   for(const [floor,room] of [[0,'original'],[1,'neon'],[2,'sky']]){
    await frame.evaluate(({floor,room})=>{const v=window.__venue;v.apply({...v.state,clubFloor:floor,clubRoom:room,clubView:'room'});},{floor,room});
    const s=await read();await moveWheel(-60);await changed(s.distance,-1);assert.deepEqual((await read()).selection,s.selection);
    const before=await read();await moveWheel(60);await changed(before.distance,1);assert.deepEqual((await read()).selection,s.selection);
    results.checks.push(`nightclub: selected floor ${floor} retains its room while zooming`);
   }
  }
  await context.close();
 }
 assert.deepEqual(results.errors,[]);
}catch(error){results.errors.push(error.stack||String(error));process.exitCode=1;}
finally{console.log(JSON.stringify(results,null,2));await writeFile('test-results/wheel/report.json',JSON.stringify(results,null,2));await browser.close();}
