# Lot 0.2.0 — configuration commune et supports de démo

17 septembre 2026. GUI : 1.0.181 ; C# inchangé : 1.0.180. Socle de compatibilité : `grand-montana-v4-gui1.0.181-csharp1.0.180`. Ce lot prépare leur réutilisation et corrige une coupure des commandes HVAC découverte pendant la revue des captures.

## Résultat

- Une seule configuration est injectée dans le CH5 et transmise au générateur SIMPL avec `--config`. Une sortie distincte existante est refusée. La génération vérifie que ses entrées n'ont pas changé pendant le traitement ; le fichier de travail reste intact.
- `prepare-project.mjs` compare le contrat au profil versionné, contrôle les empreintes de treize sources du socle (styles partagés inclus), prépare les sources CH5 et une copie SMW, puis écrit un manifeste. Les empreintes du code normalisent uniquement les fins de ligne pour fonctionner sous Windows et Linux. Les empreintes des fichiers de livraison restent calculées sur les octets.
- Le mode `#demo` ne liste que les interfaces prévues pour le téléphone ou la tablette détectés. Un lien incompatible ou inconnu affiche une explication FR/EN/DE avec retour. La bascule téléphone/tablette respecte le catalogue. Les deux commandes flottantes font 44 × 44 px.
- Sur une dalle de 1280 × 800, les commandes de ventilation étaient coupées après l'ajout du conteneur Wellness. Les sélecteurs de marge ciblent désormais ce conteneur et les commandes ON/OFF et ventilation partagent une ligne sur les écrans de faible hauteur. Les cibles restent au moins 44 px de haut ; aucun défilement n'est ajouté. Le style commun est synchronisé dans le Showcase.
- Un exemple Villa Léman à deux pièces utilise exactement les mêmes HTML/JavaScript/C# que Grand Montana. Son CH5Z est assemblé. C'est un pilote de configuration : le simulateur commercial Villa Léman du site reste distinct, sa migration graphique et fonctionnelle n'est pas achevée.
- Le workflow GitHub exécute les tests de configuration/compatibilité, le contrôle du catalogue, le build et le lint. Il ne remplace pas la recette graphique locale ni le banc Crestron ; il n'est pas une protection de branche et ne bloque pas à lui seul le déploiement Vercel.

## Préparer un projet

Modifier une copie du profil, puis fournir le SMW de base adapté au projet. Exemple depuis la racine du dépôt :

```powershell
node tools/quality/prepare-project.mjs --config tools/quality/examples/villa-leman-pilot.json --simpl-input projects/villa-crans/simpl/simpl-windows/VillaCrans_Slot2.smw --out C:/dev/crestron/candidats/leman-nouveau
```

Le dossier doit être neuf. Une préparation interrompue laisse un dossier à examiner ; elle n'efface jamais les sources. Le manifeste racine n'est écrit qu'après réussite de la préparation. `stage-ch5` reste un outil de copie de sources : il vérifie la configuration, mais seul `prepare-project` vérifie également les empreintes du socle et génère SIMPL.

Les nouveaux projets peuvent modifier pièces, noms, langues, circuits/scènes, motorisations et activations dans les limites du validateur. Les joins, sens des signaux, base des blocs, mapping et EISC inter-slots font partie du socle. Leur changement nécessite une révision du code, du profil et des tests.

## Limites découvertes et désormais refusées

- HVAC : le C# impose 16–28 °C par pas de 0,5 °C ; une autre plage écrite seulement dans le JSON divergerait du matériel.
- Wellness : ce socle active sauna et hammam ensemble. Les pas sont fixés à 1 ; les conversions C# de ces paramètres attendent des entiers. Une cabine seule nécessite une évolution coordonnée du socle, pas un simple drapeau JSON.
- Les identifiants des pièces doivent rester continus de 1 à N : la souscription des retours du téléphone utilise encore le nombre de pièces. Garder une pièce désactivée dans la liste au lieu de supprimer son identifiant.
- Les dimensions EISC du SMW limitent les pièces réellement exposables. La génération refuse un dépassement et n'écrit pas le SMW de sortie. Le SMW local utilisé pour les candidats a des capacités plus grandes que la base historique suivie par Git ; celle-ci peut donc être refusée et doit être dimensionnée dans SIMPL Windows.
- Le générateur conserve le câblage et les anciens signaux du SMW fourni. Réduire le profil à deux pièces ne supprime pas les anciens drivers et ne rend pas leur logique automatiquement réutilisable. Le programmeur doit les vérifier et adapter SIMPL.

Le profil de compatibilité est une vérification statique des contraintes connues, pas une preuve exhaustive du runtime. Les erreurs ne recopient pas de codes d'alarme dans les rapports.

## Vérifications réalisées

- 43 tests de configuration, contrat, préparation, conservation des sources, génération SIMPL sur fixture et capacités de démo.
- 49 contrôles navigateur du mode démo : FR/EN/DE × téléphone/tablette, liens non compatibles/inconnus, navigation, bascule, dimensions tactiles et console.
- 28 contrôles du pilote : deux pièces construites dans les menus, mode déploiement, absence de simulation, trois supports × trois thèmes, visibilité effective et dimensions des six commandes HVAC, absence de débordement de page, console. Les 19 premiers contrôles ne détectaient pas la coupure interne de la carte ; la revue visuelle a déclenché la correction et les neuf assertions supplémentaires.
- 555 contrôles HVAC et 632 Wellness sur la GUI 1.0.181 : deux matrices de 36 combinaisons de thèmes/supports/modes, plus les retours natifs CH5. Les premiers essais en parallèle ont expiré pendant une capture et un chargement ; les reprises complètes isolées ont réussi. Aucun texte sous 4:1 dans le contrôle des trois thèmes, pages/modales et états d'alarme.
- 32 chargements du catalogue couvrent les 17 simulateurs avec le registre commun et la démo filtrée.
- 76 contrôles HVAC et 53 Wellness sur la copie SMW Alexandre générée.
- Build et lint réussis ; avertissements préexistants du dépôt conservés.

Le test du pilote neutralise WebXPanel et bloque les requêtes externes. Il vérifie le chargement du profil, pas les retours de matériel. Les planches du mode démo portent sur sa propre interface à thème fixe ; les écrans des 17 simulateurs ne sont pas redessinés dans ce lot.

## Quatre artefacts et prochaine étape

| Élément | État du lot |
|---|---|
| CH5Z | Bêta Alexandre et pilote Villa Léman assemblés en 1.0.181 ; non qualifiés pour installation |
| CPZ slot 1 | C# inchangé ; candidat 1.0.180 du lot précédent, aucune nouvelle compilation revendiquée |
| LPZ slot 2 | Sources SMW préparées ; compilation et adaptation des drivers encore requises |
| Showcase | Registre commun et démo corrigés ; publication et vérification consignées dans le bilan de livraison |

SIMPL est installé sur le PC. Aucune commande de compilation LPZ automatisée documentée n'a été confirmée dans cette session. Les consignes officielles de compilation dans l'application restent la référence : [SIMPL Windows, bonnes pratiques Crestron](https://www.crestron.com/getmedia/47fc23f4-da1a-4d8e-9bef-577b411e5430/mg_bp_simpl_windows). Aucun équipement n'a été contacté.

La suite matérielle reste : compiler le LPZ à partir du SMW adapté, vérifier les retours réels et le routage multi-écrans dans Debugger, puis geler le jeu CH5Z/CPZ/LPZ/config. La suite du pilote porte sur l'alignement graphique, les composants partagés et la couverture des fonctions de Villa Léman, puis Home Cinéma Cologny.
