# Généralisation du Showcase

Audit du 17/09/2026 : 18 interfaces dans 8 secteurs, dont une GUI CH5 embarquée et 17 simulateurs React. Dix-huit fiches FR/EN/DE et 173 images référencées sont présentes ; présence ne signifie pas actualité graphique.

| Vague | Interfaces | Démonstration attendue |
|---|---|---|
| 0 | Grand Montana / Villa Crans-Montana | V1 gelée, bêta autonome, quatre artefacts traçables |
| 1 | Villa Léman, Home Cinéma Cologny | Deux projets adaptés par configuration, mêmes commandes/retours et composants communs |
| 2 | Villa Nyon, Chalet Zermatt, Eaux-Vives, Carouge, FTV Home | Résidentiel sans divergence de logique ; traductions et thèmes cohérents |
| 3 | Suite Palace Montreux, Palace Genève | Configurations invité/personnel et DND/MUR documentées ; retours par chambre |
| 4 | MY Sunrise | Ponts/zones, audio/lumières/DMX ; supports déclarés réellement testés |
| 5 | Boutique Luxe Genève, Sushi Bar Kyoto | Ambiances et zones configurables, identité propre sans données de marque incohérentes |
| 6 | Huddle Nyon, Siège Lakeside, Boardroom, Auditorium, Club L'Étoile | Modules de réunion, routage AV, PTZ et DMX versionnés |

## Écarts avant migration

- Huit simulateurs n'emploient pas le contexte de traduction dynamique du site.
- Les états métier restent locaux à chaque simulateur ; aucun des 17 n'emploie actuellement le transport CH5 du flagship.
- Thèmes non unifiés : Auditorium utilise encore Cyberpunk ; FTV Home n'a que clair/sombre.
- Villa Léman contient des boutons CSS de 36 px et une zone défilante : mesurer au navigateur avant correction systémique.
- `#demo` filtre désormais téléphone/tablette selon les supports déclarés (lot 0.2.0). Les liens incompatibles/inconnus et le changement de support ont été testés en FR/EN/DE.
- Le registre dupliqué et son repli silencieux ont été corrigés dans le lot 0.1.0 ; 32 chargements catalogue/démo ont été testés après modification.

## Condition de passage d'une vague

Une configuration exemple et un contrat explicite, aucune branche métier spécifique dans le core pour un simple changement de nom/pièce, fonctions déclarées plutôt que supposées d'après le secteur, parcours métier et matrice graphique réussis, fiches/captures mises à jour, vérification sur matériel si vendu comme GUI déployable.

Les styles sectoriels doivent rester reconnaissables. Généraliser la qualité et les composants ne signifie pas transformer un yacht, un restaurant et un hôtel en copies visuelles de la villa.

## Avancement du pilote, lot 0.2.0

Un profil Villa Léman à deux pièces a été préparé avec les sources Grand Montana inchangées : CH5Z assemblé, SMW généré depuis ce même JSON, chargement vérifié sur trois supports et trois thèmes. Il démontre la préparation par configuration ; il ne remplace pas le simulateur Villa Léman du catalogue et ne clôt pas sa migration. Le gel matériel de la V1 reste un préalable à la mise en service, mais cette préparation isolée permet de vérifier dès maintenant les limites de réutilisation. Voir `LOT-0.2.0.md`.
