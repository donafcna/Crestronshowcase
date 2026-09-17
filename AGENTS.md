# Crestron CH5 Cowork — instructions de continuité

## Démarrage et sources

- Lire `docs/CONTEXTE-CODEX.md`, puis le contexte et le journal du périmètre demandé.
- GUI / C# / SIMPL : `projects/villa-crans/ch5/CONTEXTE-CLAUDE.md`, dernières entrées de `CHANGELOG.md`, puis `.agents/AGENTS.md` pour les règles CH5.
- Site : `apps/showcase/CLAUDE.md` et dernières entrées de `apps/showcase/README.md` (journal chronologique, ne pas le remplacer).
- Les huit exports Claude sont conservés sans modification dans `docs/reprise-codex/2026-09-16/`. Le fichier `claude_30-protocole-travail.md` conserve le protocole original.
- Les exports sont surtout datés du 11 septembre 2026. Ils ne remplacent pas les décisions des 15–16 septembre présentes dans le dépôt. Ne pas considérer leur intitulé « état actuel » comme une garantie de fraîcheur.
- Les instructions explicites de Donatien dans la session priment. Pour les faits techniques, confronter les notes au code, aux versions et aux observations ; signaler les contradictions sans inventer une résolution.
- Les anciens chemins `Desktop/VillaCrans`, `Desktop/VillaCrans SIMPL` et `Desktop/Crestronshowcase` ne sont plus les dossiers de travail. Racine actuelle : `C:/dev/crestron/repo`.
- Dernier complément transmis par Donatien : `docs/SUIVI-3D-2026-09-16.md` (lot `571f7c76`, planche avant/après, résultats rapportés par Claude, problème de service worker). Lire ce complément pour une reprise 3D ; ne pas refaire aveuglément le lot déjà annoncé livré.
- Restriction conservée depuis le document d'état transmis : `C:/Users/donat/Desktop/PortalVie` est hors accès autorisé pour ce projet ; ne pas y accéder ni redemander son accès.

## Source unique et périmètres

- GUI de référence : `projects/villa-crans/ch5/src/index.html` et `src/iphone.html`. Configuration source : `projects/villa-crans/ch5/villa_config.json` à la racine, et non sa copie dans `src/`.
- GUI chez le client : `meta.mode = deploiement`, feedback C# slot 1 + SIMPL slot 2, aucun curseur de démonstration.
- Vitrine : `apps/showcase`, React/Vite, `meta.mode = showcase`, feedback local. Générer la copie Villa Crans par `apps/showcase/scripts/sync-villa-crans.py` ; aucune édition manuelle de `public/showcases/villa-gemini-frequencetv/`, sauf `js/local-feedback.js`.
- Vérifier les deux modes après une modification commune ; ne pas publier les noms de test de la configuration de développement.
- Joins : contrat v4, pilotages globaux avec routage de la pièce active. `contrat.blocsPiecesGui.actif=false`. Ne pas réactiver la traduction v3 par réécriture d'attributs.
- SIMPL Windows : à la demande précisée par Donatien le 17/09/2026, conserver les générations et compilations directement dans `projects/villa-crans/simpl/simpl-windows`, pas dans `livraisons` ni `C:/dev/crestron/builds`. Préserver les fichiers existants ; candidat compilé actuel `Project_Slot2.smw`, projet historique `VillaCrans_Slot2.smw`.
- Les joins des boutons CH5 sont déclarés dans le HTML avant initialisation ; retours d'état via les attributs natifs CH5. Ne pas masquer un défaut de feedback matériel par une simulation DOM.
- Complément explicite du 16/09 après les demandes 3D : Donatien a demandé de corriger le contrôle global GUI (retours absents sur téléphone, états simultanés contradictoires, couleurs incohérentes). Ce lot GUI est autorisé dans la source commune, puis synchronisé ; il est distinct du périmètre fond 3D. Utiliser `themes/global-controls.css`, ne pas réintroduire le sélecteur `[selected]` sans valeur (il matche aussi false). La livraison Vercel ne constitue pas un déploiement matériel.
- Plans 3D : uniquement le fond du site showcase Vercel. La demande ne doit rien changer dans les GUI des châssis Dalle, Tablette et Smartphone, ni dans le CH5 de déploiement.
- Vidéo de fond par défaut. La 3D ne la remplace que dans les combinaisons écran/support explicitement validées par Donatien. Cas communiqué le 16 septembre : petit écran du laptop Lenovo (environ 14 pouces, estimation non confirmée), uniquement lorsque le châssis Smartphone est sélectionné. D'autres cas seront donnés après ses essais ; ne pas les inventer.
- Dans ce cas 3D, placer le châssis Smartphone le plus à gauche possible dans l'espace de présentation et décaler le centrage de la pièce vers la gauche pour qu'elle ne soit pas masquée par les boutons QR Code, Fiche PDF ou sélection des châssis. Adapter le cadrage au véritable espace libre.
- La règle observée dans le code lors de la reprise, `PLAN3D_RULES = [{ device: "phone" }]`, couvre toutes les largeurs : c'est un état d'implémentation, pas une validation de tous les écrans. Aucun seuil de largeur CSS exact n'a été fourni ; ne pas déduire un breakpoint d'une diagonale estimée de 14 pouces.
- Qualité 3D demandée : montagnes sans scintillement, habillage des pièces détaillé, stores/rideaux/volets visibles et animés là où ils ont du sens, luminosité selon les scènes ET la position des motorisations, pièce noire en scène OFF lorsque toutes les occultations sont fermées, TV et écrans de source détaillés. Le compte rendu Claude annonce ce lot livré sous `571f7c76` ; ses choix de transmission lumineuse (15 % store, 30 % rideaux) sont des valeurs par défaut rapportées, pas une nouvelle validation explicite de Donatien.

