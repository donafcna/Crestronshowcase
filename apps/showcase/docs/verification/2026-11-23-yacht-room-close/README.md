# Yacht — cadrage de toutes les pièces, 23 novembre 2026

## Changement

Extension aux 37 pièces du cadrage déjà validé pour les cabines : limites réelles des maillages des meubles et des murs, mises en cache, recentrage dans le plan de caméra puis fit avec marge 0,975. Même orientation latérale, interpolation et boucle animate. Aucun objet, matériau, lumière, texture ou calcul par image supplémentaire. Cabines et vue extérieure conservent leur comportement.

## Vérification du cadrage

Banc scripts/verify-yacht-room-close.html : 37 pièces sur quatre zones libres (1280 × 800, 420 × 600 décalée, 390 × 700, 900 × 700), 148 cas réussis. Toutes les bounding boxes des maillages sont dans le cadre (extent < 0,976), aucune distance augmentée, aucune erreur shader ni tête de lit devant les coussins. Les cabines sont inchangées. Grand salon : distance caméra réduite de 26,65 %, 2,27 %, 1,69 % et 10,75 % respectivement. Gain limité par la largeur réellement disponible : ne pas annoncer un pourcentage universel.

## Fluidité

Grand salon, viewport 1280 × 800 avec zone libre 420 × 600, A/B/B/A, chauffe 1,2 s puis mesure 4 s. Fit précédent injecté depuis before.html ; même contexte WebGL, nuit fixée à 45 s, eau figée pour comparaison stable. 59,66 → 59,98 images/s (+0,54 %). Mesure locale ; les résultats ne garantissent pas tous les appareils. Build/lint réussis. Les captures before/after montrent le salon à la même orientation et à caméra stabilisée.
