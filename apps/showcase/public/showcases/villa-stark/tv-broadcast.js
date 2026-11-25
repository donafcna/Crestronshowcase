import * as THREE from "/plan3d/vendor/three.module.min.js";
import { createTVStage } from "/plan3d/tv-stage.js?v=2026-11-23-race-2";

// Sports Villa FTV + journal réutilisé d'une génération Runway locale.
// Le média ne joue que sur la TV visible ; aucune piste sonore.
export function createTVBroadcast() {
  let renderer,stage,scene,camera,geometry,material,newsVisible=false;
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
    render(source,seconds,channel) {
      newsVisible=(source-1+channel)%4===0;
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
