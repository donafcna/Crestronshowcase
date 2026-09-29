/**
 * Showroom FTV Nyon — batterie GUI bloquante (règle 1 du protocole).
 *
 *   node tools/qa-showroom.cjs <dossier du GUI> [--out <dossier>] [--only <écran>] [--chassis dalle,ipad,...]
 *
 * <dossier du GUI> = copie vitrine (apps/showcase/public/showcases/showroom-ftv-nyon, feedback simulé, états
 * dynamiques pilotables) ou ch5/src (mode déploiement : chargement sans processeur, 0 erreur attendue).
 * Sert le dossier en local, ouvre chaque écran ET chaque fenêtre dans chaque thème sur chaque châssis :
 *   dalle TSW-1070 1920×1200, dalle 1280×800 (gabarit du site), iPad 11" 1180×776, XPanel 1920×1080,
 *   iPhone 18 Pro Max 440×863 et iPhone 16 Pro 402×874 (les deux références coexistent, CONTEXTE-CLAUDE.md).
 * Contrôles : contraste ≥ 4:1 mesuré sur les pixels (fond photographié sans le texte), aucun texte tronqué,
 * rien hors écran, aucun défilement horizontal ni vertical (exceptions smartphone : Circuits, Caméras),
 * cibles tactiles ≥ 40 px, 0 erreur console / page, aucun média audio ou vidéo.
 * Sorties : rapport.json, rapport.md (tableau), captures PNG par écran / thème / châssis.
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
const THEMES = ['dark', 'light', 'glass'];

// ------------------------------------------------------------------ serveur statique
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.png': 'image/png', '.woff2': 'font/woff2' };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});

// ------------------------------------------------------------------ écrans (chaque page et chaque fenêtre, états compris)
const J = (page, name, n) => page.evaluate(([a, b]) => window.Joins.of(a, b), [name, n || 1]);
const press = async (page, name, n) => { const j = await J(page, name, n); await page.evaluate(x => window.Bus.press(x), j); };
const analog = async (page, name, v, n) => { const j = await J(page, name, n); await page.evaluate(([x, y]) => window.Bus.analog(x, y), [j, v]); };
const api = (page, fn, ...a) => page.evaluate(([f, x]) => window.Showroom[f](...x), [fn, a]);
const allOff = async page => { if (await isShowcase(page)) await press(page, 'House_AllOff'); };
const isShowcase = page => page.evaluate(() => window.Bus.mode === 'showcase');
const room = async (page, id) => { await api(page, 'openRoom', id); };

const SCREENS = [
  { id: 'home', run: async p => { await allOff(p); await api(p, 'go', 'home'); } },
  { id: 'home-on', dyn: true, run: async p => { await allOff(p); await room(p, 5); await press(p, 'Room_Action_{n}', 1); await api(p, 'go', 'home'); } },
  { id: 'menu', run: async p => { await api(p, 'go', 'home'); await p.evaluate(() => { window.Showroom.state.menu = true; window.Showroom.render(); }); } },
  { id: 'confirm-off', run: async p => { await api(p, 'go', 'home'); await p.evaluate(() => { window.Showroom.state.confirm = true; window.Showroom.render(); }); } },
  { id: 'rooms', run: async p => { await api(p, 'go', 'rooms'); await p.evaluate(() => { window.Showroom.state.filter = 'all'; window.Showroom.render(); }); } },
  { id: 'rooms-first', run: async p => { await api(p, 'go', 'rooms'); await p.evaluate(() => { window.Showroom.state.filter = 'first'; window.Showroom.render(); }); } },
  { id: 'rooms-main-on', dyn: true, run: async p => { await room(p, 6); await press(p, 'Lights_AllOn'); await api(p, 'go', 'rooms'); await p.evaluate(() => { window.Showroom.state.filter = 'main'; window.Showroom.render(); }); } },
  { id: 'rooms-favorites-empty', run: async p => { await api(p, 'go', 'rooms'); await p.evaluate(() => { localStorage.setItem('showroom_favs', '[]'); window.Showroom.state.filter = 'fav'; window.Showroom.render(); }); } },
  ...[1, 2, 3, 4, 5, 6].map(id => ({ id: 'room-' + id, run: async p => { await allOff(p); await room(p, id); } })),
  { id: 'room-5-on', dyn: true, run: async p => { await allOff(p); await room(p, 5); await press(p, 'Room_Action_{n}', 1); await press(p, 'Video_Source_{n}', 1); } },
  { id: 'room-1-on', dyn: true, run: async p => { await allOff(p); await room(p, 1); await press(p, 'Room_Action_{n}', 2); await press(p, 'Room_Action_{n}', 1); } },
  ...[1, 4, 5, 6].map(id => ({ id: 'lights-' + id, run: async p => { await allOff(p); await room(p, id); await api(p, 'openSheet', 'lights'); } })),
  { id: 'lights-5-scene', dyn: true, run: async p => { await allOff(p); await room(p, 5); await press(p, 'Light_Scene_{n}', 2); await analog(p, 'Light_{n}_Level#', 32768, 4); await api(p, 'openSheet', 'lights'); } },
  { id: 'house-lights', run: async p => { await api(p, 'go', 'home'); await api(p, 'openSheet', 'house-lights'); } },
  { id: 'select-music', run: async p => { await allOff(p); await room(p, 5); await api(p, 'openSheet', 'select'); } },
  { id: 'player', dyn: true, run: async p => { await allOff(p); await room(p, 5); await press(p, 'Music_Fav_{n}', 1); await press(p, 'Music_Like'); await api(p, 'openSheet', 'music'); } },
  { id: 'player-browse', dyn: true, run: async p => { await room(p, 5); await press(p, 'Music_Service_{n}', 1); await api(p, 'openSheet', 'music'); await api(p, 'tab', 'browse'); } },
  { id: 'player-settings', dyn: true, run: async p => { await room(p, 5); await press(p, 'Music_Service_{n}', 1); await analog(p, 'Music_SleepTimer#', 45); await api(p, 'openSheet', 'music'); await api(p, 'tab', 'settings'); } },
  { id: 'apple-tv', dyn: true, run: async p => { await allOff(p); await room(p, 1); await press(p, 'Music_Service_{n}', 2); await api(p, 'openSheet', 'music'); } },
  { id: 'video-off', run: async p => { await allOff(p); await room(p, 5); await api(p, 'openSheet', 'video'); } },
  { id: 'video-on', dyn: true, run: async p => { await room(p, 5); await press(p, 'Video_Source_{n}', 1); await api(p, 'openSheet', 'video'); } },
  { id: 'cameras', run: async p => { await api(p, 'go', 'home'); await api(p, 'openSheet', 'cameras'); } },
  { id: 'camera-view', run: async p => { await api(p, 'go', 'home'); await api(p, 'openSheet', 'cameras'); await press(p, 'Camera_Select_{n}', 1); await p.evaluate(() => { window.Showroom.state.sub = 1; window.Showroom.render(); }); } },
  { id: 'manage', run: async p => { await api(p, 'openSheet', 'manage'); } },
  ...['panel', 'events', 'health', 'tunable', 'help', 'legal', 'privacy', 'actions'].map(s => ({ id: 'manage-' + s, run: async p => { await api(p, 'openSheet', 'manage', s); } })),
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
    if (!hasText && !el.matches('.tl, .cn, .np-t, h1, .tt, .al, .rn')) return;
    if (window.__qaCovered(el)) return;
    const clamp = cs.webkitLineClamp && cs.webkitLineClamp !== 'none';
    const clipX = cs.overflowX !== 'visible' || cs.textOverflow === 'ellipsis';
    if ((clipX && el.scrollWidth > el.clientWidth + 1) || (clamp && el.scrollHeight > el.clientHeight + 2)) out.trunc.push(label(el));
    const r = el.getBoundingClientRect();
    const inScroll = phone && el.closest('.sheet-body.scroll, .rooms-scroll');
    if (hasText && !inScroll && (r.right > app.right + 1 || r.bottom > app.bottom + 1 || r.left < app.left - 1 || r.top < app.top - 1)) out.offscreen.push(label(el));
  });
  // cibles tactiles
  document.querySelectorAll('#app button, #app [data-act], #app input, #app [role="button"]').forEach(el => {
    if (!vis(el) || el.closest('.menu-veil')) return;
    if (el.matches('.menu-veil, .lights-tile')) return;
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
    const allowed = phone && (el.matches('.sheet-body.scroll, .rooms-scroll'));
    if (el.scrollWidth > el.clientWidth + 1 && cs.overflowX !== 'visible' && !el.matches('input')) out.scroll.push('horizontal ' + label(el));
    if (el.scrollHeight > el.clientHeight + 2 && /(auto|scroll|hidden)/.test(cs.overflowY) && !allowed && !el.matches('.tl, .cn, .np-t, h1, .tt, .al, .rn, input, .sheet-title b, .sheet-title small, .title-block h1')) out.scroll.push('vertical ' + label(el) + ' ' + el.scrollHeight + '/' + el.clientHeight);
  });
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
    const ctx = await browser.newContext({ viewport: { width: ch.w, height: ch.h }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push('pageerror ' + e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push('console ' + m.text()); });
    page.on('requestfailed', r => errors.push('requestfailed ' + r.url()));
    page.on('response', r => { if (r.status() >= 400) errors.push(r.status() + ' ' + r.url()); });
    await page.goto(BASE + ch.page, { waitUntil: 'load' });
    await page.waitForFunction(() => window.Showroom && window.Showroom.ready, null, { timeout: 15000 });
    await page.evaluate(() => document.fonts.ready);
    const showcase = await isShowcase(page);
    for (const theme of THEMES) {
      await page.evaluate(t => window.changeTheme(t), theme);
      for (const sc of SCREENS) {
        if (sc.dyn && !showcase) continue;
        errors.length = 0;
        await page.evaluate(() => { window.Showroom.state.menu = false; window.Showroom.state.confirm = false; window.Showroom.state.sheet = null; window.Showroom.state.sub = null; });
        await sc.run(page);
        await page.waitForTimeout(260);
        const tag = `${ch.id}/${theme}/${sc.id}`;
        const shot = path.join(OUT, `${ch.id}__${theme}__${sc.id}.png`);
        await page.screenshot({ path: shot });
        const m = await page.evaluate(measure, !!ch.phone);
        // fond sans texte ni icône pour le contraste
        await page.addStyleTag({ content: '#app *, #app *::before, #app *::after { color: transparent !important; text-shadow: none !important; caret-color: transparent !important; } #app svg { visibility: hidden !important; }' }).then(h => h.evaluate(e => e.setAttribute('data-qa', '1')));
        const bgBuf = await page.screenshot();
        await page.evaluate(() => document.querySelectorAll('style[data-qa]').forEach(s => s.remove()));
        const lowC = PNG ? contrastCheck(PNG.sync.read(bgBuf), m.texts, 1) : ['pngjs absent'];
        const checks = {
          contraste: lowC, tronque: m.trunc, horsEcran: m.offscreen, cibles: m.small, defilement: m.scroll,
          console: [...errors], media: m.media ? ['média en lecture : ' + m.media] : [],
        };
        const ok = Object.values(checks).every(v => v.length === 0);
        ok ? pass++ : fail++;
        rows.push({ tag, chassis: ch.id, theme, screen: sc.id, ok, checks, png: path.basename(shot) });
        if (!ok) console.log('FAIL ' + tag + ' ' + JSON.stringify(Object.fromEntries(Object.entries(checks).filter(([, v]) => v.length))));
      }
    }
    await ctx.close();
  }
  await browser.close(); server.close();
  fs.writeFileSync(path.join(OUT, 'rapport.json'), JSON.stringify({ root: ROOT, pass, fail, rows }, null, 2));
  const cols = ['contraste', 'tronque', 'horsEcran', 'cibles', 'defilement', 'console', 'media'];
  let md = `# Batterie Showroom FTV Nyon — ${new Date().toISOString().slice(0, 16)}\n\n${pass} vert / ${fail} rouge (${ROOT})\n\n| Châssis | Thème | Écran | ${cols.join(' | ')} |\n|---|---|---|${cols.map(() => '---').join('|')}|\n`;
  for (const r of rows) md += `| ${r.chassis} | ${r.theme} | ${r.screen} | ${cols.map(c => r.checks[c].length ? '✗ ' + r.checks[c].length : '✓').join(' | ')} |\n`;
  fs.writeFileSync(path.join(OUT, 'rapport.md'), md);
  console.log(`\n${pass} vert / ${fail} rouge — rapport : ${path.join(OUT, 'rapport.md')}`);
  process.exit(fail ? 1 : 0);
})();
