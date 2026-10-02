#!/usr/bin/env node
/** Scène OFF (51) sélectionnée en rouge sur tous les châssis — 3 thèmes × {dalle 1920×1200 page + fenêtre Circuits,
 *  iPhone page principale + fenêtre Circuits}. Contraste ≥ 4:1 sur les 4 scènes, captures. Usage : node tools/qa-off-rouge.mjs <dossier> [--base URL] */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "fs";
const [, , OUT = "qa-off", ...rest] = process.argv;
const arg = (n, d) => { const i = rest.indexOf(n); return i >= 0 ? rest[i + 1] : d; };
const BASE = arg("--base", "http://localhost:4179");
mkdirSync(OUT, { recursive: true });
const AUDIT = `window.__audit = function (root) {
  const parse = c => { const m = c.match(/[\\d.]+/g); if (!m) return null; const a = m.length > 3 ? parseFloat(m[3]) : 1; return [+m[0], +m[1], +m[2], a]; };
  const over = (fg, bg) => { const a = fg[3]; return [fg[0]*a+bg[0]*(1-a), fg[1]*a+bg[1]*(1-a), fg[2]*a+bg[2]*(1-a), 1]; };
  const lum = c => { const f = v => { v /= 255; return v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4); }; return 0.2126*f(c[0]) + 0.7152*f(c[1]) + 0.0722*f(c[2]); };
  const ratio = (a, b) => { const l1 = lum(a), l2 = lum(b); return (Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05); };
  const bgOf = el => { let br = 1; { let e = el; while (e && e !== document.documentElement) { const bf = getComputedStyle(e).backdropFilter || ''; const m = bf.match(/brightness\\(([\\d.]+)\\)/); if (m) br *= parseFloat(m[1]); e = e.parentElement; } }
    let bg = [255*br, 255*br, 255*br, 1]; const chain = []; let e = el;
    while (e && e !== document.documentElement) { const c = parse(getComputedStyle(e).backgroundColor); if (c && c[3] > 0) chain.unshift(c); e = e.parentElement; }
    for (const c of chain) bg = over(c, bg); return bg; };
  const out = [];
  root.querySelectorAll('*').forEach(el => {
    const txt = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join(' ').trim(); if (!txt) return;
    const cs = getComputedStyle(el); if (cs.visibility === 'hidden' || cs.display === 'none' || parseFloat(cs.opacity) < 0.2) return;
    const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return;
    const fg = parse(cs.color); if (!fg) return; const bg = bgOf(el); const c = ratio(over(fg, bg), bg);
    out.push({ t: txt.slice(0, 20), c: Math.round(c*100)/100, bg: 'rgb(' + bg.slice(0,3).map(Math.round) + ')' });
  }); return out; };`;
