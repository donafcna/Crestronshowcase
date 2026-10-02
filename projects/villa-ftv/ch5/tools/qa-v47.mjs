#!/usr/bin/env node
/**
 * Batterie v4.7 — iPhone 16 Pro × 3 thèmes × {fenêtre Circuits, onglet HVAC, panneau Sauna, panneau Hammam},
 * états dynamiques (aucune sélection / chaque bouton sélectionné / scène mémorisée).
 * Contrôles : contraste ≥ 4:1 (moteur de tools/check_contrast_dom.mjs), cibles ≥ 40 px, aucun texte tronqué
 * ou débordant, aucun scroll horizontal, aucune erreur console, chaîne appui → état (pressDigital → subscribeState).
 * Usage : node tools/qa-v47.mjs <page: iphone.html|iphone.before.html> <dossier captures> [--base http://localhost:4179]
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "fs";

const [, , PAGE = "iphone.html", OUT = "qa-out", ...rest] = process.argv;
const arg = (n, d) => { const i = rest.indexOf(n); return i >= 0 ? rest[i + 1] : d; };
const BASE = arg("--base", "http://localhost:4179");
const MIN = 4, MIN_TARGET = 40;
const THEMES = ["dark", "light", "glass"];
const IS_AFTER = !PAGE.includes("before");
mkdirSync(OUT, { recursive: true });

const AUDIT = `
window.__audit = function (root) {
  const parse = c => { const m = c.match(/[\\d.]+/g); if (!m) return null; const a = m.length > 3 ? parseFloat(m[3]) : 1; return [+m[0], +m[1], +m[2], a]; };
  const over = (fg, bg) => { const a = fg[3]; return [fg[0]*a+bg[0]*(1-a), fg[1]*a+bg[1]*(1-a), fg[2]*a+bg[2]*(1-a), 1]; };
  const lum = c => { const f = v => { v /= 255; return v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4); }; return 0.2126*f(c[0]) + 0.7152*f(c[1]) + 0.0722*f(c[2]); };
  const ratio = (a, b) => { const l1 = lum(a), l2 = lum(b); return (Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05); };
  const bgOf = el => {
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
};
// Cibles tactiles et débordements des boutons d'un conteneur
window.__geom = function (root, sel) {
  const out = [];
  const box = root.getBoundingClientRect();
  root.querySelectorAll(sel).forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return;
    const inner = el.querySelector('.cb-btn') || el;
    if (r.width < ${MIN_TARGET} || r.height < ${MIN_TARGET}) out.push({ k: 'cible', sel: el.id || el.outerHTML.slice(0, 60), w: Math.round(r.width), h: Math.round(r.height) });
    if (r.left < box.left - 1 || r.right > box.right + 1 || r.top < box.top - 1 || r.bottom > box.bottom + 1) out.push({ k: 'hors-cadre', sel: el.id || el.outerHTML.slice(0, 60) });
    if (inner.scrollWidth > inner.clientWidth + 1 || inner.scrollHeight > inner.clientHeight + 1) out.push({ k: 'tronque', sel: el.id || el.outerHTML.slice(0, 60), sw: inner.scrollWidth, cw: inner.clientWidth, sh: inner.scrollHeight, ch: inner.clientHeight });
  });
  return out;
};`;

const rows = [];   // tableau de résultats
const consoleErrors = [];
// Artefacts du banc (hors runtime CH5, identiques avant/après) : WebXPanel sans hôte Crestron et favicon absent.
const BENCH = /panelInstance\.initialize is not a function|favicon\.ico/;
const benchArtefacts = [];
const b = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || "/opt/pw-browsers/chromium" });
// Châssis : iPhone 16 Pro (402×874, vocabulaire figé du projet) et iPhone 18 Pro Max
// (440×956, référence commune décidée le 26/09/2026 dans apps/showcase/CLAUDE.md).
const VW = parseInt(arg("--w", "402"), 10), VH = parseInt(arg("--h", "874"), 10);
const p = await b.newPage({ viewport: { width: VW, height: VH }, deviceScaleFactor: 2 });
// Pont natif factice (posé avant CrComLib) : tout ce que la GUI émet vers le processeur est capturé
// dans window.__sent, comme le ferait la WebView de Crestron One (JSInterface).
await p.addInitScript(() => {
  window.__sent = [];
  window.JSInterface = {
    bridgeSendBooleanToNative: (j, v) => window.__sent.push(['b', String(j), v]),
    bridgeSendIntegerToNative: (j, v) => window.__sent.push(['n', String(j), v]),
    bridgeSendStringToNative: (j, v) => window.__sent.push(['s', String(j), v]),
    bridgeSendObjectToNative: (j, v) => window.__sent.push(['o', String(j), v]),
    bridgeSendArrayToNative: (j, v) => window.__sent.push(['a', String(j), v]),
  };
});
const pushErr = t => (BENCH.test(t) ? benchArtefacts : consoleErrors).push(t);
p.on("console", m => { if (m.type() === "error") pushErr(m.text() + (m.location() && m.location().url ? ' @ ' + m.location().url : '')); });
p.on("pageerror", e => pushErr("pageerror: " + e.message));
await p.goto(`${BASE}/${PAGE}`, { waitUntil: "networkidle" });
await p.waitForTimeout(1800);
await p.addScriptTag({ content: AUDIT });
await p.addStyleTag({ content: '*, *::before, *::after { transition: none !important; animation-duration: 0s !important; }' });

const SCENE_SEL = IS_AFTER ? '.scene-cmd-btn' : 'ch5-button[customClass~="scene-btn"][data-rjoin]';
const HVAC_SEL = IS_AFTER ? '.hvac-cmd-btn' : 'ch5-button[customClass~="hvac-command"][receiveStateSelected]';
// Sélection d'un bouton : classe .selected (v4.7) ou attribut selected (ch5-button)
const select = (el, on) => { if (el.tagName === 'CH5-BUTTON') { on ? el.setAttribute('selected', 'true') : el.removeAttribute('selected'); } else el.classList.toggle('selected', on); };

async function check(ctx, rootSel, btnSel, shot) {
  const res = await p.evaluate(({ rootSel, btnSel }) => {
    const root = document.querySelector(rootSel);
    const contrast = window.__audit(root);
    const geom = window.__geom(root, btnSel);
    const hscroll = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1 || root.scrollWidth > root.clientWidth + 1;
    return { contrast, geom, hscroll };
  }, { rootSel, btnSel });
  const errs = consoleErrors.splice(0);
  const ok = !res.contrast.length && !res.geom.length && !res.hscroll && !errs.length;
  rows.push({ ctx, ok, contrast: res.contrast, geom: res.geom, hscroll: res.hscroll, errs });
  if (shot) await p.screenshot({ path: `${OUT}/${shot}.png` });
}

for (const th of THEMES) {
  await p.evaluate(t => window.changeTheme(t), th);
  await p.waitForTimeout(900);
  await p.evaluate(() => { try { document.getAnimations().forEach(a => { try { a.finish(); } catch (e) {} }); } catch (e) {} });

  // --- Fenêtre Circuits ---------------------------------------------------
  await p.evaluate(() => { document.querySelectorAll('.custom-overlay-panel').forEach(o => o.style.display = 'none'); document.getElementById('circuits-overlay').style.display = 'flex'; });
  await p.waitForTimeout(250);
  await p.evaluate(sel => document.querySelectorAll(sel).forEach(b => { b.classList.remove('selected'); b.removeAttribute('selected'); b.removeAttribute('data-saved'); }), SCENE_SEL);
  await check(`${th}/circuits/repos`, '#circuits-overlay', SCENE_SEL, null);
  const scenes = await p.$$(SCENE_SEL);
  for (let i = 0; i < scenes.length; i++) {
    await p.evaluate(({ sel, i }) => { const list = document.querySelectorAll(sel); list.forEach((b, k) => { const on = k === i; if (b.tagName === 'CH5-BUTTON') { on ? b.setAttribute('selected', 'true') : b.removeAttribute('selected'); } else b.classList.toggle('selected', on); }); }, { sel: SCENE_SEL, i });
    await p.waitForTimeout(120);
    const j = await scenes[i].getAttribute('data-join');
    await check(`${th}/circuits/scene-${j}-selectionnee`, '#circuits-overlay', SCENE_SEL, i === 0 ? `circuits-${th}` : null);
  }
  await p.evaluate(sel => document.querySelectorAll(sel).forEach(b => b.setAttribute('data-saved', 'true')), SCENE_SEL);
  await check(`${th}/circuits/scenes-memorisees`, '#circuits-overlay', SCENE_SEL, null);
  await p.evaluate(sel => document.querySelectorAll(sel).forEach(b => { b.removeAttribute('data-saved'); b.classList.remove('selected'); b.removeAttribute('selected'); }), SCENE_SEL);
  await p.evaluate(() => document.getElementById('circuits-overlay').style.display = 'none');

  // --- Onglet Climat : HVAC, Sauna, Hammam --------------------------------
  await p.evaluate(() => window.switchTab('hvac'));
  await p.waitForTimeout(300);
  for (const panel of ['hvac', 'sauna', 'hammam']) {
    await p.evaluate(n => window.showWellnessPanel(n), panel);
    await p.waitForTimeout(200);
    const rootSel = panel === 'hvac' ? '#panel-hvac .hvac-controls' : `[data-climate-panel="${panel}"]`;
    await p.evaluate(sel => document.querySelectorAll(sel).forEach(b => { b.classList.remove('selected'); b.removeAttribute('selected'); }), HVAC_SEL);
    await check(`${th}/${panel}/repos`, rootSel, HVAC_SEL, null);
    const btns = await p.$$(`${rootSel} ${HVAC_SEL}`);
    for (let i = 0; i < btns.length; i++) {
      await p.evaluate(({ rootSel, sel, i }) => { document.querySelectorAll(rootSel + ' ' + sel).forEach((b, k) => { const on = k === i; if (b.tagName === 'CH5-BUTTON') { on ? b.setAttribute('selected', 'true') : b.removeAttribute('selected'); } else b.classList.toggle('selected', on); }); }, { rootSel, sel: HVAC_SEL, i });
      await p.waitForTimeout(120);
      const j = await btns[i].getAttribute('data-join');
      await check(`${th}/${panel}/${j}-selectionne`, rootSel, HVAC_SEL, i === 0 ? `${panel}-${th}` : null);
    }
    await p.evaluate(sel => document.querySelectorAll(sel).forEach(b => { b.classList.remove('selected'); b.removeAttribute('selected'); }), HVAC_SEL);
  }
  await p.evaluate(() => window.showWellnessPanel('hvac'));
  await p.evaluate(() => window.switchTab('lights'));
}

// --- Chaîne appui → état (v4.7 seulement) : pressDigital émet, subscribeState relit l'impulsion ---
let chain = null;
if (IS_AFTER) {
  chain = await p.evaluate(async () => {
    const out = {};
    const probe = async (id, join) => {
      const el = document.getElementById(id); if (!el) return 'absent';
      window.__sent.length = 0;
      el.click();
      await new Promise(r => setTimeout(r, 120));
      const mine = window.__sent.filter(x => x[0] === 'b' && x[1] === String(join)).map(x => x[2]);
      return mine.length === 2 && mine[0] === true && mine[1] === false ? 'impulsion ↑↓ émise' : ('incomplet ' + JSON.stringify(window.__sent));
    };
    for (const j of [51, 52, 53, 54]) out['circuit-scene-btn-' + j] = await probe('circuit-scene-btn-' + j, j);
    for (const j of [610, 611, 612, 613, 614, 615, 620, 621, 624, 625]) out['hvac-cmd-btn-' + j] = await probe('hvac-cmd-btn-' + j, j);
    // Retour d'état du processeur : bridgeReceiveBooleanFromNative → subscribeState → .selected
    const rx = (j, v) => CrComLib.bridgeReceiveBooleanFromNative(String(j), v);
    rx(612, true); await new Promise(r => setTimeout(r, 80));
    out.selected_612 = document.getElementById('hvac-cmd-btn-612').classList.contains('selected');
    rx(612, false); await new Promise(r => setTimeout(r, 80));
    out.deselected_612 = !document.getElementById('hvac-cmd-btn-612').classList.contains('selected');
    rx(624, true); await new Promise(r => setTimeout(r, 80));
    out.selected_624 = document.getElementById('hvac-cmd-btn-624').classList.contains('selected');
    rx(624, false);
    rx(53, true); await new Promise(r => setTimeout(r, 80));
    out.selected_53_both = document.getElementById('circuit-scene-btn-53').classList.contains('selected') && document.getElementById('scene-btn-53').classList.contains('selected');
    rx(53, false); await new Promise(r => setTimeout(r, 80));
    out.deselected_53_both = !document.getElementById('circuit-scene-btn-53').classList.contains('selected') && !document.getElementById('scene-btn-53').classList.contains('selected');
    // Appui long : sceneIdxOf reconnaît le nouveau bouton (via le sélecteur SCENE_SEL exposé ? non : on teste le contextmenu bloqué)
    const ev = new Event('contextmenu', { bubbles: true, cancelable: true });
    document.getElementById('circuit-scene-btn-52').dispatchEvent(ev);
    out.longpress_selector = ev.defaultPrevented;
    return out;
  });
}

await b.close();

const bad = rows.filter(r => !r.ok);
const lines = [];
lines.push(`# Batterie v4.7 — ${PAGE} — ${VW}×${VH} @2 — ${rows.length} contrôles, ${bad.length} en défaut`);
lines.push('');
lines.push('| Contexte | Contraste < 4:1 | Cibles / débordements | Scroll H | Erreurs console | Résultat |');
lines.push('|---|---|---|---|---|---|');
for (const r of rows) lines.push(`| ${r.ctx} | ${r.contrast.length ? r.contrast.map(c => `${c.c}:1 « ${c.t} »`).join('<br>') : '0'} | ${r.geom.length ? r.geom.map(g => `${g.k} ${g.sel}${g.w ? ' ' + g.w + '×' + g.h : ''}`).join('<br>') : '0'} | ${r.hscroll ? 'OUI' : 'non'} | ${r.errs.length ? r.errs.map(e => e.slice(0, 80)).join('<br>') : '0'} | ${r.ok ? 'VERT' : '**ROUGE**'} |`);
if (benchArtefacts.length) { lines.push(''); lines.push('Artefacts du banc exclus (identiques sur la page avant conversion) : ' + [...new Set(benchArtefacts)].join(' ; ')); }
if (chain) { lines.push(''); lines.push('## Chaîne appui → état (dans le navigateur, CrComLib sans processeur)'); for (const [k, v] of Object.entries(chain)) lines.push(`- ${k} : ${v}`); }
writeFileSync(`${OUT}/rapport-${PAGE.replace('.html', '')}-${VW}x${VH}.md`, lines.join('\n'));
console.log(lines.join('\n'));
process.exit(IS_AFTER && (bad.length || (chain && Object.values(chain).some(v => v === false || (typeof v === 'string' && !v.startsWith('impulsion'))))) ? 1 : 0);
