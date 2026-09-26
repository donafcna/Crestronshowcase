/* Showcase only. Native CH5 controls, local feedback; never a control-system transport. */
(() => {
  const lib = window.CrComLib, values = new Map();
  const zones = {
    bar: ['Bar'], entrance: ['Lobby', 'Foyer', 'WC400'],
    restaurant: ['Restaurant', 'WC300', 'Inspiration'],
    salon: ['Petit salon'], pdr: ['Salle privée'],
    wellness: ['WC', 'Couloir', 'Relax', 'Fitness'], seminar: ['Séminaire 1', 'Séminaire 2'],
  };
  const zone = new URLSearchParams(location.search).get('zone') || 'bar';
  const names = zones[zone] || zones.bar;
  const feedback = (type, join, value) => {
    values.set(type + join, value);
    const method={b:'bridgeReceiveBooleanFromNative',n:'bridgeReceiveIntegerFromNative',s:'bridgeReceiveStringFromNative'}[type];
    lib[method](String(join),value);
  };
  const exclusive = (joins, active) => joins.forEach(j => feedback('b', j, j === active));
  function command(type, key, value) {
    const j = Number(key);
    if (!Number.isFinite(j)) return;
    if (type === 'n') { feedback('n', j, value); return; }
    if (type !== 'b' || !value) return;
    if ([111,121,125,129,133,137].includes(j)) feedback('b',j,!values.get('b'+j));
    if (j >= 194 && j <= 196) exclusive([194,195,196],j);
    if (j >= 301 && j <= 303) exclusive([301,302,303],j);
    if (j >= 2491 && j <= 2493) exclusive([2491,2492,2493],j);
    for (const base of [1421,1461,1501]) if(j>=base&&j<base+10){
      exclusive(Array.from({length:10},(_,i)=>base+i),j);
      const level=[0,35,70,100][(j-base)%4];
      for(let i=1;i<=4;i++) feedback('n',1000+i,level);
      parent.postMessage({channel:'hdh-demo',zone,level},location.origin);
    }
    if(j>=1101&&j<=1150) feedback('n',j-100,100);
    if(j>=1201&&j<=1250) feedback('n',j-200,0);
    if(j>=2501&&j<=2506 || j>=2511&&j<=2516){
      const index=j%10,join=2510+index,old=parseFloat(values.get('s'+join)||'21');
      feedback('s',join,Math.max(16,Math.min(28,old+(j<2510?.5:-.5))).toFixed(1)+' °C');
    }
    if(j===141||j===142) exclusive([141,142],j);
    if(j===151||j===152||j===153) exclusive([151,152,153],j);
    if(j===161||j===162) feedback('b',j,true);
    if(j===171){feedback('b',163,!!values.get('b161'));feedback('b',164,!!values.get('b162'));}
    if(j===173){feedback('b',163,false);feedback('b',164,false);}
    if(j===170){feedback('b',170,!values.get('b170'));}
    if(j===300) {const v=document.querySelector('.container-lightingscenes'),c=document.querySelector('.container-lightingcircuits');if(v&&c){const show=c.style.display!=='block';c.style.display=show?'block':'none';v.style.display=show?'none':'';}}
  }
  const bridge=lib.Ch5SignalBridge.prototype;
  bridge.sendBooleanToNative=(j,v)=>command('b',j,v);
  bridge.sendIntegerToNative=(j,v)=>command('n',j,v);
  bridge.sendStringToNative=()=>{};
  bridge.sendObjectToNative=(j,v)=>{if(v?.repeatdigital)command('b',j,true);};
  function init() {
    [201,202,203,204,205,210,211].forEach(j=>feedback('b',j,false));
    feedback('b',zone==='seminar'?210:200+names.length,true);
    names.forEach((n,i)=>{feedback('s',i+1,n);feedback('s',i+11,n);});
    feedback('b',230,names.length>1);feedback('b',222,names.length===2);feedback('b',223,names.length>=3);
    exclusive([301,302,303],301);feedback('b',261,true);feedback('b',2491,true);
    for(let i=1;i<=6;i++){feedback('s',2500+i,'21.0 °C');feedback('s',2510+i,'21.0 °C');}
    for(const base of [1401,1441,1481]) ['Éteint','Ambiance','Confort','Total'].forEach((s,i)=>{feedback('s',base+i,s);feedback('b',base+i,true);});
    ['Corniche','Suspensions','Spots','Appliques'].forEach((n,i)=>{feedback('s',1001+i,n);feedback('n',1001+i,65);feedback('b',1001+i,true);});
    feedback('b',361,true);feedback('b',404,true);feedback('s',21,names[0]);
    [111,121,125,129,133,137].forEach(j=>{feedback('n',j,26214);feedback('b',j+1,true);});
    feedback('s',141,'Salles séparées');feedback('s',142,'Salles réunies');
    feedback('s',151,'HDMI 1');feedback('s',152,'HDMI 2');feedback('s',153,'Présentation');
    feedback('b',170,true);feedback('b',194,true);feedback('b',141,true);
    feedback('s',161,'Écran 1');feedback('s',162,'Écran 2');
    const blinds=['bar','restaurant','seminar'].includes(zone);
    if(blinds)for(let i=1;i<=2;i++){feedback('s',1300+i,'Store '+i);feedback('b',2000+i,true);feedback('b',540+i,true);}
    feedback('b',2,true);
    window.HDH_DEMO={zone,values,feedback,command};
  }
  document.addEventListener('click',e=>{if(e.target.closest('#circuitsbtn_clear_lighting')){document.querySelector('.container-lightingcircuits').style.display='none';document.querySelector('.container-lightingscenes').style.display='';}});
  init();
})();
