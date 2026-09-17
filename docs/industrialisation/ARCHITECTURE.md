# Architecture réutilisable CH5 / C# / configuration / SIMPL

## Décision conservée

Le contrat v4 est la référence. Les boutons CH5 portent leurs joins globaux avant initialisation. Chaque IP-ID conserve sa pièce dans le C# du slot 1. Le slot 2 SIMPL porte les drivers, interlocks et fonctions propres au projet. `contrat.blocsPiecesGui.actif=false` reste imposé ; aucun retour à la réécriture des attributs v3.

La documentation Crestron distingue les événements GUI envoyés au programme et les états retournés à l'interface ; les attributs natifs des composants portent ces échanges. Sources consultées le 17/09/2026 : [CH5 States and Events](https://sdkcon78221.crestron.com/sdk/Crestron_HTML5UI/Content/Topics/UI-QS-States-Events.htm), [receiveStateSelected](https://sdkcon78221.crestron.com/downloads/ShowcaseApp/ch5-button/ch5-button-selected.html), [EISC](https://help.crestron.com/SimplSharp/html/a719d123-dabe-130c-c611-92dfa1321437.htm). Le choix de l'organisation ci-dessous est une décision de projet, pas une prescription de ces pages.

## Ce qui existe et ce qu'il faut extraire

| Couche | Existant | Cible réutilisable |
|---|---|---|
| Présentation | Deux grandes sources HTML CH5, CSS commun partiel ; 17 simulateurs React indépendants | Tokens et composants métier partagés : pièce, éclairage, moteurs, CVC, AV, sécurité, fenêtres ; variantes de dimensions par support |
| Configuration | `villa_config.json` canonique ; copies `src/` parfois périmées | Un profil par projet, validé, injecté lors de la préparation ; configuration client séparée du profil vitrine |
| Contrat | Tables JSON, C# et générateur SIMPL encore partiellement dupliquées | Définition canonique versionnée → documentation et tables générées ; toute dérive bloque le build |
| État | État par pièce dans C# ; simulateur local distinct | Modèle commun observable, commandes explicites et feedbacks attribués ; deux adaptateurs, simulation et Crestron |
| Installation | CH5Z, CPZ, LPZ, showcase avec cycles différents | Manifeste de lot : quatre artefacts, SHA-256, version runtime/contrat/config, recette et état installé séparés |
| Catalogue | Deux anciennes listes de simulateurs | Registre unique désormais en place, vérifié avant build |

Le mot `config.json` désigne l'objectif produit. Aujourd'hui le fichier métier est `villa_config.json` ; `src/config.json` est un autre fichier historique. Ne pas les renommer ou les confondre sans migration explicite.

## Frontière du travail programmeur

Dans les capacités déjà supportées : noms, pièces actives, sources, circuits, moteurs, scènes, consignes et widgets proviennent du JSON. Le programmeur câble les commandes et retours de ses appareils dans SIMPL, compile son slot 2 et suit la recette. Il ne modifie pas les joins internes ni le CH5/C#.

Une fonction absente du socle — par exemple un nouveau routage de conférence ou une fonction hôtelière — nécessite encore une évolution versionnée du core. On ne promet pas qu'un JSON arbitraire transforme le runtime actuel en n'importe quelle GUI. La première extraction doit garder la référence actuelle et démontrer la réutilisation sur deux projets pilotes.

## Routage multi-écrans : correction et limite

Reproduction : écran A sur pièce 1, écran B sur pièce 2 ; A choisit une source sans changer de pièce. Avant correction, le C# connaît toujours la pièce 1 pour A mais le miroir EISC conserve a10=2 pour les commandes ordinaires. La GUI peut donc montrer un feedback cohérent alors que les buffers SIMPL visent la mauvaise zone.

Le correctif dans `MirrorSignalToEisc` remet a10 depuis l'écran émetteur avant les commandes de pièce, y compris les télécommandes et niveaux. Les commandes de portée globale ne changent pas ce contexte. `reproduce-routing.ps1` extrait le vrai corps C# et les tables du dépôt, puis vérifie 22 scénarios avec des doubles d'objets de signaux.

**Ce test ne prouve pas l'atomicité du transport matériel.** a10 et l'ordre restent deux signaux EISC. La recette doit vérifier alternance rapide, appuis simultanés, relâchements de boutons maintenus et retours différés. Si les buffers perdent la corrélation dans ces conditions, conserver les joins GUI v4 et ajouter côté pont une file d'ordres/acquittement ou des canaux EISC par écran. Le choix exige la trace du banc ; ne pas réactiver v3 pour le contourner.

Les retours de pièce doivent conserver leur identité jusqu'au C#. Un feedback global sans pièce reçue ne doit pas être attribué arbitrairement au dernier écran. Les valeurs demandées et valeurs réelles doivent rester distinguées, particulièrement pour HVAC et Wellness.

## Contrat et compatibilité

- Identifiants de pièces 1–30 ; scènes ≤4, circuits ≤10, moteurs ≤6, sources 1–5 dans le runtime actuel.
- Types digital/analog/serial ont des espaces distincts. Les collisions se vérifient dans chaque type.
- Les offsets C# sont comparés au JSON ; les champs de retour seulement peuvent ne pas figurer dans la table de commandes.
- Dimensionner les symboles EISC selon les joins réellement exposés. Le symbole observé offre 2 732 digitaux, 2 732 analogiques et 2 552 sériels ; ce n'est pas une capacité universelle de tous les matériels.
- Le générateur SIMPL doit refuser une capacité insuffisante et écrire dans une copie neuve. La compilation LPZ et la logique de drivers ne se déduisent jamais du succès du générateur.
- Conserver les versions des dépendances et le verrou npm ; aucun changement de version SDK dans ce lot.

## Contrôle de sortie

Une livraison matérielle exige : config validée → contrat cohérent → sources figées → compilations CH5Z/CPZ/LPZ → matrice GUI → recette plusieurs écrans et reconnexion → manifeste signé par la recette. Le showcase est testé et publié séparément. Une démo qui fonctionne ne prouve pas qu'un équipement répond.
