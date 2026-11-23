# Yacht — murs progressifs, 23 novembre 2026

## Animation

Interpolation exponentielle indépendante du nombre d'images, depuis l'état courant de chaque côté de mur. Vitesse 10/s en descente (~300 ms pour 95 %), 6/s en remontée (~500 ms pour 95 %). Les inversions et changements de pièce conservent la hauteur courante ; les anciennes parois continuent leur remontée pendant la nouvelle sélection. Cible directionnelle smoothstep entre 0,08 et 0,28 au lieu d'un changement binaire de secteur. Les appliques descendent et rétrécissent avec la paroi avant masquage, sans transparence. Hauteur basse de 22 cm, meubles et caméra conservés. Préférence système de réduction des animations : changement immédiat.

Quatre cibles testées dans la pièce active, Set limité aux côtés réellement en mouvement ; retrait dès stabilisation, pas de parcours de scène. Les positions sont dérivées des valeurs initiales, sans accumulation d'erreurs. Aucun nouveau mesh, matériau, texture ni éclairage.

## Vérifications fonctionnelles

Banc verify-yacht-smooth-walls.html : 13 assertions réussies sur les hauteurs intermédiaires, absence de saut lors de la désélection, remontée monotone, restauration exacte, inversion d'orbite, changement de pièce, parcours rapide des 37 pièces et restauration globale, Set vidé, mobilier inchangé, réduction des animations immédiate. Planche transition.jpg : même caméra, nuit à 45 s, étapes 0/150/500 ms. Les temps des captures sont déterministes par pas de 1/60 s.

## Fluidité

Comparaison locale de la même machine d'état avec transformations immédiates ou progressives pendant une rotation continue à 0,6 rad/s. Même angle de départ par passage, même contexte WebGL, eau figée. A/B/B/A, chauffe 1,5 s puis mesure 4,2 s, zone libre 420 × 600 dans viewport 1280 × 800. Grand salon 56,81 → 57,35 i/s (+0,95 %) ; Sky lounge 59,90 → 59,91 (+0,01 %) ; Cabine capitaine 59,93 → 59,81 (-0,19 %). Chaque sujet respecte le seuil local -3 %. Ce témoin isole le coût de l'interpolation, pas une exécution complète de l'ancien source. Mesures locales, sans garantie universelle. Build/lint réussis.
