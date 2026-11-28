# Vue extérieure — structures fixes et végétation mobile

## Changement
La photo originale est la base de la vidéo. Les troncs et grandes branches, rochers, murets, margelles, toiture, marches et paliers ont des masques manuels dans scripts/stark-exterior-masks.py. Une marge de sécurité et une atténuation progressive séparent ces zones du vent. Leurs pixels sont restitués depuis la photo avant encodage. Les fougères conservent un pied fixe et une flexion croissante vers les extrémités ; les différentes couronnes reçoivent des rafales décalées. Les mouvements de ciel, brume et eau précédents sont conservés dans leurs seules zones.

## Vérification
Huit instants de la boucle sont suivis dans des zones de troncs, rochers, marches et toiture, ainsi que dans cinq groupes végétaux. Coordonnées et résultats dans check-motion.py et motion-v4.json. Les valeurs sont des déplacements de points optiques dans la vidéo 1280 × 720 ; elles peuvent inclure du bruit de compression et des voisins dans les fenêtres de suivi. Ce contrôle échantillonné complète l’observation visuelle ; il ne constitue pas une garantie de chaque pixel du paysage ni une simulation botanique 3D.
La zone des feuilles de l’arbre gauche est choisie dans la couronne haute : la première zone de contrôle croisait une grande branche qu’il faut maintenant immobiliser. Les petits arbres lointains reçoivent une atténuation moins large autour de leur tronc pour conserver un mouvement visible, sans relâcher le verrouillage des pixels du tronc.

## Périmètre
La vidéo extérieure devient landscape-exterior-loop-v4.mp4. Les huit vidéos intérieures v4, les commandes, les spots, le journal TV et les formats de GUI sont conservés. Aucun nouveau lancement de génération payante. Version de livraison prévue : 2.3.43.

## Résultats finaux (P90, pixels sur la vidéo 1280 × 720)

| Zone | Déplacement |
|---|---:|
| Tronc gauche / droit | 0,009 / 0,010 |
| Rochers : central / droit / gauche | 0,013 / 0,009 / 0,013 |
| Marches basses / hautes | 0,021 / 0,022 |
| Toiture | 0,061 |
| Fougère gauche / droite | 3,251 / 4,540 |
| Grand feuillage gauche | 5,743 |
| Graminées | 10,157 |
| Petits feuillages lointains au-dessus du toit | 1,071 |

Seuils : éléments fixes <= 0,5 px ; végétaux proches >= 1,5 px ; petits arbres lointains >= 1 px, pour respecter leur échelle. Le premier seuil uniforme de 1,5 px était excessif pour ces petits feuillages : il a été remplacé par ce seuil adapté à leur taille, après observation visuelle, sans relâcher celui des structures fixes. Tous les contrôles passent. Les écarts résiduels très faibles des structures sont compatibles avec le suivi et la compression.
Observation navigateur : vidéo prête, muette, jouant ; trois captures à environ 12,3 s, 15,6 s et 2,8 s confirment la lecture et le retour de boucle. Aucun message d’erreur pendant cette observation. Build, lint et contrôle de syntaxe réussis (avertissements lint préexistants). Les captures statiques complètent le suivi temporel sans prétendre représenter à elles seules le caractère naturel du vent.
