# Plan 3D du showcase — 16 septembre 2026

## 17/09/2026 — rooms-1, GUI 1.0.180 : décors, wellness et voisinage

Lot demandé par Donatien : local technique au sous-sol (17 pièces vitrine), vue villa rapprochée de 10 %, décoration et enceintes différenciées, cinq TV escamotables au pied des lits, écran cinéma agrandi et haut-parleurs dégagés. Ondes audio fines proportionnelles au volume ; mute, OFF et pause les arrêtent. Quatre programmes réellement 3D dans les TV via un rendu partagé 640 × 360 à 10–15 images/s, sans téléchargement vidéo ni son.

Sous-sol entièrement sans fenêtres. Wellness : deux cabines cloisonnées sauna/hammam, carrelage, douche, vasque ; coupe architecturale des plafonds pour voir l’intérieur, vapeur seulement lorsque le hammam fonctionne. Garage atelier avec deux silhouettes sportives distinctes, carrosseries courbes, roues et détails. Route devant le portail, ponts, sentiers, champs, deux ruisseaux, allées d’arbres, voisins et chalets éloignés des clôtures. Décor fixe regroupé par matériau, aucun nouveau modèle distant. Rendu enrichi mais stylisé, pas photographique.

GUI commune : onglets HVAC/Sauna/Hammam, ON/OFF indépendants, cibles sauna 60–100 °C et humidité hammam 90–100 %, plages dans le JSON ; HVAC normal 16–28 °C. Pas de ventilation sauna/hammam ni de température hammam. Joins d620–627, a/s62–65, C# WellnessState, entrées/sorties EISC nommées dans le générateur SIMPL. Détails et recette Debugger : `projects/villa-crans/ch5/docs/WELLNESS-2026-09-17.md`. Le correctif parallèle de routage inter-écrans dans ControlSystem est préservé et ses 22 scénarios simulés revérifiés ; les autres changements d’industrialisation restent hors publication de ce lot.

Vérifications locales : 36 combinaisons HVAC (555 assertions), 36 combinaisons wellness et retours natifs sans simulateur (632 assertions), 53 tests C#/JSON/SMW wellness et 76 HVAC, 40 contrôles pièces/TV, 27 navigation, 23 fondu, 24 villa, cinq nouveaux contrôles 3D wellness/garage. Matrice 3D supports/thèmes/modes réussie ; audit page/modales/états à 4:1 réussi. Cycle jour/nuit 30/10/30/10 s revérifié. Environ 52–54 images/s mesurées localement à 1280×800, DPR 1,5, rendu GPU. Les performances dépendent de l’appareil et de la connexion.

CH5Z assemblé et CPZ compilé (assembly 1.0.180.0), copie SMW préparée ; **LPZ non compilé, aucun matériel déployé ou vérifié**. Mesures wellness physiques inconnues tant qu’aucun driver ne les fournit. Le dossier `Claude outputs/room-revision/livraison` et les planches avant/après consignent le résultat ; ne pas assimiler la version du site à celle installée sur CP4/TSW.



## 16/09/2026 — estate-2, GUI 1.0.179 : villa, animations et HVAC

Demande groupée de Donatien : sous-sol avec cinéma, sauna/hammam, garage et simulateur de golf (16 pièces showcase), grand salon/cuisine/salle à manger au RDC, rampe d'accès garage dégagée, fenêtres vers l'extérieur avec cours anglaises au sous-sol, bannes de chaque pièce RDC. Cinq circuits lumineux indépendants ; fondu linéaire 3 s conservé. Rideaux : flèches horizontales dans les GUI sources.

Audio : ondes sur sources vidéo et musique, diamètres selon le volume A/V ou le volume média distinct, arrêt sur mute/OFF ; cinéma 11 canaux dont arrière/surround/plafond. TV : programmes Canvas animés cinéma, football, tennis, course automobile, 15 images/s sans téléchargement de vidéos ni son. Jardin : luminaires, projections douces, clôtures/terrasse/piscine et lumière sous l'eau ; portiques caméra quatre coins, façades et portail. Cycle 20 s (deux demi-cycles de 10 s, transitions de 2 s). Eau déformée par shader et brise discrète sur une partie du feuillage, haies fixes ; réduction avec le niveau de qualité. Démo automatique : Smartphone 60 s, autres supports 10 s.

