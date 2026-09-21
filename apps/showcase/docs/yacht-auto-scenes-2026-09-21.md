# Asteria — scènes automatiques et publication, 21 septembre 2026

Demande explicite de Donatien : lancer Dîner à bord quand la nuit arrive, Croisière quand le jour revient, puis publier sur Vercel sans manipulation Git de sa part.

## Fonctionnement

Le cycle environnemental existant reste inchangé : 30 s jour, 10 s crépuscule, 30 s nuit, 10 s aube. Son passage en nuit (t=40 s) appelle `ftvGui.applyPreset('dinner')` une fois ; son retour en jour (t=80 s) appelle `ftvGui.applyPreset('cruise')` une fois. Une connexion initiale ou un retour explicite en Auto aligne la scène sur la phase stable courante. Aucun preset forcé au crépuscule ou à l'aube.

Les messages validés `exterior-state` du modèle alimentent le détecteur, même panneau Extérieur fermé. La dalle 2D utilise son simulateur existant. Aucun second minuteur pour les vues 3D, aucune modification du cadrage d'entrée, de la molette, de la sélection de pièce, de l'audio ou du cycle de ciel. Les commandes sont programmatiques : elles ne désactivent pas Auto et n'atténuent pas les 40 circuits extérieurs de la nuit. Une intervention manuelle qui sort d'Auto reste prioritaire jusqu'au retour explicite en Auto.

## Tests

Neuf tests unitaires couvrent les fronts, doublons, phases intermédiaires, priorité manuelle, reprise Auto, paquets invalides et retours synchrones. Le banc navigateur exerce la vraie page hôte Smartphone et la GUI Tablette, les niveaux de toutes les zones, l'absence de répétition, la sélection conservée, les trois thèmes, le clic utilisateur et la dalle 2D. Les horloges sont avancées dans le banc pour vérifier les frontières ; les essais ne mesurent pas les FPS.

Le workflow Asteria night render review exécute les tests de géométrie, la construction, l'analyse statique, le rendu nocturne et ces nouveaux contrôles. Après un push sur main, il attend la correspondance SHA-256 de sept ressources publiques Vercel, puis répète les contrôles de scènes sur le domaine de production. Les résultats du workflow font foi, pas la présence de ce document.

Le contrôle global Showcase quality était déjà en échec sur main avant la branche Asteria (contrat de version Villa Crans). Ne pas modifier ni désactiver ces contrôles pour faire passer cette livraison. Les avertissements et éventuels blocages sont à consigner dans la PR.

## Périmètre

Publication du showcase autorisée par la demande courante ; pas de CH5/C#/SIMPL, de déploiement matériel ni d'accès aux fichiers Windows non synchronisés. Les retouches esthétiques supplémentaires et la sensation de hauteur en vue pièce ne sont pas ajoutées à ce lot.
