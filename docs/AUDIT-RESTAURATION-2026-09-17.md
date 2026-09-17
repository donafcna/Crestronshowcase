# Audit de récupération après perte du laptop — 17/09/2026

**Conclusion : sauvegarde des sources confirmée, restauration intégrale à l'identique non garantie.** Les messages précédents « tout est sauvegardé » concernaient les fichiers suivis et non ignorés du dépôt. Ils ne couvrent pas tous les fichiers du laptop, les logiciels installés et les accès externes.

## Vérifié maintenant

- GitHub main : `1e97f312d1fc4a51c7a2b9d12e462846d2cc2919` au début de l'audit ; site, sources, tests, documentation et preuve des 156 contrôles publics.
- GitHub `backup/crestron-local-2026-09-17` : `0ca2b6c47d948466cbb8829ee77f6d7dd1e5f988` ; instantané des modifications locales Crestron, incluant le CH5Z déjà suivi, QR, sources et autosauvegardes SIMPL, suppressions locales.
- Comparaison par un index Git temporaire : tous les fichiers actuels suivis et non ignorés correspondent à l'instantané, excepté les deux notes de pause ajoutées ensuite et déjà présentes sur main. Aucun index de travail ni fichier source modifié par l'audit.
- Source `Project_Slot2.smw`, configuration canonique et manifestes de dépendances npm/NuGet présents dans Git.

## Pourquoi davantage de dossiers sur le PC

L'inventaire des fichiers ignorés du dépôt compte 22 676 fichiers, environ 1,95 Gio. Majorité : `Claude outputs/` (1 644 Mio de captures, essais, livraisons et archives), `node_modules/`, sorties du site `dist/`, sorties Visual Studio `bin/obj`. Git ne stocke pas les dossiers vides. Le site GitHub montre normalement main ; les ajouts spécifiques de la sauvegarde doivent être consultés sur sa branche.

Les dépendances et sorties générées peuvent généralement être recréées depuis les sources et manifestes, sous réserve de disposer des outils et paquets correspondants. Toutes les archives de `Claude outputs/` ne doivent pas être assimilées à des fichiers dispensables : certaines contiennent des livraisons compilées à préserver séparément.

## Lacunes concrètes pour une restauration immédiate

Deux fichiers prêts au chargement sont présents sur ce PC mais absents de main et de la branche de sauvegarde (extensions ignorées) :

| Fichier | Octets | SHA-256 local |
| --- | ---: | --- |
| `projects/villa-crans/ch5/Backend/Backend/bin/Debug/Villaftv.cpz` | 10356489 | `a5980744379e9b66992aaf86001d204b18725807960780f285466deac0aaa9fc` |
| `projects/villa-crans/simpl/simpl-windows/Project_Slot2.lpz` | 26881 | `4076063fa2a88e6ea0f05680e2fd6c7376ce0c50c6b9478d746dc1b1322bef37` |

- `projects/villa-crans/ch5/deploy.secrets.psd1` : fichier local de déploiement explicitement ignoré. Contenu non exposé par cet audit ; prévoir une sauvegarde chiffrée séparée des accès.
- Installation Windows, SIMPL Windows, Visual Studio/MSBuild, outils et SDK Crestron : un clone Git ne réinstalle pas ces logiciels. Le projet C# référence le SDK 2.21.274 et des cibles MSBuild/NuGet.
- Accès GitHub/Vercel/Crestron, réglages externes des comptes, éventuels certificats/licences et état des équipements : non restaurés automatiquement par Git ; inventaire détaillé non réalisé.
- Dossiers hors `C:/dev/crestron/repo` : non couverts par ce dépôt. Présence constatée de `C:/dev/crestron/builds` et `release-rooms-1`, sans prétendre en avoir audité tout le contenu. Ne pas accéder à PortalVie.

## Ce qui reste à sécuriser

1. Conserver hors du laptop une archive complète des livraisons retenues (CH5Z, CPZ, LPZ, source/configuration correspondantes et empreintes).
2. Sauvegarder séparément et de façon chiffrée les accès nécessaires ; pas de secrets dans le Git du site.
3. Documenter les versions et l'installation de l'environnement Windows Crestron et le raccordement du site à son hébergement.
4. Faire une restauration d'essai dans un environnement vierge, puis vérifier compilation, affichage et, séparément, fonctionnement matériel.

Le site web est redéployable sur un hébergement compatible après reconstruction/configuration. Reproduire tout le poste Crestron sur « n'importe quel serveur » n'est pas garanti : un environnement Windows compatible est requis pour les outils actuels. Aucun essai de restauration intégrale sur une machine vierge n'a été réalisé dans cet audit. Le projet fonctionnel reste en pause ; aucune nouvelle fonctionnalité ni livraison matérielle effectuée.
