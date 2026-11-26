/* Sources photographiques : les coordonnées désignent les appareils, pas des halos approximatifs. */
(() => {
 'use strict';
 const NS='http://www.w3.org/2000/svg';
 // Centre et demi-dimensions des ouvertures lumineuses, en pixels photo 1672 × 941.
 const CEILING={
  Living:[[343,52,7,3],[881,46,7,3],[1318,44,7,3],[1032,103,5.5,2.5],[585,117,5,2],[742,150,4.5,2]],
  Kitchen:[[266,51,9,3],[719,51,9,3.5],[1537,55,9.5,3],[888,89,8,3],[556,102,8,2.5],[1301,110,7.5,2.5],[843,149,6,2],[1112,152,6,2],[1008,174,5.5,1.5]],
  Office:[[423,29,9.5,3.5],[1261,29,9.5,3.5],[486,135,7,2.5],[812,135,7,2.5],[1208,135,7,2.5]],
  Dining:[[1386,38,10.5,4],[340,118,9,3],[1040,157,8,2.5],[327,194,6.5,2],[863,220,6,2]],
  Cinema:[[424,83,8,3],[964,78,7.5,2.5],[1345,111,7.5,2.5],[728,142,6,2],[918,178,4.5,1.5]],
  Fitness:[[650,47,12.5,5.5],[1242,44,12,5.5],[773,168,8.5,3],[1206,167,8.5,2.5],[1581,166,9.5,3],[862,251,6,2],[1183,250,6.5,2],[1479,250,6.5,2],[896,286,5,1.5],[1172,286,5,1.5],[1425,286,5,1.5],[1035,303,4,1.5],[1091,303,3.5,1.5],[1147,302,3.5,1.5]],
  Master:[[1327,54,8,3],[386,75,7.5,3],[950,133,6,2],[658,163,4.5,1.5],[793,166,5.5,2]],
  Bedroom:[[919,167,6,2.5]]
 };
 // Découpe de l'abat-jour ou de la sortie lumineuse, sans peindre sur le mur.
 const LAMPS={
  Master:{strip:['M85 365Q149 357 217 367L219 435Q150 442 84 434Z'],spots:['M675 402Q712 397 751 403L752 443Q714 449 674 443Z']},
  Bedroom:{strip:['M188 308Q243 298 296 309L297 383Q243 389 187 382Z'],spots:['M722 361Q754 355 786 361L788 401Q754 407 722 401Z','M1153 424Q1180 412 1209 424L1211 431H1151Z']},
  Office:{spots:['M990 481Q1075 487 1167 480L1167 486Q1078 494 990 486Z']},
  Dining:{spots:['M631 365Q790 383 944 351L945 359Q790 391 631 371Z']},
  Entry:{spots:[[752,159,13,74],[782,139,13,73],[872,136,12,80],[783,213,12,53],[816,220,12,65],[846,163,12,93],[876,259,12,57],[826,318,11,57]].map(([x,y,w,h])=>`M${x+3} ${y}H${x+w-3}Q${x+w} ${y} ${x+w} ${y+3}V${y+h-3}Q${x+w} ${y+h} ${x+w-3} ${y+h}H${x+3}Q${x} ${y+h} ${x} ${y+h-3}V${y+3}Q${x} ${y} ${x+3} ${y}Z`)},
  Cinema:{spots:['M185 256Q207 251 229 257V331Q206 335 184 330Z','M660 318Q672 313 685 318V362Q672 367 659 361Z','M1598 267Q1627 280 1655 268V282Q1628 290 1596 279Z']}
 };
 const photos=new Map();
 function photoFor(id){if(!photos.has(id)){const p=new Image();p.src='assets/original/room-'+id+'.webp';photos.set(id,p);}return photos.get(id);}
 function offSpot(photo,x,y,rx,ry){
  const width=Math.ceil(rx*7),height=Math.ceil(ry*9),left=Math.round(x-width/2),top=Math.round(y-height/2);
  const c=document.createElement('canvas');c.width=width;c.height=height;const ctx=c.getContext('2d',{willReadFrequently:true});
  ctx.drawImage(photo,left,top,width,height,0,0,width,height);const image=ctx.getImageData(0,0,width,height),d=image.data,original=new Uint8ClampedArray(d);
  const cx=x-left,cy=y-top;
  // Reprendre le bois immédiatement au-dessus et au-dessous du spot pour
  // retirer son éclat, en conservant les veines et les bords du plafond.
  for(let j=0;j<height;j++)for(let i=0;i<width;i++){
   const distance=Math.hypot((i-cx)/(rx*2.6),(j-cy)/(ry*3.4));const k=(j*width+i)*4;if(distance>=1){d[k+3]=0;continue;}
   const fade=Math.max(0,Math.min(1,(1-distance)/.55)),a=fade*fade*(3-2*fade);
   const upper=(Math.max(0,Math.floor(cy-ry*3.7))*width+i)*4,lower=(Math.min(height-1,Math.ceil(cy+ry*3.7))*width+i)*4;
   const t=j/height;
   for(let ch=0;ch<3;ch++)d[k+ch]=original[upper+ch]*(1-t)+original[lower+ch]*t;
   d[k+3]=Math.round(255*a);
  }
  ctx.putImageData(image,0,0);
  // L'ouverture éteinte conserve une petite collerette éclairée par la pièce.
  const sample=(Math.max(0,Math.round(cy-ry*3.7))*width+Math.round(cx))*4,ambient=original.slice(sample,sample+3);
  ctx.beginPath();ctx.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);ctx.fillStyle=`rgb(${ambient[0]*.46},${ambient[1]*.46},${ambient[2]*.46})`;ctx.fill();ctx.strokeStyle=`rgba(${ambient[0]},${ambient[1]},${ambient[2]},.7)`;ctx.lineWidth=.7;ctx.stroke();
  return {href:c.toDataURL(),left,top,width,height};
 }
 // Extinction des faisceaux d'appliques : restaurer la luminance du même
 // revêtement, sans ajouter d'ellipse noire sur le mur.
 function offWall(photo,rect,body){
  const [left,top,width,height]=rect,c=document.createElement('canvas');c.width=width;c.height=height;
  const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(photo,left,top,width,height,0,0,width,height);
  const image=ctx.getImageData(0,0,width,height),d=image.data,original=new Uint8ClampedArray(d);
  for(let j=0;j<height;j++){
   const ambient=[0,0,0];let samples=0;
   for(let row=Math.max(0,j-12);row<=Math.min(height-1,j+12);row++)for(let k=0;k<5;k++){for(let ch=0;ch<3;ch++)ambient[ch]+=original[(row*width+k)*4+ch]+original[(row*width+width-1-k)*4+ch];samples+=2;}
   for(let ch=0;ch<3;ch++)ambient[ch]/=samples;
   for(let i=0;i<width;i++){
    const k=(j*width+i)*4,px=left+i,py=top+j;
    if(body&&px>=body[0]&&px<=body[2]&&py>=body[1]&&py<=body[3]){d[k+3]=0;continue;}
    const edge=Math.min(1,i/12,(width-1-i)/12,j/14,(height-1-j)/14);
    for(let ch=0;ch<3;ch++){const value=original[k+ch];const target=Math.min(value,ambient[ch]+(value-ambient[ch])*.2);d[k+ch]=target;}
    d[k+3]=Math.round(255*Math.max(0,edge));
   }
  }
  ctx.putImageData(image,0,0);return {href:c.toDataURL(),left,top,width,height};
 }
 function build(v,id){
  v.querySelector('.rv-native-fixtures')?.remove();
  const root=document.createElement('div');root.className='rv-native-fixtures';root.dataset.room=id;
  Object.assign(root.style,{position:'absolute',pointerEvents:'none',zIndex:'0'});
  const svg=document.createElementNS(NS,'svg');svg.setAttribute('viewBox','0 0 1672 941');svg.setAttribute('aria-hidden','true');svg.setAttribute('preserveAspectRatio','none');Object.assign(svg.style,{width:'100%',height:'100%'});
  const prefix='native-'+id;
  svg.innerHTML=`<defs><filter id="${prefix}-off" color-interpolation-filters="sRGB"><feComponentTransfer><feFuncR type="linear" slope=".42"/><feFuncG type="linear" slope=".46"/><feFuncB type="linear" slope=".53"/></feComponentTransfer></filter></defs><g data-native-circuit="strip"></g><g data-native-circuit="spots"></g>`;
  for(const key of ['strip','spots']){
   const paths=LAMPS[id]?.[key]||[];
   if(paths.length){const clip=document.createElementNS(NS,'clipPath');clip.id=prefix+'-'+key;clip.innerHTML=paths.map(d=>`<path d="${d}"/>`).join('');svg.querySelector('defs').appendChild(clip);svg.querySelector('[data-native-circuit='+key+']').innerHTML=`<image href="assets/original/room-${id}.webp" width="1672" height="941" clip-path="url(#${clip.id})" filter="url(#${prefix}-off)"/>`;}
  }
  root.appendChild(svg);v.appendChild(root);
  const photo=photoFor(id),add=()=>{if(!root.isConnected)return;const group=svg.querySelector('[data-native-circuit=spots]');for(const [x,y,rx,ry] of CEILING[id]||[]){const p=offSpot(photo,x,y,rx,ry),img=document.createElementNS(NS,'image');for(const [key,value] of Object.entries({href:p.href,x:p.left,y:p.top,width:p.width,height:p.height}))img.setAttribute(key,value);img.dataset.ceilingSpot=x+','+y;group.appendChild(img);}if(id==='Cinema')for(const [rect,body] of [[[120,165,175,270],[182,252,232,335]],[[615,255,115,170],[657,313,688,366]],[[1550,280,120,220],null]]){const p=offWall(photo,rect,body),img=document.createElementNS(NS,'image');for(const [key,value] of Object.entries({href:p.href,x:p.left,y:p.top,width:p.width,height:p.height}))img.setAttribute(key,value);img.dataset.sconceHalo='off';group.appendChild(img);}root.dataset.ready='true';};
  if(photo.complete&&photo.naturalWidth)add();else photo.addEventListener('load',add,{once:true});return root;
 }
 window.STARK_FIXTURES={render(v,id,lights){let root=v.querySelector('.rv-native-fixtures');if(!root||root.dataset.room!==id)root=build(v,id);const scale=Math.max(v.clientWidth/1672,v.clientHeight/941);Object.assign(root.style,{left:(v.clientWidth-1672*scale)/2+'px',top:(v.clientHeight-941*scale)/2+'px',width:1672*scale+'px',height:941*scale+'px'});for(const key of ['strip','spots']){const level=lights[key]==='off'?0:Math.max(0,Math.min(1,lights.lv[key]/100));root.querySelector('[data-native-circuit='+key+']').style.opacity=1-level;root.dataset[key]=Math.round(level*100);}}};
})();
