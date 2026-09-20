import React, { useEffect, useRef, useState } from 'react';
import { VENUE_PROJECTS, readVenue } from './state';
import '../ftv-luxury/background.css';
export function VenueBackground({ projectId, stageRef }) {
  const frameRef=useRef(null), [ready,setReady]=useState(false), [failed,setFailed]=useState(false);
  useEffect(()=>{
    const frame=frameRef.current, stage=stageRef.current, origin=location.origin;
    let loaded=false;
    setReady(false);setFailed(false);
    const send=(type,payload={})=>frame.contentWindow?.postMessage({channel:'ftv-venue/v1',project:projectId,type,...payload},origin);
    const layout=()=>{
      if(!loaded)return;
      const b=frame.getBoundingClientRect(),p=stage.querySelector('.phone-device-frame')?.getBoundingClientRect(),s=stage.querySelector('.workspace-device-sidebar')?.getBoundingClientRect();
      if(!p||!b.width||!b.height)return;
      const x=p.right-b.left+24,y=100,w=(s?s.left-b.left-20:b.width-20)-x,h=b.height-y-35;
      send('viewport',{viewport:w>180?{x,y,w,h}:{x:0,y:90,w:b.width,h:b.height-100}});
    };
    const state=()=>send('state',{state:readVenue(projectId)||{}});
    const message=e=>{if(e.origin!==origin||e.source!==frame.contentWindow||e.data?.channel!=='ftv-venue/v1'||e.data.project!==projectId)return;if(e.data.type==='ready'){loaded=true;setReady(true);layout();state()}if(e.data.type==='error')setFailed(true)};
    const update=e=>{if(e.detail.id===projectId)state()};
    const visibility=()=>send('visibility',{visible:!document.hidden});
    const wheel=e=>{if(!loaded||e.ctrlKey||e.target.closest('button,input,a,iframe,.phone-device-frame,.workspace-device-sidebar,.projects-strip'))return;e.preventDefault();send('zoom',{delta:Math.sign(e.deltaY)})};
    window.addEventListener('message',message);window.addEventListener('ftv-venue-state',update);document.addEventListener('visibilitychange',visibility);stage.addEventListener('wheel',wheel,{passive:false});
    const ro=new ResizeObserver(layout);ro.observe(stage);const timer=setInterval(layout,500);
    send('hello');
    return()=>{ro.disconnect();clearInterval(timer);window.removeEventListener('message',message);window.removeEventListener('ftv-venue-state',update);document.removeEventListener('visibilitychange',visibility);stage.removeEventListener('wheel',wheel)};
  },[projectId,stageRef]);
  return <div className="plan3d-bg-container luxury-background venue-background" data-ready={ready}>
    <iframe ref={frameRef} className="luxury-background-frame" src={`/ftv-luxury/venues/index.html?project=${projectId}&kind=${VENUE_PROJECTS[projectId]}`} title="Décor 3D du lieu" tabIndex={-1} aria-hidden="true"/>
    {(!ready||failed)&&<span className="luxury-background-loading" role="status">{failed?'La 3D est indisponible sur ce navigateur.':'Chargement de la 3D…'}</span>}
  </div>;
}
