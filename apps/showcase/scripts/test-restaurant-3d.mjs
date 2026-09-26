import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve('dist');
const out = path.resolve(process.env.TEST_OUTPUT || '../../work/restaurant-220');
fs.mkdirSync(out, { recursive: true });
const mime = { '.js':'application/javascript', '.css':'text/css', '.html':'text/html', '.json':'application/json', '.png':'image/png', '.webp':'image/webp', '.svg':'image/svg+xml', '.mp4':'video/mp4' };
const server = http.createServer((req, res) => {
  const name = decodeURIComponent(req.url.split('?')[0]);
  let file = path.join(root, name);
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    if (path.extname(name)) return res.writeHead(404).end();
    file = path.join(root, 'index.html');
  }
  res.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream');
  res.end(fs.readFileSync(file));
});
if (!process.env.BASE_URL) await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = process.env.BASE_URL || `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ executablePath: process.env.BROWSER_EXE, args: JSON.parse(process.env.BROWSER_ARGS || '[]'), headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 960 } });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
page.on('response', response => { if (response.status() >= 400 && !response.url().includes('google')) errors.push(`${response.status()} ${response.url()}`); });
try {
  await page.goto(`${base}/interfaces/restaurant/sushi-bar-kyoto/phone`, { waitUntil: 'domcontentloaded' });
  await page.locator('.restaurant-background[data-ready="true"]').waitFor({ timeout: 30_000 });
  assert.equal(await page.locator('.restaurant-background iframe').count(), 1);
  assert.equal(await page.locator('.bg-video-container').count(), 0);
  const frame = page.frames().find(item => item.url().includes('/restaurant-lumiere/model.html'));
  assert.ok(frame, 'Le modèle 3D restaurant est chargé');
  await frame.waitForFunction(() => window.__restaurant3d?.building);
  assert.ok(await frame.evaluate(() => window.__restaurant3d.building.children.length > 100), 'Le modèle contient le mobilier et l’architecture');
  assert.equal(await page.locator('.rk-zone option').count(), 15, 'Le GUI propose quinze espaces');
  const dimensions = await frame.evaluate(() => { const size=new THREE.Vector3();new THREE.Box3().setFromObject(window.__restaurant3d.building).getSize(size);return size.toArray() });
  assert.ok(dimensions[0] >= 70 && dimensions[2] >= 52, 'Le restaurant couvre quatre fois l’emprise initiale');
  const cameraGoals = new Set();
  for (const option of await page.locator('.rk-zone option').evaluateAll(items => items.map(item => item.value))) {
    await page.locator('.rk-zone select').selectOption(option);
    await page.waitForTimeout(25);
    cameraGoals.add(await frame.evaluate(() => window.__restaurant3d.desiredPosition.join(',')));
  }
  assert.equal(cameraGoals.size, 15, 'Chaque espace possède un cadrage de caméra distinct');
  await page.locator('.rk-zone select').selectOption('rooftop');
  await page.waitForTimeout(700);
  assert.equal(await frame.evaluate(() => window.__restaurant3d.modelState.zone), 'rooftop');
  assert.equal(await frame.evaluate(() => Object.keys(window.__restaurant3d.roomGroups).length), 15, 'Le modèle contient quinze espaces distincts');
  assert.equal(await frame.evaluate(() => Object.values(window.__restaurant3d.roomGroups).filter(group => group.visible).length), 1, 'La zone ciblée est isolée pendant le zoom');
  await page.locator('.device-stage').dispatchEvent('wheel', { deltaY: 120 });
  await page.waitForTimeout(100);
  assert.equal(await frame.evaluate(() => window.__restaurant3d.modelState.view), 'overview', 'La molette descendante affiche le bâtiment complet');
  assert.equal(await frame.evaluate(() => Object.values(window.__restaurant3d.roomGroups).filter(group => group.visible).length), 15, 'La vue générale remonte les quinze espaces');
  await page.waitForTimeout(900);
  await page.screenshot({ path: path.join(out, 'restaurant-overview.png'), fullPage: true });
  await page.waitForTimeout(600);
  await page.locator('.device-stage').dispatchEvent('wheel', { deltaY: -120 });
  await page.waitForTimeout(100);
  assert.equal(await frame.evaluate(() => window.__restaurant3d.modelState.view), 'focus', 'La molette montante revient à la dernière zone');
  await page.locator('.rk-scenes button').filter({ hasText: 'Rooftop' }).click();
  await page.waitForTimeout(200);
  assert.equal(await frame.evaluate(() => window.__restaurant3d.modelState.levels.pergola), 88);
  await page.screenshot({ path: path.join(out, 'restaurant-phone.png'), fullPage: true });

  for (const device of ['wallpanel', 'tablet']) {
    await page.goto(`${base}/interfaces/restaurant/sushi-bar-kyoto/${device}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    assert.equal(await page.locator('.restaurant-background').count(), 0, `${device}: pas de modèle 3D`);
    assert.equal(await page.locator('.bg-video-container').count(), 1, `${device}: vidéo conservée`);
  }

  await page.goto(`${base}/interfaces/hotellerie/hotel-brassus/phone`, { waitUntil: 'domcontentloaded' });
  const phoneElement = await page.locator('iframe[src*="/showcases/hotel-brassus/phone.html"]').first().elementHandle({ timeout: 30_000 });
  const phone = await phoneElement?.contentFrame();
  assert.ok(phone, 'L’interface iPhone Hotel Brassus est chargée');
  await phone.waitForSelector('.scene');
  const palette = await phone.evaluate(() => ({
    bg: getComputedStyle(document.body).getPropertyValue('--bg').trim(),
    ink: getComputedStyle(document.body).getPropertyValue('--ink').trim(),
    gold: getComputedStyle(document.body).getPropertyValue('--gold').trim(),
  }));
  assert.deepEqual(palette, { bg:'#eef1ef', ink:'#283b32', gold:'#d2ab21' });
  const buttonStates = [];
  for (const tab of ['lighting', 'audio', 'blinds', 'temperature']) {
    await phone.locator(`nav button[data-tab="${tab}"]`).click();
    await page.waitForTimeout(220);
    const states = await phone.locator('button:not(:disabled)').evaluateAll(buttons => buttons.map(button => {
      const style = getComputedStyle(button);
      return { pressed:button.getAttribute('aria-pressed'), background:style.backgroundColor, image:style.backgroundImage, border:style.borderTopColor };
    }));
    buttonStates.push(...states);
  }
  assert.ok(buttonStates.filter(state => state.pressed === 'false' || state.pressed === null).every(state => state.background === 'rgb(38, 63, 54)'));
  assert.ok(buttonStates.filter(state => state.pressed === 'true').every(state => state.image.startsWith('radial-gradient') && state.border === 'rgb(210, 171, 33)'));
  await page.screenshot({ path: path.join(out, 'hotel-brassus-phone.png'), fullPage: true });
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ checks: 23, dimensions, cameraGoals:cameraGoals.size, palette, buttonStates:buttonStates.length, errors }, null, 2));
} finally {
  await browser.close();
  if (server.listening) server.close();
}
