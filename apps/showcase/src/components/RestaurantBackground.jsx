import React, { useEffect, useRef, useState } from 'react';
import '../ftv-luxury/background.css';

const channel = 'ftv-restaurant/v1';

export function RestaurantBackground({ stageRef }) {
  const frameRef = useRef(null);
  const lastStateRef = useRef(null);
  const lastWheelRef = useRef(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stage = stageRef.current, frame = frameRef.current;
    if (!stage || !frame) return undefined;
    const origin = location.origin;
    const send = (type, payload = {}) => frame.contentWindow?.postMessage({ channel, type, ...payload }, origin);
    const layout = () => {
      const canvas = frame.getBoundingClientRect();
      const phone = stage.querySelector('.phone-device-frame')?.getBoundingClientRect();
      const side = stage.querySelector('.workspace-device-sidebar')?.getBoundingClientRect();
      if (!canvas.width || !canvas.height || !phone) return;
      const x = phone.right - canvas.left + 12;
      const y = Math.max(86, phone.top - canvas.top + 4);
      const right = side ? side.left - canvas.left - 10 : canvas.width - 18;
      send('viewport', { viewport: { x, y, w: Math.max(260, right - x), h: Math.max(220, Math.min(phone.height + 20, canvas.height - y - 18)) } });
    };
    const message = event => {
      if (event.origin === origin && event.source === frame.contentWindow && event.data?.channel === channel && event.data.type === 'ready') {
        setReady(true); layout();
        if (lastStateRef.current) send('state', lastStateRef.current);
      }
    };
    const control = event => {
      lastStateRef.current = event.detail || {};
      send('state', lastStateRef.current);
    };
    const wheel = event => {
      const now = performance.now();
      if (Math.abs(event.deltaY) < 3 || now - lastWheelRef.current < 550) return;
      lastWheelRef.current = now;
      send('view', { view: event.deltaY > 0 ? 'overview' : 'focus' });
    };
    window.addEventListener('message', message);
    window.addEventListener('ftv-restaurant-control', control);
    window.addEventListener('resize', layout);
    stage.addEventListener('wheel', wheel, { passive: true });
    const observer = new ResizeObserver(layout); observer.observe(stage);
    const timer = setInterval(layout, 500);
    frame.addEventListener('load', layout);
    return () => {
      clearInterval(timer); observer.disconnect(); frame.removeEventListener('load', layout);
      window.removeEventListener('message', message); window.removeEventListener('ftv-restaurant-control', control); window.removeEventListener('resize', layout);
      stage.removeEventListener('wheel', wheel);
    };
  }, [stageRef]);

  return <div className="plan3d-bg-container luxury-background restaurant-background" data-ready={ready}>
    <iframe ref={frameRef} className="luxury-background-frame" src="/restaurant-lumiere/model.html?v=2.2.1" title="Maquette 3D du restaurant Kyoto Rooftop" tabIndex={-1} aria-hidden="true" />
    {!ready && <span className="luxury-background-loading" role="status">Création du restaurant 3D…</span>}
  </div>;
}