## Règles visuelles

- Architecture 3D : réserver un emplacement et un champ de vision dégagés à chaque écran. Aucun meuble, bibliothèque, habillage, luminaire, rideau ou équipement ne doit masquer une TV allumée, ni traverser une fenêtre. Vérifier la géométrie depuis le cadrage normal et le Mode Scène, occultations ouvertes et fermées, après tout ajout de mobilier. Seule exception : un écran escamotable explicitement prévu peut rentrer dans son meuble lorsqu'il est éteint. Corriger les emplacements physiques, jamais contourner une collision en dessinant l'écran par-dessus les obstacles.

- Trois thèmes : Sombre, Clair élégant, Verre dépoli. Ne pas réintroduire Cyberpunk ni les pages Jeux / Animation désactivées.
- Aucun son, icônes SVG, textes et couleurs cohérents entre dalle, iPad, XPanel et smartphone. Toute exception doit être documentée.
- Aucun défilement dans la GUI ; exceptions smartphone consignées : Caméras, Circuits, Configuration preset. Contenu adapté à l'écran ; cibles tactiles au moins 40 px, 44 px selon les règles smartphone existantes.
- Contraste minimum 4:1, y compris modales et états dynamiques. Corriger dans les thèmes ou composants partagés, puis vérifier tous leurs usages.
- Vocabulaire de référence confirmé par Donatien le 16 septembre : `docs/VOCABULAIRE-MODES.md`. Employer ces définitions pour Mode normal, Mode Scène, Plein écran, Plein écran navigateur (F11), Taille réelle, Responsive et Mode Dev.
- Mode normal : châssis à taille réelle si possible, sinon badge « réduit à N % », sans sélecteur Responsive. Mode Scène : châssis agrandi, colonne de droite conservée ; seul mode avec Taille réelle / Responsive.
- **Plein écran** : GUI brute seule dans un nouvel onglet, sans châssis ni colonnes, **dalle et tablette uniquement, jamais smartphone**. `/3` = GUI seule plein écran ; `/4` et Échap = retour au Mode normal. Ne pas confondre avec Mode Scène ou F11.
- La définition fournie par Donatien mentionne le bouton Plein écran de la barre d'outils. Le code observé le masque (`showEmbedTool=false`) : conserver cette différence entre définition et implémentation, sans réactiver le bouton sur une simple demande de mémorisation.
- Modifier un écran de simulateur implique d'actualiser sa capture et sa fiche FR/EN/DE.

