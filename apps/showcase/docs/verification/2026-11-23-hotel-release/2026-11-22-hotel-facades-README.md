# Hotel des Horlogers — façades et vitrages, 22 novembre 2026

Montants bois, appuis, tableaux sombres, joints et nez de dalle en relief ; grain du bois à une échelle plus fine et béton à microrelief discret. 120 vitrages extérieurs regroupés en un lot, plans simples ; une seule couche de verre visible selon la vue. Reflets du paysage capturés une fois en cube 128² puis préfiltrés, transparence variant selon l’angle et intensité atténuée la nuit. Aucune capture supplémentaire pendant les animations. Pas de transmission physique ou de post-traitement supplémentaire.

## Vérification de la fluidité

Banc A/B/B/A à 1440 × 900, DPR 1,6 : environ 59,9 images/s avant et après. Vue générale : 693 → 680 appels, 181906 → 182218 triangles ; Bar : 40 appels, 8130 → 8120 triangles ; Restaurant : 31 appels, 37370 → 37360 triangles. Rotation/transitions en DPR 1 : environ 59,9 images/s, aucune image au-delà de 33,4 ms sur les quatre passages. Résultats locaux, sans garantie sur tous les appareils. Deux textures et huit géométries supplémentaires, cinq programmes supplémentaires. La capture ajoute une préparation initiale mesurée à environ 1,36 s dans le diagnostic dédié ; ce coût ne se répète pas pendant les déplacements.

## Contrôles fonctionnels et visuels

Trois thèmes en normal/Scène, sept espaces, zoom, commandes, jour/nuit, cache des ombres et invariants du paysage validés. Aucun message console d’erreur ni erreur HTTP dans le contrôle final sur 4319. Build et lint réussis (avertissements hérités). Une capture de paysage au chargement ; zéro écriture hors ombres pendant rotation/sélection. Trois activations de cible d’ombre à la sélection puis cache stable. Détails dans performance.json, animation-performance.json, facade.json, matrix.json, exterior.json, shadow-cache.json, night.json et live.json. performance-initial.json conserve un brouillon antérieur et ne décrit pas le résultat livré.

facades-avant-apres.jpg compare un cadrage diagnostic rapproché identique avant/après ; ce cadrage ne constitue pas une nouvelle caméra de l’interface. planche-normal.jpg et planche-scene.jpg présentent les trois thèmes. Les dimensions extérieures restent une interprétation des plans AV, pas un relevé BIM. Livré uniquement dans la prévisualisation locale 4319 ; aucune publication Vercel, aucune modification matérielle.

Référence technique : Three.js r160, CubeCamera et opaque_fragment (dépôt officiel mrdoob/three.js).
