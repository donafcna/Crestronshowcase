/*
 * La Réserve Genève — icônes SVG du GUI (trait 1.6, viewBox 24). Dessins propres au projet, aucun emoji.
 * window.svgIcon(nom) → chaîne <svg>. Couleur = currentColor (jetons de thème).
 */
(function () {
  'use strict';
  var P = {
    airplay: '<path d="M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1"/><path d="M12 15l5 6H7z"/>',
    dj: '<circle cx="10" cy="12" r="7.5"/><circle cx="10" cy="12" r="2"/><path d="M19.5 3.5v11.5l-3 3"/><circle cx="19.5" cy="3.5" r="1"/>',
    ipod: '<rect x="6" y="2" width="12" height="20" rx="2.5"/><rect x="8.5" y="4.5" width="7" height="5" rx="1"/><circle cx="12" cy="15.5" r="3.2"/><circle cx="12" cy="15.5" r=".9"/>',
    music: '<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',
    laptop: '<rect x="4" y="4" width="16" height="11" rx="1.5"/><path d="M2 19h20l-1.5-4h-17z"/>',
    tablet: '<rect x="4" y="2" width="16" height="20" rx="2.5"/><path d="M11 18.5h2"/>',
    power: '<path d="M12 2.5v9"/><path d="M6.2 6.3a8 8 0 1 0 11.6 0"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    volume: '<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/><path d="M19 6a8.5 8.5 0 0 1 0 12"/>',
    mute: '<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16.5 9.5l5 5M21.5 9.5l-5 5"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    broadcast: '<circle cx="12" cy="12" r="2"/><path d="M16.2 7.8a6 6 0 0 1 0 8.4M7.8 16.2a6 6 0 0 1 0-8.4"/><path d="M19 5a10 10 0 0 1 0 14M5 19A10 10 0 0 1 5 5"/>',
    stop: '<rect x="6" y="6" width="12" height="12" rx="2"/>',
    back: '<path d="M15 5l-7 7 7 7"/>'
  };
  window.svgIcon = function (name, cls) {
    return '<svg class="ic' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + (P[name] || '') + '</svg>';
  };
})();
