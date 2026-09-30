/**
 * La Réserve Genève — batterie GUI bloquante (règle 1 du protocole).
 *
 *   node tools/qa-reserve.cjs <dossier du GUI> [--out <dossier>] [--only <écran>] [--chassis dalle,ipad,...]
 *
 * <dossier du GUI> = copie vitrine (apps/showcase/public/showcases/la-reserve-geneve, feedback simulé, états
 * dynamiques pilotables) ou ch5/src (mode déploiement : chargement sans processeur, 0 erreur attendue).
 * 3 espaces (Bar, Fitness, Lodge) × 3 thèmes (Lac, Nuit, Spa) × châssis : dalle TSW 1920×1200, dalle 1280×800
 * (gabarit du site), iPad 11" 1180×776, XPanel 1920×1080, iPhone 18 Pro Max 440×863, iPhone 16 Pro 402×874.
 * Chaque page ET chaque fenêtre (Réglages, confirmation, attente), états dynamiques inclus (muet, rampe, diffusion).
 * Contrôles : contraste ≥ 4:1 sur pixels, aucun texte tronqué, rien hors écran, aucun défilement, cibles ≥ 40 px,
 * 0 erreur console / page, aucun média. Sorties : rapport.json, rapport.md, captures PNG.
 */
const { chromium } = require('playwright');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const ROOT = path.resolve(args[0] || '.');
const OUT = path.resolve(opt('--out', 'qa-out'));
const ONLY = opt('--only', '');
const EXE = process.env.CHROMIUM_PATH || undefined;
fs.mkdirSync(OUT, { recursive: true });

const CHASSIS = [
  { id: 'dalle', w: 1920, h: 1200, page: 'index.html' },
  { id: 'dalle-site', w: 1280, h: 800, page: 'index.html' },
  { id: 'ipad', w: 1180, h: 776, page: 'index.html' },
  { id: 'xpanel', w: 1920, h: 1080, page: 'index.html' },
  { id: 'iphone18', w: 440, h: 863, page: 'iphone.html', phone: true },
  { id: 'iphone16', w: 402, h: 874, page: 'iphone.html', phone: true },
].filter(c => !opt('--chassis') || opt('--chassis').split(',').includes(c.id));
const ESPACES = ['bar', 'fitness', 'lodge'];
const THEMES = ['lac', 'nuit', 'spa'];

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2' };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});

// ------------------------------------------------------------------ écrans
const R = (p, fn) => p.evaluate(fn);
const clickSel = (p, sel, i) => p.evaluate(([s, k]) => { const l = document.querySelectorAll(s); if (l[k || 0]) l[k || 0].click(); }, [sel, i || 0]);
const reset = async p => {
  // une extinction simulée encore en cours (écran précédent) doit être terminée avant l'écran suivant
  await p.waitForFunction(() => !document.querySelector('.spinner'), null, { timeout: 8000 }).catch(() => {});
  await p.evaluate(() => { const S = window.Reserve.state; S.settings = false; S.confirm = false; S.localWait = 0; S.page = 0; window.Reserve.go('home'); });
};
const SCREENS = [
  { id: 'accueil', run: async p => { await reset(p); } },
  { id: 'zones', run: async p => { await reset(p); await clickSel(p, '.src', 0); } },
  { id: 'zones-page2', pages: 2, run: async p => { await reset(p); await clickSel(p, '.src', 1); await clickSel(p, '.page-tabs button', 1); } },
  { id: 'zones-etats', dyn: true, run: async p => { await reset(p); await clickSel(p, '.src', 2); await clickSel(p, '.gbtn.dist', 1); await clickSel(p, '.vbtn.mute', 0); await clickSel(p, '.vbtn.plus', 1); await p.waitForTimeout(200); } },
  { id: 'reglages', run: async p => { await reset(p); await clickSel(p, '.settings'); } },
  { id: 'confirmation', run: async p => { await reset(p); await clickSel(p, '.power-all'); } },
  { id: 'attente', dyn: true, run: async p => { await reset(p); await clickSel(p, '.power-all'); await p.waitForTimeout(80); await clickSel(p, '.shutdown'); await p.waitForTimeout(900); } },
].filter(s => !ONLY || s.id === ONLY || s.id.startsWith(ONLY));

