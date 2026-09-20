const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const http=require('http'),fs=require('fs'),path=require('path'),assert=require('assert');
const vm=require('vm');const auditSource=fs.readFileSync('scripts/check-contrast-dom.mjs','utf8').match(/const AUDIT = (`[\s\S]*?`);/)[1];const audit=vm.runInNewContext(auditSource,{MIN:4});
const root=path.resolve('dist'),out=path.resolve(process.env.TEST_OUTPUT||'../../docs/verification/2026-09-21-venues');fs.mkdirSync(out,{recursive:true});
(async()=>{
const server=http.createServer((req,res)=>{let f=path.join(root,decodeURIComponent(req.url.split('?')[0]));if(!fs.existsSync(f)||fs.statSync(f).isDirectory())f=path.join(root,'index.html');res.setHeader('Content-Type',({'.html':'text/html','.js':'application/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'})[path.extname(f)]||'application/octet-stream');res.end(fs.readFileSync(f))});await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({executablePath:process.env.BROWSER_EXE,headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const page=await browser.newPage({viewport:{width:1440,height:1000}});await page.route('**/*',route=>route.request().url().startsWith(base)?route.continue():route.abort());let errors=[],checks=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|shader|WebGL/.test(m.text()))errors.push(m.text())});
for(const [id,sector,old] of [['auditorium-richmond','conference','wallpanel'],['club-etoile','discoteque','desktop']]){
 await page.goto(`${base}/interfaces/${sector}/${id}/${old}`);await page.waitForTimeout(700);!process.env.NO_CAPTURES&&await page.screenshot({path:`${out}/${id}-before.png`});assert.equal(await page.locator('.venue-background').count(),0);checks.push(`${id} existing support has no 3D`);
 await page.goto(`${base}/interfaces/${sector}/${id}/phone`);await page.waitForSelector('.venue-phone');await page.waitForSelector('.venue-background[data-ready="true"]');const frame=page.frames().find(f=>f.url().includes('/ftv-luxury/venues/index.html'));
 assert(frame);assert.equal(await frame.evaluate(()=>__venue.model.children.length>50),true);checks.push(`${id} model loaded`);
 for(const mode of ['normal','scene']){
 if(mode==='scene')await page.locator('.btn-exit-fullscreen-device-corner--stage').click();
 for(const theme of ['dark','light','glass']){
 while(await page.locator('.venue-phone').getAttribute('data-theme')!==theme)await page.getByRole('button',{name:'Changer le thème'}).click();
 const tabs=page.locator('.venue-phone nav button');for(let i=0;i<await tabs.count();i++){
 await tabs.nth(i).click();await page.addScriptTag({content:audit});const contrast=await page.evaluate(()=>__audit(document.querySelector('.venue-phone')));assert.equal(contrast.length,0,JSON.stringify(contrast));const m=await page.locator('.venue-phone').evaluate(el=>{const r=el.getBoundingClientRect();return {overflow:el.scrollHeight>el.clientHeight+1,hidden:[...el.querySelectorAll('main button,main input')].filter(e=>{const b=e.getBoundingClientRect();return b.bottom>r.bottom-12||b.right>r.right+1}).map(e=>e.textContent)}});assert(!m.overflow,JSON.stringify(m));assert.equal(m.hidden.length,0,JSON.stringify(m));checks.push(`${id} ${mode} ${theme} tab${i} fits`);
 const small=await page.locator('.venue-phone').evaluate(el=>[...el.querySelectorAll('button,input')].filter(e=>e.offsetHeight<44));assert.equal(small.length,0,'Touch targets must be 44 CSS px before chassis scaling');
 }
 await tabs.first().click();!process.env.NO_CAPTURES&&await page.screenshot({path:`${out}/${id}-${mode}-${theme}.png`});
 }
 }
 if(id==='auditorium-richmond'){
 await page.getByRole('button',{name:'Éteindre',exact:true}).click();await frame.waitForFunction(()=>__venue.state.dimmers.faceSpots===0);checks.push('Auditorium lights OFF synchronized');await page.getByRole('button',{name:'Conférence',exact:true}).click();await page.getByRole('button',{name:'Écran',exact:true}).click();await page.getByRole('button',{name:'Logo',exact:true}).click();await frame.waitForFunction(()=>__venue.state.ledWallSource==='logo');checks.push('LED source synchronized');
 }else{
 await page.getByRole('button',{name:'Ambiances',exact:true}).click();await page.getByRole('button',{name:'Soirée',exact:true}).click();await frame.waitForFunction(()=>__venue.smoke.visible===true);checks.push('Club smoke and lights synchronized');
 }
 await page.setViewportSize({width:1280,height:800});await page.waitForTimeout(500);!process.env.NO_CAPTURES&&await page.screenshot({path:`${out}/${id}-laptop.png`});await page.setViewportSize({width:1440,height:1000});
}
for(const [id,sector]of [['yacht-monaco','yacht'],['boutique-hermes','boutique']]){await page.goto(`${base}/interfaces/${sector}/${id}`);await page.waitForURL('**/phone');checks.push(`${id} defaults to phone`);await page.goto(`${base}/interfaces/${sector}/${id}/wallpanel`);await page.waitForTimeout(300);assert(page.url().endsWith('/wallpanel'));checks.push(`${id} explicit wallpanel preserved`)}
await page.goto(`${base}/interfaces/tous/auditorium-richmond/wallpanel`);for(const id of ['yacht-monaco','boutique-hermes']){await page.locator(`.project-list-card[href$="/${id}"]`).click();await page.waitForURL(`**/${id}/phone`);checks.push(`${id} project card selects phone`)}
fs.writeFileSync(out+'/results.json',JSON.stringify({checks,errors},null,2));await browser.close();server.close();assert.equal(errors.length,0,JSON.stringify(errors));console.log(`${checks.length} checks passed`);
})().catch(e=>{console.error(e);process.exit(1)});
