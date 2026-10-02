/* Fenêtre Moteurs (v5.3, 29.09.2026) — composant partagé dalle / iPad / XPanel (index.html,
   <ch5-button>) et iPhone (iphone.html, <button> + pressDigital). Remplace slats-controls.js (v5.0-5.2).

   Config : pieces[].pilotages.moteurs = { actif, nombre (1..12), liste[12] { nom, type, lamelles } }.
   Carte d'un moteur :  [nom, centré verticalement, aligné à gauche] | [icône moteur animée] ▲ ■ ▼
                                                                     | [icône lamelles animée] ↻ ■ ↺   (si lamelles)
   Joins (contrat.signauxGlobaux) — impulsions sans état routées par a10 sur la pièce affichée :
     Monter/Stop/Descendre   moteurs 1..6 : 81-98   (81 + 3(i-1) + k)   moteurs 7..12 : 129-146
     Horaire/Stop/Antihoraire moteurs 1..6 : 111-128 (111 + 3(i-1) + k) moteurs 7..12 : 157-174
   Aucun défilement : les cartes sont réparties en pages (6 au plus, moins si la hauteur ne le
   permet pas) ; flèches ‹ › et indicateur dans l'en-tête de la fenêtre, masqués sur une seule page.
   Les icônes des moteurs gardent les identifiants historiques (blind-slats-<i>, curtain-left-<i>,
   curtain-right-<i>) : animateBlind et VUX (scènes) de la dalle continuent de les piloter. */
