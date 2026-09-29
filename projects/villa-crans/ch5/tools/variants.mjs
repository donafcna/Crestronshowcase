import { chromium } from "playwright";
import { mkdirSync } from "fs";
const OUT = process.argv[2]; mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
for (const v of ["A", "B", "C"]) for (const th of ["dark", "light"]) {
  const p = await b.newPage({ viewport: { width: 1920, height: 1200 }, deviceScaleFactor: 2 });
  await p.addInitScript(v => { window.VILLA_SLATS_ICON = v; window.JSInterface = { bridgeSendBooleanToNative() {}, bridgeSendIntegerToNative() {}, bridgeSendStringToNative() {}, bridgeSendObjectToNative() {}, bridgeSendArrayToNative() {} }; }, v);
  await p.goto("http://localhost:4181/index.html", { waitUntil: "networkidle" }); await p.waitForTimeout(1500);
  await p.evaluate(t => window.changeTheme(t), th);
  await p.evaluate(() => { window.changeRoomUI(7); window.openMotorsModal(); }); await p.waitForTimeout(900);
  const row = await p.$('.mc-card[data-motor="1"] .mc-slats');
  const shot = async n => p.screenshot({ path: `${OUT}/${v}-${th}-${n}.png`, clip: await row.boundingBox() });
  await shot(0);
  await p.click('.mc-card[data-motor="1"] .mc-slats .slats-cw'); await p.waitForTimeout(450); await shot(1); await p.waitForTimeout(1300); await shot(2);
  await p.click('.mc-card[data-motor="1"] .mc-slats .slats-ccw'); await p.waitForTimeout(1100); await shot(3); await p.waitForTimeout(1700); await shot(4);
  await p.close();
}
await b.close(); console.log("ok");
