# 00 — État actuel (doc d'entrée, fait foi)

Reconstitué le 11 sept. 2026 depuis le dépôt (`C:\dev\crestron`) et la mémoire Claude.
À lire en premier, avec le CHANGELOG. Ne rien ouvrir d'autre tant que le plan n'est pas validé.

## Ce qu'est le projet

GUI Crestron CH5 pour Fréquence TV, décliné en **deux versions d'une seule source** :

| | Déploiement | Showcase |
|---|---|---|
| Public | équipe programmation FTV, chez les clients | site vitrine public |
| Feedback | backend C# (slot 1) + SIMPL (slot 2) | 100 % frontend (`js/local-feedback.js`, contrat de joins v2) |
| Curseur de démo | jamais | automatique |
| `meta.mode` (JSON de config) | `deploiement` | `showcase` |

Source unique : `VillaCrans/src`. Le showcase est régénéré par `scripts/sync-villa-crans.py`, **jamais édité à la main** (seule exception : `js/local-feedback.js`).

## Où sont les fichiers (PC `lp-dpe-01-lenovo`)

Réorganisation en monorepo sous `C:\dev\crestron` (script `reorg-monorepo.ps1`) :

- `repo\apps\showcase` — site vitrine (ex-dépôt `Crestronshowcase`), avec son `CLAUDE.md`, `README.md` (journal daté), `docs\GUIDE-MARKETING.md`, `scripts\sync-villa-crans.py`
- `repo\projects\villa-crans\ch5` et `...\simpl` — le GUI de déploiement et le programme SIMPL
- `_villacrans-ch5`, `_villacrans-simpl` — anciens dépôts conservés à côté (`CONTEXTE-CLAUDE.md`, `docs\`, `deploy.ps1`, `villa_config.json`, `Backend\`, `Claude outputs\`)

Ancienne arborescence citée dans les docs historiques : `C:\Users\donat\Desktop\VillaCrans`, `VillaCrans SIMPL`, `Villa Crans Screenshots`, clone `Desktop\Crestronshowcase`.

## Publication

- Site : https://crestrongui.vercel.app — dépôt GitHub `donafcna/Crestronshowcase`, branche `main` ; le projet Vercel `crestrongui` est connecté au repo depuis le 6/9/2026 → **chaque push sur `main` déploie la prod**. Ne plus utiliser `npx vercel --prod`.
- Le proxy Git des sessions Claude refuse ce dépôt : Claude dépose un `showcase.bundle` unique dans `Claude outputs\showcase-sync-0909\`, `watch-showcase.cmd` l'applique et pousse seul (`push-showcase.cmd` en manuel). Git for Windows est installé et dans le PATH sur le PC qui héberge le showcase.
- Dalle / XPanel / CP4 : `deploy.ps1` (vérifie chaque `<script>` par `node --check`, valide le JSON, contrôle le contraste, puis `npx ch5-cli archive` → TSW par pscp/plink → CP4 ; `-Target web` = XPanel + QR codes).

## État au 10–11.09.2026

- Showcase à jour (dernier commit `0933f31`) et `VillaCrans\src` idem, **non compilé pour la dalle** — `deploy.ps1` reste à lancer (v1.0.166).
- Session du 10/9 : Mode normal réorganisé (outils + légende dans la colonne de droite, badge « réduit à N % »), fenêtres Système de sécurité et Réglages agrandies, cohérence des 3 thèmes sur toutes les pages et fenêtres avec contrôle de contraste automatisé (4:1), engrenages et logo Apple TV nets, son caché retiré.
- Reste à faire (`docs/06_TODO.md`) : (1) `deploy.ps1` → 1.0.166 dalle + XPanel + CP4 ; (2) recette sur site, 8 tests de `docs/07_RETOURS_DIRECTION_2026-09-09.md`, point Donatien / Alexandre / Antoine ; (3) P1 C# : try/catch `BuildVillaRoomsDatabase`, joins moteurs pulsés remis à false, presets `i < 10`, gardes `ContainsKey`, nom de preset, borne routage ≥ 1000, sériels 111/112 si voulus.
- TODO site : activer Vercel Web Analytics ; confirmer l'e-mail de contact dans `src/data/company.js` (`info@frequence-tv.ch` = hypothèse) ; remplacer les vignettes Unsplash et vidéos Mixkit par des médias Fréquence TV ; améliorer le simulateur `/interfaces` sur très petit écran (le mode `#demo` est la voie mobile prévue) ; tester le déploiement Apple Store / Play Store.

## Leçon du 5/9/2026

Deux sessions Claude ont livré en parallèle (v2 marketing et mode démo mobile) : l'écrasement mutuel de `App.jsx` / `main.jsx` a cassé la prod (« useRouter must be used within RouterProvider », rollback Vercel). Avant toute livraison : vérifier que le dossier local n'a pas divergé du point de départ, builder et tester.
