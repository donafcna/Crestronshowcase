/* Showcase only. Native CH5 controls, local feedback; never a control-system transport. */
(() => {
  const lib = window.CrComLib, values = new Map();
  const zones = {
    bar: ['Bar'], entrance: ['Lobby', 'Inspiration', 'WC400'],
    restaurant: ['Restaurant', 'WC300', 'Inspiration'],
    salon: ['Petit salon'], pdr: ['Salle privée'],
    wellness: ['WC', 'Couloir', 'Relax', 'Fitness'], seminar: ['Séminaire 1', 'Séminaire 2'],
  };
  const params = new URLSearchParams(location.search);
  const main = params.get('main') === '1';
  const places = ['pdr', 'wellness', 'salon', 'restaurant', 'seminar', 'bar', 'entrance'];
  const placeJoins = places.map((_, index) => 31 + index);
  const requested = params.get('zone');
  let zone = places.includes(requested) ? requested : 'bar';
  const saved = new Map();
  const feedback = (type, join, value) => {
    values.set(type + join, value);
    const method={b:'bridgeReceiveBooleanFromNative',n:'bridgeReceiveIntegerFromNative',s:'bridgeReceiveStringFromNative'}[type];
    lib[method](String(join),value);
  };
  const exclusive = (joins, active) => joins.forEach(j => feedback('b', j, j === active));
  const blindPulses = new Map();
  function command(type, key, value) {
    const j = Number(key);
    if (!Number.isFinite(j)) return;
    if (type === 'n') { feedback('n', j, value); return; }
    if (type !== 'b' || !value) return;
    if (main && placeJoins.includes(j)) {
      selectPlace(places[j - 31]);
      return;
    }
    if ([21, 22, 23].includes(Math.floor(j / 100)) && j % 100 >= 1 && j % 100 <= 50) {
      clearTimeout(blindPulses.get(j));
      feedback('b', j, true);
      blindPulses.set(j, setTimeout(() => {
        feedback('b', j, false);
        blindPulses.delete(j);
      }, 250));
      return;
    }
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
    const names = zones[zone];
    [201,202,203,204,205,210,211].forEach(j=>feedback('b',j,false));
    feedback('b',zone==='seminar'?210:200+names.length,true);
    for (let i = 0; i < 5; i++) {
      feedback('s', i + 1, names[i] || '');
      feedback('s', i + 11, names[i] || '');
    }
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
    // Sans stores dans l'espace : l'onglet Stores du menu du bas disparait (demo.css).
    document.documentElement.classList.toggle('hdh-no-blinds',!blinds);
    feedback('b',250,blinds);
    for (let i = 1; i <= 2; i++) {
      feedback('s', 1300 + i, blinds ? 'Store ' + i : '');
      feedback('b', 2000 + i, blinds);
      feedback('b', 540 + i, blinds);
    }
    feedback('b',2,true);
  }
  function selectPlace(next) {
    if (zone === next) return;
    const snapshot = new Map(values);
    for (const [join, timeout] of blindPulses) {
      clearTimeout(timeout);
      snapshot.delete('b' + join);
      feedback('b', join, false);
    }
    blindPulses.clear();
    for (const join of [30, ...placeJoins]) snapshot.delete('b' + join);
    saved.set(zone, snapshot);
    for (const key of snapshot.keys()) {
      const type = key[0];
      feedback(type, Number(key.slice(1)), { b: false, n: 0, s: '' }[type]);
    }
    zone = next;
    init();
    for (const [key, value] of saved.get(zone) || []) {
      feedback(key[0], Number(key.slice(1)), value);
    }
    exclusive(placeJoins, 31 + places.indexOf(zone));
    parent.postMessage({channel:'hdh-demo-place',zone},location.origin);
  }
  window.HDH_DEMO={get zone(){return zone;},values,feedback,command};
  document.addEventListener('click',e=>{if(e.target.closest('#circuitsbtn_clear_lighting')){document.querySelector('.container-lightingcircuits').style.display='none';document.querySelector('.container-lightingscenes').style.display='';}});
  init();
  if (main) {
    feedback('b', 30, true);
    exclusive(placeJoins, 31 + places.indexOf(zone));
  }
})();
