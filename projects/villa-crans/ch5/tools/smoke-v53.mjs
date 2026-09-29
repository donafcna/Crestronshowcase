import { chromium } from "playwright";
const BASE = process.argv[2];
const bench = /panelInstance\.initialize is not a function|favicon\.ico|ERR_|\[WXP\]|Failed to load resource/;
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
for (const [f, vp] of [["index", { width: 1920, height: 1200 }], ["index", { width: 1180, height: 820 }], ["iphone", { width: 402, height: 874 }]]) {
  const p = await b.newPage({ viewport: vp }); const errs = [];
  await p.addInitScript(() => { window.JSInterface = { bridgeSendBooleanToNative() {}, bridgeSendIntegerToNative() {}, bridgeSendStringToNative() {}, bridgeSendObjectToNative() {}, bridgeSendArrayToNative() {} }; });
  p.on("console", m => { if (m.type() === "error" && !bench.test(m.text() + (m.location().url || ""))) errs.push(m.text().slice(0, 100)); });
  p.on("pageerror", e => { if (!bench.test(e.message)) errs.push("pageerror " + e.message.slice(0, 120)); });
  await p.goto(`${BASE}/${f}.html`, { waitUntil: "networkidle" }); await p.waitForTimeout(1500);
  for (const th of ["dark", "light", "glass"]) {
    await p.evaluate(t => window.changeTheme(t), th);
    for (const room of [1, 2, 7, 12]) await p.evaluate(r => { if (window.changeRoomUI) window.changeRoomUI(r); if (window.changeRoomIphone) window.changeRoomIphone(String(r)); }, room);
    const opened = await p.evaluate(() => { const names = Object.keys(window).filter(k => /^open\w*Modal$/.test(k) && typeof window[k] === "function" && !/Source|Alarm|Admin/.test(k)); names.forEach(n => { try { window[n](); } catch (e) { console.error("open " + n + " " + e.message); } const c = n.replace(/^open/, "close"); try { window[c] && window[c](); } catch (e) {} }); return names.length; });
    await p.evaluate(() => { window.animateGroupBlinds && ["volets","rideaux","stores"].forEach(g => window.animateGroupBlinds(g, "close")); window.animateAllBlinds && window.animateAllBlinds("open"); if (window.VUX && VUX.getBlindPosition) for (let i = 1; i <= 12; i++) VUX.getBlindPosition(i); });
    await p.waitForTimeout(300);
    console.log(f, vp.width, th, "fenêtres ouvertes:", opened, "erreurs:", errs.splice(0));
  }
  await p.close();
}
await b.close();
