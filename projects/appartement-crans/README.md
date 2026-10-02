# Appartement Crans-Montana — GUI CH5 + programmes Crestron (slot 1 SIMPL# Pro, slot 2 SIMPL Windows)

Premier projet client assemblé à partir du **Core Villa Crans** (`projects/villa-ftv`) : même GUI CH5, même C#,
même contrat de joins v4.1 ; seul `villa_config.json` change (17 pièces, circuits et scènes tirés de la séquence
d'opérations Lutron). Identifiant du projet : `appartement-crans` ; nom CH5 / CPZ : `appartementcrans` /
`AppartementCrans`. Tout le projet vit dans ce dossier.

```
projects/appartement-crans/
├── villa_config.json                SOURCE UNIQUE du projet (généré par tools/build_config.py, ne pas éditer à la main)
├── tools/
│   ├── build_config.py              Core villa_config + lutron-seq-of-op.json + table des pièces → villa_config.json
│   ├── lutron-seq-of-op.json        séquence d'opérations Lutron (niveaux par circuit et par scène)
│   ├── assemble.py                  Core → ch5/, simpl-sharp/, puis generate_slot2 + check_slot2 (idempotent)
│   ├── generate_slot2.js            villa_config.json + socle nu → simpl/simpl-windows/AppartementCrans_Slot2.smw
│   └── check_slot2.js               contrôle structurel du .smw (références, doublons, capacités, EOL)
├── ch5/                             GUI CH5 de déploiement — COPIE du Core (assemble.py), jamais éditée ici
│   ├── src/                         index.html, iphone.html, js/, themes/ + villa_config.js/json du projet
│   ├── deploy.ps1                   build ch5z + TSW + XPanel + CP4 (ASCII + BOM, noms adaptés)
│   ├── deploy.secrets.example.psd1  gabarit des identifiants (copier en deploy.secrets.psd1, non commité)
│   ├── version.json                 version du GUI (incrémentée par deploy.ps1)
│   └── tools/, package.json         outils du Core nécessaires à deploy.ps1
├── simpl-sharp/                     slot 1 — COPIE du Core renommée AppartementCrans (assemble.py)
│   ├── AppartementCrans.sln
│   └── AppartementCrans/ControlSystem.cs · HvacState.cs · WellnessState.cs · Properties/AssemblyInfo.cs · .csproj
├── simpl/simpl-windows/             slot 2 — SIMPL Windows
│   ├── AppartementCrans_Slot2.smw   GÉNÉRÉ (880 signaux) ; .signals.txt = liste join → nom
│   ├── _socle_cp4_eisc.smw          socle nu CP4 + EISC 2732 joins (copie de projects/ftv-home)
│   └── LIRE.md                      ouvrir, compiler, ce qui reste à câbler
├── docs/CONTRAT-JOINS.md            contrat v4.1 appliqué : tableau des pièces, recette Debugger
├── CONTEXTE-CLAUDE.md               contexte de reprise
└── CHANGELOG.md
```

## Chaîne de génération

```
tools/lutron-seq-of-op.json ─┐
Core villa_config.json ──────┴─ python3 tools/build_config.py ──▶ villa_config.json
                                                                     │
Core ch5/src, deploy.ps1 ──┐                                         ▼
Core Backend/*.cs ─────────┴─ python3 tools/assemble.py ──▶ ch5/src (+villa_config.js), simpl-sharp/AppartementCrans
ftv-home _socle_cp4_eisc ──── node tools/generate_slot2.js ──▶ simpl/simpl-windows/AppartementCrans_Slot2.smw
                              node tools/check_slot2.js   ──▶ contrôle structurel (VERT attendu)
```

Une correction fonctionnelle (GUI, C#, contrat) se fait **dans le Core**, puis `python3 tools/assemble.py` la
propage ici. Une correction du dimensionnement se fait dans `tools/build_config.py`, puis on régénère.

## Commandes (depuis `projects/appartement-crans/`)

```
python3 tools/build_config.py                                     # régénère villa_config.json
node ../../tools/quality/validate-config.mjs villa_config.json    # validation du JSON (comme le Core)
python3 tools/assemble.py                                         # copie Core + C# + SMW + contrôles
node tools/generate_slot2.js [--dry-run]                          # SMW seul
node tools/check_slot2.js                                         # contrôle du SMW
```

## Mise en service (PC Windows, jamais faite au 27.09.2026)

1. `villa_config.json` → CP4 `/user/villa_config.json` (`ch5\deploy.ps1 -Target config` après `npm install` dans `ch5/`
   et un `deploy.secrets.psd1` rempli).
2. `simpl-sharp/AppartementCrans.sln` → Visual Studio (NuGet `Crestron.SimplSharp.SDK.* 2.21.274`), Build →
   `AppartementCrans.cpz` → slot 1 (`deploy.ps1 -Target cp4`).
3. `simpl/simpl-windows/AppartementCrans_Slot2.smw` → SIMPL Windows, F12 → `.lpz` → slot 2 (voir `LIRE.md`).
4. `deploy.ps1` (TSW IP-ID 03) / `-Target web` (XPanel 04 + QR par pièce, IP-ID 0x10+id) / `-Target mobile`
   (Crestron ONE, projet `appartementcrans`, iPad 05, iPhone 06).
5. Recette Debugger : `docs/CONTRAT-JOINS.md`, dernière section.
