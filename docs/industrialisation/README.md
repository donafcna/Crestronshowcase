# Crestron Showcase — industrialisation

**Dernier lot : 0.2.0.** Voir `LOT-0.2.0.md` pour la préparation commune CH5/SIMPL, la compatibilité avec le socle C#, les supports du mode démo et le pilote Villa Léman. La recette matérielle reste à effectuer. Le reste de ce document décrit le lot initial 0.1.0.

17 septembre 2026. Demande de Donatien : poursuivre « Papoter ensemble », prendre Villa Grand Montana comme flagship, stabiliser la V1 et préparer une bêta pour Alexandre avant généralisation. Le nom technique existant reste `villa-crans` / `villa-gemini-frequencetv` ; aucun renommage de joins, chemins ou projet matériel n'est implicite.

## Ce lot apporte

- Configuration source et configuration embarquée réalignées en 1.0.180 ; préparation reproductible dans un dossier neuf, sans incrément de version ni déploiement.
- Correction ciblée du contexte de pièce EISC : les commandes sources, scènes, stores, télécommandes et niveaux rétablissent a10 depuis l'écran émetteur. Auparavant ce rafraîchissement couvrait seulement HVAC/Wellness. Le vrai corps de méthode C# a reproduit le défaut, puis passé 22 scénarios après correction.
- Un registre commun des 17 simulateurs React, utilisé par Showcase et DemoMode. Le build refuse les entrées manquantes ; disparition du repli silencieux vers une autre villa.
- Validateur de configuration et contrat v4, audit avec empreintes, export de joins JSON/CSV, préparation d'un profil neutre pour le banc Alexandre.
- CH5Z et CPZ candidats produits ; SMW généré séparément et contrôlé. LPZ non compilé et installation physique non réalisée dans ce lot.

La version **outillage** est 0.1.0. Les sources GUI et l'assembly C# portent 1.0.180, version déjà en cours dans l'autre tâche. Le candidat a un identifiant de lot et des empreintes propres : ce n'est pas une nouvelle V1 déclarée stable, ni une preuve de la version installée.

## Commandes reproductibles

Depuis PowerShell, chemins absolus ; ces commandes n'accèdent à aucun équipement :

```powershell
node --test "C:/dev/crestron/repo/tools/quality/quality.test.mjs"
node "C:/dev/crestron/repo/apps/showcase/scripts/check-catalogue.mjs"
node "C:/dev/crestron/repo/tools/quality/validate-config.mjs" "C:/dev/crestron/repo/projects/villa-crans/ch5/villa_config.json"
node "C:/dev/crestron/repo/tools/quality/audit.mjs" --out "C:/dev/crestron/qa-nouvelle-execution"
& "C:/dev/crestron/repo/tools/quality/reproduce-routing.ps1" -Output "C:/dev/crestron/routage-nouvelle-execution.json"
```

Choisir un dossier de preuves neuf à chaque audit. Le code de sortie de l'audit signale les échecs ; un état `unverified` empêche toujours `releaseReady=true`. L'audit du dépôt de développement peut refuser la livraison client à cause du repli alarme volontairement conservé dans ce profil. Le profil de banc exporté le vide sans modifier la configuration physique source.

```powershell
node "C:/dev/crestron/repo/tools/quality/prepare-beta-config.mjs" "C:/dev/crestron/beta-nouvelle/villa_config.json"
node "C:/dev/crestron/repo/tools/quality/stage-ch5.mjs" --config "C:/dev/crestron/beta-nouvelle/villa_config.json" --out "C:/dev/crestron/candidat-nouveau"
```

Le programmeur modifie la configuration **de son projet**, puis SIMPL. `stage-ch5` injecte exactement cette configuration dans le CH5. Son succès signifie « source préparée », pas « processeur compatible » ni « livraison qualifiée ». Le contrat, les limites de capacité, le C# et les tests doivent correspondre au même lot.

## Documents de référence

- `ARCHITECTURE.md` : socle actuel, cible, compatibilité, risques multi-écrans.
- `DESIGN-SYSTEM.md` : règles capitalisées et critères vérifiables.
- `BETA-ALEXANDRE.md` : recette de prise en main et conditions de sortie.
- `MIGRATIONS.md` : inventaire réel et ordre des 17 migrations.

## Limites et continuité

Une autre tâche modifie simultanément le décor 3D, Wellness et les fichiers associés. Les tests portent sur les snapshots indiqués dans leurs rapports ; ne pas attribuer leurs résultats à des changements ultérieurs. Ne pas publier un lot mêlant des changements non vérifiés. Le dépôt contient déjà de nombreuses modifications locales ; aucun `git add .` ni nettoyage global.

Pour poursuivre : finir la recette multi-écrans avec Debugger, obtenir le LPZ correspondant, compléter la matrice graphique des pages/états non couverts (notamment Wellness), puis geler les quatre artefacts. Seulement après ce gel, commencer les deux pilotes de réutilisation. Les dix-sept interfaces ne sont pas déclarées converties par ce lot.
