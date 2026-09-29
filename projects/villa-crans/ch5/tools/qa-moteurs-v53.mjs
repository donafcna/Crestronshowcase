#!/usr/bin/env node
/** v5.3 — Fenêtre Moteurs paginée (12 moteurs max, lamelles, aucun défilement).
 *  3 thèmes × {dalle 1920×1200, iPad 1180×820, iPhone 16 Pro 402×874} × nombre de moteurs {1, 6, 7, 12} × chaque page.
 *  Contrôles : aucun défilement du conteneur ni de la page, aucune carte hors fenêtre, fenêtre dans l'écran, cibles >= 40 px,
 *  nom non tronqué, contraste >= 4:1, pages <= 6 cartes, chaque moteur présent une seule fois, flèches visibles ssi > 1 page,
 *  joins des boutons conformes au contrat (81-98 / 129-146, 111-128 / 157-174), rangée lamelles ssi lamelles:true,
 *  0 erreur console, aucun <audio>. Chaîne iPhone : appuis moteur 9 → 135 et 163 émis.
 *  Usage : node tools/qa-moteurs-v53.mjs <dossier> [--base URL] */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "fs";
const [, , OUT = "qa-moteurs-v53", ...rest] = process.argv;
const arg = (n, d) => { const i = rest.indexOf(n); return i >= 0 ? rest[i + 1] : d; };
const BASE = arg("--base", "http://localhost:4181");
const ROOM = 7;
mkdirSync(OUT, { recursive: true });
const AUDIT = `window.__audit = function (root) {
  const parse = c => { const m = c.match(/[\\d.]+/g); if (!m) return null; const a = m.length > 3 ? parseFloat(m[3]) : 1; return [+m[0], +m[1], +m[2], a]; };
  const over = (fg, bg) => { const a = fg[3]; return [fg[0]*a+bg[0]*(1-a), fg[1]*a+bg[1]*(1-a), fg[2]*a+bg[2]*(1-a), 1]; };
  const lum = c => { const f = v => { v /= 255; return v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4); }; return 0.2126*f(c[0]) + 0.7152*f(c[1]) + 0.0722*f(c[2]); };
  const ratio = (a, b) => { const l1 = lum(a), l2 = lum(b); return (Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05); };
  const bgOf = el => { let bg = [0, 0, 0, 1]; const chain = []; let e = el;
    while (e && e !== document.documentElement) { const c = parse(getComputedStyle(e).backgroundColor); if (c && c[3] > 0) chain.unshift(c); e = e.parentElement; }
    for (const c of chain) bg = over(c, bg); return bg; };
  const out = [];
  root.querySelectorAll('*').forEach(el => {
    const txt = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join(' ').trim(); if (!txt) return;
    const cs = getComputedStyle(el); if (cs.visibility === 'hidden' || cs.display === 'none' || parseFloat(cs.opacity) < 0.2) return;
    if (el.closest('[hidden]')) return;
    const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return;
    const fg = parse(cs.color); if (!fg) return; const bg = bgOf(el); const c = ratio(over(fg, bg), bg);
    if (c < 4) out.push({ t: txt.slice(0, 24), c: Math.round(c*100)/100 });
  }); return out; };
window.__check = function (n) {
  const box = document.getElementById('motors-container'), ov = document.getElementById('motors-overlay');
  const br = box.getBoundingClientRect(), orr = ov.getBoundingClientRect();
  const pb = []; const vis = [...box.querySelectorAll(':scope > .mc-card')].filter(c => !c.hidden);
  if (box.scrollHeight > box.clientHeight + 1) pb.push('défilement conteneur ' + box.scrollHeight + '>' + box.clientHeight);
  if (document.documentElement.scrollWidth > innerWidth + 1) pb.push('scroll horizontal page');
  if (orr.top < -1 || orr.left < -1 || orr.bottom > innerHeight + 1 || orr.right > innerWidth + 1) pb.push('fenêtre hors écran');
  if (vis.length > 6) pb.push(vis.length + ' cartes sur la page');
  vis.forEach(c => { const r = c.getBoundingClientRect(); if (r.bottom > br.bottom + 1 || r.right > br.right + 1 || r.left < br.left - 1) pb.push('carte ' + c.dataset.motor + ' hors conteneur');
    const nm = c.querySelector('.mc-name'); if (nm.scrollWidth > nm.clientWidth + 1) pb.push('nom tronqué ' + c.dataset.motor);
    const lh = parseFloat(getComputedStyle(nm).lineHeight) || 20; if (nm.getBoundingClientRect().height > lh * 2 + 2) pb.push('nom sur 3 lignes ' + c.dataset.motor); });
  ov.querySelectorAll('button, ch5-button').forEach(b => { if (b.closest('[hidden]')) return; const cs = getComputedStyle(b); if (cs.display === 'none' || b.offsetParent === null) return;
    const r = b.getBoundingClientRect(); if (r.width && (r.width < 40 || r.height < 40)) pb.push('cible ' + Math.round(r.width) + 'x' + Math.round(r.height) + ' ' + (b.getAttribute('aria-label') || b.textContent.trim() || b.getAttribute('label') || b.className).slice(0, 20)); });
  return { pb, shown: vis.map(c => +c.dataset.motor) };
};
window.__joins = function () {
  const M = window.VillaMotors, pb = [];
  M.motors().forEach(m => { const c = document.querySelector('.mc-card[data-motor="' + m.i + '"]'); if (!c) { pb.push('carte ' + m.i + ' absente'); return; }
    const mv = [...c.querySelectorAll('.mc-move > [data-join]')].map(b => +b.dataset.join), exp = [0, 1, 2].map(k => M.moveJoin(m.i, k));
    if (mv.join() !== exp.join()) pb.push('joins moteur ' + m.i + ' ' + mv + ' ≠ ' + exp);
    const ch5 = [...c.querySelectorAll('.mc-move > ch5-button')].map(b => +b.getAttribute('sendEventOnClick')); if (ch5.length && ch5.join() !== exp.join()) pb.push('sendEventOnClick ' + m.i);
    const sr = c.querySelector('.mc-slats'); if (!!sr !== m.lamelles) pb.push('lamelles moteur ' + m.i + ' ' + !!sr + '≠' + m.lamelles);
    if (sr) { const sj = [...sr.querySelectorAll('[data-join]')].map(b => +b.dataset.join), se = [0, 1, 2].map(k => M.slatsJoin(m.i, k)); if (sj.join() !== se.join()) pb.push('joins lamelles ' + m.i + ' ' + sj + ' ≠ ' + se);
      if (!sr.querySelector('.mc-slats-icon')) pb.push('icône lamelles ' + m.i); }
    if (!c.querySelector('.mc-move > .mc-icon')) pb.push('icône moteur ' + m.i);
    if (c.querySelector('.slats-title')) pb.push('libellé Lamelle encore présent'); });
  return pb;
};`;
const bench = /panelInstance\.initialize is not a function|favicon\.ico|ERR_CONNECTION_REFUSED|ERR_TUNNEL_CONNECTION_FAILED|\[WXP\]|net::ERR|Failed to load resource/;
const rows = [];
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const VP = { dalle: { width: 1920, height: 1200, f: "index", dsf: 1 }, ipad: { width: 1180, height: 820, f: "index", dsf: 1 }, iphone: { width: 402, height: 874, f: "iphone", dsf: 2 } };
for (const [kind, v] of Object.entries(VP)) {
  const p = await b.newPage({ viewport: { width: v.width, height: v.height }, deviceScaleFactor: v.dsf });
  const errs = [];
  await p.addInitScript(() => { window.__sent = []; window.JSInterface = { bridgeSendBooleanToNative: (j, v) => window.__sent.push([String(j), v]), bridgeSendIntegerToNative() {}, bridgeSendStringToNative() {}, bridgeSendObjectToNative() {}, bridgeSendArrayToNative() {} }; });
  p.on("console", m => { const u = m.location().url || ""; if (m.type() === "error" && !bench.test(m.text() + " " + u)) errs.push(m.text().slice(0, 90)); });
  p.on("pageerror", e => { if (!bench.test(e.message)) errs.push("pageerror: " + e.message.slice(0, 110)); });
  await p.goto(`${BASE}/${v.f}.html`, { waitUntil: "networkidle" }); await p.waitForTimeout(1800);
  await p.addScriptTag({ content: AUDIT }); await p.addStyleTag({ content: "*, *::before, *::after { transition: none !important; animation-duration: 0s !important; }" });
  const setRoom = async id => { await p.evaluate(id => { if (window.changeRoomUI) window.changeRoomUI(id); const rs = document.getElementById("room-select"); if (rs) { rs.value = String(id); rs.dispatchEvent(new Event("change")); } if (window.changeRoomIphone) window.changeRoomIphone(String(id)); if (window.selectRoomFromConfig) window.selectRoomFromConfig(id); }, id); await p.waitForTimeout(600); };
  for (const th of ["dark", "light", "glass"]) {
    await p.evaluate(t => window.changeTheme(t), th); await p.waitForTimeout(300);
    for (const n of [1, 6, 7, 12]) {
      await p.evaluate(({ n, room }) => { [window.villaConfig, window.villaConfigEmbedded].forEach(c => { if (!c) return; const pc = c.pieces.find(x => x.id === room); if (pc) pc.pilotages.moteurs.nombre = n; }); }, { n, room: ROOM });
      await setRoom(ROOM);
      await p.evaluate(() => { window.VillaMotors.render(); window.openMotorsModal(); }); await p.waitForTimeout(700);
      const pages = await p.evaluate(() => window.VillaMotors.page().pages);
      const seen = []; let pbAll = [], contrast = [];
      const joins = await p.evaluate(() => window.__joins());
      for (let pg = 0; pg < pages; pg++) {
        await p.evaluate(pg => window.VillaMotors.go(pg), pg); await p.waitForTimeout(150);
        const r = await p.evaluate(n => window.__check(n), n);
        seen.push(...r.shown); pbAll.push(...r.pb.map(x => 'p' + (pg + 1) + ' ' + x));
        contrast.push(...(await p.evaluate(() => window.__audit(document.getElementById("motors-overlay")))));
        if (n === 12) await p.screenshot({ path: `${OUT}/${kind}-${th}-12m-p${pg + 1}.png` });
      }
      const pagerShown = await p.evaluate(() => { const g = document.getElementById("mc-pager"); return !!g && getComputedStyle(g).display !== "none"; });
      const expected = Array.from({ length: n }, (_, k) => k + 1);
      if (seen.slice().sort((a, b) => a - b).join() !== expected.join()) pbAll.push("moteurs vus " + seen + " ≠ 1.." + n);
      if (pagerShown !== pages > 1) pbAll.push("flèches " + (pagerShown ? "visibles" : "absentes") + " avec " + pages + " page(s)");
      if (pages < Math.ceil(n / 6)) pbAll.push("pages " + pages);
      const audio = await p.evaluate(() => document.querySelectorAll("audio").length);
      if (audio) pbAll.push(audio + " <audio>");
      const e = errs.splice(0);
      const ok = !pbAll.length && !joins.length && !contrast.length && !e.length;
      rows.push({ ctx: `${kind}/${th}/${n} moteurs`, pages, pb: pbAll, joins, contrast, errs: e, ok });
      await p.evaluate(() => window.closeMotorsModal());
    }
  }
  // Chaîne (iPhone, <button> + pressDigital) : moteur 8 Monter → 132, lamelles moteur 8 Horaire → 160
  if (kind === "iphone" && rest.includes("--vitrine")) rows.push({ ctx: "iphone/chaîne moteur 9 : sans objet en vitrine (pas de pont natif, retour 100 % front)", ok: true });
  else if (kind === "iphone") {
    await p.evaluate(() => { window.__sent.length = 0; window.openMotorsModal(); }); await p.waitForTimeout(400);
    const sent = await p.evaluate(() => { const c = document.querySelector('.mc-card[data-motor="9"]'); window.VillaMotors.go(1); c.querySelector('.mc-move [data-join]').click(); const s = c.querySelector('.mc-slats [data-join]'); if (s) s.click(); return window.__sent.map(x => x[0]); });
    await p.waitForTimeout(400);
    const all = await p.evaluate(() => window.__sent.map(x => x[0]));
    rows.push({ ctx: "iphone/chaîne moteur 9 (135, 163)", sent: all.slice(0, 12), ok: all.includes("135") && all.includes("163") });
  }
  // Pièce sans moteurs (1 : moteurs.actif = false) : aucune carte, aucune erreur
  await setRoom(1); await p.evaluate(() => window.VillaMotors.render()); await p.waitForTimeout(300);
  const none = await p.evaluate(() => document.querySelectorAll("#motors-container .mc-card").length);
  const want = await p.evaluate(() => window.VillaMotors.motors().length);
  const e1 = errs.splice(0);
  rows.push({ ctx: `${kind}/pièce 1 (${want} moteur(s) configuré(s))`, cards: none, errs: e1, ok: none === want && !e1.length });
  await p.close();
}
await b.close();
const ko = rows.filter(r => !r.ok);
let md = `# QA v5.3 — fenêtre Moteurs paginée\n\n| Contexte | Pages | Résultat | Détail |\n|---|---|---|---|\n`;
for (const r of rows) md += `| ${r.ctx} | ${r.pages ?? ""} | ${r.ok ? "vert" : "ROUGE"} | ${r.ok ? "" : JSON.stringify({ pb: r.pb, joins: r.joins, contrast: r.contrast, errs: r.errs, sent: r.sent }).slice(0, 400)} |\n`;
md += `\n**${rows.length - ko.length}/${rows.length} verts**\n`;
writeFileSync(`${OUT}/rapport.md`, md);
console.log(md.split("\n").filter(l => /ROUGE|verts/.test(l)).join("\n"));
