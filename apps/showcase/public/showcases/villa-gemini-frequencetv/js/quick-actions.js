/* Villa FTV v6.2 — « Recherche » : actions rapides (dalle / iPad / XPanel et iPhone).
   Bouton loupe à gauche d'« Alarme » → fenêtre avec : 1) un champ de recherche qui propose des actions au fil de la
   frappe ; 2) les 3 dernières actions lancées depuis cette fenêtre (mémoire de l'écran) ; 3) 3 suggestions
   (heure de la journée, pièce affichée, actions les plus utilisées).

   Catalogue construit à partir de villa_config.json : scènes d'éclairage (pièce affichée et autres pièces), sources
   audio/vidéo, commandes groupées volets / rideaux / stores, CVC (marche, arrêt, consigne ±), centralisation
   (401-411), fenêtres (Caméras, Contrôle global, Circuits, Moteurs, Lecteur, Réglages), changement de pièce.
   Chaque action emprunte le chemin du bouton correspondant : mêmes joins (impulsions CrComLib traduites par le
   pont SIMPL), mêmes fonctions (avSelect, animateGroupBlinds, openXxxModal, selectRoomFromConfig / changeRoomIphone).
   L'alarme et son code restent hors recherche. Aucun nouveau join, aucun échange réseau, historique dans localStorage.

   Réglage facultatif : "interface": { "recherche": { "actif": true, "suggestions": true } } (absent = actif). */
