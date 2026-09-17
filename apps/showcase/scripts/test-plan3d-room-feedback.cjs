// Actual scene buttons, interior luminance and camera-to-screen clearance.
const {chromium}=require('playwright'),{PNG}=require('pngjs'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const base=process.env.BASE_URL||'http://127.0.0.1:4211',out=process.env.TEST_OUTPUT||path.resolve('../../Claude outputs/room-feedback/qa'),baseline=process.env.BASELINE==='1',viewport={width:Number(process.env.VIEWPORT_WIDTH)||1280,height:Number(process.env.VIEWPORT_HEIGHT)||800};
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.BROWSER_EXE,args:['--enable-gpu','--use-angle=d3d11']}),page=await browser.newPage({viewport,deviceScaleFactor:1.5});
 const report={base,baseline,viewport,mode:process.env.NORMAL_MODE?'normal':'scene',checks:[],lighting:[],screens:[],errors:[]},check=(name,value)=>{assert.ok(value,name);report.checks.push(name);};
 page.on('pageerror',e=>report.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});
 const keep=setInterval(()=>page.locator('.device-stage').click({position:{x:5,y:5},timeout:700}).catch(()=>{}),3000);
 try{
  await page.goto(base+'/interfaces/residentiel/villa-gemini-frequencetv/phone');await page.waitForFunction(()=>window.__plan3d?.navigation().phase==='room');
  const gui=page.frames().find(f=>f.url().includes('/showcases/'));if(!process.env.NORMAL_MODE)await page.locator('.btn-exit-fullscreen-device-corner').click();
  const room=async id=>{await gui.locator('#room-select').selectOption(String(id));await page.waitForFunction(id=>__plan3d.activeRoom()===id,id);await page.evaluate(()=>__plan3d.jump());await page.waitForTimeout(150);};
  const snapshot=async name=>{
   const png=PNG.sync.read(await page.screenshot({path:path.join(out,name+'.png')})),z=await page.evaluate(()=>__plan3d.metrics().zone),canvas=await page.locator('.plan3d-bg-canvas').boundingBox(),scale=png.width/viewport.width;let sum=0,count=0;
   for(let y=Math.floor((z.y+canvas.y+z.h*.23)*scale);y<Math.floor((z.y+canvas.y+z.h*.85)*scale);y++)for(let x=Math.floor((z.x+z.w*.08)*scale);x<Math.floor((z.x+z.w*.92)*scale);x++){const i=(y*png.width+x)*4,a=png.data;sum+=(a[i]*.2126+a[i+1]*.7152+a[i+2]*.0722)/255;count++;}
   return sum/count;
  };
  for(const id of (process.env.ONLY_TV?[]:[1,4])){
   await room(id);await gui.evaluate(()=>Villa.press('150'));
   for(const [day,closed]of [[1,0],[0,0],[1,1],[0,1]]){
    await page.evaluate(([day,closed])=>{__plan3d.setDay(day);for(const k of ['volet','store','rideau'])__plan3d.shadePos(k,closed);},[day,closed]);await page.waitForTimeout(1800);
    const samples=[];
    for(const join of [51,52,53,54]){
     await gui.locator('#scene-btn-'+join).click();await page.waitForTimeout(3200);
     const s={id,day,closed,join,mean:await snapshot(`room-${id}-day-${day}-closed-${closed}-scene-${join}`),state:await page.evaluate(()=>{const r=__plan3d.rooms[__plan3d.activeRoom()];return{levels:r.levels,displayed:r.renderLevels,off:r.sceneOff,navigation:__plan3d.navigation()};}),feedback:await gui.evaluate(()=>[71,72,73,74,75].map(j=>Villa.get('n',String(j))))};
     samples.push(s);report.lighting.push(s);
     if(!baseline)check(`Room ${id} scene ${join} ${day}/${closed} follows feedback`,s.state.displayed.every((v,i)=>Math.abs(v-s.feedback[i]/65535)<.001));
    }
    console.log('LIGHT '+id+' '+day+'/'+closed+' '+samples.map(s=>s.mean.toFixed(3)).join(' '));
    if(!baseline){check(`Room ${id} four distinct scenes ${day}/${closed}`,samples.every((s,i)=>i===0||s.mean-samples[i-1].mean>.025));if(!day||closed)check(`Room ${id} OFF is dark ${day}/${closed}`,samples[0].state.navigation.day<.001&&samples[0].state.navigation.lamps.every(v=>v===0));}
   }
  }
  for(const id of await page.evaluate(()=>Object.values(__plan3d.rooms).filter(r=>r.tv).map(r=>r.id))){
   await room(id);await gui.evaluate(()=>{Villa.press('151');Villa.press('54');});await page.evaluate(()=>__plan3d.setDay(1));await page.waitForTimeout(3200);
   for(const closed of [0,1]){
    await page.evaluate(c=>{for(const k of ['volet','store','rideau'])__plan3d.shadePos(k,c);},closed);await page.waitForTimeout(100);
    const visibility=await page.evaluate(async()=>{
     const T=await import('/plan3d/vendor/three.module.min.js'),r=__plan3d.rooms[__plan3d.activeRoom()],screen=r.tv.mesh,camera=new T.Vector3(...__plan3d.navigation().camera),obstacles=[];r.group.updateMatrixWorld(true);
     r.group.traverse(o=>{if(!o.isMesh||o===screen||o.material.transparent||o.material.opacity===0)return;let visible=true;for(let a=o;a&&a!==r.group;a=a.parent)if(!a.visible)visible=false;if(visible)obstacles.push(o);});
     let clear=0;const blocked=[];for(let y=0;y<13;y++)for(let x=0;x<21;x++){
      const p=screen.localToWorld(new T.Vector3((x/20-.5)*screen.geometry.parameters.width*.98,(y/12-.5)*screen.geometry.parameters.height*.98,0)),delta=p.clone().sub(camera),ray=new T.Raycaster(camera,delta.clone().normalize(),0,delta.length()-.003),hits=ray.intersectObjects(obstacles,false);
      if(!hits.length)clear++;else blocked.push({x,y,object:hits[0].object.name,point:r.group.worldToLocal(hits[0].point).toArray()});
     }return{clear,total:273,blocked};
    });
    report.screens.push({id,closed,...visibility});console.log('TV '+id+'/'+closed+' '+visibility.clear+'/'+visibility.total);
    if(!baseline)check(`TV ${id} unobstructed, shades ${closed}`,visibility.clear===visibility.total);
   }
   if([1,3,4,10].includes(id))await snapshot('tv-'+id);
  }
  await room(3);await page.evaluate(()=>__plan3d.setDay(0));
  for(const [index,mode] of (process.env.NORMAL_MODE?['normal','scene']:['scene','normal']).entries()){
   if(index)await page.locator('.btn-exit-fullscreen-device-corner').click();
   for(const theme of ['dark','light','glass']){await gui.evaluate(t=>changeTheme(t),theme);await page.waitForTimeout(700);await snapshot('dining-'+mode+'-'+theme);}
  }
  check('No JavaScript or shader errors',report.errors.length===0);report.status='passed';console.log('PASS '+report.checks.length);
 }catch(e){report.status='failed';report.failure=e.stack;throw e;}finally{clearInterval(keep);fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2));await browser.close();}
})();
