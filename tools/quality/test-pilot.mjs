import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { repoRoot } from './runtime-compatibility.mjs';
const require=createRequire(path.join(repoRoot,'projects/villa-crans/ch5/package.json'));
const {chromium}=require('playwright');
const arg=k=>process.argv[process.argv.indexOf(k)+1];
const base=arg('--base'),out=path.resolve(arg('--out'));
if(!base||fs.existsSync(out))throw new Error('Base et sortie neuve requises');
fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true}),checks=[],errors=[];
const check=(name,value)=>{assert.ok(value,name);checks.push({name,status:'passed'});};
try {
 for(const [file,device,width,height] of [['index.html','wall',1280,800],['index.html','tablet',1180,820],['iphone.html','phone',402,874]]) {
  const page=await browser.newPage({viewport:{width,height}});
  page.on('pageerror',e=>errors.push(e.message));
  // Test hors matériel : bloque le transport, sans remplacer les retours par un simulateur.
  await page.route('**/*',r=>new URL(r.request().url()).origin===new URL(base).origin?r.continue():r.abort());
  await page.route('**/js/webxpanel.js',r=>r.fulfill({contentType:'text/javascript',body:''}));
  await page.goto(base+'/'+file);
  await page.waitForFunction(()=>window.villaConfig?.pieces?.length===2&&typeof window.changeTheme==='function');
  await page.waitForTimeout(600);
  check(device+' mode déploiement et deux pièces',await page.evaluate(()=>villaConfig.meta.mode==='deploiement'&&villaConfig.pieces.map(p=>p.nom).join(',')==='Salon,Cuisine'));
  check(device+' absence de simulation locale',await page.evaluate(()=>!window.Villa));
  if(device==='phone')check('sélecteur téléphone construit depuis le profil',await page.locator('#room-select option').count()===2);
  else check(device+' menu construit depuis le profil',await page.locator('#rooms-container [data-room-id]').count()===2);
  for(const theme of ['dark','light','glass']) {
    await page.evaluate(t=>window.changeTheme(t),theme);await page.waitForTimeout(900);
    if(device==='phone'){await page.evaluate(()=>window.switchTab('hvac'));await page.waitForTimeout(100);}
    const controls=await page.evaluate(()=>{
      const card=document.querySelector('#card-cvc')||document.querySelector('#panel-hvac');
      const area=card.getBoundingClientRect();
      return [...card.querySelectorAll('[data-climate-panel="hvac"] .hvac-row .cb-btn')].map(b=>{
        const r=b.getBoundingClientRect();
        return {width:r.width,height:r.height,contained:r.top>=area.top&&r.bottom<=area.bottom&&r.left>=area.left&&r.right<=area.right,hit:document.elementFromPoint(r.x+r.width/2,r.bottom-2)?.closest('.cb-btn')===b};
      });
    });
    check(device+'/'+theme+' six commandes HVAC visibles et tactiles',controls.length===6&&controls.every(c=>c.width>=40&&c.height>=44&&c.contained&&c.hit));
    check(device+'/'+theme+' pas de débordement page',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1&&document.documentElement.scrollHeight<=innerHeight+1));
    await page.screenshot({path:path.join(out,device+'-'+theme+'.png')});
  }
  await page.close();
 }
 check('aucune erreur JavaScript',errors.length===0);
} finally {await browser.close();fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({scope:'Chargement du profil deux pièces et trois thèmes ; transport neutralisé, pas de preuve de feedback ou routage matériel',checks,errors},null,2));}
console.log(JSON.stringify({checks:checks.length,errors:errors.length}));
