// Real showcase feedback -> audible source -> each speaker's visible wave.
const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const base=process.env.BASE_URL||'http://127.0.0.1:4211',out=process.env.TEST_OUTPUT||path.resolve('../../Claude outputs/audio-waves/qa'),baseline=process.env.AUDIO_BASELINE_DIR;
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.BROWSER_EXE,args:['--enable-gpu','--use-angle=d3d11']}),page=await browser.newPage({viewport:{width:1280,height:800},deviceScaleFactor:1.5});
 const report={base,baseline:!!baseline,checks:[],rooms:[],errors:[]},check=(name,value)=>{assert.ok(value,name);report.checks.push(name);};
 page.on('pageerror',e=>report.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});
 if(baseline){for(const file of ['plan3d.js','room-features.js'])await page.route('**/plan3d/'+file+'*',r=>r.fulfill({contentType:'text/javascript',body:fs.readFileSync(path.join(baseline,file),'utf8')}));await page.route('**/js/local-feedback.js*',r=>r.fulfill({contentType:'text/javascript',body:fs.readFileSync(path.join(baseline,'local-feedback.js'),'utf8')}));}
 const keep=setInterval(()=>page.locator('.device-stage').click({position:{x:5,y:5},timeout:700}).catch(()=>{}),4000);
 try{
  await page.goto(base+'/interfaces/residentiel/villa-gemini-frequencetv/phone');await require('./helpers/villa-manual.cjs').pauseVillaTour(page);await page.waitForFunction(()=>window.__plan3d?.navigation().phase==='room');
  check('Expected renderer version',await page.evaluate(()=>__plan3d.version)===(baseline?'2026-09-17-valley-1':'2026-09-17-journey-1'));
  const gui=page.frames().find(f=>f.url().includes('/showcases/'));
  await page.locator('.btn-exit-fullscreen-device-corner').click();await gui.locator('[data-i18n="tab_source"]').click();
  const room=async id=>{await gui.locator('#room-select').selectOption(String(id));await page.waitForFunction(id=>__plan3d.activeRoom()===id,id);await page.evaluate(()=>__plan3d.jump());await page.waitForTimeout(120);};
  const press=async j=>{await gui.evaluate(j=>Villa.press(String(j)),j);await page.waitForTimeout(130);};
  const volume=async(j,n)=>{await gui.evaluate(([j,n])=>Villa.setAnalog(String(j),n),[j,n]);await page.waitForTimeout(150);};
  const waves=(cycle=false)=>page.evaluate(async cycle=>{
   const r=__plan3d.rooms[__plan3d.activeRoom()],read=()=>({audio:{...r.audio},speakers:r.speakers.map(s=>({kind:s.kind,visible:s.ring.visible,diameter:s.ring.geometry.parameters.outerRadius*s.ring.scale.x*2,scale:s.ring.scale.x,opacity:s.ring.material.opacity}))});
   const result=read();if(!cycle)return result;
   result.speakers.forEach(s=>{s.minScale=s.scale;s.minOpacity=s.opacity;});
   const start=performance.now();let frames=0;
   while(performance.now()-start<1700){await new Promise(requestAnimationFrame);frames++;read().speakers.forEach((s,i)=>{const v=result.speakers[i];v.minScale=Math.min(v.minScale,s.scale);v.scale=Math.max(v.scale,s.scale);v.minOpacity=Math.min(v.minOpacity,s.opacity);v.opacity=Math.max(v.opacity,s.opacity);v.diameter=Math.max(v.diameter,s.diameter);});}
   result.frames=frames;return result;
  },cycle);
  const allOn=s=>s.speakers.length>0&&s.speakers.every(s=>s.visible&&s.opacity>0),allOff=s=>s.speakers.every(s=>!s.visible);
  report.initial=[];
  for(const id of [10,11,12]){await room(id);const s=await waves();report.initial.push({id,...s});if(!baseline)check('Initial music and waves in room '+id,s.audio.music&&s.audio.source===0&&allOn(s));}
  await room(10);await page.evaluate(()=>__plan3d.setDay(0));await press(54);await page.waitForTimeout(3100);
  for(const theme of ['dark','light','glass']){await gui.evaluate(t=>changeTheme(t),theme);await page.waitForTimeout(950);await page.screenshot({path:path.join(out,'suite-initial-'+theme+'.png')});}
  await press(150);await press(151);await volume(52,60000);report.reference=await waves();
  await page.screenshot({path:path.join(out,'suite-video-maximum.png')});
  if(baseline){report.status='baseline';return;}
  const roomList=await page.evaluate(()=>Object.values(__plan3d.rooms).map(r=>({id:r.id,type:r.cfg.type,name:r.cfg.nom,count:r.speakers.length,tv:!!r.tv})).sort((a,b)=>a.id-b.id));
  check('All 17 rooms audited',roomList.length===17);
  for(const meta of roomList){
   if([2,17].includes(meta.id)){check(meta.name+' intentionally has no speakers',meta.count===0);report.rooms.push({...meta,status:'not-applicable'});continue;}
   await room(meta.id);await press(150);await press(151);
   await volume(52,4000);const low=await waves(true);await volume(52,60000);const high=await waves(true);
   check(meta.name+' video on every speaker',allOn(high));check(meta.name+' diameter rises with AV volume',high.speakers.every((s,i)=>s.diameter>low.speakers[i].diameter*1.5));
   check(meta.name+' enlarged waves remain subtle',high.speakers.every(s=>s.scale>3.5&&s.scale<4&&s.opacity<.33));
   check(meta.name+' every wave expands and fades visibly',high.frames>30&&high.speakers.every(s=>s.scale/s.minScale>1.5&&s.opacity-s.minOpacity>.25));
   await volume(52,0);check(meta.name+' AV zero stops waves',allOff(await waves()));await volume(52,60000);
   await press(55);check(meta.name+' mute stops all speakers',allOff(await waves()));await press(55);check(meta.name+' unmute resumes',allOn(await waves()));
   for(const j of [152,153,154]){await press(j);check(meta.name+' video source '+j,allOn(await waves()));}
   await press(155);await volume(254,4000);const musicLow=await waves(true);await volume(254,60000);const musicHigh=await waves(true);
   check(meta.name+' music volume drives every speaker',allOn(musicHigh)&&musicHigh.speakers.every((s,i)=>s.diameter>musicLow.speakers[i].diameter*1.5));
   await volume(254,0);check(meta.name+' music zero stops waves',allOff(await waves()));await volume(254,60000);
   await press(55);check(meta.name+' music mute stops waves',allOff(await waves()));await press(55);
   await press(156);check(meta.name+' returns to video sound',allOn(await waves())&&!(await waves()).audio.music);
   if(meta.tv){await page.evaluate(()=>__plan3d.remote('pause'));await page.waitForTimeout(150);check(meta.name+' pause stops waves',allOff(await waves()));await page.evaluate(()=>__plan3d.remote('play'));await page.waitForTimeout(150);check(meta.name+' play resumes waves',allOn(await waves()));}
   // Check real geometry between camera and the animated rings, not only .visible.
   const visibility=await page.evaluate(async()=>{
    const T=await import('/plan3d/vendor/three.module.min.js'),r=__plan3d.rooms[__plan3d.activeRoom()],camera=new T.Vector3(...__plan3d.navigation().camera),obstacles=[];r.group.updateMatrixWorld(true);
    r.group.traverse(o=>{if(!o.isMesh||o.material.transparent||o.material.opacity===0)return;let visible=true;for(let a=o;a&&a!==r.group;a=a.parent)if(!a.visible)visible=false;if(visible)obstacles.push(o);});
    return r.speakers.map(s=>{let clear=0;for(let i=0;i<16;i++){const a=i/16*Math.PI*2,p=s.ring.localToWorld(new T.Vector3(Math.cos(a)*s.ring.geometry.parameters.innerRadius,Math.sin(a)*s.ring.geometry.parameters.innerRadius,0)),delta=p.clone().sub(camera),distance=delta.length(),ray=new T.Raycaster(camera,delta.normalize(),0,distance-.015);if(!ray.intersectObjects(obstacles,false).length)clear++;}return {kind:s.kind,clear,total:16};});
   });
   check(meta.name+' at least one wave is not hidden by furniture',visibility.some(s=>s.clear>=6));
   if(meta.type==='suite')check(meta.name+' both waves clear of furniture',visibility.every(s=>s.clear>=6));
   await page.screenshot({path:path.join(out,'piece-'+meta.id+'.png')});
   await press(150);check(meta.name+' OFF stops all speakers',allOff(await waves()));
   report.rooms.push({...meta,low,high,musicLow,musicHigh,visibility,status:'passed'});console.log('PASS '+meta.name+' / '+meta.count+' speakers');
  }
  // Returning to a room must restore its own distinct source volumes and mute.
  await room(10);await press(151);await volume(52,50000);await volume(254,12000);await press(55);await room(1);await press(150);await room(10);
  const restored=await waves();check('Guest suite retains its own volumes and mute',restored.audio.mute&&Math.abs(restored.audio.volume-50000/65535)<.001&&Math.abs(restored.audio.mediaVolume-12000/65535)<.001&&allOff(restored));
  await press(55);await page.evaluate(()=>__plan3d.setDay(1));
  const start=await page.evaluate(()=>({n:__plan3d.metrics().renderedFrames,t:performance.now()}));await page.waitForTimeout(4000);report.performance=await page.evaluate(s=>({fps:(__plan3d.metrics().renderedFrames-s.n)/((performance.now()-s.t)/1000),metrics:__plan3d.metrics()}),start);
  check('No JavaScript or shader errors in 3D',report.errors.length===0);report.status='passed';console.log('PASS '+report.checks.length+' checks');
  // Same feedback in normal mode and every theme; other supports retain video.
  await page.locator('.btn-exit-fullscreen-device-corner').click();
  for(const theme of ['dark','light','glass']){await gui.evaluate(t=>changeTheme(t),theme);await page.waitForTimeout(650);check('Normal '+theme+' waves active',allOn(await waves()));await page.screenshot({path:path.join(out,'suite-normal-'+theme+'.png')});}
  check('Normal mode has no JavaScript or shader errors',report.errors.length===0);
  if(process.env.CAPTURE_MOTION==='1'){
   await gui.evaluate(()=>changeTheme('dark'));await page.waitForTimeout(650);
   const bytes=await page.evaluate(async()=>{
    const stream=document.querySelector('.plan3d-bg-canvas').captureStream(30),chunks=[],recorder=new MediaRecorder(stream,{mimeType:'video/webm',videoBitsPerSecond:2500000});
    const done=new Promise(resolve=>{recorder.ondataavailable=e=>chunks.push(e.data);recorder.onstop=resolve;});recorder.start();await new Promise(r=>setTimeout(r,5000));recorder.stop();await done;stream.getTracks().forEach(t=>t.stop());return Array.from(new Uint8Array(await new Blob(chunks).arrayBuffer()));
   });fs.writeFileSync(path.join(out,'ondes-audio.webm'),Buffer.from(bytes));
  }
  report.otherSupportErrors=[];
  for(const device of ['tablet','wallpanel']){
   await page.goto(base+'/interfaces/residentiel/villa-gemini-frequencetv/'+device);await page.waitForTimeout(1800);
   const f=page.frames().find(f=>f.url().includes('/showcases/'));await f.waitForFunction(()=>window.Villa?.activeRoom>0);
   check(device+' retains video background',await page.locator('canvas.plan3d-canvas').count()===0&&!await page.evaluate(()=>!!window.__plan3d));
   check(device+' initial music feedback in all affected rooms',await f.evaluate(()=>[10,11,12].every(id=>{Villa.selectRoom(id);return Villa.get('b','155')===true&&Villa.get('b','150')===false;})));
  }
  report.otherSupportErrors=report.errors.splice(0);
  check('Other supports have no new errors',report.otherSupportErrors.every(e=>e.includes("La bibliothèque WebXPanel n'est pas chargée")||e.includes('Expected number, "… 8.2 3 21.4 11.7l43.3 75zM256 33')));
  report.status='passed';console.log('PASS total '+report.checks.length+' checks');
 }catch(e){report.status='failed';report.failure=e.stack;await page.screenshot({path:path.join(out,'failure.png')});throw e;}
 finally{clearInterval(keep);fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2));await browser.close();}
})();
