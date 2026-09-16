const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const base=process.env.BASE_URL||'http://127.0.0.1:4200',out=process.env.TEST_OUTPUT||path.resolve('../../Claude outputs/codex-plan3d-villa2/qa');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const b=await chromium.launch({executablePath:process.env.BROWSER_EXE,args:['--enable-gpu','--use-angle=d3d11']});const p=await b.newPage({viewport:{width:1280,height:800},deviceScaleFactor:1.5});const errors=[],report={checks:[],captures:[]};p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 const check=(name,value)=>{assert.ok(value,name);report.checks.push(name);console.log('PASS '+name);};
 const shot=async name=>{await p.screenshot({path:path.join(out,name+'.png')});report.captures.push(name);};
 const keep=setInterval(()=>p.locator('.device-stage').click({position:{x:5,y:5},timeout:1000}).catch(()=>{}),4000);
 try{
  await p.goto(base+'/interfaces/residentiel/villa-gemini-frequencetv/phone');await p.waitForFunction(()=>window.__plan3d?.version==='2026-09-16-estate-3');await p.waitForFunction(()=>window.__plan3d.navigation().phase==='room');await p.evaluate(()=>window.__plan3d.setDay(1));
  const f=p.frames().find(f=>f.url().includes('/showcases/'));const room=async id=>{await f.locator('#room-select').selectOption(String(id));await p.waitForFunction(id=>window.__plan3d.activeRoom()===id,id);await p.evaluate(()=>window.__plan3d.jump());await p.waitForTimeout(300);};
  check('Sixteen rooms selectable',await f.locator('#room-select option').count()===16);
  check('Basement includes cinema, sauna, garage and golf',await p.evaluate(()=>[8,13,15,16].every(id=>window.__plan3d.rooms[id].cfg.niveau===-1)));
  check('Large ground-floor living and dining rooms',await p.evaluate(()=>[1,3].every(id=>{const p=window.__plan3d.rooms[id].cfg;return p.niveau===0&&p.w*p.d>=60;})));
  const conflicts=await p.evaluate(()=>{const rooms=Object.values(window.__plan3d.rooms);return rooms.filter(r=>r.win).filter(r=>rooms.some(n=>n!==r&&n.cfg.niveau===r.cfg.niveau&&(r.win.wall==='west'?Math.abs(n.cfg.x+n.cfg.w-r.cfg.x)<.4&&n.cfg.z<r.cfg.z+r.cfg.d&&n.cfg.z+n.cfg.d>r.cfg.z:Math.abs(n.cfg.z+n.cfg.d-r.cfg.z)<.4&&n.cfg.x<r.cfg.x+r.cfg.w&&n.cfg.x+n.cfg.w>r.cfg.x))).map(r=>r.id);});check('No window opens into adjacent room',conflicts.length===0);
  check('Bureau window on west facade',await p.evaluate(()=>window.__plan3d.rooms[7].win.wall==='west'));
  for(const id of [7,13,8,16,15,1,2,3,14]){await room(id);await f.evaluate(()=>window.Villa.press('54'));await p.waitForTimeout(3200);await shot('room-'+id);}
  await room(8);await f.evaluate(()=>{window.Villa.press('151');window.Villa.setAnalog('52',8000);});await p.waitForTimeout(450);
  check('Video source activates all cinema channels',await p.evaluate(()=>window.__plan3d.rooms[8].speakers.length===11&&window.__plan3d.rooms[8].speakers.every(s=>s.ring.visible)));
  check('Cinema has surround, rear and ceiling channels',await p.evaluate(()=>['front','center','surround','rear','ceiling'].every(k=>window.__plan3d.rooms[8].speakers.some(s=>s.kind===k))));
  const low=await p.evaluate(()=>window.__plan3d.rooms[8].speakers[0].ring.scale.x);await f.evaluate(()=>window.Villa.setAnalog('52',60000));await p.waitForTimeout(250);check('Volume increases animation diameter',await p.evaluate(()=>window.__plan3d.rooms[8].speakers[0].ring.scale.x)>low);
  await f.evaluate(()=>window.Villa.press('55'));await p.waitForTimeout(250);check('Mute stops every channel',await p.evaluate(()=>window.__plan3d.rooms[8].speakers.every(s=>!s.ring.visible)));await f.evaluate(()=>window.Villa.press('55'));
  await f.evaluate(()=>window.Villa.press('150'));await p.waitForTimeout(250);check('AV OFF stops every channel',await p.evaluate(()=>window.__plan3d.rooms[8].speakers.every(s=>!s.ring.visible)));
  for(const j of [151,152,153,154]){await f.evaluate(j=>window.Villa.press(String(j)),j);await p.waitForTimeout(500);const a=await p.evaluate(()=>{const r=window.__plan3d.rooms[8];return {t:r.tv.screen.st.tick,kind:r.tv.screen.st.programme};});await p.waitForTimeout(350);check('Animated programme source '+j,await p.evaluate(t=>window.__plan3d.rooms[8].tv.screen.st.tick>t,a.t));await shot('programme-'+a.kind);}
  await f.locator('#nav-hvac').click();await f.locator('[data-join="615"]').click();await p.waitForTimeout(300);check('HVAC high speed feeds 3D',await p.evaluate(()=>window.__plan3d.rooms[8].hvac.fan===3));await shot('hvac-high');
  await f.locator('[data-join="611"]').click();await p.waitForTimeout(250);check('HVAC OFF removes airflow',await p.evaluate(()=>{const h=window.__plan3d.rooms[8].hvac;return !h.enabled&&!h.breeze.visible&&h.streams.every(s=>!s.visible);}));await f.locator('[data-join="610"]').click();await p.waitForTimeout(200);check('HVAC ON restores selected speed',await p.evaluate(()=>window.__plan3d.rooms[8].hvac.enabled&&window.__plan3d.rooms[8].hvac.fan===3));
  await room(1);check('HVAC state is per room',await p.evaluate(()=>window.__plan3d.rooms[1].hvac.fan===0));await room(8);check('HVAC speed retained after room change',await p.evaluate(()=>window.__plan3d.rooms[8].hvac.fan===3));
  check('Five lighting circuits in every room',await f.evaluate(()=>window.villaConfigEmbedded.pieces.every(p=>p.pilotages.eclairages.circuits.nombre===5)));
  check('Awnings in every indoor ground-floor room',await p.evaluate(()=>Object.values(window.__plan3d.rooms).filter(r=>r.cfg.niveau===0&&!r.ext).every(r=>r.shades.banne)));
  await p.evaluate(()=>{window.__plan3d.overview();window.__plan3d.jump();});await p.waitForTimeout(700);await shot('villa-day');await p.evaluate(()=>window.__plan3d.setDay(0));await p.waitForTimeout(1400);await shot('villa-night');
  await p.evaluate(()=>{const z=window.__plan3d.metrics().zone;window.__plan3d.click(z.x+z.w/2,z.y+z.h/2);window.__plan3d.jump();});await p.waitForTimeout(700);await shot('villa-open-night');await p.evaluate(()=>window.__plan3d.setDay(1));await p.waitForTimeout(500);await shot('villa-open-day');
  check('Basement exposed above ground in exploded view',await p.evaluate(()=>[8,13,15,16].every(id=>window.__plan3d.rooms[id].y0===0)));
  await p.evaluate(()=>window.__plan3d.setDay(null));const phases=[];for(let i=0;i<71;i++){phases.push(await p.evaluate(()=>window.__plan3d.environment()));await p.waitForTimeout(1000);}check('Seventy-second day/night loop',phases.some(v=>v.day===0)&&phases.some(v=>v.day===1)&&phases.some(v=>v.day>0&&v.day<1));report.cycle=phases;
  check('No JavaScript errors',errors.length===0);report.status='passed';
 }finally{clearInterval(keep);report.errors=errors;fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2));await b.close();}
})();
