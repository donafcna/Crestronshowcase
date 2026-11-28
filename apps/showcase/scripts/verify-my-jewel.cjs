const fs=require('fs');const path=require('path');const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const out=path.resolve(process.env.JEWEL_VERIFY_DIR || 'docs/verification/2026-11-28-my-jewel');fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});const errors=[],checks=[];const p=await b.newPage();p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400&&!r.url().includes('favicon'))errors.push(r.status()+' '+r.url())});
for(const [device,width,height]of [['panel',1280,800],['ipad',1024,768],['phone',440,863]]){
 await p.setViewportSize({width,height});await p.goto('http://127.0.0.1:5187/showcases/my-jewel/index.html?mode=panel&channel=verify');
 for(const theme of ['aurum','glacier','carbone']){
 await p.evaluate(theme=>{const bus=new BroadcastChannel('my-jewel:verify');bus.postMessage({type:'command',action:'theme',value:theme});setTimeout(()=>bus.close(),100)},theme);await p.waitForTimeout(80);
 const inspect=async(name)=>{const data=await p.evaluate(()=>{const pg=document.querySelector('#page'),r=pg.getBoundingClientRect();return{overflowX:pg.scrollWidth>pg.clientWidth+2,overflowY:pg.scrollHeight>pg.clientHeight+2,buttons:[...pg.querySelectorAll('button')].filter(e=>e.getBoundingClientRect().height>0).length,offscreen:[...pg.querySelectorAll('button,input,select')].filter(e=>{const q=e.getBoundingClientRect();return q.width&&q.height&&(q.left<r.left-2||q.right>r.right+2||q.top<r.top-2||q.bottom>r.bottom+2)}).map(e=>e.textContent?.trim().slice(0,30))}});checks.push({device,theme,page:name,...data});};
 await p.getByRole('button',{name:'ACCUEIL',exact:true}).click();await inspect('home');await p.screenshot({path:path.join(out,`${device}-${theme}-home.png`)});
 for(const section of ['LUMIÈRES','CLIMAT']){
 await p.getByRole('button',{name:section,exact:true}).click();await inspect(section+'-plan');
 for(const name of ['SALON','CARRÉ','CUISINE','BUREAU CAPITAINE','CINÉMA','FITNESS','PONT ARRIÈRE','SUITE ARMATEUR','CABINE INVITÉS','BEACH CLUB']){
 await p.getByRole('button',{name,exact:true}).click();await inspect(section+'-'+name);if(name==='SALON'&&section==='LUMIÈRES'){await p.screenshot({path:path.join(out,`${device}-${theme}-lighting.png`)});}
 await p.getByRole('button',{name:section,exact:true}).click();}
 }
 for(const section of ['STORES','TV','MUSIQUE','SÉCURITÉ','INTERPHONE']){await p.getByRole('button',{name:section,exact:true}).click();await inspect(section);if(section==='TV'){for(const source of ['APPLE TV','SWISSCOM TV']){await p.getByRole('button',{name:source,exact:true}).click();await inspect(source);await p.locator('#navbar').getByRole('button',{name:'TV',exact:true}).click();}}}
 }
}
fs.writeFileSync(path.join(out,'gui-checks.json'),JSON.stringify({checks,errors},null,2));console.log(JSON.stringify({checks:checks.length,errors,overflow:checks.filter(c=>c.overflowX||c.overflowY),offscreen:checks.filter(c=>c.offscreen.length)},null,2));if(errors.length||checks.some(c=>c.overflowX||c.overflowY||c.offscreen.length))process.exitCode=1;await b.close();})();
