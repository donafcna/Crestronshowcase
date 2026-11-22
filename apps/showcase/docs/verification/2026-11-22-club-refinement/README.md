# Nightclub — affinage du 22 novembre 2026

Périmètre : uniquement le moteur du fond 3D Club L’Étoile. Aucun changement GUI, matériel ou publication.

Faisceaux RGBW : ouverture constante à la visée, dégradé longitudinal par couleurs de sommets, mélange additif et une seule face rendue. Même résolution géométrique ; géométrie partagée entre les 72 lyres. Mosaïques : variations déterministes par couleur d’instance, sans maillage supplémentaire. Matériaux existants : béton plus mat, velours sans métal, comptoirs différenciés. Animations des étages masqués suspendues ; cadence du moteur conservée à 30 images/s.

Recette : build, lint et syntaxe réussis ; avertissements existants dans les bundles tiers. Mesures dans before.json et after.json : navigateur local, iframe 1280 × 720, fumée et lyres actives, quatre vues. Les timings CPU ne mesurent pas directement le temps GPU. Les captures représentent Sky Garden. Les autres tâches locales peuvent influer sur les timings.

verify-club.html est un banc autonome à copier dans dist après build. Pour la référence, copier venue-before.js dans dist/ftv-luxury/venues/before.js et index.html dans before.html en remplaçant la référence absolue /venues/venue.js par /venues/before.js. Ouvrir /verify-club.html?before puis ?after et attendre quatre résultats. Ne pas publier le banc ni la référence dans public.

## Mesures observées

| Vue | Cadence avant/après | Appels avant/après | Triangles dessinés avant/après |
|---|---|---|---|
| building | 29.94 / 29.94 i/s | 1048 / 976 | 56768 / 55040 |
| original | 29.94 / 29.94 i/s | 415 / 391 | 19404 / 18828 |
| neon | 29.94 / 29.94 i/s | 343 / 319 | 16876 / 16300 |
| sky | 29.94 / 29.94 i/s | 290 / 266 | 20488 / 19912 |

14 textures dans les deux versions ; géométries GPU 907 → 836. Aucun polygone ajouté ; la baisse des triangles dessinés provient de la suppression de la seconde passe des cônes transparents. Timings variables : P95 33,7–44 ms avant, 33,7–37,4 ms après. Aucun gain de cadence revendiqué.

Vues globale et trois salles vérifiées par le banc. Contrôle visuel normal/Scène et changement des trois thèmes effectué ; la matrice exhaustive GUI n’a pas été rejouée (GUI inchangée). Sur le panneau navigateur étroit de 372 px, la colonne du Mode Scène recouvre une partie du téléphone ; défaut de disposition hors du périmètre de ce lot. Console page principale sans erreur capturée ; deux erreurs MutationObserver de l’environnement de contrôle ont été capturées sur le banc, sans arrêt du rendu. Supports tablette/PC : pas de nouveau fond 3D, non applicables.
