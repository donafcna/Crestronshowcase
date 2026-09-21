# Yacht — première image visible, 21 septembre 2026

## Retour de Donatien
Depuis le menu Yacht : chargement, yacht trop proche et masqué par le téléphone, puis recul jusqu'au cadrage souhaité, en moins de trois secondes. La capture 2 ne doit jamais être affichée.

## Cause constatée dans les sources
LuxuryBackground montrait l'iframe dès `model-ready`. Le modèle affichait déjà sa caméra calculée pour la fenêtre entière ; `viewport` ne changeait que `desiredRadius`, laissant la boucle d'animation interpoler `radius`. Le simple retrait du texte de chargement ne suffisait pas.

## Correction
Uniquement l'arrivée du yacht dans le showcase ; aucune modification CH5/C#/SIMPL, ni nouvelle géométrie ou palette nocturne.
- Iframe yacht opaque à 0 depuis son premier rendu React, y compris lors d'un changement de projet. Dimensions de l'iframe maintenues pour préparer le vrai rendu.
- Un seul indicateur de chargement, celui de l'hôte. Le loader interne ne traverse plus l'affichage.
- Attente du bootstrap GUI, des polices et de dimensions stables pendant 120 ms. Ce court contrôle de stabilité est répété tant que la disposition change ; pas de délai artificiel de plusieurs secondes.
- Protocole `present` avec numéro de requête. Le modèle applique viewport, rayon, cible, orientation et projection avant la première image visible.
- Accusé `presentation-ready` seulement depuis `scene.onAfterRender`, pas à la fin du simple chargement des scripts. L'hôte vérifie à nouveau ses dimensions et refuse une réponse obsolète.
- Après révélation, le comportement habituel est conservé : zoom molette progressif, sélection des espaces et recadrage lors d'un redimensionnement.
- Après 30 s sans résultat, message explicite et bouton Réessayer plutôt qu'un chargement indéfini. Boutique non soumise à ce nouveau protocole.

## Vérification
Tests unitaires `scripts/test-yacht-entry.mjs`. Recette Chromium `scripts/test-yacht-entry-browser.mjs` : clic réel menu à froid et à chaud, téléchargement d'extension retardé, dimensions modifiées pendant l'arrivée, Mode Scène et molette. Traces image par image de la visibilité et des rayons, captures du rendu final. Workflow `Yacht first visible frame` ; consulter son résultat avant d'annoncer une réussite.

Les tests gardent les animations de caméra actives. Seule la densité de pixels est réduite sur le runner CPU. Les captures finales mettent brièvement en pause la scène après la mesure d'arrivée ; ce ne sont ni des images générées ni une mesure de performance du laptop cible.

Les demandes distinctes concernant la nuit de référence, les faisceaux vers le ciel et la sensation de surélévation restent ouvertes. Version de revue dans la PR 2, pas de fusion automatique dans main.
