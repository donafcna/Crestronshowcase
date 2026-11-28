/* Paysages Runway existants, stabilisés et bouclés. Le bâti reste photographique. */
(() => {
 'use strict';
 const W=1672,H=941,records=new Map(),reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const panel=new URLSearchParams(location.search).get('mode')==='panel';
 let selected=null;
 const rooms=new Set(['Living','Dining','Master','Kitchen','Office','Fitness','Entry','Bedroom']);
 const polygon=p=>`<polygon points="${p.map(v=>v.join(',')).join(' ')}" fill="white"/>`;
 const exterior=[
  // Ciel, relief lointain et feuillages au-dessus de la silhouette du toit.
  [[0,0],[1672,0],[1672,446],[1636,441],[1636,483],[1490,434],[1490,365],[1258,311],[1211,322],[1118,294],[1090,304],[972,321],[956,270],[729,271],[411,201],[201,291],[201,484],[0,484]],
  [[0,460],[39,458],[35,530],[0,610]],
  [[1640,434],[1672,424],[1672,652],[1642,649]],
  // Massifs : les allées et la volée de marches centrales restent fixes.
  [[0,681],[106,640],[235,646],[307,644],[438,650],[502,650],[541,620],[586,609],[620,644],[685,647],[726,685],[644,726],[650,744],[612,801],[561,833],[345,857],[279,840],[260,941],[0,941]],
  [[811,738],[844,691],[955,699],[1050,651],[1209,659],[1270,738],[1510,747],[1672,773],[1672,884],[1489,880],[1323,890],[1053,880],[903,854],[748,810]],
  // Eau seule, dans la piscine en perspective.
  [[1324,671],[1671,678],[1671,733],[1535,730]]
  ,[[0,650],[1672,650],[1672,941],[0,941]]
 ];
 function maskUrl(id,geometry){
  const panes=id==='Exterior'?exterior:geometry.panes;
  const foreground=id==='Exterior'?'':geometry.foreground;
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs><mask id="foreground" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}">${foreground||`<rect width="${W}" height="${H}" fill="white"/>`}</mask><filter id="edge"><feGaussianBlur stdDeviation=".7"/></filter></defs><g mask="url(#foreground)" filter="url(#edge)">${panes.map(polygon).join('')}</g></svg>`;
  return 'url("data:image/svg+xml,'+encodeURIComponent(svg)+'")';
 }
 function create(id,parent,geometry){
  const video=document.createElement('video');video.className='stark-landscape';video.dataset.landscape=id;
  video.src=`assets/video/landscape-${id.toLowerCase()}-loop-${id==='Exterior'?'v3':'v4'}.mp4?v=2.3.39`;
  video.poster=id==='Exterior'?'assets/original/hero-off.webp':`assets/original/room-${id}.webp`;
  video.muted=true;video.defaultMuted=true;video.loop=true;video.playsInline=true;video.preload='metadata';
  video.setAttribute('muted','');video.setAttribute('playsinline','');video.setAttribute('aria-hidden','true');
  video.addEventListener('error',playback);
  Object.assign(video.style,{position:'absolute',pointerEvents:'none',zIndex:'0',objectFit:'fill',maskImage:maskUrl(id,geometry),maskSize:'100% 100%',maskRepeat:'no-repeat'});
  if(id==='Exterior'){Object.assign(video.style,{inset:'0',width:'100%',height:'100%'});parent.insertBefore(video,parent.querySelector('.win'));}
  else parent.appendChild(video);
  const r={id,video};records.set(id,r);return r;
 }
 function playback(){
  for(const r of records.values()){
   const active=r.id===selected&&!document.hidden&&!reduced.matches&&!r.video.error;
   r.video.style.display=r.id===selected&&!reduced.matches&&!r.video.error?'block':'none';
   r.video.dataset.active=String(active);
   if(active&&r.video.paused)r.video.play().catch(()=>{r.video.dataset.autoplay='blocked';});
   else if(!active&&!r.video.paused)r.video.pause();
  }
 }
 document.addEventListener('visibilitychange',playback);
 reduced.addEventListener('change',playback);
 window.addEventListener('pagehide',()=>{for(const r of records.values())r.video.pause();});
 window.STARK_LANDSCAPE={
  exterior(stage,visible){
   if(panel)return;
   if(visible){selected='Exterior';if(!reduced.matches&&!records.has(selected))create(selected,stage);}
   else if(selected==='Exterior')selected=null;
   playback();
  },
  interior(view,id,shadeRoot,states){
   if(panel)return;
   const covered=states&&(states.roman.pos>=100||states.blackout.pos>=100);
   selected=rooms.has(id)&&!covered?id:null;
   if(selected&&!reduced.matches&&!records.has(id)){
    const geometry=window.STARK_SHADES.landscapeGeometry(shadeRoot);
    if(geometry.panes.length)create(id,view,geometry);
   }
   const r=records.get(id);
   if(r){const s=Math.max(view.clientWidth/W,view.clientHeight/H);Object.assign(r.video.style,{left:(view.clientWidth-W*s)/2+'px',top:(view.clientHeight-H*s)/2+'px',width:W*s+'px',height:H*s+'px'});}
   playback();
  }
 };
})();
