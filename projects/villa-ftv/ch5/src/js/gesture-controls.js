/* Villa FTV — verrou des gestes de zoom (v6.0.4).
   Les écrans (TSW, iPad / iPhone Crestron One, Web XPanel) ne doivent jamais pouvoir zoomer la GUI :
   pincement à deux doigts, double appui, pincement au pavé tactile. Chargé par index.html et iphone.html
   juste après villa-joins.js ; aucune dépendance. Complète le <meta viewport user-scalable=no>, que
   WebKit (iOS) ignore depuis iOS 10. */
(function () {
    'use strict';
    var st = document.createElement('style');
    st.id = 'gesture-controls-style';
    // pan-x pan-y : défilement autorisé, pincement et double appui refusés (Chromium / Android TSW, WebXPanel).
    st.textContent = 'html,body{touch-action:pan-x pan-y;-ms-touch-action:pan-x pan-y;overscroll-behavior:none}';
    (document.head || document.documentElement).appendChild(st);
    var stop = function (ev) { if (ev.cancelable) { ev.preventDefault(); } };
    // WebKit (iOS, Crestron One) : événements gesture* propriétaires, seule parade au pincement.
    ['gesturestart', 'gesturechange', 'gestureend'].forEach(function (t) { document.addEventListener(t, stop, { passive: false }); });
    // Deux doigts ou plus : jamais de zoom, même quand touch-action n'est pas honoré.
    document.addEventListener('touchmove', function (ev) { if (ev.touches && ev.touches.length > 1) { stop(ev); } }, { passive: false });
    // Double appui : couvert par touch-action pan-x pan-y (Chromium et WebKit >= iOS 13) ; pas de blocage de touchend,
    // qui supprimerait le clic synthetise des appuis rapides repetes (+ / - de consigne, volume).
    // Pavé tactile / molette avec Ctrl (XPanel sur PC ou Mac) : pincement du navigateur refusé.
    document.addEventListener('wheel', function (ev) { if (ev.ctrlKey) { stop(ev); } }, { passive: false });
})();
