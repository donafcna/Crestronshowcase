// Real built-site checks. Configure PLAYWRIGHT_MODULE, BROWSER_EXE and
// BROWSER_ARGS where Playwright/browser are supplied by the execution runtime.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve('dist'),out=path.resolve(process.env.TEST_OUTPUT||'../../docs/verification/2026-09-20-vca-sunrays');
fs.mkdirSync(out,{recursive:true});
const mime={'.js':'application/javascript','.css':'text/css','.html':'text/html','.json':'application/json','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.webmanifest':'application/manifest+json'};
const server=http.createServer((req,res)=>{const name=decodeURIComponent(req.url.split('?')[0]);let file=path.join(root,name);if(!file.startsWith(root+path.sep)){file=path.join(root,'index.html');}if(!fs.existsSync(file)||!fs.statSync(file).isFile()){if(path.extname(name)){res.writeHead(404).end();return;}file=path.join(root,'index.html');}res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base=process.env.BASE_URL||`http://127.0.0.1:${server.address().port}`;
const b=await chromium.launch({executablePath:process.env.BROWSER_EXE,args:JSON.parse(process.env.BROWSER_ARGS||'[]'),headless:true});
const context=await b.newContext({viewport:{width:1440,height:1000},hasTouch:true,reducedMotion:'reduce',serviceWorkers:'block'});
await context.route('https://fonts.googleapis.com/**',route=>route.abort());
await context.route('https://fonts.gstatic.com/**',route=>route.abort());
const p=await context.newPage(),report={base,checks:[],errors:[],contrast:[],layout:[]};
p.on('pageerror',e=>report.errors.push(e.message));
const check=(name,pass)=>{report.checks.push({name,pass:!!pass});assert.ok(pass,name);};
const auditSource=fs.readFileSync('scripts/check-contrast-dom.mjs','utf8');
const audit=vm.runInNewContext(auditSource.slice(auditSource.indexOf('const AUDIT = '),auditSource.indexOf('\nconst problems = []'))+'\nAUDIT',{MIN:4});
async function gui(){for(let i=0;i<150;i++){const f=p.frames().find(f=>f.url().includes('/ftv-luxury/gui.html'));if(f){await f.waitForFunction(()=>window.ftvGui?.ready,null,{timeout:90000});return f;}await p.waitForTimeout(200);}throw Error('GUI did not load');}
try{
 for(const [project,sector,room]of [['boutique-hermes','boutique','r1'],['yacht-monaco','yacht','11']]){
  // Local view uses the built HTML/assets; all control pages and dynamic states.
  await p.setViewportSize({width:1280,height:800});
  await p.goto(base+'/ftv-luxury/gui.html?project='+project,{waitUntil:'domcontentloaded'});
  await p.waitForFunction(()=>window.ftvGui?.ready,null,{timeout:90000});await p.addScriptTag({content:audit});
  for(const [width,height]of [[1280,800],[1024,768],[402,781],[390,844],[320,740]]){
   await p.setViewportSize({width,height});
   console.log(project,width,height);
   for(const theme of (width===1280||width===402?['dark','light','glass']:['dark'])){
    await p.selectOption('#theme',theme);
    for(const tab of ['light','audio','ambience','model']){
     await p.evaluate(t=>window.ftvGui.chooseTab(t),tab);
     const count=await p.locator('[data-panel]').count();
     for(let panel=0;panel<Math.max(1,count);panel++){
      if(count)await p.locator(`[data-panel="${panel}"]`).click();
      if(tab==='audio'){await p.locator('[data-action="play"]').click();await p.locator('[data-action="mute"]').click();}
      const ctx={project,width,height,theme,tab,panel};
      const issues=await p.evaluate(()=>window.__audit(document.getElementById('app')));
      report.contrast.push(...issues.map(x=>({...ctx,...x})));
      const layout=await p.evaluate(()=>{
       const roots=[document.documentElement,document.querySelector('.layout'),document.querySelector('main'),document.querySelector('.controls')].filter(Boolean);
       return {horizontal:roots.some(e=>e.scrollWidth>e.clientWidth+2),vertical:roots.some(e=>e.scrollHeight>e.clientHeight+2),small:[...document.querySelectorAll('button,select')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&(r.width<39||r.height<39)}).map(e=>e.id||e.textContent.trim())};
      });report.layout.push({...ctx,...layout});fs.writeFileSync(path.join(out,'results-running.json'),JSON.stringify(report,null,2));
     }
    }
    if(width===1280||width===402){await p.evaluate(()=>window.ftvGui.chooseTab(innerWidth<650?'model':'light'));await p.waitForTimeout(900);await p.screenshot({path:path.join(out,`${project}-${width}-${theme}.png`),timeout:90000});}
   }
  }
  await p.setViewportSize({width:1280,height:800});await p.selectOption('#theme','dark');await p.selectOption('#zone',room);
  await p.evaluate(()=>window.ftvGui.chooseTab('light'));await p.locator('[data-panel="1"]').click();
  await p.locator('#light-cove').fill('17');await p.waitForTimeout(150);
  const model=p.frames().find(f=>f.url().includes('/models/'));
  check(project+' selected room reaches model',(await model.evaluate(()=>window.__ftvModel.state().room))===room);
  check(project+' room lighting state',(await p.evaluate(id=>window.ftvGui.state.zones[id].lights.cove,room))===17);
  await model.evaluate(id=>{window.__ftvModel.select(id);window.__ftvEmit()},project==='boutique-hermes'?'r2':'12');
  await p.waitForTimeout(200);check(project+' model selection reaches GUI',(await p.inputValue('#zone'))===(project==='boutique-hermes'?'r2':'12'));
  // Existing host, every supported chassis, normal + Scene modes.
  for(const device of project==='boutique-hermes'?['wallpanel','tablet','phone']:['wallpanel','tablet','desktop','phone']){
   console.log('Host',project,device);await p.setViewportSize({width:1440,height:1000});await p.goto(`${base}/interfaces/${sector}/${project}/${device}`,{waitUntil:'domcontentloaded'});let f=await gui();
   check(project+'/'+device+' route retained',new URL(p.url()).pathname.endsWith('/'+device));
   await f.locator('#zone').selectOption(room);
   check(project+'/'+device+' model visible',await f.locator('#app').isVisible());
   const scene=p.locator('.btn-exit-fullscreen-device-corner');
   if(await scene.count()){await scene.first().click();await p.waitForTimeout(200);check(project+'/'+device+' scene mode',await p.locator('.showcase-container.fullscreen-mode').count());await p.keyboard.press('Escape');}
   if(device==='wallpanel'){
    const target=path.resolve('public/sheets/'+project);fs.mkdirSync(target,{recursive:true});
    for(const [tab,name]of [['light','01-light'],['audio','02-audio'],['ambience','03-ambience'],['model','04-3d']]){
     await f.evaluate(t=>window.ftvGui.chooseTab(t),tab);if(tab==='model')await f.locator('#overview').click();await p.waitForTimeout(200);
     await p.locator('.device-screen').screenshot({path:path.join(target,name+'.png'),timeout:90000});
    }
    await p.screenshot({path:path.join(out,project+'-host.png'),timeout:90000});
   }else if(device==='phone'){
    await f.evaluate(()=>window.ftvGui.chooseTab('model'));await f.locator('#overview').click();await p.waitForTimeout(200);
    await p.locator('.device-screen').screenshot({path:path.resolve('public/sheets/'+project+'/05-iphone.png'),timeout:90000});
   }
  }
  // Native mobile demo route, without a reduced chassis.
  await p.setViewportSize({width:390,height:844});await p.goto(base+'/#demo/'+project);const f=await gui();check(project+' iPhone demo route',await f.evaluate(()=>innerWidth<650));
 }
 check('No uncaught browser exceptions',report.errors.length===0);
 check('Text contrast at least 4:1',report.contrast.length===0);
 check('No horizontal/vertical page overflow',report.layout.every(x=>!x.horizontal&&!x.vertical));
 check('Touch controls at least 40 CSS pixels',report.layout.every(x=>!x.small.length));
 console.log(JSON.stringify({checks:report.checks,contrastFailures:report.contrast.slice(0,12),layoutFailures:report.layout.filter(x=>x.horizontal||x.vertical||x.small.length).slice(0,12)},null,2));
}catch(e){report.failure=e.stack;console.error(e.stack);console.log('Contrast',report.contrast.slice(0,14));console.log('Layout',report.layout.filter(x=>x.horizontal||x.vertical||x.small.length).slice(0,14));process.exitCode=1;}
finally{fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2));await b.close();server.close();}
