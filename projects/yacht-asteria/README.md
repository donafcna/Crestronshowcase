# Yacht Asteria — programmes Crestron (slot 1 SIMPL# Pro + slot 2 SIMPL Windows)

Backend du GUI **M/Y Asteria** (vitrine : `apps/showcase`, GUI `yacht-monaco`, iframe `ftv-luxury/gui.html?project=yacht-monaco`).
Tout le projet vit dans ce dossier ; rien n'est réparti ailleurs dans le dépôt. Architecture copiée de `projects/ftv-home/`.

```
projects/yacht-asteria/
├── config/yacht-asteria_config.json   SOURCE UNIQUE : ponts, 37 espaces, circuits actifs par espace, scènes, couleurs, effets, contrat
├── simpl-sharp/                       slot 1 — SIMPL# Pro (Visual Studio)
│   ├── YachtAsteria.sln
│   └── YachtAsteria/ControlSystem.cs · YachtAsteriaConfig.cs · YachtAsteriaState.cs · Joins.cs · YachtAsteria.csproj · packages.config
├── simpl/simpl-windows/               slot 2 — SIMPL Windows
│   ├── YachtAsteria_Slot2.smw         généré (ne pas éditer à la main : régénérer)
│   ├── YachtAsteria_Slot2.signals.txt liste des signaux nommés (pour le Debugger)
│   └── _socle_cp4_eisc.smw            socle nu CP4 + EISC 2732 joins (copie ftv-home, base de génération)
├── tools/
│   ├── generate_slot2.js              JSON → YachtAsteria_Slot2.smw
│   └── check-contract.js              JSON ↔ Joins.cs (chevauchements, constantes, limites, capacité EISC)
├── docs/CONTRAT-JOINS.md              le contrat expliqué, à lire avant le Debugger
├── CONTEXTE-CLAUDE.md                 contexte de reprise + décisions prises par défaut
└── CHANGELOG.md
```

## Principe

1. **Un JSON dimensionne tout.** Chaque espace déclare ses pilotages (`eclairages` avec 5 circuits, `audio`) avec `actif` ;
   chaque circuit porte aussi `actif` (le canal « Piscines » n'est actif que dans les 4 espaces à bassin). Ce qui n'est pas
   actif n'est ni routé par le C#, ni câblé dans le SIMPL, ni affiché par le GUI.
2. **Joins globaux, identiques dans tous les espaces.** `Scene_Dinner` est toujours d53, `Light_2_Level#` toujours a12,
   `Music_Volume#` toujours a30, quel que soit l'espace affiché.
3. **`Room_Select#` (a10) = espace visé, 0 = tout le yacht.** Le C# connaît l'espace affiché par chaque écran ; avant de
   recopier une action vers le slot 2, il pose a10 et `Room_Active_nn` (d100-140, un seul haut ; `Room_Active_00` = tout le
   yacht). Le slot 2 bufferise sur ces signaux (Analog Buffer / Buffer validés par `Room_Active_nn`).
4. **Chaque action remonte dans le Debugger** sous son nom nu, sur le même join pour tous les espaces.
5. **Le feedback des écrans vient du C#** ; le slot 2 renvoie les mesures réelles (`_Actual`) dans les blocs espace
   `500 + (id-1)*50`, qui font foi dès réception. Couleur des bandeaux (`Color_R#/G#/B#`), effets (cycle CTimer côté C#),
   vitesse et cycle jour/nuit (`Daylight_Day/Night_Actual` de l'horloge astronomique du slot 2) sont globaux.

## Mise en service

1. `config/yacht-asteria_config.json` → copier sur le CP4 dans `/user/yacht-asteria_config.json`.
2. `simpl-sharp/YachtAsteria.sln` → Visual Studio (restauration NuGet automatique : `Crestron.SimplSharp.SDK.* 2.21.274`,
   .NET Framework 4.7), Build → `YachtAsteria.cpz` → **slot 1**.
3. `node tools/check-contract.js` puis `node tools/generate_slot2.js` (Node ≥ 18) → ouvrir
   `simpl/simpl-windows/YachtAsteria_Slot2.smw` dans SIMPL Windows, F12 → `.lpz` → **slot 2**.
4. Écrans : TSW-1070 IP-ID 03, XPanel 04, iPad (Crestron ONE, projet `yachtasteria`) 05, iPhone 06 ; EISC F0 → 127.0.0.2.
5. Console CP4 : `yachtstate [id]`, `yachtroom <ipid> <espace, 0 = tout>`, `yachttrace`.

Le GUI CH5 de déploiement n'existe pas encore : la GUI web du showcase (`yacht-monaco`) en est la référence visuelle,
le contrat `docs/CONTRAT-JOINS.md` en est la référence fonctionnelle.
