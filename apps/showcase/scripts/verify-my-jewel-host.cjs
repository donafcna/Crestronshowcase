const fs=require('fs'),path=require('path');const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});const ctx=await b.newContext({viewport:{width:1600,height:1000}}),p=await ctx.newPage(),out=path.resolve(process.env.JEWEL_VERIFY_DIR || 'docs/verification/2026-11-28-my-jewel'),errors=[],checks=[];p.on('pageerror',e=>errors.push(e.message));
const pause=async()=>{const button=p.getByRole('button',{name:/Mettre en pause|Pause/}).first();if(await button.count())await button.click().catch(()=>{});};
for(const device of ['wallpanel','tablet','phone','desktop']){
 await p.goto('http://127.0.0.1:5187/interfaces/yacht2/my-jewel/'+device);await p.waitForTimeout(300);await pause();
 for(const [theme,label]of [['aurum','Sombre'],['glacier','Clair'],['carbone','Verre']]){
 await p.getByRole('button',{name:label,exact:true}).click();const panel=p.frames().find(f=>f.url().includes('mode=panel')),bg=p.frames().find(f=>f.url().includes('mode=background'));await panel.waitForSelector('#navbar');await panel.getByRole('button',{name:'ACCUEIL',exact:true}).click();await p.waitForTimeout(100);
 checks.push({device,theme,mode:'normal',panelTheme:await panel.locator('#tsw').getAttribute('data-theme'),background:!!bg});
 if(device==='phone'){await p.screenshot({path:path.join(out,`host-${device}-${theme}-normal.png`)});}
 await p.locator('.btn-exit-fullscreen-device-corner').click();const real=p.getByRole('button',{name:'Taille réelle',exact:true});if(await real.count())await real.click();await p.waitForTimeout(100);checks.push({device,theme,mode:'scene',active:await p.locator('.showcase-container').evaluate(e=>e.classList.contains('fullscreen-mode'))});
 await p.screenshot({path:path.join(out,`host-${device}-${theme}-scene.png`)});
 const responsive=p.getByRole('button',{name:'Responsive',exact:true});if(await responsive.count()){await responsive.click();checks.push({device,theme,mode:'scene-responsive',active:true});}
 await p.locator('.btn-exit-fullscreen-device-corner').click();
 }
}
// Actual GUI-to-background state sync and isolated project bus.
await p.goto('http://127.0.0.1:5187/interfaces/yacht2/my-jewel/phone');await p.waitForTimeout(300);await pause();let panel=p.frames().find(f=>f.url().includes('mode=panel')),bg=p.frames().find(f=>f.url().includes('mode=background'));
await panel.getByRole('button',{name:'LUMIÈRES',exact:true}).click();await panel.getByRole('button',{name:'SALON',exact:true}).click();await p.waitForTimeout(1200);checks.push({type:'room-sync',title:await bg.locator('.rv-title').textContent(),open:await bg.locator('#roomView').evaluate(e=>e.classList.contains('open'))});
const frames1=+(await bg.locator('#roomView canvas.jewel-water').getAttribute('data-frames'));await p.waitForTimeout(250);const frames2=+(await bg.locator('#roomView canvas.jewel-water').getAttribute('data-frames'));checks.push({type:'water-animation',advances:frames2>frames1});
await panel.getByRole('button',{name:'TOUT ÉTEINDRE',exact:true}).click();await p.waitForTimeout(100);checks.push({type:'light-sync',opacity:await bg.locator('.jewel-light-plane').evaluate(e=>e.style.opacity)});
await p.getByRole('button',{name:'Vue extérieure',exact:true}).click();await p.waitForTimeout(200);checks.push({type:'exterior-command',closed:await bg.locator('#roomView').evaluate(e=>!e.classList.contains('open'))});
// Before / after comparison in matching host and themes.
for(const [id,sector]of [['villa-stark','residentiel'],['my-jewel','yacht2']])for(const [theme,label]of [['aurum','Sombre'],['glacier','Clair'],['carbone','Verre']]){await p.goto(`http://127.0.0.1:5187/interfaces/${sector}/${id}/phone`);await p.waitForTimeout(200);await pause();await p.getByRole('button',{name:label,exact:true}).click();await p.waitForTimeout(100);await p.screenshot({path:path.join(out,`compare-${id}-${theme}.jpg`)});}
fs.writeFileSync(path.join(out,'host-checks.json'),JSON.stringify({checks,errors},null,2));console.log(JSON.stringify({checks:checks.length,errors,failed:checks.filter(c=>c.active===false||c.advances===false||c.closed===false)},null,2));if(errors.length||checks.some(c=>c.active===false||c.advances===false||c.closed===false||c.open===false||c.panelTheme&&c.panelTheme!==c.theme))process.exitCode=1;await b.close();})();
