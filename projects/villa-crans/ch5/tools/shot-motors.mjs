#!/usr/bin/env node
/** Captures de la fenêtre Moteurs : 3 thèmes × {dalle 1920×1200, iPad 1180×820, iPhone 402×874}, pièce donnée, page 1 (et 2 si --page2).
 *  Usage : node tools/shot-motors.mjs <base> <dossier> [--room 7] [--page2] */
import { chromium } from "playwright";
import { mkdirSync } from "fs";
const [, , BASE, OUT, ...rest] = process.argv;
const arg = (n, d) => { const i = rest.indexOf(n); return i >= 0 ? rest[i + 1] : d; };
const ROOM = Number(arg("--room", "7"));
mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const VP = { dalle: { width: 1920, height: 1200, f: "index", dsf: 1 }, ipad: { width: 1180, height: 820, f: "index", dsf: 1 }, iphone: { width: 402, height: 874, f: "iphone", dsf: 2 } };
for (const [k, v] of Object.entries(VP)) {
  const p = await b.newPage({ viewport: { width: v.width, height: v.height }, deviceScaleFactor: v.dsf });
  await p.addInitScript(() => { window.JSInterface = { bridgeSendBooleanToNative() {}, bridgeSendIntegerToNative() {}, bridgeSendStringToNative() {}, bridgeSendObjectToNative() {}, bridgeSendArrayToNative() {} }; });
  await p.goto(`${BASE}/${v.f}.html`, { waitUntil: "networkidle" }); await p.waitForTimeout(1800);
  await p.addStyleTag({ content: "*, *::before, *::after { transition: none !important; animation-duration: 0s !important; }" });
  for (const th of ["dark", "light", "glass"]) {
    await p.evaluate(t => window.changeTheme(t), th); await p.waitForTimeout(400);
    await p.evaluate(id => { if (window.selectRoomFromConfig) window.selectRoomFromConfig(id); else if (window.changeRoomUI) window.changeRoomUI(id); const rs = document.getElementById("room-select"); if (rs) { rs.value = String(id); rs.dispatchEvent(new Event("change")); } if (window.changeRoomIphone) window.changeRoomIphone(String(id)); }, ROOM);
    await p.waitForTimeout(700);
    await p.evaluate(() => { if (window.openMotorsModal) window.openMotorsModal(); else document.getElementById("motors-overlay").style.display = "flex"; });
    await p.waitForTimeout(900);
    await p.screenshot({ path: `${OUT}/${k}-${th}.png` });
    if (rest.includes("--page2")) {
      const has = await p.evaluate(() => { const n = document.querySelector("#motors-pager .mc-next, .mc-pager .mc-next"); if (n && !n.disabled) { n.click(); return true; } return false; });
      if (has) { await p.waitForTimeout(500); await p.screenshot({ path: `${OUT}/${k}-${th}-p2.png` }); }
    }
    await p.evaluate(() => { if (window.closeMotorsModal) window.closeMotorsModal(); document.getElementById("motors-overlay").style.display = "none"; });
  }
  await p.close();
}
await b.close();
console.log("ok");
