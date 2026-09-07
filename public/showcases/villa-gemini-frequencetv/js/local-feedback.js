/**
 * Villa Crans-Montana — moteur d'état local (100 % front-end), v1.0.165.
 *
 * Toute la logique métier de l'interface (15 pièces, scènes, sources, volume,
 * mute, extinction globale, alarme 4 partitions, thermostat et modes CVC,
 * circuits d'éclairage par pièce, moteurs, scènes de stores, presets globaux)
 * vit ici, en JavaScript, dans le navigateur. Aucun automate, aucun programme
 * externe : les composants CH5 (<ch5-button>, <ch5-slider>,
 * data-ch5-textcontent) et le code de la page lisent / écrivent des "signaux"
 * nommés dans ce moteur, exactement comme avec un système de contrôle, mais
 * tout est simulé ici.
 *
 * Numérotation = CONTRAT DE JOINS v2 (22.08.2026, villa_config.json → contrat) :
 *   Piece.Select 11-40 (join = 10 + id), Piece.Active analog 10, Piece.Nom serial 10,
 *   Eclairage.Scene 51-54, AV.Mute 55, CVC.ConsignePlus/Moins 49/50,
 *   Meteo.EasterEgg 56, AV.Source.Select 150-155 (150 = OFF), AV.SourceActive
 *   analog 51, AV.Volume analog 52, Eclairage.Circuit analog 71-80,
 *   Stores.Scene 201-204, Alarme.Partition 301-312, Global.* 401-411.
 *
 * API :
 *   Villa.on(type, id, cb)      s'abonner à un signal ('b' booléen, 'n' nombre, 's' texte)
 *   Villa.off(type, id, subId)  se désabonner
 *   Villa.get(type, id)         lire la valeur courante
 *   Villa.set(type, id, value)  écrire une valeur et notifier les abonnés
 *   Villa.press(id)             appui sur un bouton (front montant d'un signal booléen)
 *   Villa.selectRoom(id)        changer de pièce active
 *   Villa.state                 état interne (lecture seule, pour le débogage)
 */
