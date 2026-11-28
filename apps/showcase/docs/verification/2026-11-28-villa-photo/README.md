# Villa FTV — décors photoréalistes, candidat local 2.3.22

18 vues : extérieur et 17 pièces. Aucun commit, push, publication Vercel ou déploiement Crestron.

## Architecture

Le moteur existant conserve les états et le bridge CH5, mais ne dessine plus les modèles 3D de Villa FTV lorsque `photoViews` est actif. Les autres projets ne sont pas concernés. La règle de présentation existante (fond interactif pour smartphone) est conservée.

`villa-photo.js` utilise le renderer existant : deux plans photographiques pendant les fondus, même texture TV, aucun second contexte WebGL. Cache LRU de quatre paires maximum ; chargements à la demande. Les 34 nouveaux JPEG totalisent environ 12 Mo sur disque, et ne sont pas tous chargés à l'ouverture. Le salon validé réutilise ses deux PNG.

Les 17 nouvelles images et variantes ont été produites avec l'outil imagegen intégré, puis encodées en JPEG qualité 92 sans recadrage ni réduction de dimensions. Prompts complets : `prototypes/villa-photo/PROMPTS-complete.json`. Origines : `assets-complete.json`. Actifs livrés : `public/plan3d/villa-photo/`.

## Interactions

- OFF/ON et niveaux : fondu d'ambiance globale par pièce, moyenne des cinq circuits, comme pour le salon approuvé. Les commandes individuelles restent fonctionnelles dans la GUI ; il ne s'agit pas de masques physiques indépendants pour chaque luminaire.
- Moteurs : positions du volet/store/rideau reçues du moteur existant, textile et lames animés sur les fenêtres visibles.
- TV et projection : même programme, sources et télécommande que le moteur précédent ; cadrage 16:9 conservé dans chaque écran. Écran raccordé également dans le Pool House, le garage et le golf.
- Piscine : légère réfraction animée dans un polygone limité à l'eau. Sauna/hammam : chaleur/vapeur liées aux états existants. HVAC et audio : animations discrètes liées à leur état, pas de feedback artificiel.
- Vue générale : photo plein cadre, cycle jour/nuit. Bouton « Vue générale » ; sélection des pièces par la GUI. Caméras fixes et fondus ; plus de rotation libre ni de vue éclatée. Cliquer le décor extérieur revient à la pièce sélectionnée.

## Vérification

`verify-villa-photos.html` exécute le vrai moteur dans une page locale de recette. Mesures séparées des transitions (1,8 s) et des variations d'éclairage avec TV (2,4 s), pour les 18 vues. Le préchargement du programme automobile avant révélation du fond évite le gel du premier démarrage TV observé dans `first-run.json`.

Résultats intermédiaires complets dans `warm-tv-run.json` : environ 60 i/s pour les variations et 58–60 i/s pour les transitions ; aucun échec de chargement, cache limité à quatre paires, aucune erreur JS. Quelques images longues au premier chargement d'une texture restent possibles. Ces mesures locales ne garantissent pas la même cadence sur tous les appareils.

Compilation de production et validation du catalogue réussies. Lint ciblé : aucune erreur, trois avertissements React Fast Refresh préexistants. Le problème historique MutationObserver n'a pas été reproduit ici ; aucune prétention de correction.

### Résultat final et recette GUI

`final-engine-run.json` : 18/18 vues, aucun échec ni erreur, quatre paires maximum. Variations d'éclairage : 59,7–60,1 i/s ; transitions : 56,8–60,3 i/s (la première entrée dans le salon est la plus lente). Les mesures restent limitées à ce navigateur local.

`gui-checks.json` et `gui-performance.json` : pause TV du Pool House, rideaux fermés, volet, store et arrêt, activation du hammam et du sauna via les boutons de la vraie interface. Raccord ajouté aux familles de moteurs manquantes du Pool House, qui était auparavant modélisé comme une terrasse. Mesure GUI pendant éclairage/rideau : 60,19 i/s, p95 16,8 ms, maximum 17,1 ms. Console sans erreur.

Build final réussi après ce raccord. Présentation disponible sur http://127.0.0.1:4351/interfaces/residentiel/villa-gemini-frequencetv/phone — Mode Scène, sélection de pièce dans la GUI ; bouton Vue générale pour l'extérieur.
