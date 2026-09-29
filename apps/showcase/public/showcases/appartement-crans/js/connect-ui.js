/* ===========================================================================
 * Interface « Connect » du Core (v5.4, 29.09.2026)
 * Activée uniquement si villa_config.json > meta.interface === "connect".
 * Réinterprétation d'une application d'éclairage/stores grand public :
 * liste des pièces, tuiles-curseurs par circuit, scènes en pastilles, stores,
 * climat, scènes globales et réglages ; barre d'onglets en bas.
 * Aucun A/V, aucune alarme, aucune caméra. Aucun son. Icônes SVG uniquement.
 *
 * Joins : strictement ceux du contrat v4.1 (identiques en déploiement et en
 * showcase) — sélection de pièce d(10+id), scènes d51-54, circuits a71-90,
 * moteurs d81-98 puis d129-146 (triplets Monter/Stop/Descendre), scènes de stores d201-204,
 * CVC a31/s32/d49/d50/d610-615/a61, globaux d401-409.
 * Le Core d'origine reste chargé (abonnements, transport de configuration),
 * il est seulement masqué par themes/connect.css.
 * =========================================================================== */
(function () {
    'use strict';
    if (window.ConnectUI) return;

    var PHONE_PAGE = /iphone\.html$/i.test(location.pathname);
    var state = {
        room: 0, tab: 'rooms', phoneDetail: false,
        levels: [], scene: 0, storeScene: 0,
        setpoint: null, temp: '', hvacOn: null, fan: null,
        globals: {}
    };
    var root = null, built = false, subs = [];

    /* ---------------- Configuration ---------------- */
    function cfg() { return window.villaConfig || window.villaConfigEmbedded || null; }
    function enabled() { var c = cfg(); return !!(c && c.meta && c.meta.interface === 'connect'); }
    function pieces() {
        var c = cfg();
        return ((c && c.pieces) || []).filter(function (p) { return p.actif !== false; });
    }
    function piece(id) { return pieces().filter(function (p) { return p.id === id; })[0] || null; }
    function pil(p) { return (p && p.pilotages) || {}; }
    function circuitsOf(p) {
        var e = pil(p).eclairages;
        if (!e || e.actif === false || !e.circuits) return [];
        return (e.circuits.noms || []).slice(0, 20);
    }
    function scenesOf(p) {
        var e = pil(p).eclairages, s = e && e.scenes;
        if (!e || e.actif === false) return [];
        var noms = (s && s.noms) || ['OFF', 'JOUR', 'SOIR', 'NUIT'];
        return noms.slice(0, Math.min((s && s.nombre) || 4, 4));
    }
    function motorsOf(p) {
        var m = pil(p).moteurs;
        if (!m || m.actif === false) return [];
        return (m.liste || []).slice(0, Math.min(m.nombre || (m.liste || []).length, 12));
    }
    function hasCvc(p) { var v = pil(p).cvc; return !!(v && v.actif); }

    /* ---------------- Langue ---------------- */
    var DICT = {
        fr: { rooms: 'Pièces', scenes: 'Scènes', shades: 'Stores', climate: 'Climat', settings: 'Réglages',
            off: 'Éteint', lightsOn: function (n) { return n === 0 ? 'Tout est éteint' : (n === 1 ? '1 éclairage allumé' : n + ' éclairages allumés'); },
            lights: 'Éclairage', roomScenes: 'Ambiances', level: 'Niveau', back: 'Pièces', up: 'Monter', stop: 'Arrêt', down: 'Descendre',
            storeScenes: 'Positions', temp: 'Température', setpoint: 'Consigne', heating: 'Marche', stopHvac: 'Arrêt', fan: 'Ventilation',
            fanAuto: 'Auto', minus: 'Diminuer', plus: 'Augmenter', theme: 'Thème', language: 'Langue', light: 'Clair', dark: 'Sombre', glass: 'Verre dépoli',
            about: 'À propos', version: 'Version', allOn: 'Tout allumer', allOff: 'Tout éteindre', eco: 'Éclairage doux',
            openAll: 'Ouvrir les stores', closeAll: 'Fermer les stores', middle: 'Position intermédiaire',
            comfort: 'Confort', night: 'Nuit', frost: 'Hors-gel', globalLights: 'Éclairage', globalShades: 'Stores', globalClimate: 'Climat',
            home: 'Logement', noShades: 'Aucun store motorisé', noClimate: 'Pas de régulation', lightsCount: function (n) { return n + (n > 1 ? ' éclairages' : ' éclairage'); },
            shadesCount: function (n) { return n + (n > 1 ? ' stores' : ' store'); } },
        en: { rooms: 'Rooms', scenes: 'Scenes', shades: 'Shades', climate: 'Climate', settings: 'Settings',
            off: 'Off', lightsOn: function (n) { return n === 0 ? 'All lights off' : (n === 1 ? '1 light on' : n + ' lights on'); },
            lights: 'Lighting', roomScenes: 'Scenes', level: 'Level', back: 'Rooms', up: 'Raise', stop: 'Stop', down: 'Lower',
            storeScenes: 'Positions', temp: 'Temperature', setpoint: 'Setpoint', heating: 'On', stopHvac: 'Off', fan: 'Fan',
            fanAuto: 'Auto', minus: 'Decrease', plus: 'Increase', theme: 'Theme', language: 'Language', light: 'Light', dark: 'Dark', glass: 'Frosted glass',
            about: 'About', version: 'Version', allOn: 'All lights on', allOff: 'All lights off', eco: 'Soft lighting',
            openAll: 'Open all shades', closeAll: 'Close all shades', middle: 'Mid position',
            comfort: 'Comfort', night: 'Night', frost: 'Frost protection', globalLights: 'Lighting', globalShades: 'Shades', globalClimate: 'Climate',
            home: 'Home', noShades: 'No motorised shade', noClimate: 'No climate control', lightsCount: function (n) { return n + (n > 1 ? ' lights' : ' light'); },
            shadesCount: function (n) { return n + (n > 1 ? ' shades' : ' shade'); } },
        de: { rooms: 'Räume', scenes: 'Szenen', shades: 'Storen', climate: 'Klima', settings: 'Einstellungen',
            off: 'Aus', lightsOn: function (n) { return n === 0 ? 'Alles aus' : (n === 1 ? '1 Licht an' : n + ' Lichter an'); },
            lights: 'Beleuchtung', roomScenes: 'Stimmungen', level: 'Ebene', back: 'Räume', up: 'Auf', stop: 'Stopp', down: 'Ab',
            storeScenes: 'Positionen', temp: 'Temperatur', setpoint: 'Sollwert', heating: 'Ein', stopHvac: 'Aus', fan: 'Lüftung',
            fanAuto: 'Auto', minus: 'Verringern', plus: 'Erhöhen', theme: 'Design', language: 'Sprache', light: 'Hell', dark: 'Dunkel', glass: 'Milchglas',
            about: 'Info', version: 'Version', allOn: 'Alles einschalten', allOff: 'Alles ausschalten', eco: 'Sanftes Licht',
            openAll: 'Storen öffnen', closeAll: 'Storen schliessen', middle: 'Zwischenposition',
            comfort: 'Komfort', night: 'Nacht', frost: 'Frostschutz', globalLights: 'Beleuchtung', globalShades: 'Storen', globalClimate: 'Klima',
            home: 'Wohnung', noShades: 'Keine motorisierte Store', noClimate: 'Keine Regelung', lightsCount: function (n) { return n + (n > 1 ? ' Lichter' : ' Licht'); },
            shadesCount: function (n) { return n + (n > 1 ? ' Storen' : ' Store'); } }
    };
    function lang() {
        var l = 'fr';
        try { l = localStorage.getItem('crestron_lang') || 'fr'; } catch (e) {}
        return DICT[l] ? l : 'fr';
    }
    function T(k) { return DICT[lang()][k]; }
    function tn(name) { return (window.villaTranslateName && name) ? window.villaTranslateName(name) : name; }

    /* ---------------- Icônes SVG ---------------- */
    var P = {
        bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>',
        shade: '<path d="M4 4h16M5 4v10h14V4M9 14v3M15 14v3"/><path d="M5 9h14"/>',
        temp: '<path d="M14 14.8V5a2 2 0 0 0-4 0v9.8a4 4 0 1 0 4 0z"/>',
        home: '<path d="M3 11l9-7 9 7M5 10v10h14V10"/>',
        star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
        gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
        chev: '<path d="M9 6l6 6-6 6"/>',
        back: '<path d="M15 6l-6 6 6 6"/>',
        up: '<path d="M6 15l6-6 6 6"/>',
        down: '<path d="M6 9l6 6 6-6"/>',
        stop: '<rect x="7" y="7" width="10" height="10" rx="1.5"/>',
        minus: '<path d="M6 12h12"/>',
        plus: '<path d="M12 6v12M6 12h12"/>',
        power: '<path d="M12 3v8M7 6.3a7 7 0 1 0 10 0"/>',
        fan: '<circle cx="12" cy="12" r="2"/><path d="M12 10c0-4 1-6 3-6s3 2 1 4l-4 2M14 12c4 0 6 1 6 3s-2 3-4 1l-2-4M12 14c0 4-1 6-3 6s-3-2-1-4l4-2M10 12c-4 0-6-1-6-3s2-3 4-1l2 4"/>',
        moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>',
        sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
        snow: '<path d="M12 2v20M4 7l16 10M20 7L4 17"/>',
        sofa: '<path d="M4 11V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3"/><path d="M2 13a2 2 0 0 1 4 0v2h12v-2a2 2 0 0 1 4 0v5H2z"/><path d="M5 18v2M19 18v2"/>',
        bed: '<path d="M3 18V6M3 13h18v5M21 18v-3a3 3 0 0 0-3-3h-8v1"/><circle cx="7" cy="10" r="1.6"/>',
        bath: '<path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z"/><path d="M6 12V5a2 2 0 0 1 3.5-1.3M6 20l-1 1.5M18 20l1 1.5"/>',
        kitchen: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M4 10h16M8 6.5h2M8 13v4"/>',
        dining: '<path d="M7 3v8a2 2 0 0 0 2 2v8M9 3v6M5 3v6M17 3c-2 1.5-2 6 0 8v10"/>',
        desk: '<path d="M3 9h18M5 9v11M19 9v11M14 9v6h5"/><rect x="7" y="3" width="7" height="6" rx="1"/>',
        tv: '<rect x="3" y="5" width="18" height="12" rx="2"/><path d="M8 21h8M12 17v4"/>',
        door: '<path d="M6 21V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17M4 21h16"/><circle cx="14.5" cy="12" r="1"/>',
        wc: '<path d="M7 3v9h11a5 5 0 0 1-5 5H9v4M7 7h11"/>',
        laundry: '<rect x="4" y="3" width="16" height="18" rx="2"/><circle cx="12" cy="13" r="4.5"/><path d="M8 6.5h1"/>',
        stairs: '<path d="M4 20h4v-4h4v-4h4V8h4"/>',
        leaf: '<path d="M5 19c0-8 5-14 15-15-1 10-7 15-15 15zM5 19l7-7"/>'
    };
    function icon(n, cls) { return '<svg class="cx-ico ' + (cls || '') + '" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + (P[n] || P.home) + '</svg>'; }
    var EMOJI_ICON = { '🛋️': 'sofa', '🛏️': 'bed', '🛁': 'bath', '🍳': 'kitchen', '🍽️': 'dining', '💼': 'desk', '📺': 'tv', '🎬': 'tv',
        '🚪': 'door', '🚻': 'wc', '🧺': 'laundry', '🪜': 'stairs', '🌿': 'leaf', '🏖️': 'leaf', '🏊': 'leaf' };
    function roomIcon(p) { return EMOJI_ICON[(p && p.icone) || ''] || 'home'; }

    /* ---------------- Signaux ---------------- */
    function lib() { return (typeof CrComLib !== 'undefined') ? CrComLib : null; }
    function pulse(join) {
        var L = lib(); if (!L) return;
        L.publishEvent('b', String(join), true);
        setTimeout(function () { L.publishEvent('b', String(join), false); }, 120);
    }
    function sendLevel(idx, v) { var L = lib(); if (L) L.publishEvent('n', String(71 + idx), Math.round(v)); }
    function sub(type, join, cb) {
        var L = lib(); if (!L) return;
        try { subs.push([type, String(join), L.subscribeState(type, String(join), cb)]); } catch (e) {}
    }
    function selectRoom(id, silent) {
        id = Number(id);
        if (!piece(id)) return;
        if (state.room !== id) {
            state.room = id;
            state.levels = []; state.scene = 0; state.storeScene = 0;
            var L = lib();
            if (L) { L.publishEvent('b', String(10 + id), true); L.publishEvent('b', String(10 + id), false); }
            try { if (typeof window.updateActiveRoomUI === 'function') window.updateActiveRoomUI(id); } catch (e) {}
            try { localStorage.setItem('active_room_id', String(id)); } catch (e) {}
        }
        if (!silent) render();
    }

    function subscribeAll() {
        var n = Math.max(pieces().length, 1);
        for (var i = 1; i <= Math.max(n, 30); i++) {
            (function (id) { sub('b', 10 + id, function (v) { if (v && piece(id) && state.room !== id) { state.room = id; render(); } }); })(i);
        }
        sub('n', 10, function (v) { v = Number(v); if (v && piece(v) && v !== state.room) { state.room = v; render(); } });
        for (var c = 0; c < 20; c++) {
            (function (idx) { sub('n', 71 + idx, function (v) { if (dragging === idx) return; state.levels[idx] = Number(v) || 0; paintTile(idx); paintSummary(); }); })(c);
        }
        [1, 2, 3, 4].forEach(function (s) { sub('b', 50 + s, function (v) { if (v) state.scene = s; else if (state.scene === s) state.scene = 0; paintChips(); }); });
        [1, 2, 3, 4].forEach(function (s) { sub('b', 200 + s, function (v) { if (v) state.storeScene = s; else if (state.storeScene === s) state.storeScene = 0; paintChips(); }); });
        sub('n', 31, function (v) { state.setpoint = Number(v) / 10; paintClimate(); });
        sub('s', 32, function (v) { state.temp = String(v || ''); paintClimate(); });
        sub('b', 610, function (v) { if (v) { state.hvacOn = true; paintClimate(); } });
        sub('b', 611, function (v) { if (v) { state.hvacOn = false; paintClimate(); } });
        sub('n', 61, function (v) { state.fan = Number(v); paintClimate(); });
        [404, 405, 406, 407, 408, 409].forEach(function (j) { sub('b', j, function (v) { state.globals[j] = !!v; paintGlobals(); }); });
    }

    /* ---------------- Rendu ---------------- */
    function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
    function pct(v) { return Math.round((Number(v) || 0) * 100 / 65535); }
    function isPhone() { return PHONE_PAGE || window.innerWidth < 700; }
    function onCount() { var p = piece(state.room); return circuitsOf(p).reduce(function (a, _, i) { return a + ((state.levels[i] || 0) > 0 ? 1 : 0); }, 0); }
    function levelName(n) { return T('level') + ' ' + (Number(n || 0) + 1); }
    function multiLevel() { var s = {}; pieces().forEach(function (p) { s[p.niveau || 0] = 1; }); return Object.keys(s).length > 1; }

    function roomListHtml() {
        var html = '', lastLvl = null, ml = multiLevel();
        pieces().forEach(function (p) {
            if (ml && p.niveau !== lastLvl) { lastLvl = p.niveau; html += '<div class="cx-group">' + esc(levelName(p.niveau)) + '</div>'; }
            var active = p.id === state.room;
            var nc = circuitsOf(p).length;
            var meta = active ? (onCount() ? onCount() + '/' + nc : T('off')) : String(nc);
            html += '<button class="cx-room' + (active ? ' is-active' : '') + '"' + (active ? ' aria-current="true"' : '') + ' data-cx-room="' + p.id + '">' +
                icon(roomIcon(p)) + '<span class="cx-room-name">' + esc(tn(p.nom)) + '</span>' +
                '<span class="cx-room-meta" title="' + esc(T('lightsCount')(nc)) + '">' + icon('bulb', 'cx-mini') + '<span data-cx-roommeta="' + p.id + '">' + esc(meta) + '</span></span>' + icon('chev', 'cx-chev') + '</button>';
        });
        return html;
    }

    function chipsHtml(names, kind) {
        return names.map(function (n, i) { return '<button class="cx-chip" data-cx-' + kind + '="' + (i + 1) + '">' + esc(tn(n)) + '</button>'; }).join('');
    }

    function roomDetailHtml() {
        var p = piece(state.room);
        if (!p) return '';
        var circ = circuitsOf(p), mot = motorsOf(p), sc = scenesOf(p);
        var c = cfg(), stSc = ((c && c.scenesStores && c.scenesStores.noms) || []).slice(0, 4);
        var h = '';
        if (isPhone()) h += '<button class="cx-back" data-cx-back="1">' + icon('back') + '<span>' + esc(T('back')) + '</span></button>';
        h += '<header class="cx-head"><h1>' + esc(tn(p.nom)) + '</h1><p class="cx-sub" id="cx-summary"></p></header>';
        if (sc.length) h += '<section class="cx-sec"><h2>' + esc(T('roomScenes')) + '</h2><div class="cx-chips">' + chipsHtml(sc, 'scene') + '</div></section>';
        if (circ.length) {
            h += '<section class="cx-sec"><h2>' + esc(T('lights')) + '</h2><div class="cx-tiles">';
            circ.forEach(function (n, i) {
                h += '<div class="cx-tile" role="slider" aria-label="' + esc(tn(n)) + '" aria-valuemin="0" aria-valuemax="100" data-cx-tile="' + i + '">' +
                    '<div class="cx-fill"></div><span class="cx-tile-name">' + esc(tn(n)) + '</span><span class="cx-tile-val"></span></div>';
            });
            h += '</div></section>';
        }
        if (mot.length) {
            h += '<section class="cx-sec"><h2>' + esc(T('shades')) + '</h2>';
            if (stSc.length) h += '<div class="cx-chips">' + chipsHtml(stSc, 'store') + '</div>';
            h += '<div class="cx-shades">' + mot.map(function (m, i) { return shadeRow(p.id, m, i); }).join('') + '</div></section>';
        }
        if (hasCvc(p)) h += '<section class="cx-sec"><h2>' + esc(T('climate')) + '</h2>' + climateCard(true) + '</section>';
        return h;
    }

    function shadeRow(roomId, m, i) {
        return '<div class="cx-shade">' + icon('shade') + '<span class="cx-shade-name">' + esc(tn(m.nom)) + '</span>' +
            '<span class="cx-rbtns">' +
            '<button class="cx-rb" aria-label="' + esc(T('up')) + '" data-cx-motor="' + roomId + ':' + i + ':0">' + icon('up') + '</button>' +
            '<button class="cx-rb" aria-label="' + esc(T('stop')) + '" data-cx-motor="' + roomId + ':' + i + ':1">' + icon('stop') + '</button>' +
            '<button class="cx-rb" aria-label="' + esc(T('down')) + '" data-cx-motor="' + roomId + ':' + i + ':2">' + icon('down') + '</button>' +
            '</span></div>';
    }

    function climateCard(compact) {
        return '<div class="cx-climate' + (compact ? ' is-compact' : '') + '">' +
            '<div class="cx-thermo"><div class="cx-thermo-now"><span class="cx-lbl">' + esc(T('temp')) + '</span><span class="cx-big" id="cx-temp">--</span></div>' +
            '<div class="cx-thermo-set"><button class="cx-rb cx-rb-lg" aria-label="' + esc(T('minus')) + '" data-cx-press="50">' + icon('minus') + '</button>' +
            '<div class="cx-set"><span class="cx-lbl">' + esc(T('setpoint')) + '</span><span class="cx-mid" id="cx-setpoint">--</span></div>' +
            '<button class="cx-rb cx-rb-lg" aria-label="' + esc(T('plus')) + '" data-cx-press="49">' + icon('plus') + '</button></div></div>' +
            '<div class="cx-seg-row"><div class="cx-seg" role="group">' +
            '<button class="cx-segb" data-cx-hvac="610">' + icon('power') + '<span>' + esc(T('heating')) + '</span></button>' +
            '<button class="cx-segb" data-cx-hvac="611"><span>' + esc(T('stopHvac')) + '</span></button></div>' +
            '<div class="cx-seg" role="group" aria-label="' + esc(T('fan')) + '">' + icon('fan', 'cx-seg-ico') +
            [0, 1, 2, 3].map(function (f) { return '<button class="cx-segb" data-cx-fan="' + f + '"><span>' + (f === 0 ? esc(T('fanAuto')) : f) + '</span></button>'; }).join('') +
            '</div></div></div>';
    }

    function scenesTabHtml() {
        var c = cfg(), cvcAny = pieces().some(hasCvc);
        function card(j, ic, label) { return '<button class="cx-scard" data-cx-global="' + j + '">' + icon(ic) + '<span>' + esc(label) + '</span></button>'; }
        var h = '<header class="cx-head"><h1>' + esc(T('scenes')) + '</h1><p class="cx-sub">' + esc((c && c.meta && tn(c.meta.projet)) || T('home')) + '</p></header>';
        h += '<section class="cx-sec"><h2>' + esc(T('globalLights')) + '</h2><div class="cx-sgrid">' + card(401, 'sun', T('allOn')) + card(403, 'bulb', T('eco')) + card(402, 'moon', T('allOff')) + '</div></section>';
        h += '<section class="cx-sec"><h2>' + esc(T('globalShades')) + '</h2><div class="cx-sgrid">' + card(404, 'up', T('openAll')) + card(406, 'shade', T('middle')) + card(405, 'down', T('closeAll')) + '</div></section>';
        if (cvcAny) h += '<section class="cx-sec"><h2>' + esc(T('globalClimate')) + '</h2><div class="cx-sgrid">' + card(407, 'sun', T('comfort')) + card(408, 'moon', T('night')) + card(409, 'snow', T('frost')) + '</div></section>';
        return h;
    }

    function shadesTabHtml() {
        var h = '<header class="cx-head"><h1>' + esc(T('shades')) + '</h1><p class="cx-sub">' + esc(T('shadesCount')(pieces().reduce(function (a, p) { return a + motorsOf(p).length; }, 0))) + '</p></header>';
        pieces().forEach(function (p) {
            var m = motorsOf(p); if (!m.length) return;
            h += '<section class="cx-sec"><h2>' + esc(tn(p.nom)) + '</h2><div class="cx-shades">' + m.map(function (x, i) { return shadeRow(p.id, x, i); }).join('') + '</div></section>';
        });
        return h;
    }

    function climateTabHtml() {
        var list = pieces().filter(hasCvc);
        var h = '<header class="cx-head"><h1>' + esc(T('climate')) + '</h1><p class="cx-sub">' + esc(piece(state.room) ? tn(piece(state.room).nom) : '') + '</p></header>';
        h += '<div class="cx-chips cx-chips-rooms">' + list.map(function (p) { return '<button class="cx-chip' + (p.id === state.room ? ' is-on' : '') + '" data-cx-climroom="' + p.id + '">' + esc(tn(p.nom)) + '</button>'; }).join('') + '</div>';
        h += hasCvc(piece(state.room)) ? climateCard(false) : '<p class="cx-empty">' + esc(T('noClimate')) + '</p>';
        return h;
    }

    function settingsTabHtml() {
        var c = cfg(), th = currentTheme(), l = lang();
        function seg(attr, items, cur) { return '<div class="cx-seg cx-seg-wide">' + items.map(function (it) { return '<button class="cx-segb' + (it[0] === cur ? ' is-on' : '') + '" aria-pressed="' + (it[0] === cur) + '" data-cx-' + attr + '="' + it[0] + '"><span>' + esc(it[1]) + '</span></button>'; }).join('') + '</div>'; }
        var h = '<header class="cx-head"><h1>' + esc(T('settings')) + '</h1></header>';
        h += '<section class="cx-sec"><h2>' + esc(T('theme')) + '</h2>' + seg('theme', [['light', T('light')], ['dark', T('dark')], ['glass', T('glass')]], th) + '</section>';
        h += '<section class="cx-sec"><h2>' + esc(T('language')) + '</h2>' + seg('lang', [['fr', 'Français'], ['en', 'English'], ['de', 'Deutsch']], l) + '</section>';
        h += '<section class="cx-sec"><h2>' + esc(T('about')) + '</h2><div class="cx-card cx-about"><p><span class="cx-lbl">' + esc(T('home')) + '</span><span>' + esc((c && c.meta && c.meta.projet) || '') + '</span></p>' +
            '<p><span class="cx-lbl">' + esc(T('version')) + '</span><span>' + esc(window.appVersion || '') + '</span></p></div></section>';
        return h;
    }

    function tabsHtml() {
        var tabs = [['rooms', 'home'], ['scenes', 'star'], ['shades', 'shade'], ['climate', 'temp'], ['settings', 'gear']];
        return tabs.map(function (t) { return '<button class="cx-tab' + (state.tab === t[0] ? ' is-on' : '') + '" role="tab" aria-selected="' + (state.tab === t[0]) + '" data-cx-tab="' + t[0] + '">' + icon(t[1]) + '<span>' + esc(T(t[0])) + '</span></button>'; }).join('');
    }

    function currentTheme() {
        var b = document.body;
        if (b.classList.contains('theme-light')) return 'light';
        if (b.classList.contains('theme-glass')) return 'glass';
        return 'dark';
    }

    function render() {
        if (!root) return;
        var phone = isPhone();
        root.classList.toggle('cx-phone', phone);
        var showSide = !phone && state.tab === 'rooms';
        var main = '';
        if (state.tab === 'rooms') main = (phone && !state.phoneDetail) ? '<header class="cx-head"><h1>' + esc(T('rooms')) + '</h1><p class="cx-sub">' + esc(tn(((cfg() || {}).meta || {}).projet || '')) + '</p></header><div class="cx-list">' + roomListHtml() + '</div>' : roomDetailHtml();
        else if (state.tab === 'scenes') main = scenesTabHtml();
        else if (state.tab === 'shades') main = shadesTabHtml();
        else if (state.tab === 'climate') main = climateTabHtml();
        else main = settingsTabHtml();
        var scrollTop = root.querySelector('.cx-main') ? root.querySelector('.cx-main').scrollTop : 0;
        root.innerHTML =
            '<div class="cx-body' + (showSide ? ' has-side' : '') + '">' +
            (showSide ? '<aside class="cx-side"><div class="cx-side-title">' + esc(T('rooms')) + '</div><div class="cx-list">' + roomListHtml() + '</div></aside>' : '') +
            '<main class="cx-main" data-cx-view="' + state.tab + '">' + main + '</main></div>' +
            '<nav class="cx-tabs" aria-label="Navigation">' + tabsHtml() + '</nav>';
        if (sameView === state.tab + ':' + state.room + ':' + state.phoneDetail) root.querySelector('.cx-main').scrollTop = scrollTop;
        sameView = state.tab + ':' + state.room + ':' + state.phoneDetail;
        paintAllTiles(); paintSummary(); paintChips(); paintClimate(); paintGlobals();
    }
    var sameView = '';

    function paintTile(idx) {
        if (!root) return;
        var t = root.querySelector('[data-cx-tile="' + idx + '"]');
        if (!t) return;
        var v = state.levels[idx] || 0, p = pct(v);
        t.querySelector('.cx-fill').style.height = p + '%';
        t.querySelector('.cx-tile-val').textContent = p > 0 ? p + ' %' : T('off');
        t.classList.toggle('is-on', p > 0);
        t.setAttribute('aria-valuenow', String(p));
    }
    function paintAllTiles() { for (var i = 0; i < 20; i++) paintTile(i); }
    function paintSummary() {
        if (!root) return;
        var s = root.querySelector('#cx-summary'), p = piece(state.room);
        if (s && p) s.textContent = (multiLevel() ? levelName(p.niveau) + ' · ' : '') + T('lightsOn')(onCount());
        var m = root.querySelector('[data-cx-roommeta="' + state.room + '"]');
        if (m && p) m.textContent = onCount() ? onCount() + '/' + circuitsOf(p).length : T('off');
    }
    function mark(b, on) { b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); }
    function paintChips() {
        if (!root) return;
        root.querySelectorAll('[data-cx-scene]').forEach(function (b) { mark(b, Number(b.getAttribute('data-cx-scene')) === state.scene); });
        root.querySelectorAll('[data-cx-store]').forEach(function (b) { mark(b, Number(b.getAttribute('data-cx-store')) === state.storeScene); });
    }
    function paintClimate() {
        if (!root) return;
        var t = root.querySelector('#cx-temp'), s = root.querySelector('#cx-setpoint');
        if (t) t.textContent = state.temp ? state.temp + ' °C' : '--';
        if (s) s.textContent = state.setpoint != null ? state.setpoint.toFixed(1) + ' °C' : '--';
        root.querySelectorAll('[data-cx-hvac]').forEach(function (b) { var on = b.getAttribute('data-cx-hvac') === '610'; mark(b, state.hvacOn === on); });
        root.querySelectorAll('[data-cx-fan]').forEach(function (b) { mark(b, Number(b.getAttribute('data-cx-fan')) === state.fan); });
    }
    function paintGlobals() {
        if (!root) return;
        root.querySelectorAll('[data-cx-global]').forEach(function (b) { mark(b, !!state.globals[b.getAttribute('data-cx-global')]); });
    }

    /* ---------------- Interactions ---------------- */
    var dragging = -1, drag = null, lastSend = 0;
    function levelFromY(tile, y) {
        var r = tile.getBoundingClientRect();
        return Math.max(0, Math.min(1, (r.bottom - y) / r.height)) * 65535;
    }
    function onDown(e) {
        var tile = e.target.closest && e.target.closest('[data-cx-tile]');
        if (!tile) return;
        var idx = Number(tile.getAttribute('data-cx-tile'));
        drag = { tile: tile, idx: idx, y0: e.clientY, moved: false, id: e.pointerId };
        try { tile.setPointerCapture(e.pointerId); } catch (x) {}
    }
    function onMove(e) {
        if (!drag || e.pointerId !== drag.id) return;
        if (!drag.moved && Math.abs(e.clientY - drag.y0) < 6) return;
        drag.moved = true; dragging = drag.idx;
        e.preventDefault();
        var v = levelFromY(drag.tile, e.clientY);
        state.levels[drag.idx] = v; paintTile(drag.idx); paintSummary();
        var now = Date.now();
        if (now - lastSend > 90) { lastSend = now; sendLevel(drag.idx, v); }
    }
    function onUp(e) {
        if (!drag || e.pointerId !== drag.id) return;
        var d = drag; drag = null; dragging = -1;
        var v;
        if (d.moved) v = levelFromY(d.tile, e.clientY);
        else v = (state.levels[d.idx] || 0) > 0 ? 0 : 65535;
        state.levels[d.idx] = v; paintTile(d.idx); paintSummary();
        sendLevel(d.idx, v);
    }
    function onClick(e) {
        var b = e.target.closest && e.target.closest('button');
        if (!b || !root.contains(b)) return;
        var a;
        if ((a = b.getAttribute('data-cx-tab'))) { state.tab = a; if (a === 'rooms') state.phoneDetail = false; render(); return; }
        if ((a = b.getAttribute('data-cx-room'))) { state.phoneDetail = true; selectRoom(a, true); render(); return; }
        if (b.hasAttribute('data-cx-back')) { state.phoneDetail = false; render(); return; }
        if ((a = b.getAttribute('data-cx-climroom'))) { selectRoom(a); return; }
        if ((a = b.getAttribute('data-cx-scene'))) { pulse(50 + Number(a)); state.scene = Number(a); paintChips(); return; }
        if ((a = b.getAttribute('data-cx-store'))) { pulse(200 + Number(a)); state.storeScene = Number(a); paintChips(); return; }
        if ((a = b.getAttribute('data-cx-motor'))) {
            var parts = a.split(':').map(Number);
            // Moteurs 1-6 : d81-98 ; 7-12 : d129-146 (Core v5.3), triplets Monter / Stop / Descendre.
            var join = (parts[1] < 6 ? 81 + parts[1] * 3 : 129 + (parts[1] - 6) * 3) + parts[2];
            if (parts[0] !== state.room) { selectRoom(parts[0], true); setTimeout(function () { pulse(join); }, 250); }
            else pulse(join);
            return;
        }
        if ((a = b.getAttribute('data-cx-press'))) { pulse(a); return; }
        if ((a = b.getAttribute('data-cx-hvac'))) { pulse(a); state.hvacOn = a === '610'; paintClimate(); return; }
        if ((a = b.getAttribute('data-cx-fan'))) { pulse(612 + Number(a)); state.fan = Number(a); paintClimate(); return; }
        if ((a = b.getAttribute('data-cx-global'))) { pulse(a); return; }
        if ((a = b.getAttribute('data-cx-theme'))) { if (typeof window.changeTheme === 'function') window.changeTheme(a); render(); return; }
        if ((a = b.getAttribute('data-cx-lang'))) {
            if (typeof window.changeLanguage === 'function') window.changeLanguage(a);
            try { localStorage.setItem('crestron_lang', a); } catch (x) {}
            render(); return;
        }
    }

    /* ---------------- Démarrage ---------------- */
    function build() {
        if (built || !enabled() || !document.body) return;
        built = true;
        document.documentElement.setAttribute('data-iface', 'connect');
        root = document.createElement('div');
        root.id = 'cx-root';
        root.className = 'cx';
        document.body.appendChild(root);
        var saved = null;
        try { saved = localStorage.getItem(PHONE_PAGE ? 'crestron_theme_iphone' : 'crestron_theme'); } catch (e) {}
        if (!saved && typeof window.changeTheme === 'function') window.changeTheme('light');
        var start = Number(window.currentActiveRoomId) || 0;
        try { start = start || Number(localStorage.getItem('active_room_id')) || 0; } catch (e) {}
        state.room = piece(start) ? start : (pieces()[0] ? pieces()[0].id : 0);
        root.addEventListener('click', onClick);
        root.addEventListener('pointerdown', onDown);
        root.addEventListener('pointermove', onMove);
        root.addEventListener('pointerup', onUp);
        root.addEventListener('pointercancel', onUp);
        subscribeAll();
        render();
        var lastW = window.innerWidth;
        window.addEventListener('resize', function () { if ((lastW < 700) !== (window.innerWidth < 700)) render(); lastW = window.innerWidth; });
        new MutationObserver(function () { if (state.tab === 'settings') render(); }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
    }
    function tryBuild() { if (!built && enabled()) build(); }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(tryBuild, 0); });
    else setTimeout(tryBuild, 0);
    window.addEventListener('villa-config-loaded', function () { tryBuild(); if (built) render(); });
    window.addEventListener('load', tryBuild);

    window.ConnectUI = {
        version: '1.0',
        state: state,
        selectRoom: selectRoom,
        setTab: function (t) { state.tab = t; state.phoneDetail = false; render(); },
        openRoom: function (id) { state.tab = 'rooms'; state.phoneDetail = true; selectRoom(id, true); render(); },
        render: render,
        active: function () { return built; }
    };
})();
