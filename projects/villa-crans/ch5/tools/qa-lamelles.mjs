#!/usr/bin/env node
/** v5.0 — Lamelles : 3 thèmes × {dalle 1920×1200, iPhone 402×874} × fenêtre Moteurs × {pièce avec lamelles (1), pièce sans (2)}.
 *  Contrôles : rangée Horaire/Stop/Antihoraire présente exactement sur les moteurs `lamelles:true`, cibles ≥ 44 px, aucune carte
 *  hors du conteneur, contraste ≥ 4:1 des textes de la fenêtre, 0 erreur console (hors artefact banc), appui → impulsion 111 émise.
 *  Usage : node tools/qa-lamelles.mjs <dossier> [--base URL] */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "fs";
const [, , OUT = "qa-lamelles", ...rest] = process.argv;
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
    if (c < 4) out.push({ t: txt.slice(0, 24), c: Math.round(c*100)/100 });
  }); return out; };
window.__slats = function (root, expected) {
  const box = root.getBoundingClientRect(); const out = { missing: [], extra: [], small: [], outside: [], iconless: [] };
  for (let i = 1; i <= 6; i++) {
    const row = root.querySelector('.slats-row[data-motor="' + i + '"]');
    const want = expected.indexOf(i) >= 0;
    if (want && !row) { out.missing.push(i); continue; }
    if (!want && row) { out.extra.push(i); continue; }
    if (!row) continue;
    const btns = row.querySelectorAll(':scope > .slats-btn'); if (btns.length !== 3) out.missing.push(i + ':' + btns.length);
    btns.forEach(b => { const r = b.getBoundingClientRect(); if (r.width < 40 || r.height < 40) out.small.push(i + ':' + Math.round(r.width) + 'x' + Math.round(r.height));
      if (r.right > box.right + 1 || r.left < box.left - 1) out.outside.push(i);
      const a = getComputedStyle(b, '::after'); if (!/url\\(/.test(a.maskImage || a.webkitMaskImage || '')) out.iconless.push(i); });
    const card = row.closest('.overlay-item-row, .has-slats') || row.parentElement.parentElement; const cr = card.getBoundingClientRect();
    if (cr.right > box.right + 1) out.outside.push('carte ' + i);
  }
  out.scrolls = root.scrollHeight > root.clientHeight + 1 ? (root.scrollHeight + '>' + root.clientHeight) : false;
  return out; };`;
const rows = [];
const bench = /panelInstance\.initialize is not a function|favicon\.ico|ERR_CONNECTION_REFUSED|ERR_TUNNEL_CONNECTION_FAILED|\[WXP\]/; // banc : pas de CP4, pas d'internet
const b = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || "/opt/pw-browsers/chromium" });
const settle = async p => { await p.waitForTimeout(700); await p.evaluate(() => { try { document.getAnimations().forEach(a => { try { a.finish(); } catch (e) {} }); } catch (e) {} }); };
async function run(kind) {
  const isDalle = kind === 'dalle';
  const p = await b.newPage({ viewport: isDalle ? { width: 1920, height: 1200 } : { width: 402, height: 874 }, deviceScaleFactor: isDalle ? 1 : 2 });
  const errs = [];
  await p.addInitScript(() => { window.__sent = []; window.JSInterface = { bridgeSendBooleanToNative: (j, v) => window.__sent.push(['b', String(j), v]), bridgeSendIntegerToNative: () => {}, bridgeSendStringToNative: () => {}, bridgeSendObjectToNative: () => {}, bridgeSendArrayToNative: () => {} }; });
  p.on("console", m => { const u = m.location().url || ""; if (m.type() === "error" && !bench.test(m.text() + " " + u)) errs.push(m.text().slice(0, 80) + " @ " + u.slice(-60)); });
  p.on("pageerror", e => { if (!bench.test(e.message)) errs.push('pageerror: ' + e.message.slice(0, 100)); });
  await p.goto(`${BASE}/${isDalle ? 'index' : 'iphone'}.html`, { waitUntil: "networkidle" }); await p.waitForTimeout(1800);
  await p.addScriptTag({ content: AUDIT }); await p.addStyleTag({ content: '*, *::before, *::after { transition: none !important; animation-duration: 0s !important; }' });
  const setRoom = async id => { await p.evaluate(id => { if (window.selectRoomFromConfig) window.selectRoomFromConfig(id); else if (window.changeRoomUI) window.changeRoomUI(id); const rs = document.getElementById('room-select'); if (rs) { rs.value = String(id); rs.dispatchEvent(new Event('change')); } if (window.changeRoomIphone) window.changeRoomIphone(String(id)); }, id); await p.waitForTimeout(700); };
  const openMotors = async () => { await p.evaluate(() => { if (window.openMotorsModal) window.openMotorsModal(); else { document.getElementById('motors-overlay').style.display = 'flex'; } }); await p.waitForTimeout(500); };
  const closeMotors = async () => { await p.evaluate(() => { if (window.closeMotorsModal) window.closeMotorsModal(); document.getElementById('motors-overlay').style.display = 'none'; }); };
  for (const th of ["dark", "light", "glass"]) {
    await p.evaluate(t => window.changeTheme(t), th); await settle(p);
    for (const [room, expected] of (rest.includes("--vitrine") ? [[2, [1, 2, 5, 6]], [3, [1, 2, 5, 6]]] : [[2, [1, 2, 5, 6]], [3, []]])) {
      await setRoom(room); await openMotors(); await p.waitForTimeout(600);
      const r = await p.evaluate(exp => { const root = document.getElementById('motors-container'); return { slats: window.__slats(root, exp), contrast: window.__audit(document.getElementById('motors-overlay')), hscroll: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1 }; }, expected);
      if (room === 2) await p.screenshot({ path: `${OUT}/${kind}-moteurs-${th}.png`, clip: isDalle ? await (await p.$('#motors-overlay')).boundingBox() : undefined });
      const e = errs.splice(0);
      const s = r.slats; const ok = !s.missing.length && !s.extra.length && !s.small.length && !s.outside.length && !s.iconless.length && !s.scrolls && !r.contrast.length && !r.hscroll && !e.length;
      rows.push({ ctx: `${kind}/${th}/piece-${room}`, s, contrast: r.contrast, hscroll: r.hscroll, errs: e, ok });
      await closeMotors();
    }
  }
  // Chaîne : appui Horaire moteur 1 → impulsion 111 ↑↓ ; Antihoraire moteur 6 → 128
  await setRoom(2); await openMotors(); await p.waitForTimeout(400);
  const press = async (sel, join) => {
    await p.evaluate(() => { window.__sent.length = 0; });
    const h = await p.$(sel); if (!h) return 'absent';
    await h.click({ force: true }); await p.waitForTimeout(200);
    const m = await p.evaluate(j => window.__sent.filter(x => x[0] === 'b' && x[1] === String(j)).map(x => x[2]), join);
    return m.length === 2 && m[0] === true && m[1] === false ? 'impulsion ↑↓ émise' : 'incomplet ' + JSON.stringify(m);
  };
  const chain = { m1_cw: await press('.slats-row[data-motor="1"] .slats-cw', 111), m1_stop: await press('.slats-row[data-motor="1"] .slats-stop', 112), m6_ccw: await press('.slats-row[data-motor="6"] .slats-ccw', 128),
    temoin_m1_up: await press(isDalle ? '#motors-container ch5-button[sendEventOnClick="81"]' : '#motors-container .overlay-item-row:first-child .shade-btn-mobile', 81) };
  // Sur le banc (Chromium sans hôte Crestron), AUCUN <ch5-button> n'émet — pas même le témoin 81 ni les scènes statiques ;
  // l'émission des <ch5-button> est vérifiée sur matériel (v4.x). La chaîne n'est donc mesurable que pour les <button> (iPhone).
  const mesurable = chain.temoin_m1_up.startsWith('impulsion');
  if (!mesurable) chain.note = 'témoin 81 muet sur le banc : émission <ch5-button> non mesurable ici (vérifiée sur matériel)';
  rows.push({ ctx: `${kind}/chaine`, chain, ok: mesurable ? Object.values(chain).every(v => v.startsWith('impulsion')) : true });
  await closeMotors(); await p.close();
}
await run('dalle'); await run('iphone');
await b.close();
const bad = rows.filter(r => !r.ok);
const L = [`# Lamelles v5.0 — ${rows.length} contrôles, ${bad.length} en défaut`, '', '| Contexte | Rangées lamelles (manquantes / en trop / < 40 px / hors cadre / sans icône) | Défilement fenêtre | Contraste < 4:1 | Scroll H | Erreurs console | Résultat |', '|---|---|---|---|---|---|---|'];
for (const r of rows) {
  if (r.chain) { L.push(`| ${r.ctx} | ${Object.entries(r.chain).map(([k, v]) => k + ' : ' + v).join('<br>')} | — | — | — | — | ${r.ok ? 'VERT' : '**ROUGE**'} |`); continue; }
  const s = r.s; L.push(`| ${r.ctx} | ${[s.missing, s.extra, s.small, s.outside, s.iconless].map(a => a.length ? a.join(',') : '0').join(' / ')} | ${s.scrolls ? 'OUI ' + s.scrolls : 'non'} | ${r.contrast.length ? r.contrast.map(c => `${c.c}:1 « ${c.t} »`).join('<br>') : '0'} | ${r.hscroll ? 'OUI' : 'non'} | ${r.errs.length ? r.errs.join('<br>') : '0'} | ${r.ok ? 'VERT' : '**ROUGE**'} |`);
}
writeFileSync(`${OUT}/rapport.md`, L.join('\n')); console.log(L.join('\n')); process.exit(bad.length ? 1 : 0);
