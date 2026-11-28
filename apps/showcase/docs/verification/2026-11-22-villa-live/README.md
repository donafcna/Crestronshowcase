# Vérification en production — 22 novembre 2026

URL : https://crestrongui.vercel.app/interfaces/residentiel/villa-gemini-frequencetv/phone
Déploiement Vercel READY, commit a6c3cb209f60913c769dc698d4f8bbe608aef918.
Navigateur intégré, présentation smartphone sur fenêtre 1280 × 720. Aucun code modifié ou publié pendant cette vérification.

## Pièces et matériaux

Les 17 sélections ont été exercées via le GUI, avec OFF puis TOTAL. Captures room-01 à room-17 et variantes -off. Les captures OFF sont prises pendant les transitions : ce ne sont pas des comparatifs stabilisés à caméra identique.

Salon, cuisine, salle à manger, suite parentale, chambres 1/2/3, suite invités, bureau, cinéma et bar : mobilier, matériaux et éclairage visibles. Le relief est particulièrement lisible sur les canapés/lits et les chants du mobilier ; le bois et les ombres de contact sont visibles dans les pièces meublées.

Pool House, piscine, sauna/hammam, garage, golf, local technique : affichage et commandes vérifiés, mais le traitement de géométrie du mobilier et des ombres de sol exclut explicitement les extérieurs et les types sauna/garage/golf/technique. Ne pas présenter ces six espaces comme ayant reçu le même niveau d'amélioration.

## Transitions et éclairage

Navigation parcourue sur les 17 pièces. Séquences supplémentaires enregistrées pendant environ 2,6 secondes chacune : salon vers chambre 2, chambre 2 vers piscine, extinction et allumage au salon. Les captures montrent des étapes intermédiaires puis la destination attendue ; aucun blocage persistant ou disparition de scène constaté. Aucune erreur ni avertissement dans les logs navigateur consultés.

## Limite de validation des performances

Le compteur du moteur et performance.now ne sont pas accessibles dans l'évaluation en lecture seule de l'outil navigateur. Les horodatages de observations.json sont ceux des captures côté outil, pas ceux des images WebGL. Ils ne permettent ni de calculer les FPS, ni de détecter toutes les micro-saccades. La fluidité identique à la version précédente en production n'est donc pas certifiée par cet essai. Le benchmark local antérieur concernait surtout une scène stabilisée et ne remplace pas une mesure pendant les transitions.

Le rendu a d'abord été suspendu en arrière-plan ; les observations ont ensuite été réalisées navigateur visible. Le cycle jour/nuit de la démonstration est resté actif. Aucun test sur TSW ou téléphone physique effectué.
