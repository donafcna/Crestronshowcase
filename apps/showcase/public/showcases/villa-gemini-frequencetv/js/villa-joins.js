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
 *
 * v6.0 (30.09.2026) — MODE PONT SIMPL (meta.backend = "simpl", contrat.simplDirect) : plus de C#,
 * un seul programme SIMPL. La traduction se fait AU PONT NATIF (Ch5SignalBridge.sendXToNative à
 * l'émission, bridgeReceiveXFromNative à la réception) : c'est le seul endroit par lequel passent
 * TOUS les joins, y compris ceux figés dans les <ch5-button sendEventOnClick> — l'échec du contrat v3
 * venait de la réécriture d'attributs, que CH5 ignore après l'initialisation. Le HTML garde ses joins
 * logiques ; chaque écran émet et reçoit sur le bloc de la pièce qu'il affiche :
 *     joinPhysique = baseBloc + (pieceId - 1) * tailleBloc + offset     (1000 + (id-1)*150 + offset)
 * Les retours des autres pièces sont mémorisés et rejoués au changement de pièce.
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
        if (id === roomId && base === computeBase(id) && !S.on) { return; }
        if (id === roomId && S.on && S.replayed) { return; }
        if (S.on) { S.replayed = true; }
        roomId = id;
        base = computeBase(id);
        try { localStorage.setItem('villa_joins_room', String(id)); } catch (e) {}
        if (S.on) { echoRoomSelection(); replayRoom(); }
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

        // v6.0 : pont SIMPL (émission au pont natif, réception traduite) — inerte hors meta.backend = simpl.
        patchBridge(real);
        Object.keys(RCV).forEach(function (name) { if (typeof real[name] === 'function') { def(name, rcvWrap(RCV[name], real[name])); } });

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

    /* ---------- Mode pont SIMPL (v6.0) ---------- */
    var S = { on: false, B: 1000, T: 150, max: 30, map: { b: {}, n: {}, s: {} }, rev: { b: {}, n: {}, s: {} }, remote: null, save: null };
    var cache = { b: {}, n: {}, s: {} };
    // v6.0.8 — Diagnostic du pont (écran d'administration, appui long 3 s sur le titre) : ce que le natif livre
    // réellement à l'écran et ce que l'écran émet, pour une recette sans outil de développement sur la dalle.
    var diag = { rx: { b: 0, n: 0, s: 0, o: 0 }, livres: 0, retenus: 0, horsContrat: 0, tx: 0, inRx: [], inTx: [] };
    function note(list, txt) { list.push(new Date().toTimeString().slice(0, 8) + ' ' + txt); if (list.length > 8) { list.shift(); } }
    var rcvFn = { b: null, n: null, s: null };        // réception CH5 d'origine (join logique)
    var sendFn = { b: null, n: null, s: null }, bridgeSelf = null;
    function loadSimpl() {
        var vc = window.villaConfig || window.villaConfigEmbedded || null;
        var sd = vc && vc.contrat && vc.contrat.simplDirect;
        var mode = (vc && vc.meta && vc.meta.mode) || 'deploiement';
        S.on = !!(sd && vc.meta && vc.meta.backend === 'simpl' && mode === 'deploiement');
        if (!S.on) { return; }
        S.B = sd.baseBloc || 1000; S.T = sd.tailleBloc || 150; S.max = sd.pieceMax || 30;
        var m = sd.mapping || {};
        S.map = { b: m.digital || {}, n: m.analog || {}, s: m.serial || {} };
        ['b', 'n', 's'].forEach(function (t) { S.rev[t] = {}; Object.keys(S.map[t]).forEach(function (j) { S.rev[t][S.map[t][j]] = j; }); });
        S.remote = sd.telecommandes || null;
        S.save = sd.scenesMemoriser || null;
    }
    function sPhys(t, j) {
        var off = S.map[t][String(j)];
        return off === undefined ? String(j) : String(S.B + (roomId - 1) * S.T + off);
    }
    // Join physique reçu -> join logique de la pièce affichée ; null = autre pièce (mémorisé, non livré).
    function sLogical(t, name) {
        var n = parseInt(name, 10);
        if (isNaN(n) || n < S.B || n >= S.B + S.max * S.T) { return name; }
        var r = Math.floor((n - S.B) / S.T) + 1, L = S.rev[t][(n - S.B) % S.T];
        if (L === undefined) { return name; }
        return r === roomId ? L : null;
    }
    function isRemote(n) {
        var pl = (S.remote && S.remote.plages) || [];
        for (var i = 0; i < pl.length; i++) { if (n >= pl[i][0] && n <= pl[i][1]) { return true; } }
        return false;
    }
    function rawSend(t, sig, val) { if (sendFn[t] && bridgeSelf) { try { sendFn[t].call(bridgeSelf, String(sig), val); } catch (e) { } } }
    function bridgeOut(t, sig, val, send) {
        if (!S.on) { return send(sig, val); }
        if (!isNaN(parseInt(sig, 10))) { diag.tx++; note(diag.inTx, t + ' ' + sig + '→' + sPhys(t === 'o' ? 'b' : t, sig) + ' ' + (t === 'o' ? (val && val.repeatdigital ? 'appui' : 'relâché') : JSON.stringify(val)).slice(0, 24)); }
        // v6.0.7 — Les <ch5-button sendEventOnClick> n'émettent pas un booléen mais un objet « repeat digital »
        // ({repeatdigital: true|false}) par sendObjectToNative : même join, même traduction qu'un digital.
        // Sans ce cas, scènes, CVC, consigne et commandes groupées partaient sur le join logique et se perdaient.
        if (t === 'o') {
            var pressed = !!(val && typeof val === 'object' && val.repeatdigital === true);
            var m = parseInt(sig, 10);
            if (pressed && m >= 11 && m <= 10 + S.max) { setRoom(m - 10); }
            if (pressed && S.remote && isRemote(m)) { rawSend('n', S.remote.pieceAnalog, roomId); }
            return send(sPhys('b', sig), val);
        }
        var n = parseInt(sig, 10);
        if (t === 'b' && val === true && n >= 11 && n <= 10 + S.max) { setRoom(n - 10); }
        if (t === 'n' && sig === '10' && val) { setRoom(val); }
        // Scène mémorisée (appui long) : le JSON du C# devient une impulsion « Mémoriser scène N » de la pièce ;
        // le SIMPL recopie lui-même les niveaux courants de ses circuits en mémoire non volatile.
        if (t === 's' && S.save && sig === String(S.save.serial)) {
            try {
                var d = JSON.parse(val), idx = Number(d.s);
                if (idx >= 1 && idx <= 4) {
                    var p = sPhys('b', String(S.save.digital + idx - 1));
                    rawSend('b', p, true); setTimeout(function () { rawSend('b', p, false); }, 150);
                }
            } catch (e) { }
            return;
        }
        // Télécommandes : joins globaux ; la pièce qui les émet part d'abord sur l'analogique dédié.
        if (t === 'b' && val === true && S.remote && isRemote(n)) { rawSend('n', S.remote.pieceAnalog, roomId); }
        return send(sPhys(t, sig), val);
    }
    function patchBridge(obj) {
        var C = obj && obj.Ch5SignalBridge;
        if (!C || !C.prototype || C.prototype.__vjS) { return; }
        var P = C.prototype;
        try { Object.defineProperty(P, '__vjS', { value: true }); } catch (e) { P.__vjS = true; }
        [['sendBooleanToNative', 'b'], ['sendIntegerToNative', 'n'], ['sendStringToNative', 's'], ['sendObjectToNative', 'o']].forEach(function (x) {
            var orig = P[x[0]];
            if (typeof orig !== 'function') { return; }
            sendFn[x[1]] = orig;
            P[x[0]] = function (sig, val) {
                var self = this; bridgeSelf = self;
                return bridgeOut(x[1], String(sig), val, function (s2, v2) { return orig.call(self, s2, v2); });
            };
        });
    }
    function rcvWrap(t, fn) {
        if (typeof fn !== 'function' || fn.__vjS) { return fn; }
        rcvFn[t] = fn;
        var w = function (sig, val) {
            if (!S.on) { return fn.apply(this, arguments); }
            var s = String(sig), n = parseInt(s, 10);
            diag.rx[t]++;
            var Ld = sLogical('n', s); if (t !== 'o') { Ld = sLogical(t, s); }
            if (Ld === null) { diag.retenus++; } else if (Ld === s && !isNaN(n) && n >= S.B) { diag.horsContrat++; } else { diag.livres++; }
            note(diag.inRx, t + ' ' + s + '→' + (Ld === null ? 'autre pièce' : Ld) + ' ' + JSON.stringify(t === 'o' && val && val.rcb ? val.rcb.value : val).slice(0, 20));
            // v6.0.7 — bridgeReceiveObjectFromNative : analogique avec rampe ({rcb:{value,time}}) ; on mémorise la valeur
            // finale pour le rejeu au changement de pièce et on traduit comme un analogique.
            if (t === 'o') {
                var v = (val && val.rcb && val.rcb.value !== undefined) ? val.rcb.value : undefined;
                if (!isNaN(n) && v !== undefined) { cache.n[n] = v; }
                var Lo = sLogical('n', s);
                if (Lo === null) { return; }
                return fn.call(this, Lo, val);
            }
            if (!isNaN(n)) { cache[t][n] = val; }
            var L = sLogical(t, s);
            if (L === null) { return; }
            return fn.call(this, L, val);
        };
        w.__vjS = true;
        return w;
    }
    var RCV = { bridgeReceiveBooleanFromNative: 'b', bridgeReceiveIntegerFromNative: 'n', bridgeReceiveStringFromNative: 's', bridgeReceiveObjectFromNative: 'o' };
    // Le natif (dalle, Crestron One) appelle window.bridgeReceive* ; WebXPanel appelle CrComLib.bridgeReceive*.
    Object.keys(RCV).forEach(function (name) {
        var cur = rcvWrap(RCV[name], window[name]);
        try {
            Object.defineProperty(window, name, { configurable: true, get: function () { return cur; }, set: function (v) { cur = rcvWrap(RCV[name], v); } });
        } catch (e) { }
    });
    // v6.0.5 — La pièce affichée est propre à chaque écran : le processeur ne la connaît pas (joins 10-40 absents
    // du programme SIMPL). Le retour « pièce sélectionnée » (receiveStateSelected des boutons de pièce, analogique 10)
    // est donc produit ici, immédiatement, comme le faisait le C# en v5.
    function echoRoomSelection() {
        if (!S.on) { return; }
        try {
            if (rcvFn.b) { for (var i = 1; i <= S.max; i++) { rcvFn.b(String(10 + i), i === roomId); } }
            if (rcvFn.n) { rcvFn.n('10', roomId); }
        } catch (e) { }
    }
    // Changement de pièce : les retours mémorisés de la nouvelle pièce sont rejoués sous leur join logique.
    function replayRoom() {
        if (!S.on) { return; }
        var DEF = { b: false, n: 0, s: '' };
        ['b', 'n', 's'].forEach(function (t) {
            if (!rcvFn[t]) { return; }
            Object.keys(S.map[t]).forEach(function (L) {
                var p = parseInt(sPhys(t, L), 10), v = cache[t][p];
                try { rcvFn[t](L, v === undefined ? DEF[t] : v); } catch (e) { }
            });
        });
    }

    /* ---------- IP-ID des écrans Web XPanel ---------- */
    // v6.0.6 — Les IP-ID déclarés dans le programme SIMPL (simpl/direct/generate_simpl.js) : dalle 0x03, XPanel 0x04,
    // iPad 0x05, iPhone 0x06, XPanel QR par pièce 0x11..0x1F. Un IP-ID mémorisé par le navigateur hors de cette
    // liste (reste d'un autre projet, ex. 0x36) donnerait un écran « Online » mais muet : on retombe sur la valeur par défaut.
    function validIpId(id, fallback) {
        var n = parseInt(String(id || ''), 16);
        var ok = !isNaN(n) && ((n >= 3 && n <= 6) || (n >= 0x11 && n <= 0x1F));
        if (!ok && id && window.console && console.warn) { console.warn('[VillaJoins] IP-ID ' + id + ' inconnu du programme : ' + fallback + ' utilisé'); }
        return ok ? id : fallback;
    }

    /* ---------- API publique ---------- */
    window.VillaJoins = {
        /** IP-ID accepté par le programme SIMPL, sinon la valeur par défaut de l'écran. */
        validIpId: validIpId,
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
        /** v6.0 : vrai si la GUI parle directement au SIMPL (meta.backend = simpl). */
        get pontSimpl() { return S.on; },
        /** v6.0.8 : compteurs et derniers échanges du pont (diagnostic écran d'administration). */
        get diag() { return diag; },
        diagText: function () {
            if (!S.on) { return 'Pont SIMPL inactif (meta.backend ≠ simpl ou mode showcase).'; }
            var l = ['Pont SIMPL actif — pièce ' + roomId + ' (joins ' + (S.B + (roomId - 1) * S.T + 1) + '…' + (S.B + roomId * S.T) + ')',
                'Reçus du processeur : digitaux ' + diag.rx.b + ', analogiques ' + diag.rx.n + ' (+' + diag.rx.o + ' avec rampe), séries ' + diag.rx.s,
                '  → livrés à l\'écran ' + diag.livres + ' · retenus (autre pièce) ' + diag.retenus + ' · hors contrat ' + diag.horsContrat,
                'Émis vers le processeur : ' + diag.tx, '', 'Derniers reçus :'].concat(diag.inRx.length ? diag.inRx : ['  (aucun)'], ['', 'Derniers émis :'], diag.inTx.length ? diag.inTx : ['  (aucun)']);
            return l.join('\n');
        },
        /** v6.0 : join physique SIMPL d'un join logique pour la pièce affichée. */
        simplPhys: function (t, j) { return S.on ? sPhys(t, j) : String(j); },
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

    /* ---------- Pièces visibles ----------
       Une pièce portant « actif: false » dans villa_config.json sort des menus et du carrousel,
       sur TOUS les châssis (dalle, iPad, XPanel, smartphone) : même mécanisme que pagesSpeciales.
       Ses joins, son bloc EISC, son code C# et son QR restent en place — rien à recompiler côté
       SIMPL, et un seul mot à rebasculer pour la faire revenir.
       Point de vérité unique : ne plus relire vc.pieces directement pour construire une liste. */
    window.villaPiecesActives = function (vc) {
        var c = vc || window.villaConfig || window.villaConfigEmbedded || {};
        return (c.pieces || []).filter(function (p) { return p && p.actif !== false; });
    };

    /* ---------- Démarrage ---------- */
    loadMapping();
    loadSimpl();
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
    // v6.0 : la pièce affichée peut changer sans émission (dalle : changeRoomUI, iPhone : QR ?room=) — on la suit.
    document.addEventListener('villa-room-changed', function (ev) { if (S.on && ev && ev.detail && ev.detail.room) { setRoom(ev.detail.room); } });
    setInterval(function () {
        if (!S.on) { return; }
        var r = 0;
        try { r = parseInt(window.currentActiveRoomId || localStorage.getItem('active_room_iphone') || localStorage.getItem('active_room_id') || 0, 10); } catch (e) {}
        if (window.currentActiveRoomId) { r = parseInt(window.currentActiveRoomId, 10); }
        if (r && r !== roomId) { setRoom(r); }
    }, 300);
    window.addEventListener('villa-config-loaded', function () {
        loadSimpl();
        loadMapping();
        base = computeBase(roomId);
        scan(document);
        resubscribeAll();
    });
})();