const rows = [];
const b = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || "/opt/pw-browsers/chromium" });
const settle = async p => { await p.waitForTimeout(900); await p.evaluate(() => { try { document.getAnimations().forEach(a => { try { a.finish(); } catch (e) {} }); } catch (e) {} }); };
const isRed = bg => { const m = bg.match(/\d+/g).map(Number); return m[0] > 150 && m[1] < 90 && m[2] < 90; };
function record(ctx, list, shot) {
  const off = list.filter(x => /OFF|ÉTEINDRE/i.test(x.t));
  const low = list.filter(x => x.c < 4);
  const ok = off.length > 0 && off.every(x => isRed(x.bg) && x.c >= 4) && !low.length;
  rows.push({ ctx, off: off.map(x => `${x.t} ${x.c}:1 sur ${x.bg}`).join(' ; '), low: low.map(x => `${x.t} ${x.c}:1`).join(' ; '), ok, shot });
}
// --- Dalle -------------------------------------------------------------------
{
  const p = await b.newPage({ viewport: { width: 1920, height: 1200 } });
  await p.goto(`${BASE}/index.html`, { waitUntil: "networkidle" }); await p.waitForTimeout(1500);
  await p.addScriptTag({ content: AUDIT }); await p.addStyleTag({ content: '*, *::before, *::after { transition: none !important; animation-duration: 0s !important; }' });
  for (const th of ["dark", "light", "glass"]) {
    await p.evaluate(t => window.changeTheme(t), th); await settle(p);
    const sel = 'ch5-button[customClass~="scene-btn"][data-join]';
    await p.evaluate(s => document.querySelectorAll(s).forEach(b => { b.getAttribute('data-join') === '51' ? b.setAttribute('selected', 'true') : b.removeAttribute('selected'); }), sel);
    await p.waitForTimeout(150);
    record(`dalle/${th}/page`, await p.evaluate(() => { const b = document.querySelector('ch5-button[customClass~="scene-btn"][data-join="51"]'); return window.__audit(b.parentElement); }), `dalle-page-${th}`);
    const card = await p.$('ch5-button[customClass~="scene-btn"][data-join="51"]'); const box = await (await card.evaluateHandle(e => e.parentElement)).asElement().boundingBox();
    await p.screenshot({ path: `${OUT}/dalle-page-${th}.png`, clip: { x: Math.max(0, box.x - 20), y: Math.max(0, box.y - 20), width: box.width + 40, height: box.height + 40 } });
    await p.evaluate(() => window.showModalOverlay('circuits-overlay')); await p.waitForTimeout(300);
    await p.evaluate(s => document.querySelectorAll(s).forEach(b => { b.getAttribute('data-join') === '51' ? b.setAttribute('selected', 'true') : b.removeAttribute('selected'); }), sel);
    await p.waitForTimeout(150);
    record(`dalle/${th}/circuits`, await p.evaluate(() => { const b = document.querySelector('#circuits-overlay ch5-button[customClass~="scene-btn"][data-join="51"]'); return window.__audit(b.parentElement); }), `dalle-circuits-${th}`);
    const box2 = await (await p.$('#circuits-overlay ch5-button[customClass~="scene-btn"][data-join="51"]')).boundingBox();
    await p.screenshot({ path: `${OUT}/dalle-circuits-${th}.png`, clip: { x: Math.max(0, box2.x - 640), y: Math.max(0, box2.y - 30), width: 700 + box2.width, height: box2.height + 60 } });
    await p.evaluate(() => window.closeAllModals && window.closeAllModals());
  }
  await p.close();
}
// --- iPhone ------------------------------------------------------------------
{
  const p = await b.newPage({ viewport: { width: 402, height: 874 }, deviceScaleFactor: 2 });
  await p.goto(`${BASE}/iphone.html`, { waitUntil: "networkidle" }); await p.waitForTimeout(1800);
  await p.addScriptTag({ content: AUDIT }); await p.addStyleTag({ content: '*, *::before, *::after { transition: none !important; animation-duration: 0s !important; }' });
  for (const th of ["dark", "light", "glass"]) {
    await p.evaluate(t => window.changeTheme(t), th); await settle(p);
    await p.evaluate(() => { window.switchTab && window.switchTab('lights'); [51,52,53,54].forEach(j => { document.getElementById('scene-btn-' + j).classList.toggle('selected', j === 51); const c = document.getElementById('circuit-scene-btn-' + j); if (c) c.classList.toggle('selected', j === 51); }); });
    await p.waitForTimeout(150);
    record(`iphone/${th}/page`, await p.evaluate(() => window.__audit(document.getElementById('scene-btn-51').parentElement)), `iphone-page-${th}`);
    const box = await (await p.$('#scene-btn-51')).evaluate(e => { const r = e.parentElement.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; });
    await p.screenshot({ path: `${OUT}/iphone-page-${th}.png`, clip: { x: Math.max(0, box.x - 10), y: Math.max(0, box.y - 10), width: box.width + 20, height: box.height + 20 } });
    await p.evaluate(() => { document.getElementById('circuits-overlay').style.display = 'flex'; }); await p.waitForTimeout(250);
    record(`iphone/${th}/circuits`, await p.evaluate(() => window.__audit(document.getElementById('circuit-scene-btn-51').parentElement)), `iphone-circuits-${th}`);
    const box2 = await (await p.$('#circuit-scene-btn-51')).evaluate(e => { const r = e.parentElement.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; });
    await p.screenshot({ path: `${OUT}/iphone-circuits-${th}.png`, clip: { x: Math.max(0, box2.x - 10), y: Math.max(0, box2.y - 10), width: box2.width + 20, height: box2.height + 20 } });
    await p.evaluate(() => { document.getElementById('circuits-overlay').style.display = 'none'; });
  }
  await p.close();
}
await b.close();
const lines = [`# Scène OFF rouge partout — ${rows.filter(r => !r.ok).length} défaut(s) sur ${rows.length}`, '', '| Contexte | OFF sélectionné (texte, contraste, fond) | Textes < 4:1 | Résultat |', '|---|---|---|---|'];
for (const r of rows) lines.push(`| ${r.ctx} | ${r.off || '—'} | ${r.low || '0'} | ${r.ok ? 'VERT' : '**ROUGE**'} |`);
writeFileSync(`${OUT}/rapport.md`, lines.join('\n')); console.log(lines.join('\n'));
process.exit(rows.some(r => !r.ok) ? 1 : 0);
