# Villa Crans CH5 — journal des versions

## 21/09/2026 — C1 : source iPhone synchronisée vers Vercel

- Source CH5 iPhone : diagnostic C1 intégré, commandes et feedbacks natifs conservés ; CH5Z non compilé.
- CPZ slot 1 : aucun changement du C# du dépôt, C1 matériel fourni dans le ZIP séparé ; aucune compilation ni installation.
- LPZ slot 2 : inchangé.
- Showcase : copie iPhone régénérée via le synchroniseur existant pour publication autorisée sur Vercel.

Build/lint et 14 tests du diagnostic réussis. Rendu navigateur indisponible ; qualification générale 39/43, mêmes quatre échecs de version sur la référence inchangée. Détails et preuves dans le journal showcase et `docs/verification/2026-09-21-centralisation-c1/`.

## v4.3.1 — 19/09/2026 — le bandeau de latence ne s'armait jamais (a recompiler : CH5 seul)

| Artefact | Etat de ce lot |
|---|---|
| CH5 source | `src/iphone.html` — **a recompiler** |
| CPZ slot 1 | inchange, **1.0.194.0** deja en place sur le CP4 |
| Config | `meta.version` 1.0.201 ; `meta.tracesLatence` reste `true`, description corrigee |

**Le defaut.** Le bandeau n'apparaissait pas au lancement de l'application. Verification faite en ouvrant le
bundle deploye : `iphone.html` contient bien le bloc, mais le `.ch5z` embarque aussi `villa_config.js`, fige au
moment du build, avec `tracesLatence: false`. La GUI lit cette copie embarquee en premier (`villaConfigEmbedded`),
puis le cache `localStorage` — lui aussi perime — et ne recoit la config du CP4 qu'apres le transfert complet par
chunks seriels. Le code d'armement lisait donc `false`, et abandonnait definitivement au bout de 30 s. Pousser la
config au CP4 n'y aurait rien change : le drapeau arrivait apres la fermeture de la fenetre d'ecoute.

**La correction, au niveau du principe et non du symptome.** On ne rallonge pas le delai d'attente, on supprime la
dependance : le bandeau s'arme desormais par un **geste** — 5 appuis sur le titre CENTRALISATION en moins de 3 s —
memorise par appareil dans `localStorage`, survivant au relancement, coupe par le meme geste. Aucun transfert de
configuration n'est requis, et l'etat ne peut pas fuir vers la vitrine puisqu'il est local a l'appareil.
`meta.tracesLatence` ne gouverne plus que les traces `[LAT]` du slot 1 : un drapeau, un seul proprietaire.

**Lecon consignee.** Un drapeau d'exploitation lu par la GUI ne peut pas venir de `villa_config` : trois sources
concurrentes (copie embarquee dans le `.ch5z`, cache `localStorage`, transfert CP4) et seule la derniere est a
jour. Tout ce qui doit agir des le lancement passe par un geste ou par le build, jamais par la config.

**Deux defauts de plus, trouves apres le premier essai du geste (memes lot et version).**
1. Le bandeau etait pose a `z-index: 99999` alors que la page monte a `1000001` : il etait bien cree, mais cache
   derriere la fenetre Centralisation et son voile. Porte a `2000000`.
2. Le geste ecoutait `click`. Dans une WKWebView iOS, un appui sur un element non cliquable - pas de gestionnaire,
   pas de `cursor: pointer` - n'emet aucun `click`, et le titre CENTRALISATION est un `<span>` decoratif : le geste
   ne partait jamais. Bascule sur `pointerdown` + `touchstart`, avec un garde-fou de 250 ms puisque les deux
   evenements se suivent sur un meme appui.
3. Ajout d'un retour visuel des le 2e appui (`LAT 2/5`, `3/5`...) : un geste silencieux qui echoue n'apprend rien
   a celui qui le fait. Regle a retenir pour tout geste cache ajoute plus tard.


## v4.3 — 19/09/2026 — lot « mesure » : chrono de latence, logs PRESETS, forcage cible (a compiler : CH5 + CPZ)

| Artefact | Etat de ce lot |
|---|---|
| CH5 source | `src/iphone.html` — **a recompiler** (bloc overlay ajoute ; `index.html` inchange) |
| CPZ slot 1 | `ControlSystem.cs` + `AssemblyInfo` → **1.0.194.0**, **a recompiler** (SIMPL# Pro) |
| LPZ slot 2 | inchange |
| Config | `villa_config.json` → `meta.version` 1.0.199, nouveau `meta.tracesLatence` (faux) |
| Showcase | non concerne (drapeau inactif, aucun rendu modifie) |

**Pourquoi ce lot ne corrige rien.** Les deux corrections du 18/09 (selecteur d'appui long, allegement de
`PushRoomFeedback`) n'ont eu aucun effet sur le retard de feedback de l'iPhone. Deux diagnostics faux de suite :
on arrete de corriger et on mesure. Le seul fait etabli par les captures de Donatien est que le retour d'etat est
**immediat sur la TSW quand l'appui vient de l'iPhone** : le trajet iPhone → CP4 et le trajet CP4 → TSW sont donc
rapides, et le retard est strictement **descendant vers l'IP-ID 06**. Ce lot instrumente ce trajet.

**1. Chrono de latence des deux cotes, sous un drapeau unique `meta.tracesLatence` (faux par defaut).**
Cote slot 1 : l'instant de reception d'un appui est memorise sans rien imprimer (l'impression console du CP4 est
bloquante et fausserait la mesure), et une seule ligne part apres la diffusion —
`[LAT] ip=xx join=nnn phase=broadcast n=<joins ecrits> dt=<ms>`. Cote GUI iPhone : un bandeau en bas a gauche
affiche le delai appui → retour d'etat sur les joins 401-411 et 51-54, avec maximum, moyenne et nombre de mesures.
Lecture croisee : `dt` faible cote CP4 **et** delai eleve cote GUI = retard de transport CIP vers ce panel, hors du
programme. Un `progreset` suffit pour armer ou desarmer la mesure, aucune recompilation.

**2. Les lignes `PRESETS: Configuration file ... not found` passent sous `Trace()`.** `ApplyPreset` est appele a
**chaque** commande globale 401-411 ; tant qu'aucun preset personnalise n'existe dans `/user/`, chaque appui
declenchait un `CrestronConsole.PrintLine` **bloquant**. C'est ce qui remplissait la console de Donatien (11 lignes
pour 11 appuis). Le message reste disponible avec `meta.tracesConsole`.

**3. `_forcePush` n'etait pas cible.** A la mise en ligne d'un seul peripherique, `_forcePush = true` restait vrai
pendant `PushAllRoomsFeedback()` : **tous** les panels connectes recevaient une reecriture inconditionnelle de tous
leurs joins, pas seulement l'arrivant. Le forcage est desormais porte par un peripherique (`_forcePushTarget`,
lu par le helper partage `Force(dev)` des trois setters `SetBool` / `SetUShort` / `SetString`). Corrige au niveau du
systeme, donc valable pour la dalle, l'iPad, les XPanel et l'EISC en meme temps.

**Hors lot, volontairement.** Les boutons 💾 explicites de la fenetre Circuits corrigent l'appui long, pas le retard
de feedback : les melanger a une mesure empecherait de savoir ce qui a agi. XPanel IP-ID 04 hors ligne : dossier
separe.

**Protocole de mesure.** Passer `meta.tracesLatence` a `true`, `progreset`, ouvrir la Console Web, lancer
l'application iPhone, appuyer dans Centralisation jusqu'a reproduire le lag, relever les lignes `[LAT]` et le
bandeau. Remettre `false` ensuite.


## v4.2 — 18/09/2026 (soir) — appui long dans la fenetre Circuits, feedback des panels allege (a compiler : CH5 + CPZ)

