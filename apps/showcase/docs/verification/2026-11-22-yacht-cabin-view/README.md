# Yacht — vue des cabines, 22 novembre 2026

## Correction

La tête de lit est au +X dans le modèle. Le choix de caméra des cinq pièces de type bed regardait depuis ce côté et cachait les deux oreillers. Inversion du côté longitudinal (-X), en conservant la symétrie bâbord/tribord, le pitch de 0,60 rad et le fit de la pièce entière. Distances avant/après identiques. Suites propriétaire et cabines équipage étaient déjà du bon côté et restent inchangées. Aucun nouveau calcul par image ; interpolation, géométrie, éclairages et matériaux conservés.

## Vérification

Banc scripts/verify-yacht-cabin-view.html sur preview local 4327 : huit espaces de couchage contrôlés ; rayons caméra → centres des coussins contre les têtes de lit. Cinq cabines passent de deux oreillers masqués à zéro. Suite propriétaire : zéro avant/après ; équipage sans tête de lit dans ce modèle. Aucun shader en échec. Captures à caméra stabilisée et nuit figée, avant/après même scène ; contrôle visuel dans la vraie interface.

Cabine capitaine, zone libre 420 × 600 dans viewport 1280 × 800, séquence A/B/B/A, chauffe 1,2 s et mesure 4 s par passage : 59,87 → 59,81 images/s (-0,11 %). Textures : 7 identiques ; appels visibles 599 → 447 par culling de la nouvelle orientation. Eau figée pour cette comparaison. Mesure locale, pas une garantie sur tous les appareils. Build et lint réussis. Pas de test ajouté pour cette simple correction de paramètre ; le banc visuel documente la visibilité et la cadence.
