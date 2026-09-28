import React, { useEffect, useMemo, useState } from 'react';
import { Icons } from '../../icons';

const zones = [
  ['exterior','Extérieur'],
  ['accueil','Accueil'],['dining','Salle vitrée'],['bar','Bar minéral'],['kitchen','Cuisine ouverte'],['cellar','Cave à vins'],
  ['private','Salon privé'],['signature','Salle signature'],['teppanyaki','Teppanyaki'],['lounge','Lounge'],['gallery','Galerie'],
  ['belvedere','Belvédère'],['terrace','Terrasse'],['rooftop','Rooftop'],['pergola','Pergola'],['garden','Jardin suspendu'],
];
const scenes = [['welcome','Accueil','Ouverture chaleureuse'],['dinner','Dîner','Tables et bar tamisés'],['rooftop','Rooftop','Pergola et végétation'],['cleaning','Nettoyage','Éclairage fonctionnel'],['closed','Fermeture','Balisage de sécurité']];
const exteriorScenes = [['welcome','Accueil','Façades et entrée'],['dinner','Allées','Lampadaires et lanternes'],['rooftop','Jardins','Spots de sol et végétation'],['cleaning','Tout allumé','Tous les circuits à 100 %'],['closed','Veille','Balisage de sécurité']];
const sceneLevels = {
  welcome:{tables:72,bar:76,pergola:45,plants:55}, dinner:{tables:48,bar:62,pergola:35,plants:40},
  rooftop:{tables:60,bar:52,pergola:88,plants:82}, cleaning:{tables:100,bar:100,pergola:100,plants:65}, closed:{tables:0,bar:8,pergola:0,plants:18},
};
const circuitLabels = {
  exterior:[['tables','Appliques de façade et clôture'],['bar','Lampadaires et lanternes'],['pergola','Spots de sol'],['plants','Chemins et jardins']],
  default:[['tables','Suspensions et lustres'],['bar','Appliques et corniches'],['pergola','Spots plafond'],['plants','Balises et éclairage décoratif']],
};
const Icon = ({name,size=17}) => { const C=Icons[name]||Icons.Circle; return <C size={size}/>; };

