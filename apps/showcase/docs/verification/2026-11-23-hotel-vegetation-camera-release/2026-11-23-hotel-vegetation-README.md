# Hotel des Horlogers — arbres et végétation, 23 novembre 2026

Cent arbres conservés : 53 sapins larges, 27 conifères plus élancés, 20 feuillus à trois volumes de couronne irréguliers. Branches des conifères plus larges et retombantes, hauteurs/largeurs/profondeurs et teintes variées, jeunes sujets plus bas. Troncs des feuillus raccourcis pour rester dans la couronne. Buissons : silhouettes plus rondes à 80 triangles contre 20, proportions et verts variés. Les emplacements restent dans les bosquets existants ; aucun arbre supplémentaire, aucun ajout d’animation de vent.

Trois lots de couronnes au lieu d’un, même lot de troncs. Couronnes 19400 → 18400 triangles ; buissons +1800 triangles, soit +800 triangles visibles au total et deux appels supplémentaires. Pas de nouvelle texture ou lumière, aucun shader de déformation à chaque image. Géométrie réelle partagée par le rendu et les ombres mises en cache ; aucune divergence de silhouette entre arbre et ombre. Reflet de paysage préparé une fois au chargement, incluant la nouvelle végétation.

## Vérification de la fluidité

animation-performance.json : A/B/B/A, rotations et transitions hôtel/Bar. Nouvelle version 59,89 images/s sur les deux passages, p95 ~16,9–17 ms, aucune image >33,4 ms. Référence 59,89 puis 55,14 images/s avec variations de charge : ces valeurs ne prouvent pas de gain de vitesse. night-performance.json fournit le contrôle nocturne séparé et les compteurs de rendu. Mesures locales, cadence non garantie sur tous les appareils.

## Contrôles géométriques et fonctionnels

exterior.json : 100 arbres répartis sur les trois couronnes, contact des racines par rayon sur le maillage réel (erreur maximale ~0,0000027 m), géométrie finie ; terrain de 3705 sommets, 1521 touffes sur les toitures, 27 panneaux et garde minimale 0,1224 m conservés. Paysage masqué dans les pièces. matrix.json couvre les trois thèmes × normal/Scène et sept lieux. details.json conserve clôtures, pierres, buissons et ruisseau descendant. Build/lint réussis avec avertissements hérités. vegetation-avant-apres.jpg compare la même caméra initiale, commandes masquées.

Local sur 4319 uniquement ; pas de nouvelle publication Vercel, aucun matériel ou programme CH5 modifié.

Banc nocturne final : 646 → 648 appels, 185376 → 186176 triangles (+800, ~0,43 %), 34 programmes, 42 lumières et une seule capture conservés. Charge variable : avant 52,81 puis 58,25 i/s, après 53,60 puis 57,94 i/s ; p95 et images longues détaillés dans night-performance.json. Écarts comparables à la référence sous cette charge ; aucune garantie de 60 i/s de nuit sur ce banc. Matrice 37 contrôles sans erreur, build/lint réussis ; source et copie servie identiques en SHA256.