// ------------------------------------------------------------------ mesures dans la page
function measure(phone) {
  const app = document.getElementById('app').getBoundingClientRect();
  const out = { texts: [], trunc: [], offscreen: [], small: [], scroll: [], media: 0 };
  const vis = el => { const r = el.getBoundingClientRect(), cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity !== 0; };
  const label = el => (el.getAttribute('aria-label') || el.textContent || el.className || el.tagName).trim().replace(/\s+/g, ' ').slice(0, 50);
  // textes : feuilles porteuses de texte
  const walker = document.createTreeWalker(document.getElementById('app'), NodeFilter.SHOW_TEXT);
  // Visible = au premier plan : le centre du texte n'est pas recouvert par une fenêtre ouverte au-dessus
  const onTop = (el, r) => {
    const cx = Math.min(innerWidth - 1, Math.max(0, r.left + r.width / 2)), cy = Math.min(innerHeight - 1, Math.max(0, r.top + r.height / 2));
    const hit = document.elementFromPoint(cx, cy);
    return !!hit && (hit === el || el.contains(hit) || hit.contains(el));
  };
  window.__qaCovered = el => { const r = el.getBoundingClientRect(); return !onTop(el, r); };
  while (walker.nextNode()) {
    const t = walker.currentNode; if (!t.textContent.trim()) continue;
    const el = t.parentElement; if (!vis(el)) continue;
    const rg = document.createRange(); rg.selectNodeContents(t);
    const r = rg.getBoundingClientRect();
    if (r.width < 1 || !onTop(el, r)) continue;
    out.texts.push({ x: r.left, y: r.top, w: r.width, h: r.height, color: getComputedStyle(el).color, text: t.textContent.trim().slice(0, 40), size: parseFloat(getComputedStyle(el).fontSize) });
  }
  // tronqués : tout élément à débordement masqué dont le contenu dépasse
  document.querySelectorAll('#app *').forEach(el => {
    if (!vis(el)) return;
    const cs = getComputedStyle(el);
    if (!el.childNodes.length || el.matches('input, svg, svg *')) return;
    const hasText = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
    if (!hasText && !el.matches('.zname, h2, .nm')) return;
    if (window.__qaCovered(el)) return;
    const clamp = cs.webkitLineClamp && cs.webkitLineClamp !== 'none';
    const clipX = cs.overflowX !== 'visible' || cs.textOverflow === 'ellipsis';
    if ((clipX && el.scrollWidth > el.clientWidth + 1) || (clamp && el.scrollHeight > el.clientHeight + 2)) out.trunc.push(label(el));
    const r = el.getBoundingClientRect();
    const inScroll = false;
    if (hasText && !inScroll && (r.right > app.right + 1 || r.bottom > app.bottom + 1 || r.left < app.left - 1 || r.top < app.top - 1)) out.offscreen.push(label(el));
  });
  // cibles tactiles
  document.querySelectorAll('#app button, #app [data-act], #app input, #app [role="button"]').forEach(el => {
    if (!vis(el)) return;
    if (el.matches('.veil') || window.__qaCovered(el)) return;
    const r = el.getBoundingClientRect();
    if (Math.min(r.width, r.height) < 40 - 0.5) out.small.push(label(el) + ` ${Math.round(r.width)}×${Math.round(r.height)}`);
  });
  // défilements
  const se = document.scrollingElement;
  if (se.scrollWidth > se.clientWidth + 1) out.scroll.push('page horizontal ' + se.scrollWidth + '/' + se.clientWidth);
  if (se.scrollHeight > se.clientHeight + 1) out.scroll.push('page vertical ' + se.scrollHeight + '/' + se.clientHeight);
  document.querySelectorAll('#app *').forEach(el => {
    if (!vis(el)) return;
    const cs = getComputedStyle(el);
    const allowed = false;
    if (el.scrollWidth > el.clientWidth + 1 && cs.overflowX !== 'visible' && !el.matches('input')) out.scroll.push('horizontal ' + label(el));
    if (el.scrollHeight > el.clientHeight + 2 && /(auto|scroll|hidden)/.test(cs.overflowY) && !allowed && !el.matches('input')) out.scroll.push('vertical ' + label(el) + ' ' + el.scrollHeight + '/' + el.clientHeight);
  });
  // blocs (groupes, zones, dock, fenêtres) entièrement dans l'écran
  document.querySelectorAll('#app .group, #app .zone, #app .zrow, #app .dock-inner, #app .dialog, #app .src').forEach(el => { if (!vis(el)) return; const r = el.getBoundingClientRect(); if (r.bottom > app.bottom + 1 || r.right > app.right + 1 || r.top < app.top - 1 || r.left < app.left - 1) out.offscreen.push('bloc ' + label(el).slice(0, 30)); });
  out.media = [...document.querySelectorAll('audio, video')].filter(m => !m.paused).length;
  return out;
}

