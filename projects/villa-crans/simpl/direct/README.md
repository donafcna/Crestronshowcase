# Villa Crans v6.0 : un seul programme SIMPL, sans C#

Le GUI CH5 et `villa_config.json` sont les mêmes qu'en v5. Seul le processeur change : un programme SIMPL sur le slot 1 remplace le C# du slot 1 et le SIMPL du slot 2 reliés par EISC. La version C# est conservée sur la branche git `villa-crans-csharp-v5.5`.

## Choisir le mode

Le mode se règle dans `villa_config.json`, champ `meta.backend` :

- `"simpl"` : chaque écran émet et reçoit directement les joins de la pièce qu'il affiche. Le calcul est `625 + (id − 1) × 125 + offset`, soit les joins 626 à 2500 pour 15 pièces.
- `"csharp"`, ou champ absent : fonctionnement v5 (C# + EISC + slot 2), inchangé.

La traduction des joins est faite par `ch5/src/js/villa-joins.js`, au pont natif CH5. Le HTML garde ses joins historiques, et la table des offsets est dans `contrat.simplDirect.mapping`.

## Générer, compiler, charger

```
node projects/villa-crans/simpl/direct/generate_simpl.js     # après toute modification de villa_config.json
python3 projects/villa-crans/simpl/direct/verifier_smw.py    # contrôle structurel du .smw
python3 projects/villa-crans/simpl/direct/croiser_contrat.py # chaque join du GUI a son signal
```

1. Ouvrir `VillaCrans_Direct.smw` dans SIMPL Windows.
2. **Dalle 0x03 :** elle est déclarée en TSW-770, faute de modèle TSW-1070 dans les programmes de référence. Dans Configure, faire un clic droit sur la dalle, puis Replace Device → TSW-1070 : les signaux sont conservés.
3. Compiler avec F12. Les 16 modules SIMPL+ (`VillaPiece_Rnn.usp`, `VillaGlobal.usp`) sont compilés en même temps.
4. Charger avec `deploy.ps1 -Target simpl`. Le script copie le LPZ sur `/program01`, retire l'ancien `Villaftv.cpz`, arrête le slot 2 et lance `progload -p:01`.

## Contenu du programme

**Écrans (19)**, tous sur les mêmes signaux :

| IP-ID | Écran | Type |
|---|---|---|
| 0x03 | dalle | TSW |
| 0x04 | XPanel | XPanel 3.0 HTML5 |
| 0x05 | iPad | Crestron One, projet `villaftv` |
| 0x06 | iPhone | Crestron One, projet `villaftv` |
| 0x11 à 0x1F | XPanel QR, un par pièce | XPanel 3.0 HTML5 |

Un appui sur n'importe quel écran arrive sur `R07_Scene1`. Le retour `R07_Scene1_fb` s'affiche sur tous les écrans qui montrent la pièce 7.

**Module de pièce `VillaPiece_Rnn.usp` :**

- **Scènes 1-4 :** rappel des niveaux ; appui long = mémorisation en mémoire non volatile, avec les niveaux de la config par défaut. Si la config change, les scènes jamais mémorisées reprennent les nouveaux niveaux.
- **Circuits 1-20 :** écho vers les écrans et sortie `PILOTE_Circuitnn`.
- **Consigne :** ±0,5 °C, bornée par la config.
- **CVC :** marche / arrêt et ventilation en interlock, plus les textes température, mode et consigne.
- **Sauna / hammam.**
- **Moteurs et lamelles 1-12 :** appui maintenu, pour suivre le doigt.
- **Commandes groupées :** Volets / Rideaux / Stores selon le `type` de chaque moteur.
- **Scènes de stores.**
- **Audio/vidéo :** sources 0-4 en interlock, musique ou audio de la vidéo, mute, OFF, volumes.
- **Centralisation :** reçue du module global.

**Module global `VillaGlobal.usp` :**

- **Alarme :** le code part sur `PILOTE_ALARME_Code` et la centrale répond sur `RETOUR_ALARME_Code_Accepte` / `_Refuse`. Sans réponse dans le délai de la config, le programme compare au code local `contrat.alarme.codeParDefaut`.
- **Partitions :** 4 × armer / partiel / désarmer.
- **Centralisation 401-411 :** retours en interlock par famille, et fan-out vers les pièces.

**Joins laissés libres, à câbler par l'équipe :**

- dans chaque pièce, tous les `Rnn_PILOTE_*` (sorties) et `Rnn_RETOUR_*` (entrées facultatives : niveaux réels, température ×10, mesures sauna / hammam, texte de mode CVC) ;
- les télécommandes `TELECOMMANDE_*`, sur les joins globaux 211-220 et 500-600 ; la pièce émettrice arrive sur l'analogique 241 (`TELECOMMANDE_Piece`).

La table complète des joins et signaux est dans `SIGNAUX.md`.

## Ce que le C# faisait et que cette version ne fait pas

| Fonction | Dans la version SIMPL |
|---|---|
| Transport de la config vers les écrans (sériels 105-106) | Le GUI utilise la config embarquée dans le `.ch5z` et le Web XPanel : rebuild CH5 après chaque modification. |
| Presets globaux personnalisés (sériel 420) | Valeurs fixes : tout allumer 100 %, éco 50 %, confort 21 °C, nuit 18 °C, hors gel 12 °C, vacances. |
| Volume matériel de la dalle (a260 / d261) | Non repris. |
| Console `ipt` sur l'écran d'administration (s103) | Non repris. |
| Nom de pièce sur le sériel 10 | Non repris : le GUI prend les noms dans la config. |
| Presets « shade_ » limités aux moteurs 1-6 | Sans objet : la centralisation couvre les 12 moteurs. |

## Recette au Debugger (Toolbox)

1. **Dalle, pièce 7, scène 2 :** `R07_Scene2` passe à 1, puis `R07_Scene2_fb` = 1. `R07_Circuit01_fb`..`04_fb` prennent les niveaux de la scène et `R07_PILOTE_Scene2` pulse.
2. **Appui long sur scène 3 :** `R07_Scene3_Memoriser` pulse. `R07_Scene3_Memorisee_fb` = 1 (repère disquette sur le GUI) et il reste à 1 après un `progreset`.
3. **iPhone sur la pièce 2, même scène :** seuls les signaux `R02_*` bougent, et la dalle restée sur la pièce 7 ne change pas.
4. **Moteur 9 Monter :** `R07_Moteur09_Monter` passe à 1 tant que le doigt reste appuyé, `R07_PILOTE_Moteur09_Monter` suit. Commande groupée « Tout fermer » des stores : pulse sur les moteurs de type store (5, 6, 9, 12).
5. **Centralisation « Tout éteindre » :** `CENTRAL_Tout_Eteindre` pulse et tous les `Rnn_Circuitxx_fb` passent à 0.
6. **Alarme :** saisir 1234. `ALARME_Code_Saisi` = 1234 et `ALARME_Code_Valide` pulse après 1,2 s (repli local).
