import fs from 'node:fs';import path from 'node:path';import http from 'node:http';import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const out=path.resolve(process.env.TEST_OUTPUT||'../../docs/verification/2026-09-20-vca-sunrays');fs.mkdirSync(out,{recursive:true});
function serve(root){return http.createServer((req,res)=>{let f=path.join(root,decodeURIComponent(req.url.split('?')[0]));if(!f.startsWith(root+path.sep)||!fs.existsSync(f)||!fs.statSync(f).isFile())f=path.join(root,'index.html');res.setHeader('Content-Type',({'.js':'application/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.svg':'image/svg+xml','.webp':'image/webp'})[path.extname(f)]||'application/octet-stream');res.end(fs.readFileSync(f));});}
const server=serve(path.resolve('dist'));await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=process.env.BASE_URL||`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({executablePath:process.env.BROWSER_EXE,args:JSON.parse(process.env.BROWSER_ARGS||'[]'),headless:true});
const ctx=await browser.newContext({viewport:{width:1440,height:1000},serviceWorkers:'block'});
await ctx.route('https://fonts.googleapis.com/**',r=>r.abort());await ctx.route('https://fonts.gstatic.com/**',r=>r.abort());
const report={base,checks:[],events:[],errors:[]};let current='';
await ctx.exposeBinding('recordFtv',(source,detail)=>{if(source.frame.url().includes('/ftv-luxury/gui.html'))report.events.push({project:current,at:Date.now(),...detail});});
await ctx.addInitScript(()=>window.addEventListener('ftv:control',e=>window.recordFtv(e.detail)));
const p=await ctx.newPage();p.on('pageerror',e=>report.errors.push(e.message));
const check=(name,value)=>{report.checks.push({name,pass:!!value});assert.ok(value,name);};
let baselineServer;
try{
 if(process.env.BASELINE_DIST){
  baselineServer=serve(path.resolve(process.env.BASELINE_DIST));await new Promise(r=>baselineServer.listen(0,'127.0.0.1',r));
  for(const [id,sector]of [['boutique-hermes','boutique'],['yacht-monaco','yacht']]){
   await p.goto(`http://127.0.0.1:${baselineServer.address().port}/interfaces/${sector}/${id}/wallpanel`,{waitUntil:'domcontentloaded'});await p.locator('.device-screen button').first().waitFor();await p.locator('.device-screen').screenshot({path:path.join(out,id+'-before.png')});
  }
 }
 for(const [id,sector]of [['boutique-hermes','boutique'],['yacht-monaco','yacht']]){
  current=id;console.log('Automatic tour',id);await p.goto(`${base}/interfaces/${sector}/${id}/wallpanel`,{waitUntil:'domcontentloaded'});
  let frame;for(let i=0;i<150;i++){frame=p.frames().find(f=>f.url().includes('/ftv-luxury/gui.html'));if(frame)break;await p.waitForTimeout(200);}
  assert.ok(frame);await frame.waitForFunction(()=>window.ftvGui?.ready,null,{timeout:90000});
  const model=p.frames().find(f=>f.url().includes('/models/'));
  await model.locator('canvas').click({position:{x:15,y:15}});await p.locator('.demo-countdown').waitFor();
  check(id+' interaction inside model pauses tour',await p.locator('.demo-countdown').isVisible());
  report.events=report.events.filter(e=>e.project!==id);await p.locator('.demo-countdown').click();
  const end=Date.now()+135000;while(Date.now()<end&&report.events.filter(e=>e.project===id&&e.name==='audio.playing'&&e.value===false).length<3)await p.waitForTimeout(400);
  const events=report.events.filter(e=>e.project===id);
  check(id+' three different rooms',new Set(events.filter(e=>e.name==='selectRoom').map(e=>e.value)).size>=3);
  check(id+' three completed audio visits',events.filter(e=>e.name==='audio.playing'&&e.value===false).length>=3);
  check(id+' multiple music sources',new Set(events.filter(e=>e.name==='audio.source').map(e=>e.value)).size>=2);
  check(id+' volume actually varies',new Set(events.filter(e=>e.name==='audio.volume').map(e=>e.value)).size>=8);
 }
 check('No uncaught exceptions',report.errors.length===0);console.log(JSON.stringify(report.checks,null,2));
}catch(e){report.failure=e.stack;console.error(e.stack);process.exitCode=1;}
finally{fs.writeFileSync(path.join(out,'tour-results.json'),JSON.stringify(report,null,2));await browser.close();server.close();baselineServer?.close();}
