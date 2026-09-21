import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
const source = await readFile(new URL('../public/ftv-luxury/model-bridge.js', import.meta.url), 'utf8');
async function fixture() {
  const messages = [], listeners = {}, parent = { postMessage: m => messages.push(m) };
  const vector = values => ({ values, copy(v) { this.values = [...v.values]; return this; }, set(...v) { this.values = v; return this; }, toArray() { return this.values; }, get x() { return this.values[0]; }, get y() { return this.values[1]; }, get z() { return this.values[2]; } });
  const context = { console, URL, Number, Math, Object, innerWidth: 1280, innerHeight: 800, location: { href: 'https://test.local/ftv-luxury/models/yacht.html', origin: 'https://test.local', protocol: 'https:' }, parent,
    document: { currentScript: { src: 'https://test.local/ftv-luxury/model-bridge.js' }, createElement: () => ({}), head: { appendChild: s => s.onload() }, addEventListener: () => {} },
    desiredRadius: 80, radius: 22, desiredYaw: -.68, yaw: 0, desiredPitch: .16, pitch: 0,
    target: vector([0, 0, 0]), desiredTarget: vector([-1, 10, 0]),
    camera: { position: vector([0, 0, 0]), lookAt() {}, setViewOffset(...v) { this.offset = v; }, updateProjectionMatrix() {}, updateMatrixWorld() {} },
    scene: { onAfterRender() { context.previousCallback++; } }, previousCallback: 0,
  };
  context.window = context;
  context.addEventListener = (type, cb) => { listeners[type] = cb; };
  context.__ftvYachtExterior = { finalized: true };
  context.__ftvModel = { project: 'yacht-monaco', catalog: [], floors: [], viewport(v) { context.lastViewport = v; context.desiredRadius = 110; }, state: () => ({ room: 'all' }), exteriorState: () => ({}) };
  await vm.runInNewContext(source, context);
  return { context, api: context.__ftvModel, messages, listeners, parent };
}
const view = { x: 360, y: 180, w: 690, h: 510 };
test('model-ready alone never acknowledges a rendered entry', async () => {
  const { context, messages } = await fixture();
  assert.equal(messages.filter(m => m.type === 'model-ready').length, 1);
  assert.equal(messages.some(m => m.type === 'presentation-ready'), false);
  assert.equal(context.radius, 22);
});
test('first presentation snaps all orbit components and acknowledges only after render', async () => {
  const { context, api, messages } = await fixture();
  api.present(view, 'request-1');
  assert.equal(context.radius, 110); assert.equal(context.yaw, context.desiredYaw); assert.equal(context.pitch, context.desiredPitch);
  assert.deepEqual(context.target.values, [-1, 10, 0]);
  assert.deepEqual(context.camera.offset, [690, 510, -360, -180, 1280, 800]);
  assert.equal(messages.some(m => m.type === 'presentation-ready'), false);
  context.scene.onAfterRender();
  const ack = messages.find(m => m.type === 'presentation-ready');
  assert.equal(ack.requestId, 'request-1'); assert.equal(ack.radius, ack.desiredRadius); assert.equal(context.previousCallback, 1);
  context.scene.onAfterRender(); assert.equal(messages.filter(m => m.type === 'presentation-ready').length, 1);
});
test('new layout supersedes stale pending presentation', async () => {
  const { context, api, messages } = await fixture();
  api.present(view, 'old'); api.present({ ...view, w: 600 }, 'new'); context.scene.onAfterRender();
  assert.equal(messages.find(m => m.type === 'presentation-ready').requestId, 'new');
});
test('manual zoom after presentation is not snapped or reset by later frames', async () => {
  const { context, api } = await fixture(); api.present(view, 'first'); context.scene.onAfterRender();
  api.zoom(-120); const zoom = context.desiredRadius;
  assert.ok(zoom < 110); assert.equal(context.radius, 110);
  context.scene.onAfterRender(); assert.equal(context.desiredRadius, zoom); assert.equal(context.radius, 110);
});
test('invalid viewport, request and cross-origin messages cannot reveal a frame', async () => {
  const { context, api, messages, listeners, parent } = await fixture();
  for (const v of [{ ...view, w: 0 }, { ...view, h: NaN }, null]) api.present(v, 'bad');
  api.present(view, null);
  listeners.message({ source: parent, origin: 'https://other.local', data: { channel: 'ftv-luxury/v1', project: 'yacht-monaco', type: 'present', viewport: view, requestId: 'forged' } });
  context.scene.onAfterRender(); assert.equal(messages.some(m => m.type === 'presentation-ready'), false);
});
