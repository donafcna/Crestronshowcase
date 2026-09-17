# Recette des parcours guidés — 17 septembre 2026

Lot journey-1, site Showcase uniquement. Validation locale réalisée sur ce laptop, publication Vercel vérifiée ci-dessous.

- `results.json` : 34 contrôles Villa Crans (jour/nuit, moteurs, sources, volume réellement transmis, cycle Smartphone/TSW et priorité manuelle).
- `react/results.json` : 122 contrôles sur cinq parcours (trois pièces chacun). Deux supports FTV Home, Villa Nyon desktop, Villa Léman tablette, Appartement Carouge tablette.
- `fades/lighting-results.json` : 23 contrôles, notamment interruption et durée linéaire de trois secondes.
- `contrast/results.json` : 18 contrôles jour/nuit et occultations. Le plan reste lisible en OFF, les lampes sont éteintes.
- `sheets/results.json` : 8 contrôles de volume, cibles tactiles et fiches FR/EN/DE.
- `visuals/results.json` : deux contrôles et captures trois thèmes × normal/Scène. [Planche avant/après](comparaison.html).

Le cycle complet remplace l'ancien changement de pièce toutes les cinq secondes. Les durées Smartphone 60 s et TSW 10 s sont minimales : une pièce n'est pas abandonnée avant l'arrêt A/V. Les simulateurs sans Apple TV/IPTV démontrent les sources réellement disponibles ; les lecteurs purement audio utilisent Pause.

Aucune nouvelle ressource 3D ou vidéo, aucune sortie sonore. FTV Home : thèmes clair/sombre existants ; verre dépoli non disponible. Les commandes CH5 sources, configurations physiques et programmes SIMPL ne sont pas modifiés. Les modifications locales matérielles préexistantes sont exclues de ce commit.

Le lot F1 est seulement noté dans la [TODO Showcase](../../../apps/showcase/docs/TODO-SHOWCASE.md).


Publication vérifiée : **74cd4a41**, main → Vercel. Quatre ressources publiques identiques aux octets Git ; **34 contrôles Villa Crans et 122 contrôles React réussis sur le site public**, soit 156. Cycle jour/nuit, deux passages Smartphone et TSW, sources et volume réels, arrêt A/V, priorité manuelle et minimum de visibilité confirmés. Aucun nouveau défaut navigateur ; messages préexistants du TSW séparés. Preuves `production/`, `production-react/` et `production-assets.json` dans `docs/verification/2026-09-17-journey-1/`. Aucun matériel déployé. La TODO F1 est enregistrée sans réalisation.
