/**
 * Batterie « site » de La Réserve Genève (règle 1 du protocole) :
 * 3 thèmes du GUI × {Mode normal, Mode Scène Taille réelle, Mode Scène Responsive, Plein écran (/3)}
 * × {dalle TSW-1070, iPad, smartphone}. Plein écran : jamais sur smartphone (vocabulaire figé).
 * Contrôles par combinaison : 0 erreur console/page, aucun scroll horizontal (page et GUI), aucun média en
 * lecture, nom de l'hôtel non tronqué, page Sous-sol du Bar (8 zones) sans débordement, capture PNG.
 * La batterie écran par écran du GUI est projects/la-reserve-geneve/ch5/tools/qa-reserve.cjs.
 * Prérequis : npm run build && npx vite preview --port 4173
 * Usage : node scripts/test-showroom-ftv-nyon-modes.cjs [--base http://localhost:4173] [--out <dossier>]
 */
const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const arg = (n, d) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : d; };
const BASE = arg('--base', 'http://localhost:4173');
const OUT = path.resolve(arg('--out', 'Claude outputs/la-reserve-geneve/modes'));
fs.mkdirSync(OUT, { recursive: true });
const PROJECT = 'la-reserve-geneve';
const DEVICES = [
  { id: 'wallpanel', route: 'wallpanel' },
  { id: 'tablet', route: 'tablet' },
  { id: 'phone', route: 'phone' },
];
const THEMES = ['lac', 'nuit', 'spa'];
const MODES = ['normal', 'scene-reel', 'scene-responsive', 'plein-ecran'];
let passed = 0, failed = 0;
const results = [];
const check = (name, ok, detail) => { results.push({ name, ok, detail }); if (ok) passed++; else failed++; console.log((ok ? 'PASS ' : 'FAIL ') + name + (detail ? ' — ' + detail : '')); };

(async () => {
  const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  try {
    for (const dev of DEVICES) {
      for (const mode of MODES) {
        if (mode === 'plein-ecran' && dev.id === 'phone') { check(`${dev.id}/${mode} : non applicable (jamais de Plein écran sur smartphone)`, true, 'ignoré'); continue; }
        const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
        const errors = [];
        page.on('pageerror', (e) => errors.push(String(e)));
        page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(m.text()); });
        // Vidéo de fond du site : Chromium sans codec H.264 abandonne la requête (net::ERR_ABORTED), ce n'est pas une erreur du GUI.
        page.on('requestfailed', (r) => { if (r.url().startsWith(BASE) && !(/\.mp4$/.test(r.url()) && /ABORTED/.test((r.failure() || {}).errorText || ''))) errors.push('requestfailed ' + r.url() + ' ' + ((r.failure() || {}).errorText || '')); });
        await page.goto(`${BASE}/interfaces/hotellerie/${PROJECT}/${dev.route}` + (mode === 'plein-ecran' ? '/3' : ''), { waitUntil: 'load' });
        const frameEl = await page.waitForSelector('iframe', { timeout: 30000 });
        const frame = await frameEl.contentFrame();
        await frame.waitForFunction(() => window.Reserve && window.Reserve.ready, null, { timeout: 30000 });
        await page.waitForTimeout(800);
        if (mode.startsWith('scene')) {
          await page.locator('button[aria-label*="Mode Scène"], button[aria-label*="Stage mode"]').first().click();
          await page.waitForTimeout(600);
          await page.locator('.chassis-scale-toggle .chassis-scale-btn').nth(mode === 'scene-reel' ? 0 : 1).click();
          await page.waitForTimeout(600);
        }
        for (const theme of THEMES) {
          await frame.evaluate((t) => window.changeTheme(t), theme);
          await frame.evaluate(() => { window.Reserve.go('home'); document.querySelector('.src').click(); const t = document.querySelectorAll('.page-tabs button'); if (t[1]) t[1].click(); });
          await page.waitForTimeout(500);
          const tag = `${dev.id}/${mode}/${theme}`;
          const pageScroll = await page.evaluate(() => ({ sw: document.scrollingElement.scrollWidth, cw: document.scrollingElement.clientWidth }));
          const gui = await frame.evaluate(() => {
            const se = document.scrollingElement, w = document.querySelector('.top .wordmark'), g = document.querySelector('.groups');
            const app = document.getElementById('app').getBoundingClientRect(), last = [...document.querySelectorAll('.group')].pop().getBoundingClientRect();
            return { sw: se.scrollWidth, cw: se.clientWidth, media: [...document.querySelectorAll('audio, video')].filter((m) => !m.paused).length,
              title: w ? w.scrollWidth <= w.clientWidth + 1 : false, fit: !!g && g.scrollHeight <= g.clientHeight + 1 && last.bottom <= app.bottom + 1, zones: document.querySelectorAll('[data-zone]').length };
          });
          check(`${tag} : page sans scroll horizontal`, pageScroll.sw <= pageScroll.cw, `${pageScroll.sw}/${pageScroll.cw}`);
          check(`${tag} : GUI sans scroll horizontal`, gui.sw <= gui.cw, `${gui.sw}/${gui.cw}`);
          check(`${tag} : aucun média en lecture`, gui.media === 0, String(gui.media));
          check(`${tag} : nom « La Réserve » entier`, gui.title);
          check(`${tag} : Bar Sous-sol (${gui.zones} zones) sans défilement ni débordement`, gui.fit && gui.zones === 8);
          await page.screenshot({ path: path.join(OUT, `${dev.id}-${mode}-${theme}.png`) });
          await frame.evaluate(() => window.Reserve.go('home'));
        }
        check(`${dev.id}/${mode} : 0 erreur console / page`, errors.length === 0, errors.slice(0, 3).join(' | ') || '0');
        await page.close();
      }
    }
  } finally {
    await browser.close();
    fs.writeFileSync(path.join(OUT, 'results.json'), JSON.stringify({ base: BASE, passed, failed, results }, null, 2));
    console.log(`\n${failed === 0 ? 'PASSED' : 'FAILED'} — ${passed} contrôles réussis, ${failed} échecs`);
    process.exitCode = failed ? 1 : 0;
  }
})();
