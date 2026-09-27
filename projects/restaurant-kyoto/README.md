# Restaurant Kyoto Gardens — programmes Crestron (slot 1 SIMPL# Pro + slot 2 SIMPL Windows)

Backend du GUI **Kyoto Gardens** (vitrine : `apps/showcase`, GUI `sushi-bar-kyoto`, simulateur
`src/components/simulators/SushiBarKyoto.jsx`). Tout le projet vit dans ce dossier ; rien n'est réparti ailleurs dans
le dépôt. Architecture copiée de `projects/ftv-home/`, style aligné sur `projects/yacht-asteria/`.

```
projects/restaurant-kyoto/
├── config/restaurant-kyoto_config.json   SOURCE UNIQUE : 16 zones, 4 circuits par zone, 5 scènes par zone, globaux restaurant, contrat
├── simpl-sharp/                          slot 1 — SIMPL# Pro (Visual Studio)
│   ├── RestaurantKyoto.sln
│   └── RestaurantKyoto/ControlSystem.cs · RestaurantKyotoConfig.cs · RestaurantKyotoState.cs · Joins.cs · RestaurantKyoto.csproj · packages.config
├── simpl/simpl-windows/                  slot 2 — SIMPL Windows
│   ├── RestaurantKyoto_Slot2.smw         généré (ne pas éditer à la main : régénérer)
│   ├── RestaurantKyoto_Slot2.signals.txt liste des signaux nommés (pour le Debugger)
│   └── _socle_cp4_eisc.smw               socle nu CP4 + EISC 2732 joins (copie ftv-home, base de génération)
├── tools/
│   ├── generate_slot2.js                 JSON → RestaurantKyoto_Slot2.smw
│   └── check-contract.js                 JSON ↔ Joins.cs (chevauchements, constantes, limites, capacité EISC)
├── docs/CONTRAT-JOINS.md                 le contrat expliqué, à lire avant le Debugger
├── CONTEXTE-CLAUDE.md                    contexte de reprise + décisions prises par défaut
└── CHANGELOG.md
```

## Principe

1. **Un JSON dimensionne tout.** Chaque zone déclare ses pilotages (`eclairages` avec 4 circuits gradables) avec `actif` ;
   chaque circuit porte aussi `actif`. Climat, musique, service et couverts sont globaux (bloc `restaurant`). Ce qui n'est
   pas actif n'est ni routé par le C#, ni câblé dans le SIMPL, ni affiché par le GUI.
2. **Joins globaux, identiques dans toutes les zones.** `Scene_Dinner` est toujours d52, `Light_2_Level#` toujours a12,
   `HVAC_Setpoint#` toujours a60, quelle que soit la zone affichée.
3. **`Room_Select#` (a10) = zone visée, 0 = tout le restaurant.** Le C# connaît la zone affichée par chaque écran ; avant de
   recopier une action vers le slot 2, il pose a10 et `Room_Active_nn` (d100-117, un seul haut ; `Room_Active_00` = tout le
   restaurant). Le slot 2 bufferise sur ces signaux (Analog Buffer / Buffer validés par `Room_Active_nn`).
4. **Chaque action remonte dans le Debugger** sous son nom nu, sur le même join pour toutes les zones.
5. **Les scènes sont par zone** (`Scene_Welcome..Closed` d51-55 sur la zone a10 ; a10 = 0 = toutes = `applyAllScene`).
   Un curseur rend la scène de la zone « Personnalisée » (`Scene#` = 0). La zone Extérieur affiche ses propres libellés
   (`libellesScenesExterieur`), mêmes ids et mêmes niveaux.
6. **Le feedback des écrans vient du C#** ; le slot 2 renvoie les mesures réelles (`_Actual`) dans les blocs zone
   `1000 + (id-1)*100` et sur les joins globaux restaurant (température, air neuf, couverts, service, lecture…), qui font foi
   dès réception.

## Mise en service

1. `config/restaurant-kyoto_config.json` → copier sur le CP4 dans `/user/restaurant-kyoto_config.json`.
2. `simpl-sharp/RestaurantKyoto.sln` → Visual Studio (restauration NuGet automatique : `Crestron.SimplSharp.SDK.* 2.21.274`,
   .NET Framework 4.7), Build → `RestaurantKyoto.cpz` → **slot 1**.
3. `node tools/check-contract.js` puis `node tools/generate_slot2.js` (Node ≥ 18) → ouvrir
   `simpl/simpl-windows/RestaurantKyoto_Slot2.smw` dans SIMPL Windows, F12 → `.lpz` → **slot 2**.
4. Écrans : TSW-1070 IP-ID 03, XPanel 04, iPad (Crestron ONE, projet `restaurantkyoto`) 05, iPhone 06 ; EISC F0 → 127.0.0.2.
5. Console CP4 : `kyotostate [id]`, `kyotoroom <ipid> <zone, 0 = tout>`, `kyototrace`.

Le GUI CH5 de déploiement n'existe pas encore : la GUI web du showcase (`sushi-bar-kyoto`) en est la référence visuelle,
le contrat `docs/CONTRAT-JOINS.md` en est la référence fonctionnelle.
