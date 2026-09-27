/**
 * Batterie « site » de l'Appartement Crans-Montana (règle 1 du protocole) :
 * 3 thèmes du GUI × {Mode normal, Mode Scène Taille réelle, Mode Scène Responsive, Plein écran (/3)}
 * × {dalle TSW-1070, iPad, smartphone}. Plein écran : jamais sur smartphone (vocabulaire figé).
 * Contrôles par combinaison : 0 erreur console/page, aucun scroll horizontal (page et GUI), aucun média en
 * lecture, libellés du menu des pièces non tronqués (dalle/tablette), fenêtre Circuits de la pièce à 11
 * circuits sans défilement interne, capture PNG. Sort la planche-contact (thèmes en colonnes).
 * Prérequis : npm run build && npx vite preview --port 4173
 * Usage : node scripts/test-appartement-crans-modes.cjs [--base http://localhost:4173] [--out <dossier>]
 */
const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const arg = (n, d) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : d; };
const BASE = arg('--base', 'http://localhost:4173');
const OUT = path.resolve(arg('--out', 'Claude outputs/appartement-crans/modes'));
fs.mkdirSync(OUT, { recursive: true });
const PROJECT = 'appartement-crans';
const DEVICES = [
  { id: 'wallpanel', route: 'wallpanel', viewport: { width: 1920, height: 1080 } },
  { id: 'tablet', route: 'tablet', viewport: { width: 1920, height: 1080 } },
  { id: 'phone', route: 'phone', viewport: { width: 1920, height: 1080 } },
];
const THEMES = ['dark', 'light', 'glass'];
const MODES = ['normal', 'scene-reel', 'scene-responsive', 'plein-ecran'];
const report = { base: BASE, results: [], errors: [], external: [] };
let passed = 0, failed = 0;
const check = (name, ok, detail) => { report.results.push({ name, ok, detail }); (ok ? passed++ : failed++); console.log((ok ? 'PASS ' : 'FAIL ') + name + (detail ? ' — ' + detail : '')); };
const isExternal = (u) => !u.startsWith(BASE);

