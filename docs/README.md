# Villa Crans — Documentation technique

Projet : GUI Crestron CH5 + programme SIMPL# Pro (slot 1) + programme SIMPL Windows (slot 2)
Intégrateur : Fréquence TV
Version GUI au moment de la rédaction : **1.0.165** — contrat de joins **v2** (22.08.2026)
Dernière mise à jour de ce dossier : **09.09.2026**

## Sommaire

| Document | Contenu |
|---|---|
| [01 — Spécification de l'interface](01_SPECIFICATION.md) | Ce que fait le GUI : périphériques, écrans, modules, thèmes, langues, limites |
| [02 — Guide `villa_config.json`](02_CONFIG_JSON.md) | Comment dimensionner le projet : chaque champ, les règles, le process d'équipe |
| [03 — Contrat de joins v2](03_CONTRAT_JOINS.md) | Référence unique GUI / C# / SIMPL : signaux globaux + blocs pièces EISC |
| [04 — Programme SIMPL slot 2](04_SIMPL_SLOT2.md) | Ce qui est câblé, ce qui ne l'est pas, les écarts au contrat, la mise en service |
| [05 — Recette et tests](05_RECETTE.md) | Ce que le code prouve, ce qui reste à valider sur site, matrice par périphérique |
| [06 — To-do list](06_TODO.md) | Actions classées par priorité, avec le fichier et la ligne |
| [07 — Retours direction 09.09.2026](07_RETOURS_DIRECTION_2026-09-09.md) | Corrections demandées par A. Dändliker : scènes mémorisées, télécommande, bandeau d'état, majuscules, traductions — recette à faire |
| [08 — Workflow Déploiement ↔ Crestronshowcase](08_WORKFLOW_SHOWCASE.md) | Deux versions d'une seule source : `meta.mode`, feedback backend vs frontend, script de synchronisation |

Voir aussi, à la racine du projet :

- `AUDIT_2026-09-02.md` — audit détaillé du code (bugs confirmés, dette, risques)
- `.agents/AGENTS.md` — règles de développement CH5 (« Rule of Gold »)
- `CONFIG_PROCESS.md` — version courte du process de configuration (**contient un résidu
  de contrat v1**, voir [06 — To-do](06_TODO.md) § Documentation)

## Conventions de ce dossier

- Les numéros de ligne renvoient à l'état du dépôt au 02.09.2026.
- « Slot 1 » = programme SIMPL# Pro C# (`Backend/Backend/ControlSystem.cs`).
  « Slot 2 » = programme SIMPL Windows (`..\VillaCrans SIMPL\VillaCrans_Slot2.smw`).
- Un point marqué **⚠️** signale un écart entre ce qui est documenté et ce qui est codé.
- Un point marqué **⬜** attend une vérification sur site ou une décision.
