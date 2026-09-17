// Real GUI feedback and background pointer regression; no edits to GUI sources.
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const out=process.env.TEST_OUTPUT||path.resolve('../../Claude outputs/codex-plan3d-navigation');
const base=process.env.BASE_URL||'http://127.0.0.1:4200';
fs.mkdirSync(out,{recursive:true});
(async()=>{
  const browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXE?{executablePath:process.env.BROWSER_EXE}:{}),...(process.env.GPU==='1'?{args:['--enable-gpu','--use-angle=d3d11']}: {})});
  const p=await browser.newPage({viewport:{width:1280,height:800},deviceScaleFactor:1.5});
  const errors=[],report={base,checks:[],screenshots:[]};p.on('pageerror',e=>errors.push(e.message));
  const keep=setInterval(()=>p.locator('.device-stage').click({position:{x:5,y:5},timeout:1000}).catch(()=>{}),2000);
  const check=(name,v)=>{assert.ok(v,name);report.checks.push(name);console.log('PASS '+name);};
  const shot=async name=>{await p.screenshot({path:path.join(out,name+'.png')});report.screenshots.push(name);};
  const nav=()=>p.evaluate(()=>window.__plan3d.navigation());
  const waitPhase=phase=>p.waitForFunction(s=>window.__plan3d.navigation().phase===s,phase);
  const select=async id=>{await p.frameLocator('iframe').locator('#room-select').selectOption(String(id));await waitPhase('room');};
  const scene=async id=>{await p.frameLocator('iframe').locator('#scene-btn-'+id).click();await p.waitForTimeout(100);await p.waitForFunction(()=>Object.values(window.__plan3d.rooms).every(r=>!r.lightFade));};
  try{
    await p.goto(base+'/interfaces/residentiel/villa-gemini-frequencetv/phone');await require('./helpers/villa-manual.cjs').pauseVillaTour(p);
    await p.waitForFunction(()=>window.__plan3d?.version==='2026-09-17-journey-1');await waitPhase('room');
    await select(1);await scene(51);
    await p.evaluate(()=>{for(const k of ['volet','rideau','store'])window.__plan3d.shadePos(k,1);});
    await p.waitForTimeout(3000);
    check('Real OFF button extinguishes both light circuits',(await nav()).lamps.every(v=>v===0));
    check('Closed motors suppress ambient daylight',(await nav()).day<.0001);
    check('TV casts only a weak local light',await p.evaluate(()=>window.__plan3d.rooms[1].tv.light.intensity<=.28));
    await shot('after-off');
    await p.evaluate(()=>window.__plan3d.setVideoSource(1,0));await shot('after-off-tv-off');
    await scene(54);await shot('after-total');
    // A saved OFF preset must not leave unaccountable lighting in the plan.
    await p.locator('iframe').evaluate(f=>f.contentWindow.localStorage.setItem('villa_scene_1_1',JSON.stringify({lights:{71:65535,72:65535}})));
    await scene(51);
    check('Saved OFF preset cannot leave lamps on',(await nav()).lamps.every(v=>v===0));
    await p.locator('iframe').evaluate(f=>{f.contentWindow.localStorage.removeItem('villa_scene_1_1');f.contentWindow.CrComLib.publishEvent('n','71',30000);});
    await p.waitForTimeout(150);
    check('Manual circuit control exits OFF and relights',await p.evaluate(()=>!window.__plan3d.rooms[1].sceneOff&&window.__plan3d.navigation().lamps[0]>0));
    await scene(54);await select(2);await scene(54);await select(1);
    check('Equal levels survive room switch',await p.evaluate(()=>window.__plan3d.rooms[1].levels.every(v=>v===1)));
    await scene(51);await select(2);await scene(51);await select(1);
    check('OFF remains dark after switching between OFF rooms',(await nav()).lamps.every(v=>v===0));
    await p.locator('.btn-exit-fullscreen-device-corner').click();await waitPhase('room');await p.waitForTimeout(700);
    await select(8);await scene(54);await p.evaluate(()=>window.__plan3d.setVideoSource(8,1));
    check('All basement rooms have no window',await p.evaluate(()=>Object.values(__plan3d.rooms).filter(r=>r.cfg.niveau<0).every(r=>!r.win)));
    await shot('cinema-no-window');
    // The command itself may change the target, never the camera position.
    for(const id of [3,9,4,8]){
      const diff=await p.evaluate(id=>{const a=window.__plan3d,b=a.navigation().camera;document.querySelector('iframe').contentWindow.changeRoomIphone(String(id));return Math.hypot(...a.navigation().camera.map((v,i)=>v-b[i]));},id);
      check('No camera snap on rapid selection '+id,diff<.000001);await p.waitForTimeout(110);
    }
    await waitPhase('room');check('Rapid selections finish on latest room',await p.evaluate(()=>window.__plan3d.activeRoom()===8));
    let zone=await p.evaluate(()=>window.__plan3d.metrics().zone),rect=await p.locator('.plan3d-bg-canvas').boundingBox();
    const bg={x:rect.x+zone.x+zone.w/2,y:rect.y+zone.y+zone.h/2};
    await p.mouse.move(bg.x,bg.y);await p.mouse.wheel(0,400);await waitPhase('overview-closed');
    check('Overview restores all exterior walls',(await nav()).walls===1);await shot('overview-closed');
    check('Closed villa has physically assembled storeys',await p.evaluate(()=>window.__plan3d.navigation().explosion===0&&Object.values(window.__plan3d.rooms).every(r=>Math.abs(r.y0-r.cfg.niveau*3.6)<.001)));
    await p.mouse.click(bg.x,bg.y);await waitPhase('overview-open');
    check('First background click removes walls without zoom',(await nav()).walls===0&&await p.evaluate(()=>window.__plan3d.activeRoom()===null));await shot('overview-open');
    check('Open overview separates storeys',await p.evaluate(()=>window.__plan3d.navigation().explosion===1&&Object.values(window.__plan3d.rooms).every(r=>Math.abs(r.y0-(r.ext?0:r.cfg.niveau*7.2+7.2))<.001)));
    const point=await p.evaluate(()=>window.__plan3d.roomPoint(9));
    await p.mouse.click(rect.x+point.x,rect.y+point.y);await waitPhase('room');
    check('Room click selects same room in Smartphone',await p.frameLocator('iframe').locator('#room-select').inputValue()==='9');
    check('Room click focuses picked room',await p.evaluate(()=>window.__plan3d.activeRoom()===9));
    // Selecting another piece from a closed overview: fade first, camera second.
    await p.mouse.move(bg.x,bg.y);await p.mouse.wheel(0,400);await waitPhase('overview-closed');
    const before=await nav();await p.evaluate(()=>{window.estatePhases=[];const sample=()=>{const s=window.__plan3d.navigation().phase;if(window.estatePhases.at(-1)!==s)window.estatePhases.push(s);if(s!=='room')requestAnimationFrame(sample);};requestAnimationFrame(sample);});await p.frameLocator('iframe').locator('#room-select').selectOption('7');
    const during=await nav();
    check('Walls fade before camera travel',during.phase==='opening'&&!during.moving&&Math.hypot(...during.camera.map((v,i)=>v-before.camera[i]))<.001);
    await waitPhase('room');check('GUI selection from overview completes smoothly',await p.evaluate(()=>window.__plan3d.activeRoom()===7));
    check('Sequence opens shell then explodes then focuses',await p.evaluate(()=>['opening','exploding','focusing','room'].every((s,i,arr)=>window.estatePhases.includes(s)&&(i===0||window.estatePhases.indexOf(s)>window.estatePhases.indexOf(arr[i-1])))));
    // Interrupt the explosion: the most recent room wins without snapping.
    await p.evaluate(()=>{window.__plan3d.overview();window.__plan3d.jump();});await p.frameLocator('iframe').locator('#room-select').selectOption('9');await waitPhase('exploding');
    const interruption=await p.evaluate(()=>{const a=window.__plan3d,b=a.navigation().camera;document.querySelector('iframe').contentWindow.changeRoomIphone('4');return Math.hypot(...a.navigation().camera.map((v,i)=>v-b[i]));});await waitPhase('room');
    check('Changing selection during explosion preserves camera continuity',interruption<.000001&&await p.evaluate(()=>window.__plan3d.activeRoom()===4));
    await p.mouse.wheel(0,400);await waitPhase('overview-closed');await p.mouse.wheel(0,-400);await waitPhase('room');
    check('Wheel refocus also removes walls',(await nav()).walls===0);
    await p.locator('iframe').evaluate(f=>f.contentWindow.openGlobalControlModal());
    await p.frameLocator('iframe').locator('#global-control-overlay ch5-button[data-join="405"]').click();await p.waitForTimeout(4400);
    check('Global close animates every room motor',await p.evaluate(()=>Object.values(window.__plan3d.rooms).every(r=>Object.values(r.shades||{}).every(s=>s.pos>.999))));
    await p.frameLocator('iframe').locator('#global-control-overlay ch5-button[data-join="404"]').click();await p.waitForTimeout(4400);
    check('Global open animates every room motor',await p.evaluate(()=>Object.values(window.__plan3d.rooms).every(r=>Object.values(r.shades||{}).every(s=>s.pos<.001))));
    await p.locator('iframe').evaluate(f=>f.contentWindow.closeGlobalControlModal());
    await select(1);await scene(54);
    for(const theme of ['dark','light','frost']){await p.locator('iframe').evaluate((f,t)=>f.contentWindow.changeTheme(t),theme==='frost'?'glass':theme);await p.waitForTimeout(900);await shot('scene-'+theme);}
    await p.waitForTimeout(500);
    report.performance=[];
    for(const view of ['room','closed','open']){
      if(view==='closed'){await p.evaluate(()=>{window.__plan3d.overview();window.__plan3d.jump();});}
      if(view==='open'){await p.mouse.click(bg.x,bg.y);await waitPhase('overview-open');}
      await p.waitForTimeout(1500);const start=await p.evaluate(()=>({frame:window.__plan3d.metrics().renderedFrames,t:performance.now()}));await p.waitForTimeout(4000);
      report.performance.push({view,...await p.evaluate(start=>({fps:(window.__plan3d.metrics().renderedFrames-start.frame)/((performance.now()-start.t)/1000),...window.__plan3d.metrics()}),start)});
    }
    check('No uncaught browser errors',errors.length===0);report.status='passed';
  }catch(e){report.status='failed';report.failure=e.stack;await shot('failure');throw e;}
  finally{clearInterval(keep);report.errors=errors;fs.writeFileSync(path.join(out,'navigation-results.json'),JSON.stringify(report,null,2));await browser.close();}
})();
