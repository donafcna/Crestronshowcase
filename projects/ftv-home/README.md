# FTV Home — programmes Crestron (slot 1 SIMPL# Pro + slot 2 SIMPL Windows)

Backend du GUI **FTV Home** (vitrine : `apps/showcase`, page `/interfaces/residentiel/crestron-home`).
Tout le projet vit dans ce dossier ; rien n'est réparti ailleurs dans le dépôt.

```
projects/ftv-home/
├── config/ftvhome_config.json       SOURCE UNIQUE : pièces, fonctionnalités par pièce, contrat de joins
├── simpl-sharp/                     slot 1 — SIMPL# Pro (Visual Studio)
│   ├── FtvHome.sln
│   └── FtvHome/ControlSystem.cs · HomeConfig.cs · HomeState.cs · Joins.cs · FtvHome.csproj · packages.config
├── simpl/simpl-windows/             slot 2 — SIMPL Windows
│   ├── FtvHome_Slot2.smw            généré (ne pas éditer à la main : régénérer)
│   ├── FtvHome_Slot2.signals.txt    liste des signaux nommés (pour le Debugger)
│   └── _socle_cp4_eisc.smw          socle nu CP4 + EISC 2732 joins (base de génération)
├── tools/
│   ├── generate_slot2.js            JSON → FtvHome_Slot2.smw
│   └── check-contract.js            JSON ↔ Joins.cs (chevauchements, constantes, limites)
├── docs/CONTRAT-JOINS.md            le contrat expliqué, à lire avant le Debugger
├── CONTEXTE-CLAUDE.md               contexte de reprise
└── CHANGELOG.md
```

## Principe

1. **Un JSON dimensionne tout.** Chaque pièce déclare ses pilotages (`eclairages`, `occultants`, `cvc`,
   `video`, `audio`, `serrure`) avec `actif`. Ce qui n'est pas actif n'est ni routé par le C#, ni câblé
   dans le SIMPL, ni affiché par le GUI.
2. **Joins globaux, identiques dans toutes les pièces.** `Scene_Arrive` est toujours d51,
   `Light_3_Level#` toujours a13, quelle que soit la pièce affichée.
3. **`Room_Select#` (a10) = pièce visée.** Le C# connaît la pièce affichée par chaque écran ; avant de
   recopier une action vers le slot 2, il pose a10 et `Room_Active_nn` (d11-40, un seul haut). Le slot 2
   bufferise sur ces signaux (Analog Buffer / Buffer validés par `Room_Active_nn`).
4. **Chaque action remonte dans le Debugger** sous son nom nu, sur le même join pour toutes les pièces.
5. **Le feedback des écrans vient du C#** ; le slot 2 renvoie les mesures réelles (`_Actual`) dans les
   blocs pièce `1000 + (id-1)*100`, qui font foi dès réception.

## Mise en service

1. `config/ftvhome_config.json` → copier sur le CP4 dans `/user/ftvhome_config.json`.
2. `simpl-sharp/FtvHome.sln` → Visual Studio (restauration NuGet automatique : `Crestron.SimplSharp.SDK.*
   2.21.274`), Build → `FtvHome.cpz` → **slot 1**.
3. `node tools/check-contract.js` puis `node tools/generate_slot2.js` (Node ≥ 18) → ouvrir
   `simpl/simpl-windows/FtvHome_Slot2.smw` dans SIMPL Windows, F12 → `.lpz` → **slot 2**.
4. Écrans : TSW-1070 IP-ID 03, XPanel 04, iPad (Crestron ONE, projet `ftvhome`) 05, iPhone 06.
5. Console CP4 : `ftvstate`, `ftvroom <ipid> <pièce>`, `ftvtrace`.

Le GUI CH5 de déploiement n'existe pas encore : le simulateur React du showcase en est la référence
visuelle, le contrat `docs/CONTRAT-JOINS.md` en est la référence fonctionnelle.
