# Mémoire — Villa Crans CH5 (version déploiement)

Copie de la mémoire Claude sur le projet source (`/areas/villacrans-ch5.md`), mise à jour le 11 sept. 2026.
GUI Crestron CH5 + C# slot 1 + SIMPL slot 2 pour Fréquence TV.

- Projet Cowork « Villa Crans CH5 » d'abord créé sur son autre laptop (non visible sur son PC perso74), repris le 09.09.2026 sur le PC `lp-dpe-01-lenovo`.
- **Restructuration en monorepo (11.09.2026)** : le code vit dans `C:\dev\crestron\repo` — `projects/villa-crans/ch5` (GUI + C#), `projects/villa-crans/simpl` (slot 2), `apps/showcase` (site vitrine). Les anciens chemins `Desktop\VillaCrans` et `VillaCrans SIMPL` ne servent plus.
- Contexte de session dans `CONTEXTE-CLAUDE.md` à la racine de `ch5` ; doc technique dans `docs/` ; journal des versions dans `CHANGELOG.md`.
- La vitrine publique du GUI est le showcase (dossier `villa-gemini-frequencetv`), régénérée par `apps/showcase/scripts/sync-villa-crans.py`, jamais éditée à la main.
- Retours d'Antoine Dändliker du 09.09.2026 appliqués dans le code mais toujours pas compilés/déployés ni recettés sur la dalle ; un point Donatien / Alexandre / Antoine reste à organiser.

## Outils disponibles côté PC (11.09.2026)

- `device_bash` n'est pas toujours là : quand il manque, tout passe par `device_list_dir` / `device_stage_files` / `device_commit_files`. Le staging refuse les fichiers à plus de 7 dossiers sous la racine connectée (`src/themes/svgs/...` est hors limite), mais le commit accepte les mêmes chemins.
- Aucun shell git sur le dépôt depuis Claude → le push Vercel reste une action de Donatien (`apps/showcase/deployer-v2.bat` ou `commit-et-deploie.bat`).
- Rendu/vérification Playwright : possible dans le conteneur cloud sur une copie de `src/`, mais les captures d'élément bloquent sur l'attente des polices Google (réseau coupé) → utiliser `Page.captureScreenshot` via CDP. La carte AV est en `display:none` au chargement : la forcer en `flex` pour capturer la rangée de sources.

## Contrat de joins v3 (11.09.2026) — décision structurante

Jusqu'en v2, les 15 pièces partageaient **un seul jeu de joins**, la pièce courante étant portée par l'analogique 10. Invisible sur le showcase (un seul panneau, feedback frontend), mais cassant dès que deux supports physiques affichent deux pièces différentes.

- Depuis la v3 : `joinPhysique = 1000 + (pieceId − 1) × 100 + offset`, mêmes offsets que les blocs EISC. Pièce 1 → 1000-1099, pièce 15 → 2400-2499, plafond 30 pièces (3998 < 4000 joins CH5).
- Le HTML garde ses joins « logiques » historiques ; la couche `src/js/villa-joins.js` les traduit à l'exécution d'après `contrat.blocsPiecesGui.mapping` du `villa_config.json`. Attributs miroir stables `data-join` / `data-rjoin` / `data-cjoin` / `data-vjoin` : **les sélecteurs CSS et JS ne visent plus les attributs de join**.
- En mode `showcase` la couche est inerte, la vitrine tourne inchangée sur les joins logiques.
- Restent communs à toute la villa, à sa demande : états des partitions d'alarme 1-4 (301-312) et presets globaux (401-411 / 420). Exceptions ajoutées et justifiées : sélection de pièce, centrale d'alarme, télécommandes de sources (elles visent l'appareil, pas la pièce), signaux système, matériel de la dalle.
- Diagnostic sur le panel : `VillaJoins.table()` dans la console donne la pièce, la base et tous les joins physiques.

## Logos des boutons de source — une seule couche (11.09.2026, v1.0.168)

Piège à retenir : les cinq boutons de source portaient **deux logos superposés**. L'`<img class="src-overlay-img">` (frère du `ch5-button` dans le wrapper, positionné en absolu, seul logo de l'état sélectionné, aspect respecté par `preserveAspectRatio`) **et** un fond CSS historique sur le `div.ch5-button`, étiré dans un carré (44 × 44 px pour la pomme, viewBox 384 × 512). D'où la pomme déformée à l'état non sélectionné, feuille soudée au corps et bord droit dentelé, alors qu'elle était nette une fois sélectionnée. Swisscom avait le même doublon (34 × 34 sur un viewBox 200 × 290).

- Correction dans un bloc unique `<style id="logo-source-couche-unique">` en fin de `<head>` de `src/index.html` : `background-image: none` sur les cinq sources dans tous les états → l'overlay est la source unique. **Ne jamais rajouter de `background-image` de logo sur `.src-*`.**
- Logos monochromes blancs marqués `.logo-mono` (aujourd'hui Apple TV seul) : `scale(1.28)` non sélectionné pour retrouver les 44 px validés le 10.09, et `filter: invert(1)` sur le thème Clair, où le blanc disparaissait sur un bouton clair.
- L'état est lu sur le châssis (`ch5-button:not([selected="true"]):not(.ch5-button--selected) ~ .src-overlay-img`) et non sur `.logo-active` de l'image : les deux se désynchronisent pendant la transition, et une pomme sombre sur fond violet en serait le prix.
- Les anciens blocs CSS de logos (quatre duplications de `.src-appletv` entre les lignes ~1180 et ~1600, plus l'override du 10.09, supprimé) sont morts : le `customClass` d'un `ch5-button` atterrit sur le DIV interne, donc `ch5-button.src-appletv` ne matche jamais rien. Une ligne CSS cassée vers la ligne 1452 (`ch5-button.src-iptv { ... }utf8,<svg …`) avale encore le bloc suivant et explique que Sky Q / IPTV / Musique n'avaient déjà plus de fond CSS. Le `<path>` SVG malformé signalé en console est le tracé Sky Q de ces règles mortes (`0 18-4 22-8`).
- `src/iphone.html` ne porte pas ce motif (ni overlay ni fond CSS de logo de source) : rien à corriger là.
- Écrit sur le disque, showcase régénéré, versions alignées en 1.0.168 (`version.json`, `src/version.js`, `villa_config.json` racine et `src/`, `src/villa_config.js` ; vitrine `1.0.168-showcase`). **Reste le push Vercel**, à sa main.

## État au 11.09.2026

v1.0.168 écrite dans le monorepo, **non compilée** (ni `deploy.ps1` ni SIMPL# Pro — pas de compilateur dans les sessions Claude). Vérifications headless : 52/52 contrôles de joins verts (le nom de signal interne des composants CH5 suit bien la pièce), contraste 100 % vert sur 3 thèmes × page + 10 fenêtres × dalle et smartphone, aucune erreur console nouvelle. Logos de source vérifiés en déploiement (3 thèmes × 2 états × dalle et iPad 11", contraste 17,6:1 / 18,3:1 au repos) et en showcase (12 échantillons par thème sous curseur de démo). Showcase régénéré mais **pas encore poussé**.

Restent à faire : compiler GUI + C#, écrire côté SIMPL slot 2 les blocs de pièce ≥ 1000 et la chaîne d'alarme ser 43 / dig 44-46, faire la recette `docs/09_RECETTE_SUPPORTS_PHYSIQUES.md` (le test clé : deux supports sur deux pièces différentes en même temps), traiter un lot de défauts d'ergonomie préexistants, et **remplacer les noms de test inappropriés du `villa_config.json` avant toute visite client**.

## Flux de push du showcase depuis ce PC (09.09.2026)

- Claude ne peut pas pousser (dépôt hors sources autorisées) → dépôt d'un `showcase.bundle` dans `Claude outputs\showcase-sync-0909\`, `watch-showcase.cmd` surveille le dossier et pousse tout seul (sinon `push-showcase.cmd`).
- Il ne veut pas de fichiers `.cmd` / `.bundle` qui s'accumulent, ni avoir à cliquer « Télécharger » : les fichiers doivent être écrits directement dans ses dossiers.
- Git est dans `C:\Program Files\Git` mais pas dans le PATH.
- Sync v1.0.166 poussée et en ligne le 09.09 au soir ; sync v1.0.168 écrite sur le disque le 11.09, push en attente.
