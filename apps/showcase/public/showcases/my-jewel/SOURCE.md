# M/Y Jewel — provenance et périmètre

Version initiale : 2.3.39. Révision Riviera : 2.3.40, 28 novembre 2026.

- Concept fictif créé pour Frequence TV, dans le secteur Yacht2.
- GUI et moteur de simulation dérivés du GUI Villa Stark, base Git 14ae7ca3. Les fichiers de Villa Stark ne sont pas modifiés par ce projet.
- Visuels originaux générés avec l’outil intégré imagegen : `hero.png` pour la vue extérieure, et dix photographies individuelles `assets/room-<id>-hd.png` pour Living, Dining, Kitchen, Office, Cinema, Fitness, Entry, Master, Bedroom et Pool. Les anciennes planches `interiors.png` et `decks.png` sont conservées dans l’historique Git (`bbb69d11`), retirées des ressources publiques.
- Chaque vue individuelle mesure 1672 × 941 pixels. Les huit intérieurs remplacent des cellules d’environ 557 × 314 pixels : environ neuf fois plus de pixels par pièce. Les deux vues de pont sont désormais au bon format plein cadre, sans étirement vertical d’une demi-planche. Matières Riviera conservées : teck, ivoire, chêne clair et bronze, mer turquoise, côte méditerranéenne basse.
- Prompts, références historiques et fichiers générés : `docs/verification/2026-11-28-my-jewel-riviera-hd/prompts.json`.
- Aucun visuel de yacht réel ni de chantier naval n’est revendiqué. Le nom M/Y Jewel désigne ici un concept de démonstration.
- La mer est animée par un shader WebGL continu en deux dimensions : plusieurs directions et rythmes de houle, petits reflets lumineux, déplacement atténué à l’approche de l’horizon. Le masque propre à chaque image protège côtes, cadres et objets au premier plan. Un repli Canvas plus simple est prévu si WebGL n’est pas disponible. Le mode de réduction des animations fige l’eau. Seule la photo active est chargée pour son fond ; une image quittée ne peut pas réapparaître par-dessus la pièce suivante pendant le chargement.
- Le cinéma possède maintenant une baie marine ; les dix espaces disposent d’une zone de mer animée. `scene-manifest.js` rassemble les photos, horizons, polygones et emplacements des stores et TV.
- Éclairage : simulation d’ambiance par calque coloré ; les luminaires présents dans la photo ne sont pas tous détourés individuellement. Stores, rideaux et écrans sont recalés approximativement sur les nouvelles images. Cette première version ne constitue pas une étude photométrique.
- Éclairage, stores, climat, médias, sécurité et interphone sont simulés. Aucun matériel ni équipement de navigation n’est commandé.

## Direction retenue et historique

1. Riviera (confirmée par Donatien) : teck, ivoire, bronze, mer turquoise.
2. Grand Bleu : noyer, bleu nuit, mouillage en pleine mer.
3. Épure : chêne clair, verre, criques minérales.

## Architecture

Canal BroadcastChannel `my-jewel:<session>` distinct du canal Villa Stark. `app.js` porte le GUI et l’état ; `scene-manifest.js` définit les dix vues ; `marine-scene.js` anime les pixels de mer ; `jewel.css` définit les adaptations marines et les dispositions téléphone. Les composants hôtes reçoivent explicitement l’identifiant du projet.
