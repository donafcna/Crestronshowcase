import { useEffect, useRef, useState } from 'react';
import '../ftv-luxury/background.css';
export function HotelBrassusBackground({stageRef,guiFrameRef}) {
 const frame=useRef(null),[ready,setReady]=useState(false);
 useEffect(()=>{
  const stage=stageRef.current;let loaded=false,last='';
  const send=data=>frame.current?.contentWindow?.postMessage({channel:'hdh-view',...data},location.origin);
  const layout=()=>{if(!loaded)return;const b=frame.current.getBoundingClientRect(),p=stage.querySelector('.phone-device-frame')?.getBoundingClientRect(),s=stage.querySelector('.workspace-device-sidebar')?.getBoundingClientRect();if(!p)return;const x=Math.max(0,p.right-b.left+12),right=s?s.left-b.left-12:b.width-20;const viewport={x,y:100,w:Math.max(120,right-x),h:Math.max(120,b.height-140)};const key=JSON.stringify(viewport);if(key!==last){last=key;send({viewport})}};
  const receive=e=>{if(e.origin!==location.origin)return;if(e.source===frame.current?.contentWindow&&e.data?.channel==='hdh-ready'){loaded=true;setReady(true);layout();guiFrameRef.current?.contentWindow?.postMessage({channel:'hdh-request'},location.origin)}if(e.source===guiFrameRef.current?.contentWindow&&e.data?.channel==='hdh-demo')frame.current?.contentWindow?.postMessage(e.data,location.origin)};
  const wheel=e=>{if(!loaded||e.ctrlKey||e.target.closest('button,input,a,iframe,.phone-device-frame,.workspace-device-sidebar,.projects-strip'))return;e.preventDefault();send({zoom:e.deltaY})};
  const visibility=()=>send({visible:!document.hidden});
  window.addEventListener('message',receive);document.addEventListener('visibilitychange',visibility);stage.addEventListener('wheel',wheel,{passive:false});const ro=new ResizeObserver(layout);ro.observe(stage);const timer=setInterval(layout,400);
  return()=>{ro.disconnect();clearInterval(timer);window.removeEventListener('message',receive);document.removeEventListener('visibilitychange',visibility);stage.removeEventListener('wheel',wheel)};
 },[stageRef,guiFrameRef]);
 return <div className="plan3d-bg-container luxury-background" data-ready={ready}><iframe ref={frame} className="luxury-background-frame" src="/showcases/hotel-brassus/model.html?background=1" title="Maquette 3D de Hotel Brassus" tabIndex={-1} aria-hidden="true"/>{!ready&&<span className="luxury-background-loading" role="status">Chargement de la 3D…</span>}</div>;
}
