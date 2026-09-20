import React from 'react';
import { Card, Choices, Slider } from './VenuePhone';
import rooms from '../../public/ftv-luxury/venues/club-rooms.json';
export const CLUB_ROOMS = rooms;
export function ClubSpaces({floor,onFloor,room,onRoom,view,onView,settings,onSettings}) {
 const selected=rooms.find(r=>r.id===room);
 return <>
  <Card title="Le bâtiment"><div className="club-floor-tabs">{['RDC','1er étage','2e étage'].map((label,i)=><button key={label} aria-pressed={floor===i} onClick={()=>onFloor(i)}>{label}</button>)}</div><div className="club-view-tabs">{[['building','Bâtiment'],['floor','Étage'],['room','Salle']].map(([id,label])=><button key={id} aria-pressed={view===id} onClick={()=>onView(id)}>{label}</button>)}</div></Card>
  <Card title={floor===0?'Réception · 4 salles':'Palier · 4 salles'}><div className="venue-choices club-room-choices">{rooms.filter(r=>r.floor===floor).map(r=><button key={r.id} aria-pressed={room===r.id} onClick={()=>onRoom(r.id)}>{r.name}</button>)}</div><p className="venue-note club-facilities">WC Hommes · WC Femmes · Escaliers</p></Card>
  <Card title={selected.name}><p className="venue-note">{selected.mood}</p><Choices value={settings.scene} options={[["signature","Signature"],["party","Festif"],["calm","Doux"],["off","Éteint"]]} onChange={scene=>onSettings({scene})}/><Slider label="Intensité de la salle" value={settings.level} onChange={level=>onSettings({level})}/></Card>
 </>;
}
