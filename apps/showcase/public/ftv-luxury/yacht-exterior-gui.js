/* Yacht-only exterior controls. Existing room channels and boutique stay unchanged. */
(function () {
  'use strict';
  const gui=window.ftvGui, core=window.FTV_YACHT_EXTERIOR;
  if(!gui||gui.config.project!=='yacht-monaco'||!core)return;
  const app=document.getElementById('app'), controls=document.getElementById('controls');
  const origin=location.origin==='null'?'*':location.origin, channel='ftv-luxury/v1';
  const simulation=core.createController();
  const sceneCycle=window.FTV_YACHT_SCENE_CYCLE.create(preset=>gui.applyPreset(preset));
  let current=simulation.state(), opened=false, group='signature', page=0, pageSize=3, ready=gui.panel2D;
  const panel=document.createElement('section');
  panel.className='yacht-exterior-panel';panel.hidden=true;panel.setAttribute('aria-label','Circuits extérieurs du yacht');controls.after(panel);
  function command(payload){
    if(gui.panel2D){
      if(payload.action==='automatic')simulation.setAutomatic(payload.value);
      if(payload.action==='level')simulation.setLevel(payload.id,payload.value);
      if(payload.action==='preset')simulation.setPreset(payload.key);
      current=simulation.state();refresh();return;
    }
    if(!ready)return;
    const msg={channel,project:gui.config.project,type:'exterior',command:payload};
    if(gui.externalModel)parent.postMessage({channel,project:gui.config.project,type:'background-command',command:msg},origin);
    else document.getElementById('model').contentWindow?.postMessage(msg,origin);
  }
  function launcher(){
    if(gui.state.tab!=='light'||controls.querySelector('[data-exterior-open]'))return;
    const b=document.createElement('button');b.type='button';b.dataset.exteriorOpen='';b.className='exterior-launcher';
    b.textContent='Extérieur · 40 circuits';b.setAttribute('aria-expanded',String(opened));
    (controls.querySelector('.section-header')||controls).appendChild(b);
  }
  const observer=new MutationObserver(launcher);observer.observe(controls,{childList:true,subtree:true});
  function show(on){
    opened=on;panel.hidden=!on;app.classList.toggle('yacht-exterior-active',on);
    controls.querySelector('[data-exterior-open]')?.setAttribute('aria-expanded',String(on));
    if(on){render();panel.querySelector('[data-exterior-close]').focus();}
    else controls.querySelector('[data-exterior-open]')?.focus();
  }
  const circuitName=c=>c.id==='party_beams'?'Lyres · optiques de pont':c.name;
  function render(){
    const list=core.circuits.filter(c=>c.group===group), count=Math.ceil(list.length/pageSize);page=Math.max(0,Math.min(count-1,page));
    panel.innerHTML=`<div class="exterior-heading"><h2>Éclairage extérieur</h2><button type="button" data-exterior-close>Retour</button></div>
      <div class="exterior-mode"><label><input type="checkbox" data-exterior-auto ${current.automatic?'checked':''}> Auto jour / nuit</label><span data-exterior-phase></span></div>
      <div class="exterior-actions"><button type="button" data-exterior-preset="night">Tout allumer</button><button type="button" data-exterior-preset="off">Tout éteindre</button></div>
      <label class="exterior-group">Famille de circuits<select data-exterior-group>${Object.entries(core.groups).map(([id,name])=>`<option value="${id}" ${group===id?'selected':''}>${name}</option>`).join('')}</select></label>
      <div class="exterior-sliders">${list.slice(page*pageSize,page*pageSize+pageSize).map(c=>`<div class="exterior-slider"><label for="exterior-${c.id}">${circuitName(c)}<output data-exterior-value="${c.id}">${current.levels[c.id]} %</output></label><input id="exterior-${c.id}" type="range" min="0" max="100" step="1" value="${current.levels[c.id]}" data-exterior-id="${c.id}" aria-label="${circuitName(c)}"></div>`).join('')}</div>
      <div class="exterior-pages"><button type="button" data-exterior-page="-1" ${page===0?'disabled':''}>Précédent</button><span>${page+1} / ${count}</span><button type="button" data-exterior-page="1" ${page+1===count?'disabled':''}>Suivant</button></div>
      <p class="exterior-hint" data-exterior-status role="status"></p>`;
    refresh();
    requestAnimationFrame(()=>{
      if(opened&&innerWidth>650&&panel.scrollHeight>panel.clientHeight+1&&pageSize>1){pageSize--;page=0;render();}
    });
  }
  function refresh(){
    // Follow the model's validated phase even when the exterior panel is closed.
    if(ready)sceneCycle.update(current);
    if(!opened)return;
    const stage={day:'Jour',dusk:'Crépuscule',night:'Nuit',dawn:'Aube'}[current.stage]||'Jour';
    panel.querySelector('[data-exterior-phase]').textContent=stage+' · '+(current.automatic?'Auto':'Manuel');
    panel.querySelector('[data-exterior-auto]').checked=current.automatic;
    panel.querySelector('[data-exterior-status]').textContent=!ready?'Connexion à la scène 3D…':gui.panel2D?'Simulation locale · aucune installation connectée.':'Cycle 80 s · le réglage manuel reste actif jusqu’au retour en Auto.';
    panel.querySelectorAll('[data-exterior-id]').forEach(el=>{
      const v=current.levels[el.dataset.exteriorId];if(document.activeElement!==el)el.value=v;
      panel.querySelector(`[data-exterior-value="${el.dataset.exteriorId}"]`).textContent=v+' %';el.disabled=!ready;
    });
    panel.querySelectorAll('[data-exterior-auto],[data-exterior-preset]').forEach(el=>{el.disabled=!ready;});
  }
  document.addEventListener('click',e=>{
    const b=e.target.closest('button');
    if(b?.hasAttribute('data-exterior-open'))show(true);
    else if(b?.hasAttribute('data-exterior-close'))show(false);
    else if(b?.dataset.exteriorPreset)command({action:'preset',key:b.dataset.exteriorPreset});
    else if(b?.dataset.exteriorPage){page+=Number(b.dataset.exteriorPage);render();}
    else if(b?.dataset.tab&&opened)show(false);
    launcher();
  });
  panel.addEventListener('change',e=>{
    if(e.target.hasAttribute('data-exterior-auto'))command({action:'automatic',value:e.target.checked});
    if(e.target.hasAttribute('data-exterior-group')){group=e.target.value;page=0;render();}
  });
  panel.addEventListener('input',e=>{
    const id=e.target.dataset.exteriorId,value=Number(e.target.value);if(!id||!Object.hasOwn(core.byId,id)||!Number.isFinite(value))return;
    current={...current,automatic:false,levels:{...current.levels,[id]:value}};refresh();command({action:'level',id,value});
  });
  panel.addEventListener('keydown',e=>{if(e.key==='Escape')show(false);});
  // Only a real pointer/keyboard click on an interior preset may exit Auto.
  // The automatic tour also calls applyPreset; it must not freeze exterior light.
  let userPreset=null;
  document.addEventListener('click',e=>{
    const id=e.target.closest?.('[data-preset]')?.dataset.preset;
    userPreset=e.isTrusted&&id?id:null;
    setTimeout(()=>{userPreset=null;},0);
  },true);
  window.addEventListener('ftv:control',e=>{
    if(e.detail?.project!==gui.config.project)return;
    if(e.detail.name==='scene'&&userPreset===e.detail.value)command({action:'preset',key:e.detail.value});
    if(gui.state.tab!=='light'&&opened)show(false);
  });
  window.addEventListener('message',e=>{
    const source=gui.externalModel?parent:document.getElementById('model').contentWindow;
    if(e.source!==source||(origin!=='*'&&e.origin!==location.origin))return;
    const m=e.data;if(m?.channel!==channel||m.project!==gui.config.project)return;
    if(m.type==='model-ready'){ready=!!m.exterior;}
    if(m.type==='exterior-state'&&typeof m.automatic==='boolean'&&m.levels&&core.circuits.every(c=>Number.isFinite(m.levels[c.id]))){
      ready=true;current={automatic:m.automatic,stage:m.stage,levels:Object.fromEntries(core.circuits.map(c=>[c.id,Math.max(0,Math.min(100,m.levels[c.id]))]))};refresh();
    }
  });
  if(gui.panel2D){
    let seconds=0,last=performance.now();setInterval(()=>{const now=performance.now();if(!document.hidden)seconds+=(now-last)/1000;last=now;simulation.tick(seconds);current=simulation.state();refresh();},350);
    document.addEventListener('visibilitychange',()=>{last=performance.now();});
  }else{
    const hello={channel,project:gui.config.project,type:'hello'};
    if(gui.externalModel)parent.postMessage({channel,project:gui.config.project,type:'background-command',command:hello},origin);
    else document.getElementById('model').contentWindow?.postMessage(hello,origin);
  }
  window.ftvYachtExteriorGui={show,get state(){return current;},get ready(){return ready;}};
  launcher();
})();
