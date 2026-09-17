# Vérifications du lot 3D feedback-1 — 17 septembre 2026

Preuves du commit fonctionnel `a62b6a0387e580d7488da1a4415bc7a1cfe8d92e`, publié sur Vercel. Copie sélectionnée des résultats, conservée dans Git ; les captures intermédiaires, copies de travail et logs complets restent dans `Claude outputs/`.

- Site public : 69 contrôles scènes/TV réussis, 11 écrans dégagés sur 6 006 rayons (occultations ouvertes/fermées). Les quatre scènes du Salon et de la Suite parentale suivent les niveaux du GUI, de jour comme de nuit.
- Audio local : 280 contrôles, 15 pièces équipées et 32 enceintes ; mouvement mesuré sur un cycle complet, amplitude selon volume, Mute/OFF/pause.
- Audio public : mouvement, deux volumes, Mute et OFF vérifiés ; aperçu silencieux dans [ondes-audio.webm](ondes-audio.webm).
- Fondu : 23 contrôles de variation linéaire sur 3 secondes, interruptions, nouvelle cible, OFF global et changement de pièce.
- Écrans : contrôles en Mode normal 1280 × 800 et Mode Scène 1920 × 1080. Le rapport normal provient de la passe diagnostique ; ses 22 états comportent chacun 273/273 points dégagés, vérifiés ensuite séparément.
- Fluidité : 56,8 i/s mesurées localement ; 59,5 i/s pendant la courte capture du site public, DPR 1,5. Mesures propres à ce laptop, pas une garantie sur tout appareil.

[Planche avant/après, trois thèmes et quatre scènes](planche-avant-apres.png). Les rapports gardent leurs données d'origine ; leurs chemins absolus décrivent le poste d'essai. `manifest.json` permet de vérifier l'intégrité des copies.

Scripts reproductibles : `apps/showcase/scripts/test-plan3d-room-feedback.cjs`, `test-plan3d-audio.cjs`, `test-plan3d-lighting.cjs`. Le code de la GUI et les programmes matériels n'ont pas été modifiés par ce lot ; aucun transfert vers un appareil.
