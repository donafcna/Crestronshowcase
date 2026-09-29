/**
 * Captures de la fiche « Appartement Crans-Montana » — interface Connect (v5.4, 29.09.2026).
 * Capture de `.device-screen` des routes du site (dalle, tablette, smartphone), GUI pilotée à travers
 * l'iframe (API ConnectUI + clics sur les boutons de l'interface) pour montrer un état parlant.
 *
 * Prérequis : npm run build && npx vite preview --port 4173
 * Usage     : node scripts/shoot-appartement-crans.cjs [--base http://localhost:4173] [--out <dossier brut>]
 * Puis      : python3 scripts/helpers/png-1400-256.py <dossier brut> public/sheets/appartement-crans
 */
const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');

const arg = (n, d) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : d; };
const BASE = arg('--base', 'http://localhost:4173');
const OUT = path.resolve(arg('--out', 'public/sheets/appartement-crans'));
const PROJECT = 'appartement-crans';
fs.mkdirSync(OUT, { recursive: true });

const guiFrame = page => page.frames().find(f => /\/showcases\/appartement-crans\/(index|iphone)\.html/.test(f.url()));
// Geste réel (isTrusted) sur la scène : maintient la démo automatique en pause.
const holdDemo = async page => {
  const r = await page.evaluate(() => { const b = document.querySelector('.device-stage').getBoundingClientRect(); return [b.left + 5, b.top + 5]; });
  await page.mouse.click(r[0], r[1]);
};
async function openDevice(page, device) {
  await page.goto(`${BASE}/interfaces/residentiel/${PROJECT}/${device}`, { waitUntil: 'load' });
  await page.waitForFunction(() => { const w = document.querySelector('iframe')?.contentWindow; return w?.Villa?.ready && w?.ConnectUI?.active(); }, null, { timeout: 60000 });
  await holdDemo(page);
  await page.waitForTimeout(600);
  return guiFrame(page);
}
async function shoot(page, name) {
  await holdDemo(page);
  await page.waitForTimeout(800);
  const box = await page.evaluate(() => { const r = document.querySelector('.device-screen').getBoundingClientRect(); return { x: r.left, y: r.top, width: r.width, height: r.height }; });
  await page.screenshot({ path: path.join(OUT, name + '.png'), clip: box, animations: 'disabled', timeout: 120000 });
  console.log('capture', name);
}
const ui = (frame, fn, arg) => frame.evaluate(fn, arg);
const tap = (frame, sel) => frame.evaluate(s => { const el = document.querySelector('#cx-root ' + s); if (el) el.click(); return !!el; }, sel);
const theme = (frame, t) => frame.evaluate(x => window.changeTheme(x), t);
const scrollMain = (frame, y) => frame.evaluate(v => { const m = document.querySelector('#cx-root .cx-main'); if (m) m.scrollTop = v; }, y);

(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
  // Viewport large + DPR 2 : captures nettes (1400 px après réduction), comme la fiche précédente.
  const page = await browser.newPage({ viewport: { width: 2300, height: 1400 }, deviceScaleFactor: 2 });

  const ONLY = arg('--only', null);
  let f;
  if (ONLY !== 'phone') {
  // ---- Dalle TSW-1070 ----
  f = await openDevice(page, 'wallpanel');
  await theme(f, 'light');
  await ui(f, () => window.ConnectUI.openRoom(1)); await tap(f, '[data-cx-scene="2"]');
  await shoot(page, '01-pieces-salon');
  await ui(f, () => window.ConnectUI.openRoom(7)); await tap(f, '[data-cx-scene="3"]');
  await shoot(page, '02-ambiance-suite');
  await theme(f, 'dark');
  await ui(f, () => window.ConnectUI.openRoom(11)); await tap(f, '[data-cx-scene="2"]');
  await shoot(page, '03-bain-onze-circuits');
  await theme(f, 'light');
  await ui(f, () => window.ConnectUI.openRoom(1)); await scrollMain(f, 400);
  await shoot(page, '04-stores-climat-salon');
  await ui(f, () => window.ConnectUI.setTab('shades'));
  await shoot(page, '05-onglet-stores');
  await ui(f, () => window.ConnectUI.setTab('climate'));
  await shoot(page, '06-onglet-climat');
  await ui(f, () => window.ConnectUI.setTab('scenes')); await tap(f, '[data-cx-global="407"]');
  await shoot(page, '07-scenes-globales');
  await ui(f, () => window.ConnectUI.setTab('settings'));
  await shoot(page, '08-reglages');
  await theme(f, 'glass');
  await ui(f, () => window.ConnectUI.openRoom(15)); await tap(f, '[data-cx-scene="3"]');
  await shoot(page, '09-theme-verre');

  // ---- Tablette ----
  f = await openDevice(page, 'tablet');
  await theme(f, 'light');
  await ui(f, () => window.ConnectUI.openRoom(13)); await tap(f, '[data-cx-scene="2"]');
  await shoot(page, '10-tablette-chambre-twin');
  }

  // ---- Smartphone ----
  f = await openDevice(page, 'phone');
  await theme(f, 'light');
  await ui(f, () => window.ConnectUI.setTab('rooms'));
  await shoot(page, '11-iphone-pieces');
  await ui(f, () => window.ConnectUI.openRoom(1)); await tap(f, '[data-cx-scene="3"]');
  await shoot(page, '12-iphone-salon');

  await browser.close();
})();
