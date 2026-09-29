# Showroom FTV Nyon — contrat de joins 1.0

Généré par `node tools/gen_joins.js` depuis `showroom_config.json` → `contrat` (ne pas éditer à la main).
Le GUI (`js/bus.js` : `Joins.of(nom, n)`), le C# (`Joins.cs`) et le générateur SIMPL lisent la même source.

## Principe
- Tous les joins de pilotage sont globaux : le même numéro dans toutes les pièces.
- Le C# (slot 1) connaît la pièce affichée par chaque écran : il applique l'action à cette pièce, pose Room_Select# (a10) et Room_Active_nn sur l'EISC, puis recopie l'action sur le même join.
- Feedback des écrans : calculé par le C# (déploiement) ou par js/local-feedback.js (vitrine) sur les mêmes joins.
- Sur le symbole EISC : SORTIE = ce que le slot 2 reçoit (nom nu = action, Rnn_xxx_fb = état tenu par le C#) ; ENTRÉE = ce que le slot 2 renvoie (suffixe _Actual).
- Bloc pièce EISC : join = 1000 + (id-1)*100 + offset. Réservé aux échanges C# ↔ slot 2, jamais émis par un écran.

Sens : → écran vers C# · ↔ commande et retour sur le même join · ← retour seul (jamais sur l'EISC).

Écrans : TSW-1070 0x03, XPanel 0x04, iPad 0x05 et iPhone 0x06
(Crestron One, projet `showroomnyon`). EISC 0xF0 → 127.0.0.2 (slot 2).

## Digitaux
| Join | Nom | Sens | Description |
|---|---|---|---|
| 11-40 | `Room_Select_{n}` | ↔ | Afficher la pièce n (join = 10+n) ; fb = pièce affichée par cet écran. Sur l'EISC : Room_Active_{n}, un seul haut, miroir de a10. |
| 51-58 | `House_Action_{n}` | ↔ | Action maison n (maison.actions[n-1] : Welcome, Goodbye…) ; fb = impulsion 1,4 s « action appliquée » |
| 59 | `Room_Off` | ↔ | Bouton Marche/Arrêt de la barre du bas dans une pièce : éclairages à 0, musique et vidéo arrêtées |
| 60 | `House_AllOff` | → | Bouton Marche/Arrêt de la barre du bas sur l'accueil : toute la maison éteinte |
| 61-68 | `Room_Action_{n}` | ↔ | Action n de la pièce affichée (pieces[].actions[n-1]) ; fb = impulsion 1,4 s |
| 71-78 | `Light_Scene_{n}` | ↔ | Scène d'éclairage n de la pièce affichée (niveaux dans pieces[].pilotages.eclairages.scenes[n-1].niveaux) ; fb tenu = scène active |
| 101 | `Lights_AllOn` | ↔ | Tous les circuits de la pièce à 100 % ; fb = tous allumés |
| 102 | `Lights_AllOff` | ↔ | Tous les circuits à 0 ; fb = tous éteints |
| 103 | `Lights_DimUp` | → | All Lights + : tous les circuits +10 % |
| 104 | `Lights_DimDown` | → | All Lights − : tous les circuits −10 % |
| 111-130 | `Light_{n}_Toggle` | ↔ | Interrupteur du circuit n (1..20) : 0 ↔ dernier niveau (100 % par défaut) ; fb = circuit allumé |
| 141 | `House_Lights_AllOff` | → | Accueil, tuile Lights : éteint tous les circuits de la maison |
| 201-208 | `Video_Remote_{n}` | → | Télécommande Apple TV de la pièce : 1 Menu, 2 Lecture/Pause, 3 TV/Accueil, 4 Haut, 5 Bas, 6 Gauche, 7 Droite, 8 Sélection |
| 231-238 | `Camera_Select_{n}` | ↔ | Afficher la caméra n ; fb = caméra affichée |
| 251 | `Video_Off` | ↔ | Arrêt de la vidéo de la pièce ; fb tenu = vidéo arrêtée |
| 261-268 | `Video_Source_{n}` | ↔ | Source vidéo n dans la pièce affichée (allume) ; fb = source active |
| 281-288 | `Music_Service_{n}` | ↔ | Service audio n (musique.services[n-1]) dans la pièce affichée, démarre la lecture ; fb = service actif |
| 291-298 | `Music_Fav_{n}` | ↔ | Favori n (musique.favoris[n-1]) ; fb = favori en cours |
| 301 | `Music_Prev` | → | Piste précédente |
| 302 | `Music_PlayPause` | ↔ | Lecture / pause ; fb tenu = en lecture |
| 303 | `Music_Next` | → | Piste suivante |
| 304 | `Music_Mute` | ↔ | Muet ; fb tenu = muet |
| 305 | `Music_Rewind` | → | Retour de 15 s |
| 306 | `Music_Forward` | → | Avance de 15 s |
| 307 | `Music_Like` | ↔ | J'aime ; fb tenu |
| 308 | `Music_Dislike` | ↔ | Je n'aime pas ; fb tenu |
| 309 | `Music_Shuffle` | ↔ | Lecture aléatoire ; fb tenu |
| 310 | `Music_Repeat` | ↔ | Répétition ; fb tenu |
| 311 | `Music_Off` | ↔ | Arrêt de la musique de la pièce (bouton Marche/Arrêt du lecteur) ; fb tenu = arrêtée |
| 312 | `Music_SleepTimer_Toggle` | ↔ | Minuterie de veille ; fb tenu = active |
| 321-328 | `Music_Browse_{n}` | → | Rubrique n de « Parcourir » du service actif (Flow, Charts…) |
| 401-430 | `Room_{n}_LightsOn` | ← | Pièce n : au moins un circuit allumé (tuiles de la page Rooms, textes d'état) |
| 431-460 | `Room_{n}_MediaOn` | ← | Pièce n : musique ou vidéo en marche |
| 470 | `House_MusicPlaying` | ← | Au moins une pièce en lecture (tuile Music de l'accueil) |
| 471 | `House_LightsOn` | ← | Au moins un circuit allumé dans la maison |

## Analogiques
| Join | Nom | Sens | Description |
|---|---|---|---|
| 10 | `Room_Select#` | ↔ | Pièce affichée par cet écran (1..30). Sur l'EISC : posé AVANT chaque recopie d'action → clé de bufferisation du slot 2 |
| 11-30 | `Light_{n}_Level#` | ↔ | Niveau du circuit n (0-65535) ; curseur → C# ; fb = niveau |
| 49 | `Video_Volume#` | ↔ | Volume vidéo de la pièce (0-100) |
| 51 | `Video_Source#` | ← | Source vidéo active de la pièce (0 = arrêt) |
| 70 | `Music_Volume#` | ↔ | Volume musique de la pièce (0-100) |
| 71 | `Music_Position#` | ← | Position de lecture (s) |
| 72 | `Music_Duration#` | ← | Durée de la piste (s) |
| 73 | `Music_SleepTimer#` | ↔ | Minuterie de veille (min, 0-120) |
| 74 | `Music_Service#` | ← | Service actif de la pièce (0 = arrêt) |
| 75 | `Music_Track#` | ← | Index de la piste en cours (1..n de musique.pistes) |
| 76 | `House_MediaRoom#` | ← | Pièce du lecteur « en cours » de la barre du bas (0 = aucune) |
| 77 | `Light_Scene#` | ← | Scène d'éclairage active de la pièce (0 = aucune) |
| 78 | `House_LightsOnCount#` | ← | Nombre de circuits allumés dans la maison |
| 79 | `Camera#` | ← | Caméra affichée (0 = aucune) |

## Sériels (écrans seulement)
| Join | Nom | Sens | Description |
|---|---|---|---|
| 20 | `Music_Title$` | ← | Titre en cours |
| 21 | `Music_Artist$` | ← | Artiste |
| 22 | `Music_Album$` | ← | Album |
| 23 | `Music_Cover$` | ← | Pochette (chemin relatif au GUI ou URL) |
| 24 | `Music_NowPlaying$` | ← | Barre du bas : « Deezer in Aquarium » |
| 25 | `Video_Source_Name$` | ← | Nom de la source vidéo active |
| 26 | `Camera_Url$` | ← | Flux de la caméra affichée (vide = image fixe de la config) |
| 99 | `Systeme_IpId$` | ← | IP-ID de l'écran connecté |
| 101 | `Systeme_CpzNom$` | ← | Nom du CPZ |
| 102 | `Systeme_CpzDate$` | ← | Date de compilation du CPZ |

## Blocs pièce (C# ↔ slot 2) — join = 1000 + (id − 1) × 100 + offset
Sortie `_fb` = état tenu par le C#, reçu par le slot 2 ; entrée `_Actual` = mesure renvoyée par le slot 2, qui fait foi.

### Digitaux
| Offset | Nom | _fb | _Actual | Fonction requise |
|---|---|---|---|---|
| +1-20 | `Rnn_Light_{n}_On` | oui | oui | eclairages |
| +31-38 | `Rnn_Light_Scene_{n}` | oui | — | eclairages |
| +41-48 | `Rnn_Action_{n}` | oui | — | * |
| +61 | `Rnn_Room_Displayed` | oui | — | * |
| +71 | `Rnn_Music_Playing` | oui | oui | audio |
| +72 | `Rnn_Music_Muted` | oui | oui | audio |
| +81 | `Rnn_Video_On` | oui | oui | video |

### Analogiques
| Offset | Nom | _fb | _Actual | Fonction requise |
|---|---|---|---|---|
| +11-30 | `Rnn_Light_{n}_Level` | oui | oui | eclairages |
| +71 | `Rnn_Music_Volume` | oui | oui | audio |
| +72 | `Rnn_Music_Service` | oui | oui | audio |
| +81 | `Rnn_Video_Volume` | oui | oui | video |
| +82 | `Rnn_Video_Source` | oui | oui | video |

## Recette Debugger (slot 2)
1. Afficher Aquarium sur la dalle : `Room_Select#` = 1, `Room_Active_01` haut.
2. Relax (action 1) : `Room_Action_1` en impulsion, `R01_Action_1_fb` en impulsion, `R01_Light_1_Level_fb` = 40 %.
3. Curseur « Spots » : `Light_1_Level#` suit, puis `R01_Light_1_Level_fb`.
4. Deezer (action 2) : `Room_Action_2`, `R01_Music_Playing_fb` haut, `R01_Music_Service_fb` = 1.
5. Forcer `R05_Light_3_Level_Actual` depuis le Debugger : la dalle affiche le niveau reçu (le slot 2 fait foi).
6. Bouton Marche/Arrêt de la barre du bas : `Room_Off`, tous les `R01_*_fb` retombent.
7. Accueil, Goodbye : `House_Action_2`, toutes les pièces éteintes. Console CP4 : `showroomstate`.
