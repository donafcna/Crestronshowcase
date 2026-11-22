# Yacht — mobilier adouci, 22 novembre 2026

## Modification

Géométries arrondies mutualisées pour canapés, fauteuils, tables et lits. Assises/dossiers séparés réunis dans une géométrie par rangée ; coussins bombés et légèrement inclinés ; tête de lit capitonnée en trois panneaux, matelas arrondi et couette à plis discrets. Déformation et normales calculées une seule fois. Aucun shader, texture, lumière ou objet supplémentaire ; 6131 maillages avant/après, dont 588 utilisent les formes adoucies. 82 géométries mises en cache.

## Contrôles fonctionnels

37 sélections de pièce et géométries finies : réussies, aucune erreur de compilation shader. Build et lint réussis. Dix tests du noyau extérieur réussis. Tests d'entrée : quatre réussis ; le cinquième est un test ancien de zoom continu, incompatible avec le contrat actuel à deux vues (fixture sans api.select), indépendant du mobilier. Aucun changement du zoom dans ce lot.

## Comparaison visuelle

before.html archive le modèle de production précédent. Captures avant/après à la même caméra, nuit figée à 45 s, même éclairage. comparaison.jpg montre cabine capitaine et Grand salon. La tête de lit masque une partie des oreillers depuis cet angle, comme le mobilier précédent.

## Mesures de fluidité

Banc verify-yacht-soft-furniture.html, viewport 1280 × 800, zone libre 420 × 600. Géométries arrondies activées/désactivées dans le même contexte WebGL : séquence A/B/B/A par sujet, chauffe 1,8 s puis mesure 4,2 s. Eau figée pour comparaison stable ; animations caméra et boucle de rendu actives. Le témoin substitue les formes par des boîtes en conservant dimensions, matériaux et transformations du candidat. Il isole le coût des géométries ; ce n'est pas une reproduction complète de l'ancien programme. Les appels visibles peuvent varier légèrement par culling.

Premier passage conservé sans modification : fluctuations de 46,8 à 59,9 i/s, salon moyen -3,83 %, au-delà du seuil fixé de -3 %. Deuxième passage nécessaire pour contrôler cette dispersion. Les résultats sont locaux à cette machine et ne garantissent pas toutes les configurations.

Deuxième passage :

| Vue | Avant i/s | Après i/s | Écart |
|---|---:|---:|---:|
| captain | 59.75 | 59.38 | -0.61 % |
| salon | 59.84 | 59.96 | +0.19 % |
| exterior | 59.90 | 59.93 | +0.05 % |

Résultat : réussi. Correction du banc : réinitialiser les tableaux entre clics et diviser la moyenne par le nombre réel de mesures. Le rapport final conserve exclusivement les 12 mesures du second passage (4 par vue) ; le premier rapport reste archivé. Appels extérieurs identiques (1738), textures identiques (8), triangles 307054 → 322766 (+5,1 %). Build/lint relancés après intégration du dernier main, réussis.