**Extension matérielle explicitement demandée** : ON/OFF + Auto/1/2/3 sur toutes les pages HVAC. Contrat JSON canonique, six joins digitaux 610–615, analogique 61, état par pièce C#, miroir EISC, signaux nommés du générateur SIMPL. Voir `projects/villa-crans/ch5/docs/HVAC-2026-09-16.md`. Les noms/activations réels de la configuration physique restent conservés ; la nouvelle architecture 3D appartient à la démonstration.

Tests locaux : 24 contrôles villa, 28 navigation, 23 fondu, 40 matrice 3D, 36 combinaisons GUI HVAC et 15 contrôles réception native sans simulateur ; 76 contrôles C#/JSON/SMW. Contraste pages/fenêtres/états dans les trois thèmes : aucun texte sous 4:1. Test dédié des délais 60/10 s, volume musique, pause vidéo et shader de l'eau. Mesure locale GPU 1280×800 DPR 1,5 : environ 55–60 images/s (pièce, villa fermée et ouverte). Limite : rendu stylisé enrichi, pas promesse de photoréalisme.

Preuves dans `Claude outputs/codex-plan3d-villa2/` ; dossier `livraison-hvac` : JSON, CH5Z assemblé, SMW préparé. Le projet SIMPL original et ses modifications locales sont préservés : copie = 715 ajouts, aucune suppression. **LPZ non compilé ; aucun déploiement matériel.** C# compilé, mais Windows bloque l'empaquetage final du CPZ (`MSB3441 / 0x800711C7`, contrôle d'applications). Premier CPZ d'essai écarté de la livraison. La mise en service nécessite les bons CPZ/LPZ et la recette Debugger.

Ce moteur concerne uniquement le fond de page du site, pas la GUI embarquée ni ses joins. Point de départ de la reprise : `571f7c76`. Le lot `estate-1` est accompagné d'une correction GUI distincte, explicitement demandée : retours du contrôle global, version source 1.0.178.

## Commandes et cadrage

- Smartphone : à gauche en Mode normal et en Mode Scène, bouton d'angle conservé près du châssis.
- La villa entière est cadrée dans le rectangle libre entre le boîtier complet et la colonne de droite. Le cadrage rapproché privilégie désormais le volume habité, avec une distance réduite de 15 % après ajustement : une bordure de dalle peut sortir du cadre pour mieux lire les détails.
- Molette vers le bas sur le décor : vue globale. Vers le haut : dernière pièce sélectionnée. Les gestes dans le téléphone, les commandes, la colonne latérale et Ctrl/Cmd + molette sont préservés.
- La sélection de pièce et la vue de caméra sont indépendantes : les commandes continuent de cibler la pièce choisie lorsque la villa entière est affichée.
- En vue globale fermée, une villa alpine contemporaine assemblée remplace les boîtes séparées : pierre, bois, grandes baies, terrasses en retrait et toitures, balcons vitrés, bannes, pergola et jardin paysagé. Les étages sont espacés de 3,6 m.
- Depuis cette vue, l'enveloppe/toiture s'efface en 0,48 s, puis les étages se séparent en 0,95 s (espacement 7,2 m), puis la caméra rejoint la pièce en 1,35 s. Premier clic sur le décor : ouverture et séparation seules ; clic sur une pièce : zoom et sélection dans le Smartphone. Au dézoom, trajet de 1,4 s, réassemblage, retour de l'enveloppe. Une nouvelle sélection reprend la pose courante ; entre deux pièces déjà zoomées, trajet direct sans réassemblage.
- `PLAN3D_RULES` conserve la règle existante Smartphone. Aucun nouveau support ni seuil supposé pour un écran « 14 pouces » n'a été ajouté.
- Éclairages : niveaux visibles interpolés linéairement sur **3 secondes**, indépendamment des valeurs de feedback et de la sélection instantanée des boutons. Une interruption repart du niveau actuellement affiché ; une cible identique ne relance pas le délai. Lampes, halos et rebond intérieur suivent le même niveau, y compris OFF et les commandes globales. Chaque pièce conserve sa variation pendant une visite d'une autre pièce.

