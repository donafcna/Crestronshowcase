/*
 * La Réserve Genève — feedback local (vitrine, meta.mode = "showcase" uniquement).
 *
 * Reproduit en JavaScript le comportement des programmes SIMPL existants (Reserve Bar prg06, Reserve prg005) vu
 * depuis le panneau : sélection de source (texte sur le sériel « source courante »), Distribute / Off par groupe
 * (texte de la source sur le sériel du groupe), rampes Vol + / Vol − tant que le join est haut, bascule Mute,
 * demande d'extinction générale (retour de confirmation), extinction avec barre de progression, pages de zones.
 * En déploiement ce fichier ne fait rien : les retours viennent du CP3.
 */
(function () {
  'use strict';
  var cfg = window.reserveConfig;
  if (!cfg || !cfg.meta || cfg.meta.mode !== 'showcase') return;
  var FULL = cfg.echelleAnalogique || 65535;
  var out = function (t, j, v) { if (j) window.Bus.deliver(t, j, v); };
  var esp = null, zones = {}, groups = [], ramps = {}, current = '';

  function pct(p) { return Math.round(Math.max(0, Math.min(100, p)) * FULL / 100); }
  function allGroups(e) { var l = []; e.pages.forEach(function (p) { p.groupes.forEach(function (g) { l.push(g); }); }); return l; }

  function init(e) {
    esp = e; zones = {}; groups = allGroups(e); current = '';
    var k = 0;
    groups.forEach(function (g, gi) {
      g._src = '';
      g.zones.forEach(function (z) {
        zones[z.id] = { z: z, lvl: pct(34 + (k * 11) % 36), mute: false };
        k++;
      });
      // Démonstration vivante : le premier groupe de chaque page diffuse déjà la dernière source.
      if (g.diffuser && (gi === 0 || e.pages.some(function (p) { return p.groupes[0] === g; }))) g._src = e.sources[e.sources.length - 1].nom;
    });
    publishAll();
  }
  function publishAll() {
    var G = esp.global;
    out('b', G.connecte, true);
    out('s', G.sourceCourante, current);
    out('b', G.confirmationRetour, false);
    out('b', G.occupe, false);
    out('n', G.occupeProgression, 0);
    Object.keys(zones).forEach(function (id) { var s = zones[id]; out('n', s.z.niveau, s.lvl); out('b', s.z.muetRetour, s.mute); });
    groups.forEach(function (g) { out('s', g.retourSource, g._src); });
    esp.pages.forEach(function (p, i) { out('b', p.retour, i === 0); });
  }

  function ramp(zid, dir, on) {
    var key = zid + dir;
    if (ramps[key]) { clearInterval(ramps[key]); delete ramps[key]; }
    if (!on) return;
    var s = zones[zid];
    var step = function (d) { s.lvl = Math.max(0, Math.min(FULL, s.lvl + dir * d)); if (dir > 0 && s.mute) { s.mute = false; out('b', s.z.muetRetour, false); } out('n', s.z.niveau, s.lvl); };
    step(pct(3));
    ramps[key] = setInterval(function () { step(pct(1.5)); }, 120);
  }

  var offTimer = null;
  function generalOff() {
    var G = esp.global;
    out('b', G.confirmationRetour, false);
    var done = function () {
      groups.forEach(function (g) { g._src = ''; out('s', g.retourSource, ''); });
      current = ''; out('s', G.sourceCourante, '');
      out('b', G.occupe, false); out('n', G.occupeProgression, 0);
    };
    if (!G.occupe) { setTimeout(done, 400); return; }
    out('b', G.occupe, true);
    var t0 = Date.now(), dur = 3200;
    clearInterval(offTimer);
    offTimer = setInterval(function () {
      var r = Math.min(1, (Date.now() - t0) / dur);
      out('n', G.occupeProgression, Math.round(r * FULL));
      if (r >= 1) { clearInterval(offTimer); done(); }
    }, 100);
  }

  function receive(t, j, v) {
    if (t !== 'b' || !esp) return;
    var G = esp.global, i, k;
    // maintiens (Vol + / Vol −) : fronts montant ET descendant
    for (k in zones) {
      var z = zones[k].z;
      if (j === z.volPlus) { ramp(k, 1, v); return; }
      if (j === z.volMoins) { ramp(k, -1, v); return; }
    }
    if (!v) return;   // le reste réagit au front montant
    for (i = 0; i < esp.sources.length; i++) if (j === esp.sources[i].join) { current = esp.sources[i].nom; out('s', G.sourceCourante, current); return; }
    if (j === G.arretGeneralDemande.join) { out('b', G.confirmationRetour, true); return; }
    if (j === G.annuler) { out('b', G.confirmationRetour, false); return; }
    if (j === G.eteindre) { generalOff(); return; }
    if (j === G.fermer) return;
    for (i = 0; i < esp.pages.length; i++) if (esp.pages[i].bouton && j === esp.pages[i].bouton) {
      esp.pages.forEach(function (p, n) { out('b', p.retour, n === i); }); return;
    }
    for (k in zones) if (j === zones[k].z.muet) { zones[k].mute = !zones[k].mute; out('b', zones[k].z.muetRetour, zones[k].mute); return; }
    for (i = 0; i < groups.length; i++) {
      var g = groups[i];
      if (g.diffuser && j === g.diffuser) {
        if (!current) return;          // Distribute sans source choisie : sans effet, comme sur le panneau d'origine
        g._src = current; out('s', g.retourSource, current);
        g.zones.forEach(function (z) { if (zones[z.id].mute) { zones[z.id].mute = false; out('b', z.muetRetour, false); } });
        return;
      }
      if (g.arret && j === g.arret) { g._src = ''; out('s', g.retourSource, ''); return; }
    }
  }

  window.LocalFeedback = { receive: receive, init: init };
})();
