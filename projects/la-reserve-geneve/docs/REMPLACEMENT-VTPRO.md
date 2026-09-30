# Remplacer les panneaux VT Pro par le CH5 (sans C#)

Le CH5 parle aux symboles « Crestron App » déjà présents dans les programmes SIMPL. Tous les joins de zones, pages,
Distribute / Off, extinction et retours sont identiques à ceux du VT Pro (vérifiés par `tools/verifier_smw.py`,
rapport `docs/VERIFICATION-SMW.md`, 0 écart). Une seule modification SIMPL est nécessaire par panneau.

## 1. Seule modification SIMPL : sources et « Power Off »

Dans le VT Pro, la barre de sources est le smart object 1 (Icon List Horizontal). Un CH5 n'a pas ce smart object :
déplacer ses sorties sur des joins digitaux libres du symbole Crestron App (vérifiés libres par `verifier_smw.py`).

| Panneau | Programme / IP-ID | Élément du smart object → join digital du panneau |
|---|---|---|
| Bar | Reserve Bar prg06.smw / 04 | 1 `Ipad_1_Input_2` → 80 · 2 `Ipad_1_Input_3` → 81 · 3 `Ipad_1_Input_4` → 82 · 4 `Ipad_1_Input_1` → 83 · 5 `Ipad_1_Power_Off` → 84 |
| Lodge | Reserve Bar prg06.smw / 05 | 1 `Ipad_2_Input_1` → 61 · 2 `Ipad_2_Input_2` → 62 · 3 `Ipad_2_Input_3` → 63 · 4 `Ipad_2_Input_4` → 64 · 5 `Ipad_2_Power_Off` → 65 |
| Fitness | Reserve prg005.smw / 04 | 1 `Ipad_1_Input_4` → 61 · 2 `Ipad_1_Input_1` → 62 · 3 `Ipad_1_Input_3` → 63 · 4 `Ipad_1_Input_2` → 64 · 5 `Ipad_1_Input_5` → 65 · 6 `Ipad_1_Power_Off` → 66 |

Garder le smart object tant que l'ancien panneau VT Pro peut encore se connecter (les deux coexistent : même signal
sur deux entrées). Les joins sont dans `reserve_config.json` (`espaces[].sources[].join`) : si l'intégrateur préfère
d'autres numéros, les changer là, relancer `tools/build.py` puis `tools/verifier_smw.py`.

## 2. Points à confirmer au Debugger avant la mise en service

- Bar : « Le Loft » = signaux `Restaurant` (joins 30-32, analogique 6, Distribute 74, Off 93) et « Le Loft Fond » =
  `Lotti` (66-68, analogique 12) — déduit de l'ordre des joins, le fichier VT Pro binaire n'a pas pu être lu.
- Fitness : le programme lu est `Reserve prg005.smw` (2019) ; le compilé 2024 `Reserve Fitness prg05.lpz` n'a pas de
  source dans le dossier. Correspondances : Accueil Cardio = `Accueil`, Fonctional Zone = `Fitness`, Room CC =
  `Salle_TV`, Musculation = `Sport`. La zone `Reserve` du programme n'était pas sur le panneau : non reprise.
- Fitness n'a pas de retour « Busy » : le GUI affiche « Veuillez patienter » 4 s après Éteindre (`attenteLocaleMs`).
- Échelle des niveaux : le GUI affiche analogique / 65535 en %. Si les modules Bose ESP sortent une autre plage,
  régler `echelleAnalogique` dans le JSON.
- Processeur CP3 et iPad : vérifier que le firmware du CP3 accepte les projets CH5 et que les iPad utilisent
  l'app Crestron One ; les symboles gardent leurs IP-ID (Bar 04, Lodge 05 sur prg06 ; Fitness 04 sur prg005).

## 3. Produire et charger

    cd C:\dev\crestron\repo\projects\la-reserve-geneve\ch5
    npm install
    powershell -ExecutionPolicy Bypass -File .\deploy.ps1
    powershell -ExecutionPolicy Bypass -File .\deploy.ps1 -Espace bar -Target mobile -CP3Host <IP du CP3 Bar>

Un CH5 par panneau : `dist\reserve-bar.ch5z`, `reserve-fitness.ch5z`, `reserve-lodge.ch5z` (espace figé dans la
config embarquée). XPanel : `-Target web`, puis `https://<CP3>/reserve-bar/index.html` (IP-ID forcé par `?ipId=0x05`).
