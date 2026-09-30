/*
 * La Réserve Genève — connexion au processeur (déploiement seulement).
 * Crestron One (iPad / iPhone) et TSW : pont natif de CrComLib, rien à initialiser.
 * XPanel (navigateur) : WebXPanel, IP-ID lu dans ?ipId=0x.. sinon espaces[].simpl.ipid ; jeton éventuel ?authtoken=.
 * En vitrine (meta.mode = showcase), ce fichier ne fait rien.
 */
(function () {
  'use strict';
  var cfg = window.reserveConfig || {};
  if (!cfg.meta || cfg.meta.mode !== 'deploiement') return;
  window.isCp3Connected = false;
  if (typeof window.WebXPanel === 'undefined') return;
  try {
    var q = new URLSearchParams(location.search);
    var id = q.get('espace') || cfg.meta.espace, def = '0x04';
    (cfg.espaces || []).forEach(function (e) { if (e.id === id) def = e.simpl.ipid; });
    var ipId = q.get('ipId') || q.get('ipid') || def;
    var lib = window.WebXPanel;
    var inApp = typeof lib.runsInContainerApp === 'function' ? lib.runsInContainerApp() : false;
    var inst = typeof lib.getWebXPanel === 'function' ? lib.getWebXPanel(!inApp) : lib;
    if (!inst || !inst.isActive) { window.isCp3Connected = true; return; }
    window.crestronIpId = ipId;
    var opts = { ipId: ipId };
    var tok = q.get('authtoken') || q.get('token');
    if (tok) opts.authToken = tok;
    ['CONNECT_CIP', 'CONNECT_WS'].forEach(function (ev) { window.addEventListener(ev, function () { window.isCp3Connected = true; }); });
    ['DISCONNECT_CIP', 'DISCONNECT_WS'].forEach(function (ev) { window.addEventListener(ev, function () { window.isCp3Connected = false; }); });
    var wx = inst.WebXPanel || inst;
    if (typeof wx.initialize === 'function') wx.initialize(opts);
    else console.error('WebXPanel : méthode initialize introuvable');
  } catch (e) { console.error('WebXPanel : ' + e.message); }
})();
