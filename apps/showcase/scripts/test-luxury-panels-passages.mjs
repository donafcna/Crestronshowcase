// Regression checks: TSW HTML/CSS controls and unobstructed yacht cutaway passages.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const out=path.resolve(process.env.TEST_OUTPUT||'../../docs/verification/2026-09-20-panels-passages');fs.mkdirSync(out,{recursive:true});
const root=path.resolve('public');
const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+decodeURIComponent(req.url.split('?')[0]));if(!file.startsWith(root+path.sep)||!fs.existsSync(file)){res.writeHead(404);res.end();return;}res.setHeader('Content-Type',({'.js':'application/javascript','.html':'text/html','.css':'text/css'})[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({executablePath:process.env.BROWSER_EXE,headless:true,args:JSON.parse(process.env.BROWSER_ARGS||'[]')});
const page=await browser.newPage({reducedMotion:'reduce'}),report={checks:[],errors:[],contrast:[],layouts:[]};
page.on('pageerror',e=>report.errors.push(e.message));
const check=(name,value)=>{report.checks.push({name,pass:!!value});assert.ok(value,name);};
const source=fs.readFileSync('scripts/check-contrast-dom.mjs','utf8');
const audit=vm.runInNewContext(source.slice(source.indexOf('const AUDIT = '),source.indexOf('\nconst problems = []'))+'\nAUDIT',{MIN:4});
let modelRequests=[];page.on('request',r=>{if(/\/models\/|three-r160/.test(r.url()))modelRequests.push(r.url());});
async function inspect(context){
 const layout=await page.evaluate(()=>({overflow:[document.documentElement,document.querySelector('.layout'),document.querySelector('main'),document.querySelector('.controls'),document.querySelector('#space-overview')].some(e=>e.scrollWidth>e.clientWidth+2||e.scrollHeight>e.clientHeight+2),small:[...document.querySelectorAll('button,select')].filter(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>0&&r.height>0&&s.visibility!=='hidden'&&(r.width<40||r.height<40)}).map(e=>e.textContent)}));
 report.layouts.push({context,...layout});check(context+' fits / touch targets',!layout.overflow&&!layout.small.length);
 const contrast=await page.evaluate(()=>window.__audit(document.getElementById('app')));report.contrast.push(...contrast.map(x=>({context,...x})));check(context+' contrast >= 4:1',!contrast.length);
}
try{
 for(const project of ['boutique-hermes','yacht-monaco'])for(const [width,height] of [[1280,800],[1920,1200],[1024,640]]){
  await page.setViewportSize({width,height});modelRequests=[];
  // Even a stray background flag must not activate WebGL on a TSW.
  await page.goto(`${base}/ftv-luxury/gui.html?project=${project}&device=wallpanel&background=1`);
  await page.waitForFunction(()=>window.ftvGui?.ready);await page.addScriptTag({content:audit});
  check(project+' TSW no model fetch '+width,modelRequests.length===0&&await page.evaluate(()=>ftvGui.panel2D&&!ftvGui.externalModel&&!document.querySelector('#model').src));
  for(const theme of ['dark','light','glass']){
   await page.selectOption('#theme',theme);
   for(const tab of ['light','audio','ambience','model']){
    await page.locator(`#desktop-nav [data-tab="${tab}"]`).click();await inspect(`${project}/${width}/${theme}/${tab}`);
    if(width===1280&&theme==='dark'&&tab!=='model')await page.screenshot({path:path.join(out,project+'-'+tab+'.png')});
   }
   await page.locator('#desktop-nav [data-tab="light"]').click();
   await page.locator('[data-panel="1"]').click();await page.locator('#zone').selectOption(project==='yacht-monaco'?'9':'u8');
   await page.locator('[data-control^="light-"]').first().fill('0');
   check(project+' selected tile follows dropdown',await page.locator('.space-tile[aria-pressed=true]').count()===1);
   await inspect(`${project}/${width}/${theme}/circuits`);
   if(width===1280)await page.screenshot({path:path.join(out,project+'-'+theme+'.png')});
  }
  const state=await page.evaluate(()=>{const ids=ftvGui.config.rooms.map(r=>r.id);ftvGui.selectRoom(ids[0]);ftvGui.applyPreset(ftvGui.config.presets[0].id);return ftvGui.state;});
  check(project+' global preset reaches saved spaces',Object.values(state.zones).every(z=>JSON.stringify(z.lights)===JSON.stringify(state.zones.all.lights)));
 }
 await page.setViewportSize({width:1280,height:800});await page.goto(`${base}/ftv-luxury/models/yacht.html`);await page.waitForFunction(()=>window.__yacht);
 const geometry=await page.evaluate(()=>{const {rooms,circulation,model}=__yacht;model.updateMatrixWorld(true);return circulation.map(c=>{const p=new THREE.Box3().setFromObject(c.mesh);const blocked=rooms.filter(r=>r.deck===c.deck&&new THREE.Box3().setFromObject(r.g).intersectsBox(new THREE.Box3(new THREE.Vector3(p.min.x,p.max.y+.1,p.min.z),new THREE.Vector3(p.max.x,p.max.y+1.9,p.max.z)))).map(r=>r.name);return {deck:c.deck,side:c.side,width:c.width,length:c.b-c.a,blocked};});});
 report.geometry=geometry;check('Ten continuous lateral passages',geometry.length===10);check('Five decks, both sides, 1.05 m conceptual width, no room/furniture collision',geometry.every(c=>c.width>=1.05&&c.length>25&&!c.blocked.length)&&new Set(geometry.map(c=>c.deck)).size===5);
 for(let deck=0;deck<5;deck++){await page.evaluate(d=>__yacht.setMode('deck',d),deck);await page.waitForTimeout(250);await page.screenshot({path:path.join(out,'yacht-deck-'+deck+'.png'),timeout:90000});}
 await page.evaluate(()=>__yacht.setMode('exterior'));await page.waitForTimeout(250);await page.screenshot({path:path.join(out,'yacht-exterior.png'),timeout:90000});
 check('glTF includes ten canonical passages',await page.evaluate(()=>JSON.parse(exportYacht()).nodes.filter(n=>/^Passage (bâbord|tribord)/.test(n.name)).length===10));
 check('No JavaScript errors',report.errors.length===0);
 console.log(`${report.checks.length} checks passed`);
}finally{await page.screenshot({path:path.join(out,'last-state.png')});fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2));await browser.close();server.close();}
