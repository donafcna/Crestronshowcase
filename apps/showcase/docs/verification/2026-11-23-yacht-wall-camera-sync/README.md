# Yacht — coordination murs/caméra, 23 novembre 2026

## Réglage

Choix des parois à abaisser selon la position réelle de la caméra relativement à la pièce, plutôt que son yaw seul. Anticipation de 240 ms sur la trajectoire exponentielle existante, et maximum des cibles actuelle/anticipée pour dégager le passage. Descente plus rapide (14/s), remontée 6/s conservée. Les murs de la pièce quittée restent bas tant que la caméra se déplace et que la pièce reste dans une zone de visibilité élargie ; libération après arrivée (écarts cible < 0,3 m, yaw < 0,04 rad, pitch < 0,025 rad, rayon < 0,15 m) ou sortie de cette zone/pont masqué. Restauration progressive, état courant conservé en cas d'interruption. Préférence réduction des animations conservée.

Aucun nouveau maillage, lumière, matériau ou texture. Positionnement et vitesse de la caméra inchangés. Un vecteur de projection réutilisé et un Set des pièces quittées ; retrait après libération. Retour immédiat du traitement quand aucun mur n'est concerné. L'anticipation est précalculée comme constante. Le contour de pièce et le mobilier restent inchangés.

## Comportement

Banc verify-yacht-wall-camera-sync.html : 15 assertions réussies (benchmark-first.json), notamment vraie position latérale opposée au yaw, anticipation du prochain côté, ancien mur maintenu bas pendant le pan, restauration après arrivée, continuité/inversion, changements rapides sur 37 pièces, ensembles vidés et réduction des animations. Les tests sont déterministes et utilisent les vraies fonctions du modèle. Les captures montrent l'abaissement à caméra fixe ; la validation en ligne complète le déplacement réel.

## Mesures de fluidité

Ancienne fonction updateRoomCutaway injectée depuis before.html, comparée à la nouvelle fonction dans le même contexte avec orbite continue à 0,6 rad/s et départ identique. A/B/B/A, chauffe 1,5 s puis mesure 4,2 s, zone libre 420 × 600 dans viewport 1280 × 800, eau figée. Grand salon 59,63 → 59,82 i/s (+0,33 %) ; Sky lounge 59,78 → 59,88 (+0,18 %). Premier passage cabine 59,84 → 57,55 (-3,83 %) : seuil dépassé ; premier rappel très dispersé (42,5–60 i/s), conservé sans prétendre à un gain. Contrôle prolongé avec chauffe 3,5 s et mesure 10,5 s (un tour complet), cabine 59,89 → 59,84 (-0,08 %), réussi (benchmark-captain-extended.json). Ce banc compare les mises à jour en orbite ; les assertions couvrent les changements de pièce. Résultats locaux, pas une garantie universelle. Build/lint réussis.
