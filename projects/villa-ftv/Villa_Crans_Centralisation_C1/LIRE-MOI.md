# Correctif Centralisation iPhone — candidat C1

Identifiant : **CENT-20260921-1**. Préparé le 21 septembre 2026 à partir des deux fichiers transmis : `iphone.html` et `ControlSystem.cs`.

Les défauts de routage et de mesure sont corrigés dans ces sources. La disparition du retard sur l'iPhone doit encore être vérifiée sur le CP4. Aucun équipement n'a été contacté et aucun binaire CPZ/CH5Z n'a été compilé ici.

## Ce que contient le paquet

- Les deux sources corrigées dans `sources/ch5/`, à installer dans le sous-dossier `ch5/` du projet.
- `CHANGEMENTS.diff` : différences exactes, hors conversion des fins de ligne.
- `Installer-Correctif.ps1` : contrôle des empreintes des deux sources, sauvegarde puis remplacement. Il s'arrête avant tout remplacement si un fichier a changé depuis son envoi à ChatGPT.
- `Deployer-Correctif.ps1` : commandes séparées GUI / CP4 / TSW, avec contrôle du candidat installé et de la cible CP4.
- `manifest.json` et `verification/` : empreintes et vérifications reproductibles.

## Installation sur le PC

Le message PowerShell « l'argument du paramètre -File n'existe pas » venait du chemin : le ZIP avait été extrait sur le Bureau, mais la commande cherchait le script dans un autre dossier. Le script n'avait pas été exécuté.

Cette édition du paquet place les scripts, les sources et les sauvegardes sous le dossier du projet. Les deux sources C1 sont identiques à celles du premier ZIP ; seule l'organisation du paquet et de son installation change.

Enregistrer le **nouveau ZIP** ici, avec exactement ce nom :

```text
C:\dev\crestron\repo\projects\villa-crans\Villa_Crans_Centralisation_C1.zip
```

Dans **PowerShell**, extraire le paquet avec cette commande complète. Elle crée directement le bon sous-dossier ; ne pas ajouter un deuxième dossier du même nom :

```powershell
Expand-Archive -LiteralPath "C:\dev\crestron\repo\projects\villa-crans\Villa_Crans_Centralisation_C1.zip" -DestinationPath "C:\dev\crestron\repo\projects\villa-crans" -Force -ErrorAction Stop
```

Le script doit alors être à cet emplacement :

```text
C:\dev\crestron\repo\projects\villa-crans\Villa_Crans_Centralisation_C1\Installer-Correctif.ps1
```

Fermer toute édition concurrente de ces deux sources dans Claude/Visual Studio pendant leur remplacement. Ouvrir **PowerShell**, puis coller la commande complète :

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File "C:\dev\crestron\repo\projects\villa-crans\Villa_Crans_Centralisation_C1\Installer-Correctif.ps1" -ProjectRoot "C:\dev\crestron\repo\projects\villa-crans"
```

Les sources de travail restent dans `ch5/src/iphone.html` et `ch5/Backend/Backend/ControlSystem.cs`. L’extraction seule ne remplace pas ces sources : seul l’installateur le fait, après sauvegarde et contrôle. La sauvegarde est créée dans `C:\dev\crestron\repo\projects\villa-crans\_backups\centralisation-C1-<date-heure>`. Son chemin exact est affiché. Les fichiers uploadés d'origine ne sont pas modifiés par ce paquet. Si le contrôle d'empreinte refuse le remplacement, conserver les nouveaux fichiers locaux et intégrer le diff dans ces nouvelles versions ; ne pas supprimer le contrôle pour forcer une ancienne version.

## Compilation et déploiement

| Artefact | Action pour C1 |
|---|---|
| C# / CPZ slot 1 | **Recompiler**, puis envoyer le nouveau CPZ |
| CH5 / iPhone | **Recompiler le CH5**, puis déployer la cible web |
| TSW | Pour la recette des trois supports : envoyer la même archive, sans deuxième build |
| SIMPL / LPZ slot 2 | Aucun changement dans ce correctif ; conserver le LPZ de la recette en cours |
| Configuration / presets | Aucun fichier de configuration fourni ou modifié ; `deploy.ps1 -Target cp4` retransmet toutefois la configuration locale, selon son fonctionnement existant |
| Vitrine Vercel | Aucun push ni déploiement ; ne pas copier ce paquet dans les dossiers de vitrine |

**1. Recompiler le C#.** Ouvrir la solution avec cette commande :

```powershell
Start-Process -FilePath "C:\dev\crestron\repo\projects\villa-crans\ch5\Backend\Villaftv.sln"
```

Dans l'environnement Visual Studio équipé de SIMPL# Pro, choisir **Debug**, puis **Générer → Régénérer la solution**. Vérifier le succès de la compilation et la création de :

```text
C:\dev\crestron\repo\projects\villa-crans\ch5\Backend\Backend\bin\Debug\Villaftv.cpz
```

**2. Envoyer ce CPZ au CP4.**

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File "C:\dev\crestron\repo\projects\villa-crans\Villa_Crans_Centralisation_C1\Deployer-Correctif.ps1" -Etape cp4 -ProjectRoot "C:\dev\crestron\repo\projects\villa-crans" -CP4Host 192.168.1.200
```

