#!/usr/bin/env node
/**
 * Contrôle de contraste des GUI Villa Crans (dalle/tablette + smartphone).
 *
 * Parcourt chaque thème, chaque fenêtre (overlay) et chaque ÉTAT dynamique
 * (badges d'alarme, boutons sélectionnés), recompose le fond réel de chaque
 * texte (couches translucides + backdrop-filter brightness) et signale tout
 * ratio < SEUIL (4:1 par défaut).
 *
 * Usage : node scripts/check-contrast-dom.mjs [--base http://localhost:4173] [--min 4]
 * Prérequis : npm run build && npx vite preview --port 4173
 */
import { chromium } from "playwright";

const arg = (n, d) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : d; };
const BASE = arg("--base", "http://localhost:4173");
const MIN = parseFloat(arg("--min", "4"));
// --root permet de pointer directement un dossier contenant index.html / iphone.html
// (ex. VillaCrans : node check-contrast-dom.mjs --root http://localhost:8080/src)
const ROOT = arg("--root", `${BASE}/showcases/villa-gemini-frequencetv`);
const THEMES = ["dark", "light", "glass"];
const OVERLAYS = ["audio-confirm-overlay", "settings-overlay", "global-control-overlay", "motors-overlay",
  "circuits-overlay", "media-player-overlay", "source-control-overlay", "alarm-overlay",
  "cameras-overlay", "global-preset-custom-overlay"];

const AUDIT = `
window.__audit = function (root) {
  const parse = c => { const m = c.match(/[\\d.]+/g); if (!m) return null; const a = m.length > 3 ? parseFloat(m[3]) : 1; return [+m[0], +m[1], +m[2], a]; };
  const over = (fg, bg) => { const a = fg[3]; return [fg[0]*a+bg[0]*(1-a), fg[1]*a+bg[1]*(1-a), fg[2]*a+bg[2]*(1-a), 1]; };
  const lum = c => { const f = v => { v /= 255; return v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4); }; return 0.2126*f(c[0]) + 0.7152*f(c[1]) + 0.0722*f(c[2]); };
  const ratio = (a, b) => { const l1 = lum(a), l2 = lum(b); return (Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05); };
  const bgOf = el => {
    // Pire cas derrière une fenêtre : un fond blanc, sauf si un backdrop-filter l'assombrit.
    let br = 1; { let e = el; while (e && e !== document.documentElement) { const bf = getComputedStyle(e).backdropFilter || ''; const m = bf.match(/brightness\\(([\\d.]+)\\)/); if (m) br *= parseFloat(m[1]); e = e.parentElement; } }
    let bg = [255*br, 255*br, 255*br, 1]; const chain = []; let e = el;
    while (e && e !== document.documentElement) { const c = parse(getComputedStyle(e).backgroundColor); if (c && c[3] > 0) chain.unshift(c); e = e.parentElement; }
    for (const c of chain) bg = over(c, bg);
    return bg;
  };
  const out = [];
  root.querySelectorAll('*').forEach(el => {
    const txt = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join(' ').trim();
    if (!txt) return;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none' || parseFloat(cs.opacity) < 0.2) return;
    const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return;
    const fg = parse(cs.color); if (!fg) return;
    const bg = bgOf(el);
    const c = ratio(over(fg, bg), bg);
    if (c < ${MIN}) out.push({ t: txt.slice(0, 30), c: Math.round(c*100)/100, fg: cs.color, bg: 'rgb(' + bg.slice(0,3).map(Math.round) + ')',
      sel: el.tagName + (el.id ? '#'+el.id : '') + (typeof el.className === 'string' && el.className ? '.'+el.className.trim().split(/\\s+/).join('.') : '') });
  });
  return out;
};`;

const problems = [];
const report = (ctx, list) => list.forEach(r => problems.push({ ctx, ...r }));

const b = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || "/opt/pw-browsers/chromium" });