// ------------------------------------------------------------------ contraste sur pixels
const { PNG } = (() => { try { return require('pngjs'); } catch (e) { return {}; } })();
function lum([r, g, b]) { const f = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); }
function ratio(a, b) { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); }
function parseRgb(s) { const m = s.match(/[\d.]+/g).map(Number); return [m[0], m[1], m[2], m[3] === undefined ? 1 : m[3]]; }
function contrastCheck(bgPng, texts, dpr) {
  const bad = [];
  for (const t of texts) {
    if (t.w < 2 || t.h < 2) continue;
    const x0 = Math.max(0, Math.floor(t.x * dpr)), y0 = Math.max(0, Math.floor(t.y * dpr));
    const x1 = Math.min(bgPng.width, Math.ceil((t.x + t.w) * dpr)), y1 = Math.min(bgPng.height, Math.ceil((t.y + t.h) * dpr));
    const samples = [];
    for (let y = y0; y < y1; y += 2) for (let x = x0; x < x1; x += 2) { const i = (y * bgPng.width + x) * 4; samples.push([bgPng.data[i], bgPng.data[i + 1], bgPng.data[i + 2]]); }
    if (!samples.length) continue;
    const c = parseRgb(t.color);
    samples.sort((a, b) => lum(a) - lum(b));
    const med = samples[Math.floor(samples.length / 2)];
    const col = [0, 1, 2].map(k => c[k] * c[3] + med[k] * (1 - c[3]));
    // pire cas : fond le plus proche du texte parmi les 80 % centraux (bords d'icônes et reflets exclus)
    const lo = samples[Math.floor(samples.length * 0.1)], hi = samples[Math.floor(samples.length * 0.9)];
    const r = Math.min(ratio(col, lo), ratio(col, hi), ratio(col, med));
    if (r < 4) bad.push(`${t.text} ${r.toFixed(2)}:1`);
  }
  return bad;
}

