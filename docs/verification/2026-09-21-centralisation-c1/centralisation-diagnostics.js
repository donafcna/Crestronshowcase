(function () {
    'use strict';
    // CENT-20260921-1. Observation only: native CH5 commands and feedback stay unchanged.
    // CH5 publishes repeatdigital on press, before click/release.
    // cb/dom/raf start at pointerdown, NOT a network RTT or proof of screen paint.
    var JOINS = [401, 402, 403, 404, 405, 407, 408, 409, 410, 411];
    var KEY = 'villa_lat_overlay', LIMIT = 45000;
    var states = {}, subscriptions = {}, pending = null, lastTouch = -1000;
    var sequence = 0, cooldownUntil = 0, box = null, visible = false;
    var lastText = 'LAT C1 : pret', taps = [], lastTap = -1000, hintTimer = null;
    var records = [], retry = null;
    function now() { return window.performance.now(); }
    function selected(el) {
        return el.getAttribute('selected') === 'true' ||
            !!el.querySelector('.ch5-button--selected');
    }
    function render() {
        if (box && visible) box.textContent = lastText;
    }
    function show() {
        if (!box) {
            box = document.createElement('div');
            box.id = 'lat-overlay';
            box.style.cssText = 'position:fixed;left:8px;right:8px;bottom:8px;z-index:2000000;'
                + 'font:600 11px/1.4 monospace;color:#fff;background:#0f172a;'
                + 'padding:5px 9px;border:1px solid #94a3b8;border-radius:6px;'
                + 'pointer-events:none;overflow-wrap:anywhere';
            document.body.appendChild(box);
        }
        box.style.display = '';
        box.textContent = lastText;
    }
    function hide() { if (box) box.style.display = 'none'; }
    function emit(entry, status) {
        var r = { id: entry.id, join: entry.join, status: status };
        ['cb', 'dom', 'raf'].forEach(function (key) {
            if (entry[key] != null) r[key] = Math.round(entry[key]);
        });
        records.push(r);
        if (records.length > 100) records.shift();
        var line = '[LAT-GUI] v=C1 id=' + r.id + ' j=' + r.join + ' status=' + status;
        ['cb', 'dom', 'raf'].forEach(function (key) {
            if (r[key] != null) line += ' ' + key + '=' + r[key];
        });
        lastText = line;
        render();
        // Diagnostics are bounded ASCII messages; no wholesale console forwarding.
        // Send after the measured path, without touching the selected state of any button.
        setTimeout(function () {
            var cfg = window.villaConfigEmbedded;
            if (cfg && cfg.meta && cfg.meta.mode === 'showcase') return;
            try { CrComLib.publishEvent('s', '100', line.slice(0, 119)); } catch (e) { }
        }, 0);
    }
    function finish(entry, status) {
        if (pending !== entry) return;
        pending = null;
        clearTimeout(entry.timer);
        if (entry.observer) entry.observer.disconnect();
        if (entry.frame != null) window.cancelAnimationFrame(entry.frame);
        if (status !== 'ok') cooldownUntil = now() + LIMIT;
        emit(entry, status);
    }
    function sampleDom(entry) {
        if (pending !== entry) return;
        if (entry.dom == null && selected(entry.el)) entry.dom = now() - entry.start;
        if (entry.cb == null || entry.dom == null || entry.frame != null) return;
        entry.frame = window.requestAnimationFrame(function () {
            entry.raf = now() - entry.start;
            finish(entry, 'ok');
        });
    }
    function buttonOf(ev) {
        var el = ev.target && ev.target.closest ?
            ev.target.closest('ch5-button[data-join]') : null;
        if (!el) return null;
        var join = Number(el.getAttribute('data-join'));
        return JOINS.indexOf(join) !== -1 ? { el: el, join: join } : null;
    }
    function onDown(ev) {
        var b = buttonOf(ev);
        if (!b || document.hidden) return;
        if (ev.isPrimary === false || (ev.button != null && ev.button !== 0)) return;
        var time = now();
        if (ev.type === 'touchstart') lastTouch = time;
        if (ev.type === 'mousedown' && time - lastTouch < 1000) return;
        var entry = { id: ++sequence, join: b.join, el: b.el, start: time };
        if (pending) {
            finish(pending, 'overlap');
            return; // Both activations are ambiguous; do not pair a late return to a new press.
        }
        if (time < cooldownUntil) {
            cooldownUntil = time + LIMIT;
            emit(entry, 'cooldown');
            return;
        }
        if (states[b.join] === true) {
            emit(entry, selected(b.el) ? 'already-selected' : 'state-dom-mismatch');
            return; // Held feedback is not an acknowledgement of a repeated command.
        }
        if (states[b.join] !== false) {
            emit(entry, 'state-unknown');
            return;
        }
        pending = entry;
        entry.timer = setTimeout(function () {
            finish(entry, entry.cb == null ? 'timeout' : 'dom-frame-timeout');
        }, LIMIT);
        if (window.MutationObserver) {
            entry.observer = new MutationObserver(function () { sampleDom(entry); });
            entry.observer.observe(b.el, { attributes: true, subtree: true, childList: true,
                attributeFilter: ['selected', 'class'] });
        }
        lastText = 'LAT C1 : attente join ' + b.join + ' (45 s max)';
        render();
    }
    function subscribe() {
        if (typeof CrComLib === 'undefined') return false;
        JOINS.forEach(function (j) {
            if (subscriptions[j]) return;
            try {
                CrComLib.subscribeState('b', String(j), function (v) {
                    states[j] = v === true;
                    if (pending && pending.join === j && v === true && pending.cb == null) {
                        pending.cb = now() - pending.start;
                        sampleDom(pending);
                    }
                });
                subscriptions[j] = true;
            } catch (e) { }
        });
        return JOINS.every(function (j) { return subscriptions[j]; });
    }
    function abort(reason) {
        if (pending) finish(pending, reason);
    }
    document.addEventListener('visibilitychange', function () {
        if (document.hidden) abort('hidden');
    });
    ['DISCONNECT_WS', 'DISCONNECT_CIP'].forEach(function (name) {
        window.addEventListener(name, function () { abort('disconnected'); states = {}; });
    });
    function onTitleDown(ev) {
        var h = ev.target && ev.target.closest ? ev.target.closest('h3') : null;
        if (!(h && h.querySelector('[data-i18n="central_title"]'))) return;
        var time = now();
        if (time - lastTap < 250) return;
        lastTap = time;
        taps.push(time);
        taps = taps.filter(function (t) { return time - t < 3000; });
        clearTimeout(hintTimer);
        if (taps.length === 5) {
            taps = [];
            visible = !visible;
            try { localStorage.setItem(KEY, visible ? '1' : '0'); } catch (e) { }
            if (visible) show(); else hide();
        } else if (taps.length >= 2 && !visible) {
            show();
            box.textContent = 'LAT ' + taps.length + '/5';
            hintTimer = setTimeout(hide, 1500);
        }
    }
    if (window.PointerEvent) {
        document.addEventListener('pointerdown', onDown, true);
        document.addEventListener('pointerdown', onTitleDown, true);
        document.addEventListener('pointercancel', function () { abort('cancelled'); }, true);
    } else {
        document.addEventListener('touchstart', onDown, true);
        document.addEventListener('touchstart', onTitleDown, true);
        document.addEventListener('touchcancel', function () { abort('cancelled'); }, true);
        document.addEventListener('mousedown', onDown, true);
        document.addEventListener('mousedown', onTitleDown, true);
    }
    function boot() {
        try { visible = localStorage.getItem(KEY) === '1'; } catch (e) { }
        if (visible) show();
        if (!subscribe()) retry = setInterval(function () {
            if (subscribe()) { clearInterval(retry); retry = null; }
        }, 500);
    }
    window.villaCentralisationDiagnostics = { version: 'CENT-20260921-1', records: records };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();
})();
