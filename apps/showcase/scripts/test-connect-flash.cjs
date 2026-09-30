/**
 * Contrôle « aucun flash du GUI d'origine » des interfaces Connect (Core v5.5, 29.09.2026).
 * Depuis la page du site, un script d'initialisation compte, image par image dès le premier rendu, les
 * éléments du Core visibles (ch5-button / ch5-slider / #room-select de largeur > 0) avant et après
 * l'apparition de #cx-root. Attendu : 0 image avec le Core visible, sur dalle, tablette et smartphone.
 * Usage : node scripts/test-connect-flash.cjs [--base http://localhost:4173] [--project appartement-crans]
 */
const { chromium } = require('playwright');
const arg = (n, d) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : d; };
const BASE = arg('--base', 'http://localhost:4173'), PROJECT = arg('--project', 'appartement-crans');
let failed = 0;
(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
  for (const dev of ['wallpanel', 'tablet', 'phone']) for (const pass of [1, 2]) {
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
    // Observation depuis la page du site (même origine) : à chaque image du parent, lecture du
    // document de l'iframe du GUI dès qu'il existe.
    await page.addInitScript(() => {
      if (window.top !== window) return;
      const log = window.__flash = { frames: 0, core: 0, cx: 0 };
      const tick = () => {
        const fr = document.querySelector('iframe'); let d = null;
        try { d = fr && fr.contentDocument; } catch (e) { d = null; }
        if (d && d.body && /\/showcases\//.test(d.location.pathname)) {
          log.frames++;
          if (d.getElementById('cx-root')) log.cx++;
          const w = fr.contentWindow;
          const vis = [...d.querySelectorAll('ch5-button, ch5-slider, #room-select, .room-selector-btn')].some(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && w.getComputedStyle(e).visibility !== 'hidden'; });
          if (vis) log.core++;
        }
        if (log.frames < 600) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    await page.goto(`${BASE}/interfaces/residentiel/${PROJECT}/${dev}`, { waitUntil: 'load' });
    const el = await page.waitForSelector('iframe', { timeout: 30000 });
    const f = await el.contentFrame();
    await f.waitForFunction(() => window.ConnectUI && window.ConnectUI.active(), null, { timeout: 30000 });
    await page.waitForTimeout(1500);
    const r = await page.evaluate(() => window.__flash);
    const ok = r && r.core === 0 && r.cx > 0;
    if (!ok) failed++;
    console.log((ok ? 'PASS ' : 'FAIL ') + `${dev} (passage ${pass}) : ${r ? r.core : '?'} image(s) avec le GUI d'origine visible sur ${r ? r.frames : '?'}`);
    await page.close();
  }
  await browser.close();
  console.log(failed ? 'FAILED' : 'PASSED');
  process.exitCode = failed ? 1 : 0;
})();
