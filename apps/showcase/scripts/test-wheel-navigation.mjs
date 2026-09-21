import test from 'node:test';
import assert from 'node:assert/strict';
import { wheelPixels, createWheelNavigation } from '../src/utils/wheelNavigation.js';
const event = (props = {}) => ({ deltaMode: 0, deltaX: 0, deltaY: 120, cancelable: true,
  preventDefault() { this.defaultPrevented = true; }, ...props });
test('mouse wheel / trackpad / line / page units retain direction and small deltas', () => {
  assert.equal(wheelPixels(event()), 120);
  assert.equal(wheelPixels(event({deltaY: -.25})), -.25);
  assert.equal(wheelPixels(event({deltaMode: 1, deltaY: -3})), -48);
  assert.equal(wheelPixels(event({deltaMode: 2, deltaY: .1}), 700), 70);
  assert.equal(wheelPixels(event({deltaY: 100000})), 240);
});
test('browser zoom, GUI gestures and malformed deltas remain untouched', () => {
  for (const props of [{ctrlKey:true},{metaKey:true},{shiftKey:true},{defaultPrevented:true},
    {deltaX:121},{deltaY:NaN},{deltaY:Infinity},{deltaX:Infinity},{deltaMode:3},{deltaY:0}]) assert.equal(wheelPixels(event(props)), 0);
});
test('events coalesce without a cooldown or forced overview/selection', () => {
  let callback, cancellations = 0; const calls = [];
  const handler = createWheelNavigation(delta => calls.push(delta), {schedule: fn => (callback=fn, 1),cancel:()=>cancellations++});
  const a=event({deltaY:-10}), b=event({deltaY:-5}); handler(a); handler(b);
  assert.equal(a.defaultPrevented,true); assert.equal(b.defaultPrevented,true);
  assert.deepEqual(calls,[]); callback(); assert.deepEqual(calls,[-15]);
  handler(event({deltaY:12})); callback(); assert.deepEqual(calls,[-15,12]);
  handler(event()); handler.dispose(); callback(); assert.deepEqual(calls,[-15,12]); assert.equal(cancellations,1);
});
test('controls, unready frames and browser modifiers never consume the event', () => {
  let scheduled=0;
  const run=createWheelNavigation(()=>{}, {schedule:()=>++scheduled});
  const control=event({target:{closest:()=>({})}}); run(control); assert.equal(control.defaultPrevented,undefined);
  const modifier=event({ctrlKey:true}); run(modifier); assert.equal(modifier.defaultPrevented,undefined);
  const unloaded=createWheelNavigation(()=>{}, {enabled:()=>false,schedule:()=>++scheduled});
  const e=event(); unloaded(e); assert.equal(e.defaultPrevented,undefined); assert.equal(scheduled,0);
});
