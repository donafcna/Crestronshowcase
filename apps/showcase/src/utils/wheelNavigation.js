/** Normalize mouse wheels and trackpads without taking over GUI scrolling. */
export const WHEEL_CONTROLS = 'iframe,button,a,input,select,textarea,label,[role="dialog"],[role="slider"],[contenteditable]:not([contenteditable="false"]),.workspace-device-sidebar,.phone-device-frame,.projects-strip';

export function wheelPixels(event, pageHeight = 800) {
  // Read the unit before deltas (some engines change units upon this access).
  const mode = event.deltaMode ?? 0;
  if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey) return 0;
  const { deltaY: y, deltaX: x = 0 } = event;
  if (!Number.isFinite(y) || !Number.isFinite(x) || ![0, 1, 2].includes(mode) || Math.abs(x) > Math.abs(y)) return 0;
  const height = Number.isFinite(pageHeight) && pageHeight > 0 ? pageHeight : 800;
  return Math.max(-240, Math.min(240, y * (mode === 1 ? 16 : mode === 2 ? height : 1)));
}

/** One zoom command per animation frame; disposal cancels unmount races. */
export function createWheelNavigation(onZoom, {
  enabled = () => true,
  height = () => 800,
  schedule = fn => requestAnimationFrame(fn),
  cancel = id => cancelAnimationFrame(id),
} = {}) {
  let pending = 0, frame = null, disposed = false;
  const handler = event => {
    if (disposed || !enabled() || event.target?.closest?.(WHEEL_CONTROLS)) return;
    const delta = wheelPixels(event, height());
    if (!delta) return;
    if (event.cancelable !== false) event.preventDefault();
    pending = Math.max(-600, Math.min(600, pending + delta));
    if (frame === null) frame = schedule(() => {
      frame = null;
      const amount = pending; pending = 0;
      if (!disposed && enabled() && amount) onZoom(amount);
    });
  };
  handler.dispose = () => {
    disposed = true; pending = 0;
    if (frame !== null) cancel(frame);
    frame = null;
  };
  return handler;
}
