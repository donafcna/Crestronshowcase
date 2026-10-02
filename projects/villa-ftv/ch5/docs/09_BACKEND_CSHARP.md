# 09 — Le programme C# de la Villa Crans-Montana, expliqué simplement

Version décrite : assembly **1.0.180** (`Backend/Backend/ControlSystem.cs`, 2 275 lignes, plus `HvacState.cs` et `WellnessState.cs`), config `villa_config.json` 1.0.181. Rédigé le 17.09.2026. Ce document décrit le code tel qu'il est : rien n'a été modifié.

**Pour qui ?** Un programmeur Crestron à l'aise avec SIMPL Windows, qui n'a jamais fait de C#. Il n'est pas nécessaire de lire le code pour comprendre ce document. Les numéros de lignes permettent de retrouver chaque passage dans Visual Studio (Ctrl+G).

## 1. Le rôle du C# en une minute

Le processeur CP4 fait tourner **deux programmes en même temps** :

| Slot | Langage | Rôle | Qui y touche |
|---|---|---|---|
| **Slot 1** | C# (SIMPL# Pro) | Parle aux écrans CH5 (dalle TSW, XPanel, iPad, iPhone), lit `villa_config.json`, calcule les retours d'état de l'interface, relaie tout vers le slot 2 | Personne sur un projet client (maintenu par l'IA) |
| **Slot 2** | SIMPL Windows | Pilote le vrai matériel du client (éclairage, stores, AV, CVC, alarme) | Le programmeur Crestron |

Le C# est un **standard téléphonique** : il reçoit les appuis des écrans, sait dans quelle pièce se trouve chaque écran, transmet l'ordre au SIMPL par un **EISC** et renvoie aux écrans les états que le SIMPL lui retourne.

```
  Dalle TSW / XPanel / iPad / iPhone  (GUI CH5)
            |  appuis (digitaux, analogiques, sériels)
            v
  +-----------------------------------------------+
  |  SLOT 1 — C#  (ControlSystem.cs)              |
  |  - lit /user/villa_config.json au démarrage   |
  |  - envoie la config aux écrans par morceaux   |
  |  - sait quelle pièce chaque écran affiche     |
  |  - route les commandes vers la pièce active   |
  |  - calcule et renvoie les retours d'état      |
  +-----------------------------------------------+
            |  EISC  IP-ID 0xF0  @ 127.0.0.2
            v
  +-----------------------------------------------+
  |  SLOT 2 — SIMPL Windows                       |
  |  lit Room_Select# (analogique 10) + la commande|
  |  pilote le matériel, renvoie les états        |
  +-----------------------------------------------+
```

## 2. Petit glossaire C# ↔ SIMPL

| Mot C# | Ce que c'est | Équivalent SIMPL le plus proche |
|---|---|---|
| **Classe** | Un plan qui regroupe des données et des actions | Un module (`.umc`) avec ses signaux et sa logique |
| **Objet / instance** | Un exemplaire concret créé à partir de la classe | Un module posé dans le programme |
| **Champ** (`_nom`) | Une variable qui garde une valeur tant que le programme tourne | Un signal mémorisé, un buffer |
| **Méthode** | Un bloc d'instructions qu'on appelle par son nom | Un sous-programme, une macro |
| **Événement / gestionnaire** | Du code déclenché automatiquement quand quelque chose arrive | Un front montant qui déclenche une logique |
| **Dictionnaire** | Une table clé → valeur (ex. écran → pièce affichée) | Une table de correspondance, un `Analog Initialize` indexé |
| **`switch` / `case`** | Un aiguillage selon une valeur | Un `Equate` / `Analog Equate` |
| **`try` / `catch`** | « Essaie ceci ; si ça plante, fais cela » | Pas d'équivalent direct (SIMPL ne plante pas, il ignore) |
| **`lock`** | Empêche deux fils d'exécution de modifier la même donnée en même temps | — |
| **`CTimer`** | Minuterie qui rappelle une méthode après un délai | `Delay`, `Oneshot` |
| **`BasicTriList`** | Un appareil qui a des joins digitaux, analogiques et sériels (écran ou EISC) | Un symbole de panneau ou d'EISC |
| **`BooleanInput[n]` / `UShortInput[n]` / `StringInput[n]`** | Écrire une valeur sur le join n *vers* l'appareil (feedback) | Entrées d'un symbole de panneau |
| **`BooleanOutput[n]`…** | Lire ce que l'appareil envoie sur le join n (appui) | Sorties d'un symbole de panneau |
| **JSON** | Fichier texte structuré (`villa_config.json`) | Aucun ; remplace des dizaines de paramètres codés en dur |
| **Progreset** | Redémarrage du programme d'un slot | Idem |

## 3. Carte du fichier `ControlSystem.cs`