export const SushiBarKyoto = ({deviceType}) => {
  const phone=deviceType==='phone';
  const [tab,setTab]=useState('lights'),[zone,setZone]=useState('exterior');
  const [zoneScenes,setZoneScenes]=useState(()=>Object.fromEntries(zones.map(([id])=>[id,'closed'])));
  const [zoneLevels,setZoneLevels]=useState(()=>Object.fromEntries(zones.map(([id])=>[id,{...sceneLevels.closed}]))),[temperature,setTemperature]=useState(21.5),[music,setMusic]=useState(38),[service,setService]=useState('Fluide'),[time,setTime]=useState('20:30');
  const scene=zoneScenes[zone]||'welcome';
  const levels=zoneLevels[zone]||sceneLevels.welcome;
  const sceneOptions=zone==='exterior'?exteriorScenes:scenes;
  const zoneName=useMemo(()=>zones.find(([id])=>id===zone)?.[1]||zones[0][1],[zone]);
  useEffect(()=>{const tick=()=>setTime(new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}));tick();const id=setInterval(tick,1000);return()=>clearInterval(id)},[]);
  useEffect(()=>{window.dispatchEvent(new CustomEvent('ftv-restaurant-control',{detail:{zone,scene,levels,zoneLevels}}))},[zone,scene,levels,zoneLevels]);
  const applyScene=id=>{setZoneScenes(all=>({...all,[zone]:id}));setZoneLevels(all=>({...all,[zone]:{...sceneLevels[id]}}))};
  const applyAllScene=id=>{setZoneScenes(Object.fromEntries(zones.map(([zoneId])=>[zoneId,id])));setZoneLevels(Object.fromEntries(zones.map(([zoneId])=>[zoneId,{...sceneLevels[id]}])))};
  const changeLevel=(key,value)=>{setZoneScenes(all=>({...all,[zone]:'custom'}));setZoneLevels(all=>({...all,[zone]:{...(all[zone]||sceneLevels.welcome),[key]:Number(value)}}))};
  useEffect(()=>{const api={zones:zones.map(([id,name])=>({id,name})),selectZone:setZone,applyAllScene};window.__restaurantGui=api;return()=>{if(window.__restaurantGui===api)delete window.__restaurantGui}},[]);

  return <div className={`rk-ui ${phone?'phone':'panel'}`}>
    <header className="rk-header"><div><span className="rk-kicker">FRÉQUENCE TV · HOSPITALITY</span><h1>Kyoto Gardens</h1><p>Restaurant gastronomique · 15 pavillons</p></div><div className="rk-clock"><Icon name="Clock3" size={14}/><b>{time}</b></div></header>
    <label className="rk-zone"><span>Zone</span><select value={zone} onChange={e=>setZone(e.target.value)}>{zones.map(([id,name])=><option key={id} value={id}>{name}</option>)}</select></label>
    <nav className="rk-tabs">{[['lights','Lightbulb','Ambiances'],['comfort','Wind','Confort'],['audio','Music2','Audio'],['service','Bell','Service']].map(([id,icon,label])=><button key={id} className={tab===id?'active':''} onClick={()=>setTab(id)}><Icon name={icon}/><span>{label}</span></button>)}</nav>
    <main className="rk-main">
      {tab==='lights'&&<><section className="rk-card"><div className="rk-card-title"><span>Scènes · {zoneName}</span><small>{scene==='custom'?'Personnalisée':sceneOptions.find(([id])=>id===scene)?.[1]}</small></div><div className="rk-scenes">{sceneOptions.map(([id,name,note])=><button key={id} data-scene={id} className={scene===id?'active':''} onClick={()=>applyScene(id)}><b>{name}</b><small>{note}</small></button>)}</div></section><section className="rk-card"><div className="rk-card-title"><span>Éclairages · {zoneName}</span><small>DALI / DMX</small></div>{(circuitLabels[zone]||circuitLabels.default).map(([id,label])=><label className="rk-slider" key={id}><span>{label}<b>{levels[id]} %</b></span><input type="range" min="0" max="100" value={levels[id]} onChange={e=>changeLevel(id,e.target.value)}/></label>)}</section></>}
      {tab==='comfort'&&<section className="rk-card rk-comfort"><div className="rk-card-title"><span>Confort · {zoneName}</span><small>Automatique</small></div><div className="rk-temp"><button onClick={()=>setTemperature(v=>Math.max(18,v-.5))}>−</button><strong>{temperature.toFixed(1)}°</strong><button onClick={()=>setTemperature(v=>Math.min(25,v+.5))}>+</button></div><div className="rk-metrics"><span><Icon name="Thermometer"/>21.2° mesuré</span><span><Icon name="CloudSun"/>Air neuf 68 %</span><span><Icon name="Wind"/>Silencieux</span></div></section>}
      {tab==='audio'&&<section className="rk-card"><div className="rk-card-title"><span>Audio · {zoneName}</span><small>Sonos / Dante</small></div><div className="rk-source"><Icon name="Music2" size={24}/><div><b>Kyoto After Dark</b><small>Jazz contemporain</small></div><button><Icon name="Pause"/></button></div><label className="rk-slider"><span>Volume<b>{music} %</b></span><input type="range" min="0" max="80" value={music} onChange={e=>setMusic(Number(e.target.value))}/></label><div className="rk-eq"><button className="active">Lounge</button><button>Dining</button><button>Live</button></div></section>}
      {tab==='service'&&<section className="rk-card"><div className="rk-card-title"><span>Service en salle</span><small>32 couverts</small></div><div className="rk-service-state"><i></i><div><b>Service {service.toLowerCase()}</b><small>Dernière demande traitée il y a 2 min</small></div></div><div className="rk-actions"><button onClick={()=>setService('Sommelier')}><Icon name="Wine"/>Sommelier</button><button onClick={()=>setService('Accueil')}><Icon name="Users"/>Accueil</button><button onClick={()=>setService('Cuisine')}><Icon name="ChefHat"/>Cuisine</button><button onClick={()=>setService('Fluide')}><Icon name="Check"/>Tout traité</button></div></section>}
    </main>
    <footer className="rk-footer"><span><i></i> Simulation CH5</span><span>{phone?'iPhone':'Console restaurant'}</span></footer>
  </div>;
};
