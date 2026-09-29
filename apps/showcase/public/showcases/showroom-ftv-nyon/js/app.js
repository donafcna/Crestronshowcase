/*
 * Showroom FTV Nyon — GUI (dalle TSW-1070, XPanel, iPad : index.html ; iPhone : iphone.html).
 *
 * Reproduit l'interface Crestron Home de la tablette d'entrée du showroom : accueil « Fréquence TV »,
 * page Rooms (filtres d'étage, favoris), pièce (Actions, Services), feuilles Lights, Music (lecteur,
 * Parcourir, minuterie), Select Music, Apple TV, Video, Cameras, Manage.
 *
 * Tout vient de showroom_config.js (window.showroomConfig) : pièces, photos, actions, circuits, services,
 * joins. Commandes et retours passent par js/bus.js (Bus.press / Bus.analog / Bus.on). Le GUI n'invente
 * aucun état : il affiche ce que renvoient les joins (C# en déploiement, js/local-feedback.js en vitrine).
 * Aucune syntaxe récente (pas de ?. ni ??) : navigateur des dalles TSW.
 */
(function () {
  'use strict';
  var cfg = window.showroomConfig;
  var B = window.Bus;
  var J = function (name, n) { return window.Joins.of(name, n); };
  var ic = window.svgIcon;
  var isPhone = document.body.classList.contains('form-phone');
  var app = document.getElementById('app');
  var rooms = cfg.pieces || [];
  var services = (cfg.musique && cfg.musique.services) || [];
  var favs = (cfg.musique && cfg.musique.favoris) || [];
  var vsources = (cfg.video && cfg.video.sources) || [];

  // ------------------------------------------------------------------ utilitaires
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  // url('...') : apostrophes simples (la valeur est placée dans un attribut style="...") ; résolue par rapport au HTML.
  function url(p) { return p ? "url('" + String(p).replace(/['"()\s]/g, function (c) { return encodeURIComponent(c); }) + "')" : 'none'; }
  function b(name, n) { return !!B.get('b', J(name, n)); }
  function n(name, i) { var v = B.get('n', J(name, i)); return typeof v === 'number' ? v : 0; }
  function s(name) { var v = B.get('s', J(name)); return v == null ? '' : String(v); }
  function room(id) { for (var i = 0; i < rooms.length; i++) if (rooms[i].id === id) return rooms[i]; return null; }
  function svc(id) { for (var i = 0; i < services.length; i++) if (services[i].id === id) return services[i]; return null; }
  function hasAudio(r) { return !!(r && r.pilotages.audio && r.pilotages.audio.actif); }
  function hasVideo(r) { return !!(r && r.pilotages.video && r.pilotages.video.actif); }
  function mmss(t) { t = Math.max(0, t | 0); return Math.floor(t / 60) + ':' + ('0' + (t % 60)).slice(-2); }
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { void e; return null; } return null; }

  // ------------------------------------------------------------------ état d'affichage (jamais d'état métier)
  var S = {
    view: 'home', roomId: rooms.length ? rooms[0].id : 1, filter: 'all', closed: {},
    sheet: null, tab: 'now', sub: null, menu: false, confirm: false, toast: '', dragging: false
  };
  var favSet = {};
  (function () {
    var saved = store('showroom_favs');
    if (saved) { try { JSON.parse(saved).forEach(function (id) { favSet[id] = true; }); return; } catch (e) { void e; /* défaut */ } }
    rooms.forEach(function (r) { if (r.favori) favSet[r.id] = true; });
  })();

  // ------------------------------------------------------------------ échelle et thème
  function scale() {
    var w = window.innerWidth, h = window.innerHeight;
    var u = isPhone ? Math.min(w / 440, h / 863) : Math.min(w / 1280, h / 800);
    document.documentElement.style.setProperty('--u', u.toFixed(4) + 'px');
  }
  var THEMES = ['dark', 'light', 'glass'];
  function applyTheme(t) {
    if (THEMES.indexOf(t) < 0) t = 'dark';
    THEMES.forEach(function (x) { document.body.classList.toggle('theme-' + x, x === t); });
    document.body.dataset.theme = t;
    store('showroom_theme', t);
  }
  window.changeTheme = function (t) { applyTheme(t); render(); };

  // ------------------------------------------------------------------ textes d'état
  function roomLightsOn(r) { return b('Room_{n}_LightsOn', r.id); }
  function roomMediaOn(r) { return b('Room_{n}_MediaOn', r.id); }
  function activeSvcName(r) {
    if (r.id !== S.roomId) return 'Media';
    var sv = svc(n('Music_Service#'));
    if (sv) return sv.nom;
    var vs = s('Video_Source_Name$');
    return vs || 'Media';
  }
  function roomStatus(r) {
    var l = roomLightsOn(r), m = roomMediaOn(r);
    if (l && m) return 'Lights are on. ' + activeSvcName(r) + ' is on.';
    if (l) return 'Lights are on.';
    if (m) return activeSvcName(r) + ' is on.';
    return 'All is off.';
  }

  // ------------------------------------------------------------------ fragments
  function topbar(back) {
    var d = new Date();
    return '<div class="topbar">' +
      (back ? '<button class="round-btn" data-act="back" aria-label="Back">' + ic('arrow-left') + '</button>' : '') +
      '<div class="time-pill" id="clock">' + d.getHours() + ':' + ('0' + d.getMinutes()).slice(-2) + '</div>' +
      '<div class="spacer"></div>' +
      '<button class="round-btn" data-act="menu" aria-label="More">' + ic('ellipsis') + '</button></div>';
  }
  function tile(act, label, icon, color, extra) {
    return '<button class="tile" ' + act + ' style="--ic:' + esc(color || 'var(--text)') + '">' +
      '<span class="ti">' + ic(icon) + '</span><span class="tl">' + esc(label) + '</span>' + (extra || '') + '</button>';
  }

  function pageHome() {
    var h = cfg.maison;
    var html = '<div class="page-home"><div class="hero" style="background-image:' + url(h.photo) + '"></div>' + topbar(false) +
      '<div class="title-block"><h1>' + esc(h.nom) + '</h1></div><div class="content">';
    if (h.actions && h.actions.length) {
      html += '<h2 class="section-title">Actions</h2><div class="tiles">';
      h.actions.forEach(function (a, i) {
        html += tile('data-act="house-action" data-i="' + (i + 1) + '" data-pulse="' + J('House_Action_{n}', i + 1) + '"', a.nom, a.icone, a.couleur);
      });
      html += '</div>';
    }
    html += '<h2 class="section-title">Controls</h2><div class="tiles">';
    (h.controles || []).forEach(function (c) {
      if (c === 'lights') {
        var cnt = n('House_LightsOnCount#'), on = b('House_LightsOn');
        html += '<button class="tile svc" data-act="sheet" data-sheet="house-lights" data-demo-action="lights" style="--ic:' + (on ? 'var(--lamp)' : 'var(--text)') + '"><span class="ti">' + ic(on ? 'lightbulb' : 'lightbulb-off') + '</span><span><span class="tl">Lights</span><span class="ts" style="display:block">' + (on ? cnt + ' ON' : 'OFF') + '</span></span></button>';
      } else if (c === 'music') {
        var pl = b('House_MusicPlaying');
        html += '<button class="tile svc" data-act="home-music" style="--ic:#fb7185"><span class="ti">' + ic('music') + '</span><span><span class="tl">Music</span><span class="ts" style="display:block">' + (pl ? 'PLAYING' : 'NOT PLAYING') + '</span></span></button>';
      } else if (c === 'cameras') {
        html += '<button class="tile svc" data-act="sheet" data-sheet="cameras" style="--ic:#fb923c"><span class="ti">' + ic('video') + '</span><span><span class="tl">Cameras</span></span></button>';
      }
    });
    return html + '</div></div></div>';
  }

  function pageRoom() {
    var r = room(S.roomId);
    if (!r) return pageHome();
    var html = '<div class="page-room"><div class="hero" style="background-image:' + url(r.photo) + '"></div>' + topbar(true) +
      '<div class="title-block"><h1>' + esc(r.nom) + '</h1><div class="sub">' + esc(roomStatus(r)) + '</div></div><div class="content">';
    if (r.actions && r.actions.length) {
      html += '<h2 class="section-title">Actions</h2><div class="tiles">';
      r.actions.forEach(function (a, i) {
        html += tile('data-act="room-action" data-i="' + (i + 1) + '" data-pulse="' + J('Room_Action_{n}', i + 1) + '"', a.nom, a.icone, a.couleur);
      });
      html += '</div>';
    }
    html += '<h2 class="section-title">Services</h2><div class="tiles">';
    (r.services || []).forEach(function (sv) {
      if (sv === 'lights') {
        var on = roomLightsOn(r);
        html += '<div class="tile svc lights-tile" data-act="sheet" data-sheet="lights" role="button" tabindex="0" data-demo-action="lights"><span class="tl">Lights</span>' +
          '<span class="lt-btns"><button class="circle-btn" data-act="press" data-join="' + J('Lights_AllOff') + '" aria-label="All lights off">' + ic('lightbulb-off') + '</button>' +
          '<button class="circle-btn' + (on ? ' on' : '') + '" data-act="press" data-join="' + J('Lights_AllOn') + '" aria-label="All lights on">' + ic('lightbulb') + '</button></span></div>';
      } else if (sv === 'music') {
        var svId = n('Music_Service#'), sd = svc(svId), cover = s('Music_Cover$');
        var on2 = svId > 0;
        html += '<button class="tile svc' + (on2 && cover ? ' media-on' : '') + '" data-act="music" data-demo-action="av"' + (on2 && cover ? ' style="background-image:' + url(cover) + '"' : ' style="--ic:#fb7185"') + '>' +
          '<span class="ti">' + ic(on2 ? 'audio-lines' : 'music') + '</span><span><span class="tl">Music</span><span class="ts" style="display:block">' + (on2 && sd ? esc(sd.nom) + ' ON' : 'OFF') + '</span></span></button>';
      } else if (sv === 'video') {
        var vsrc = n('Video_Source#');
        html += '<button class="tile svc" data-act="sheet" data-sheet="video"><span class="ti">' + ic(vsrc ? 'tv' : 'monitor-off') + '</span><span class="corner">' + ic('arrow-right') + '</span>' +
          '<span><span class="tl">Video</span><span class="ts" style="display:block">' + (vsrc ? esc(s('Video_Source_Name$')) : 'OFF') + '</span></span></button>';
      }
    });
    return html + '</div></div></div>';
  }

  function pageRooms() {
    var floors = cfg.etages || [];
    var html = '<div class="page-rooms"><div class="page-title">Rooms</div><div class="chips">' +
      '<button class="chip' + (S.filter === 'all' ? ' active' : '') + '" data-act="filter" data-f="all">All</button>' +
      '<button class="chip' + (S.filter === 'fav' ? ' active' : '') + '" data-act="filter" data-f="fav">Favorites</button>';
    floors.forEach(function (f) { html += '<button class="chip' + (S.filter === f.id ? ' active' : '') + '" data-act="filter" data-f="' + esc(f.id) + '">' + esc(f.nom) + '</button>'; });
    html += '</div>';
    var list = rooms.filter(function (r) { return S.filter === 'all' || (S.filter === 'fav' ? favSet[r.id] : r.etage === S.filter); });
    if (!list.length) {
      return html + '<div class="empty"><img src="img/empty-favorites.svg" alt=""><h3>No favorites added</h3><p>You haven\'t marked any room as a favorite yet.</p></div></div>';
    }
    html += '<div class="rooms-scroll">';
    floors.forEach(function (f) {
      var fl = list.filter(function (r) { return r.etage === f.id; });
      if (!fl.length) return;
      var closed = !!S.closed[f.id];
      html += '<button class="floor-head' + (closed ? ' closed' : '') + '" data-act="fold" data-f="' + esc(f.id) + '">' + esc(f.nom) + ic('chevron-up') + '</button>';
      if (closed) return;
      html += '<div class="room-grid">';
      fl.forEach(function (r) {
        html += '<button class="room-card" data-act="room" data-id="' + r.id + '" data-demo-room="' + r.id + '" data-demo-av="' + (hasAudio(r) || hasVideo(r)) + '" style="background-image:' + url(r.photo) + '" aria-label="' + esc(r.nom) + '">' +
          (roomLightsOn(r) ? '<span class="rb">' + ic('lightbulb') + '</span>' : '') +
          (favSet[r.id] ? '<span class="rf">' + ic('heart') + '</span>' : '') +
          '<span class="rn">' + esc(r.nom) + '</span></button>';
      });
      html += '</div>';
    });
    return html + '</div></div>';
  }

  // ------------------------------------------------------------------ barre du bas
  function bar() {
    var html = '<div class="bar">' +
      '<button class="nav-btn' + (S.view === 'home' ? ' active' : '') + '" data-act="go" data-v="home">' + ic('house') + '<span class="lbl">Home</span></button>' +
      '<button class="nav-btn' + (S.view === 'rooms' ? ' active' : '') + '" data-act="go" data-v="rooms" data-demo-action="rooms">' + ic('layout-grid') + '<span class="lbl">Rooms</span></button><div class="bar-center">';
    var mr = n('House_MediaRoom#'), np = s('Music_NowPlaying$');
    if (mr && np) html += '<button class="np-chip" data-act="np" data-id="' + mr + '">' + ic('chevron-up') + '<span class="np-t">' + esc(np) + '</span><span class="eq">' + ic('audio-lines') + '</span></button>';
    var r = S.view === 'room' ? room(S.roomId) : null;
    if (r && (hasAudio(r) || hasVideo(r)) && roomMediaOn(r)) {
      var vj = hasAudio(r) && n('Music_Service#') ? J('Music_Volume#') : J('Video_Volume#');
      var vv = B.get('n', vj) || 0;
      html += '<div class="vol-row">' + ic('volume-2') + '<input class="slider" type="range" min="0" max="100" value="' + vv + '" data-slider="' + vj + '" data-demo-action="volume" aria-label="Volume" style="--p:' + vv + '%"></div>';
    } else if (!(mr && np && isPhone)) {
      html += '<button class="pill-btn" data-act="media-room"' + (r && !(hasAudio(r) || hasVideo(r)) ? ' aria-disabled="true"' : '') + '>Turn on this media room</button>';
    }
    html += '</div><button class="power-btn" data-act="power" aria-label="Power" data-demo-action="' + (S.view === 'room' ? 'av-off' : '') + '">' + ic('power') + '</button></div>';
    return html;
  }

  // ------------------------------------------------------------------ feuilles
  function head(title, sub, opts) {
    opts = opts || {};
    var html = '<div class="sheet-head"><span class="grab"></span>';
    if (opts.back) html += '<button class="icon-btn" data-act="' + opts.back + '" aria-label="Back">' + ic('arrow-left') + '</button>';
    if (opts.closeLeft) html += '<button class="icon-btn close" data-act="close" aria-label="Close" data-demo-action="close">' + ic('x') + '</button>';
    html += '<div class="sheet-title"><b>' + esc(title) + '</b>' + (sub ? '<small>' + esc(sub) + '</small>' : '') + '</div>';
    if (opts.center) html += '<div class="center">' + opts.center + '</div>';
    html += '<div class="right">' + (opts.right || '') + (opts.closeLeft || opts.noClose ? '' : '<button class="icon-btn close" data-act="close" aria-label="Close" data-demo-action="close">' + ic('x') + '</button>') + '</div></div>';
    return html;
  }

  function sheetLights() {
    var r = room(S.roomId), L = r.pilotages.eclairages;
    var center = '<button class="seg-btn" data-act="press" data-join="' + J('Lights_AllOff') + '" aria-label="All off">' + ic('lightbulb-off') + '</button>' +
      '<button class="seg-btn' + (roomLightsOn(r) ? ' on' : '') + '" data-act="press" data-join="' + J('Lights_AllOn') + '" aria-label="All on">' + ic('lightbulb') + '</button>';
    var html = head('Lights', r.nom, { center: center }) + '<div class="sheet-body' + (isPhone ? ' scroll' : '') + '">';
    if (L.scenes.length) {
      html += '<div class="sub-title">Scenes</div><div class="scene-row">';
      L.scenes.forEach(function (sc, i) {
        var on = b('Light_Scene_{n}', i + 1);
        html += '<button class="scene-btn' + (on ? ' on' : '') + '" data-act="press" data-join="' + J('Light_Scene_{n}', i + 1) + '" data-preset aria-pressed="' + on + '" style="--ic:' + esc(sc.couleur || 'var(--lamp)') + '">' + ic(sc.icone || 'lightbulb') + '<span>' + esc(sc.nom) + '</span></button>';
      });
      html += '</div>';
    }
    html += '<div class="sub-title">All Lights</div><div class="alllights"><button data-act="press" data-join="' + J('Lights_DimDown') + '" aria-label="Dim down">' + ic('minus') + '</button><button data-act="press" data-join="' + J('Lights_DimUp') + '" aria-label="Dim up">' + ic('plus') + '</button></div>';
    var cols = L.circuits.length > 12 ? 4 : L.circuits.length > 6 ? 3 : 2;
    html += '<div class="circuits" data-cols="' + cols + '" id="circuits-container">';
    L.circuits.forEach(function (c, i) {
      var raw = n('Light_{n}_Level#', i + 1), pct = Math.round(raw * 100 / 65535), on = b('Light_{n}_Toggle', i + 1);
      html += '<div class="circuit"><div class="ch"><span class="cn">' + esc(c.nom) + '</span><span class="cv" data-cv="' + (i + 1) + '">' + (pct > 0 ? pct + '%' : 'Off') + '</span>' +
        '<button class="switch' + (on ? ' on' : '') + '" data-act="press" data-join="' + J('Light_{n}_Toggle', i + 1) + '" role="switch" aria-checked="' + on + '" aria-label="' + esc(c.nom) + '"></button></div>' +
        '<input class="slider" type="range" min="0" max="100" value="' + pct + '" data-slider="' + J('Light_{n}_Level#', i + 1) + '" data-scale="65535" data-cvi="' + (i + 1) + '" aria-label="' + esc(c.nom) + ' level" style="--p:' + pct + '%"></div>';
    });
    return html + '</div></div>';
  }

  function sheetHouseLights() {
    var html = head('Lights', cfg.maison.nom, { center: '<button class="seg-btn" data-act="press" data-join="' + J('House_Lights_AllOff') + '" aria-label="All off">' + ic('lightbulb-off') + '</button>' }) + '<div class="sheet-body"><div class="manage">';
    (cfg.etages || []).forEach(function (f) {
      var list = rooms.filter(function (r) { return r.etage === f.id && r.pilotages.eclairages.actif; });
      if (!list.length) return;
      html += '<div class="group-cap">' + esc(f.nom) + '</div><div class="group">';
      list.forEach(function (r) {
        var on = roomLightsOn(r);
        html += '<div class="list-item">' + ic(on ? 'lightbulb' : 'lightbulb-off') + '<span style="flex:1">' + esc(r.nom) + '</span>' +
          '<button class="seg-btn" data-act="room-lights" data-id="' + r.id + '" data-on="0" aria-label="' + esc(r.nom) + ' off">' + ic('lightbulb-off') + '</button>' +
          '<button class="seg-btn' + (on ? ' on' : '') + '" data-act="room-lights" data-id="' + r.id + '" data-on="1" aria-label="' + esc(r.nom) + ' on">' + ic('lightbulb') + '</button></div>';
      });
      html += '</div>';
    });
    return html + '</div></div>';
  }

  function sheetSelectMusic() {
    var r = room(S.roomId), allowed = (r.pilotages.audio.services || []);
    var html = head('Select Music', r.nom, { closeLeft: true }) + '<div class="sheet-body"><div class="sub-title">Services</div><div class="svc-row">';
    services.filter(function (x) { return allowed.indexOf(x.id) >= 0; }).forEach(function (x) {
      var on = b('Music_Service_{n}', x.id);
      html += '<button class="svc-btn' + (on ? ' on' : '') + '" data-act="svc" data-i="' + x.id + '" data-demo-source="' + (x.type === 'remote' ? 'apple' : 'stream') + '"><span class="disc">' + ic(x.type === 'remote' ? 'tv' : 'audio-lines') + '</span>' + esc(x.nom) + '</button>';
    });
    html += '</div>';
    var fl = favs.filter(function (f) { return allowed.indexOf(f.service) >= 0; });
    if (fl.length) {
      html += '<div class="sub-title">Favorites</div><div class="fav-row">';
      fl.forEach(function (f) {
        var on = b('Music_Fav_{n}', f.id), sv = svc(f.service);
        html += '<button class="fav-card' + (on ? ' on' : '') + '" data-act="fav" data-i="' + f.id + '"><span class="fc" style="background-image:' + url(f.pochette) + '"></span><span><b>' + esc(f.nom) + '</b><small>' + esc(sv ? sv.nom : '') + '</small></span></button>';
      });
      html += '</div>';
    }
    return html + '</div>';
  }

  function sheetPlayer() {
    var r = room(S.roomId), sv = svc(n('Music_Service#'));
    if (!sv) return sheetSelectMusic();
    if (sv.type === 'remote') return sheetRemote(sv.nom, r.nom, J('Music_Off'), J('Music_Volume#'));
    var right = '<span class="acct">' + ic('user-round') + '<span class="lbl">' + esc(sv.compte || '') + '</span></span>' +
      '<button class="icon-btn' + (b('Music_SleepTimer_Toggle') ? ' on' : '') + '" data-act="tab" data-t="settings" aria-label="Sleep timer">' + ic('moon') + '</button>' +
      '<button class="icon-btn" data-act="music-off" aria-label="Music off">' + ic('power') + '</button>';
    var html = '<div class="sheet-body" style="padding:0">';
    if (S.tab === 'browse') {
      html += '<div class="browse"><h4>' + esc(sv.nom.toUpperCase()) + '</h4><div class="search"><span>' + ic('search') + '</span></div>';
      (sv.parcourir || []).forEach(function (it, i) {
        html += '<button class="list-item" data-act="browse" data-i="' + (i + 1) + '">' + ic(['sparkles', 'chart-no-axes-column', 'disc-3', 'list-music', 'music', 'heart'][i % 6]) + esc(it) + '<span class="chev">' + ic('chevron-right') + '</span></button>';
      });
      html += '</div>';
    } else if (S.tab === 'settings') {
      var on = b('Music_SleepTimer_Toggle'), mins = n('Music_SleepTimer#');
      html += '<div class="settings-2col"><div><div class="group"><div class="list-item">' + ic('volume-2') + 'Speaker settings</div><div class="list-item">' + ic('settings') + 'Advanced settings</div></div></div>' +
        '<div><p class="hint">Set up the power off sleep timer for all active media in this room.</p><div class="row-toggle">Sleep timer<button class="switch' + (on ? ' on' : '') + '" data-act="press" data-join="' + J('Music_SleepTimer_Toggle') + '" role="switch" aria-checked="' + on + '" aria-label="Sleep timer"></button></div>' +
        '<div class="big-time">' + ('0' + Math.floor(mins / 60)).slice(-2) + ':' + ('0' + (mins % 60)).slice(-2) + '</div><div class="caption">Set the time</div>' +
        '<div class="stepper"><button class="icon-btn" data-act="sleep" data-d="-15" aria-label="Minus 15 minutes">' + ic('minus') + '</button><button class="icon-btn" data-act="sleep" data-d="15" aria-label="Plus 15 minutes">' + ic('plus') + '</button></div></div></div>';
    } else {
      var pos = n('Music_Position#'), dur = n('Music_Duration#'), playing = b('Music_PlayPause');
      html += '<div class="player-main"><div class="cover" style="background-image:' + url(s('Music_Cover$')) + '"></div><div class="meta">' +
        '<div class="ar">' + esc(s('Music_Artist$')) + '</div><div class="tt">' + esc(s('Music_Title$')) + '</div><div class="al">' + esc(s('Music_Album$')) + '</div>' +
        '<div class="progress"><span id="pg-pos">' + mmss(pos) + '</span><span class="track"><i id="pg-bar" style="width:' + (dur ? Math.min(100, pos * 100 / dur) : 0) + '%"></i></span><span id="pg-dur">' + mmss(dur) + '</span></div>' +
        '<div class="transport">' +
        tbtn('Music_Prev', 'skip-back', 'Previous') + tbtn('Music_Rewind', 'rewind', 'Back 15 s') +
        '<button class="t-btn play" data-act="press" data-join="' + J('Music_PlayPause') + '" data-action="play" aria-pressed="' + playing + '" aria-label="Play / Pause">' + ic(playing ? 'pause' : 'play') + '</button>' +
        tbtn('Music_Forward', 'fast-forward', 'Forward 15 s') + tbtn('Music_Next', 'skip-forward', 'Next') + '</div>' +
        '<div class="transport" style="margin-top:calc(var(--u)*6)">' + tbtn('Music_Dislike', 'thumbs-down', 'Dislike', true) + tbtn('Music_Repeat', 'repeat', 'Repeat', true) +
        tbtn('Music_Shuffle', 'shuffle', 'Shuffle', true) + tbtn('Music_Like', 'heart', 'Like', true) + '</div></div></div>';
    }
    html += playerBar(J('Music_Volume#'));
    return head(sv.nom, r.nom, { right: right }) + html + '</div>';
  }
  function tbtn(name, icon, label, state) {
    var on = state && b(name);
    return '<button class="t-btn' + (on ? ' on' : '') + '" data-act="press" data-join="' + J(name) + '" aria-label="' + label + '"' + (state ? ' aria-pressed="' + on + '"' : '') + '>' + ic(icon) + '</button>';
  }
  function playerBar(volJoin) {
    var v = B.get('n', volJoin) || 0;
    return '<div class="player-bar"><button class="icon-btn pw" data-act="music-off" aria-label="Music off" data-demo-action="av-off">' + ic('power') + '</button>' +
      '<button class="icon-btn' + (S.tab === 'browse' ? ' sel' : '') + '" data-act="tab" data-t="browse" aria-label="Browse">' + ic('list-music') + '</button>' +
      '<button class="icon-btn' + (S.tab === 'now' ? ' sel' : '') + '" data-act="tab" data-t="now" aria-label="Now playing">' + ic('music-2') + '</button>' +
      '<button class="icon-btn' + (S.tab === 'settings' ? ' sel' : '') + '" data-act="tab" data-t="settings" aria-label="Settings">' + ic('settings') + '</button>' +
      '<div class="vol-row">' + ic('volume-2') + '<input class="slider" type="range" min="0" max="100" value="' + v + '" data-slider="' + volJoin + '" data-demo-action="volume" aria-label="Volume" style="--p:' + v + '%"></div></div>';
  }

  function remoteBody() {
    var K = (cfg.video && cfg.video.telecommande) || [];
    var k = function (i, cls, inner) { return '<button class="' + cls + '" data-act="press" data-join="' + J('Video_Remote_{n}', i) + '" aria-label="' + esc(K[i - 1] || '') + '">' + inner + '</button>'; };
    return '<div class="remote"><div class="remote-col">' + k(1, 'rem-key', 'Menu') + k(2, 'rem-key', ic('play') ) + k(3, 'rem-key', ic('tv')) + '</div>' +
      '<div class="dpad">' + k(4, 'up', ic('chevron-up')) + k(5, 'down', ic('chevron-down')) + k(6, 'left', ic('chevron-left')) + k(7, 'right', ic('chevron-right')) + k(8, 'ok', 'OK') + '</div></div>';
  }
  function sheetRemote(title, sub, offJoin, volJoin) {
    var v = B.get('n', volJoin) || 0;
    return head(title, sub, { right: '<button class="icon-btn" data-act="press-close" data-join="' + offJoin + '" aria-label="Power off">' + ic('power') + '</button>' }) +
      '<div class="sheet-body" style="padding-bottom:calc(var(--u)*90)">' + remoteBody() + '</div>' +
      '<div class="video-bottom"><button class="icon-btn pw" data-act="press-close" data-join="' + offJoin + '" aria-label="Power off" data-demo-action="av-off" style="color:var(--accent)">' + ic('power') + '</button>' +
      '<div class="vol-row">' + ic('volume-2') + '<input class="slider" type="range" min="0" max="100" value="' + v + '" data-slider="' + volJoin + '" data-demo-action="volume" aria-label="Volume" style="--p:' + v + '%"></div></div>';
  }

  function sheetVideo() {
    var r = room(S.roomId), ids = r.pilotages.video.sources || [];
    var v = n('Video_Volume#');
    var html = head('Video', r.nom, {}) + '<div class="sheet-body" style="padding-bottom:calc(var(--u)*90)"><div class="video-layout"><div><div class="sub-title">Sources</div><div class="svc-row">';
    vsources.filter(function (x) { return ids.indexOf(x.id) >= 0; }).forEach(function (x) {
      html += '<button class="src-card' + (b('Video_Source_{n}', x.id) ? ' on' : '') + '" data-act="press" data-join="' + J('Video_Source_{n}', x.id) + '" data-demo-source="apple">' + ic('tv') + esc(x.nom) + '</button>';
    });
    html += '</div></div><div>' + (n('Video_Source#') ? remoteBody() : '<p class="hint" style="text-align:center;margin-top:calc(var(--u)*120)">Select a source to turn on this media room.</p>') + '</div></div></div>';
    html += '<div class="video-bottom"><button class="icon-btn" data-act="press" data-join="' + J('Video_Off') + '" aria-label="Video off" data-demo-action="av-off" style="color:var(--accent)">' + ic('power') + '</button>' +
      '<div class="vol-row">' + ic('volume-2') + '<input class="slider" type="range" min="0" max="100" value="' + v + '" data-slider="' + J('Video_Volume#') + '" data-demo-action="volume" aria-label="Volume" style="--p:' + v + '%"></div></div>';
    return html;
  }

  function sheetCameras() {
    var cams = cfg.cameras || [];
    if (S.sub) {
      var c = cams[S.sub - 1] || {}, r = room(c.piece), flux = s('Camera_Url$');
      var d = new Date();
      return head((r ? r.nom + ' — ' : '') + (c.nom || ''), '', { back: 'cam-back' }) +
        '<div class="sheet-body"><div class="cam-view" style="background-image:' + url(flux || c.image) + '"><div class="osd"><i></i>LIVE · ' + d.toLocaleTimeString() + '</div></div></div>';
    }
    var floors = (cfg.etages || []).filter(function (f) { return cams.some(function (c) { return c.etage === f.id; }); });
    var html = head('Cameras', cfg.maison.nom, {}) + '<div class="sheet-body' + (isPhone ? ' scroll' : '') + '"><div class="chips" style="position:static;justify-content:flex-start;margin-bottom:calc(var(--u)*10)">' +
      '<button class="chip' + (S.camFilter ? '' : ' active') + '" data-act="cam-filter" data-f="">All</button>';
    floors.forEach(function (f) { html += '<button class="chip' + (S.camFilter === f.id ? ' active' : '') + '" data-act="cam-filter" data-f="' + esc(f.id) + '">' + esc(f.nom) + '</button>'; });
    html += '</div>';
    floors.forEach(function (f) {
      if (S.camFilter && S.camFilter !== f.id) return;
      html += '<div class="floor-head">' + esc(f.nom) + ic('chevron-up') + '</div><div class="room-grid">';
      cams.forEach(function (c, i) {
        if (c.etage !== f.id) return;
        html += '<button class="cam-card" data-act="cam" data-i="' + (i + 1) + '" style="background-image:' + url(c.image) + '"><b>' + esc(c.nom) + '</b>' + ic('heart') + '</button>';
      });
      html += '</div>';
    });
    return html + '</div>';
  }

  var MANAGE = [
    ['Settings', [['panel', 'monitor-smartphone', 'Panel Settings'], ['events', 'calendar-clock', 'Scheduled Events'], ['health', 'activity', 'Device Health'], ['tunable', 'sun-moon', 'Tunable Lighting']]],
    ['Support & Legal', [['help', 'circle-help', 'Help'], ['legal', 'scale', 'Legal Terms'], ['privacy', 'shield', 'Privacy']]]
  ];
  var INFO = {
    events: 'No scheduled event is programmed on this system. Time-based events are defined by Fréquence TV in the processor program.',
    tunable: 'Tunable white lighting is not installed in this showroom.',
    help: 'For assistance, contact Fréquence TV — service@frequence-tv.ch.',
    legal: 'Crestron and Crestron Home are trademarks of Crestron Electronics, Inc. Interface recreated by Fréquence TV for its Nyon showroom.',
    privacy: 'This panel stores no personal data. Theme and favourite rooms are kept on this device only.',
    actions: 'Actions of the house and of each room are defined in showroom_config.json (maison.actions, pieces[].actions) and applied by the processor program.'
  };
  function sheetManage() {
    var html;
    if (!S.sub) {
      html = head('Manage', cfg.maison.nom, {}) + '<div class="sheet-body"><div class="manage">';
      MANAGE.forEach(function (g) {
        html += '<div class="group-cap">' + esc(g[0]) + '</div><div class="group">';
        g[1].forEach(function (it) { html += '<button class="list-item" data-act="sub" data-s="' + it[0] + '">' + ic(it[1]) + esc(it[2]) + '<span class="chev">' + ic('chevron-right') + '</span></button>'; });
        html += '</div>';
      });
      return html + '<div class="version">Version — ' + esc(cfg.meta.version) + '</div></div></div>';
    }
    var titles = { panel: 'Panel Settings', events: 'Scheduled Events', health: 'Device Health', tunable: 'Tunable Lighting', help: 'Help', legal: 'Legal Terms', privacy: 'Privacy', actions: 'Edit Actions' };
    html = head(titles[S.sub] || '', cfg.maison.nom, { back: 'sub-back' }) + '<div class="sheet-body"><div class="manage">';
    if (S.sub === 'panel') {
      var t = document.body.dataset.theme;
      html += '<div class="group-cap">Theme</div><div class="theme-choice">' +
        [['dark', 'Dark'], ['light', 'Light'], ['glass', 'Frosted glass']].map(function (x) { return '<button class="' + (t === x[0] ? 'on' : '') + '" data-act="theme" data-t="' + x[0] + '">' + x[1] + '</button>'; }).join('') + '</div>' +
        '<div class="group-cap">About this panel</div><div class="group">' + kv('IP-ID', s('Systeme_IpId$') || window.crestronIpId || '—') + kv('Mode', cfg.meta.mode) + kv('GUI version', cfg.meta.version) + kv('Processor program', s('Systeme_CpzNom$') || '—') + kv('Compiled', s('Systeme_CpzDate$') || '—') + '</div>';
    } else if (S.sub === 'health') {
      var online = B.mode === 'showcase' ? 'Simulated (showcase)' : (window.isCp4Connected === false ? 'Offline' : 'Online');
      html += '<div class="group">' + kv('Processor', online) + kv('Rooms', String(rooms.length)) + kv('Lights on', String(n('House_LightsOnCount#'))) + kv('Cameras', String((cfg.cameras || []).length)) + '</div>';
    } else {
      html += '<p class="info-p">' + esc(INFO[S.sub] || '') + '</p>';
    }
    return html + '</div></div>';
  }
  function kv(k, v) { return '<div class="kv"><span>' + esc(k) + '</span><span>' + esc(v) + '</span></div>'; }

  function confirmBox() {
    return '<div class="sheet" style="background:rgba(0,0,0,.55);align-items:center;justify-content:center"><div class="dialog">' +
      '<div class="sub-title">Turn off everything?</div><p class="info-p">All lights and media of ' + esc(cfg.maison.nom) + ' will be turned off.</p>' +
      '<div class="theme-choice"><button data-act="confirm-no">Cancel</button><button class="on" data-act="confirm-yes">Turn off</button></div></div></div>';
  }

  // ------------------------------------------------------------------ rendu
  var raf = 0;
  function schedule() { if (raf) return; raf = requestAnimationFrame(function () { raf = 0; if (!S.dragging) render(); }); }
  function render() {
    var html = '<div class="view">' + (S.view === 'rooms' ? pageRooms() : S.view === 'room' ? pageRoom() : pageHome()) + '</div>' + bar();
    if (S.sheet) {
      var sh = S.sheet, cls = 'sheet';
      var inner = sh === 'lights' ? sheetLights() : sh === 'house-lights' ? sheetHouseLights() : sh === 'music' ? sheetPlayer() :
        sh === 'select' ? sheetSelectMusic() : sh === 'video' ? sheetVideo() : sh === 'cameras' ? sheetCameras() : sh === 'manage' ? sheetManage() : '';
      if (sh === 'music') cls += ' player';
      html += '<div class="' + cls + '" data-sheet-open="' + sh + '">' + inner + '</div>';
    }
    if (S.menu) html += '<div class="menu-veil" data-act="menu-close"></div><div class="menu-pop"><button class="list-item" data-act="edit-actions">' + ic('pencil') + 'Edit Actions</button><button class="list-item" data-act="settings">' + ic('settings') + 'Settings</button></div>';
    if (S.confirm) html += confirmBox();
    if (S.toast) html += '<div class="sheet" style="background:transparent;pointer-events:none;justify-content:flex-end;align-items:center;padding-bottom:calc(var(--u)*110)"><div class="acct" style="height:auto;padding:calc(var(--u)*12) calc(var(--u)*20)">' + esc(S.toast) + '</div></div>';
    app.innerHTML = html;
    var ph = S.view === 'room' && room(S.roomId) ? room(S.roomId).photo : cfg.maison.photo;
    var gl = document.getElementById('glass-bg');
    if (!gl) { gl = document.createElement('div'); gl.id = 'glass-bg'; document.body.insertBefore(gl, app); }
    gl.style.backgroundImage = url(ph);
  }

  // ------------------------------------------------------------------ actions
  function selectRoom(id) { B.press(J('Room_Select_{n}', id)); B.analog(J('Room_Select#'), id); }
  function openRoom(id) { S.roomId = id; S.view = 'room'; S.sheet = null; selectRoom(id); render(); }
  function flash(el) { if (!el) return; el.classList.add('flash'); setTimeout(function () { el.classList.remove('flash'); }, 700); }
  function toast(t) { S.toast = t; render(); setTimeout(function () { S.toast = ''; render(); }, 1800); }
  function openMusic() { S.tab = 'now'; S.sheet = n('Music_Service#') ? 'music' : 'select'; render(); }

  app.addEventListener('click', function (e) {
    var el = e.target.closest ? e.target.closest('[data-act]') : null;
    if (!el || !app.contains(el) || el.getAttribute('aria-disabled') === 'true' && el.dataset.act !== 'media-room') return;
    e.stopPropagation();
    var d = el.dataset, a = d.act;
    switch (a) {
      case 'go': S.view = d.v; S.sheet = null; render(); break;
      case 'back': S.view = 'rooms'; S.sheet = null; render(); break;
      case 'room': openRoom(+d.id); break;
      case 'filter': S.filter = d.f; render(); break;
      case 'fold': S.closed[d.f] = !S.closed[d.f]; render(); break;
      case 'house-action': B.press(J('House_Action_{n}', +d.i)); flash(el); break;
      case 'room-action': B.press(J('Room_Action_{n}', +d.i)); flash(el); break;
      case 'press': B.press(+d.join); break;
      case 'press-close': B.press(+d.join); S.sheet = null; render(); break;
      case 'sheet': S.sheet = d.sheet; S.sub = null; S.tab = 'now'; render(); break;
      case 'close': S.sheet = null; S.sub = null; render(); break;
      case 'music': openMusic(); break;
      case 'svc': B.press(J('Music_Service_{n}', +d.i)); S.sheet = 'music'; S.tab = 'now'; render(); break;
      case 'fav': B.press(J('Music_Fav_{n}', +d.i)); S.sheet = 'music'; S.tab = 'now'; render(); break;
      case 'music-off': B.press(J('Music_Off')); S.sheet = null; render(); break;
      case 'tab': S.tab = d.t; render(); break;
      case 'browse': B.press(J('Music_Browse_{n}', +d.i)); S.tab = 'now'; render(); break;
      case 'sleep': B.analog(J('Music_SleepTimer#'), Math.max(0, Math.min(120, n('Music_SleepTimer#') + (+d.d)))); break;
      case 'np': openRoom(+d.id); openMusic(); break;
      case 'home-music': var mr = n('House_MediaRoom#'); if (mr) { openRoom(mr); openMusic(); } else { S.view = 'rooms'; render(); } break;
      case 'media-room':
        if (S.view !== 'room') { S.view = 'rooms'; render(); break; }
        var r = room(S.roomId);
        if (hasAudio(r)) { S.sheet = 'select'; render(); } else if (hasVideo(r)) { S.sheet = 'video'; render(); } else toast('No media in this room');
        break;
      case 'power':
        if (S.view === 'room') B.press(J('Room_Off')); else { S.confirm = true; render(); }
        break;
      case 'confirm-yes': B.press(J('House_AllOff')); S.confirm = false; render(); break;
      case 'confirm-no': S.confirm = false; render(); break;
      case 'room-lights': selectRoom(+d.id); B.press(J(d.on === '1' ? 'Lights_AllOn' : 'Lights_AllOff')); if (S.view === 'room') selectRoom(S.roomId); break;
      case 'cam-filter': S.camFilter = d.f; render(); break;
      case 'cam': B.press(J('Camera_Select_{n}', +d.i)); S.sub = +d.i; render(); break;
      case 'cam-back': S.sub = null; render(); break;
      case 'menu': S.menu = true; render(); break;
      case 'menu-close': S.menu = false; render(); break;
      case 'settings': S.menu = false; S.sheet = 'manage'; S.sub = null; render(); break;
      case 'edit-actions': S.menu = false; S.sheet = 'manage'; S.sub = 'actions'; render(); break;
      case 'sub': S.sub = d.s; render(); break;
      case 'sub-back': S.sub = null; render(); break;
      case 'theme': window.changeTheme(d.t); break;
      default: break;
    }
  });
  // Appui long sur une carte de pièce : favori (mémorisé sur cet écran)
  var lpTimer = 0, lpFired = false;
  app.addEventListener('pointerdown', function (e) {
    var card = e.target.closest ? e.target.closest('.room-card') : null;
    if (e.target.classList && e.target.classList.contains('slider')) S.dragging = true;
    if (!card) return;
    lpFired = false;
    lpTimer = setTimeout(function () {
      lpFired = true;
      var id = +card.dataset.id;
      if (favSet[id]) delete favSet[id]; else favSet[id] = true;
      store('showroom_favs', JSON.stringify(Object.keys(favSet).map(Number)));
      render();
    }, 700);
  });
  function endPress() { clearTimeout(lpTimer); if (S.dragging) { S.dragging = false; schedule(); } }
  app.addEventListener('pointerup', endPress);
  app.addEventListener('pointercancel', endPress);
  app.addEventListener('click', function (e) { if (lpFired) { e.stopPropagation(); e.preventDefault(); lpFired = false; } }, true);
  app.addEventListener('input', function (e) {
    var el = e.target;
    if (!el.dataset || !el.dataset.slider) return;
    var v = +el.value;
    el.style.setProperty('--p', v + '%');
    if (el.dataset.cvi) { var cv = app.querySelector('[data-cv="' + el.dataset.cvi + '"]'); if (cv) cv.textContent = v > 0 ? v + '%' : 'Off'; }
    B.analog(+el.dataset.slider, el.dataset.scale ? v * 65535 / 100 : v);
  });
  app.addEventListener('change', function () { S.dragging = false; schedule(); });

  // ------------------------------------------------------------------ abonnements aux retours
  function watch(t, j) { if (j) B.on(t, j, function () { schedule(); }); }
  function watchRange(t, name, count) { for (var i = 1; i <= count; i++) watch(t, J(name, i)); }
  rooms.forEach(function (r) { watch('b', J('Room_{n}_LightsOn', r.id)); watch('b', J('Room_{n}_MediaOn', r.id)); });
  ['House_MusicPlaying', 'House_LightsOn', 'Lights_AllOn', 'Lights_AllOff', 'Music_PlayPause', 'Music_Mute', 'Music_Like', 'Music_Dislike',
    'Music_Shuffle', 'Music_Repeat', 'Music_Off', 'Music_SleepTimer_Toggle', 'Video_Off'].forEach(function (x) { watch('b', J(x)); });
  watchRange('b', 'Light_Scene_{n}', 8); watchRange('b', 'Light_{n}_Toggle', 20); watchRange('n', 'Light_{n}_Level#', 20);
  watchRange('b', 'Music_Service_{n}', 8); watchRange('b', 'Music_Fav_{n}', 8); watchRange('b', 'Video_Source_{n}', 8); watchRange('b', 'Camera_Select_{n}', 8);
  ['Music_Volume#', 'Music_SleepTimer#', 'Music_Service#', 'Music_Track#', 'House_MediaRoom#', 'Light_Scene#', 'House_LightsOnCount#', 'Video_Volume#', 'Video_Source#', 'Camera#', 'Music_Duration#'].forEach(function (x) { watch('n', J(x)); });
  ['Music_Title$', 'Music_Artist$', 'Music_Album$', 'Music_Cover$', 'Music_NowPlaying$', 'Video_Source_Name$', 'Camera_Url$', 'Systeme_IpId$', 'Systeme_CpzNom$', 'Systeme_CpzDate$'].forEach(function (x) { watch('s', J(x)); });
  // Position de lecture : mise à jour ciblée (pas de re-rendu chaque seconde)
  B.on('n', J('Music_Position#'), function (v) {
    var p = document.getElementById('pg-pos'), bar = document.getElementById('pg-bar'), dur = n('Music_Duration#');
    if (p) p.textContent = mmss(v);
    if (bar) bar.style.width = (dur ? Math.min(100, v * 100 / dur) : 0) + '%';
  });
  setInterval(function () { var c = document.getElementById('clock'); if (c) { var d = new Date(); c.textContent = d.getHours() + ':' + ('0' + d.getMinutes()).slice(-2); } }, 10000);

  // ------------------------------------------------------------------ démarrage
  window.addEventListener('resize', scale);
  scale();
  applyTheme(store('showroom_theme') || cfg.meta.themeParDefaut);
  var q = new URLSearchParams(location.search), urlRoom = parseInt(q.get('room'), 10);
  if (room(urlRoom)) { S.view = 'room'; S.roomId = urlRoom; }
  render();
  selectRoom(S.roomId);
  // API de la vitrine et des tests (lecture seule + navigation)
  window.Showroom = { ready: true, config: cfg, state: S, openRoom: openRoom, render: render, go: function (v) { S.view = v; S.sheet = null; render(); },
    openSheet: function (sh, sub) { S.sheet = sh; S.sub = sub || null; S.tab = 'now'; render(); }, tab: function (t) { S.tab = t; render(); } };
})();
