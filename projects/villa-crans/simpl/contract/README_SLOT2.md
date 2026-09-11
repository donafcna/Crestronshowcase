# VillaCrans_Slot2.smw — programme SIMPL du slot 2

Généré par `generate_slot2.js` à partir de la base `VillaCrans.smw` (créée dans SIMPL
Windows). La base n'est **jamais modifiée** ; relancer `node generate_slot2.js`
régénère le fichier de sortie (fermer `VillaCrans_Slot2.smw` dans SIMPL avant).

## Contenu

- CP4 + **EISC "Packed" IP-ID F0 → 127.0.0.2** (⚠️ la base contenait un typo
  `172.0.0.2`, corrigé ici — pensez à le corriger aussi dans `VillaCrans.smw`).
- **181 signaux nommés** câblés sur l'EISC selon le contrat v2 de `villa_config.json` :

| Famille | Joins | Signaux |
|---|---|---|
| Sélection pièces 1..30 | d11-40 | `Room_Select1..30` (+`_fb`) |
| Alarme | d41/42 | `Alarm_Arm` / `Alarm_Disarm` (+`_fb`) |
| Consigne CVC ± | d49/50 | `HVAC_Setpoint_Up` / `_Down` |
| Scènes éclairage 1..4 | d51-54 | `Lighting_Scene1..4` (+`_fb`) |
| Mute | d55 | `Audio_Mute` (+`_fb`) |
| Stores groupés | d61-69 | `Shades_Volets/Rideaux/Stores_Up/Stop/Down` |
| Moteurs 1..6 | d81-98 | `Motor_n_Up/Stop/Down` (+`_fb` = écho des appuis dalle) |
| Sources A/V 0..5 | d150-155 | `Source_Select_0..5` (+`_fb`) |
| Scènes stores 1..4 | d201-204 | `Shades_Scene_1..4` (+`_fb`) |
| Pièce active | a10 | `Room_Select#` (cmd) / `Room_Selected#` (fb) |
| Master éclairage / consigne | a21 / a31 | `Lighting_Master` / `HVAC_Setpoint` (+`_fb`) |
| Source / volume | a51 / a52 | `Source_Active#` / `Audio_Volume#` (+`_fb#`) |
| Circuits 1..10 | a71-80 | `Circuit_n#` (+`_fb#`) |
| Nom pièce / temp / mode / consigne | s10/s32/s33/s34 | `Room_Selected$`, `HVAC_Temperature_fb$`, `HVAC_Mode_fb$`, `HVAC_Setpoint_fb$` |

Convention : sans suffixe = digital, `#` = analogique, `$` = série, `_fb` = retour d'état
(sortie EISC, envoyé par le slot 1).

## Mise en service

1. Ouvrir `VillaCrans_Slot2.smw` dans SIMPL Windows, **Compile (F12)** → `VillaCrans_Slot2.lpz`.
2. Charger le `.lpz` sur le **slot 2** du CP4 (Toolbox, ou copie dans `/program02/` + console `progload -p:02`).
3. L'EISC passe ONLINE dans `ipt -p:01` (entrée F0) dès que les deux programmes tournent.
4. Câbler votre logique SIMPL sur les signaux nommés.

## Limites actuelles (dimensions du symbole EISC : 232 digitaux / 233 analog-série)

- Les **blocs pièces** (joins 1000+) ne tiennent pas dans ce dimensionnement. Pour les
  utiliser côté SIMPL : agrandir le symbole EISC dans SIMPL Windows (clic droit sur le
  symbole → nombre de joins, p.ex. 2500/2500), SIMPL ré-indexe tout seul, puis recâbler.
  Alternative simple : piloter via les joins globaux (la pièce active) comme câblé ici.
- Sorties série limitées aux joins ≤ ~52 : les infos système (IP-ID s99, CPZ s101/102)
  ne sont pas câblées — même remède si besoin.
