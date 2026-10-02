/* Villa FTV v6.1 — navigation entre pièces : menu de gauche visible ou non, pièces proposées, pièce par défaut.
   Partagé par index.html (dalle, iPad, XPanel) et iphone.html. Aucune dépendance.

   Réglage dans villa_config.json :
     "interface": { "menuPieces": { "visible": true, "pieces": [7, 2, 3], "pieceParDefaut": 7 } }
     - visible        : false = pas de menu de gauche, contenu sur toute la largeur, nom de la pièce en titre ;
     - pieces         : identifiants des pièces proposées, dans l'ordre ([] ou absent = toutes, ordre de la config) ;
     - pieceParDefaut : pièce affichée au démarrage (sinon la première proposée).
   Bloc absent = comportement historique (menu visible, toutes les pièces).

   Les paramètres d'adresse priment sur le JSON (QR codes, site vitrine) : ?menu=0 masque le menu,
   ?room=N choisit la pièce ; ?menu=1 force le menu. */
(function () {
    'use strict';
    var params = {};
    try { params = Object.fromEntries(new URLSearchParams(window.location.search).entries()); } catch (e) { }

    function cfg() { return window.villaConfig || window.villaConfigEmbedded || null; }
    function block() { var c = cfg(); return (c && c.interface && c.interface.menuPieces) || {}; }
    function num(v) { var n = parseInt(v, 10); return isNaN(n) ? 0 : n; }

    /** Le menu de gauche doit-il être affiché ? */
    function menuVisible() {
        if (params.menu === '0' || params.menu === 'false') { return false; }
        if (params.menu === '1' || params.menu === 'true') { return true; }
        return block().visible !== false;
    }
    /** Pièces proposées (sous-ensemble ordonné de `rooms`, objets {id, name}). */
    function allowedRooms(rooms) {
        var list = rooms || [];
        var ids = block().pieces;
        if (!Array.isArray(ids) || !ids.length) { return list.slice(); }
        var out = [];
        ids.forEach(function (id) { var r = list.filter(function (x) { return x.id === num(id); })[0]; if (r && out.indexOf(r) < 0) { out.push(r); } });
        return out.length ? out : list.slice();
    }
    function isAllowed(id, rooms) { return allowedRooms(rooms).some(function (r) { return r.id === num(id); }); }
    /** Pièce de départ : adresse (?room=), puis pieceParDefaut, puis la mémoire de l'écran, puis la première proposée. */
    function defaultRoom(rooms, remembered) {
        var ok = allowedRooms(rooms);
        var cand = [num(params.room), num(block().pieceParDefaut), num(remembered)];
        for (var i = 0; i < cand.length; i++) {
            if (cand[i] && (!ok.length || ok.some(function (r) { return r.id === cand[i]; }))) { return cand[i]; }
        }
        return ok.length ? ok[0].id : 1;
    }
    /** Pose la classe de mise en page sur <body> ; à rappeler après chargement de la config. */
    function apply() {
        var b = document.body; if (!b) { return; }
        b.classList.toggle('vn-no-menu', !menuVisible());
    }

    /* ---------- Fenêtre « choisir une pièce » (GUI sans menu, plusieurs pièces proposées) ---------- */
    var onPick = null;
    function closePicker() { var o = document.getElementById('vn-rooms-overlay'); if (o) { o.style.display = 'none'; } }
    function openPicker(rooms, currentId) {
        var ok = allowedRooms(rooms);
        if (ok.length < 2) { return false; }
        var o = document.getElementById('vn-rooms-overlay');
        if (!o) {
            o = document.createElement('div'); o.id = 'vn-rooms-overlay'; o.className = 'vn-rooms-overlay';
            o.addEventListener('click', function (ev) { if (ev.target === o) { closePicker(); } });
            document.body.appendChild(o);
        }
        var h = '<div class="vn-rooms-panel" role="dialog" aria-modal="true"><div class="vn-rooms-grid">';
        ok.forEach(function (r) {
            h += '<button type="button" class="vn-room-btn' + (r.id === num(currentId) ? ' vn-current' : '') + '" data-room="' + r.id + '">' + esc(r.name) + '</button>';
        });
        h += '</div><button type="button" class="vn-room-close" aria-label="Fermer">&#x2715;</button></div>';
        o.innerHTML = h;
        o.querySelectorAll('.vn-room-btn').forEach(function (btn) {
            btn.addEventListener('click', function () { closePicker(); if (onPick) { onPick(num(btn.getAttribute('data-room'))); } });
        });
        o.querySelector('.vn-room-close').addEventListener('click', closePicker);
        o.style.display = 'flex';
        return true;
    }
    function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

    window.VillaNav = {
        params: params,
        menuVisible: menuVisible,
        allowedRooms: allowedRooms,
        isAllowed: isAllowed,
        defaultRoom: defaultRoom,
        apply: apply,
        openPicker: openPicker,
        closePicker: closePicker,
        /** Fonction appelée avec l'identifiant choisi dans la fenêtre. */
        onPick: function (fn) { onPick = fn; }
    };
    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', apply); } else { apply(); }
    window.addEventListener('villa-config-loaded', apply);
})();
