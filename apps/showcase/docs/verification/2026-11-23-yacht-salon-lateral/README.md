# Yacht — Grand salon latéral, 23 novembre 2026

## Réglage

Grand salon uniquement (id 11) : pitch 0,60 → 0,43 rad (34,4° → 24,6°), yaw -0,65 → -0,40 rad. Fit et recentrage existants conservés. Caméra 1,19 % plus proche à 1280 × 800 ; 3,83 % en zone libre 420 × 600 ; 3,77 % à 390 × 700 ; 4,03 % à 900 × 700. Pas de changement géométrique ni de surcoût dans animate. Autres espaces et extérieur inchangés.

## Vérification

Banc verify-yacht-salon-lateral.html, angles avant/après appliqués dans le même contexte WebGL. Limites des maillages du salon toutes dans le cadre sur quatre formats (extent <= 0,975), aucune erreur shader. Captures de nuit à 45 s et caméra stabilisée ; contrôle visuel de la silhouette et du mobilier. Les coussins du canapé avant se voient surtout de dos depuis ce côté, comme dans la vue précédente ; le canapé opposé montre ses assises et coussins.

## Fluidité

A/B/B/A, 1,2 s de chauffe puis mesure 4 s par passage, viewport 1280 × 800 et zone libre 420 × 600. Eau figée pour comparaison. 59,94 → 59,90 images/s (-0,07 %). Appels visibles 830 → 640 par culling ; textures conservées (7). Mesure locale, pas une garantie sur tous les appareils. Build/lint réussis.