(async () => {
  await new Promise(r => server.listen(0, r));
  const BASE = `http://127.0.0.1:${server.address().port}/`;
  const browser = await chromium.launch(EXE ? { executablePath: EXE } : {});
  const rows = [];
  let pass = 0, fail = 0;
  for (const ch of CHASSIS) {
    for (const esp of ESPACES) {
      const ctx = await browser.newContext({ viewport: { width: ch.w, height: ch.h }, deviceScaleFactor: 1 });
      const page = await ctx.newPage();
      await page.addInitScript(() => { window.__qaAudio = 0; const A = window.Audio; window.Audio = function () { window.__qaAudio++; return new A(); };
        if (window.AudioContext) { const C = window.AudioContext; window.AudioContext = function () { window.__qaAudio++; return new C(); }; } });
      const errors = [];
      page.on('pageerror', e => errors.push('pageerror ' + e.message));
      page.on('console', m => { if (m.type() === 'error') errors.push('console ' + m.text()); });
      page.on('requestfailed', r => errors.push('requestfailed ' + r.url()));
      page.on('response', r => { if (r.status() >= 400) errors.push(r.status() + ' ' + r.url()); });
      await page.goto(BASE + ch.page + '?espace=' + esp, { waitUntil: 'load' });
      await page.waitForFunction(() => window.Reserve && window.Reserve.ready, null, { timeout: 15000 });
      await page.evaluate(() => document.fonts.ready);
      const showcase = await page.evaluate(() => window.Bus.mode === 'showcase');
      const nPages = await page.evaluate(() => window.Reserve.espace.pages.length);
      for (const theme of THEMES) {
        await page.evaluate(t => window.changeTheme(t), theme);
        for (const sc of SCREENS) {
          if (sc.dyn && !showcase) continue;
          if (sc.pages && nPages < sc.pages) continue;
          errors.length = 0;
          await sc.run(page);
          await page.waitForTimeout(220);
          const tag = `${ch.id}/${esp}/${theme}/${sc.id}`;
          const shot = path.join(OUT, `${ch.id}__${esp}__${theme}__${sc.id}.png`);
          await page.screenshot({ path: shot });
          const m = await page.evaluate(measure, !!ch.phone);
          await page.addStyleTag({ content: '#app *, #app *::before, #app *::after { color: transparent !important; text-shadow: none !important; caret-color: transparent !important; transition: none !important; animation: none !important; } #app svg { visibility: hidden !important; }' }).then(h => h.evaluate(e => e.setAttribute('data-qa', '1')));
          const bgBuf = await page.screenshot();
          await page.evaluate(() => document.querySelectorAll('style[data-qa]').forEach(s => s.remove()));
          const lowC = PNG ? contrastCheck(PNG.sync.read(bgBuf), m.texts, 1) : ['pngjs absent'];
          const sound = await page.evaluate(() => (window.__qaAudio || 0));
          const checks = {
            contraste: lowC, tronque: m.trunc, horsEcran: m.offscreen, cibles: m.small, defilement: m.scroll,
            console: [...errors], media: m.media || sound ? ['média / son : ' + (m.media + sound)] : [],
          };
          const ok = Object.values(checks).every(v => v.length === 0);
          ok ? pass++ : fail++;
          rows.push({ tag, chassis: ch.id, espace: esp, theme, screen: sc.id, ok, checks, png: path.basename(shot) });
          if (!ok) console.log('FAIL ' + tag + ' ' + JSON.stringify(Object.fromEntries(Object.entries(checks).filter(([, v]) => v.length))));
        }
      }
      await ctx.close();
    }
  }
  await browser.close(); server.close();
  fs.writeFileSync(path.join(OUT, 'rapport.json'), JSON.stringify({ root: ROOT, pass, fail, rows }, null, 2));
  const cols = ['contraste', 'tronque', 'horsEcran', 'cibles', 'defilement', 'console', 'media'];
  let md = `# Batterie La Réserve Genève — ${new Date().toISOString().slice(0, 16)}\n\n${pass} vert / ${fail} rouge (${ROOT})\n\n| Châssis | Espace | Thème | Écran | ${cols.join(' | ')} |\n|---|---|---|---|${cols.map(() => '---').join('|')}|\n`;
  for (const r of rows) md += `| ${r.chassis} | ${r.espace} | ${r.theme} | ${r.screen} | ${cols.map(c => r.checks[c].length ? '✗ ' + r.checks[c].length : '✓').join(' | ')} |\n`;
  fs.writeFileSync(path.join(OUT, 'rapport.md'), md);
  console.log(`\n${pass} vert / ${fail} rouge — rapport : ${path.join(OUT, 'rapport.md')}`);
  process.exit(fail ? 1 : 0);
})();
