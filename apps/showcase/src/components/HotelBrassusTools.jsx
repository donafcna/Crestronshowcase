import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './hotel-brassus.css';

// Presentation controls belong to the website, never to the device GUI.
export function HotelBrassusTools({ guiFrameRef }) {
  const [zone, setZone] = useState('bar'), [theme, setTheme] = useState('actuel');
  const [open, setOpen] = useState(false), model = useRef(null), trigger = useRef(null), close = useRef(null);
  const feedback = useRef(null);
  useEffect(() => {
    const frame = guiFrameRef.current;
    if (!frame) return;
    const url = new URL(frame.src);
    url.searchParams.set('zone', zone); url.searchParams.set('theme', theme); url.searchParams.set('nolock', '1');
    if (url.href !== frame.src) frame.src = url.href;
  }, [zone, theme, guiFrameRef]);
  useEffect(() => {
    const receive = e => {
      if (e.origin !== location.origin) return;
      if (e.source === guiFrameRef.current?.contentWindow && e.data?.channel === 'hdh-demo') {
        feedback.current = e.data;
        model.current?.contentWindow.postMessage(e.data, location.origin);
      }
      if (e.source === model.current?.contentWindow && e.data?.channel === 'hdh-close') setOpen(false);
    };
    window.addEventListener('message', receive);
    return () => window.removeEventListener('message', receive);
  }, [guiFrameRef]);
  useEffect(() => {
    if (!open) return;
    const app = document.getElementById('root'), previousInert = app?.inert;
    if (app) app.inert = true;
    close.current?.focus();
    const escape = e => { if (e.key === 'Escape') { e.stopPropagation(); setOpen(false); } };
    window.addEventListener('keydown', escape, true);
    return () => { window.removeEventListener('keydown', escape, true); if (app) app.inert = previousInert; trigger.current?.focus(); };
  }, [open]);
  return <>
    <div className="hotel-brassus-tools">
      <label>Espace<select aria-label="Espace" value={zone} onChange={e => setZone(e.target.value)}>
        <option value="bar">Bar</option><option value="entrance">Entrée / Lobby</option><option value="restaurant">Restaurant</option><option value="salon">Petit salon</option><option value="pdr">Salle privée</option><option value="wellness">Wellness</option><option value="seminar">Séminaires</option>
      </select></label>
      <label>Thème<select aria-label="Thème" value={theme} onChange={e => setTheme(e.target.value)}><option value="actuel">Original</option><option value="clair">Clair</option><option value="sombre">Sombre</option></select></label>
      <button ref={trigger} type="button" onClick={() => setOpen(true)}>Maquette 3D</button>
      <small>Commandes simulées</small>
    </div>
    {open && createPortal(<div className="hdh-model-overlay">
      <section className="hdh-model-dialog" role="dialog" aria-modal="true" aria-labelledby="hdh-model-title">
        <header><strong id="hdh-model-title">Hotel Brassus · Maquette 3D</strong><button ref={close} type="button" onClick={() => setOpen(false)}>Fermer</button></header>
        <iframe ref={model} src="/showcases/hotel-brassus/model.html" title="Maquette 3D de l’Hôtel des Horlogers" onLoad={() => { if (feedback.current) model.current.contentWindow.postMessage(feedback.current, location.origin); }} />
      </section>
    </div>, document.body)}
  </>;
}
