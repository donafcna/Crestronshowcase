/* ===========================================================================
 * VillaJoins — traduction des joins LOGIQUES en joins PHYSIQUES par pièce
 * Contrat de joins v3 (11.09.2026) — voir villa_config.json > contrat.blocsPiecesGui
 *
 * Pourquoi : jusqu'au contrat v2, les 15 pièces partageaient UN SEUL jeu de joins,
 * la pièce courante étant portée par l'analogique 10. Sur un seul panneau cela
 * fonctionne ; dès que deux supports physiques (dalle TSW-1070, iPad, iPhone,
 * XPanel) affichent deux pièces différentes, ils écrivent sur les mêmes joins et
 * se volent mutuellement leurs commandes et leurs feedbacks.
 *
 * Principe : le HTML garde ses joins historiques (dits « logiques ») — les règles
 * CSS et les sélecteurs JS continuent donc de fonctionner. À l'exécution, cette
 * couche réécrit les attributs de join des composants CH5 et détourne
 * CrComLib.publishEvent / subscribeState vers le join PHYSIQUE :
 *
 *     joinPhysique = 1000 + (pieceId - 1) * 100 + offset
 *
 * Les joins hors mapping (sélection de pièce, alarme, presets globaux,
 * télécommandes, système) restent globaux et ne sont jamais traduits.
 *
 * En mode showcase, la couche est inerte (identité) : le site vitrine n'a qu'un
 * seul panneau virtuel et js/local-feedback.js travaille sur les joins logiques.
 * =========================================================================== */
