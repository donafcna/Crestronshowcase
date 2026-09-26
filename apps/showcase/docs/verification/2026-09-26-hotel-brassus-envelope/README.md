# Recette Hotel Brassus — enveloppe et caméra 2.1.3

- Enveloppe vérifiée en vue générale : dalles, murs arrière et latéraux, façades vitrées, montants et lamelles de bois, terrasses/toits végétalisés, liaisons inclinées et panneaux photovoltaïques.
- Sept sélections GUI testées : Bar, Lobby, Restaurant, Petit salon, Salle privée, Wellness et Séminaires. Chacune termine sur sa cible avec `zoomProgress=1`.
- Une impulsion de molette vers le bas termine en vue générale et conserve la dernière zone.
- Quatre impulsions inverses donnent des paliers strictement croissants `0.15 / 0.30 / 0.45 / 0.60` vers cette dernière zone.
- 83 contrôles de non-régression Hotel Brassus réussis : trois thèmes, sept zones, rubriques et commandes, absence de défilement, cibles tactiles, vidéo sur Dalle/PC/Tablette.
- Modes normal, Scène Taille réelle et Scène Responsive réussis. Build et lint réussis ; avertissements historiques seulement.
- Validation Edge headless. Aucune mesure architecturale ou recette sur matériel Crestron/iPhone physique n'est revendiquée.

`overview.png` montre l'enveloppe complète ; `wellness.png` montre la coupe de l'espace sélectionné ; `navigation.json` contient les états observés.
