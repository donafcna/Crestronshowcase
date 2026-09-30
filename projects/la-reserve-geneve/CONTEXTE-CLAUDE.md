# La Réserve Genève — contexte de reprise (< 150 lignes)

Mis à jour le 30.09.2026 (v1.0.2 : « iPod » renommé « Lecteur radio » avec icône lecteur audio, alias de retour `aliasRetour`).

## Ce que c'est
Refonte en CH5 des trois panneaux VT Pro (iPad, Crestron App) de La Réserve Genève — Bar, Fitness, Lodge — pour la
sonorisation Bose. Demande de Donatien : mêmes boutons, design moderne et épuré, 3 thèmes que le client choisit dans
le GUI, section Hôtellerie du site, versions dalle / XPanel / iPad / iPhone. Captures d'origine : `references/`
(copie de `C:\Users\donat\Desktop\Reserve Bar\_CH5`). Programmes source : même dossier Desktop (non versionné).

## Décisions validées par Donatien (30.09)
1. Les 3 thèmes (Lac clair/bronze, Nuit anthracite/cuivre, Spa sable/sauge), choix du client dans Réglages.
2. Backend : GUI mappé sur les joins des programmes SIMPL existants, **sans C#** ; il remplace le panneau VT Pro.
3. Nom « La Réserve Genève » en typographie (pas le logo image), statut Réalisation. Site pas encore public
   (montré à un collègue).

## Architecture
- `reserve_config.json` = source unique ; `tools/build.py [--espace x] [--mode y]` écrit `ch5/src/reserve_config.{js,json}`,
  `version.js`, `docs/CONTRAT-JOINS.md`. Un CH5 par espace (`deploy.ps1`), espace figé dans la config embarquée ;
  `?espace=` le change (vitrine : sélecteur visible, recharge la page).
- `js/bus.js` : `Bus.press` (impulsion), `Bus.set` (maintien Vol ±), `Bus.on/get` ; déploiement = CrComLib,
  vitrine = `js/local-feedback.js` (réplique du comportement SIMPL vu du panneau).
- `js/app.js` : rendu par chaînes HTML, mises à jour ciblées des niveaux (rampes 120 ms) pour ne pas refaire le DOM
  sous le doigt ; `window.Reserve` (ready, state, go, setPage) et `window.changeTheme` pour les tests.
- Unités « u » : tablette min(l/1280, h/800), smartphone min(l/440, h/863). Couleurs par jetons de thème uniquement ;
  seule exception : aperçus des thèmes dans Réglages (couleurs lues dans `themes[].apercu` du JSON).
- Sources : l'original passait par le smart object 1 → déplacées sur des joins libres du panneau, seule modif SIMPL
  (`docs/REMPLACEMENT-VTPRO.md`). `tools/verifier_smw.py "<dossier Reserve Bar>"` confronte le JSON aux .smw.

## Pièges
- Smartphone Sous-sol du Bar (8 zones, 5 groupes) tient au pixel près en 440×863 : ne pas grossir les lignes
  (44 u = cible minimale à 402 px de large). La batterie contrôle que chaque bloc reste dans l'écran.
- Batterie : attendre la fin d'une extinction simulée (3,2 s) avant l'écran suivant, sinon faux contraste.
- Démo automatique du site : Réglages, Fermer, Tout éteindre et sélecteur d'espace exclus (classes / data-demo-ignore).

## Côté site
`apps/showcase/scripts/sync-la-reserve-geneve.py`, `scripts/test-la-reserve-geneve-modes.cjs`, `src/data/projects.js`
(secteur hotellerie, après Hotel Brassus), `src/data/sheets/la-reserve-geneve.js`, `public/sheets/la-reserve-geneve/`,
`public/showcases/la-reserve-geneve/` (généré).

## À faire ensuite
1. Donatien : relire la planche `docs/verification/2026-09-30/`, trancher les décisions par défaut du CHANGELOG.
2. Debugger : confirmer Le Loft / Le Loft Fond, l'échelle des niveaux, la version réelle du programme Fitness.
3. SIMPL : câbler les sources sur les joins du panneau, compiler ; PC : `npm install`, `deploy.ps1`, charger les CH5.
