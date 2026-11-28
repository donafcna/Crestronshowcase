# Salon Villa FTV — essai photoréaliste, 28 novembre 2026

Prototype autonome, hors public/ et hors bundle Vercel. Aucun changement de la GUI, de la configuration ou du moteur de production. Aucun commit, push ou déploiement. Référence avant : moteur 3D local du candidat 2.3.20, pas une nouvelle capture de production.

## Ouvrir

Depuis apps/showcase : `python -m http.server 4350 --bind 127.0.0.1`

Puis http://127.0.0.1:4350/prototypes/salon-photo/ . Le serveur de cette séance écoute déjà sur ce port.

## Contenu

Décor original créé avec l'outil intégré imagegen, fichiers salon-off.png et salon-on.png copiés dans ce dossier. Réinterprétation architecturale du salon : mêmes fonctions et principaux éléments, mais cadrage intérieur et mobilier non identiques au modèle 3D. Ce ne sont pas des photographies d'une villa réelle. Deux images avec de légères différences de détail dues à la génération, fondus par opacité. Store CSS avec montée/descente de 3 secondes et arrêt intermédiaire. Atténuation de lumière naturelle lorsque le store descend. TV : même moteur createTVStage que la référence, rendu 640×360, actualisation plafonnée à 15 Hz, course/football/tennis, arrêt et pause, aucun son. Seule la TV nécessite encore WebGL dans le rendu après.

Les commandes sont locales à ce prototype : aucun lien avec les joins du GUI ou du CP4. La navigation entre pièces et l'intégration dans le fond de la vitrine restent à réaliser après validation esthétique.

## Vérifications de cette séance

- Console : aucune erreur ni avertissement (console.json).
- OFF/TOTAL, ouverture/fermeture/Stop (arrêt vérifié à 11 %), TV ON/OFF, pause/lecture et trois programmes essayés.
- Deux images chargées, aucun débordement horizontal à 1280×720 ; boutons >=44 px.
- node --check et oxlint du fichier app.js : succès. Aucun build du site requis pour cet essai autonome qui n'est pas inclus dans Vite.
- Mesures locales via requestAnimationFrame, quatre passages alternés de 6,5 secondes, après 3,5 secondes de stabilisation. Animations éclairage/store et TV actives. Avant et après tournent séparément pendant les mesures. Le compteur rAF mesure la cadence navigateur, pas une mesure GPU ni une promesse de performance matérielle.
- Premier comparatif : avant 60,16 / 60,10 i/s ; après 56,79 / 60,06 i/s. Sept intervalles >33,4 ms au premier passage après (maximum67,9ms), conservés dans performance-first.json, non ignorés.
- Après promotion des images en calques et ajout de l'atténuation ambiante, comparatif final : avant60,17 /53,78 ; après60,01 /60,14 i/s. Après : p95 17,2ms, maxima17,7/18,1ms, zéro intervalle >33,4ms. Dernier passage avant variable (20 intervalles >33,4ms). performance-final.json contient tous les résultats. Pas de garantie de 60fps sur iPhone/TSW ni au chargement à froid.

## Fichiers visuels

avant-apres.png : capture de la page de comparaison. stores-fermes-off.png : état OFF avec store fermé. Ce cadrage fixe améliore le réalisme au prix de la caméra libre. Images PNG non encore optimisées pour la diffusion réseau ; chargement Vercel non mesuré.
