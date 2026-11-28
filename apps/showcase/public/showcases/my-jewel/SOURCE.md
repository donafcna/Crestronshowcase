# M/Y Jewel — provenance et périmètre

Version initiale : 2.3.39, 28 novembre 2026.

- Concept fictif créé pour Frequence TV, dans le secteur Yacht2.
- GUI et moteur de simulation dérivés du GUI Villa Stark, base Git 14ae7ca3. Les fichiers de Villa Stark ne sont pas modifiés par ce projet.
- Visuels originaux générés avec imagegen dans cette session : hero.png (vue extérieure), interiors.png (atlas 3 × 3, huit intérieurs utilisés), decks.png (pont arrière et beach club). Palette Riviera : teck, ivoire, chêne clair et bronze, eau turquoise, côtes méditerranéennes.
- Aucun visuel de yacht réel ni de chantier naval n’est revendiqué. Le nom M/Y Jewel désigne ici un concept de démonstration.
- La mer est animée par un canvas qui reprend les pixels des photographies, avec déplacement de fines bandes dans des polygones délimités. Coque, mobilier, montants et horizon restent stables. Mouvement réduit si le navigateur demande une réduction des animations.
- Éclairage : simulation d’ambiance par calque coloré ; les luminaires présents dans la photo ne sont pas tous détourés individuellement. Stores, rideaux et écrans sont recalés approximativement sur les nouvelles images. Cette première version ne constitue pas une étude photométrique.
- Les photographies intérieures proviennent d’un atlas : leur niveau de détail est inférieur à celui de la vue extérieure. Un remplacement ultérieur par des images individuelles reste possible sans changer le GUI.
- Éclairage, stores, climat, médias, sécurité et interphone sont simulés. Aucun matériel ni équipement de navigation n’est commandé.

## Directions proposées

1. Riviera (retenue par défaut) : teck, ivoire, bronze, mer turquoise.
2. Grand Bleu : noyer, bleu nuit, mouillage en pleine mer.
3. Épure : chêne clair, verre, criques minérales.

## Architecture

Canal BroadcastChannel `my-jewel:<session>` distinct du canal Villa Stark. `app.js` porte le GUI et l’état ; `marine-scene.js` anime les pixels de mer ; `jewel.css` définit les adaptations marines et les dispositions téléphone. Les composants hôtes reçoivent explicitement l’identifiant du projet.
