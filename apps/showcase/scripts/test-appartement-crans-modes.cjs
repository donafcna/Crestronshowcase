/**
 * Batterie « site » de l'Appartement Crans-Montana — interface Connect du Core (v5.4, 29.09.2026).
 * 3 thèmes du GUI × {Mode normal, Mode Scène Taille réelle, Mode Scène Responsive, Plein écran (/3)}
 * × {dalle TSW-1070, iPad, smartphone}. Plein écran : jamais sur smartphone (vocabulaire figé).
 * Vues contrôlées dans chaque combinaison : pièce à 11 circuits (Bain salle TV), Scènes, Stores, Climat,
 * Réglages ; smartphone : liste des pièces en plus.
 * Contrôles : 0 erreur console/page, aucun scroll horizontal (page et GUI), aucun média en lecture,
 * aucun texte tronqué ni débordant, cibles tactiles ≥ 40 px, contraste de chaque texte ≥ 4:1
 * (fond recomposé : couleurs des ancêtres + remplissage des tuiles + dégradé du Verre dépoli),
 * aucune trace A/V ni alarme ni caméra dans l'interface. Captures PNG.
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
  { id: 'wallpanel', route: 'wallpanel' },
  { id: 'tablet', route: 'tablet' },
  { id: 'phone', route: 'phone' },
];
const THEMES = ['dark', 'light', 'glass'];
const MODES = ['normal', 'scene-reel', 'scene-responsive', 'plein-ecran'];
const VIEWS = ['room', 'scenes', 'shades', 'climate', 'settings'];
const report = { base: BASE, results: [], external: [] };
let passed = 0, failed = 0;
const check = (name, ok, detail) => { report.results.push({ name, ok, detail }); (ok ? passed++ : failed++); console.log((ok ? 'PASS ' : 'FAIL ') + name + (detail ? ' — ' + detail : '')); };
const isExternal = (u) => !u.startsWith(BASE);
const holdDemo = async page => {
  const r = await page.evaluate(() => { const b = document.querySelector('.device-stage'); if (!b) return [5, 5]; const q = b.getBoundingClientRect(); return [q.left + 5, q.top + 5]; });
  await page.mouse.click(r[0], r[1]);
};

// Audit exécuté dans l'iframe du GUI.
const AUDIT = () => {
  const root = document.getElementById('cx-root');
  if (!root) return { missing: true };
  const se = document.scrollingElement;
  const parse = (c) => { const m = String(c).match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(',').map(Number); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
  const hex = (h) => ({ r: parseInt(h.slice(1, 3), 16), g: parseInt(h.slice(3, 5), 16), b: parseInt(h.slice(5, 7), 16), a: 1 });
  const over = (top, bot) => ({ r: top.r * top.a + bot.r * (1 - top.a), g: top.g * top.a + bot.g * (1 - top.a), b: top.b * top.a + bot.b * (1 - top.a), a: 1 });
  const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); };
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const glass = document.body.classList.contains('theme-glass');
  const bases = glass ? ['#2c4a6e', '#16243a', '#0d1523'].map(hex) : [parse(getComputedStyle(root).backgroundColor)];
  const cs = getComputedStyle(document.body);
  const varColor = (name) => { const v = cs.getPropertyValue(name).trim(); return v.startsWith('#') ? hex(v) : parse(v); };
  const fills = [varColor('--cx-fill-a'), varColor('--cx-fill-b')].filter(Boolean);
  const visible = (el) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && r.bottom > 0 && r.top < innerHeight; };
  const low = [], trunc = [], small = [];
  let texts = 0, minRatio = 99;
  const els = [...root.querySelectorAll('*')].filter((el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) && visible(el));
  for (const el of els) {
    texts++;
    const fg = parse(getComputedStyle(el).color);
    const chain = []; for (let a = el; a && a !== document.documentElement; a = a.parentElement) { const bg = parse(getComputedStyle(a).backgroundColor); if (bg && bg.a > 0) chain.push(bg); }
    const backs = [];
    for (const base of bases) { let c = base; for (let i = chain.length - 1; i >= 0; i--) c = over(chain[i], c); backs.push(c); }
    // Texte posé sur une tuile allumée : le remplissage (élément frère) peut passer dessous.
    const tile = el.closest('.cx-tile.is-on');
    if (tile) for (const f of fills) for (const base of bases) { let c = base; for (let i = chain.length - 1; i >= 0; i--) c = over(chain[i], c); backs.push(over(f, c)); }
    const r = Math.min(...backs.map((b) => ratio(over(fg, b), b)));
    minRatio = Math.min(minRatio, r);
    if (r < 4) low.push(el.textContent.trim().slice(0, 24) + ' ' + r.toFixed(2));
    if (el.scrollWidth > el.clientWidth + 1 && getComputedStyle(el).overflow !== 'visible' || getComputedStyle(el).textOverflow === 'ellipsis' && el.scrollWidth > el.clientWidth) trunc.push(el.textContent.trim().slice(0, 24));
    const rr = el.getBoundingClientRect(), host = el.closest('#cx-root');
    if (rr.right > host.getBoundingClientRect().right + 1) trunc.push('déborde: ' + el.textContent.trim().slice(0, 24));
  }
  for (const b of root.querySelectorAll('button, [role="slider"]')) {
    if (!visible(b)) continue;
    const r = b.getBoundingClientRect();
    if (Math.min(r.width, r.height) < 40) small.push((b.textContent.trim() || b.getAttribute('aria-label') || b.className).slice(0, 20) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height));
  }
  const txt = root.innerText;
  const forbidden = (txt.match(/alarme|alarm|caméra|camera|apple tv|sky q|swisscom|iptv|musique|music|volume|télécommande|remote/gi) || []);
  const coreVisible = [...document.querySelectorAll('ch5-button, ch5-slider')].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; }).length;
  const main = root.querySelector('.cx-main');
  const media = [...document.querySelectorAll('audio, video')].filter((m) => !m.paused && !m.muted).length;
  return { sw: se.scrollWidth, cw: se.clientWidth, mainSw: main.scrollWidth, mainCw: main.clientWidth, texts, minRatio: +minRatio.toFixed(2), low, trunc, small, forbidden, coreVisible, media };
};

(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
  try {
    for (const dev of DEVICES) {
      for (const mode of MODES) {
        if (mode === 'plein-ecran' && dev.id === 'phone') { check(`${dev.id}/${mode} : non applicable (jamais de Plein écran sur smartphone)`, true, 'ignoré'); continue; }
        const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
        const errors = [];
        page.on('pageerror', (e) => errors.push(String(e)));
        page.on('console', (m) => { if (m.type() === 'error' && !/WebXPanel|Failed to load resource/.test(m.text())) errors.push(m.text()); });
        page.on('requestfailed', (r) => { if (isExternal(r.url())) report.external.push(r.url()); else errors.push('requestfailed ' + r.url()); });
        const route = `${BASE}/interfaces/residentiel/${PROJECT}/${dev.route}` + (mode === 'plein-ecran' ? '/3' : '');
        await page.goto(route, { waitUntil: 'load' });
        const frameEl = await page.waitForSelector('iframe', { timeout: 30000 });
        const frame = await frameEl.contentFrame();
        await frame.waitForFunction(() => window.ConnectUI && window.ConnectUI.active() && (window.villaConfig || window.villaConfigEmbedded).pieces.length === 17, null, { timeout: 30000 });
        await page.waitForTimeout(800);
        // Neutraliser la démo automatique (reprise après inactivité : 10 s / 60 s) : clic sur la scène, répété.
        await holdDemo(page);
        if (mode.startsWith('scene')) {
          await page.locator('button[aria-label*="Mode Scène"], button[aria-label*="Stage mode"]').first().click();
          await page.waitForTimeout(600);
          await page.locator('.chassis-scale-toggle .chassis-scale-btn').nth(mode === 'scene-reel' ? 0 : 1).click();
          await page.waitForTimeout(600);
        }
        for (const theme of THEMES) {
          await frame.evaluate((t) => { changeTheme(t); }, theme);
          await page.waitForTimeout(950);
          const views = dev.id === 'phone' ? ['list', ...VIEWS] : VIEWS;
          for (const view of views) {
            await holdDemo(page);
            await frame.evaluate((v) => {
              if (v === 'list') window.ConnectUI.setTab('rooms');
              else if (v === 'room') window.ConnectUI.openRoom(11);
              else window.ConnectUI.setTab(v);
            }, view);
            if (view === 'room') await frame.evaluate(() => { const b = document.querySelector('[data-cx-scene="2"]'); if (b) b.click(); });
            await page.waitForTimeout(450);
            const pageScroll = await page.evaluate(() => ({ sw: document.scrollingElement.scrollWidth, cw: document.scrollingElement.clientWidth }));
            const a = await frame.evaluate(AUDIT);
            const tag = `${dev.id}/${mode}/${theme}/${view}`;
            const ok = !a.missing && pageScroll.sw <= pageScroll.cw && a.sw <= a.cw && a.mainSw <= a.mainCw && a.media === 0 && a.low.length === 0
              && a.trunc.length === 0 && a.small.length === 0 && a.forbidden.length === 0 && a.coreVisible === 0;
            check(`${tag} : sans scroll horizontal, contraste ≥ 4:1, rien de tronqué, cibles ≥ 40 px, aucune trace A/V/alarme`, ok,
              a.missing ? 'interface absente' : `min ${a.minRatio}:1 sur ${a.texts} textes` + (a.low.length ? ' | contraste ' + a.low.slice(0, 3).join(', ') : '')
                + (a.trunc.length ? ' | tronqué ' + a.trunc.slice(0, 3).join(', ') : '') + (a.small.length ? ' | petit ' + a.small.slice(0, 3).join(', ') : '')
                + (a.forbidden.length ? ' | interdit ' + a.forbidden.slice(0, 3).join(', ') : '') + (a.coreVisible ? ' | Core visible ' + a.coreVisible : '')
                + (pageScroll.sw > pageScroll.cw || a.sw > a.cw || a.mainSw > a.mainCw ? ` | scroll ${pageScroll.sw}/${pageScroll.cw} ${a.sw}/${a.cw} ${a.mainSw}/${a.mainCw}` : ''));
            if (view === 'room' || mode === 'normal') await page.screenshot({ path: path.join(OUT, `${dev.id}-${mode}-${theme}-${view}.png`) });
          }
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
