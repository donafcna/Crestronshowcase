# Visite résidentielle Villa Crans — tour-1

Publié sur https://crestrongui.vercel.app et vérifié le 17 septembre 2026.
Version fonctionnelle finale : `b1de7af08556e9233cffa7353c98cebd595a7257`.
Implémentation initiale : `5192b5cb8a7c5b74b1f82ee0f8b2b0d8cd4ff3f3`.

- Smartphone : vue globale 3 s, pièces aléatoires toutes les 5 s, durée totale 60 s.
- TSW : 10 s après chargement, puis nouvelle visite Smartphone.
- Crépuscule : Cinéma dans 17 pièces, rideaux fermés. Aube : OFF, rideaux ouverts.
- Contrôle manuel prioritaire ; aucun changement aux programmes matériels.

## Preuves

- `production-results.json` : 34 contrôles réussis sur le site public final, événements de sélection et captures échantillonnées horodatés ; aucune nouvelle erreur. Les sélections sont mesurées avant le rendu synchrone.
- `production-assets.json` : moteur 3D et feedback local servis identiques aux octets Git. Ces fichiers sont inchangés entre les deux commits.
- `production-bundle.json` : bundle React final publié avec le plafonnement des attentes du curseur à la prochaine sélection.
- `local-results.json` : contrôles locaux sur la version initiale (34 cycle, 23 fondus, 27 navigation, 4 reprise/menu/autre projet).
- `deadlines-local.json` : six sélections à 3, 8, 13, 18, 23 et 28 secondes sur la version finale.
- `overview.png`, `night.png`, `day.png` : captures du site public final.
- [Comparatif avant/après, trois thèmes](comparison/index.html) : production précédente comparée à la version locale initiale. Le correctif final modifie uniquement le chronométrage du curseur.

Le premier contrôle public a détecté une attente du curseur pouvant prolonger une visite après un ralentissement ; corrigée dans b1de7af0 puis cycle complet public repassé avec succès. Les deux messages TSW WebXPanel/SVG sont préexistants et consignés séparément. Les mesures de cadence dépendent de la pièce, du mode et de la charge de ce laptop ; ce ne sont pas des garanties tous appareils. Les captures de thèmes et rapports locaux détaillés restent dans `Claude outputs/villa-tour/` sur le poste. Source GUI, JSON physique, SIMPL# et SIMPL Windows inchangés par ce lot ; aucun transfert matériel.
