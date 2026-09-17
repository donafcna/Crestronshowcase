// Rendered water/terrain intersections, presentation matrix and frame measurements.
const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const base=process.env.BASE_URL||'http://127.0.0.1:4211',out=process.env.TEST_OUTPUT||path.resolve('../../Claude outputs/alpine-landscape/qa');
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.BROWSER_EXE,args:['--enable-gpu','--use-angle=d3d11']}),page=await browser.newPage({viewport:{width:1280,height:800},deviceScaleFactor:1.5});
 const report={base,checks:[],errors:[],performance:[]},check=(name,value)=>{assert.ok(value,name);report.checks.push(name);console.log('PASS '+name);};
 page.on('pageerror',e=>report.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});
 const keepAlive=setInterval(()=>page.locator('.device-stage').click({position:{x:5,y:5},timeout:700}).catch(()=>{}),5000);
 try{
  await page.goto(base+'/interfaces/residentiel/villa-gemini-frequencetv/phone');await require('./helpers/villa-manual.cjs').pauseVillaTour(page);await page.waitForFunction(()=>window.__plan3d?.version==='2026-09-17-tour-1'&&__plan3d.metrics().renderedFrames>0);
  report.firstObservedFrameMs=await page.evaluate(()=>performance.now());await page.waitForFunction(()=>__plan3d.navigation().phase==='room');
  const gui=page.frames().find(f=>f.url().includes('/showcases/'));
  for(const mode of ['normal','scene']){
   if(mode==='scene')await page.locator('.btn-exit-fullscreen-device-corner').click();
   await page.evaluate(()=>__plan3d.overview());await page.waitForFunction(()=>__plan3d.navigation().phase==='overview-closed');
   for(const theme of ['dark','light','glass']){
    await gui.evaluate(t=>changeTheme(t),theme);await page.waitForTimeout(950);check(mode+' '+theme+' theme retained',await gui.locator('#theme-select').inputValue()===theme);
    for(const day of [1,0]){await page.evaluate(d=>__plan3d.setDay(d),day);await page.waitForTimeout(300);await page.screenshot({path:path.join(out,`${mode}-${theme}-${day?'jour':'nuit'}.png`)});check(mode+' '+theme+' '+(day?'day':'night')+' assembled',await page.evaluate(()=>__plan3d.navigation().walls===1&&__plan3d.navigation().explosion===0));}
   }
  }
  const env=await page.evaluate(()=>__plan3d.environment());report.environment=env;
  check('80-second day/night schedule retained',env.cycleSeconds===80);
  for(const s of env.landscape.streams){const l=env.landscape.lakes.find(l=>l.name===s.source);check(s.source+' starts inside its lake',Math.hypot((s.start.x-l.x)/l.rx,(s.start.z-l.z)/l.rz)<.8);check(s.source+' flows downhill beyond the visible terrain',s.downhill&&s.end.z>142);}
  await page.evaluate(()=>__plan3d.setDay(1));
  for(const room of [null,1,7,13]){
   if(room){if(await page.evaluate(id=>__plan3d.selectedRoom()===id,room)){const zone=await page.evaluate(()=>__plan3d.metrics().zone);await page.mouse.move(zone.x+zone.w/2,zone.y+zone.h/2);await page.mouse.wheel(0,-350);}else await gui.locator('#room-select').selectOption(String(room));await page.waitForFunction(id=>__plan3d.activeRoom()===id&&__plan3d.navigation().phase==='room',room);await page.screenshot({path:path.join(out,'piece-'+room+'.png')});}
   const start=await page.evaluate(()=>({n:__plan3d.metrics().renderedFrames,t:performance.now()}));await page.waitForTimeout(4000);
   report.performance.push({room,fps:await page.evaluate(s=>(__plan3d.metrics().renderedFrames-s.n)/((performance.now()-s.t)/1000),start),metrics:await page.evaluate(()=>__plan3d.metrics())});
  }
  // Build the real landscape on a neutral rendering bench and raycast its meshes.
  // Shoreline intersections are intentional; the inner lake and full river must remain visible.
  report.water=await page.evaluate(async()=>{
   const T=await import('/plan3d/vendor/three.module.min.js'),{createInteriors}=await import('/plan3d/interiors.js'),{buildLandscape}=await import('/plan3d/landscape.js');
   const renderer=new T.WebGLRenderer(),scene=new T.Scene(),palette=Object.fromEntries(['sol','solChambre','bois','boisClair','tissu','tissuFonce','lit','coussin','tapis','mur','solExt','metal'].map(k=>[k,new T.MeshStandardMaterial()])),kit=createInteriors(renderer,palette);
   const land=buildLandscape(scene,new T.Box3(new T.Vector3(-6.5,-3.8,-4.5),new T.Vector3(31.5,11.5,39.5)),kit);scene.updateMatrixWorld(true);
   const ray=new T.Raycaster(),results=[];
   scene.traverse(m=>{if(!m.name.startsWith('Lac ')&&!m.name.startsWith('Ruisseau depuis'))return;const a=m.geometry.attributes.position,lake=m.userData.lake;let hidden=0,total=0;
    for(let i=0;i<a.count;i++){let x=a.getX(i),y=a.getY(i),z=a.getZ(i);if(z>138)continue;if(lake){x=lake.x+(x-lake.x)*.72;z=lake.z+(z-lake.z)*.72;}ray.set(new T.Vector3(x,100,z),new T.Vector3(0,-1,0));const hit=ray.intersectObject(land.terrain)[0];if(hit){total++;if(hit.point.y>y+.04)hidden++;}}
    results.push({name:m.name,total,hidden});
   });
   scene.traverse(o=>{o.geometry?.dispose();if(o.material){for(const m of Array.isArray(o.material)?o.material:[o.material]){m.map?.dispose();m.dispose();}}});kit.dispose();renderer.dispose();renderer.forceContextLoss();return results;
  });
  check('Both lakes and rivers present',report.water.length===4);for(const w of report.water)check(w.name+' water not buried by terrain',w.total>90&&w.hidden===0);
  check('No JavaScript or shader error',report.errors.length===0);report.status='passed';
 }catch(e){report.status='failed';report.failure=e.stack;await page.screenshot({path:path.join(out,'failure.png')});throw e;}
 finally{clearInterval(keepAlive);fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2));await browser.close();}
})();