(function () {
    'use strict';
    if (window.VillaJoins) { return; }

    /* ---------- Attributs de join des composants CH5 ---------- */
    var ATTRS = [
        'sendEventOnClick', 'sendEventOnTouch', 'sendEventOnUp', 'sendEventOnDown',
        'sendEventOnChange', 'receiveStateSelected', 'receiveStateValue',
        'receiveStateVisible', 'receiveStateEnabled', 'receiveStateLabel',
        'receiveStateBrightness'
    ];
    var ATTR_TYPE = {
        sendeventonclick: 'b', sendeventontouch: 'b', sendeventonup: 'b', sendeventondown: 'b',
        receivestateselected: 'b', receivestatevisible: 'b', receivestateenabled: 'b',
        receivestatevalue: 'n', receivestatebrightness: 'n',
        receivestatelabel: 's'
    };
    /* Attribut « miroir » stable, conservé au join LOGIQUE, pour que les règles CSS
       et les querySelector puissent cibler un bouton sans dépendre de la pièce. */
    var ALIAS = {
        sendeventonclick: 'data-join',
        receivestateselected: 'data-rjoin',
        sendeventonchange: 'data-cjoin',
        receivestatevalue: 'data-vjoin'
    };
    var ATTR_LOWER = {};
    ATTRS.forEach(function (a) { ATTR_LOWER[a.toLowerCase()] = a; });

    var MAP = { b: {}, n: {}, s: {} };
    var active = false;
    var roomId = 1;
    var base = 0;
    var tailleBloc = 100;
    var pieceMax = 30;
    var SUBS = [];            // abonnements dépendant de la pièce
    var lib = null;           // CrComLib réel
    var readyQueue = [];
    var _setAttr = Element.prototype.setAttribute;
    var rebinding = false;

    /* ---------- Chargement de la table depuis villa_config ---------- */
    function loadMapping() {
        var vc = window.villaConfig || window.villaConfigEmbedded || null;
        if (!vc || !vc.contrat || !vc.contrat.blocsPiecesGui) { return false; }
        var bp = vc.contrat.blocsPiecesGui;
        var mode = (vc.meta && vc.meta.mode) || 'deploiement';
        var appliqueEn = bp.appliqueEn || ['deploiement'];
        if (bp.actif !== true || appliqueEn.indexOf(mode) === -1) {
            active = false;
            return true;                       // table lue, volontairement inactive
        }
        tailleBloc = bp.tailleBloc || 100;
        pieceMax = bp.pieceMax || 30;
        var m = bp.mapping || {};
        MAP.b = m.digital || {};
        MAP.n = m.analog || {};
        MAP.s = m.serial || {};
        active = true;
        return true;
    }

    function computeBase(id) {
        return 1000 + (id - 1) * tailleBloc;
    }

    /* ---------- Cœur : join logique -> join physique ---------- */
    function phys(type, join) {
        var s = String(join);
        if (!active) { return s; }
        var t = MAP[type] ? MAP[type] : null;
        if (!t) { return s; }
        var off = t[s];
        if (off === undefined) { return s; }   // join global : jamais traduit
        return String(base + off);
    }

    function typeFor(el, attrName) {
        var low = String(attrName).toLowerCase();
        if (low === 'sendeventonchange') {
            return (el && el.tagName === 'CH5-SLIDER') ? 'n' : 'b';
        }
        return ATTR_TYPE[low] || 'b';
    }

    /* ---------- Marquage + réécriture d'un élément ---------- */
    function bindElement(el) {
        if (!el || !el.tagName || el.tagName.indexOf('CH5-') !== 0) { return; }
        for (var i = 0; i < ATTRS.length; i++) {
            var a = ATTRS[i];
            var low = a.toLowerCase();
            var key = 'vj' + a;
            var logical = el.dataset ? el.dataset[key] : undefined;
            if (logical === undefined) {
                var cur = el.getAttribute(a);
                if (cur === null || cur === '') { continue; }
                cur = String(cur).trim();
                if (!/^\d+$/.test(cur)) { continue; }   // join calculé / template : laissé tel quel
                var t0 = typeFor(el, a);
                var estLogique = !active || !MAP[t0] || MAP[t0][cur] !== undefined;
                // Alias stable pour les règles CSS et les querySelector : il porte TOUJOURS le
                // join logique et n'est jamais réécrit (sinon les sélecteurs [data-join="155"]
                // cesseraient de matcher dès le premier changement de pièce).
                if (ALIAS[low] && !el.hasAttribute(ALIAS[low]) && estLogique) {
                    _setAttr.call(el, ALIAS[low], cur);
                }
                if (!active) { continue; }
                if (!MAP[t0] || MAP[t0][cur] === undefined) { continue; } // global
                el.dataset[key] = cur;
                logical = cur;
            }
            if (!active) { continue; }
            var ph = phys(typeFor(el, a), logical);
            if (el.getAttribute(a) !== ph) {
                rebinding = true;
                try { _setAttr.call(el, a, ph); } finally { rebinding = false; }
            }
        }
    }

    function scan(root) {
        var scope = root || document;
        if (!scope || !scope.querySelectorAll) { return; }
        var list = scope.querySelectorAll('ch5-button, ch5-slider, ch5-toggle, ch5-list, ch5-textinput, ch5-select, ch5-image, ch5-spinner');
        for (var i = 0; i < list.length; i++) { bindElement(list[i]); }
        if (scope.tagName && scope.tagName.indexOf('CH5-') === 0) { bindElement(scope); }
    }

    /* ---------- Interception des joins posés au runtime ---------- */
    Element.prototype.setAttribute = function (name, value) {
        if (active && !rebinding && this.tagName && this.tagName.indexOf('CH5-') === 0) {
            var canon = ATTR_LOWER[String(name).toLowerCase()];
            if (canon) {
                var s = String(value).trim();
                if (/^\d+$/.test(s)) {
                    var low = canon.toLowerCase();
                    var t = typeFor(this, canon);
                    if (MAP[t] && MAP[t][s] !== undefined) {
                        // Valeur logique : on pose l'alias (une seule fois) puis le join physique.
                        if (ALIAS[low] && !this.hasAttribute(ALIAS[low])) { _setAttr.call(this, ALIAS[low], s); }
                        if (this.dataset) { this.dataset['vj' + canon] = s; }
                        return _setAttr.call(this, canon, phys(t, s));
                    }
                    // Valeur déjà physique (réflexion interne d'un composant CH5) ou join global :
                    // on ne touche NI l'alias NI la valeur.
                    if (ALIAS[low] && !this.hasAttribute(ALIAS[low]) && !/^\d{4}$/.test(s)) {
                        _setAttr.call(this, ALIAS[low], s);
                    }
                }
            }
        }
        return _setAttr.call(this, name, value);
    };

    /* ---------- Changement de pièce ---------- */
    function setRoom(id) {
        id = parseInt(id, 10);
        if (!id || id < 1 || id > pieceMax) { return; }
        if (id === roomId && base === computeBase(id)) { return; }
        roomId = id;
        base = computeBase(id);
        try { localStorage.setItem('villa_joins_room', String(id)); } catch (e) {}
        if (!active) { return; }
        scan(document);
        resubscribeAll();
        if (window.console && console.info) {
            console.info('[VillaJoins] pièce ' + id + ' → bloc de joins ' + base + '..' + (base + tailleBloc - 1));
        }
    }

    function resubscribeAll() {
        if (!rawSub || !rawTarget) { return; }
        for (var i = 0; i < SUBS.length; i++) {
            var r = SUBS[i];
            var np = phys(r.t, r.j);
            if (np === r.phys) { continue; }
            if (rawUnsub) { try { rawUnsub.call(rawTarget, r.t, r.phys, r.id); } catch (e) {} }
            r.phys = np;
            try { r.id = rawSub.call(rawTarget, r.t, np, r.cb); } catch (e) {}
        }
    }

    /* ---------- Détournement de CrComLib ---------- */
    var rawSub = null, rawUnsub = null, rawTarget = null;

    function wrap(real) {
        if (!real || real.__vjWrapped) { return real; }
        var _pub = real.publishEvent, _sub = real.subscribeState, _unsub = real.unsubscribeState;
        // webxpanel.js expose un objet dont les propriétés sont en lecture seule, et
        // ch5-components.js un espace de noms webpack : on ne mute JAMAIS l'objet reçu,
        // on renvoie un objet dérivé qui hérite de tout le reste (Ch5Button, etc.).
        if (typeof _pub !== 'function' || typeof _sub !== 'function') { return real; }

        // Les espaces de noms webpack (ch5-components.js) et l'objet de webxpanel.js exposent
        // leurs membres en ACCESSEURS sans setter : une simple affectation `w.publishEvent = ...`
        // remonte l'accesseur hérité et lève en mode strict. On définit donc des propriétés
        // propres à l'objet dérivé avec defineProperty.
        var w = Object.create(real);
        function def(name, fn) {
            Object.defineProperty(w, name, { value: fn, writable: true, configurable: true, enumerable: true });
        }
        try { Object.defineProperty(w, '__vjWrapped', { value: true }); } catch (e) {}

        def('publishEvent', function (type, join, value) {
            var s = String(join);
            if (type === 'n' && s === '10' && value) { setRoom(value); }
            if (type === 'b' && value === true) {
                var n = parseInt(s, 10);
                if (n >= 11 && n <= 10 + pieceMax) { setRoom(n - 10); }
            }
            return _pub.call(real, type, phys(type, join), value);
        });

        def('subscribeState', function (type, join, cb) {
            var j = String(join);
            var p = phys(type, j);
            var id = _sub.call(real, type, p, cb);
            if (active && MAP[type] && MAP[type][j] !== undefined) {
                SUBS.push({ t: type, j: j, phys: p, cb: cb, id: id });
            }
            return id;
        });

        if (typeof _unsub === 'function') {
            def('unsubscribeState', function (type, join, id) {
                for (var i = SUBS.length - 1; i >= 0; i--) {
                    if (SUBS[i].id === id) { SUBS.splice(i, 1); break; }
                }
                return _unsub.call(real, type, phys(type, String(join)), id);
            });
        }

        lib = w;
        rawTarget = real;
        rawSub = _sub;
        rawUnsub = (typeof _unsub === 'function') ? _unsub : null;
        var q = readyQueue; readyQueue = [];
        q.forEach(function (fn) { try { fn(w); } catch (e) { console.error('[VillaJoins] whenReady', e); } });
        return w;
    }

    /* CrComLib peut être posé par webxpanel.js (XPanel) ou ch5-components.js (dalle) :
       on l'attrape quel que soit l'ordre de chargement. */
    function install() {
        var stored = window.CrComLib ? wrap(window.CrComLib) : undefined;
        try {
            Object.defineProperty(window, 'CrComLib', {
                configurable: true,
                get: function () { return stored; },
                set: function (v) { stored = wrap(v); }
            });
            return;
        } catch (e) {
            var t = setInterval(function () {
                if (window.CrComLib) { clearInterval(t); wrap(window.CrComLib); }
            }, 50);
        }
    }

    /* ---------- API publique ---------- */
    window.VillaJoins = {
        /** Appelle fn(CrComLib) dès que la bibliothèque CH5 est disponible. */
        whenReady: function (fn) {
            if (typeof fn !== 'function') { return; }
            if (lib && typeof lib.subscribeState === 'function') {
                try { fn(lib); } catch (e) { console.error('[VillaJoins] whenReady', e); }
            } else {
                readyQueue.push(fn);
            }
        },
        /** Join physique correspondant à un join logique pour la pièce courante. */
        phys: phys,
        /** Force la pièce de ce panel (appelé automatiquement sur l'analogique 10 / les digitaux 11-40). */
        setRoom: setRoom,
        /** Re-marque et re-mappe les composants CH5 d'un sous-arbre créé dynamiquement. */
        rescan: scan,
        get room() { return roomId; },
        get base() { return base; },
        get actif() { return active; },
        /** Diagnostic : table complète des joins physiques de la pièce courante. */
        table: function () {
            var out = {};
            ['b', 'n', 's'].forEach(function (t) {
                out[t] = {};
                Object.keys(MAP[t]).forEach(function (j) { out[t][j] = phys(t, j); });
            });
            return { piece: roomId, base: base, actif: active, joins: out };
        }
    };

    /* ---------- Démarrage ---------- */
    loadMapping();
    try {
        var saved = localStorage.getItem('villa_joins_room') || localStorage.getItem('active_room_id');
        if (saved) { roomId = parseInt(saved, 10) || 1; }
    } catch (e) {}
    base = computeBase(roomId);
    install();

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { loadMapping(); base = computeBase(roomId); scan(document); });
    } else {
        scan(document);
    }
    // La configuration peut arriver plus tard (transport sériel 105 depuis le CP4).
    window.addEventListener('villa-config-loaded', function () {
        loadMapping();
        base = computeBase(roomId);
        scan(document);
        resubscribeAll();
    });
})();
