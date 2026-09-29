/*
 * Showroom FTV Nyon — bus de signaux du GUI.
 *
 * Un seul point de passage pour toutes les commandes et tous les retours :
 *   Bus.press(join)          impulsion digitale (front montant puis descendant)
 *   Bus.analog(join, v)      valeur analogique
 *   Bus.on(type, join, cb)   abonnement ('b' digital, 'n' analogique, 's' sériel)
 *   Bus.get(type, join)      dernière valeur connue
 *
 * meta.mode = "deploiement" : CrComLib (TSW / Crestron One) ou WebXPanel (XPanel) ; les retours viennent
 * du C# slot 1. meta.mode = "showcase" : js/local-feedback.js reçoit les commandes et publie les retours
 * sur les MÊMES joins (moteur identique au C#), sans processeur.
 *
 * Joins.of('Light_{n}_Toggle', 3) → 113 : les numéros viennent de showroom_config.json → contrat,
 * jamais écrits en dur dans le GUI.
 */
(function () {
  'use strict';
  var cfg = window.showroomConfig || {};
  var mode = (cfg.meta && cfg.meta.mode) || 'deploiement';
  var subs = { b: {}, n: {}, s: {} };
  var values = { b: {}, n: {}, s: {} };
  var bridged = { b: {}, n: {}, s: {} };
  var hasCrComLib = typeof window.CrComLib !== 'undefined';

  function deliver(t, j, v) {
    values[t][j] = v;
    var list = subs[t][j];
    if (list) for (var i = 0; i < list.length; i++) { try { list[i](v); } catch (e) { console.error(e); } }
  }

  function bridge(t, j) {
    if (bridged[t][j] || mode !== 'deploiement' || !hasCrComLib) return;
    bridged[t][j] = true;
    window.CrComLib.subscribeState(t, String(j), function (v) { deliver(t, j, v); });
  }

  function send(t, j, v) {
    if (mode === 'showcase') { if (window.LocalFeedback) window.LocalFeedback.receive(t, j, v); return; }
    if (hasCrComLib) window.CrComLib.publishEvent(t, String(j), v);
  }

  window.Bus = {
    mode: mode,
    press: function (j) {
      if (!j) return;
      send('b', j, true);
      setTimeout(function () { send('b', j, false); }, 60);
    },
    analog: function (j, v) { if (j) send('n', j, Math.max(0, Math.min(65535, Math.round(v)))); },
    on: function (t, j, cb) {
      (subs[t][j] = subs[t][j] || []).push(cb);
      bridge(t, j);
      if (values[t][j] !== undefined) cb(values[t][j]);
    },
    get: function (t, j) { return values[t][j]; },
    deliver: deliver
  };

  // ---------------------------------------------------------------------------------------------
  // Table des joins lue dans le contrat
  // ---------------------------------------------------------------------------------------------
  var table = { b: [], n: [], s: [] };
  var sg = (cfg.contrat && cfg.contrat.signauxGlobaux) || {};
  [['digital', 'b'], ['analog', 'n'], ['serial', 's']].forEach(function (p) {
    var block = sg[p[0]] || {};
    Object.keys(block).forEach(function (k) {
      var parts = String(k).split('-');
      table[p[1]].push({ start: +parts[0], end: +(parts[1] || parts[0]), name: block[k].nom });
    });
  });
  function find(name) {
    var types = ['b', 'n', 's'];
    for (var i = 0; i < types.length; i++) {
      var list = table[types[i]];
      for (var k = 0; k < list.length; k++) if (list[k].name === name) return list[k];
    }
    return null;
  }
  window.Joins = {
    of: function (name, n) {
      var e = find(name);
      if (!e) { console.error('Join inconnu dans le contrat : ' + name); return 0; }
      var j = e.start + ((n || 1) - 1);
      return j <= e.end ? j : 0;
    },
    table: table
  };
})();
