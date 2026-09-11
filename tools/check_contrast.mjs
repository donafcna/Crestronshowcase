#!/usr/bin/env node
/**
 * Garde-fou lisibilité : ouvre le GUI dans chaque thème et vérifie le contraste
 * de chaque texte visible par rapport au fond RÉELLEMENT affiché derrière lui
 * (capture d'écran : photos et verre dépoli compris).
 *
 * Usage : node tools/check_contrast.mjs <url index.html> [seuil=3]
 *   ex.  : node tools/check_contrast.mjs http://localhost:4173/showcases/villa-gemini-frequencetv/index.html
 * Sortie : liste des textes sous le seuil (WCAG : 3:1 minimum pour du texte large, 4.5:1 pour du texte courant),
 *          code de sortie 1 s'il y en a → à lancer avant chaque livraison.
 */
import { chromium } from "playwright";
import { PNG } from "pngjs";

const url = process.argv[2];
const THRESHOLD = Number(process.argv[3] || 3);
if (!url) { console.error("usage: node tools/check_contrast.mjs <url> [seuil]"); process.exit(2); }
const THEMES = ["dark", "light", "glass"];
const exe = process.env.CHROMIUM_PATH || undefined;

const lum = ([r, g, b]) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
const ratio = (a, b) => { const la = lum(a), lb = lum(b); return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05); };
const parseRgb = (s) => { const m = s.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(",").map(Number); return p[3] === 0 ? null : p.slice(0, 3); };

const browser = await chromium.launch(exe ? { executablePath: exe } : {});
const page = await browser.newPage({ viewport: { width: 1340, height: 890 } });
await page.goto(url); await page.waitForTimeout(4500);
let failures = 0;
for (const theme of THEMES) {
  await page.evaluate((t) => { if (typeof window.applyTheme === "function") window.applyTheme(t); else { document.body.className = document.body.className.replace(/theme-\w+/g, "") + " theme-" + t; } }, theme);
  await page.waitForTimeout(600);
  const png = PNG.sync.read(await page.screenshot({ type: "png" }));
  const items = await page.evaluate(() => {
    const out = []; const seen = new Set();
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = walker.nextNode())) {
      const txt = n.textContent.trim(); if (txt.length < 1) continue;
      const el = n.parentElement; if (!el || seen.has(el)) continue; seen.add(el);
      if (el.closest("script,style,option,[hidden]")) continue;
      const r = el.getBoundingClientRect(); if (r.width < 6 || r.height < 6) continue;
      if (r.right < 0 || r.bottom < 0 || r.left > innerWidth || r.top > innerHeight) continue;
      const cs = getComputedStyle(el); if (cs.visibility === "hidden" || cs.display === "none" || Number(cs.opacity) === 0) continue;
      // élément réellement visible (pas recouvert par une modale fermée, etc.)
      const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      if (!top || !(top === el || el.contains(top) || top.contains(el))) continue;
      out.push({ text: txt.slice(0, 40), color: cs.color, x: r.left, y: r.top, w: r.width, h: r.height, id: el.id || el.className.toString().slice(0, 40) });
    }
    return out;
  });
  const bad = [];
  for (const it of items) {
    const col = parseRgb(it.color); if (!col) continue;
    // fond : médiane des pixels de la boîte (le texte est minoritaire)
    const px = [];
    const x0 = Math.max(0, Math.floor(it.x)), y0 = Math.max(0, Math.floor(it.y)), x1 = Math.min(png.width, Math.ceil(it.x + it.w)), y1 = Math.min(png.height, Math.ceil(it.y + it.h));
    for (let y = y0; y < y1; y += 2) for (let x = x0; x < x1; x += 2) { const i = (y * png.width + x) * 4; px.push([png.data[i], png.data[i + 1], png.data[i + 2]]); }
    if (!px.length) continue;
    px.sort((a, b) => lum(a) - lum(b)); const bg = px[Math.floor(px.length / 2)];
    const c = ratio(col, bg);
    if (c < THRESHOLD) bad.push({ ...it, contrast: c.toFixed(2), bg: bg.join(",") });
  }
  console.log(`\n=== Thème ${theme} : ${items.length} textes visibles, ${bad.length} sous ${THRESHOLD}:1 ===`);
  for (const b of bad) console.log(`  ${b.contrast}:1  « ${b.text} »  (${b.color} sur rgb(${b.bg}))  [${b.id}]`);
  failures += bad.length;
}
await browser.close();
console.log(failures ? `\n${failures} texte(s) illisible(s) — corriger avant livraison.` : "\nContraste OK dans tous les thèmes.");
process.exit(failures ? 1 : 0);
