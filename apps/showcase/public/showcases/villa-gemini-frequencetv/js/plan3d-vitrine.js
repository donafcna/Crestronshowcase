/* ===========================================================================
 * plan3d-vitrine.js — VITRINE UNIQUEMENT (crestrongui.vercel.app). Pose le plan 3D de la villa
 * derrière le GUI de la dalle : toile plein écran, fenêtre nette dans la carte Sources, puis charge
 * js/plan3d.js (module Three.js). Injecté dans index.html par scripts/sync-villa-crans.py ; la
 * source CH5 (VillaCrans/src) ne contient rien de tout cela. Maintenu à la main dans ce dépôt,
 * comme js/local-feedback.js. Actif si villa_config.meta.plan3d.actif (posé par le script de sync).
 * =========================================================================== */
(function () {
    'use strict';
    var CSS = [
        "  /* Plan 3D (16.09.2026) : toile plein écran sous l'interface, jamais cliquable. z-index négatif :",
        "     elle passe sous le flux normal sans créer de contexte d'empilement sur .app-container (les",
        "     fenêtres modales y vivent avec leurs z-index 99999, au-dessus du voile 99998 du body). */",
        "  #plan3d-bg { position: fixed; inset: 0; width: 100%; height: 100%; z-index: -1; pointer-events: none; display: block; }",
        "  #plan3d-bg:not(.plan3d-actif) { display: none; }",
        "  /* Fenêtre 3D dans la carte Sources : le fond (et son flou) de la carte est évidé au rectangle",
        "     #plan3d-fenetre, calculé par plan3dLayout() ; la barre de volume descend en bas de la carte. */",
        "  html.plan3d-actif #plan3d-fenetre { display: block !important; flex: 1 1 auto; min-height: 0; pointer-events: none; }   /* prend la place restante, jamais plus */",
        "  html.plan3d-actif #volume-bar-wrapper { flex: 0 0 auto !important; }",
        "  html.plan3d-actif #card-av.plan3d-evide {",
        "      /* La carte perd son fond et son flou ; ses enfants sont regroupés dans deux bandeaux opaques",
        "         (titre + tuiles en haut, volume + état en bas) qui portent la couleur : entre les deux,",
        "         la toile 3D apparaît nette. Couleur des bandeaux par thème. */",
        "      backdrop-filter: none !important; -webkit-backdrop-filter: none !important;",
        "      background-color: transparent !important;",
        "  }",
        "  html.plan3d-actif .plan3d-band { background-color: var(--p3d-band); box-sizing: border-box; flex: 0 0 auto; display: flex; flex-direction: column; }",
        "  html.plan3d-actif .plan3d-band-top { margin: -15px -20px 0 -20px; padding: 15px 20px 12px 20px; border-radius: 15px 15px 0 0; }",
        "  html.plan3d-actif .plan3d-band-bottom { margin: 0 -20px -15px -20px; padding: 10px 20px 15px 20px; border-radius: 0 0 15px 15px; gap: 8px; }",
        "  html.plan3d-actif { --p3d-band: rgba(15, 23, 42, 0.9); }",
        "  html.plan3d-actif body.theme-glass { --p3d-band: rgba(15, 23, 42, 0.86); }",
        "  html.plan3d-actif body.theme-light { --p3d-band: rgba(248, 250, 252, 0.95); }",
        "  /* Thème clair : les cartes claires sont quasi transparentes et comptent sur un fond clair ;",
        "     la toile 3D est donc limitée à la fenêtre (le reste de la page garde son fond). */",
        "  html.plan3d-actif body.theme-light #plan3d-bg { clip-path: inset(var(--p3d-top, 0) var(--p3d-right, 0) var(--p3d-bot, 0) var(--p3d-left, 0) round 12px); }",
        "  html.plan3d-actif.plan3d-sans-fenetre body.theme-light #plan3d-bg { display: none; }   /* pas de fenêtre : le thème clair garde son fond clair */",
        ""
    ];

    // Plan 3D : chargé seulement si la configuration l'active (module ES, Three.js embarqué dans js/vendor)
    (function () {
        var vc = window.villaConfig || window.villaConfigEmbedded || {};
        var p3 = vc.meta && vc.meta.plan3d;
        if (!p3 || p3.actif === false) return;
        // Toile, feuille de style et fenêtre sont créées ici : rien de tout cela n'existe dans la source CH5.
        var c = document.createElement('canvas'); c.id = 'plan3d-bg'; c.className = 'plan3d-actif'; c.setAttribute('aria-hidden', 'true');
        document.body.insertBefore(c, document.body.firstChild);
        var st = document.createElement('style'); st.id = 'plan3d-vitrine'; st.textContent = CSS.join('\n'); document.head.appendChild(st);
        document.documentElement.classList.add('plan3d-actif');   // sur <html> : applyTheme() réécrit la classe de <body>
        var card = document.getElementById('card-av'), vol = document.getElementById('volume-bar-wrapper');
        var fen = null;
        if (card && vol) { fen = document.createElement('div'); fen.id = 'plan3d-fenetre'; fen.style.display = 'none'; card.insertBefore(fen, vol); }
        var s = document.createElement('script'); s.type = 'module'; s.src = 'js/plan3d.js'; document.body.appendChild(s);
        // Regroupe les enfants de la carte en deux bandeaux autour de la fenêtre (aucun id déplacé)
        if (card && fen && !card.querySelector('.plan3d-band')) {
            var top = document.createElement('div'), bot = document.createElement('div');
            top.className = 'plan3d-band plan3d-band-top'; bot.className = 'plan3d-band plan3d-band-bottom';
            var kids = Array.prototype.slice.call(card.children), seen = false;
            kids.forEach(function (k) { if (k === fen) { seen = true; return; } (seen ? bot : top).appendChild(k); });
            card.insertBefore(top, fen); card.appendChild(bot);
        }
        function plan3dLayout() {
            if (!card || !fen) return;
            var cr = card.getBoundingClientRect(), fr = fen.getBoundingClientRect();
            if (cr.width === 0) return;                // carte masquée (changement de pièce) : on garde le dernier cadrage
            var ok = fr.width > 40 && fr.height >= 110; // trop bas (iPad, XPanel 768 px) : pas de fenêtre, fond d'écran seul
            card.classList.toggle('plan3d-evide', ok);
            document.documentElement.classList.toggle('plan3d-sans-fenetre', !ok);
            if (ok) {
                card.style.setProperty('--p3d-x', (fr.left - cr.left) + 'px'); card.style.setProperty('--p3d-y', (fr.top - cr.top) + 'px');
                card.style.setProperty('--p3d-w', fr.width + 'px'); card.style.setProperty('--p3d-h', fr.height + 'px');
                card.style.setProperty('--p3d-bottom', Math.max(0, cr.bottom - fr.bottom) + 'px');
                if (c) {
                    c.style.setProperty('--p3d-top', fr.top + 'px'); c.style.setProperty('--p3d-left', fr.left + 'px');
                    c.style.setProperty('--p3d-right', Math.max(0, window.innerWidth - fr.right) + 'px'); c.style.setProperty('--p3d-bot', Math.max(0, window.innerHeight - fr.bottom) + 'px');
                }
            }
            if (window.Plan3D && window.Plan3D.setWindow) window.Plan3D.setWindow(ok ? { x: fr.left, y: fr.top, w: fr.width, h: fr.height } : null);
        }
        window.plan3dLayout = plan3dLayout;
        if (window.ResizeObserver && card) new ResizeObserver(function () { plan3dLayout(); }).observe(card);
        if (window.ResizeObserver && fen) new ResizeObserver(function () { plan3dLayout(); }).observe(fen);
        window.addEventListener('resize', plan3dLayout);
        plan3dLayout(); setTimeout(plan3dLayout, 800); setTimeout(plan3dLayout, 2500);
        setInterval(plan3dLayout, 1500);               // filet : la carte est re-rendue à chaque pièce
    })();
})();
