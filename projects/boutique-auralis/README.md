# Boutique Auralis — programmes Crestron (slot 1 SIMPL# Pro + slot 2 SIMPL Windows)

Backend du GUI **Maison Auralis** (vitrine : `apps/showcase`, GUI `boutique-hermes`, iframe `ftv-luxury/gui.html?project=boutique-hermes`).
Tout le projet vit dans ce dossier ; rien n'est réparti ailleurs dans le dépôt. Architecture copiée de `projects/ftv-home/`, style de `projects/yacht-asteria/`.

```
projects/boutique-auralis/
├── config/boutique-auralis_config.json   SOURCE UNIQUE : niveaux, 15 espaces, circuits actifs, scènes, stores, blanc, parfum, horaires, contrat
├── simpl-sharp/                          slot 1 — SIMPL# Pro (Visual Studio)
│   ├── BoutiqueAuralis.sln
│   └── BoutiqueAuralis/ControlSystem.cs · BoutiqueAuralisConfig.cs · BoutiqueAuralisState.cs · Joins.cs · BoutiqueAuralis.csproj · packages.config
├── simpl/simpl-windows/                  slot 2 — SIMPL Windows
│   ├── BoutiqueAuralis_Slot2.smw         généré (ne pas éditer à la main : régénérer)
│   ├── BoutiqueAuralis_Slot2.signals.txt liste des signaux nommés (pour le Debugger)
│   └── _socle_cp4_eisc.smw               socle nu CP4 + EISC 2732 joins (copie ftv-home, base de génération)
├── tools/
│   ├── generate_slot2.js                 JSON → BoutiqueAuralis_Slot2.smw
│   └── check-contract.js                 JSON ↔ Joins.cs (chevauchements, constantes, limites, capacité EISC)
├── docs/CONTRAT-JOINS.md                 le contrat expliqué, à lire avant le Debugger
├── CONTEXTE-CLAUDE.md                    contexte de reprise + décisions prises par défaut
└── CHANGELOG.md
```

## Principe

1. **Un JSON dimensionne tout.** Chaque espace déclare ses pilotages (`eclairages` avec 6 circuits, `audio`) avec `actif` ;
   chaque circuit porte aussi `actif` (le « Lustre d'apparat » n'est actif que dans le hall). Les fonctions boutique
   (`eclairageGeneral`, `stores`, `blanc`, `parfum`, `horaires`) portent leur `actif`. Ce qui n'est pas actif n'est ni routé
   par le C#, ni câblé dans le SIMPL, ni affiché par le GUI.
2. **Joins globaux, identiques dans tous les espaces.** `Scene_Gala` est toujours d52, `Light_2_Level#` toujours a12,
   `Music_Volume#` toujours a30, quel que soit l'espace affiché.
3. **`Room_Select#` (a10) = espace visé, 0 = toute la boutique.** Le C# connaît l'espace affiché par chaque écran ; avant de
   recopier une action vers le slot 2, il pose a10 et `Room_Active_nn` (d100-117, un seul haut ; `Room_Active_00` = toute la
   boutique). Le slot 2 bufferise sur ces signaux (Analog Buffer / Buffer validés par `Room_Active_nn`). Les scènes suivent a10
   (espace visé ou tous) comme dans le simulateur.
4. **Chaque action remonte dans le Debugger** sous son nom nu, sur le même join pour tous les espaces.
5. **Le feedback des écrans vient du C#** ; le slot 2 renvoie les mesures réelles (`_Actual`) dans les blocs espace
   `1000 + (id-1)*100` et dans le bloc maison (blanc, parfum, positions des stores), qui font foi dès réception. Les stores
   (4 façades), l'éclairage général, le blanc (loi horaire par CTimer), le parfum et le cycle horaire ouverture / fermeture
   (CTimer 30 s) sont globaux.

## Mise en service

1. `config/boutique-auralis_config.json` → copier sur le CP4 dans `/user/boutique-auralis_config.json`.
2. `simpl-sharp/BoutiqueAuralis.sln` → Visual Studio (restauration NuGet automatique : `Crestron.SimplSharp.SDK.* 2.21.274`,
   .NET Framework 4.7), Build → `BoutiqueAuralis.cpz` → **slot 1**.
3. `node tools/check-contract.js` puis `node tools/generate_slot2.js` (Node ≥ 18) → ouvrir
   `simpl/simpl-windows/BoutiqueAuralis_Slot2.smw` dans SIMPL Windows, F12 → `.lpz` → **slot 2**.
4. Écrans : TSW-1070 IP-ID 03, XPanel 04, iPad (Crestron ONE, projet `boutiqueauralis`) 05, iPhone 06 ; EISC F0 → 127.0.0.2.
5. Console CP4 : `boutiquestate [id]`, `boutiqueroom <ipid> <espace, 0 = tout>`, `boutiquetrace`.

Le GUI CH5 de déploiement n'existe pas encore : la GUI web du showcase (`boutique-hermes`) en est la référence visuelle,
le contrat `docs/CONTRAT-JOINS.md` en est la référence fonctionnelle.
