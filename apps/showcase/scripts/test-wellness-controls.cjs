const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const base=process.env.BASE_URL||'http://127.0.0.1:4201',out=process.env.TEST_OUTPUT||path.resolve('../../Claude outputs/room-revision/wellness');fs.mkdirSync(out,{recursive:true});
const lum=s=>s.match(/[\d.]+/g).slice(0,3).map(Number).map(v=>(v/=255)<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);
const ratio=(a,b)=>(Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
(async()=>{
 const b=await chromium.launch({executablePath:process.env.BROWSER_EXE}),report={checks:[],cases:[]},errors=[];let p,keep;
 const check=(n,v)=>{assert.ok(v,n);report.checks.push(n);};
 async function select(f,id){await f.evaluate(id=>{if(window.changeRoomIphone)changeRoomIphone(String(id));else selectRoomFromConfig(id);},id);}
 async function run(f,device,label,theme){
  await f.waitForFunction(()=>window.changeTheme&&window.Villa&&window.refreshWellnessControls);
  await f.evaluate(t=>changeTheme(t),theme);await select(f,13);if(device==='phone')await f.locator('#nav-hvac').click();await p.waitForTimeout(500);
  check(label+' wellness tabs',await f.locator('[data-wellness-tab]:visible').count()===2);
  for(const [section,on,off,plus,minus,analog,min,max] of [['sauna',620,621,622,623,62,600,1000],['hammam',624,625,626,627,63,90,100]]){
   await f.locator('[data-climate-tab="'+section+'"]').click();const panel=f.locator('[data-climate-panel="'+section+'"]');
   check(label+' '+section+' controls',await panel.locator('ch5-button').count()===4);
   check(label+' '+section+' no fan or wrong units',!(await panel.innerText()).includes('Ventilation')&&(section!=='hammam'||!(await panel.innerText()).includes('°C')));
   for(const j of [on,off]){await panel.locator('[data-join="'+j+'"]').click();await p.waitForTimeout(70);const states=await panel.locator('ch5-button[receivestateselected]').evaluateAll(es=>es.map(e=>({join:+e.dataset.join,selected:e.getAttribute('selected')==='true',native:e.firstElementChild.classList.contains('ch5-button--selected')})));check(label+' '+section+' exclusive '+j,states.filter(s=>s.selected).length===1&&states.some(s=>s.join===j&&s.selected&&s.native));}
   for(const [value,button] of [[min,minus],[max,plus]]){await f.evaluate(([j,v])=>Villa.setAnalog(String(j),v),[analog,value]);await panel.locator('[data-join="'+button+'"]').click();check(label+' boundary '+value,await f.evaluate(([j,v])=>Villa.get('n',String(j))===v,[analog,value]));}
   await f.evaluate(([j,v])=>Villa.setAnalog(String(j),v),[analog,section==='sauna'?800:95]);
   const controls=await panel.locator('.cb-btn').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect(),p=e.closest('#panel-hvac,#card-cvc').getBoundingClientRect();return{w:r.width,h:r.height,inside:r.top>=p.top&&r.bottom<=p.bottom+1,fg:getComputedStyle(e.querySelector('.ch5-button--label')).color,bg:getComputedStyle(e).backgroundColor};}));
   check(label+' '+section+' fits with contrast and touch targets',controls.every(x=>x.w>=40&&x.h>=44&&x.inside&&ratio(x.fg,x.bg)>=4));
   await p.screenshot({path:path.join(out,label.replaceAll('/','-')+'-'+section+'.png')});
  }
  await select(f,1);check(label+' wellness hidden in other rooms',await f.locator('[data-wellness-tab]:visible').count()===0);check(label+' normal HVAC restored',await f.locator('[data-climate-panel="hvac"]').isVisible());
  report.cases.push(label);console.log('PASS '+label);
 }
 try{
  for(const [device,width,height,file] of [['phone',390,844,'iphone.html'],['tablet',1194,834,'index.html'],['wallpanel',1920,1200,'index.html']]){
   p=await b.newPage({viewport:{width,height}});p.on('pageerror',e=>errors.push(e.message));await p.goto(base+'/showcases/villa-gemini-frequencetv/'+file);await p.waitForFunction(()=>window.Villa);
   for(const theme of ['dark','light','glass'])await run(p,device,device+'/direct/'+theme,theme);
   await select(p,13);if(device==='phone')await p.locator('#nav-hvac').click();await p.locator('[data-climate-tab="hammam"]').click();
   for(const [lang,text] of [['en','Current humidity'],['de','Aktuelle Feuchte'],['fr','Humidité actuelle']]){await p.evaluate(lang=>changeLanguage(lang),lang);check(device+' translation '+lang,(await p.locator('[data-climate-panel="hammam"]').innerText()).includes(text));}
   await p.close();
  }
  for(const device of ['phone','tablet','wallpanel']){
   p=await b.newPage({viewport:{width:1600,height:1000}});p.on('pageerror',e=>errors.push(e.message));await p.route('**/plan3d/plan3d.js*',r=>r.abort());await p.goto(base+'/interfaces/residentiel/villa-gemini-frequencetv/'+device);
   await p.frameLocator('iframe').locator('[data-climate-panel="sauna"]').waitFor({state:'attached'});const f=p.frames().find(f=>f.url().includes('/showcases/'));
   keep=setInterval(()=>p.locator('.device-stage').click({position:{x:5,y:5},timeout:1000}).catch(()=>{}),3000);
   for(const mode of ['normal','scene-responsive','scene-real']){
    if(mode==='scene-responsive')await p.locator('.btn-exit-fullscreen-device-corner').click();
    if(mode==='scene-real')await p.locator('.chassis-scale-toggle button').first().click();
    for(const theme of ['dark','light','glass'])await run(f,device,device+'/'+mode+'/'+theme,theme);
   }
   clearInterval(keep);await p.close();
  }
  // Inject real native feedback into the physical source without the demo engine.
  for(const file of ['iphone.html','index.html']){
   p=await b.newPage({viewport:file==='iphone.html'?{width:390,height:844}:{width:1194,height:834}});
   await p.route('**/'+file,r=>r.fulfill({contentType:'text/html',body:fs.readFileSync(path.resolve('../../projects/villa-crans/ch5/src',file),'utf8')}));await p.route('**/js/webxpanel.js',r=>r.fulfill({contentType:'text/javascript',body:''}));
   await p.route('**/villa_config.js',r=>r.fulfill({contentType:'text/javascript',body:'window.villaConfigEmbedded='+fs.readFileSync(path.resolve('../../projects/villa-crans/ch5/villa_config.json'),'utf8')}));
   await p.goto(base+'/showcases/villa-gemini-frequencetv/'+file);await p.waitForFunction(()=>window.CrComLib&&window.refreshWellnessControls);await select(p,13);if(file==='iphone.html')await p.locator('#nav-hvac').click();
   check(file+' no local simulation',await p.evaluate(()=>!window.Villa));
   for(const [name,on,off,serial,value] of [['sauna',620,621,64,'78.5'],['hammam',624,625,65,'98']]){
    await p.locator('[data-climate-tab="'+name+'"]').click();
    await p.evaluate(({on,off,serial,value})=>{CrComLib.bridgeReceiveBooleanFromNative(String(on),true);CrComLib.bridgeReceiveBooleanFromNative(String(off),false);CrComLib.bridgeReceiveStringFromNative(String(serial),value);},{on,off,serial,value});await p.waitForTimeout(100);
    check(file+' native '+name,await p.locator('[data-join="'+on+'"]').getAttribute('selected')==='true'&&await p.locator('[data-climate-panel="'+name+'"] [data-ch5-textcontent="'+serial+'"]').textContent()===value);
    await p.evaluate(({on,off})=>{CrComLib.bridgeReceiveBooleanFromNative(String(on),false);CrComLib.bridgeReceiveBooleanFromNative(String(off),true);},{on,off});await p.waitForTimeout(100);
    check(file+' native OFF '+name,await p.locator('[data-join="'+on+'"]').getAttribute('selected')==='false'&&await p.locator('[data-join="'+off+'"]').getAttribute('selected')==='true');
   }
   await p.close();
  }
  check('No JavaScript errors',errors.length===0);report.status='passed';console.log('PASS '+report.checks.length+' checks');
 }catch(e){report.status='failed';report.failure=e.stack;if(p&&!p.isClosed())await p.screenshot({path:path.join(out,'failure.png')});throw e;}finally{clearInterval(keep);report.errors=errors;fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2));await b.close();}
})();
