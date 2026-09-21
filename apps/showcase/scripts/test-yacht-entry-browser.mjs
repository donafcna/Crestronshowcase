import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const base = process.env.BASE_URL || 'http://127.0.0.1:4173';
const out = 'test-results/yacht-entry';
await mkdir(out, { recursive: true });
const report = { checks: [], errors: [], entries: [] };
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
try {
  const context = await browser.newContext({ viewport: { width: 1366, height: 850 }, deviceScaleFactor: .6, reducedMotion: 'no-preference', serviceWorkers: 'block' });
  // Preserve camera easing and all render callbacks. Only pixel density is
  // reduced on this CPU-only runner; these tests are not performance claims.
  await context.addInitScript(() => {
    if (window !== window.top) return;
    window.__entryTrace = []; window.__entryWatch = false;
    const tick = () => {
      if (window.__entryWatch) {
        const el = document.querySelector('.yacht-background .luxury-background-frame');
        if (el) {
          const visible = Number(getComputedStyle(el).opacity) > .5;
          let detail = null;
          try {
            if (visible) detail = el.contentWindow.eval('({radius,desiredRadius,camera:camera.position.toArray(),state:window.__ftvModel.presentationState(),mode})');
          } catch { detail = { error: 'camera not available' }; }
          window.__entryTrace.push({ at: performance.now(), visible, ready: el.parentElement.dataset.ready, detail });
        }
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  const page = await context.newPage(); page.setDefaultTimeout(90000);
  page.on('pageerror', e => report.errors.push(e.message));
  const yachtLink = () => page.locator('.sidebar-nav .sector-btn').filter({ hasText: /^Yacht$/i });
  async function begin() { await page.evaluate(() => { window.__entryTrace = []; window.__entryWatch = true; }); }
  async function verify(label) {
    let trace = [];
    try {
      await page.waitForFunction(() => document.querySelector('.yacht-background')?.dataset.ready === 'true', null, { timeout: 90000 });
      // A host-ready message is not a sampled animation frame. Wait for actual
      // visible samples spanning the original observation interval; retain every
      // camera assertion instead of assuming CPU rendering fits in a fixed sleep.
      await page.waitForFunction(() => {
        const visible = window.__entryTrace.filter(sample => sample.visible);
        return visible.length >= 3 && visible.at(-1).at - visible[0].at >= 1200;
      }, null, { timeout: 30000, polling: 100 });
    } finally {
      trace = await page.evaluate(() => { window.__entryWatch = false; return window.__entryTrace; });
      await writeFile(`${out}/${label}-trace.json`, JSON.stringify(trace, null, 2));
    }
    const visible = trace.filter(t => t.visible), hidden = trace.filter(t => !t.visible);
    assert.ok(hidden.length > 0, label + ': pending frame must stay hidden');
    assert.ok(visible.length > 1, label + ': rendered frame must eventually be shown');
    for (const sample of visible) {
      assert.equal(sample.ready, 'true', label + ': no scene before host is ready');
      assert.ok(sample.detail?.state?.rendered, label + ': rendered acknowledgement required');
      assert.ok(Math.abs(sample.detail.radius - sample.detail.desiredRadius) < .001, label + ': no initial dolly on visible frames');
    }
    const first = visible[0].detail, last = visible.at(-1).detail;
    assert.ok(Math.abs(first.radius - last.radius) < .001, label + ': first framing equals final framing');
    assert.equal(await page.locator('.yacht-background .luxury-background-loading').count(), 0);
    report.entries.push({ label, hiddenFrames: hidden.length, visibleFrames: visible.length, firstRadius: first.radius, finalRadius: last.radius, firstCamera: first.camera, finalCamera: last.camera });
    report.checks.push(label + ': hidden until rendered, correct first camera, no subsequent automatic receding');
  }
  await page.goto(`${base}/contact?lang=fr`, { waitUntil: 'domcontentloaded' });
  // Simulate the user's left-menu click, not only direct navigation to a model.
  await begin(); await yachtLink().click(); await verify('cold-menu-entry');
  const modelFrame = () => page.frames().find(f => /ftv-luxury\/models\/yacht\.html/.test(f.url()));
  async function capture(label) {
    const f = modelFrame();
    await f.evaluate(() => { window.__ftvPaused = true; renderer.render(scene, camera); });
    await page.screenshot({ path: `${out}/${label}.png`, timeout: 90000 });
    await f.evaluate(() => { window.__ftvPaused = false; });
  }
  await capture('normal-final-frame');
  // Repeat after another sector; previous ready state must not leak.
  await page.locator('.sidebar-nav .nav-btn[href="/contact"]').click();
  await page.waitForSelector('.yacht-background', { state: 'detached' });
  await begin(); await yachtLink().click(); await verify('warm-menu-entry');
  await page.locator('.sidebar-nav .nav-btn[href="/contact"]').click();
  await page.waitForSelector('.yacht-background', { state: 'detached' });
  let delayed = false;
  await page.route('**/yacht-exterior-finalize.js', async route => { delayed = true; await new Promise(r => setTimeout(r, 1800)); await route.continue(); });
  await begin(); await yachtLink().click(); await verify('slow-module-entry'); assert.equal(delayed, true);
  await page.unroute('**/yacht-exterior-finalize.js');
  // Changed host geometry during loading must invalidate a stale request.
  await page.locator('.sidebar-nav .nav-btn[href="/contact"]').click();
  await page.waitForSelector('.yacht-background', { state: 'detached' });
  await begin(); await yachtLink().click();
  await page.waitForSelector('.yacht-background'); await page.setViewportSize({ width: 1536, height: 864 });
  await verify('resized-entry');
  // Mode Scene creates/repositions the background with a different free area.
  await begin(); await page.locator('.btn-exit-fullscreen-device-corner').click();
  await page.waitForTimeout(2000);
  await page.waitForFunction(() => document.querySelector('.yacht-background')?.dataset.ready === 'true');
  await page.evaluate(() => { window.__entryWatch = false; });
  await capture('scene-final-frame'); report.checks.push('Mode Scene remains available after entry');
  // Existing manual zoom must still work and retain its distance over layout ticks.
  const f = modelFrame();
  const point = await page.evaluate(() => { const b = document.querySelector('.luxury-background-frame').getBoundingClientRect(), p = document.querySelector('.phone-device-frame').getBoundingClientRect(), s = document.querySelector('.workspace-device-sidebar').getBoundingClientRect(); return { x: (p.right + s.left) / 2, y: b.top + b.height * .6 }; });
  const start = await f.evaluate(() => desiredRadius);
  await page.mouse.move(point.x, point.y); await page.mouse.wheel(0, -120);
  await f.waitForFunction(start => desiredRadius < start, start);
  const near = await f.evaluate(() => desiredRadius); await page.waitForTimeout(1000);
  assert.ok(Math.abs(near - await f.evaluate(() => desiredRadius)) < .001);
  await page.mouse.wheel(0, 120); await f.waitForFunction(near => desiredRadius > near, near);
  report.checks.push('mouse wheel in/out and persistence after the first-frame handshake');
  await context.close(); assert.deepEqual(report.errors, []);
} catch (e) { report.errors.push(e.stack || String(e)); process.exitCode = 1; }
finally { await writeFile(`${out}/report.json`, JSON.stringify(report, null, 2)); console.log(JSON.stringify(report, null, 2)); await browser.close(); }
