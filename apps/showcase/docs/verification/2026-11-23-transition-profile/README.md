# Diagnostic approfondi — 23 novembre 2026

## Cause confirmée des premières pointes
Le profil des appels renderer.render et WebGL montre des pointes dans le rendu intérieur corrélées à la création de nouveaux shaders. Deux pièces se chevauchent pendant la navigation : chacune porte un PointLight TV, même si l'ancienne lumière a une intensité nulle. Le nombre de lumières ponctuelles passe de 3 à 4, puis revient à 3. Les cacheKey des nouveaux programmes confirment ce changement (profile-programs.json).

Les appels WebGL natifs et les calculs de boundingSphere n'expliquent pas seuls les pointes. Précompiler génériquement les shaders ne résout pas les variantes liées au nombre variable de lumières : essai rejeté, environ 233 ms supplémentaires de préparation et toujours des pointes. Aucun préchargement supplémentaire ajouté au produit.

## Correctif local 2.3.20
pooledTvLight activé uniquement dans villa-crans.json du fond 3D. Une seule lumière TV reste dans sceneR ; les TV conservent des ancres de position, et la lumière reçoit chaque image la position exacte de l'ancre active après animation de la TV escamotable. Même couleur 0x9db8ff, intensité, portée 2,2 m et décroissance. Matrice actualisée avant rendu, extinction à zéro lorsque la source est arrêtée. Trois lumières ponctuelles constantes, y compris pendant le chevauchement des pièces. Géométrie, matériaux, ombres et résolution inchangés ; aucune modification des GUI CH5 ni du matériel.

## Mesures
Navigateur intégré, viewport 809×613, DPR 1,5. Profils appariés : Home Cinéma vers Suite parentale, Chambre 1, retour Suite parentale. Moteur initialement stabilisé, programme course actif. Les mesures instrumentent le même renderer ; il s'agit de temps CPU/soumission de rendu, pas de chronométrage GPU complet.
- Ancien comportement répété : 43 programmes graphiques, première transition 59,27 i/s, plus grand intervalle échantillonné 43,4 ms, plus long rendu intérieur 41,2 ms ; trois rendus >15 ms.
- Lumière mutualisée répétée : 31 programmes, première transition 59,82 i/s, plus grand intervalle 32,6 ms, plus long rendu intérieur 22,4 ms ; un rendu >15 ms.
- Les passages suivants restent proches de 60 i/s. Le premier affichage conserve quelques compilations de matériaux : ne pas promettre zéro à-coup ou 60 i/s constants sur tous les appareils.
- Le profil initial à 147 ms était une valeur extrême et n'est pas utilisé pour chiffrer le gain.

## Non-régression visuelle
Contrôle pendant 100 images par pièce : Suite parentale, Chambre 1, Home Cinéma, Suite invités. Toujours 3 PointLights ; distance entre ancre de TV et matrice mondiale de la lumière partagée : zéro. Images fixes avant/après, même caméra, environnement et instant de programme : différence moyenne du secteur intérieur <0,04/255 par canal ; quelques pixels diffèrent avec animations résiduelles/anticrénelage. Pas de détail supprimé.

## MutationObserver : toujours non reproduit
Sonde avant les scripts du document, y compris iframe : appels valides/invalide, cible, readyState, stack et événements error. Pages témoins sans React/CH5/Three, corps immédiat puis retardé de 2 s : aucune erreur.
12 chargements/interruptions : aucune erreur ; seuls 2 ont confirmé un chargement suffisant pour reporter les 518 appels (ne pas présenter les 12 comme chargements complets).
4 chargements complets supplémentaires, événement load confirmé puis attente de 2,5 s : 518 appels observe chacun, soit 2072 appels, zéro exception. L'incident isolé initial reste sans URL/stack exploitable. Aucune attribution certaine au code projet, à CH5 ou au navigateur ; aucun faux correctif de masquage.

## Livraison
Build et lint passent, avertissements préexistants. Candidat local seulement : aucune publication ni push. Résultat concluant sur une cause et sa réduction de coût ; erreur MutationObserver non résolue. Conserver les sondes pour une éventuelle réapparition. Les scripts de diagnostic restent hors des fichiers servis en production.

Contrôle final après actualisation explicite de la matrice de la lumière : quatre pièces, trois PointLights constants, erreur de position nulle et intensité OFF égale à zéro. Profil final : première transition 59,37 i/s, intervalle maximal 32,2 ms ; plus long appel de rendu 16,3 ms. Ces derniers chiffres confirment la tendance mais ne remplacent pas la paire de référence 41,2/22,4 ms. Aucun push effectué.
