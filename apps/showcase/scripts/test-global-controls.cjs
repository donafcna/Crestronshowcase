// Real clicks + native CH5 feedback. Run against a built Vite preview.
const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const base=process.env.BASE_URL||'http://127.0.0.1:4201',out=process.env.TEST_OUTPUT||path.resolve('../../Claude outputs/codex-plan3d-estate/globals');
fs.mkdirSync(out,{recursive:true});
const groups=[['401','403','402'],['404','405'],['407','408','409'],['410','411']];
function luminance(c){return c.match(/[\d.]+/g).slice(0,3).map(Number).map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;}).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0);}
function contrast(a,b){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
async function inspect(frame){return frame.evaluate(()=>Array.from(document.querySelectorAll('#global-control-overlay ch5-button')).map(e=>{const b=e.querySelector('.cb-btn'),l=e.querySelector('.ch5-button--label'),s=getComputedStyle(b),r=b.getBoundingClientRect();return {join:e.dataset.join,selected:e.getAttribute('selected')==='true',native:e.firstElementChild.classList.contains('ch5-button--selected'),bg:s.backgroundColor,fg:getComputedStyle(l).color,w:r.width,h:r.height,labelOverflow:l.scrollHeight>l.clientHeight+2||l.scrollWidth>l.clientWidth+2};}));}
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_EXE,args:process.env.GPU==='1'?['--enable-gpu','--use-angle=d3d11']:[]}),errors=[],report={checks:[],cases:[],screenshots:[]};
const check=(n,v)=>{assert.ok(v,n);report.checks.push(n);};let page,keep;
async function exercise(frame,label,theme){
 await frame.evaluate(t=>{window.changeTheme(t);window.openGlobalControlModal();},theme);await page.waitForTimeout(900);
 for(const group of groups)for(const join of group){await frame.locator(`#global-control-overlay ch5-button[data-join="${join}"]`).click();await page.waitForTimeout(150);const rows=await inspect(frame),active=rows.filter(x=>group.includes(x.join)&&x.selected);check(label+' selected '+join,active.length===1&&active[0].join===join);check(label+' feedback/style '+join,rows.every(r=>r.selected===r.native&&contrast(r.fg,r.bg)>=4));check(label+' exclusive visual '+join,rows.filter(r=>group.includes(r.join)&&r.bg===active[0].bg).length===1);}
 await page.waitForTimeout(220);const rows=await inspect(frame);check(label+' persistent shades',rows.find(r=>r.join==='405').selected);check(label+' labels fit',rows.every(r=>!r.labelOverflow));
 // Sizes are measured inside the reference GUI. The surrounding chassis may be scaled.
 check(label+' touch targets',rows.every(r=>r.w>=40&&r.h>=44));
 const overflow=await frame.evaluate(()=>{const o=document.getElementById('global-control-overlay');return [o,...o.querySelectorAll('div')].filter(e=>e.clientHeight>0&&getComputedStyle(e).overflowY==='auto'&&e.scrollHeight>e.clientHeight+2).map(e=>({tag:e.tagName,h:e.clientHeight,scroll:e.scrollHeight}));});check(label+' no modal scroll',overflow.length===0);
 await frame.evaluate(()=>{window.closeGlobalControlModal();window.openGlobalControlModal();});check(label+' reopen preserves states',JSON.stringify((await inspect(frame)).map(r=>r.selected))===JSON.stringify(rows.map(r=>r.selected)));
 report.cases.push({label,theme,minimumContrast:Math.min(...rows.map(r=>contrast(r.fg,r.bg))),states:rows.map(r=>[r.join,r.selected])});
 const file=label.replaceAll('/','-')+'.png';await page.screenshot({path:path.join(out,file)});report.screenshots.push(file);console.log('PASS '+label);
}
try{
 for(const [device,width,height,file] of [['phone',390,844,'iphone.html'],['tablet',1194,834,'index.html'],['wallpanel',1920,1200,'index.html']]){
  page=await browser.newPage({viewport:{width,height}});page.on('pageerror',e=>errors.push(device+': '+e.message));await page.goto(base+'/showcases/villa-gemini-frequencetv/'+file);await page.waitForFunction(()=>window.Villa?.get('b','411')===true);
  for(const theme of ['dark','light','glass'])await exercise(page,device+'/direct/'+theme,theme);
  await page.evaluate(()=>{Villa.press('401');Villa.setAnalog('71',1234);});check(device+' room dimming clears global scene',(await inspect(page)).filter(r=>['401','402','403'].includes(r.join)&&r.selected).length===0);
  await page.evaluate(()=>Villa.press('407'));
  await page.evaluate(()=>Villa.setAnalog(Villa.SIG.SETPOINT_X10,190));check(device+' room HVAC clears global mode',(await inspect(page)).filter(r=>['407','408','409'].includes(r.join)&&r.selected).length===0);
  await page.evaluate(()=>{Villa.press('404');Villa.press('61');});check(device+' room motor clears group feedback',(await inspect(page)).filter(r=>['404','405'].includes(r.join)&&r.selected).length===0);
  await page.close();
 }
 for(const device of ['phone','tablet','wallpanel']){
  page=await browser.newPage({viewport:{width:1600,height:1000}});page.on('pageerror',e=>errors.push(device+': '+e.message));await page.goto(base+'/interfaces/residentiel/villa-gemini-frequencetv/'+device);await page.frameLocator('iframe').locator('#global-control-overlay').waitFor({state:'attached'});const frame=page.frames().find(f=>f.url().includes('/showcases/'));await page.waitForTimeout(1600);
  keep=setInterval(()=>page.locator('.device-stage').click({position:{x:5,y:5},timeout:1000}).catch(()=>{}),2000);
  for(const mode of ['normal','scene-responsive','scene-real']){
   if(mode==='scene-responsive'){await frame.evaluate(()=>window.closeGlobalControlModal());await page.locator('.btn-exit-fullscreen-device-corner').click();await page.waitForTimeout(800);}
   if(mode==='scene-real'){await frame.evaluate(()=>window.closeGlobalControlModal());await page.locator('.chassis-scale-toggle button').first().click();await page.waitForTimeout(800);}
   for(const theme of ['dark','light','glass'])await exercise(frame,device+'/'+mode+'/'+theme,theme);
  }
  clearInterval(keep);await page.close();
 }
 // Deployment HTML: feed native signals without the frontend simulator or CP4 connection.
 for(const file of ['index.html','iphone.html']){
  page=await browser.newPage({viewport:file==='iphone.html'?{width:390,height:844}:{width:1194,height:834}});page.on('pageerror',e=>errors.push('native '+e.message));
  const src=path.resolve('../../projects/villa-crans/ch5/src',file);
  await page.route('**/'+file,r=>r.fulfill({contentType:'text/html',body:fs.readFileSync(src,'utf8')}));await page.route('**/js/webxpanel.js',r=>r.fulfill({contentType:'text/javascript',body:''}));
  await page.goto(base+'/showcases/villa-gemini-frequencetv/'+file);await page.waitForFunction(()=>typeof window.openGlobalControlModal==='function');await page.evaluate(()=>window.openGlobalControlModal());await page.waitForTimeout(800);
  check(file+' no frontend simulation',await page.evaluate(()=>!window.Villa));
  for(const group of groups)for(const j of group){await page.evaluate(({group,j})=>group.forEach(k=>CrComLib.bridgeReceiveBooleanFromNative(k,k===j)),{group,j});await page.waitForTimeout(150);const rows=(await inspect(page)).filter(r=>group.includes(r.join)&&r.native);check(file+' native receive '+j,rows.length===1&&rows[0].join===j);}
  await page.close();
 }
 check('No browser exceptions',errors.length===0);report.status='passed';console.log('PASS total '+report.checks.length);
}catch(e){report.status='failed';report.failure=e.stack;report.failureButtons=await inspect(page.frames().find(f=>f.url().includes('/showcases/'))||page);console.log(report.failureButtons);await page?.screenshot({path:path.join(out,'failure.png')});throw e;}finally{clearInterval(keep);report.errors=errors;fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2));await browser.close();}
})();
