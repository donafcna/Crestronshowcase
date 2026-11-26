import * as THREE from "/plan3d/vendor/three.module.min.js";
import { createTVStage } from "/plan3d/tv-stage.js?v=2026-11-23-race-2";


// Simulation d'accueil tvOS, pilotée par les flèches de la télécommande.
function createAppleHome(){
 const canvas=document.createElement('canvas');canvas.width=640;canvas.height=360;const c=canvas.getContext('2d');
 const apps=[['Apple TV+','#f4f5f8','tv'],['Netflix','#111114','N'],['Disney+','#102358','Disney+'],['YouTube','#fff','play'],['Musique','#ef416b','music'],['Photos','#f3f3f6','photos'],['App Store','#247be7','A'],['Réglages','#9098a8','gear'],['Ordinateurs','#e98d38','PC'],['Recherche','#46678e','search']];
 function round(x,y,w,h,r,color){c.fillStyle=color;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();}
 return {render(state){
  const focus=Math.max(0,Math.min(9,state.focus||0)),selected=apps[focus];
  const bg=c.createLinearGradient(0,0,640,360);bg.addColorStop(0,'#233b5b');bg.addColorStop(.6,'#111d39');bg.addColorStop(1,'#372347');c.fillStyle=bg;c.fillRect(0,0,640,360);
  c.fillStyle='#ffffffb0';c.font='13px Arial';c.fillText('Apple TV',28,27);c.textAlign='right';c.fillText('Accueil',612,27);c.textAlign='left';
  c.fillStyle='white';c.font='bold 30px Arial';c.fillText(state.app&&state.app!=='Apple TV'?state.app:selected[0],28,75);c.font='14px Arial';c.fillStyle='#dbe4f4';c.fillText('Films, séries et programmes',28,101);
  const sky=c.createLinearGradient(370,45,610,143);sky.addColorStop(0,'#485d92');sky.addColorStop(1,'#b98c8c');round(370,43,241,103,12,sky);
  c.fillStyle='#253d58';c.beginPath();c.moveTo(370,134);c.lineTo(425,77);c.lineTo(458,112);c.lineTo(503,65);c.lineTo(560,122);c.lineTo(611,94);c.lineTo(611,146);c.lineTo(370,146);c.fill();c.fillStyle='white';c.font='bold 16px Arial';c.fillText('À regarder',385,132);
  apps.forEach(([name,color,icon],i)=>{
   const x=28+(i%5)*119,y=172+Math.floor(i/5)*87,w=107,h=61,on=i===focus;
   if(on){c.shadowColor='#a4c9ff';c.shadowBlur=13;round(x-4,y-4,w+8,h+8,11,'#ffffff');c.shadowBlur=0;}
   round(x,y,w,h,8,color);c.textAlign='center';c.fillStyle=name==='Apple TV+'?'#101014':'white';c.font=icon==='Disney+'?'italic bold 20px Arial':'bold 36px Arial';
   if(icon==='play'){round(x+27,y+14,54,34,9,'#f52232');c.fillStyle='white';c.beginPath();c.moveTo(x+49,y+22);c.lineTo(x+49,y+40);c.lineTo(x+66,y+31);c.fill();}
   else if(icon==='music'){c.strokeStyle='white';c.lineWidth=5;c.beginPath();c.moveTo(x+48,y+41);c.lineTo(x+48,y+16);c.lineTo(x+68,y+12);c.lineTo(x+68,y+37);c.stroke();c.fillStyle='white';c.beginPath();c.ellipse(x+42,y+43,8,5,-.2,0,Math.PI*2);c.ellipse(x+62,y+39,8,5,-.2,0,Math.PI*2);c.fill();}
   else if(icon==='photos'){for(let n=0;n<8;n++){c.fillStyle=`hsl(${n*45} 85% 60% / .85)`;c.beginPath();c.ellipse(x+54+Math.cos(n*Math.PI/4)*12,y+31+Math.sin(n*Math.PI/4)*12,10,7,n*Math.PI/4,0,Math.PI*2);c.fill();}}
   else if(icon==='gear'){c.strokeStyle='white';c.lineWidth=5;c.beginPath();c.arc(x+54,y+31,15,0,Math.PI*2);c.stroke();for(let n=0;n<8;n++){const a=n*Math.PI/4;c.beginPath();c.moveTo(x+54+Math.cos(a)*15,y+31+Math.sin(a)*15);c.lineTo(x+54+Math.cos(a)*22,y+31+Math.sin(a)*22);c.stroke();}}
   else if(icon==='search'){c.strokeStyle='white';c.lineWidth=4;c.beginPath();c.arc(x+50,y+27,12,0,Math.PI*2);c.moveTo(x+60,y+37);c.lineTo(x+72,y+49);c.stroke();}
   else c.fillText(icon,x+w/2,y+43);
   c.fillStyle='#f2f5fb';c.font=on?'bold 11px Arial':'11px Arial';c.fillText(name,x+w/2,y+h+16);c.textAlign='left';
  });
  return canvas;
 }};
}

