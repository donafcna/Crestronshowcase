# Hotel Brassus — 26 septembre 2026

Ajout indépendant dans Hôtellerie : `/interfaces/hotellerie/hotel-brassus/wallpanel`.
Hotel Geneva est conservé. Site 2.1.0 ; GUI original HDH 2.12.16.

## Sources et séparation des environnements

Source fournie : dossier `20260918 HDH CH5`, distribution compilée `dist/prod/Shell`.
Les sources sur le Bureau ne sont pas modifiées. Empreintes de tous les fichiers importés et des 15 PDF : `hotel-brassus-source-manifest.json`.
`scripts/sync-hotel-brassus.py` importe la distribution et applique uniquement deux adaptations : configuration sans WebXPanel/adresse automate et chargement des adaptateurs de vitrine.
La copie ne contient pas les scripts de déploiement ni leurs paramètres d’accès.
Les licences du paquet original sont conservées.

`demo-feedback.js` utilise le pont de retours natif CrComLib, dans le navigateur uniquement.
Les composants, images, mises en page, attributs et joins du GUI compilé sont conservés.
Sept profils de démonstration : Bar, Entrée, Restaurant, Petit salon, Salle privée, Wellness, Séminaires.
Les noms des profils viennent de `hdh-profile.js` ; scènes, niveaux et températures sont des valeurs de démonstration, pas un relevé de la programmation SIMPL de l’hôtel.
Pas de transport matériel, aucune installation CH5Z/CPZ/LPZ, aucun son.
La CSP de la copie bloque les connexions distantes et les médias.

Décisions : supports d'origine paysage (dalle, iPad, XPanel), pas de faux GUI iPhone.
Les trois thèmes de cette réalisation sont Original, Clair et Sombre ; le thème Verre du catalogue n'est pas ajouté au GUI client.
Le bouton Maquette 3D de la colonne du site ouvre une vue agrandie hors du châssis, accessible sur les trois supports. Les sélecteurs Espace/Thème restent aussi hors du GUI.
Elle ne modifie pas les règles de fond 3D des autres projets.
`demo.css` corrige uniquement la lisibilité du menu en vitrine (l'original réduit l'opacité des entrées inactives à 0,35).
Les pourcentages AV et valeurs des circuits sont aussi corrigés en thème Sombre (texte clair sur fond clair dans la source).
Le panneau des circuits, masqué sans ouverture fonctionnelle dans le source fourni, est activé par l'adaptateur de démonstration.

## Portée de la maquette

Reconstruction de présentation issue des plans AV ; ce n'est ni un BIM, ni un relevé d'exécution.
Les plans fournis sont des extraits de niveaux. Aucune élévation complète ne permet de garantir le volume extérieur intégral de l'hôtel.
L'ensemble est donc présenté en niveaux décalés avec implantation globale interprétée ; chaque niveau peut être isolé.
Les hauteurs libres (environ 2,9 m), matériaux, meubles simplifiés, terrain et arbres sont estimés.
Les portions de suites ne sont pas présentées comme une reproduction de toutes les chambres.
Les PDF sources restent locaux : aucun plan technique brut n'est publié.

| Niveau | Plan examiné | Éléments repris |
|---|---|---|
| 250 | Niveau_250_Audio… V2.0 | Ordre vestiaires, accueil/hammam, sauna, repos, fitness ; couloir en façade |
| 350 | Niveau-350-Audio… V1.0 | Restaurant à gauche, petit salon et salle privée à droite, mobilier de restauration |
| 450 | FTV_450_3618-450P100-050-P (1) | Office et escalier côté gauche, foyer, salles séminaires 1 et 2 côté droit |
| 550 | Niveau_550_Audio… V2.0 | Bar à gauche, bureaux/escalier au centre, lobby à droite, mentions double hauteur |
| 300B | Niveau_300B_Audio… V2.0 | Extrait chambres 333/335 et suite oblique 334, lit, séjour et bain |
| 400 | Niveau_400_Audio… V2.0 | Extrait suite perpendiculaire 431, séjour, chambre et bain |

Le niveau 300 (sanitaires et vestiaires) et les schémas de câblage ont été examinés mais ne sont pas des étages complets supplémentaires.
Les coordonnées horizontales du modèle sont estimées à partir des proportions des extraits ; les cotes altimétriques visibles (-7,8, -3,92, -4,10, -0,84) guident les niveaux correspondants.
Ne pas interpréter les espacements de la vue éclatée comme une mesure du bâtiment.

