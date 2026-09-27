// Present the initial villa only after its real free-space framing has rendered.
// Later room/overview navigation keeps the existing animated camera behaviour.
export const VILLA_ENTRY_STABLE_MS = 160;

export function createVillaEntry({ api, measure, onReady, isOverview = () => true,
  fontsReady = () => document.fonts?.status !== 'loading',
  now = () => performance.now(), requestFrame = requestAnimationFrame,
  cancelFrame = cancelAnimationFrame }) {
  let ready = false, disposed = false, frame = 0, signature = '', stableSince = null;
  let fittedAtFrame = 0, pose = null, started = false;
  const state = () => ({ ready, signature, fittedAtFrame, pose });
  const update = () => {
    if (ready || disposed) return;
    const layout = measure();
    if (!layout || !fontsReady()) { signature = ''; stableSince = null; return; }
    api.setWindow(layout.rect);
    // setWindow normally flies from the canvas-wide default to the phone-side
    // viewport. Finish that initial flight while the canvas is still hidden.
    if (isOverview() && api.navigation().phase === 'overview-closed') api.jump();
    const time = now();
    if (signature !== layout.signature) {
      signature = layout.signature; stableSince = time;
      fittedAtFrame = api.metrics().renderedFrames;
    }
    const navigation = api.navigation();
    const settled = !navigation.moving && (isOverview()
      ? navigation.phase === 'overview-closed'
      : ['overview-closed', 'room'].includes(navigation.phase));
    if (stableSince === null || time - stableSince < VILLA_ENTRY_STABLE_MS || !settled
      || api.metrics().renderedFrames <= fittedAtFrame) return;
    pose = { ...navigation, camera: [...navigation.camera], target: [...navigation.target] };
    ready = true;
    onReady?.(state());
  };
  const tick = () => {
    if (disposed || ready) return;
    update();
    if (!disposed && !ready) frame = requestFrame(tick);
  };
  return {
    get ready() { return ready; }, state, update,
    start() { if (!started && !disposed) { started = true; tick(); } },
    dispose() { disposed = true; cancelFrame(frame); },
  };
}
