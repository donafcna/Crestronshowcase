# Villa FTV — matériaux, 22 novembre 2026

Version locale 2.3.13, non publiée. Parquet à échelle métrique constante, tissage alterné du lin (256²), veinage et pores de la pierre (512²). Textures existantes réutilisées ; aucun maillage, lumière, passe ou calcul par image supplémentaire. Générateur aléatoire du mobilier inchangé. Activation limitée à villa-crans.json ; A10 conserve son rendu.

Build et lint réussis, avertissements tiers préexistants. Banc du build preview à 1280×720, DPR 1,5 : séquences A/B/B/A, chacune 3,5 s de chauffe puis 4,5 s de mesure, salon de jour et circuits à 70 %. Moyennes 59,78 images/s avant, 59,70 après (-0,13 %, variation de mesure). Même budget : 104 appels de dessin, 205396 triangles, 19 textures, 100 géométries, 22 programmes. Rapport brut : performance.json. Mesures locales, aucune garantie universelle sur les GPU ni sur toutes les transitions.

Les 17 pièces atteignent l’état room et les UV sont finis. Aucune erreur du banc final. Le premier essai sous Vite dev a échoué sur un import de module public ; utilisation du build preview pour la recette réussie.

Intégration vérifiée en thèmes sombre/clair/verre et modes normal/Scène ; navigation Chambre 2 et activation TOTAL. Jour et nuit observés. Captures d’intégration à phases différentes du cycle : elles vérifient le cadrage, pas la photométrie. GUI inchangé ; recette exhaustive des modales et dalle/tablette non refaite, le fond est réservé à la présentation Smartphone.

Reproduction depuis apps/showcase : npm run build ; copier scripts/verify-villa-materials.html dans dist/verify-villa-materials.html ; npm run preview -- --host 127.0.0.1 --port 4319. Ouvrir /verify-villa-materials.html, puis Comparer les performances. Avant/après isolé : before.jpg et after.jpg, même chambre et éclairage. Planche : comparison.html.
