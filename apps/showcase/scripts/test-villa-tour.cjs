const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const base = process.env.BASE_URL || 'http://127.0.0.1:4211';
const out = process.env.TEST_OUTPUT || path.resolve('../../Claude outputs/villa-tour');
fs.mkdirSync(out, { recursive: true });
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.BROWSER_EXE, args: ['--enable-gpu', '--use-angle=d3d11'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1.5 });
  const report = { base, checks: [], samples: [], errors: [], legacyErrors: [] };
  const check = (name, ok) => { assert.ok(ok, name); report.checks.push(name); };
  page.on('pageerror', e => report.errors.push(e.message));
  page.on('console', m => {
    if (m.type() !== 'error') return;
    const text = m.text();
    if (/WebXPanel|<path> attribute d/.test(text)) report.legacyErrors.push(text);
    else report.errors.push(text);
  });
  const captured = new Set();
  const read = () => page.evaluate(() => {
    const w = document.querySelector('iframe')?.contentWindow, v = w?.Villa, a = window.__plan3d;
    window.__tourSelections ??= [];
    const select = w?.document.querySelector('#room-select');
    if (select && select !== window.__observedTourSelect) {
      window.__observedTourSelect = select;
      select.addEventListener('change', e => window.__tourSelections.push({at:performance.now(), room:Number(e.target.value)}), true);
    }
    const rooms = Object.values(v?.demoRooms?.() || {});
    const shades = a ? Object.values(a.rooms).filter(r => r.shades?.rideau).map(r => r.shades.rideau) : [];
    const cursor = document.querySelector('.demo-cursor');
    return { at: performance.now(), device: location.pathname.split('/').pop(), ready: v?.ready, room: v?.activeRoom,
      seconds: a?.environment().seconds, day: a?.environment().day, phase: a?.navigation().phase, camera: a?.navigation().camera,
      allOff: rooms.length === 17 && rooms.every(r => r.scene === '51' && r.circuits.every(x => x === 0) && !r.curtainClosed),
      allLow: rooms.length === 17 && rooms.every(r => r.scene === '52' && Math.max(...r.circuits) <= 65535 * .31 && r.curtainClosed),
      curtains: shades.map(s => ({ pos: s.pos, target: s.cible })),
      renderOff: a && Object.values(a.rooms).every(r => r.renderLevels.every(x => x < .001)),
      renderLow: a && Object.values(a.rooms).every(r => Math.abs(r.renderLevels[0] - .12) < .001 && Math.abs(r.renderLevels[2] - .3) < .001),
      countdown: document.querySelector('.demo-countdown')?.textContent || '', cursor: cursor?.getAttribute('style'), visible: cursor?.classList.contains('visible') };
  });
  try {
    // Actual left-menu entry, including an English label and a different active project.
    await page.goto(base + '/interfaces/residentiel/appartement-carouge/phone?lang=en');
    await page.locator('.sidebar-nav .sector-btn[href="/interfaces/residentiel"]').click();
    await page.waitForURL('**/villa-gemini-frequencetv/phone?lang=en');
    await page.waitForFunction(() => window.__plan3d?.environment().seconds > .05);
    check('Residential starts Villa Crans on Smartphone', page.url().includes('villa-gemini-frequencetv/phone'));
    let firstWall = null, secondPhone = null, finalNight = false;
    const deadline = Date.now() + 125000;
    while (Date.now() < deadline) {
      const s = await read(); report.samples.push(s);
      if (s.device === 'phone' && s.seconds < 2) check('Introduction remains completely zoomed out', s.phase === 'overview-closed');
      if (s.seconds > 1 && s.seconds < 2 && !captured.has('overview')) { await page.screenshot({ path: path.join(out, 'overview.png') }); captured.add('overview'); }
      if (s.seconds > 43 && s.seconds < 55 && !captured.has('night')) {
        check('Night: all 17 rooms use low varied scene', s.allLow && s.renderLow);
        check('Night: every curtain is closed', s.curtains.length > 0 && s.curtains.every(c => c.pos > .99 && c.target === 1));
        await page.screenshot({ path: path.join(out, 'night.png') }); captured.add('night'); console.log('Night verified');
      }
      if (s.device === 'wallpanel' && firstWall === null) { firstWall = s.at; console.log('TSW entered', firstWall); }
      if (firstWall && s.device === 'phone' && secondPhone === null) { secondPhone = s.at; console.log('Smartphone resumed', secondPhone); }
      if (secondPhone && s.seconds > 87 && s.seconds < 100 && !captured.has('day')) {
        check('Dawn: all 17 rooms are OFF', s.allOff && s.renderOff);
        check('Dawn: every curtain is open', s.curtains.length > 0 && s.curtains.every(c => c.pos < .01 && c.target === 0));
        await page.screenshot({ path: path.join(out, 'day.png') }); captured.add('day'); console.log('Dawn verified');
      }
      if (secondPhone && s.seconds > 114) { check('Night returns in the next cycle', s.allLow && s.renderLow); finalNight = true; break; }
      await page.waitForTimeout(200);
    }
    check('Loop returns to Smartphone after TSW', !!firstWall && !!secondPhone && finalNight);
    const samples = report.samples, phone = samples.filter(s => s.device === 'phone' && s.at < firstWall);
    const origin = phone[0].at - phone[0].seconds * 1000;
    check('Smartphone lasts 60 seconds', Math.abs(firstWall - origin - 60000) < 1600);
    const wallReady = samples.find(s => s.device === 'wallpanel' && s.ready);
    check('TSW lasts 10 seconds once loaded', Math.abs(secondPhone - wallReady.at - 10000) < 1200);
    report.selections = await page.evaluate(() => window.__tourSelections);
    const changes = report.selections.filter(s => s.at < firstWall).map(s => ({...s, seconds:(s.at-origin)/1000}));
    check('First room selected after 3 seconds', changes[0]?.seconds >= 2.9 && changes[0]?.seconds < 4.5);
    check('Room selected every 5 seconds', changes.length >= 11 && changes.slice(1).every((s, i) => Math.abs(s.seconds - changes[i].seconds - 5) < 1.6));
    check('Random room bag does not repeat rooms during the minute', new Set(changes.map(s => s.room)).size === changes.length);
    check('Animated cursor moves on the GUI', new Set(phone.filter(s => s.visible).map(s => s.cursor)).size >= 4 && phone.filter((s, i) => i > 0 && s.cursor !== phone[i - 1].cursor).length > 20);
    check('No inactivity countdown between automatic chassis changes', samples.every(s => !s.countdown));
    const restart = samples.find(s => s.at >= secondPhone && s.seconds);
    check('Environment time survives TSW and the 3D remount', restart.seconds > 69 && restart.seconds < 78);
    check('Second Smartphone introduction uses the closed villa', samples.some(s => s.at >= secondPhone && s.phase === 'overview-closed'));
    // A real gesture cancels deadlines as well as synthetic clicks and ambience changes.
    const gui = page.frames().find(f => f.url().includes('/showcases/'));
    await gui.locator('#room-select').selectOption('1');
    await gui.locator('#nav-lights').click();
    await gui.locator('#scene-btn-54').click();
    const manual = await read();
    await page.waitForTimeout(5500);
    check('Manual input pauses room selection for 60 seconds', (await read()).room === 1 && (await read()).countdown.includes('5'));
    check('Manual scene survives the tour pause', await gui.evaluate(() => Villa.get('b', '54') === true));
    check('Tour cursor is hidden while paused', !(await read()).visible);
    for (const mode of ['normal', 'scene']) {
      if (mode === 'scene') await page.locator('.btn-exit-fullscreen-device-corner').click();
      for (const theme of ['dark', 'light', 'glass']) {
        await gui.evaluate(t => changeTheme(t), theme); await page.waitForTimeout(700);
        await page.screenshot({ path: path.join(out, `${mode}-${theme}.png`) });
        check(`GUI ${mode}/${theme} keeps manual control`, await gui.locator('#room-select').inputValue() === '1');
      }
    }
    check('Pause countdown was armed by real input', !!manual.countdown);
    report.performance = await page.evaluate(() => __plan3d.metrics());
    check('No new JavaScript or rendering errors', report.errors.length === 0);
    report.status = 'passed'; console.log('PASS', report.checks.length);
  } catch (e) { report.status = 'failed'; report.failure = e.stack; throw e; }
  finally { fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify(report, null, 2)); await browser.close(); }
})();
