import { useEffect, useState } from 'react';
import './hotel-brassus.css';

// Presentation controls belong to the website, never to the device GUI.
// 2.2.21 : seul le sélecteur d'espace subsiste (thème et maquette 3D retirés).
export function HotelBrassusTools({ guiFrameRef, main }) {
  const [zone, setZone] = useState('bar');
  useEffect(() => {
    const frame = guiFrameRef.current;
    if (!frame || main) return;
    const url = new URL(frame.src);
    url.searchParams.set('zone', zone); url.searchParams.set('theme', 'actuel'); url.searchParams.set('nolock', '1');
    if (url.href !== frame.src) frame.src = url.href;
  }, [zone, guiFrameRef, main]);
  useEffect(() => {
    if (!main) return;
    function updatePlace(event) {
      if (event.origin !== window.location.origin || event.source !== guiFrameRef.current?.contentWindow) return;
      if (event.data?.channel === 'hdh-demo-place') setZone(event.data.zone);
    }
    window.addEventListener('message', updatePlace);
    return () => window.removeEventListener('message', updatePlace);
  }, [main, guiFrameRef]);
  return <div className="hotel-brassus-tools">
    <label>Espace<select aria-label="Espace" disabled={main} value={zone} onChange={e => setZone(e.target.value)}>
      <option value="bar">Bar</option><option value="entrance">Entrée / Lobby</option><option value="restaurant">Restaurant</option><option value="salon">Petit salon</option><option value="pdr">Salle privée</option><option value="wellness">Wellness</option><option value="seminar">Séminaires</option>
    </select></label>
    <small>Commandes simulées</small>
  </div>;
}
