# Villa Stark — châssis et fond synchronisés

Correction du 25/11/2026. Le fond photographique animé est un iframe autonome à la taille du site ; le GUI seul est dans le DeviceFrame commun. Aucun panneau photographique supplémentaire dans les châssis.

## Vérifications de cette session
- TSW / XPanel / iPad / iPhone × Sombre / Clair / Verre : douze captures et lecture du thème effectivement appliqué au GUI.
- Mode Scène iPad accessible ; état Mon film conservé du téléphone à l’iPad.
- Éclairage BLEU Salon : calque du fond #3C7CFF, opacité 0,92.
- Scénario Je reçois : store Suite parentale du fond scaleY(1).
- Visiteur : élément du fond `visitor here ringing`.
- Mon film : Apple TV présente dans la baie du cinéma du fond.
- Accueil iPhone : contenu 755 px pour une zone de 755 px, sans débordement. Navigation inférieure toujours visible ; pages détaillées utilisent un défilement interne.
- Aucune erreur console constatée pendant les essais. Build Vite et lint réussis ; avertissements préexistants uniquement.

## Architecture et limites
Un canal BroadcastChannel aléatoire par instance de Showcase assure les échanges sans mélange entre onglets. Le GUI publie l’état et le conserve en sessionStorage pour le remontage lors d’un changement de châssis. Le fond relaie les interactions pièce/store vers le GUI. Les courses de stores en cours reprennent depuis la position enregistrée après remontage ; la durée restante est recalculée sur le nouveau support. Les thèmes et événements de démonstration sont commandés depuis la colonne de droite. La route GUI seule et le lecteur mobile n’affichent volontairement pas de fond de site.

Aucune interaction avec du matériel réel. La fiche FR/EN/DE conserve ses contenus et ses trois captures ont été actualisées. La matrice ne constitue pas un audit exhaustif de contraste de tous les états.
