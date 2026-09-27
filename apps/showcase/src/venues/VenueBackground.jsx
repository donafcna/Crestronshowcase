import React, { useEffect, useRef, useState } from 'react';
import { VENUE_PROJECTS, readVenue } from './state';
import { createWheelNavigation } from '../utils/wheelNavigation';
import '../ftv-luxury/background.css';
export function VenueBackground({ projectId, stageRef }) {
  const frameRef=useRef(null), [ready,setReady]=useState(false), [failed,setFailed]=useState(false);
  useEffect(()=>{
    const frame=frameRef.current, stage=stageRef.current, origin=location.origin;
    if(!frame||!stage)return undefined;
    let loaded=false,previousLayout='';
    setReady(false);setFailed(false);
    const send=(type,payload={})=>frame.contentWindow?.postMessage({channel:'ftv-venue/v1',project:projectId,type,...payload},origin);
    const layout=()=>{
      if(!loaded)return;
      const b=frame.getBoundingClientRect(),p=stage.querySelector('.phone-device-frame')?.getBoundingClientRect(),s=stage.querySelector('.workspace-device-sidebar')?.getBoundingClientRect();
      if(!p||!b.width||!b.height)return;
      const x=p.right-b.left+4,y=100,w=(s?s.left-b.left-4:b.width-20)-x,h=b.height-y-35;
      const viewport=w>180?{x,y,w,h}:{x:0,y:90,w:b.width,h:b.height-100};
      const signature=JSON.stringify([b.width,b.height,viewport]);
      if(signature!==previousLayout){previousLayout=signature;send('viewport',{viewport});}
    };
    const state=()=>send('state',{state:readVenue(projectId)||{}});
    const message=e=>{if(e.origin!==origin||e.source!==frame.contentWindow||e.data?.channel!=='ftv-venue/v1'||e.data.project!==projectId)return;if(e.data.type==='ready'){loaded=true;previousLayout='';setReady(true);layout();state()}if(e.data.type==='error')setFailed(true)};
    const update=e=>{if(e.detail.id===projectId)state()};
    const visibility=()=>send('visibility',{visible:!document.hidden});
    const zoomWheel=createWheelNavigation(delta=>send('zoom',{delta:delta/120}),{
      enabled:()=>loaded&&!document.hidden,height:()=>stage.clientHeight||innerHeight,
    });
    // The venue renderer retains its bounded camera distance. Fractional deltas
    // now permit fine trackpad movement instead of treating every event as a notch.
    const wheel=projectId==='club-etoile'?e=>{if(!loaded||e.ctrlKey||e.target.closest('button,input,a,iframe,.phone-device-frame,.workspace-device-sidebar,.projects-strip'))return;e.preventDefault();const view=e.deltaY>0?'building':'room';window.dispatchEvent(new CustomEvent('ftv-club-view',{detail:view}))}:e=>{if(!loaded||e.ctrlKey||e.target.closest('button,input,a,iframe,.phone-device-frame,.workspace-device-sidebar,.projects-strip'))return;e.preventDefault();send('zoom',{delta:Math.sign(e.deltaY)})};
    window.addEventListener('message',message);window.addEventListener('ftv-venue-state',update);document.addEventListener('visibilitychange',visibility);stage.addEventListener('wheel',wheel,{passive:false});
    const ro=new ResizeObserver(layout);ro.observe(stage);const timer=setInterval(layout,500);
    send('hello');
    return()=>{zoomWheel.dispose();ro.disconnect();clearInterval(timer);window.removeEventListener('message',message);window.removeEventListener('ftv-venue-state',update);document.removeEventListener('visibilitychange',visibility);stage.removeEventListener('wheel',wheel)};
  },[projectId,stageRef]);
  return <div className="plan3d-bg-container luxury-background venue-background" data-ready={ready}>
    <iframe ref={frameRef} className="luxury-background-frame" src={`/ftv-luxury/venues/index.html?project=${projectId}&kind=${VENUE_PROJECTS[projectId]}`} title="Décor 3D du lieu" tabIndex={-1} aria-hidden="true"/>
    {(!ready||failed)&&<span className="luxury-background-loading" role="status">{failed?'La 3D est indisponible sur ce navigateur.':'Chargement de la 3D…'}</span>}
  </div>;
}
