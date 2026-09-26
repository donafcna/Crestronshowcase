// Browser verification of the phone chassis + full-page model composition.
import fs from 'node:fs';import path from 'node:path';import http from 'node:http';import vm from 'node:vm';import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const out=path.resolve(process.env.TEST_OUTPUT||'../../docs/verification/2026-09-20-luxury-background');fs.mkdirSync(out,{recursive:true});
function serve(root){return http.createServer((req,res)=>{let f=path.join(root,decodeURIComponent(req.url.split('?')[0]));if(!f.startsWith(root+path.sep)||!fs.existsSync(f)||!fs.statSync(f).isFile())f=path.join(root,'index.html');res.setHeader('Content-Type',({'.js':'application/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.svg':'image/svg+xml','.webp':'image/webp','.json':'application/json'})[path.extname(f)]||'application/octet-stream');res.end(fs.readFileSync(f));});}
const server=serve(path.resolve('dist'));await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=process.env.BASE_URL||`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({executablePath:process.env.BROWSER_EXE,args:JSON.parse(process.env.BROWSER_ARGS||'[]'),headless:true,...(process.env.BASE_URL&&process.env.HTTPS_PROXY?{proxy:{server:process.env.HTTPS_PROXY}}:{})});
const ctx=await browser.newContext({viewport:{width:1591,height:900},locale:'fr-FR',reducedMotion:'reduce',serviceWorkers:'block',ignoreHTTPSErrors:true});
await ctx.route('https://fonts.googleapis.com/**',r=>r.abort());await ctx.route('https://fonts.gstatic.com/**',r=>r.abort());
if(!process.env.BASE_URL)await ctx.route('https://**/*',r=>r.abort());
await ctx.addInitScript(()=>localStorage.setItem('app_lang','fr'));
const p=await ctx.newPage(),report={checks:[],errors:[],contrast:[],layouts:[]};p.on('pageerror',e=>report.errors.push(e.message));
const check=(name,value)=>{report.checks.push({name,pass:!!value});assert.ok(value,name);};
const auditSource=fs.readFileSync('scripts/check-contrast-dom.mjs','utf8');
const audit=vm.runInNewContext(auditSource.slice(auditSource.indexOf('const AUDIT = '),auditSource.indexOf('\nconst problems = []'))+'\nAUDIT',{MIN:4});
async function gui(){for(let i=0;i<200;i++){const f=p.frames().find(f=>f.url().includes('/ftv-luxury/gui.html'));if(f){await f.waitForFunction(()=>window.ftvGui?.ready,null,{timeout:90000});return f;}await p.waitForTimeout(100);}throw Error('GUI missing');}
async function snap(name){await p.screenshot({path:path.join(out,name+'.png'),timeout:90000});}
async function auditGui(g,context){
 if(!await g.evaluate(()=>!!window.__audit))await g.addScriptTag({content:audit});
 const issues=await g.evaluate(()=>window.__audit(document.getElementById('app')));report.contrast.push(...issues.map(i=>({...context,...i})));
 const layout=await g.evaluate(()=>{const roots=[document.documentElement,document.querySelector('.layout'),document.querySelector('main'),document.querySelector('.controls')];return {overflow:roots.some(e=>e.scrollWidth>e.clientWidth+2||e.scrollHeight>e.clientHeight+2),small:[...document.querySelectorAll('button,select')].filter(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return s.visibility!=='hidden'&&r.width>0&&r.height>0&&(r.width<39||r.height<39)}).map(e=>e.id||e.textContent.trim())};});report.layouts.push({...context,...layout});
}
let baseline;
try{
 if(process.env.BASELINE_DIST){baseline=serve(path.resolve(process.env.BASELINE_DIST));await new Promise(r=>baseline.listen(0,'127.0.0.1',r));for(const [id,sector]of [['boutique-hermes','boutique'],['yacht-monaco','yacht']]){await p.goto(`http://127.0.0.1:${baseline.address().port}/interfaces/${sector}/${id}/phone`);const g=await gui();await g.locator('#brand').click();await g.selectOption('#theme','dark');await snap(id+'-before');}}
 for(const [id,sector,room,other]of [['boutique-hermes','boutique','r1','r2'],['yacht-monaco','yacht','11','12']]){
  console.log('Background',id);await p.setViewportSize({width:1591,height:900});await p.goto(`${base}/interfaces/${sector}/${id}/phone`);let g=await gui();await g.locator('#brand').click();
  await p.locator('.luxury-background[data-ready=true]').waitFor();const m=p.frames().find(f=>f.url().includes('/models/'));
  check(id+' model is a sibling of the phone GUI',m.parentFrame()===p.mainFrame()&&g.parentFrame()===p.mainFrame());
  check(id+' one model, no video background',p.frames().filter(f=>f.url().includes('/models/')).length===1&&await p.locator('.bg-video-container').count()===0);
  check(id+' phone delegates rendering',await g.evaluate(()=>window.ftvGui.externalModel&&document.getElementById('model').src===''));
  for(const mode of ['normal','scene']){
   if(mode==='scene'){await p.locator('.btn-exit-fullscreen-device-corner').click();await p.waitForTimeout(400);}
   for(const theme of ['dark','light','glass']){
    await g.selectOption('#theme',theme);
    for(const tab of ['light','audio','ambience','model']){await g.evaluate(t=>window.ftvGui.chooseTab(t),tab);await auditGui(g,{id,mode,theme,tab});}
    await g.evaluate(()=>window.ftvGui.chooseTab('light'));await g.locator('#overview').click();await p.waitForTimeout(250);
    if(mode==='normal'||theme==='dark')await snap(`${id}-${mode}-${theme}`);
   }
   const bounds=await p.evaluate(()=>{const b=document.querySelector('.luxury-background-frame'),r=b.getBoundingClientRect(),v=b.contentWindow.__ftvViewport,phone=document.querySelector('.phone-device-frame').getBoundingClientRect(),sidebar=document.querySelector('.workspace-device-sidebar').getBoundingClientRect();return {background:r.toJSON(),viewport:v,phone:phone.toJSON(),sidebar:sidebar.toJSON(),paused:b.contentWindow.__ftvPaused,scroll:document.documentElement.scrollWidth>innerWidth+2}});
   check(id+' '+mode+' camera centre clear of controls',bounds.background.left+bounds.viewport.x>=bounds.phone.right&&bounds.background.left+bounds.viewport.x+bounds.viewport.w<=bounds.sidebar.left);
   check(id+' '+mode+' background visible during controls',!bounds.paused&&!bounds.scroll);
   if(mode==='scene')await p.keyboard.press('Escape');
  }
  const initialCentre=await p.evaluate(()=>{const f=document.querySelector('.luxury-background-frame'),b=f.getBoundingClientRect(),v=f.contentWindow.__ftvViewport;return {x:b.left+v.x+v.w/2,y:b.top+v.y+v.h/2};});
  await p.mouse.move(initialCentre.x,initialCentre.y);await p.mouse.wheel(0,-140);
  const defaultRoom=id==='boutique-hermes'?'hall':'0';await m.waitForFunction(r=>window.__ftvModel.state().room===r,defaultRoom);
  check(id+' reverse wheel opens the default room',true);await p.waitForTimeout(700);await p.mouse.wheel(0,140);await m.waitForFunction(()=>window.__ftvModel.state().room==='all');
  await g.selectOption('#theme','dark');await g.selectOption('#zone',room);await m.waitForFunction(r=>window.__ftvModel.state().room===r,room);
  check(id+' room selection reaches background',await m.evaluate(()=>window.__ftvModel.state().room)===room);
  await snap(id+'-room');
  const materials=()=>m.evaluate(()=>{const j=document.getElementById('ftv-jewel')?.__jewel;const yacht=window.__yacht;const group=j?j.state.room.group:yacht.rooms.find(r=>String(r.id)===window.__ftvModel.state().room).g;const levels=[];group.traverse(o=>{if(o.isMesh&&o.material?.emissive)levels.push([o.material.uuid,o.material.emissiveIntensity]);});return levels;});
  await g.evaluate(()=>window.ftvGui.chooseTab('light'));await g.locator('[data-panel="1"]').click();await g.locator('#light-cove').fill('0');await p.waitForTimeout(150);const before=JSON.stringify(await materials());await g.locator('#light-cove').fill('95');await p.waitForTimeout(150);
  check(id+' light control changes background materials',before!==JSON.stringify(await materials()));
  await m.evaluate(r=>{window.__ftvModel.select(r);window.__ftvEmit()},other);await g.waitForFunction(r=>window.ftvGui.state.zone===r,other);
  check(id+' background selection reaches phone',await g.inputValue('#zone')===other);
  await g.evaluate(()=>window.ftvGui.chooseTab('model'));await g.locator('[data-floor="1"]').last().click();await m.waitForFunction(()=>String(window.__ftvModel.state().floor)==='1');
  check(id+' floor controls reach background',true);
  await g.selectOption('#zone','all');await p.waitForTimeout(200);check(id+' complete overview restored',await m.evaluate(()=>window.__ftvModel.state().room==='all'&&(window.__ftvModel.project!=='boutique-hermes'||window.__ftvModel.state().floor==='both')));
  await g.selectOption('#zone',room);await m.waitForFunction(r=>window.__ftvModel.state().room===r,room);
  const centre=await p.evaluate(()=>{const f=document.querySelector('.luxury-background-frame'),b=f.getBoundingClientRect(),v=f.contentWindow.__ftvViewport;return {x:b.left+v.x+v.w/2,y:b.top+v.y+v.h/2};});
  await p.mouse.move(centre.x,centre.y);await p.mouse.wheel(0,140);await m.waitForFunction(()=>window.__ftvModel.state().room==='all');await p.waitForTimeout(700);await p.mouse.wheel(0,-140);await m.waitForFunction(r=>window.__ftvModel.state().room===r,room);
  check(id+' wheel overview and return to selected room',true);check(id+' background gesture pauses automatic tour',await p.locator('.demo-countdown').count()>0);
  for(const width of [1366,1906]){await p.setViewportSize({width,height:900});await p.waitForTimeout(450);const ok=await p.evaluate(()=>{const f=document.querySelector('.luxury-background-frame'),v=f.contentWindow.__ftvViewport,b=f.getBoundingClientRect(),phone=document.querySelector('.phone-device-frame').getBoundingClientRect(),side=document.querySelector('.workspace-device-sidebar').getBoundingClientRect();return b.left+v.x>=phone.right&&b.left+v.x+v.w<=side.left});check(id+' responsive framing '+width,ok);}
  await p.setViewportSize({width:1591,height:900});await g.locator('#overview').click();await g.evaluate(()=>window.ftvGui.chooseTab('light'));
  // Switching chassis disposes the external model; standalone mobile keeps its own model.
  for(const device of id==='yacht-monaco'?['wallpanel','tablet','desktop']:['wallpanel','tablet']){await p.goto(`${base}/interfaces/${sector}/${id}/${device}`);g=await gui();await g.locator('#brand').click();check(id+' '+device+' retains original placement',await p.locator('.luxury-background').count()===0&&!await g.evaluate(()=>window.ftvGui.externalModel));}
  await p.setViewportSize({width:390,height:844});await p.goto(`${base}/#demo/${id}`);g=await gui();await g.evaluate(()=>window.ftvGui.chooseTab('model'));check(id+' standalone iPhone retains model',!await g.evaluate(()=>window.ftvGui.externalModel)&&p.frames().some(f=>f.url().includes('/models/')));await auditGui(g,{id,mode:'native-phone',theme:'dark',tab:'model'});
 }
 check('GUI text contrast >=4:1',report.contrast.length===0);check('No GUI page overflow',report.layouts.every(r=>!r.overflow));check('Touch targets >=40 CSS px',report.layouts.every(r=>r.small.length===0));check('No browser exceptions',report.errors.length===0);
 console.log(JSON.stringify({checks:report.checks.length,states:report.layouts.length,errors:report.errors},null,2));
}catch(e){report.failure=e.stack;console.error(e.stack);console.error('Contrast',report.contrast.slice(0,8));console.error('Layout',report.layouts.filter(x=>x.overflow||x.small.length).slice(0,8));process.exitCode=1;}
finally{fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2));await browser.close();server.close();baseline?.close();}
