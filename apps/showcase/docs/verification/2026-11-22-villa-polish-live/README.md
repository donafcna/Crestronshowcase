# Vérification en production — Villa FTV 2.3.16

Site testé : https://crestrongui.vercel.app/interfaces/residentiel/villa-gemini-frequencetv/phone
Date : 22 novembre 2026. Navigateur intégré, fenêtre 1280 × 720, interface Smartphone en Mode normal. Aucun code modifié ni publié pendant cette vérification.

## Présence des améliorations
- Pool House : feuilles et tiges distinctes, mobilier et coussins détaillés.
- Piscine : margelles détaillées, nuances de l’eau, mobilier extérieur ; eau animée.
- Sauna/hammam : bancs et dossiers en bois, parois vitrées, surfaces minérales.
- Garage : carrosseries, jantes et détails de l’atelier visibles.
- Golf : écran dégagé du projecteur et de la rampe, tapis de frappe distinct.
- Local technique : racks, câbles, armoire et sol minéral visibles. Sous TOTAL les murs restent clairs ; cela ne signifie pas que la correction des matériaux est absente.

## Transitions et éclairage
Parcours piscine → sauna → garage → golf → local technique → Pool House, avec extinction OFF puis allumage TOTAL dans chacune des six pièces. Captures successives pendant environ 1,8 seconde de transition et 3,3 secondes par fondu. Les commandes aboutissent, les vues évoluent et se stabilisent ; pas d’écran vide persistant ni de blocage observé. Le cycle jour/nuit de production est resté actif : ces captures ne constituent pas une comparaison photométrique avec les images locales à heure fixe.

Aucune erreur ni alerte console collectée pendant le parcours (console.json).

## Limites de la fluidité
Contrôle visuel échantillonné, pas un profilage GPU ni une mesure des images réellement rendues. Les temps dans sampling.json sont ceux des captures et ne doivent pas être convertis en FPS. Les micro-saccades peuvent échapper à cet échantillonnage. Le résultat local précédent autour de 60 i/s n’est pas présenté comme une nouvelle mesure en production. Pas de test matériel TSW/iPhone physique.

Les fichiers <id>-total.jpg et <id>-off.jpg conservent les états finaux ; les séries transition/off/on conservent la progression. IDs : 11 Pool House, 12 piscine, 13 sauna, 15 garage, 16 golf, 17 technique.