| Lignes | Zone | Partie du document |
|---|---|---|
| 1–293 | Classe `RoomState` (état d'une pièce), champs, traces, volume TSW | A |
| 294–657 | Démarrage, lecture de la config, envoi aux écrans | B |
| 658–1069 | Pont EISC, arrivée des écrans, base des pièces, scènes d'éclairage | C |
| 1070–1419 | Blocs de joins par pièce, retours d'état, code d'alarme | D |
| 1420–1852 | Aiguillage de tous les appuis (le cœur) | E |
| 1853–2275 | État d'écran, audio, diagnostic console, presets | F |

Fichiers annexes : `HvacState.cs` (état CVC d'une pièce), `WellnessState.cs` (sauna / hammam), `Properties/AssemblyInfo.cs` (numéro de version), `Villaftv.csproj` (projet Visual Studio). Tous sont décrits en partie A.

## 4. Ce qu'il faut retenir avant de lire le détail

1. **Tout part de `villa_config.json`.** Pièces, noms, sources, scènes, joins globaux recopiés vers SIMPL, code d'alarme de secours, adresse de l'EISC : le C# les lit au démarrage (partie B). Pour changer un projet, on modifie ce fichier, puis un progreset. On ne recompile pas.
2. **Contrat v4 : les mêmes joins dans toutes les pièces.** Un écran envoie « source 2 », « scène 3 »… sans numéro de pièce. Le C# ajoute la pièce que l'écran affiche et la place sur l'**analogique 10 de l'EISC** (`Room_Select#`). Le SIMPL lit ce numéro pour savoir où agir (parties C et E).
3. **Les retours d'état sont calculés par le C#.** Il mémorise l'état de chaque pièce (`RoomState`) et le repousse aux écrans qui affichent cette pièce (parties D et F).
4. **Le SIMPL reste maître du matériel.** Le C# ne pilote directement aucun appareil. Les méthodes « audio » et « TV Sony » ne font qu'écrire une trace (partie F).
5. **Traces console** : `meta.tracesConsole = true` dans le JSON affiche toutes les actions dans la console du slot 1, sans recompiler.

## 5. Modifier le code sans rien casser

- **D'abord le JSON.** La plupart des besoins d'un projet (pièces, noms, pilotages actifs, scènes) se règlent dans `villa_config.json`, sans toucher au C#.
- **Un nouveau join global à recopier vers SIMPL** : l'ajouter à la liste blanche `contrat.signauxGlobaux` du JSON (lue par `BuildGlobalMirrorWhitelist`, partie B), pas dans le code.
- **Si le C# doit vraiment changer** : modifier aussi le contrat `docs/03_CONTRAT_JOINS.md`, la section `contrat` du JSON et le générateur `simpl/contract/generate_slot2.js`. Tous les quatre doivent rester alignés.
- **Recompiler** : Visual Studio → `Villaftv.cpz` → `deploy.ps1 -Target cp4`. Incrémenter `AssemblyInfo.cs` et le CHANGELOG.
- **Vérifier** dans le Debugger SIMPL que `Room_Select#` et la commande arrivent ensemble, puis sur deux écrans affichant deux pièces différentes.

## 6. Points à vérifier en priorité (synthèse)

Chaque partie se termine par sa liste complète. Voici les plus importants, par gravité :

| # | Où | Constat | Pourquoi c'est important |
|---|---|---|---|
| 1 | l. 1466 | Le sériel 103 exécute **n'importe quelle commande console** envoyée par un écran | Sécurité : depuis un écran, on peut envoyer des commandes d'administration (redémarrage, progreset…). À désactiver ou filtrer chez le client |
| 2 | JSON `contrat.alarme.codeParDefaut` | Code d'alarme de secours `"1234"` quand le slot 2 ne répond pas | Sécurité : à changer sur site |
| 3 | l. 1410–1417 | Un verdict d'alarme reçu sans saisie en attente est envoyé à **tous** les écrans | Tous les écrans peuvent changer de page |
| 4 | l. 640–653 | Si un accusé de réception de la config (analogique 250) se perd, l'envoi reste bloqué | Aucune minuterie de relance : il faut une nouvelle demande de l'écran (digital 250) |
| 5 | l. 759 / 1115 | L'appui recopié vers SIMPL et le feedback calculé partagent le même join EISC | Le relâchement peut effacer le feedback vu par le SIMPL. À valider au Debugger |
| 6 | l. 754 / 1865 | L'analogique 10 de l'EISC est écrit à deux endroits (pièce de l'écran qui agit / pièce mémorisée pour l'EISC) | Le SIMPL pourrait lire une autre pièce que celle de l'appui |
| 7 | l. 1624–1799 | Aucun traitement C# des télécommandes (211–220, 500–600) | Seul le SIMPL les reçoit, par le miroir, alors que le contrat dit « à router côté C# » |
| 8 | l. 1969 | Libellés de sources du C# (Apple TV, Sky Q…) différents du JSON (IPTV, Humax…) | Traces trompeuses au dépannage |
| 9 | l. 1751 / 1251 | Hors-gel à 12,0 °C, mais « consigne − » remonte à 16,0 °C minimum | Comportement surprenant pour le client |
| 10 | divers | Commentaires v2/v3 périmés, `catch {}` vides, coquille « Terrasse extrieure » | Maintenance plus difficile |

---

## Partie A — Fondations : états, champs et outils de base

Cette partie couvre le début de `ControlSystem.cs` (lignes 1 à 293) et quatre petits fichiers du même dossier `Backend/Backend` : `HvacState.cs`, `WellnessState.cs`, `Properties/AssemblyInfo.cs` et `Villaftv.csproj`.

Petit lexique de départ, utile pour toute la suite :

- **Classe** : un « modèle » qui regroupe des données et des traitements. C'est proche d'un module SIMPL : on le définit une fois, puis on en crée autant d'exemplaires qu'il faut (un par pièce, par exemple). Un exemplaire s'appelle un **objet** ou une **instance**.
- **Champ** : une variable qui appartient à un objet. Équivalent le plus proche : un signal interne ou une variable de module qui garde sa valeur tant que le programme tourne.
- **Propriété** (`{ get; set; }`) : un champ « habillé ». `get` = lecture, `set` = écriture. `private set` = seul l'objet lui-même peut écrire, les autres ne font que lire.
- **Méthode** : un bloc de traitement qu'on appelle par son nom, avec des paramètres. Proche d'une fonction SIMPL+ ou d'un sous-programme.
- **Constructeur** : la méthode qui porte le nom de la classe. Elle s'exécute une seule fois, à la création de l'objet, pour poser les valeurs de départ (comme les valeurs initiales d'un module au démarrage).
- **Types** : `bool` = digital (vrai/faux) ; `ushort` = entier 0 à 65535, comme un analogique ; `string` = texte, comme un sériel ; `int` / `uint` = entiers plus grands (signé / non signé) ; `ushort[]` = tableau de valeurs, comme une liste de signaux indexés.
- **`private` / `public`** : `private` = utilisable seulement à l'intérieur de la classe ; `public` = visible depuis les autres classes.
- **`const`** : valeur fixe écrite dans le code, qui ne change jamais. L'équivalent d'une constante ou d'un paramètre figé.
- **Join** : même sens qu'en SIMPL. Dans le C#, `BooleanInput[join]` = digital envoyé vers un panel, `UShortInput[join]` = analogique, `StringInput[join]` = sériel. Attention : « Input » est vu **du côté du panel** (ce que le panel reçoit), donc c'est une sortie du programme.

---

### Directives `using` (lignes 1–8)

**À quoi ça sert.** Déclarer les bibliothèques utilisées, pour pouvoir écrire les noms courts des classes. C'est comparable aux bibliothèques de symboles chargées dans un programme SIMPL.

**Comment ça marche.**
1. `System` et `System.Collections.Generic` : outils de base de .NET (listes, dictionnaires, maths).
2. `Crestron.SimplSharp` et `Crestron.SimplSharpPro` : cœur du SDK Crestron (console, timers, classe de programme).
3. `Crestron.SimplSharpPro.UI` : les classes de panels (dalle TSW, XPanel, application Crestron).
4. `Crestron.SimplSharpPro.CrestronThread` : gestion des tâches parallèles (utilisé ligne 296).
5. `Crestron.SimplSharpPro.DeviceSupport` : la classe générique `BasicTriList` (tout équipement à joins).
6. `Crestron.SimplSharpPro.EthernetCommunication` : l'EISC vers le slot 2.

**Attention.** Le commentaire de la ligne 5 parle de `XpanelForSmartGraphics`, mais le code crée en réalité des `XpanelForHtml5` (lignes 401 et 412).

### Espace de noms `VillaFrequenceTvAutomation` (ligne 10)

**À quoi ça sert.** Un **namespace** est un « dossier logique » qui range les classes sous un nom commun, pour éviter les conflits de noms. Les trois fichiers `.cs` du projet partagent ce même nom, donc leurs classes se voient entre elles.

---

### Classe RoomState (lignes 12–50)

**À quoi ça sert.** Mémoriser l'état complet d'une pièce : scène, températures, source vidéo, volumes, circuits, stores, partitions, HVAC et bien-être. Il y a un objet `RoomState` par pièce. C'est l'équivalent d'un jeu de mémoires (analog/digital/serial) par pièce dans un programme SIMPL.

**Comment ça marche.** Chaque ligne `public ... { get; set; }` est une propriété lisible et modifiable par `ControlSystem`.

| Propriété | Type expliqué simplement | Rôle |
|---|---|---|
| `Hvac` (l. 14) | objet `HvacState` (lecture seule de l'extérieur) | Marche/arrêt et ventilation de la pièce |
| `Wellness` (l. 15) | objet `WellnessState` (lecture seule de l'extérieur) | Sauna et hammam de la pièce |
| `RoomId` (l. 16) | entier | Numéro de la pièce (1, 2, 3…) |
| `RoomName` (l. 17) | texte | Nom de la pièce |
| `ActiveScene` (l. 18) | analogique 0–65535 | Scène d'éclairage active, 1 à 4 |
| `LightLevel1` (l. 19) | analogique | Niveau d'éclairage « maître » |
| `TargetTemperature` (l. 20) | analogique | Consigne en dixièmes de degré (210 = 21,0 °C) |
| `CurrentTemperature` (l. 21) | analogique | Température mesurée en dixièmes de degré |
| `ActiveVideoSource` (l. 22) | analogique | 0 = éteint, 1 à 4 = source vidéo (une seule à la fois, comme un interlock) |
| `MusicAudio` (l. 23) | digital | Vrai = la musique joue sur les haut-parleurs, la vidéo reste à l'écran |
| `AudioVolume` (l. 24) | analogique | Volume A/V de la pièce |
| `MediaVolume` (l. 25) | analogique | Volume propre au lecteur média (join logique 254, bloc pièce +54) |
| `IsAudioMuted` (l. 26) | digital | Mute audio de la pièce |
| `CircuitLevels` (l. 27) | tableau d'analogiques | Niveau de chaque circuit d'éclairage |
| `ActiveStoreScene` (l. 28) | analogique | Scène de stores active, codée 201 à 204 |
| `PartitionStates` (l. 29) | tableau d'analogiques | État des partitions d'alarme de la pièce |

### Constructeur RoomState(int id, string name) (lignes 31–49)

**À quoi ça sert.** Donner des valeurs de départ à une pièce neuve, au démarrage du programme.

**Comment ça marche.**
1. Crée un objet HVAC et un objet bien-être vides (lignes 33–34). Le mot `new` veut dire « fabrique un nouvel exemplaire ».
2. Range le numéro et le nom reçus (lignes 35–36).
3. Pose les valeurs par défaut : scène 1, éclairage maître 0, consigne 21,0 °C, température 22,4 °C, vidéo éteinte, musique désactivée, volumes à 25000, pas de mute (lignes 37–45).
4. Crée 10 circuits à 32768, soit environ 50 % (ligne 46).
5. Scène de stores 204 et 4 partitions à 0 (lignes 47–48).

```csharp
CircuitLevels = new ushort[10] { 32768, 32768, /* ... */ 32768 };
```

**Attention.** Ces valeurs sont des valeurs de démarrage, pas des mesures. La température 22,4 °C (ligne 40) reste affichée tant que le slot 2 n'a pas envoyé la vraie mesure (bloc pièce +32, traité ligne 1304).

---

### Classe HvacState (HvacState.cs, lignes 1–30)

**À quoi ça sert.** Mémoriser l'état HVAC d'une pièce : marche/arrêt et vitesse de ventilation. La classe ne dépend d'aucune bibliothèque Crestron (commentaire ligne 3), elle ne fait que de la logique.

**Comment ça marche.** Le mot `sealed` (ligne 4) veut dire qu'on ne peut pas créer de variante de cette classe. Deux propriétés :

| Propriété | Type expliqué simplement | Rôle |
|---|---|---|
| `Enabled` (l. 6) | digital | Vrai = HVAC en marche |
| `Fan` (l. 7) | analogique, écriture réservée à la classe | 0 = Auto, 1, 2, 3 = vitesses |

**Joins concernés.** Les méthodes travaillent sur des **offsets** du bloc pièce (numéro du join moins la base du bloc) : +93 à +98. Le contrat v4 (HVAC, 16/09/2026) les associe aussi aux joins globaux digitaux 610–615 et à l'analogique 61 (utilisés ligne 1900–1901, hors de cette partie).

### HvacState() — constructeur (ligne 8)

**À quoi ça sert.** Démarrer chaque pièce avec le HVAC en marche (`Enabled = true`). `Fan` vaut 0 (Auto), valeur par défaut d'un entier en C#.

### SetFan(ushort value) (lignes 9–14)

**À quoi ça sert.** Changer la ventilation en refusant toute valeur hors plage.

**Comment ça marche.**
1. Si la valeur dépasse 3, la méthode renvoie `false` (refus) et ne change rien.
2. Sinon, elle range la valeur dans `Fan` et renvoie `true`.

Le type de retour `bool` sert de compte rendu : l'appelant sait si l'ordre a été accepté.

### Apply(uint offset) (lignes 15–22)

**À quoi ça sert.** Traiter un appui sur un bouton HVAC du bloc pièce.

**Comment ça marche.**
1. Offset 93 : HVAC en marche.
2. Offset 94 : HVAC à l'arrêt.
3. Offsets 95 à 98 : ventilation = offset − 95 (95 = Auto, 96 = 1, 97 = 2, 98 = 3).
4. Tout autre offset : renvoie `false`, ce qui veut dire « ce n'est pas un join HVAC ». `ControlSystem` passe alors au traitement suivant (ligne 1281).

```csharp
else if (offset >= 95 && offset <= 98) SetFan((ushort)(offset - 95));
```

`(ushort)` est une **conversion** : on force la valeur dans le type analogique.

### Selected(uint offset) (lignes 23–28)

**À quoi ça sert.** Donner le feedback d'un bouton HVAC : allumé ou non. C'est le rôle d'un feedback d'interlock en SIMPL.

**Comment ça marche.**
1. Offset 93 : allumé si le HVAC est en marche.
2. Offset 94 : allumé si le HVAC est à l'arrêt.
3. Offsets 95 à 98 : allumé seulement pour la vitesse active. Tout le reste renvoie `false`.

---

### Classe WellnessState (WellnessState.cs, lignes 1–54)

**À quoi ça sert.** Mémoriser l'état du sauna et du hammam d'une pièce. Tout est à l'arrêt au départ, et les valeurs mesurées sont « inconnues » tant que le pilote n'a rien renvoyé (commentaire ligne 3).

**Comment ça marche.** Propriétés et champs :

| Membre | Type expliqué simplement | Rôle |
|---|---|---|
| `Available` (l. 6) | digital | Vrai si la pièce possède sauna et hammam (posé ligne 1009 depuis `villa_config.json`) |
| `SaunaOn` (l. 7) | digital | Sauna en marche |
| `HammamOn` (l. 8) | digital | Hammam en marche |
| `SaunaTarget` (l. 9) | analogique, dixièmes de degré | Consigne sauna (800 = 80,0 °C) |
| `HumidityTarget` (l. 10) | analogique, % | Consigne d'humidité hammam |
| `SaunaActual` (l. 11) | analogique, dixièmes de degré | Température mesurée du sauna |
| `HumidityActual` (l. 12) | analogique, % | Humidité mesurée du hammam |
| `HasSaunaActual` (l. 13) | digital | Vrai dès qu'une mesure sauna est arrivée |
| `HasHumidityActual` (l. 14) | digital | Vrai dès qu'une mesure d'humidité est arrivée |
| `SaunaMin`, `SaunaMax`, `HumidityMin`, `HumidityMax` (l. 15) | analogiques, modifiables | Bornes : 600–1000 (60,0–100,0 °C) et 90–100 %. Remplacées ligne 1010–1011 par les valeurs de la config |

**Joins concernés.** Offsets du bloc pièce : digitaux +11 à +18, analogiques +34 à +37, sériels +44 à +47 (le texte est envoyé à offset + 10, ligne 1141). Le contrat (extension wellness v4 du 17/09/2026) cite aussi les globaux digitaux 620–627 et analogiques/sériels 62–65.

### WellnessState() — constructeur (ligne 16)

**À quoi ça sert.** Poser les consignes de départ : 80,0 °C pour le sauna et 95 % pour le hammam. Tout le reste est à 0 ou `false`.

### Apply(uint offset) (lignes 17–29)

**À quoi ça sert.** Traiter un appui sur un bouton sauna/hammam.

**Comment ça marche.**
1. Si la pièce n'a pas de bien-être, ou si l'offset n'est pas entre 11 et 18 : renvoie `false`.
2. 11 = sauna marche, 12 = sauna arrêt.
3. 13 = consigne sauna +1,0 °C (+10), 14 = −1,0 °C, bornée par `SaunaMin`/`SaunaMax`.
4. 15 = hammam marche, 16 = hammam arrêt.
5. 17 = humidité +1 %, 18 = −1 %, bornée par `HumidityMin`/`HumidityMax`.
6. Renvoie `true`.

```csharp
if (offset == 13) SetValue(34, (ushort)System.Math.Min(SaunaMax, SaunaTarget + 10));
```

`Math.Min` garde la plus petite des deux valeurs : c'est un plafond, comme un limiteur analogique.

### SetValue(uint offset, ushort value) (lignes 30–39)

**À quoi ça sert.** Écrire une valeur analogique en vérifiant sa plage.

**Comment ça marche.**
1. Refus si la pièce n'a pas de bien-être.
2. Offset 34 : consigne sauna, acceptée seulement entre `SaunaMin` et `SaunaMax`.
3. Offset 35 : consigne humidité, acceptée entre `HumidityMin` et `HumidityMax`.
4. Offset 36 : mesure sauna, acceptée jusqu'à 1500 (150,0 °C) ; marque la mesure comme connue.
5. Offset 37 : mesure humidité, acceptée jusqu'à 100 ; marque la mesure comme connue.
6. Sinon : renvoie `false`.

**Attention.** Côté `ControlSystem`, les mesures (36, 37) ne sont acceptées que si elles viennent de l'EISC (ligne 1305).

### Selected(uint offset) (lignes 40–43)

**À quoi ça sert.** Feedback des boutons marche/arrêt : 11 = sauna en marche, 12 = sauna à l'arrêt, 15 = hammam en marche, 16 = hammam à l'arrêt. Tout autre offset renvoie `false`.

**Comment ça marche.** La ligne utilise l'opérateur `? :` (« si… alors… sinon… ») enchaîné, qui remplace une suite de tests.

### Value(uint offset) (lignes 44–47)

**À quoi ça sert.** Lire la valeur analogique d'un offset : 34 = consigne sauna, 35 = consigne humidité, 36 = mesure sauna, autre = mesure humidité.

**Attention.** Tout offset inconnu renvoie l'humidité mesurée, sans erreur (voir Points à vérifier).

### Text(uint offset) (lignes 48–52)

**À quoi ça sert.** Produire le texte affiché dans le GUI (sériel).

**Comment ça marche.**
1. Renvoie `"--"` si la pièce n'a pas de bien-être, ou si la mesure demandée (36 ou 37) n'est pas encore arrivée.
2. Pour 34 et 36 (températures) : divise par 10 et écrit un chiffre après la virgule, avec un point décimal (`InvariantCulture` = format indépendant de la langue du processeur). Exemple : 800 devient `"80.0"`.
3. Pour 35 et 37 (humidité) : écrit l'entier tel quel.

---

### Classe ControlSystem (lignes 52 et suivantes)

**À quoi ça sert.** C'est le programme principal du slot 1, l'équivalent du programme SIMPL entier. Crestron exige une classe qui **hérite** de `CrestronControlSystem` : « hériter » veut dire reprendre tout ce que fait la classe Crestron de base (démarrage, gestion des équipements) et y ajouter son propre code.

```csharp
public class ControlSystem : CrestronControlSystem
```

Rappel des deux « conteneurs » utilisés partout :
- **List** (`List<T>`) : une liste ordonnée d'éléments du même type, qu'on peut parcourir. Proche d'une liste d'équipements dans l'arbre SIMPL.
- **Dictionary** (`Dictionary<clé, valeur>`) : une table de correspondance. On donne une clé (ex. un IP-ID) et on obtient une valeur (ex. un numéro de pièce). Proche d'une table de recherche. `ContainsKey(clé)` vérifie qu'une entrée existe avant de la lire, sinon le programme lève une erreur.

### Champs généraux de ControlSystem (lignes 54–62)

| Champ | Type expliqué simplement | Rôle |
|---|---|---|
| `_touchPanels` (l. 55) | liste d'équipements à joins | Tous les panels enregistrés (TSW 0x03, XPanel 0x04, iPad 0x05, iPhone 0x06, XPanels QR) **et l'EISC** vers le slot 2 (ajouté ligne 684 via `RegisterUserInterface`) |
| `_roomsRegistry` (l. 56) | dictionnaire numéro de pièce → `RoomState` | Le registre de toutes les pièces |
| `_activeRoomPerDevice` (l. 57) | dictionnaire IP-ID → numéro de pièce | Pièce affichée par chaque panel |
| `_globalAlarmArmedState` (l. 58) | digital | Alarme de la villa armée ou non (feedback 41/42, ligne 1950–1951) |
| `_vacationModeActive` (l. 59) | digital | Mode vacances actif (feedback 410/411, ligne 1930–1931) |
| `_cpzFileName` (l. 60) | texte | Nom du programme affiché dans le GUI (sériel 101, ligne 1872). Valeur de repli `"villaftv.cpz"` |
| `_cpzCompileDate` (l. 61) | texte | Date du fichier programme (sériel 102). Repli `"Inconnue"` |
| `_validationDates` (l. 62) | dictionnaire IP-ID → texte | Date de validation mémorisée par panel (sériel 104, ligne 1875) |

Le caractère `_` en tête de nom est une simple convention : il signale un champ privé.

### Champs de configuration villa_config.json (lignes 64–74)

**À quoi ça sert.** Charger `villa_config.json` et l'envoyer aux panels morceau par morceau (le traitement lui-même est dans une autre partie).

| Champ | Type expliqué simplement | Rôle |
|---|---|---|
| `VillaConfigPath` (l. 65) | texte constant | Chemin du fichier sur le CP4 : `/user/villa_config.json` |
| `ConfigChunkSize` (l. 67) | entier constant | 180 caractères par morceau (les sériels natifs des dalles tronquent vers 255 octets, selon le commentaire l. 66) |
| `ConfigSerialJoin` (l. 68) | constante | Sériel 105 : transport du JSON vers le CH5 |
| `ConfigHashJoin` (l. 69) | constante | Sériel 106 : empreinte de la config ; le panel ne demande le transfert que si elle a changé |
| `ConfigSyncJoin` (l. 70) | constante | Join 250 : digital = demande de config, analogique = accusé de réception d'un morceau |
| `_configHash` (l. 71) | texte | Empreinte calculée de la config |
| `_villaConfig` (l. 72) | objet JSON | Le fichier de config décodé en mémoire (bibliothèque Newtonsoft) ; `null` = rien de chargé |
| `_configChunks` (l. 73) | liste de textes | Les morceaux prêts à envoyer |
| `_configChunkCursor` (l. 74) | dictionnaire IP-ID → entier | Numéro du prochain morceau à envoyer à chaque panel |

### Champ _tracesConsole (ligne 81)

**À quoi ça sert.** Activer ou couper les traces détaillées. Il est lu dans `meta.tracesConsole` de `villa_config.json` (ligne 464) ; la config livrée contient `false`.

**Comment ça marche.** Les messages d'exploitation (démarrage, config, EISC, arrivée d'un équipement, erreurs) passent directement par `CrestronConsole.PrintLine` et s'affichent toujours. Tout ce qui suit une action utilisateur passe par `Trace()`, donc n'apparaît que si le drapeau est vrai. La description dans la config précise qu'un progreset suffit après changement, sans recompiler.

### Trace(string message) (lignes 83–86) et Trace(string format, params object[] args) (lignes 88–91)

**À quoi ça sert.** Écrire une ligne en console seulement si `_tracesConsole` est vrai.

**Comment ça marche.**
1. Test du drapeau.
2. Si vrai, écriture en console.

Il y a deux méthodes du même nom : c'est une **surcharge**. C# choisit la bonne selon les paramètres donnés. La deuxième accepte un modèle de texte avec des trous `{0}`, `{1}` remplis par les valeurs suivantes (comme `MAKESTRING` en SIMPL+). `params object[]` veut dire « autant de valeurs qu'on veut, de n'importe quel type ».

```csharp
Trace("TOOLBAR: sig {0} = {1}", args.Sig.Number, args.Sig.BoolValue);
```

### Champ _forcePush (ligne 100)

**À quoi ça sert.** Obliger `SetBool`, `SetUShort` et `SetString` à écrire même quand la valeur n'a pas changé.

**Comment ça marche.** Par défaut il est faux : on n'écrit un join que s'il change. Il passe à vrai le temps d'un rafraîchissement complet quand un panel se connecte (lignes 824–834), sinon un panel qui revient ne recevrait rien.

**Attention.** Le commentaire (lignes 94–97) explique la raison : réécrire la même valeur crée un front sur le lien CIP. Sur un bloc pièce, où le même join sert dans les deux sens, le slot 2 lisait ce front comme un appui et relançait une scène d'éclairage.

### SetBool(BasicTriList dev, uint join, bool value) (lignes 102–106)

**À quoi ça sert.** Envoyer un digital à un équipement, seulement s'il change.

**Comment ça marche.**
1. Lit la valeur actuellement envoyée sur ce join.
2. Si elle est différente, ou si `_forcePush` est vrai, écrit la nouvelle valeur.

```csharp
if (_forcePush || dev.BooleanInput[join].BoolValue != value)
    dev.BooleanInput[join].BoolValue = value;
```

`||` = OU logique ; `!=` = différent de.

### SetUShort(BasicTriList dev, uint join, ushort value) (lignes 108–112)

**À quoi ça sert.** Même principe pour un analogique.

### SetString(BasicTriList dev, uint join, string value) (lignes 114–119)

**À quoi ça sert.** Même principe pour un sériel.

**Comment ça marche.**
1. Si le texte est `null` (« aucun texte », différent d'un texte vide), il est remplacé par `""`.
2. Comparaison puis écriture comme les deux autres.

### Champs des niveaux de circuits par scène (lignes 125–126)

| Champ | Type expliqué simplement | Rôle |
|---|---|---|
| `_sceneCircuitLevels` (l. 125) | dictionnaire pièce → tableau de tableaux d'analogiques | Pour chaque pièce et chaque scène, les niveaux des circuits lus dans `pieces[].pilotages.eclairages.scenes.niveaux` |
| `_circuitFromSlot2` (l. 126) | dictionnaire pièce → tableau de digitaux | Pour chaque circuit, vrai si le slot 2 a déjà renvoyé son niveau réel ; dans ce cas la table de scène ne l'impose plus |

`ushort[][]` = un tableau dont chaque case est elle-même un tableau (ici : scène, puis circuit).

### Champs de la pièce affichée par la dalle (lignes 130–132)

| Champ | Type expliqué simplement | Rôle |
|---|---|---|
| `TswRoomBroadcastJoin` (l. 130) | constante | Analogique 240 : pièce affichée par la dalle principale |
| `MainPanelIpId` (l. 131) | constante | IP-ID de la dalle principale : 0x03 |
| `_tswActiveRoom` (l. 132) | analogique | Pièce actuellement affichée par la dalle 0x03 (départ : 1) |

### Constantes des XPanels QR code (lignes 138–139)

**À quoi ça sert.** Chaque pièce a son propre IP-ID de Web XPanel, ouvert par un QR code. IP-ID = 0x10 + numéro de pièce, jusqu'à 30 pièces (0x11 à 0x2E).

| Champ | Type expliqué simplement | Rôle |
|---|---|---|
| `QrXpanelBaseIpId` (l. 138) | constante | Base 0x10 |
| `QrXpanelMaxRooms` (l. 139) | constante | 30 pièces au maximum |

### IsQrXpanel(uint ipId) (lignes 141–144)

**À quoi ça sert.** Dire si un IP-ID appartient à un XPanel QR code.

**Comment ça marche.** Renvoie vrai si l'IP-ID est strictement supérieur à 0x10 et inférieur ou égal à 0x10 + 30 (0x2E).

```csharp
return ipId > QrXpanelBaseIpId && ipId <= QrXpanelBaseIpId + QrXpanelMaxRooms;
```

`&&` = ET logique.

### DefaultRoomForPanel(uint ipId) (lignes 147–155)

**À quoi ça sert.** Choisir la pièce à afficher par défaut sur un équipement.

**Comment ça marche.**
1. Si c'est un XPanel QR, calcule la pièce : IP-ID − 0x10 (ex. 0x13 donne la pièce 3).
2. Si le registre des pièces existe (`!= null`) et contient cette pièce, la renvoie.
3. Dans tous les autres cas, renvoie la pièce 1.

**Attention.** Appelée à la connexion d'un XPanel QR (lignes 814–819) pour forcer sa pièce à chaque nouveau scan, et comme valeur de secours partout où `_activeRoomPerDevice` n'a pas encore d'entrée.

---

### Volume et mute matériels de la dalle TSW — champs (lignes 159–164)

**À quoi ça sert.** Piloter le haut-parleur intégré de la dalle TSW-1070 (page Vidéo), indépendamment du volume A/V des pièces.

| Champ | Type expliqué simplement | Rôle |
|---|---|---|
| `TswVolumeJoin` (l. 159) | constante | Analogique 260 : volume 0–100 |
| `TswMuteJoin` (l. 160) | constante | Digital 261 : bascule mute |
| `_mainTswPanel` (l. 161) | objet dalle `Tsw1070GV` | La dalle 0x03 elle-même, pour accéder à ses fonctions matérielles (créée ligne 364, rangée ligne 372) ; `null` si elle n'a pas pu être préparée |
| `_tswVolPct` (l. 162) | analogique | Volume actuel en % (départ : 50) |
| `_tswVolBeforeMute` (l. 163) | analogique | Volume à retrouver en sortie de mute |
| `_tswVolMuted` (l. 164) | digital | Mute actif |

**Joins concernés.** Analogique 260 et digital 261, dans les deux sens (contrat : `Systeme.VolumeDalle`, `Systeme.MuteDalle`). Les commandes arrivent par les lignes 1658–1661 (261) et 1840–1843 (260).

### BroadcastTswVolume() (lignes 166–174)

**À quoi ça sert.** Envoyer le volume et l'état mute de la dalle à tous les équipements.

**Comment ça marche.**
1. Si la liste des panels n'existe pas encore, sort sans rien faire (`return`).
2. Pour chaque équipement de la liste (`foreach` = « pour chaque élément »), envoie l'analogique 260 et le digital 261 via `SetUShort` / `SetBool`.

**Attention.** La liste contient aussi l'EISC : le slot 2 reçoit donc 260 et 261.

### ApplyTswVolumeHardware(ushort pct) (lignes 176–181)

**À quoi ça sert.** Appliquer réellement le volume sur le haut-parleur de la dalle.

**Comment ça marche.**
1. Mémorise le pourcentage dans `_tswVolPct`.
2. Si la dalle existe, convertit 0–100 en 0–65535 et l'écrit sur le signal matériel `AllAudioVolume` de l'**extender** audio (un extender est un groupe de signaux réservés du firmware de la dalle, activé ligne 366).

```csharp
_mainTswPanel.ExtenderAudioReservedSigs.AllAudioVolume.UShortValue = (ushort)(pct * 65535 / 100);
```

### SetTswVolume(ushort pct) (lignes 183–190)

**À quoi ça sert.** Traiter une demande de volume (curseur du GUI, flèches de la barre d'outils, commande console `villavol` ligne 396).

**Comment ça marche.**
1. Plafonne à 100.
2. Si le volume est supérieur à 0 : enlève le mute et mémorise ce volume comme « volume avant mute ».
3. Si le volume vaut 0 : considère la dalle comme en mute.
4. Applique au matériel, puis diffuse à tous.

### ToggleTswMute() (lignes 192–205)

**À quoi ça sert.** Basculer le mute de la dalle (digital 261), comme un toggle SIMPL.

**Comment ça marche.**
1. Inverse l'état (`!` = NON logique).
2. Si on passe en mute : mémorise le volume actuel (ou 50 s'il était à 0), puis met le matériel à 0.
3. Si on sort du mute : remet le volume mémorisé.
4. Diffuse à tous.

```csharp
_tswVolBeforeMute = _tswVolPct > 0 ? _tswVolPct : (ushort)50;
```

### OnTswToolbarSigChange(DeviceExtender ext, SigEventArgs args) (lignes 210–234)

**À quoi ça sert.** Réagir aux boutons de la barre d'outils matérielle de la dalle. C'est un **gestionnaire d'événement** : une méthode que le SDK appelle tout seul quand un signal change. L'équivalent SIMPL est un `PUSH` / `CHANGE` en SIMPL+, ou une logique déclenchée par un front. Le branchement est fait ligne 368–370 avec `+=` (« ajoute cette méthode à la liste des méthodes à prévenir »).

**Comment ça marche.**
1. Tout le corps est dans un `try { } catch { }` : si une erreur survient, le programme ne s'arrête pas, l'erreur part dans le journal (`ErrorLog.Notice`, ligne 233).
2. Sort si la dalle n'existe pas ou si le signal n'est pas un digital.
3. Écrit une trace, puis ne garde que le front montant (appui).
4. Bouton 2 (Home) : ferme l'application ouverte, par exemple le navigateur YouTube, pour revenir au projet CH5.
5. Bouton 4 (flèche haut) : volume +5, plafonné à 100.
6. Bouton 5 (flèche bas) : volume −5, jamais sous 0.

```csharp
if (args.Sig == tb.Button2OnFeedback) // Home
```

**Attention.** Les boutons 1 (Power), 3 (Ampoule) et 6 (Micro) sont cités en commentaire mais ne font rien.

### OnTswAudioExtenderSigChange(DeviceExtender ext, SigEventArgs args) (lignes 236–250)

**À quoi ça sert.** Recevoir le feedback du volume matériel de la dalle (si le volume change sur la dalle elle-même) et le renvoyer au GUI. Gestionnaire d'événement branché ligne 367–368.

**Comment ça marche.**
1. Sort si la dalle n'existe pas.
2. Si le signal reçu est `AllAudioVolumeFeedback`, convertit 0–65535 en 0–100 avec arrondi.
3. Trace, puis diffuse à tous.

**Attention.** Le `catch { }` est vide : une erreur ici est ignorée sans aucun message (choix assumé en commentaire : « best-effort »).

### BroadcastTswRoom() (lignes 252–257)

**À quoi ça sert.** Envoyer à tous les équipements la pièce affichée par la dalle 0x03, sur l'analogique 240. Le debugger virtuel s'en sert pour « suivre la dalle ».

**Comment ça marche.**
1. Sort si la liste des panels n'existe pas.
2. Pour chaque équipement, écrit `_tswActiveRoom` sur l'analogique 240.

**Attention.** Appelée quand la dalle 0x03 change de pièce (lignes 1603 et 1831). L'écriture est directe, sans passer par `SetUShort`.

---

### Champs du pont EISC (lignes 262–266)

**À quoi ça sert.** Relier le slot 1 (ce programme) au programme SIMPL du slot 2 par un EISC. Les signaux globaux (< 1000) passent en miroir 1:1. Chaque pièce a un bloc de 100 joins.

| Champ | Type expliqué simplement | Rôle |
|---|---|---|
| `_eisc` (l. 262) | objet EISC | La liaison vers le slot 2 (créée ligne 681) ; `null` tant qu'elle n'existe pas |
| `RoomBlockBase` (l. 263) | constante | 1000 : début des blocs de pièces |
| `RoomBlockSize` (l. 264) | constante | 100 joins par pièce |
| `RoomBlockMaxRoom` (l. 265) | constante | 30 pièces maximum, joins 1000 à 3998 |
| `_roomEiscEnabled` (l. 266) | dictionnaire pièce → digital | Vrai si la pièce est relayée au slot 2 (drapeau `intersystem` de la pièce) |

Formule du bloc d'une pièce (commentaire ligne 261) : base = 1000 + (numéro − 1) × 100. Pièce 1 = 1000–1099, pièce 2 = 1100–1199, etc.

### Liste blanche du miroir EISC (lignes 273–276)

**À quoi ça sert.** Ne recopier vers le slot 2 que les joins globaux déclarés dans `contrat.signauxGlobaux`. Si la liste est absente, le programme recopie tout join < 1000 (comportement v2), pour ne jamais couper le pont par accident.

| Champ | Type expliqué simplement | Rôle |
|---|---|---|
| `_mirrorDigital` (l. 273) | dictionnaire join → digital | Digitaux globaux autorisés |
| `_mirrorAnalog` (l. 274) | dictionnaire join → digital | Analogiques globaux autorisés |
| `_mirrorSerial` (l. 275) | dictionnaire join → digital | Sériels globaux autorisés |
| `_mirrorWhitelistLoaded` (l. 276) | digital | Vrai si au moins une entrée a été chargée (ligne 547) |

Ici le dictionnaire sert d'ensemble : seule la présence de la clé compte.

### Champs du pavé de code d'alarme (lignes 283–292)

**À quoi ça sert.** Valider le code saisi sur le pavé d'alarme. Le code est d'abord envoyé à la vraie centrale via l'EISC (sériel 43). Le C# ne décide lui-même que si le slot 2 ne répond pas à temps.

| Champ | Type expliqué simplement | Rôle |
|---|---|---|
| `AlarmCodeEntryJoin` (l. 283) | constante | Sériel 43 : code saisi (entrée) |
| `AlarmCodeOkJoin` (l. 284) | constante | Digital 44 : impulsion « code accepté » |
| `AlarmCodeKoJoin` (l. 285) | constante | Digital 45 : impulsion « code refusé » |
| `AlarmCodeClearJoin` (l. 286) | constante | Digital 46 : touche C, efface la saisie |
| `_alarmReferenceCode` (l. 287) | texte | Code de secours lu dans `contrat.alarme.codeParDefaut` (ligne 575) |
| `_alarmPanelReplyMs` (l. 288) | entier, millisecondes | Délai d'attente de la centrale : 1200 par défaut, remplacé par `delaiReponseCentraleMs` s'il est entre 200 et 2200 (ligne 580) |
| `_alarmPendingCode` (l. 289) | texte | Code en attente de verdict |
| `_alarmVerdictPending` (l. 290) | digital | Vrai pendant l'attente du verdict |
| `_alarmCodeTimer` (l. 291) | minuterie `CTimer` | Compte le délai d'attente, comme un `Delay` SIMPL |
| `_alarmCodeRequester` (l. 292) | équipement | Le panel qui a saisi le code : le verdict ne va qu'à lui |

---

### Properties/AssemblyInfo.cs (lignes 1–36)

**À quoi ça sert.** Donner l'« étiquette » du programme compilé : titre, copyright, version. Ce fichier ne contient aucune logique.

**Comment ça marche.**
1. Les lignes entre crochets `[assembly: ...]` sont des **attributs** : des informations collées au fichier compilé, lisibles par Windows ou par le processeur.
2. Titre et produit : `"Backend"` (lignes 8 et 12). Copyright 2026 (ligne 13).
3. `ComVisible(false)` (ligne 20) et `Guid` (ligne 23) : réglages Windows standards, sans effet sur le CP4.
4. Version du programme : `1.0.180.0` (lignes 35–36).

```csharp
[assembly: AssemblyVersion("1.0.180.0")]
```

**Attention.** C'est ce numéro qu'il faut incrémenter à chaque livraison pour distinguer les versions chargées.

### Villaftv.csproj (lignes 1–166)

**À quoi ça sert.** C'est le fichier de projet Visual Studio : il dit quoi compiler, avec quelles bibliothèques, et produit le programme à charger sur le CP4. Il joue le rôle des réglages de compilation d'un `.smw`.

**Ce qu'il faut savoir.**
1. **Nom du programme** : `Villaftv` (lignes 10–11). Type `Library` (ligne 8) : une bibliothèque `.dll`, pas un exécutable.
2. **Framework** : .NET Framework 4.6.1 (ligne 12).
3. **Type Crestron** : `CrestronProjectType` = `Pro` (ligne 15), c'est-à-dire un programme SIMPL# Pro autonome (pas une bibliothèque pour SIMPL+).
4. **SDK Crestron** : paquets NuGet `Crestron.SimplSharp.SDK.Library`, `ProgramLibrary` et `Program`, version **2.21.274** (lignes 39–131 et 151–165). NuGet est le gestionnaire de paquets de .NET : il télécharge les bibliothèques dans le dossier `..\packages`. Si elles manquent, la compilation s'arrête avec un message (lignes 152–159).
5. **Bibliothèques Crestron utilisées** : UI, DeviceSupport, EthernetCommunications, Newtonsoft (JSON), etc. Beaucoup sont référencées sans être forcément utilisées (DM, Fusion, Shades…) : c'est le modèle standard du SDK.
6. **Fichiers compilés** (lignes 141–146) : `ControlSystem.cs`, `HvacState.cs`, `WellnessState.cs`, `Properties\AssemblyInfo.cs`. Un nouveau fichier `.cs` doit être ajouté ici, sinon il est ignoré.
7. **Deux configurations** : `Debug` (sortie `bin\Debug\`, lignes 20–29) et `Release` (sortie `bin\Release\`, lignes 30–37).
8. **Sortie `.cpz`** : le fichier `.csproj` ne cite jamais `.cpz`. C'est la cible importée du paquet `Crestron.SimplSharp.SDK.Program` (ligne 165) qui emballe la `.dll` en `.cpz`, dans le dossier de sortie de la configuration choisie. C'est ce `.cpz` qu'on charge sur le slot 1.

---

### Points à vérifier (partie)

1. **ControlSystem.cs l. 5** : le commentaire annonce `XpanelForSmartGraphics` « indispensable », mais le code instancie `XpanelForHtml5` (l. 401, 412). Commentaire obsolète.
2. **l. 37** : commentaire « contrat v2 : joins digitaux 45-48 » pour la scène d'éclairage. Le contrat indique joins logiques 51–54 en v2 et bloc pièce +21..+24 en v3 ; le code publie bien +21..+24 (l. 1115). Commentaire faux.
3. **l. 19 (`LightLevel1`)** : écrite (l. 1680, 1693, 1706, 1765) mais jamais lue ni publiée d'après la recherche dans le fichier. Le contrat prévoit pourtant l'analogique `Eclairage.NiveauMaster` au bloc +21. Code mort apparent ou feedback manquant.
4. **l. 40** : température mesurée par défaut 224 (22,4 °C) affichée comme une vraie mesure tant que le slot 2 n'a rien envoyé. Contrairement à `WellnessState`, aucun « -- » n'indique l'absence de mesure.
5. **l. 47** : scène de stores par défaut 204 (scène 4), sans justification. À confirmer comme choix volontaire.
6. **l. 60 / l. 307** : repli `"villaftv.cpz"`, puis remplacement par `Path.GetFileName(assembly.Location)`, qui renvoie a priori le nom de la `.dll` chargée (ex. `Villaftv.dll`), pas du `.cpz`. À vérifier sur le processeur.
7. **l. 54–55 et 166–174, 252–257** : `_touchPanels` contient aussi l'EISC (l. 684). `BroadcastTswVolume` et `BroadcastTswRoom` écrivent donc 240, 260 et 261 vers le slot 2 sans passer par la liste blanche du miroir (l. 273–276). À vérifier que ces joins sont bien attendus côté SIMPL.
8. **l. 256** : `BroadcastTswRoom` écrit directement `UShortInput` au lieu de `SetUShort`, contrairement à la règle « émission sur changement uniquement » (l. 93–99). Incohérence de style, effet de front possible sur l'EISC.
9. **l. 207** : « TS-1070 » au lieu de « TSW-1070 ». Les boutons 1, 3 et 6 sont listés mais non traités.
10. **l. 219, 224, 228** : l'appui est détecté via des signaux nommés `ButtonNOnFeedback`. Le nom suggère un feedback, pas un appui. Fonctionnement à confirmer sur une vraie dalle.
11. **l. 236–250** : le feedback matériel met à jour `_tswVolPct` mais pas `_tswVolMuted`. Un volume ramené à 0 sur la dalle ne passe pas le GUI en mute (et inversement). Le `catch { }` vide (l. 249) masque toute erreur.
12. **l. 135** : l'URL d'exemple `ipId=0x1N&room=N` n'est vraie que pour les pièces 1 à 15 ; les pièces 16 à 30 ont les IP-ID 0x20 à 0x2E. Commentaire simplifié.
13. **l. 265 et contrat** : le code et `contrat.blocsPiecesGui.pieceMax` (config l. 3413) donnent 30 pièces, mais le §1 de `03_CONTRAT_JOINS.md` parle de 15 pièces (« pièce 15 → 2400-2499 »). Documentation à harmoniser.
14. **Versions de contrat contradictoires** : le code parle de « v3 » (blocs de 100 joins par pièce, l. 25, 265, 268) ; le document s'intitule « Contrat de joins v3 » avec des extensions v4 (HVAC 16/09, wellness 17/09) ; `villa_config.json` (l. 2482) annonce « v4 (15.09.2026) — joins de pilotage globaux, routage SIMPL par buffers », ce qui semble contredire le principe des blocs par pièce.
15. **l. 279–282** : le commentaire dit que le code d'alarme n'est codé en dur nulle part, mais `codeParDefaut` vaut `"1234"` dans la config (l. 2485), la même valeur que l'ancien code en dur du JS (contrat §5). À changer sur site, comme le dit la note de la config.
16. **l. 288 et l. 580** : délai par défaut 1200 ms, plafond accepté 2200 ms, alors que le GUI abandonne à 2500 ms. Cohérent, mais la marge (300 ms) n'est pas documentée ailleurs.
17. **WellnessState.cs l. 44–47** : `Value()` renvoie l'humidité mesurée pour tout offset inconnu, sans signaler l'erreur. Piège si un appelant passe un mauvais offset.
18. **WellnessState.cs l. 15** : `SaunaMin`, `SaunaMax`, `HumidityMin`, `HumidityMax` sont des champs publics modifiables, alors que les autres valeurs sont protégées en écriture. Ils sont écrasés par la config (ControlSystem l. 1010–1011) seulement si sauna **et** hammam sont `actif` (l. 1007).
19. **WellnessState.cs l. 19–28** : `Apply()` renvoie `true` pour 13, 14, 17, 18 même si `SetValue` a refusé la valeur. Sans effet visible (bornes déjà appliquées), mais le compte rendu n'est pas fiable.
20. **HvacState.cs l. 7** : commentaire « 0 Auto, 1 Low, 2 Medium, 3 High » ; le contrat dit « Auto/1/2/3 ». Même sens, vocabulaire différent. Commentaires en anglais dans ces deux fichiers, en français ailleurs.
21. **AssemblyInfo.cs l. 35–36** : version `1.0.180.0` alors que `villa_config.json` `meta.version` vaut `1.0.181`. Version du C# non incrémentée, ou config en avance.
22. **AssemblyInfo.cs l. 8, 12** : titre « Backend » alors que l'assemblage s'appelle `Villaftv` (csproj l. 11). Nom trompeur dans les propriétés du fichier.
23. **Villaftv.csproj l. 12 vs l. 40 et suivantes** : cible .NET Framework 4.6.1, mais toutes les bibliothèques Crestron sont prises dans `lib\net47` (4.7). À aligner (le SDK 2.21 vise 4.7) ; la compilation peut produire des avertissements.
24. **Villaftv.csproj l. 28** : `PlatformTarget x86` n'est défini qu'en Debug ; Release reste en AnyCPU. Différence entre les deux builds à confirmer comme volontaire.

### Joins de cette partie

| Type | Join ou plage | Sens | Rôle |
|---|---|---|---|
| Sériel | 43 | GUI→C#, puis C#↔SIMPL via EISC | Code saisi sur le pavé d'alarme |
| Digital | 44 | C#→GUI (et SIMPL→C# via EISC) | Impulsion « code accepté » |
| Digital | 45 | C#→GUI (et SIMPL→C# via EISC) | Impulsion « code refusé » |
| Digital | 46 | GUI→C# | Touche C : efface la saisie |
| Sériel | 101, 102, 104 | C#→GUI | Nom du programme, date de compilation, date de validation du panel |
| Sériel | 105 | C#→GUI | Transport de `villa_config.json` en morceaux de 180 caractères |
| Sériel | 106 | C#→GUI | Empreinte de la config |
| Digital | 250 | GUI→C# | Demande de (ré)envoi de la config |
| Analogique | 250 | GUI→C# | Accusé de réception d'un morceau de config |
| Analogique | 240 | C#→GUI (et C#→SIMPL via EISC) | Pièce affichée par la dalle 0x03 |
| Analogique | 260 | GUI→C# et C#→GUI (aussi vers SIMPL via EISC) | Volume matériel de la dalle TSW, 0–100 |
| Digital | 261 | GUI→C# et C#→GUI (aussi vers SIMPL via EISC) | Bascule mute de la dalle TSW |
| Digitaux | 41, 42 | C#→GUI | Feedback alarme armée / désarmée (champ `_globalAlarmArmedState`) |
| Digitaux | 410, 411 | C#→GUI | Feedback mode vacances actif / inactif (champ `_vacationModeActive`) |
| Digitaux | bloc pièce +93..+98 | GUI→C#, C#→GUI, C#↔SIMPL via EISC | HVAC marche, arrêt, ventilation Auto/1/2/3 (`HvacState`) |
| Analogique | bloc pièce +33 | GUI→C#, C#→GUI | Vitesse de ventilation 0–3 (`HvacState.Fan`) |
| Digitaux | bloc pièce +11..+18 | GUI→C#, C#→GUI ; +11 et +15 aussi SIMPL→C# via EISC | Sauna marche/arrêt/±, hammam marche/arrêt/± (`WellnessState`) |
| Analogiques | bloc pièce +34..+37 | GUI→C# (+34, +35), SIMPL→C# via EISC (+36, +37), C#→GUI | Consignes et mesures sauna/hammam |
| Sériels | bloc pièce +44..+47 | C#→GUI | Textes des consignes et mesures sauna/hammam (« -- » si inconnu) |
| Tous types | 1000–3998 (blocs de 100 par pièce) | GUI↔C#, C#↔SIMPL via EISC si `intersystem` | Blocs de pilotage par pièce (constantes l. 263–265) |
| Signal réservé dalle | extender audio `AllAudioVolume` / `AllAudioVolumeFeedback` | C#↔dalle TSW | Volume réel du haut-parleur de la dalle |
| Signal réservé dalle | barre d'outils boutons 2, 4, 5 | dalle TSW→C# | Home (fermer l'application), volume +5, volume −5 |

---

## Partie B — Démarrage et chargement de la configuration

Cette partie couvre les lignes 294 à 657 de `ControlSystem.cs`. On y trouve tout ce qui se passe quand le programme démarre sur le slot 1 du CP4 : lecture du fichier `/user/villa_config.json`, création des panels, puis envoi de la configuration au GUI CH5 par petits morceaux.

### Quelques mots de C# utiles pour cette partie

- **Méthode** : un bloc de code qui porte un nom et qu'on appelle. Équivalent SIMPL le plus proche : un module ou une fonction SIMPL+.
- **Constructeur** : méthode spéciale qui porte le nom de la classe (`ControlSystem`). Elle s'exécute une seule fois, quand le programme est chargé en mémoire, avant tout le reste.
- **`override`** : « je remplace la version par défaut fournie par Crestron ». `InitializeSystem` est prévu par Crestron, le programme y met son propre contenu.
- **`try { ... } catch { ... }`** : filet de sécurité. Si une erreur (une « exception ») se produit dans le `try`, le programme ne plante pas : il saute dans le `catch`. Il n'y a pas d'équivalent direct en SIMPL, où une erreur fait souvent simplement « rien ».
- **`return`** : sortie immédiate de la méthode.
- **`private` / `static`** : `private` = utilisable seulement dans ce fichier. `static` = la méthode n'a besoin d'aucune donnée du programme, elle ne fait que transformer ce qu'on lui donne.
- **`List<string>`** : liste de textes, comme un tableau de serials qui peut grandir.
- **`Dictionary<uint, int>`** : table de correspondance clé → valeur. Ici, souvent « IP-ID du panel → un nombre ».
- **`JObject`** : le contenu du fichier JSON chargé en mémoire, qu'on peut interroger comme un arbre : `_villaConfig["meta"]["tracesConsole"]`.
- **`ErrorLog.Error` / `ErrorLog.Notice`** : écrit dans le journal d'erreurs du processeur (commande `err` sur la console).
- **`CrestronConsole.PrintLine`** : écrit sur la console du CP4, toujours.
- **`Trace(...)`** : fonction du projet (lignes 83–91). Elle écrit sur la console seulement si `meta.tracesConsole` vaut `true` dans le JSON.
- Les noms qui commencent par `_` (par exemple `_configChunks`) sont des **variables du programme** : elles gardent leur valeur tant que le programme tourne, comme des signaux internes mémorisés.

### Constantes utilisées dans cette partie (déclarées ailleurs dans le fichier)

| Nom | Valeur | Ligne | Rôle |
|---|---|---|---|
| `VillaConfigPath` | `/user/villa_config.json` | 65 | Chemin du fichier de configuration |
| `ConfigChunkSize` | 180 | 67 | Nombre de caractères de données par morceau |
| `ConfigSerialJoin` | 105 | 68 | Serial vers le panel qui transporte les morceaux |
| `ConfigHashJoin` | 106 | 69 | Serial vers le panel qui porte l'empreinte |
| `ConfigSyncJoin` | 250 | 70 | Digital 250 = demande de config ; Analog 250 = accusé de réception |
| `QrXpanelBaseIpId` | 0x10 | 138 | Base des IP-ID des XPanels « QR code » |
| `QrXpanelMaxRooms` | 30 | 139 | Nombre maximum de pièces avec XPanel QR |
| `RoomBlockBase` | 1000 | 263 | Premier join des blocs de pièce |

### Schéma de la séquence de démarrage

```text
Chargement du programme (slot 1)
  |
  +-- ControlSystem()                        l.294  threads max = 32
  |
  +-- InitializeSystem()                     l.299
        |
        +-- nom + date du fichier CPZ        l.304-316
        +-- dates de validation /user/...    l.319-338  (IP-ID 03,04,05,06)
        +-- LoadVillaConfiguration()         l.341
        |     +-- lit /user/villa_config.json
        |     +-- lit meta.tracesConsole
        |     +-- minifie + EscapeNonAscii
        |     +-- découpe en chunks "VCFG|i|n|..."
        |     +-- ComputeConfigHash -> _configHash
        |     +-- BuildGlobalMirrorWhitelist()
        |     +-- LoadAlarmReferenceCode()
        +-- registre des pièces (ou repli)   l.348-358
        +-- TSW-1070 IP-ID 03 + extenders    l.364-378
        +-- commandes console villahome/villavol  l.383-398
        +-- XPanel HTML5 IP-ID 04            l.401
        +-- XPanels QR IP-ID 0x10+id         l.406-413
        +-- iPad IP-ID 05                    l.416-418
        +-- iPhone IP-ID 06                  l.421-423
        +-- InitializeIntersystemBridge()    l.427  (EISC F0 vers slot 2)
        +-- écran par défaut de chaque panel l.430-435
        +-- PushAllRoomsFeedback()           l.439

Plus tard, pour chaque panel qui se connecte :
  C#  --serial 106 (empreinte)-->  GUI            (l.839, hors partie)
  GUI --digital 250 (demande)-->   C#  -> StartConfigSend
  C#  --serial 105 chunk 1-->      GUI
  GUI --analog 250 = 1-->          C#  -> OnConfigChunkAck -> chunk 2
  ...                                                 ... jusqu'à n
  GUI --analog 250 = n-->          C#  -> "transmise intégralement"
```

### ControlSystem (lignes 294–297)

**À quoi ça sert**
C'est le constructeur. Il s'exécute en tout premier, dès que le processeur charge le programme.

**Comment ça marche**
1. Il appelle d'abord le constructeur de Crestron (`: base()`).
2. Il autorise jusqu'à 32 « threads » utilisateur. Un thread est une tâche qui tourne en parallèle des autres (par exemple un timer ou un traitement d'événement).

```csharp
Thread.MaxNumberOfUserThreads = 32;
```

**Attention**
Rien d'autre n'est fait ici. Tout le vrai démarrage se passe dans `InitializeSystem`.

### InitializeSystem (lignes 299–445)

**À quoi ça sert**
C'est le point de départ du programme, appelé automatiquement par le processeur après le constructeur. Il prépare tout dans un ordre précis : fichiers, configuration, pièces, panels, EISC, premiers feedbacks.

**Comment ça marche**
1. **Infos du CPZ** (304–316) : récupère le nom du fichier programme (`_cpzFileName`) et sa date de modification (`_cpzCompileDate`, format `dd/MM/yyyy HH:mm:ss`). En cas d'échec : simple `Notice`, on continue.
2. **Dates de validation** (319–338) : pour les IP-ID 3, 4, 5 et 6, lit le fichier `/user/last_validation_date_03.txt` (etc.). S'il existe, son texte est gardé dans `_validationDates`. Sinon, la date vaut un texte vide.
3. **Configuration** (341) : appelle `LoadVillaConfiguration()` (voir plus bas). C'est ici, et seulement ici, que `/user/villa_config.json` est lu.
4. **Registre des pièces** (348–358) : appelle `BuildVillaRoomsDatabase()` dans un `try`. Si ça échoue, ou si le registre est vide, appelle `BuildFallbackRoomsDatabase()` (liste de pièces « historique » codée dans le programme). Le commentaire v3 / P1-1 explique pourquoi : avant, un JSON mal typé bloquait l'enregistrement de tous les panels.
5. **Liste des panels** (360) : crée la liste vide `_touchPanels`.
6. **Dalle TSW-1070, IP-ID 0x03** (364–378) : crée l'objet `Tsw1070GV`. Active trois « extenders » (groupes de signaux réservés de la dalle) : audio (volume matériel), barre de boutons, contrôle d'application. Ils doivent être activés AVANT l'enregistrement. Puis `RegisterUserInterface(mainTsw)`.
7. **Commandes console** (383–398) : ajoute deux commandes tapables sur la console du CP4 :
   - `villahome` : ferme l'application ouverte sur la dalle (retour au projet CH5) ;
   - `villavol N` : règle le volume matériel de la dalle entre 0 et 100.
8. **XPanel HTML5, IP-ID 0x04** (401).
9. **XPanels « QR code »** (406–413) : un XPanel par pièce du registre. IP-ID = 0x10 + numéro de pièce. Les pièces hors 1 à 30 sont ignorées.
10. **iPad, IP-ID 0x05** (416–418) et **iPhone, IP-ID 0x06** (421–423) : objets `CrestronApp`, nom de projet `villaftv`.
11. **EISC vers le slot 2** (427) : `InitializeIntersystemBridge()` (lignes 658 et suivantes, partie suivante).
12. **Écran par défaut** (430–435) : pour chaque panel enregistré, choisit sa pièce par défaut (`DefaultRoomForPanel`), la mémorise dans `_activeRoomPerDevice` et rafraîchit ses textes.
13. **Premiers feedbacks de pièces** (439) : `PushAllRoomsFeedback()` remplit les blocs de joins de toutes les pièces (1000 + (id-1)×100).

```csharp
LoadVillaConfiguration();          // l.341
...
PushAllRoomsFeedback();            // l.439
```

**Joins concernés**
Aucun join n'est écrit directement ici. Les valeurs préparées (`_cpzFileName`, `_validationDates`, `_configHash`) sont envoyées plus tard aux panels, par exemple sur les serials 101, 104, 106 (lignes 1872–1875, hors partie).

**Attention**
- Tout le corps est dans un grand `try`. Si une étape plante (par exemple l'enregistrement d'un panel), toutes les étapes suivantes sont sautées et seul un `ErrorLog.Error` « Échec critique » est écrit (ligne 443).
- L'ordre compte : la configuration est lue AVANT la construction des pièces et AVANT l'EISC, car ces deux étapes utilisent `_villaConfig`.
- Si l'activation des extenders de la dalle échoue, `_mainTswPanel` reste vide. La dalle est quand même enregistrée, mais `villahome` répondra « dalle indisponible ».

### LoadVillaConfiguration (lignes 450–495)

**À quoi ça sert**
Lire `/user/villa_config.json`, le garder en mémoire, et le préparer en morceaux (« chunks ») prêts à partir vers les panels CH5.

**Comment ça marche**
1. **Fichier absent** (454–458) : message console « CONFIG: /user/villa_config.json introuvable - dimensionnement historique conservé. » et sortie. Rien d'autre n'est chargé.
2. **Lecture** (459–460) : lit tout le fichier en texte, puis le transforme en objet JSON `_villaConfig`.
3. **Traces console** (464–466) : `_tracesConsole` passe à `true` seulement si `meta.tracesConsole` existe et vaut `true`.
4. **Minification** (472) : réécrit le JSON sur une seule ligne sans espaces (`Formatting.None`), puis remplace tout caractère spécial par `\uXXXX` avec `EscapeNonAscii`. Le commentaire explique : le lien CIP des dalles transforme certains caractères (emojis…) en `?`. Un texte 100 % ASCII passe sans problème.
5. **Découpage** (473–480) : vide l'ancienne liste `_configChunks`, calcule le nombre de morceaux `total` (arrondi au-dessus de longueur ÷ 180), puis crée chaque morceau au format `VCFG|i|n|données`, avec `i` de 1 à `n`.
6. **Empreinte** (481) : `_configHash` = empreinte FNV-1a du texte minifié + `-` + nombre de chunks. Exemple de forme : `1A2B3C4D-37`.
7. **Message console** (482) : taille, nombre de chunks, empreinte.
8. **Suite v3** (486–487) : `BuildGlobalMirrorWhitelist()` puis `LoadAlarmReferenceCode()`.
9. **Erreur** (489–494) : si quoi que ce soit plante (JSON invalide, `tracesConsole` pas booléen…), `_villaConfig` est remis à vide, la liste des chunks est vidée, et `ErrorLog.Error` « CONFIG: Échec de lecture de villa_config.json » est écrit.

```csharp
_configChunks.Add(string.Format("VCFG|{0}|{1}|{2}", i + 1, total, minified.Substring(start, len)));
```

**Joins concernés**
Aucun écrit ici. Les chunks partiront sur le serial 105, l'empreinte sur le serial 106.

**Ce qui se passe si le fichier manque ou est invalide**

| Situation | `_villaConfig` | Chunks | `_configHash` | Conséquence |
|---|---|---|---|---|
| Fichier absent | vide (`null`) | 0 | `""` | Pièces : liste historique (repli l.357–358). Demande de config ignorée (l.627–631). Miroir EISC v2. Pas de code d'alarme local. |
| JSON invalide ou mal typé ici | remis à `null` | 0 | `""` (jamais rempli) | Même chose que fichier absent, plus un `ErrorLog.Error`. |
| JSON valide | chargé | n | `XXXXXXXX-n` | Fonctionnement normal. |

« Miroir EISC v2 » : quand la liste blanche n'est pas chargée, la ligne 779 (hors partie) renvoie `true`, donc tous les joins sont recopiés vers l'EISC comme dans l'ancienne version.

**Attention**
- Le fichier n'est lu qu'au démarrage. Après modification de `/user/villa_config.json`, il faut redémarrer le programme (progreset).
- Une seule valeur mal typée dans `meta.tracesConsole` (par exemple `"true"` entre guillemets peut passer, mais un objet ou une liste ne passe pas) fait perdre TOUTE la configuration, car l'erreur tombe dans le même `catch`.

### BuildGlobalMirrorWhitelist (lignes 502–556)

**À quoi ça sert**
Construire la « liste blanche » : la liste des joins globaux (< 1000) qui ont le droit d'être recopiés 1:1 vers l'EISC du slot 2. Les joins de pièce (≥ 1000) passent par un autre mécanisme.

**Comment ça marche**
1. Vide les trois tables `_mirrorDigital`, `_mirrorAnalog`, `_mirrorSerial` et met `_mirrorWhitelistLoaded` à `false` (504–507).
2. Si la config ou `contrat` n'existe pas, sort (510). Si `contrat.signauxGlobaux` n'est pas une liste, sort (511–512).
3. Pour chaque entrée de la liste (514) :
   1. lit `type` : `digital`, `analog` ou `serial`. Tout autre type est ignoré ;
   2. lit soit `joinDebut` + `nombre` (plage), soit `join` (un seul join). Sinon, ignore l'entrée ;
   3. ajoute chaque join de la plage à la bonne table, mais seulement s'il est inférieur à 1000 (541).
4. Une entrée mal écrite est ignorée seule, grâce au petit `try/catch` interne (544).
5. `_mirrorWhitelistLoaded` passe à `true` si au moins un join a été retenu (547). Message console avec le compte par type.
6. En cas d'erreur générale : `_mirrorWhitelistLoaded = false`, `Notice` « miroir v2 conservé » (551–555).

```csharp
if (j < RoomBlockBase) cible[j] = true;
```

**Joins concernés**
Les joins listés dans `contrat.signauxGlobaux` de `villa_config.json` (tous < 1000). Selon le contrat (`03_CONTRAT_JOINS.md`, ligne 370–371) : digitaux 11-40, 41, 42, 44, 45, 46, 56, 250, 261, 301-312, 401-411, 211-220, 500-527, 530-557, 560-600 ; analogiques 10, 240, 250, 260 ; sériels 43, 99-106, 420.

**Attention**
Si la liste est vide ou absente, le programme ne bloque rien : il recopie TOUT vers l'EISC (comportement v2).

### LoadAlarmReferenceCode (lignes 564–589)

**À quoi ça sert**
Lire dans `contrat.alarme` le code d'alarme de secours et le délai d'attente de la vraie centrale (slot 2).

**Comment ça marche**
1. Si pas de config ou pas de `contrat`, sort sans rien dire (568).
2. Si `contrat.alarme` manque : `Notice` « aucune validation locale possible », sortie (570–574).
3. Lit `codeParDefaut` (espaces retirés) dans `_alarmReferenceCode` (575).
4. Lit `delaiReponseCentraleMs`. La valeur n'est acceptée qu'entre 200 et 2200 ms, car le GUI abandonne à 2500 ms (576–581). Sinon, la valeur par défaut reste 1200 ms (ligne 288).
5. Trace (seulement si `tracesConsole`) : code « chargé » ou « non configuré », et le délai (582–583). Le code lui-même n'est jamais affiché.
6. Erreur de lecture : `Notice` (585–588).

```csharp
if (delai >= 200 && delai <= 2200) _alarmPanelReplyMs = delai;
```

**Joins concernés**
Aucun ici. Ces valeurs servent au pavé d'alarme : serial 43 (saisie), digital 44 (OK), 45 (KO), 46 (effacer) — déclarés lignes 283–286.

**Attention**
- Code vide ou absent = aucune validation locale : seul le verdict du slot 2 compte.
- Valeur actuelle dans `villa_config.json` (ligne 2485) : `"1234"`. La note du JSON demande de le changer sur site.
- Un délai hors plage est ignoré sans aucun message.

### EscapeNonAscii (lignes 595–606)

**À quoi ça sert**
Rendre le texte JSON « sûr » pour le transport série : tout caractère spécial devient une séquence `\uXXXX`, que le GUI sait relire.

**Comment ça marche**
1. Parcourt le texte caractère par caractère.
2. Si le code du caractère est supérieur à 0x7E (`~`) ou inférieur à 0x20 (espace), il écrit `\u` + 4 chiffres hexadécimaux. Exemple : `é` devient `é`.
3. Sinon il recopie le caractère tel quel.

```csharp
if (ch > 0x7E || ch < 0x20) sb.AppendFormat("\\u{0:x4}", (int)ch);
```

**Attention**
Le commentaire (ligne 593) dit que c'est sûr car les caractères spéciaux n'apparaissent que dans les textes entre guillemets du JSON. C'est vrai pour un JSON minifié.

### ComputeConfigHash (lignes 612–620)

**À quoi ça sert**
Calculer une « empreinte » de la configuration : un code court de 8 caractères hexadécimaux qui change dès que le contenu change. Le panel compare cette empreinte à celle de sa copie en cache et ne redemande le transfert que si elles diffèrent.

**Comment ça marche**
1. Part d'une valeur fixe 2166136261.
2. Pour chaque caractère : mélange (XOR) puis multiplie par 16777619. C'est l'algorithme FNV-1a.
3. `unchecked` signifie « si le nombre déborde, on garde les bits bas sans erreur ».
4. Renvoie le résultat en 8 chiffres hexadécimaux majuscules.

```csharp
foreach (char c in s) { h ^= c; h *= 16777619; }
```

**Joins concernés**
Le résultat (avec `-n`) part sur le serial 106 à la connexion du panel (ligne 839) et au rafraîchissement (ligne 1874), hors partie.

### StartConfigSend (lignes 625–638)

**À quoi ça sert**
Lancer (ou relancer depuis le début) l'envoi de la configuration à UN panel.

**Quand est-elle appelée**
Quand le panel met le Digital 250 (`Config.Resync`) à 1 (ligne 1608–1611, hors partie).

**Comment ça marche**
1. Si aucun chunk n'est prêt (fichier absent ou invalide) : trace « ignorée », sortie (627–631).
2. Mémorise pour ce panel « chunk attendu = 1 » dans `_configChunkCursor` (632).
3. Met le serial 105 à vide, puis y écrit le chunk 1 (635–636). Le vidage force le panel à voir un changement, même si le même texte avait déjà été envoyé.
4. Trace « chunk 1/n ».

```csharp
panel.StringInput[ConfigSerialJoin].StringValue = "";
panel.StringInput[ConfigSerialJoin].StringValue = _configChunks[0];
```

**Joins concernés**
Digital 250 (entrée, demande), Serial 105 (sortie, chunk).

**Attention**
Chaque panel a son propre compteur. Plusieurs panels peuvent recevoir la configuration en même temps.

### OnConfigChunkAck (lignes 640–653)

**À quoi ça sert**
Recevoir l'accusé de réception d'un chunk et envoyer le suivant. C'est un échange « ping-pong » : un chunk, un accusé, un chunk, un accusé…

**Quand est-elle appelée**
Quand le panel envoie une valeur sur l'Analog 250 (`Config.ChunkAck`), ligne 1835–1838 (hors partie). La valeur est le numéro du chunk bien reçu.

**Comment ça marche**
1. Si aucun envoi n'est en cours pour ce panel : ignore (642).
2. Si le numéro reçu n'est pas celui attendu : ignore (644).
3. Si c'était le dernier chunk : efface le compteur du panel, trace « transmise intégralement », fin (645–650).
4. Sinon : compteur + 1, et écrit le chunk suivant sur le serial 105 (651–652). Comme la liste commence à 0 et les numéros à 1, `_configChunks[current]` est bien le chunk numéro `current + 1`.

```csharp
_configChunkCursor[panel.ID] = current + 1;
panel.StringInput[ConfigSerialJoin].StringValue = _configChunks[current];
```

**Joins concernés**
Analog 250 (entrée, accusé), Serial 105 (sortie, chunk suivant).

**Attention**
- Le C# n'a pas de minuterie : si un accusé se perd, l'envoi reste bloqué. Seule une nouvelle demande Digital 250 du panel relance tout depuis le chunk 1.
- Deux chunks successifs ont toujours un texte différent (le numéro `i` change), donc pas besoin de vider le serial ici.

### Fin de plage (lignes 655–657)

Les lignes 655–657 sont le commentaire d'en-tête de `InitializeIntersystemBridge` (« Crée l'EISC vers le slot 2… selon la section contrat.eisc »). La méthode elle-même commence ligne 658 et est traitée dans la partie suivante.

### Points à vérifier (partie)

1. **Ligne 464–466** : `(bool)_villaConfig["meta"]["tracesConsole"]` est dans le même `try` que tout le chargement. Une valeur non convertible en booléen fait perdre toute la configuration (ligne 491), pas seulement l'option de trace.
2. **Ligne 489–494** : le `catch` vide `_villaConfig` et les chunks, mais ne remet pas `_configHash` à vide. Sans conséquence aujourd'hui (le hash n'est calculé qu'après les étapes risquées et la méthode n'est appelée qu'une fois), mais fragile si on ajoute une étape après la ligne 481.
3. **Ligne 479** : le format `VCFG|i|n|payload` utilise `|` comme séparateur, et le JSON peut contenir `|` dans un texte. À vérifier côté GUI que seul le découpage des trois premiers `|` est fait. Non vérifiable dans ce fichier.
4. **Ligne 640–653** : aucune minuterie ni nouvelle tentative côté C#. Un accusé perdu bloque le transfert jusqu'à une nouvelle demande Digital 250. À vérifier que le GUI a bien un délai de reprise.
5. **Ligne 632, 643–652** : `_configChunkCursor` est un `Dictionary` modifié par des événements de panels sans verrou (`lock`). Si des événements arrivent sur des threads différents en même temps, il y a un risque théorique d'accès concurrent. À confirmer selon le modèle de threads des SigChange.
6. **Ligne 321** : les dates de validation ne sont lues que pour les IP-ID 3, 4, 5, 6. Les XPanels QR (0x11 et plus) n'en ont pas. La lecture ligne 1875 utilise `ContainsKey`, donc pas de plantage, mais à confirmer que c'est voulu.
7. **Ligne 406** : `_roomsRegistry.Keys` suppose que `BuildFallbackRoomsDatabase()` a réussi. Si le repli lui-même plantait, l'exception ferait sauter iPad, iPhone et EISC via le `catch` global (ligne 441).
8. **Ligne 441–444** : un seul `catch` global pour tout le démarrage. Une erreur dans un panel empêche la création des panels suivants et de l'EISC. Pas de message indiquant l'étape en cause.
9. **Ligne 580** : un `delaiReponseCentraleMs` hors plage 200–2200 est ignoré sans aucun message console ni journal.
10. **Ligne 420** : le commentaire parle d'« iPhone 17 » alors que le châssis de référence du projet est l'iPhone 16 Pro. Simple commentaire, sans effet sur le code.
11. **Ligne 591–593** : le commentaire dit « caractères non-ASCII », mais le test (ligne 600) échappe aussi les caractères de contrôle (< 0x20) et DEL (0x7F), qui sont de l'ASCII. Comportement correct, commentaire imprécis.
12. **Ligne 456** : le message « dimensionnement historique conservé » est un `PrintLine` console, pas un `ErrorLog`. Un fichier absent ne laisse donc aucune trace dans le journal d'erreurs du CP4.

### Joins de cette partie

| Type | Join ou plage | Sens | Rôle |
|---|---|---|---|
| Digital | 250 | GUI → C# | `Config.Resync` : demande d'envoi de la configuration (déclenche `StartConfigSend`, l.1608) |
| Analog | 250 | GUI → C# | `Config.ChunkAck` : numéro du chunk reçu (déclenche `OnConfigChunkAck`, l.1835) |
| Serial | 105 | C# → GUI | `Config.Json` : un chunk `VCFG\|i\|n\|payload` (l.635, 636, 652) |
| Serial | 106 | C# → GUI | `Config.Hash` : empreinte calculée ici (l.481), publiée l.839 et l.1874 |
| Digital / Analog / Serial | joins de `contrat.signauxGlobaux` (< 1000) | C# ↔ EISC slot 2 | Liste blanche du miroir global construite l.502–556 |
| Serial | 43 | GUI → C# → EISC | Saisie du code alarme (paramètres lus l.564–589) |
| Digital | 44, 45 | C# → GUI | Verdict alarme OK / KO (délai de repli lu l.576–581) |

---

## Partie C — Pont EISC, panneaux et base des pièces

Cette partie couvre les lignes **658 à 1066** de `ControlSystem.cs`. On y trouve :

- la création du pont **EISC** entre le programme C# (slot 1) et le programme SIMPL (slot 2) ;
- la règle qui décide **quels signaux** d'un écran sont recopiés vers le slot 2 ;
- l'enregistrement des écrans (et de l'EISC) et ce qui se passe quand ils passent en ligne ;
- les fonctions qui envoient du feedback ou des impulsions à tous les écrans ;
- la construction de la **base des pièces** (le « registre ») à partir de `villa_config.json`.

### Petit lexique C# pour cette partie

| Terme C# | Ce que c'est | Équivalent SIMPL le plus proche |
|---|---|---|
| **méthode** (`private void Nom()`) | un bloc de code qu'on appelle par son nom | un module ou une sous-routine S+ |
| **`BasicTriList`** | un appareil qui a des joins digitaux, analogiques et sériels | un symbole d'écran tactile ou d'EISC |
| **`BooleanInput[n]`, `UShortInput[n]`, `StringInput[n]`** | ce que le C# **écrit vers** l'appareil (feedback) | les entrées du symbole écran (côté gauche) |
| **`SigChange`** | un **événement** : « un join a changé côté appareil » | la sortie d'un symbole qui déclenche la logique |
| **gestionnaire d'événement** (`+=`) | la méthode appelée quand l'événement arrive | le câblage d'une sortie vers une logique |
| **`Dictionary<clé, valeur>`** | une table de correspondance clé → valeur | une table de consultation / un tableau indexé |
| **`List<...>`** | une liste d'éléments qu'on peut parcourir | — |
| **`foreach`** | « pour chaque élément de la liste, faire… » | une boucle `FOR` en S+ |
| **`try { } catch { }`** | « essaie ; si ça plante, fais ceci au lieu d'arrêter le programme » | — (SIMPL n'a pas d'exceptions) |
| **`null`** | « rien », l'objet n'existe pas | un signal non câblé |
| **`JToken`, `JArray`** | un morceau de JSON lu en mémoire (objet, valeur, tableau) | — |
| **`return`** | sortir tout de suite de la méthode | — |

Rappel des constantes utilisées plus bas (définies hors de cette partie) :
`RoomBlockBase = 1000` (ligne 263), `RoomBlockSize = 100` (ligne 264), `RoomBlockMaxRoom = 30` (ligne 265),
`AlarmCodeEntryJoin = 43` (ligne 283), `ConfigHashJoin = 106` (ligne 69), `TswRoomBroadcastJoin = 240` (ligne 130),
`TswVolumeJoin = 260` (ligne 159), `TswMuteJoin = 261` (ligne 160).

---

### Vue d'ensemble du pont EISC

#### Schéma

```
  GUI CH5 (TSW-1070, XPanel, iPad, iPhone)
        |  appui / curseur  (BooleanOutput, UShortOutput, StringOutput du panel)
        v
  +---------------------------------------------------------------+
  |  C# SIMPL# Pro  - slot 1                                      |
  |                                                               |
  |  OnTouchPanelSignalReceived (l. 1420)                         |
  |     |-- 1) MirrorSignalToEisc  (l. 698) --- copie filtrée ---+|
  |     |-- 2) traitement métier (registre des pièces)            ||
  |     v                                                        ||
  |  feedback : PushRoomFeedback / UpdateScreenStateForPanel     ||
  |     |  écrit sur TOUS les appareils de _touchPanels          ||
  |     |  (panels + EISC, sauf exceptions)                      ||
  +-----|--------------------------------------------------------|+
        |                                                        |
        v                                                        v
  panels CH5 (feedback)            EISC  IP-ID 0xF0  @ 127.0.0.2
                                   BooleanInput / UShortInput / StringInput
                                         |  (slot 1 -> slot 2)
                                         v
                            +----------------------------------+
                            | SIMPL Windows - slot 2           |
                            | symbole EISC, IP-ID F0,          |
                            | IP 127.0.0.2                     |
                            | sorties du symbole = ce que le   |
                            |   C# envoie (commandes+feedback) |
                            | entrées du symbole = ce que le   |
                            |   SIMPL renvoie (état réel)      |
                            +----------------------------------+
                                         |  (slot 2 -> slot 1)
                                         v
                    EISC SigChange -> OnTouchPanelSignalReceived (l. 1420)
                    -> traité comme une commande sur la pièce (joins >= 1000)
                    -> feedback renvoyé aux panels ET à l'EISC
```

#### L'idée centrale : l'EISC est traité comme « un écran de plus »

Le C# ne gère pas l'EISC avec un code à part. Il l'ajoute dans **la même liste que les écrans
tactiles** (`_touchPanels`, ligne 684 via `RegisterUserInterface`). Conséquences :

1. **Tout ce que le C# écrit vers les écrans est aussi écrit vers l'EISC**, sauf quand le code
   l'exclut explicitement (voir le tableau plus bas).
2. **Tout ce que le SIMPL écrit sur l'EISC arrive dans le même gestionnaire** que les appuis
   des écrans (`OnTouchPanelSignalReceived`, ligne 1420). Le code reconnaît alors l'EISC grâce à
   des tests `sourceDevice == _eisc` (par exemple lignes 700, 1195, 1555).
3. En plus, les **appuis bruts des écrans** sont recopiés vers l'EISC par `MirrorSignalToEisc`
   (ligne 698), avec un filtre.

#### Sens des signaux, vus depuis le SIMPL

Attention au vocabulaire, il est inversé d'un côté à l'autre :

| Côté C# (slot 1) | Côté SIMPL (slot 2), symbole EISC |
|---|---|
| `_eisc.BooleanInput[n]` / `UShortInput[n]` / `StringInput[n]` = le C# **envoie** | apparaît sur la **sortie** n du symbole EISC |
| `_eisc.BooleanOutput[n]` / ... = le C# **reçoit** (événement `SigChange`) | à câbler sur l'**entrée** n du symbole EISC |

Les numéros de join sont **identiques des deux côtés** (« miroir 1:1 »).

#### Ce qui part du slot 1 vers le slot 2

| Contenu | D'où ça vient dans le code | Condition |
|---|---|---|
| Appuis et valeurs des écrans sur les **blocs pièces** (joins ≥ 1000) | `MirrorSignalToEisc`, l. 716-724 | la pièce du join a `intersystem` à vrai |
| Appuis et valeurs des écrans sur les **joins globaux** (< 1000) | `MirrorSignalToEisc`, l. 731-735 | le join figure dans `contrat.signauxGlobaux` (ou la liste n'a pas pu être chargée) |
| Analogique **10** = pièce du panel qui vient d'agir | `MirrorSignalToEisc`, l. 744-755 | seulement pour certains joins « de pièce » |
| **Feedback** des blocs pièces | `PushRoomFeedback` (hors partie, l. 1097-1170) | la pièce a `intersystem` à vrai |
| **Feedback** « écran » global (pièce active, nom…) | `UpdateScreenStateForPanel` via `BroadcastFeedbackToAll` (l. 866-870) et à la mise en ligne (l. 827) | l'EISC est dans la liste |
| Impulsions de bloc pièce (stores, moteurs) | `PulseRoomDigital`, l. 907-912 | la pièce a `intersystem` à vrai |
| Pièce affichée par la dalle (analog 240), volume dalle (analog 260), mute dalle (digital 261) | `OnTouchPanelOnlineStatusChange`, l. 842-846 | à la mise en ligne |

#### Ce qui n'est **pas** recopié vers le slot 2

| Signal | Ligne | Pourquoi |
|---|---|---|
| Tout signal qui **vient** de l'EISC lui-même | 700 | éviter une boucle slot 2 → slot 1 → slot 2 |
| Blocs pièces d'une pièce `intersystem: false` (ou absente de la table) | 723 | limiter les signaux côté SIMPL |
| Joins ≥ 1000 dont la « pièce » calculée est hors 1..30 | 722 | joins réservés au firmware |
| Sériel **43** (code d'alarme saisi) | 725-730 | relayé à part par `ProcessAlarmCodeEntry` |
| Joins < 1000 absents de `contrat.signauxGlobaux` | 731-735 | liste blanche |
| Digitaux **620-627** et analogiques **62-63** (wellness) si la pièce du panel n'a pas de wellness | 706 | la pièce n'a pas de sauna/hammam |
| Analogiques **62** / **63** hors des bornes min/max de la pièce | 711-712 | consigne invalide |
| Analogiques **64** / **65** (mesures wellness) venant d'un panel | 706 | ce sont des sorties, un panel ne doit pas les imposer |
| Empreinte de config (sériel **106**) | 838 | réservée aux panels CH5 |
| Impulsions globales `PulseGlobalDigitalToPanels` (ex. verdict du code d'alarme) | 881, 890 | le texte dit que l'EISC « est servi par le miroir » |

#### Ce que le programmeur SIMPL doit câbler (slot 2)

1. Poser un symbole **Ethernet Intersystem Communications** avec **IP-ID F0** et
   **adresse 127.0.0.2** (valeurs lues dans `contrat.eisc` de `villa_config.json` :
   `"ipid": "0xF0"`, `"adresseIp": "127.0.0.2"`, `"actif": true`).
2. Pour **chaque pièce exposée** (les 15 pièces du JSON actuel ont `"intersystem": true`),
   câbler le bloc de 100 joins qui commence à `1000 + (id − 1) × 100` (pièce 1 = 1000, pièce 15 = 2400).
   La liste des offsets en entrée et en sortie est dans `03_CONTRAT_JOINS.md` § 6.
3. Câbler en 1:1 les **signaux globaux** listés dans `contrat.signauxGlobaux` (§ 6 du contrat,
   « Signaux globaux à câbler en 1:1 »).
4. Côté entrées du symbole (SIMPL → C#) : sur un bloc pièce, le C# ne réagit qu'au **front montant**
   pour les digitaux (ligne 1212, hors partie), sauf offsets +11, +15 et +93 lus comme des niveaux
   (lignes 1199-1210). Une impulsion suffit donc pour une commande.
5. Pour les niveaux de circuits (+71..+80), le SIMPL doit renvoyer le **niveau réel** : dès qu'une
   valeur arrive du slot 2, la table de scènes du JSON ne l'impose plus (voir `ApplySceneCircuitLevels`).
6. Ne pas oublier : sur une **sortie** du symbole EISC, le SIMPL voit à la fois l'appui brut recopié
   d'un écran et le feedback calculé par le C#, sur le **même numéro de join** (voir « Points à vérifier »).

---

### InitializeIntersystemBridge (lignes 658–691)

**À quoi ça sert**
Créer l'EISC vers le slot 2 et le brancher comme un écran. C'est l'équivalent, en C#, de poser
le symbole EISC dans SIMPL et de lui donner son IP-ID et son adresse.

**Comment ça marche**
1. Valeurs par défaut en dur : IP-ID `0xF0`, adresse `127.0.0.2`, pont actif (lignes 662-664).
2. Si `villa_config.json` contient `contrat.eisc`, on relit `actif`, `adresseIp` et `ipid` (lignes 665-675).
   Pour l'IP-ID, le texte `"0xF0"` est nettoyé du préfixe `0x`, puis converti en nombre hexadécimal (lignes 672-673).
3. Si `actif` vaut faux : message console et sortie, **aucun EISC n'est créé** (lignes 676-680).
4. Création de l'objet EISC (ligne 681).
5. Appel de `RegisterUserInterface(_eisc)` : l'EISC entre dans la liste des écrans et reçoit les
   mêmes événements (ligne 684).
6. Message console de succès (ligne 685). En cas d'erreur, message dans le journal d'erreurs du
   processeur (`ErrorLog`, ligne 689), le programme continue.

```csharp
_eisc = new EthernetIntersystemCommunications(ipid, ipAddress, this);
RegisterUserInterface(_eisc);
```

**Attention**
- `slotCible` (présent dans le JSON) n'est **pas lu** par ce code. Seule l'adresse compte.
- Si `ipid` est écrit sans guillemets dans le JSON (un nombre au lieu d'un texte), la conversion
  de la ligne 672 peut échouer : on tombe dans le `catch` et **le pont n'est pas créé**.
- Appelée au démarrage à la ligne 427, après l'enregistrement des écrans.

---

### MirrorSignalToEisc (lignes 698–770)

**À quoi ça sert**
Recopier vers le slot 2 ce qu'un **écran** vient d'envoyer (appui, curseur, texte). C'est un
« passe-plat » filtré. Elle est appelée pour **chaque** signal reçu, avant tout traitement métier
(ligne 1429).

**Comment ça marche**
1. Si l'EISC n'existe pas, ou si le signal vient de l'EISC lui-même : on sort (ligne 700).
2. **Filtre wellness** (lignes 702-714) : pour les digitaux 620-627 et les analogiques 62-65 :
   - on retrouve la pièce affichée par ce panel (ligne 705) ;
   - on sort si la pièce n'existe pas, si elle n'a pas de wellness, ou si c'est l'analogique 64 ou 65 (ligne 706) ;
   - pour l'analogique 62 (sauna) ou 63 (hammam), on sort si la valeur est hors des bornes min/max de la pièce (lignes 711-712).
3. **Blocs pièces, join ≥ 1000** (lignes 716-724) :
   - on calcule la pièce : `(join − 1000) / 100 + 1` (ligne 721) ;
   - on sort si la pièce est hors 1..30 (ligne 722) ;
   - on sort si la pièce n'a pas `intersystem` à vrai (ligne 723) ;
   - sinon on garde **le même numéro de join**, sans calcul.
4. **Sériel 43** (code d'alarme) : jamais recopié ici (lignes 725-730).
5. **Autres joins < 1000** : recopiés seulement s'ils sont dans la liste blanche (`IsGlobalMirrorSignal`, ligne 731).
6. **Contexte de pièce** (lignes 744-755) : si le signal est un « signal de pièce », le C# écrit
   d'abord sur l'**analogique 10** de l'EISC le numéro de la pièce affichée par ce panel. Sont concernés :
   - un digital **à l'état haut** dont le numéro est dans la table `V4DigitalOffsets`
     (ligne 1532) ou dans 211-220, 500-527, 530-557, 560-600 (télécommandes) ;
   - un analogique 21 ou présent dans `V4AnalogOffsets` (ligne 1546), sauf le 53.
   Le but, d'après le commentaire des lignes 740-743 : le SIMPL sait à quelle pièce s'applique
   un appui global, même si plusieurs écrans regardent des pièces différentes.
7. **Écriture** sur l'EISC, selon le type (digital, analogique, sériel), au même numéro (lignes 756-767).
8. Toute erreur est ignorée en silence (`catch` vide, ligne 769) : le miroir ne doit jamais bloquer le reste.

```csharp
int roomOfJoin = (int)((joinRaw - RoomBlockBase) / RoomBlockSize) + 1;
_eisc.BooleanInput[join].BoolValue = args.Sig.BoolValue;
```

**Joins concernés**
Blocs 1000-3999 (pièces 1..30), liste blanche `contrat.signauxGlobaux`, analogique 10 (contexte),
sériel 43 (exclu), digitaux 620-627 et analogiques 62-65 (wellness).

**Attention**
- L'appui est recopié **tel quel**, front montant **et** front descendant : le SIMPL voit l'appui
  pendant toute la durée où le doigt reste sur le bouton.
- La recopie a lieu **avant** que le C# ne décide si la commande est valide. Seuls les filtres
  ci-dessus peuvent l'empêcher.
- Le filtre wellness de l'étape 2 ne fait qu'**éliminer** ; un signal wellness accepté doit encore
  passer la liste blanche (étape 5). Dans le JSON actuel, 620-627 et 62-65 y figurent.

---

### IsGlobalMirrorSignal (lignes 777–784)

**À quoi ça sert**
Répondre « oui / non » : ce join global (< 1000) fait-il partie de la liste blanche
`contrat.signauxGlobaux` ?

**Comment ça marche**
1. Si la liste blanche n'a pas été chargée : réponse **oui** pour tout (ligne 779). C'est le
   comportement ancien (v2) : tout est recopié, pour que le pont ne tombe jamais.
2. Sinon, on cherche le join dans la table du bon type : digitale, analogique ou sérielle (lignes 780-782).
3. Type inconnu : non (ligne 783).

```csharp
if (!_mirrorWhitelistLoaded) return true;
```

**Attention**
La liste est construite par `BuildGlobalMirrorWhitelist` (lignes 502-556, hors partie). Elle est
considérée comme « chargée » dès qu'elle contient au moins un join (ligne 547). Un JSON avec une
liste presque vide réduit donc fortement la recopie.

---

### RegisterUserInterface (lignes 789–803)

**À quoi ça sert**
Enregistrer un appareil (écran tactile, XPanel ou EISC) sur le processeur et le brancher sur les
gestionnaires communs. C'est l'équivalent de déclarer l'IP-ID dans la table IP et de câbler ses sorties.

**Comment ça marche**
1. Abonne l'appareil à l'événement `SigChange` → méthode `OnTouchPanelSignalReceived` (ligne 791).
2. Abonne l'appareil à l'événement `OnlineStatusChange` → `OnTouchPanelOnlineStatusChange` (ligne 792).
3. Appelle `Register()` (ligne 793).
4. Si le résultat est « Success », ajoute l'appareil à `_touchPanels` et affiche un message (lignes 794-798).
5. Sinon, écrit une erreur avec le statut dans le journal (ligne 801).

```csharp
device.SigChange += new SigEventHandler(OnTouchPanelSignalReceived);
var result = device.Register();
```

**Attention**
Les abonnements sont faits **avant** `Register()`. Si l'enregistrement échoue, l'appareil n'est pas
dans `_touchPanels` (il ne recevra aucun feedback), mais ses gestionnaires restent branchés.

---

### OnTouchPanelOnlineStatusChange (lignes 805–849)

**À quoi ça sert**
Quand un écran (ou le slot 2 via l'EISC) **passe en ligne**, lui envoyer tout l'état actuel.
C'est l'équivalent SIMPL d'un rafraîchissement complet déclenché par le signal « online » du symbole.

**Comment ça marche**
1. On ne fait rien si l'appareil passe **hors ligne** (ligne 807).
2. On récupère la pièce mémorisée pour cet appareil, sinon la pièce **1** (ligne 813).
3. Si l'IP-ID est celui d'un **XPanel QR code** (0x11 à 0x2E, lignes 138-143), on force la pièce
   dédiée à cet IP-ID et on la mémorise (lignes 814-821).
4. On active `_forcePush` : les écritures de feedback se font même si la valeur n'a pas changé
   (lignes 824 et 98-118).
5. `UpdateScreenStateForPanel` envoie l'état « écran » de la pièce (ligne 827).
6. `PushAllRoomsFeedback` renvoie l'état de **toutes les pièces** sur leurs blocs, à **tous** les
   appareils (ligne 832). Donc l'arrivée d'un seul écran rafraîchit aussi l'EISC.
7. `_forcePush` est remis à faux, même en cas d'erreur (`finally`, ligne 834).
8. Sauf pour l'EISC, on publie l'empreinte de la configuration sur le sériel 106 (lignes 838-839).
   Le panel ne demandera le JSON complet que si l'empreinte diffère de son cache.
9. On envoie la pièce affichée par la dalle principale (analogique 240), le volume de la dalle
   (analogique 260) et son mute (digital 261) (lignes 842-846). **L'EISC les reçoit aussi.**

```csharp
_forcePush = true;
try { UpdateScreenStateForPanel(panel, roomId); PushAllRoomsFeedback(); }
finally { _forcePush = false; }
```

**Joins concernés** : sériel 106 (sortie), analogique 240 (sortie), analogique 260 (sortie), digital 261 (sortie),
plus tous les feedbacks de pièce.

**Attention**
- Pour le slot 2, « en ligne » veut dire : le programme SIMPL a démarré et l'EISC est connecté.
  À ce moment le C# pousse l'état complet de toutes les pièces exposées.
- `_forcePush` est une variable commune à tout le programme (pas une par appareil).

---

### BroadcastFeedbackToAll (lignes 863–872)

**À quoi ça sert**
Renvoyer tout le feedback à tout le monde, après un changement qui touche toute la villa
(alarme, mode vacances, partitions…).

**Comment ça marche**
1. Pour chaque appareil de `_touchPanels` **qui a une pièce mémorisée**, envoie l'état « écran »
   de cette pièce (lignes 866-870).
2. Renvoie le feedback de toutes les pièces sur leurs blocs (ligne 871).

```csharp
PushAllRoomsFeedback();
```

**Attention**
L'EISC est traité comme un écran : il reçoit l'état « écran » (analogique 10, sériel 10, etc.)
dès qu'il a une pièce mémorisée. Il en obtient une à la ligne 1425 dès que le slot 2 envoie son
premier signal.

---

### PulseGlobalDigitalToPanels (lignes 879–894)

**À quoi ça sert**
Envoyer une **impulsion** (haut puis bas) sur un digital global, soit à un seul écran, soit à tous
les écrans. Exemple : verdict du code d'alarme (joins 44 / 45), envoyé seulement à l'écran qui a
tapé le code (lignes 1396 et 1416).

**Comment ça marche**
1. Si un écran cible est donné et que ce n'est pas l'EISC : haut puis bas sur cet écran seul, puis sortie (lignes 881-886).
2. Sinon, pour chaque appareil de la liste **sauf l'EISC** : haut puis bas (lignes 888-893).

```csharp
target.BooleanInput[joinNumber].BoolValue = true;
target.BooleanInput[joinNumber].BoolValue = false;
```

**Attention**
- L'EISC ne reçoit **jamais** ces impulsions.
- Si la cible est l'EISC, on ne sort pas à l'étape 1 : l'impulsion part vers **tous les écrans**.
- Le haut et le bas sont écrits l'un après l'autre sans délai.

---

### PulseRoomDigital (lignes 901–913)

**À quoi ça sert**
Envoyer une impulsion sur un digital du **bloc d'une pièce**. Utilisée pour les stores groupés
(+1..+9) et les moteurs (+61..+78), par exemple lors d'une commande « tout ouvrir » (ligne 1086)
ou à la ligne 2200.

**Comment ça marche**
1. Sortie si la liste d'appareils ou la pièce n'existe pas (lignes 903-904).
2. Lit si la pièce est exposée au slot 2 (ligne 905).
3. Calcule le join : `1000 + (pièce − 1) × 100 + offset` (ligne 906).
4. Pour chaque appareil : on saute l'EISC si la pièce n'est pas exposée, sinon haut puis bas (lignes 907-912).

```csharp
uint join = RoomBlockStart(roomId) + offset;
```

**Joins concernés** : offsets +1..+9 et +61..+78 du bloc pièce, vers panels et slot 2.

**Attention**
Le commentaire (lignes 898-899) explique pourquoi on repasse **toujours** à bas : une impulsion
restée haute bloquait le moteur côté SIMPL. Comme pour la méthode précédente, pas de délai entre
haut et bas.

---

### LoadSceneCircuitLevels (lignes 920–955)

**À quoi ça sert**
Lire dans le JSON, pour une pièce, la table « niveau de chaque circuit pour chaque scène ».
C'est une table de presets d'éclairage.

**Comment ça marche**
1. Remet à zéro les 10 indicateurs « ce circuit a été remonté par le slot 2 » de la pièce (ligne 922).
2. Descend dans `pilotages.eclairages.scenes.niveaux`, en vérifiant chaque étage (lignes 925-930).
3. Si `niveaux` n'est pas un tableau : sortie, **pas de table** pour cette pièce (ligne 931).
4. Pour chaque scène (ligne 935), pour chaque circuit (ligne 940) : lit le nombre, le borne
   entre 0 et 65535 (lignes 942-945) et le range.
5. Enregistre la table dans `_sceneCircuitLevels` pour la pièce (ligne 949).
6. En cas d'erreur de lecture, simple avertissement dans le journal (ligne 953).

```csharp
if (v < 0) v = 0;
if (v > 65535) v = 65535;
```

**Exemple réel** (`villa_config.json`) : pièce 1 = 4 scènes × 10 circuits
(scène 1 = tout à 0, scène 4 = tout à 65535). Pièces 2 à 15 = 4 scènes × 4 circuits.

**Attention**
- La scène 1 du JSON est la ligne 0 du tableau (le C# compte à partir de 0).
- Un seul nombre mal écrit (texte, décimal non entier) fait perdre **toute** la table de la pièce.

---

### ApplySceneCircuitLevels (lignes 962–980)

**À quoi ça sert**
Quand une scène est choisie, recopier les niveaux de la table dans l'état de la pièce. Mais
**le slot 2 fait foi** : un circuit dont le SIMPL a déjà remonté le niveau réel n'est plus touché.

**Comment ça marche**
1. Sortie si la pièce ou sa table n'existe pas (lignes 964-965).
2. Sortie si le numéro de scène est hors 1..nombre de scènes, ou si la ligne est vide (lignes 968-970).
3. Récupère la pièce et ses indicateurs « venu du slot 2 » (lignes 972-973).
4. Traite le plus petit des deux nombres : circuits de la table ou circuits de la pièce (10) (ligne 974).
5. Pour chaque circuit : si le slot 2 l'a déjà remonté, on saute ; sinon on écrit le niveau (lignes 975-979).

```csharp
if (duSlot2 != null && duSlot2[i]) continue;   // le slot 2 détient la vérité
```

**Joins concernés** : indirectement les analogiques +71..+80 du bloc pièce. L'indicateur
« venu du slot 2 » passe à vrai lignes 1322-1323 (hors partie), quand l'EISC écrit sur ces joins.

**Attention**
- Cette méthode **ne pousse aucun feedback** : elle modifie seulement la mémoire. L'envoi est fait par l'appelant.
- Pour les pièces 2 à 15, la table n'a que 4 colonnes : les circuits 5 à 10 gardent leur niveau
  (32768 au démarrage, ligne 46).
- Une fois qu'un circuit a été remonté par le slot 2, plus aucune scène ne le modifie côté C#,
  jusqu'au prochain `LoadSceneCircuitLevels`.

---

### BuildVillaRoomsDatabase (lignes 982–1045)

**À quoi ça sert**
Construire le registre des pièces (`_roomsRegistry`) à partir de `villa_config.json` :
nom, wellness, état CVC initial, exposition au slot 2, table de scènes.

**Comment ça marche**
1. Crée un registre vide (ligne 984).
2. Si le JSON contient un tableau `pieces` (ligne 987), pour chaque pièce, dans un `try` (lignes 994-1033) :
   1. lit `id` ; s'il manque, prend « nombre de pièces déjà lues + 1 » (ligne 996) ;
   2. ignore la pièce si l'id est hors 1..30 (lignes 997-1001) ;
   3. lit `nom`, sinon « Pièce N » ; ajoute la pièce si l'id n'existe pas encore (lignes 1002-1004) ;
   4. **wellness** : si sauna **et** hammam sont actifs, marque le wellness disponible, copie les
      bornes (sauna × 10, hammam tel quel) et les consignes (lignes 1006-1013) ;
   5. **CVC** : lit `etatInitial.marche` et `etatInitial.ventilation` (lignes 1014-1019) ;
   6. **intersystem** : vrai si le champ est absent ou vaut vrai ; mémorisé dans `_roomEiscEnabled`
      et compté (lignes 1022-1024) ;
   7. charge la table de scènes et applique la scène active (scène 1 au démarrage) (lignes 1027-1028).
3. Une pièce mal écrite est signalée et ignorée, les autres continuent (lignes 1030-1033).
4. Si au moins une pièce a été créée : message console avec le nombre de pièces et le nombre
   exposées au slot 2, puis sortie (lignes 1035-1040).
5. Sinon : erreur dans le journal et **repli** sur `BuildFallbackRoomsDatabase` (lignes 1041-1044).
   Le repli est aussi utilisé si le JSON n'a pas de tableau `pieces`.

```csharp
bool eiscOn = piece["intersystem"] == null || (bool)piece["intersystem"];
```

**Exemple réel** : 15 pièces, toutes `"intersystem": true`, wellness sur la pièce 13
(sauna 60-100, consigne 80 ; hammam 90-100, consigne 95), CVC `marche: true, ventilation: 0` partout.

**Attention**
- La seule façon de retirer une pièce du slot 2 est d'écrire `"intersystem": false`. L'absence du champ l'expose.
- Si une erreur arrive **après** l'ajout de la pièce (par exemple `intersystem` écrit `"oui"`), la pièce
  reste dans le registre mais sans entrée dans `_roomEiscEnabled` : elle sera considérée **non exposée**
  (tests `ContainsKey` lignes 723, 905) et sans table de scènes.
- Deux pièces avec le même `id` : la seconde ne crée pas de pièce mais **réapplique** ses réglages sur la première.
- `_roomEiscEnabled` n'est pas vidé au début : sans importance au démarrage, à surveiller si la méthode était rappelée.

---

### BuildFallbackRoomsDatabase (lignes 1051–1066)

**À quoi ça sert**
Créer une liste de pièces « de secours » quand le JSON est absent ou inutilisable, pour que les
écrans et le slot 2 fonctionnent quand même.

**Comment ça marche**
1. Crée le registre s'il n'existe pas (ligne 1053).
2. Liste fixe de 10 noms (lignes 1055-1058).
3. Pour les pièces 1 à 10 : ajoute la pièce si elle manque, et la marque **exposée au slot 2** (lignes 1060-1065).

```csharp
_roomEiscEnabled[i] = true;
```

**Attention**
- Aucune table de scènes n'est chargée : choisir une scène ne change pas les circuits.
- Aucun wellness, CVC initial par défaut.
- Le nom de la pièce 9 contient une coquille : `"Terrasse extrieure"` (ligne 1057).
- Aussi appelée à la ligne 358 (hors partie) si `BuildVillaRoomsDatabase` plante.

---

### Points à vérifier (partie)

| Ligne | Point | Raison |
|---|---|---|
| 754 et 1865 | Conflit possible sur l'**analogique 10** de l'EISC | `MirrorSignalToEisc` y écrit la pièce du **panel qui agit**, mais `UpdateScreenStateForPanel` (appelée pour l'EISC à la mise en ligne et par `BroadcastFeedbackToAll`) y écrit la pièce **mémorisée pour l'EISC**. Le SIMPL peut lire une pièce qui n'est pas celle de l'appui. |
| 759 et 1115 | Même join EISC pour l'**appui recopié** et le **feedback** | Exemple bloc pièce +21 : l'appui du panel est recopié (haut puis bas au relâchement) et `PushRoomFeedback` écrit l'état de la scène sur le même join. Le relâchement peut effacer le feedback vu par le SIMPL. Idem pour les globaux bidirectionnels (51-54, 150-154…). À valider en debugger SIMPL. |
| 883-884, 891-892, 910-911 | Impulsion haut/bas sans délai | Vérifier sur le CP4 que le slot 2 et les panels voient bien le front montant quand les deux écritures se suivent immédiatement. |
| 881 | Cible = EISC → impulsion vers tous les écrans | Le test `target != _eisc` fait tomber dans la boucle générale. Vérifier que ce cas n'arrive jamais (appelants lignes 1396 et 1416). |
| 890 | Commentaire « l'EISC est servi par le miroir » | Les verdicts 44 / 45 sont produits par le C#, pas par un appui de panel : le miroir ne les recopie donc pas. Vérifier si le slot 2 en a besoin. |
| 813 | Pièce par défaut = 1 au lieu de `DefaultRoomForPanel` | Hors XPanel QR, sans conséquence aujourd'hui ; incohérent avec les lignes 705 et 753. |
| 807 | Passage hors ligne non traité | Rien n'est fait quand un écran ou l'EISC se déconnecte (aucun message, aucun nettoyage). |
| 672-673 | Lecture de `ipid` en texte uniquement | Un `ipid` numérique dans le JSON fait échouer la création du pont (catch ligne 687). |
| 1007 | Wellness exige sauna **et** hammam actifs | Une pièce avec seulement un sauna n'aurait aucun wellness. Vérifier si c'est voulu. |
| 1010-1011 | Échelles différentes sauna / hammam | Sauna × 10 (°C × 10), hammam non multiplié (% humidité). Le filtre des lignes 711-712 compare avec ces bornes : le SIMPL doit utiliser les mêmes échelles. |
| 931, 949 | Table de scènes non supprimée si absente | Si la méthode est rappelée pour une pièce qui n'a plus de table, l'ancienne table reste dans `_sceneCircuitLevels`. |
| 1022, 1030 | Pièce ajoutée mais non exposée en cas d'erreur | Une erreur après la ligne 1004 laisse la pièce dans le registre, sans `_roomEiscEnabled` ni table de scènes. |
| 1057 | Coquille « Terrasse extrieure » | Nom visible sur les écrans en mode repli. |
| 748 | Analogique 53 exclu du contexte de pièce | Aucun commentaire n'explique l'exclusion ; `V4AnalogOffsets` contient 53 (ligne 1548). |
| 702-706 | Filtre wellness basé sur la pièce **affichée** par le panel | Si le panel affiche une autre pièce que la pièce 13, les commandes 620-627 ne sont pas recopiées. À confirmer avec l'usage réel des pages Wellness. |

### Joins de cette partie

| Type | Join ou plage | Sens | Rôle |
|---|---|---|---|
| Digital / analogique / sériel | 1000-3999 (bloc pièce = 1000 + (id−1)×100 + offset, pièces 1..30) | panel → slot 2 (miroir) ; slot 1 → panels et slot 2 (feedback) ; slot 2 → slot 1 (commandes) | Blocs de 100 joins par pièce, identiques côté GUI et EISC ; filtrés par `intersystem` |
| Digital | bloc +1..+9 | slot 1 → panels et slot 2 (impulsion) | Stores groupés, via `PulseRoomDigital` |
| Digital | bloc +61..+78 | slot 1 → panels et slot 2 (impulsion) | Moteurs 1..6 (Monter/Stop/Descendre), via `PulseRoomDigital` |
| Analogique | bloc +71..+80 | slot 2 → slot 1 | Niveau réel des circuits ; bloque la table de scènes (`ApplySceneCircuitLevels`) |
| Digital / analogique / sériel | < 1000 listés dans `contrat.signauxGlobaux` | panel → slot 2 | Signaux globaux recopiés 1:1 par `MirrorSignalToEisc` |
| Analogique | 10 | slot 1 → slot 2 | Contexte : pièce du panel qui envoie une commande de pièce (l. 754) ; aussi pièce active (l. 1865) |
| Sériel | 43 | panel → slot 1 | Code d'alarme saisi ; **exclu** du miroir (relais dédié) |
| Digital | 44, 45 | slot 1 → panel demandeur | Verdict code d'alarme, via `PulseGlobalDigitalToPanels` ; jamais vers l'EISC |
| Digital | 620-627 | panel → slot 2 | Wellness sauna/hammam ; recopiés seulement si la pièce du panel a le wellness |
| Analogique | 62, 63 | panel → slot 2 | Consignes sauna (×10) et hammam ; recopiées seulement dans les bornes |
| Analogique | 64, 65 | — | Mesures wellness ; jamais recopiées depuis un panel |
| Digital | 211-220, 500-527, 530-557, 560-600 | panel → slot 2 | Télécommandes ; déclenchent aussi l'analogique 10 de contexte |
| Sériel | 106 | slot 1 → panels (pas l'EISC) | Empreinte de la configuration à la mise en ligne |
| Analogique | 240 | slot 1 → panels et slot 2 | Pièce affichée par la dalle principale, à la mise en ligne |
| Analogique | 260 | slot 1 → panels et slot 2 | Volume matériel de la dalle, à la mise en ligne |
| Digital | 261 | slot 1 → panels et slot 2 | Mute matériel de la dalle, à la mise en ligne |

---

## Partie D — Blocs de pièces, retours d'état et alarme

Cette partie couvre les lignes **1070 à 1419** de `ControlSystem.cs`. Elle traite trois sujets :

1. le **bloc de joins par pièce** : chaque pièce possède sa propre tranche de 100 joins ;
2. le **retour d'état** (feedback) : le programme écrit l'état d'une pièce vers les panneaux et vers le slot 2 ;
3. le **code d'alarme** : saisie sur le pavé, envoi à la centrale, délai d'attente, verdict.

### Petit lexique C# pour cette partie

| Terme C# | Ce que ça veut dire | Équivalent SIMPL le plus proche |
|---|---|---|
| `private void Nom(...)` | Une **méthode** : un bloc de code réutilisable, appelé par son nom. `void` = ne renvoie rien. | Un module ou une sous-routine SIMPL+ |
| `private uint Nom(...)` | Méthode qui **renvoie** un nombre entier positif (`uint`). | Une fonction SIMPL+ `INTEGER_FUNCTION` |
| `uint`, `ushort`, `int` | Types de nombres. `ushort` = 0..65535, comme un signal analogique. | Signal analogique |
| `bool` | Vrai / faux. | Signal digital |
| `string` | Texte. | Signal sériel |
| `foreach (var x in liste)` | Répète le bloc pour chaque élément de la liste. | Boucle `FOR` en SIMPL+ |
| `for (uint s = 0; s < 4; s++)` | Répète le bloc avec `s` = 0, 1, 2, 3. | `FOR s = 0 TO 3` |
| `if / else if / else` | Tests enchaînés. | Symbole « Analog Equate » / logique conditionnelle |
| `return;` | Quitte la méthode tout de suite. | — |
| `a ? b : c` | « si a alors b sinon c ». | — |
| `%` | Reste de la division entière (modulo). | `MOD` en SIMPL+ |
| `_nom` | Convention : **variable de la classe**, gardée en mémoire entre deux appels. | Variable globale SIMPL+ |
| `Dictionary` (ex. `_roomsRegistry`) | Table « clé → valeur ». Ici : numéro de pièce → état de la pièce. | Tableau indexé |
| `try { } catch { }` | Essaie le code ; en cas d'erreur, exécute `catch` au lieu de planter. | — |
| `CTimer` | Minuterie Crestron qui appelle une méthode après un délai. | Symbole **Delay** / `WAIT` SIMPL+ |
| `BasicTriList` | Un périphérique avec digitaux, analogiques et sériels : panneau, XPanel ou EISC. | Une dalle ou un EISC dans la liste des périphériques |
| `SetBool / SetUShort / SetString` | Méthodes du projet (lignes 102–120) : écrivent un digital / analogique / sériel **seulement si la valeur change** (sauf rafraîchissement forcé `_forcePush`). | Écriture d'une sortie vers la dalle |

---

### Comment se calcule le bloc de joins d'une pièce

Constantes (lignes 263–265) : `RoomBlockBase = 1000`, `RoomBlockSize = 100`, `RoomBlockMaxRoom = 30`.

**Formule :**

```
début du bloc = 1000 + (numéro de pièce − 1) × 100
join physique = début du bloc + offset
```

L'**offset** est la position du signal dans le bloc (0 à 99). Il est le même pour toutes les pièces. Exemple : l'offset +22 est toujours « scène d'éclairage 2 ».

**Exemple pièce 1**
- Début du bloc = 1000 + (1 − 1) × 100 = 1000 + 0 = **1000**
- Scène d'éclairage 2 (offset +22) → join **1022**
- Consigne de température (analogique +31) → join **1031**
- Plage de la pièce : 1000 à 1099

**Exemple pièce 3**
- Début du bloc = 1000 + (3 − 1) × 100 = 1000 + 200 = **1200**
- Scène d'éclairage 2 (offset +22) → join **1222**
- Consigne de température (analogique +31) → join **1231**
- Plage de la pièce : 1200 à 1299

**Calcul inverse** (quand un join arrive, lignes 1188–1189) :

```
pièce  = (join − 1000) ÷ 100 (division entière) + 1
offset = (join − 1000) MOD 100
```

Pour le join 1222 : (1222 − 1000) = 222 ; 222 ÷ 100 = 2 → pièce 2 + 1 = **3** ; 222 MOD 100 = **22**.

```
  join 1222
     |
     v
  1222 - 1000 = 222
     |                    \
  222 / 100 = 2            222 MOD 100 = 22
  2 + 1 = pièce 3          offset +22 = scène d'éclairage 2
```

---

### RoomBlockStart (lignes 1070–1073)

**À quoi ça sert**
Donne le premier join du bloc d'une pièce.

**Comment ça marche**
1. Reçoit le numéro de pièce `roomId`.
2. Applique la formule 1000 + (roomId − 1) × 100.
3. Renvoie le résultat.

```csharp
return RoomBlockBase + (uint)(roomId - 1) * RoomBlockSize;
```

`(uint)` convertit le nombre en entier positif avant le calcul.

**Attention**
Aucun contrôle sur `roomId` ici. Une pièce 0 ou négative donnerait un résultat faux. Les appelants (lignes 906 et 1106) vérifient d'abord que la pièce existe dans `_roomsRegistry`.

---

### PulseAllMotorsInAllRooms (lignes 1080–1088)

**À quoi ça sert**
Commande générale des stores : envoie une impulsion « Monter » ou « Descendre » aux 6 moteurs de **toutes** les pièces.

**Comment ça marche**
1. Si la liste des pièces n'existe pas encore, on sort.
2. Pour chaque pièce connue :
3. Pour chaque moteur `m` de 0 à 5 :
   - si `opening` est vrai : offset = 61 + m × 3 (Monter) ;
   - sinon : offset = 63 + m × 3 (Descendre).
4. Appelle `PulseRoomDigital` (ligne 901), qui met le join à 1 puis à 0 sur tous les périphériques (l'EISC seulement si la pièce a `intersystem` activé).

```csharp
PulseRoomDigital(id, (opening ? (uint)61 : (uint)63) + m * 3);
```

**Joins concernés**
Chaque moteur occupe un triplet Monter / Stop / Descendre :

| Moteur | Monter | Stop | Descendre | Pièce 1 (Monter / Descendre) | Pièce 3 (Monter / Descendre) |
|---|---|---|---|---|---|
| 1 | +61 | +62 | +63 | 1061 / 1063 | 1261 / 1263 |
| 2 | +64 | +65 | +66 | 1064 / 1066 | 1264 / 1266 |
| 6 | +76 | +77 | +78 | 1076 / 1078 | 1276 / 1278 |

**Attention**
L'offset Stop (+62, +65…) n'est jamais envoyé par cette méthode. Elle est appelée aux lignes 1716, 1722, 1768 et 2252 (hors de cette partie).

---

### PushRoomFeedback (lignes 1097–1170)

**À quoi ça sert**
C'est le **retour d'état** d'une pièce. La méthode lit l'état mémorisé de la pièce (`RoomState`) et l'écrit sur le bloc de joins de cette pièce, vers tous les périphériques : dalle, iPad, iPhone, XPanel et EISC du slot 2.

**Comment ça marche**
1. Sort si la liste des périphériques ou la pièce n'existe pas (lignes 1099–1100).
2. Regarde si la pièce a le drapeau `intersystem` (ligne 1101). Sinon, l'EISC du slot 2 ne recevra rien pour cette pièce.
3. Calcule `b`, le début du bloc (ligne 1106).
4. Pour chaque périphérique (ligne 1110) :
   1. saute l'EISC si `intersystem` est faux (ligne 1112) ;
   2. écrit les **digitaux** (lignes 1114–1131) ;
   3. écrit les digitaux CVC et bien-être, puis les **analogiques** (lignes 1137–1149) ;
   4. écrit les **sériels** (lignes 1152–1155).
5. Deuxième boucle (lignes 1162–1167) : pour chaque panneau (pas l'EISC) qui **affiche** cette pièce, appelle `UpdateScreenStateForPanel`. Ce second envoi écrit l'état sur les **joins globaux** (51-54, 150-156, 31…), car la GUI lit aujourd'hui ses retours d'état là.
6. Toute erreur est ignorée en silence (ligne 1169).

```csharp
SetBool(dev, b + 21 + s, room.ActiveScene == s + 1);
```

Cette ligne veut dire : « le digital de la scène `s+1` est à 1 seulement si c'est la scène active ». C'est un **interlock** calculé.

**Joins concernés (sorties, offset à ajouter à `b`)**

| Type | Offset | Contenu écrit |
|---|---|---|
| Digital | +11, +12, +15, +16 | Sauna / hammam marche-arrêt (seulement si la pièce a le bien-être) |
| Digital | +21..+24 | Scène d'éclairage active 1..4 (interlock) |
| Digital | +41..+44 | Scène de stores active 1..4 (état interne 201..204) |
| Digital | +45 | A/V éteint : vrai si source vidéo = 0 **et** pas de musique |
| Digital | +50 | Mute audio |
| Digital | +51..+55 | Source vidéo active 0..4 (interlock, +51 = OFF) |
| Digital | +56 | Musique sur les haut-parleurs |
| Digital | +57 | Audio = source vidéo (inverse de +56) |
| Digital | +81..+92 | Partitions d'alarme 1..4 : triplets Armé / Partiel / Désarmé |
| Digital | +93..+98 | CVC : +93 marche, +94 arrêt, +95..+98 vitesse de ventilation (via `Hvac.Selected`) |
| Analogique | +31 | Consigne (× 10 : 215 = 21,5 °C) |
| Analogique | +33 | Vitesse de ventilation |
| Analogique | +34..+37 | Valeurs bien-être (si disponible) |
| Analogique | +51 | Source vidéo active |
| Analogique | +52 | Volume audio |
| Analogique | +53 | Source audio : 5 si musique, sinon la source vidéo |
| Analogique | +54 | Volume média |
| Analogique | +71..+80 | Niveaux des 10 circuits d'éclairage |
| Sériel | +10 | Nom de la pièce |
| Sériel | +32 | Température mesurée, texte à 1 décimale |
| Sériel | +33 | Mode : « ARRÊT », « CHAUFFAGE » ou « CLIMATISATION » |
| Sériel | +34 | Consigne, texte à 1 décimale |
| Sériel | +44..+47 | Textes bien-être (offset analogique + 10) |

Exemple chiffré : la pièce 3 est sur la source vidéo 2. Le programme met le digital **1253** à 1 (1200 + 51 + 2), les digitaux 1251, 1252, 1254, 1255 à 0, et l'analogique **1251** à 2.

**Attention**
- Le mode « CHAUFFAGE » ou « CLIMATISATION » (ligne 1154) se déduit seulement de la comparaison consigne / température mesurée. Ce n'est pas un état remonté par le matériel.
- Un même numéro peut porter deux types différents (ex. +33 analogique = ventilation, +33 sériel = mode). En SIMPL, digitaux, analogiques et sériels sont des plages séparées : il n'y a pas de conflit.
- `SetBool` n'écrit que les changements. Un panneau qui se reconnecte ne reçoit tout que pendant un rafraîchissement forcé (`_forcePush`, hors de cette partie).

---

### PushAllRoomsFeedback (lignes 1172–1177)

**À quoi ça sert**
Rafraîchit le retour d'état de **toutes** les pièces.

**Comment ça marche**
1. Sort si la liste des pièces n'existe pas.
2. Appelle `PushRoomFeedback` pour chaque pièce.

```csharp
foreach (var id in _roomsRegistry.Keys) PushRoomFeedback(id);
```

Appelée notamment par `BroadcastFeedbackToAll` (ligne 871) et aux lignes 439 et 832.

---

### ProcessRoomBlockSignal (lignes 1185–1219)

**À quoi ça sert**
Point d'entrée **unique** de tous les joins ≥ 1000 reçus, qu'ils viennent d'un panneau ou de l'EISC du slot 2. L'appel se fait ligne 1437, dès que `args.Sig.Number >= RoomBlockBase`.

`SigEventArgs args` = l'événement reçu : `args.Sig.Number` est le numéro de join, `args.Sig.Type` son type, `BoolValue` / `UShortValue` sa valeur.

**Comment ça marche**
1. Décode la pièce et l'offset à partir du join (lignes 1188–1189, voir le calcul plus haut).
2. Ignore le join si la pièce est hors 1..30 (ligne 1192). Au-delà, ce sont des joins réservés au firmware.
3. Ignore le join si la pièce n'existe pas dans la configuration (ligne 1193).
4. Ignore le join s'il vient de l'EISC et que la pièce n'a pas `intersystem` (ligne 1195).
5. Si c'est un **digital** :
   1. Sauna (+11) ou hammam (+15) venant du slot 2 : la valeur est recopiée telle quelle (1 et 0), puis retour d'état (lignes 1199–1204).
   2. Retour « CVC en marche » (+93) venant du slot 2 : même principe, niveau recopié, fronts montant **et** descendant (lignes 1206–1211).
   3. Pour tout le reste : seul le **front montant** compte (ligne 1212), puis appel de `ApplyRoomDigitalCommand`.
6. Si c'est un **analogique** : appel de `ApplyRoomAnalogCommand` (ligne 1217).
7. Les sériels ne sont pas traités ici.

```csharp
if (!args.Sig.BoolValue) return; // front montant uniquement
```

**Attention**
Dans `villa_config.json`, `contrat.blocsPiecesGui.actif` vaut `false` depuis le 15.09.2026. Le commentaire ligne 1522 confirme que la GUI n'émet plus sur les blocs. En pratique, les joins ≥ 1000 viennent donc surtout du slot 2.

---

### ApplyRoomDigitalCommand (lignes 1226–1293)

**À quoi ça sert**
La logique d'un **appui** (digital) sur une pièce. Elle modifie l'état mémorisé de la pièce, pilote parfois le matériel, puis renvoie le retour d'état.

**Comment ça marche**
1. Récupère l'état de la pièce et écrit une trace (lignes 1228–1230).
2. **Impulsions sans état** : offsets +1..+9 (stores groupés) et +58..+78 (transport média et moteurs). Rien n'est fait ici, on sort (lignes 1236–1240). Le relais vers le slot 2 est déjà fait ailleurs par `MirrorSignalToEisc`.
3. Sinon, selon l'offset :

| Offset | Action |
|---|---|
| +21..+24 | Scène d'éclairage 1..4 mémorisée, puis niveaux de circuits appliqués (`ApplySceneCircuitLevels`) |
| +35 | Consigne + 0,5 °C (+5), plafond 28,0 °C (280) |
| +36 | Consigne − 0,5 °C (−5), plancher 16,0 °C (160) |
| +41..+44 | Scène de stores 1..4 (mémorisée 201..204) |
| +45 | Extinction A/V : source 0, musique coupée, commande TV Sony, routage audio |
| +50 | Mute : inverse l'état (toggle) |
| +51..+55 | Source vidéo 0..4 (+51 = OFF). Si 0, la musique est aussi coupée. Commande TV + routage audio |
| +56 | Musique sur les haut-parleurs + routage audio |
| +57 | L'audio suit la source vidéo + routage audio |
| +11..+18 | Bien-être, traité par `room.Wellness.Apply` (si disponible) |
| +93..+98 | CVC, traité par `room.Hvac.Apply` : +93 marche, +94 arrêt, +95..+98 ventilation |
| +81..+92 | Partitions d'alarme : calcule la partition et l'action, appelle `ApplyAlarmPartition`, puis rafraîchit **tout** (`BroadcastFeedbackToAll`) et sort |
| autre | Ignoré, pas de retour d'état |

4. Pour tous les cas traités sauf l'alarme : appel de `PushRoomFeedback` (ligne 1292).

Calcul des partitions (lignes 1284–1285) :

```csharp
uint partIdx = (offset - 81) / 3;  uint actionType = (offset - 81) % 3;
```

Exemple : offset +86 → (86 − 81) = 5 → partition 5 ÷ 3 = 1 (donc la **partition 2**), action 5 MOD 3 = 2 (**Désarmer**).

**Attention**
- `Math.Min` et `Math.Max` servent de butées : la consigne ne dépasse jamais 280 ni ne descend sous 160.
- `else if (room.Wellness.Apply(offset)) { }` : la méthode `Apply` fait le travail et renvoie vrai si elle a reconnu l'offset. Les accolades vides sont normales.

---

### ApplyRoomAnalogCommand (lignes 1298–1329)

**À quoi ça sert**
La logique d'une **valeur analogique** reçue pour une pièce.

**Comment ça marche**
1. Récupère l'état de la pièce (ligne 1300).
2. Selon l'offset :

| Offset | Action | Contrôle |
|---|---|---|
| +31 | Consigne CVC | Refusée hors 160..280 |
| +32 | Température mesurée (× 10), envoyée par le slot 2 | Aucun |
| +33 | Vitesse de ventilation | Refusée si `Hvac.SetFan` la rejette |
| +34..+37 | Valeurs bien-être | +36 et +37 acceptés **seulement** depuis l'EISC ; refus si `Wellness.SetValue` rejette |
| +51 | Source vidéo + commande TV Sony | Aucun |
| +52 | Volume audio | Aucun |
| +53 | Source audio : 5 = musique, sinon l'audio suit la vidéo ; routage audio | Aucun |
| +54 | Volume média | Aucun |
| +71..+80 | Niveau du circuit 1..10. S'il vient du slot 2, le circuit est marqué « niveau réel » : les scènes du fichier de configuration ne l'écraseront plus | Aucun |
| autre | Ignoré | — |

3. Trace, puis `PushRoomFeedback` (lignes 1327–1328).

```csharp
if (offset == 31) { if (val < 160 || val > 280) return; room.TargetTemperature = val; }
```

**Attention**
Un `return` dans un contrôle (ex. consigne hors plage) sort **sans** retour d'état : le panneau garde l'ancienne valeur affichée.

---

### ApplyAlarmPartition (lignes 1336–1343)

**À quoi ça sert**
Change l'état d'une partition d'alarme (1 à 4). Les partitions sont **communes à toute la villa** : l'état est copié dans chaque pièce.

**Comment ça marche**
1. Sort si la partition est > 3 (index 0..3) ou si la liste des pièces n'existe pas.
2. Traduit l'action en état :
   - action 0 (Armer) → état **1** ;
   - action 1 (Partiel) → état **2** ;
   - action 2 (Désarmer) → état **0**.
3. Écrit cet état dans `PartitionStates` de **toutes** les pièces.
4. Écrit une trace.

```csharp
ushort newState = (ushort)(actionType == 0 ? 1 : (actionType == 1 ? 2 : 0));
```

**Attention**
Cette méthode ne fait que **mémoriser** l'état. Elle n'envoie aucune commande à la centrale. Le retour d'état est fait par l'appelant (`BroadcastFeedbackToAll`, ligne 1287).

---

### Le code d'alarme : vue d'ensemble

**Principe** (commentaire lignes 1345–1351) : le C# ne connaît pas le vrai code. Il **relaie** la saisie à la centrale via le slot 2 et attend son verdict. Si le slot 2 ne répond pas à temps, le C# tranche lui-même avec un code de secours lu dans `villa_config.json` (`contrat.alarme.codeParDefaut`).

**Réglages** (lignes 283–292 et 575–580) :

| Élément | Valeur |
|---|---|
| Sériel 43 `AlarmCodeEntryJoin` | Code saisi (entrée panneau, relais vers l'EISC) |
| Digital 44 `AlarmCodeOkJoin` | Code accepté (impulsion) |
| Digital 45 `AlarmCodeKoJoin` | Code refusé (impulsion) |
| Digital 46 `AlarmCodeClearJoin` | Touche C : efface la saisie |
| Délai `_alarmPanelReplyMs` | 1200 ms par défaut ; `delaiReponseCentraleMs` du JSON accepté seulement entre 200 et 2200 ms |
| Code de secours `_alarmReferenceCode` | Vide par défaut ; lu depuis `codeParDefaut` (valeur actuelle du JSON : `"1234"`) |
| Abandon côté GUI | 2500 ms (« CENTRALE INJOIGNABLE ») |

**Mémoire du C# pendant une saisie** :
- `_alarmPendingCode` : le code en attente de verdict ;
- `_alarmVerdictPending` : vrai tant qu'on attend ;
- `_alarmCodeRequester` : le panneau qui a tapé le code (seul lui recevra le verdict) ;
- `_alarmCodeTimer` : la minuterie en cours.

### Schéma

```
 PANNEAU (dalle / iPad / XPanel)         C# slot 1                        SIMPL slot 2 + centrale
 --------------------------------        -----------------------------    -----------------------
  appui E : sériel 43 = "4821"  ----->   ProcessAlarmCodeEntry
                                          - arrête l'ancienne minuterie
                                          - mémorise code + panneau
                                          - EISC sériel 43 = ""
                                          - EISC sériel 43 = "4821"  ---->  la centrale compare
                                          - lance CTimer 1200 ms
                                                 |
               +---------------------------------+----------------------------------+
               |                                                                    |
   CAS A : réponse avant 1200 ms                                  CAS B : aucune réponse en 1200 ms
               |                                                                    |
   EISC digital 44 (ok) ou 45 (refus) <---------------------------                  |
   -> OnAlarmCodeVerdictFromPanelSystem                           OnAlarmCodeTimeout
      - arrête la minuterie                                        - compare "4821" au codeParDefaut
      - efface le code en attente                                  - (code de secours vide = refus)
               |                                                                    |
               +-------------------------------+------------------------------------+
                                               |
                               PulseGlobalDigitalToPanels
                               impulsion digital 44 ou 45
                               vers LE panneau demandeur seulement
                                               |
  <--------------------------------------------+
  44 : ouvre l'écran des partitions
  45 : message « code refusé »

  (Touche C = digital 46 : arrête la minuterie et efface tout, lignes 1650-1655)
  (La GUI abandonne d'elle-même après 2500 ms : le C# répond toujours avant, au plus tard à 2200 ms)
```

---

### StopAlarmCodeTimer (lignes 1353–1361)

**À quoi ça sert**
Arrête et oublie la minuterie d'attente du verdict, si elle existe.

**Comment ça marche**
1. Si une minuterie existe (`!= null` = « n'est pas vide ») :
2. l'arrête ; une erreur éventuelle est ignorée ;
3. met la variable à `null` (vide).

```csharp
try { _alarmCodeTimer.Stop(); } catch { }
```

Équivalent SIMPL : faire un `CANCELWAIT`.

---

### ProcessAlarmCodeEntry (lignes 1363–1385)

**À quoi ça sert**
Reçoit le code tapé sur un panneau et l'envoie à la centrale via l'EISC. Appelée ligne 1510 quand le sériel 43 arrive.

**Comment ça marche**
1. Si le sériel vient de l'EISC lui-même : on ignore (ligne 1365).
2. Arrête une éventuelle attente précédente (ligne 1366).
3. Mémorise le code sans espaces autour (`Trim`), note « verdict en attente » et retient le panneau demandeur (lignes 1367–1369).
4. Si l'EISC existe : écrit d'abord `""` puis le code sur le sériel 43 de l'EISC (lignes 1377–1378). Le passage par une chaîne vide force un événement côté SIMPL, même si on retape le même code.
5. Écrit une trace (lignes 1382–1383).
6. Lance une minuterie : dans `_alarmPanelReplyMs` millisecondes, `OnAlarmCodeTimeout` sera appelée (ligne 1384).

```csharp
_alarmCodeTimer = new CTimer(OnAlarmCodeTimeout, (long)_alarmPanelReplyMs);
```

**Joins concernés** : sériel 43 (entrée panneau → sortie EISC).

**Attention**
Si l'EISC n'existe pas, le code n'est envoyé nulle part, mais la minuterie est quand même lancée : le verdict viendra du repli local.

---

### OnAlarmCodeTimeout (lignes 1387–1407)

**À quoi ça sert**
Appelée par la minuterie quand le slot 2 n'a pas répondu à temps. Elle tranche **en local**.

**Comment ça marche**
1. Si plus aucun verdict n'est attendu (réponse déjà reçue ou touche C) : on sort (ligne 1391).
2. Note qu'on n'attend plus (ligne 1392).
3. Compare : accepté seulement si le code de secours n'est **pas vide** et est **identique** au code tapé (ligne 1393).
4. Efface le code en attente et écrit une trace.
5. Envoie une impulsion 44 (accepté) ou 45 (refusé) **au panneau demandeur** (ligne 1396).
6. Oublie le panneau demandeur.
7. En cas d'erreur : message dans le journal d'erreurs du processeur (ligne 1401).
8. Dans tous les cas (`finally` = « exécuté à la fin quoi qu'il arrive ») : la minuterie est oubliée (ligne 1405).

```csharp
bool accepte = !string.IsNullOrEmpty(_alarmReferenceCode) && _alarmPendingCode == _alarmReferenceCode;
```

`object userSpecific` est un paramètre imposé par `CTimer` ; il n'est pas utilisé.

**Attention**
Vider `codeParDefaut` dans le JSON (`""`) désactive le repli : sans réponse du slot 2, tout code est refusé.

---

### OnAlarmCodeVerdictFromPanelSystem (lignes 1410–1418)

**À quoi ça sert**
Traite le verdict de la **vraie centrale**, reçu du slot 2. Appelée lignes 1643 (digital 44 → `true`) et 1647 (digital 45 → `false`), uniquement si le digital vient de l'EISC.

**Comment ça marche**
1. Arrête la minuterie : le repli local n'aura pas lieu (ligne 1412).
2. Note qu'on n'attend plus et efface le code (lignes 1413–1414).
3. Écrit une trace.
4. Envoie l'impulsion 44 ou 45 au panneau demandeur (ligne 1416).
5. Oublie le panneau demandeur.

```csharp
PulseGlobalDigitalToPanels(accepte ? AlarmCodeOkJoin : AlarmCodeKoJoin, _alarmCodeRequester);
```

**Attention**
Cette méthode ne vérifie pas qu'une saisie est en attente. Voir « Points à vérifier ».

---

### Points à vérifier (partie)

| Ligne | Point | Raison |
|---|---|---|
| 1410–1417 | Verdict du slot 2 sans saisie en attente | `_alarmVerdictPending` n'est pas testé. Si le slot 2 envoie 44 ou 45 alors qu'aucun code n'est attendu (ou après le repli local), `_alarmCodeRequester` vaut `null` et `PulseGlobalDigitalToPanels` (lignes 887–893) envoie l'impulsion à **tous** les panneaux : tous peuvent changer de page. |
| 1384 / 1387 | Accès concurrent aux variables d'alarme | La minuterie `CTimer` s'exécute sur un autre fil d'exécution que les événements EISC. Aucun verrou ne protège `_alarmVerdictPending` / `_alarmCodeRequester`. Un verdict arrivant pile à 1200 ms pourrait être traité deux fois. |
| 1393 | Code de secours `"1234"` dans le JSON | `villa_config.json` contient `codeParDefaut: "1234"`. Si le slot 2 est arrêté, ce code ouvre l'écran des partitions. À changer ou vider sur site (la note du JSON le demande). |
| 1371–1384 | EISC absent | Le code n'est relayé nulle part mais l'attente de 1200 ms a lieu quand même. Comportement voulu, à confirmer. |
| 1396, 1416 (via 883–884) | Durée de l'impulsion 44/45 | Le digital passe à 1 puis à 0 immédiatement, sans délai. À vérifier sur la dalle et l'app mobile que le front est bien vu. |
| 1307 | Source vidéo analogique +51 | Pas de contrôle de plage (0..4) et, contrairement au digital +51..+55 (ligne 1266), la musique n'est pas coupée et `DispatchAudioRouting` n'est pas appelé. |
| 1169 | Erreurs masquées | `catch { }` vide dans `PushRoomFeedback` : une erreur (ex. join hors plage) fait disparaître le retour d'état sans aucun message dans le journal. |
| 1162–1167 | Charge du rafraîchissement | Chaque retour d'état de pièce relance `UpdateScreenStateForPanel` pour les panneaux qui l'affichent ; `PushAllRoomsFeedback` peut donc répéter ce travail. À surveiller si les pièces sont nombreuses. |
| 1282–1287 | Partitions d'alarme sans commande réelle | `ApplyAlarmPartition` ne fait que mémoriser l'état. L'envoi vers la centrale repose sur le miroir EISC (hors partie). À confirmer que la centrale reçoit bien l'ordre. |
| 1192 | Écart avec la documentation | Le code borne la pièce à 1..30, alors que `03_CONTRAT_JOINS.md` (ligne 424) indique encore « sans borne haute ». Documentation à mettre à jour. |
| 1185, 1236 | Contrat blocs GUI désactivé | `contrat.blocsPiecesGui.actif = false` dans le JSON : la GUI n'émet plus sur 1000+. Les commentaires « depuis le contrat v3 la GUI émet elle aussi sur le bloc » (lignes 1181–1182) sont donc à relire. |
| 1154 | Mode CVC déduit | « CHAUFFAGE / CLIMATISATION » vient d'une simple comparaison consigne / mesure, pas du matériel. Le contrat (ligne 233) ne cite pas « ARRÊT ». |
| 1080–1087 | Offset Stop jamais utilisé | La commande générale n'envoie que Monter (+61+3n) ou Descendre (+63+3n). Vérifier que le programme SIMPL n'attend pas un Stop. |

---

### Joins de cette partie

Sens : « → » = vers le programme C# (entrée), « ← » = du C# vers les panneaux / EISC (sortie). `b` = 1000 + (pièce − 1) × 100.

| Type | Join ou plage | Sens | Rôle |
|---|---|---|---|
| Digital | b+1..b+9 | → | Stores groupés : impulsions relayées au slot 2, pas de traitement ici |
| Digital | b+11, b+15 | → (slot 2) / ← | Sauna, hammam marche (niveau recopié depuis le slot 2) ; retour d'état |
| Digital | b+12, b+16 | ← | Sauna, hammam arrêt (retour d'état) |
| Digital | b+11..b+18 | → | Commandes bien-être (`Wellness.Apply`) |
| Digital | b+21..b+24 | → / ← | Scènes d'éclairage 1..4 |
| Digital | b+35, b+36 | → | Consigne + / − (pas de 0,5 °C) |
| Digital | b+41..b+44 | → / ← | Scènes de stores 1..4 |
| Digital | b+45 | → / ← | Extinction A/V de la pièce |
| Digital | b+50 | → / ← | Mute audio (toggle) |
| Digital | b+51..b+55 | → / ← | Source vidéo 0..4 (+51 = OFF) |
| Digital | b+56 | → / ← | Musique sur les haut-parleurs |
| Digital | b+57 | → / ← | Audio suit la source vidéo |
| Digital | b+58..b+60 | → | Transport média : relais au slot 2 |
| Digital | b+61..b+78 | → / ← | Moteurs 1..6 (Monter / Stop / Descendre) ; impulsions générales Monter / Descendre |
| Digital | b+81..b+92 | → / ← | Partitions d'alarme 1..4 (Armer / Partiel / Désarmer), communes à la villa |
| Digital | b+93 | → / ← | CVC marche (niveau recopié s'il vient du slot 2) |
| Digital | b+94..b+98 | → / ← | CVC arrêt, vitesses de ventilation |
| Analogique | b+31 | → / ← | Consigne × 10 (160..280) |
| Analogique | b+32 | → | Température mesurée × 10 (slot 2) |
| Analogique | b+33 | → / ← | Vitesse de ventilation |
| Analogique | b+34..b+37 | → / ← | Valeurs bien-être (+36, +37 : slot 2 seulement) |
| Analogique | b+51 | → / ← | Source vidéo active |
| Analogique | b+52 | → / ← | Volume audio |
| Analogique | b+53 | → / ← | Source audio (5 = musique) |
| Analogique | b+54 | → / ← | Volume média |
| Analogique | b+71..b+80 | → / ← | Niveaux des circuits 1..10 |
| Sériel | b+10 | ← | Nom de la pièce |
| Sériel | b+32 | ← | Température mesurée (texte) |
| Sériel | b+33 | ← | Mode CVC (texte) |
| Sériel | b+34 | ← | Consigne (texte) |
| Sériel | b+44..b+47 | ← | Textes bien-être |
| Sériel | 43 | → (panneau) / ← (EISC) | Code d'alarme saisi, relayé à la centrale |
| Digital | 44 | → (EISC) / ← (panneau demandeur) | Code accepté (impulsion) |
| Digital | 45 | → (EISC) / ← (panneau demandeur) | Code refusé (impulsion) |
| Digital | 46 | → | Touche C : efface la saisie (traitée lignes 1650–1655, hors partie) |

---

## Partie E — Aiguillage des appuis (le cœur du programme)

Cette partie couvre les lignes 1420 à 1845 de `ControlSystem.cs`, plus les deux tables de routage v4 (lignes 1532–1550). C'est ici qu'arrive **chaque** changement de signal venant d'une dalle, d'un iPad, d'un iPhone, d'un XPanel ou du programme SIMPL du slot 2 (via l'EISC).

Petit lexique C# utile pour cette partie :

| Terme C# | Ce que ça veut dire | Équivalent SIMPL le plus proche |
|---|---|---|
| méthode (`private void Nom(...)`) | un bloc de code qu'on appelle par son nom | un sous-module (`.umc`) qu'on déclenche |
| `bool` (retourne vrai/faux) | résultat oui/non d'une méthode | une sortie digitale de sous-module |
| `if (...) { }` | test | un `AND` / `OR` en entrée d'une logique |
| `switch (x) { case 41: ... }` | aiguillage selon la valeur de `x` | un `Equate` / `Analog Equate` qui active une sortie par valeur |
| `return` | sortir tout de suite de la méthode | couper la suite de la chaîne logique |
| `Dictionary<clé, valeur>` | table de correspondance clé -> valeur | une `Analog Initialize` / table de conversion |
| `TryGetValue(clé, out v)` | « cherche la clé ; si elle existe, mets la valeur dans `v` et réponds vrai » | un `Equate` qui sort la valeur si le numéro est connu |
| `ushort` | entier 0–65535 | valeur analogique |
| `currentDevice` / `BasicTriList` | l'appareil qui a envoyé le signal (panel ou EISC) | le symbole Touchpanel / EISC dans le programme |
| `_eisc` | l'objet EISC IP-ID 0xF0 vers le slot 2 | le symbole *Ethernet Intersystem Communications* |
| `_activeRoomPerDevice` | table « IP-ID du panel -> pièce qu'il affiche » | un `Analog RAM` indexé par panel |
| `_roomsRegistry` | table « n° de pièce -> état de la pièce » (source, volume, consigne…) | des buffers d'état par pièce |

---

### Le trajet d'un appui, pas à pas (exemple concret)

Scénario : un utilisateur, sur un iPad, affiche la **pièce 2** et appuie sur la tuile de la source vidéo n° 1. Dans le C#, la source 1 porte le libellé « Apple TV » (ligne 1969 : `if (sourceId == 1) labelSource = "Apple TV";`). Le bouton de la GUI émet le **digital 151** (contrat : `AV.Source.Select`, 150 = OFF, 151..154 = sources 1..4).

Préalable : quand l'iPad a ouvert la pièce 2, la GUI a envoyé soit le digital **12** (11 + 1), soit l'analogique **10 = 2**. Le C# a alors écrit `_activeRoomPerDevice[IP-ID de l'iPad] = 2` (lignes 1600 ou 1829).

1. **Le processeur reçoit le front montant du digital 151.** Crestron appelle `OnTouchPanelSignalReceived` (abonnement fait ligne 791 : `device.SigChange += ...`). C'est l'équivalent d'un « on change » sur toutes les entrées du symbole panel à la fois.
2. **Pièce par défaut.** Si l'iPad n'a encore jamais été vu, le C# lui donne sa pièce par défaut (ligne 1424–1425). Ici il est déjà connu : pièce 2.
3. **Recopie vers SIMPL (miroir).** Ligne 1429, `MirrorSignalToEisc` (partie décrite ailleurs, lignes 698–770) écrit d'abord **l'analogique 10 de l'EISC = 2** (lignes 750–755), puis **le digital 151 de l'EISC = 1** (ligne 759). Côté SIMPL, `Room_Select#` (a10) vaut donc 2 au moment où d151 monte : les buffers SIMPL savent que la commande vise la pièce 2. Le relâchement (d151 = 0) sera recopié de la même façon.
4. **Pas un join de bloc.** 151 < 1000, on ne passe pas par `ProcessRoomBlockSignal` (ligne 1435).
5. **Tri par type de signal.** Ligne 1441 : c'est un digital (`eSigType.Bool`) à 1, donc appel de `ProcessDigitalSignal` (ligne 1446).
6. **Ce n'est ni une navigation (11–40) ni la demande de config (250).**
7. **Routage v4 vers la pièce active.** Ligne 1617, `RouteGlobalDigitalToActiveRoom` cherche 151 dans la table `V4DigitalOffsets` : 151 -> offset **52**. La pièce 2 existe dans le registre, donc appel de `ApplyRoomDigitalCommand(2, 52, iPad)` (ligne 1560), puis `return` : le `switch` n'est pas lu.
8. **Logique métier (hors partie, lignes 1263–1269).** Offset 52 est dans la plage 51–55 : `ActiveVideoSource = 52 − 51 = 1`, envoi de la commande au driver TV (`DispatchIpCommandToSonyTv`, qui ne fait qu'un journal à ce stade), routage audio, puis `PushRoomFeedback(2)`.
9. **Retour vers les dalles (hors partie, lignes 1097–1168).** `PushRoomFeedback` écrit l'état de la pièce 2 sur son bloc (1100 + offset) pour tous les panels, et, pour **chaque panel qui affiche la pièce 2**, rafraîchit les joins **globaux** (150–156, etc.) via `UpdateScreenStateForPanel` (lignes 1158–1167). L'iPad voit la tuile 151 s'allumer. Une dalle qui affiche la pièce 5 ne voit rien changer.

En résumé : **dalle -> C# (miroir vers SIMPL avec a10 = pièce) -> C# (état de la pièce) -> dalles qui affichent cette pièce.**

---

### OnTouchPanelSignalReceived (lignes 1420–1518)

**À quoi ça sert**
C'est la porte d'entrée unique. Tous les signaux entrants de tous les panels **et** de l'EISC arrivent ici. La méthode ne fait presque rien elle-même : elle recopie vers SIMPL, puis aiguille selon le numéro et le type du join.

**Comment ça marche**
1. Lit le numéro de join (ligne 1422).
2. Si le périphérique n'a pas encore de pièce active, lui attribue `DefaultRoomForPanel` (lignes 1424–1425) : sa pièce dédiée pour un XPanel QR, sinon la pièce 1 (lignes 147–155).
3. Recopie le signal vers l'EISC avec `MirrorSignalToEisc` (ligne 1429). Cette recopie se fait **avant** tout traitement, sur les deux fronts d'un digital.
4. Si le join est ≥ 1000 (`RoomBlockBase`, ligne 263), c'est un bloc de pièce : envoi à `ProcessRoomBlockSignal` et fin (lignes 1435–1439).
5. Sinon, aiguillage selon le type (ligne 1441) :
   - **Digital** : seulement si la valeur est 1 (front montant), appel de `ProcessDigitalSignal` (lignes 1443–1448).
   - **Analogique** : à chaque changement de valeur, appel de `ProcessAnalogSignal` (lignes 1450–1452).
   - **Sériel** : traité directement ici (lignes 1454–1516), voir tableau ci-dessous.

```csharp
if (args.Sig.Number >= RoomBlockBase) { ProcessRoomBlockSignal(currentDevice, args); return; }
```

Traitement des sériels (lignes 1454–1516) :

| Sériel | Ce que fait le C# |
|---|---|
| tout sériel | Écrit dans le journal `[JS CONSOLE] IP-ID … (Join …): texte` (lignes 1456–1459). C'est ce qui affiche la console navigateur (sériel 100). Le texte du sériel 43 est remplacé par `[code masqué]`. |
| 103 | Exécute le texte reçu comme **commande console du CP4** (`SendControlSystemCommand`, ligne 1466), met en forme la réponse et l'envoie sur le sériel 103 de **tous** les panels. En cas d'échec, envoie un message d'erreur à tous (lignes 1460–1483). |
| 104 | Date de dernière validation, par périphérique. Si elle a changé : mémorisée, écrite dans `/user/last_validation_date_XX.txt` (XX = IP-ID), puis renvoyée au **seul** panel émetteur (lignes 1484–1505). |
| 43 (`AlarmCodeEntryJoin`) | Code d'alarme saisi sur le pavé : transmis à `ProcessAlarmCodeEntry` (ligne 1510). Le C# ne compare pas le code, c'est la centrale du slot 2 qui décide. |
| 420 | JSON de presets reçu de la GUI : sauvegarde par `SavePresetConfig` (ligne 1514). |

**Joins concernés** : tous en entrée ; sériels 43, 103, 104, 420 traités ici ; sériel 103 et 104 en sortie.

**Attention**
- Les digitaux ne sont traités **qu'au front montant** (ligne 1444). Mais le miroir (ligne 1429) passe avant ce test : SIMPL reçoit bien l'appui **et** le relâchement.
- L'EISC est enregistré comme un panel (ligne 787, commentaire « ou l'EISC ») : les signaux venant de SIMPL passent aussi par ici. Le miroir les ignore (ligne 700), le reste du traitement non.
- Le sériel 103 permet à n'importe quel panel connecté d'exécuter une commande console sur le CP4 (ligne 1466). Voir « Points à vérifier ».

---

### Tables V4DigitalOffsets et V4AnalogOffsets (lignes 1532–1550)

**À quoi ça sert**
Depuis le contrat v4 (16.09.2026), la GUI envoie les **mêmes joins quelle que soit la pièce** (150–156 pour les sources, 51–54 pour les scènes…). Ces deux tables traduisent un join « global » en **offset de bloc**, c'est-à-dire la position de la commande dans le bloc de 100 joins d'une pièce. Le C# peut ainsi réutiliser la logique métier des blocs (`ApplyRoomDigitalCommand` / `ApplyRoomAnalogCommand`).

**Comment ça marche**
Une `Dictionary<ushort, uint>` est une simple table « join -> offset », figée au démarrage (`static readonly` = constante, jamais modifiée). Elle recopie la section `contrat.blocsPiecesGui.mapping` de `villa_config.json` (lignes 3480–3553 du JSON environ).

```csharp
{ 150, 51 }, { 151, 52 }, { 152, 53 }, { 153, 54 }, { 154, 55 }, { 155, 56 }, { 156, 57 },
```

Voir le tableau des familles plus bas pour le contenu.

**Attention**
- La table n'est **pas** relue depuis le JSON : si le mapping du JSON change, il faut modifier ces lignes et recompiler.
- Le JSON déclare aussi les analogiques 64 -> 36 et 65 -> 37 ; la table C# ne les contient pas (voir « Points à vérifier »).

---

### RouteGlobalDigitalToActiveRoom (lignes 1553–1562)

**À quoi ça sert**
Envoyer un appui « global » (ex. d151) vers la pièce que **ce** panel affiche. Répond vrai si l'appui a été pris en charge.

**Comment ça marche**
1. Si le signal vient de l'EISC (slot 2), répond faux : un signal de SIMPL sur ces numéros est un feedback, pas une commande (ligne 1555).
2. Cherche le join dans `V4DigitalOffsets`. Absent : répond faux (ligne 1557).
3. Vérifie que la pièce active existe dans le registre. Sinon : faux (ligne 1558).
4. Écrit une ligne de journal `[V4] IP-ID … join … -> pièce …, offset …` (ligne 1559).
5. Appelle `ApplyRoomDigitalCommand(pièce, offset, panel)` et répond vrai (lignes 1560–1561).

```csharp
if (!V4DigitalOffsets.TryGetValue(joinNumber, out offset)) return false;
```

**Joins concernés** : tous les digitaux de `V4DigitalOffsets` (61–69, 51–54, 49–50, 620–627, 610–615, 200–204, 55, 150–156, 251–253, 81–98).

**Attention**
- La pièce utilisée est celle mémorisée dans `_activeRoomPerDevice` au moment de l'appui. Si la GUI n'a pas envoyé d11–40 ou a10 en ouvrant la pièce, la commande part sur la mauvaise pièce (souvent la 1).

---

### RouteGlobalAnalogToActiveRoom (lignes 1565–1573)

**À quoi ça sert**
Même rôle pour les analogiques (consigne, volume, niveaux de circuits…).

**Comment ça marche**
1. Refuse les signaux de l'EISC (ligne 1567).
2. Cherche le join dans `V4AnalogOffsets` (ligne 1569).
3. Vérifie que la pièce existe (ligne 1570).
4. Appelle `ApplyRoomAnalogCommand(pièce, offset, valeur, panel)` et répond vrai (lignes 1571–1572).

```csharp
ApplyRoomAnalogCommand(activeRoomId, offset, rawValue, currentDevice);
```

**Joins concernés** : analogiques 31, 51, 52, 53, 61, 62, 63, 71–80, 254.

**Attention**
- Contrairement à la version digitale, **aucune ligne de journal** n'est écrite ici. Le journal existe quand même plus loin dans `ApplyRoomAnalogCommand` (ligne 1327), mais seulement si la valeur est acceptée.
- Les contrôles de plage (ex. consigne 160–280, ligne 1303) sont faits dans `ApplyRoomAnalogCommand`, pas ici.

---

### ProcessDigitalSignal (lignes 1582–1800)

**À quoi ça sert**
Traiter un appui digital (front montant) d'un join < 1000 : navigation, demande de config, routage v4 vers la pièce active, puis toutes les commandes vraiment globales (alarme, commandes « toute la maison », outils système).

**Comment ça marche**
1. Détermine la pièce active du périphérique, avec repli sur la pièce par défaut (lignes 1586–1588).
2. Journal `[DECOUPLE] … triggered Digital Join …` si le join ≤ 3000 (lignes 1592–1593). Au-delà : joins réservés firmware, non tracés.
3. **Navigation d11–40** (lignes 1596–1605) : pièce = join − 10. Si la pièce existe : mémorise la pièce active du panel, rafraîchit son écran (`UpdateScreenStateForPanel`), et si c'est la dalle principale (IP-ID 0x03, ligne 131) met à jour `_tswActiveRoom` et le diffuse (`BroadcastTswRoom`, analogique 240 selon le contrat). Fin.
4. **Demande de config d250** (lignes 1608–1612) : lance l'envoi de `villa_config.json` à ce panel (`StartConfigSend`). Fin.
5. **Routage v4** (ligne 1617) : si le join est dans `V4DigitalOffsets`, il est traité pour la pièce active et la méthode s'arrête.
6. **`switch` des joins globaux** (lignes 1624–1799) : voir le tableau des familles.

```csharp
if (RouteGlobalDigitalToActiveRoom(currentDevice, joinNumber, activeRoomId)) return;
```

**Joins concernés** : d11–40, d250, table v4, d41, 42, 44, 45, 46, 56, 103, 261, 301–312, 401–411.

**Attention**
- L'ordre compte : la navigation (11–40) et la config (250) passent **avant** le routage v4. Un même numéro ne doit jamais être à la fois dans la table v4 et dans le `switch` : le `switch` ne serait jamais atteint.
- Les commentaires v3 des lignes 1619–1622 sont périmés (la GUI n'émet plus sur les blocs ≥ 1000) ; le commentaire v4 des lignes 1614–1616 le signale.
- Un join absent de la table et du `switch` est **ignoré** ici, sans message (c'est le cas des télécommandes, voir tableau). Il a pourtant été recopié vers SIMPL par le miroir.

---

### ProcessAnalogSignal (lignes 1807–1845)

**À quoi ça sert**
Traiter un changement de valeur analogique d'un join < 1000 : routage v4 vers la pièce active, puis les trois analogiques globaux (pièce affichée, accusé de config, volume de la dalle).

**Comment ça marche**
1. Détermine la pièce active du périphérique (lignes 1810–1812).
2. Journal `[DECOUPLE] … triggered Analog Join … = …` sauf pour a10 (trop fréquent) et les joins > 3000 (lignes 1816–1817).
3. **Routage v4** (ligne 1821) : si le join est dans `V4AnalogOffsets`, traité pour la pièce active, fin.
4. `switch` (lignes 1823–1844) :
   - **a10** : si la valeur est ≥ 1 et que la pièce existe, mémorise la pièce active, rafraîchit l'écran du panel ; si c'est la dalle 0x03, met à jour et diffuse `_tswActiveRoom` (lignes 1825–1833).
   - **a250** : accusé de réception d'un morceau de config, transmis à `OnConfigChunkAck` (lignes 1835–1838).
   - **a260** : volume matériel de la dalle TSW (0–100), appliqué par `SetTswVolume` (lignes 1840–1843).

```csharp
case 10: if (rawValue >= 1 && _roomsRegistry != null && _roomsRegistry.ContainsKey(rawValue))
```

**Joins concernés** : a10, a250, a260, et la table v4 analogique.

**Attention**
- Tout changement de valeur est traité, y compris un retour à 0. Pour a10, la valeur 0 est ignorée (test `>= 1`).
- a10 est aussi la voie qu'utilise SIMPL (`Room_Select#`) : c'est le miroir qui l'écrit vers l'EISC à chaque commande de pièce, pas cette méthode.

---

### Les familles de commandes (routage v4 + `switch`)

Colonne « Chemin » : **v4** = table + `ApplyRoomDigitalCommand` / `ApplyRoomAnalogCommand` sur la pièce affichée par le panel ; **switch** = cas traité directement dans `ProcessDigitalSignal` / `ProcessAnalogSignal` ; **miroir seul** = recopié vers SIMPL, aucun traitement C#. La logique métier citée pour le chemin v4 est aux lignes 1226–1329 (autre partie).

| Famille | Joins | Chemin | Ce que fait le C# |
|---|---|---|---|
| Navigation de pièce | d11–40, a10 | switch / test direct | Mémorise la pièce affichée par ce panel (pièce = join − 10, ou valeur de a10), rafraîchit l'écran du panel, diffuse la pièce de la dalle 0x03 (lignes 1596–1605, 1825–1833). |
| Sources vidéo | d150–154 (offsets 51–55) | v4 | Source active = offset − 51 (150 = OFF), commande TV, routage audio, feedback de la pièce. |
| Audio musique / suivre vidéo | d155 (56), d156 (57), a53 (53) | v4 | d155 : musique sur les haut-parleurs ; d156 : l'audio revient à la source vidéo ; a53 = 5 : musique, sinon audio de la vidéo. |
| Extinction A/V | d200 (45) | v4 | Source = 0, musique coupée, TV éteinte, routage audio. |
| Volume / mute | a52 (52), d55 (50) | v4 | a52 : volume mémorisé ; d55 : bascule du mute. |
| Source vidéo par valeur | a51 (51) | v4 | Source active = valeur, commande TV. |
| Lecteur média | d251–253 (58–60), a254 (54) | v4 | d251–253 : impulsions sans état, seulement journal (le relais vers SIMPL est fait par le miroir) ; a254 : volume média mémorisé. |
| Télécommandes | d211–220 (Apple TV), 500–527 (Sky Q), 530–557 (IPTV), 560–600 (Swisscom) | miroir seul | Aucun cas dans le `switch` : rien n'est fait en C#. Le miroir recopie vers SIMPL et écrit a10 = pièce active juste avant (lignes 744–755). |
| Éclairage, scènes | d51–54 (21–24) | v4 | Scène active 1–4 et niveaux de circuits appliqués selon la table de scènes. |
| Éclairage, circuits | a71–80 (71–80) | v4 | Niveau du circuit 1–10 mémorisé. |
| Stores groupés | d61–69 (1–9) | v4 | Impulsions sans état, journal seul (SIMPL agit via le miroir). |
| Moteurs de stores | d81–98 (61–78) | v4 | Idem : journal seul. |
| Scènes de stores | d201–204 (41–44) | v4 | Scène de stores active mémorisée (201–204). |
| HVAC consigne | d49 (35), d50 (36), a31 (31) | v4 | d49 : +0,5 °C (max 28,0) ; d50 : −0,5 °C (min 16,0) ; a31 : consigne directe, refusée hors 160–280. |
| HVAC marche / ventilation | d610–611 (93–94), d612–615 (95–98), a61 (33) | v4 | Marche/arrêt, vitesse Auto/1/2/3 (`HvacState.Apply` / `SetFan`). |
| Wellness (sauna / hammam) | d620–627 (11–18), a62–63 (34–35) | v4 | Sauna ON/OFF, cible ±10 ; hammam ON/OFF, humidité ±1 (`WellnessState.Apply`, seulement si la pièce a le wellness) ; a62/a63 : cibles directes. |
| Alarme générale | d41, d42 | switch | Mémorise armé / désarmé, puis `BroadcastFeedbackToAll` (lignes 1630–1640). |
| Code d'alarme | s43, d44, d45, d46 | sériel / switch | s43 : code envoyé à la centrale ; d44/d45 : verdict accepté / refusé, **pris en compte seulement s'il vient de l'EISC** ; d46 : efface la saisie, arrête la temporisation (lignes 1642–1656). |
| Partitions d'alarme | d301–312 | switch | Partition = (join − 301) / 3, action = reste (armer / partiel / désarmer), appliquée à toute la villa, puis feedback à tous (lignes 1665–1671). |
| Global éclairage | d401, 402, 403 | switch | Applique le preset `light_all` / `light_off` / `light_eco`. S'il n'existe pas : toutes les pièces à 100 % / 0 % / 50 % (65535 / 0 / 32768) sur les 10 circuits, puis feedback à tous (lignes 1674–1711). |
| Global stores | d404, 405, 406 | switch | Preset `shade_open` / `shade_close`, sinon impulsion sur tous les moteurs de toutes les pièces. d406 : **journal seul**, aucune action (lignes 1713–1727). |
| Global climatisation | d407, 408, 409 | switch | Preset `hvac_confort` / `hvac_nuit` / `hvac_horsgel`, sinon toutes les pièces à 21,0 / 18,0 / 12,0 °C, HVAC en marche, feedback à tous (lignes 1729–1754). |
| Mode vacances | d410, 411 | switch | d410 : mode actif, preset `vacation` sinon 12,0 °C + éclairage éteint + stores fermés, feedback à tous. d411 : mode inactif, feedback à tous (lignes 1756–1777). |
| Configuration | d250, a250 | test direct / switch | d250 : lance l'envoi de `villa_config.json` au panel ; a250 : accusé de réception d'un morceau. |
| Dalle TSW matériel | d261, a260 | switch | d261 : bascule mute du haut-parleur de la dalle ; a260 : volume 0–100. |
| Système / diagnostic | d103, s103, s104, s420, d56 | switch / sériel | d103 : exécute `ipt` et envoie la table IP à tous les panels ; s103 : commande console libre ; s104 : date de validation ; s420 : sauvegarde des presets ; d56 : easter egg météo, **journal seul**. |

---

### Points à vérifier (partie)

| Ligne | Raison |
|---|---|
| 1466 | Le sériel 103 exécute **n'importe quelle** commande console CP4 envoyée par un panel (reboot, progreset…). Aucun filtre ni contrôle d'IP-ID visible. À restreindre ou désactiver en déploiement client. |
| 1628 | d56 (easter egg) : le journal annonce « Lecture de funny.mp3 demandée » mais aucun code ne lance de lecture. Par ailleurs les règles du projet interdisent tout son dans la GUI. |
| 1726–1727 | d406 « Position intermédiaire » : journal seul, aucune action (confirmé par le contrat, ligne 115). |
| 1624–1799 | Les télécommandes (211–220, 500–600) n'ont aucun cas : le contrat (ligne 137) indique qu'elles sont « à router côté C# ». Aujourd'hui seul SIMPL les reçoit via le miroir. |
| 1678, 1691, 1704, 1733, 1742, 1751, 1761 | Boucles `foreach` sur `_roomsRegistry.Values` sans test `_roomsRegistry != null`, alors que le reste du code le teste (ex. 1599, 1826). Plantage possible si la config n'est pas chargée. |
| 1751, 1763 | Hors gel / vacances posent 12,0 °C (120), mais d50 « consigne − » borne à 16,0 minimum (ligne 1251) et a31 refuse < 160 (ligne 1303). Un appui sur « − » depuis 12,0 fait remonter à 16,0. |
| 1731–1754 vs 1770 | Pour 407–409, `BroadcastFeedbackToAll` n'est appelé que si le preset n'existe pas ; pour 410 il est toujours appelé. À vérifier que `ApplyPreset` (ligne 2122) pousse bien les feedbacks lui-même. |
| 1716, 1722, 1768 | Le repli « stores » agit sur les moteurs mais ne met pas à jour `ActiveStoreScene` : le feedback des scènes de stores ne change pas. |
| 1969 vs `villa_config.json` l. 103–124 | Le C# nomme la source 1 « Apple TV » (2 Sky Q, 3 Swisscom TV, 4 IPTV) ; le JSON `sourcesAudioVideo` dit 1 IPTV, 2 Box pirate, 3 Humax, 4 Jukebox. Libellés incohérents (journal seulement). |
| 1546–1550 | Le mapping JSON contient a64 -> 36 et a65 -> 37 ; la table C# ne les a pas. Probablement voulu (mesures venant du slot 2, cf. ligne 706 et 1305), mais non commenté. |
| 1642–1648 | d44/d45 envoyés par un panel (et non l'EISC) sont silencieusement ignorés, mais recopiés vers SIMPL par le miroir s'ils sont dans la liste blanche `signauxGlobaux`. |
| 1596–1605 | La navigation d11–40 est aussi acceptée si elle vient de l'EISC : elle modifie alors la « pièce active » de l'EISC dans `_activeRoomPerDevice`. Sans effet visible, mais non filtré. |
| 1619–1622, 1575–1581, 1802–1806 | Commentaires v3 périmés (« ne transitent plus par ici ») contredits par le routage v4 juste au-dessus. Risque de confusion à la maintenance. |

---

### Joins de cette partie

| Type | Join ou plage | Sens | Rôle |
|---|---|---|---|
| Digital | 11–40 | entrée | Sélection de pièce (pièce = join − 10) |
| Digital | 41 / 42 | entrée | Armement / désarmement général |
| Digital | 44 / 45 | entrée (EISC) | Verdict de la centrale : code accepté / refusé |
| Digital | 46 | entrée | Effacer la saisie du code |
| Digital | 49 / 50 | entrée | Consigne + / − (v4, offsets 35 / 36) |
| Digital | 51–54 | entrée | Scènes d'éclairage 1–4 (v4, offsets 21–24) |
| Digital | 55 | entrée | Mute toggle (v4, offset 50) |
| Digital | 56 | entrée | Easter egg météo (journal) |
| Digital | 61–69 | entrée | Stores groupés (v4, offsets 1–9, impulsion) |
| Digital | 81–98 | entrée | Moteurs de stores (v4, offsets 61–78, impulsion) |
| Digital | 103 | entrée | Demande de table IP (`ipt`) |
| Digital | 150–154 | entrée | Sélection source vidéo, 150 = OFF (v4, offsets 51–55) |
| Digital | 155 / 156 | entrée | Musique / audio suit la vidéo (v4, offsets 56 / 57) |
| Digital | 200 | entrée | Extinction A/V (v4, offset 45) |
| Digital | 201–204 | entrée | Scènes de stores (v4, offsets 41–44) |
| Digital | 211–220, 500–527, 530–557, 560–600 | entrée | Télécommandes : miroir SIMPL seul |
| Digital | 250 | entrée | Demande d'envoi de la configuration |
| Digital | 251–253 | entrée | Transport lecteur média (v4, offsets 58–60) |
| Digital | 261 | entrée | Mute du haut-parleur de la dalle TSW |
| Digital | 301–312 | entrée | Partitions d'alarme 1–4 (armer / partiel / désarmer) |
| Digital | 401–411 | entrée | Commandes globales maison (éclairage, stores, CVC, vacances) |
| Digital | 610–615 | entrée | HVAC marche/arrêt + ventilation (v4, offsets 93–98) |
| Digital | 620–627 | entrée | Wellness sauna / hammam (v4, offsets 11–18) |
| Digital | ≥ 1000 | entrée | Blocs de pièce -> `ProcessRoomBlockSignal` |
| Analogique | 10 | entrée | Pièce affichée par le panel ; écrit aussi vers l'EISC par le miroir (`Room_Select#`) |
| Analogique | 31 | entrée | Consigne HVAC directe (v4, offset 31) |
| Analogique | 51 / 52 / 53 | entrée | Source vidéo / volume / source audio (v4) |
| Analogique | 61 | entrée | Ventilation 0–3 (v4, offset 33) |
| Analogique | 62 / 63 | entrée | Cible sauna / humidité hammam (v4, offsets 34 / 35) |
| Analogique | 71–80 | entrée | Niveaux des circuits 1–10 (v4) |
| Analogique | 240 | sortie | Pièce affichée par la dalle 0x03 (via `BroadcastTswRoom`) |
| Analogique | 250 | entrée | Accusé de réception d'un morceau de config |
| Analogique | 254 | entrée | Volume du lecteur média (v4, offset 54) |
| Analogique | 260 | entrée | Volume matériel de la dalle TSW (0–100) |
| Analogique | ≥ 1000 | entrée | Blocs de pièce -> `ProcessRoomBlockSignal` |
| Sériel | toutes | entrée | Journal `[JS CONSOLE]` (dont sériel 100, console navigateur) |
| Sériel | 43 | entrée | Code d'alarme (masqué dans le journal) |
| Sériel | 103 | entrée / sortie | Commande console CP4 / réponse (et table IP) vers tous les panels |
| Sériel | 104 | entrée / sortie | Date de validation, retour au seul panel émetteur |
| Sériel | 420 | entrée | Sauvegarde de la configuration des presets |

---

## Partie F — État d'écran, audio, diagnostic et presets

Cette partie couvre la fin de `ControlSystem.cs`, des lignes 1853 à 2275. On y trouve quatre sujets :

1. l'envoi à un panneau de tout l'état de la pièce qu'il affiche ;
2. deux méthodes « audio » et « TV Sony », qui aujourd'hui ne font qu'écrire dans la console ;
3. deux outils de mise en forme des réponses de la console du CP4 ;
4. les presets globaux, sauvegardés dans des fichiers du dossier `/user/` du processeur.

Rappels de vocabulaire C# utilisés dans cette partie :

- **Méthode** : un bloc de code nommé qu'on appelle. Équivalent le plus proche en SIMPL : un module ou une macro qu'on déclenche.
- **`private void Nom(...)`** : `private` = utilisable seulement dans ce fichier ; `void` = la méthode ne renvoie rien. `private bool` renvoie vrai/faux, `private string` renvoie un texte.
- **`BasicTriList`** : un périphérique à joins (dalle, XPanel, application mobile, ou l'EISC vers le slot 2). C'est l'objet qui porte les joins digitaux, analogiques et sériels, comme un symbole de panneau dans SIMPL.
- **`SetBool` / `SetUShort` / `SetString`** (définies lignes 102–118) : écrivent respectivement un digital, un analogique, un sériel **vers** le panneau (feedback). Elles n'écrivent que si la valeur change, sauf pendant un rafraîchissement forcé (`_forcePush`, ligne 99).
- **`Trace(...)`** (lignes 83–91) : écrit un message dans la console du CP4, uniquement si `meta.tracesConsole` vaut `true` dans `villa_config.json` (lignes 464–466).
- **`try { ... } catch (Exception ex) { ... }`** : « essaie ce bloc ; si une erreur se produit, exécute le bloc `catch` au lieu de planter le programme ».
- **`_roomsRegistry`** : la liste des pièces, indexée par numéro de pièce. Chaque entrée est un `RoomState` (l'état mémorisé d'une pièce : lumières, source, température, etc.).

---

### UpdateScreenStateForPanel (lignes 1853–1952)

**À quoi ça sert**

Envoyer à **un seul** panneau l'état complet de l'écran pour la pièce `roomId` : nom de la pièce, sélection de pièce, sources, scènes, CVC, lumières, stores, alarme, mode vacances et informations système. Le commentaire des lignes 1847–1852 précise qu'en v3 l'état « par pièce » est aussi poussé en parallèle sur le bloc de joins de chaque pièce par `PushRoomFeedback` ; cette méthode garde surtout la partie globale et un instantané de la pièce affichée.

**Quand elle est appelée** (vérifié par recherche dans le fichier)

- ligne 434 : au démarrage, pour chaque panneau, avec sa pièce par défaut ;
- ligne 827 : quand un panneau se connecte (avec `_forcePush = true`, donc tout est réécrit) ;
- ligne 869 : dans `BroadcastFeedbackToAll`, pour tous les panneaux ;
- ligne 1166 : quand la pièce affichée par un panneau change d'état ;
- lignes 1602 et 1830 : quand l'utilisateur change de pièce (digital ou analogique 10).

**Comment ça marche**

1. Lignes 1857–1861 : si la pièce n'existe pas dans le registre, on écrit une notice dans le journal d'erreurs et on s'arrête. Sans cette garde, le programme levait une erreur (commentaire « P1-4 »).
2. Ligne 1862 : on récupère l'état de la pièce dans la variable `room`.
3. Lignes 1865–1875 : informations d'identité et système :
   - analogique 10 = numéro de pièce, sériel 10 = nom de la pièce en majuscules ;
   - sériel 99 = IP-ID du panneau sur 2 chiffres ;
   - sériel 101 = nom du fichier CPZ, sériel 102 = date de compilation ;
   - sériel 106 (`ConfigHashJoin`, défini ligne 69) = empreinte de la configuration ;
   - sériel 104 = date de validation propre à ce panneau (vide si inconnue).
4. Lignes 1878–1881 : sélection de pièce en interlock. Digital `10 + N` = vrai seulement pour la pièce N (digitaux 11 à 40, donc 30 pièces maximum).
5. Lignes 1884–1889 : source vidéo en interlock sur les digitaux 150 à 154 (150 = source 0 = arrêt). Digital 155 = musique sur les haut-parleurs, digital 156 = l'audio suit la vidéo (toujours l'inverse de 155).
6. Lignes 1892–1895 : scènes d'éclairage 1 à 4 sur les digitaux 51 à 54.
7. Lignes 1898–1904 : **seulement si le périphérique n'est pas l'EISC** :
   - digitaux 610 à 615 = état CVC (marche/arrêt et vitesses de ventilation) ;
   - analogique 61 = ventilation ;
   - digitaux 620 à 627 = sélections bien-être (sauna/hammam) ;
   - analogiques et sériels 62 à 65 = valeurs et textes bien-être.
   Le commentaire ligne 1897 explique pourquoi l'EISC est exclu : sur l'EISC ces joins servent d'impulsions, il ne faut pas les écraser par un état maintenu.
8. Ligne 1905 : analogique 31 = consigne de température (en dixièmes de degré).
9. Lignes 1908–1911 : analogiques 71 à 80 = niveaux des 10 circuits d'éclairage.
10. Lignes 1914–1917 : digitaux 201 à 204 = scène de stores active (interlock).
11. Lignes 1920–1927 : 4 partitions d'alarme, 3 digitaux chacune (301 à 312). Pour chaque partition : base = armé (état 1), base+1 = état 2, base+2 = désarmé (état 0).
12. Lignes 1930–1931 : digital 410 = mode vacances actif, digital 411 = inactif.
13. Lignes 1933–1942 : textes de température :
    - sériel 32 = température mesurée, divisée par 10, avec 1 décimale ;
    - sériel 33 = « ARRÊT », « CHAUFFAGE » ou « CLIMATISATION » ;
    - sériel 34 = consigne, divisée par 10, 1 décimale.
14. Lignes 1944–1948 : AV :
    - analogique 51 = source vidéo, 52 = volume, 53 = source audio (5 = musique, sinon la source vidéo) ;
    - analogique 254 = volume du lecteur média ;
    - digital 55 = mute.
15. Lignes 1950–1951 : digital 41 = centrale d'alarme armée, digital 42 = désarmée.

```csharp
SetBool(panel, i, (roomId == (i - 10)));   // ligne 1880 : interlock de sélection de pièce
```

Le mode CVC (ligne 1938) se décide ainsi : si le CVC est coupé, « ARRÊT » ; sinon, si la consigne est plus haute que la mesure, « CHAUFFAGE » ; sinon « CLIMATISATION ».

**Joins concernés** : voir le tableau en fin de partie.

**Attention**

- Les numéros de joins écrits ici sont les **joins logiques globaux** (anciens numéros partagés). Le contrat v3 (`03_CONTRAT_JOINS.md`) déplace l'état de pièce sur des blocs par pièce (base 1000 + (id-1)×100). Cette méthode continue pourtant d'écrire les joins partagés, en plus de `PushRoomFeedback`.
- Le libellé « CLIMATISATION » s'affiche aussi quand la consigne est **égale** à la mesure (ligne 1938).
- Seuls les joins 610–615 et 620–627 / 61–65 sont protégés pour l'EISC. Les autres joins (par exemple 51–54, 201–204) sont écrits aussi sur l'EISC si celui-ci est dans `_touchPanels` (il y est ajouté par `RegisterUserInterface`, ligne 796).

---

### DispatchAudioRouting (lignes 1956–1962)

**À quoi ça sert**

Point prévu pour commander un ampli ou une matrice audio : choisir ce que diffusent les haut-parleurs de la pièce.

**Comment ça marche**

1. Ligne 1958 : si la pièce est inconnue, on sort.
2. Ligne 1960 : on construit un libellé : « Musique » si la musique est choisie, « Off » si la source vidéo est 0, sinon « Audio de la source vidéo N ».
3. Ligne 1961 : on écrit ce libellé dans la console avec `Trace`.

```csharp
Trace("AUDIO-ROUTING: [Zone: {0}] -> haut-parleurs = [{1}].", room.RoomName, label);
```

**Est-ce actif ?** Non. La méthode **n'envoie aucune commande** à un appareil. Le commentaire ligne 1955 le dit : « pour l'instant journalisé ». Elle est appelée (lignes 1259, 1268, 1273, 1278, 1314), mais ne produit qu'une trace console, et seulement si `meta.tracesConsole` est vrai. Le routage audio réel, s'il existe, est fait ailleurs (côté SIMPL slot 2 via l'EISC, non vérifié dans cette partie).

---

### DispatchIpCommandToSonyTv (lignes 1964–1975)

**À quoi ça sert**

Nom trompeur : la méthode devait envoyer une commande IP à un téléviseur Sony pour changer d'entrée. Aujourd'hui elle ne fait qu'écrire un message.

**Comment ça marche**

1. Ligne 1966 : si la pièce est inconnue, on sort.
2. Lignes 1967–1971 : on traduit le numéro de source en nom : 0 (ou toute autre valeur) = « Power Off », 1 = « Apple TV », 2 = « Sky Q », 3 = « Swisscom TV », 4 = « IPTV ».
3. Lignes 1973–1974 : trace console « SONY-IP-DRIVER ... Commutation IP vers [...] ».

**Est-ce actif ?** Non. Aucune connexion réseau, aucun driver Sony. C'est un **reste / une maquette**. Elle est appelée lignes 1258, 1267 et 1307.

**Attention** : les noms de sources sont écrits en dur dans le code. Ils ne viennent pas de `villa_config.json` (aucune occurrence « sony » trouvée dans ce fichier).

---

### FormatIpTable (lignes 1977–2049)

**À quoi ça sert**

Mettre en forme la réponse de la commande console `ipt` (table IP du programme) pour l'afficher sur un panneau, sur le sériel 103.

**Quand elle est appelée** : ligne 1783, dans le `case 103:` de `ProcessDigitalSignal` (appui sur le **digital** 103). Le résultat est envoyé sur le sériel 103 de **tous** les périphériques (lignes 1786–1789).

**Comment ça marche**

1. Ligne 1981 : on découpe le texte brut en lignes (`Split` = couper un texte selon des séparateurs, ici retour chariot et saut de ligne).
2. Lignes 1985–1986 : on ajoute deux lignes d'en-tête fixes.
3. Lignes 1988–1992 : pour chaque ligne, on ignore les lignes vides et les en-têtes d'origine (« IP Table », « CIP_ID », « Total CIP »).
4. Ligne 1994 : on coupe la ligne en mots (espaces ou tabulations).
5. Lignes 1995–2015 : s'il y a au moins 5 mots, on lit IP-ID, type, statut. Puis on devine si le 4ᵉ mot est un port ou un DevID : s'il commence par « 4179 » ou fait plus de 2 caractères, c'est un port ; sinon c'est un DevID et on lit port et adresse plus loin.
6. Lignes 2018–2029 : on raccourcit l'adresse IP (`127.000.000.001` devient `127.0.0.1`).
7. Lignes 2032–2034 : on aligne les colonnes à largeur fixe.
8. Lignes 2038–2042 : on recolle les lignes et on **coupe à 254 caractères**.
9. Lignes 2045–2048 : en cas d'erreur, on renvoie « Erreur formatage table IP: » suivi du message.

```csharp
if (result.Length > 254) result = result.Substring(0, 254);   // lignes 2039-2041 (résumé)
```

**Attention**

- 254 caractères, c'est très court : deux lignes d'en-tête plus deux ou trois lignes de table. La table est presque toujours tronquée.
- Ligne 2014 : si une ligne n'a que 5 mots et que le 4ᵉ est court, `parts[5]` n'existe pas. L'erreur est rattrapée par le `catch`, mais **toute** la table est alors remplacée par le message d'erreur.
- Le contrat (`03_CONTRAT_JOINS.md`, lignes 165–167) indique que ce digital 103 n'est pas au contrat et qu'aucun GUI ne l'émet : code mort selon la documentation.

---

### FormatConsoleResponse (lignes 2051–2065)

**À quoi ça sert**

Préparer la réponse d'une commande console quelconque tapée depuis le GUI, pour l'afficher sur le sériel 103.

**Quand elle est appelée** : ligne 1468. Le GUI envoie une commande texte sur le **sériel** 103 ; le programme l'exécute sur le CP4 avec `CrestronConsole.SendControlSystemCommand` (ligne 1466), met en forme la réponse, puis l'envoie sur le sériel 103 de tous les périphériques (lignes 1470–1473).

**Comment ça marche**

1. Lignes 2053–2054 : réponse vide = texte « Aucune réponse du processeur. ».
2. Ligne 2057 : toutes les fins de ligne sont uniformisées en `\r\n` (retour chariot + saut de ligne).
3. Lignes 2060–2063 : au-delà de 8000 caractères, on coupe et on ajoute « [AFFICHAGE TRONQUÉ À 8000 CARACTÈRES] ».
4. Ligne 2064 : sinon, on renvoie le texte tel quel.

**Attention**

- Ce chemin permet à n'importe quel panneau d'exécuter **n'importe quelle commande console** du CP4 (y compris des commandes destructrices). La méthode elle-même ne filtre rien ; aucun filtrage n'apparaît non plus aux lignes 1460–1466.
- La réponse est envoyée à **tous** les panneaux, pas seulement à celui qui a demandé.

---

### SavePresetConfig (lignes 2067–2102)

**À quoi ça sert**

Enregistrer sur le CP4 un preset global personnalisé, envoyé par le GUI sous forme de texte JSON sur le **sériel 420** (`Presets.Sauvegarde` au contrat). Appelée ligne 1514.

JSON = format texte de données structurées, par exemple `{"preset":"light_eco","data":{...}}`. `JObject.Parse` (bibliothèque Newtonsoft) lit ce texte et permet d'accéder aux champs par leur nom.

**Comment ça marche**

1. Ligne 2071 : trace console du contenu reçu.
2. Lignes 2074–2075 : lecture du JSON et du champ `"preset"` (le nom du preset).
3. Lignes 2077–2081 : nom vide = message console d'erreur et arrêt.
4. Lignes 2086–2091 : le nom passe par `SanitizePresetName`. S'il est refusé, erreur dans le journal et arrêt.
5. Lignes 2094–2095 : le texte JSON **complet, tel que reçu**, est écrit dans le fichier `/user/preset_cfg_<nom>.json`. Un fichier existant est remplacé.
6. Ligne 2096 : trace console du chemin écrit.
7. Lignes 2098–2101 : en cas d'erreur (JSON invalide, écriture impossible), message dans le journal d'erreurs.

```csharp
string path = string.Format("/user/preset_cfg_{0}.json", presetName);   // ligne 2094
```

**Format attendu du fichier** (déduit de `ApplyPreset`, pas d'un exemple réel) :

```json
{ "preset": "light_eco", "data": { ... } }
```

**Attention**

- Seul le nom est contrôlé. Le contenu de `"data"` n'est **pas** vérifié à la sauvegarde ; une erreur de format ne se verra qu'à l'application.
- Le dossier `/user/` survit aux redémarrages et aux rechargements de programme : un preset reste actif tant que son fichier existe.
- Aucun émetteur du sériel 420 n'a été trouvé dans les fichiers `.html` / `.js` du dossier `ch5` (recherche « preset »).

---

### SanitizePresetName (lignes 2109–2120)

**À quoi ça sert**

Contrôler le nom d'un preset avant de s'en servir dans un nom de fichier. Sans ce contrôle, un nom comme `../../quelquechose` permettait d'écrire ailleurs sur le CP4 (commentaire « P1-5 », lignes 2083–2085).

`static` = la méthode ne dépend d'aucune donnée du programme ; elle transforme seulement le texte reçu.

**Comment ça marche**

1. Ligne 2111 : nom vide = renvoie `""` (refusé).
2. Ligne 2112 : on retire les espaces au début et à la fin (`Trim`).
3. Ligne 2113 : plus de 40 caractères = refusé.
4. Lignes 2114–2118 : chaque caractère doit être une lettre non accentuée (a–z, A–Z), un chiffre, `_` ou `-`. Sinon refusé.
5. Ligne 2119 : renvoie le nom nettoyé.

```csharp
bool ok = (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9') || c == '_' || c == '-';
```

**Noms autorisés** : `light_eco`, `hvac_nuit`, `vacation`. **Refusés** : `éco` (accent), `mon preset` (espace), `../x` (point et barre).

**Attention** : un refus renvoie un texte vide, pas un message précis. Les majuscules sont conservées : `Light_Eco` est accepté mais ne sera pas reconnu par `ApplyPreset`, qui compare en minuscules.

---

### ApplyPreset (lignes 2122–2273)

**À quoi ça sert**

Appliquer un preset personnalisé lu dans `/user/`. Elle renvoie `true` si le preset a été appliqué, `false` sinon. Dans ce dernier cas l'appelant applique son comportement **par défaut** codé en dur.

**Quand elle est appelée** : commandes globales, digitaux 401 à 410 (lignes 1676–1759).

| Digital | Nom de preset cherché | Défaut si pas de fichier (lignes) |
|---|---|---|
| 401 | `light_all` | 10 circuits à 65535 (1678–1683) |
| 402 | `light_off` | 10 circuits à 0 (1691–1696) |
| 403 | `light_eco` | 10 circuits à 32768 (1704–1709) |
| 404 | `shade_open` | impulsion Monter sur tous les moteurs (1716) |
| 405 | `shade_close` | impulsion Descendre sur tous les moteurs (1722) |
| 407 | `hvac_confort` | consigne 210 (21,0 °C), CVC en marche (1733) |
| 408 | `hvac_nuit` | consigne 180 (18,0 °C) (1742) |
| 409 | `hvac_horsgel` | consigne 120 (12,0 °C) (1751) |
| 410 | `vacation` | tout éteint, consigne 120, stores fermés (1761–1768) |

Le digital 406 (position intermédiaire des stores) ne fait qu'une trace (ligne 1726).

**Comment ça marche — tronc commun**

1. Lignes 2127–2128 : le nom passe par `SanitizePresetName` ; refusé = `false`.
2. Lignes 2129–2134 : fichier `/user/preset_cfg_<nom>.json` absent = message console et `false`.
3. Lignes 2136–2143 : lecture du fichier, puis du champ `"data"`. S'il manque ou n'est pas un objet = `false`.
4. Ligne 2145 : trace « Applying customized preset ».
5. Ensuite, le **début du nom** choisit le type de preset (`StartsWith` = « commence par »).

**Branche éclairage — nom commençant par `light_` (lignes 2147–2177)**

Format attendu (commentaire ligne 2149) :

```json
"data": { "1": { "71": 65535, "72": 32768 }, "2": { ... } }
```

1. Pour chaque clé de `data` : c'est un numéro de pièce. Il doit exister dans le registre (ligne 2153).
2. Pour chaque circuit de cette pièce : la clé est un join logique de 71 à 80 (ligne 2162). Les autres sont ignorées.
3. La valeur (0 à 65535) est rangée dans le niveau du circuit (ligne 2165). Le circuit 71 met aussi à jour `LightLevel1` (lignes 2168–2169).
4. Ligne 2175 : `BroadcastFeedbackToAll()` renvoie l'état à tous les panneaux, puis `true`.

Seules les pièces et circuits présents dans le fichier changent.

**Branche stores — nom commençant par `shade_` (lignes 2178–2207)**

Format attendu (ligne 2180) :

```json
"data": { "1": [1, 2, 3], "2": [4] }
```

1. Ligne 2181 : « ouvrir » seulement si le nom est **exactement** `shade_open`. Tout autre nom `shade_...` = fermer.
2. Pour chaque pièce connue, pour chaque numéro de moteur de 1 à 6 (ligne 2193) : on calcule l'offset dans le bloc de la pièce. Monter = 61 + (moteur-1)×3, Descendre = 63 + (moteur-1)×3 (ligne 2199).
3. Ligne 2200 : `PulseRoomDigital` envoie une **impulsion** (vrai puis faux) sur ce join du bloc de la pièce, vers tous les périphériques (EISC compris si la pièce est activée pour l'intersystème, lignes 901–913).
4. Ligne 2206 : `true`. Pas de `BroadcastFeedbackToAll` ici (rien n'est mémorisé).

```csharp
uint offset = (uint)((isOpening ? 61 : 63) + (motorId - 1) * 3);   // ligne 2199
```

Exemple : moteur 2 de la pièce 1, fermeture = offset 66, soit join 1066 (base de la pièce 1 = 1000).

**Branche CVC — nom commençant par `hvac_` (lignes 2208–2228)**

Format attendu (ligne 2210) :

```json
"data": { "1": { "temp": 210 }, "2": { "temp": 190 } }
```

1. Pour chaque pièce connue ayant un champ `temp` : la consigne prend cette valeur (en dixièmes de degré, 210 = 21,0 °C) et le CVC est mis en marche (lignes 2220–2222).
2. Ligne 2226 : `BroadcastFeedbackToAll()`, puis `true`.

**Branche vacances — nom exactement `vacation` (lignes 2229–2266)**

Format attendu (ligne 2231) :

```json
"data": { "light": true, "shade": false, "hvac": true }
```

1. Lignes 2232–2234 : lecture des trois options. Une option absente vaut `true`.
2. Lignes 2236–2247 : si `light` : applique le preset `light_off` ; s'il n'existe pas, met toutes les lumières à 0.
3. Lignes 2249–2253 : si `shade` : applique `shade_close` ; sinon impulsion Descendre sur tous les moteurs de toutes les pièces.
4. Lignes 2255–2261 : si `hvac` : applique `hvac_horsgel` ; sinon consigne 120 et CVC en marche partout.
5. Ligne 2264 : `BroadcastFeedbackToAll()`, puis `true`.

Le preset `vacation` est donc un **assemblage** de trois autres presets. La méthode s'appelle elle-même (appel « récursif »), sans risque de boucle car les noms appelés ne sont jamais `vacation`.

Le drapeau `_vacationModeActive` n'est pas touché ici : il est mis à `true` par l'appelant (ligne 1758) avant l'appel.

**Fin de méthode**

- Lignes 2268–2271 : toute erreur (valeur non numérique, valeur hors plage 0–65535, etc.) est écrite dans le journal d'erreurs.
- Ligne 2272 : `false` si aucune branche n'a abouti.

**Attention**

- Un nom qui ne commence par aucun préfixe connu (et n'est pas `vacation`) lit le fichier puis renvoie `false` sans rien faire.
- Si une erreur survient au milieu d'une branche, les pièces déjà traitées **restent modifiées**, puis l'appelant applique en plus le défaut (car `false` est renvoyé). Pour la branche stores, des impulsions peuvent donc partir deux fois.
- La branche CVC n'impose aucune limite à `temp`. Ailleurs, une consigne reçue du GUI doit être entre 160 et 280 (ligne 1303).
- Un circuit à 65536 ou plus, ou une valeur négative, fait échouer la conversion `(ushort)` (ligne 2164) et donc tout le preset.

---

### Points à vérifier (partie)

| Ligne | Point | Raison |
|---|---|---|
| 1898–1905 | Écriture des joins partagés (51–54, 71–80, 201–204, 150–156…) aussi vers l'EISC | Seuls 610–615 / 61–65 / 620–627 sont exclus ; vérifier que le slot 2 n'interprète pas ces écritures comme des appuis (même risque que celui décrit lignes 94–97). |
| 1938 | « CLIMATISATION » quand consigne = mesure | Comportement probablement non voulu ; à confirmer côté GUI. |
| 1956–1962 | `DispatchAudioRouting` sans effet matériel | Vérifier que le routage audio réel est bien fait par le slot 2 SIMPL, sinon fonction manquante. |
| 1964–1975 | `DispatchIpCommandToSonyTv` sans driver | Maquette ; noms de sources en dur, non issus de `villa_config.json`. À supprimer ou implémenter. |
| 2014 | `parts[5]` avec seulement 5 mots | Erreur rattrapée, mais la table IP entière est remplacée par un message d'erreur. |
| 2039–2042 | Troncature à 254 caractères | Table IP presque toujours coupée ; le contrat signale ce digital 103 comme code mort (doc lignes 165–167). |
| 1460–1473 / 2051 | Commande console libre depuis un panneau | Aucun filtrage des commandes ; réponse diffusée à tous les panneaux. Risque d'exploitation. |
| 2095 | Contenu JSON non validé à la sauvegarde | Un `data` mal formé n'est détecté qu'à l'application. |
| 1514 / 2067 | Émetteur du sériel 420 | Aucune occurrence trouvée dans les `.html` / `.js` du dossier `ch5` : la sauvegarde de presets est peut-être inutilisée. |
| 2147 / 2113 | Sensibilité à la casse | `Light_Eco` passe le filtre mais ne correspond à aucune branche. |
| 2164, 2192, 2220 | Conversions `(ushort)` / `(int)` sans contrôle | Une valeur hors plage fait échouer tout le preset après modification partielle, puis le défaut s'applique en plus. |
| 2220 | Consigne CVC de preset sans bornes | Pas de contrôle 160–280 comme ligne 1303 (hors-gel 120 est volontairement en dessous). |
| 2181 | `shade_` autre que `shade_open` = fermeture | Un futur preset `shade_mi` fermerait les stores. |

---

### Joins de cette partie

Sens : « → CP4 » = du panneau vers le programme ; « → panneau » = feedback du programme vers le panneau ; « ↔ » = les deux.

| Type | Join ou plage | Sens | Rôle |
|---|---|---|---|
| Analogique | 10 | → panneau | Numéro de la pièce affichée (ligne 1865) |
| Sériel | 10 | → panneau | Nom de la pièce en majuscules (1866) |
| Digital | 11–40 | → panneau | Sélection de pièce 1 à 30, interlock (1878–1881) |
| Analogique | 31 | → panneau | Consigne de température ×10 (1905) |
| Sériel | 32 | → panneau | Température mesurée, texte « 21.5 » (1934) |
| Sériel | 33 | → panneau | Mode CVC : ARRÊT / CHAUFFAGE / CLIMATISATION (1938) |
| Sériel | 34 | → panneau | Consigne, texte (1942) |
| Digital | 41 / 42 | → panneau | Centrale d'alarme armée / désarmée (1950–1951) |
| Digital | 51–54 | → panneau | Scène d'éclairage active 1 à 4 (1892–1895) |
| Digital | 55 | → panneau | Mute audio (1948) |
| Analogique | 51 / 52 / 53 | → panneau | Source vidéo / volume / source audio, 5 = musique (1944–1946) |
| Analogique | 61 | → panneau (sauf EISC) | Ventilation CVC (1901) |
| Analogique + Sériel | 62–65 | → panneau (sauf EISC) | Valeurs et textes bien-être (1903) |
| Analogique | 71–80 | → panneau | Niveaux des 10 circuits d'éclairage (1908–1911) |
| Sériel | 99 | → panneau | IP-ID du panneau (1869) |
| Sériel | 101 / 102 | → panneau | Nom et date de compilation du CPZ (1872–1873) |
| Digital | 103 | → CP4 | Demande de table IP `ipt` (ligne 1779, hors contrat) |
| Sériel | 103 | ↔ | Commande console (entrée) / réponse mise en forme (sortie) (1460–1473, 1786–1789) |
| Sériel | 104 | → panneau | Date de validation propre au panneau (1875) |
| Sériel | 106 | → panneau | Empreinte de la configuration (1874) |
| Digital | 150–154 | → panneau | Source vidéo 0 à 4, interlock (1884–1887) |
| Digital | 155 / 156 | → panneau | Musique / audio suit la vidéo (1888–1889) |
| Digital | 201–204 | → panneau | Scène de stores active (1914–1917) |
| Analogique | 254 | → panneau | Volume du lecteur média (1947) |
| Digital | 301–312 | → panneau | 4 partitions × (armé, état 2, désarmé) (1920–1927) |
| Digital | 401–405, 407–410 | → CP4 | Commandes globales qui tentent un preset (1676–1759) |
| Digital | 410 / 411 | → panneau | Mode vacances actif / inactif (1930–1931) |
| Sériel | 420 | → CP4 | JSON de sauvegarde d'un preset (1514, 2067) |
| Digital | 610–615 | → panneau (sauf EISC) | État CVC marche/arrêt et ventilation (1900) |
| Digital | 620–627 | → panneau (sauf EISC) | Sélections bien-être sauna/hammam (1902) |
| Digital | bloc pièce +61..+78 (ex. 1061–1078 pour la pièce 1) | → périphériques et EISC | Impulsions moteurs de stores par preset `shade_` (2199–2200) |

---
