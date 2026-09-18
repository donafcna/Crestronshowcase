/* Presentation only. Native receiveStateSelected remains the sole feedback owner. */
(function(){
  function mark(button,action,enabled){
    if(!button)return;
    button.classList.toggle('curtain-'+action,enabled);
    if(enabled)button.setAttribute('aria-label',action==='open'?'Ouvrir les rideaux':'Fermer les rideaux');
  }
  function row(el,label){
    if(!el||!label)return;
    var curtain=/rideau|curtain|vorhang|cortina/i.test(label.textContent);
    var buttons=el.querySelectorAll('ch5-button,button.shade-btn-mobile');
    if(buttons.length>=3){mark(buttons[0],'open',curtain);mark(buttons[2],'close',curtain);}
  }
  function refresh(){
    var config=window.villaConfigEmbedded||window.villaConfig;
    document.documentElement.classList.toggle('hvac-extended',config?.contrat?.cvcEtendu?.actif===true);
    document.querySelectorAll('#iphone-shades-rows .shade-control-row').forEach(el=>row(el,el.querySelector('.shade-label')));
    document.querySelectorAll('#motors-container .overlay-item-row').forEach(el=>row(el,el.querySelector('span')));
    document.querySelectorAll('[id^="motor-label-"]').forEach(label=>row(label.parentElement?.parentElement,label));
    // 18.09.2026 : les presets texte « Tout ouvrir / Tout fermer » de la ligne Rideaux (fenêtre Stores)
    // gardent leur libellé ; seuls les boutons-icônes 64 / 66 portent la flèche.
    document.querySelectorAll('ch5-button[data-join="64"],button[onclick="pressDigital(64)"]').forEach(el=>mark(el,'open',true));
    document.querySelectorAll('ch5-button[data-join="66"],button[onclick="pressDigital(66)"]').forEach(el=>mark(el,'close',true));
    document.querySelectorAll('ch5-button[customClass~="preset-text-btn"]').forEach(el=>{mark(el,'open',false);mark(el,'close',false);});
    // 18.09.2026 (iPhone) : les presets par famille « Tout ouvrir / Tout fermer » restent en texte,
    // y compris pour les rideaux (demande Donatien) ; seules les lignes de moteurs portent les flèches.
    mark(document.querySelector('[onclick="window.presetFamilleMoteurs(\'open\')"]'),'open',false);
    mark(document.querySelector('[onclick="window.presetFamilleMoteurs(\'close\')"]'),'close',false);
  }
  var queued=false;function schedule(){if(queued)return;queued=true;requestAnimationFrame(function(){queued=false;refresh();});}
  function start(){refresh();new MutationObserver(schedule).observe(document.body,{subtree:true,childList:true,characterData:true});document.addEventListener('click',schedule);window.addEventListener('villa-config-loaded',schedule);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