// --- GUI dalle / tablette -----------------------------------------------
{
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  await p.goto(`${ROOT}/index.html?mode=showcase`, { waitUntil: "networkidle" });
  await p.waitForTimeout(1500);
  await p.addScriptTag({ content: AUDIT });
  for (const th of THEMES) {
    await p.evaluate(t => window.changeTheme(t), th);
    // Les panneaux ont une transition CSS : attendre qu'elle soit terminée, sinon
    // on mesure des couleurs et des backdrop-filter intermédiaires.
    await p.waitForTimeout(900);
    report(`dalle/${th}/page`, await p.evaluate(() => window.__audit(document.querySelector('.app-container'))));
    for (const id of OVERLAYS) {
      const res = await p.evaluate(async id => {
        window.closeAllModals && window.closeAllModals();
        const el = document.getElementById(id); if (!el) return [];
        if (id === 'audio-confirm-overlay') el.style.display = 'block'; else window.showModalOverlay(id);
        await new Promise(r => setTimeout(r, 250));
        return window.__audit(el);
      }, id);
      report(`dalle/${th}/${id}`, res);
    }
    // États dynamiques de l'alarme (badges ACTIF TOTAL / ACTIF PARTIEL / DÉSACTIVÉE)
    for (const state of ["active", "partial", "off"]) {
      const res = await p.evaluate(async state => {
        window.closeAllModals && window.closeAllModals();
        window.showModalOverlay('alarm-overlay');
        document.getElementById('alarm-keypad-screen').style.display = 'none';
        const scr = document.getElementById('alarm-partitions-screen'); scr.style.display = 'flex';
        for (let i = 1; i <= 4; i++) window.updateAlarmPartitionBadge(i, state);
        await new Promise(r => setTimeout(r, 200));
        return window.__audit(scr);
      }, state);
      report(`dalle/${th}/alarme:${state}`, res);
    }
    await p.evaluate(() => window.closeAllModals && window.closeAllModals());
  }
  await p.close();
}

// --- GUI smartphone ------------------------------------------------------
{
  const p = await b.newPage({ viewport: { width: 402, height: 874 } });
  await p.goto(`${ROOT}/iphone.html?mode=showcase`, { waitUntil: "networkidle" });
  await p.waitForTimeout(1800);
  await p.addScriptTag({ content: AUDIT });
  for (const th of THEMES) {
    await p.evaluate(t => window.changeTheme(t), th);
    // Les panneaux ont une transition CSS : attendre qu'elle soit terminée, sinon
    // on mesure des couleurs et des backdrop-filter intermédiaires.
    await p.waitForTimeout(900);
    report(`smartphone/${th}/page`, await p.evaluate(() => window.__audit(document.body).filter(r => !r.sel.includes('overlay'))));
    for (const id of OVERLAYS) {
      const res = await p.evaluate(async id => {
        const el = document.getElementById(id); if (!el) return [];
        document.querySelectorAll('.custom-overlay-panel').forEach(o => o.style.display = 'none');
        el.style.display = 'flex';
        await new Promise(r => setTimeout(r, 200));
        return window.__audit(el);
      }, id);
      report(`smartphone/${th}/${id}`, res);
    }
    await p.evaluate(() => document.querySelectorAll('.custom-overlay-panel').forEach(o => o.style.display = 'none'));
  }
  await p.close();
}

await b.close();

if (!problems.length) {
  console.log(`✅ Contraste : aucun texte sous ${MIN}:1 (3 thèmes, page + fenêtres + états d'alarme, dalle et smartphone).`);
  process.exit(0);
}
console.log(`❌ ${problems.length} texte(s) sous ${MIN}:1 :`);
const seen = new Set();
for (const p of problems) {
  const k = p.ctx + p.sel + p.fg; if (seen.has(k)) continue; seen.add(k);
  console.log(`  ${p.ctx}  ${p.c}:1  ${p.fg} sur ${p.bg}  « ${p.t} »  ${p.sel.slice(0, 70)}`);
}
process.exit(1);
