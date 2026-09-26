const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');const fs=require('fs');
const out=process.env.HDH_TEST_OUTPUT || 'test-results/hotel-brassus';const base=process.env.HDH_BASE_URL || 'http://127.0.0.1:4173';fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch({headless:true,channel:process.env.BROWSER_CHANNEL || undefined});let results=[],errors=[],http=[];
await Promise.all([{width:1280,height:800},{width:1920,height:1200},{width:1194,height:834}].map(async viewport=>{
 const p=await b.newPage({viewport});p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400)http.push([r.status(),r.url()])});
 for(const theme of ['actuel','clair','sombre'])for(const zone of ['bar','entrance','restaurant','salon','pdr','wellness','seminar']){
  await p.goto(base+'/showcases/hotel-brassus/ch5/index.html?theme='+theme+'&zone='+zone+'&nolock=1');await p.waitForFunction(()=>typeof templatePageModule!=='undefined'&&document.querySelector('#av-layout'));await p.waitForFunction(()=>{const e=document.getElementById('loader');return !e||getComputedStyle(e).display==='none'||getComputedStyle(e).opacity==='0'});await p.waitForTimeout(250);
  for(const page of ['av','lighting','temperature',...(['bar','restaurant','seminar'].includes(zone)?['blinds']:[])]){
   await p.evaluate(name=>templatePageModule.navigateTriggerViewByPageName(name),page);await p.waitForSelector('#'+page+'-page');await p.waitForTimeout(180);
   const data=await p.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth+2||document.documentElement.scrollHeight>innerHeight+2,broken:[...document.images].filter(i=>i.getBoundingClientRect().width&&i.complete&&!i.naturalWidth).map(i=>i.src),text:document.body.innerText.includes('Ã'),small:[...document.querySelectorAll('.btn-scene-lighting,.btn-circuit,.arrow-up,.arrow-down,.volume-mute')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&getComputedStyle(e).visibility!=='hidden'&&e.checkVisibility()&&(r.width<39||r.height<39)}).map(e=>[e.id,Math.round(e.getBoundingClientRect().width),Math.round(e.getBoundingClientRect().height)])}));
   results.push({viewport:viewport.width,theme,zone,page,...data});
   if(viewport.width===1280&&zone==='bar')await p.screenshot({path:out+'/'+theme+'-'+page+'.png'});
   if(page==='lighting'){await p.locator('#btn-area1-lightingscene4').click();if(await p.evaluate(()=>HDH_DEMO.values.get('n1001'))!==100)errors.push('scene '+zone);}
   if(page==='temperature'){await p.locator('.arrow-up[data-join="2501"]').click();if(await p.evaluate(()=>HDH_DEMO.values.get('s2511'))!=='21.5 °C')errors.push('temperature '+zone);}
  }
 }
 await p.close();
}));
fs.writeFileSync(out+'/matrix.json',JSON.stringify({results,errors,http},null,2));console.log(JSON.stringify({cases:results.length,errors,http,overflow:results.filter(r=>r.overflow).length,broken:results.filter(r=>r.broken.length).length,small:results.filter(r=>r.small.length).slice(0,10)},null,2));if(errors.length||http.length||results.some(r=>r.overflow||r.broken.length||r.small.length||r.text))process.exitCode=1;await b.close();})().catch(e=>{console.error(e);process.exitCode=1});
