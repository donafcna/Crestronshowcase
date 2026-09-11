# VillaCrans — contexte pour Claude (lire en premier, économise les tokens)

Projet Fréquence TV : GUI Crestron CH5 « Villa Crans-Montana » + SIMPL# Pro (slot 1, `Backend/Backend/ControlSystem.cs`) + SIMPL Windows (slot 2). Contrat de joins **v3** (`docs/03_CONTRAT_JOINS.md`). Doc dans `docs/` (01 spéc · 02 villa_config · 03 joins · 04 SIMPL · 05 recette · 06 to-do · 07 retours direction 09.09 · 08 workflow showcase), audit `AUDIT_2026-09-02.md`, journal `CHANGELOG.md`, règles CH5 `.agents/AGENTS.md` (« Rule of Gold » : états par joins natifs CH5, jamais par DOM JS).

## Arborescence (monorepo, depuis la restructuration du 11.09.2026)
`C:\dev\crestron\repo` — `projects/villa-crans/ch5` (GUI + C#, ce fichier à la racine) · `projects/villa-crans/simpl` (slot 2 `.smw`, contrat) · `apps/showcase` (site vitrine, clone de `donafcna/Crestronshowcase`, main → Vercel). Les anciens chemins `C:\Users\donat\Desktop\VillaCrans` et `VillaCrans SIMPL` ne sont plus utilisés.

## Fichiers qui comptent
- `src/index.html` (dalle TSW-1070, iPad, XPanel) et `src/iphone.html` : SOURCE DE VÉRITÉ. Blocs `<style id="tablet-sidebar">` (menu de gauche groupé), `<style id="global-modals-xl">` (modales agrandies), `<style id="theme-readability">` / `<style id="theme-overlays">` (thèmes Sombre / Clair / Verre dépoli).
- **`src/js/villa-joins.js` (v3, nouveau)** : couche qui traduit les joins LOGIQUES du HTML en joins PHYSIQUES par pièce. À lire avant toute intervention sur les joins.
- `villa_config.json` (racine = copié dans `src/` par `deploy.ps1`) : `meta.mode = "deploiement"` (jamais `showcase` ici), `contrat.signauxGlobaux`, `contrat.blocsPieces` (EISC), **`contrat.blocsPiecesGui`** (mapping join logique → offset), `contrat.alarme`, `pagesSpeciales`, `traductions`.
- `deploy.ps1` : `node --check` de chaque `<script>` + validation JSON + contraste → `npx ch5-cli archive` → TSW (pscp/plink) → CP4. `-Target web` = XPanel + QR codes.
- **Contraste (règle permanente : 0 défaut)** — `node tools/check_contrast_dom.mjs --root http://localhost:4173 --min 4` sur une preview servie (3 thèmes × page + 10 fenêtres × états dynamiques, dalle et smartphone). Attendre 900 ms après un changement de thème.

## Contrat de joins v3 (11.09.2026) — à ne pas oublier
`joinPhysique = 1000 + (pieceId - 1) * 100 + offset`. **Aucun join de pilotage n'est partagé entre deux pièces.** Le HTML garde ses joins historiques ; `VillaJoins` les traduit à l'exécution selon `contrat.blocsPiecesGui.mapping`. Les sélecteurs CSS et JS ne visent plus `[sendEventOnClick="155"]` mais **`[data-join="155"]`** (miroirs stables : `data-join`, `data-rjoin`, `data-cjoin`, `data-vjoin`).
Restent globaux : sélection de pièce 11-40 / ana 10, alarme (centrale 41-48, **partitions 301-312**), **presets globaux 401-411 / ser 420**, télécommandes 211-220 / 500-527 / 530-557 / 560-600 (elles visent l'appareil source), système ser 99-106 et dig/ana 250, dalle ana 240 / ana 260 / dig 261, météo dig 56.
Limite : 30 pièces (pièce 30 → 3900-3998, plafond CH5 4000).
En mode `showcase` la couche est inerte : la vitrine tourne sur les joins logiques avec `js/local-feedback.js`.

## Règles GUI validées par Donatien
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

## Vitrine (apps/showcase, crestrongui.vercel.app)
Copie régénérée par `python apps/showcase/scripts/sync-villa-crans.py <chemin>/projects/villa-crans/ch5/src` (jamais éditée à la main) ; `meta.mode = "showcase"`, feedback simulé par `js/local-feedback.js`, curseur de démo. Le script copie aussi `js/villa-joins.js` depuis la v3.

## Reste à faire
1. `.\deploy.ps1` → compiler la **1.0.168** (dalle + XPanel + CP4) — pas fait, la compilation demande le PC et la dalle.
2. Compiler `ControlSystem.cs` dans SIMPL# Pro (aucun compilateur dans les sessions Claude).
3. Implémenter côté SIMPL Windows slot 2 : blocs de pièce ≥ 1000 en bidirectionnel et chaîne d'alarme ser 43 / dig 44-46 (voir `docs/03_CONTRAT_JOINS.md` § « Ce que le slot 2 doit implémenter »).
4. Recette sur supports physiques (voir `docs/05_RECETTE.md`) : le test qui compte est **deux supports sur deux pièces différentes en même temps**.
5. Lot de défauts d'ergonomie préexistants non traités (liste dans le rapport du 11.09) : scroll horizontal sur iPhone, 5-6 cibles tactiles < 40 px, libellés de pièces tronqués sur iPad, un `<path>` SVG malformé en console (le tracé Sky Q des anciennes règles CSS, `0 18-4 22-8`).
6. **Avant toute visite client : `villa_config.json` contient encore des noms de test inappropriés** (pièces, scènes, sources, traductions).

## État au 11.09.2026 (fin de session)
v1.0.168 écrite dans le monorepo, **non compilée**. Contrat v3 en place et vérifié en headless (52/52 contrôles de joins verts, contraste 100 % vert, aucune erreur console nouvelle).
Logos de source passés en couche unique et vérifiés : 3 thèmes × {non sélectionné, sélectionné} × {1920×1200, iPad 11"} en mode déploiement — aucune couche CSS en trop, contraste 17,6:1 / 18,3:1 non sélectionné et 4,2:1 sélectionné (violet préexistant), aucun scroll horizontal, comptage d'erreurs console identique à l'avant ; mode showcase régénéré et échantillonné 12 fois par thème sous curseur de démo — pas d'inversion pendant la sélection, pas de désynchronisation.
Showcase **régénéré** (`meta.version 1.0.168-showcase`) mais **pas encore poussé sur Vercel** : le push demande `apps/showcase/deployer-v2.bat` (ou `commit-et-deploie.bat`) côté PC, les sessions Claude n'ont pas de shell sur le dépôt.