Le programme redémarre. Dans la console CP4, vérifier cette ligne :

```text
CENT-20260921-1: impulsions moteurs EISC uniquement; diagnostic C1.
```

L'horodatage du CPZ est contrôlé avant l'envoi, mais seul ce marqueur de démarrage confirme ce correctif chargé. `AssemblyInfo.cs` n'étant pas dans les fichiers transmis, le numéro de version d'assembly n'a pas été modifié par C1.

Le `deploy.ps1` examiné applique `-CP4Host` à la cible **web seulement**. Pour **cp4**, il utilise l'adresse de `deploy.secrets.psd1`. Le wrapper refuse donc l'envoi si cette adresse ne correspond pas à `192.168.1.200`, sans afficher les identifiants. Il ne modifie pas `deploy.ps1`.

**3. Compiler le CH5 et envoyer la GUI web iPhone / XPanel.**

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File "C:\dev\crestron\repo\projects\villa-crans\Villa_Crans_Centralisation_C1\Deployer-Correctif.ps1" -Etape gui -ProjectRoot "C:\dev\crestron\repo\projects\villa-crans" -CP4Host 192.168.1.200
```

Le script existant exécute ses contrôles et incrémente la version CH5. Il peut demander les identifiants SFTP du CP4. Aucun numéro CH5 futur n'est supposé dans ce paquet.

**4. Envoyer la même archive sur la TSW pour comparer les supports.**

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File "C:\dev\crestron\repo\projects\villa-crans\Villa_Crans_Centralisation_C1\Deployer-Correctif.ps1" -Etape tsw -ProjectRoot "C:\dev\crestron\repo\projects\villa-crans" -TswHost 192.168.1.16
```

Cette dernière étape utilise `-SkipBuild`. Pour C1, ne pas employer `-Target All`, qui recharge le CPZ et change plusieurs éléments en une seule opération.

Si l'iPhone utilise le paquet local dans Crestron One/Go, vérifier également le rechargement de son projet dans l'application : envoyer les pages au serveur web du CP4 ne prouve pas que le paquet local de l'application a été actualisé. Un message `[LAT-GUI] v=C1` lors d'un appui confirme la nouvelle sonde dans la page effectivement exécutée.

## Recette sur place — sans échanges intermédiaires nécessaires

1. Ouvrir l'iPhone avec le même mode de connexion et le même IP-ID que lors du défaut. Attendre la fin de l'initialisation. Conserver les autres écrans comme observateurs ; ne pas commander simultanément depuis un autre écran pendant une mesure. Pour des sessions web simultanées, employer les IP-ID enregistrés prévus pour chaque session, sans réutiliser un identifiant déjà employé.
2. Dans Centralisation, appuyer une fois sur **Tout fermer**, attendre son retour, puis **Tout ouvrir**. Répéter cinq alternances, en laissant chaque retour arriver avant l'appui suivant. Comparer le feedback de l'iPhone et de la TSW. Vérifier dans le Debugger du slot 2 que les moteurs reçoivent toujours leurs fronts de commande.
3. Faire le même contrôle avec **Tout allumer / Tout éteindre**, puis **Confort / Nuit**. Ces familles ne passent pas toutes par la fonction d'impulsions moteurs : si elles restent lentes, C1 ne suffit pas à expliquer le défaut complet.
4. Capturer les lignes `[LAT-GUI]` et, si `meta.tracesLatence` est activé dans la configuration CP4, les lignes `[LAT-CP4]`. Les `[LAT-GUI]` sont désormais visibles même lorsque `meta.tracesConsole=false`. C1 ne change pas ces drapeaux dans la configuration.
5. Pour afficher les mesures directement sur le téléphone : cinq appuis espacés d'environ 300 ms sur le titre Centralisation, en moins de trois secondes. Même geste pour masquer le bandeau. Le bandeau n'active ni ne coupe la collecte de diagnostic.

## Lecture des traces

Exemple de format, **valeurs illustratives**, pas une mesure faite sur le matériel :

```text
[LAT-GUI] v=C1 id=7 j=404 status=ok cb=80 dom=95 raf=110
[LAT-CP4] fix=C1 ip=06 j=404 dt=30ms helper=40 target=4 pulseEisc=180
```

