// Recette 17.09.2026 — bouton OFF (join 200) et état pressé des tuiles sources.
// Usage : node recette-off-sources.mjs <baseUrl> <label> <outDir>
import { chromium, devices } from "playwright";
import { mkdirSync } from "fs";

const [BASE, LABEL, OUT] = [process.argv[2], process.argv[3] || "site", process.argv[4] || "/tmp/recette"];
mkdirSync(OUT, { recursive: true });

const THEMES = ["dark", "light", "glass"];
const SUPPORTS = [
  { name: "dalle", viewport: { width: 1920, height: 1200 }, scale: 1, touch: true },
  { name: "ipad11", viewport: { width: 1194, height: 834 }, scale: 2, touch: true },
];
const rows = [];
const browser = await chromium.launch();

for (const sup of SUPPORTS) for (const theme of THEMES) {
  const ctx = await browser.newContext({ viewport: sup.viewport, deviceScaleFactor: sup.scale, hasTouch: sup.touch, ignoreHTTPSErrors: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  await page.addInitScript((t) => { try { localStorage.setItem("crestron_theme", t); } catch (e) {} }, theme);
  // Pont natif émulé : tout ce que la GUI enverrait au CP4 (impulsions natives des ch5-button
  // = bridgeSendObjectToNative {repeatdigital}, publishEvent JS = bridgeSendBooleanToNative).
  await page.addInitScript(() => {
    window.__nat = [];
    const push = (k, n, v) => window.__nat.push({ k, n: String(n), v, t: Date.now() });
    window.JSInterface = {
      bridgeSendBooleanToNative: (n, v) => push("b", n, v),
      bridgeSendIntegerToNative: (n, v) => push("n", n, v),
      bridgeSendStringToNative: (n, v) => push("s", n, v),
      bridgeSendObjectToNative: (n, v) => { try { if (typeof v === "string") v = JSON.parse(v); } catch (e) {} push("o", n, !!(v && v.repeatdigital)); },
    };
  });
  await page.goto(`${BASE}/index.html`, { waitUntil: "load" });
  await page.waitForTimeout(2500);
  await page.evaluate((t) => { if (typeof applyTheme === "function") applyTheme(t); }, theme);
  await page.waitForTimeout(900);
  // Pièce avec section A/V (la première pièce n'en a pas)
  await page.getByText("Home cinéma", { exact: false }).first().click();
  await page.waitForTimeout(800);

  const joinSeq = (j) => page.evaluate((j) => window.__nat.filter((e) => e.n === j && (e.k === "o" || e.k === "b")).map((e) => (e.v ? "1" : "0")).join(""), j);

  // 1. OFF : deux appuis successifs doivent produire chacun une impulsion complète
  const off = page.locator('ch5-button[customClass="power-off-btn"]').first();
  await off.scrollIntoViewIfNeeded();
  const seq = [];
  for (let k = 0; k < 2; k++) {
    await page.evaluate(() => { window.__nat = []; });
    await off.click();
    await page.waitForTimeout(400);
    seq.push(await joinSeq("200"));
  }
  // Attendu : exactement une impulsion "10" par appui (un seul front montant pour le C#)
  const offOk = seq.every((s) => s === "10");
  // Mute (55) : même règle, deux appuis
  const mute = page.locator('ch5-button[customClass="mute-btn"]').first();
  const mseq = [];
  for (let k = 0; k < 2; k++) { await page.evaluate(() => { window.__nat = []; }); await mute.click(); await page.waitForTimeout(400); mseq.push(await joinSeq("55")); }
  const muteOk = mseq.every((s) => s === "10");

  // 2. Tuile source : ouvrir la télécommande puis vérifier qu'aucune tuile ne reste pressée
  const tile = page.locator('ch5-button[customClass~="source-btn"][data-join="151"]').first();
  await tile.click();
  await page.waitForTimeout(600);
  const overlayVisible = await page.evaluate(() => { const o = document.getElementById("source-control-overlay"); return !!o && getComputedStyle(o).display !== "none"; });
  const pressedLeft = await page.evaluate(() => document.querySelectorAll('ch5-button[customClass~="source-btn"] .ch5-button--pressed, ch5-button[customClass~="source-btn"].ch5-button--pressed').length);
  // Simulation du cas terrain : la classe est posée par le composant et le relâchement n'arrive pas
  await page.evaluate(() => { const b = document.querySelector('ch5-button[customClass~="source-btn"][data-join="152"] .cb-btn'); if (b) b.classList.add("ch5-button--pressed"); });
  await page.evaluate(() => { if (typeof window.avSelect === "function") window.avSelect("152"); });
  await page.waitForTimeout(700);
  const pressedAfterForced = await page.evaluate(() => document.querySelectorAll('ch5-button[customClass~="source-btn"] .ch5-button--pressed').length);

  // Capture de la zone sources (planche-contact)
  const zone = page.locator("#volume-bar-wrapper").first();
  await page.evaluate(() => { const o = document.getElementById("source-control-overlay"); if (o) o.style.display = "none"; const b = document.getElementById("modal-backdrop"); if (b) b.style.display = "none"; });
  await page.screenshot({ path: `${OUT}/${LABEL}-${sup.name}-${theme}.png`, fullPage: false });

  const envErrors = errors.filter((e) => /websocket|WebSocket|net::|Failed to load resource|ERR_|CrComLib|xpanel/i.test(e));
  const realErrors = errors.filter((e) => !envErrors.includes(e));
  rows.push({ support: sup.name, theme, off: seq.join("/"), offOk, mute: mseq.join("/"), muteOk, overlayVisible, pressedLeft, pressedAfterForced, consoleErrors: realErrors.length, envErrors: envErrors.length });
  await ctx.close();
}
await browser.close();
console.table(rows);
const ok = rows.every((r) => r.offOk && r.muteOk && r.overlayVisible && r.pressedLeft === 0 && r.pressedAfterForced === 0 && r.consoleErrors === 0);
console.log(ok ? "VERT" : "ROUGE");
process.exit(ok ? 0 : 1);
