# Bêta Alexandre — candidat de banc

Objectif : un programmeur Crestron qui connaît SIMPL doit pouvoir adapter une pièce et piloter son équipement sans modifier le CH5 ni le C#. La bêta mesure aussi les endroits où la documentation ou la configuration l'obligent encore à demander de l'aide.

## État du candidat (mis à jour le 18/09/2026)

Le candidat 1.0.180/1.0.181 du 17/09 est **obsolète** : la source est passée au contrat **v4.1** (scènes mémorisées par le C#, 20 circuits, feedback des commandes globales 401-409, traductions complètes) — GUI 1.0.196, C# source 1.0.192.0 (1.0.191.0 chargé sur le CP4 de développement), SMW v4.1 régénéré, LPZ compilé le 18/09 sans recette matérielle. Le socle `tools/quality/runtime-v4.json` a été re-basé sur ces sources.

Profil de banc régénéré : `docs/verification/2026-09-18-beta-alexandre/villa_config-beta-alexandre.json` (15 identifiants, 14 pièces actives, libellés de démonstration, repli alarme vide, 0 défaut en mode `--release`). Les étapes de préparation et de compilation restantes sont dans le `README.md` du même dossier. **Aucun CH5Z/CPZ/LPZ de ce profil n'est compilé ; aucune installation ni recette matérielle n'est revendiquée.** Le manifeste des fichiers fait foi, pas le seul numéro de version.

Le repli local du code d'alarme est vide dans ce profil : un test positif nécessite le verdict du système relié au slot 2. La configuration de développement d'origine reste préservée.

## Parcours de prise en main

1. Identifier les quatre artefacts et leur empreinte dans le manifeste. Ne pas utiliser un ancien LPZ avec le nouveau CPZ par défaut.
2. Dans une copie du JSON, renommer une pièce, masquer une fonction, modifier un nom de circuit et les niveaux d'une scène. Valider la configuration.
3. Préparer le CH5 depuis ce JSON avec l'outil fourni. Aucune retouche manuelle des copies `src/villa_config.*`.
4. Ouvrir la copie SMW, contrôler les dimensions et noms EISC, câbler un éclairage, un moteur et une source AV avec leurs retours. Compiler le LPZ.
5. Installer sur le banc identifié pour l'essai, jamais sur une installation client par simple analogie. Relever processeur, firmware, écrans, IP-ID et fichiers effectivement chargés.
6. Exécuter les cas ci-dessous, joindre Debugger et captures aux écarts. Noter les étapes qui exigent une explication extérieure.

## Recette fonctionnelle

| ID | Action | Résultat attendu / preuve |
|---|---|---|
| A01 | Premier démarrage puis rechargement de config | Noms, activations, version et limites corrects sur dalle, XPanel, iPad, iPhone |
| A02 | Deux écrans sur pièces différentes, sources et scènes alternées | Commandes reçues uniquement dans la pièce de l'émetteur ; tracer a10 et ordres EISC |
| A03 | Même cas avec clics rapides, appuis maintenus et relâchements | Aucun ordre perdu, mal routé ou bouton restant actif ; trace horodatée |
| A04 | Deux écrans sur la même pièce | Retours cohérents, aucune propagation à une autre pièce |
| A05 | Source vidéo, musique indépendante, retour audio vidéo, OFF et mute | Interlocks exclusifs, niveau et badges conformes aux retours |
| A06 | Circuits et scènes, retours matériels retardés | Mesure réelle prioritaire ; pas de faux feedback de simulation |
| A07 | Volets/rideaux/stores : ouvrir, stop, fermer | Sens, arrêt et état cohérents ; relâchement correct |
| A08 | CVC ON/OFF, Auto/1/2/3, consigne aux bornes | Pas de dépassement ; mesure et consigne distinctes |
| A09 | Wellness autorisé / pièce non équipée | Fonction masquée/inopérante là où absente ; retours et bornes exacts ; état réel inconnu sans retour |
| A10 | Déconnexion/reconnexion d'un écran puis redémarrage slot 1 | Réhydratation complète de sa pièce et configuration, pas d'état d'une autre pièce |
| A11 | Alarme : code refusé, absence de verdict, code accepté par centrale | Pas de succès local de secours ; commandes et états correctement attribués |
| A12 | Modification du JSON puis retour au lot précédent | Pas de code CH5/C# modifié, manifestes et fichiers cohérents |

## Recette graphique et livraison

Trois thèmes × supports/modes applicables × toutes pages/fenêtres/états, avec captures et mesures. Cibles ≥40 px, règle smartphone ≥44 px, contraste ≥4:1, aucun texte tronqué ou scroll parasite, aucun son, aucune erreur console. Les exceptions documentées gardent leur contrôle spécifique. Vérifier aussi les fonctions masquées par le profil de banc sur une configuration de test dédiée.

## Retour d'anomalie

Un écart = ID du cas, manifeste/build, support/firmware, thème/mode/langue, pièce et IP-ID, séquence exacte, attendu/observé, capture ou trace, fréquence de reproduction, gravité. S'il manque un réglage dans le JSON ou si un nom de signal est incompréhensible, enregistrer cela comme défaut du produit.

Sortie bêta : tous cas applicables passés, aucun défaut bloquant ou majeur, package complet reproductible, scénario d'adaptation effectué sans édition CH5/C#, preuve du retour arrière. Un écran agréable en démonstration ne suffit pas à fermer cette étape.
