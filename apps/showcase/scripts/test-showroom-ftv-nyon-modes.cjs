/**
 * Batterie « site » du Showroom FTV Nyon (règle 1 du protocole) :
 * 3 thèmes du GUI × {Mode normal, Mode Scène Taille réelle, Mode Scène Responsive, Plein écran (/3)}
 * × {dalle TSW-1070, iPad, smartphone}. Plein écran : jamais sur smartphone (vocabulaire figé).
 * Contrôles par combinaison : 0 erreur console/page, aucun scroll horizontal (page et GUI), aucun média en
 * lecture, titre de pièce non tronqué, fenêtre Lights de la pièce à 13 circuits sans défilement (dalle/tablette),
 * capture PNG. La batterie écran par écran du GUI est projects/showroom-ftv-nyon/ch5/tools/qa-showroom.cjs.
 * Prérequis : npm run build && npx vite preview --port 4173
 * Usage : node scripts/test-showroom-ftv-nyon-modes.cjs [--base http://localhost:4173] [--out <dossier>]
 */
const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const arg = (n, d) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : d; };
const BASE = arg('--base', 'http://localhost:4173');
const OUT = path.resolve(arg('--out', 'Claude outputs/showroom-ftv-nyon/modes'));
fs.mkdirSync(OUT, { recursive: true });
const PROJECT = 'showroom-ftv-nyon';
const DEVICES = [
  { id: 'wallpanel', route: 'wallpanel' },
  { id: 'tablet', route: 'tablet' },
  { id: 'phone', route: 'phone' },
];
const THEMES = ['dark', 'light', 'glass'];
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
        await page.goto(`${BASE}/interfaces/boutique/${PROJECT}/${dev.route}` + (mode === 'plein-ecran' ? '/3' : ''), { waitUntil: 'load' });
        const frameEl = await page.waitForSelector('iframe', { timeout: 30000 });
        const frame = await frameEl.contentFrame();
        await frame.waitForFunction(() => window.Showroom && window.Showroom.ready, null, { timeout: 30000 });
        await page.waitForTimeout(800);
        if (mode.startsWith('scene')) {
          await page.locator('button[aria-label*="Mode Scène"], button[aria-label*="Stage mode"]').first().click();
          await page.waitForTimeout(600);
          await page.locator('.chassis-scale-toggle .chassis-scale-btn').nth(mode === 'scene-reel' ? 0 : 1).click();
          await page.waitForTimeout(600);
        }
        for (const theme of THEMES) {
          await frame.evaluate((t) => window.changeTheme(t), theme);
          await frame.evaluate(() => window.Showroom.openRoom(5));
          await page.waitForTimeout(500);
          const tag = `${dev.id}/${mode}/${theme}`;
          const pageScroll = await page.evaluate(() => ({ sw: document.scrollingElement.scrollWidth, cw: document.scrollingElement.clientWidth }));
          const gui = await frame.evaluate(() => {
            const se = document.scrollingElement, h1 = document.querySelector('.title-block h1');
            return { sw: se.scrollWidth, cw: se.clientWidth, media: [...document.querySelectorAll('audio, video')].filter((m) => !m.paused).length,
              title: h1 ? h1.scrollWidth <= h1.clientWidth + 1 : false };
          });
          check(`${tag} : page sans scroll horizontal`, pageScroll.sw <= pageScroll.cw, `${pageScroll.sw}/${pageScroll.cw}`);
          check(`${tag} : GUI sans scroll horizontal`, gui.sw <= gui.cw, `${gui.sw}/${gui.cw}`);
          check(`${tag} : aucun média en lecture`, gui.media === 0, String(gui.media));
          check(`${tag} : titre « Showroom Bang & Olufsen » entier`, gui.title);
          await page.screenshot({ path: path.join(OUT, `${dev.id}-${mode}-${theme}.png`) });
          await frame.evaluate(() => window.Showroom.openSheet('lights'));
          await page.waitForTimeout(400);
          const c = await frame.evaluate(() => { const b = document.querySelector('.sheet-body'); return b ? { sh: b.scrollHeight, ch: b.clientHeight, n: document.querySelectorAll('.circuit').length } : null; });
          const phone = dev.id === 'phone';
          check(`${tag} : fenêtre Lights (${c && c.n} circuits) ${phone ? 'défilement autorisé (exception Circuits)' : 'sans défilement'}`, !!c && (phone || c.sh <= c.ch + 1), c ? `${c.sh}/${c.ch}` : 'absente');
          await page.screenshot({ path: path.join(OUT, `${dev.id}-${mode}-${theme}-lights.png`) });
          await frame.evaluate(() => window.Showroom.go('home'));
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
