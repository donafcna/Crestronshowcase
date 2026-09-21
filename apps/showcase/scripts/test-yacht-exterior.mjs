import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import '../public/ftv-luxury/yacht-exterior-core.js';
const core=globalThis.FTV_YACHT_EXTERIOR;
// Exercise the real current model source, rather than a separately maintained hull.
function originalHull(){
  const text=readFileSync(new URL('../public/ftv-luxury/models/yacht.html',import.meta.url),'utf8');
  const start=text.indexOf('function smoothValue('),end=text.indexOf('const hullGeo=',start);
  assert.ok(start>=0&&end>start,'Procedural hull source contract');
  const context=vm.createContext({});vm.runInContext(text.slice(start,end)+'\nglobalThis.result={positions:hullP,indices:hullI};',context,{timeout:1000});
  return {positions:new Float32Array(context.result.positions),indices:new Uint32Array(context.result.indices)};
}
function topology(indices){
  const edges=new Map();
  for(let i=0;i<indices.length;i+=3)for(const [a,b]of[[indices[i],indices[i+1]],[indices[i+1],indices[i+2]],[indices[i+2],indices[i]]]){
    const key=a<b?`${a}:${b}`:`${b}:${a}`,v=edges.get(key)||{count:0,direction:0};v.count++;v.direction+=a<b?1:-1;edges.set(key,v);
  }
  return {open:[...edges.values()].filter(e=>e.count===1).length,nonmanifold:[...edges.values()].filter(e=>e.count>2).length,inconsistent:[...edges.values()].filter(e=>e.count===2&&e.direction!==0).length};
}
test('40 unique independently switchable circuits',()=>{assert.equal(core.circuits.length,40);assert.equal(new Set(core.circuits.map(c=>c.id)).size,40);assert.ok(core.circuits.every(c=>c.night>0&&c.night<=100));});
test('yacht 20-second cycle: two 10-second halves with included one-second fades',()=>{
  assert.deepEqual(core.timing,{day:9,dusk:1,night:9,dawn:1,total:20});
  assert.equal(core.timing.day+core.timing.dusk,10);assert.equal(core.timing.night+core.timing.dawn,10);
  for(const [s,stage,day]of[[0,'day',1],[8.99,'day',1],[9,'dusk',1],[9.5,'dusk',.5],[10,'night',0],[18.99,'night',0],[19,'dawn',0],[19.5,'dawn',.5],[20,'day',1],[40,'day',1]]){assert.equal(core.cycle(s).stage,stage);assert.ok(Math.abs(core.cycle(s).day-day)<1e-8);}
});
test('all exterior circuits on at night, off by day',()=>{const c=core.createController();assert.ok(Object.values(c.tick(0)).every(n=>n===0));assert.ok(Object.values(c.tick(10)).every(n=>n>0));assert.ok(Object.values(c.tick(20)).every(n=>n===0));});
test('manual edits survive render ticks until explicit Auto',()=>{const c=core.createController();c.tick(50);assert.equal(c.setLevel('underwater_port',0),true);assert.equal(c.tick(51).underwater_port,0);assert.ok(c.tick(51).underwater_starboard>0);assert.equal(c.state().automatic,false);c.setAutomatic(true);assert.equal(c.tick(52).underwater_port,100);});
test('invalid numbers and unknown IDs cannot corrupt controller',()=>{const c=core.createController();assert.equal(c.setLevel('__proto__',20),false);assert.equal(c.setLevel('name_port',NaN),false);assert.equal(c.setLevel('name_port',Infinity),false);assert.equal(c.setAutomatic('yes'),false);assert.equal(c.setPreset('unknown'),false);c.setLevel('name_port',500);assert.equal(c.state().levels.name_port,100);c.setLevel('name_port',-10);assert.equal(c.state().levels.name_port,0);});
test('lighting presets cannot change the environmental clock',()=>{const c=core.createController();c.tick(2);c.setPreset('night');assert.equal(c.state().stage,'day');assert.ok(Object.values(c.state().levels).every(n=>n>0));});
test('real source hull is closed with consistent outward seams',()=>{const src=originalHull();assert.ok(topology(src.indices).open>0);const result=core.closeHull(src.positions,src.indices);assert.deepEqual(topology(result.indices),{open:0,nonmanifold:0,inconsistent:0});assert.deepEqual(Array.from(result.positions.slice(0,src.positions.length)),Array.from(src.positions));});
test('closed source hull has finite nondegenerate triangles and positive signed volume',()=>{
  const src=originalHull(),r=core.closeHull(src.positions,src.indices),p=r.positions,idx=r.indices;let volume=0;
  for(let i=0;i<idx.length;i+=3){const a=idx[i]*3,b=idx[i+1]*3,c=idx[i+2]*3,u=[p[b]-p[a],p[b+1]-p[a+1],p[b+2]-p[a+2]],v=[p[c]-p[a],p[c+1]-p[a+1],p[c+2]-p[a+2]],n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];assert.ok(n.every(Number.isFinite));assert.ok(Math.hypot(...n)>1e-9);volume+=(p[a]*n[0]+p[a+1]*n[1]+p[a+2]*n[2])/6;}
  assert.ok(volume>0);
});
test('water exclusion follows the raked bow across the wave-height range',()=>{const sections=core.hullSections(originalHull().positions);assert.equal(sections.length,32);sections.forEach((s,i)=>{assert.ok(s.every(Number.isFinite));assert.ok(s[1]>0&&s[3]>=s[1]);if(i){assert.ok(s[0]>sections[i-1][0]);assert.ok(s[2]>sections[i-1][2]);}});assert.ok(sections.at(-1)[0]<42.75);});
test('unexpected upstream hull topology is rejected explicitly',()=>{assert.throws(()=>core.closeHull(new Float32Array(30),new Uint32Array(3)),/topology/);});
