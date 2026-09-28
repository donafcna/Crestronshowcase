/* Portrait adaptation for the showcase. Local simulation only, no hardware transport. */
(() => {
 const zones={bar:'Bar',entrance:'Entrée / Lobby',restaurant:'Restaurant',salon:'Petit salon',pdr:'Salle privée',wellness:'Wellness',seminar:'Séminaires'};
 // Miroir de la GUI tablette (source unique pour l'iPhone) : zones d'éclairage, faders audio groupés par lecteur Wiim, sources, stores.
 const layout={
  bar:{areas:['Bar'],audio:[{faders:['Bar']}],sources:['Wiim','Commun'],blinds:2},
  entrance:{areas:['Lobby','Foyer','WC400'],audio:[{faders:['Lobby','Foyer','WC400']}]},
  restaurant:{areas:['Restaurant','WC300','Inspiration'],audio:[{player:'Wiim Restaurant',faders:['Restaurant','WC300']},{player:'Wiim Inspiration',faders:['Inspiration']}],blinds:2},
  salon:{areas:['Petit salon'],audio:[{faders:['Petit salon']}]},
  pdr:{areas:['Salle privée'],audio:[{faders:['Salle privée']}]},
  wellness:{areas:['WC','Couloir','Relax'],audio:[{player:'Wiim Spa',faders:['WC','Couloir','Relax']},{player:'Wiim Fitness',faders:['Fitness']}]},
  seminar:{areas:['Séminaire 1','Séminaire 2'],audio:[{faders:['Micros']},{faders:['Audio']}],sources:['Wiim','Écran','Commun'],modes:['Salles séparées','Salles réunies'],blinds:2},
 };
 const paths={lighting:'M9 18h6m-5 3h4M8 14a6 6 0 1 1 8 0l-1 3H9z',audio:'M9 18V5l11-2v13M9 8l11-2M9 18c0 3-6 4-6 1s6-4 6-1m11-2c0 3-6 4-6 1s6-4 6-1',blinds:'M3 4h18M4 8h16M4 12h16M4 16h16M12 16v5m-3-3 3 3 3-3',temperature:'M10 14V5a2 2 0 0 1 4 0v9a4 4 0 1 1-4 0M12 10v7',speaker:'M4 9h4l5-4v14l-5-4H4zM16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11',muted:'M4 9h4l5-4v14l-5-4H4zM16 9l5 6M21 9l-5 6'};
 const icon=k=>`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[k]}"/></svg>`;
 const params=new URLSearchParams(location.search);let zone=zones[params.get('zone')]?params.get('zone'):'bar',tab='lighting',circuits=false;
 const state=Object.fromEntries(Object.entries(layout).map(([k,L])=>{const faders=L.audio.flatMap(g=>g.faders);return [k,{area:0,areas:L.areas.map(()=>({lights:[65,65,65,65],scene:null})),volumes:faders.map(()=>40),mutes:faders.map(()=>false),source:0,mode:0,temp:21,blinds:Array(L.blinds||0).fill(0),target:Array(L.blinds||0).fill(0)}]}));
 const cur=s=>s.areas[s.area];
 const zoneEl=document.querySelector('#zone'),content=document.querySelector('#content'),nav=document.querySelector('nav'),theme=document.querySelector('#theme');
 zoneEl.innerHTML=Object.entries(zones).map(([k,v])=>`<option value="${k}">${v}</option>`).join('');zoneEl.value=zone;
 theme.value=['clair','sombre'].includes(params.get('theme'))?params.get('theme'):'actuel';document.body.dataset.theme=theme.value;theme.onchange=()=>{document.body.dataset.theme=theme.value};
 const emit=(focus=false)=>{const s=state[zone],all=s.areas.flatMap(a=>a.lights);parent.postMessage({focus,channel:'hdh-demo',zone,level:all.reduce((a,b)=>a+b)/all.length,scene:cur(s).scene,blinds:s.blinds.length?s.blinds.reduce((a,b)=>a+b)/s.blinds.length:0},location.origin)};
 zoneEl.onchange=()=>{zone=zoneEl.value;circuits=false;render();emit(true)};
 function render(){const s=state[zone],L=layout[zone],a=cur(s),hasBlinds=s.blinds.length>0;if(tab==='blinds'&&!hasBlinds)tab='lighting';
 nav.innerHTML=Object.entries({lighting:'Éclairages',audio:'Audio',blinds:'Stores',temperature:'Température'}).filter(([k])=>k!=='blinds'||hasBlinds).map(([k,v])=>`<button data-tab="${k}" aria-pressed="${tab===k}" ${k==='blinds'&&!hasBlinds?'disabled':''}>${icon(k)}${v}</button>`).join('');
 nav.querySelectorAll('button').forEach(b=>b.onclick=()=>{tab=b.dataset.tab;circuits=false;render()});
 let html='';
 if(tab==='lighting'){html='<div class="eyebrow">Créer votre ambiance</div><h1>Éclairages</h1>'+(L.areas.length>1?'<div class="areas" role="group" aria-label="Zones">'+L.areas.map((n,i)=>`<button data-area="${i}" aria-pressed="${s.area===i}">${n}</button>`).join('')+'</div>':'');
 if(circuits){html+='<div class="card stack circuits">'+['Corniche','Suspensions','Spots','Appliques'].map((n,i)=>`<label>${n}<div class="row"><input aria-label="${n}" data-light="${i}" type="range" min="0" max="100" value="${a.lights[i]}"><output>${a.lights[i]} %</output></div></label>`).join('')+'</div>'}
 else html+='<div class="grid">'+['Éteint','Ambiance','Confort','Total'].map((n,i)=>`<button class="scene" data-scene="${i}" aria-pressed="${a.scene===i}">${icon('lighting')}${n}</button>`).join('')+'</div><p>Une lumière adaptée à chaque moment.</p>';
 html+=`<button id="circuits">${circuits?'Retour aux ambiances':'Réglage des circuits'}</button>`;
 }
 if(tab==='audio'){const names=L.audio.flatMap(g=>g.faders),playing=names.some((n,i)=>!s.mutes[i]&&s.volumes[i]>0);let k=0;
 html='<div class="eyebrow">Votre environnement sonore</div><h1>Audio</h1>';
 if(L.modes)html+='<div class="card stack"><span class="subtle">Mode de salle</span><div class="row">'+L.modes.map((n,i)=>`<button data-mode="${i}" aria-pressed="${s.mode===i}" style="flex:1">${n}</button>`).join('')+'</div></div>';
 if(L.sources)html+='<div class="sources">'+L.sources.map((n,i)=>`<button data-source="${i}" aria-pressed="${s.source===i}">${n}</button>`).join('')+'</div>';
 html+=`<div class="card"><div class="audio-status"><div class="audio-meter ${playing?'playing':''}" role="img" aria-label="${playing?'Audio en cours de lecture':'Audio à l’arrêt'}" ${playing?'':'hidden'}>${'<i></i>'.repeat(6)}</div><span id="audio-status-label">${playing?'Lecture en cours':'Audio coupé'}</span></div>`;
 html+=L.audio.map(g=>(g.player?`<div class="player">${g.player}</div>`:'')+g.faders.map(n=>{const i=k++;return `<div class="fader"><div class="row"><span>${n}</span><output data-volume-value="${i}">${s.volumes[i]} %</output></div><div class="row"><input data-volume="${i}" aria-label="Volume ${n}" type="range" min="0" max="100" value="${s.volumes[i]}"><button data-mute="${i}" class="mute" aria-pressed="${s.mutes[i]}" aria-label="${s.mutes[i]?'Rétablir le son':'Couper le son'} ${n}">${icon(s.mutes[i]?'muted':'speaker')}</button></div></div>`}).join('')).join('')+'</div>'}
 if(tab==='temperature')html=`<div class="eyebrow">Confort de la pièce</div><h1>Température</h1><div class="card"><p style="text-align:center">Consigne</p><div class="value" aria-live="polite">${s.temp.toFixed(1)}<span style="font-size:22px"> °C</span></div><div class="adjust"><button id="minus" aria-label="Diminuer la température">−</button><button id="plus" aria-label="Augmenter la température">+</button></div></div><p>Température ambiante · 21.0 °C</p>`;
 if(tab==='blinds')html='<div class="eyebrow">Maîtriser la lumière naturelle</div><h1>Stores</h1>'+s.blinds.map((v,i)=>`<div class="card stack"><div class="row"><span>Store ${i+1}</span><output data-blind-value="${i}">${Math.round(v)} %</output></div><div class="row">${['Ouvrir','Stop','Fermer'].map((n,j)=>`<button data-blind="${i}" data-action="${j}">${n}</button>`).join('')}</div></div>`).join('');
 content.innerHTML=html;
 content.querySelectorAll('[data-area]').forEach(b=>b.onclick=()=>{s.area=+b.dataset.area;render()});
 content.querySelectorAll('[data-scene]').forEach(b=>b.onclick=()=>{a.scene=+b.dataset.scene;a.lights.fill([0,35,70,100][a.scene]);emit(true);render()});
 content.querySelectorAll('[data-light]').forEach(r=>r.oninput=()=>{a.lights[+r.dataset.light]=+r.value;a.scene=null;r.nextElementSibling.value=r.value+' %';emit(true)});
 content.querySelector('#circuits')?.addEventListener('click',()=>{circuits=!circuits;render()});
 content.querySelectorAll('[data-source]').forEach(b=>b.onclick=()=>{s.source=+b.dataset.source;render()});
 content.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{s.mode=+b.dataset.mode;render()});
 content.querySelectorAll('[data-volume]').forEach(r=>r.oninput=()=>{const i=+r.dataset.volume;s.volumes[i]=+r.value;content.querySelector(`[data-volume-value="${i}"]`).value=r.value+' %';const playing=s.volumes.some((v,n)=>!s.mutes[n]&&v>0),meter=content.querySelector('.audio-meter'),label=content.querySelector('#audio-status-label');meter?.classList.toggle('playing',playing);if(meter)meter.hidden=!playing;if(label)label.textContent=playing?'Lecture en cours':'Audio coupé'});
 content.querySelectorAll('[data-mute]').forEach(b=>b.onclick=()=>{const i=+b.dataset.mute;s.mutes[i]=!s.mutes[i];render()});
 for(const [id,d]of [['minus',-.5],['plus',.5]])content.querySelector('#'+id)?.addEventListener('click',()=>{s.temp=Math.max(16,Math.min(28,s.temp+d));render()});
 content.querySelectorAll('[data-blind]').forEach(b=>b.onclick=()=>{const i=+b.dataset.blind;s.target[i]=[0,s.blinds[i],100][+b.dataset.action]});
 }
 setInterval(()=>{let moved=false;for(const [key,s] of Object.entries(state))s.blinds.forEach((v,i)=>{const next=v+Math.sign(s.target[i]-v)*Math.min(2,Math.abs(s.target[i]-v));if(key===zone&&next!==v)moved=true;s.blinds[i]=next});if(moved)emit();if(tab==='blinds')document.querySelectorAll('[data-blind-value]').forEach(o=>o.value=Math.round(state[zone].blinds[+o.dataset.blindValue])+' %')},100);
 window.addEventListener('message',e=>{if(e.source===parent&&e.origin===location.origin&&e.data?.channel==='hdh-request')emit()});
 window.HDH_PHONE={state,get zone(){return zone}};render();emit();
})();