// Sports Villa FTV + journal réutilisé d'une génération Runway locale.
// Le média ne joue que sur la TV visible ; aucune piste sonore.
export function createTVBroadcast() {
  let renderer,stage,scene,camera,geometry,material,newsVisible=false;
  const appleHome=createAppleHome();
  const video=document.createElement('video');video.muted=true;video.loop=true;video.playsInline=true;video.preload='none';
  video.hidden=true;video.setAttribute('aria-hidden','true');video.dataset.tvProgramme='journal-tv';document.body.appendChild(video);
  video.src=new URL('./assets/video/journal-tv.mp4',import.meta.url).href;
  const poster=new Image();poster.src=new URL('./assets/video/journal-tv-poster.jpg',import.meta.url).href;
  const waiting=document.createElement('canvas');waiting.width=640;waiting.height=360;
  const waitingContext=waiting.getContext('2d');waitingContext.fillStyle='#10243c';waitingContext.fillRect(0,0,640,360);
  let playPending=false;
  function playNews(){if(!video.paused||playPending)return;playPending=true;video.play().catch(()=>{}).finally(()=>{playPending=false;});}
  function initSports(){
  if(renderer)return;
  renderer = new THREE.WebGLRenderer({ antialias:true, alpha:false, powerPreference:"low-power" });
  renderer.setPixelRatio(1); renderer.setSize(640,360,false);
  stage = createTVStage(renderer,{realisticRace:true,detailedRaceMaterials:true});
  scene = new THREE.Scene(); camera = new THREE.OrthographicCamera(-1,1,1,-1,0,2);
  camera.position.z = 1;
  geometry = new THREE.PlaneGeometry(2,2);
  material = new THREE.MeshBasicMaterial({map:stage.texture,depthTest:false,depthWrite:false,toneMapped:false});
  scene.add(new THREE.Mesh(geometry,material));
  }
  return {
    render(source,seconds,channel,state={}) {
      if(source==='apple'){newsVisible=false;video.pause();this.programme='apple-tv-home';this.renderer='tvos-simulation';return appleHome.render(state);}
      newsVisible=source==='swisscom'||(typeof source==='number'&&(source-1+channel)%4===0);
      if(newsVisible){this.programme='journal-tv';this.renderer='runway-video';playNews();return video.readyState>=2?video:poster.complete&&poster.naturalWidth?poster:waiting;}
      video.pause();initSports();this.renderer='villa-ftv-3d';
      this.programme = stage.render(source,seconds,channel);
      renderer.setRenderTarget(null); renderer.clear(); renderer.render(scene,camera);
      return renderer.domElement;
    },
    setActive(active){if(!active)video.pause();},
    dispose() {video.pause();video.removeAttribute('src');video.load();video.remove();stage?.dispose();geometry?.dispose();material?.dispose();renderer?.dispose();}
  };
}
