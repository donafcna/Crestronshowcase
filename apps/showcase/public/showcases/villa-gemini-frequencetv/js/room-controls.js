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
    document.querySelectorAll('ch5-button[data-join="64"],button[onclick="pressDigital(64)"],ch5-button[onclick*="animateGroupBlinds(\'rideaux\', \'open\')"]').forEach(el=>mark(el,'open',true));
    document.querySelectorAll('ch5-button[data-join="66"],button[onclick="pressDigital(66)"],ch5-button[onclick*="animateGroupBlinds(\'rideaux\', \'close\')"]').forEach(el=>mark(el,'close',true));
    var curtain=document.querySelector('.famille-btn.actif[data-famille="rideaux"]');
    mark(document.querySelector('[onclick="window.presetFamilleMoteurs(\'open\')"]'),'open',!!curtain);
    mark(document.querySelector('[onclick="window.presetFamilleMoteurs(\'close\')"]'),'close',!!curtain);
  }
  var queued=false;function schedule(){if(queued)return;queued=true;requestAnimationFrame(function(){queued=false;refresh();});}
  function start(){refresh();new MutationObserver(schedule).observe(document.body,{subtree:true,childList:true,characterData:true});document.addEventListener('click',schedule);window.addEventListener('villa-config-loaded',schedule);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
