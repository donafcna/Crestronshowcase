# Recette Hotel Brassus — 26 septembre 2026

Environnement : Windows, Edge Chromium automatisé par Playwright, build Vite servi localement. Pas de recette matérielle ou Safari/iPad réel.

- Build et lint réussis ; avertissements historiques du dépôt conservés. Bibliothèques CH5 compilées importées exclues du lint, comme les autres bibliothèques tierces.
- `matrix.json` : 216 cas, trois thèmes × sept profils × trois formats (1280×800, 1920×1200, 1194×834), quatre pages sauf Stores absent des profils sans motorisation. Chargement terminé avant mesures. Zéro exception JS, réponse HTTP en erreur, image cassée, débordement de document ou cible testée inférieure à 40 px. Boutons de scènes, circuits, consignes et mute examinés à l'échelle interne avant réduction du châssis.
- Scènes Total et incrément de consigne vérifiés dans la matrice ; `controls.json` ajoute On/Off circuit, mute et interverrouillage du mode Séminaires. Les valeurs sont simulées.
- `contrast.json` : 63 vues représentatives des cinq dispositions GUI distinctes, circuits compris. Les défauts des pourcentages/valeurs en Sombre ont été corrigés puis les vues recontrôlées. Le dernier signalement concerne le bouton clair des séminaires : le détecteur de fonds unis ignore son dégradé. `controls.json` vérifie les deux extrêmes réels du dégradé : contraste minimum 4,966:1. Aucun défaut de contraste confirmé restant dans ces vues. Ce relevé n'est pas une certification WCAG de toute la bibliothèque CH5.
- `site.json` : entrée du projet, GUI plein écran, fiches FR/EN/DE, Hotel Geneva conservé ; zéro exception. `scene-modes.json` complète avec des pages neuves pour chaque support (la première visite conservait l'état Scène entre routes) : trois supports × Taille réelle/Responsive, aucun débordement horizontal.
- `model.json` : six niveaux isolables, aucune confusion de visibilité. 31–38 appels de dessin par niveau, 198 en vue globale après regroupement du mobilier. Pas de promesse de FPS ni de photoréalisme. Coupe, toitures, jour/nuit, zoom et rotation examinés.
- `source-integrity.json` : 1 057 des 1 059 fichiers compilés identiques aux sources fournies. Seuls index.html (adaptateurs/CSP) et project-config.json (transport désactivé) diffèrent. Adaptateurs et corrections CSS restent hors du répertoire importé.
- `comparaison.png` : thèmes en colonnes, styles fournis puis copie vitrine, AV et éclairages. Il n'existait pas de projet Hotel Brassus avant cette livraison ; il ne s'agit donc pas d'un avant/après de la page publique.

Exceptions explicites : pas de GUI Smartphone dans la source livrée ; pas de thème Verre ajouté ; pas de modèle architectural d'exécution. Les fenêtres AV de l'ancien profil 211 ne sont pas exposées par le profil Séminaires 210 actuel. Les pages sont vérifiées aux dimensions internes, les châssis séparément ; cette recette est factorisée et n'est pas annoncée comme le produit cartésien de tous les états et modes.

Script reproductible : `apps/showcase/scripts/test-hotel-brassus.cjs`. Variables facultatives `PLAYWRIGHT_MODULE`, `BROWSER_CHANNEL`, `HDH_BASE_URL`, `HDH_TEST_OUTPUT` pour adapter l'installation locale.

Revue finale : GUI seul dans le châssis ; sélecteurs et ouverture 3D déplacés dans la colonne du site. `host-model.json` vérifie profil Séminaires, thème Sombre, ouverture de la vue 3D hors du châssis et fermeture par Échap depuis son iframe. Les captures `site-final.png`, `scene-final.png` et `model-dialog.png` remplacent les vues antérieures avec barre de présentation imbriquée.
