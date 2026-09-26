/* Portrait adaptation for the showcase. Local simulation only, no hardware transport. */
(() => {
 const zones={bar:'Bar',entrance:'Entrée / Lobby',restaurant:'Restaurant',salon:'Petit salon',pdr:'Salle privée',wellness:'Wellness',seminar:'Séminaires'};
 const paths={lighting:'M9 18h6m-5 3h4M8 14a6 6 0 1 1 8 0l-1 3H9z',audio:'M9 18V5l11-2v13M9 8l11-2M9 18c0 3-6 4-6 1s6-4 6-1m11-2c0 3-6 4-6 1s6-4 6-1',blinds:'M3 4h18M4 8h16M4 12h16M4 16h16M12 16v5m-3-3 3 3 3-3',temperature:'M10 14V5a2 2 0 0 1 4 0v9a4 4 0 1 1-4 0M12 10v7'};
 const icon=k=>`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[k]}"/></svg>`;
 const params=new URLSearchParams(location.search);let zone=zones[params.get('zone')]?params.get('zone'):'bar',tab='lighting',circuits=false;
 const state=Object.fromEntries(Object.keys(zones).map(k=>[k,{lights:[65,65,65,65],scene:null,volume:40,mute:false,source:0,temp:21,blinds:[0,0],target:[0,0]}]));
 const zoneEl=document.querySelector('#zone'),content=document.querySelector('#content'),nav=document.querySelector('nav'),theme=document.querySelector('#theme');
 zoneEl.innerHTML=Object.entries(zones).map(([k,v])=>`<option value="${k}">${v}</option>`).join('');zoneEl.value=zone;
 theme.value=['clair','sombre'].includes(params.get('theme'))?params.get('theme'):'actuel';document.body.dataset.theme=theme.value;theme.onchange=()=>{document.body.dataset.theme=theme.value};
 const emit=(focus=false)=>parent.postMessage({focus,channel:'hdh-demo',zone,level:state[zone].lights.reduce((a,b)=>a+b)/4},location.origin);
 zoneEl.onchange=()=>{zone=zoneEl.value;circuits=false;render();emit(true)};
 function render(){const s=state[zone],hasBlinds=['bar','restaurant','seminar'].includes(zone);if(tab==='blinds'&&!hasBlinds)tab='lighting';
 nav.innerHTML=Object.entries({lighting:'Éclairages',audio:'Audio',blinds:'Stores',temperature:'Température'}).map(([k,v])=>`<button data-tab="${k}" aria-pressed="${tab===k}" ${k==='blinds'&&!hasBlinds?'disabled':''}>${icon(k)}${v}</button>`).join('');
 nav.querySelectorAll('button').forEach(b=>b.onclick=()=>{tab=b.dataset.tab;circuits=false;render()});
 let html='';
 if(tab==='lighting'){html='<div class="eyebrow">Créer votre ambiance</div><h1>Éclairages</h1>';
 if(circuits){html+='<div class="card stack circuits">'+['Corniche','Suspensions','Spots','Appliques'].map((n,i)=>`<label>${n}<div class="row"><input aria-label="${n}" data-light="${i}" type="range" min="0" max="100" value="${s.lights[i]}"><output>${s.lights[i]} %</output></div></label>`).join('')+'</div>'}
 else html+='<div class="grid">'+['Éteint','Ambiance','Confort','Total'].map((n,i)=>`<button class="scene" data-scene="${i}" aria-pressed="${s.scene===i}">${icon('lighting')}${n}</button>`).join('')+'</div><p>Une lumière adaptée à chaque moment.</p>';
 html+=`<button id="circuits">${circuits?'Retour aux ambiances':'Réglage des circuits'}</button>`;
 }
 if(tab==='audio'){const sources=zone==='seminar'?['Wiim','Écran','Commun']:['Wiim','Commun'];html='<div class="eyebrow">Votre environnement sonore</div><h1>Audio</h1><div class="stack">'+sources.map((n,i)=>`<button data-source="${i}" aria-pressed="${s.source===i}">${n}</button>`).join('')+`</div><div class="card"><div class="row"><span>Volume</span><output id="volume-value">${s.volume} %</output></div><input id="volume" aria-label="Volume" type="range" min="0" max="100" value="${s.volume}"><button id="mute" style="width:100%" aria-pressed="${s.mute}">${s.mute?'Rétablir le son':'Couper le son'}</button></div>`}
 if(tab==='temperature')html=`<div class="eyebrow">Confort de la pièce</div><h1>Température</h1><div class="card"><p style="text-align:center">Consigne</p><div class="value" aria-live="polite">${s.temp.toFixed(1)}<span style="font-size:22px"> °C</span></div><div class="adjust"><button id="minus" aria-label="Diminuer la température">−</button><button id="plus" aria-label="Augmenter la température">+</button></div></div><p>Température ambiante · 21.0 °C</p>`;
 if(tab==='blinds')html='<div class="eyebrow">Maîtriser la lumière naturelle</div><h1>Stores</h1>'+s.blinds.map((v,i)=>`<div class="card stack"><div class="row"><span>Store ${i+1}</span><output data-blind-value="${i}">${Math.round(v)} %</output></div><div class="row">${['Ouvrir','Stop','Fermer'].map((n,j)=>`<button data-blind="${i}" data-action="${j}">${n}</button>`).join('')}</div></div>`).join('');
 content.innerHTML=html;
 content.querySelectorAll('[data-scene]').forEach(b=>b.onclick=()=>{s.scene=+b.dataset.scene;s.lights.fill([0,35,70,100][s.scene]);render();emit(true)});
 content.querySelectorAll('[data-light]').forEach(r=>r.oninput=()=>{s.lights[+r.dataset.light]=+r.value;s.scene=null;r.nextElementSibling.value=r.value+' %';emit(true)});
 content.querySelector('#circuits')?.addEventListener('click',()=>{circuits=!circuits;render()});
 content.querySelectorAll('[data-source]').forEach(b=>b.onclick=()=>{s.source=+b.dataset.source;render()});
 content.querySelector('#volume')?.addEventListener('input',e=>{s.volume=+e.target.value;document.querySelector('#volume-value').value=s.volume+' %'});
 content.querySelector('#mute')?.addEventListener('click',()=>{s.mute=!s.mute;render()});
 for(const [id,d]of [['minus',-.5],['plus',.5]])content.querySelector('#'+id)?.addEventListener('click',()=>{s.temp=Math.max(16,Math.min(28,s.temp+d));render()});
 content.querySelectorAll('[data-blind]').forEach(b=>b.onclick=()=>{const i=+b.dataset.blind;s.target[i]=[0,s.blinds[i],100][+b.dataset.action]});
 }
 setInterval(()=>{for(const s of Object.values(state))s.blinds.forEach((v,i)=>{s.blinds[i]=v+Math.sign(s.target[i]-v)*Math.min(2,Math.abs(s.target[i]-v))});if(tab==='blinds')document.querySelectorAll('[data-blind-value]').forEach(o=>o.value=Math.round(state[zone].blinds[+o.dataset.blindValue])+' %')},100);
 window.addEventListener('message',e=>{if(e.source===parent&&e.origin===location.origin&&e.data?.channel==='hdh-request')emit()});
 window.HDH_PHONE={state,get zone(){return zone}};render();emit();
})();