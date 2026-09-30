/*
 * La Réserve Genève — bus de signaux du GUI.
 *
 * Un seul point de passage pour les commandes et les retours, sur les joins des programmes SIMPL existants
 * (numéros lus dans reserve_config.json, jamais écrits dans le GUI) :
 *   Bus.press(j)            impulsion digitale (front montant puis descendant, 60 ms)
 *   Bus.set(j, bool)        maintien d'un digital (Vol + / Vol − : la rampe est faite par SIMPL tant que le join est haut)
 *   Bus.on(type, j, cb)     abonnement ('b' digital, 'n' analogique, 's' sériel)
 *   Bus.get(type, j)        dernière valeur connue
 *
 * meta.mode = "deploiement" : CrComLib (Crestron One / TSW) ou WebXPanel (XPanel), retours du processeur CP3.
 * meta.mode = "showcase" : js/local-feedback.js reçoit les commandes et publie les retours sur les MÊMES joins.
 */
(function () {
  'use strict';
  var cfg = window.reserveConfig || {};
  var mode = (cfg.meta && cfg.meta.mode) || 'deploiement';
  var subs = { b: {}, n: {}, s: {} };
  var values = { b: {}, n: {}, s: {} };
  var bridged = { b: {}, n: {}, s: {} };
  var hasCrComLib = typeof window.CrComLib !== 'undefined';

  function deliver(t, j, v) {
    values[t][j] = v;
    var list = subs[t][j];
    if (list) for (var i = 0; i < list.length; i++) { try { list[i](v); } catch (e) { console.error(e); } }
    if (window.Bus && window.Bus.onAny) { try { window.Bus.onAny(t, j, v); } catch (e2) { console.error(e2); } }
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
    onAny: null,
    press: function (j) {
      if (!j) return;
      send('b', j, true);
      setTimeout(function () { send('b', j, false); }, 60);
    },
    set: function (j, v) { if (j) send('b', j, !!v); },
    on: function (t, j, cb) {
      if (!j) return;
      (subs[t][j] = subs[t][j] || []).push(cb);
      bridge(t, j);
      if (values[t][j] !== undefined) cb(values[t][j]);
    },
    get: function (t, j) { return values[t][j]; },
    deliver: deliver
  };
})();
