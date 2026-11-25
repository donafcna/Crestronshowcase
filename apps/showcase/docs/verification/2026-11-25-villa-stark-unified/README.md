# Villa Stark — version 2.3.19, 25 novembre 2026

## Fond et châssis

Une seule photographie couvre le fond, avec ses calques synchronisés. Suppression de la seconde photographie de paysage et du calcul de rectangle libre qui réduisait la villa en vignette. Les dimensions, sélecteurs de supports et flèches de Mode Scène utilisent DeviceFrame commun ; seul l'ancrage du châssis à gauche reste spécifique.

## Corrections du GUI

- Logo officiel rendu sans cartouche : lettres blanches sur thèmes sombres, noires en Clair, orange conservé par filtre SVG.
- Stores sur smartphone : deux colonnes, cinq rangées, illustration et commandes dans des zones séparées. Neuf pièces sans défilement ; boutons de 40 px de haut.
- Les boutons de sélection des pièces d'éclairage n'affichent plus l'état des circuits.
- Bouton visiteur retiré des outils ; personnage et bulle Bonjour masqués, y compris dans la caméra.
- L'interphone anime le vantail sur les commandes d'ouverture, pendant 2,2 s ; fermeture automatique après 9 s. Le passage révélé est une illustration SVG, pas une vidéo réelle.

## Navigation et automatisme

Molette sur la photographie : bas = maison, haut = dernière pièce. Seuil cumulé de 35 et verrou de 600 ms contre les bascules répétées. La molette sur le GUI conserve son défilement. La sélection d'une pièce d'éclairage ou de climat ouvre son intérieur. Le dézoom conserve les commandes de la pièce.

Reprise automatique commune après 120 s sans interaction réelle. Chaque clic, touche ou défilement réarme le délai. Pause conservée lors des changements de support/projet dans Showcase. Démarrage initial inchangé (10 s, 60 s smartphone, scénarios guidés existants). Démonstration générique activée pour Villa Stark ; les exclusions historiques des autres projets restent inchangées.

## Vérifications effectuées dans cette session

- Build réussi ; lint sans erreur, avertissements historiques du dépôt.
- Trois thèmes smartphone : neuf cartes stores, pas de recouvrement illustration/boutons, boutons 40 px, aucun débordement vertical de cette page.
- Quatre supports × trois thèmes × normal/Scène : fond couvrant, aucun masque créant de vignette. Aller-retour des flèches constaté. Xpanel : premier clic pendant le redimensionnement sans effet, second clic après stabilisation réussi.
- Boutons éclairage : dix pièces, aucune classe d'état sel/cool.
- Navigation SALON → molette bas (maison, commandes SALON conservées) → molette haut (SALON) → sélection CUISINE (intérieur CUISINE).
- Interphone : état EN OUVERTURE observé, puis OUVERT et vantail entièrement rétracté. Compteur de pause 120 s après clic réel. Aucune erreur console capturée sur ce parcours.

Les JSON et captures de ce dossier documentent ces contrôles ciblés. La matrice exhaustive de toutes les pages/modales, des contrastes et de tous les modes Taille réelle/Responsive n'a pas été exécutée ; ne pas assimiler les résultats historiques à une nouvelle recette exhaustive. Aucun programme matériel modifié.
