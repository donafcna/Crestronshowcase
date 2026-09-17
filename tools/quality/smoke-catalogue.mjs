import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { projects, devices } from '../../apps/showcase/src/data/projects.js';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const require = createRequire(path.join(repo, 'projects/villa-crans/ch5/package.json'));
const { chromium } = require('playwright');
const arg = key => { const i = process.argv.indexOf(key); return i < 0 ? null : process.argv[i + 1]; };
const base = arg('--base') || 'http://127.0.0.1:4292', out = arg('--out');
if (!out || fs.existsSync(out)) throw new Error('--out doit nommer un nouveau dossier de preuves');
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ headless: true });
const report = { startedAt: new Date().toISOString(), base, scope: 'Chargement catalogue et démo ; ce test ne remplace pas la recette thèmes/modales/contraste/matériel', cases: [] };
try {
  for (const project of projects.filter(p => p.isInteractive)) {
    const supported = [...new Set(project.devices.map(id => devices.find(d => d.id === id)?.viewport))];
    const chassis = ['wallpanel', 'tablet', 'desktop', 'phone'].find(d => supported.includes(d));
    const mobile = ['tablet', 'phone'].find(d => supported.includes(d));
    const routes = [{ mode: 'showcase', url: `${base}/interfaces/${project.sectors[0]}/${project.id}/${chassis}`, selector: '.device-screen', device: chassis }];
    if (mobile) routes.push({ mode: 'demo', url: `${base}/#demo/${project.id}`, selector: '.demo-player-screen', device: mobile });
    for (const route of routes) {
      const page = await browser.newPage({ viewport: route.device === 'phone' ? { width: 402, height: 874 } : { width: 1440, height: 1000 } });
      const item = { project: project.id, mode: route.mode, device: route.device, url: route.url, errors: [], status: 'failed' };
      page.on('pageerror', e => item.errors.push(e.message));
      try {
        await page.goto(route.url, { waitUntil: 'domcontentloaded' });
        const screen = page.locator(route.selector).first();
        await screen.waitFor({ state: 'visible', timeout: 15000 });
        await page.waitForFunction(selector => { const e = document.querySelector(selector); return !!e && !e.querySelector('.simulator-loading') && e.innerText.trim().length > 20; }, route.selector, { timeout: 15000 });
        item.textLength = (await screen.innerText()).trim().length;
        item.controls = await screen.locator('button,input,[role=button]').count();
        await page.waitForTimeout(150);
        if (!item.controls || item.errors.length) throw new Error('GUI vide, sans contrôle ou exception JavaScript');
        item.status = 'passed';
        if (['villa-leman', 'yacht-monaco', 'hotel-geneva', 'boutique-hermes'].includes(project.id) && route.mode === 'showcase') await page.screenshot({ path: path.join(out, project.id + '.png') });
      } catch (e) { item.failure = e.message; await page.screenshot({ path: path.join(out, project.id + '-' + route.mode + '-failure.png') }); }
      finally { await page.close(); }
      report.cases.push(item); console.log(item.status.toUpperCase() + ' ' + item.project + '/' + item.mode);
    }
  }
} finally {
  await browser.close();
  report.finishedAt = new Date().toISOString();
  report.passed = report.cases.filter(c => c.status === 'passed').length;
  report.failed = report.cases.filter(c => c.status === 'failed').length;
  fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify(report, null, 2));
  process.exitCode = report.failed ? 1 : 0;
}
