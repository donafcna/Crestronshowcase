const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const base=process.env.BASE_URL||'http://127.0.0.1:4201',out=process.env.TEST_OUTPUT||path.resolve('../../Claude outputs/room-revision/hvac');fs.mkdirSync(out,{recursive:true});
const groups=[[610,611],[612,613,614,615]];
const lum=c=>c.match(/[\d.]+/g).slice(0,3).map(Number).map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;}).reduce((a,x,i)=>a+x*[.2126,.7152,.0722][i],0);
const contrast=(a,b)=>{a=lum(a);b=lum(b);return(Math.max(a,b)+.05)/(Math.min(a,b)+.05);};
async function inspect(f){return f.evaluate(()=>[...document.querySelectorAll('[data-climate-panel=\"hvac\"] .hvac-controls ch5-button')].map(el=>{const b=el.querySelector('.cb-btn'),r=b.getBoundingClientRect(),panel=el.closest('#panel-hvac,#card-cvc').getBoundingClientRect(),s=getComputedStyle(b),label=el.querySelector('.ch5-button--label');return{join:+el.dataset.join,selected:el.getAttribute('selected')==='true',native:el.firstElementChild.classList.contains('ch5-button--selected'),w:r.width,h:r.height,inside:r.bottom<=panel.bottom+1&&r.right<=panel.right+1,fg:getComputedStyle(label).color,bg:s.backgroundColor};}));}
(async()=>{
const browser=await chromium.launch({executablePath:process.env.BROWSER_EXE}),report={checks:[],cases:[]},errors=[];let p,keep;
const check=(n,v)=>{assert.ok(v,n);report.checks.push(n);};
async function show(f,device){if(device==='phone')await f.locator('#nav-hvac').click();}
async function exercise(f,device,label,theme){
 await f.evaluate(t=>window.changeTheme(t),theme);await show(f,device);await p.waitForTimeout(900);
 for(const group of groups)for(const j of group){await f.locator('[data-climate-panel=\"hvac\"] .hvac-controls [data-join="'+j+'"]').click();await p.waitForTimeout(60);const all=await inspect(f),active=all.filter(r=>group.includes(r.join)&&r.selected);check(label+' exclusive '+j,active.length===1&&active[0].join===j);check(label+' contrast/native '+j,all.every(r=>r.selected===r.native&&contrast(r.fg,r.bg)>=4));}
 const all=await inspect(f);check(label+' touch targets',all.every(r=>r.w>=40&&r.h>=44));check(label+' controls stay inside card',all.every(r=>r.inside));
 await f.locator('[data-climate-panel=\"hvac\"] .hvac-controls [data-join="611"]').click();check(label+' OFF state',await f.evaluate(()=>!Villa.get('b','610')&&Villa.get('b','611')&&Villa.get('n','61')===3));await f.locator('[data-climate-panel=\"hvac\"] .hvac-controls [data-join="610"]').click();
 const file=label.replaceAll('/','-')+'.png';await p.screenshot({path:path.join(out,file)});report.cases.push({label,theme,minimumContrast:Math.min(...all.map(r=>contrast(r.fg,r.bg)))});console.log('PASS '+label);
}
try{
 if(!process.env.NATIVE_ONLY){
 for(const [device,width,height,file] of [['phone',390,844,'iphone.html'],['tablet',1194,834,'index.html'],['wallpanel',1920,1200,'index.html']]){
  p=await browser.newPage({viewport:{width,height}});p.on('pageerror',e=>errors.push(e.message));await p.goto(base+'/showcases/villa-gemini-frequencetv/'+file);await p.waitForFunction(()=>window.Villa?.get('b','610')===true);
  for(const theme of ['dark','light','glass'])await exercise(p,device,device+'/direct/'+theme,theme);await p.close();
 }
 for(const device of ['phone','tablet','wallpanel']){
  p=await browser.newPage({viewport:{width:1600,height:1000}});p.on('pageerror',e=>errors.push(e.message));
  await p.route('**/plan3d/plan3d.js*',r=>r.abort()); // GUI-only matrix; 3D has its separate GPU suite.
  await p.goto(base+'/interfaces/residentiel/villa-gemini-frequencetv/'+device);await p.frameLocator('iframe').locator('[data-climate-panel=\"hvac\"] .hvac-controls').waitFor({state:'attached'});const f=p.frames().find(f=>f.url().includes('/showcases/'));await p.waitForTimeout(900);
  keep=setInterval(()=>p.locator('.device-stage').click({position:{x:5,y:5},timeout:1000}).catch(()=>{}),4000);
  for(const mode of ['normal','scene-responsive','scene-real']){
   if(mode==='scene-responsive'){await p.locator('.btn-exit-fullscreen-device-corner').click();await p.waitForTimeout(500);}
   if(mode==='scene-real'){await p.locator('.chassis-scale-toggle button').first().click();await p.waitForTimeout(500);}
   for(const theme of ['dark','light','glass'])await exercise(f,device,device+'/'+mode+'/'+theme,theme);
  }
  clearInterval(keep);await p.close();
 }
 }
 // Deployment source, no simulation or CP4: actual CH5 native subscriptions and outgoing joins.
 for(const file of ['iphone.html','index.html']){
  p=await browser.newPage({viewport:file==='iphone.html'?{width:390,height:844}:{width:1194,height:834}});
  await p.route('**/'+file,r=>r.fulfill({contentType:'text/html',body:fs.readFileSync(path.resolve('../../projects/villa-crans/ch5/src',file),'utf8')}));
  await p.route('**/js/webxpanel.js',r=>r.fulfill({contentType:'text/javascript',body:''}));
  await p.route('**/villa_config.js',r=>r.fulfill({contentType:'text/javascript',body:'window.villaConfigEmbedded='+fs.readFileSync(path.resolve('../../projects/villa-crans/ch5/villa_config.json'),'utf8')}));
  await p.goto(base+'/showcases/villa-gemini-frequencetv/'+file);await p.waitForFunction(()=>window.CrComLib&&document.querySelector('[data-climate-panel=\"hvac\"] .hvac-controls .cb-btn'));
  await p.evaluate(()=>{if(window.changeRoomIphone)changeRoomIphone('3');else if(window.changeRoom)changeRoom('3');});await show(p,file==='iphone.html'?'phone':'tablet');await p.waitForTimeout(500);check(file+' deployment has no simulator',await p.evaluate(()=>!window.Villa));
  await p.evaluate(()=>{window.sentHvac=[];[610,611,612,613,614,615].forEach(j=>CrComLib.subscribeState('b',String(j),v=>{if(v)window.sentHvac.push(j);}));});
  for(const group of groups)for(const j of group){await p.evaluate(({group,j})=>group.forEach(k=>CrComLib.bridgeReceiveBooleanFromNative(String(k),k===j)),{group,j});await p.waitForTimeout(80);check(file+' native feedback '+j,(await inspect(p)).filter(r=>group.includes(r.join)&&r.native).map(r=>r.join).join(',')===String(j));}
  await p.close();
 }
 check('No JavaScript errors',errors.length===0);report.status='passed';console.log('PASS '+report.checks.length+' checks');
}catch(e){report.failure=e.stack;report.status='failed';await p.screenshot({path:path.join(out,'failure.png')});console.error(await inspect(p.frames().find(f=>f.url().includes('/showcases/'))||p));throw e;}finally{clearInterval(keep);report.errors=errors;fs.writeFileSync(path.join(out,process.env.NATIVE_ONLY?'native-results.json':'results.json'),JSON.stringify(report,null,2));await browser.close();}
})();
