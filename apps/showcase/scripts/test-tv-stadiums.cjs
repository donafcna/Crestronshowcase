// Sports programmes via the real GUI: rendering, remote transport, themes and frame budget.
const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const base=process.env.BASE_URL||'http://127.0.0.1:4210',out=process.env.TEST_OUTPUT||path.resolve('../../Claude outputs/sports-stadiums/qa');
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.BROWSER_EXE,args:['--enable-gpu','--use-angle=d3d11']}),page=await browser.newPage({viewport:{width:1280,height:800},deviceScaleFactor:1.5}),errors=[];
 const report={base,checks:[],performance:[]};
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 const check=(name,value)=>{assert.ok(value,name);report.checks.push(name);console.log('PASS '+name);};
 const keepAlive=setInterval(()=>page.locator('.device-stage').click({position:{x:5,y:5},timeout:1000}).catch(()=>{}),5000);
 try{
  await page.goto(base+'/interfaces/residentiel/villa-gemini-frequencetv/phone');await page.waitForFunction(()=>window.__plan3d?.version==='2026-09-17-audio-1');
  const gui=page.frames().find(f=>f.url().includes('/showcases/'));
  await gui.locator('#room-select').selectOption('8');await page.waitForFunction(()=>__plan3d.activeRoom()===8);await page.evaluate(()=>{__plan3d.jump();__plan3d.setDay(1);});
  await gui.evaluate(()=>Villa.press('54'));await page.waitForTimeout(3200);
  for(const mode of ['normal','scene']){
   if(mode==='scene'){await page.locator('.btn-exit-fullscreen-device-corner').click();await page.waitForTimeout(500);await page.evaluate(()=>__plan3d.jump());}
   for(const theme of ['dark','light','glass']){
    await gui.evaluate(t=>changeTheme(t),theme);await page.waitForTimeout(950);
    check(mode+' / '+theme+' selected',await gui.locator('#theme-select').inputValue()===theme);
    for(const [join,name] of [[154,'tennis'],[153,'football'],[152,'race']]){
     await gui.evaluate(j=>Villa.press(String(j)),join);await page.waitForFunction(n=>__plan3d.metrics().tv3D?.currentKind===n,name);
     const v=await page.evaluate(n=>__plan3d.metrics().tv3D.venues[n],name);
     check(mode+' / '+theme+' / '+name+' live venue',v.stands===4&&v.spectators>=500&&v.staticDrawCalls<=3);
     if(theme==='dark')await page.screenshot({path:path.join(out,mode+'-'+name+'.png')});
    }
   }
  }
  await page.evaluate(()=>__plan3d.remote('pause'));const stopped=await page.evaluate(()=>__plan3d.rooms[8].tv.screen.st.tick);await page.waitForTimeout(450);
  check('Pause freezes image and sound waves',await page.evaluate(t=>__plan3d.rooms[8].tv.screen.st.tick===t&&__plan3d.rooms[8].speakers.every(s=>!s.ring.visible),stopped));
  await page.evaluate(()=>__plan3d.remote('play'));await page.waitForTimeout(450);check('Play resumes animation',await page.evaluate(t=>__plan3d.rooms[8].tv.screen.st.tick>t,stopped));
  await page.evaluate(()=>__plan3d.remote('menu'));await page.waitForTimeout(200);check('Menu restores source controls',await page.evaluate(()=>{const r=__plan3d.rooms[8];return !r.tv.screen.st.program&&r.tv.on.map===r.tv.screen.tex;}));
  for(const [join,name] of [[154,'tennis'],[153,'football'],[152,'race']]){
   await gui.evaluate(j=>Villa.press(String(j)),join);await page.waitForTimeout(500);
   const start=await page.evaluate(()=>({frames:__plan3d.metrics().renderedFrames,time:performance.now()}));await page.waitForTimeout(4000);
   report.performance.push({programme:name,...await page.evaluate(s=>({fps:(__plan3d.metrics().renderedFrames-s.frames)/((performance.now()-s.time)/1000),metrics:__plan3d.metrics()}),start)});
  }
  await gui.evaluate(()=>Villa.press('150'));await page.waitForTimeout(150);const draws=await page.evaluate(()=>__plan3d.metrics().tv3D.draws);await page.waitForTimeout(350);
  check('OFF stops programme rendering',await page.evaluate(d=>__plan3d.rooms[8].tv.source===0&&__plan3d.metrics().tv3D.draws===d,draws));
  check('No JavaScript or shader error in the 3D view',errors.length===0);
  for(const device of ['tablet','wallpanel']){await page.goto(base+'/interfaces/residentiel/villa-gemini-frequencetv/'+device);await page.waitForTimeout(1500);check(device+' retains video background',await page.locator('canvas.plan3d-canvas').count()===0&&!await page.evaluate(()=>!!window.__plan3d));}
  report.otherSupportConsole=errors.slice();report.status='passed';
 }catch(e){report.status='failed';report.failure=e.stack;await page.screenshot({path:path.join(out,'failure.png')});throw e;}
 finally{clearInterval(keepAlive);report.errors=errors;fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2));await browser.close();}
})();