## Assets et rendu

- `public/plan3d/plan3d.js` : scènes, caméra, animation, feedbacks et cycle de vie.
- `interiors.js` : matériaux partagés, mobilier et accessoires selon le type de pièce, rideaux plissés, regroupement des surfaces statiques par matériau.
- `landscape.js` : terrain continu, neige colorée sur la même surface que la roche, jardin, cheminement, arbres instanciés. Feuillage à trois plans avec anticrénelage MSAA ; aucune neige superposée ni bruit animé.
- `estate.js` : architecture assemblée, balcons/toitures, jardin, bassin sculptural, ruisseau et passerelle, clôture et caméras. Surfaces regroupées par matériau ; vues d'ensemble des intérieurs regroupées en cinq finitions tout en conservant leur mobilier. `envelope.js` reste une ancienne référence inutilisée.
- `textures/` : trois WebP de chêne (111 392 octets) et trois de grès (37 668 octets), Poly Haven CC0 ; licences dans `textures/LICENSE.md`. Les autres textures et reflets sont produits localement sur canvas. Aucun modèle lourd ni appel à un fournisseur d'assets au chargement.
- Matériaux rugueux et normaux de parquet, assises adoucies, textiles, plinthes, corniches, tableaux, plantes, tables dressées, cuisine équipée, fauteuils, livres et literie. Claviers muraux à touches gravées inspirés de la disposition des claviers résidentiels, sans marque affichée. Thermostat live à texture 512².
- Haut-parleurs : colonnes, barre de son, enceintes encastrées et enceintes surround dans le cinéma. Éclairages : suspensions, spots sur rail, lampes de chevet/table, rubans indirects et appliques.
- La caméra reste immobile au repos. Seules les transitions et les équipements actifs s'animent.
- Une seule ombre directionnelle de 1024², recalculée au changement de pièce et pendant le mouvement des occultations. Instanciation du paysage, regroupement des surfaces statiques, résolution plafonnée à 1,5× et réduite progressivement à 1× si les images prennent trop longtemps. Pause lorsque l'onglet est masqué.
- Les groupes des autres pièces sont masqués en vue rapprochée. La vue globale conserve les niveaux éclatés du projet d'origine.
- OFF coupe les lampes et leur halo, même si un preset local OFF contient un niveau mémorisé non nul. Les niveaux bruts sont conservés ; une action sur un circuit ou une autre scène les rétablit normalement. La copie de la GUI et ses réglages enregistrés ne sont pas modifiés. À chaque changement de pièce, le plan relit le snapshot du feedback local : les valeurs analogiques identiques ne sont pas toujours réémises.
- Occultations fermées : lumière du jour nulle, aucun plancher lumineux résiduel. Une TV allumée conserve son écran et une faible lumière bleutée locale ; elle ne remplace plus l'éclairage de la pièce. L'indication de souffle de la climatisation suit la lumière disponible.
- Home cinéma : mur nord plein réservé à l'écran, fenêtre et trois motorisations sur le mur ouest. Thermostat, clavier, acoustique et enceintes latérales dégagés de la fenêtre. Éclairage périphérique, sans rail suspendu traversant visuellement l'écran dans la vue en coupe.

## Chargement et maintenance

Le moteur est importé uniquement lorsque la règle 3D s'applique. Les imports portent la version `2026-09-16-estate-1` ; la modifier dans le chargeur React et les imports des modules lors d'une évolution. Vercel revalide les ressources `/plan3d/`, sans réécrire une ressource manquante vers du HTML. En cas d'échec WebGL/import, retour à la vidéo.

