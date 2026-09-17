const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const base=process.env.BASE_URL||'http://127.0.0.1:4211',out=process.env.TEST_OUTPUT||path.resolve('../../Claude outputs/journey-1/sheets');fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch({executablePath:process.env.BROWSER_EXE}),p=await b.newPage({viewport:{width:1400,height:875}}),r={checks:[],errors:[]};p.on('pageerror',e=>r.errors.push(e.message));
try{for(const [label,url]of [['before','https://crestrongui.vercel.app'],['after',base]]){
 await p.goto(url+'/interfaces/residentiel/crestron-home/wallpanel/3');await p.locator('.ch-tabbar button').last().click();await p.locator('.ch-room-card').first().click();
 for(const theme of ['light','dark']){
  if(theme==='dark'){await p.locator('.ch-topbar .ch-iconbtn').last().click();await p.locator('.ch-sheet .ch-switch').first().click();await p.locator('.ch-sheet-head .ch-iconbtn').click();}
  await p.locator('.ch-svc').filter({hasText:'Vidéo'}).click();
  if(label==='after'){const volume=p.locator('[data-demo-action="volume"]');await volume.fill('62');await volume.scrollIntoViewIfNeeded();assert.equal(await volume.inputValue(),'62');assert.equal(await volume.locator('..').locator('b').textContent(),'62');r.checks.push(theme+' volume feedback');
   assert.ok(await volume.evaluate(el=>el.offsetHeight>=44));assert.ok(await p.locator('[data-demo-action="av-off"]').evaluate(el=>el.offsetHeight>=40&&el.offsetWidth>=40));r.checks.push(theme+' touch sizes');
  }else await p.locator('.ch-sheet-body').evaluate(el=>el.scrollTop=el.scrollHeight);
  await p.screenshot({path:path.join(out,label+'-ftv-'+theme+'.png')});await p.locator('.ch-sheet-head .ch-iconbtn').click();
 }
}
// The reference simulator has light/dark themes; frosted glass is not implemented there.
for(const lang of ['fr','en','de']){await p.goto(base+'/fiche/crestron-home?lang='+lang);await p.waitForTimeout(800);assert.ok((await p.locator('body').innerText()).includes(lang==='fr'?'Volume vidéo':lang==='en'?'Video volume':'Video-Lautstärke'));r.checks.push('FTV sheet '+lang);}
await p.goto(base+'/interfaces/residentiel/villa-gemini/phone/4');await p.locator('.device-stage').click({position:{x:5,y:5}});await p.locator('.led-btn').filter({hasText:/Audio/}).click();await p.locator('input[aria-label="Volume"]').fill('42');assert.equal(await p.locator('.vol-label').textContent(),'42%');r.checks.push('Villa Nyon actual volume label');await p.locator('.device-screen').screenshot({path:path.join(out,'villa-gemini-audio.png')});
assert.equal(r.errors.length,0);r.status='passed';
}catch(e){r.status='failed';r.failure=e.stack;console.error(e);process.exitCode=1;}finally{fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(r,null,2));await b.close();}})();
