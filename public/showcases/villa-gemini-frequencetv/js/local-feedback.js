/**
 * Villa Crans-Montana — moteur d'état local (100 % front-end).
 *
 * Toute la logique métier de l'interface (pièces, scènes, sources, volume,
 * mute, alarme, thermostat, circuits d'éclairage, moteurs) vit ici, en
 * JavaScript, dans le navigateur. Aucun automate, aucun programme externe :
 * les composants CH5 (<ch5-button>, <ch5-slider>, data-ch5-textcontent)
 * lisent et écrivent des "signaux" nommés dans ce moteur, exactement comme
 * ils le feraient avec un système de contrôle, mais tout est simulé ici.
 *
 * API :
 *   Villa.on(type, id, cb)      s'abonner à un signal ('b' booléen, 'n' nombre, 's' texte)
 *   Villa.off(type, id, subId)  se désabonner
 *   Villa.get(type, id)         lire la valeur courante
 *   Villa.set(type, id, value)  écrire une valeur et notifier les abonnés
 *   Villa.press(id)             appui sur un bouton (front montant d'un signal booléen)
 *   Villa.state                 état interne (lecture seule, pour le débogage)
 */
(function () {
  "use strict";

  /* ------------------------------------------------------------------ */
  /* Table des signaux                                                    */
  /* ------------------------------------------------------------------ */
  var SIG = {
    ROOM_ID: "10",          // n : pièce active (1..8) — s : nom de la pièce
    ROOM_BTN_BASE: 10,      // b 11..18 : boutons de pièce
    SCENES: ["21", "22", "23", "24"],       // b : OFF, CINÉMA, REPAS, TOTAL
    TEMP_ACTUAL: "32",      // s : température mesurée
    HVAC_MODE: "33",        // s : mode CVC
    TEMP_SETPOINT: "34",    // s : consigne
    TEMP_UP: "35",          // b : consigne +
    TEMP_DOWN: "36",        // b : consigne −
    WEATHER_TAP: "37",      // b : appui sur le widget météo (momentané)
    ALARM_ARM: "41",        // b
    ALARM_DISARM: "42",     // b
    SOURCE_ID: "51",        // n : source active (0 = veille)
    VOLUME: "52",           // n : volume 0..65535
    MUTE: "53",             // b
    SOURCES: ["150", "151", "152", "153", "154"], // b : OFF, APPLE TV, SKY Q, SWISSCOM, IPTV
    CIRCUITS: ["71", "72", "73", "74", "75", "76"], // n : gradateurs 0..65535
  };
  var FULL = 65535;
  var pct = function (p) { return Math.round((FULL * p) / 100); };

  // Presets d'éclairage des scènes (par circuit : spots, lustre, appliques, ruban, liseuse, table)
  var SCENE_PRESETS = {
    "21": [0, 0, 0, 0, 0, 0],
    "22": [pct(12), 0, pct(25), pct(35), 0, 0],
    "23": [pct(55), pct(80), pct(45), pct(30), 0, pct(100)],
    "24": [FULL, FULL, FULL, FULL, FULL, FULL],
  };

  /* ------------------------------------------------------------------ */
  /* État par pièce (valeurs de départ réalistes)                         */
  /* ------------------------------------------------------------------ */
  var roomNames = {};
  function makeRoom(temp, setpoint, mode, source, volume, scene, circuits) {
    return {
      temp: temp, setpoint: setpoint, mode: mode,
      source: source, volume: volume, mute: false,
      scene: scene, circuits: circuits.slice(),
    };
  }
  var rooms = {
    1: makeRoom(21.5, 22.0, "CHAUFFAGE", 1, 32768, "23", SCENE_PRESETS["23"]),
    2: makeRoom(22.1, 21.0, "CHAUFFAGE", 0, 20000, "24", SCENE_PRESETS["24"]),
    3: makeRoom(21.8, 21.5, "CHAUFFAGE", 3, 28000, "23", SCENE_PRESETS["23"]),
    4: makeRoom(20.6, 20.0, "CHAUFFAGE", 2, 24000, "22", SCENE_PRESETS["22"]),
    5: makeRoom(20.2, 19.5, "CHAUFFAGE", 0, 18000, "21", SCENE_PRESETS["21"]),
    6: makeRoom(20.4, 19.5, "CHAUFFAGE", 0, 18000, "21", SCENE_PRESETS["21"]),
    7: makeRoom(22.4, 21.0, "CLIMATISATION", 4, 26000, "24", SCENE_PRESETS["24"]),
    8: makeRoom(19.8, 20.0, "CHAUFFAGE", 1, 40000, "22", SCENE_PRESETS["22"]),
  };
  var activeRoom = 1;
  var alarmArmed = false;

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

  /* ------------------------------------------------------------------ */
  /* Logique métier                                                       */
  /* ------------------------------------------------------------------ */
  // Valeur numérique seule : l'unité (°C) est déjà dans le balisage
  function fmtTemp(v) { return v.toFixed(1); }

  function publishRoom(id) {
    var r = rooms[id];
    set("n", SIG.ROOM_ID, id);
    set("s", SIG.ROOM_ID, roomNames[id] || ("Pièce " + id));
    for (var i = 1; i <= 8; i++) set("b", String(SIG.ROOM_BTN_BASE + i), i === id);
    set("s", SIG.TEMP_ACTUAL, fmtTemp(r.temp));
    set("s", SIG.TEMP_SETPOINT, fmtTemp(r.setpoint));
    set("s", SIG.HVAC_MODE, r.mode);
    set("n", SIG.SOURCE_ID, r.source);
    SIG.SOURCES.forEach(function (s, idx) { set("b", s, idx === r.source); });
    set("n", SIG.VOLUME, r.volume);
    set("b", SIG.MUTE, r.mute);
    SIG.SCENES.forEach(function (s) { set("b", s, s === r.scene); });
    SIG.CIRCUITS.forEach(function (c, idx) { set("n", c, r.circuits[idx]); });
  }

  function selectRoom(id) {
    if (!rooms[id]) return;
    activeRoom = id;
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
    set("n", SIG.SOURCE_ID, idx);
    SIG.SOURCES.forEach(function (s, i) { set("b", s, i === idx); });
    if (idx === 0) { r.mute = false; set("b", SIG.MUTE, false); }
  }

  function adjustSetpoint(delta) {
    var r = rooms[activeRoom];
    r.setpoint = Math.max(16, Math.min(30, Math.round((r.setpoint + delta) * 2) / 2));
    set("s", SIG.TEMP_SETPOINT, fmtTemp(r.setpoint));
    r.mode = r.setpoint < r.temp - 0.4 ? "CLIMATISATION" : "CHAUFFAGE";
    set("s", SIG.HVAC_MODE, r.mode);
  }

  // Front montant d'un signal booléen (appui sur un bouton)
  var lastPress = {};
  function press(id) {
    id = String(id);
    var now = Date.now();
    if (lastPress[id] && now - lastPress[id] < 120) return; // anti-rebond (double émission)
    lastPress[id] = now;

    var n = Number(id);
    if (n >= 11 && n <= 18) return selectRoom(n - 10);
    if (SIG.SCENES.indexOf(id) !== -1) return applyScene(id);
    if (SIG.SOURCES.indexOf(id) !== -1) return selectSource(SIG.SOURCES.indexOf(id));
    if (id === SIG.ALARM_ARM || id === SIG.ALARM_DISARM) {
      alarmArmed = id === SIG.ALARM_ARM;
      set("b", SIG.ALARM_ARM, alarmArmed);
      set("b", SIG.ALARM_DISARM, !alarmArmed);
      return;
    }
    if (id === SIG.MUTE) {
      var r = rooms[activeRoom];
      r.mute = !r.mute;
      return set("b", SIG.MUTE, r.mute);
    }
    if (id === SIG.TEMP_UP) return adjustSetpoint(0.5);
    if (id === SIG.TEMP_DOWN) return adjustSetpoint(-0.5);
    // Tout le reste (moteurs 61..69 / 81..98, widget météo 37…) est momentané :
    // impulsion visible, sans état à mémoriser.
    set("b", id, true);
    setTimeout(function () { set("b", id, false); }, 120);
  }

  // Valeurs analogiques émises par les sliders
  function setAnalog(id, value) {
    id = String(id);
    var r = rooms[activeRoom];
    value = set("n", id, value);
    if (id === SIG.VOLUME) r.volume = value;
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
  // Les <ch5-button>/<ch5-slider> émettent leurs événements via le "pont"
  // interne de la bibliothèque CH5 (Ch5SignalBridge) et reçoivent leurs
  // retours d'état par bridgeReceive*FromNative. On branche les deux côtés
  // sur ce moteur : rien ne sort jamais du navigateur.
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
    // Point d'entrée générique de la bibliothèque (utilisé par ch5-button)
    P.publish = function (id, value) {
      if (value && typeof value === "object") return P.sendObjectToNative(id, value);
      if (typeof value === "boolean") return P.sendBooleanToNative(id, value);
      if (typeof value === "number") return P.sendIntegerToNative(id, value);
      if (typeof value === "string") return P.sendStringToNative(id, value);
    };
    ch5Bound = true;
    return true;
  }

  // Retour d'état vers les composants CH5 (receiveStateSelected, receiveStateValue, data-ch5-textcontent…)
  function feedCh5(type, id, value) {
    if (!ch5Bound) return;
    try {
      if (type === "b") CrComLib.bridgeReceiveBooleanFromNative(id, value);
      else if (type === "n") CrComLib.bridgeReceiveIntegerFromNative(id, value);
      else CrComLib.bridgeReceiveStringFromNative(id, value);
    } catch (e) { /* composant absent : sans conséquence */ }
  }

  // ch5-components.js est chargé juste avant ce fichier : liaison immédiate,
  // avec repli par sondage si l'ordre des scripts venait à changer.
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
    set("b", SIG.ALARM_ARM, alarmArmed);
    set("b", SIG.ALARM_DISARM, !alarmArmed);
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
