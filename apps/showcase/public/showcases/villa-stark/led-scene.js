/* État photographique des bandeaux, sans déplacement des objets ni masque sombre. */
(() => {
 'use strict';
 const W=1672,H=941,original=new Image(),off=new Image();
 original.src='assets/original/room-Living.webp';off.src='assets/original/room-Living-led-off-v1.webp';
 let canvas,prepared=false;
 function surface(image,blur=0){const c=document.createElement('canvas');c.width=W;c.height=H;const ctx=c.getContext('2d',{willReadFrequently:true});if(blur)ctx.filter=`blur(${blur}px)`;ctx.drawImage(image,0,0,W,H);return ctx.getImageData(0,0,W,H);}
 function build(){
  if(prepared||!original.naturalWidth||!off.naturalWidth||!canvas)return;
  const src=surface(original),dark=surface(off),a=surface(original,9).data,b=surface(off,9).data;
  const mask=document.createElement('canvas');mask.width=W;mask.height=H;const m=mask.getContext('2d',{willReadFrequently:true});m.filter='blur(7px)';m.fillStyle='white';
  for(const points of [[[878,184],[1043,151],[1043,571],[878,571]],[[871,177],[1574,17],[1574,203],[1051,283],[1034,211],[871,252]]]){m.beginPath();points.forEach(([x,y],n)=>n?m.lineTo(x,y):m.moveTo(x,y));m.closePath();m.fill();}
  const alpha=m.getImageData(0,0,W,H).data,d=src.data;
  const channels=[[[936,198],[1030,182]],[[936,266],[1030,251]],[[936,338],[1030,329]],[[936,407],[1030,402]],[[936,480],[1030,478]],[[890,190],[1034,162]],[[1034,162],[1561,43]]];
  function nearChannel(x,y){for(const [[x0,y0],[x1,y1]] of channels){const dx=x1-x0,dy=y1-y0,t=Math.max(0,Math.min(1,((x-x0)*dx+(y-y0)*dy)/(dx*dx+dy*dy)));if(Math.hypot(x-x0-t*dx,y-y0-t*dy)<2.2)return true;}return false;}
  // Le champ d'éclairement vient de la retouche ; les textures et silhouettes
  // restent celles de la photo originale, sans saut de livres/plante à la variation.
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const k=(y*W+x)*4;if(!alpha[k+3]){d[k+3]=0;continue;}const core=nearChannel(x,y);for(let ch=0;ch<3;ch++){const gain=Math.max(.08,Math.min(1,b[k+ch]/Math.max(1,a[k+ch])));d[k+ch]=core?Math.min(d[k+ch],dark.data[k+ch]):d[k+ch]*gain;}d[k+3]=alpha[k+3];}
  canvas.getContext('2d').putImageData(src,0,0);prepared=true;canvas.dataset.ready='true';
 }
 original.addEventListener('load',build);off.addEventListener('load',build);
 window.STARK_LEDS={render(v,id,lights){if(!canvas){canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;canvas.className='rv-led-state';canvas.setAttribute('aria-hidden','true');Object.assign(canvas.style,{position:'absolute',pointerEvents:'none',zIndex:'0'});v.appendChild(canvas);}canvas.style.display=id==='Living'?'block':'none';if(id!=='Living')return;build();const level=lights.strip==='off'?0:Math.max(0,Math.min(1,lights.lv.strip/100));canvas.style.opacity=1-level;canvas.dataset.level=Math.round(level*100);const s=Math.max(v.clientWidth/W,v.clientHeight/H);Object.assign(canvas.style,{left:(v.clientWidth-W*s)/2+'px',top:(v.clientHeight-H*s)/2+'px',width:W*s+'px',height:H*s+'px'});}};
})();
