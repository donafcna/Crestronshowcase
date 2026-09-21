# Yacht / nightclub : zoom à la molette — 21 septembre 2026

Demande de Donatien : pouvoir zoomer et dézoomer avec la molette sur les deux vues 3D.

- Yacht : remplacer les commandes molette `overview` / `select` par une variation exponentielle de la distance orbitale ; conserver la pièce, le pont, la cible et les circuits. Réutiliser l'interpolation de caméra du moteur existant et ses bornes 4–320.
- Nightclub : normaliser les unités pixel/ligne/page et préserver les petits deltas de trackpad ; ne plus traiter chaque événement comme un cran entier. Conserver les bornes du moteur (0,75–1,30 fois le cadrage ajusté) et son choix de salle/étage. Ne plus recalculer le cadrage toutes les 500 ms si les dimensions n'ont pas changé.
- La souris doit se trouver dans le décor 3D. Ne pas intercepter les événements sur le téléphone, les panneaux de commande, listes, champs, modales ou le bandeau projets.
- Ctrl/Cmd + molette reste réservé au navigateur. Ignorer les gestes horizontaux et regrouper les commandes par frame ; aucun délai arbitraire entre deux crans.
- Aucun changement de navigation pour la boutique, la Villa Crans ou l'auditorium.

## Vérifications

`node --test scripts/test-wheel-navigation.mjs` : normalisation, petits deltas, contrôles ignorés, regroupement par frame et nettoyage au démontage.

`node scripts/test-wheel-browser.mjs` avec Vite preview et Playwright : molette réelle dans le site hôte, transmission iframe, directions du zoom, maintien après actualisation du layout, modes normal/Scène, exclusion GUI et modificateurs, pièce yacht et trois salles du nightclub. La résolution du renderer est abaissée seulement dans le test sur CPU ; ce n'est pas un benchmark de fluidité du laptop.

Consulter l'exécution CI liée au commit avant d'annoncer les tests navigateur réussis. La PR reste séparée de `main` et des fichiers Windows non synchronisés.

## Périmètre

Ce lot traite la molette uniquement. La fidélité nocturne à l'image, la suppression des faisceaux ciel, le flash de cadrage d'entrée et l'impression de hauteur sur la mer font partie du retour précédent et ne sont pas présentés comme corrigés par ce lot.