Les abonnements aux feedbacks, les fonctions enveloppées, les écouteurs, les temporisateurs et les ressources graphiques sont libérés à la sortie. Un rechargement du document de l'iframe déclenche une reconnexion.

L'enregistrement de `/sw.js`, absent du site, a été supprimé pour éliminer la requête invalide à chaque chargement. Aucun fonctionnement hors ligne n'a été ajouté.

## Vérifications reproductibles

Depuis `apps/showcase` : `npm run build`, `npm run lint`, puis un serveur Vite preview local et `node scripts/test-plan3d.cjs`, suivi de `node scripts/test-plan3d-navigation.cjs`, `node scripts/test-plan3d-lighting.cjs` et `node scripts/test-global-controls.cjs`. Playwright doit être accessible à Node (installation de développement ou `NODE_PATH`). Variables facultatives : `BASE_URL`, `BROWSER_EXE`, `TEST_OUTPUT`, `GPU=1` (ANGLE Direct3D11 sous Windows). Garder le build servi inchangé pendant les essais.

Le test pilote la sélection réelle du GUI, contrôle les deux sens de molette et les exclusions, les trois familles de moteurs et l'arrêt, l'obscurité, Apple TV, le thermostat, les quatorze pièces configurées, les trois thèmes, les Modes normal et Scène, plusieurs dimensions d'écran, le retour vidéo sur dalle/tablette et la reconnexion après remontage. Les contrôles directs du moteur servent à isoler les états visuels ; ils ne remplacent pas les contrôles du contrat CH5 sur du matériel Crestron.

Les erreurs de lint issues des deux bibliothèques tierces minifiées (Three.js et composants CH5) sont exclues de l'analyse ; le code applicatif, y compris les nouveaux modules 3D et les tests, reste analysé.

Captures et résultats locaux : `C:/dev/crestron/repo/Claude outputs/codex-plan3d/`. Les captures de la GUI ne constituent pas une nouvelle validation matérielle CH5/CP4/TSW.

Validation du 16/09 : 32 contrôles passent, 24 captures, aucune erreur JavaScript non interceptée, build et lint terminés avec code 0 (avertissements existants conservés). Vue Scène vérifiée en 1280×609, 1440×900 et 1920×1080. Mesure séparée sur AMD Radeon 890M / ANGLE Direct3D11 : 54,7 images/s sur six secondes, DPR 1,5, 68 appels de dessin et 72 412 triangles dans le salon. Le navigateur de test sans accélération utilisait SwiftShader et donnait des valeurs beaucoup plus faibles ; ces mesures logicielles ne sont pas une mesure du navigateur Chrome habituel de Donatien. Cette observation ne garantit pas 55 images/s sur tous les appareils ou toutes les vues.

Dans le premier lot, les scènes OFF et TOTAL avaient été isolées directement par l'API. Le second lot les teste avec les vrais boutons du GUI, y compris preset mémorisé, action manuelle et changement de pièce à niveaux identiques. Le test de navigation contrôle les phases de façade, le clic vers une pièce différente et le retour de sélection dans le GUI, les sélections rapides et le dégagement rideaux/TV du cinéma. Les thèmes et supports non concernés ne reçoivent aucun changement graphique interne ; leurs captures sont des contrôles de non-régression du cadre. Ce lot ne constitue pas un audit exhaustif de contraste de toutes les anciennes modales du GUI.

## Limites visuelles

Recette `estate-1`, 16/09 : 38 contrôles de matrice et 28 de navigation réussis. Séquence enveloppe/étages/zoom, interruption pendant l'éclatement, clic vers le Smartphone, moteurs globaux, maintien de OFF et dégagement de l'écran cinéma vérifiés. Mesures locales accélérées, 1280×800, DPR 1,5 : salon 53,4 images/s (77 appels, 125 520 triangles), villa fermée 53,0 (85 appels, 138 396 triangles), plan ouvert 53,9 (140 appels, 255 922 triangles). Une seule carte d'ombre active au repos, calculée à la demande ; résolution adaptée en cas de ralentissement. Rapports et captures : `Claude outputs/codex-plan3d-estate/`. Les mesures dépendent du matériel et de l'accélération graphique.

