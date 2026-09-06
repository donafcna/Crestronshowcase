/**
 * Villa Crans-Montana — moteur d'état local (100 % front-end), v1.0.149.
 *
 * Toute la logique métier de l'interface (15 pièces, scènes, sources, volume,
 * mute, extinction globale, alarme 4 partitions, thermostat et modes CVC,
 * circuits d'éclairage par pièce, moteurs, presets globaux) vit ici, en
 * JavaScript, dans le navigateur. Aucun automate, aucun programme externe :
 * les composants CH5 (<ch5-button>, <ch5-slider>, data-ch5-textcontent) et
 * le code de la page lisent / écrivent des "signaux" nommés dans ce moteur,
 * exactement comme avec un système de contrôle, mais tout est simulé ici.
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
  /* Table des signaux                                                    */
  /* ------------------------------------------------------------------ */
  var SIG = {
    ROOM_ID: "10",          // n : pièce active (1..15) — s : nom de la pièce
    ROOM_COUNT: 15,         // pièces 1..10 → boutons 11..20 ; pièces 11..15 → boutons 121..125
                            // (dans le projet d'origine 21..25 entraient en collision avec les scènes 21..24)
    SCENES: ["21", "22", "23", "24"],       // b : OFF, CINÉMA, REPAS, TOTAL (éclairage de la pièce)
    TEMP_ACTUAL: "32",      // s : température mesurée
    HVAC_MODE: "33",        // s : mode CVC
    TEMP_SETPOINT: "34",    // s : consigne
    TEMP_UP: "35",          // b : consigne +
    TEMP_DOWN: "36",        // b : consigne −
    WEATHER_TAP: "37",      // b : appui sur le widget météo (momentané)
    ALARM_ARM: "41",        // b : ancienne alarme globale
    ALARM_DISARM: "42",
    POWER_OFF_LEGACY: "50", // b : extinction (ancien)
    SOURCE_ID: "51",        // n : source active (0 = veille)
    VOLUME: "52",           // n : volume 0..65535
    MUTE: "53",             // b
    SOURCES: ["150", "151", "152", "153", "154", "155"], // b : OFF, APPLE TV, SKY Q, SWISSCOM, IPTV, MUSIQUE
    POWER_OFF: "200",       // b : extinction globale
    MUTE2: "201",           // b : mute (nouveau bouton)
    VOLUME2: "202",         // n : volume (nouveau slider)
    MEDIA_POS: "254",       // n : position lecteur média
    CIRCUITS: ["71", "72", "73", "74", "75", "76"], // n : gradateurs 0..65535
    ALARM_PARTITIONS: [
      { armed: "301", partial: "302", disarmed: "303" },
      { armed: "304", partial: "305", disarmed: "306" },
      { armed: "307", partial: "308", disarmed: "309" },
      { armed: "310", partial: "311", disarmed: "312" },
    ],
    ALL_LIGHTS_ON: "401",   // b : preset global
    ALL_LIGHTS_OFF: "402",
    HVAC_MODES: { "403": ["ÉCO", 19.0], "406": ["POSITION INTER.", 20.5], "407": ["CONFORT", 22.0], "408": ["NUIT", 18.5], "409": ["HORS GEL", 8.0] },
    ALL_BLINDS_OPEN: "404",
    ALL_BLINDS_CLOSE: "405",
    ALARM_ALL_ARM: "410",
    ALARM_ALL_DISARM: "411",
  };
  var FULL = 65535;
  var pct = function (p) { return Math.round((FULL * p) / 100); };

  // Presets d'éclairage des scènes (4 circuits par pièce + 2 anciens)
  var SCENE_PRESETS = {
    "21": [0, 0, 0, 0, 0, 0],
    "22": [pct(12), 0, pct(30), pct(25), 0, 0],
    "23": [pct(55), pct(80), pct(45), pct(30), 0, pct(100)],
    "24": [FULL, FULL, FULL, FULL, FULL, FULL],
  };

  /* ------------------------------------------------------------------ */
  /* État par pièce (valeurs de départ réalistes)                         */
  /* ------------------------------------------------------------------ */
  var roomNames = {};
  function makeRoom(temp, setpoint, mode, source, volume, scene) {
    return {
      temp: temp, setpoint: setpoint, mode: mode,
      source: source, volume: volume, mute: false,
      scene: scene, circuits: SCENE_PRESETS[scene].slice(),
    };
  }
  var rooms = {
    1: makeRoom(21.5, 22.0, "CHAUFFAGE", 1, 32768, "23"),
    2: makeRoom(22.1, 21.0, "CHAUFFAGE", 0, 20000, "24"),
    3: makeRoom(21.8, 21.5, "CHAUFFAGE", 3, 28000, "23"),
    4: makeRoom(20.6, 20.0, "CHAUFFAGE", 2, 24000, "22"),
    5: makeRoom(20.2, 19.5, "CHAUFFAGE", 0, 18000, "21"),
    6: makeRoom(20.4, 19.5, "CHAUFFAGE", 0, 18000, "21"),
    7: makeRoom(22.4, 21.0, "CLIMATISATION", 4, 26000, "24"),
    8: makeRoom(19.8, 20.0, "CHAUFFAGE", 1, 40000, "22"),
    9: makeRoom(20.1, 19.5, "CHAUFFAGE", 0, 18000, "21"),
    10: makeRoom(21.0, 21.0, "CHAUFFAGE", 5, 22000, "23"),
    11: makeRoom(24.2, 22.0, "CLIMATISATION", 5, 30000, "24"),
    12: makeRoom(28.5, 28.0, "CHAUFFAGE", 5, 26000, "23"),
    13: makeRoom(45.0, 60.0, "CHAUFFAGE", 0, 12000, "22"),
    14: makeRoom(23.1, 22.0, "CLIMATISATION", 2, 34000, "24"),
    15: makeRoom(17.4, 16.0, "HORS GEL", 0, 10000, "21"),
  };
  var activeRoom = 1;
  var alarmLegacyArmed = false;
  var partitions = ["disarmed", "disarmed", "armed", "disarmed"];
  var hvacPreset = "407";
  var poweredOff = false;

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
  function roomJoin(id) { return String(id <= 10 ? 10 + id : 110 + id); }
  function roomFromJoin(n) { if (n >= 11 && n <= 20) return n - 10; if (n >= 121 && n <= 125) return n - 110; return 0; }

  function publishRoom(id) {
    var r = rooms[id];
    set("n", SIG.ROOM_ID, id);
    set("s", SIG.ROOM_ID, roomNames[id] || ("Pièce " + id));
    for (var i = 1; i <= SIG.ROOM_COUNT; i++) set("b", roomJoin(i), i === id);
    set("s", SIG.TEMP_ACTUAL, fmtTemp(r.temp));
    set("s", SIG.TEMP_SETPOINT, fmtTemp(r.setpoint));
    set("s", SIG.HVAC_MODE, r.mode);
    publishSource(r);
    set("n", SIG.VOLUME, r.volume);
    set("n", SIG.VOLUME2, r.volume);
    set("b", SIG.MUTE, r.mute);
    set("b", SIG.MUTE2, r.mute);
    SIG.SCENES.forEach(function (s) { set("b", s, s === r.scene); });
    SIG.CIRCUITS.forEach(function (c, idx) { set("n", c, r.circuits[idx]); });
  }

  function publishSource(r) {
    set("n", SIG.SOURCE_ID, r.source);
    SIG.SOURCES.forEach(function (s, idx) { set("b", s, idx === r.source); });
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
    SIG.SCENES.forEach(function (s) { set("b", s, s === sceneId); });
    SIG.CIRCUITS.forEach(function (c, idx) { set("n", c, r.circuits[idx]); });
  }

  function selectSource(idx) {
    var r = rooms[activeRoom];
    r.source = idx;
    poweredOff = idx === 0;
    publishSource(r);
    if (idx === 0) { r.mute = false; set("b", SIG.MUTE, false); set("b", SIG.MUTE2, false); }
  }

  function powerOff() {
    selectSource(0);
    pulse(SIG.POWER_OFF, 250);
    pulse(SIG.POWER_OFF_LEGACY, 250);
  }

  function toggleMute() {
    var r = rooms[activeRoom];
    r.mute = !r.mute;
    set("b", SIG.MUTE, r.mute);
    set("b", SIG.MUTE2, r.mute);
  }

  function adjustSetpoint(delta) {
    var r = rooms[activeRoom];
    r.setpoint = Math.max(5, Math.min(90, Math.round((r.setpoint + delta) * 2) / 2));
    set("s", SIG.TEMP_SETPOINT, fmtTemp(r.setpoint));
    if (r.mode !== "HORS GEL") {
      r.mode = r.setpoint < r.temp - 0.4 ? "CLIMATISATION" : "CHAUFFAGE";
      set("s", SIG.HVAC_MODE, r.mode);
    }
  }

  function setHvacPreset(id) {
    hvacPreset = id;
    Object.keys(SIG.HVAC_MODES).forEach(function (k) { set("b", k, k === id); });
    var r = rooms[activeRoom];
    r.setpoint = SIG.HVAC_MODES[id][1];
    r.mode = id === "409" ? "HORS GEL" : (r.setpoint < r.temp - 0.4 ? "CLIMATISATION" : "CHAUFFAGE");
    set("s", SIG.TEMP_SETPOINT, fmtTemp(r.setpoint));
    set("s", SIG.HVAC_MODE, r.mode);
  }

  function setPartition(i, mode) {
    partitions[i] = mode;
    var p = SIG.ALARM_PARTITIONS[i];
    set("b", p.armed, mode === "armed");
    set("b", p.partial, mode === "partial");
    set("b", p.disarmed, mode === "disarmed");
    var allArmed = partitions.every(function (m) { return m === "armed"; });
    var allDisarmed = partitions.every(function (m) { return m === "disarmed"; });
    set("b", SIG.ALARM_ALL_ARM, allArmed);
    set("b", SIG.ALARM_ALL_DISARM, allDisarmed);
    set("b", SIG.ALARM_ARM, !allDisarmed);
    set("b", SIG.ALARM_DISARM, allDisarmed);
  }

  function setAllLights(level) {
    Object.keys(rooms).forEach(function (k) {
      rooms[k].circuits = rooms[k].circuits.map(function () { return level; });
      rooms[k].scene = level === 0 ? "21" : level === FULL ? "24" : null;
    });
    set("b", SIG.ALL_LIGHTS_ON, level === FULL);
    set("b", SIG.ALL_LIGHTS_OFF, level === 0);
    publishRoom(activeRoom);
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
    if (id === SIG.POWER_OFF || id === SIG.POWER_OFF_LEGACY) return powerOff();
    if (id === SIG.MUTE || id === SIG.MUTE2) return toggleMute();
    if (id === SIG.TEMP_UP) return adjustSetpoint(0.5);
    if (id === SIG.TEMP_DOWN) return adjustSetpoint(-0.5);
    if (SIG.HVAC_MODES[id]) return setHvacPreset(id);
    if (id === SIG.ALL_LIGHTS_ON) return setAllLights(FULL);
    if (id === SIG.ALL_LIGHTS_OFF) return setAllLights(0);
    if (id === SIG.ALARM_ARM || id === SIG.ALARM_ALL_ARM) { for (var i = 0; i < 4; i++) setPartition(i, "armed"); return; }
    if (id === SIG.ALARM_DISARM || id === SIG.ALARM_ALL_DISARM) { for (var j = 0; j < 4; j++) setPartition(j, "disarmed"); return; }
    for (var p = 0; p < SIG.ALARM_PARTITIONS.length; p++) {
      var part = SIG.ALARM_PARTITIONS[p];
      if (id === part.armed) return setPartition(p, "armed");
      if (id === part.partial) return setPartition(p, "partial");
      if (id === part.disarmed) return setPartition(p, "disarmed");
    }
    // Tout le reste (moteurs 61..69 / 81..98, stores globaux 404/405, lecteur
    // média 211..220 / 251..253, widget météo 37…) est momentané.
    pulse(id, 120);
  }

  // Valeurs analogiques émises par les sliders
  function setAnalog(id, value) {
    id = String(id);
    var r = rooms[activeRoom];
    value = set("n", id, value);
    if (id === SIG.VOLUME || id === SIG.VOLUME2) {
      r.volume = value;
      set("n", id === SIG.VOLUME ? SIG.VOLUME2 : SIG.VOLUME, value);
    }
    var ci = SIG.CIRCUITS.indexOf(id);
    if (ci !== -1) {
      r.circuits[ci] = value;
      // Un réglage manuel désélectionne la scène courante
      if (r.scene) { r.scene = null; SIG.SCENES.forEach(function (s) { set("b", s, false); }); }
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
  function init(cfg) {
    (cfg && cfg.rooms ? cfg.rooms : []).forEach(function (r) { roomNames[r.id] = r.name; });
    for (var i = 0; i < 4; i++) setPartition(i, partitions[i]);
    Object.keys(SIG.HVAC_MODES).forEach(function (k) { set("b", k, k === hvacPreset); });
    var start = 1;
    try { start = parseInt(localStorage.getItem("active_room_id") || "1", 10) || 1; } catch (e) {}
    selectRoom(rooms[start] ? start : 1);
  }

  window.Villa = {
    SIG: SIG, on: on, off: off, get: get, set: set, press: press, setAnalog: setAnalog,
    selectRoom: selectRoom, init: init, state: state,
    get activeRoom() { return activeRoom; },
  };
})();
