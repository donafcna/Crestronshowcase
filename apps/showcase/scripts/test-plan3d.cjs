/* Local browser regression test. NODE_PATH may point to the installed Playwright runtime.
   BASE_URL defaults to the local Vite preview. Outputs stay outside the public site. */
const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const out = process.env.TEST_OUTPUT || path.resolve('../../Claude outputs/codex-plan3d');
fs.mkdirSync(out, { recursive: true });
const base = process.env.BASE_URL || 'http://127.0.0.1:4200';
const route = '/interfaces/residentiel/villa-gemini-frequencetv';
(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.BROWSER_EXE ? { executablePath: process.env.BROWSER_EXE } : {}), ...(process.env.GPU === '1' ? {args:['--enable-gpu','--use-angle=d3d11']} : {}) });
  const context = await browser.newContext({ viewport: { width: 1280, height: 609 }, deviceScaleFactor: 1.5 });
  const page = await context.newPage(), errors = [], report = {base, checks: [], screenshots: [], metrics: []};
  // Screenshots can take several seconds on software-rendered CI. Keep the
  // existing automatic demo paused through real keyboard input during tests.
  const keepAlive = setInterval(() => page.locator('.device-stage').click({position:{x:5,y:5},timeout:1500}).catch(() => {}), 2000);
  page.on('pageerror', e => errors.push(e.message));
  const check = (label, value) => { assert.ok(value, label); report.checks.push(label); console.log('PASS '+label); };
  const pause = async () => { await page.locator('.device-stage').click({position:{x:5,y:5}}); };
  const settle = async () => { await page.evaluate(() => window.__plan3d.jump()); await page.waitForTimeout(400); await page.waitForFunction(()=>Object.values(window.__plan3d.rooms).every(r=>!r.lightFade)); };
  const shot = async name => { await pause(); await page.screenshot({path:path.join(out,name+'.png')}); report.screenshots.push(name+'.png'); };
  try {
    await page.goto(base+route+'/phone');
    await page.waitForFunction(() => window.__plan3d?.version === '2026-09-17-valley-1');
    await pause(); await page.waitForTimeout(1700);
    const gui=page.frameLocator('iframe');
    await gui.locator('#room-select').selectOption('1');
    await gui.locator('#scene-btn-54').click();
    await page.evaluate(()=>{const a=window.__plan3d;a.setRoom(1);a.setCircuit(1,0,1);a.setCircuit(1,1,1);a.setVideoSource(1,1);});
    await settle();
    check('3D version loaded',await page.evaluate(()=>!!window.__plan3d.version));
    for(const theme of ['dark','light','frost']) {
      const key=theme==='frost'?'glass':theme;
      await page.locator('iframe').evaluate((f,t)=>f.contentWindow.changeTheme(t),key);await page.waitForTimeout(900);
      check('Normal theme '+key+' selected',await gui.locator('#theme-select').inputValue()===key);await shot('normal-'+theme);
    }
    await page.locator('.btn-exit-fullscreen-device-corner').click();await page.waitForTimeout(700);await settle();
    const bounds=await page.evaluate(()=>({phone:document.querySelector('.phone-device-frame').getBoundingClientRect().toJSON(),side:document.querySelector('.workspace-device-sidebar').getBoundingClientRect().toJSON(),zone:window.__plan3d.metrics().zone}));
    check('Scene phone left edge < 50px', bounds.phone.left<50);
    check('3D zone clears phone and sidebar', bounds.zone.x>bounds.phone.right && bounds.zone.x+bounds.zone.w<bounds.side.left);
    for(const theme of ['dark','light','frost']) {
      const key=theme==='frost'?'glass':theme;
      await page.locator('iframe').evaluate((f,t)=>f.contentWindow.changeTheme(t),key);await page.waitForTimeout(900);
      check('Scene theme '+key+' selected',await gui.locator('#theme-select').inputValue()===key);await shot('scene-'+theme);
    }
    const x=bounds.zone.x+bounds.zone.w/2,y=bounds.zone.y+bounds.zone.h/2;
    await page.mouse.move(x,y);await page.mouse.wheel(0,350);await page.waitForTimeout(800);await settle();
    check('Wheel down shows villa',await page.evaluate(()=>window.__plan3d.activeRoom()===null&&window.__plan3d.selectedRoom()===1));
    await shot('villa-overview');
    // Isolate the landscape: a canvas-element screenshot also includes the
    // overlaid iPhone clock, GUI video and countdown, which legitimately move.
    await page.evaluate(()=>window.__plan3d.setDay(1));
    const skyClip={x:340,y:10,width:600,height:100};
    await page.waitForTimeout(1200);
    const stableA=await page.screenshot({clip:skyClip});await page.waitForTimeout(700);const stableB=await page.screenshot({clip:skyClip});
    fs.writeFileSync(path.join(out,'snow-a.png'),stableA);fs.writeFileSync(path.join(out,'snow-b.png'),stableB);
    check('Static snow pixels stable',stableA.equals(stableB));
    await page.mouse.wheel(0,-350);await page.waitForTimeout(800);await settle();
    check('Wheel up restores last room',await page.evaluate(()=>window.__plan3d.activeRoom()===1));
    await page.mouse.move(bounds.side.left+40,250);await page.mouse.wheel(0,350);await page.waitForTimeout(250);
    check('Sidebar wheel leaves view unchanged',await page.evaluate(()=>window.__plan3d.activeRoom()===1));
    await page.mouse.move(x,y);await page.keyboard.down('Control');await page.mouse.wheel(0,200);await page.keyboard.up('Control');
    check('Ctrl+wheel does not navigate 3D',await page.evaluate(()=>window.__plan3d.activeRoom()===1));
    await gui.locator('#scene-btn-51').click();
    await page.evaluate(()=>{const a=window.__plan3d;for(const k of ['volet','rideau','store'])a.shadePos(k,1);a.setVideoSource(1,0);});
    await page.waitForTimeout(1700);check('Closed shutters block daylight',await page.evaluate(()=>window.__plan3d.daylight()===0));await shot('salon-off-closed');
    await gui.locator('#scene-btn-54').click();
    await page.evaluate(()=>{const a=window.__plan3d;for(const k of ['volet','rideau','store'])a.shadePos(k,0);});await page.waitForTimeout(1700);await shot('salon-total-open');
    await page.evaluate(()=>{window.__plan3d.shadeScene(4)});await page.waitForTimeout(1600);await pause();
    check('Three motors move',await page.evaluate(()=>Object.values(window.__plan3d.rooms[1].shades).every(s=>s.pos>.1&&s.pos<1)));await shot('salon-motors-moving');
    await page.evaluate(()=>{window.__plan3d.shade('volet','stop')});const stopped=await page.evaluate(()=>window.__plan3d.rooms[1].shades.volet.pos);await page.waitForTimeout(500);
    check('Motor stop holds position',await page.evaluate(p=>window.__plan3d.rooms[1].shades.volet.pos===p,stopped));
    await page.evaluate(()=>{const a=window.__plan3d;a.setVideoSource(1,1);a.remote('menu');a.remote('right');});
    check('Apple remote selection',await page.evaluate(()=>window.__plan3d.rooms[1].tv.screen.st.sel===1));
    await page.evaluate(()=>window.__plan3d.remote('ok'));check('Apple remote opens selected app',await page.evaluate(()=>window.__plan3d.rooms[1].tv.screen.st.open===1));
    await page.evaluate(()=>{const a=window.__plan3d;a.remote('menu');a.setSetpoint(1,23.5);});
    check('Live thermostat updates',await page.evaluate(()=>window.__plan3d.rooms[1].hvac.thermo.st.setpoint===23.5));
    for(const id of [2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17]){
      await pause();await gui.locator('#room-select').selectOption(String(id));await page.waitForTimeout(250);await settle();
      check('GUI selects 3D room '+id,await page.evaluate(id=>window.__plan3d.activeRoom()===id,id));
      await gui.locator('#scene-btn-54').click();
      await page.evaluate(id=>{window.__plan3d.setCircuit(id,0,1);window.__plan3d.setCircuit(id,1,.65);},id);
      if([2,3,4,7,8,11,12,13].includes(id))await shot('room-'+id);
      if(id===11){await page.evaluate(()=>window.__plan3d.shadeScene(4));await page.waitForTimeout(350);check('Terrace shade scene supported',errors.length===0);}
    }
    await gui.locator('#room-select').selectOption('1');await settle();
    await pause();await page.waitForTimeout(4000);report.metrics.push(await page.evaluate(()=>window.__plan3d.metrics()));
    for(const size of [{width:1440,height:900},{width:1920,height:1080}]){await pause();await page.setViewportSize(size);await page.waitForTimeout(900);await settle();await shot('scene-'+size.width);}
    await page.setViewportSize({width:1280,height:609});
    await page.locator('.btn-exit-fullscreen-device-corner').click();
    for(const device of ['tablet','wallpanel']){
      await page.goto(base+route+'/'+device);await pause();await page.waitForTimeout(900);
      check(device+' keeps video background',await page.locator('.plan3d-bg-canvas').count()===0);
      await shot(device+'-normal');await page.locator('.btn-exit-fullscreen-device-corner').click();await shot(device+'-scene');
    }
    await page.goto(base+route+'/phone');await page.waitForFunction(()=>!!window.__plan3d?.version);await pause();await page.waitForTimeout(500);
    check('Remount reconnects GUI',await page.evaluate(()=>window.__plan3d.activeRoom()!==null));
    check('No uncaught browser errors',errors.length===0);
    report.errors=errors;report.status='passed';
  } catch(e) {report.status='failed';report.failure=e.stack;report.errors=errors;await page.screenshot({path:path.join(out,'failure.png')});throw e;}
  finally{clearInterval(keepAlive);fs.writeFileSync(path.join(out,'test-results.json'),JSON.stringify(report,null,2));await browser.close();}
})();
