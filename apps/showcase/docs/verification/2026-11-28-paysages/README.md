# Villa Stark 2.3.36 — vérification du 28 novembre 2026

## Rideaux synchronisés
Les deux rideaux (suite parentale, repli gauche ; chambre amis, repli droite) partagent la position du moteur avec leur miniature. La texture complète est mise en cache, puis révélée par un contour projeté dans la perspective du rail. Le fond reçoit le dernier état disponible à chaque tranche de 16 ms.
Recette smartphone et tablette : fermeture 100 % identique dans les deux vues, arrêt intermédiaire identique ; écart observé pendant le mouvement au plus 0,2 point. Captures phone-* et tablet-* ci-jointes. XPanel : chambre amis fermée 100 % dans les deux vues. TSW : ouverture complète suite parentale 0 % dans les deux vues.

## Paysages retrouvés et intégrés
Conversation source et demandes : demandes-reprises.md. Quatre générations existantes, aucun nouveau lancement : Living, Dining, Master, Exterior. Stabilisation affine sur l’architecture, vitesse 55,6 %, fondu cyclique 2 secondes, vidéo muette de 15,96 secondes à 24 images/seconde. Source/ conserve les originaux et intermédiaires locaux, exclus du commit.
Lecture native masquée aux vitrages et aux zones naturelles. Montants et objets au premier plan restent photographiques. Pause des autres vues, pause si une toile ferme toute la baie, respect de la réduction des animations et photo de secours en cas d’erreur.
Recette navigateur local : les quatre médias atteignent readyState 4 sans erreur, seule la vue sélectionnée joue ; les trois autres sont en pause. Changement de pièce et retour extérieur vérifiés. La suite parentale masque la vidéo derrière son rideau fermé.
Mesures des raccords dans video-metrics.json : le contenu brut a un raccord inférieur au P95 des différences entre images ; la compression peut ajouter une petite variation au raccord (environ 0,44 à 0,48 niveau RGB après flou 3 px). Ne pas interpréter ces mesures comme une absence absolue de raccord perceptible.

## Contrôles de livraison
npm run build : succès. npm run lint : succès avec avertissements existants dans le dépôt. Vérification syntaxique et git diff --check avant commit. Cette recette couvre les paysages et rideaux de ce lot ; elle ne remplace pas un audit de toutes les autres pages du site.
