/* global desiredRadius, radius, desiredYaw, yaw, desiredPitch, pitch, target, desiredTarget, camera, scene */
(async () => {
  'use strict';
  const api = window.__ftvModel;
  if (!api) return;
  const base = document.currentScript?.src || new URL('../model-bridge.js', location.href).href;
  const channel = 'ftv-luxury/v1', isLocalFile = location.protocol === 'file:' || location.origin === 'null';
  const origin = isLocalFile ? '*' : location.origin;
  const send = (type, payload = {}) => parent.postMessage({ channel, project: api.project, type, ...payload }, origin);
  const validViewport = v => v && ['x', 'y', 'w', 'h'].every(k => Number.isFinite(v[k])) && v.w > 0 && v.h > 0;
  let last = '', exteriorError = null;
  if (api.project === 'yacht-monaco') {
    // One wheel notch toggles between the complete yacht and the last room.
    api.zoom = delta => {
      if (!Number.isFinite(delta) || delta === 0) return;
      if (delta > 0) api.overview();
      else api.select(api.lastRoom?.() || '0');
      window.__ftvEmit?.();
    };
    try {
      for (const file of ['yacht-exterior-core.js', 'yacht-exterior.js', 'yacht-exterior-finalize.js', 'yacht-night-finish.js']) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script'); script.src = new URL(file, base).href;
          script.onload = resolve; script.onerror = () => reject(new Error('Échec du chargement : ' + file)); document.head.appendChild(script);
        });
      }
      if (!api.exteriorState || !window.__ftvYachtExterior?.finalized) throw new Error('L’extension extérieure n’a pas pu être initialisée.');
    } catch (error) {
      exteriorError = error.message; console.error('[Asteria exterior]', error);
    }
    // A viewport message used to change desiredRadius only: the host exposed
    // the default camera while it eased to that new distance. Initial entry
    // now has its own request/render/ack handshake. Subsequent zoom is intact.
    let pending = null, rendered = null;
    api.present = (viewport, requestId) => {
      if (!validViewport(viewport) || typeof requestId !== 'string' || requestId.length > 200) return;
      api.viewport(viewport);
      radius = desiredRadius; yaw = desiredYaw; pitch = desiredPitch; target.copy(desiredTarget);
      camera.position.set(target.x + Math.sin(yaw) * Math.cos(pitch) * radius, target.y + Math.sin(pitch) * radius, target.z + Math.cos(yaw) * Math.cos(pitch) * radius);
      camera.lookAt(target);
      camera.setViewOffset(viewport.w, viewport.h, -viewport.x - viewport.w * .075, -viewport.y, innerWidth, innerHeight);
      camera.updateProjectionMatrix(); camera.updateMatrixWorld(true);
      pending = { requestId, viewport: { ...viewport } };
    };
    const afterRender = scene.onAfterRender;
    scene.onAfterRender = function (...args) {
      afterRender?.apply(this, args);
      if (!pending) return;
      rendered = { ...pending, radius, desiredRadius, camera: camera.position.toArray() };
      pending = null;
      send('presentation-ready', rendered);
    };
    api.presentationState = () => ({ pending, rendered });
  }
  const ready = () => {
    send('model-ready', { rooms: api.catalog, floors: api.floors, exterior: !!api.exteriorState && !exteriorError, presentation: typeof api.present === 'function' });
    if (api.exteriorState) send('exterior-state', api.exteriorState());
    if (exteriorError) send('model-error', { message: 'Éclairage extérieur indisponible : ' + exteriorError });
  };
  window.__ftvEmit = () => {
    const state = api.state(), text = JSON.stringify(state);
    if (text !== last) { last = text; send('selection', state); }
  };
  window.addEventListener('message', event => {
    if (event.source !== parent || (!isLocalFile && event.origin !== location.origin)) return;
    const m = event.data;
    if (m?.channel !== channel || m.project !== api.project) return;
    try {
      switch (m.type) {
        case 'present': api.present?.(m.viewport, m.requestId); break;
        case 'viewport': if (validViewport(m.viewport)) api.viewport?.(m.viewport); break;
        case 'pick': if (Number.isFinite(m.x) && Number.isFinite(m.y)) api.pick?.(m.x, m.y); break;
        case 'visibility': window.__ftvPaused = m.visible === false; api.visibility?.(m.visible !== false); break;
        case 'resize': window.dispatchEvent(new Event('resize')); break;
        case 'select': if (m.id === 'all' || m.id === 'hall' && api.project === 'boutique-hermes' || api.catalog.some(r => r.id === m.id)) api.select(m.id); break;
        case 'level': if (m.id === 'all' || api.floors.some(r => String(r.id) === String(m.id))) api.level(m.id); break;
        case 'overview': api.overview(); break;
        case 'zoom': if (Number.isFinite(m.delta)) api.zoom?.(m.delta); break;
        case 'scene': api.scene(m.key); break;
        case 'lighting': if (m.values && typeof m.values === 'object') api.lighting(m.values, m.scope || 'all'); break;
        case 'color': api.color(m.value); break;
        case 'capture': api.capture(); break;
        case 'environment-time': if (Number.isFinite(m.seconds) && m.seconds >= 0) api.environmentTime?.(m.seconds); break;
        case 'exterior': if (!exteriorError) api.exterior?.(m.command); break;
        case 'hello': ready(); break;
        default: return;
      }
      window.__ftvEmit();
    } catch { send('model-error', { message: 'Cette commande n’a pas pu être appliquée.' }); }
  });
  for (const name of ['pointerdown', 'keydown', 'wheel']) document.addEventListener(name, event => { if (event.isTrusted) send('user-activity'); }, { capture: true, passive: true });
  ready(); window.__ftvEmit();
})();
