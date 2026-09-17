// Room layouts, motorised televisions and real 3D programmes through GUI feedback.
const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const base=process.env.BASE_URL||'http://127.0.0.1:4201',out=process.env.TEST_OUTPUT||path.resolve('../../Claude outputs/room-revision/qa');
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const b=await chromium.launch({executablePath:process.env.BROWSER_EXE,args:['--enable-gpu','--use-angle=d3d11']}),p=await b.newPage({viewport:{width:1280,height:800},deviceScaleFactor:1.5});
 const report={base,checks:[],performance:[]},errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 const check=(n,v)=>{assert.ok(v,n);report.checks.push(n);console.log('PASS '+n);};
 const keep=setInterval(()=>p.locator('.device-stage').click({position:{x:5,y:5},timeout:1000}).catch(()=>{}),4000);
 const shot=async n=>p.screenshot({path:path.join(out,n+'.png')});
 try{
  await p.goto(base+'/interfaces/residentiel/villa-gemini-frequencetv/phone');await p.waitForFunction(()=>window.__plan3d?.version==='2026-09-17-feedback-1');await p.waitForFunction(()=>__plan3d.navigation().phase==='room');
  const f=p.frames().find(f=>f.url().includes('/showcases/'));
  const room=async id=>{await f.locator('#room-select').selectOption(String(id));await p.waitForFunction(id=>__plan3d.activeRoom()===id,id);await p.evaluate(()=>__plan3d.jump());};
  const press=async n=>{await f.evaluate(n=>Villa.press(String(n)),n);await p.waitForTimeout(200);};
  check('17 selectable rooms including Local technique',await f.locator('#room-select option').count()===17&&await f.locator('#room-select option[value="17"]').textContent()==='Local technique');
  check('Technical room in basement, no fake window or television',await p.evaluate(()=>{const r=__plan3d.rooms[17];return r.cfg.niveau===-1&&!r.win&&!r.tv&&r.decor.style==='av-racks-and-distribution';}));
  check('Kitchen has no speakers',await p.evaluate(()=>__plan3d.rooms[2].speakers.length===0));
  check('Salon has front pair, rear pair and frontal subwoofer',await p.evaluate(()=>{const s=__plan3d.rooms[1].speakers;return s.length===5&&s.filter(x=>x.kind==='rear').length===2&&s.some(x=>x.kind==='subwoofer'&&x.group.position.z<1);}));
  check('Salon has library, fireplace and floor lamp',await p.evaluate(()=>{const d=__plan3d.rooms[1].decor;return d.bookshelves===1&&d.fireplace.wall==='west'&&d.floorLamp;}));
  check('Dining speakers at opposite corners and ten sconces',await p.evaluate(()=>{const r=__plan3d.rooms[3];return r.speakers.length===2&&r.speakers[0].group.position.x<1&&r.speakers[1].group.position.x>r.cfg.w-1&&r.decor.sconces===10;}));
  check('Office one left corner speaker and three libraries',await p.evaluate(()=>{const r=__plan3d.rooms[7];return r.speakers.length===1&&r.speakers[0].group.position.x<1&&r.decor.bookshelves===3;}));
  check('Bedrooms have distinct identities',await p.evaluate(()=>new Set([5,6,9].map(id=>__plan3d.rooms[id].decor.style)).size===3));
  check('Requested rooms have no ceiling speakers',await p.evaluate(()=>[1,2,3,4,5,6,7,8,9,10].every(id=>__plan3d.rooms[id].speakers.every(s=>s.kind!=='ceiling'))));
  check('Cinema surrounds behind window, screen almost wall height',await p.evaluate(()=>{const r=__plan3d.rooms[8];return r.speakers.length===7&&r.tv.width>=4.6&&!r.win&&r.speakers.filter(s=>s.kind==='surround').every(s=>s.group.position.z>r.cfg.d-1);}));
  await p.locator('.btn-exit-fullscreen-device-corner').click();await p.evaluate(()=>__plan3d.setDay(1));
  for(const id of [4,5,6,9,10]){
   await room(id);await press(54);await press(150);await p.waitForTimeout(2200);
   check('Room '+id+' TV concealed when OFF',await p.evaluate(id=>__plan3d.rooms[id].tv.lift.position===0,id));
   await press(151);await p.waitForTimeout(550);
   check('Room '+id+' TV rises progressively',await p.evaluate(id=>{const l=__plan3d.rooms[id].tv.lift;return l.position>.15&&l.position<.9;},id));
   await p.waitForTimeout(1550);check('Room '+id+' TV fully extended',await p.evaluate(id=>__plan3d.rooms[id].tv.lift.position===1,id));await shot('bedroom-'+id);
   await press(150);await p.waitForTimeout(550);check('Room '+id+' TV lowers progressively',await p.evaluate(id=>{const l=__plan3d.rooms[id].tv.lift;return l.position>.1&&l.position<.85;},id));
   await p.waitForTimeout(1550);if(id===4)await shot('tv-concealed');
  }
  await room(8);await press(54);await press(151);await f.evaluate(()=>Villa.setAnalog('52',6000));await p.waitForTimeout(300);
  const low=await p.evaluate(()=>__plan3d.rooms[8].speakers[0].ring.scale.x);
  await f.evaluate(()=>Villa.setAnalog('52',65535));await p.waitForTimeout(300);
  check('Audio diameter doubled and follows volume with restrained opacity',await p.evaluate(low=>__plan3d.rooms[8].speakers.every(s=>s.ring.visible&&s.ring.scale.x>low&&s.ring.scale.x<4&&s.ring.material.opacity<.3),low));
  await press(55);check('Mute hides all waves',await p.evaluate(()=>__plan3d.rooms[8].speakers.every(s=>!s.ring.visible)));await press(55);
  await press(150);check('OFF hides all waves',await p.evaluate(()=>__plan3d.rooms[8].speakers.every(s=>!s.ring.visible)));
  for(const [join,kind] of [[151,'film'],[152,'race'],[153,'football'],[154,'tennis']]){
   await press(join);await p.waitForTimeout(600);check('Real 3D TV '+kind,await p.evaluate(kind=>{const a=__plan3d,r=a.rooms[8];return a.metrics().tv3D.currentKind===kind&&r.tv.on.map.isRenderTargetTexture;},kind));await shot('tv-'+kind);
  }
  await p.evaluate(()=>__plan3d.remote('pause'));const tick=await p.evaluate(()=>__plan3d.rooms[8].tv.screen.st.tick);await p.waitForTimeout(400);
  check('Pause freezes programme and audio waves',await p.evaluate(t=>__plan3d.rooms[8].tv.screen.st.tick===t&&__plan3d.rooms[8].speakers.every(s=>!s.ring.visible),tick));
  await p.evaluate(()=>__plan3d.remote('menu'));await p.waitForTimeout(150);
  check('Remote menu restores interactive source screen',await p.evaluate(()=>{const r=__plan3d.rooms[8];return !r.tv.screen.st.program&&r.tv.on.map===r.tv.screen.tex;}));
  await press(151);await p.waitForTimeout(400);await shot('cinema');
  for(const id of [1,2,3,7,17]){await room(id);await press(54);await p.waitForTimeout(3000);await shot('room-'+id);}
  const measure=async name=>{await p.waitForTimeout(1200);const start=await p.evaluate(()=>({f:__plan3d.metrics().renderedFrames,t:performance.now()}));await p.waitForTimeout(4000);report.performance.push({view:name,...await p.evaluate(s=>({fps:(__plan3d.metrics().renderedFrames-s.f)/((performance.now()-s.t)/1000),...__plan3d.metrics()}),start)});};
  await room(8);await press(151);await measure('cinema-3d-film');await press(153);await measure('cinema-3d-football');
  await p.evaluate(()=>{__plan3d.overview();__plan3d.jump();});await measure('villa-closed');await shot('overview');
  check('No JavaScript or shader errors',errors.length===0);report.status='passed';
 }catch(e){report.status='failed';report.failure=e.stack;await shot('failure');throw e;}
 finally{clearInterval(keep);report.errors=errors;fs.writeFileSync(path.join(out,'rooms-results.json'),JSON.stringify(report,null,2));await b.close();}
})();
