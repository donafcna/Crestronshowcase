import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const context = {};
vm.runInNewContext(readFileSync(new URL('../public/ftv-luxury/yacht-scene-cycle.js', import.meta.url), 'utf8'), context);
const create = context.FTV_YACHT_SCENE_CYCLE.create;
const state = (stage, automatic = true) => ({ stage, automatic });
function setup() { const calls = []; return { calls, cycle: create(p => calls.push(p)) }; }
test('initial day/night aligns the GUI to cruise/dinner', () => {
  for (const [stage, preset] of [['day', 'cruise'], ['night', 'dinner']]) {
    const { calls, cycle } = setup(); cycle.update(state(stage)); assert.deepEqual(calls, [preset]);
  }
});
test('80-second cycle: once on entry to night and once on return to day', () => {
  const { calls, cycle } = setup();
  for (let t=0; t<=160; t+=.25) { const phase=t%80; cycle.update(state(phase<30?'day':phase<40?'dusk':phase<70?'night':'dawn')); }
  assert.deepEqual(calls, ['cruise','dinner','cruise','dinner','cruise']);
});
test('dusk and dawn do not force a scene', () => {
  const { calls, cycle } = setup(); cycle.update(state('dusk')); cycle.update(state('dawn')); assert.deepEqual(calls, []);
});
test('duplicate feedback never overwrites an in-phase manual lighting adjustment', () => {
  const { calls, cycle } = setup(); cycle.update(state('night'));
  for(let i=0;i<1000;i++)cycle.update(state('night'));
  assert.deepEqual(calls, ['dinner']);
});
test('manual mode remains authoritative across all phases', () => {
  const { calls, cycle } = setup();
  for(const phase of ['day','dusk','night','dawn','day'])cycle.update(state(phase,false));
  assert.deepEqual(calls, []);
});
test('explicit return to Auto aligns the current stable phase only once', () => {
  const { calls, cycle } = setup(); cycle.update(state('night')); cycle.update(state('night',false));
  cycle.update(state('day',false)); cycle.update(state('day')); cycle.update(state('day'));
  assert.deepEqual(calls, ['dinner','cruise']);
});
test('resuming Auto during dusk waits until night', () => {
  const { calls, cycle } = setup(); cycle.update(state('dusk',false));cycle.update(state('dusk'));cycle.update(state('night'));
  assert.deepEqual(calls, ['dinner']);
});
test('invalid packets cannot poison edge detection', () => {
  const { calls, cycle } = setup();cycle.update(state('night'));
  for(const bad of [null,{}, {stage:'invalid',automatic:true}, {stage:'day',automatic:'true'}])assert.equal(cycle.update(bad),null);
  cycle.update(state('night'));assert.deepEqual(calls,['dinner']);
  assert.throws(()=>create(null));
});
test('synchronous feedback cannot recursively trigger the same scene', () => {
  let calls=0;const cycle=create(()=>{calls++;cycle.update(state('night'));});cycle.update(state('night'));assert.equal(calls,1);
});
