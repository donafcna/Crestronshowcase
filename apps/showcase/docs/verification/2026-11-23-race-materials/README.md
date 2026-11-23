# Matériaux course 3D — 23 novembre 2026

Candidat local 2.3.18 comparé à 2.3.17, animation validée par Donatien. Aucune publication.

## Changements
Asphalte 512×256 (grain, variations, réparations fines), herbe 512×512 (taches périodiques sans raccord et tonte), atlas 512×512 du béton, des portes et des vitrages. Génération déterministe au chargement. Caméra, voitures, géométrie des bâtiments et cadence inchangées. Un plan d'herbe distinct remplace le sol fusionné : +1 appel, -10 triangles ; +2 textures.

## Recette de cette session
- Build Vite réussi ; lint sort avec code 0 et avertissements du dépôt. Syntaxe des deux nouveaux modules valide.
- Chromium intégré, 1280×720, DPR 1,5. TV 640×360. Comparaison A/B/B/A.
- Programme seul : 14,95–15,07 i/s ; soumission CPU médiane 0,6–0,7 ms dans les deux cas. 14→15 appels, 18734→18724 triangles au même cadrage, 3→5 textures avec cible comprise. Ce temps CPU ne mesure pas le GPU.
- Villa, transitions : avant 53,36 / 57,91 ; après 58,05 / 57,37 i/s. Variabilité de démarrage ; aucune accélération générale revendiquée.
- Fondus lumière : avant 60,14 / 59,87 ; après 60,13 / 60,13 i/s. Stabilisé : environ 59,9 dans les deux cas. Géométries finies et attributs complets, zéro erreur capturée.
- Trois thèmes (sombre, clair, verre), modes normal et Scène, smartphone : six captures d'intégration. Programme SKY Q affiché sur écran du Home Cinéma, pause fonctionnelle, écran dégagé. Aucune modification DOM GUI, contraste/cibles inchangés ; modales hors audio non retestées. Dalle/tablette et matériel non concernés par ce lot de fond smartphone.
- Dernière correction : continuité des taches d'herbe aux frontières de la texture, contrôlée en vue haute. Même géométrie, taille et nombre de textures ; pas de nouvelle campagne de performance après cette correction purement picturale.

## Preuves
comparison.html : deux cadrages à temps identique 6 s et 18 s. before = 2.3.17, after = 2.3.18. Captures GUI, console.json, stage-performance.json et room-performance.json. Les métriques statiques déclaratives du premier JSON indiquent encore 9 ; le compteur réel drawCalls mesure bien le passage 14→15. La métadonnée est corrigée à 10 pour les matériaux détaillés dans le code final.

Limites : essai local sur cette machine, aucune garantie chiffrée pour chaque GPU ou appareil. Aucun son ajouté. Le rendu reste une animation 3D stylisée à résolution TV modérée, et non une vidéo photoréaliste.