(function () {
  'use strict';
  var MAX = 12, PER_PAGE = 6, MOVE_MS = 1500, TILT_MAX = 45;
  var NS = 'http://www.w3.org/2000/svg';
  var MOBILE = !!document.getElementById('motors-presets');   // fenêtre Moteurs de l'iPhone
  var COLORS = {
    volet:  { stroke: '#00b4c5', fill: 'rgba(0, 180, 197, 0.45)' },
    rideau: { stroke: '#38bdf8', fill: 'rgba(56, 189, 248, 0.6)' },
    store:  { stroke: '#a7f3d0', fill: 'rgba(167, 243, 208, 0.5)' }
  };
  var T = {
    fr: { cw: 'Lamelles sens horaire', stop: 'Arrêt lamelles', ccw: 'Lamelles sens antihoraire', up: 'Monter', mstop: 'Arrêt', down: 'Descendre', open: 'Ouvrir', close: 'Fermer', prev: 'Moteurs précédents', next: 'Moteurs suivants' },
    en: { cw: 'Slats clockwise', stop: 'Stop slats', ccw: 'Slats anticlockwise', up: 'Up', mstop: 'Stop', down: 'Down', open: 'Open', close: 'Close', prev: 'Previous motors', next: 'Next motors' },
    de: { cw: 'Lamellen im Uhrzeigersinn', stop: 'Lamellen Stopp', ccw: 'Lamellen gegen den Uhrzeigersinn', up: 'Auf', mstop: 'Stopp', down: 'Ab', open: 'Öffnen', close: 'Schließen', prev: 'Vorherige Motoren', next: 'Nächste Motoren' },
    es: { cw: 'Lamas sentido horario', stop: 'Parar lamas', ccw: 'Lamas sentido antihorario', up: 'Subir', mstop: 'Parar', down: 'Bajar', open: 'Abrir', close: 'Cerrar', prev: 'Motores anteriores', next: 'Motores siguientes' },
    ru: { cw: 'Ламели по часовой', stop: 'Стоп ламели', ccw: 'Ламели против часовой', up: 'Вверх', mstop: 'Стоп', down: 'Вниз', open: 'Открыть', close: 'Закрыть', prev: 'Предыдущие моторы', next: 'Следующие моторы' }
  };

  // ---------- Données ----------
  function config() { return window.villaConfig || window.villaConfigEmbedded; }
  function lang() {
    try { if (typeof currentLang !== 'undefined' && currentLang) return String(currentLang); } catch (e) { }
    try { return localStorage.getItem(MOBILE ? 'crestron_lang_iphone' : 'crestron_lang') || 'fr'; } catch (e) { return 'fr'; }
  }
  function dict() { return T[lang().slice(0, 2).toLowerCase()] || T.fr; }
  // Pièce affichée : celle que la GUI vient d'appliquer (updateActiveRoomUI iPhone / changeRoomUI dalle),
  // puis le sélecteur de pièce, puis la pièce 1.
  function currentRoomId() {
    try {
      if (MOBILE) { var m = Number(localStorage.getItem('active_room_iphone')); if (m) return m; }
      else if (window.currentActiveRoomId) return Number(window.currentActiveRoomId);
    } catch (e) { }
    var sel = document.getElementById('room-select');
    if (sel && sel.value) return Number(sel.value);
    try { return Number(localStorage.getItem('active_room_id')) || 1; } catch (e) { return 1; }
  }
  function kindOf(item) {
    var t = String((item && item.type) || '').toLowerCase();
    if (t === 'volet' || t === 'rideau' || t === 'store') return t;
    var n = String((item && item.nom) || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    return /rideau|curtain|vorhang|cortina/.test(n) ? 'rideau' : /store|blind|jalousie/.test(n) ? 'store' : 'volet';
  }
  function tName(n) { return typeof window.villaTranslateName === 'function' ? window.villaTranslateName(n) : n; }
  // Moteurs affichés pour une pièce : les `nombre` premiers de la liste (12 au plus).
  function motorsOf(roomId) {
    var c = config(); if (!c || !c.pieces) return [];
    var p = c.pieces.find(function (x) { return x.id === roomId; });
    var m = p && p.pilotages && p.pilotages.moteurs;
    if (!m || m.actif === false) return [];
    var defs = (c.valeursParDefaut && c.valeursParDefaut.moteurs) || [];
    var liste = m.liste || defs;
    var n = Math.max(0, Math.min(MAX, Number(m.nombre) || liste.length || 6));
    var out = [];
    for (var i = 0; i < n; i++) {
      var it = liste[i] || defs[i] || { nom: 'Moteur ' + (i + 1) };
      out.push({ i: i + 1, nom: tName(it.nom || ('Moteur ' + (i + 1))), type: kindOf(it), lamelles: it.lamelles === true });
    }
    return out;
  }
  function moveJoin(i, k) { return i <= 6 ? 81 + (i - 1) * 3 + k : 129 + (i - 7) * 3 + k; }
  function slatsJoin(i, k) { return i <= 6 ? 111 + (i - 1) * 3 + k : 157 + (i - 7) * 3 + k; }
  window.villaMotorType = function (i) {
    var m = motorsOf(currentRoomId())[i - 1]; return m ? m.type : (i === 3 || i === 4 ? 'rideau' : 'volet');
  };

  // ---------- Icône du moteur (même dessin que les icônes historiques de la dalle) ----------
  function el(tag, attrs) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); return e; }
  function motorIcon(m) {
    var col = COLORS[m.type];
    var svg = el('svg', { viewBox: '0 0 24 24', class: 'mc-icon', 'aria-hidden': 'true', 'data-kind': m.type });
    var defs = el('defs'), clip = el('clipPath', { id: 'mc-clip-' + m.i });
    clip.appendChild(el('rect', { x: 4, y: 4, width: 16, height: 16, rx: 1 })); defs.appendChild(clip); svg.appendChild(defs);
    svg.appendChild(el('rect', { x: 3, y: 3, width: 18, height: 18, rx: 2, fill: 'none', stroke: col.stroke, 'stroke-width': 1.5, class: 'mc-stroke' }));
    var g = el('g', { 'clip-path': 'url(#mc-clip-' + m.i + ')' });
    if (m.type === 'rideau') {
      svg.appendChild(el('line', { x1: 3, y1: 5, x2: 21, y2: 5, stroke: col.stroke, 'stroke-width': 1.5, class: 'mc-stroke' }));
      g.appendChild(el('rect', { id: 'curtain-left-' + m.i, x: 4, y: 5, width: 4, height: 15, fill: col.fill, class: 'mc-fill', style: 'transition: width 1.5s ease-in-out;' }));
      g.appendChild(el('line', { x1: 6, y1: 5, x2: 6, y2: 20, stroke: 'rgba(255,255,255,0.3)', 'stroke-width': 0.7 }));
      g.appendChild(el('rect', { id: 'curtain-right-' + m.i, x: 16, y: 5, width: 4, height: 15, fill: col.fill, class: 'mc-fill', style: 'transition: width 1.5s ease-in-out, x 1.5s ease-in-out;' }));
      g.appendChild(el('line', { x1: 18, y1: 5, x2: 18, y2: 20, stroke: 'rgba(255,255,255,0.3)', 'stroke-width': 0.7 }));
    } else {
      g.appendChild(el('rect', { id: 'blind-slats-' + m.i, x: 4, y: 4, width: 16, height: 16, fill: col.fill, class: 'mc-fill', style: 'transition: height 1.5s ease-in-out; height: 8px;' }));
      [7, 10, 13, 16, 19].forEach(function (y) { g.appendChild(el('line', { x1: 4, y1: y, x2: 20, y2: y, stroke: 'rgba(255,255,255,0.2)', 'stroke-width': 0.7 })); });
    }
    svg.appendChild(g);
    return svg;
  }
  // Position 0 = ouvert, 1 = fermé ; même mécanique que window.animateBlind de la dalle.
  function setMotor(i, dir) {
    var type = window.villaMotorType(i);
    var svg = document.querySelector('#motors-container .mc-card[data-motor="' + i + '"] .mc-icon');
    if (type === 'rideau') {
      var l = document.getElementById('curtain-left-' + i), r = document.getElementById('curtain-right-' + i);
      if (!l || !r) return;
      if (dir === 'stop') {
        var wl = getComputedStyle(l).width, wr = parseFloat(getComputedStyle(r).width) || 4;
        l.style.transition = r.style.transition = 'none'; l.style.width = wl; r.style.width = wr + 'px'; r.setAttribute('x', String(20 - wr));
      } else {
        var w = dir === 'up' || dir === 'open' ? 0.5 : dir === 'half' ? 4 : 8;
        l.style.transition = 'width 1.5s ease-in-out'; r.style.transition = 'width 1.5s ease-in-out, x 1.5s ease-in-out';
        l.style.width = w + 'px'; r.style.width = w + 'px'; r.setAttribute('x', String(20 - w));
      }
    } else {
      var s = document.getElementById('blind-slats-' + i); if (!s) return;
      if (dir === 'stop') { var h = getComputedStyle(s).height; s.style.transition = 'none'; s.style.height = h; void s.getBoundingClientRect(); s.style.transition = 'height 1.5s ease-in-out'; }
      else { s.style.transition = 'height 1.5s ease-in-out'; s.style.height = (dir === 'up' || dir === 'open' ? 0 : dir === 'half' ? 8 : 16) + 'px'; }
    }
    if (svg) { svg.classList.toggle('mc-moving', dir !== 'stop'); clearTimeout(svg._mv); if (dir !== 'stop') svg._mv = setTimeout(function () { svg.classList.remove('mc-moving'); }, MOVE_MS); }
  }

  // ---------- Icône lamelles animée (3 variantes, cf. planche v5.3 ; A recommandée) ----------
  //  A « profil »       : cinq lames vues de côté qui pivotent autour de leur axe (sens horaire / antihoraire).
  //  B « face »         : lames de face qui s'ouvrent et se ferment, arête claire du côté où elles basculent.
  //  C « profil + sens » : A, avec une flèche circulaire qui tourne dans le sens de la commande.
  var VARIANT = (window.VILLA_SLATS_ICON || 'A').toUpperCase();
  var LAMES_FACE = [6.5, 9.25, 12, 14.75, 17.5], LAMES_PROFIL = [7.2, 10.4, 13.6, 16.8];
  var LAMES = VARIANT === 'B' ? LAMES_FACE : LAMES_PROFIL;
  function slatsIcon(m) {
    var col = COLORS[m.type] || COLORS.volet;
    var svg = el('svg', { viewBox: '0 0 24 24', class: 'mc-icon mc-slats-icon', 'aria-hidden': 'true', 'data-variant': VARIANT });
    svg.appendChild(el('rect', { x: 3, y: 3, width: 18, height: 18, rx: 2, fill: 'none', stroke: col.stroke, 'stroke-width': 1.5, class: 'mc-stroke' }));
    if (VARIANT !== 'B') svg.appendChild(el('line', { x1: 12, y1: 4.5, x2: 12, y2: 19.5, stroke: col.stroke, 'stroke-opacity': 0.45, 'stroke-width': 0.6, class: 'mc-cord mc-stroke' }));
    LAMES.forEach(function (y) {
      if (VARIANT === 'B') {
        svg.appendChild(el('rect', { x: 5, y: y - 1.2, width: 14, height: 2.4, rx: 0.4, fill: col.fill, class: 'mc-lame mc-fill' }));
        svg.appendChild(el('line', { class: 'mc-edge mc-stroke', x1: 5, y1: y, x2: 19, y2: y, stroke: col.stroke, 'stroke-width': 0.7, opacity: 0 }));
      } else {
        svg.appendChild(el('rect', { class: 'mc-lame mc-solid', x: 8.6, y: y - 0.75, width: 6.8, height: 1.5, rx: 0.75, fill: col.stroke }));
      }
    });
    if (VARIANT === 'C') {
      var arr = el('g', { class: 'mc-turn', opacity: 0 });
      arr.appendChild(el('path', { d: 'M19.2 7.2 A8.2 8.2 0 1 1 12 3.8', fill: 'none', stroke: col.stroke, 'stroke-width': 1.1, 'stroke-linecap': 'round', class: 'mc-stroke' }));
      arr.appendChild(el('path', { d: 'M12 2.2 L14.4 3.8 L12 5.4 Z', fill: col.stroke, class: 'mc-solid' }));
      svg.appendChild(arr);
    }
    svg._angle = 0;
    renderSlats(svg, 0, 0);
    return svg;
  }
  function renderSlats(svg, a, spin) {
    [].forEach.call(svg.querySelectorAll('.mc-lame'), function (r, k) {
      var y = LAMES[k];
      if (VARIANT === 'B') {
        var h = 0.5 + 2.2 * Math.min(1, Math.abs(a) / TILT_MAX);
        r.setAttribute('y', (y - h / 2).toFixed(2)); r.setAttribute('height', h.toFixed(2));
        var e = svg.querySelectorAll('.mc-edge')[k];
        if (e) { e.setAttribute('y1', (a > 0 ? y - h / 2 : y + h / 2).toFixed(2)); e.setAttribute('y2', e.getAttribute('y1')); e.setAttribute('opacity', Math.min(0.9, Math.abs(a) / 40).toFixed(2)); }
      } else {
        r.setAttribute('transform', 'rotate(' + a.toFixed(1) + ' 12 ' + y + ')');
      }
    });
    var t = svg.querySelector('.mc-turn');
    if (t) { t.setAttribute('opacity', spin ? '0.9' : '0'); t.setAttribute('transform', 'rotate(' + ((spin || 0) * a * 3).toFixed(1) + ' 12 12)' + (spin < 0 ? ' scale(-1 1) translate(-24 0)' : '')); }
  }
  function tilt(svg, dir) {
    if (!svg) return;
    cancelAnimationFrame(svg._raf);
    if (dir === 'stop') { svg.classList.remove('mc-moving'); renderSlats(svg, svg._angle, 0); return; }
    var from = svg._angle, to = dir === 'cw' ? TILT_MAX : -TILT_MAX, spin = dir === 'cw' ? 1 : -1;
    var dur = MOVE_MS * Math.abs(to - from) / (2 * TILT_MAX) || 1, t0 = performance.now();
    svg.classList.add('mc-moving');
    (function step(now) {
      var k = Math.min(1, (now - t0) / dur), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      svg._angle = from + (to - from) * e;
      renderSlats(svg, svg._angle, k < 1 ? spin : 0);
      if (k < 1) svg._raf = requestAnimationFrame(step); else svg.classList.remove('mc-moving');
    })(t0);
  }

  // ---------- Boutons ----------
  function button(opts) {
    var b;
    if (!MOBILE) {
      b = document.createElement('ch5-button');
      b.setAttribute('label', opts.label || '');
      b.setAttribute('customClass', 'scene-btn' + (opts.extraClass ? ' ' + opts.extraClass : ''));
      b.setAttribute('customStyle', 'width: 72px; height: 54px; margin: 0; font-size: 0.85rem; font-weight: bold;');
      b.setAttribute('sendEventOnClick', String(opts.join));      // posé AVANT l'insertion : CH5 le fige à l'init
      b.setAttribute('data-join', String(opts.join));
      b.addEventListener('click', opts.onPress);
    } else {
      b = document.createElement('button');
      b.type = 'button';
      b.className = 'shade-btn-mobile';
      b.textContent = opts.label || '';
      b.setAttribute('data-join', String(opts.join));
      b.addEventListener('click', function () { if (typeof window.pressDigital === 'function') window.pressDigital(opts.join); opts.onPress(); });
    }
    (opts.hostClass || []).forEach(function (c) { b.classList.add(c); });
    b.setAttribute('aria-label', opts.aria);
    return b;
  }
  function card(m) {
    var d = dict();
    var c = document.createElement('div');
    c.className = 'mc-card'; c.setAttribute('data-motor', String(m.i)); c.setAttribute('data-type', m.type);
    var name = document.createElement('span'); name.className = 'mc-name'; name.textContent = m.nom; c.appendChild(name);
    var ctr = document.createElement('div'); ctr.className = 'mc-controls';
    var row = document.createElement('div'); row.className = 'mc-row mc-move';
    row.appendChild(motorIcon(m));
    var cur = m.type === 'rideau';
    [['up', '▲', cur ? 'open' : 'up'], ['stop', '■', 'mstop'], ['down', '▼', cur ? 'close' : 'down']].forEach(function (x, k) {
      var hc = ['mc-btn'];
      if (cur && k === 0) hc.push('curtain-open'); if (cur && k === 2) hc.push('curtain-close');
      row.appendChild(button({ join: moveJoin(m.i, k), label: (cur && k !== 1) ? '' : x[1], aria: d[x[2]], hostClass: hc,
        extraClass: cur && k === 0 ? 'btn-curtain-open' : cur && k === 2 ? 'btn-curtain-close' : '',
        onPress: function () { if (!MOBILE && typeof window.animateBlind === 'function') window.animateBlind(m.i, x[0]); else setMotor(m.i, x[0]); } }));
    });
    ctr.appendChild(row);
    if (m.lamelles) {
      var sr = document.createElement('div'); sr.className = 'mc-row mc-slats';
      var si = slatsIcon(m); sr.appendChild(si);
      [['cw', 'slats-cw'], ['stop', 'slats-stop'], ['ccw', 'slats-ccw']].forEach(function (x, k) {
        sr.appendChild(button({ join: slatsJoin(m.i, k), label: '', aria: d[x[0]], hostClass: ['mc-btn', 'slats-btn', x[1]],
          onPress: function () { tilt(si, x[0]); } }));
      });
      ctr.appendChild(sr);
    }
    c.appendChild(ctr);
    return c;
  }

  // ---------- Pagination sans défilement ----------
  var state = { room: null, lang: null, sig: '', page: 0, pages: [[]] };
  function pager() {
    var p = document.getElementById('mc-pager');
    if (p) return p;
    var overlay = document.getElementById('motors-overlay');
    // Dalle / iPad : dans l'en-tête, avant « Fermer ». iPhone : rangée centrée au-dessus des presets
    // (l'en-tête est trop étroit, le titre passerait sur trois lignes).
    var anchor = MOBILE ? document.getElementById('motors-presets') : (overlay && overlay.querySelector('button[onclick*="closeMotorsModal"]'));
    if (!anchor) return null;
    p = document.createElement('div'); p.id = 'mc-pager'; p.className = 'mc-pager';
    p.innerHTML = '<button type="button" class="mc-prev"></button><span class="mc-page">1/1</span><button type="button" class="mc-next"></button>';
    p.querySelector('.mc-prev').addEventListener('click', function () { go(state.page - 1); });
    p.querySelector('.mc-next').addEventListener('click', function () { go(state.page + 1); });
    anchor.parentNode.insertBefore(p, anchor);
    return p;
  }
  function cards() { return [].slice.call(document.querySelectorAll('#motors-container > .mc-card')); }
  function fits(box) { return box.scrollHeight <= box.clientHeight + 1 && box.scrollWidth <= box.clientWidth + 1; }
  // Découpe gloutonne : on remplit une page tant que tout tient dans la hauteur visible du conteneur.
  function paginate() {
    var box = document.getElementById('motors-container'); if (!box) return;
    var all = cards();
    if (!box.clientHeight) { state.pages = [all.map(function (_, k) { return k; })]; show(); return; }
    var pages = [], cur = [];
    all.forEach(function (c) { c.hidden = true; });
    for (var k = 0; k < all.length; k++) {
      all[k].hidden = false;
      if (cur.length && (cur.length >= PER_PAGE || !fits(box))) {
        all[k].hidden = true; cur.forEach(function (j) { all[j].hidden = true; });
        pages.push(cur); cur = []; all[k].hidden = false;
      }
      cur.push(k);
    }
    pages.push(cur);
    state.pages = pages;
    if (state.page > pages.length - 1) state.page = pages.length - 1;
    show();
  }
  function show() {
    var all = cards(), pg = state.pages[state.page] || [];
    all.forEach(function (c, k) { c.hidden = pg.indexOf(k) < 0; });
    var p = pager(); if (!p) return;
    var n = state.pages.length, d = dict();
    p.classList.toggle('actif', n > 1);
    p.querySelector('.mc-prev').disabled = state.page <= 0;
    p.querySelector('.mc-next').disabled = state.page >= n - 1;
    p.querySelector('.mc-prev').setAttribute('aria-label', d.prev);
    p.querySelector('.mc-next').setAttribute('aria-label', d.next);
    p.querySelector('.mc-page').textContent = (state.page + 1) + '/' + n;
  }
  function go(n) { state.page = Math.max(0, Math.min(state.pages.length - 1, n)); show(); }
  var layoutTimer = null;
  function relayout() {
    clearTimeout(layoutTimer);
    requestAnimationFrame(paginate);
    layoutTimer = setTimeout(paginate, 350);          // <ch5-button> se dessine après l'insertion
  }

  // ---------- Rendu ----------
  // v6.0.6 : la fenêtre Moteurs n'est reconstruite que lorsqu'elle est visible. Avant, chaque changement de
  // pièce recréait les 12 cartes (<ch5-button>) fenêtre fermée : ~160 ms sur PC, près d'une seconde sur une TSW,
  // c'était l'essentiel du délai ressenti à la sélection d'une pièce. Fenêtre fermée : on note seulement « à refaire ».
  function overlayVisible() {
    var o = document.getElementById('motors-overlay');
    return !!(o && o.offsetWidth > 0 && o.offsetHeight > 0);
  }
  function render(force) {
    var box = document.getElementById('motors-container'); if (!box) return;
    if (!overlayVisible()) { state.dirty = true; state.dirtyForce = state.dirtyForce || !!force; return; }
    if (state.dirty) { force = force || state.dirtyForce; state.dirty = false; state.dirtyForce = false; }
    var roomId = currentRoomId(), list = motorsOf(roomId);
    var sig = roomId + '|' + lang() + '|' + JSON.stringify(list);
    if (!force && sig === state.sig && cards().length === list.length) return;
    var sameRoom = state.room === roomId;
    state.sig = sig; state.room = roomId; state.lang = lang();
    if (!sameRoom) state.page = 0;
    box.innerHTML = '';
    box.classList.add('mc-grid'); box.classList.toggle('mc-mobile', MOBILE);
    list.forEach(function (m) { box.appendChild(card(m)); });
    relayout();
  }
  window.VillaMotors = {
    render: function () { render(true); },
    relayout: relayout,
    motors: function () { return motorsOf(currentRoomId()); },
    moveJoin: moveJoin, slatsJoin: slatsJoin,
    animate: setMotor,
    // Commandes groupées (Tout ouvrir / Demi-ouverture / Tout fermer) : anime les moteurs du type.
    animateType: function (type, dir) {
      motorsOf(currentRoomId()).forEach(function (m) { if (m.type === type) setMotor(m.i, dir === 'open' ? 'up' : dir === 'close' ? 'down' : dir); });
    },
    page: function () { return { page: state.page, pages: state.pages.length }; },
    go: go
  };

  function start() {
    var overlay = document.getElementById('motors-overlay');
    if (overlay) overlay.classList.add(MOBILE ? 'mc-phone' : 'mc-large');   // pas de :has() (navigateur des TSW)
    render(true);
    if (overlay && window.MutationObserver) new MutationObserver(function () {
      if (!overlayVisible()) return;
      if (state.dirty) render(false); else relayout();   // render() relance relayout()
    }).observe(overlay, { attributes: true, attributeFilter: ['style', 'class'] });
    window.addEventListener('resize', relayout);
    window.addEventListener('villa-config-loaded', function () { render(true); });
    var sel = document.getElementById('room-select');
    if (sel) sel.addEventListener('change', function () { render(false); });
    // Pièce ou langue changée par un autre chemin (menu des pièces, QR, applyLanguage) : on suit.
    setInterval(function () { if (currentRoomId() !== state.room || lang() !== state.lang) render(false); }, 400);
    document.addEventListener('click', function (e) { if (e.target && e.target.closest && e.target.closest('[onclick*="changeTheme"], #theme-select')) relayout(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
