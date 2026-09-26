import React, { useEffect, useRef, useState } from 'react';
import './background.css';
import { LUXURY_MODELS } from './modelProjects';
const channel = 'ftv-luxury/v1';
const commands = new Set(['hello', 'select', 'level', 'overview', 'scene', 'lighting', 'color', 'capture', 'visibility', 'resize', 'exterior', 'zoom']);
const controls = 'iframe,button,a,input,select,textarea,.workspace-device-sidebar,.phone-device-frame,.projects-strip';
const ENTRY_VERSION = '2026-09-21-first-frame-1';

/** Reveal the yacht only after a frame has actually rendered in the free viewport. */
export function LuxuryBackground({ projectId, stageRef, tourSessionRef }) {
  const frameRef = useRef(null);
  const [attempt, setAttempt] = useState(0);
  const [readyFor, setReadyFor] = useState(null);
  const [failure, setFailure] = useState(null);
  const instance = `${projectId}:${attempt}`, yacht = projectId === 'yacht-monaco';
  // Keyed state also prevents the previous project's ready=true on the first render.
  const ready = readyFor === instance;
  useEffect(() => {
    const stage = stageRef.current, frame = frameRef.current;
    if (!stage || !frame) return undefined;
    setReadyFor(null); setFailure(null);
    const origin = window.location.origin;
    const gui = () => stage.querySelector('iframe.ftv-luxury-interface');
    const send = (type, payload = {}) => frame.contentWindow?.postMessage({ channel, project: projectId, type, ...payload }, origin);
    const relay = message => gui()?.contentWindow?.postMessage(message, origin);
    let previous = '', loaded = false, shown = false, failed = false, guiReady = false;
    let candidate = '', stableSince = 0, pending = null, revision = 0, raf = 0;
    const nonce = `${instance}:${performance.now()}`;
    const fail = text => { failed = true; cancelAnimationFrame(raf); setFailure({ instance, text }); };
    const timeout = yacht ? setTimeout(() => fail('Le yacht ne peut pas encore être affiché. Réessayez le chargement.'), 30000) : null;
    const measure = () => {
      const canvas = frame.getBoundingClientRect();
      const phone = stage.querySelector('.phone-device-frame')?.getBoundingClientRect();
      const side = stage.querySelector('.workspace-device-sidebar')?.getBoundingClientRect();
      if (!phone || !canvas.width || !canvas.height || !phone.width || !phone.height) return null;
      const x = phone.right - canvas.left + 4;
      const y = Math.max(90, phone.top - canvas.top + 12);
      const w = (side ? side.left - canvas.left - 4 : canvas.width - 24) - x;
      const h = Math.min(canvas.height - y - 28, phone.height - 24);
      const viewport = w >= 220 && h >= 160 ? { x, y, w, h } : { x: 0, y: 80, w: canvas.width, h: Math.max(1, canvas.height - 80) };
      const signature = [canvas.width, canvas.height, ...Object.values(viewport)].map(n => n.toFixed(1)).join(':');
      return { viewport, signature };
    };
    const layout = () => {
      if (!loaded || failed) return;
      const seconds = tourSessionRef?.current?.seconds?.();
      if (yacht && Number.isFinite(seconds) && seconds >= 0) send('environment-time', { seconds });
      const value = measure();
      if (!value) return;
      if (yacht && !shown) {
        // Wait for the GUI bootstrap and actual chassis/font geometry, not a
        // fixed multi-second delay. Re-sample while CSS layout is settling.
        const guiInitialized = guiReady || gui()?.contentWindow?.ftvGui?.ready;
        if (!guiInitialized || document.fonts?.status === 'loading') { candidate = ''; stableSince = performance.now(); return; }
        if (candidate !== value.signature) { candidate = value.signature; stableSince = performance.now(); pending = null; return; }
        if (performance.now() - stableSince < 120 || pending) return;
        pending = { id: `${nonce}:${++revision}`, signature: value.signature };
        send('present', { viewport: value.viewport, requestId: pending.id });
      } else if (value.signature !== previous) {
        previous = value.signature; send('viewport', { viewport: value.viewport });
      }
    };
    const entryTick = () => { layout(); if (!shown && !failed) raf = requestAnimationFrame(entryTick); };
    const message = event => {
      if (event.origin !== origin) return;
      const data = event.data;
      if (data?.channel !== channel || data.project !== projectId) return;
      if (event.source === frame.contentWindow) {
        if (data.type === 'model-ready') {
          if (!loaded) {
            loaded = true; previous = '';
            if (!yacht) { shown = true; setReadyFor(instance); }
            else if (!data.presentation) fail('Le module de cadrage du yacht est indisponible. Réessayez le chargement.');
            layout();
          }
        }
        if (yacht && data.type === 'presentation-ready' && !shown && !failed && pending?.id === data.requestId) {
          const value = measure();
          if (value?.signature === pending.signature) {
            previous = value.signature; shown = true;
            clearTimeout(timeout); cancelAnimationFrame(raf);
            setReadyFor(instance);
          } else { pending = null; candidate = ''; layout(); }
        }
        if (['model-ready', 'selection', 'model-error', 'user-activity', 'exterior-state'].includes(data.type)) relay(data);
      } else if (event.source === gui()?.contentWindow) {
        if (data.type === 'gui-ready') { guiReady = true; layout(); }
        if (data.type === 'background-command') {
          const command = data.command;
          if (!commands.has(command?.type)) return;
          // Bootstrap overview/selection must finish before requesting the
          // first visible frame. Do not reset this gate on periodic hello.
          if (yacht && !shown && ['overview', 'select', 'level', 'resize'].includes(command.type)) {
            candidate = ''; pending = null; stableSince = performance.now();
          }
          frame.contentWindow?.postMessage({ ...command, channel, project: projectId }, origin);
        }
      }
    };
    let lastWheel = 0, accumulated = 0;
    const wheel = event => {
      if (!loaded || (yacht && !shown) || document.hidden || event.ctrlKey || event.metaKey || event.target.closest(controls) || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      event.preventDefault();
      if (Math.sign(accumulated) !== Math.sign(event.deltaY)) accumulated = 0;
      accumulated += event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1);
      if (Math.abs(accumulated) < 36 || performance.now() - lastWheel < 650) return;
      if (accumulated > 0) send('overview');
      else {
        const selected = gui()?.contentWindow?.ftvGui?.state.zone;
        send('select', { id: selected && selected !== 'all' ? selected : yacht ? '0' : 'hall' });
      }
      lastWheel = performance.now(); accumulated = 0;
    };
    const click = event => {
      if (!loaded || (yacht && !shown) || event.button !== 0 || event.ctrlKey || event.metaKey || event.target.closest(controls)) return;
      const bounds = frame.getBoundingClientRect();
      send('pick', { x: event.clientX - bounds.left, y: event.clientY - bounds.top });
    };
    const hello = () => send('hello');
    window.addEventListener('message', message);
    window.addEventListener('resize', layout);
    frame.addEventListener('load', hello);
    stage.addEventListener('wheel', wheel, { passive: false });
    stage.addEventListener('click', click);
    const observer = new ResizeObserver(layout); observer.observe(stage);
    const timer = setInterval(layout, 300);
    if (yacht) raf = requestAnimationFrame(entryTick);
    hello();
    return () => {
      clearTimeout(timeout); cancelAnimationFrame(raf);
      clearInterval(timer); observer.disconnect();
      window.removeEventListener('message', message); window.removeEventListener('resize', layout);
      frame.removeEventListener('load', hello);
      stage.removeEventListener('wheel', wheel); stage.removeEventListener('click', click);
    };
  }, [projectId, stageRef, tourSessionRef, instance, yacht]);
  return (
    <div className={`plan3d-bg-container luxury-background${yacht ? ' yacht-background' : ''}`} data-ready={ready}>
      <iframe key={instance} ref={frameRef} className="luxury-background-frame"
        style={yacht ? { opacity: ready ? 1 : 0 } : undefined}
        src={`/ftv-luxury/models/${LUXURY_MODELS[projectId]}.html?background=1&entry=${ENTRY_VERSION}&attempt=${attempt}`}
        title={yacht ? 'Asteria — modèle 3D en arrière-plan' : 'Boutique Auralis — modèle 3D en arrière-plan'}
        tabIndex={-1} aria-hidden="true" />
      {!ready && <span className="luxury-background-loading" role="status" style={{ pointerEvents: 'auto' }}>
        {failure?.instance === instance ? <>{failure.text} <button type="button" onClick={() => setAttempt(n => n + 1)}>Réessayer</button></> : 'Chargement de la 3D…'}
      </span>}
    </div>
  );
}
