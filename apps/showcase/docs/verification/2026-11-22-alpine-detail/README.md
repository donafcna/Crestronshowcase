# A10 — réalisme alpin, 22 novembre 2026

## Neige
Relief de terrain affiné (76 171 sommets), accumulation déterministe selon la pente et le vent, affleurements rocheux, grain de poudreuse, variation de rugosité des cristaux, traces de skis et stries de damage. Les microdétails sont atténués à distance pour limiter le scintillement. 620 sapins comportent chacun 42 rameaux retombants avec une couche de neige distincte. Toiture enneigée, glaçons aux débords, pelouses couvertes et arbres caducs sans feuillage. L'épaisseur du manteau est représentative, sans simulation météorologique.

## Rivière
Deux écoulements continus du lac vers la vallée ; profils hydrauliques descendants conservés. Eau animée avec rides longitudinales, variations de profondeur apparente, reflets de Fresnel, écume fragmentée et rapides renforcés dans la pente. Quatre berges avec lèvres de neige, galets répartis irrégulièrement, calottes de neige et glace partiellement transparente. Reflets du ciel et du relief approximés dans le matériau, sans passe de réflexion planaire coûteuse. Les berges rejoignent le terrain en dessous de sa surface pour éviter une bordure coplanaire.

## Vérification
- Build et lint avec npm ci et le verrou de dépendances du dépôt : réussis ; avertissements existants du lint.
- test-alpine-detail.cjs : compilation des shaders sans erreur, animation visible dans deux rendus de la même caméra, jour/nuit, continuité descendante, maintien du paysage non hivernal de Villa Crans. Résultats et durée mesurée dans results.json.
- test-a10-plan-sync.cjs : 100 circuits, 100 luminaires, 34 moteurs, arrêt intermédiaire, fermeture complète et trois thèmes : réussis, aucune exception.
- Matrice visuelle avant/après : trois thèmes × normal/Scène × jour/nuit, 24 captures. Planche index.html ; les deux versions ont été capturées dans cette session. Plein écran smartphone non applicable ; les autres châssis ne présentent pas ce fond 3D selon les règles actuelles.
- Mesure indicative Chrome à 1908 × 1014 : médiane avant 22,9 ms, après 24,1 ms ; p95 autour de 32 ms. Chargement prêt en environ 3,6 s lors de cette mesure. Environ 964 000 triangles, 150 appels de dessin ; géométrie des sapins et galets instanciée, aucune texture distante ajoutée. Ces mesures ne garantissent pas les performances sur tout appareil.

Le lot concerne le showcase A10. GUI, programmes matériels, catalogue de circuits et contrat de motorisations préservés. Les autres projets conservent leurs matériaux et leur eau d'origine.
