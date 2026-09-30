/*
 * La Réserve Genève — GUI (dalle, XPanel, iPad : index.html ; smartphone : iphone.html).
 *
 * Remplace les panneaux VT Pro Bar, Fitness et Lodge en reprenant exactement leurs commandes : sources (smart
 * object Icon List), pages de zones (Bar), Vol + / Vol − / Mute et niveau par zone, Distribute / Off par groupe,
 * extinction générale avec confirmation et « Please wait », bouton Exit. Tous les joins viennent de
 * reserve_config.json (espaces[].…) ; le GUI n'invente aucun état métier, il affiche les retours du CP3
 * (déploiement) ou de js/local-feedback.js (vitrine).
 *
 * Espace : ?espace=bar|fitness|lodge sinon meta.espace. Thème : choisi par le client dans Réglages (Lac, Nuit,
 * Spa), mémorisé sur l'appareil ; ?theme= le force. Aucune syntaxe récente (pas de ?. ni ??) : navigateur TSW.
 */
(function () {
  'use strict';
  var cfg = window.reserveConfig;
  var B = window.Bus;
  var ic = window.svgIcon;
  var isPhone = document.body.classList.contains('form-phone');
  var showcase = B.mode === 'showcase';
  var root = document.getElementById('app');
  var q = new URLSearchParams(location.search);
  var FULL = cfg.echelleAnalogique || 65535;

  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { void e; } return null; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function norm(s) { return String(s || '').toLowerCase().replace(/\s+/g, ' ').trim(); }

  // ------------------------------------------------------------------ espace
  var espId = q.get('espace') || cfg.meta.espace || 'bar';
  var E = null;
  cfg.espaces.forEach(function (e) { if (e.id === espId) E = e; });
  if (!E) E = cfg.espaces[0];
  var G = E.global;
  document.body.classList.add('espace-' + E.id);
  document.title = cfg.marque.nom + ' — ' + E.nom;

  // ------------------------------------------------------------------ échelle
  function scale() {
    var w = window.innerWidth, h = window.innerHeight;
    var u = isPhone ? Math.min(w / 440, h / 863) : Math.min(w / 1280, h / 800);
    document.documentElement.style.setProperty('--u', u.toFixed(4) + 'px');
  }
  scale();
  window.addEventListener('resize', function () { scale(); });

  // ------------------------------------------------------------------ thème (choix du client)
  var THEMES = cfg.themes.map(function (t) { return t.id; });
  function applyTheme(t) {
    if (THEMES.indexOf(t) < 0) t = cfg.meta.theme || THEMES[0];
    THEMES.forEach(function (x) { document.body.classList.toggle('theme-' + x, x === t); });
    document.body.setAttribute('data-theme', t);
    S.theme = t;
  }
  window.changeTheme = function (t) { applyTheme(t); store('reserve_theme', S.theme); render(); };

  // ------------------------------------------------------------------ état d'affichage
  var S = { view: 'home', page: 0, settings: false, localWait: 0, theme: '' };
  applyTheme(q.get('theme') || store('reserve_theme') || cfg.meta.theme);

  function b(j) { return !!B.get('b', j); }
  function n(j) { var v = B.get('n', j); return typeof v === 'number' ? v : 0; }
  function s(j) { var v = B.get('s', j); return v == null ? '' : String(v); }
  function pctOf(raw) { return Math.round(Math.max(0, Math.min(FULL, raw)) * 100 / FULL); }
  function currentSource() {
    var t = norm(s(G.sourceCourante));
    if (!t) return null;
    for (var i = 0; i < E.sources.length; i++) if (norm(E.sources[i].nom) === t) return E.sources[i];
    // Texte envoyé par le processeur resté à l'ancien libellé (ex. « iPod ») : sources[].aliasRetour.
    for (i = 0; i < E.sources.length; i++) if ((E.sources[i].aliasRetour || []).some(function (a) { return norm(a) === t; })) return E.sources[i];
    for (i = 0; i < E.sources.length; i++) if (t.indexOf(norm(E.sources[i].nom)) >= 0 || norm(E.sources[i].nom).indexOf(t) >= 0) return E.sources[i];
    return { nom: s(G.sourceCourante), icone: 'music', inconnue: true };
  }
  function page() { return E.pages[S.page] || E.pages[0]; }
  function allGroups() { var l = []; E.pages.forEach(function (p) { p.groupes.forEach(function (g) { l.push(g); }); }); return l; }
  function groupLabel(g) {
    if (g.zones.length === 1 && g.zones[0].nom === g.nom) return '';
    return g.nom;
  }

  // ------------------------------------------------------------------ gabarits
  function sourceBtn(x) {
    var cur = currentSource();
    var on = cur && !cur.inconnue && cur.id === x.id;
    return '<button class="src' + (on ? ' active' : '') + '" data-act="source" data-join="' + x.join + '" data-demo-source="stream" aria-pressed="' + (on ? 'true' : 'false') + '">' +
      '<span class="disc">' + ic(x.icone) + '</span><span class="nm">' + esc(x.nom) + '</span></button>';
  }
  function powerBtn() {
    return '<button class="src power-all" data-act="power" aria-label="Tout éteindre"><span class="disc">' + ic('power') + '</span><span class="nm">Tout éteindre</span></button>';
  }
  function espaceSeg() {
    if (!showcase) return '';
    return '<div class="seg" data-demo-ignore>' + cfg.espaces.map(function (e) {
      return '<button class="' + (e.id === E.id ? 'active' : '') + '" data-act="espace" data-id="' + e.id + '" aria-pressed="' + (e.id === E.id) + '">' + esc(e.nom) + '</button>';
    }).join('') + '</div>';
  }
  function pageSeg() {
    if (E.pages.length < 2) return '';
    return '<div class="seg page-tabs">' + E.pages.map(function (p, i) {
      return '<button class="tab' + (i === S.page ? ' active' : '') + '" data-act="page" data-i="' + i + '" aria-pressed="' + (i === S.page) + '">' + esc(p.nom) + '</button>';
    }).join('') + '</div>';
  }
  function header() {
    var center = S.view === 'home' ? (isPhone ? '' : espaceSeg()) : (isPhone ? '' : pageSeg());
    return '<header class="top"><div class="brand"><span class="wordmark">' + esc(cfg.marque.nom) + '</span><span class="place">' + esc(cfg.marque.lieu) + ' · ' + esc(E.nom) + '</span></div>' +
      (center ? '<div class="top-center">' + center + '</div>' : '') +
      '<div class="top-right"><button class="icon-btn settings" data-act="settings" aria-label="Réglages">' + ic('settings') + '</button></div></header>';
  }
  function liveList() {
    var l = allGroups().filter(function (g) { return g.retourSource && s(g.retourSource); });
    if (!l.length) return '';
    return '<div class="live-list">' + l.map(function (g) {
      return '<span class="live-chip"><span class="dot"></span><b>' + esc(g.nom) + '</b><span>' + esc(s(g.retourSource)) + '</span></span>';
    }).join('') + '</div>';
  }
  function home() {
    var h = '<div class="welcome"><div class="wordmark">' + esc(cfg.marque.nom) + '</div><div class="sig">' + esc(cfg.marque.signature) + ' · ' + esc(cfg.marque.lieu) + '</div>' +
      '<div class="rule"></div><p class="hint">' + esc(E.sousTitre) + ' — choisissez une source à diffuser</p>' + (isPhone ? '' : liveList()) + '</div>';
    if (isPhone) {
      h += (showcase ? '<div class="espace-seg">' + espaceSeg() + '</div>' : '') + liveList();
      h += '<div class="src-grid">' + E.sources.map(sourceBtn).join('') + powerBtn() + '</div>';
    }
    return h;
  }
  function zoneCard(z) {
    var p = pctOf(n(z.niveau)), m = b(z.muetRetour);
    var btn = function (cls, icon, lbl, join, hold) {
      return '<button class="vbtn ' + cls + (cls === 'mute' && m ? ' on' : '') + '" aria-label="' + lbl + ' ' + esc(z.nom) + '" ' + (hold ? 'data-hold="' + join + '"' : 'data-act="press" data-join="' + join + '"') +
        (cls === 'mute' ? ' aria-pressed="' + m + '" data-bind-mute="' + z.id + '"' : '') + '>' + ic(icon) + '</button>';
    };
    if (isPhone) {
      return '<div class="zrow' + (m ? ' muted' : '') + '" data-zone="' + z.id + '"><div class="zinfo"><div class="zname"><span>' + esc(z.nom) + '</span><em data-bind-pct="' + z.id + '">' + (m ? 'Muet' : p + ' %') + '</em></div>' +
        '<div class="hmeter"><i data-bind-fill="' + z.id + '" style="width:' + p + '%"></i></div></div>' +
        btn('minus', 'minus', 'Baisser', z.volMoins, true) + btn('mute', m ? 'mute' : 'volume', 'Muet', z.muet) + btn('plus', 'plus', 'Monter', z.volPlus, true) + '</div>';
    }
    return '<div class="zone' + (m ? ' muted' : '') + '" data-zone="' + z.id + '"><div class="zname">' + esc(z.nom) + '</div>' +
      '<div class="zbody"><div class="meter"><div class="fill" data-bind-fill="' + z.id + '" style="height:' + p + '%"></div></div>' +
      '<div class="zbtns">' + btn('plus', 'plus', 'Monter', z.volPlus, true) + btn('mute', m ? 'mute' : 'volume', 'Muet', z.muet) + btn('minus', 'minus', 'Baisser', z.volMoins, true) + '</div></div>' +
      '<div class="zlvl" data-bind-pct="' + z.id + '">' + (m ? 'Muet' : p + ' <small>%</small>') + '</div></div>';
  }
  function gstate(g) {
    var src = g.retourSource ? s(g.retourSource) : '';
    var lbl = groupLabel(g);
    if (!g.diffuser) return '<div class="gstate">Niveau seul</div>';
    return '<div class="gstate" data-bind-gsrc="' + g.id + '"><span class="dot"></span>' + (lbl ? '<span class="gname">' + esc(lbl) + '</span>' : '') + (src ? esc(src) : 'Arrêté') + '</div>';
  }
  function gbtns(g) {
    if (!g.diffuser) return '';
    var cur = currentSource();
    var dl = isPhone ? 'Diffuser' : 'Diffuser';
    return '<button class="gbtn dist' + (cur ? '' : ' disabled') + '" data-act="press" data-join="' + g.diffuser + '" aria-label="Diffuser vers ' + esc(g.nom) + '">' + ic('broadcast') + dl + '</button>' +
      '<button class="gbtn off" data-act="press" data-join="' + g.arret + '" aria-label="Arrêter ' + esc(g.nom) + '">' + ic('stop') + 'Arrêt</button>';
  }
  function group(g) {
    var live = g.retourSource && s(g.retourSource);
    var cls = 'group' + (live ? ' live' : '');
    if (isPhone) {
      return '<section class="' + cls + '" data-group="' + g.id + '"><div class="ghead">' + gstate(g) + gbtns(g) + '</div>' + g.zones.map(zoneCard).join('') + '</section>';
    }
    var foot = g.diffuser ? '<div class="group-foot">' + gstate(g) + '<div class="gbtns">' + gbtns(g) + '</div></div>'
      : '<div class="group-foot empty">' + gstate(g) + '</div>';
    return '<section class="' + cls + '" data-group="' + g.id + '" style="flex:' + g.zones.length + ' 1 0">' +
      '<div class="zone-row">' + g.zones.map(zoneCard).join('') + '</div>' + foot + '</section>';
  }
  function zones() {
    var cur = currentSource();
    var h = '<div class="zones-head"><div class="now' + (cur ? '' : ' none') + '"><span class="src-disc">' + ic(cur ? cur.icone : 'music') + '</span><span><span class="lbl">Source sélectionnée</span><b>' +
      esc(cur ? cur.nom : 'Aucune') + '</b></span></div><button class="close-btn" data-act="close" aria-label="Fermer">' + ic('x') + 'Fermer</button></div>';
    if (isPhone && E.pages.length > 1) h += '<div class="page-seg">' + pageSeg() + '</div>';
    h += '<div class="groups">' + page().groupes.map(group).join('') + '</div>';
    return h;
  }
  function dock() {
    if (isPhone) return '';
    return '<nav class="dock"><div class="dock-inner">' + E.sources.map(sourceBtn).join('') + '<span class="dock-sep"></span>' + powerBtn() + '</div></nav>';
  }
  function settings() {
    var cards = cfg.themes.map(function (t) {
      var a = t.apercu, on = t.id === S.theme;
      return '<button class="theme-card' + (on ? ' active' : '') + '" data-act="theme" data-t="' + t.id + '" aria-pressed="' + on + '">' +
        '<span class="swatch"><i class="w" style="background:' + a.fond + '"><span class="mini" style="color:' + a.texte + '">Aa</span></i><i style="background:' + a.surface + '"></i><i style="background:' + a.accent + '"></i></span>' +
        '<span class="tx"><span class="tn">' + esc(t.nom) + (on ? ic('check') : '') + '</span><span class="td" style="display:block">' + esc(t.description) + '</span></span></button>';
    }).join('');
    return '<div class="veil" data-act="veil"><div class="dialog settings" role="dialog" aria-label="Réglages"><div class="head"><h2>Réglages</h2>' +
      '<button class="icon-btn" data-act="settings-close" aria-label="Fermer les réglages">' + ic('x') + '</button></div>' +
      '<div class="sec-title">Apparence</div><div class="theme-cards">' + cards + '</div>' +
      (showcase ? '<div class="sec-title">Espace</div>' + espaceSeg() : '') +
      '<div class="about">GUI ' + esc(cfg.meta.version) + ' · ' + esc(E.nom) + ' · IP-ID ' + esc(E.simpl.ipid) + ' · ' + esc(E.simpl.programme) + '</div></div></div>';
  }
  function confirmDlg() {
    return '<div class="veil"><div class="dialog" role="alertdialog" aria-label="Tout éteindre"><div class="big-ic">' + ic('power') + '</div><h2>Tout éteindre ?</h2>' +
      '<p>Toutes les zones de l\'espace ' + esc(E.nom) + ' seront arrêtées.</p><div class="actions">' +
      '<button class="btn-ghost" data-act="press-cancel" data-join="' + G.annuler + '">Annuler</button>' +
      '<button class="btn-danger shutdown" data-act="press-off" data-join="' + G.eteindre + '">Éteindre</button></div></div></div>';
  }
  function busyDlg() {
    var p = G.occupe ? pctOf(n(G.occupeProgression)) : -1;
    return '<div class="veil"><div class="dialog" role="alertdialog" aria-label="Veuillez patienter"><div class="spinner"></div><h2>Veuillez patienter</h2><p>Extinction de l\'espace ' + esc(E.nom) + ' en cours.</p>' +
      (p >= 0 ? '<div class="progress"><i data-bind-busy style="width:' + p + '%"></i></div><div class="pct" data-bind-busypct>' + p + ' %</div>' : '') + '</div></div>';
  }
  function busy() { return (G.occupe && b(G.occupe)) || S.localWait > Date.now(); }

  // ------------------------------------------------------------------ rendu
  var pending = false;
  function render() {
    pending = false;
    var h = '<div class="app view-' + S.view + '">' + header() + '<main class="stage">' + (S.view === 'home' ? home() : zones()) + '</main>' + dock();
    if (busy()) h += busyDlg();
    else if (b(G.confirmationRetour) || S.confirm) h += confirmDlg();
    else if (S.settings) h += settings();
    h += '</div>';
    root.innerHTML = h;
  }
  function schedule() { if (!pending) { pending = true; (window.requestAnimationFrame || setTimeout)(render); } }

  // Mises à jour ciblées pour les niveaux (rampes à 120 ms) : pas de rendu complet sous le doigt.
  var levelJoins = {}, muteJoins = {};
  allGroups().forEach(function (g) { g.zones.forEach(function (z) { levelJoins[z.niveau] = z; muteJoins[z.muetRetour] = z; }); });
  function patchLevel(z) {
    var p = pctOf(n(z.niveau)), m = b(z.muetRetour);
    var f = root.querySelector('[data-bind-fill="' + z.id + '"]');
    var t = root.querySelector('[data-bind-pct="' + z.id + '"]');
    if (!f || !t) return false;
    if (isPhone) f.style.width = p + '%'; else f.style.height = p + '%';
    if (!m) t.innerHTML = isPhone ? p + ' %' : p + ' <small>%</small>';
    return true;
  }
  B.onAny = function (t, j) {
    if (t === 'n' && levelJoins[j]) { if (!patchLevel(levelJoins[j])) schedule(); return; }
    if (t === 'n' && j === G.occupeProgression) {
      var bar = root.querySelector('[data-bind-busy]'), pc = root.querySelector('[data-bind-busypct]');
      if (bar && pc) { var p = pctOf(n(j)); bar.style.width = p + '%'; pc.textContent = p + ' %'; return; }
    }
    if (t === 'b' && E.pages.length > 1) E.pages.forEach(function (pg, i) { if (j === pg.retour && b(j) && S.page !== i) S.page = i; });
    schedule();
  };

  // ------------------------------------------------------------------ commandes
  var held = [], lastHold = { j: 0, t: 0 };
  function release() { held.forEach(function (x) { B.set(x.j, false); if (x.el) x.el.classList.remove('held'); }); held = []; }
  root.addEventListener('pointerdown', function (ev) {
    var el = ev.target.closest ? ev.target.closest('[data-hold]') : null;
    if (!el) return;
    var j = +el.getAttribute('data-hold');
    el.classList.add('held');
    held.push({ j: j, el: el });
    lastHold = { j: j, t: Date.now() };
    B.set(j, true);
  });
  ['pointerup', 'pointercancel', 'blur'].forEach(function (ev) { window.addEventListener(ev, release); });
  root.addEventListener('pointerleave', release);

  root.addEventListener('click', function (ev) {
    var el = ev.target.closest ? ev.target.closest('[data-act], [data-hold]') : null;
    if (!el) return;
    if (el.hasAttribute('data-hold')) {
      // Clic sans appui préalable (clavier, démo automatique) : une impulsion = un pas.
      var hj = +el.getAttribute('data-hold');
      if (!(lastHold.j === hj && Date.now() - lastHold.t < 1500)) B.press(hj);
      lastHold = { j: 0, t: 0 };
      return;
    }
    var a = el.getAttribute('data-act'), j = +el.getAttribute('data-join');
    switch (a) {
      case 'source':
        B.press(j); S.view = 'zones'; break;
      case 'press': B.press(j); break;
      case 'power':
        B.press(G.arretGeneralDemande.join); S.confirm = true; break;
      case 'press-cancel': B.press(j); S.confirm = false; break;
      case 'press-off':
        B.press(j); S.confirm = false;
        if (!G.occupe && G.attenteLocaleMs) { S.localWait = Date.now() + G.attenteLocaleMs; setTimeout(render, G.attenteLocaleMs + 50); }
        S.view = 'home'; break;
      case 'close': B.press(G.fermer); S.view = 'home'; break;
      case 'page':
        S.page = +el.getAttribute('data-i');
        if (page().bouton) B.press(page().bouton);
        break;
      case 'settings': S.settings = true; break;
      case 'settings-close': S.settings = false; break;
      case 'veil': if (ev.target === el) S.settings = false; break;
      case 'theme': window.changeTheme(el.getAttribute('data-t')); return;
      case 'espace':
        var u = new URLSearchParams(location.search); u.set('espace', el.getAttribute('data-id'));
        location.search = u.toString(); return;
      default: return;
    }
    render();
  });

  // Confirmation : fermée par le retour du processeur quand il existe.
  B.on('b', G.confirmationRetour, function (v) { if (!v) S.confirm = false; schedule(); });

  // ------------------------------------------------------------------ démarrage
  if (showcase && window.LocalFeedback) window.LocalFeedback.init(E);
  var subs = [G.sourceCourante];
  allGroups().forEach(function (g) { if (g.retourSource) subs.push(g.retourSource); });
  subs.forEach(function (j) { B.on('s', j, schedule); });
  allGroups().forEach(function (g) { g.zones.forEach(function (z) { B.on('n', z.niveau, function () {}); B.on('b', z.muetRetour, function () {}); }); });
  E.pages.forEach(function (p) { if (p.retour) B.on('b', p.retour, function () {}); });
  if (G.occupe) { B.on('b', G.occupe, schedule); B.on('n', G.occupeProgression, function () {}); }
  if (q.get('view') === 'zones') S.view = 'zones';
  render();

  window.Reserve = {
    ready: true, config: cfg, espace: E, state: S, render: render,
    go: function (v) { S.view = v; S.settings = false; S.confirm = false; render(); },
    setPage: function (i) { S.page = i; render(); }
  };
})();
