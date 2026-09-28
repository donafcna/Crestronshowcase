/* Lamelles (v5.0, 28.09.2026) — rangée Horaire · Stop · Antihoraire sous Monter · Stop · Descendre
   d'un moteur, dans le MÊME conteneur, quand villa_config.json le demande :
     pieces[].pilotages.moteurs.liste[i].lamelles === true
   Joins globaux (contrat.signauxGlobaux « Moteur.Lamelles ») : 111 + (moteur-1)*3 = Horaire,
   +1 = Stop, +2 = Antihoraire (moteur 1 = 111/112/113 … moteur 6 = 126/127/128). Impulsions sans
   état, routées par le C# sur la pièce affichée (a10) comme les moteurs 81-98.
   Partagé par la dalle / iPad / XPanel (index.html : cartes de #motors-container, <ch5-button>)
   et l'iPhone (iphone.html : lignes de #motors-container, <button> + pressDigital). Présentation
   seule ; idempotent ; se rejoue à chaque rendu (MutationObserver) et à chaque changement de pièce. */
(function () {
  var BASE = 111, MAX = 6;
  function config() { return window.villaConfigEmbedded || window.villaConfig; }
  function currentRoomId() {
    var sel = document.getElementById('room-select');
    if (sel && sel.value) return Number(sel.value);
    if (window.currentActiveRoomId) return Number(window.currentActiveRoomId);
    try { return Number(localStorage.getItem('active_room_id') || localStorage.getItem('active_room_iphone') || 1); } catch (e) { return 1; }
  }
  function slatsEnabled(roomId, motorIdx) {           // motorIdx 1..6
    var c = config(); if (!c || !c.pieces) return false;
    var p = c.pieces.find(function (x) { return x.id === roomId; });
    var m = p && p.pilotages && p.pilotages.moteurs;
    if (!m || m.actif === false) return false;
    var item = m.liste && m.liste[motorIdx - 1];
    return !!(item && item.lamelles === true);
  }
  function labelFor(kind) {
    var lang = 'fr';
    try { var ls = document.getElementById('lang-select'); lang = (ls && ls.value) || localStorage.getItem('crestron_lang') || 'fr'; } catch (e) { }
    var T = { fr: ['Lamelles sens horaire', 'Arrêt lamelles', 'Lamelles sens antihoraire'],
              en: ['Slats clockwise', 'Stop slats', 'Slats anticlockwise'],
              de: ['Lamellen im Uhrzeigersinn', 'Lamellen Stopp', 'Lamellen gegen den Uhrzeigersinn'],
              es: ['Lamas sentido horario', 'Parar lamas', 'Lamas sentido antihorario'],
              ru: ['Ламели по часовой', 'Стоп ламели', 'Ламели против часовой'] };
    var t = T[lang] || T.fr;
    return kind === 'cw' ? t[0] : kind === 'stop' ? t[1] : t[2];
  }
  // Un bouton par sens : <ch5-button> sur les châssis CH5 (dalle), <button> + pressDigital sur l'iPhone.
  function makeButton(kind, join, native) {
    var el;
    if (native) {
      el = document.createElement('ch5-button');
      el.setAttribute('label', '');
      el.setAttribute('customClass', 'scene-btn');
      el.classList.add('slats-btn', 'slats-' + kind);   // classes sur l'HÔTE seulement (customClass est recopié sur l'élément interne : il dédoublerait l'icône)
      el.setAttribute('customStyle', 'width: 72px; height: 44px; margin: 0;');
      el.setAttribute('sendEventOnClick', String(join));
      el.setAttribute('data-join', String(join));
      el.setAttribute('aria-label', labelFor(kind));
    } else {
      el = document.createElement('button');
      el.type = 'button';
      el.className = 'shade-btn-mobile slats-btn slats-' + kind;
      el.setAttribute('data-join', String(join));
      el.setAttribute('aria-label', labelFor(kind));
      el.onclick = function () { if (typeof window.pressDigital === 'function') window.pressDigital(join); };
    }
    return el;   // l'icône est dessinée par CSS (::after + mask SVG, slats-controls.css)
  }
  // Repère le groupe Monter/Stop/Descendre du moteur i : par son join (80 + i*3 - 2) quand il est
  // visible dans le DOM (dalle : sendEventOnClick), sinon par l'ordre des lignes (iPhone : les
  // <button> portent leur onclick en propriété, pas en attribut ; la i-ème ligne est le moteur i).
  function motorGroup(container, i) {
    var up = 80 + i * 3 - 2;
    var btn = container.querySelector('ch5-button[sendEventOnClick="' + up + '"], ch5-button[data-join="' + up + '"]');
    if (btn) return btn.parentElement;
    var rows = container.children;
    var row = rows[i - 1];
    if (!row) return null;
    var groups = row.querySelectorAll('div');
    for (var k = groups.length - 1; k >= 0; k--) {
      var g = groups[k];
      if (g.classList.contains('slats-row') || g.classList.contains('motor-btn-stack')) continue;
      var direct = 0;
      for (var c = 0; c < g.children.length; c++) if (/^(BUTTON|CH5-BUTTON)$/.test(g.children[c].tagName)) direct++;
      if (direct >= 3) return g;
    }
    return null;
  }
  function equip() {
    var container = document.getElementById('motors-container');
    if (!container) return;
    var roomId = currentRoomId();
    var native = !!container.querySelector('ch5-button[sendEventOnClick]');
    for (var i = 1; i <= MAX; i++) {
      var group = motorGroup(container, i);
      if (!group) continue;
      var stack = group.parentElement;
      var existing = stack.querySelector('.slats-row[data-motor="' + i + '"]');
      var wanted = slatsEnabled(roomId, i);
      var card = group.closest('.overlay-item-row') || group.closest('.motor-card') || stack;
      if (!wanted) { if (existing) existing.remove(); card.classList.remove('has-slats'); continue; }
      if (existing) continue;
      // Le groupe Up/Stop/Down et la rangée lamelles s'empilent dans une colonne : la ligne du moteur
      // garde son libellé à gauche, ses commandes à droite.
      if (!stack.classList.contains('motor-btn-stack')) {
        var wrap = document.createElement('div');
        wrap.className = 'motor-btn-stack';
        group.parentNode.insertBefore(wrap, group);
        wrap.appendChild(group);
        stack = wrap;
      }
      var row = document.createElement('div');
      row.className = 'slats-row';
      row.setAttribute('data-motor', String(i));
      var b = BASE + (i - 1) * 3;
      row.appendChild(makeButton('cw', b, native));
      row.appendChild(makeButton('stop', b + 1, native));
      row.appendChild(makeButton('ccw', b + 2, native));
      stack.appendChild(row);
      card.classList.add('has-slats');
    }
  }
  var queued = false;
  function schedule() { if (queued) return; queued = true; requestAnimationFrame(function () { queued = false; equip(); }); }
  function start() {
    equip();
    var box = document.getElementById('motors-container');
    if (box && window.MutationObserver) new MutationObserver(function (muts) {
      // Ne pas boucler sur nos propres insertions
      for (var k = 0; k < muts.length; k++) for (var n = 0; n < muts[k].addedNodes.length; n++) {
        var node = muts[k].addedNodes[n];
        if (node.nodeType === 1 && (node.classList.contains('slats-row') || node.classList.contains('motor-btn-stack'))) return;
      }
      schedule();
    }).observe(box, { childList: true, subtree: true });
    var sel = document.getElementById('room-select');
    if (sel) sel.addEventListener('change', schedule);
    window.addEventListener('villa-config-loaded', schedule);
    // Changement de pièce : la dalle ne régénère pas ses cartes (libellés mis à jour en place) —
    // on suit la pièce affichée et on rejoue dès qu'elle change.
    var lastRoom = currentRoomId();
    setInterval(function () { var r = currentRoomId(); if (r !== lastRoom) { lastRoom = r; equip(); } }, 400);
    window.villaSlatsRefresh = schedule;
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