(function () {
    'use strict';
    var IS_PHONE = /iphone\.html/i.test(location.pathname) || !!document.getElementById('room-select');
    var LS_RECENT = 'villa_qa_recent', LS_COUNTS = 'villa_qa_counts';
    var I18N = {
        fr: { btn: 'Recherche', title: 'Actions rapides', ph: 'Rechercher une action… (scène, source, stores, pièce)', recent: 'Dernières actions', sugg: 'Suggestions', none: 'Aucune action ne correspond', close: 'Fermer', go: 'Aller à', scene: 'Scène', src: 'Source', open: 'Ouvrir', win: 'Fenêtre',
              v_open: 'Volets : tout ouvrir', v_close: 'Volets : tout fermer', r_open: 'Rideaux : tout ouvrir', r_close: 'Rideaux : tout fermer', s_open: 'Stores : tout ouvrir', s_close: 'Stores : tout fermer',
              hv_on: 'Climatisation : marche', hv_off: 'Climatisation : arrêt', hv_up: 'Consigne +0,5 °C', hv_dn: 'Consigne −0,5 °C', av_off: 'Audio / vidéo : éteindre',
              w_cam: 'Caméras', w_glob: 'Contrôle global', w_circ: 'Circuits d’éclairage', w_mot: 'Moteurs', w_media: 'Lecteur audio', w_set: 'Réglages', central: 'Centralisation',
              kw: 'lumiere lumieres eclairage scene ambiance | source tv video musique audio chaine | volet rideau store ouvrir fermer monter descendre | chauffage clim climatisation temperature consigne cvc | piece aller chambre salon | fenetre ouvrir' },
        en: { btn: 'Search', title: 'Quick actions', ph: 'Search an action… (scene, source, blinds, room)', recent: 'Recent actions', sugg: 'Suggestions', none: 'No matching action', close: 'Close', go: 'Go to', scene: 'Scene', src: 'Source', open: 'Open', win: 'Window',
              v_open: 'Shutters: open all', v_close: 'Shutters: close all', r_open: 'Curtains: open all', r_close: 'Curtains: close all', s_open: 'Blinds: open all', s_close: 'Blinds: close all',
              hv_on: 'HVAC: on', hv_off: 'HVAC: off', hv_up: 'Setpoint +0.5 °C', hv_dn: 'Setpoint −0.5 °C', av_off: 'Audio / video: off',
              w_cam: 'Cameras', w_glob: 'Global control', w_circ: 'Lighting circuits', w_mot: 'Motors', w_media: 'Audio player', w_set: 'Settings', central: 'Whole house',
              kw: 'light lights lighting scene mood | source tv video music audio channel | shutter curtain blind open close raise lower | heating cooling hvac temperature setpoint | room go bedroom living | window open' },
        es: { btn: 'Buscar', title: 'Acciones rápidas', ph: 'Buscar una acción… (escena, fuente, persianas, estancia)', recent: 'Últimas acciones', sugg: 'Sugerencias', none: 'Ninguna acción coincide', close: 'Cerrar', go: 'Ir a', scene: 'Escena', src: 'Fuente', open: 'Abrir', win: 'Ventana',
              v_open: 'Persianas: abrir todo', v_close: 'Persianas: cerrar todo', r_open: 'Cortinas: abrir todo', r_close: 'Cortinas: cerrar todo', s_open: 'Toldos: abrir todo', s_close: 'Toldos: cerrar todo',
              hv_on: 'Climatización: encender', hv_off: 'Climatización: apagar', hv_up: 'Consigna +0,5 °C', hv_dn: 'Consigna −0,5 °C', av_off: 'Audio / vídeo: apagar',
              w_cam: 'Cámaras', w_glob: 'Control global', w_circ: 'Circuitos de luz', w_mot: 'Motores', w_media: 'Reproductor', w_set: 'Ajustes', central: 'Toda la casa',
              kw: 'luz luces iluminacion escena ambiente | fuente tv video musica audio canal | persiana cortina toldo abrir cerrar subir bajar | calefaccion clima temperatura consigna | estancia ir dormitorio salon | ventana abrir' },
        de: { btn: 'Suche', title: 'Schnellaktionen', ph: 'Aktion suchen… (Szene, Quelle, Rollläden, Raum)', recent: 'Letzte Aktionen', sugg: 'Vorschläge', none: 'Keine passende Aktion', close: 'Schließen', go: 'Gehe zu', scene: 'Szene', src: 'Quelle', open: 'Öffnen', win: 'Fenster',
              v_open: 'Rollläden: alle öffnen', v_close: 'Rollläden: alle schließen', r_open: 'Vorhänge: alle öffnen', r_close: 'Vorhänge: alle schließen', s_open: 'Markisen: alle öffnen', s_close: 'Markisen: alle schließen',
              hv_on: 'Klima: ein', hv_off: 'Klima: aus', hv_up: 'Sollwert +0,5 °C', hv_dn: 'Sollwert −0,5 °C', av_off: 'Audio / Video: aus',
              w_cam: 'Kameras', w_glob: 'Zentralsteuerung', w_circ: 'Lichtkreise', w_mot: 'Motoren', w_media: 'Audioplayer', w_set: 'Einstellungen', central: 'Ganzes Haus',
              kw: 'licht lichter beleuchtung szene stimmung | quelle tv video musik audio sender | rollladen vorhang markise offnen schliessen hoch runter | heizung klima temperatur sollwert | raum gehe zimmer wohnzimmer | fenster offnen' },
        ru: { btn: 'Поиск', title: 'Быстрые действия', ph: 'Найти действие… (сцена, источник, шторы, комната)', recent: 'Последние действия', sugg: 'Предложения', none: 'Ничего не найдено', close: 'Закрыть', go: 'Перейти', scene: 'Сцена', src: 'Источник', open: 'Открыть', win: 'Окно',
              v_open: 'Ставни: открыть все', v_close: 'Ставни: закрыть все', r_open: 'Шторы: открыть все', r_close: 'Шторы: закрыть все', s_open: 'Маркизы: открыть все', s_close: 'Маркизы: закрыть все',
              hv_on: 'Климат: вкл', hv_off: 'Климат: выкл', hv_up: 'Уставка +0,5 °C', hv_dn: 'Уставка −0,5 °C', av_off: 'Аудио / видео: выключить',
              w_cam: 'Камеры', w_glob: 'Общее управление', w_circ: 'Световые цепи', w_mot: 'Приводы', w_media: 'Плеер', w_set: 'Настройки', central: 'Весь дом',
              kw: 'свет освещение сцена | источник тв видео музыка | ставни шторы маркизы открыть закрыть | отопление климат температура уставка | комната перейти | окно открыть' }
    };
    function lang() { try { if (typeof window.villaCurrentLang === 'function') { return window.villaCurrentLang(); } return localStorage.getItem(IS_PHONE ? 'crestron_lang_iphone' : 'crestron_lang') || 'fr'; } catch (e) { return 'fr'; } }
    function T(k) { var d = I18N[lang()] || I18N.fr; return d[k] || I18N.fr[k] || k; }
    function tName(s) { return (typeof window.villaTranslateName === 'function') ? window.villaTranslateName(s) : s; }
    function cfg() { return window.villaConfig || window.villaConfigEmbedded || null; }
    function enabled() { var c = cfg(); var r = c && c.interface && c.interface.recherche; return !(r && r.actif === false); }
    function suggestionsOn() { var c = cfg(); var r = c && c.interface && c.interface.recherche; return !(r && r.suggestions === false); }
    function rooms() { var c = cfg(); if (!c) { return []; } var l = (typeof window.villaPiecesActives === 'function') ? window.villaPiecesActives(c) : (c.pieces || []); return l.filter(function (p) { return p && p.actif !== false; }); }
    function curRoom() { var id = parseInt(window.currentActiveRoomId || (window.VillaJoins && window.VillaJoins.room) || 1, 10); return isNaN(id) ? 1 : id; }
    function room(id) { return rooms().filter(function (p) { return p.id === id; })[0] || null; }
    function norm(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’']/g, ' ').replace(/\s+/g, ' ').trim(); }

    /* ---------- Exécution : mêmes joins / mêmes fonctions que les boutons ---------- */
    function pulse(join) {
        if (typeof CrComLib === 'undefined') { return; }
        CrComLib.publishEvent('b', String(join), true);
        setTimeout(function () { CrComLib.publishEvent('b', String(join), false); }, 150);
    }
    function goRoom(id, then) {
        if (id !== curRoom()) {
            if (IS_PHONE && typeof window.changeRoomIphone === 'function') { var sel = document.getElementById('room-select'); if (sel) { sel.value = String(id); } window.changeRoomIphone(String(id)); }
            else if (typeof window.selectRoomFromConfig === 'function') { window.selectRoomFromConfig(id); }
            else if (typeof window.changeRoomUI === 'function') { window.changeRoomUI(id); }
            if (then) { setTimeout(then, 450); }
        } else if (then) { then(); }
    }
    function groupCmd(group, dir) {
        if (typeof window.animateGroupBlinds === 'function') { window.animateGroupBlinds(group, dir); return; }
        var J = { volets: { open: 61, close: 63 }, rideaux: { open: 64, close: 66 }, stores: { open: 67, close: 69 } };
        pulse(J[group][dir]);
    }
    function openWin(fn) { if (typeof window[fn] === 'function') { window[fn](); } }

    /* ---------- Catalogue ---------- */
    function catalogue() {
        var out = [], c = cfg(), cur = curRoom(), rs = rooms(), kw = T('kw').split('|');
        var curP = room(cur);
        function add(a) { a.n = norm(a.label + ' ' + (a.keys || '')); out.push(a); }
        // Scènes de la pièce affichée, puis des autres pièces
        rs.forEach(function (p) {
            var sc = p.pilotages && p.pilotages.eclairages && p.pilotages.eclairages.actif !== false && p.pilotages.eclairages.scenes;
            if (!sc) { return; }
            var noms = sc.noms || [], n = Math.min(sc.nombre || noms.length, 4);
            for (var i = 0; i < n; i++) {
                (function (i) {
                    var nom = tName(noms[i] || ('Scène ' + (i + 1))), here = p.id === cur;
                    add({ id: 'scene:' + p.id + ':' + (i + 1), label: nom + (here ? '' : ' — ' + tName(p.nom)), sub: T('scene') + (here ? '' : ' · ' + T('go') + ' ' + tName(p.nom)), keys: kw[0] + ' ' + tName(p.nom), w: here ? 3 : 1, roomId: p.id,
                          run: function () { goRoom(p.id, function () { pulse(51 + i); }); } });
                })(i);
            }
        });
        // Sources audio / vidéo (joins 151-155 = 150 + id), OFF 200
        if (!curP || !curP.pilotages || !curP.pilotages.audioVideo || curP.pilotages.audioVideo.actif !== false) {
            ((c && c.sourcesAudioVideo) || []).forEach(function (s) {
                if (!s || s.actif === false) { return; }
                add({ id: 'src:' + s.id, label: tName(s.nom), sub: T('src'), keys: kw[1], w: 2, run: function () { if (typeof window.avSelect === 'function') { window.avSelect(String(150 + s.id)); } else { pulse(150 + s.id); } } });
            });
            add({ id: 'av:off', label: T('av_off'), sub: T('src'), keys: kw[1] + ' off', w: 2, run: function () { pulse(200); } });
        }
        // Commandes groupées moteurs (joins 61-69)
        var hasM = !curP || !curP.pilotages || !curP.pilotages.moteurs || curP.pilotages.moteurs.actif !== false;
        if (hasM) {
            [['volets', 'v'], ['rideaux', 'r'], ['stores', 's']].forEach(function (g) {
                add({ id: 'grp:' + g[0] + ':open', label: T(g[1] + '_open'), sub: tName(curP ? curP.nom : ''), keys: kw[2], w: 2, run: function () { groupCmd(g[0], 'open'); } });
                add({ id: 'grp:' + g[0] + ':close', label: T(g[1] + '_close'), sub: tName(curP ? curP.nom : ''), keys: kw[2], w: 2, run: function () { groupCmd(g[0], 'close'); } });
            });
        }
        // CVC (610 marche, 611 arrêt, 49 +, 50 −)
        if (!curP || !curP.pilotages || !curP.pilotages.cvc || curP.pilotages.cvc.actif !== false) {
            add({ id: 'hvac:on', label: T('hv_on'), sub: tName(curP ? curP.nom : ''), keys: kw[3], w: 2, run: function () { pulse(610); } });
            add({ id: 'hvac:off', label: T('hv_off'), sub: tName(curP ? curP.nom : ''), keys: kw[3], w: 2, run: function () { pulse(611); } });
            add({ id: 'hvac:up', label: T('hv_up'), sub: tName(curP ? curP.nom : ''), keys: kw[3], w: 1, run: function () { pulse(49); } });
            add({ id: 'hvac:dn', label: T('hv_dn'), sub: tName(curP ? curP.nom : ''), keys: kw[3], w: 1, run: function () { pulse(50); } });
        }
        // Centralisation 401-411 : libellés des boutons de la fenêtre Contrôle global (alarme 410/411 exclue)
        var seen = {};
        document.querySelectorAll('[data-join]').forEach(function (el) {
            var j = parseInt(el.getAttribute('data-join'), 10);
            if (!(j >= 401 && j <= 409) || seen[j]) { return; }
            var label = el.getAttribute('label') || (el.textContent || '').trim(); if (!label) { return; }
            seen[j] = true;
            add({ id: 'central:' + j, label: label.charAt(0) + label.slice(1).toLowerCase(), sub: T('central'), keys: 'global centralisation maison ' + kw[0] + ' ' + kw[2] + ' ' + kw[3], w: 2, run: function () { pulse(j); } });
        });
        // Fenêtres
        [['w_cam', 'openCamerasModal'], ['w_glob', 'openGlobalControlModal'], ['w_circ', 'openCircuitsModal'], ['w_mot', 'openMotorsModal'], ['w_media', 'openMediaPlayerModal'], ['w_set', 'openSettingsModal']].forEach(function (w) {
            if (typeof window[w[1]] !== 'function') { return; }
            add({ id: 'win:' + w[1], label: T(w[0]), sub: T('win'), keys: kw[5] + ' ' + T('open'), w: 1, run: function () { openWin(w[1]); } });
        });
        // Changement de pièce
        rs.forEach(function (p) { if (p.id === cur) { return; } add({ id: 'room:' + p.id, label: T('go') + ' ' + tName(p.nom), sub: T('go'), keys: kw[4], w: 1, run: function () { goRoom(p.id); } }); });
        return out;
    }

    /* ---------- Recherche, historique, suggestions ---------- */
    function search(cat, q) {
        var nq = norm(q); if (!nq) { return []; }
        var toks = nq.split(' ');
        return cat.map(function (a) {
            var s = 0, miss = false, nl = norm(a.label);
            // Tous les mots saisis doivent se retrouver (libellé ou mots-clés) ; le libellé pèse plus que les mots-clés.
            toks.forEach(function (t) { if (!t) { return; } if (nl.indexOf(t) === 0) { s += 6; } else if (nl.indexOf(t) >= 0) { s += 4; } else if (a.n.indexOf(t) >= 0) { s += 2; } else { miss = true; } });
            return [miss ? 0 : s + a.w * 0.1, a];
        }).filter(function (x) { return x[0] > 0; }).sort(function (a, b) { return b[0] - a[0]; }).slice(0, 6).map(function (x) { return x[1]; });
    }
    function lsGet(k, d) { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } }
    function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }
    function remember(a) {
        var r = lsGet(LS_RECENT, []).filter(function (x) { return x !== a.id; }); r.unshift(a.id); lsSet(LS_RECENT, r.slice(0, 3));
        var c = lsGet(LS_COUNTS, {}); c[a.id] = (c[a.id] || 0) + 1; lsSet(LS_COUNTS, c);
    }
    function recent(cat) { var by = {}; cat.forEach(function (a) { by[a.id] = a; }); return lsGet(LS_RECENT, []).map(function (id) { return by[id]; }).filter(Boolean).slice(0, 3); }
    function suggest(cat, exclude) {
        var h = new Date().getHours(), cur = curRoom(), by = {}, picks = [], used = {};
        cat.forEach(function (a) { by[a.id] = a; });
        exclude.forEach(function (a) { used[a.id] = true; });
        function take(id) { var a = by[id]; if (a && !used[a.id]) { used[a.id] = true; picks.push(a); } }
        function sceneLike(re) { var s = cat.filter(function (a) { return a.roomId === cur && a.id.indexOf('scene:') === 0 && re.test(norm(a.label)); })[0]; if (s) { take(s.id); } }
        if (h >= 6 && h < 11) { take('grp:volets:open'); take('grp:stores:open'); sceneLike(/total|jour|day|matin|morning/); }
        else if (h >= 18 && h < 23) { sceneLike(/cinema|soir|evening|night|detente|relax|ambiance/); take('grp:volets:close'); take('src:1'); }
        else if (h >= 23 || h < 6) { sceneLike(/off|eteint|nuit|night/); take('central:402'); take('grp:volets:close'); }
        else { sceneLike(/repas|lunch|midi|total/); take('grp:stores:close'); take('src:1'); }
        // Complément : actions les plus utilisées sur cet écran, puis repli
        var counts = lsGet(LS_COUNTS, {});
        Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; }).forEach(function (id) { if (picks.length < 3) { take(id); } });
        ['central:402', 'win:openCamerasModal', 'win:openSettingsModal', 'hvac:on'].forEach(function (id) { if (picks.length < 3) { take(id); } });
        return picks.slice(0, 3);
    }

    /* ---------- Interface ---------- */
    var overlay = null, input = null, cat = [];
    function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
    function build() {
        if (overlay) { return; }
        overlay = document.createElement('div');
        overlay.id = 'qa-overlay'; overlay.className = 'custom-overlay-panel qa-overlay';
        overlay.setAttribute('role', 'dialog'); overlay.setAttribute('aria-modal', 'true');
        overlay.innerHTML =
            '<div class="qa-head"><h2 class="qa-title"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><span id="qa-title"></span></h2>' +
            '<button type="button" class="qa-close" id="qa-close" aria-label=""><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div>' +
            '<div class="qa-search"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input id="qa-input" type="search" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" enterkeyhint="go"></div>' +
            '<div id="qa-results" class="qa-list" role="listbox"></div>' +
            '<div class="qa-blocks"><section><h3 id="qa-recent-title"></h3><div id="qa-recent" class="qa-list"></div></section>' +
            '<section id="qa-sugg-sec"><h3 id="qa-sugg-title"></h3><div id="qa-sugg" class="qa-list"></div></section></div>';
        document.body.appendChild(overlay);
        input = overlay.querySelector('#qa-input');
        input.addEventListener('input', renderResults);
        input.addEventListener('keydown', function (ev) { if (ev.key === 'Enter') { var f = overlay.querySelector('#qa-results .qa-item'); if (f) { f.click(); } } if (ev.key === 'Escape') { close(); } });
        overlay.querySelector('#qa-close').addEventListener('click', close);
    }
    function item(a) {
        var b = document.createElement('button'); b.type = 'button'; b.className = 'qa-item'; b.setAttribute('role', 'option');
        b.innerHTML = '<span class="qa-label">' + esc(a.label) + '</span>' + (a.sub ? '<span class="qa-sub">' + esc(a.sub) + '</span>' : '');
        b.addEventListener('click', function () { remember(a); close(); try { a.run(); } catch (e) { console.error('[QuickActions]', a.id, e); } document.dispatchEvent(new CustomEvent('villa-quick-action', { detail: { id: a.id } })); });
        return b;
    }
    function fill(el, list, emptyText) { el.innerHTML = ''; if (!list.length) { if (emptyText) { var p = document.createElement('p'); p.className = 'qa-empty'; p.textContent = emptyText; el.appendChild(p); } return; } list.forEach(function (a) { el.appendChild(item(a)); }); }
    function renderResults() {
        var q = input.value, res = overlay.querySelector('#qa-results'), blocks = overlay.querySelector('.qa-blocks');
        if (!norm(q)) { res.innerHTML = ''; res.style.display = 'none'; blocks.style.display = ''; return; }
        res.style.display = ''; blocks.style.display = 'none';
        fill(res, search(cat, q), T('none'));
    }
    function renderBlocks() {
        var rec = recent(cat);
        overlay.querySelector('#qa-title').textContent = T('title');
        overlay.querySelector('#qa-close').setAttribute('aria-label', T('close'));
        overlay.querySelector('#qa-recent-title').textContent = T('recent');
        overlay.querySelector('#qa-sugg-title').textContent = T('sugg');
        input.placeholder = T('ph');
        fill(overlay.querySelector('#qa-recent'), rec, '—');
        var ss = overlay.querySelector('#qa-sugg-sec'); ss.style.display = suggestionsOn() ? '' : 'none';
        if (suggestionsOn()) { fill(overlay.querySelector('#qa-sugg'), suggest(cat, rec), '—'); }
    }
    function open() {
        if (!enabled()) { return; }
        hookCloseAll(); build(); cat = catalogue(); input.value = ''; renderBlocks(); renderResults();
        if (typeof window.closeAllModals === 'function') { try { window.closeAllModals(); } catch (e) { } }
        if (typeof window.showModalOverlay === 'function') { window.showModalOverlay('qa-overlay'); }
        else { overlay.style.display = 'flex'; var bd = document.getElementById('modal-backdrop'); if (bd) { bd.style.display = 'block'; } }
        setTimeout(function () { try { input.focus(); } catch (e) { } }, 50);
    }
    function close() {
        if (!overlay) { return; }
        if (typeof window.hideModalOverlay === 'function') { window.hideModalOverlay('qa-overlay'); }
        else { overlay.style.display = 'none'; var bd = document.getElementById('modal-backdrop'); if (bd) { bd.style.display = 'none'; } }
        try { input.blur(); } catch (e) { }
    }
    function isOpen() { return !!overlay && getComputedStyle(overlay).display !== 'none'; }
    // closeAllModals des deux HTML ne connaît pas cette fenêtre : on l'enchaîne (à l'ouverture, la fonction étant définie après ce script).
    function hookCloseAll() { var prev = window.closeAllModals; if (typeof prev === 'function' && !prev.__qa) { var w = function () { prev.apply(this, arguments); if (overlay) { overlay.style.display = 'none'; } }; w.__qa = true; window.closeAllModals = w; } }

    /* Bouton d'en-tête : inséré juste avant le bouton Alarme, même gabarit. */
    function mountButton() {
        if (!enabled() || document.getElementById('qa-open-btn')) { return; }
        var alarm = null;
        document.querySelectorAll('button[onclick]').forEach(function (b) { if (!alarm && /openAlarmModal/.test(b.getAttribute('onclick') || '')) { alarm = b; } });
        if (!alarm) { return; }
        var b = document.createElement('button');
        b.type = 'button'; b.id = 'qa-open-btn'; b.className = 'qa-open-btn';
        b.setAttribute('aria-label', T('btn')); b.title = T('btn');
        b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><span class="qa-open-label">' + esc(T('btn')) + '</span>';
        b.addEventListener('click', open);
        alarm.parentNode.insertBefore(b, alarm);
    }
    function relabel() { var b = document.getElementById('qa-open-btn'); if (b) { b.setAttribute('aria-label', T('btn')); b.title = T('btn'); var s = b.querySelector('.qa-open-label'); if (s) { s.textContent = T('btn'); } } if (isOpen()) { cat = catalogue(); renderBlocks(); renderResults(); } }

    window.QuickActions = { open: open, close: close, isOpen: isOpen, catalogue: function () { return catalogue(); }, search: function (q) { return search(catalogue(), q); }, suggestions: function () { var c = catalogue(); return suggest(c, recent(c)); }, recent: function () { return recent(catalogue()); }, relabel: relabel, _reset: function () { try { localStorage.removeItem(LS_RECENT); localStorage.removeItem(LS_COUNTS); } catch (e) { } } };
    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', mountButton); } else { mountButton(); }
    window.addEventListener('villa-config-loaded', mountButton);
    document.addEventListener('villa-language-changed', relabel);
})();