Vue en coupe/toitures, jour/nuit, rotation, glisser, zoom et recentrage.
Les scènes GUI modulent les luminaires représentés du niveau correspondant ; pas de calcul photométrique.
Mobilier répété instancié par niveau, ratio de pixels plafonné à 1,6 ; rendu suspendu en onglet caché et rotation automatique désactivée en mouvement réduit.

## Recette

Voir `docs/verification/2026-09-26-hotel-brassus/` pour résultats et captures.
Tests matériel Crestron, Safari/iPad réel et étalonnage dimensionnel du bâtiment non réalisés.

Le parcours automatique du catalogue est désactivé uniquement pour cette interface imbriquée (`autoDemo: false`) afin de ne pas interrompre les commandes.

## 26/09/2026 — Enveloppe architecturale et caméra, vitrine 2.1.3

La vue générale reçoit une enveloppe complète de présentation : murs arrière et latéraux, façades vitrées toute hauteur, trame de montants et lamelles de bois, dalles en béton, terrasses et toiture végétalisées, liaisons inclinées et panneaux photovoltaïques. Les références visuelles sont la page Architecture de l'Hôtel des Horlogers, le projet BIG et les photographies publiées par CCHE/Swiss Arc. Les 126 panneaux réels documentés sont représentés par un échantillon lisible, pas reproduits un à un. Les cotes extérieures restent interprétées en raison de l'absence d'élévations complètes dans les plans AV fournis.

La caméra utilise deux cadrages : sélection d'un espace ou molette vers le haut = trajet fluide de 1,35 s vers la pièce centrée ; molette vers le bas = retour complet au bâtiment. Le dernier espace est conservé après le retour général. Bar, Lobby, Restaurant, Petit salon, Salle privée, Wellness et Séminaires ont des cibles distinctes. Les toitures et l'enveloppe sont affichées dans la vue complète puis masquées dans la coupe de l'espace.

Références consultées : `https://www.hoteldeshorlogers.com/fr/architecture`, `https://big.dk/projects/audemars-piguet-hotel-5067`, `https://cche.com/fr/projets/hotel-des-horlogers/`, `https://www.swiss-arc.ch/fr/projet/hotel-des-horlogers/13189739`.


## 26/09/2026 — Hotel Brassus iPhone, vitrine 2.1.1

Demande explicite : adaptation portrait et ouverture Hôtellerie sur Hotel Brassus / Smartphone avec maquette 3D. Dalle TSW, PC/XPanel et Tablette : GUI CH5 original et vidéo de fond. Adaptation dédiée `phone.html/css/js`, commandes locales sans transport matériel, sept espaces, trois thèmes Original/Clair/Sombre conservés, scènes/circuits, volume/sources/mute, stores avec arrêt et consigne. États conservés entre espaces durant la session. Cette adaptation web ne constitue pas un CH5Z livré au matériel. Source CH5 de l'hôtel et copie native inchangées.

La maquette ouvre en vue globale, puis suit le niveau d'un espace sélectionné ou d'une commande d'éclairage. Éclairages synchronisés, molette de zoom, cadrage entre le téléphone et la colonne en modes normal/Scène. Les limites architecturales de la maquette restent celles documentées au lot 2.1.0. Aucun modèle 3D chargé en fond sur les trois grands supports.

## 26/09/2026 — Éclairages, rideaux et cycle extérieur, vitrine 2.1.5

Chaque pièce documentée reçoit des corniches, spots de plafond, appliques, balises basses, suspensions ou chandeliers et un éclairage volumétrique. Les quatre scènes du Smartphone changent la luminosité de la pièce sélectionnée de 0 à 100 %. Le modèle comporte 783 éléments lumineux, 20 sources volumétriques et 75 familles de matériaux lumineux dans 15 zones.

Le décor alterne automatiquement dix secondes de jour et dix secondes de nuit. Le bouton de la maquette permet de mettre ce cycle en pause. La molette ne produit plus de cadrage intermédiaire : bas affiche tout l'hôtel, haut centre et agrandit la dernière pièce. Dans Bar, Restaurant et Séminaires, les commandes Stores animent deux panneaux de rideaux visibles sur les vitrages ; Ouvrir, Stop et Fermer conservent leur progression simulée.
