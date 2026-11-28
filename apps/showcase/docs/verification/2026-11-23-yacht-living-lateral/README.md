# Yacht — espaces de vie latéraux, 23 novembre 2026

## Changement

Angle du Grand salon étendu à 18 espaces supplémentaires : Beach club, Spa & massage, Fitness, Cinéma, Mess équipage, Terrasse arrière & bassin, Salle à manger, Cuisine principale, Salon avant, Dîner extérieur, Sky lounge, Terrasse privée & jacuzzi, Terrasse panoramique, Salon observation, Solarium, Bar & cuisine extérieure, Lounge couvert, Piscine du sun deck. Types lounge/dining/mess/bar/sun/pool/cinema/spa/gym/galley réunis dans un Set commun. Pitch 0,43 rad (24,6°), yaw -0,40 rad avec symétrie bâbord/tribord ; fit des volumes réels et recentrage conservés. Grand salon, cabines (dont suite propriétaire), locaux techniques et vue extérieure inchangés. Aucun nouveau maillage, matériau, texture, lumière ou calcul dans animate.

## Cadrage

37 espaces sur quatre formats de zone libre : 1280 × 800, 420 × 600 décalée, 390 × 700, 900 × 700. 148 contrôles réussis : limites des maillages dans le cadre (extent < 0,976), shaders sans échec, oreillers non masqués par leur tête de lit. Les angles avant reflètent le Grand salon déjà latéral et les autres espaces à 0,60 rad. Captures comparatives nuit fixée à 45 s et caméra stabilisée : Sky lounge, Salle à manger, Terrasse panoramique, Cinéma. Les parois basses cachent naturellement une partie inférieure du mobilier proche depuis un angle latéral.

## Fluidité

Banc verify-yacht-living-lateral.html : quatre sujets, A/B/B/A, chauffe 1,2 s puis mesure 4 s, même contexte WebGL, eau figée pour comparaison stable, viewport 1280 × 800 et zone libre 420 × 600. Sky lounge : 59,90 → 59,76 i/s (-0,23 %) ; Salle à manger : 59,90 → 59,85 (-0,09 %) ; Terrasse panoramique : 59,76 → 59,94 (+0,31 %) ; Spa : 59,13 → 58,71 (-0,71 %). Chaque sujet respecte le seuil local -3 %. Mesures locales, pas une garantie universelle. Build/lint réussis.
