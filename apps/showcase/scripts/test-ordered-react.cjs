// Observe complete demonstrations through their real DOM events and React feedback.
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const base=process.env.BASE_URL||'http://127.0.0.1:4211';
const out=process.env.TEST_OUTPUT||path.resolve('../../Claude outputs/journey-1/react');fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch({executablePath:process.env.BROWSER_EXE});const reports=[];
try{await Promise.all([['crestron-home','tablet'],['crestron-home','wallpanel'],['villa-gemini','desktop'],['villa-leman','tablet'],['appartement-carouge','tablet']].map(async([project,device])=>{
 const p=await b.newPage({viewport:{width:1440,height:950}}),r={project,device,events:[],errors:[],checks:[]};reports.push(r);
 const check=(name,value)=>{assert.ok(value,project+'/'+device+': '+name);r.checks.push(name);};
 p.on('pageerror',e=>r.errors.push(e.message));await p.exposeFunction('record',e=>r.events.push(e));
 await p.addInitScript(()=>{
  const sources='[data-demo-source],.source-btn,.ac-src button,.vl-source-list button';
  document.addEventListener('click',e=>{if(e.isTrusted)return;const el=e.target.closest('[data-demo-action],[data-demo-room],[data-demo-nav] button,'+sources);if(!el)return;
   const source=el.matches(sources),action=el.dataset.demoAction,room=el.dataset.demoRoom||(el.closest('[data-demo-nav]')?el.textContent.trim():null);
   setTimeout(()=>window.record({at:performance.now(),action,room,source:source?(el.dataset.demoSource||el.textContent.trim()):null,active:el.matches('.active,.on'),offApplied:action==='av-off'?(!document.querySelector('[data-demo-action="av-off"].playing,.ac-play [class*="pause"],.vl-play [class*="pause"],.ch-list [data-demo-source].on')):null}),100);
  },true);
  document.addEventListener('change',e=>{if(e.target.matches('input[type="range"]'))window.record({at:performance.now(),action:'volume-change',value:Number(e.target.value)});},true);
 });
 try{await p.goto(base+'/interfaces/residentiel/'+project+'/'+device);
  const end=Date.now()+125000;while(Date.now()<end&&r.events.filter(e=>e.action==='av-off').length<3)await p.waitForTimeout(500);
  const ends=r.events.filter(e=>e.action==='av-off');check('Three complete room demonstrations',ends.length===3);
  let start=0;for(const [i,endEvent]of ends.entries()){
   const events=r.events.filter(e=>e.at>start&&e.at<=endEvent.at),sources=events.filter(e=>e.source),vol=events.filter(e=>e.action==='volume-change');
   check('Room '+i+' selects two different sources',sources.length>=2&&sources[0].source!==sources[1].source);
   check('Room '+i+' source feedback is active',sources.every(e=>e.active));
   check('Room '+i+' changes volume before OFF',vol.length>=10&&new Set(vol.map(e=>e.value)).size>=8&&vol[0].at>sources[1].at);
   check('Room '+i+' stops playback',endEvent.offApplied);
   if(project==='crestron-home'){const ids=events.map(e=>e.action||e.source);let index=-1;for(const id of ['lights','hvac','av','apple','iptv','volume-change','av-off']){index=ids.indexOf(id,index+1);check('Room '+i+' ordered '+id,index>=0);}}
   start=endEvent.at;
  }
  const rooms=r.events.filter(e=>e.room).map(e=>e.room);check('Different rooms visited',new Set(rooms).size>=3);
  await p.locator('.device-stage').click({position:{x:5,y:5}});await p.waitForTimeout(250);const n=r.events.length;await p.waitForTimeout(1500);check('Manual interaction pauses the demo',r.events.length===n);
  check('No browser exceptions',r.errors.length===0);r.status='passed';console.log('PASS '+project+'/'+device+' '+r.checks.length+' checks');
 }catch(e){r.status='failed';r.failure=e.stack;process.exitCode=1;console.error(e.message);}
 await p.screenshot({path:path.join(out,project+'-'+device+'.png')});await p.close();
 }));}finally{fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({base,reports},null,2));await b.close();}})();
