# Villa Stark 2.3.32 — corrections visuelles

## Feu
- Séquence réelle sans intervention humaine, 30 secondes ; vitesse réduite à 56 % de l’original.
- Fondu de 2 secondes entre deux passages en mouvement, raccord encodé dans la vidéo. Aucun arrêt sur la première image.
- video-check.json : 720 images, 24 i/s ; différence moyenne au raccord 5,74 contre médiane 5,58 entre images voisines, inférieure au 95e percentile normal (8,72). C’est un contrôle de continuité numérique, pas une promesse de boucle impossible à reconnaître.
- Planche de toute la séquence fournie. Faible hauteur et intensité du feu conservées. Source/crédits à côté du MP4.

## Spots et curseurs
- Le contour du raccord photographique est transparent, y compris aux niveaux intermédiaires (test à 64 %).
- spot-alpha-check.json : alpha nul sur tout le périmètre du raccord testé. Le même algorithme sert les 50 spots.
- Poignées entièrement dans leur rectangle : marge 7 px, diamètre 30 px, ombre adaptée. Contrôle visuel aux valeurs 0 et 100 sur smartphone, styles contrôlés sur les quatre châssis.

## LED salon
La photo retouchée ne sert que de référence d’extinction des étagères et de la corniche. La scène conserve les objets et les textures d’origine et leur applique le champ d’éclairement de la référence. Le fader LED étagères et corniche contrôle cet état indépendamment des spots. Visuels à 0 et 100 %.

## Sources TV et cadre
Swisscom : journal Runway, Apple TV : accueil tvOS simulé avec grille d’applications, flèches/OK/MENU. Choix de source unique, pause de la présentatrice lorsque Apple TV est choisie. Images projetées à l’intérieur du cadre photographique avec une marge de 1,2 % ; contrôle des bords gauche et inférieur.

Build et lint passent avec les avertissements préexistants. Vérifications ciblées des changements, pas une recette exhaustive de toutes les pages du catalogue.