| Artefact | Etat de ce lot |
|---|---|
| CH5 source | `src/iphone.html` — **a recompiler** (`index.html` inchange : la dalle etait deja correcte) |
| CPZ slot 1 | `ControlSystem.cs` + `AssemblyInfo` → **1.0.193.0**, **a recompiler** (SIMPL# Pro) |
| LPZ slot 2 | inchange, `Project_Slot2.lpz` du 18/09 05:20 reste valable |
| Showcase | `iphone.html` regenere par `patch_html` de `sync-villa-crans.py` ; **non pousse** |

**1. L'appui long n'enregistrait jamais depuis la fenetre Circuits (retour Donatien : « toujours pas »).** Le gestionnaire iPhone n'ecoutait que `.scene-btn-mobile[id^="scene-btn-"]`, c'est-a-dire les 4 boutons de la **page principale** (l. 855-858). Les 4 boutons de la **fenetre Circuits** (l. 1021-1024) sont des `<ch5-button customClass="scene-btn" data-join="5x">` sans `id` ni cette classe : aucun `pointerdown` ne les ecoutait. Or c'est la qu'on regle les curseurs, donc la qu'on enregistre. Le correctif iOS du lot precedent (`touch-callout`, `contextmenu`, `stopImmediatePropagation`) etait juste, mais pose sur les mauvais boutons. Desormais un seul selecteur couvre les deux jeux (`SCENE_SEL`, `sceneBtnOf`, `sceneIdxOf`), comme la dalle qui lisait deja `sendEventOnClick`. Au relachement, le clic ne rappelle plus la scene ; l'impulsion native du `<ch5-button>` est conservee (elle ne l'est pas pour le `<button>` de la page principale, dont l'`onclick` est bloque).

**2. Retour d'etat lent sur l'iPhone, immediat sur la TSW (fenetre Centralisation).** `PushRoomFeedback` ecrivait le bloc de chaque piece vers **tous** les peripheriques. Or **aucune GUI ne lit un join >= 1000** depuis que `contrat.blocsPiecesGui.actif` est faux (verifie par recherche sur `index.html` et `iphone.html` : zero occurrence d'un join a quatre chiffres). Chaque commande globale declenche `BroadcastFeedbackToAll` → `PushAllRoomsFeedback` : ~15 pieces x ~60 joins = **environ 900 ecritures inutiles par panel et par appui**. La TSW encaisse en CIP natif ; l'XPanel de l'iPhone, en websocket sur WiFi, serialise, d'ou les secondes. Le bloc de piece ne part plus que vers l'**EISC** (slot 2), seul a en avoir besoin pour les drivers ; l'instantane global vers les panels affichant la piece est inchange.

**3. Libelle « Scenarios Eclairage : » de la fenetre Circuits** : sans `data-i18n`, il restait en francais dans les 4 autres langues. Cle `lighting_scenarios` ajoutee aux 5 dictionnaires. Les 4 boutons de scene de cette fenetre etaient deja alimentes par `villa_config` + `villaTranslateName` (l. 3101) : le « TOTAL / REPAS / CINEMA / OFF » en francais vu sur Vercel vient du build du 17.09 encore en ligne, pas de la source.

Recette (Playwright, iPhone 16 Pro 393x852, moteur showcase, copie locale) : appui court dans la fenetre Circuits → 0 sequentiel 421 ; appui long (1,3 s) → `{"p":1,"s":4,"c":[12,0,30,25,0]}`, 32 caracteres (limite CP4 : 119) ; appui long page principale → scene 2 enregistree (non regresse) ; appui court page principale → 0 ; 0 erreur console. Aucun test sur materiel dans ce lot : la latence et l'appui long iOS restent a confirmer sur le CP4 et l'app Crestron One.

## Correctif 18/09/2026 (soir) — clé en double `Musique` qui bloquait `deploy.ps1`

`deploy.ps1 -Target tsw` s'arrêtait après les contrôles de contraste : « villa_config.json invalide : le dictionnaire contient les clés en double MUSIQUE et Musique ». Cause : `ConvertFrom-Json` de PowerShell 5.1 compare les clés **sans tenir compte de la casse** ; les quatre tables `traductions` contenaient `MUSIQUE` (nom de la source id 5, ajouté par le lot traductions du 18/09) **et** `Musique`, héritée. `JSON.parse`, Python et le validateur acceptaient les deux. La clé `Musique` n'était référencée nulle part (ni HTML, ni `data-tname`, ni ailleurs dans le JSON) : supprimée des 4 langues, copies `src/` et vitrine régénérées. Aucun autre doublon de casse dans le fichier.

Garde-fou : `tools/quality/validate-config.mjs` refuse désormais deux clés de `traductions` identiques à la casse près (43/43 tests toujours verts). Aucun build, aucun envoi par ce correctif.

## P1 Reprise — 18/09/2026 — contrat v4.1 documenté, config purgée, outillage Codex re-basé (pas de build, pas de push)

| Artefact | État de ce lot |
|---|---|
| CH5 source | `meta.version` aligné sur `version.json` = **1.0.196** ; aucun HTML/JS/CSS modifié (lot traductions de la nuit toujours **à compiler**) |
| CPZ slot 1 | inchangé (chargé 1.0.191.0 ; source `AssemblyInfo` 1.0.192.0) |
| LPZ slot 2 | inchangé : `generate_slot2.js` relancé sur copie avec la config corrigée → **SMW identique**, `Project_Slot2.lpz` du 18/09 05:20 reste valable, recette Debugger à faire |
| Showcase | `villa_config.json` / `.js` régénérés (`clean_config`) : mapping analog 81-90 + traductions, `1.0.196-showcase` ; **non poussé** |

Archivage préalable : working tree de l'autre session (lots 1.0.186, 1.0.191, traductions) commité sur `main` (`f9804689`) et branche `backup/crestron-local-2026-09-18` poussée. Main reste **2 commits en avance** sur `origin/main`, non poussés (le push déploierait la vitrine).

**`villa_config.json`** (source, puis copies `src/` et vitrine) : `blocsPiecesGui.mapping.analog` complété 81-90 (le C# `V4AnalogOffsets` et `MaxCircuits = 20` allaient déjà jusqu'à 90) ; `sourcesAudioVideo` renommées Apple TV / Sky Q / Swisscom / IPTV / MUSIQUE (libellés réels du GUI, en dur dans `index.html` l. 4337-4381 ; l'ancienne liste IPTV / Box pirate / Humax / Jukebox ne servait qu'à une table `legacy.sources` non affichée) ; noms de test purgés : pièce 1 REPAS2 → REPAS, TOTAL3 → TOTAL, pièce 2 et `valeursParDefaut.scenesEclairage` → OFF / AMBIANCE / REPAS / TOTAL ; 11 clés orphelines retirées des 4 tables `traductions` (dont « Chambre pour baiser », « Salle à baiser », « Salon2 »), `AMBIANCE` ajoutée (en/es/de/ru). `validate-config` : 0 défaut.

**Docs contrat** : `docs/03_CONTRAT_JOINS.md` → « Contrat de joins v4.1 », §0 « Principe v4 » (joins globaux + a10, couche v3 désactivée, blocs pièce réservés au C# ↔ slot 2, feedback fourni par le C#), §1 / §5 / §6 marqués historiques, circuits 1..20 ; `simpl/contract/README_SLOT2.md` → `Project_Slot2`, section « État v4.1 » (entrées EISC mortes : `Source_Select_n`, `Source_AudioReturn`, `Audio_Mute`, `Motor_n_*`, `Shades_Scene_n`, `Media_Volume#`, `Circuit_n#`, `Room_Select#` entrant ; ce que le C# lit : 41/42, 44/45, 301-312, 410/411, `_Actual` par pièce ; offsets +41..57 / +81..92 poussés sans nom), section « logique à câbler » du 16.09 remplacée (elle demandait des interlocks slot 2 que le C# rend inutiles), 20 circuits, join max 2490 ; `docs/04_SIMPL_SLOT2.md` : bandeau historique.

**`tools/quality` (session Work Codex du 17/09)** : `validate-config.mjs` circuits ≤ 20 ; `audit.mjs` lit `Project_Slot2.smw` (l'ancien `VillaCrans_Slot2.smw` est supprimé) ; `runtime-v4.json` re-basé : id `crans-montana-v4.1-gui1.0.196-csharp1.0.192.0`, contrat v4.1, 13 empreintes SHA-256 recalculées (9 sources avaient changé) ; `examples/villa-leman-pilot.json` réaligné (version, contrat) ; `prepare-beta-config.mjs` et `docs/industrialisation/*` : « Grand Montana » → « Crans-Montana ». **43/43 tests node verts** sur copie (`quality.test.mjs` 23, `compatibility.test.mjs` 20). Les rapports chiffrés des lots 0.1.0/0.2.0 restent hors dépôt.

**Bêta Alexandre** : `docs/verification/2026-09-18-beta-alexandre/` (profil `banc-beta-alexandre` 1.0.196, 15 ids / 14 pièces actives, 0 défaut `--release`, README avec les commandes `prepare-project` → CH5Z → CPZ → LPZ) ; `docs/industrialisation/BETA-ALEXANDRE.md` : état du candidat mis à jour (1.0.180/181 obsolètes). Aucun binaire compilé, aucun matériel contacté.

Non traité (Core, P2) : type de source paramétrable, noms EISC des offsets poussés par `PushRoomFeedback`, générateur lisant `signauxGlobaux`, commentaires C# périmés (l. 1791, 1854, 2089), 2010 `R*_` v3 du SMW.

## (à compiler : CH5 dalle / web / mobile) — 18/09/2026 — traductions EN / ES / DE / RU complètes, appui long iPhone

**Traductions (retour Donatien sur l'iPhone : « Salle de jeux », « Alarme », « Caméras », « Ventilation », « Cinéma » restaient en français).** Trois trous, corrigés au niveau du système :
1. *Libellés fixes sans `data-i18n`* — `iphone.html` : Alarme, Caméras (×2), Global, Sécurité, Centralisation, Éclairage global / Stores globaux / Climatisation globale / Mode vacances, les 12 scénarios globaux (TOUT ALLUMER…HORS GEL, ACTIVER / DÉSACTIVER), partitions d'alarme (ACTIVER / PARTIEL), Ventilation, 9 boutons FERMER, invite du code d'administration ; `index.html` : Ventilation, fenêtre « Configuration du preset global » (titre, invite, SAUVEGARDER / ANNULER, « Inclure », noms de pièces via `villaTranslateName`), bouton MUSIQUE. 33 clés ajoutées aux 5 dictionnaires (fr / en / es / de / ru) des deux fichiers.
2. *Noms de scènes en dur sur l'iPhone* — `updateActiveRoomUI` applique désormais les noms de `villa_config` traduits (`villaTranslateName`), même règle que la dalle ; toasts d'enregistrement / rappel traduits (`window.villaI18n`).
3. *Table `villa_config.json → traductions`* — 11 entrées par langue ajoutées (Salle de jeux, Chambre maman / papa, Suite amis, Chambre amis, Terrasse & jardin, Garage & ateliers, MUSIQUE, Volets Ext., Rideaux, Jeux…). Restent volontairement sans traduction : noms de test des circuits (« Lustre Principal2 »…), caméras de démonstration (liste codée), options techniques du preset global (« Éclairage : Tout Allumer (401) »), marques (APPLE TV, SKY Q).
Mode CVC : le C# envoie le sériel 33 en français (ARRÊT / CHAUFFAGE / CLIMATISATION) — traduit à l'affichage par `window.villaHvacModeText` (dalle, iPhone, bandeau État de la villa) ; l'attribut `data-ch5-textcontent="33"` est retiré des deux `<span>` (le binder CH5 réécrivait le texte brut). Groupes de moteurs fixes de l'iPhone (Volets Ext., Rideaux) : `data-tname` → table villa_config.
Composants : `themes/global-controls.css` — `@media (max-width: 480px)` : scénarios globaux à 0.8rem / 3 px de marge (« FROSTSCHUTZ » tenait à 8 px près) ; `iphone.html` — en-têtes de fenêtres : titre `clamp(0.9rem, 4vw, 1.3rem)` qui passe à la ligne, bouton Fermer `flex: 0 0 auto` (« SCHLIESSEN » sortait de la fenêtre, « Schaltkreise : Spielzimmer » aussi, déjà avant ce lot).

**Appui long iPhone (retour : « remet les niveaux d'avant »).** Dans Crestron ONE, iOS déclenche le menu contextuel / la sélection pendant l'appui et annule le pointer avant 900 ms : rien n'était enregistré et le clic de relâchement rappelait l'ancienne scène. `iphone.html` : `-webkit-touch-callout: none`, `user-select: none`, `touch-action: manipulation` et `contextmenu` neutralisé sur `.scene-btn-mobile` ; après un enregistrement, le clic de relâchement est bloqué (`stopImmediatePropagation`) ; l'instantané lit la position réelle du curseur (`slider.value`) avant le retour C#.

Recette (Playwright, copie locale, moteur showcase) : 3 thèmes × 4 langues × {iPhone 16 Pro, dalle 1920×1200, iPad 11"} × {pièce, HVAC, Centralisation, Alarme, Caméras, Presets} = 36 combinaisons vertes (0 débordement, 0 chevauchement d'en-tête, 0 cible < 40 px, 0 scroll horizontal, 0 erreur console) ; inventaire automatique des textes identiques FR / EN / ES / DE avant → après : iPhone 51 → 24 (restants = mots identiques dans la langue, marques, caméras de démo), dalle 58 → 37 (idem + noms de test). Appui long simulé (touch 1,3 s) → sériel 421 seul, marqueur posé ; appui court → digital seul. Showcase régénéré par `sync-villa-crans.py` (fonctions du script). **Non poussé** (GO attendu).

## v1.0.191 — 18/09/2026 — contrat v4.1 : scènes d'éclairage mémorisées par le C#, 20 circuits, corrections GUI (validé sur TSW et XPanel)

| Artefact | État de ce lot |
|---|---|
| CH5 source | `src/index.html`, `src/iphone.html`, `src/js/room-controls.js` — compilé et déployé : TSW .1.16 et Web XPanel CP4 .1.200 (`deploy.ps1 -Target tsw` / `-Target web`) |
| CPZ slot 1 | `ControlSystem.cs` (assembly **1.0.191.0**) : scènes utilisateur, 20 circuits, sériel 421, digitaux 421-424, feedback global 401-409 — compilé (Debug, `bin\Debug\Villaftv.cpz`) et chargé par `deploy.ps1 -Target cp4` |
| LPZ slot 2 | `generate_slot2.js` v4.1 et `Project_Slot2.smw` régénéré (+240 signaux : bloc éclairage de 13 pièces, circuits globaux 11-20) — **F12 puis charger** (reste à faire) |
| Config | `villa_config.json` : `contrat.version` v4.1, `Eclairage.Circuit` 20, `Scenes.Enregistrement` s421, `Scenes.Memorisee` d421-424, règle « 20 circuits par pièce » |
| Showcase | `index.html`, `iphone.html`, `js/local-feedback.js` (mémoire de scènes simulée, 20 circuits), `js/room-controls.js` recopiés |

**Scènes d'éclairage (retour Debugger de Donatien : niveaux immobiles au rappel, aucun join à l'enregistrement).** Cause : l'enregistrement restait dans le `localStorage` de l'écran et le C# refusait d'appliquer la table dès que le slot 2 avait remonté un niveau. Désormais : 💾 / appui long → sériel **421** `{p, s, c[]}` (pièce, scène, niveaux des circuits affichés en %) → le C# écrit `/user/scenes_<pièce>.json`, la scène devient active, les niveaux sont poussés aux écrans (a71-90) et au slot 2 (`Rxx_Circuit_N_fb#`) ; rappel = le `<ch5-button>` 51-54 seul, le C# applique (scène mémorisée > table JSON) en **imposant** les niveaux ; marqueur 💾 = digitaux **421-424** posés par le C# pour la pièce affichée. Même scène sur dalle, iPad, XPanel, iPhone ; survit au progreset. Les positions de moteurs ne font plus partie des scènes (elles n'atteignaient pas le matériel). État tenu de la scène pour le slot 2 : `Rxx_Lighting_SceneN_fb` (bloc +21..+24) ; le global `Lighting_SceneN_fb` reste l'impulsion de commande avec a10.

**20 circuits par pièce** : joins 71-90 (GUI, C# `MaxCircuits`, table v4, générateur `MAX_CIRCUITS`), bloc pièce a+71..+90, JSON `circuits.nombre` ≤ 20. Aucun changement pour les projets à 4 ou 10 circuits.

**GUI** : rideaux — presets « Tout ouvrir / Tout fermer » en texte sur XPanel/TSW (fenêtre Stores) **et** iPhone (presets par famille) ; `-webkit-mask` + repli texte quand `mask` n'est pas pris en charge (carré blanc de la TSW). Lecteur média : curseur « Volume musique » (a254) retiré, dalle et iPhone. HVAC : `− / + / ON / OFF` en `flex` avec minimum (plus de débordement sur la TSW) ; disparition instantanée des − / + au changement de pièce (`visibility` n'est plus animée).

Recette (Playwright, copie locale, moteur showcase) : enregistrement d'une scène avec circuit 1 = 12345 → marqueur 💾 posé ; rappel scène 4 → 65535 ; rappel scène 3 → 12345 restauré ; pièce 2 sans marqueur ; retour pièce 1 → marqueur et niveaux ; 6 + 7 blocs script valides, 0 erreur console. `node generate_slot2.js` sur copie : 274 entrées / 516 sorties EISC, capacité respectée. C# non compilé ici (accolades et parenthèses équilibrées, API Newtonsoft déjà utilisée ailleurs).

**Correction en recette réelle (CP4 .1.200)** : le premier essai a échoué — la console affichait `SCENES: sériel 421 reçu (120 caractères)` puis une erreur JSON en position 119 : **le CP4 tronque à 119 caractères tout sériel émis par un écran** (octet `0xFD` en fin de chaîne). Charge utile réduite à `{p,s,c}` avec les niveaux en pourcentage et seulement les circuits affichés (≈ 60 caractères pour 4 circuits, < 119 pour 20) ; le C# accepte encore l'ancien format long (`{piece, scene, circuits}`) et convertit les pourcentages (× 655,35). Validé : `/user/scenes_1.json` (133 octets) écrit depuis la TSW puis depuis le XPanel après `-Target web`, marqueur 💾 posé, rappel appliqué. Règle : **jamais de JSON long d'un écran vers le C#** ; dans l'autre sens (C# → écran) pas de limite rencontrée.

**Recette Debugger restante (slot 2, après chargement du LPZ)** : 💾 → `Room_Selected#` inchangé, aucun join (le 421 n'est pas recopié : normal) ; rappel → `Lighting_SceneN_fb` impulsion + `Rxx_Lighting_SceneN_fb` tenu + `Rxx_Circuit_1..n_fb#` aux niveaux enregistrés ; scène enregistrée sur la dalle visible sur l'iPad ; progreset puis rappel.

## v1.0.186 — 18/09/2026 — fenêtre HVAC dalle/tablette et feedback des commandes globales

| Artefact | État de ce lot |
|---|---|
| CH5 source | `src/index.html`, `src/themes/room-controls.css`, `src/themes/wellness-controls.css`, `src/js/wellness-controls.js` — **compilé et déployé le 18/09** : TSW 192.168.1.16 (v1.0.185) puis Web XPanel CP4 192.168.1.200 (v1.0.186, 14 QR régénérés), contraste 3 thèmes OK ; `meta.version` aligné sur 1.0.186 |
| CPZ slot 1 | `ControlSystem.cs` modifié (feedback global 401-409), **à recompiler** (SIMPL# Pro) |
| LPZ slot 2 | inchangé |
| Showcase | `index.html` + les 3 fichiers ci-dessus recopiés ; `sync-villa-crans.py` peut être relancé, le résultat est identique |

Demandes de Donatien (17/09) :
- **Trait blanc sous le titre HVAC** : il ne servait qu'à marquer l'onglet actif. Il ne s'affiche plus que si la pièce a plusieurs onglets (Sauna & Hammam). `wellness-controls.js` pose `climate-tabs--single` quand un seul onglet est visible, `wellness-controls.css` neutralise alors le soulignement.
- **Mise en page de la fenêtre HVAC (dalle, tablette, XPanel)** : la consigne `− / valeur / +` est alignée à gauche, **ON** et **OFF** passent à sa droite sur la même ligne (`.hvac-setpoint-line`) ; le libellé **Ventilation** passe à gauche de AUTO / 1 / 2 / 3, également sur une seule ligne (`.hvac-fan`). L'ancienne grille `1fr 2fr` de la media query `max-height:900px` n'a plus lieu d'être, seules les cibles tactiles 48 px sont conservées. `iphone.html` n'est pas touché.
- **Aucun retour d'état sur Éclairage global, Climatisation globale et Stores globaux** : le GUI émettait bien (front montant puis retombée), mais les joins 401-405 et 407-409 n'avaient **aucune entrée** côté C# — seuls 410/411 (vacances) en avaient une. `ControlSystem.cs` mémorise désormais la dernière commande retenue par famille (`_globalLightSelection`, `_globalShadeSelection`, `_globalHvacSelection`), la pousse à tous les écrans dans `UpdateScreenStateForPanel` (`PushGlobalSelectionFeedback`) et la diffuse après chaque commande globale. Une action locale annule la sélection correspondante (`ClearGlobalSelection`) : scène d'éclairage ou circuit réglé → éclairage, store ou scène de stores → stores, consigne ± ou analogique 31 → CVC. Même logique que la simulation du showcase, qui elle fonctionnait déjà.

Vérifications (Playwright, copie locale du GUI servie en HTTP, feedback showcase) : dalle 1280×800, dalle 1920×1200 et iPad 11" × 3 thèmes (Sombre, Clair, Verre dépoli), pièce sans wellness (Salon) et pièce avec onglets (Sauna & Hammam) ; aucun scroll horizontal, aucune erreur console propre au GUI, cibles ≥ 44 px. Fenêtre Contrôle global : l'appui sur TOUT ALLUMER, TOUT OUVRIR et NUIT laisse bien le bouton vert et désélectionne les autres de la famille.

**Reste à faire** : recompiler le CPZ (SIMPL# Pro) puis `deploy.ps1 -Target cp4` — sans lui, les boutons du Contrôle global restent gris ; push Git. Les QR codes portent encore les noms de test du `villa_config.json` (Chambre maman / papa…) : point 4 du « Reste à faire » de CONTEXTE-CLAUDE.

## v1.0.183 (à compiler) — 17/09/2026 — bouton OFF, mute, logs PRESETS, état pressé des tuiles

| Artefact | État de ce lot |
|---|---|
| CH5 source | 1.0.183 (`meta.version` = `version.json`, incrémenté par les deux `deploy.ps1` du 17/09) |
| CPZ slot 1 | `ControlSystem.cs` modifié (traces PRESETS), **à recompiler** (SIMPL# Pro) |
| LPZ slot 2 | `Project_Slot2.smw` régénéré : + `AV_Off` / `AV_Off_fb` sur le join 200, **à recompiler** (F12) puis charger |
| Showcase | à régénérer par `sync-villa-crans.py` (aucune modification propre à la vitrine) |

Retours de la recette TSW du 17/09 (Donatien) :
- **OFF de la section Sources : aucun join dans le debugger.** Deux causes. (1) Le slot 2 n'avait aucun signal sur le join 200 (`AV.Extinction`) : seul le bloc pièce `R*_AV_Off`, désactivé en v4, le portait → `generate_slot2.js` ajoute `AV_Off` (entrée) / `AV_Off_fb` (sortie), SMW régénéré (+2 signaux, 12 lignes de diff, rien d'autre). (2) `sendPowerOff` (dalle) publiait `200 = true` sans jamais relâcher, en plus de l'impulsion native du `<ch5-button sendEventOnClick="200">` : 2 fronts montants par appui pour le C#, puis plus rien. Plus aucune émission JS du 200 ; l'impulsion native suffit. Les 2 anciennes définitions mortes de `sendPowerOff` (v1.0.149) sont supprimées.
- **Mute (55), même schéma** (barre de volume et télécommande Swisscom) : `toggleMute` n'émet plus et ne tient plus d'état local ; l'affichage vient du `receiveStateSelected="55"`. Avant : double bascule par appui (« 101 » au pont natif), après : « 10 ».
- **Logs `PRESETS: Configuration file ... not found`** (vacances, stores globaux, éclairage global) : passés sous `Trace()` (`meta.tracesConsole`). C'est le repli normal tant qu'aucun preset n'a été enregistré depuis la fenêtre Configuration du preset global (sériel 420 → `/user/preset_cfg_<nom>.json`).
- **Faders de la Configuration du preset global** : confirmé normal, ce sont des `<input type="range">` locaux ; seul « Enregistrer » émet (s420, JSON complet).
- **Tuile source qui reste « pressée » quelques secondes** sous la télécommande : `avReleaseTilesSoon()` retire `ch5-button--pressed` des tuiles à l'ouverture de la télécommande, du lecteur média et de la confirmation audio (immédiat, +120 ms, +450 ms), sans toucher au `selected` natif.
- **Console** : 5 copies corrompues du tracé SVG de l'engrenage (`<path d>` avec un nombre manquant) réalignées sur le tracé correct → 0 erreur console.
- **`deploy.ps1`** : la vérification finale `-Target web` échouait sur 192.168.1.200 (« La connexion sous-jacente a été fermée ») alors que le déploiement avait réussi : rappel de certificat compilé (`Add-Type`) au lieu d'un scriptblock, TLS 1.1/1.2, repli `curl.exe -k` ; un transport impossible devient un avertissement, seul un code HTTP ≠ 200 est fatal.

Recette (Playwright, pont natif `JSInterface` émulé = ce que reçoit le CP4) : 2 supports (dalle 1920×1200, iPad 11") × 3 thèmes, OFF et mute = exactement « 10 » par appui, télécommande ouverte, 0 tuile pressée, 0 erreur console ; contraste 4:1 : aucun défaut (3 thèmes, page + fenêtres + états, dalle et smartphone). Aucun test sur matériel dans ce lot ; `iphone.html` inchangé (OFF = 150 déjà en impulsion).

## 17/09/2026 — rooms-1, GUI 1.0.180 : décors, wellness et voisinage

Lot demandé par Donatien : local technique au sous-sol (17 pièces vitrine), vue villa rapprochée de 10 %, décoration et enceintes différenciées, cinq TV escamotables au pied des lits, écran cinéma agrandi et haut-parleurs dégagés. Ondes audio fines proportionnelles au volume ; mute, OFF et pause les arrêtent. Quatre programmes réellement 3D dans les TV via un rendu partagé 640 × 360 à 10–15 images/s, sans téléchargement vidéo ni son.

Sous-sol entièrement sans fenêtres. Wellness : deux cabines cloisonnées sauna/hammam, carrelage, douche, vasque ; coupe architecturale des plafonds pour voir l’intérieur, vapeur seulement lorsque le hammam fonctionne. Garage atelier avec deux silhouettes sportives distinctes, carrosseries courbes, roues et détails. Route devant le portail, ponts, sentiers, champs, deux ruisseaux, allées d’arbres, voisins et chalets éloignés des clôtures. Décor fixe regroupé par matériau, aucun nouveau modèle distant. Rendu enrichi mais stylisé, pas photographique.

GUI commune : onglets HVAC/Sauna/Hammam, ON/OFF indépendants, cibles sauna 60–100 °C et humidité hammam 90–100 %, plages dans le JSON ; HVAC normal 16–28 °C. Pas de ventilation sauna/hammam ni de température hammam. Joins d620–627, a/s62–65, C# WellnessState, entrées/sorties EISC nommées dans le générateur SIMPL. Détails et recette Debugger : `projects/villa-crans/ch5/docs/WELLNESS-2026-09-17.md`. Le correctif parallèle de routage inter-écrans dans ControlSystem est préservé et ses 22 scénarios simulés revérifiés ; les autres changements d’industrialisation restent hors publication de ce lot.

Vérifications locales : 36 combinaisons HVAC (555 assertions), 36 combinaisons wellness et retours natifs sans simulateur (632 assertions), 53 tests C#/JSON/SMW wellness et 76 HVAC, 40 contrôles pièces/TV, 27 navigation, 23 fondu, 24 villa, cinq nouveaux contrôles 3D wellness/garage. Matrice 3D supports/thèmes/modes réussie ; audit page/modales/états à 4:1 réussi. Cycle jour/nuit 30/10/30/10 s revérifié. Environ 52–54 images/s mesurées localement à 1280×800, DPR 1,5, rendu GPU. Les performances dépendent de l’appareil et de la connexion.

CH5Z assemblé et CPZ compilé (assembly 1.0.180.0), copie SMW préparée ; **LPZ non compilé, aucun matériel déployé ou vérifié**. Mesures wellness physiques inconnues tant qu’aucun driver ne les fournit. Le dossier `Claude outputs/room-revision/livraison` et les planches avant/après consignent le résultat ; ne pas assimiler la version du site à celle installée sur CP4/TSW.


## 17/09/2026 — candidat 1.0.180, outillage de stabilisation 0.1.0

| Artefact | État dans ce lot |
|---|---|
| CH5Z | Candidat bêta Alexandre 1.0.180, profil neutre, compilé hors dépôt |
| CPZ slot 1 | Assembly 1.0.180.0 compilé et empaqueté avec le correctif de contexte EISC |
| LPZ slot 2 | Non compilé ; copie SMW générée, contrôle HVAC 76/76 |
| Showcase | Registre partagé et garde catalogue vérifiés localement ; aucune publication par ce lot |

Le miroir vers SIMPL remet désormais la pièce a10 de l'écran émetteur avant les commandes sources, scènes, stores, télécommandes et analogiques. Reproduction sur le vrai corps C# avec objets de signaux simulés : 8 échecs/10 avant ; 22 scénarios réussis après. La recette de simultanéité et de timing EISC reste matérielle. Configuration embarquée réalignée depuis la source canonique, sans modification des noms/activations physiques de celle-ci. Le profil bêta exporté possède des libellés neutres et aucun code alarme de secours.

Nouveaux outils sous `tools/quality/` à la racine du monorepo ; méthode et limites dans `docs/industrialisation/`. Aucun appareil contacté, aucun ancien LPZ recopié comme un binaire validé. Préserver le travail 3D/Wellness concurrent.


## 16/09/2026 — estate-2, GUI 1.0.179 : villa, animations et HVAC

Demande groupée de Donatien : sous-sol avec cinéma, sauna/hammam, garage et simulateur de golf (16 pièces showcase), grand salon/cuisine/salle à manger au RDC, rampe d'accès garage dégagée, fenêtres vers l'extérieur avec cours anglaises au sous-sol, bannes de chaque pièce RDC. Cinq circuits lumineux indépendants ; fondu linéaire 3 s conservé. Rideaux : flèches horizontales dans les GUI sources.

Audio : ondes sur sources vidéo et musique, diamètres selon le volume A/V ou le volume média distinct, arrêt sur mute/OFF ; cinéma 11 canaux dont arrière/surround/plafond. TV : programmes Canvas animés cinéma, football, tennis, course automobile, 15 images/s sans téléchargement de vidéos ni son. Jardin : luminaires, projections douces, clôtures/terrasse/piscine et lumière sous l'eau ; portiques caméra quatre coins, façades et portail. Cycle 20 s (deux demi-cycles de 10 s, transitions de 2 s). Eau déformée par shader et brise discrète sur une partie du feuillage, haies fixes ; réduction avec le niveau de qualité. Démo automatique : Smartphone 60 s, autres supports 10 s.

**Extension matérielle explicitement demandée** : ON/OFF + Auto/1/2/3 sur toutes les pages HVAC. Contrat JSON canonique, six joins digitaux 610–615, analogique 61, état par pièce C#, miroir EISC, signaux nommés du générateur SIMPL. Voir `projects/villa-crans/ch5/docs/HVAC-2026-09-16.md`. Les noms/activations réels de la configuration physique restent conservés ; la nouvelle architecture 3D appartient à la démonstration.

Tests locaux : 24 contrôles villa, 28 navigation, 23 fondu, 40 matrice 3D, 36 combinaisons GUI HVAC et 15 contrôles réception native sans simulateur ; 76 contrôles C#/JSON/SMW. Contraste pages/fenêtres/états dans les trois thèmes : aucun texte sous 4:1. Test dédié des délais 60/10 s, volume musique, pause vidéo et shader de l'eau. Mesure locale GPU 1280×800 DPR 1,5 : environ 55–60 images/s (pièce, villa fermée et ouverte). Limite : rendu stylisé enrichi, pas promesse de photoréalisme.

Preuves dans `Claude outputs/codex-plan3d-villa2/` ; dossier `livraison-hvac` : JSON, CH5Z assemblé, SMW préparé. Le projet SIMPL original et ses modifications locales sont préservés : copie = 715 ajouts, aucune suppression. **LPZ non compilé ; aucun déploiement matériel.** C# compilé, mais Windows bloque l'empaquetage final du CPZ (`MSB3441 / 0x800711C7`, contrôle d'applications). Premier CPZ d'essai écarté de la livraison. La mise en service nécessite les bons CPZ/LPZ et la recette Debugger.

## v1.0.178 — 16.09.2026 — retours du contrôle global uniformisés

| Artefact | État de ce lot |
|---|---|
| CH5 source | 1.0.178 ; HTML index/iPhone + CSS commun, config canonique versionnée |
| CH5Z installé | Non compilé/déployé par ce lot ; archive locale préexistante préservée |
| CPZ slot 1 | Aucun changement ni déploiement ; chargement du 16/09 rapporté par Donatien, non revérifié |
| LPZ slot 2 | Aucun changement ni déploiement ; chargement du 16/09 rapporté par Donatien, non revérifié |
| Showcase | Copie régénérée depuis la source 1.0.178, publication main → Vercel |

- iPhone : `receiveStateSelected` statiques ajoutés à 401–405 et 407–409 ; 410/411 conservés. Les retours viennent du moteur CH5, pas d'une sélection forcée dans le DOM.
- Dalle/tablette : suppression de la règle `[selected]` qui appliquait l'état actif à `selected="false"`. Tous les supports partagent `themes/global-controls.css` : gris inactif, vert actif, libellés identiques, contraste adapté aux trois thèmes, cibles 44 px minimum. Retrait des couleurs rouges individuelles et des callbacks de sélection inertes.
- Vitrine : retours exclusifs par section, remise à false avant le nouveau true ; stores globaux conservés après l'impulsion (commande confirmée, pas fin de course mesurée). Modification individuelle : désélection d'un retour global devenu inexact. Mode vacances ferme aussi les stores. La source déployable n'embarque pas ce moteur de simulation.
- Synchronisation : CSS copié et configuration canonique racine préférée à la copie de build `src/`. Noms de test toujours nettoyés. Fiche FR/EN/DE et capture mises à jour.
- Recette navigateur : 36 combinaisons, 1 292 assertions ; injections natives sur les deux HTML de déploiement avec simulateur absent. Pages, modales et états d'alarme : outil de contraste passé à 4:1. Aucun test sur les appareils physiques effectué.
- En parallèle, le fond Vercel seul reçoit une villa de luxe assemblée et la séquence enveloppe/étages/zoom. Détails dans `apps/showcase/docs/plan3d.md` et README.

## v1.0.177 (à compiler) — 15-16.09.2026 — Contrat v4, XPanel du bureau, lot smartphone Sources / Moteurs / Swisscom

### État des 4 artefacts

| Artefact | Version | Compilation |
|---|---|---|
| CH5 `.ch5z` (TSW + XPanel) | 1.0.176 (XPanel sur le CP4 du bureau 192.168.3.109) | **à relancer** : `deploy.ps1 -Target web -CP4Host 192.168.3.109` |
| CPZ slot 1 | 14.09 (v3) | **à recompiler** : routage v4 des joins globaux vers la pièce affichée (voir ci-dessous) |
| LPZ slot 2 | 15.09 (v3) | **à régénérer** : `generate_slot2.js` v4 + F12 (consigne ± dans le bon sens, join 156), buffers sur `Room_Select#` |
| Showcase Vercel | lot du 16.09 | `index.html` + `iphone.html` + config régénérés, poussés |

### Contrat de joins v4 (décision du 15.09)

- **Joins de pilotage identiques dans toutes les pièces** (sources 150-156, télécommandes 211-220 /
  500-527 / 530-557 / 560-600, scènes stores 201-204, stores groupés 61-69) ; **SIMPL route sur
  `Room_Select#` avec des buffers** pour ne pas surcharger le debugger Toolbox. Le v3 (bloc par
  pièce) est désactivé (`contrat.blocsPiecesGui.actif=false`) : sa réécriture d'attribut n'émettait
  pas — aucun join Apple TV / Sky Q ne remontait dans le debugger. `generate_slot2.js` : 107 signaux
  `Remote_*`, 1980 câblages de blocs pièces retirés (les définitions `R01_..R15_` restent à
  nettoyer dans SIMPL Windows). 75 boutons de télécommande de la dalle portent leur join en dur.

### Slot 1 (C#) et slot 2 — recette TSW du 16.09

- **Aucun feedback sur la dalle (fond violet, badge audio, confirmation musique, consigne)** :
  depuis le v3 le C# n'appliquait que les blocs >= 1000 ; en v4 la GUI émet sur les joins globaux,
  que le C# recopiait vers l'EISC sans les traiter. Ajout du routage v4 : join global → pièce
  affichée par le panel (`V4DigitalOffsets` / `V4AnalogOffsets`, copie de `blocsPiecesGui.mapping`)
  → même logique métier (`ApplyRoom*Command`) ; `PushRoomFeedback` renvoie aussi l'instantané sur
  les joins globaux aux panels qui affichent la pièce. Les signaux venant du slot 2 ne sont pas
  routés (ce sont des feedbacks).
- **Consigne ± invisible dans le debugger** : `HVAC_Setpoint_Up/Down` (49/50) étaient câblés en
  entrée du symbole EISC (sens slot 2 → GUI) ; passés en sortie (reçus), anciennes entrées purgées.
  Join 156 (`Source_AudioReturn`) ajouté, il manquait dans toutes les générations.
- ACTIVER / DÉSACTIVER verts ensemble : `selectGlobalControl` forçait `selected` dans le DOM ;
  neutralisée, le C# tient déjà l'interlock 410/411.
- `README_SLOT2.md` : tableau de la logique à câbler côté slot 2 (interlocks, toggle musique).

### Plan 3D de la villa — fond de page du SITE VITRINE (16.09.2026), le GUI des châssis ne change pas

- **Rien dans le GUI** (ni dans la source CH5, ni dans la copie vitrine `public/showcases/…`, qui reste
  la sortie brute de `sync-villa-crans.py`). La 3D remplace la **vidéo de fond de page** du site pour
  Villa Crans-Montana : `src/components/Plan3DBackground.jsx` (à la place de `BackgroundVideo`),
  `public/plan3d/plan3d.js` + `public/plan3d/vendor/three.module.min.js` (676 Ko, chargés à
  l'exécution, hors bundle), `public/plan3d/villa-crans.json` (style, disposition : niveau, x, z, w, d,
  type ∈ salon / cuisine / repas / chambre / suite / bureau / cinema / terrasse / piscine / sauna / poolhouse).
- Le module lit le GUI à travers son iframe (même origine) : feedbacks CrComLib, clics sur les
  `ch5-button[data-join]`, `animateGroupBlinds` ; noms de pièces lus dans `villaConfigEmbedded`.
- Vue d'ensemble en écorché (3 niveaux + extérieurs, pins, montagnes), puis à chaque sélection
  de pièce : passage par la villa entière et zoom sur la pièce, seule à l'écran avec les
  extérieurs. Chaque pièce a ses lampes (2 circuits), sa TV, ses enceintes, sa climatisation et
  son thermostat.
- **Les feedbacks pilotent la 3D** : circuits a71-80 → intensité des lampes ; d150-154 → TV
  allumée avec l'écran de la source (Apple TV = grille d'apps, Sky Q, Swisscom, IPTV) ; télécommande
  211-216 → curseur de la grille, OK ouvre l'app, Menu revient ; d155 → enceintes animées ; a31 et
  s33 → thermostat (consigne, chauffage / clim). Aucune présomption : tout vient de CrComLib.
- **Cadrage sur la page** : villa entière plein fond derrière le châssis ; la pièce active est cadrée
  dans la zone libre à droite du châssis (colonne des supports), sinon au-dessus, sinon vue villa
  seule — recalculé chaque seconde depuis le rectangle de l'iframe (`api.setWindow`).
- **Motorisations** : chaque pièce a sa fenêtre avec volet roulant, store intérieur et rideaux ;
  l'onglet Stores (joins 61-69), les presets « Tout ouvrir / Demi-ouverture / Tout fermer » de la
  fenêtre Stores (`animateGroupBlinds`) et les moteurs 81-98 (famille lue dans
  `pilotages.moteurs.liste`) les font bouger en 3D (course complète ≈ 4 s, stop respecté).
- Télécommandes Sky Q / IPTV / Swisscom : haut / bas / P± déplacent la ligne en surbrillance de
  l'écran TV. Deux palettes (`meta.plan3d.style`) : « chaleureux » (retenu) / « maquette ».
- Piscine : eau animée (reflet, ondulation) et projecteurs sous-marins sur le circuit 1 de la pièce.
- **Vidéo par défaut, 3D au cas par cas** (décision du 16.09 après essai sur portable 14") : la vidéo
  de fond est rétablie partout ; la 3D ne remplace la vidéo que dans les cas listés dans
  `PLAN3D_RULES` (`Plan3DBackground.jsx`, règles `{device, minWidth, maxWidth}`) — pour l'instant
  **châssis Smartphone sélectionné**, quelle que soit la largeur. Quand la 3D est active, le châssis
  est calé au bord gauche de l'espace de travail (`.plan3d-on`, `--chassis-scale` exposée par
  `DeviceFrame`) et la pièce est cadrée dans la zone libre entre le châssis et la colonne des boutons
  (QR code, Fiche PDF, supports), jamais derrière eux. D'autres cas seront ajoutés au fil des essais.
- **Détails 3D (`public/plan3d/plan3d.js`)** : montagnes = un seul relief (grille de hauteurs colorée par
  sommet : alpage, roche, neige au-dessus d'une limite ondulée) — plus aucune surface superposée, donc plus
  de scintillement ; vue villa abaissée pour garder les sommets à l'horizon. Vraie fenêtre percée dans le
  mur (cadre alu, meneau, vitre, tablette) avec ses **motorisations visibles** : caisson de volet ouvert
  (axe, tablier enroulé, moteur tubulaire, câble), store intérieur (tube, supports, moteur, toile, barre de
  lest), rideaux plissés sur tringle à moteur de rail ; chaque moteur a son voyant vert qui clignote pendant
  la course. Terrasse : pergola à cadre ouvert avec store de toit motorisé (toile rayée), famille « store ».
  **Luminosité** : rendu en deux scènes (extérieurs sous jour constant / pièces) ; la lumière du jour de la
  pièce active = (1 − volet) × (1 − 0,85 store) × (1 − 0,7 rideaux), spot par la fenêtre + rai de lumière ;
  scène OFF + tout fermé → noir (luminance ≈ 11 % de la zone, dont l'extérieur), scène TOTAL + ouvert →
  pleine lumière (59 %), lampes seules → rebond chaud. **TV** : dalle fine à liseré alu, support mural,
  barre de son, voyant de veille rouge, écran 1024 × 576 : Apple TV (bandeau à la une, apps à glyphes,
  lecteur plein écran), Sky Q (rail de menu, direct, tuiles), blue TV (menus, grille de chaînes),
  IPTV (liste avec programme et progression, aperçu) ; éteinte = verre noir brillant.
- Coût (après détails) : 83 appels de rendu / 3 000 triangles en vue pièce, 4 lumières réelles
  (2 lampes, spot de fenêtre, TV) sur la pièce active, pixel ratio plafonné à 1,5, boucle en pause onglet caché.
- `tools/check_contrast_dom.mjs` : termine les transitions CSS avant de mesurer (rendu logiciel),
  referme la confirmation audio après son audit, `--w/--h` pour la résolution du châssis.
- Recette TSW : surbrillance tactile Chromium désactivée sur les deux GUI (cadre tuile + engrenage).

### Chaîne de déploiement

- `deploy.ps1` réparé et fiabilisé : ASCII pur + BOM, serveur `tools/serve_src.mjs`, `ch5-cli -p`,
  `tools/ch5-compat.js` (Node 24), succès vérifié par HTTPS, `-CP4Host`, `-SkipContrast`, `-SkipBuild`.
  Détail dans `CONTEXTE-CLAUDE.md` § Pièges.

### Tous châssis

- Menu : « Garage & ateliers » (pièce 15 `actif:false`) et « Vidéo » masqués, réversibles dans
  `villa_config.json` ; QR codes régénérés sans la pièce 15.
- Tuiles de source : couleurs du projet en activé / désactivé (fonds blancs sur XPanel corrigés)
  via `ch5-button[customClass~="…"] .cb-btn` — cette version de CH5 ne recopie pas `customClass`
  sur l'hôte.
- Thème clair : icônes haut-parleur et Power en noir. Bouton PRESET retiré des stores globaux.
  Configuration du preset global sans TOTAL / REPAS / CINÉMA / ÉTEINDRE. Mode Vacances : sélecteur
  de preset et ligne Climatisation retirés, titre « Sélection des pièces : simulation de présence
  aléatoire ».
- **Sources : logique audio/vidéo unifiée (`avSelect`)** — confirmation « musique ou audio de la
  vidéo », télécommande ouverte ensuite, **badge égaliseur animé** sur la source dont l'audio joue
  (iPhone aligné sur la dalle le 16.09, liseré sombre en thème clair pour la musique).

### Smartphone

- « Sources » (titre) / « Source » (onglet), en-têtes à gauche, pas de titre Éclairage dans une
  pièce sans éclairage, voile noir flouté qui bloque les clics sous les fenêtres.
- Moteurs : pagination (Stores atteignable), presets par famille Volet / Rideaux / Stores
  (Tout ouvrir / Demi-ouverture / Tout fermer).
- Sources : grille 2 colonnes, MUSIQUE pleine largeur, doublon « Musique / lecteur média » retiré,
  engrenage MUSIQUE → lecteur média (page vide corrigée), bouton Musique plus rogné.
- Swisscom : volume ± / ✦ / ⇥ / sourdine retirés, boutons agrandis (grille 5 colonnes).

## v1.0.175 — 15.09.2026 — Smartphone : télécommandes alignées sur la dalle, stores et icônes de moteurs

### État des 4 artefacts

| Artefact | Version | Compilation |
|---|---|---|
| CH5 `.ch5z` (TSW + XPanel) | 1.0.174 | `iphone.html` modifié — `.\deploy.ps1` à relancer |
| CPZ slot 1 | 14.09 | inchangé |
| LPZ slot 2 | 15.09 | inchangé |
| Showcase Vercel | lot du 15.09 | `iphone.html` régénéré |

### Moteurs

- **Icônes reprises à l'identique de la dalle**, trois familles au lieu d'une seule : volets et
  moteurs génériques en lamelles cyan, **rideaux à double pan bleu ciel** (`curtain-left/right`),
  stores en lamelles vert d'eau. La famille est déduite du libellé, donc la fenêtre Moteurs,
  régénérée à chaque pièce, classe aussi « Rideau ext. 1 » et « Store 2 » correctement.
- **Ligne « Stores » ajoutée** (joins 67-69) : elle existait sur la dalle, pas sur le smartphone.
  Les trois lignes tiennent sans défilement, y compris sur iPhone SE (lignes resserrées dans le repli).

### Télécommandes

- **Apple TV alignée sur la dalle, qui fait référence** : mêmes six boutons — croix directionnelle
  en croix, OK au centre, Menu — et mêmes proportions. Accueil, lecture/pause, volume ± et sourdine
  ont été retirés du smartphone : ils n'existent pas sur le châssis de référence. La disposition
  passe en colonne (croix puis Menu), le châssis étant en portrait.
- **Sky Q et IPTV agrandis** : la disposition n'occupait que 484 px sur les 675 disponibles, elle en
  prend 633. Croix directionnelle 190 → 268 px, hauteurs et espacements augmentés, pastilles de
  couleur 26 → 44 px. Plus aucune cible sous 40 px sur iPhone 16 Pro (21 avant).
- **Défaut corrigé : la zone cliquable ne suivait pas le bouton dessiné.** `.cb-btn` gardait sa
  taille par défaut (66 × 33 px) : on pouvait viser une flèche de la croix Apple TV et ne rien
  déclencher. Elle épouse désormais le bouton — plus petite cible réelle : 70 px sur Apple TV,
  41 px sur Sky Q. **Le même défaut existe sur la dalle** (`index.html`), non corrigé ici.

### Swisscom TV

Reprise au même niveau que les autres. Les touches étaient à 33 px et 40 des 41 cibles passaient
sous 40 px. Deux corrections :

- **Toutes les touches rondes le sont vraiment.** L'étirement en hauteur avait transformé PG±, CH±
  et les pastilles de couleur en ovales — largeur et hauteur sont de nouveau égales partout.
- **Volume / P et pavé numérique côte à côte** au lieu d'empilés. Empilés, la disposition faisait
  1082 px de haut : l'échelle tombait à 0,61 et annulait tout agrandissement. Côte à côte, elle fait
  905 × 478 — largeur et hauteur arrivent à saturation en même temps, c'est l'optimum de cette
  structure. Échelle 0,695, **touches à 47 px** (33 avant), plus petite cible 38 px (18 avant),
  8 cibles sous 40 px au lieu de 40. « radio » n'est plus tronqué en « ra… ».

### Contrôles

Playwright : 2 châssis × 3 thèmes × 13 écrans, aucun débordement hors des deux listes défilantes
assumées (Caméras, Configuration preset), aucune erreur console. Contraste complet
(`check_contrast_dom.mjs`, 3 thèmes × page + 10 fenêtres + états d'alarme, dalle et smartphone) :
aucun texte sous 4:1.

## v1.0.174 — 14.09.2026 — GUI smartphone : entête allégée, plus aucun défilement, scènes et moteurs au niveau de la dalle

Deuxième lot de retours sur le châssis iPhone. Deux consignes générales en sortent, consignées
dans CONTEXTE-CLAUDE.md : **aucun défilement dans les GUI** et **occuper la place au mieux,
jamais de bouton trop petit**.

### État des 4 artefacts

| Artefact | Version | Compilation |
|---|---|---|
| CH5 `.ch5z` (TSW + XPanel) | **1.0.174** | `.\deploy.ps1` — chargée sur la TSW 192.168.1.16 le 14.09 (PROJECTLOAD OK) |
| CPZ slot 1 | recompilé le 14.09 | SIMPL# Pro puis `-Target cp4` — chargé sur le CP4, slot 01 rechargé |
| LPZ slot 2 | régénéré le 15.09 | `generate_slot2.js` + F12 — **chargé sur le slot 2 du CP4** |
| Showcase Vercel | lot du 14.09 | poussé sur `main`, déploiement automatique |

**Les quatre artefacts sont alignés pour la première fois** (15.09.2026, 05:44) : archive CH5 sur la
TSW et le XPanel, CPZ sur le slot 1, LPZ sur le slot 2, vitrine en ligne.

Réserve sur le slot 2 : `generate_slot2.js` **ajoute** des signaux, il n'en retire pas. Les 15
`R<nn>_Lighting_Master` (+ `_CMD`) de l'analogique +21, sorti du contrat le 13.09, sont toujours
câblés sur le symbole EISC. Plus personne ne les écrit : ils resteront à 0 dans le debugger.
Sans effet sur le fonctionnement, mais trompeur pendant la recette.

### Entête et fenêtre Réglages

- **« Pièce active v1.0.x : » retiré.** Le libellé, la version et l'état de connexion occupaient une
  ligne entière et poussaient l'engrenage hors du cadre. La ligne se réduit à la liste des pièces
  (52 px) et à l'engrenage (52 px) : ~46 px rendus au contenu.
- **Version et état de connexion dans la fenêtre Réglages**, entre le titre et le bouton Fermer.
  L'appui long de 3 s qui ouvre la console d'administration suit la version (il était sur
  « Pièce active »). `active_piece` n'existe que sur smartphone : la dalle n'affichait pas ce texte.

### Aucun défilement

`html`, `body` et les panneaux d'onglet passent en `overflow: hidden`, toutes les barres de
défilement sont masquées (`::-webkit-scrollbar`, `scrollbar-width`). Les trois pages et les fenêtres
Sécurité, Centralisation, Réglages, Moteurs et télécommandes tiennent désormais à l'écran sur
iPhone 16 Pro **et** iPhone SE. La page Source a été recompactée pour le petit écran
(sources 42 px, engrenages 40 px, marges resserrées).
**Exception assumée** : Caméras (10 flux), Circuits et Configuration preset gardent un défilement —
ces listes sont par nature illimitées ; la barre est masquée, rien ne bouge en dehors d'elles.

### Télécommandes — toutes les sources

- **Mise à l'échelle automatique** (`fitRemoteLayout`, repris de la dalle mais autorisé à agrandir,
  plafond 2,4) : la disposition est dessinée à taille fixe puis étirée pour remplir la fenêtre, qui
  passe elle-même à 92 % de la hauteur d'écran. Apple TV gagne **×1,68**. Sky Q et Swisscom étaient
  déjà à la largeur maximale : elles gagnent la hauteur et perdent leur défilement.
- **Défaut corrigé au passage : les trois télécommandes sortaient entièrement en bleu.** Le fond
  générique des boutons CH5 (`#0369a1 !important`) écrasait leur `customStyle`, alors que la dalle
  les rend en gris anthracite. Les 80 `customStyle` de la fenêtre sont désormais marqués
  `!important` : le style en ligne repasse devant, Siri Remote redevient grise et les touches de
  couleur retrouvent leurs couleurs.

### Scènes mémorisées sur iPhone

Appui long (0,9 s) sur OFF / CINÉMA / REPAS / TOTAL : les niveaux des circuits de la pièce sont
enregistrés sous **la même clé que la dalle** (`villa_scene_<pièce>_<n>`, même structure JSON).
Pastille dorée sur le bouton mémorisé, message fugitif, rappel des niveaux à l'appui court.
Les niveaux sont suivis par abonnement aux analogiques, avec repli sur la valeur des curseurs.

### Icônes de moteurs animées

Les lamelles descendent à la fermeture et remontent à l'ouverture en 1,5 s, comme sur la dalle ;
l'icône pulse tant que le moteur bouge et ▪ la fige à sa position réelle en cours de course.
Posées devant chaque libellé, page et fenêtre Moteurs, y compris sur les lignes régénérées à chaque
changement de pièce (MutationObserver).

### Contrôles

Playwright headless : 2 châssis (iPhone 16 Pro, iPhone SE) × 3 thèmes × 13 écrans. Aucun
débordement, aucune erreur console, aucun élément hors cadre hors des deux listes ci-dessus.
Limite connue : les touches des télécommandes Sky Q (21) et Swisscom (73) restent sous 40 px — ce
sont des télécommandes physiques à 40+ touches, il faudrait les paginer pour aller plus loin.
Garde-fou posé sur `closeAllModals`, qui plantait en vitrine (`closeAdminModal` y est retiré).

## v1.0.173 — 14.09.2026 — GUI smartphone agrandie, barre d'outils de la vitrine allégée

Lot de retours de Donatien sur le châssis iPhone de la vitrine. Tout passe par des blocs de style
partagés : un seul `<style id="mobile-xl">` dans `iphone.html` pour l'agrandissement, aucune valeur
posée écran par écran.

### État des 4 artefacts

| Artefact | Version | Compilation |
|---|---|---|
| CH5 `.ch5z` (TSW + XPanel) | **1.0.173** | `.\deploy.ps1` — chargé sur la TSW 192.168.1.16 (PROJECTLOAD OK), XPanel déposé sur le CP4 |
| CPZ slot 1 | — | `Villaftv.cpz` transféré et `progload -p:01` lancé — **l'archive vient de `dist/`, à recompiler dans SIMPL# Pro si `ControlSystem.cs` du 13.09 n'y est pas encore** |
| LPZ slot 2 | — | inchangé |
| Showcase Vercel | poussé sur `main` | déploiement Vercel automatique au push |

Les 1.0.171 et 1.0.172 ont été consommées par deux `deploy.ps1` interrompus (la TSW ne répondait
pas : `Network error: Connection timed out`). Numéros sautés, pas de version livrée.

### Vitrine (apps/showcase)

- **Bouton « Présentation » retiré** de la barre d'outils (`DemoToolbar`) et de son câblage
  (`Showcase.jsx` : `presenting`, `onTogglePresentation`, `handleTogglePresentation`). La démo
  automatique se met déjà en pause au premier geste et la bulle « Reprise de la démo dans N
  secondes » la relance : le bouton faisait doublon. Clés `tool_present` / `tool_present_stop`
  supprimées en FR/EN/DE.
- **Démo automatique active sur tous les supports.** Elle ne démarrait que sur PC
  (`isDesktopPointer`) ou en mode salon : sans le bouton « Présentation », elle n'était plus
  démarrable à la main sur mobile et tablette. Le premier geste la met en pause, le visiteur
  tactile garde donc la main immédiatement.
- **Bulle de reprise en bas à gauche dans tous les modes** (`marketing.css`). À droite elle
  recouvrait la colonne Dalle / Tablette / Smartphone. La prop `side` de `DemoCountdown` et la
  classe `demo-countdown--left` disparaissent : une seule position, plus de variante.
- **Bouton « Plein écran » caché** (`showEmbedTool`, faux par défaut) : doublon avec le bouton
  Scène du châssis. Le plein écran reste accessible par l'adresse, sur le modèle de /1 et /0 du
  Mode Dev : **`/3` affiche la GUI seule sur toute la fenêtre, `/4` revient au Mode normal**
  (`hooks/useGuiFullscreen.js`, mémorisé par navigateur, suffixe retiré de l'URL, Échap en
  échappatoire). Le contenu de l'écran est extrait dans `guiContent` et servi à l'identique dans
  le châssis et en plein écran.
- Vocabulaire figé : `scale_caption_too_small` disait « mode Présentation », qui n'existe pas —
  remplacé par « Mode Scène » (FR/EN/DE).

### GUI smartphone (`src/iphone.html`)

- **Caméras sans filtre vert.** Le flux portait `sepia(100%) hue-rotate(90deg) saturate(180%)` —
  une vision nocturne simulée. Les images sont les mêmes que sur la dalle et l'iPad : elles ont
  désormais aussi le même traitement (`contrast(108%) brightness(98%)`), les mêmes scanlines
  discrètes et le même cartouche de nom (blanc sur fond sombre, il était vert).
- **Agrandissement général** (`<style id="mobile-xl">`) : entête, scènes d'éclairage (48 → 60 px),
  moteurs, boutons Alarme / Caméras / Global (36 → 46 px), ± du HVAC (60 → 72 px), sources
  (→ 66 px) et leurs engrenages (26 → 44 px), barre de navigation, et toutes les modales —
  Sécurité, Caméras, Centralisation, Configuration preset, Réglages, Circuits, Moteurs
  (panneaux 380 → 440 px de large, 85 % → 92 % de haut). Aucune cible tactile sous 40 px.
- **Pavé de code Sécurité** : afficheur 180×42 → 240×62 px, touches 60×48 → 96×66 px, libellés à
  1,7 rem. Les tailles en ligne portaient `!important` et bloquaient toute reprise en CSS : elles
  ont été retirées du HTML et le pavé est réglé par le bloc partagé.
- **Boutons CH5 des modales** : la division interne de CH5 ne suivait pas la taille de l'hôte — le
  fond débordait du bouton et le libellé, à l'étroit, se faisait tronquer (« DÉSACTIVER » rendu
  « DESACT… »). Corrigé pour Centralisation, Sécurité, Circuits et Moteurs.
- **Engrenage de la ligne « Pièce active »** : il sortait du cadre de 19 px (bloc de gauche en
  `white-space: nowrap` sans `min-width`). La ligne passe sur deux niveaux : libellé au-dessus,
  liste des pièces et engrenage en dessous, sur toute la largeur.
- **Grilles de scénarios** des modales Éclairages / Stores : `min-width: 0` sur les éléments de
  grille, qui ne rétrécissent pas sous leur contenu par défaut et sortaient du panneau.
- **« Sélection de la source audio et vidéo » → « Source audio et vidéo »** (FR/EN/ES/DE/RU) :
  titre d'onglet et libellé de la barre basse, qui tenait sur trois lignes.

### Contrôles

Playwright headless (`chromium` du conteneur) sur la copie vitrine, 3 thèmes × 2 châssis
(iPhone 16 Pro 393×852, iPhone SE 375×667) × 3 pages × 5 modales : aucun débordement horizontal,
aucun élément hors cadre, aucune cible tactile < 40 px, aucune erreur console. Planche-contact des
8 écrans jointe à la session. Aucune variable de thème ni couleur touchée : la batterie de
contraste n'a pas été relancée.

## v1.0.170 — 13.09.2026 — Recette sur dalle : le debugger ne montre plus que des signaux

Premier lot de retours relevés par Donatien sur la TSW-1070 avec le SIMPL Debugger ouvert sur le
slot 2. Toutes les corrections sont au niveau du système : un interrupteur, un helper, une table de
configuration — aucune retouche écran par écran.

### État des 4 artefacts

| Artefact | Version | Compilation |
|---|---|---|
| CH5 `.ch5z` (TSW + XPanel) | 1.0.170 | à produire par `.\deploy.ps1` |
| CPZ slot 1 | — | à recompiler dans SIMPL# Pro (`ControlSystem.cs` modifié) |
| LPZ slot 2 | — | `node contract/generate_slot2.js` puis F12 dans SIMPL Windows |
| Showcase Vercel | 1.0.168-showcase | non régénéré, non poussé |

La 1.0.169 a été consommée par un `deploy.ps1` interrompu (`node_modules` absent après le passage
en monorepo, `npx ch5-cli` tombait en 404 : `npm install` dans `projects/villa-crans/ch5` le règle).

### Émission sur changement de valeur uniquement

`PushRoomFeedback` réécrivait les 16 analogiques, les 4 sériels et tous les digitaux du bloc d'une
pièce **à chaque action**, même inchangés. Trois conséquences, de la plus grave à la plus bénigne :

1. **Redéclenchement de scène.** Sur un bloc pièce, le même join est bidirectionnel : le nom nu est
   la sortie du symbole, donc ce que le slot 2 reçoit. Réaffirmer `R07_Lighting_Scene3` à 1 pendant
   un appui sur la consigne CVC produit un front que le slot 2 ne distingue pas d'un appui sur la
   scène. Un thermostat manipulé rallumait la scène d'éclairage de la pièce.
2. Trafic CIP inutile vers la dalle, l'iPad, l'iPhone, le XPanel et l'EISC.
3. Debugger illisible : 20 lignes par appui de bouton.

Correction : trois helpers `SetBool` / `SetUShort` / `SetString` qui comparent avant d'écrire,
appliqués à `PushRoomFeedback`, `UpdateScreenStateForPanel` (30 écritures) et `BroadcastTswVolume`.
Les impulsions (`PulseRoomDigital`) et la relance volontaire du code d'alarme (ser 43 remis à vide
puis réécrit) gardent leur écriture inconditionnelle : là, le front **est** le message.

Garde-fou : `_forcePush` rétablit l'écriture inconditionnelle pendant `OnTouchPanelOnlineStatusChange`,
sans quoi un panel qui se reconnecte ne recevrait que les signaux ayant changé depuis sa déconnexion.

### Traces console sous `meta.tracesConsole`

58 `CrestronConsole.PrintLine` dans le C# et la recopie des `console.log` de la GUI sur le sériel 100
remplissaient le debugger de `[BLOC PIECE]`, `MOTEURS/MEDIA`, `[DECOUPLE]`, `[JS CONSOLE]`, `GLOBAL`…

Un seul interrupteur, `meta.tracesConsole` du `villa_config.json`, faux par défaut :

- **43 messages** passent par un helper `Trace()` et disparaissent — tout ce qui suit une action
  utilisateur, y compris le code d'alarme de référence qui s'affichait en clair au démarrage ;
- **15 messages restent** toujours affichés : démarrage, chargement de configuration, EISC,
  enregistrement et arrivée des périphériques, erreurs de presets, réponses aux commandes console
  tapées par l'exploitant. De quoi diagnostiquer une panne sur site sans rien réactiver.

Le flag est relu à chaque chargement de configuration : le rétablir ne demande qu'un `progreset`,
pas une recompilation. Côté GUI, les `console.log` restent visibles dans la console du navigateur et
dans l'outil Console Web quoi qu'il arrive ; seul le pont vers le sériel 100 est coupé.

### Retrait de l'analogique +21 (`Lighting_Master`) du bloc pièce

`R__Lighting_Master#` portait un « Dimmer Général » 0-65535 calculé par le C# d'après la scène
(0 / 30 / 70 / 100 %). Aucun composant de la GUI ne l'écrivait, et il n'était lu que pour remplir une
case d'une grille de diagnostic. Il ne portait aucune information que les niveaux de circuits ne
donnent déjà. Retiré de `contrat.blocsPiecesGui.mapping.analog`, du feedback C#, de la colonne
« Dimmer (J21) » de la grille et du plan `OFF_A` de `generate_slot2.js`.

Le signal **global** `Lighting_Master` (a21) reste en place : `generate_slot2.js` s'en sert pour
calibrer l'offset d'entrée analogique du symbole EISC.

### Les scènes d'éclairage pilotent enfin les circuits

Un appui sur une scène ne touchait pas à `CircuitLevels` : les circuits restaient à 32768, la valeur
du constructeur, quelle que soit la scène. La seule chose qu'une scène pilotait était le master
supprimé ci-dessus — autrement dit, après ce retrait, une scène n'aurait plus rien fait du tout.

Les niveaux vivent désormais dans `villa_config.json`, par pièce :
`pieces[].pilotages.eclairages.scenes.niveaux`, un tableau de niveaux 0-65535 par scène, dans
l'ordre de `circuits.noms`. 15 pièces servies, 4 scènes chacune.

**Le slot 2 fait foi.** La table n'est qu'une valeur de repli : dès qu'un niveau de circuit remonte
du slot 2 (offsets +71..+80 venant de l'EISC), `_circuitFromSlot2` mémorise que ce circuit est piloté
par le système d'éclairage réel, et une scène ne le repositionne plus. C'est le comportement qui
tient sur un chantier, où un variateur touché depuis un clavier mural doit rester maître de son
niveau ; la table ne sert que tant que rien n'est câblé derrière.

Au démarrage, chaque pièce est posée sur sa scène 1 (OFF), donc circuits à 0.

### Vérifications

`node --check` sur les 6 blocs `<script>` d'`index.html` (la même barrière que `deploy.ps1`),
`villa_config.json` et `generate_slot2.js` validés, équilibrage du C# contrôlé. La batterie
Playwright de contraste n'a pas été relancée : aucune variable de thème, aucun token, aucune règle de
mise en page n'a été touché — la seule modification visible est une colonne retirée d'une table de
diagnostic. Pas de compilateur C# ni SIMPL dans les sessions Claude : le CPZ et le LPZ restent à
produire sur le PC.

## v1.0.168 — 11.09.2026 — Logo des boutons de source : une seule couche

Le bouton **Apple TV** non sélectionné affichait une pomme déformée (feuille soudée au corps, bord
droit dentelé) alors que la même pomme était nette à l'état sélectionné.

Cause : deux logos étaient peints l'un sur l'autre. L'`<img class="src-overlay-img">` — seul logo de
l'état sélectionné, aspect respecté par `preserveAspectRatio` — et un fond CSS historique sur le
châssis CH5, étiré dans un carré de 44 × 44 px alors que le viewBox fait 384 × 512. La superposition
des deux formes produisait le contour dentelé. Le thème Clair cumulait en plus une pomme sombre (fond
CSS) et une pomme blanche (overlay). Swisscom avait le même doublon (34 × 34 sur un viewBox
200 × 290), moins visible.

Correction au niveau du composant, dans un unique bloc `<style id="logo-source-couche-unique">` en
fin de `<head>` :

- fond CSS supprimé sur les cinq boutons de source, dans tous les états → l'overlay est la source
  unique du logo, donc l'état non sélectionné affiche exactement l'image de l'état sélectionné ;
- logos monochromes blancs marqués `.logo-mono` : mis à l'échelle 1,28 (44 px de haut, la taille
  apparente validée le 10.09) et inversés en sombre sur le thème Clair ;
- l'état est lu sur le châssis (`ch5-button:not([selected="true"]):not(.ch5-button--selected) ~
  .src-overlay-img`) et non sur la classe `.logo-active` de l'image : les deux se désynchronisent
  pendant la transition, et une pomme sombre sur fond violet en serait le prix ;
- bloc mort du 10.09 (`background-size: 44px 44px` sur `.src-appletv`) supprimé.

`iphone.html` ne porte pas ce motif (ni overlay ni fond CSS de logo de source) : rien à corriger.

Vérifié en mode déploiement : 3 thèmes × {non sélectionné, sélectionné} × {1920 × 1200, iPad 11"} —
une seule couche de logo, contraste 17,6:1 (Sombre, Contraste élevé) et 18,3:1 (Clair) non
sélectionné, 4,2:1 sélectionné (violet préexistant), cibles tactiles 282 × 104 et 166 × 104 px,
aucun scroll horizontal, comptage d'erreurs console identique à l'avant. Vitrine régénérée par
`sync-villa-crans.py` et échantillonnée 12 fois par thème sous curseur de démo : aucune couche CSS
en trop, aucune inversion pendant la sélection, aucune désynchronisation châssis / `.logo-active`.
Planches-contact avant/après (déploiement) et vitrine jointes.

Versions alignées en 1.0.168 : `version.json`, `src/version.js`, `villa_config.json` (racine et
`src/`), `src/villa_config.js` ; vitrine en `1.0.168-showcase`. **Reste à pousser sur Vercel**
(`apps/showcase/deployer-v2.bat`) et à compiler.

## v1.0.167 — 11.09.2026 — Contrat de joins v3 : un bloc de joins par pièce

Version préparée pour la **recette sur supports physiques** (dalle TSW-1070, iPad, iPhone, XPanel),
après des mois de mise au point sur le seul site vitrine.

### Changement structurant — fin des joins partagés entre pièces

Jusqu'en v2, les 15 pièces partageaient **un seul jeu de joins** ; la pièce courante était portée par
l'analogique 10 et mémorisée côté C# par périphérique. Invisible sur le showcase (un seul panneau
virtuel, feedback simulé en frontend), ce choix casse dès que deux supports physiques affichent deux
pièces différentes : ils écrivent sur les mêmes joins et se volent commandes et feedbacks.

Désormais chaque pièce dispose de **son propre bloc de 100 joins**, avec la même formule et les mêmes
offsets que les blocs EISC déjà en place :

```
joinPhysique = 1000 + (pieceId - 1) * 100 + offset
```

- Pièce 1 → 1000-1099 · pièce 7 → 1600-1699 · pièce 15 → 2400-2499 · plafond 30 pièces (3998 < 4000).
- Le HTML conserve ses joins « logiques » historiques : les règles CSS et les `querySelector` restent
  valables. La traduction se fait à l'exécution dans `src/js/villa-joins.js` (nouvelle couche
  `VillaJoins`), pilotée par `contrat.blocsPiecesGui.mapping` du `villa_config.json`.
- Attributs miroir `data-join` / `data-rjoin` / `data-cjoin` / `data-vjoin` ajoutés sur chaque
  composant CH5 : ils portent le join logique et ne bougent jamais, c'est sur eux que pointent
  désormais les sélecteurs CSS et JS.
- En mode `showcase`, la couche est inerte : le site vitrine continue de tourner sur les joins
  logiques avec `js/local-feedback.js`, sans aucune modification.

**Restent communs à toute la villa** (exceptions documentées et justifiées dans le JSON) :
sélection de pièce (dig 11-40, ana 10), **états des partitions d'alarme 1-4 (dig 301-312)**,
**presets globaux (dig 401-411, ser 420)**, centrale d'alarme (dig 41-48), télécommandes de sources
(dig 211-220, 500-527, 530-557, 560-600 — une commande vise l'appareil source, pas la pièce),
signaux système et transport de configuration (ser 99-106, dig/ana 250), matériel de la dalle
(ana 240, ana 260, dig 261), easter egg météo (dig 56).

### Boutons qui n'émettaient rien

- **Commandes groupées de stores** : les 9 boutons « Tout ouvrir / Demi-ouverture / Tout fermer »
  ne faisaient que l'animation CSS. Ils émettent désormais les joins 61-69 du contrat
  (volets 61/62/63, rideaux 64/65/66, stores 67/68/69), via `animateGroupBlinds`.
- **Pavé de code d'alarme** : le code était comparé à `'1234'` **en dur dans le JavaScript du panel**.
  La saisie part maintenant à la centrale (ser 43) qui répond par une impulsion sur dig 44 (accepté)
  ou dig 45 (refusé) ; la touche C envoie le dig 46. Repli local de mise en service dans
  `contrat.alarme.codeParDefaut`, à changer ou à vider sur site.
- **iPhone** : `window.toggleMute()` était appelé par deux boutons sans avoir jamais été défini ;
  le feedback de sélection de pièce s'arrêtait à la pièce 8 (boucle 11-18) ; les touches Apple TV
  rembobinage/avance (219/220) n'étaient pas câblées ; la touche mute de la télécommande Swisscom
  (563) était écrasée par le join 55 et n'était donc jamais émise.
- **Interlock des sources** (dalle) : le bloc d'abonnement était gardé par `typeof CrComLib !==
  'undefined'` alors qu'il s'exécute avant le chargement de `ch5-components.js` — il ne s'abonnait
  jamais sur la dalle. Différé par `VillaJoins.whenReady()`.

### Joins ajoutés au contrat

Utilisés par l'interface sans être déclarés : dig 200 (extinction A/V), dig 251-253 (transport du
lecteur média, ordre aligné sur le câblage réel des boutons : 251 lecture/pause, 252 suivant,
253 précédent), ana 254 (volume du lecteur média), ser 100 (console navigateur), et le pavé de code
d'alarme ser 43 / dig 44 / dig 45 / dig 46.

### C# slot 1 (`Backend/Backend/ControlSystem.cs`)

- Décodage unique des blocs ≥ 1000 (`room`, `offset`) pour l'EISC **comme** pour les panels ;
  logique métier factorisée en `ApplyRoomDigitalCommand` / `ApplyRoomAnalogCommand`.
- Les feedbacks sont écrits sur le bloc de la pièce concernée pour toutes les pièces : plus aucune
  logique « quel panneau regarde quoi ». `PushRoomFeedback(roomId)` remplace les envois ciblés.
- Miroir EISC : passe-plat au-dessus de 1000, liste blanche construite depuis `signauxGlobaux` en
  dessous.
- Chaîne d'alarme complète (43/44/45/46) avec relais vers le slot 2 et repli temporisé.
- Les 6 points P1 corrigés : try/catch sur `BuildVillaRoomsDatabase`, impulsions moteurs toujours
  remises à false, boucles de presets bornées à 10, gardes `ContainsKey`, nom de preset assaini
  (plus de traversée de chemin possible), borne de routage ≥ 1000 cohérente.
- Correctifs annexes : ser 33 (mode CVC) ajouté à `UpdateScreenStateForPanel`, entrée ana 53
  (source audio) créée.

### Rétroportage depuis le site vitrine

- Thème **Verre dépoli** : la version du site (voile blanc 0.10 + backdrop à 50 %) est plus jolie mais
  faisait tomber **33 textes sous 4:1**. Réglage retenu : flou réduit et saturation relevée du site
  (photo nette et colorée), voile ardoise allégé 0.42 → 0.34, backdrop à 40 %. Fond composite
  ≈ rgb(72,75,82) : blanc à 8,5:1, menthe #6ee7b7 à 5,5:1.
- Suppression définitive de `playSynthSound()` (synthétiseur Web Audio, 56 lignes dans chaque
  fichier) : plus aucun code sonore dans la GUI.
- Non rétroporté volontairement : la suppression de `sendConsoleCommand` / `quickConsoleCommand` /
  `refreshIptable`, qui pilotent le terminal du CP4 et n'ont de sens qu'en déploiement.

### Contraste

Défaut préexistant corrigé : le vert « Online » du bandeau d'état était à 2,5:1 sur fond clair et
3,4:1 en Verre dépoli. Accent foncé `#047857` en thème Clair, menthe `#a7f3d0` en Verre dépoli.
Batterie `tools/check_contrast_dom.mjs` : **aucun texte sous 4:1**, 3 thèmes × page + 10 fenêtres
× états dynamiques, dalle et smartphone.

### Divers

- Le libellé de version affiché était figé à `v1.0.149` dans les deux fichiers : corrigé.
- `scripts/sync-villa-crans.py` (dépôt showcase) copie désormais `js/villa-joins.js`.

---

## v1.0.166 — 09-10.09.2026
Télécommandes complètes (Apple TV, Sky Q, IPTV, Swisscom), sources vidéo en interlock avec musique
indépendante, fenêtres Contrôle global / Caméras / Système de sécurité / Réglages agrandies,
cohérence des 3 thèmes, engrenages en SVG, son caché retiré.

## v1.0.165 — 09.09.2026
Retours de direction du 09.09 appliqués, bandeau « État de la villa », contrat de joins v2.

## 17/09/2026 — outillage 0.2.0, GUI 1.0.181 / C# 1.0.180 inchangé

Préparation CH5 et SIMPL depuis la même configuration, profil de compatibilité versionné avec empreintes des sources, refus des joins/plages/identifiants non pris en charge. Générateur SIMPL : --config, sortie distincte neuve, conservation du fichier de travail et contrôle des entrées avant écriture. Pilote Villa Léman à deux pièces préparé et chargé sur trois supports × trois thèmes. Contraintes et preuves : docs/industrialisation/LOT-0.2.0.md.

Quatre artefacts : CH5Z pilote assemblé/non qualifié ; CPZ inchangé par ce lot ; SMW préparés, LPZ non compilé ; correction du mode démo/registre sur le site, publication suivie dans le bilan. Aucune connexion matérielle. Validation ciblée : 43 tests outillage, 49 démo, 28 chargement/visibilité pilote, 76 HVAC, 53 Wellness ; build/lint réussis.

Correction commune de la carte HVAC après revue à 1280 × 800 : marges adaptées au conteneur Wellness et disposition compacte des commandes ON/OFF/ventilation. CH5 et copie vitrine synchronisés en 1.0.181. Programme C# identique, assembly 1.0.180.0 ; CH5Z beta et pilote reconstruits. Les empreintes de la copie C# ayant produit le CPZ précédent correspondent aux sources actuelles. Matrice HVAC : 555 contrôles réussis après reprise d’un essai expiré. Aucun LPZ compilé.

Validation finale GUI 1.0.181 : 632 contrôles Wellness (36 combinaisons et retours natifs) et contraste 4:1 réussis. Les fiches FR/EN/DE et captures d’accueil sombre/clair décrivent la disposition compacte.
