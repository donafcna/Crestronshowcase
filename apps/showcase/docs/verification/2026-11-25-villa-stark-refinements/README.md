# Villa Stark 2.3.22 — cohérence du GUI et simulation

## Petit écran

Flèche Mode Scène bornée dans la largeur visible du stage, avec 4 px de marge. Piste de défilement du workspace masquée sans retirer son défilement. Avant : une partie du bouton sortait de la zone rognée ; une barre de 8 px apparaissait avec une hauteur insuffisante. Voir ../2026-11-25-villa-stark-small-screen/layout-checks.json : seize mesures à 1024×640, 1280×600, 1366×650 et 1920×1080, bouton entier et centre cliquable, largeur de piste nulle. Entrée/sortie Mode Scène vérifiée sur dalle et Xpanel.

## Plans et stores

Dix icônes SVG sémantiques partagées par les plans Éclairage et Climat. Rectangles et noms conservés ; anciens schémas de mobilier retirés du SVG de fond. Températures conservées dans Climat, aucun état persistant ajouté aux sélecteurs Éclairage.

Stores : grille de cartes occupant la hauteur disponible, trois boutons de même taille par pièce, icônes SVG dans une colonne fixe et textes alignés ; illustration centrée dans la seconde colonne. Smartphone : commandes de même taille en rangée, icônes et libellés sur deux lignes. Neuf cartes restent sans défilement.

## Télévision

Source Swisscom/Apple routée vers la pièce active équipée d'un écran ; sélection = alimentation et image, arrêt = écran noir. Réutilisation directe de /plan3d/tv-stage.js et de ses programmes 3D de Villa FTV : football, circuit automobile détaillé, tennis et film alpin. Un renderer WebGL créé à la demande, 640×360 à 15 images/s, uniquement pour l'écran intérieur visible. Fallback 2D existant si WebGL indisponible. Aucun audio ni lecteur tiers.

Image recalée avec les mêmes règles cover que la photo ; contour du cinéma ajusté au cadre de projection. Aucun rectangle « CH xx » ni pastille flamme sur la vue extérieure. Les scènes Tout éteindre, Départ et Nuit coupent les TV.

## Piscine

RGBW/DMX réservé à Pool dans les commandes et dans le moteur des circuits. Les autres pièces conservent leurs blancs et gradations. Teinte RGB globale supprimée ; dix spots dans la vue piscine (quatre immergés, six de plage), avec corps de luminaire, cœur coloré et halos locaux. Sept points visibles sur la vue extérieure. Couleur et intensité communes au circuit DMX de piscine, extinction des halos lorsque la couverture est fermée.

## Recette ciblée

- Build et lint sans erreur (avertissements historiques du dépôt).
- Dix icônes sur les deux plans, neuf cartes stores sans débordement : 18 contrôles smartphone/dalle × trois thèmes × trois pages. Voir visual-checks.json. Lancement précédent plus large interrompu par le navigateur : aucun résultat incomplet présenté comme validé.
- Sur Xpanel, neuf cartes avec trois boutons égaux, alignement des icônes et commandes contenues dans leur carte.
- TV : renderer villa-ftv-3d et programme football, puis chaîne 8 = race ; extinction = zéro canvas, fond noir. Capture du circuit 3D. Apple et changement de source vérifiés. Aucun son.
- RGBW piscine : rouge puis bleu, dix spots, opacité du calque RGB global = 0 ; Bureau : zéro bouton Rouge et calque global à 0. Vue extérieure : zéro badge TV/flamme visible.
- Aucune erreur console capturée dans le parcours.

La recette ne constitue pas un audit exhaustif des contrastes ou de toutes les autres pages/modales. Aucun programme Crestron matériel modifié.
