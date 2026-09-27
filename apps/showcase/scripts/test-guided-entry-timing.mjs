import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { runOrderedDemo } from '../src/hooks/orderedDemo.js';
import { GUIDED_DEMO_TIMING, isGuidedProject } from '../src/hooks/guidedDemoTiming.js';
const catalogContext={window:{}};
vm.runInNewContext(readFileSync(new URL('../public/ftv-luxury/catalog.js', import.meta.url),'utf8'),catalogContext);
const catalog=JSON.parse(JSON.stringify(catalogContext.window.FTV_CATALOG));
const restaurantSource=readFileSync(new URL('../src/components/simulators/SushiBarKyoto.jsx',import.meta.url),'utf8');
const restaurantZones=JSON.parse(JSON.stringify(vm.runInNewContext(restaurantSource.match(/const zones = (\[[\s\S]*?\n\]);/)[1])));

async function simulate(project,{cancelAt=Infinity,missingSelector=false,replaceSceneDuringMove=false,lag=0}={}){
 let now=0,serial=0,detached=false;const events=[],pulses=[],token={cancelled:false},saved=globalThis.performance;
 Object.defineProperty(globalThis,'performance',{configurable:true,value:{now:()=>now}});
 const sleep=async ms=>{if(!token.cancelled){now+=ms;if(now>=cancelAt)token.cancelled=true;}};
 const elem=(kind,id)=>({kind,id,serial:serial++,isConnected:true,getBoundingClientRect:()=>({width:80,height:44}),matches:()=>false,scrollIntoView(){},getAttribute:()=>null});
 const selector=missingSelector?null:elem('selector','zone');
 if(selector)selector.options=restaurantZones.map(([id,name])=>({value:id,textContent:name}));
 const sceneNodes=new Map();
 const find=s=>{if(s==='.rk-ui')return project==='restaurant'?{}:null;if(s==='.rk-zone select')return selector;const m=s.match(/\[data-(?:preset|scene)="([^"]+)"\]/);if(!m)return null;if(!sceneNodes.has(m[1]))sceneNodes.set(m[1],elem('scene',m[1]));return sceneNodes.get(m[1]);};
 const root={querySelector:find,querySelectorAll:s=>{const n=find(s);return n?[n]:[];}};
 const win={getComputedStyle:()=>({visibility:'visible'})};
 const recordZone=id=>events.push({type:'zone',id,at:now});
 if(project==='restaurant')win.__restaurantGui={selectZone:recordZone,applyAllScene:id=>events.push({type:'all-scene',id,at:now})};
 else win.ftvGui={config:catalog[project],selectRoom:recordZone};
 const gui={root,win,doc:{getElementById:()=>selector,querySelector:find}};
 try{
 const complete=await runOrderedDemo({gui,token,sleep,visible:()=>true,
   moveTo:async(el,g,deadline=Infinity)=>{
     await sleep(Math.max(0,Math.min(810,deadline-now))+lag);
     if(replaceSceneDuringMove&&el.kind==='scene'&&!detached){el.isConnected=false;sceneNodes.set(el.id,elem('scene',el.id));detached=true;return false;}
     return !token.cancelled;
   },
   act:async el=>{assert.ok(el.isConnected,'only live targets pressed');events.push({type:'scene',id:el.id,at:now});await sleep(120);},
   setCursor:update=>{const c=update({pulse:0});if(c.pressed)pulses.push(now);},
 });return {complete,events,pulses,end:now};
 }finally{Object.defineProperty(globalThis,'performance',{configurable:true,value:saved});}
}
test('three sectors share a 3-second start, others are not changed',()=>{
 assert.deepEqual(GUIDED_DEMO_TIMING,{startDelay:3000,firstSceneDelay:1000,stepDelay:5000});
 for(const id of ['boutique-hermes','sushi-bar-kyoto','yacht-monaco'])assert.ok(isGuidedProject(id));
 for(const id of ['villa-gemini-frequencetv','hotel-brassus','club-etoile','yacht-monaco-other',null])assert.equal(isGuidedProject(id),false);
 const hook=readFileSync(new URL('../src/hooks/useAutoDemo.js',import.meta.url),'utf8');
 const host=readFileSync(new URL('../src/components/Showcase.jsx',import.meta.url),'utf8');
 assert.match(hook,/isGuidedProject\(guiKey.split\("\/"\)\[0\]\)/);
 assert.match(hook,/guidedBuilding \? GUIDED_DEMO_TIMING.startDelay : TIMING.startDelay/);
 assert.match(host,/const guidedEntry = isGuidedProject\(activeProject.id\) && first/);
});
for(const [project,scenes,closing] of [['boutique',['private','gala','opening'],'closed'],['restaurant',['dinner','rooftop','welcome'],'closed'],['yacht',['sunset','dinner','cruise'],'night']]){
 test(project+': full zone/scene order retained, first gap 1 second and following gaps 5 seconds',async()=>{
   const r=await simulate(project);assert.equal(r.complete,true);
   const rooms=project==='restaurant'?restaurantZones.filter(([id])=>id!=='exterior').map(([id])=>id):catalog[project].rooms.map(r=>r.id);
   const expected=rooms.flatMap(id=>[{type:'zone',id},...scenes.map(id=>({type:'scene',id}))]);
   expected.push({type:'zone',id:project==='restaurant'?'exterior':'all'},{type:'scene',id:closing});
   const actions=r.events.filter(e=>e.type!=='all-scene');
   assert.deepEqual(actions.map(({type,id})=>({type,id})),expected);
   assert.equal(actions[1].at-actions[0].at,1000);
   for(let i=2;i<actions.length;i++)assert.equal(actions[i].at-actions[i-1].at,5000,`step ${i}`);
   assert.ok(r.end-actions.at(-1).at>=5000,'final hold preserved');
   assert.equal(r.pulses.length,rooms.length+1,'cursor selects every zone and overview');
 });
 test(project+': cancel after the first zone never clicks a scene',async()=>{
  const r=await simulate(project,{cancelAt:1200});assert.equal(r.complete,false);assert.equal(r.events.length,1);assert.equal(r.events[0].type,'zone');
 });
 test(project+': missing selector stops cleanly',async()=>assert.equal((await simulate(project,{missingSelector:true})).complete,false));
}
test('yacht: a phase-induced rerender cannot make the cursor press a detached scene',async()=>{
 const r=await simulate('yacht',{replaceSceneDuringMove:true});assert.equal(r.complete,true);assert.equal(r.events[1].id,'sunset');assert.equal(r.events[1].at-r.events[0].at,1000);
});
test('no catch-up burst when cursor movement is delayed',async()=>{
 const r=await simulate('boutique',{lag:1500});assert.equal(r.complete,true);
 for(let i=2;i<r.events.length;i++)assert.ok(r.events[i].at-r.events[i-1].at>=5000);
});
