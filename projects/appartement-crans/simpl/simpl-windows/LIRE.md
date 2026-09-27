# AppartementCrans_Slot2.smw — programme SIMPL Windows du slot 2

Généré par `node tools/generate_slot2.js` (depuis `projects/appartement-crans/`) à partir de `villa_config.json`
et du socle nu `_socle_cp4_eisc.smw` (CP4 + EISC « Packed » IP-ID F0 vers 127.0.0.2, 2732 joins par type,
copié depuis `projects/ftv-home`). Contrat de joins v4.1 du Core Villa Crans. **Ne pas éditer le .smw à la
main pour changer un nom : régénérer.** Jamais compilé ni testé sur matériel au 27.09.2026.

## Contenu

- 880 signaux nommés, 327 entrées et 553 sorties du symbole EISC (détail join par join dans
  `AppartementCrans_Slot2.signals.txt`).
- Globaux (< 1000) : identiques au Core (`Room_Select1..30`, alarme, scènes 51-54, stores groupés 61-69,
  moteurs 81-98, sources 150-156, télécommandes 211-600, presets 401-411, CVC 610-615 / a61, a10, a21, a31-33,
  a51/52, circuits a71-90, sériels s10/32/33/34/43). Wellness (620-627, a62/63) non câblé : `contrat.wellness.actif=false`.
- Blocs pièce `1000 + (id-1)*100` pour les 17 pièces : éclairage (4 scènes + circuits 1..n) partout,
  CVC (+31..34, +93..98) dans les 13 pièces `cvc.actif`.
- Sens : **sortie du symbole = ce que le slot 2 reçoit** (`X_fb`, `X_Cmd`, `Rxx_*_fb`) ;
  **entrée = ce que le slot 2 renvoie** (`Rxx_*_Actual`, `Rxx_HVAC_Setpoint#`, `Alarm_*`, `Global_Vacation_*`).

## Ouvrir et compiler

1. Ouvrir `AppartementCrans_Slot2.smw` dans SIMPL Windows (4.32 ou plus récent). Si SIMPL signale une
   incohérence de fichier, la corriger dans `tools/generate_slot2.js`, pas dans le .smw.
2. Vérifier le symbole *Ethernet Intersystem Communications (Packed)* : IP-ID F0, IP 127.0.0.2.
3. **Compile (F12)** → `AppartementCrans_Slot2.lpz`. Charger sur le **slot 2** du CP4 (Toolbox ou page web
   *Programs Slot Management*). L'EISC passe ONLINE dès que le programme du slot 1 tourne
   (`ipt -p:01`, entrée F0).
4. Contrôle structurel sans SIMPL : `node tools/check_slot2.js`.

Fins de ligne : le dépôt normalise en LF ; le générateur reprend celles du socle. SIMPL Windows relit
les deux ; en cas de doute, laisser Git convertir en CRLF au checkout Windows.

## Ce qui reste à câbler (aucun driver présent)

- **Lutron HomeWorks QS** (circuits et scènes) : modules Crestron HomeWorks QS (Ethernet, telnet) derrière
  `Rxx_Circuit_n_fb#` (niveau 0-65535 imposé par le C# vers la zone Lutron, noms de zones dans
  `pilotages.eclairages.circuits.lutron`) et `Rxx_Circuit_n_Actual#` (niveau réel remonté, il fait foi côté C#).
  Scènes : le C# impose déjà les niveaux ; `Rxx_Lighting_SceneN_Actual` seulement si un clavier Lutron doit
  imposer une scène au GUI. Circuits `type: contact` (cheminée, sèche-serviettes) : relais ou sortie tout ou rien.
- **Rideaux / voilages / stores** (18 moteurs réels, `pilotages.moteurs.actif=true`) : `Motor_n_Up/Stop/Down_fb`
  sont globaux, routés par `Room_Selected#` (a10, posé par le C# avant l'impulsion) — Buffer par pièce validé par
  un comparateur `Room_Selected# = id` (ou `Room_SelectN_fb`), puis drivers Lutron (QS shades) ou Somfy selon le matériel.
- **Drivers B&O** (sources A/V) : `Source_Select_n_fb`, `Remote_*` et `Source_Active#` / a10 vers les modules
  B&O (IP ou IR) des 8 pièces `audioVideo.actif`.
- **CVC** : thermostats derrière `Rxx_HVAC_Setpoint_fb#` (x10), `Rxx_HVAC_On/Off/Fan_*_fb` ; remonter
  `Rxx_HVAC_Temperature#` (x10), `Rxx_HVAC_On_Actual`, `Rxx_HVAC_FanSpeed_Actual#`, `Rxx_HVAC_Setpoint#`.
- **Alarme** : `Alarm_Code$` → centrale → `Alarm_Code_OK/KO` ; partitions 301-312.
- Les sous-systèmes de bufferisation par pièce ne sont pas générés (contrairement à FTV Home) : à poser dans
  SIMPL Windows, symbole Buffer / Analog Buffer, enable = comparateur sur `Room_Selected#` (a10).
