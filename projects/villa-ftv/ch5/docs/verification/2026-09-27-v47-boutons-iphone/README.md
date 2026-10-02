# v4.7 — 27/09/2026 — conversion des derniers `<ch5-button>` à état de l'iPhone

Batterie `tools/qa-v47.mjs` (Chromium/Playwright) : 3 thèmes × {fenêtre Circuits, HVAC, Sauna, Hammam} × états
(repos, chaque bouton sélectionné, scènes mémorisées) — 69 contrôles par passe. Contraste ≥ 4:1, cibles ≥ 40 px,
0 texte tronqué / hors cadre, 0 scroll horizontal, 0 erreur console (artefact du banc `panelInstance.initialize`
exclu, identique avant/après). Chaîne appui → état vérifiée par un pont natif factice (`JSInterface`) et
`CrComLib.bridgeReceiveBooleanFromNative`.

| Passe | Résultat |
|---|---|
| avant (v4.6), iPhone 16 Pro 402×874 | 64/69 — 4 scènes sélectionnées + scènes mémorisées à 3,31:1 en thème Clair |
| avant (v4.6), iPhone 18 Pro Max 440×956 | 64/69 — idem |
| après (v4.7), iPhone 16 Pro, mode déploiement | **69/69 VERT** |
| après (v4.7), iPhone 18 Pro Max, mode déploiement | **69/69 VERT** |
| après (v4.7), iPhone 16 Pro, mode showcase (local-feedback) | **69/69 VERT** + interlocks scènes / HVAC / ventilation vérifiés |

Relancer : `node tools/serve_src.mjs src 4179` puis `node tools/qa-v47.mjs iphone.html <dossier> [--w 440 --h 956]`.
Aucun binaire compilé ni déployé dans ce lot ; recette matérielle à faire après `deploy.ps1 -Target web|tsw|mobile`.
