/**
 * Planche-contact avant / après (règle 2 du protocole) : écrans touchés par un lot Core, thèmes en colonnes.
 * Avant = site de référence (ex. worktree du commit de départ, port 4174), après = site courant (port 4173).
 * Usage : node scripts/planche-avant-apres.cjs --before http://localhost:4174 --after http://localhost:4173 \
 *         --project villa-gemini-frequencetv --out "Claude outputs/<dossier>"
 */
const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const arg = (n, d) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : d; };
const BEFORE = arg('--before', 'http://localhost:4174'), AFTER = arg('--after', 'http://localhost:4173');
const PROJECT = arg('--project', 'villa-gemini-frequencetv');
const OUT = path.resolve(arg('--out', 'Claude outputs/planche'));
fs.mkdirSync(OUT, { recursive: true });
const THEMES = ['dark', 'light', 'glass'];
const SCREENS = [
  { id: 'dalle-page', file: 'index.html', vp: { width: 1280, height: 800 }, prep: async () => {} },
  { id: 'dalle-circuits', file: 'index.html', vp: { width: 1280, height: 800 }, prep: async (f) => { await f.evaluate(() => openCircuitsModal()); } },
  { id: 'phone-page', file: 'iphone.html', vp: { width: 440, height: 863 }, prep: async () => {} },
];
(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
  const { PNG } = require('pngjs');
  const cells = [];
  for (const [label, base] of [['avant', BEFORE], ['apres', AFTER]]) {
    for (const s of SCREENS) {
      const page = await browser.newPage({ viewport: s.vp });
      let ok = true;
      try {
        await page.goto(`${base}/showcases/${PROJECT}/${s.file}`, { waitUntil: 'load' });
        await page.waitForFunction(() => window.villaConfig && window.villaConfig.pieces, null, { timeout: 30000 });
        await page.waitForTimeout(700);
        await s.prep(page);
        await page.waitForTimeout(400);
      } catch (e) { ok = false; console.log('skip', label, s.id, String(e).slice(0, 80)); }
      for (const t of THEMES) {
        const file = path.join(OUT, `${label}-${s.id}-${t}.png`);
        if (ok) { await page.evaluate((th) => { if (typeof changeTheme === 'function') changeTheme(th); }, t); await page.waitForTimeout(950); await page.screenshot({ path: file }); }
        cells.push({ label, screen: s.id, theme: t, file: ok ? file : null, w: s.vp.width, h: s.vp.height });
      }
      await page.close();
    }
  }
  await browser.close();
  // Grille : lignes = avant/après × écran, colonnes = thèmes ; largeur de cellule 640 px
  const CW = 640, PAD = 12, LABEL = 22;
  const rows = [];
  for (const label of ['avant', 'apres']) for (const s of SCREENS) rows.push({ label, s });
  const rowH = rows.map(({ s }) => Math.round(s.vp.height * CW / s.vp.width) + LABEL + PAD);
  const H = rowH.reduce((a, b) => a + b, 0) + PAD, W = THEMES.length * (CW + PAD) + PAD;
  const out = new PNG({ width: W, height: H });
  out.data.fill(255);
  const blit = (src, dx, dy, dw, dh) => {
    for (let y = 0; y < dh; y++) for (let x = 0; x < dw; x++) {
      const sx = Math.floor(x * src.width / dw), sy = Math.floor(y * src.height / dh);
      const si = (sy * src.width + sx) * 4, di = ((dy + y) * W + dx + x) * 4;
      out.data[di] = src.data[si]; out.data[di + 1] = src.data[si + 1]; out.data[di + 2] = src.data[si + 2]; out.data[di + 3] = 255;
    }
  };
  let y = PAD;
  rows.forEach(({ label, s }, ri) => {
    THEMES.forEach((t, ci) => {
      const cell = cells.find((c) => c.label === label && c.screen === s.id && c.theme === t);
      const x = PAD + ci * (CW + PAD);
      if (cell && cell.file) { const png = PNG.sync.read(fs.readFileSync(cell.file)); blit(png, x, y + LABEL, CW, rowH[ri] - LABEL - PAD); }
    });
    y += rowH[ri];
  });
  const grid = path.join(OUT, `planche-${PROJECT}.png`);
  fs.writeFileSync(grid, PNG.sync.write(out));
  fs.writeFileSync(path.join(OUT, 'planche-legende.txt'), 'Colonnes : ' + THEMES.join(' | ') + '\nLignes : ' + rows.map((r) => r.label + ' / ' + r.s.id).join(', ') + '\n');
  console.log('Planche :', grid);
})();
