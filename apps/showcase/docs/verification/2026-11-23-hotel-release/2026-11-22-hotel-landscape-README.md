# Hotel des Horlogers — arbres, terrain et toitures, 22 novembre 2026

## Arbres
Cent conifères, toujours en deux maillages instanciés : houppiers et troncs. Couronnes à rameaux dentelés et retombants, sommet distinct, variations de hauteur, largeur, teinte et orientation, distribution en petits groupes. Le corridor au premier plan reste dégagé pour l’hôtel. Les troncs deviennent continus sur la hauteur ; matériau d’écorce mat.

194 triangles par houppier, contre 308 auparavant : silhouette plus pleine avec moins de géométrie. Pied des arbres posé une seule fois par raycast sur le maillage réel du terrain, et non sur une approximation analytique. Ombres fixes reçues/projetées, toujours mises en cache. Aucun vent ni mouvement de végétation ajouté à la boucle d’animation.

## Terrain
Même grille de 64 × 56 cases / 3705 sommets ; relief à plusieurs échelles, clairière centrale dégagée, variations de teinte et ombrage de contact précalculé autour des arbres. Texture photographique Grass Ground de Charlotte Baglioni, Poly Haven, réduite en WebP 512² de 35792 octets ; servie localement, avec mipmaps et anisotropie plafonnée à 4. Aucune connexion externe à l’exécution.

Sources : [Grass Ground](https://polyhaven.com/a/grass_ground), [métadonnées primaires](https://api.polyhaven.com/info/grass_ground), [licence CC0](https://polyhaven.com/license). La source représente une herbe plutôt sèche avec terre et racines. Le sol et l’implantation végétale restent des interprétations de présentation, pas un relevé topographique ou botanique réel du site.

Atmosphère de jour extérieure plus claire, brume cohérente ; le fond sombre des vues intérieures reste la cible une fois la transition achevée. Le cycle jour/nuit demeure automatique. Le fondu de fond peut converger vers le bon contexte même si le cycle est mis en pause.

## Toitures végétalisées
Texture de base photographique teintée et rosettes de végétation basse, rives de gravier et faces latérales minérales. UV à échelle cohérente sur les bandes et promenades. 1521 petites touffes opaques en un seul lot instancié, sans cartes alpha ; elles ne projettent pas de nouvelles micro-ombres pour éviter le scintillement de détail sous-pixel. Les ombres générales des toitures et panneaux restent en cache.

Les vingt toits intérieurs ne sont plus affichés à travers l’enveloppe en vue générale ; seules les six toitures extérieures sont visibles. Les toits de pièce restent disponibles hors coupe. Panneaux photovoltaïques recalés au-dessus de la toiture inclinée : environ 12,2 cm de garde minimale calculée, implantation et nombre des 27 panneaux de présentation conservés. Aucun nouveau système de commande.

## Vérification de la fluidité
Mesure finale de référence : performance-overview-final.json, A/B/B/A, Chrome headless local, 1440 × 900 DPR 1,6 (plafond moteur), 120 images par passage. Les quatre passages restent à environ 59,9 images/s. P95 16,9–17,3 ms avant/après. Pas d’accélération universelle revendiquée.

Vue générale : 711 → 693 appels de dessin, 184420 → 181906 triangles. Le gain sur les couronnes et le masquage des toits internes compensent les touffes ajoutées. Ressources fixes : 30 → 33 textures, 141 → 150 géométries et 19 → 23 programmes. Les textures/UV supplémentaires coûtent de la mémoire même si le rendu géométrique est légèrement allégé.

animation-performance.json : quatre passages de 210 images, rotation et transitions hôtel → Bar → hôtel, DPR 1. Environ 59,9 images/s partout, aucune image au-delà de 33,4 ms avant ou après ; p95 16,8–17,4 ms. Les mesures sont locales et plafonnées par le rafraîchissement ; pas de test sur iPhone/Safari matériel ni garantie pour tous les GPU.

performance.json est le banc complémentaire en cours d’affinage (trois cadrages, avant les derniers réglages de contact au sol et d’échelle des bandes). Les gros plans gardent leurs 40 appels / 8130 triangles au Bar et 31 / 37370 au Restaurant : le paysage est masqué dans ces vues. performance-initial.json conserve l’essai intermédiaire rejeté visuellement, avec ramure trop clairsemée et texture procédurale du sol. Les captures de comparaison ont été remplacées par celles de l’état final.

## Vérification des contacts et de la géométrie
exterior.json : 100 arbres ; erreur de contact au sol inférieure à 0,1 mm dans les coordonnées du modèle ; 1521 touffes posées sur une des six toitures, aucune flottante ; 27 panneaux avec garde >10 cm ; positions et matrices finies. Il s’agit de contrôles numériques du modèle interprété, pas de précision de relevé réelle. Vue extérieure jour/nuit capturée, paysage et enveloppe correctement masqués au passage dans une pièce.

shadow-cache.json : aucune écriture d’ombre pendant la rotation ; trois activations de cible à la sélection, puis réutilisation du cache. La végétation et le relief ne rajoutent aucun calcul de bruit, de raycast ou de filtrage de texture par image.

## Vérification des commandes et des modes
matrix.json : trois thèmes × normal/Scène × avant/après ; sept espaces, extinction, déplacement/arrêt de rideaux, retour global et zoom. Caméras finies à 1280 × 800 et 1920 × 1080. Aucun débordement de page ni erreur JavaScript/shader console. night.json conserve la vérification des matériaux intérieurs, de la pénombre rideaux fermés et de la lumière naturelle nulle en OFF/fermé.

live.json : sur le serveur demandé 4319, Restaurant puis Bar, 23 programmes constants, seules les contributions lumineuses de la pièce active présentes ; aucune erreur JS ni HTTP. Capture de la vue générale réelle live-overview.png. Build/lint et syntaxe réussis avec avertissements hérités (build.log, lint.log).

GUI, textes, fiche et matériel inchangés. Dalle, tablette et XPanel non applicables à ce fond : vidéos inchangées. Aucun nouvel audit complet de contraste/tactile des GUI.

## Livraison locale et reproduction
Comparatif paysage-avant-apres.jpg, même cadrage, sans correction des images. Planches trois thèmes : planche-normal.jpg et planche-scene.jpg ; captures générales jour/nuit séparées. Build/recette isolés sur 4322, puis model.js/model.html et la nouvelle texture avec sa licence actualisés seuls dans le dist commun sur 4319. Paramètre de cache du composant source actualisé pour le prochain build commun. Aucun commit/push/publication Vercel ni matériel.

Depuis la racine du checkout : node apps/showcase/docs/verification/2026-11-22-hotel-landscape/overview.cjs ; animation.cjs ; exterior.cjs ; verify.cjs ; shadow-cache.cjs ; night.cjs (preview 4322), live.cjs (4319). Adapter le chemin local du module Playwright si nécessaire. model-before.js conserve le candidat précédent.
