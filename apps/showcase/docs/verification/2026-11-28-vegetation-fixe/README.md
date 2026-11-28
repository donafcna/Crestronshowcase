# Villa Stark 2.3.39 — structures fixes, couronnes mobiles

## Correction
Huit masques enregistrés sur les photos 1672 × 941 : couronnes de feuillage, troncs et grandes branches, montants, pierres, murets et sols. La sélection colorimétrique est limitée aux couronnes autorisées. La protection manuelle verrouille les structures et ménage une marge supérieure à l’amplitude du vent. À l’intérieur des zones fixes, les pixels originaux sont restaurés avant l’encodage ; la modulation autour est progressive. Les petites branches et extrémités des végétaux restent mobiles, avec une amplitude de vent ajustée à 5,8 px + 0,8 px de réponse fine dans la vidéo 1280 × 720. Les gros troncs et les grandes fourches restent fixes.

## Recette temporelle et mesurée
Les huit pièces ont été observées sur environ trois secondes, sur deux captures espacées, avec les vidéos v4 chargées et jouant. L’entrée a reçu un ajustement final puis une nouvelle observation de trois secondes. Un seul paysage joue à la fois ; les autres restent en pause selon le fonctionnement existant. Les meubles et cadres conservent les masques de premier plan existants. Cinema n’a pas de baie dans sa vue intérieure ; Pool correspond à l’extérieur conservé.
Le contrôle automatique reprend les zones de troncs, rochers et montants de l’audit 2.3.38. Huit instants de chaque boucle sont suivis. Les zones de feuillage de l’entrée et de la chambre amis ont été déplacées sur de vraies couronnes libres : les zones initiales étaient en partie occupées par des branches désormais volontairement immobilisées. Coordonnées dans rois.json. Les mesures sont des suivis optiques, pas une mesure physique du vent ; elles peuvent inclure du bruit de compression ou des voisins dans le patch de suivi. Elles ne garantissent pas chaque pixel de chaque baie.

| Pièce | Tronc P90 | Rocher P90 | Feuillage P90 |
|---|---:|---:|---:|
| Salon | 0,009 | 0,016 | 9,111 |
| Salle à manger | 0,010 | 0,016 | 9,404 |
| Cuisine | 0,010 | 0,013 | 5,151 |
| Bureau | 0,007 | pas de zone choisie | 5,666 |
| Fitness | 0,011 | 0,011 | 9,515 |
| Entrée | 0,012 | 0,016 | 9,085 |
| Suite parentale | 0,011 | 0,017 | 7,778 |
| Chambre amis | 0,010 | 0,006 | 4,580 |

Unité : pixel sur la vidéo 1280 × 720. Les montants mesurables restent sous 0,5 px ; le montant uniforme du salon ne fournit pas de points de suivi, contrôle visuel conservé. Seuils de régression : structures P90 <= 0,75 px, feuillage P90 >= 1,5 px. Tous passent. Les retours utilisateur restent utiles pour juger la perception du vent selon le cadrage et la taille d’écran.

## Livraison
Build et lint réussis (avertissements préexistants), vérification syntaxique et diff. Pas de modification des commandes, dimensions ou thèmes du GUI. Le journal TV et la correction des spots de la version précédente sont conservés. Vérification du déploiement exact et contrôle des huit médias en production après publication.
