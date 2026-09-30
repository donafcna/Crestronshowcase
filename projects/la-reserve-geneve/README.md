# La Réserve Genève — GUI CH5 Bar / Fitness / Lodge

Refonte des trois panneaux VT Pro de La Réserve Genève en CH5 : mêmes commandes, design épuré, trois thèmes au choix
du client (Lac, Nuit, Spa). Le GUI se branche sur les joins des programmes SIMPL existants, sans C#.

- `reserve_config.json` : **source unique** (espaces, sources, pages, groupes, zones, joins, thèmes, `meta.mode`).
- `ch5/src` : `index.html` (dalle, XPanel, iPad), `iphone.html`, `css/reserve.css`, `js/app.js`, `js/bus.js`,
  `js/local-feedback.js` (vitrine seulement), `js/connect.js` (XPanel). `reserve_config.js/json` et `version.js` sont
  générés par `tools/build.py`.
- `tools/build.py` (copie de config, contrat `docs/CONTRAT-JOINS.md`, contrôles), `tools/verifier_smw.py`
  (confronte le JSON aux .smw), `tools/captures-fiche.cjs` (captures du site), `ch5/tools/qa-reserve.cjs` (batterie).
- `references/` : captures Vision Tools des panneaux d'origine. `docs/REMPLACEMENT-VTPRO.md` : mise en service.
- Vitrine : `apps/showcase/scripts/sync-la-reserve-geneve.py` → `apps/showcase/public/showcases/la-reserve-geneve/`.
