/* Feu filmé : aucun étirement de la photographie ni mouvement des pierres. */
(() => {
 'use strict';
 const photo=new Image();photo.src='assets/original/room-Living.webp';
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const x=1215,y=486,w=245,h=62;
 const fireHeight=Math.round(h*.58),fireTop=h-fireHeight-4;
 const flame=document.createElement('canvas');flame.width=w;flame.height=h;
 const fc=flame.getContext('2d',{willReadFrequently:true});
 const base=document.createElement('canvas');base.width=w;base.height=h;
 let canvas,view,video,active=false,raf=0,last=0,prepared=false;
 function prepare(){
  if(prepared||!photo.naturalWidth)return;
  const c=base.getContext('2d',{willReadFrequently:true});c.drawImage(photo,x,y,w,h,0,0,w,h);
  // Fond continu sous le feu : pas de silhouettes découpées des anciennes flammes.
  c.drawImage(photo,x,y,w,8,0,0,w,54);
  prepared=true;
 }
 function frame(ms){
  raf=0;
  if(!active||!view?.classList.contains('open')||document.hidden||reduced.matches){video?.pause();return;}
  raf=requestAnimationFrame(frame);
  if(ms-last<40||!photo.naturalWidth||video.readyState<2)return;last=ms;prepare();
  fc.clearRect(0,0,w,h);fc.drawImage(video,0,fireTop,w,fireHeight);
  // Conserver la séquence filmée entière à l'intérieur du foyer :
  // pas de seuillage des flammes qui supprimerait leurs contours orangés.
  const c=canvas.getContext('2d');c.clearRect(0,0,w,h);c.drawImage(base,0,0);c.globalCompositeOperation='screen';c.globalAlpha=.62;c.drawImage(flame,0,0);c.globalAlpha=1;c.globalCompositeOperation='source-over';
  // Fondu périphérique pour raccorder exactement le foyer photographié.
  c.globalCompositeOperation='destination-in';
  const edge=c.createLinearGradient(0,0,w,0);edge.addColorStop(0,'transparent');edge.addColorStop(.05,'white');edge.addColorStop(.95,'white');edge.addColorStop(1,'transparent');c.fillStyle=edge;c.fillRect(0,0,w,h);
  const vertical=c.createLinearGradient(0,0,0,h);vertical.addColorStop(0,'transparent');vertical.addColorStop(.14,'white');vertical.addColorStop(.91,'white');vertical.addColorStop(1,'transparent');c.fillStyle=vertical;c.fillRect(0,0,w,h);c.globalCompositeOperation='source-over';
 }
 function start(){
  if(!active||document.hidden||reduced.matches){video?.pause();return;}
  if(!video){video=document.createElement('video');video.src='assets/video/fireplace-slow-loop.mp4';video.muted=true;video.loop=true;video.playsInline=true;video.preload='auto';video.setAttribute('aria-hidden','true');video.dataset.fireSource='filmed';video.style.display='none';view.appendChild(video);}
  if(video.paused)video.play().catch(()=>{});
  if(!raf)raf=requestAnimationFrame(frame);
 }
 document.addEventListener('visibilitychange',start);
 reduced.addEventListener('change',()=>{if(reduced.matches){video?.pause();canvas?.getContext('2d').clearRect(0,0,w,h);}else start();});
 window.STARK_FIREPLACE={render(v,id){
  active=id==='Living';view=v;
  if(!canvas){canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;canvas.className='rv-fireplace';canvas.setAttribute('aria-hidden','true');Object.assign(canvas.style,{position:'absolute',pointerEvents:'none',zIndex:'1'});v.appendChild(canvas);}
  canvas.style.display=active?'block':'none';
  const scale=Math.max(v.clientWidth/1672,v.clientHeight/941);
  Object.assign(canvas.style,{left:((v.clientWidth-1672*scale)/2+x*scale)+'px',top:((v.clientHeight-941*scale)/2+y*scale)+'px',width:w*scale+'px',height:h*scale+'px'});start();
 }};
})();
