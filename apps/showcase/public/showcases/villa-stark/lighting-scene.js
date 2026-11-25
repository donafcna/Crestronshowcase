/* Les circuits sont recalés sur les luminaires et leurs surfaces proches, dans la photo 1672 × 941. */
(() => {
 'use strict';
 const MAP={
 Living:{strip:{label:'Bibliothèque et corniche',lines:['M63 17.5 92 6.5','M53.8 27.8 61.5 26','M53.8 35.5 61.5 33.7','M53.8 43.3 61.5 41.5','M53.8 51 61.5 49.2'],pools:[[60,37,13,31],[81,14,23,12]]},spots:{label:'Spots plafond',emit:[[19.5,1.8,.45,.18],[47,4.8,.45,.18],[63,10.5,.35,.16]],pools:[[20,7,10,13],[47,11,13,18],[71,45,25,30],[50,77,35,18]]}},
 Dining:{strip:{label:'Éclairage buffet',lines:['M11 33 11 53','M21 43 28 43'],pools:[[12,44,10,23],[26,49,8,12]]},spots:{label:'Suspension et plafond',emit:[[51.5,37,7,1.2],[80.5,4,.4,.18],[37.4,10.7,.3,.15]],pools:[[52,53,24,22],[80,14,12,18],[40,12,12,14],[59,74,25,16]]}},
 Kitchen:{strip:{label:'Plan de travail et plinthes',lines:['M0 4 62 21','M10 34 57 43','M16 84 25 95 60 77'],pools:[[35,18,36,14],[35,43,25,13],[35,82,28,17]]},spots:{label:'Spots plafond',emit:[[33,10,.35,.16],[69,4,.35,.16],[52,4,.35,.16]],pools:[[34,12,12,15],[58,17,18,19],[51,61,22,21]]}},
 Office:{strip:{label:'Rubans bibliothèque',lines:['M1 7 23 26 70 20','M25 36 66 30','M25 47 66 43'],pools:[[25,29,25,33],[52,36,22,28]]},spots:{label:'Suspension bureau et spots',emit:[[64,50.3,4,.5],[25.5,2.5,.4,.15]],pools:[[64,59,12,21],[47,75,25,17],[26,9,12,15]]}},
 Cinema:{strip:{label:'Balisage des marches',lines:['M46 99 65 81 70 75','M66 72 72 68','M16 83 38 94'],pools:[[58,89,24,16],[38,84,22,16]]},spots:{label:'Appliques et plafond',emit:[[12.3,31,1.1,4],[40,36, .8,2.4],[97.4,16,1.1,7],[25.4,8.7,.4,.15],[43.5,15,.35,.15],[57.7,8,.4,.15],[80.5,12,.35,.15]],pools:[[12,31,10,27],[40,36,8,19],[97,20,9,31],[49,14,40,14]]}},
 Fitness:{strip:{label:'Niches haltères',lines:['M57 37 72 37','M57 49 72 49','M57 60 72 60'],pools:[[65,49,14,22]]},spots:{label:'Spots plafond',emit:[[39,5,.45,.2],[51,13,.4,.18],[62,19,.35,.16],[69,25,.3,.15],[76,29,.25,.13]],pools:[[41,11,13,17],[63,25,18,23],[64,75,25,25]]}},
 Entry:{strip:{label:'Rubans escalier',lines:['M67 79 86 79','M67 74 84 74','M67 69 82 69','M67 64 80 64','M66 59 78 59','M66 54 76 54','M65 49 74 49','M65 44 72 44','M64 39 70 39'],pools:[[75,58,17,33]]},spots:{label:'Suspension entrée',emit:[[49,20,.5,1.4],[52,25,.45,1.8],[47,30,.5,1.7],[53,34,.5,1.4],[45,24,.45,1.3],[47,41,.45,1.2]],pools:[[50,27,17,27],[48,64,21,21],[40,85,28,15]]}},
 Master:{strip:{label:'Lampe de chevet gauche',emit:[[8.8,42,4,3.2]],pools:[[9,36,13,25],[19,59,19,18]]},spots:{label:'Lampe de chevet droite',emit:[[43.4,44.6,2.8,2.5]],pools:[[43,38,10,23],[39,60,17,19]]}},
 Bedroom:{strip:{label:'Applique gauche',emit:[[20.7,34,3.6,4]],pools:[[21,34,16,27],[27,62,21,19]]},spots:{label:'Applique droite et bureau',emit:[[44,44,1.5,2],[69,43,.4,1.3]],pools:[[44,43,11,21],[68,52,12,19],[51,67,21,18]]}},
 Pool:{strip:{label:'Spots de la terrasse',emit:[[18,75,.4,.2],[37,68,.4,.2],[57,62,.3,.2],[74,73,.4,.2]],pools:[[29,73,24,10],[66,81,21,16]]},spots:{label:'Spots dans le bassin',emit:[[23,77,.4,.2],[43,72,.4,.2],[62,69,.4,.2],[69,66,.35,.18]],pools:[[24,81,13,12],[44,76,14,12],[63,72,14,10]]}}
 };
 const ns='http://www.w3.org/2000/svg';
 function build(v,id,tv){
  v.querySelector('.rv-physical-lighting')?.remove();
  const root=document.createElement('div');root.className='rv-physical-lighting';root.dataset.room=id;
  for(const layer of ['darken','radiance']){
   const svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 100 100');svg.setAttribute('preserveAspectRatio','none');svg.setAttribute('aria-hidden','true');svg.classList.add('physical-'+layer);
   const prefix='fixture-'+id+'-'+layer;
   svg.innerHTML=`<defs><mask id="${prefix}-mask"><rect width="100" height="100" fill="white"/>${tv?`<rect x="${tv[0]}" y="${tv[1]}" width="${tv[2]}" height="${tv[3]}" fill="black"/>`:''}</mask></defs>`;
   for(const key of ['strip','spots']){
    const cfg=MAP[id][key],g=document.createElementNS(ns,'g');g.dataset.circuit=key;g.setAttribute('mask','url(#'+prefix+'-mask)');
    const grad=prefix+'-'+key;
    const color=layer==='darken'?'#080b12':'var(--fixture-color)';
    const stops=layer==='darken'?'<stop stop-color="#080b12" stop-opacity=".8"/><stop offset=".45" stop-color="#080b12" stop-opacity=".4"/><stop offset="1" stop-color="#080b12" stop-opacity="0"/>':'<stop stop-color="var(--fixture-color)" stop-opacity=".35"/><stop offset=".4" stop-color="var(--fixture-color)" stop-opacity=".12"/><stop offset="1" stop-color="var(--fixture-color)" stop-opacity="0"/>';
    const areas=(cfg.pools||[]).map(([x,y,rx,ry])=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="url(#${grad})"/>`).join('');
    const emit=(cfg.emit||[]).map(([x,y,rx,ry])=>layer==='darken'?`<ellipse cx="${x}" cy="${y}" rx="${rx*2}" ry="${Math.max(1,ry*2)}" fill="url(#${grad})"/><ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#151511" opacity=".96"/>`:`<ellipse cx="${x}" cy="${y}" rx="${rx*2.5}" ry="${Math.max(1,ry*2.5)}" fill="url(#${grad})"/><ellipse cx="${x}" cy="${y}" rx="${rx*.65}" ry="${ry*.7}" fill="${color}" opacity=".55"/>`).join('');
    const lines=(cfg.lines||[]).map(d=>`<path d="${d}" fill="none" stroke="${color}" stroke-width="${layer==='darken'?'.65':'.14'}" opacity="${layer==='darken'?'.78':'.8'}"/>`).join('');
    g.innerHTML=`<defs><radialGradient id="${grad}">${stops}</radialGradient></defs>`+areas+emit+lines;svg.appendChild(g);
   }root.appendChild(svg);
  }v.appendChild(root);return root;
 }
 function render(v,id,lights,tv){
  let root=v.querySelector('.rv-physical-lighting');if(!root||root.dataset.room!==id)root=build(v,id,tv);
  const cover=Math.max(v.clientWidth/1672,v.clientHeight/941);Object.assign(root.style,{left:(v.clientWidth-1672*cover)/2+'px',top:(v.clientHeight-941*cover)/2+'px',width:1672*cover+'px',height:941*cover+'px'});
  for(const key of ['strip','spots']){const level=lights[key]==='off'?0:Math.max(0,Math.min(1,lights.lv[key]/100)),color=lights[key]==='6000'?'#dcecff':'#ffd09a';root.querySelector('.physical-darken [data-circuit='+key+']').style.opacity=1-level;const radiant=root.querySelector('.physical-radiance [data-circuit='+key+']');radiant.style.opacity=Math.pow(level,.7);radiant.style.setProperty('--fixture-color',color);root.dataset[key]=Math.round(level*100);}
 }
 window.STARK_LIGHTING={maps:MAP,label:(id,key)=>MAP[id][key].label,render};
})();
