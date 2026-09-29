/*
 * Showroom FTV Nyon — connexion au processeur (déploiement seulement).
 * TSW-1070 et Crestron One (iPad / iPhone) : pont natif de CrComLib, rien à initialiser.
 * XPanel (navigateur PC/Mac) : WebXPanel, IP-ID lu dans ?ipId=0x.. sinon contrat.ecrans.xpanel.ipid (0x04),
 * jeton éventuel dans ?authtoken=... En vitrine (meta.mode = showcase), ce fichier ne fait rien.
 */
(function () {
  'use strict';
  var cfg = window.showroomConfig || {};
  if (!cfg.meta || cfg.meta.mode !== 'deploiement') return;
  window.isCp4Connected = false;
  if (typeof window.WebXPanel === 'undefined') return;
  try {
    var q = new URLSearchParams(location.search);
    var def = (cfg.contrat && cfg.contrat.ecrans && cfg.contrat.ecrans.xpanel && cfg.contrat.ecrans.xpanel.ipid) || '0x04';
    var ipId = q.get('ipId') || q.get('ipid') || def;
    var lib = window.WebXPanel;
    var inApp = typeof lib.runsInContainerApp === 'function' ? lib.runsInContainerApp() : false;
    var inst = typeof lib.getWebXPanel === 'function' ? lib.getWebXPanel(!inApp) : lib;
    if (!inst || !inst.isActive) { window.isCp4Connected = true; return; }   // conteneur natif : pas de WebXPanel
    window.crestronIpId = ipId;
    var opts = { ipId: ipId };
    var tok = q.get('authtoken') || q.get('token');
    if (tok) opts.authToken = tok;
    ['CONNECT_CIP', 'CONNECT_WS'].forEach(function (ev) { window.addEventListener(ev, function () { window.isCp4Connected = true; }); });
    ['DISCONNECT_CIP', 'DISCONNECT_WS'].forEach(function (ev) { window.addEventListener(ev, function () { window.isCp4Connected = false; }); });
    var wx = inst.WebXPanel || inst;
    if (typeof wx.initialize === 'function') wx.initialize(opts);
    else console.error('WebXPanel : méthode initialize introuvable');
  } catch (e) { console.error('WebXPanel : ' + e.message); }
})();
