/* Transport lumineux par circuit : les gains éclairés/éteints s'appliquent
   aux textures originales. Aucun remplacement de mobilier, aucun halo ajouté. */
(() => {
 'use strict';
 const W=1672,H=941,GW=836,GH=471,cache=new Map();
 // Surfaces intérieures seulement. Les vitrages, vues extérieures, écrans,
 // bougies et pièces voisines conservent leur propre éclairage.
 const SURFACES={
  Dining:[[[0,0],[1672,0],[1672,10],[769,278],[765,552],[1259,735],[1672,818],[1672,941],[0,941]],[[620,310],[952,310],[952,397],[620,397]]],
  Kitchen:[[[0,0],[1672,0],[1672,76],[1072,201],[1072,496],[1672,711],[1672,941],[0,941]]],
  Office:[[[0,0],[1500,0],[1278,163],[1278,693],[1672,867],[1672,941],[0,941]]],
  Cinema:[[[0,0],[1672,0],[1672,941],[0,941]]],
  Fitness:[[[299,0],[1672,0],[1672,941],[0,941],[0,914],[819,576],[819,299]]],
  Entry:[[[0,0],[1434,0],[1434,738],[1672,833],[1672,941],[0,941]]],
  Master:[[[0,0],[1672,0],[1672,47],[850,204],[850,543],[1672,774],[1672,941],[0,941]]],
  Bedroom:[[[0,0],[1672,0],[1672,941],[0,941]]],
  Pool:[[[0,596],[1672,566],[1672,941],[0,941]],[[349,419],[1544,330],[1672,567],[1672,630],[347,591]]]
 };
 const EXCLUDE={
  Dining:[[[364,276],[475,276],[475,526],[364,526]],[[801,546],[866,546],[866,588],[801,588]]],
  Cinema:[[[941,250],[1435,190],[1435,488],[941,469]]],
  Entry:[[[588,401],[947,401],[947,711],[588,711]]],
  Master:[[[1020,574],[1063,574],[1063,631],[1020,631]]],
  Bedroom:[[[1300,137],[1654,80],[1654,615],[1300,566]]],
  Pool:[[[529,290],[661,273],[661,400],[529,407]],[[741,249],[894,227],[894,381],[741,389]],[[956,222],[1198,192],[1198,368],[956,378]],[[1259,180],[1523,156],[1523,350],[1259,362]],[[532,437],[626,431],[626,548],[532,548]],[[661,430],[778,419],[778,549],[661,550]],[[824,420],[984,407],[984,556],[824,550]],[[1030,412],[1327,392],[1327,568],[1030,557]],[[1375,395],[1672,376],[1672,593],[1375,575]]]
 };
 function polygon(ctx,points){ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill();}
 function pixels(photo,blur=0){const c=document.createElement('canvas');c.width=GW;c.height=GH;const x=c.getContext('2d',{willReadFrequently:true});if(blur)x.filter=`blur(${blur/2}px)`;x.drawImage(photo,0,0,GW,GH);return x.getImageData(0,0,GW,GH);}
 function prepare(r){
  if(r.ready||!r.photo.naturalWidth||!r.off.every(p=>p.naturalWidth))return;
  const on=pixels(r.photo,8).data,source=pixels(r.photo).data;
  const off=r.off.map(p=>pixels(p,8).data),fine=r.off.map(p=>pixels(p,2).data);
  const mask=document.createElement('canvas');mask.width=GW;mask.height=GH;
  const x=mask.getContext('2d',{willReadFrequently:true});
  x.scale(GW/W,GH/H);x.filter='blur(1px)';x.fillStyle='white';for(const p of SURFACES[r.id])polygon(x,p);
  x.fillStyle='black';for(const p of EXCLUDE[r.id]||[])polygon(x,p);x.filter='none';x.resetTransform();
  const alpha=x.getImageData(0,0,GW,GH).data,out=[x.createImageData(GW,GH),x.createImageData(GW,GH)];
  for(let k=0;k<source.length;k+=4){
   const emitter=source[k]>120&&source[k]>source[k+1]*1.1&&source[k+1]>65&&source[k]>on[k]*1.06;
   for(let ch=0;ch<3;ch++){
    let g0=Math.min(1,off[0][k+ch]/Math.max(1,on[k+ch])),g1=Math.min(1,off[1][k+ch]/Math.max(1,on[k+ch]));
    if(emitter){if(g0<.85)g0=Math.min(g0,fine[0][k+ch]/Math.max(1,source[k+ch]));if(g1<.85)g1=Math.min(g1,fine[1][k+ch]/Math.max(1,source[k+ch]));}
    const d0=1-Math.max(.12,g0),d1=1-Math.max(.12,g1),scale=Math.min(1,.88/Math.max(.001,d0+d1)),a=alpha[k]/255;
    out[0].data[k+ch]=Math.round(255*(1-d0*scale*a));out[1].data[k+ch]=Math.round(255*(1-d1*scale*a));
   }
   out[0].data[k+3]=out[1].data[k+3]=255;
  }
  for(let n=0;n<2;n++){x.putImageData(out[n],0,0);r.sources[n].setAttribute('href',mask.toDataURL());r.sources[n].dataset.ready='true';}
  r.ready=true;r.photo=null;r.off=null;r.root.dataset.ready='true';
 }
 function create(id){
  const ns='http://www.w3.org/2000/svg',root=document.createElementNS(ns,'svg');
  root.setAttribute('viewBox',`0 0 ${W} ${H}`);root.setAttribute('aria-hidden','true');root.classList.add('rv-photometric');
  Object.assign(root.style,{position:'absolute',pointerEvents:'none',mixBlendMode:'multiply',zIndex:'0'});
  const filter='relight-'+id;
  root.innerHTML=`<defs><filter id="${filter}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feImage x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="none" result="strip" data-relight-circuit="strip"/><feImage x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="none" result="spots" data-relight-circuit="spots"/><feComposite in="strip" in2="spots" operator="arithmetic" k1="0" k2="0" k3="0" k4="1"/></filter></defs><rect width="${W}" height="${H}" filter="url(#${filter})"/>`;
  const r={id,root,photo:new Image(),off:[new Image(),new Image()],sources:[...root.querySelectorAll('feImage')],ready:false};
  r.photo.addEventListener('load',()=>prepare(r),{once:true});r.photo.src=`assets/original/room-${id}.webp`;
  r.off.forEach((p,n)=>{p.addEventListener('load',()=>prepare(r),{once:true});p.src=`assets/original/room-${id}-${n?'spots':'strip'}-off-v1.webp`;});
  return r;
 }
 window.STARK_RELIGHT={render(v,id,lights){
  v.querySelectorAll('.rv-photometric').forEach(c=>{if(c.dataset.room!==id)c.remove();});
  if(!SURFACES[id])return;
  if(!cache.has(id))cache.set(id,create(id));const r=cache.get(id);r.root.dataset.room=id;
  if(r.root.parentNode!==v)v.appendChild(r.root);prepare(r);
  const losses=['strip','spots'].map((key,n)=>{const level=lights[key]==='off'?0:Math.max(0,Math.min(1,lights.lv[key]/100));r.sources[n].dataset.level=Math.round(level*100);return 1-level;});
  const blend=r.root.querySelector('feComposite');blend.setAttribute('k2',losses[0]);blend.setAttribute('k3',losses[1]);blend.setAttribute('k4',1-losses[0]-losses[1]);
  const s=Math.max(v.clientWidth/W,v.clientHeight/H);Object.assign(r.root.style,{left:(v.clientWidth-W*s)/2+'px',top:(v.clientHeight-H*s)/2+'px',width:W*s+'px',height:H*s+'px'});
  // Deux pièces en cache au maximum pour conserver une consommation mémoire
  // modérée sur les appareils mobiles ; les références restent en cache HTTP.
  for(const name of cache.keys())if(cache.size>2&&name!==id)cache.delete(name);
 }};
})();
