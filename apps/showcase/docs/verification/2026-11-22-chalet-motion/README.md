# Chalet A10 et motorisations — 22 novembre 2026

## Façades, bois, balcons et toiture
Matériaux propres à la résidence : veinage, nœuds, patine et rugosité du bois, grain filtré selon la distance ; béton minéral et soubassement en pierre. Lames de bardage séparées autour des ouvertures, chants chanfreinés, platelage à joints, séparations de balcons en lames, garde-corps divisés en panneaux, pinces et visseries. Environ 1 990 lames et 258 panneaux de garde-corps.
Menuiseries avec joints, montants, poignées et appuis ; reflets du paysage et suggestion de profondeur derrière le vitrage. Couverture visible en lauzes au débord, chevrons, gouttières ouvertes, descentes avec coudes et attaches, plaques et boulons, arrêts de neige. Encombrement général, niveaux, cadrages et lisibilité des TV en coupe conservés. Les détails sont une représentation, sans prétention de relevé d’exécution. Le verre suggère un intérieur et utilise une réflexion d’environnement préfiltrée, sans simulation de réfraction complète.

## Scintillement des vitrages au zoom
Cause identifiée : dans les fenêtres des étages, la plaque bronze occupait n=.17 avec une profondeur .08 (face extérieure .21) ; le volume de vitrage occupait n=.20 avec une profondeur .02 (face extérieure .21). Les deux surfaces étaient coplanaires. Les fenêtres de bardage avaient également une plaque pleine en avant du vitrage.
Correction physique : cadres ajourés, joints en retrait et vitrages à une seule surface orientée vers l’extérieur. Douze rayons de contrôle traversent la fenêtre avant d’atteindre un fond distant de plus de cinq centimètres. Les garde-corps utilisent eux aussi des surfaces uniques, évitant le mélange de faces avant/arrière d’une boîte transparente. La passe de transparence du vitrage supérieur reste constante pendant le fondu ; les matériaux des étages bas ne suivent plus l’opacité de l’enveloppe supérieure.
Comparaison de seize angles de caméra devant une même fenêtre : la variation de luminance moyenne du petit échantillon passe d’environ 45,9 à 0,56 niveaux sur 255 ; son bruit spatial moyen passe de 11,5 à 0,40. Mesures indicatives du cadrage de diagnostic, influencées aussi par les nouveaux matériaux ; elles ne remplacent pas une mesure perceptuelle sur tous les appareils. La planche montre la trame de conflit de profondeur avant correction, absente ensuite.
Zoom complet aller/retour vérifié de jour et de nuit, sans changement de passe ni erreur de shader.

## Motorisations linéaires
Le moteur de démonstration incrémentait les positions de 5 points par appel d’une seconde, et la 3D appliquait directement chaque palier. Le modèle utilise maintenant le temps réellement écoulé, une direction et un horodatage commun. La 3D calcule la pose à chaque image, sans accélération ni rattrapage exponentiel : course complète en vingt secondes, arrêt et inversion conservant la position exacte. Un événement de retour d’état est regroupé à la prochaine image ; le contrôle périodique reste en secours.
Le GUI recréait aussi ses visuels de rideau à chaque rendu des retours. Le nœud animé est conservé pendant la course, et l’arrêt ne relance plus un fondu de 250 ms. La position interne garde sa précision, mais le libellé de pourcentage reste arrondi.
Les transformations sont reproduites par sync-a10-demos.py ; aucun fichier des programmes matériels n’est modifié.

## Vérification
- Build/lint réussis, avertissements préexistants ; génération Python compilable.
- test-a10-motion.cjs : positions à la demi-seconde, arrêt partiel, inversion, course entière, groupes directionnels.
- test-chalet.cjs : douze ouvertures sans conflit de profondeur, deux zooms complets, passe de vitrage stable, plus de cent poses différentes sur 2,4 s ; pas maximal autour de 0,1 point de pourcentage, arrêt stable et position GUI/3D concordante. Le visuel GUI reste le même nœud et ne saute pas pendant les retours.
- test-a10-plan-sync.cjs : 100 circuits, 100 luminaires, 34 moteurs, fermeture complète, arrêt et trois thèmes réussis.
- test-alpine-detail.cjs : eau animée, jour/nuit, paysage de Villa Crans non hivernal préservé.
- Matrice : trois thèmes × normal/Scène × jour/nuit, avant/après (24 captures). Les autres supports n’affichent pas le fond 3D selon les règles actuelles ; plein écran smartphone non applicable.
- Mesure indicative du navigateur à 1908 × 1014 : médiane autour de 23–24 ms, p95 autour de 32 ms, 158 appels de dessin et environ 1,09 million de triangles. Matériaux et éléments fixes regroupés ; aucun ajout de texture distante.

Vidéo d’accueil : audit réalisé séparément, sans modification du film ni du lecteur dans ce lot.
