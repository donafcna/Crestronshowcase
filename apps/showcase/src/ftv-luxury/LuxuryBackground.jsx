import React, { useEffect, useRef, useState } from 'react';
import './background.css';
import { LUXURY_MODELS } from './modelProjects';
import { createWheelNavigation } from '../utils/wheelNavigation';
const channel = 'ftv-luxury/v1';
const commands = new Set(['hello', 'select', 'level', 'overview', 'scene', 'lighting', 'color', 'capture', 'visibility', 'resize', 'exterior', 'zoom']);
const controls = 'iframe,button,a,input,select,textarea,.workspace-device-sidebar,.phone-device-frame,.projects-strip';

/** The approved model fills the page, while its camera reserves space for the phone. */
export function LuxuryBackground({ projectId, stageRef, tourSessionRef }) {
  const frameRef = useRef(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const stage = stageRef.current;
    const frame = frameRef.current;
    if (!stage || !frame) return undefined;
    setReady(false);
    const origin = window.location.origin;
    const gui = () => stage.querySelector('iframe.ftv-luxury-interface');
    const send = (type, payload = {}) => frame.contentWindow?.postMessage({ channel, project: projectId, type, ...payload }, origin);
    const relay = message => gui()?.contentWindow?.postMessage(message, origin);
    let previous = '', loaded = false;
    const layout = () => {
      if (!loaded) return;
      // Same presentation clock as Villa Crans; lighting presets cannot alter it.
      const seconds = tourSessionRef?.current?.seconds?.();
      if (projectId === 'yacht-monaco' && Number.isFinite(seconds) && seconds >= 0) send('environment-time', { seconds });
      const canvas = frame.getBoundingClientRect();
      const phone = stage.querySelector('.phone-device-frame')?.getBoundingClientRect();
      const side = stage.querySelector('.workspace-device-sidebar')?.getBoundingClientRect();
      if (!phone || !canvas.width || !canvas.height) return;
      const x = phone.right - canvas.left + 4;
      const y = Math.max(90, phone.top - canvas.top + 12);
      const w = (side ? side.left - canvas.left - 4 : canvas.width - 24) - x;
      const h = Math.min(canvas.height - y - 28, phone.height - 24);
      const viewport = w >= 220 && h >= 160 ? { x, y, w, h } : { x: 0, y: 80, w: canvas.width, h: Math.max(1, canvas.height - 80) };
      const signature = JSON.stringify([canvas.width, canvas.height, viewport]);
      if (signature !== previous) { previous = signature; send('viewport', { viewport }); }
    };
    const message = event => {
      if (event.origin !== origin) return;
      const data = event.data;
      if (data?.channel !== channel || data.project !== projectId) return;
      if (event.source === frame.contentWindow) {
        if (data.type === 'model-ready') { loaded = true; previous = ''; setReady(true); layout(); }
        if (['model-ready', 'selection', 'model-error', 'user-activity', 'exterior-state'].includes(data.type)) relay(data);
      } else if (event.source === gui()?.contentWindow && data.type === 'background-command') {
        const command = data.command;
        if (!commands.has(command?.type)) return;
        frame.contentWindow?.postMessage({ ...command, channel, project: projectId }, origin);
      }
    };
    const zoomWheel = createWheelNavigation(delta => send('zoom', { delta }), {
      enabled: () => loaded && !document.hidden,
      height: () => stage.clientHeight || innerHeight,
    });
    // Preserve the boutique's existing overview/room navigation. On the yacht,
    // the wheel changes distance only; selection stays in the GUI.
    let lastWheel = 0, accumulated = 0;
    const wheel = projectId === 'yacht-monaco' ? zoomWheel : event => {
      if (!loaded || event.ctrlKey || event.metaKey || event.target.closest(controls) || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      event.preventDefault();
      if (Math.sign(accumulated) !== Math.sign(event.deltaY)) accumulated = 0;
      accumulated += event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1);
      if (Math.abs(accumulated) < 36 || performance.now() - lastWheel < 650) return;
      if (accumulated > 0) send('overview');
      else send('select', { id: gui()?.contentWindow?.ftvGui?.state.zone || 'all' });
      lastWheel = performance.now(); accumulated = 0;
    };
    const click = event => {
      if (!loaded || event.button !== 0 || event.ctrlKey || event.metaKey || event.target.closest(controls)) return;
      const bounds = frame.getBoundingClientRect();
      send('pick', { x: event.clientX - bounds.left, y: event.clientY - bounds.top });
    };
    const hello = () => send('hello');
    window.addEventListener('message', message);
    window.addEventListener('resize', layout);
    frame.addEventListener('load', hello);
    stage.addEventListener('wheel', wheel, { passive: false });
    stage.addEventListener('click', click);
    const observer = new ResizeObserver(layout);
    observer.observe(stage);
    const timer = setInterval(layout, 300);
    hello();
    return () => {
      zoomWheel.dispose();
      clearInterval(timer); observer.disconnect();
      window.removeEventListener('message', message);
      window.removeEventListener('resize', layout);
      frame.removeEventListener('load', hello);
      stage.removeEventListener('wheel', wheel);
      stage.removeEventListener('click', click);
    };
  }, [projectId, stageRef, tourSessionRef]);
  return (
    <div className="plan3d-bg-container luxury-background" data-ready={ready}>
      <iframe key={projectId} ref={frameRef} className="luxury-background-frame"
        src={`/ftv-luxury/models/${LUXURY_MODELS[projectId]}.html?background=1`}
        title={projectId === 'yacht-monaco' ? 'Asteria — modèle 3D en arrière-plan' : 'Boutique Auralis — modèle 3D en arrière-plan'}
        tabIndex={-1} aria-hidden="true" />
      {!ready && <span className="luxury-background-loading" role="status">Chargement de la 3D…</span>}
    </div>
  );
}