Recette `atlas-2`, 16/09 : build et lint réussis, 38 contrôles de matrice + 22 contrôles de navigation/feedback réussis sur le build servi par Vite preview ; aucune erreur JavaScript non interceptée. Le test historique utilisait `frost`, alors que le GUI attend `glass` : corrigé, avec contrôle du sélecteur et attente de 900 ms avant capture dans les deux modes. Mesure locale accélérée ANGLE Direct3D11 en 1280×800, DPR 1,5 : 53,3 images/s sur quatre secondes dans le salon, 68 appels de dessin, 72 412 triangles. Ce relevé est ponctuel, pas une garantie tous appareils. Captures et rapports : `Claude outputs/codex-plan3d-navigation/`, planche `planche-navigation.png`. Les façades n'ajoutent aucune texture téléchargée.

Cette livraison enrichit une visualisation architecturale temps réel. Elle n'est pas présentée comme un rendu photographique ni comme une maquette fidèle au bâtiment réel. Le mobilier reste procédural, les reflets et la lumière indirecte sont approximés ; il n'y a pas de ray tracing ni de calcul de lumière globale coûteux. Le nombre d'images par seconde dépend aussi du navigateur, de l'accélération graphique et du GPU.


## 16/09/2026 — estate-3 : cycle jour/nuit de 70 secondes

À la demande de Donatien : jour stable 30 s, transition progressive vers la nuit 5 s, nuit stable 30 s, transition vers le jour 5 s, en boucle. Le ciel, la lumière naturelle et les luminaires extérieurs suivent la même progression douce. Changement limité au rythme du fond 3D ; GUI 1.0.179 et programmes Crestron inchangés.

Validation ciblée : un cycle complet observé au navigateur, neuf contrôles réussis (plateaux, transitions, reprise et éclairage piscine), aucune erreur JavaScript/shader. Build et lint réussis. Matrice GUI inchangée : ce lot ne modifie ni ses écrans, ni ses thèmes, ni ses interactions. Rapport local : Claude outputs/day-night-verification.json.


## 16/09/2026 — estate-4 : transitions jour/nuit de 10 secondes

Nouvel ajustement demandé : 30 s de jour, transition de 10 s vers la nuit, 30 s de nuit, transition de 10 s vers le jour. Cycle total 80 s, même variation douce et synchronisation des éclairages extérieurs.

