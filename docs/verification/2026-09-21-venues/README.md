# Smartphone et lieux 3D — 21 septembre 2026

Demande : priorité Smartphone pour Yacht/Boutique ; ajouter iPhone et fond 3D pour Auditorium Richmond et Club L’Étoile.

## Résultat

Catalogue public étendu ; priorité d’ouverture explicite, sans écraser un support demandé dans l’URL. Interfaces Smartphone compactes, 4 onglets auditorium / 3 onglets club, thèmes Sombre/Clair/Verre. États partagés avec les commandes existantes du simulateur. Une seule scène 3D de fond, aucun modèle chargé sur dalle/PC/tablette. Messages origine/source/projet contrôlés. Lumière et écran auditorium, fumée et ambiance club synchronisés. Zoom à la molette ; rendu suspendu en arrière-plan. Aucun son ni flash. Assets locaux sous `/ftv-luxury/venues/`, couverts par les règles Vercel et réseau prioritaire existantes.

## Vérification

Script `apps/showcase/scripts/test-venues.cjs` : 55 contrôles, 42 combinaisons onglet/thème/mode, navigation initiale et clic sur cartes, liens explicites préservés, synchronisation, absence de débordement et commandes de 44 px avant réduction du châssis. Contraste DOM minimum 4:1 dans tous les onglets des nouveaux téléphones. Chromium logiciel 1440 × 1000 ; captures complémentaires 1280 × 800. Aucun essai iPhone physique, Safari ou matériel. Build/lint : voir journaux. Les avertissements de lint préexistants ne constituent pas une erreur.

`comparison.webp` : thèmes en colonnes, avant = support précédemment proposé, après = nouveau Smartphone. Les anciens supports n’avaient pas ces trois thèmes : leur baseline est répétée pour faciliter la comparaison. Logos et images externes absents du snapshot local ou bloqués pendant le test ; les ressources existantes distantes ne sont pas modifiées. Les captures sources PNG restent locales ; les images optimisées et résultats sont suivis dans le dépôt.

## Limites

Maquettes conceptuelles, pas plans d’exécution. Auditorium avec 60 sièges schématiques, pas reconstitution des 1000 places annoncées dans l’ancienne fiche. Contrôles caméras et audio simulés ; le modèle ne produit ni captation ni son. Le stroboscope utilise une lumière continue. Les supports existants gardent leur présentation et ne font pas l’objet d’une nouvelle recette complète. Aucun modal nouveau. Pas de mesure FPS ni test GPU physique. Aucun déploiement CH5/CP4/TSW.

Publication : autorisation persistante de Donatien pour main → Vercel dans cette conversation.