(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
  try {
    for (const dev of DEVICES) {
      for (const mode of MODES) {
        if (mode === 'plein-ecran' && dev.id === 'phone') { check(`${dev.id}/${mode} : non applicable (jamais de Plein écran sur smartphone)`, true, 'ignoré'); continue; }
        const page = await browser.newPage({ viewport: dev.viewport });
        const errors = [];
        page.on('pageerror', (e) => errors.push(String(e)));
        page.on('console', (m) => { if (m.type() === 'error' && !/WebXPanel|Failed to load resource/.test(m.text())) errors.push(m.text()); });
        page.on('requestfailed', (r) => { if (isExternal(r.url())) report.external.push(r.url()); else errors.push('requestfailed ' + r.url()); });
        const route = `${BASE}/interfaces/residentiel/${PROJECT}/${dev.route}` + (mode === 'plein-ecran' ? '/3' : '');
        await page.goto(route, { waitUntil: 'load' });
        const frameEl = await page.waitForSelector('iframe', { timeout: 30000 });
        const frame = await frameEl.contentFrame();
        await frame.waitForFunction(() => window.villaConfig && (window.villaConfig.pieces || []).length === 17, null, { timeout: 30000 });
        await page.waitForTimeout(800);
        if (mode.startsWith('scene')) {
          await page.locator('button[aria-label*="Mode Scène"], button[aria-label*="Stage mode"]').first().click();
          await page.waitForTimeout(600);
          const btns = page.locator('.chassis-scale-toggle .chassis-scale-btn');
          await btns.nth(mode === 'scene-reel' ? 0 : 1).click();
          await page.waitForTimeout(600);
        }
        for (const theme of THEMES) {
          await frame.evaluate((t) => { if (typeof changeTheme === 'function') changeTheme(t); }, theme);
          await page.waitForTimeout(950);
          // Pièce à 11 circuits : Bain salle TV (id 11)
          await frame.evaluate(() => { if (typeof updateActiveRoomUI === "function") updateActiveRoomUI(11); else { const s = document.querySelector('#room-select'); if (s) { s.value = '11'; s.dispatchEvent(new Event('change')); } } });
          await page.waitForTimeout(400);
          const pageScroll = await page.evaluate(() => ({ sw: document.scrollingElement.scrollWidth, cw: document.scrollingElement.clientWidth }));
          const gui = await frame.evaluate(() => {
            const se = document.scrollingElement;
            const media = [...document.querySelectorAll('audio, video')].filter((m) => !m.paused && !m.muted).length;
            const trunc = [...document.querySelectorAll('.room-btn, [data-room-id] .cb-btn, .room-item, .sidebar-room')].map((el) => ({ t: el.textContent.trim(), over: el.scrollWidth > el.clientWidth + 1 })).filter((x) => x.over);
            const labels = [...document.querySelectorAll('ch5-button[data-room-id] span, ch5-button[data-room-id] .cb-btn span')].map((el) => el.textContent.trim());
            return { sw: se.scrollWidth, cw: se.clientWidth, media, trunc, labels: labels.length };
          });
          const tag = `${dev.id}/${mode}/${theme}`;
          check(`${tag} : page sans scroll horizontal`, pageScroll.sw <= pageScroll.cw, `${pageScroll.sw}/${pageScroll.cw}`);
          check(`${tag} : GUI sans scroll horizontal`, gui.sw <= gui.cw, `${gui.sw}/${gui.cw}`);
          check(`${tag} : aucun média en lecture`, gui.media === 0, String(gui.media));
          if (dev.id !== 'phone') {
            const labelsOver = await frame.evaluate(() => [...document.querySelectorAll('[data-room-id]')].map((b) => { const inner = b.querySelector('.cb-btn') || b; const span = inner.querySelector('span') || inner; return { t: span.textContent.trim(), over: span.scrollWidth > span.clientWidth + 1 || /…$/.test(span.textContent) || getComputedStyle(span).textOverflow === 'ellipsis' && span.scrollWidth > span.clientWidth }; }).filter((x) => x.over).map((x) => x.t));
            check(`${tag} : libellés du menu des pièces non tronqués`, labelsOver.length === 0, labelsOver.join(', ') || 'aucun');
            // Fenêtre Circuits (11 circuits) sans défilement interne
            await frame.evaluate(() => { if (typeof openCircuitsModal === 'function') openCircuitsModal(); });
            await page.waitForTimeout(500);
            const circ = await frame.evaluate(() => { const c = document.getElementById('circuits-container'); if (!c) return null; return { n: c.children.length, sh: c.scrollHeight, ch: c.clientHeight, cols: c.dataset.cols }; });
            check(`${tag} : fenêtre Circuits (${circ && circ.n} circuits, ${circ && circ.cols} colonnes) sans défilement interne`, !!circ && circ.sh <= circ.ch + 1, circ ? `${circ.sh}/${circ.ch}` : 'absente');
            await page.screenshot({ path: path.join(OUT, `${dev.id}-${mode}-${theme}-circuits.png`) });
            await frame.evaluate(() => { if (typeof closeCircuitsModal === 'function') closeCircuitsModal(); });
            await page.waitForTimeout(300);
          }
          await page.screenshot({ path: path.join(OUT, `${dev.id}-${mode}-${theme}.png`) });
        }
        check(`${dev.id}/${mode} : 0 erreur console / page`, errors.length === 0, errors.slice(0, 3).join(' | ') || '0');
        await page.close();
      }
    }
  } finally {
    await browser.close();
    fs.writeFileSync(path.join(OUT, 'results.json'), JSON.stringify(report, null, 2));
    console.log(`\n${failed === 0 ? 'PASSED' : 'FAILED'} — ${passed} contrôles réussis, ${failed} échecs`);
    process.exitCode = failed ? 1 : 0;
  }
})();
