import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import { repoRoot } from './runtime-compatibility.mjs';
import { projects } from '../../apps/showcase/src/data/projects.js';
import { supportsDemoDevice } from '../../apps/showcase/src/components/demoCapabilities.js';
const require = createRequire(path.join(repoRoot,'projects/villa-crans/ch5/package.json'));
const { chromium } = require('playwright');
const arg = key => process.argv[process.argv.indexOf(key)+1];
const base = arg('--base'), before = process.argv.includes('--before') ? arg('--before') : null, out = path.resolve(arg('--out'));
if (!base || fs.existsSync(out)) throw new Error('Base et dossier de preuves neuf requis');
fs.mkdirSync(out,{recursive:true});
const browser = await chromium.launch({headless:true});
const results = [], errors = [];
const check = (name, test) => { assert.ok(test,name);results.push({name,status:'passed'}); };
try {
  for(const lang of ['fr','en','de']) for(const type of ['phone','tablet']) {
    const page = await browser.newPage({viewport:type==='phone'?{width:402,height:874}:{width:1180,height:820},locale:lang});
    page.on('pageerror',error=>errors.push(error.message));
    await page.goto(base+'/?lang='+lang+'#demo');
    await page.locator('.demo-project-card').first().waitFor();
    const expected=projects.filter(p=>supportsDemoDevice(p,type));
    check(lang+'/'+type+' catalogue filtré',await page.locator('.demo-project-card').count()===expected.length);
    check(lang+'/'+type+' pas de débordement horizontal',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    const unsupported=projects.find(p=>!supportsDemoDevice(p,type));
    await page.goto(base+'/?lang='+lang+'#demo/'+unsupported.id);
    await page.locator('.demo-unavailable').waitFor();
    check(lang+'/'+type+' lien non compatible expliqué',await page.locator('.demo-player-screen').count()===0 && (await page.locator('.demo-unavailable p').innerText()).length>30);
    check(lang+'/'+type+' navigation accessible',await page.locator('.demo-unavailable-action').evaluate(b=>b.getBoundingClientRect().height>=44));
    await page.screenshot({path:path.join(out,`after-${lang}-${type}.png`)});
    if(before){await page.goto(before+'/?lang='+lang+'#demo/'+unsupported.id);await page.locator('.demo-player-screen').waitFor();await page.waitForTimeout(500);await page.screenshot({path:path.join(out,`before-${lang}-${type}.png`)});}
    await page.goto(base+'/?lang='+lang+'#demo/does-not-exist');
    await page.locator('.demo-unavailable').waitFor();
    check(lang+'/'+type+' lien inconnu traité',await page.locator('.demo-player-screen').count()===0);
    await page.goto(base+'/?lang='+lang+'#demo/villa-leman');
    await page.locator('.vl-root, .villa-leman, .vl-ui, .demo-player-screen button').first().waitFor();
    check(lang+'/'+type+' commandes tactiles démo',await page.locator('.demo-ctrl-btn').evaluateAll(bs=>bs.every(b=>{const r=b.getBoundingClientRect();return r.width>=44&&r.height>=44;})));
    await page.locator('.demo-ctrl-btn').last().click();
    check(lang+'/'+type+' bascule autorisée conservée',await page.locator('.demo-player-screen').count()===1);
    await page.locator('.demo-ctrl-btn').first().click();
    await page.locator('.demo-project-grid').waitFor();
    check(lang+'/'+type+' retour au catalogue',await page.locator('.demo-player').count()===0);
    await page.close();
  }
  check('aucune erreur JavaScript',errors.length===0);
} finally {
  await browser.close();
  fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({scope:'Mode démo seulement, thème propre fixe ; écrans des simulateurs inchangés',createdAt:new Date().toISOString(),results,errors},null,2));
}
console.log(JSON.stringify({checks:results.length,errors:errors.length}));