| Champ | Signification exacte |
|---|---|
| `cb` | Millisecondes entre le premier événement d'appui et le callback booléen `true` du join attendu |
| `dom` | Millisecondes entre l'appui et l'observation de la sélection du bouton dans le DOM |
| `raf` | Millisecondes entre l'appui et le prochain callback `requestAnimationFrame` après les deux observations ; **ce n'est pas une preuve de peinture effective à l'écran** |
| `dt` | Durée du traitement C# de cette commande globale, jusqu'à la sortie du handler ; ne mesure pas la livraison réseau |
| `helper` | Écritures passant par les trois setters de feedback pendant ce handler ; compteur partiel, pas tout le trafic CIP |
| `target` | Sous-ensemble de `helper` destiné à l'IP-ID émetteur |
| `pulseEisc` | Écritures d'impulsions moteurs par `PulseRoomDigital`, maintenant réservées à l'EISC |

L'identifiant `id` est local au téléphone. Il n'est pas un identifiant de transaction CP4. Sans séquence transportée et renvoyée par le processeur, l'association appui/retour reste conditionnée à la recette avec actions isolées. Ne pas déduire un RTT réseau par soustraction de `dt` et `cb`.

Un `cb` élevé situe le retard avant l'exécution du callback (transport **ou** attente de JavaScript/CrComLib). Un `cb` court suivi d'un `dom` long indique que l'écart se trouve après ce callback. Un `dom` court avec effet visuel tardif demande encore une inspection du rendu sur l'appareil. Une baisse du retard après C1 étaye l'effet du routage corrigé ; elle ne démontre pas à elle seule le mécanisme réseau interne.

| Statut | Interprétation |
|---|---|
| `ok` | Appui isolé, callback et sélection DOM observés |
| `already-selected` | État déjà sélectionné ; aucun nouveau feedback n'est exigible et aucune latence n'est calculée |
| `state-dom-mismatch` | CrComLib connaissait déjà l'état sélectionné, mais le bouton observé ne le reflète pas |
| `state-unknown` | Attendre l'état initial / vérifier la connexion ; aucune latence calculée |
| `overlap` | Plusieurs appuis avant la fin de la mesure : mesure annulée |
| `timeout` | Aucun callback attendu observé dans les 45 secondes |
| `dom-frame-timeout` | Callback reçu, mais sélection DOM ou frame non observée dans la fenêtre de 45 secondes |
| `hidden`, `disconnected`, `cancelled` | Mesure interrompue, à exclure de l'analyse de latence |
| `cooldown` | Diagnostic en attente après une mesure ambiguë ; l'interface reste utilisable |

Après un échec ou des appuis superposés, attendre **45 secondes sans nouvel appui** avant de mesurer à nouveau. Les commandes elles-mêmes ne sont jamais bloquées par la sonde.

## Changements techniques et limites

`PulseRoomDigital()` garde les deux écritures haut/bas sur le même join de l'EISC et conserve les contrôles d'existence de la pièce, de l'enregistrement de l'EISC et du drapeau `intersystem`. Les blocs par pièce ne sont plus envoyés aux panels. Le contrat de cette correction est **v4**, avec `contrat.blocsPiecesGui.actif=false`, comme dans les sources et le contexte fournis. Ne pas appliquer tel quel à un autre projet utilisant encore les blocs v3 dans ses GUI.

Le compteur global et le chrono partagé ont été remplacés par un contexte de mesure par thread/callback, restauré après les appels imbriqués. Les traces CP4 s'émettent à la sortie du handler, y compris lorsqu'un preset appelle une diffusion interne. Les lignes courtes `[LAT-GUI]` du sériel 100 sont traitées avant le miroir EISC et indépendamment du journal général.

La sonde écoute le début de l'appui, car le CH5 embarqué publie ses `repeatdigital` dès la pression, avant le clic/relâchement. Elle déduplique les événements de compatibilité tactile/souris, annule ses minuteurs terminés, conserve un délai de 20 secondes, observe les deux valeurs des retours et n'assimile pas un état tenu à un accusé de réception.

**Vérifications effectuées :** tests JavaScript avec horloge contrôlée, syntaxe des scripts inline, comparaison des sources et invariants de routage. Détail dans `verification/RESULTATS.md`.

**Non effectués :** compilation SIMPL# Pro/CPZ, compilation CH5Z, exécution PowerShell sous Windows, rendu Safari/iPhone/TSW/XPanel et mesure du trafic sur CP4. Le navigateur de test local n'était pas installé et son téléchargement a échoué ; les tests avec horloge contrôlée ne remplacent pas une recette native iOS.

Le paquet est un candidat de correction accompagné d'une sonde temporaire. Conserver les sources sauvegardées jusqu'à la validation matérielle. Aucun résultat historique de Claude n'est présenté comme un test réalisé ici.
