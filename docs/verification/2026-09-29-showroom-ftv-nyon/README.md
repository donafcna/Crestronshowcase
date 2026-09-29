# Showroom FTV Nyon 1.0.0 — preuves du 29.09.2026

- `planche-dalle-A.jpg`, `planche-dalle-B.jpg` : photo réelle de la dalle du showroom ↔ GUI recréé (dalle 1280×800), thèmes Sombre / Clair / Verre dépoli en colonnes, 18 écrans.
- `planche-iphone.jpg` : GUI iPhone 440×863, 8 écrans × 3 thèmes.
- `batterie-gui-vitrine.md` : `ch5/tools/qa-showroom.cjs` sur la vitrine, 720/720 (6 châssis × 3 thèmes × 40 écrans et états).
- `batterie-gui-deploiement.md` : même batterie sur `ch5/src` en mode déploiement (sans processeur), 540/540 (états dynamiques non applicables).
- `batterie-site-modes.md` : `apps/showcase/scripts/test-showroom-ftv-nyon-modes.cjs`, 177/177.
- Parité C# slot 1 ↔ vitrine : `node tools/parity/parity.js`, 5 séquences, 0 écart.
