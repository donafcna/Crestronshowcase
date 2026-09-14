# VillaCrans — contexte pour Claude (lire en premier, économise les tokens)

## Les 4 artefacts à suivre (convention validée le 13.09.2026)
Toute modification du projet se solde par quatre versions à tenir alignées. Les tenir à jour ici et
en tête de chaque entrée du CHANGELOG, de sorte qu'on puisse dire pour n'importe quelle version
passée ce qui tournait réellement sur la dalle, les deux slots et Vercel.

| Artefact | Version | Compilation |
|---|---|---|
| CH5 `.ch5z` (TSW + XPanel) | **1.0.173** | `.\deploy.ps1` — produite et chargée sur la TSW le 14.09 |
| CPZ slot 1 (C#) | — | SIMPL# Pro — **à recompiler** (`ControlSystem.cs` modifié le 13.09) |
| LPZ slot 2 (SIMPL) | — | `node contract/generate_slot2.js` puis F12 — **à refaire** |
| Showcase Vercel | lot du 14.09 | poussé sur `main` — Vercel déploie automatiquement ; `deployer-v2.bat` est obsolète (il attend un `.patch` supprimé depuis) |

**PowerShell bloque les scripts sur ce PC** (`PSSecurityException` sur `npm.ps1` et `deploy.ps1`) :
lancer `npm.cmd install` et `powershell -ExecutionPolicy Bypass -File .\deploy.ps1`, ou poser
`Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` une bonne fois.

`deploy.ps1` incrémente `version.json` à chaque build, y compris quand le build échoue ensuite :
un numéro sauté ne veut pas dire qu'une version a existé. `meta.version` du `villa_config.json`,
lui, n'est pas incrémenté par le script — l'aligner à la main.

Projet Fréquence TV : GUI Crestron CH5 « Villa Crans-Montana » + SIMPL# Pro (slot 1, `Backend/Backend/ControlSystem.cs`) + SIMPL Windows (slot 2). Contrat de joins **v3** (`docs/03_CONTRAT_JOINS.md`). Doc dans `docs/` (01 spéc · 02 villa_config · 03 joins · 04 SIMPL · 05 recette · 06 to-do · 07 retours direction 09.09 · 08 workflow showcase), audit `AUDIT_2026-09-02.md`, journal `CHANGELOG.md`, règles CH5 `.agents/AGENTS.md` (« Rule of Gold » : états par joins natifs CH5, jamais par DOM JS).

## Arborescence (monorepo, depuis la restructuration du 11.09.2026)
`C:\dev\crestron\repo` — `projects/villa-crans/ch5` (GUI + C#, ce fichier à la racine) · `projects/villa-crans/simpl` (slot 2 `.smw`, contrat) · `apps/showcase` (site vitrine, clone de `donafcna/Crestronshowcase`, main → Vercel). Les anciens chemins `C:\Users\donat\Desktop\VillaCrans` et `VillaCrans SIMPL` ne sont plus utilisés.

## Fichiers qui comptent
- `src/index.html` (dalle TSW-1070, iPad, XPanel) et `src/iphone.html` : SOURCE DE VÉRITÉ. Blocs `<style id="tablet-sidebar">` (menu de gauche groupé), `<style id="global-modals-xl">` (modales agrandies), `<style id="theme-readability">` / `<style id="theme-overlays">` (thèmes Sombre / Clair / Verre dépoli).
- **`src/js/villa-joins.js` (v3, nouveau)** : couche qui traduit les joins LOGIQUES du HTML en joins PHYSIQUES par pièce. À lire avant toute intervention sur les joins.
- `villa_config.json` (racine = copié dans `src/` par `deploy.ps1`) : `meta.mode = "deploiement"` (jamais `showcase` ici), **`meta.tracesConsole`** (faux = debugger propre, voir plus bas), `contrat.signauxGlobaux`, `contrat.blocsPieces` (EISC), **`contrat.blocsPiecesGui`** (mapping join logique → offset), `contrat.alarme`, **`pieces[].pilotages.eclairages.scenes.niveaux`** (niveaux de circuits par scène), `pagesSpeciales`, `traductions`.
- `deploy.ps1` : `node --check` de chaque `<script>` + validation JSON + contraste → `npx ch5-cli archive` → TSW (pscp/plink) → CP4. `-Target web` = XPanel + QR codes.
- **Contraste (règle permanente : 0 défaut)** — `node tools/check_contrast_dom.mjs --root http://localhost:4173 --min 4` sur une preview servie (3 thèmes × page + 10 fenêtres × états dynamiques, dalle et smartphone). Attendre 900 ms après un changement de thème.

## Contrat de joins v3 (11.09.2026) — à ne pas oublier
`joinPhysique = 1000 + (pieceId - 1) * 100 + offset`. **Aucun join de pilotage n'est partagé entre deux pièces.** Le HTML garde ses joins historiques ; `VillaJoins` les traduit à l'exécution selon `contrat.blocsPiecesGui.mapping`. Les sélecteurs CSS et JS ne visent plus `[sendEventOnClick="155"]` mais **`[data-join="155"]`** (miroirs stables : `data-join`, `data-rjoin`, `data-cjoin`, `data-vjoin`).
Restent globaux : sélection de pièce 11-40 / ana 10, alarme (centrale 41-48, **partitions 301-312**), **presets globaux 401-411 / ser 420**, télécommandes 211-220 / 500-527 / 530-557 / 560-600 (elles visent l'appareil source), système ser 99-106 et dig/ana 250, dalle ana 240 / ana 260 / dig 261, météo dig 56.
Limite : 30 pièces (pièce 30 → 3900-3998, plafond CH5 4000).
**Retiré du bloc pièce le 13.09.2026 : l'analogique +21 `Lighting_Master`** (« Dimmer Général »).
Personne ne l'écrivait, il n'était lu que par une grille de diagnostic, et les niveaux de circuits
+71..+80 portent déjà l'information. Le signal **global** `Lighting_Master` (a21) reste en place :
`generate_slot2.js` s'en sert pour calibrer l'offset analogique du symbole EISC — ne pas le toucher.
En mode `showcase` la couche est inerte : la vitrine tourne sur les joins logiques avec `js/local-feedback.js`.

## Règles GUI validées par Donatien
- **Aucun défilement dans les GUI (consigne générale, 14.09.2026).** Rien ne bouge au doigt, aucune
  barre visible : le contenu tient à l'écran, quitte à redimensionner les boutons. Seules exceptions
  admises sur smartphone, listes par nature illimitées : Caméras, Circuits, Configuration preset.
- **Occuper la place au mieux (consigne générale, 14.09.2026).** Sur smartphone surtout : pas
  d'espace perdu, pas de bouton trop petit. Les fenêtres prennent 92 % de la hauteur et les
  télécommandes sont mises à l'échelle pour remplir le cadre (`fitRemoteLayout`, agrandissement
  autorisé, contrairement à la dalle qui ne fait que réduire).
- **Cohérence entre châssis (consigne générale, 14.09.2026).** Les textes et les couleurs doivent
  être identiques d'un support à l'autre : dalle TSW, iPad, XPanel et smartphone. Un libellé ou une
  couleur modifié sur un châssis se répercute sur les autres dans le même lot. Seules les
  **dimensions** (tailles de police, hauteurs de bouton, nombre de colonnes) se règlent par support.
- Télécommandes : Apple TV = Menu + croix (211-220) ; Sky Q / IPTV (500 / 530 + index) et Swisscom (560 + index) en 3 zones rectangulaires ; `fitRemoteLayout` (jamais hors cadre) ; pas de bordure bleue CH5 sur `#source-control-overlay`.
- Sources : vidéo 151-154 en interlock, Musique 155 indépendante (badge audio), 156 = retour audio vidéo ; premier appui = activation + télécommande ; scènes mémorisées (appui long, `localStorage villa_scene_<pièce>_<n>`) ; bandeau « État de la villa ».
- Modales Contrôle global / presets / caméras / sécurité : 94 % du GUI, fond quasi opaque, textes ≥ 1,1 rem. Réglages : 640 px dalle/tablette, 440 px smartphone.
- Thèmes : Sombre, Clair, Verre dépoli (Cyberpunk retiré), `<body id="app-body">` obligatoire.
  - Verre dépoli (réglage v1.0.167) : `--container-bg: rgba(15,23,42,.34)` + `--blur-val: blur(18px) saturate(1.8) brightness(0.40)`. La version « voile blanc 0.10 / brightness 0.5 » du site vitrine est plus jolie mais fait tomber 33 textes sous 4:1 — ne pas la rétroporter telle quelle.
  - Clair = coque `#f8fafc`, cartes `rgba(15,23,42,.06)`, textes `#0f172a` / `#475569`, accents foncés (`#047857` `#1d4ed8` `#a16207` `#6d28d9` `#b91c1c`). Ne jamais repeindre : fonds hexadécimaux en dur, dégradés, `ch5-button[selected="true"]`.
  - Bouton CH5 sans style dédié : `#0369a1` en thèmes sombres (le bleu `#0099ff` ne porte pas de texte blanc). Sélectionné vert `#10b981` → libellé `#052e16`.
  - Badges d'alarme : classes `.alarm-badge--off/--partial/--active`, jamais de couleur en dur dans le JS.
- Menu de gauche : Réglages + version + météo groupés au-dessus du menu des pièces à TOUTES les largeurs.
- Icônes : engrenages = SVG `.gear-icon` (jamais d'emoji).
- **Logos des boutons de source : une seule couche (v1.0.168).** Le logo est l'`<img class="src-overlay-img">`, frère du `ch5-button` dans le wrapper, positionné en absolu et mis à l'échelle par CSS (`.logo-active` = sélectionné, 1,7 ; sinon 1,0, et 1,28 pour `.logo-mono`). Les fonds CSS de logo sur le châssis sont neutralisés dans `<style id="logo-source-couche-unique">` (fin de `<head>`) : ils doublaient l'overlay à l'état non sélectionné et, étirés dans un carré alors que les viewBox ne sont pas carrés (Apple 384×512, Swisscom 200×290), donnaient une pomme à feuille soudée et bord dentelé. Ne jamais rajouter de `background-image` de logo sur `.src-*`.
  - Logos monochromes blancs → classe `.logo-mono` sur l'`<img>` (aujourd'hui Apple TV) : `filter: invert(1)` en thème Clair, où le blanc disparaissait.
  - L'état est lu sur le châssis (`ch5-button:not([selected="true"]):not(.ch5-button--selected) ~ .src-overlay-img`), pas sur `.logo-active` : les deux se désynchronisent pendant la transition et on obtiendrait une pomme sombre sur fond violet.
  - Rappel de cascade : le `customClass` d'un `ch5-button` atterrit sur le DIV interne, donc `ch5-button.src-appletv` ne matche jamais rien — beaucoup de règles historiques de `.src-*` sont mortes pour cette raison, et une ligne CSS cassée vers la ligne 1452 (`ch5-button.src-iptv { ... }utf8,<svg …`) avale encore le bloc suivant.
- **Aucun son** : `playFunnySound` neutralisée, `playSynthSound` supprimée (11.09.2026).
- **Le debugger ne montre que des signaux (13.09.2026).** Deux règles permanentes issues de la
  recette sur dalle :
  - *Émission sur changement.* Ne jamais réécrire un signal à sa valeur courante : sur un bloc
    pièce le join est bidirectionnel, et le front est lu par le slot 2 comme un appui (une scène
    d'éclairage se redéclenchait à chaque appui sur la consigne CVC). Passer par `SetBool` /
    `SetUShort` / `SetString`. Exceptions assumées : les impulsions et la relance du code d'alarme,
    où le front *est* le message ; et `_forcePush`, qui rétablit l'écriture inconditionnelle le
    temps du rafraîchissement complet d'un périphérique qui se connecte.
  - *Traces sous `meta.tracesConsole`.* 43 des 58 `PrintLine` du C# et la recopie des `console.log`
    de la GUI sur le sériel 100 passent par `Trace()` et sont masqués par défaut. Restent affichés :
    démarrage, configuration, EISC, périphériques, erreurs, réponses aux commandes console. Le flag
    est relu à chaque chargement de config : un `progreset` suffit à le rétablir.
- **Scènes d'éclairage → circuits (13.09.2026).** `pieces[].pilotages.eclairages.scenes.niveaux`
  donne le niveau 0-65535 de chaque circuit pour chaque scène. **Le slot 2 fait foi** : dès qu'un
  niveau remonte de l'EISC sur +71..+80, `_circuitFromSlot2` marque ce circuit et la table ne le
  repositionne plus. Elle ne sert que tant que rien n'est câblé derrière. Démarrage sur la scène 1.

## GUI smartphone — agrandissement (14.09.2026)
Tout l'agrandissement de `src/iphone.html` tient dans **un seul bloc `<style id="mobile-xl">`** en
fin de `<body>` : entête, scènes, moteurs, HVAC, sources, barre basse, et toutes les modales.
Aucune taille écran par écran — une exception se justifie avant d'être écrite. Cibles tactiles
>= 44 px, repli `@media (max-height: 700px)` pour l'iPhone SE. Trois pièges rencontrés, à ne pas
réintroduire :
- un style **en ligne avec `!important`** (l'ancien pavé de code) ne peut pas être repris en CSS :
  le retirer du HTML plutôt que d'empiler des règles ;
- sur un `ch5-button`, la **division interne** ne suit pas la taille de l'hôte : donner
  `width/height: 100%` à `> div` et à `.cb-btn`, sinon le fond déborde et le libellé est tronqué
  (« DÉSACTIVER » → « DESACT… ») ;
- les **éléments de grille** ne rétrécissent pas sous leur contenu : `min-width: 0` sur les
  `ch5-button` des grilles de scénarios.
Caméras : plus de filtre vision nocturne verte sur smartphone, même rendu que la dalle et l'iPad.
Second bloc `<style id="mobile-ux">` + script (14.09.2026) : icônes de moteurs animées et scènes
mémorisées par appui long, aux mêmes clés `villa_scene_<pièce>_<n>` que la dalle. Il ne dépend
d'aucune fonction interne du fichier (tout passe par le DOM, CrComLib et deux MutationObserver sur
`#motors-container` et `#circuits-container`, régénérés à chaque changement de pièce).
**Piège CH5 supplémentaire** : le fond générique `#0369a1 !important` des boutons CH5 écrase les
`customStyle` — c'est ce qui rendait les trois télécommandes entièrement bleues. Les `customStyle`
de `#source-control-overlay` sont donc marqués `!important` un par un ; ne pas les « nettoyer ».
L'entête ne porte plus que la liste des pièces et l'engrenage : version, état de connexion et
appui long d'administration sont dans la fenêtre Réglages.

## Vitrine (apps/showcase, crestrongui.vercel.app)
Copie régénérée par `python apps/showcase/scripts/sync-villa-crans.py <chemin>/projects/villa-crans/ch5/src` (jamais éditée à la main) ; `meta.mode = "showcase"`, feedback simulé par `js/local-feedback.js`, curseur de démo. Le script copie aussi `js/villa-joins.js` depuis la v3.
**Barre d'outils (14.09.2026) : QR code · Fiche PDF.** « Présentation » retiré (la bulle « Reprise
de la démo dans N secondes », désormais en bas à gauche dans tous les modes, est la seule commande
de la démo) et « Plein écran » caché derrière `showEmbedTool` : doublon avec le bouton Scène. Le
plein écran se demande par l'adresse — **`/3` GUI seule plein écran, `/4` retour au Mode normal**,
sur le modèle de `/1` et `/0` du Mode Dev (`hooks/useGuiFullscreen.js`, Échap en échappatoire).
La démo automatique démarre désormais sur **tous les supports** (elle était réservée au PC via
`isDesktopPointer`) : sans bouton, elle n'était plus démarrable à la main sur mobile et tablette.

## Reste à faire
1. `npm install` dans `projects/villa-crans/ch5` — `node_modules` n'a pas suivi le passage en monorepo, `npx ch5-cli` tombe en 404 (le binaire vient de `@crestron/ch5-utilities-cli`).
2. `.\deploy.ps1` → 1.0.170 (dalle + XPanel + CP4), puis SIMPL# Pro pour le CPZ et `generate_slot2.js` + F12 pour le LPZ.
3. Implémenter côté SIMPL Windows slot 2 : blocs de pièce ≥ 1000 en bidirectionnel et chaîne d'alarme ser 43 / dig 44-46 (voir `docs/03_CONTRAT_JOINS.md` § « Ce que le slot 2 doit implémenter »).
4. Recette sur supports physiques (voir `docs/05_RECETTE.md`) : le test qui compte est **deux supports sur deux pièces différentes en même temps**.
5. Régénérer et pousser le showcase après validation du lot du 13.09.
6. Lot de défauts d'ergonomie préexistants non traités (liste dans le rapport du 11.09) : scroll horizontal sur iPhone, 5-6 cibles tactiles < 40 px, libellés de pièces tronqués sur iPad, un `<path>` SVG malformé en console (le tracé Sky Q des anciennes règles CSS, `0 18-4 22-8`).
7. **Avant toute visite client : `villa_config.json` contient encore des noms de test inappropriés** — dont `valeursParDefaut.scenesEclairage`, qui porte des libellés franchement déplacés.
8. Playwright absent du PC : la batterie de contraste est sautée par `deploy.ps1` (`npm i -D playwright pngjs ; npx playwright install chromium`).

## État au 13.09.2026 (recette sur dalle en cours)
Donatien teste sur la TSW-1070 avec le SIMPL Debugger ouvert sur le slot 2. Premier lot de retours
traité et écrit dans les sources (voir CHANGELOG v1.0.170) : émission sur changement, traces sous
`meta.tracesConsole`, retrait de l'analogique +21, scènes → niveaux de circuits. **Rien n'est
compilé ni chargé** : CPZ, LPZ et `.ch5z` restent à produire sur le PC.

Vérifié : `node --check` sur les 6 blocs `<script>` d'`index.html`, JSON et `generate_slot2.js`
valides, équilibrage du C# contrôlé. Batterie Playwright non relancée — aucune variable de thème ni
règle de mise en page touchée, la seule modification visible est une colonne retirée d'une grille de
diagnostic.

Reste du contexte de la 1.0.168 : contrat v3 vérifié en headless (52/52 contrôles de joins verts,
contraste 100 % vert), logos de source en couche unique, showcase régénéré en 1.0.168-showcase mais
jamais poussé sur Vercel.
