/* Animation photographique localisée : les pierres et les bûches restent fixes. */
(() => {
 'use strict';
 const photo=new Image();photo.src='assets/original/room-Living.webp';
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let canvas,view,active=false,raf=0,last=0;
 const x=1230,y=492,w=220,h=56;
 function frame(ms){
  raf=0;
  if(!active||!view?.classList.contains('open')||document.hidden||reduced.matches)return;
  raf=requestAnimationFrame(frame);
  if(ms-last<40||!photo.complete||!photo.naturalWidth)return;last=ms;
  const c=canvas.getContext('2d'),t=ms/1000;
  c.clearRect(0,0,w,h);
  // Chaque langue de feu oscille indépendamment, autour de sa base.
  for(let i=0;i<w;i+=2){
   const wave=Math.sin(t*3.7+i*.13)*.07+Math.sin(t*6.1+i*.047)*.045;
   const height=h*(1+wave),dx=Math.sin(t*4.3+i*.09)*1.1;
   c.drawImage(photo,x+i,y,2,h,i+dx,h-height,3,height);
  }
  c.globalCompositeOperation='destination-in';
  const edge=c.createLinearGradient(0,0,w,0);edge.addColorStop(0,'transparent');edge.addColorStop(.08,'white');edge.addColorStop(.92,'white');edge.addColorStop(1,'transparent');c.fillStyle=edge;c.fillRect(0,0,w,h);
  const vertical=c.createLinearGradient(0,0,0,h);vertical.addColorStop(0,'transparent');vertical.addColorStop(.22,'white');vertical.addColorStop(.83,'white');vertical.addColorStop(1,'transparent');c.fillStyle=vertical;c.fillRect(0,0,w,h);
  c.globalCompositeOperation='source-over';
 }
 function start(){if(!raf&&active&&!document.hidden&&!reduced.matches)raf=requestAnimationFrame(frame);}
 document.addEventListener('visibilitychange',start);reduced.addEventListener('change',()=>{if(reduced.matches)canvas?.getContext('2d').clearRect(0,0,w,h);else start();});
 window.STARK_FIREPLACE={render(v,id){
  active=id==='Living';view=v;
  if(!canvas){canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;canvas.className='rv-fireplace';canvas.setAttribute('aria-hidden','true');Object.assign(canvas.style,{position:'absolute',pointerEvents:'none',zIndex:'1'});v.appendChild(canvas);}
  canvas.style.display=active?'block':'none';
  const scale=Math.max(v.clientWidth/1672,v.clientHeight/941);
  Object.assign(canvas.style,{left:((v.clientWidth-1672*scale)/2+x*scale)+'px',top:((v.clientHeight-941*scale)/2+y*scale)+'px',width:w*scale+'px',height:h*scale+'px'});start();
 }};
})();
