import { useEffect, useState } from 'react';
import { useTranslation } from '../context/LanguageContext';
import './villa-ftv.css';

// Villa FTV (v6.1) : sélecteur « Espace » du site, sur le modèle de l'Hôtel Brassus.
// « Général » (défaut) = GUI complète avec le menu de gauche ; une pièce = GUI sans menu (?menu=0&room=N),
// nom de la pièce en titre. Les pièces viennent du villa_config.json de la vitrine (pieces actives).
const CONFIG_URL = '/showcases/villa-gemini-frequencetv/villa_config.json';
const LABELS = {
  fr: { espace: 'Espace', general: 'Général', note: 'Commandes simulées' },
  en: { espace: 'Space', general: 'General', note: 'Simulated controls' },
  de: { espace: 'Bereich', general: 'Allgemein', note: 'Simulierte Bedienung' },
};
let roomsCache = null;

export function VillaFtvTools({ guiFrameRef }) {
  const { lang } = useTranslation();
  const L = LABELS[lang] || LABELS.fr;
  const [room, setRoom] = useState('general');
  const [rooms, setRooms] = useState(roomsCache || []);

  useEffect(() => {
    if (roomsCache) return;
    let alive = true;
    fetch(CONFIG_URL).then(r => r.json()).then(cfg => {
      const list = (cfg.pieces || []).filter(p => p && p.actif !== false).map(p => ({ id: p.id, nom: p.nom }));
      roomsCache = list;
      if (alive) setRooms(list);
    }).catch(() => { });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    const frame = guiFrameRef.current;
    if (!frame) return;
    const url = new URL(frame.src);
    if (room === 'general') { url.searchParams.set('menu', '1'); url.searchParams.delete('room'); }
    else { url.searchParams.set('menu', '0'); url.searchParams.set('room', room); }
    if (url.href !== frame.src) frame.src = url.href;
  }, [room, guiFrameRef]);

  return <div className="villa-ftv-tools">
    <label>{L.espace}<select aria-label={L.espace} value={room} onChange={e => setRoom(e.target.value)}>
      <option value="general">{L.general}</option>
      {rooms.map(r => <option key={r.id} value={String(r.id)}>{r.nom}</option>)}
    </select></label>
    <small>{L.note}</small>
  </div>;
}
