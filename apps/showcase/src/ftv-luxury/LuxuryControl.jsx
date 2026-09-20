import React, { useEffect, useRef } from 'react';

/** Shared, isolated GUI; keeps the showcase's existing device frame and routes. */
export function LuxuryControl({ projectId, deviceType = 'wallpanel', onControl }) {
  const frame = useRef(null);
  useEffect(() => {
    const handle = event => {
      if (event.origin !== window.location.origin || event.source !== frame.current?.contentWindow) return;
      const msg = event.data;
      if (msg?.channel !== 'ftv-luxury/v1' || msg.project !== projectId || msg.type !== 'control') return;
      const detail = { projectId, name: msg.control, value: msg.value, scope: msg.scope };
      onControl?.(detail);
      window.dispatchEvent(new CustomEvent('ftv:control', { detail }));
    };
    window.addEventListener('message', handle);
    return () => window.removeEventListener('message', handle);
  }, [projectId, onControl]);
  return React.createElement('iframe', {
    ref: frame,
    src: `/ftv-luxury/gui.html?project=${encodeURIComponent(projectId)}&device=${encodeURIComponent(deviceType)}`,
    title: projectId === 'yacht-monaco' ? 'Sunrays — commandes et visite 3D' : 'Boutique VCA — commandes et visite 3D',
    className: `ftv-luxury-interface ${deviceType}`,
    allow: 'fullscreen',
    style: { display: 'block', width: '100%', height: '100%', border: 0, background: '#0d201d' }
  });
}