Validation : cycle complet de 80 s observé, neuf contrôles réussis (dont les transitions et l'éclairage piscine), aucune erreur JavaScript/shader ; build et lint réussis. Rapport local : Claude outputs/day-night-80-verification.json. Aucun changement de GUI ou de programmes Crestron.

## 17/09/2026 — stadiums-1 : programmes sportifs

`tv-stage.js` construit les terrains et acteurs ; `tv-venues.js` ajoute les enceintes spécifiques tennis, football et circuit. Le public est fixe : les acteurs seuls sont animés. Décor regroupé en deux `InstancedMesh` et un tableau Canvas par enceinte, créé à la première sélection du programme. Aucun nouvel asset distant. Le rendu TV unique reste limité à 640 × 360 et 10–15 mises à jour/s ; MSAA 2 pour les lignes du terrain, sans ombre dynamique supplémentaire.

Le chargeur et l'API moteur portent `2026-09-17-stadiums-1`, et les imports TV sont versionnés. `metrics().tv3D` expose le programme, la taille, les enceintes instanciées et leur coût. `dispose()` libère aussi les géométries, textures Canvas et buffers d'instances des enceintes.

Recette ciblée : `node scripts/test-tv-stadiums.cjs` avec `BASE_URL`, `BROWSER_EXE`, `NODE_PATH` et éventuellement `TEST_OUTPUT`. 31 contrôles locaux réussis, trois thèmes/deux modes, commandes de télécommande et OFF, vidéo dalle/tablette. 52,0–53,5 images/s sur le laptop de référence en 1280×800 DPR 1,5, pas de promesse universelle. Banc isolé : 3 appels de dessin supplémentaires pour l'enceinte, 40 850 / 71 710 / 45 756 triangles totaux selon le programme (tennis/football/course), ressources GPU à zéro après destruction. Captures et mesures : `Claude outputs/sports-stadiums/`. La GUI et le contrat matériel ne changent pas.

## 17/09/2026 — valley-1 : paysage et hydrologie

`valley.js` partage les bassins et le profil descendant des deux ruisseaux entre terrain, eau et exclusions de végétation. Recherche spatiale des échantillons ; le terrain est creusé avant sa coloration. L'eau se poursuit jusqu'à z=150, au-delà de la limite visible ; des ponts franchissent les ruisseaux. Les chemins utilisent la hauteur triangulée réellement affichée, avec leurs échantillons mis en cache pour éviter de recalculer les courbes à chaque placement d'arbre.

Onze parcelles colorées dans le même maillage, herbe Canvas générée localement, 620 arbres et 1 800 touffes instanciés. Champs exclus des fortes pentes et de l'eau, arbres exclus des accès et du premier plan des vues pièces. Rochers et détails regroupés par matériau. Environ 4 Ko gzip ajoutés, aucun nouveau modèle, image ou vidéo à charger. L'environnement suit toujours le jour/nuit 30/10/30/10 ; API `environment().landscape` pour la recette.

`scripts/test-plan3d-landscape.cjs` : trois thèmes × normal/Scène × jour/nuit, retour molette et sélection GUI, mesures de cadence et rayons sur la vraie géométrie pour détecter l'eau enterrée. 29 contrôles réussis, 31 contrôles TV également ; build/lint réussis. Preuves : `Claude outputs/alpine-landscape/qa-publish` et planche avant/après. La GUI et les programmes matériels ne sont pas modifiés.


## 17/09/2026 — audio-1 : ondes agrandies et Suite invités

Diamètre des ondes multiplié par deux, proportionnel au volume de la source audible : audio/vidéo (a52) ou lecteur musique (a254), conformément aux deux volumes indépendants existants. Mute, OFF, pause vidéo et volume nul arrêtent l'animation. Transparence légère conservée ; anneaux légèrement dégagés des façades des enceintes, sans désactiver leur occlusion par les objets.

Cause reproduite dans la Suite invités, la terrasse et la piscine : le préréglage historique source=5 ne déclenchait pas le booléen musique. L'initialisation du feedback local traduit désormais ce préréglage en musique active et source vidéo éteinte. L'enceinte gauche des deux suites est dégagée du mobilier et de la TV escamotable. Enceintes animées ajoutées dans le vestibule Wellness, le garage et le simulateur de golf. Total : 32 enceintes dans 15 pièces ; cuisine sans enceintes selon la demande précédente, local technique sans équipement AV.

Recette dédiée scripts/test-plan3d-audio.cjs : 263 contrôles locaux réussis (17 pièces, quatre sources vidéo, deux volumes, mute/OFF/pause, retour de pièce, visibilité réelle par rayons, trois thèmes, normal/Scène, feedback dalle/tablette). Les deux suites présentent chacune deux anneaux dégagés. Aucun défaut JavaScript/shader téléphone ; messages WebXPanel/SVG préexistants dalle/tablette consignés séparément. Deux assertions supplémentaires verrouillent les erreurs des modes normal et des autres supports. Build/lint réussis ; 56,0 images/s mesurées localement sur 4 secondes, 1280×800 DPR 1,5. Aucun média distant ajouté. Preuves : Claude outputs/audio-waves/qa-final, baseline et planche-avant-apres.png.

Périmètre : fond 3D et feedback local showcase uniquement. Source GUI, JSON de déploiement, C# et SIMPL inchangés ; aucune compilation ou installation matérielle par ce lot. Chargeur et API 2026-09-17-audio-1 ; imports paysage valley-1 et TV stadiums-1 conservés.