(function () {
  "use strict";

  /* ------------------------------------------------------------------ */
  /* Table des signaux (contrat v2)                                       */
  /* ------------------------------------------------------------------ */
  var SIG = {
    ROOM_ID: "10",          // n : pièce active (1..N) — s : nom de la pièce
    ROOM_SELECT_BASE: 10,   // b : Piece.Select = 10 + id (11..40)
    ROOM_SELECT_MAX: 30,
    MASTER_LEVEL: "21",     // n : niveau master éclairage
    SETPOINT_X10: "31",     // n : consigne × 10
    TEMP_ACTUAL: "32",      // s : température mesurée
    HVAC_MODE: "33",        // s : mode CVC
    TEMP_SETPOINT: "34",    // s : consigne
    ALARM_ARM: "41",        // b : armement général + feedback
    ALARM_DISARM: "42",     // b : désarmement général + feedback
    TEMP_UP: "49",          // b : consigne +0,5 (v2, ex-35)
    TEMP_DOWN: "50",        // b : consigne −0,5 (v2, ex-36)
    SCENES: ["51", "52", "53", "54"], // b : OFF, CINÉMA, REPAS, TOTAL (v2, ex-21..24 : ces joins sont
                                       //     désormais Piece.Select 11..40, donc plus jamais émis ici)
    MUTE: "55",             // b : mute (toggle + feedback) (v2, ex-53)
    WEATHER_TAP: "56",      // b : easter egg météo (momentané) (v2, ex-37)
    SOURCE_ID: "51",        // n : source active (0 = veille)
    VOLUME: "52",           // n : volume 0..65535
    SOURCES: ["150", "151", "152", "153", "154", "155"], // b : OFF, APPLE TV, SKY Q, SWISSCOM, IPTV, MUSIQUE
    POWER_OFF: "200",       // b : extinction globale
    STORES_SCENES: ["201", "202", "203", "204"], // b : scènes de stores + feedback
    MEDIA_POS: "254",       // n : position lecteur média
    CIRCUITS: ["71", "72", "73", "74", "75", "76", "77", "78", "79", "80"], // n : gradateurs 0..65535
    DALLE_VOLUME: "260",    // n : volume matériel de la dalle (0-100)
    DALLE_MUTE: "261",      // b : mute matériel de la dalle
    ALARM_PARTITIONS: [
      { armed: "301", partial: "302", disarmed: "303" },
      { armed: "304", partial: "305", disarmed: "306" },
      { armed: "307", partial: "308", disarmed: "309" },
      { armed: "310", partial: "311", disarmed: "312" },
    ],
    ALL_LIGHTS_ON: "401",   // b : presets globaux éclairage
    ALL_LIGHTS_OFF: "402",
    LIGHTS_ECO: "403",
    ALL_BLINDS_OPEN: "404", // b : presets globaux stores (momentanés)
    ALL_BLINDS_CLOSE: "405",
    BLINDS_MIDDLE: "406",
    HVAC_MODES: { "407": ["CONFORT", 22.0], "408": ["NUIT", 18.5], "409": ["HORS GEL", 8.0] },
    HOLIDAY_ON: "410",      // b : mode vacances + feedback
    HOLIDAY_OFF: "411",
    // Sériels d'information système (affichés dans la page Réglages)
    IPID: "99", CPZ_NAME: "101", CPZ_DATE: "102", VALIDATION_DATE: "104",
  };
  var FULL = 65535;
  var pct = function (p) { return Math.round((FULL * p) / 100); };
  var LEGACY_MUTE_JOIN = "201"; // le GUI publie encore 201 (mute v1) en même temps que 55

  // Presets d'éclairage des scènes (10 circuits max par pièce)
  var SCENE_PRESETS = {
    "51": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    "52": [pct(12), 0, pct(30), pct(25), 0, 0, 0, 0, 0, 0],
    "53": [pct(55), pct(80), pct(45), pct(30), 0, pct(100), 0, 0, 0, 0],
    "54": [FULL, FULL, FULL, FULL, FULL, FULL, FULL, FULL, FULL, FULL],
  };

  /* ------------------------------------------------------------------ */
  /* État par pièce (valeurs de départ réalistes)                         */
  /* ------------------------------------------------------------------ */
  var roomNames = {};
  function makeRoom(temp, setpoint, mode, source, volume, scene) {
    return {
      temp: temp, setpoint: setpoint, mode: mode,
      source: source, volume: volume, mute: false,
      scene: scene, circuits: SCENE_PRESETS[scene].slice(), storesScene: null,
    };
  }
  var rooms = {
    1: makeRoom(21.5, 22.0, "CHAUFFAGE", 1, 32768, "53"),
    2: makeRoom(22.1, 21.0, "CHAUFFAGE", 0, 20000, "54"),
    3: makeRoom(21.8, 21.5, "CHAUFFAGE", 3, 28000, "53"),
    4: makeRoom(20.6, 20.0, "CHAUFFAGE", 2, 24000, "52"),
    5: makeRoom(20.2, 19.5, "CHAUFFAGE", 0, 18000, "51"),
    6: makeRoom(20.4, 19.5, "CHAUFFAGE", 0, 18000, "51"),
    7: makeRoom(22.4, 21.0, "CLIMATISATION", 4, 26000, "54"),
    8: makeRoom(19.8, 20.0, "CHAUFFAGE", 1, 40000, "52"),
    9: makeRoom(20.1, 19.5, "CHAUFFAGE", 0, 18000, "51"),
    10: makeRoom(21.0, 21.0, "CHAUFFAGE", 5, 22000, "53"),
    11: makeRoom(24.2, 22.0, "CLIMATISATION", 5, 30000, "54"),
    12: makeRoom(28.5, 28.0, "CHAUFFAGE", 5, 26000, "53"),
    13: makeRoom(45.0, 60.0, "CHAUFFAGE", 0, 12000, "52"),
    14: makeRoom(23.1, 22.0, "CLIMATISATION", 2, 34000, "54"),
    15: makeRoom(17.4, 16.0, "HORS GEL", 0, 10000, "51"),
  };
  var activeRoom = 1;
  var partitions = ["disarmed", "disarmed", "armed", "disarmed"];
  var hvacPreset = "407";
  var holiday = false;

  /* ------------------------------------------------------------------ */
  /* Bus de signaux                                                       */
  /* ------------------------------------------------------------------ */
  var state = { b: {}, n: {}, s: {} };
  var subs = { b: {}, n: {}, s: {} };
  var nextSubId = 1;

  function notify(type, id) {
    var list = subs[type][id];
    if (!list) return;
    var value = state[type][id];
    Object.keys(list).forEach(function (k) {
      try { list[k](value); } catch (e) { console.error("Villa: erreur abonné", type, id, e); }
    });
  }

  function set(type, id, value) {
    id = String(id);
    if (type === "b") value = (value === true || value === "true" || value === 1 || value === "1");
    else if (type === "n") value = Number(value) || 0;
    else value = String(value);
    var changed = state[type][id] !== value;
    state[type][id] = value;
    feedCh5(type, id, value);
    if (changed || type === "b") notify(type, id);
    return value;
  }

  function get(type, id) { return state[type][String(id)]; }

  function on(type, id, cb) {
    id = String(id);
    if (!subs[type][id]) subs[type][id] = {};
    var subId = String(nextSubId++);
    subs[type][id][subId] = cb;
    if (state[type][id] !== undefined) {
      var v = state[type][id];
      setTimeout(function () { try { cb(v); } catch (e) {} }, 0);
    }
    return subId;
  }

  function off(type, id, subId) {
    id = String(id);
    if (subs[type] && subs[type][id]) delete subs[type][id][String(subId)];
  }

  function pulse(id, ms) {
    set("b", id, true);
    setTimeout(function () { set("b", id, false); }, ms || 120);
  }

  /* ------------------------------------------------------------------ */
  /* Logique métier                                                       */
  /* ------------------------------------------------------------------ */
  // Valeur numérique seule : l'unité (°C) est déjà dans le balisage
  function fmtTemp(v) { return v.toFixed(1); }
  function roomJoin(id) { return String(SIG.ROOM_SELECT_BASE + id); }
  function roomFromJoin(n) {
    var id = n - SIG.ROOM_SELECT_BASE;
    return (id >= 1 && id <= SIG.ROOM_SELECT_MAX && rooms[id]) ? id : 0;
  }
  function maxLevel(r) {
    var max = 0;
    r.circuits.forEach(function (v) { if (v > max) max = v; });
    return max;
  }

  function publishScenes(r) {
    SIG.SCENES.forEach(function (s) { set("b", s, s === r.scene); });
  }

  function publishCircuits(r) {
    SIG.CIRCUITS.forEach(function (c, idx) { set("n", c, r.circuits[idx]); });
    set("n", SIG.MASTER_LEVEL, maxLevel(r));
  }

  function publishHvac(r) {
    set("s", SIG.TEMP_ACTUAL, fmtTemp(r.temp));
    set("s", SIG.TEMP_SETPOINT, fmtTemp(r.setpoint));
    set("n", SIG.SETPOINT_X10, Math.round(r.setpoint * 10));
    set("s", SIG.HVAC_MODE, r.mode);
  }

  function publishSource(r) {
    set("n", SIG.SOURCE_ID, r.source);
    SIG.SOURCES.forEach(function (s, idx) { set("b", s, idx === r.source); });
    set("b", SIG.POWER_OFF, r.source === 0);
  }

  function publishRoom(id) {
    var r = rooms[id];
    set("n", SIG.ROOM_ID, id);
    set("s", SIG.ROOM_ID, roomNames[id] || ("Pièce " + id));
    for (var i = 1; i <= SIG.ROOM_SELECT_MAX; i++) set("b", roomJoin(i), i === id);
    publishHvac(r);
    publishSource(r);
    set("n", SIG.VOLUME, r.volume);
    set("b", SIG.MUTE, r.mute);
    publishScenes(r);
    publishCircuits(r);
    SIG.STORES_SCENES.forEach(function (s) { set("b", s, s === r.storesScene); });
  }

  function selectRoom(id) {
    id = Number(id);
    if (!rooms[id]) return;
    activeRoom = id;
    window.currentActiveRoomId = String(id);
    try { localStorage.setItem("active_room_id", String(id)); } catch (e) {}
    publishRoom(id);
  }

  function applyScene(sceneId) {
    var r = rooms[activeRoom];
    r.scene = sceneId;
    r.circuits = SCENE_PRESETS[sceneId].slice();
    publishScenes(r);
    publishCircuits(r);
  }

  function applyStoresScene(sceneId) {
    var r = rooms[activeRoom];
    r.storesScene = sceneId;
    SIG.STORES_SCENES.forEach(function (s) { set("b", s, s === sceneId); });
  }

  function selectSource(idx) {
    var r = rooms[activeRoom];
    r.source = idx;
    publishSource(r);
    if (idx === 0) { r.mute = false; set("b", SIG.MUTE, false); }
  }

  var lastPowerOff = 0;
  function powerOff() {
    lastPowerOff = Date.now();
    selectSource(0);
  }

  function toggleMute() {
    var r = rooms[activeRoom];
    r.mute = !r.mute;
    set("b", SIG.MUTE, r.mute);
    // Le bouton mute du GUI émet à la fois l'impulsion <ch5-button> et un
    // publishEvent(55) depuis toggleMute() : on republie l'état réel une fois
    // l'appui terminé pour que l'affichage (window.isMuted) suive le moteur.
    setTimeout(function () {
      set("b", SIG.MUTE, r.mute);
      if (typeof window.updateMuteUI === "function") window.updateMuteUI(r.mute);
    }, 250);
  }

  function adjustSetpoint(delta) {
    var r = rooms[activeRoom];
    r.setpoint = Math.max(5, Math.min(90, Math.round((r.setpoint + delta) * 2) / 2));
    if (r.mode !== "HORS GEL") r.mode = r.setpoint < r.temp - 0.4 ? "CLIMATISATION" : "CHAUFFAGE";
    publishHvac(r);
  }

  function setHvacPreset(id) {
    hvacPreset = id;
    Object.keys(SIG.HVAC_MODES).forEach(function (k) { set("b", k, k === id); });
    Object.keys(rooms).forEach(function (k) {
      var r = rooms[k];
      r.setpoint = SIG.HVAC_MODES[id][1];
      r.mode = id === "409" ? "HORS GEL" : (r.setpoint < r.temp - 0.4 ? "CLIMATISATION" : "CHAUFFAGE");
    });
    publishHvac(rooms[activeRoom]);
  }

  function setPartition(i, mode) {
    partitions[i] = mode;
    var p = SIG.ALARM_PARTITIONS[i];
    set("b", p.armed, mode === "armed");
    set("b", p.partial, mode === "partial");
    set("b", p.disarmed, mode === "disarmed");
    var allDisarmed = partitions.every(function (m) { return m === "disarmed"; });
    set("b", SIG.ALARM_ARM, !allDisarmed);
    set("b", SIG.ALARM_DISARM, allDisarmed);
  }

  function setAllLights(level) {
    Object.keys(rooms).forEach(function (k) {
      rooms[k].circuits = rooms[k].circuits.map(function () { return level; });
      rooms[k].scene = level === 0 ? "51" : level === FULL ? "54" : null;
    });
    set("b", SIG.ALL_LIGHTS_ON, level === FULL);
    set("b", SIG.ALL_LIGHTS_OFF, level === 0);
    set("b", SIG.LIGHTS_ECO, level !== 0 && level !== FULL);
    publishRoom(activeRoom);
  }

  function setHoliday(onOff) {
    holiday = onOff;
    set("b", SIG.HOLIDAY_ON, holiday);
    set("b", SIG.HOLIDAY_OFF, !holiday);
    if (holiday) {
      for (var i = 0; i < 4; i++) setPartition(i, "armed");
      setAllLights(0);
      setHvacPreset("409");
    }
  }

  // Front montant d'un signal booléen (appui sur un bouton)
  var lastPress = {};
  function press(id) {
    id = String(id);
    var now = Date.now();
    if (lastPress[id] && now - lastPress[id] < 120) return; // anti-rebond (double émission)
    lastPress[id] = now;

    var n = Number(id);
    if (roomFromJoin(n)) return selectRoom(roomFromJoin(n));
    if (SIG.SCENES.indexOf(id) !== -1) return applyScene(id);
    if (SIG.SOURCES.indexOf(id) !== -1) return selectSource(SIG.SOURCES.indexOf(id));
    if (id === SIG.POWER_OFF) return powerOff();
    if (id === SIG.MUTE) return toggleMute();
    if (id === SIG.TEMP_UP) return adjustSetpoint(0.5);
    if (id === SIG.TEMP_DOWN) {
      // Le GUI émet encore 50 (extinction v1) juste après 200 : ne pas baisser la consigne dans ce cas
      if (now - lastPowerOff < 300) return;
      return adjustSetpoint(-0.5);
    }
    if (SIG.STORES_SCENES.indexOf(id) !== -1) {
      if (id === LEGACY_MUTE_JOIN) {
        // Le GUI émet encore 201 (mute v1) avec 55 : on laisse passer 55 puis on décide
        setTimeout(function () {
          if (lastPress[SIG.MUTE] && Math.abs(lastPress[SIG.MUTE] - now) < 200) return;
          applyStoresScene(id);
        }, 80);
        return;
      }
      return applyStoresScene(id);
    }
    if (SIG.HVAC_MODES[id]) return setHvacPreset(id);
    if (id === SIG.ALL_LIGHTS_ON) return setAllLights(FULL);
    if (id === SIG.ALL_LIGHTS_OFF) return setAllLights(0);
    if (id === SIG.LIGHTS_ECO) return setAllLights(pct(30));
    if (id === SIG.HOLIDAY_ON) return setHoliday(true);
    if (id === SIG.HOLIDAY_OFF) return setHoliday(false);
    if (id === SIG.ALARM_ARM) { for (var i = 0; i < 4; i++) setPartition(i, "armed"); return; }
    if (id === SIG.ALARM_DISARM) { for (var j = 0; j < 4; j++) setPartition(j, "disarmed"); return; }
    for (var p = 0; p < SIG.ALARM_PARTITIONS.length; p++) {
      var part = SIG.ALARM_PARTITIONS[p];
      if (id === part.armed) return setPartition(p, "armed");
      if (id === part.partial) return setPartition(p, "partial");
      if (id === part.disarmed) return setPartition(p, "disarmed");
    }
    if (id === SIG.DALLE_MUTE) return set("b", id, !get("b", id));
    // Tout le reste (moteurs 61..69 / 81..98, stores globaux 404..406, lecteur
    // média 211..220 / 251..253, widget météo 56, resync 250…) est momentané.
    pulse(id, 120);
  }

  // Valeurs analogiques émises par les sliders et le code de la page
  function setAnalog(id, value) {
    id = String(id);
    if (id === SIG.ROOM_ID) { // Piece.Active : sélection de pièce par le GUI
      var target = Number(value);
      if (rooms[target] && target !== activeRoom) selectRoom(target);
      return;
    }
    var r = rooms[activeRoom];
    value = set("n", id, value);
    if (id === SIG.VOLUME) r.volume = value;
    if (id === SIG.SETPOINT_X10) { r.setpoint = value / 10; publishHvac(r); }
    var ci = SIG.CIRCUITS.indexOf(id);
    if (ci !== -1) {
      r.circuits[ci] = value;
      // Un réglage manuel désélectionne la scène courante
      if (r.scene) { r.scene = null; publishScenes(r); }
      set("n", SIG.MASTER_LEVEL, maxLevel(r));
    }
    if (id === SIG.MASTER_LEVEL) {
      r.circuits = r.circuits.map(function () { return value; });
      if (r.scene) { r.scene = null; publishScenes(r); }
      SIG.CIRCUITS.forEach(function (c, idx) { set("n", c, r.circuits[idx]); });
    }
  }

  // Dérive lente de la température mesurée vers la consigne (effet "vivant")
  setInterval(function () {
    Object.keys(rooms).forEach(function (k) {
      var r = rooms[k];
      var diff = r.setpoint - r.temp;
      if (Math.abs(diff) < 0.05) return;
      r.temp = Math.round((r.temp + Math.sign(diff) * 0.1) * 10) / 10;
      if (Number(k) === activeRoom) set("s", SIG.TEMP_ACTUAL, fmtTemp(r.temp));
    });
  }, 20000);

  /* ------------------------------------------------------------------ */
  /* Adaptateur pour les composants CH5                                   */
  /* ------------------------------------------------------------------ */
  // Les <ch5-button>/<ch5-slider> et CrComLib.publishEvent() émettent via le
  // "pont" interne de la bibliothèque CH5 (Ch5SignalBridge) ; les retours
  // d'état (receiveState*, data-ch5-textcontent, CrComLib.subscribeState)
  // arrivent par bridgeReceive*FromNative. On branche les deux côtés sur ce
  // moteur : rien ne sort jamais du navigateur.
  var ch5Bound = false;
  function bindCh5() {
    if (typeof CrComLib === "undefined" || !CrComLib.Ch5SignalBridge) return false;
    var P = CrComLib.Ch5SignalBridge.prototype;
    P.sendBooleanToNative = function (id, value) {
      if (value === true || value === "true" || value === 1 || value === "1") press(id);
    };
    P.sendIntegerToNative = function (id, value) { setAnalog(id, value); };
    P.sendStringToNative = function (id, value) { set("s", id, value); };
    P.sendObjectToNative = function (id, value) {
      // <ch5-button> émet un objet { repeatdigital: true|false } (appui maintenu)
      if (value && typeof value === "object" && "repeatdigital" in value) {
        if (value.repeatdigital) press(id);
      }
    };
    P.publish = function (id, value) {
      if (value && typeof value === "object") return P.sendObjectToNative(id, value);
      if (typeof value === "boolean") return P.sendBooleanToNative(id, value);
      if (typeof value === "number") return P.sendIntegerToNative(id, value);
      if (typeof value === "string") return P.sendStringToNative(id, value);
    };
    ch5Bound = true;
    return true;
  }

  function feedCh5(type, id, value) {
    if (!ch5Bound) return;
    try {
      if (type === "b") CrComLib.bridgeReceiveBooleanFromNative(id, value);
      else if (type === "n") CrComLib.bridgeReceiveIntegerFromNative(id, value);
      else CrComLib.bridgeReceiveStringFromNative(id, value);
    } catch (e) { /* composant absent : sans conséquence */ }
  }

  if (!bindCh5()) {
    var tries = 0;
    var waitLib = setInterval(function () {
      if (bindCh5() || ++tries > 200) clearInterval(waitLib);
    }, 25);
  }

  /* ------------------------------------------------------------------ */
  /* Initialisation                                                       */
  /* ------------------------------------------------------------------ */
  var initialized = false;
  function init() {
    if (initialized) return;
    initialized = true;
    var vc = window.villaConfigEmbedded || window.villaConfig;
    var pieces = vc && vc.pieces ? vc.pieces : [];
    if (pieces.length) {
      pieces.forEach(function (p) {
        roomNames[p.id] = p.nom;
        if (!rooms[p.id]) rooms[p.id] = makeRoom(21.0, 21.0, "CHAUFFAGE", 0, 20000, "51");
      });
    } else if (window.crestronConfig && window.crestronConfig.rooms) {
      window.crestronConfig.rooms.forEach(function (r) { roomNames[r.id] = r.name; });
    }
    for (var i = 0; i < 4; i++) setPartition(i, partitions[i]);
    Object.keys(SIG.HVAC_MODES).forEach(function (k) { set("b", k, k === hvacPreset); });
    set("b", SIG.HOLIDAY_ON, false);
    set("b", SIG.HOLIDAY_OFF, true);
    set("n", SIG.DALLE_VOLUME, 65);
    set("b", SIG.DALLE_MUTE, false);
    set("s", SIG.IPID, "0x04");
    set("s", SIG.CPZ_NAME, "VillaCrans_" + (window.appVersion || "v1.0.165") + ".cpz");
    set("s", SIG.CPZ_DATE, "25/08/2026 00:08:30");
    set("s", SIG.VALIDATION_DATE, "25/08/2026");
    var start = 1;
    try { start = parseInt(localStorage.getItem("active_room_id") || "1", 10) || 1; } catch (e) {}
    selectRoom(rooms[start] ? start : 1);
  }

  window.Villa = {
    SIG: SIG, on: on, off: off, get: get, set: set, press: press, setAnalog: setAnalog,
    selectRoom: selectRoom, init: init, state: state,
    get activeRoom() { return activeRoom; },
  };

  // Démarrage automatique : une fois la page chargée (toutes les fonctions du
  // GUI sont définies) et la bibliothèque CH5 branchée.
  function autoStart() {
    var tries = 0;
    var t = setInterval(function () {
      if (ch5Bound || ++tries > 400) { clearInterval(t); setTimeout(init, 350); }
    }, 25);
  }
  if (document.readyState === "complete") autoStart();
  else window.addEventListener("load", autoStart);
})();

/* ------------------------------------------------------------------ */
/* Fonctions appelées par des onclick de la page (titre « Sélection      */
/* Source Audio et Vidéo », widget météo) mais absentes de l'export      */
/* 100 % front-end : définies ici pour éviter les erreurs console.       */
/* ------------------------------------------------------------------ */
window.playAudioDemo = function () {
  if (typeof window.playFunnySound === "function") window.playFunnySound();
};
window.openWeatherWebsite = function () {
  // Ouvre MétéoSuisse uniquement sur un vrai clic — jamais pendant la démo
  // automatique (événements synthétiques, isTrusted === false).
  var ev = window.event;
  if (ev && ev.isTrusted === false) return;
  window.open("https://www.meteosuisse.admin.ch/", "_blank", "noopener");
};
