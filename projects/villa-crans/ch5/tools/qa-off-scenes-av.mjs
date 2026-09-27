#!/usr/bin/env node
/** v4.9 — OFF éclairage (51) sélectionné = OR comme les autres scènes ; OFF audio/vidéo (200) sélectionné = ROUGE.
 *  3 thèmes × {dalle 1920×1200, iPhone 402×874}. Usage : node tools/qa-off-scenes-av.mjs <dossier> [--base URL] */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "fs";
const [, , OUT = "qa-off2", ...rest] = process.argv;
const arg = (n, d) => { const i = rest.indexOf(n); return i >= 0 ? rest[i + 1] : d; };
const BASE = arg("--base", "http://localhost:4179");
mkdirSync(OUT, { recursive: true });
const HELPERS = `
window.__bg = el => { const cs = getComputedStyle(el); return { bg: cs.backgroundColor, border: cs.borderTopColor, img: cs.backgroundImage.slice(0, 400), color: cs.color }; };
window.__contrastEl = el => { const parse = c => { const m = c.match(/[\\d.]+/g); if (!m) return null; const a = m.length > 3 ? parseFloat(m[3]) : 1; return [+m[0], +m[1], +m[2], a]; };
  const over = (fg, bg) => { const a = fg[3]; return [fg[0]*a+bg[0]*(1-a), fg[1]*a+bg[1]*(1-a), fg[2]*a+bg[2]*(1-a), 1]; };
  const lum = c => { const f = v => { v /= 255; return v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4); }; return 0.2126*f(c[0]) + 0.7152*f(c[1]) + 0.0722*f(c[2]); };
  let br = 1; { let e = el; while (e && e !== document.documentElement) { const bf = getComputedStyle(e).backdropFilter || ''; const m = bf.match(/brightness\\(([\\d.]+)\\)/); if (m) br *= parseFloat(m[1]); e = e.parentElement; } }
  let bg = [255*br, 255*br, 255*br, 1]; const chain = []; let e = el;
  while (e && e !== document.documentElement) { const c = parse(getComputedStyle(e).backgroundColor); if (c && c[3] > 0) chain.unshift(c); e = e.parentElement; }
  for (const c of chain) bg = over(c, bg);
  const fg = over(parse(getComputedStyle(el).color), bg); const a = lum(fg), b = lum(bg); return Math.round((Math.max(a,b)+0.05)/(Math.min(a,b)+0.05)*100)/100; };`;
