/* Water is sampled from the actual photo, displaced only within sea polygons.
   Camera, coastline, windows, furnishings and yacht geometry remain stationary. */
(() => {
 const panel=new URLSearchParams(location.search).get('mode')==='panel';
 const images={};for(const name of ['hero','interiors','decks']){const img=new Image();img.src=`assets/${name}.png`;images[name]=img;}
 const tiles={Living:1,Dining:2,Kitchen:3,Office:4,Cinema:5,Fitness:6,Master:7,Bedroom:8};
 const masks={
 exterior:[[[0,66],[100,66],[100,100],[0,100]]],
 Living:[[[.3,48],[9,46],[9,51],[.3,55]],[[13,44],[29,43],[29,48],[13,51]],[[33,43],[41,42],[41,46],[33,48]]],
 Dining:[[[65,41],[68,40],[68,47],[65,46]],[[72,40],[80,40],[80,49],[72,47]],[[86,40],[99,40],[99,55],[86,51]]],
 Kitchen:[[[66,39],[69,39],[69,44],[66,43]],[[73,39],[80,38],[80,48],[73,46]],[[86,39],[99,39],[99,53],[86,50]]],
 Office:[[[60,40],[72,40],[72,48],[60,47]],[[78,40],[99,39],[99,52],[78,49]]],
 Cinema:[],Fitness:[[[0,42],[16,42],[16,54],[0,61]],[[21,41],[38,41],[38,49],[21,54]],[[43,41],[48,41],[48,46],[43,48]]],
 Master:[[[66,44],[99,44],[99,53],[66,52]]],Bedroom:[[[67,43],[99,43],[99,56],[67,52]]],
 Entry:[[[13,54],[86,54],[86,59],[13,59]],[[38,62],[44,62],[44,70],[38,70]],[[57,62],[62,62],[62,70],[57,70]]],
 Pool:[[[39,33],[99,33],[99,61],[39,61]],[[52,61],[80,61],[80,66],[52,66]]]
 };
 const mounted=new Map();let frame=0,last=0;
 function mount(host,id){if(panel)return;const old=mounted.get(host);if(old?.id===id)return;const canvas=host.querySelector('.jewel-water');if(!canvas)return;mounted.set(host,{id,canvas,ctx:canvas.getContext('2d'),ticks:0});if(!frame)frame=requestAnimationFrame(draw);}
 function draw(t){frame=requestAnimationFrame(draw);if(document.hidden||t-last<42)return;last=t;
  for(const [host,item] of mounted){if(item.id&&!host.classList.contains('open')||!item.id&&host.classList.contains('zoomed'))continue;
   const {id,canvas,ctx}=item;const rect=host.getBoundingClientRect();const w=Math.max(1,Math.min(1600,Math.round(rect.width))),h=Math.max(1,Math.round(w*rect.height/Math.max(1,rect.width)));if(w<2||h<2)continue;if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
   const name=id==null?'hero':['Entry','Pool'].includes(id)?'decks':'interiors',img=images[name];if(!img.complete||!img.naturalWidth)continue;
   let sx=0,sy=0,sw=img.naturalWidth,sh=img.naturalHeight;if(name==='interiors'){sw/=3;sh/=3;sx=(tiles[id]%3)*sw;sy=Math.floor(tiles[id]/3)*sh;}else if(name==='decks'){sh/=2;sy=id==='Pool'?sh:0;}
   ctx.clearRect(0,0,w,h);ctx.save();ctx.beginPath();for(const poly of masks[id||'exterior']||[]){poly.forEach(([x,y],j)=>ctx[j?'lineTo':'moveTo'](x*w/100,y*h/100));ctx.closePath();}ctx.clip();
   const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
   for(let y=0;y<h;y+=3){const amp=reduced?0:Math.sin(y*.07+t*.0014)*1.7+Math.sin(y*.021-t*.0009)*1.1;const dy=reduced?0:Math.sin(y*.043+t*.001)*.65;ctx.drawImage(img,sx,sy+(y+dy)/h*sh,sw,Math.min(sh/h*4,sh-(y+dy)/h*sh),amp,y,w,4);}
   ctx.restore();item.ticks++;canvas.dataset.frames=item.ticks;
  }
 }
 window.JEWEL_MARINE={mount};window.addEventListener('pagehide',()=>{cancelAnimationFrame(frame);mounted.clear();});
})();
