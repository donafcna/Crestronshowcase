/**
 * La Réserve Genève — captures de la fiche du site (public/sheets/la-reserve-geneve/).
 *   node tools/captures-fiche.cjs <copie vitrine> <dossier de sortie>   puis   python3 scripts/helpers/png-1400-256.py
 * Dalle 1280 × 800 (gabarit du site) et iPhone 440 × 863, vitrine en feedback simulé.
 */
const { chromium } = require('playwright');
const http = require('node:http'); const fs = require('node:fs'); const path = require('node:path');
const ROOT = path.resolve(process.argv[2]); const OUT = path.resolve(process.argv[3]);
fs.mkdirSync(OUT, { recursive: true });
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.json': 'application/json' };
const server = http.createServer((q, r) => { const p = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(r); });
const SHOTS = [
  ['01-accueil', 'index.html', 'bar', 'lac', []],
  ['02-bar-sous-sol', 'index.html', 'bar', 'lac', [['.src', 0], ['.page-tabs button', 1], ['.vbtn.mute', 5]]],
  ['03-bar-rez', 'index.html', 'bar', 'nuit', [['.src', 1], ['.gbtn.dist', 1]]],
  ['04-fitness', 'index.html', 'fitness', 'spa', [['.src', 2], ['.gbtn.dist', 3]]],
  ['05-lodge', 'index.html', 'lodge', 'nuit', [['.src', 1], ['.gbtn.dist', 2]]],
  ['06-reglages', 'index.html', 'bar', 'lac', [['.settings', 0]]],
  ['07-confirmation', 'index.html', 'lodge', 'lac', [['.power-all', 0]]],
  ['08-attente', 'index.html', 'bar', 'spa', [['.power-all', 0], ['.shutdown', 0, 1300]]],
  ['09-iphone', 'iphone.html', 'bar', 'lac', [['.src', 0], ['.page-tabs button', 1]]],
];
(async () => {
  await new Promise(r => server.listen(0, r)); const B = `http://127.0.0.1:${server.address().port}/`;
  const br = await chromium.launch();
  for (const [name, page, esp, theme, clicks] of SHOTS) {
    const phone = page === 'iphone.html';
    const p = await br.newPage({ viewport: phone ? { width: 440, height: 863 } : { width: 1280, height: 800 } });
    await p.goto(`${B}${page}?espace=${esp}&theme=${theme}`); await p.waitForFunction(() => window.Reserve && window.Reserve.ready); await p.evaluate(() => document.fonts.ready);
    for (const [sel, i, wait] of clicks) { await p.evaluate(([s, k]) => document.querySelectorAll(s)[k].click(), [sel, i]); await p.waitForTimeout(wait || 150); }
    await p.waitForTimeout(300); await p.screenshot({ path: path.join(OUT, name + '.png') }); await p.close();
  }
  await br.close(); server.close(); console.log('captures : ' + SHOTS.length);
})();