const rgb = s => (s.match(/\d+/g) || [0,0,0]).map(Number);
const isRed = s => { const [r,g,b] = rgb(s); return r > 150 && g < 90 && b < 90; };
const isGold = s => { const [r,g,b] = rgb(s); return r > 150 && g > 80 && g < 200 && b < 120 && r > g && g > b; }; // or #c49a45, ambre #a16207
const rows = [];
const b = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || "/opt/pw-browsers/chromium" });
const settle = async p => { await p.waitForTimeout(900); await p.evaluate(() => { try { document.getAnimations().forEach(a => { try { a.finish(); } catch (e) {} }); } catch (e) {} }); };
// ---- Dalle
{
  const p = await b.newPage({ viewport: { width: 1920, height: 1200 } });
  await p.goto(`${BASE}/index.html`, { waitUntil: "networkidle" }); await p.waitForTimeout(1500);
  // Pièce 8 (Home cinéma) : la carte Sources n'existe que dans une pièce avec audioVideo actif
  await p.evaluate(() => { (window.selectRoomFromConfig || window.changeRoomUI)(8); }); await p.waitForTimeout(600);
  await p.addScriptTag({ content: HELPERS }); await p.addStyleTag({ content: '*, *::before, *::after { transition: none !important; animation-duration: 0s !important; }' });
  for (const th of ["dark", "light", "glass"]) {
    await p.evaluate(t => window.changeTheme(t), th); await settle(p);
    await p.evaluate(() => { document.querySelectorAll('ch5-button[customClass~="scene-btn"][data-join="51"], ch5-button[customClass~="scene-btn"][data-join="54"], ch5-button[customClass~="power-off-btn"]').forEach(b => b.setAttribute('selected', 'true')); });
    await p.waitForTimeout(250);
    const r = await p.evaluate(() => {
      const out = {}; const inner = b => b.querySelector('.scene-btn') || b.querySelector('.cb-btn') || b;
      const b51 = document.querySelector('ch5-button[customClass~="scene-btn"][data-join="51"]'), b54 = document.querySelector('ch5-button[customClass~="scene-btn"][data-join="54"]');
      out.scene51 = window.__bg(inner(b51)); out.scene51.contrast = window.__contrastEl(inner(b51).querySelector('.ch5-button--label') || inner(b51)); out.scene54 = window.__bg(inner(b54));
      const po = document.querySelector('ch5-button[customClass~="power-off-btn"]'); out.av = window.__bg(po.querySelector('.cb-btn') || po.querySelector('button') || po);
      return out;
    });
    await p.evaluate(() => document.querySelector('ch5-button[customClass~="scene-btn"][data-join="54"]').removeAttribute('selected')); await p.waitForTimeout(120);
    const box = await (await p.$('ch5-button[customClass~="power-off-btn"]')).boundingBox();
    await p.screenshot({ path: `${OUT}/dalle-av-${th}.png`, clip: { x: box.x - 40, y: box.y - 30, width: box.width + 80, height: box.height + 60 } });
    const box2 = await (await p.$('ch5-button[customClass~="scene-btn"][data-join="51"]')).evaluate(e => { const r = e.parentElement.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; });
    await p.screenshot({ path: `${OUT}/dalle-scenes-${th}.png`, clip: { x: box2.x - 10, y: box2.y - 10, width: box2.width + 20, height: box2.height + 20 } });
    await p.evaluate(() => { document.querySelector('ch5-button[customClass~="power-off-btn"]').removeAttribute('selected'); document.querySelectorAll('ch5-button[customClass~="scene-btn"][data-join]').forEach(b => b.removeAttribute('selected')); });
    rows.push({ ctx: `dalle/${th}`, s51: r.scene51, s54: r.scene54, av: r.av,
      ok: isGold(r.scene51.bg) && r.scene51.bg === r.scene54.bg && r.scene51.contrast >= 4 && isRed(r.av.bg) && /fill=\\?\"?%23ffffff|fill=\\?\"?%23fff\b/i.test(r.av.img) });
  }
  await p.close();
}
// ---- iPhone
{
  const p = await b.newPage({ viewport: { width: 402, height: 874 }, deviceScaleFactor: 2 });
  await p.goto(`${BASE}/iphone.html`, { waitUntil: "networkidle" }); await p.waitForTimeout(1800);
  await p.evaluate(() => { const rs = document.getElementById('room-select'); if (rs) { rs.value = '8'; rs.dispatchEvent(new Event('change')); } if (window.updateActiveRoomUI) window.updateActiveRoomUI(8); }); await p.waitForTimeout(600);
  await p.addScriptTag({ content: HELPERS }); await p.addStyleTag({ content: '*, *::before, *::after { transition: none !important; animation-duration: 0s !important; }' });
  for (const th of ["dark", "light", "glass"]) {
    await p.evaluate(t => window.changeTheme(t), th); await settle(p);
    const r = await p.evaluate(() => {
      const out = {}; const g = id => document.getElementById(id);
      [51,52,53,54].forEach(j => { g('scene-btn-' + j).classList.toggle('selected', j === 51); g('circuit-scene-btn-' + j).classList.toggle('selected', j === 51); });
      out.page51 = window.__bg(g('scene-btn-51')); out.page51.contrast = window.__contrastEl(g('scene-btn-51'));
      g('scene-btn-54').classList.add('selected'); out.page54 = window.__bg(g('scene-btn-54')); g('scene-btn-54').classList.remove('selected');
      out.circ51 = window.__bg(g('circuit-scene-btn-51')); out.circ51.contrast = window.__contrastEl(g('circuit-scene-btn-51'));
      g('circuit-scene-btn-54').classList.add('selected'); out.circ54 = window.__bg(g('circuit-scene-btn-54')); g('circuit-scene-btn-54').classList.remove('selected');
      g('power-off-btn-mobile').classList.add('selected'); out.av = window.__bg(g('power-off-btn-mobile'));
      return out;
    });
    await p.waitForTimeout(120);
    await p.evaluate(() => window.switchTab && window.switchTab('audio')); await p.waitForTimeout(200);
    const box = await (await p.$('#power-off-btn-mobile')).boundingBox();
    if (box) await p.screenshot({ path: `${OUT}/iphone-av-${th}.png`, clip: { x: Math.max(0, box.x - 30), y: Math.max(0, box.y - 20), width: box.width + 60, height: box.height + 40 } });
    await p.evaluate(() => window.switchTab && window.switchTab('lights')); await p.waitForTimeout(200);
    const box2 = await (await p.$('#scene-btn-51')).evaluate(e => { const r = e.parentElement.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; });
    await p.screenshot({ path: `${OUT}/iphone-scenes-${th}.png`, clip: { x: Math.max(0, box2.x - 10), y: Math.max(0, box2.y - 10), width: box2.width + 20, height: box2.height + 20 } });
    await p.evaluate(() => { document.getElementById('circuits-overlay').style.display = 'flex'; }); await p.waitForTimeout(200);
    const box3 = await (await p.$('#circuit-scene-btn-51')).evaluate(e => { const r = e.parentElement.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; });
    await p.screenshot({ path: `${OUT}/iphone-circuits-${th}.png`, clip: { x: Math.max(0, box3.x - 10), y: Math.max(0, box3.y - 10), width: box3.width + 20, height: box3.height + 20 } });
    await p.evaluate(() => { document.getElementById('circuits-overlay').style.display = 'none'; document.getElementById('power-off-btn-mobile').classList.remove('selected'); document.querySelectorAll('.selected').forEach(e => e.classList.remove('selected')); });
    // Or attendu = même fond que la scène 54 (page : or translucide sur fond sombre → on compare l'égalité + la bordure or)
    const goldish = x => isGold(x.border) || isGold(x.bg);
    rows.push({ ctx: `iphone/${th}`, s51: r.page51, s54: r.page54, c51: r.circ51, c54: r.circ54, av: r.av,
      ok: r.page51.bg === r.page54.bg && r.page51.border === r.page54.border && goldish(r.page51) && r.page51.contrast >= 4
        && r.circ51.bg === r.circ54.bg && r.circ51.border === r.circ54.border && goldish(r.circ51) && r.circ51.contrast >= 4
        && isRed(r.av.bg) && /fill=\\?\"?%23ffffff|fill=\\?\"?%23fff\b/i.test(r.av.img) });
  }
  await p.close();
}
await b.close();
const L = [`# OFF éclairage = or, OFF audio/vidéo = rouge — ${rows.filter(r => !r.ok).length} défaut(s) sur ${rows.length}`, '', '| Contexte | Scène OFF sélectionnée (fond / bordure / contraste) | = autres scènes | OFF A/V sélectionné (fond, icône) | Résultat |', '|---|---|---|---|---|'];
for (const r of rows) L.push(`| ${r.ctx} | ${r.s51.bg} / ${r.s51.border} / ${r.s51.contrast}:1${r.c51 ? `<br>Circuits : ${r.c51.bg} / ${r.c51.border} / ${r.c51.contrast}:1` : ''} | ${r.s51.bg === r.s54.bg ? 'oui' : 'NON'}${r.c51 ? (r.c51.bg === r.c54.bg ? ' / oui' : ' / NON') : ''} | ${r.av.bg}, icône ${/fill=\\?\"?%23ffffff|fill=\\?\"?%23fff\b/i.test(r.av.img) ? 'blanche' : 'autre'} | ${r.ok ? 'VERT' : '**ROUGE**'} |`);
writeFileSync(`${OUT}/rapport.md`, L.join('\n')); console.log(L.join('\n')); process.exit(rows.some(r => !r.ok) ? 1 : 0);
