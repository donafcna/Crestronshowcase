const assert = require('node:assert/strict');
const { chromium, devices } = require('playwright');

const base = process.argv[2] || 'http://localhost:4177';
const prefix = '/interfaces/residentiel/appartement-crans/';

(async () => {
  const browser = await chromium.launch();
  try {
    const cases = [
      ['desktop', 'main'], ['web-xpanel', 'climate'],
      ['wallpanel', 'wallpanel'], ['phone', 'mobile'], ['tablet', 'mobile'],
      ['phone', 'mobile', 'iPhone 15'], ['tablet', 'mobile', 'iPad Mini landscape'],
    ];
    for (const [route, variant, device] of cases) {
      const page = await browser.newPage(device ? devices[device] : { viewport: { width: 1600, height: 1000 } });
      const errors = [];
      const requests = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('console', message => {
        if (message.type() === 'error' && /Content Security Policy/.test(message.text())) errors.push(message.text());
      });
      page.on('websocket', socket => requests.push(socket.url()));
      page.on('request', request => {
        if (['fetch', 'xhr'].includes(request.resourceType()) && request.frame().url().includes('/xpanels/')) {
          requests.push(request.url());
        }
        if (/webxpanel\.js|cr-com-lib\.js|\/cws\//i.test(request.url())) requests.push(request.url());
      });

      await page.goto(base + prefix + route, { waitUntil: 'domcontentloaded' });
      const frame = await (await page.waitForSelector(`iframe[src$="/xpanels/${variant}.html"]`)).contentFrame();
      await frame.waitForFunction(() => !!window.A10Bench?.getState());
      assert.equal(new URL(page.url()).pathname, prefix + route);
      assert.match(await frame.title(), /^Six Senses A10/);
      assert.equal(await frame.locator('#connection').textContent(), 'Demo');
      assert.equal(await frame.evaluate(() => typeof window.WebXPanel), 'undefined');

      if (variant !== 'climate') {
        if (route === 'phone') assert.ok(await frame.locator('.room-select').count());
        else assert.ok(await frame.locator('[data-room="monitoring"]').count());
        await frame.getByRole('button', { name: 'Bright', exact: true }).click();
        assert.ok(await frame.evaluate(() => window.A10Bench.getState().lights.some(level => level === 100)));
        const light = frame.locator('input[data-light]').first();
        const index = Number(await light.getAttribute('data-light'));
        await light.evaluate(input => {
          input.value = '37';
          input.dispatchEvent(new Event('input', { bubbles: true }));
        });
        await frame.waitForFunction(id => window.A10Bench.getState().lights[id - 1] === 37, index);
        await frame.getByRole('button', { name: 'Off', exact: true }).click();
        assert.equal(await frame.evaluate(id => window.A10Bench.getState().lights[id - 1], index), 0);

        await frame.locator('[data-tab="shades"]').first().click();
        const motor = frame.locator('[data-op="7"][data-value="1"]').first();
        const id = Number(await motor.getAttribute('data-id'));
        await motor.click();
        await frame.waitForFunction(id => window.A10Bench.getState().shades[id - 1] > 50, id);
        await frame.locator(`[data-op="7"][data-id="${id}"][data-value="0"]`).click();
        const stopped = await frame.evaluate(id => window.A10Bench.getState().shades[id - 1], id);
        await frame.waitForTimeout(1200);
        assert.equal(await frame.evaluate(id => window.A10Bench.getState().shades[id - 1], id), stopped);
      } else {
        assert.equal(await frame.locator('[data-tab="lighting"], [data-tab="shades"], [data-room="monitoring"]').count(), 0);
        assert.ok(await frame.evaluate(() => A10Bench.config.rooms.every(room =>
          A10Bench.config.climate.some(zone => zone.roomId === room.id && zone.thermostat && !zone.hidden))));
      }

      if (variant !== 'climate') await frame.locator('[data-tab="climate"]').first().click();
      const increase = frame.locator('[data-op="8"]').filter({ hasText: '+' }).first();
      const zone = Number(await increase.getAttribute('data-id'));
      const before = await frame.evaluate(id => window.A10Bench.getState().climate[id - 1], zone);
      await increase.click();
      assert.equal(await frame.evaluate(id => window.A10Bench.getState().climate[id - 1], zone), before + 5);
      await frame.locator(`[data-op="9"][data-id="${zone}"][data-value="0"]`).click();
      assert.equal(await frame.evaluate(id => window.A10Bench.getState().power[id - 1], zone), 0);
      assert.deepEqual(requests, []);
      assert.deepEqual(errors, []);
      console.log(`${device || route} → ${variant} | commandes, retours et isolation réseau OK`);
      await page.close();
    }
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
