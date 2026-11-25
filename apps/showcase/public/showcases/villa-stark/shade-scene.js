/* Toile dans le plan de chaque vitrage ; géométrie en coordonnées de la photo. */
(() => {
  const NS='http://www.w3.org/2000/svg';
  const lerp=(a,b,t)=>a.map((n,i)=>n+(b[i]-n)*t);
  const xy=([x,y])=>[x*16.72,y*9.41];
  const points=p=>p.map(xy).map(p=>p.join(',')).join(' ');
  // Chaque intervalle laisse les montants photographiés visibles.
  const PANES={Living:[0,.325,.65,1],Dining:[0,.049,.145,.295,.55,.90,1],Kitchen:[0,.48,1],Office:[0,.48,1],Fitness:[0,.34,.68,1],Entry:[0,1],Master:[0,.32,.66,1],Bedroom:[0,1]};
  const DINING=[[[46.9,30.3],[99.9,1.2],[99.9,84.1],[46.9,61.4]]];
  function quad(rect,clip){const nums=[...clip.matchAll(/([\d.]+)%?\s+([\d.]+)%?/g)].map(m=>[+m[1],+m[2]]);return nums.map(([x,y])=>[rect[0]+rect[2]*x/100,rect[1]+rect[3]*y/100]);}
  function panel(q,a,b){const gap=.003;return [lerp(q[0],q[1],a+gap),lerp(q[0],q[1],b-gap),lerp(q[3],q[2],b-gap),lerp(q[3],q[2],a+gap)];}
  function cloth(q,p,type,key){
    if(p<=0)return '';
    const bottom=[lerp(q[0],q[3],p),lerp(q[1],q[2],p)];
    let out=`<polygon points="${points([q[0],q[1],bottom[1],bottom[0]])}" fill="url(#${key}-cloth)"/>`;
    out+=`<polygon points="${points([q[0],q[1],bottom[1],bottom[0]])}" fill="url(#shade-weave)" opacity=".16"/>`;
    // Pliures en perspective et paquet de plis qui s'accumule à la remontée.
    if(type==='roman'){
      for(let f=.16;f<p-.035;f+=.16){const l=xy(lerp(q[0],q[3],f)),r=xy(lerp(q[1],q[2],f));out+=`<path d="M${l} Q${(l[0]+r[0])/2},${(l[1]+r[1])/2+3} ${r}" fill="none" stroke="#655b4c" stroke-opacity=".24" stroke-width="2"/>`;}
      const folds=Math.ceil((1-p)*5);
      for(let n=0;n<folds;n++){const f=Math.max(.002,p-n*.012),l=xy(lerp(q[0],q[3],f)),r=xy(lerp(q[1],q[2],f));out+=`<path d="M${l} L${r}" stroke="#b3a58e" stroke-width="5"/><path d="M${l[0]},${l[1]+2} L${r[0]},${r[1]+2}" stroke="#776b58" stroke-opacity=".45" stroke-width="1"/>`;}
    }
    const l=xy(bottom[0]),r=xy(bottom[1]);
    return out+`<path d="M${l[0]},${l[1]+2} L${r[0]},${r[1]+2}" stroke="#181610" stroke-opacity=".3" stroke-width="5"/><path d="M${l} L${r}" stroke="${type==='roman'?'#a99b83':'#797267'}" stroke-width="2.4"/>`;
  }
  function build(root,id,rect,clip,foreground){
    root.innerHTML='';root.dataset.sceneRoom=id;
    const svg=document.createElementNS(NS,'svg');svg.setAttribute('viewBox','0 0 1672 941');svg.setAttribute('preserveAspectRatio','none');svg.setAttribute('aria-hidden','true');
    const cut=(foreground||[]).map(p=>`<polygon points="${points(p)}" fill="black"/>`).join('');
    // Suspension, cordons et silhouettes de premier plan de la salle à manger.
    const diningCut=id==='Dining'?`<path d="M630 368 Q673 325 734 321 Q850 302 945 351 Q796 387 630 368Z" fill="black"/><path d="M717 91V323 M812 35V318" stroke="black" stroke-width="5"/><path d="M832 569L839 549Q842 533 860 532L906 534Q917 535 914 550L903 577Z M921 588L930 557Q934 541 951 541L998 546Q1015 549 1007 569L998 603Z M1045 612L1056 571Q1060 553 1078 555L1147 561Q1165 563 1156 588L1145 624Z M916 941V751Q919 680 998 638Q1104 608 1205 606Q1221 609 1214 634L1195 697L1183 941Z" fill="black"/><path d="M437 554L753 547L1214 609L1059 679L821 941H437Z" fill="black"/><path d="M704 575Q677 568 690 540L704 518L753 512L775 543Q776 577 739 579Z" fill="black"/>`:'';
    svg.innerHTML=`<defs><mask id="shade-foreground"><rect width="1672" height="941" fill="white"/>${id==='Dining'?diningCut:cut}</mask><pattern id="shade-weave" width="4" height="4" patternUnits="userSpaceOnUse"><path d="M0 0H4 M0 2H4" stroke="#fff" stroke-width=".4"/><path d="M1 0V4" stroke="#554c3d" stroke-width=".45"/></pattern></defs>`;
    const q=id==='Dining'?DINING[0]:quad(rect,clip),stops=PANES[id]||[0,1];
    root._shadePanels=stops.slice(0,-1).map((a,i)=>panel(q,a,stops[i+1]));
    for(const type of ['blackout','roman']){
      const key='shade-'+type;
      svg.querySelector('defs').insertAdjacentHTML('beforeend',`<linearGradient id="${key}-cloth" x1="0" y1="0" x2="1" y2="0"><stop stop-color="${type==='roman'?'#a99b83':'#655f56'}"/><stop offset=".08" stop-color="${type==='roman'?'#d2c5ab':'#8b8274'}"/><stop offset=".55" stop-color="${type==='roman'?'#c3b69c':'#7d7569'}"/><stop offset="1" stop-color="${type==='roman'?'#b1a388':'#5d574f'}"/></linearGradient>`);
      const g=document.createElementNS(NS,'g');g.dataset.shade=type;g.setAttribute('mask','url(#shade-foreground)');svg.appendChild(g);
    }root.appendChild(svg);
  }
  function render(root,id,rect,clip,foreground,states,v){
    if(root.dataset.sceneRoom!==id)build(root,id,rect,clip,foreground);
    const scale=Math.max(v.clientWidth/1672,v.clientHeight/941);
    Object.assign(root.style,{left:(v.clientWidth-1672*scale)/2+'px',top:(v.clientHeight-941*scale)/2+'px',width:1672*scale+'px',height:941*scale+'px',clipPath:'none',maskImage:'none'});
    for(const type of ['blackout','roman']){const el=root.querySelector('[data-shade='+type+']'),p=Math.max(0,Math.min(1,states[type].pos/100));el.dataset.position=states[type].pos;el.innerHTML=root._shadePanels.map(q=>cloth(q,p,type,'shade-'+type)).join('');}
  }
  window.STARK_SHADES={render};
})();
