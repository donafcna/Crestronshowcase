/*
 * Showroom FTV Nyon — feedback local (vitrine, meta.mode = "showcase" uniquement).
 *
 * Réplique en JavaScript du moteur du C# slot 1 (simpl-sharp/ShowroomNyon/ControlSystem.cs) : mêmes
 * commandes, mêmes joins de retour, mêmes règles (scènes, bascules, minuterie, lecteur « en cours »).
 * En déploiement ce fichier ne fait rien : les retours viennent du processeur.
 * Toute règle modifiée ici doit l'être dans le C#, et inversement (voir docs/CONTRAT-JOINS.md).
 */
(function () {
  'use strict';
  var cfg = window.showroomConfig;
  if (!cfg || !cfg.meta || cfg.meta.mode !== 'showcase') return;

  var J = function (n, i) { return window.Joins.of(n, i); };
  var out = function (t, j, v) { if (j) window.Bus.deliver(t, j, v); };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var toRaw = function (p) { return Math.round(clamp(p, 0, 100) * 65535 / 100); };
  var music = cfg.musique || { services: [], favoris: [], pistes: [] };
  var tracks = music.pistes || [];

  var rooms = {};
  (cfg.pieces || []).forEach(function (p) {
    var n = p.pilotages.eclairages.circuits.length;
    var au = p.pilotages.audio || {}, vi = p.pilotages.video || {};
    rooms[p.id] = {
      cfg: p, levels: p.pilotages.eclairages.circuits.map(function (c) { return c.niveauInitial || 0; }),
      last: new Array(n).fill(100), scene: 0,
      m: { service: 0, fav: 0, track: 1, pos: 0, vol: au.volumeInitial || 30, muted: false, like: false, dislike: false,
           shuffle: false, repeat: false, sleep: false, sleepMin: 0, sleepLeftS: 0 },
      v: { source: 0, vol: vi.volumeInitial || 30 }
    };
  });
  var ids = Object.keys(rooms).map(Number);
  var active = ids[0] || 1, mediaRoom = 0, camera = 0;

  function hasAudio(r) { return !!(r.cfg.pilotages.audio && r.cfg.pilotages.audio.actif); }
  function hasVideo(r) { return !!(r.cfg.pilotages.video && r.cfg.pilotages.video.actif); }
  function mediaOn(r) { return (hasAudio(r) && r.m.service > 0) || (hasVideo(r) && r.v.source > 0); }
  function service(id) { return (music.services || []).filter(function (s) { return s.id === id; })[0]; }

  // ---------------------------------------------------------------- actions
  function applyScene(r, idx) {
    var sc = r.cfg.pilotages.eclairages.scenes[idx - 1];
    if (!sc) return;
    r.levels = r.levels.map(function (_, i) { var v = sc.niveaux[i] || 0; if (v > 0) r.last[i] = v; return v; });
    r.scene = idx;
  }
  function sceneByName(r, name) {
    var list = r.cfg.pilotages.eclairages.scenes;
    for (var i = 0; i < list.length; i++) if (list[i].nom === name) return i + 1;
    return 0;
  }
  function setAll(r, pct) { r.levels = r.levels.map(function () { return pct; }); r.scene = 0; }
  function startMusic(r, svc, fav) {
    if (!hasAudio(r)) return;
    r.m.service = svc || 1;
    var s = service(r.m.service);
    if (s && s.type === 'streaming') {
      if (fav) { r.m.fav = fav; r.m.track = ((fav - 1) * 2) % Math.max(1, tracks.length) + 1; }
      r.m.pos = 0;
      r.m.playing = true;
    } else { r.m.fav = 0; r.m.playing = true; }
    mediaRoom = r.cfg.id;
  }
  function musicOff(r) { r.m.service = 0; r.m.playing = false; r.m.fav = 0; r.m.sleep = false; r.m.sleepLeftS = 0; }
  function roomOff(r) { setAll(r, 0); musicOff(r); r.v.source = 0; }
  function effects(r, fx) {
    if (!fx) return;
    if (fx.scene) { var k = sceneByName(r, fx.scene); if (k) applyScene(r, k); }
    if (fx.musique) startMusic(r, fx.musique, fx.favori || 0);
  }
  function houseEffects(fx) {
    if (!fx) return;
    ids.forEach(function (id) {
      var r = rooms[id];
      if (fx.pieces && fx.pieces.indexOf(id) < 0) return;
      if (fx.toutEteindre) { roomOff(r); return; }
      if (fx.scenePieces) {
        var k = sceneByName(r, fx.scenePieces);
        if (k) applyScene(r, k); else if (fx.niveauSansScene !== undefined) setAll(r, fx.niveauSansScene);
      }
      if (fx.musique) startMusic(r, fx.musique, fx.favori || 0);
    });
  }
  function pulse(j) { out('b', j, true); setTimeout(function () { out('b', j, false); }, 1400); }

  function onDigital(j) {
    var r = rooms[active];
    var t = window.Joins.table.b, e = null;
    for (var i = 0; i < t.length; i++) if (j >= t[i].start && j <= t[i].end) { e = t[i]; break; }
    if (!e) return;
    var n = j - e.start + 1;
    switch (e.name) {
      case 'Room_Select_{n}': if (rooms[n]) active = n; break;
      case 'House_Action_{n}': var ha = cfg.maison.actions[n - 1]; if (ha) { houseEffects(ha.effets); pulse(j); } break;
      case 'Room_Off': roomOff(r); break;
      case 'House_AllOff': ids.forEach(function (id) { roomOff(rooms[id]); }); break;
      case 'Room_Action_{n}': var ra = r.cfg.actions[n - 1]; if (ra) { effects(r, ra.effets); pulse(j); } break;
      case 'Light_Scene_{n}': applyScene(r, n); break;
      case 'Lights_AllOn': setAll(r, 100); break;
      case 'Lights_AllOff': setAll(r, 0); break;
      case 'Lights_DimUp': r.levels = r.levels.map(function (v) { return clamp(v + 10, 0, 100); }); r.scene = 0; break;
      case 'Lights_DimDown': r.levels = r.levels.map(function (v) { return clamp(v - 10, 0, 100); }); r.scene = 0; break;
      case 'Light_{n}_Toggle':
        if (n <= r.levels.length) {
          if (r.levels[n - 1] > 0) { r.last[n - 1] = r.levels[n - 1]; r.levels[n - 1] = 0; }
          else r.levels[n - 1] = r.last[n - 1] || 100;
          r.scene = 0;
        }
        break;
      case 'House_Lights_AllOff': ids.forEach(function (id) { setAll(rooms[id], 0); }); break;
      case 'Video_Off': r.v.source = 0; break;
      case 'Video_Source_{n}': if (hasVideo(r)) { r.v.source = n; mediaRoom = r.cfg.id; } break;
      case 'Camera_Select_{n}': camera = n; break;
      case 'Music_Service_{n}': startMusic(r, n, service(n) && service(n).type === 'streaming' ? 1 : 0); break;
      case 'Music_Fav_{n}': var f = music.favoris[n - 1]; if (f) startMusic(r, f.service, n); break;
      case 'Music_Prev': step(r, -1); break;
      case 'Music_Next': step(r, 1); break;
      case 'Music_PlayPause': if (!r.m.service) startMusic(r, 1, 1); else r.m.playing = !r.m.playing; break;
      case 'Music_Mute': r.m.muted = !r.m.muted; break;
      case 'Music_Rewind': r.m.pos = Math.max(0, r.m.pos - 15); break;
      case 'Music_Forward': r.m.pos = Math.min(dur(r) - 1, r.m.pos + 15); break;
      case 'Music_Like': r.m.like = !r.m.like; if (r.m.like) r.m.dislike = false; break;
      case 'Music_Dislike': r.m.dislike = !r.m.dislike; if (r.m.dislike) r.m.like = false; break;
      case 'Music_Shuffle': r.m.shuffle = !r.m.shuffle; break;
      case 'Music_Repeat': r.m.repeat = !r.m.repeat; break;
      case 'Music_Off': musicOff(r); break;
      case 'Music_SleepTimer_Toggle':
        r.m.sleep = !r.m.sleep;
        r.m.sleepLeftS = r.m.sleep ? (r.m.sleepMin || 30) * 60 : 0;
        if (r.m.sleep && !r.m.sleepMin) r.m.sleepMin = 30;
        break;
      case 'Music_Browse_{n}': if (r.m.service) { r.m.track = ((n - 1) % Math.max(1, tracks.length)) + 1; r.m.pos = 0; r.m.playing = true; r.m.fav = 0; } break;
      default: break;
    }
    publish();
  }
  function onAnalog(j, v) {
    var r = rooms[active];
    var t = window.Joins.table.n, e = null;
    for (var i = 0; i < t.length; i++) if (j >= t[i].start && j <= t[i].end) { e = t[i]; break; }
    if (!e) return;
    var n = j - e.start + 1;
    switch (e.name) {
      case 'Room_Select#': if (rooms[v]) active = v; break;
      case 'Light_{n}_Level#':
        if (n <= r.levels.length) { var p = Math.round(v * 100 / 65535); r.levels[n - 1] = p; if (p > 0) r.last[n - 1] = p; r.scene = 0; }
        break;
      case 'Music_Volume#': r.m.vol = clamp(v, 0, 100); if (r.m.vol > 0) r.m.muted = false; break;
      case 'Video_Volume#': r.v.vol = clamp(v, 0, 100); break;
      case 'Music_SleepTimer#': r.m.sleepMin = clamp(v, 0, 120); if (r.m.sleep) r.m.sleepLeftS = r.m.sleepMin * 60; break;
      default: break;
    }
    publish();
  }
  function dur(r) { var tr = tracks[r.m.track - 1]; return tr ? tr.duree : 0; }
  function step(r, d) {
    if (!r.m.service || !tracks.length) return;
    r.m.track = ((r.m.track - 1 + d + tracks.length) % tracks.length) + 1;
    r.m.pos = 0;
  }

  // ---------------------------------------------------------------- retours (mêmes joins que le C#)
  function publish() {
    var r = rooms[active];
    if (!r) return;
    for (var k = 1; k <= 30; k++) out('b', J('Room_Select_{n}', k), active === k);
    out('n', J('Room_Select#'), active);
    for (var i = 1; i <= 8; i++) out('b', J('Light_Scene_{n}', i), r.scene === i);
    out('n', J('Light_Scene#'), r.scene);
    var nL = r.levels.length;
    out('b', J('Lights_AllOn'), nL > 0 && r.levels.every(function (v) { return v >= 100; }));
    out('b', J('Lights_AllOff'), r.levels.every(function (v) { return v === 0; }));
    for (i = 1; i <= 20; i++) {
      var lv = i <= nL ? r.levels[i - 1] : 0;
      out('b', J('Light_{n}_Toggle', i), lv > 0);
      out('n', J('Light_{n}_Level#', i), toRaw(lv));
    }
    var m = r.m, svc = service(m.service), tr = tracks[m.track - 1] || {};
    var streaming = svc && svc.type === 'streaming';
    for (i = 1; i <= 8; i++) {
      out('b', J('Music_Service_{n}', i), m.service === i);
      out('b', J('Music_Fav_{n}', i), m.fav === i);
    }
    out('b', J('Music_PlayPause'), !!(m.service && m.playing));
    out('b', J('Music_Mute'), m.muted);
    out('b', J('Music_Like'), m.like);
    out('b', J('Music_Dislike'), m.dislike);
    out('b', J('Music_Shuffle'), m.shuffle);
    out('b', J('Music_Repeat'), m.repeat);
    out('b', J('Music_Off'), m.service === 0);
    out('b', J('Music_SleepTimer_Toggle'), m.sleep);
    out('n', J('Music_Volume#'), m.muted ? 0 : m.vol);
    out('n', J('Music_Position#'), streaming ? m.pos : 0);
    out('n', J('Music_Duration#'), streaming ? (tr.duree || 0) : 0);
    out('n', J('Music_SleepTimer#'), m.sleep ? Math.ceil(m.sleepLeftS / 60) : m.sleepMin);
    out('n', J('Music_Service#'), m.service);
    out('n', J('Music_Track#'), streaming ? m.track : 0);
    out('s', J('Music_Title$'), svc ? (streaming ? tr.titre : svc.nom) : '');
    out('s', J('Music_Artist$'), streaming ? tr.artiste : '');
    out('s', J('Music_Album$'), streaming ? tr.album : '');
    out('s', J('Music_Cover$'), streaming ? tr.pochette : '');
    for (i = 1; i <= 8; i++) out('b', J('Video_Source_{n}', i), r.v.source === i);
    out('b', J('Video_Off'), r.v.source === 0);
    out('n', J('Video_Volume#'), r.v.vol);
    out('n', J('Video_Source#'), r.v.source);
    var vs = ((cfg.video && cfg.video.sources) || []).filter(function (s) { return s.id === r.v.source; })[0];
    out('s', J('Video_Source_Name$'), vs ? vs.nom : '');
    for (i = 1; i <= 8; i++) out('b', J('Camera_Select_{n}', i), camera === i);
    out('n', J('Camera#'), camera);
    var cam = (cfg.cameras || [])[camera - 1];
    out('s', J('Camera_Url$'), cam ? (cam.flux || '') : '');
    publishHouse();
  }
  function publishHouse() {
    if (mediaRoom && !mediaOn(rooms[mediaRoom])) mediaRoom = 0;
    if (!mediaRoom) ids.forEach(function (id) { if (!mediaRoom && mediaOn(rooms[id])) mediaRoom = id; });
    var count = 0, anyPlay = false;
    ids.forEach(function (id) {
      var r = rooms[id], on = r.levels.filter(function (v) { return v > 0; }).length;
      count += on;
      out('b', J('Room_{n}_LightsOn', id), on > 0);
      out('b', J('Room_{n}_MediaOn', id), mediaOn(r));
      if (r.m.service && r.m.playing) anyPlay = true;
    });
    out('b', J('House_MusicPlaying'), anyPlay);
    out('b', J('House_LightsOn'), count > 0);
    out('n', J('House_LightsOnCount#'), count);
    out('n', J('House_MediaRoom#'), mediaRoom);
    var label = '';
    if (mediaRoom) {
      var mr = rooms[mediaRoom], s = mr.m.service ? service(mr.m.service) : null;
      var vs = !s && mr.v.source ? ((cfg.video && cfg.video.sources) || []).filter(function (x) { return x.id === mr.v.source; })[0] : null;
      label = ((s && s.nom) || (vs && vs.nom) || 'Media') + ' in ' + mr.cfg.nom;
    }
    out('s', J('Music_NowPlaying$'), label);
  }

  // Horloge de lecture et minuterie de veille (1 s)
  setInterval(function () {
    var changed = false;
    ids.forEach(function (id) {
      var r = rooms[id], m = r.m, s = service(m.service);
      if (m.service && m.playing && s && s.type === 'streaming') {
        m.pos++;
        if (m.pos >= dur(r)) { if (m.repeat) m.pos = 0; else step(r, m.shuffle ? 1 + Math.floor(Math.random() * 3) : 1); }
        if (id === active) changed = true;
      }
      if (m.sleep && m.sleepLeftS > 0) {
        m.sleepLeftS--;
        if (m.sleepLeftS === 0) { musicOff(r); r.v.source = 0; changed = true; }
      }
    });
    if (changed) { var r = rooms[active], s = service(r.m.service); if (s && s.type === 'streaming') { out('n', J('Music_Position#'), r.m.pos); out('n', J('Music_Duration#'), dur(r)); var tr = tracks[r.m.track - 1] || {}; out('s', J('Music_Title$'), tr.titre); out('s', J('Music_Artist$'), tr.artiste); out('s', J('Music_Album$'), tr.album); out('s', J('Music_Cover$'), tr.pochette); out('n', J('Music_Track#'), r.m.track); } publish(); }
  }, 1000);

  window.LocalFeedback = {
    receive: function (t, j, v) {
      if (t === 'b') { if (v) onDigital(j); }
      else if (t === 'n') onAnalog(j, v);
    },
    state: function () { return { active: active, rooms: rooms, mediaRoom: mediaRoom }; }
  };
  window.Bus.deliver('s', J('Systeme_IpId$'), 'showcase');
  setTimeout(publish, 0);
})();
