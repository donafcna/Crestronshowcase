/* Banc autonome du fond 3D « Appartement Crans-Montana » (enveloppe résidence), sans le site React ni la GUI :
   sert public/ par un serveur statique, charge /plan3d/plan3d.js sur une page minimale et pilote l'API.
   Sortie : Claude outputs/appartement-crans-3d/ (captures + test-results.json). Playwright via NODE_PATH.
   Variables : TEST_OUTPUT, PORT, GPU=1 (accélération réelle au lieu de SwiftShader). */
const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const pub = path.join(root, 'public');
const out = process.env.TEST_OUTPUT || path.join(root, 'Claude outputs', 'appartement-crans-3d');
fs.mkdirSync(out, { recursive: true });
const VERSION = '2026-09-27-residence-1';
const MIME = { '.js': 'text/javascript', '.json': 'application/json', '.webp': 'image/webp', '.html': 'text/html', '.png': 'image/png', '.css': 'text/css' };
const page_html = `<!doctype html><html><head><meta charset="utf-8"><title>Plan 3D banc</title>
<style>html,body{margin:0;height:100%;background:#0b1020}canvas{display:block;width:100vw;height:100vh}</style></head>
<body><canvas id="c"></canvas><script type="module">
const [config, mod] = await Promise.all([fetch('/plan3d/appartement-crans.json').then(r => r.json()), import('/plan3d/plan3d.js?v=${VERSION}')]);
window.__plan3d = mod.createPlan3D({ canvas: document.getElementById('c'), config });
window.__plan3d.setWindow({ x: 0, y: 0, w: innerWidth, h: innerHeight });
window.__ready = true;
</script></body></html>`;
const server = http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  if (url === '/' || url === '/banc.html') { res.writeHead(200, { 'content-type': 'text/html' }); res.end(page_html); return; }
  const file = path.join(pub, url);
  if (!file.startsWith(pub) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
(async () => {
  const port = Number(process.env.PORT || 4321);
  await new Promise((r) => server.listen(port, '127.0.0.1', r));
  const args = process.env.GPU === '1' ? ['--enable-gpu'] : ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];
  const browser = await chromium.launch({ headless: true, args });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const errors = [], report = { version: VERSION, checks: [], screenshots: [], metrics: {} };
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.type() + ': ' + m.text()); });
  const check = (label, value) => { assert.ok(value, label); report.checks.push(label); console.log('PASS ' + label); };
  const frames = async (n) => { await page.evaluate((n) => new Promise((r) => { let k = 0; const step = () => (++k >= n ? r() : requestAnimationFrame(step)); requestAnimationFrame(step); }), n); };
  const settle = async () => { await page.evaluate(() => window.__plan3d.jump()); await frames(3); await page.waitForFunction(() => Object.values(window.__plan3d.rooms).every((r) => !r.lightFade)); await frames(2); };
  const shot = async (name) => { await frames(2); await page.screenshot({ path: path.join(out, name + '.png') }); report.screenshots.push(name + '.png'); };
  try {
    await page.goto(`http://127.0.0.1:${port}/banc.html`);
    await page.waitForFunction(() => window.__ready && window.__plan3d, null, { timeout: 60000 });
    check('Moteur chargé, version ' + VERSION, await page.evaluate(() => window.__plan3d.version) === VERSION);
    await page.waitForFunction(() => window.__plan3d.metrics().renderedFrames > 5, null, { timeout: 60000 });
    await page.waitForTimeout(3000); await frames(10);   // textures WebP locales (chêne, pierre) chargées avant la première capture
    const m0 = await page.evaluate(() => window.__plan3d.metrics());
    report.metrics.overview = m0;
    check('Vue d\'ensemble : triangles > 0 (' + m0.triangles + ', ' + m0.drawCalls + ' appels)', m0.triangles > 0);
    check('Enveloppe résidence fermée au départ', await page.evaluate(() => window.__plan3d.navigation().phase === 'overview-closed' && window.__plan3d.navigation().walls === 1));
    const facade = await page.evaluate(() => window.__plan3d.environment().facade);
    check('Éclairage de façade présent (' + facade.sconces + ' appliques)', facade.sconces > 10);
    await page.evaluate(() => window.__plan3d.setDay(1)); await frames(4); await shot('overview-day');
    await page.evaluate(() => window.__plan3d.setDay(0)); await frames(4); await shot('overview-night');
    check('Façade allumée de nuit', (await page.evaluate(() => window.__plan3d.environment().facade.intensity)) > .9);
    await page.evaluate(() => window.__plan3d.setDay(1));
    const ids = await page.evaluate(() => Object.keys(window.__plan3d.rooms).map(Number));
    check('17 pièces construites', ids.length === 17);
    // Vue éclatée : capture pendant la phase de réassemblage, explosion encore complète.
    await page.evaluate(() => window.__plan3d.setRoom(1)); await settle();
    check('Pièce 1 zoomée, enveloppe effacée', await page.evaluate(() => window.__plan3d.activeRoom() === 1 && window.__plan3d.navigation().walls === 0 && window.__plan3d.navigation().phase === 'room'));
    await page.evaluate(() => window.__plan3d.overview());
    await page.waitForFunction(() => window.__plan3d.navigation().phase === 'assembling', null, { timeout: 30000 });
    await shot('overview-exploded');
    await settle();
    check('Retour vue fermée', await page.evaluate(() => window.__plan3d.navigation().phase === 'overview-closed'));
    const captures = { 1: 'salon', 4: 'entree', 8: 'sdb-principale', 12: 'hall-escalier', 6: 'buanderie', 5: 'wc', 3: 'cuisine', 17: 'terrasse' };
    for (const id of ids) {
      await page.evaluate((id) => { const a = window.__plan3d; a.setRoom(id); a.setCircuit(id, 0, 1); a.setCircuit(id, 1, .7); a.setCircuit(id, 2, .6); if (a.rooms[id].tv) a.setVideoSource(id, 1); }, id);
      await settle();
      const state = await page.evaluate((id) => { const a = window.__plan3d, R = a.rooms[id]; return { active: a.activeRoom(), phase: a.navigation().phase, tv: !!R.tv, speakers: R.speakers.length, hvac: !!R.hvac, shades: Object.keys(R.shades || {}), daylight: a.daylight(), type: R.cfg.type, nom: R.cfg.nom }; }, id);
      report.metrics['room' + id] = state;
      check(`Pièce ${id} ${state.nom} (${state.type}) : zoom actif, TV=${state.tv}, enceintes=${state.speakers}, moteurs=${state.shades.join('/') || 'aucun'}`, state.active === id && state.phase === 'room');
      if (captures[id]) await shot('room-' + id + '-' + captures[id]);
    }
    check('Salle à manger et cuisine sans TV mais avec enceintes', report.metrics.room2.tv === false && report.metrics.room2.speakers > 0 && report.metrics.room3.tv === false && report.metrics.room3.speakers > 0);
    check('Cinq pièces avec TV (sept AV dont deux en enceintes seules)', ids.filter((id) => report.metrics['room' + id].tv).length === 5);
    check('Pièces intérieures sans lumière du jour', [4, 5, 6, 11, 12, 16].every((id) => report.metrics['room' + id].shades.length === 0));
    // Occultations du salon.
    await page.evaluate(() => window.__plan3d.setRoom(1)); await settle();
    await page.evaluate(() => { for (const k of ['rideau', 'store']) window.__plan3d.shadePos(k, 1); }); await frames(3);
    check('Rideaux + voilage fermés : lumière du jour réduite', (await page.evaluate(() => window.__plan3d.daylight())) < .1);
    await page.evaluate(() => { for (const k of ['rideau', 'store']) window.__plan3d.shadePos(k, 0); });
    await frames(20);
    report.metrics.room = await page.evaluate(() => window.__plan3d.metrics());
    check('Aucune erreur console ni exception (' + errors.length + ')', errors.length === 0);
    report.status = 'passed';
  } catch (e) {
    report.status = 'failed'; report.failure = e.stack; await page.screenshot({ path: path.join(out, 'failure.png') }).catch(() => {});
    throw e;
  } finally {
    report.errors = errors;
    fs.writeFileSync(path.join(out, 'test-results.json'), JSON.stringify(report, null, 2));
    await browser.close(); server.close();
  }
})();
