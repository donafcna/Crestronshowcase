const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const out=process.env.TEST_OUTPUT||path.resolve('../../Claude outputs/journey-1/visuals');fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch({executablePath:process.env.BROWSER_EXE,args:['--enable-gpu','--use-angle=d3d11']}),r={checks:[],errors:[]};
try{for(const [label,base]of [['before','https://crestrongui.vercel.app'],['after',process.env.BASE_URL||'http://127.0.0.1:4211']]){
 const p=await b.newPage({viewport:{width:1280,height:800}});p.on('pageerror',e=>r.errors.push({label,message:e.message}));
 await p.goto(base+'/interfaces/residentiel/villa-gemini-frequencetv/phone');await require('./helpers/villa-manual.cjs').pauseVillaTour(p);
 const keep=setInterval(()=>p.locator('.device-stage').click({position:{x:5,y:5},timeout:500}).catch(()=>{}),6000);
 try{const f=p.frames().find(f=>f.url().includes('/iphone.html'));await f.locator('#room-select').selectOption('8');await p.waitForFunction(()=>__plan3d.activeRoom()===8);await p.evaluate(()=>__plan3d.jump());await f.evaluate(()=>{Villa.press('51');Villa.press('200');});await p.evaluate(()=>__plan3d.setDay(0));await p.waitForTimeout(3500);
 for(const mode of ['normal','scene']){if(mode==='scene')await p.locator('.btn-exit-fullscreen-device-corner').click();for(const theme of ['dark','light','glass']){await f.evaluate(t=>changeTheme(t),theme);await p.waitForTimeout(250);await p.screenshot({path:path.join(out,label+'-'+mode+'-'+theme+'.png')});}}
 if(label==='after'){const nav=await p.evaluate(()=>__plan3d.navigation());assert.ok(nav.presentationFill.hemi>=.32&&nav.presentationFill.fill>=.18&&nav.lamps.every(v=>v===0));r.checks.push('OFF basement remains readable with all fixtures off');
  for(const [id,day,closed,scene]of [[1,1,0,54],[1,1,1,52],[3,0,1,54],[3,0,1,52]]){await f.locator('#room-select').selectOption(String(id));await p.waitForFunction(id=>__plan3d.activeRoom()===id,id);await p.evaluate(()=>__plan3d.jump());await p.evaluate(([day,c])=>{__plan3d.setDay(day);for(const k of ['volet','rideau','store'])__plan3d.shadePos(k,c);},[day,closed]);await f.evaluate(j=>Villa.press(String(j)),scene);await p.waitForTimeout(3300);await p.screenshot({path:path.join(out,'after-room-'+id+'-day-'+day+'-scene-'+scene+'.png')});}
 }
 }finally{clearInterval(keep);await p.close();}
}
assert.equal(r.errors.length,0);r.checks.push('No browser exceptions');r.status='passed';
}catch(e){r.failure=e.stack;r.status='failed';process.exitCode=1;console.error(e);}finally{fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(r,null,2));await b.close();}})();