## Travail et vérification

- Français, concis ; pas de code long recollé dans les réponses. Fournir des chemins absolus et des commandes complètes lorsqu'une action de Donatien est nécessaire.
- Traiter les retours groupés en un cycle, avec statut et preuve par point. Pour un choix esthétique demandé, proposer 2 ou 3 variantes et une recommandation.
- Préserver les modifications locales préexistantes. Relever l'état Git avant de travailler et vérifier l'absence de changements concurrents avant livraison.
- Respecter le protocole de cadrage original : pour une tâche estimée à plus de 30 minutes, contrat d'acceptation de 10 lignes maximum et validation initiale, sauf autorisation déjà donnée dans la session. Ne pas redemander une validation acquise.
- Avancer en autonomie dans le périmètre autorisé ; documenter les choix raisonnables faits par défaut.
- Avant une livraison visuelle, appliquer la matrice Playwright du protocole original : trois thèmes, supports et modes applicables, pages et modales, états dynamiques ; contraste, débordements, cibles, console, absence de son. Marquer les combinaisons non applicables avec leur raison.
- Fournir résultats et planche-contact avant/après (thèmes en colonnes). Ne pas présenter les résultats historiques comme des tests réalisés dans la session actuelle.
- Site : `npm run build`, `npm run lint`, puis vérifications navigateur adaptées. Outil de contraste : `scripts/check-contrast-dom.mjs` ; GUI : `tools/check_contrast_dom.mjs`.
- Pour une livraison fonctionnelle, suivre séparément CH5Z, CPZ slot 1, LPZ slot 2 et showcase ; mettre à jour contexte et journal. Une version source ne prouve pas la version installée.

## Publication

- Dépôt actuel unique : `donafcna/Crestronshowcase`, branche `main`, avec le site sous `apps/showcase` et les projets Crestron sous `projects/`.
- Le flux documenté est push `main` → Vercel `crestrongui`. Ne pas utiliser les anciens scripts/bundles de contournement Claude ni `npx vercel --prod` comme voie normale.
- Une tâche d'importation ou de documentation du contexte ne demande pas à elle seule une publication ou un déploiement matériel. Appliquer les autorisations de la tâche active.
- Le 16 septembre, Donatien a explicitement repris le travail : améliorer le réalisme et les détails 3D, supprimer le scintillement, corriger le téléphone en Mode Scène et ajouter la navigation à la molette, avec priorité à la fluidité et au chargement Vercel. Cette demande remplace l'attente précédente. Le lot concerne uniquement le showcase ; voir `apps/showcase/docs/plan3d.md` pour sa conception et ses limites.
- Ne pas reprendre les anciennes procédures de restauration destructive des références historiques comme actions à exécuter.

## Extension explicite du 16/09/2026

Donatien a autorisé les flèches horizontales des rideaux et ON/OFF + ventilation HVAC dans la source GUI commune, puis explicitement dans le JSON, SIMPL# et SIMPL Windows (retours Debugger). Ce périmètre dépasse la 3D showcase ; voir `projects/villa-crans/ch5/docs/HVAC-2026-09-16.md`. Préserver les noms et activations de la configuration physique. La villa de 16 pièces et ses nouveaux étages restent une configuration de démonstration.

## Industrialisation du 17/09/2026
Pour la V1/bêta Alexandre et la généralisation, lire docs/industrialisation/README.md. Registre des simulateurs unique dans simulatorRegistry.js ; validation du catalogue au prébuild. tools/quality prépare des candidats dans des dossiers neufs sans déploiement. Les preuves de banc simulé ne remplacent jamais la recette EISC multi-écrans sur matériel.
