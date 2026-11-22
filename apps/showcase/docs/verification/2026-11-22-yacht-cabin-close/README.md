# Yacht — cabines rapprochées, 22 novembre 2026

## Réglage

Cadrage des huit espaces de couchage basé sur les limites réelles de leurs maillages (murs, mobilier, spots). Les huit coins des bounding boxes sont transformés en repère de pièce avec son échelle Z, puis mémorisés dans une WeakMap. Recentrage dans le plan de caméra en trois passes, suivi d'un ajustement final conservant une marge NDC de 0,975. Calcul à la sélection et au redimensionnement seulement. Pas de calcul supplémentaire dans animate ; aucun ajout de géométrie, shader, lumière ou texture. Autres espaces et extérieur inchangés. Orientation latérale et côté du pied du lit conservés.

## Cadrage

Banc verify-yacht-cabin-close.html : huit espaces sur quatre zones libres (1280 × 800, 420 × 600 décalée, 390 × 700 et 900 × 700), soit 32 cas. Toutes les bounding boxes sont dans le cadre avec extent < 0,975 ; aucun oreiller masqué par sa tête de lit. Distance réduite sur tous les cas : de 1,56 à 26,34 %. Cabine capitaine : 14,19 % à 1280 × 800, 6,96 % en zone libre 420 × 600, 5,40 % en portrait 390 × 700, 12,72 % à 900 × 700. Ne pas promettre un même gain sur tous les formats. L'outline est une ligne de sélection, pas un maillage du mobilier.

## Fluidité

Cabine capitaine, 1280 × 800 avec zone libre 420 × 600, A/B/B/A, 1,2 s de chauffe puis 4 s par mesure. Nuit fixée à 45 s et eau figée pour la comparaison. Ancien fit injecté depuis before.html et nouvelle fonction exécutés dans le même contexte. 59,81 → 59,68 images/s (-0,22 %), mesure locale. Aucun shader en échec. Build/lint réussis. Vérification de projection sur les bounds complète les captures avant/après.
