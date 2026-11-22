# Yacht — proximité et séparation des matières, 22 novembre 2026

Base de comparaison : production edea571. Deux demandes traitées ensemble : rapprocher davantage le yacht entier ; distinguer murs, matelas et mobilier, notamment dans la cabine capitaine.

## Matières et lumière

Murs grège neutre #a8aaa2, matelas et oreillers ivoire #dedfd6, couvre-lit bleu pétrole #345b68, tête de lit brune #695349. Trois matériaux partagés réutilisent le shader tissu existant ; aucune nouvelle texture ou géométrie. Assises sable, coussins gris vert, tapis gris bleuté. Les palettes communes profitent aux différents espaces et la fonction bed s’applique à toutes les suites.

Remplissage lumineux réduit aux coefficients .045/.055/.025 au lieu de .13/.16/.07, pour éviter de blanchir les matières. Position verticale des quatre points de présentation corrigée selon le pont affiché (notamment les ponts inférieurs relevés en coupe). Valeurs des circuits et sources lumineuses commandées conservées ; seules la calibration visuelle et les matières changent.

Captures contrôlées de la cabine (id30), Grand salon (11), suite propriétaire (22) et Beach club (0), jour et nuit. Comparaison de la cabine à même caméra et même phase dans captain-comparison.jpg ; les étiquettes DOM figurent dans les captures natives captain-normal/scene. Navigation 37/37 pièces vérifiée. Aucun changement de géométrie.

## Extérieur

Les sommets structurels effectifs remplacent les coins des boîtes englobantes. Cache compact de 156212 sommets, Float32Array d’environ 1,87 Mo, construit une fois. Le parcours du modèle et le calcul d’ajustement ne tournent pas dans l’animation. Vue de trois quarts adaptée à l’aspect libre : un peu plus arrière sur format étroit, angle historique conservé sur format large ; inclinaison 0,19 rad. Le centre et la distance restent calculés en perspective pour garder coque et mât visibles. Aucun nouveau calcul de shader, éclairage, maillage ou changement de résolution.

Quatre formats vérifiés : 420×600, 700×620, 1100×680, 440×600. Distance de caméra réduite de 39,48 / 22,29 / 7,79 / 38,00 % respectivement ; il s’agit du rayon de caméra, pas d’un pourcentage de surface apparente. Tous les sommets projetés restent dans l’espace libre. La première variante était trop arrière pour les formats larges ; sa référence first-report.json est conservée, puis l’adaptation d’angle a été resserrée vers l’angle historique sur grand format.

## Fluidité et vérifications

Banc sur un même contexte, nuit et eau figées, alternance avant/après/après/avant, chauffe 2,5 s puis mesure 5 s par essai. Cabine : 59,86 → 59,67 images/s (-0,31 %), 603 appels, 138554 triangles, 7 textures. Extérieur : 48,89 → 48,86 images/s (-0,07 %), 1738 appels, 307054 triangles, 8 textures. Les essais individuels extérieurs varient de 43,7 à 59,1 images/s ; ne pas présenter ce test comme une garantie universelle. Budget de rendu identique et aucune erreur shader. report.json contient les valeurs brutes.

Build/lint et dix tests du noyau réussis. Vérification native trois thèmes, normal et Scène, cabine et extérieur. Pas de nouvelle recette exhaustive des modales GUI ou du matériel physique. Reproduction : après build, copier scripts/verify-yacht-close-contrast.html dans dist ; copier before.html dans dist/yacht-close-before.html en ajoutant une base /ftv-luxury/models/ dans head. Ouvrir le banc et lancer le bouton. Le banc commute les matériaux et la calibration dans un srcdoc de test ; aucun commutateur de benchmark ajouté au produit.
