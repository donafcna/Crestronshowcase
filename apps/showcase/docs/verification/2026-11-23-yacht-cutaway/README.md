# Yacht — murs de premier plan discrets, 23 novembre 2026

## Comportement

Les murs de périmètre orientés vers la caméra sont abaissés à 22 cm dans la seule pièce sélectionnée ; les appliques et corniches au-dessus sont masquées. Les autres parois restent pleines, les plinthes et le balisage bas restent visibles. Les éléments sont enregistrés depuis roomBase avant création du mobilier : aucune armoire ni tête de lit traitée comme mur. Au changement de pièce et à la vue extérieure, positions, hauteurs et visibilité sont restaurées. L'orientation suit le yaw réellement interpolé de la caméra, y compris en rotation manuelle ; seuil de produit scalaire 0,18 pour éviter les côtés vus presque de tranche. Les transformations ne changent qu'au passage d'un secteur. Quatre tests de signe par image ; aucun parcours de scène dans animate.

Pas de transparence ni nouveau matériau, maillage ou texture. Murets opaques et géométrie existante redimensionnée. Cadrage, angles et interpolation inchangés. Les limites du fit restent calculées avant découpe ; pas de zoom causé par l'abaissement.

## Fonctionnement et cadrage

verify-yacht-cutaway.html : 37 pièces sur quatre zones libres, 148 cas réussis, cadre entier, autres pièces restaurées, angles inchangés, shaders sans échec. Comparaison dans le même contexte avec découpe désactivée/activée à la même caméra. Captures Grand salon, Sky lounge et Cabine capitaine. verify-yacht-cutaway-lifecycle.html : 37 pièces × 4 orientations = 148 contrôles de hauteur côté caméra et restauration côté opposé, aucun échec. Retour Extérieur : restauration complète des 37 pièces, sélection all.

## Fluidité

A/B/B/A sur Grand salon, Sky lounge et Cabine capitaine ; chauffe 1,2 s, mesure 4 s, viewport 1280 × 800 et zone libre 420 × 600. Nuit fixée à 45 s, eau figée pour comparaison. Moyenne globale 59,84 → 59,80 i/s (-0,06 %). Appels visibles : 640 → 627, 571 → 562, 445 → 438 respectivement ; textures conservées (7). Aucun ajout de coût GPU. Mesures locales, sans garantie universelle. Build/lint réussis.
