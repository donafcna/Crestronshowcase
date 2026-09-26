import React, { useState } from 'react';
import { Icons } from '../icons';
import './phone.css';
export function VenuePhone({ name, subtitle, headerExtra, tabs, active, onTab, children }) {
  const [theme,setTheme]=useState('dark');
  return <section className="venue-phone" data-theme={theme}><header><span className="venue-eyebrow">FRÉQUENCE TV · CONTROL</span><h1>{name}</h1><p>{subtitle}</p>{headerExtra}<button className="venue-theme" aria-label="Changer le thème" onClick={()=>setTheme(t=>t==='dark'?'light':t==='light'?'glass':'dark')}>{({dark:'Sombre',light:'Clair',glass:'Verre'})[theme]}</button></header><nav aria-label="Commandes">{tabs.map(([id,label,icon])=>{const Icon=Icons[icon];return <button key={id} aria-pressed={active===id} onClick={()=>onTab(id)}><Icon size={18}/><span>{label}</span></button>})}</nav><main>{children}</main><footer>Simulation · Aucun équipement connecté</footer></section>;
}
export const Card=({title,children})=><section className="venue-card"><h2>{title}</h2>{children}</section>;
export const Choices=({value,options,onChange})=><div className="venue-choices">{options.map(([id,label])=><button key={id} aria-pressed={value===id} onClick={()=>onChange(id)}>{label}</button>)}</div>;
export const Slider=({label,value,onChange,min=0,max=100,unit='%'})=><label className="venue-slider"><span>{label}<output>{value}{unit}</output></span><input aria-label={label} type="range" min={min} max={max} value={value} onChange={e=>onChange(Number(e.target.value))}/></label>;
export const Toggle=({label,value,onChange})=><button className="venue-toggle" aria-pressed={value} onClick={()=>onChange(!value)}><span>{label}</span><strong>{value?'ON':'OFF'}</strong></button>;
