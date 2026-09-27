# Club Étoile — programmes Crestron (slot 1 SIMPL# Pro + slot 2 SIMPL Windows)

Backend du GUI **Club Étoile** (vitrine : `apps/showcase`, GUI `club-etoile`, simulateur `ClubEtoile.jsx` + 3D `ftv-luxury/venues/venue.js`).
Tout le projet vit dans ce dossier ; rien n'est réparti ailleurs dans le dépôt. Architecture copiée de `projects/ftv-home/` (et du frère `projects/yacht-asteria/`).

```
projects/club-etoile/
├── config/club-etoile_config.json     SOURCE UNIQUE : étages, 3 salles, ambiances, globaux club (affluence, CVC, audio, effets, écran DJ, macros), contrat
├── simpl-sharp/                       slot 1 — SIMPL# Pro (Visual Studio)
│   ├── ClubEtoile.sln
│   └── ClubEtoile/ControlSystem.cs · ClubEtoileConfig.cs · ClubEtoileState.cs · Joins.cs · ClubEtoile.csproj · packages.config
├── simpl/simpl-windows/               slot 2 — SIMPL Windows
│   ├── ClubEtoile_Slot2.smw           généré (ne pas éditer à la main : régénérer)
│   ├── ClubEtoile_Slot2.signals.txt   liste des signaux nommés (pour le Debugger)
│   └── _socle_cp4_eisc.smw            socle nu CP4 + EISC 2732 joins (copie ftv-home, base de génération)
├── tools/
│   ├── generate_slot2.js              JSON → ClubEtoile_Slot2.smw
│   └── check-contract.js              JSON ↔ Joins.cs (chevauchements, constantes, limites, bloc club, capacité EISC)
├── docs/CONTRAT-JOINS.md              le contrat expliqué, à lire avant le Debugger
├── CONTEXTE-CLAUDE.md                 contexte de reprise + décisions prises par défaut
└── CHANGELOG.md
```

## Principe

1. **Un JSON dimensionne tout.** Chaque salle déclare `ambiance` (scène + intensité) et `eclairages` (4 circuits **dérivés** de
   l'ambiance, coefficient par circuit) avec `actif` ; les fonctions club (`affluence`, `cvc`, `audio`, `effets`, `ecranDj`,
   `macros`) portent aussi `actif`. Ce qui n'est pas actif n'est ni routé par le C#, ni câblé dans le SIMPL, ni affiché par le GUI.
2. **Joins globaux, identiques dans toutes les salles.** `Scene_Party` est toujours d52, `Room_Level#` toujours a11, quelle que
   soit la salle affichée.
3. **`Room_Select#` (a10) = salle visée, 0 = tout le club.** Le C# connaît la salle affichée par chaque écran ; avant de recopier
   une action vers le slot 2, il pose a10 et `Room_Active_nn` (d100-110, un seul haut ; `Room_Active_00` = tout le club).
   Le slot 2 bufferise sur ces signaux (Analog Buffer / Buffer validés par `Room_Active_nn`).
4. **Chaque action remonte dans le Debugger** sous son nom nu, sur le même join pour toutes les salles. Une macro est recopiée
   puis décomposée en impulsions élémentaires (250 ms) vers le slot 2.
5. **Le feedback des écrans vient du C#** ; le slot 2 renvoie les mesures réelles (`_Actual`) dans les blocs salle
   `1000 + (id-1)*100` et sur les joins globaux club, qui font foi dès réception. Les états tenus des fonctions globales
   (affluence, ventilation, consigne calculée, volumes, limiteur, fumée, strobe, lyres, source DJ) sont poussés au slot 2 dans
   le **bloc club** `Club_xxx_fb` = 500 + join global.

## Mise en service

1. `config/club-etoile_config.json` → copier sur le CP4 dans `/user/club-etoile_config.json`.
2. `simpl-sharp/ClubEtoile.sln` → Visual Studio (restauration NuGet automatique : `Crestron.SimplSharp.SDK.* 2.21.274`,
   .NET Framework 4.7), Build → `ClubEtoile.cpz` → **slot 1**.
3. `node tools/check-contract.js` puis `node tools/generate_slot2.js` (Node ≥ 18) → ouvrir
   `simpl/simpl-windows/ClubEtoile_Slot2.smw` dans SIMPL Windows, F12 → `.lpz` → **slot 2**.
4. Écrans : TSW-1070 IP-ID 03, XPanel 04, iPad (Crestron ONE, projet `clubetoile`) 05, iPhone 06 ; EISC F0 → 127.0.0.2.
5. Console CP4 : `clubstate [id]`, `clubroom <ipid> <salle, 0 = tout>`, `clubtrace`.

Le GUI CH5 de déploiement n'existe pas encore : le simulateur React du showcase (`club-etoile`) en est la référence visuelle,
le contrat `docs/CONTRAT-JOINS.md` en est la référence fonctionnelle.
