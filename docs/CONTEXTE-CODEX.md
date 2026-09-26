# Reprise Codex — Crestron CH5 Cowork

## 26/09/2026 — Hotel Brassus

Ajout demandé par Donatien dans Hôtellerie avec le vrai GUI de l'Hôtel des Horlogers et une maquette basée sur ses plans locaux. Site 2.1.0, source CH5 2.12.16 importée depuis la distribution compilée fournie. Travail isolé des modifications locales Villa Crans. Détails, synchronisation reproductible, limites architecturales et recette : `apps/showcase/docs/hotel-brassus.md`. Source HDH sur le Bureau et programmes matériels préservés. Ne pas interpréter les valeurs de démonstration comme la configuration du site client.


## 17/09/2026 — limite de sauvegarde vérifiée après la demande de pause

La sauvegarde Git est confirmée pour les sources et les fichiers non ignorés. **Elle n'est pas une image complète du laptop ni une garantie de restauration intégrale.** Les derniers `Villaftv.cpz` et `Project_Slot2.lpz`, ainsi que `deploy.secrets.psd1`, sont présents localement et ignorés ; logiciels/outils Windows et accès externes restent à sauvegarder ou réinstaller. Voir [AUDIT-RESTAURATION-2026-09-17.md](AUDIT-RESTAURATION-2026-09-17.md) pour l'inventaire vérifié et les lacunes. Ne pas annoncer « tout récupérable à l'identique depuis Git seul ». Aucun changement fonctionnel ; pause maintenue.



## 17/09/2026 — sauvegarde complète avant pause demandée par Donatien

Pause explicite en attendant le rétablissement du quota de tokens. Dernier lot site publié et vérifié : `74cd4a41`, preuves `f0cee4d9` (156 contrôles publics réussis). La demande F1 reste uniquement en TODO ; aucun nouveau travail à lancer pendant cette pause.

Tous les écarts suivis et fichiers nouveaux non ignorés du dépôt sont sauvegardés dans `backup/crestron-local-2026-09-17`, commit `0ca2b6c47d948466cbb8829ee77f6d7dd1e5f988`, poussé et vérifié. Cet instantané inclut cette fois le CH5Z local, les QR et dates/versions générés déjà suivis, le document backend C#, les autosauvegardes SIMPL et les suppressions locales. Il conserve aussi l'historique de la sauvegarde précédente. Aucune validation ni mise en service matérielle n'est impliquée.

Le dossier de travail reste sur main ; ses écarts matériels restent visibles et leur contenu est désormais enregistré dans la branche de sauvegarde. Ne pas les effacer ni les confondre avec de nouveaux travaux à effectuer. Les dépendances et fichiers temporaires ignorés restent locaux ; sources et preuves utiles sont sur GitHub.



## 17/09/2026 — journey-1 : parcours guidés et lisibilité nocturne

Publication vérifiée : **74cd4a41**, main → Vercel. Quatre ressources publiques identiques aux octets Git ; **34 contrôles Villa Crans et 122 contrôles React réussis sur le site public**, soit 156. Cycle jour/nuit, deux passages Smartphone et TSW, sources et volume réels, arrêt A/V, priorité manuelle et minimum de visibilité confirmés. Aucun nouveau défaut navigateur ; messages préexistants du TSW séparés. Preuves `production/`, `production-react/` et `production-assets.json` dans `docs/verification/2026-09-17-journey-1/`. Aucun matériel déployé. La TODO F1 est enregistrée sans réalisation.


Dernière demande de Donatien : chaque pièce montre un parcours complet. Tablette/dalle/PC : pièce → éclairage → HVAC → audio/vidéo → Apple TV → IPTV → volume → OFF audio/vidéo. Les simulateurs sans ces deux sources utilisent deux sources réellement disponibles ; un lecteur audio se termine par Pause. Aucun clic aléatoire sur réglages, alarmes ou commandes générales. Trois pièces sont parcourues avant la poursuite du carrousel.

Villa Crans Smartphone : fermeture de tous les moteurs présents ; de nuit TOTAL puis CINÉMA, de jour CINÉMA puis ouverture de tous les moteurs ; ensuite HVAC, sources Apple TV/IPTV, volume, OFF A/V. Les motorisations finissent leur course et chaque fondu de scène dure trois secondes. La branche jour/nuit est choisie au début de la visite ; l'ambiance globale n'écrase pas la pièce en cours. Les autres pièces suivent toujours le cycle 30/10/30/10. Vue villa initiale conservée trois secondes. Les anciens créneaux de cinq secondes par pièce sont remplacés : la dernière pièce se termine avant le changement de châssis, les 60 secondes Smartphone et 10 secondes TSW sont désormais des durées minimales. La tablette Villa Crans montre trois visites complètes. Intervention manuelle toujours prioritaire, délai de reprise 60 secondes Smartphone / 10 secondes autres supports.

La demande « jamais de pièce dans le noir total » remplace l'ancienne exigence de rendu complètement noir : faible remplissage de présentation par les deux lumières déjà présentes (hémisphère minimum 0,32, remplissage 0,18). Les luminaires commandés et leurs retours restent strictement à zéro en OFF. Aucun ajout de lumière, modèle ou média distant. Contraste mesuré Bureau de jour OFF/CINÉMA/REPAS/TOTAL : 0,259 / 0,381 / 0,518 / 0,599 ; valeurs de pixels, pas des lux.

Corrections constatées pendant la recette : le curseur CH5 synthétique ne transmettait pas toujours le volume ; publication du même join analogique dans le simulateur local uniquement. Les ancêtres masquant un bouton ne sont plus considérés comme une cible visible ; défilement des panneaux existants avant déplacement. Seuil de taille évalué avant réduction du châssis. Appartement Carouge : contrôles du lecteur et de la liste des pièces conservés dans le DOM pendant les mises à jour React, permettant le glissement complet du volume. Villa Nyon : volume réellement contrôlé et pourcentage synchronisé. FTV Home : source Apple TV, volume par écran et OFF de l'écran ciblé ; captures et fiches FR/EN/DE actualisées.

Recette locale : 34 contrôles du cycle Villa Crans, 122 contrôles sur cinq parcours React, 23 contrôles de fondu, 18 contrôles de contraste, 8 contrôles fiches/volume/cibles et comparaison trois thèmes × normal/Scène. FTV Home possède ses deux thèmes clair/sombre, sans verre dépoli. Premiers essais ont révélé les défauts de volume, de clipping et de remontage React ci-dessus ; tous corrigés puis recontrôlés. Pas de nouvelle erreur navigateur ; messages WebXPanel/SVG préexistants TSW consignés séparément. Build/lint réussis avec avertissements préexistants.

Preuves et comparaison : `docs/verification/2026-09-17-journey-1/` à la racine du dépôt. Source GUI CH5, configuration physique, C# et SIMPL inchangés ; aucun matériel compilé ou déployé. Le tracé F1 demandé ensuite est uniquement consigné dans `apps/showcase/docs/TODO-SHOWCASE.md`, sans modification de la simulation sportive.




## 17/09/2026 — tour-1 : séquençage Villa Crans autorisé

**Publié et vérifié : `b1de7af0`, main → Vercel. 34 contrôles du cycle complet sur le site public réussis, aucune nouvelle erreur ; sélections à 3 s puis toutes les 5 s mesurées avant le rendu. Preuves archivées dans [verification/2026-09-17-tour-1/README.md](verification/2026-09-17-tour-1/README.md).**

La TODO a été précisée et activée par Donatien : au clic Residential, Smartphone 60 s (villa globale 3 s, puis pièce aléatoire toutes les 5 s), TSW 10 s, puis boucle. Pas de Tablette dans ce nouveau cycle. Au crépuscule : CINÉMA basse/variée dans les 17 pièces et tous les rideaux fermés ; à l'aube : lumières OFF et rideaux ouverts. Cycle extérieur 30/10/30/10 conservé et horloge continue pendant TSW. Le visiteur peut interrompre immédiatement, reprise après 60 s sur Smartphone.

Implémentation uniquement Showcase : hook villaTour, orchestration, moteur local et liaison 3D. Aucun changement de la GUI source ou des programmes Crestron. 34 contrôles de cycle et 23 de fondu réussis localement ; trois thèmes / normal / Scène. Détails dans apps/showcase/README.md et docs/plan3d.md, preuves dans Claude outputs/villa-tour. L'adaptation générale du GUI Showcase aux équipements de chaque pièce reste dans la TODO et n'est pas incluse dans cette demande de séquençage.



## 17/09/2026 — sauvegarde Git et continuité

Demande explicite de Donatien : tout le travail utile doit être sur GitHub. Le site, ses sources et tests sont déjà dans main (`a62b6a03`). Les consignes racine, ce contexte, le vocabulaire, les exports Claude et les preuves finales sont désormais ajoutés à main. Les sources SIMPL et notes locales préexistantes sont sauvegardées séparément dans `backup/crestron-local-2026-09-17`, commit `03840cedbcb64c675eec0d84e64fb02c5014a843` ; branche distante vérifiée. Ne pas confondre cet instantané de travail avec une recette matérielle validée. Détails et exclusions : [SYNCHRONISATION-GIT-2026-09-17.md](SYNCHRONISATION-GIT-2026-09-17.md). Preuves partageables du dernier lot : [verification/2026-09-17-feedback-1/README.md](verification/2026-09-17-feedback-1/README.md).

## 17/09/2026 — feedback-1 : écrans dégagés, éclairage localisé et ondes en mouvement

La TV de la salle à manger est déplacée sur une travée libre, entre buffet et cave à bouteilles, et agrandie. Le rail de spots est reculé ; l'écran reste sous les appliques, hors de l'axe de la suspension. Contrôle élargi aux autres pièces : applique du Salon décalée, rail du Bureau reculé, écran cinéma ajusté sous sa corniche avec la barre de son au-dessus du sol. Règle permanente ajoutée à CLAUDE.md et aux consignes locales : aucun mobilier, rideau ou équipement ne masque un écran allumé ; contrôler les vrais obstacles, sans contourner la profondeur.

Le blocage des scènes Salon/Suite parentale n'a pas été reproduit sur une session neuve : les quatre boutons transmettaient déjà quatre ensembles de niveaux distincts. Leur rendu est amélioré : lumière d'ambiance localisée au lampadaire du canapé et près des chevets ; contribution distincte des corniches/appliques/LED aux deux lumières existantes. Fondu linéaire 3 secondes, jour/nuit, occultations, presets mémorisés et feedbacks GUI conservés.

Ondes audio : même anneau fin, expansion visible de 60 à 100 % du diamètre maximal, puis disparition, toutes les 1,6 seconde. Diamètre maximal proportionnel au volume de la source audible ; AV/musique distincts, mute/OFF/pause/volume nul respectés. Aucun maillage, texture distante ou lumière supplémentaire.

Recettes : scripts/test-plan3d-room-feedback.cjs (boutons réels, quatre scènes Salon/Suite × jour/nuit × ouvert/fermé, rayons caméra-écran sur les 11 TV), test-plan3d-audio.cjs (mesure temporelle sur chaque enceinte) et test-plan3d-lighting.cjs (fondu et interruptions). Preuves et résultats dans Claude outputs/room-feedback. Ce lot ne change ni la GUI, ni la configuration physique, ni C#/SIMPL ; aucun déploiement matériel.

**Publié et vérifié : a62b6a0387e580d7488da1a4415bc7a1cfe8d92e, main → Vercel. Deux modules publics identiques aux octets Git ; 69 contrôles sur Vercel réussis, dont 6 006 rayons dégagés sur 11 TV et les quatre scènes Salon/Suite jour/nuit et occultations ouvertes/fermées. Local : 280 contrôles audio, 23 fondus, grand écran 23 contrôles réussis ; environ 56,8 i/s. Preuves : Claude outputs/room-feedback. Aucun matériel déployé.**

Contrôle audio public supplémentaire réussi : propagation mesurée, diamètre selon le volume, extinction sur mute/OFF. Capture vidéo ondes-audio.webm ; 59,5 i/s pendant son enregistrement (mesure courte, appareil local). Planche avant/après actualisée avec les captures Vercel.

## 17/09/2026 — lighting-1 : scènes en journée et appliques de façade

**Publié et vérifié : fdf9da9883162b0413bdbd44a796aed53e708998, main → Vercel. Quatre ressources publiques (moteur, façades, JSON et JS vitrine) identiques aux octets Git ; 18 contrôles sur le site public réussis, aucune erreur JavaScript/shader. Les 54 appliques et les noms Pool House / Bar & Lounge sont confirmés. Rapports : Claude outputs/scene-contrast/production-assets.json et production/results.json. Aucun matériel déployé.**

Rééquilibrage des intérieurs en coupe : contribution naturelle réduite à 32 % du réglage extérieur, spot de fenêtre 32 au lieu de 90, rebond des lampes conservé également en journée. La couleur du rebond mêle progressivement ciel et éclairage chaud. Aucun changement d'exposition lié aux scènes ; le paysage reste indépendant. Jour/nuit 30/10/30/10, transmission volet × store × rideaux et fondu linéaire de trois secondes conservés. Pièces sans fenêtres sans apport naturel ; OFF ne laisse aucun éclairage artificiel de pièce.

54 appliques à double faisceau sur montants de pierre, façades et volumes des étages. Les supports en pierre sont élargis pour placer les luminaires sur le mur, sans les monter sur les vitrages. Projection chaude procédurale regroupée en un seul maillage transparent (un appel de dessin), synchronisée avec le crépuscule et avec la disparition des façades. Aucune nouvelle lumière dynamique, ombre calculée ou ressource distante ; environ 1 Ko gzip de code ajouté.

Noms choisis par Donatien : pièce 11 Terrasse & Jardin → Pool House ; pièce 14 Pool House → Bar & Lounge. Générateur sync-villa-crans.py mis à jour, deux configurations publiques régénérées par clean_config. Identifiants et pilotages inchangés. Le JSON physique garde exactement la même empreinte SHA-256 ; GUI source, C# et SIMPL inchangés, aucun matériel déployé.

Validation locale : 16 contrôles visuels/numériques du contraste (quatre scènes × jour/nuit × ouvert/fermé, salon/cinéma/bar, façades), 23 contrôles de fondu, 35 contrôles de noms/thèmes/langues/supports et d'occultations. Trois thèmes en mode normal et Scène ; faisceaux masqués dans la vue pièce. Les noms sont vérifiés sur trois supports × FR/EN/DE × trois thèmes. Les deux assertions supplémentaires du banc de contraste verrouillent la version et un écart minimal notable en journée. Build/lint réussis. Premier essai de la matrice de noms lancé avant la disponibilité des fonctions GUI : attente d'initialisation corrigée, puis matrice réussie.

Mesure sur la zone Bureau : luminosités moyennes jour OFF/CINÉMA/REPAS/TOTAL de 0,440/0,514/0,595/0,650 avant à 0,255/0,391/0,521/0,607 après ; pas une mesure lux physique. Nuit et occultations fermées restent comparables. 53,6 images/s mesurées sur ce laptop en vue villa nocturne 1280×800 DPR 1,5, dépendantes de l'appareil. Preuves : Claude outputs/scene-contrast/baseline, qa, matrix, fades et planche-avant-apres.png.



## 17/09/2026 — audio-1 : ondes agrandies et Suite invités

**Publication vérifiée : commit 27cd33b78160e2f5b2999646c9042c0ffbf86b92, main → Vercel. Les trois fichiers publics modifiés correspondent exactement aux octets Git ; 265 contrôles sur le site public réussis, 32 enceintes / 15 pièces, trois thèmes et modes applicables. Aucune erreur téléphone, seuls les messages WebXPanel/SVG préexistants dalle/tablette. Rapports : Claude outputs/audio-waves/production-assets.json et production/results.json. Aucun déploiement matériel.**

Diamètre des ondes multiplié par deux, proportionnel au volume de la source audible : audio/vidéo (a52) ou lecteur musique (a254), conformément aux deux volumes indépendants existants. Mute, OFF, pause vidéo et volume nul arrêtent l'animation. Transparence légère conservée ; anneaux légèrement dégagés des façades des enceintes, sans désactiver leur occlusion par les objets.

Cause reproduite dans la Suite invités, la terrasse et la piscine : le préréglage historique source=5 ne déclenchait pas le booléen musique. L'initialisation du feedback local traduit désormais ce préréglage en musique active et source vidéo éteinte. L'enceinte gauche des deux suites est dégagée du mobilier et de la TV escamotable. Enceintes animées ajoutées dans le vestibule Wellness, le garage et le simulateur de golf. Total : 32 enceintes dans 15 pièces ; cuisine sans enceintes selon la demande précédente, local technique sans équipement AV.

Recette dédiée scripts/test-plan3d-audio.cjs : 263 contrôles locaux réussis (17 pièces, quatre sources vidéo, deux volumes, mute/OFF/pause, retour de pièce, visibilité réelle par rayons, trois thèmes, normal/Scène, feedback dalle/tablette). Les deux suites présentent chacune deux anneaux dégagés. Aucun défaut JavaScript/shader téléphone ; messages WebXPanel/SVG préexistants dalle/tablette consignés séparément. Deux assertions supplémentaires verrouillent les erreurs des modes normal et des autres supports. Build/lint réussis ; 56,0 images/s mesurées localement sur 4 secondes, 1280×800 DPR 1,5. Aucun média distant ajouté. Preuves : Claude outputs/audio-waves/qa-final, baseline et planche-avant-apres.png.

Périmètre : fond 3D et feedback local showcase uniquement. Source GUI, JSON de déploiement, C# et SIMPL inchangés ; aucune compilation ou installation matérielle par ce lot. Chargeur et API 2026-09-17-audio-1 ; imports paysage valley-1 et TV stadiums-1 conservés.


## 17/09/2026 — compilation SIMPL effectuée par Donatien, rangement confirmé

Donatien a compilé le candidat dans SIMPL Windows à 16:25, sans transfert. LPZ valide, SMW embarqué identique à la source préparée ; les 550 noms de signaux du SIG ont été relus, dont commandes et retours Sauna/Hammam. **Dossier de travail corrigé à sa demande : `projects/villa-crans/simpl/simpl-windows/`**, avec `Project_Slot2.smw`, LPZ, SIG, archives, profil de banc, empreintes et LIRE.md. Douze fichiers copiés et comparés par SHA-256 avant mise à jour des notices. Compatible GUI 1.0.181 / C# 1.0.180.0 ; aucune recette matérielle ni connexion au Debugger effectuée.

**Préférence explicite précisée : conserver désormais les générations et compilations directement dans `C:/dev/crestron/repo/projects/villa-crans/simpl/simpl-windows`, pas dans `livraisons` ni `builds`.** Le projet historique `VillaCrans_Slot2.smw` et ses modifications locales sont préservés à côté du candidat `Project_Slot2.smw`. Les anciens dossiers `simpl/livraisons/2026-09-17-gui181` et `C:/dev/crestron/builds/20260917-slot2` restent des sauvegardes, plus des dossiers de travail. Le déplacement avec suppression des dossiers vides a été bloqué par la politique automatique ; une copie vérifiée sans suppression a permis le rangement demandé.

Les commandes ON/OFF et Auto/1/2/3 HVAC, la vitesse analogique et les retours nommés sont aussi présents dans le SIG compilé (vérification du fichier, pas d'observation dans le Debugger connecté).

## 17/09/2026 — stades TV et paysage valley-1 publiés et vérifiés

`8b534c0f` ajoute les tribunes/stades des programmes tennis, football et course automobile, avec public fixe et détails sportifs ; 31 contrôles locaux réussis. `2abeb09` documente le rangement SIMPL. `29991d9691d53adfa544a8b99b09ddfc550fbfde` corrige le paysage : deux lacs alimentent des ruisseaux descendants et continus, berges, ponts, chemins raccordés, soubassements des chalets ; onze parcelles, 620 conifères, 1 800 touffes et herbe texturée. Aucun média distant ajouté, environ 4 Ko gzip de code supplémentaire. Fond showcase Smartphone uniquement ; GUI toujours 1.0.181, C# 1.0.180.0.

Publication main → Vercel confirmée : six ressources publiques (dont TV et paysage) identiques aux octets du commit, puis **29 contrôles sur le site public réussis**, trois thèmes × normal/Scène × jour/nuit, navigation, eau non masquée par le relief. Build/lint réussis ; messages WebXPanel/SVG préexistants dalle/tablette consignés séparément lors du test TV. Comparaison locale 1280×800 DPR 1,5 : 54,2 images/s avant, 53,8 après, 130 → 137 appels de dessin ; aucune promesse tous appareils. Premier essai du banc paysage expiré sur la resélection de la pièce déjà sélectionnée, puis corrigé pour employer la molette.

Preuves : `Claude outputs/alpine-landscape/production-assets.json`, `production/results.json`, `qa-publish/`, `comparaison.json` et `planche-avant-apres.png`. Sports : `Claude outputs/sports-stadiums/planche-avant-apres.png`. Les modifications locales antérieures CH5/SIMPL/imports ont été préservées. Aucun équipement contacté ou déployé.

## 17/09/2026 — industrialisation 0.2.0, GUI 1.0.181 publiée

Suite autonome demandée par Donatien dans « Papoter ensemble », puis « parfait continues ». Commit e5d8a833286817006c26fde66efcdd1af17b75fe poussé sur main et vérifié en production. Workflow GitHub 35211165111 réussi ; six ressources identiques au commit, 49 contrôles du mode démo réussis sur Vercel.

Registre unique de 17 simulateurs ; démo filtrée par supports du catalogue, liens incompatibles/inconnus FR/EN/DE, boutons 44 px. Préparation commune CH5/SIMPL depuis un profil avec contrat et empreintes de treize sources ; générateur --config, sortie distincte neuve, contrôle des entrées. Pilote Villa Léman deux pièces sans fork du GUI ; sa migration commerciale complète reste à faire.

La revue des captures a découvert les commandes de ventilation coupées en 1280×800 après le conteneur Wellness. Style commun corrigé (marges internes et commandes sur une ligne en faible hauteur), synchronisé vers le Showcase ; GUI/config 1.0.181. C# inchangé, assembly 1.0.180.0 : sources comparées au snapshot ayant produit le CPZ précédent. Deux CH5Z 1.0.181 (bêta Alexandre et pilote) assemblés et vérifiés. LPZ non compilé ; aucun équipement contacté.

Tests du lot : 43 outillage/contrat, 49 démo locales + 49 production, 32 chargements catalogue, 28 pilote (trois supports × trois thèmes avec visibilité effective HVAC), 555 HVAC et 632 Wellness (36 combinaisons chaque matrice + natif), 76 HVAC/53 Wellness C#/JSON/SMW, contraste 4:1, build/lint réussis. Premiers essais en parallèle expirés ; reprises séparées entièrement réussies. Les 19 contrôles initiaux du pilote ne détectaient pas le clipping, neuf assertions ajoutées. Captures et fiches FR/EN/DE actualisées.

Détails : docs/industrialisation/LOT-0.2.0.md. Livraison : C:/Users/donat/Documents/Codex/2026-09-17/referenced-chatgpt-conversation-this-is-an/outputs/Crestron-Showcase-lot02/BILAN.md et Crestron-Showcase-lot02.zip (SHA-256 89db8d94f8b0d04445c84a38c0912283786a22fc7010f3ea4285b2a0639abe21). Les répertoires work/lot02-final-* sont les candidats définitifs ; work/lot02-leman a servi d’essai CSS et son ancien manifeste ne qualifie pas ses modifications.

Suite : adapter/vérifier les drivers SIMPL, compiler le LPZ, recette EISC multi-écrans et équipements, puis gel du lot matériel. Continuer la migration Villa Léman puis Home Cinéma Cologny. Le socle refuse maintenant les plages HVAC différentes de 16–28/pas0,5, une cabine Wellness isolée, les pas Wellness autres que 1, les identifiants de pièces discontinus et les joins/EISC modifiés. Ces capacités ne sont pas encore généralisées. Les modifications locales antérieures (SMW, archives, QR, config de connexion, imports de contexte) ont été préservées hors commit.


## 17/09/2026 — rooms-1, GUI 1.0.180 : décors, wellness et voisinage

Publication vérifiée sur Vercel : commit `c3ef1bf3`, GUI 1.0.180 / rooms-1. 27 contrôles publics réussis ; 19 ressources publiques identiques aux octets du commit, aucune erreur JavaScript/shader. Sur ce laptop à 1280×800, DPR 1,5 : 52.8 images/s sur 4 secondes, premier rendu observé à 4992 ms, 397 Ko de ressources /plan3d/ transférées. Ces mesures ne portent pas sur le poids total de la page. Rapport : `Claude outputs/room-revision/production/verification.json`.


Lot demandé par Donatien : local technique au sous-sol (17 pièces vitrine), vue villa rapprochée de 10 %, décoration et enceintes différenciées, cinq TV escamotables au pied des lits, écran cinéma agrandi et haut-parleurs dégagés. Ondes audio fines proportionnelles au volume ; mute, OFF et pause les arrêtent. Quatre programmes réellement 3D dans les TV via un rendu partagé 640 × 360 à 10–15 images/s, sans téléchargement vidéo ni son.

Sous-sol entièrement sans fenêtres. Wellness : deux cabines cloisonnées sauna/hammam, carrelage, douche, vasque ; coupe architecturale des plafonds pour voir l’intérieur, vapeur seulement lorsque le hammam fonctionne. Garage atelier avec deux silhouettes sportives distinctes, carrosseries courbes, roues et détails. Route devant le portail, ponts, sentiers, champs, deux ruisseaux, allées d’arbres, voisins et chalets éloignés des clôtures. Décor fixe regroupé par matériau, aucun nouveau modèle distant. Rendu enrichi mais stylisé, pas photographique.

GUI commune : onglets HVAC/Sauna/Hammam, ON/OFF indépendants, cibles sauna 60–100 °C et humidité hammam 90–100 %, plages dans le JSON ; HVAC normal 16–28 °C. Pas de ventilation sauna/hammam ni de température hammam. Joins d620–627, a/s62–65, C# WellnessState, entrées/sorties EISC nommées dans le générateur SIMPL. Détails et recette Debugger : `projects/villa-crans/ch5/docs/WELLNESS-2026-09-17.md`. Le correctif parallèle de routage inter-écrans dans ControlSystem est préservé et ses 22 scénarios simulés revérifiés ; les autres changements d’industrialisation restent hors publication de ce lot.

Vérifications locales : 36 combinaisons HVAC (555 assertions), 36 combinaisons wellness et retours natifs sans simulateur (632 assertions), 53 tests C#/JSON/SMW wellness et 76 HVAC, 40 contrôles pièces/TV, 27 navigation, 23 fondu, 24 villa, cinq nouveaux contrôles 3D wellness/garage. Matrice 3D supports/thèmes/modes réussie ; audit page/modales/états à 4:1 réussi. Cycle jour/nuit 30/10/30/10 s revérifié. Environ 52–54 images/s mesurées localement à 1280×800, DPR 1,5, rendu GPU. Les performances dépendent de l’appareil et de la connexion.

CH5Z assemblé et CPZ compilé (assembly 1.0.180.0), copie SMW préparée ; **LPZ non compilé, aucun matériel déployé ou vérifié**. Mesures wellness physiques inconnues tant qu’aucun driver ne les fournit. Le dossier `Claude outputs/room-revision/livraison` et les planches avant/après consignent le résultat ; ne pas assimiler la version du site à celle installée sur CP4/TSW.


## 17/09/2026 — industrialisation, candidat bêta Alexandre (lot 0.1.0)

Reprise explicite de « Papoter ensemble » : Grand Montana comme flagship, V1/bêta puis socle CH5+C#+JSON+SIMPL et migration des autres secteurs. Dossier de continuité : `docs/industrialisation/README.md` et quatre documents associés. Le nom demandé n'entraîne pas de renommage des identifiants `villa-crans` / `villa-gemini-frequencetv`.

Corrections : contexte a10 rétabli dans `MirrorSignalToEisc` avant toutes commandes de pièce (sources/scènes/stores/télécommandes/analogiques), copies `src/villa_config.*` réalignées sur la config canonique 1.0.180 ; registre commun `simulatorRegistry.js` pour Showcase/DemoMode avec vérification bloquante prébuild. Nouveau `tools/quality/` : validateur, audit SHA-256, export contrat, préparation sans déploiement et reproduction C# réelle hors matériel.

Preuves de cette tâche : 23 tests outillage ; 22 scénarios C# de routage après reproduction de 8 échecs sur 10 ; 1 292 assertions centralisation ; 32 chargements catalogue/démo ; 15 tests de retours natifs HVAC du candidat ; 76 contrôles HVAC/C#/SMW ; contraste 3 thèmes dalle/smartphone pages/fenêtres/alarme réussi. Ce ne sont pas des tests de toutes les pages ni des 17 interfaces sur matériel. Build Vite réussi, lint sans erreur avec avertissements préexistants.

CH5Z et **CPZ réellement compilés avec succès dans des dossiers isolés** ; le blocage historique d'empaquetage CPZ n'a pas été reproduit ici. Profil neutre de banc : 15 pièces / 14 actives, activations physiques conservées, repli alarme vidé dans l'export seulement. SMW généré séparément, **LPZ non compilé, aucun déploiement matériel**. Candidat `grand-montana-prebeta-20260917.1`, source/assembly 1.0.180, non qualifié V1. Sources de travail toujours modifiées en parallèle par la tâche 3D/Wellness : ne pas attribuer nos tests aux évolutions ultérieures. Ce lot n'a pas publié sur Vercel.

Dossier utilisateur : `C:/Users/donat/Documents/Codex/2026-09-17/referenced-chatgpt-conversation-this-is-an/outputs/Crestron-Showcase-prebeta/`. La recette doit encore vérifier le transport EISC à plusieurs écrans, les relâchements/appuis simultanés, les retours réels, le LPZ et la matrice graphique complète. Puis pilotes Villa Léman/Home Cinéma. Les 17 simulateurs ne sont pas encore convertis au core.

## 16/09/2026 — transitions portées à 10 secondes

Dernière demande : 30 s de jour, transition nuit 10 s, 30 s de nuit, transition jour 10 s. Cycle de 80 s publié et vérifié sur Vercel sous 52502300 (estate-4). Neuf contrôles sur un cycle complet réussis ; build/lint réussis. Moteur public identique au commit, cycleSeconds=80 confirmé sans erreur. Rapports : Claude outputs/day-night-80-verification.json et day-night-80-public.json. Ce rythme remplace les transitions de 5 s ci-dessous ; GUI 1.0.179 inchangée.



## 16/09/2026 — cycle jour/nuit actualisé

Demande suivante de Donatien : jour 30 s, transition nuit 5 s, nuit 30 s, transition jour 5 s, en boucle (70 s). Publié et vérifié sur Vercel : commit 1517e4c0, moteur estate-3, GUI 1.0.179 inchangée. Un cycle complet vérifié au navigateur : neuf contrôles réussis ; build/lint réussis. Moteur public identique au commit et cycleSeconds=70 confirmé. Rapports : Claude outputs/day-night-verification.json et day-night-public.json. Ce rythme remplace le cycle de 20 s indiqué dans l'historique ci-dessous.




## 16/09/2026 — estate-2, GUI 1.0.179 : villa, animations et HVAC

Publication vérifiée : commit `a1ffde8780601040d039e53f1334cc0dbdc0efc4`, Vercel sert GUI 1.0.179 / estate-2. Seize ressources comparées au commit, 22 contrôles publics réussis, aucune erreur console/shader. Environ 55 images/s, premier rendu 3D observé 1,18 s, 383 Ko de ressources /plan3d/ transférées (mesure locale, pas toute la page). Bilan et limites matériels : `Claude outputs/codex-plan3d-villa2/LIVRAISON.md`.

Demande groupée de Donatien : sous-sol avec cinéma, sauna/hammam, garage et simulateur de golf (16 pièces showcase), grand salon/cuisine/salle à manger au RDC, rampe d'accès garage dégagée, fenêtres vers l'extérieur avec cours anglaises au sous-sol, bannes de chaque pièce RDC. Cinq circuits lumineux indépendants ; fondu linéaire 3 s conservé. Rideaux : flèches horizontales dans les GUI sources.

Audio : ondes sur sources vidéo et musique, diamètres selon le volume A/V ou le volume média distinct, arrêt sur mute/OFF ; cinéma 11 canaux dont arrière/surround/plafond. TV : programmes Canvas animés cinéma, football, tennis, course automobile, 15 images/s sans téléchargement de vidéos ni son. Jardin : luminaires, projections douces, clôtures/terrasse/piscine et lumière sous l'eau ; portiques caméra quatre coins, façades et portail. Cycle 20 s (deux demi-cycles de 10 s, transitions de 2 s). Eau déformée par shader et brise discrète sur une partie du feuillage, haies fixes ; réduction avec le niveau de qualité. Démo automatique : Smartphone 60 s, autres supports 10 s.

**Extension matérielle explicitement demandée** : ON/OFF + Auto/1/2/3 sur toutes les pages HVAC. Contrat JSON canonique, six joins digitaux 610–615, analogique 61, état par pièce C#, miroir EISC, signaux nommés du générateur SIMPL. Voir `projects/villa-crans/ch5/docs/HVAC-2026-09-16.md`. Les noms/activations réels de la configuration physique restent conservés ; la nouvelle architecture 3D appartient à la démonstration.

Tests locaux : 24 contrôles villa, 28 navigation, 23 fondu, 40 matrice 3D, 36 combinaisons GUI HVAC et 15 contrôles réception native sans simulateur ; 76 contrôles C#/JSON/SMW. Contraste pages/fenêtres/états dans les trois thèmes : aucun texte sous 4:1. Test dédié des délais 60/10 s, volume musique, pause vidéo et shader de l'eau. Mesure locale GPU 1280×800 DPR 1,5 : environ 55–60 images/s (pièce, villa fermée et ouverte). Limite : rendu stylisé enrichi, pas promesse de photoréalisme.

Preuves dans `Claude outputs/codex-plan3d-villa2/` ; dossier `livraison-hvac` : JSON, CH5Z assemblé, SMW préparé. Le projet SIMPL original et ses modifications locales sont préservés : copie = 715 ajouts, aucune suppression. **LPZ non compilé ; aucun déploiement matériel.** C# compilé, mais Windows bloque l'empaquetage final du CPZ (`MSB3441 / 0x800711C7`, contrôle d'applications). Premier CPZ d'essai écarté de la livraison. La mise en service nécessite les bons CPZ/LPZ et la recette Debugger.

Établi le 16 septembre 2026 à partir du ZIP de Donatien, des fichiers du dépôt et d'une lecture ciblée de conversations importées. Ce document est un point d'entrée local, à mettre à jour avec les décisions suivantes.

## Dernier lot livré — villa assemblée, fondu et contrôle global, 16/09/2026

Moteur `2026-09-16-estate-1`, source GUI **1.0.178**. Architecture alpine contemporaine assemblée en vue globale, pierre/bois/baies/toitures/balcons/bannes, jardin sculptural, bassin, ruisseau, clôture et caméras ; 37,7 Ko de nouvelles textures WebP CC0. Séquence enveloppe 0,48 s → séparation étages 0,95 s → zoom 1,35 s ; trajet direct entre pièces, retour réassemblé. Moteur `estate.js`, scène d'ensemble regroupée, ombres en cache. Dernier complément de Donatien : **fondu linéaire des éclairages sur 3 secondes**, interruption depuis le niveau visible, sans retard du retour des boutons ; implémenté seulement dans le rendu 3D.

**Nouvelle autorisation GUI explicite** : corriger Centralisation sur tous les châssis. Smartphone sans `receiveStateSelected` sur 8 commandes ; dalle/tablette avec CSS `[selected]` qui activait aussi `selected="false"`. Corrigés dans `src/iphone.html` / `src/index.html`, styles communs `src/themes/global-controls.css` (gris repos, vert actif, libellés cohérents, contraste ≥4:1, cibles ≥44 px), puis sync. Feedback local : interlocks, stores persistants comme commande confirmée, désélection après réglage individuel ; vacances ferme les stores. Moteurs 3D liés aux commandes globales. Le contrat v4 et le C#/SIMPL ne sont pas modifiés.

Recette : **38 + 28 + 23** contrôles 3D ; **36 combinaisons GUI / 1 292 assertions**, injection de retours booléens natifs sans moteur local ; audit de contraste existant pages/modales/états d'alarme réussi à 4:1. Build et lint réussis. Preuves et deux planches avant/après : `Claude outputs/codex-plan3d-estate/`. Mesures locales GPU : environ 52–55 images/s dans les trois vues (1280×800, DPR 1,5). Ces résultats ne promettent pas un rendu photographique ni des performances identiques partout.

Version GUI source incrémentée depuis la version locale préexistante 1.0.177 ; config canonique racine alignée. Copies config dans `src/`, ancienne archive CH5Z, QR et fichiers SIMPL préexistants préservés. Aucun CH5Z/CPZ/LPZ compilé ou déployé par ce lot ; ne pas confondre source, showcase et installation physique.

**Publication vérifiée : `7013f5d23301570fd3f724fb7b1edff0ef31c355` poussé sur main, puis servi par Vercel.** Les 14 fichiers publics contrôlés correspondent exactement au commit (SHA-256). Vérification sur le site public : version GUI 1.0.178, dix commandes globales avec un seul bouton sélectionné par section, villa assemblée → ouverture/éclatement → clic pièce 9 synchronisé dans le GUI, fondu linéaire de 3 secondes. Aucune erreur JavaScript. Mesure publique sur ce laptop, 1280×800, DPR 1,5, AMD Radeon 890M / Direct3D11 : 54,7 images/s sur quatre secondes, premier rendu 3D à froid à 1 765 ms, ressources 3D transférées 370 866 octets (~371 Ko). Preuve : `Claude outputs/codex-plan3d-estate/production-verification.json` ; ce sont des mesures de cet essai, pas une garantie sur d'autres appareils ou connexions.

## Dernier lot — navigation et obscurité, 16/09/2026

Commit local **c64af22b14100213c24fe29e99be626bca9812f5**, moteur `2026-09-16-atlas-2`. OFF coupe les lampes du plan même avec un ancien preset mémorisé ; snapshot des niveaux relu après sélection (analogiques identiques parfois non réémis). Lumière TV locale réduite, jour nul avec toutes occultations fermées. Vue pièce rapprochée ; façades complètes en vue globale, disparition avant zoom, clic pour ouvrir puis sélectionner une pièce dans le GUI existant. Transitions depuis la pose courante sans saut. Home cinéma : fenêtre/volet/store/rideaux sur mur ouest, mur nord réservé à l'écran, commandes et acoustique dégagées.

Build/lint OK ; **60 contrôles** (38 matrice, 22 navigation/feedback) réussis sur Vite preview, aucune erreur JavaScript. Le vrai thème Verre dépoli utilise `glass`, pas `frost` : erreur du script historique corrigée, avec assertion du sélecteur et captures après transition. Mesure locale accélérée : 53,3 images/s, 1280×800, DPR 1,5 ; pas une garantie universelle. Preuves : `Claude outputs/codex-plan3d-navigation/`, planche `planche-navigation.png` ; captures avant recréées depuis les modules de `5a54237f`.

**Publication vérifiée : `c64af22b` poussé après rétablissement du réseau.** Les quatre modules publics ont les mêmes SHA-256 que le commit ; version runtime `atlas-2`, ouverture des façades et sélection pièce 9 par clic vérifiées sur Vercel, aucune erreur JavaScript. Preuve `Claude outputs/codex-plan3d-navigation/production-verification.json`. Aucun réglage réseau modifié. Les modifications CH5/SIMPL préexistantes et la suppression du patch sont toujours hors lot.

**Suite demandée par Donatien, livrée dans `7013f5d2` ci-dessus** : la vue globale devient une villa de luxe assemblée, avec architecture soignée, pierre/boiseries, toitures, baies, balcons, stores bannes, éclairages extérieurs, jardin, sculpture, clôtures/caméras, ruisseau et piscine. Séquence naturelle : retrait enveloppe/toitures, éclatement des étages, zoom pièce ; changement de pièce déjà zoomée = trajet de caméra direct. Direction retenue et annoncée : villa alpine contemporaine. Fond showcase uniquement ; conserver fluidité et chargement rapide.

## Reprise active — amélioration 3D par Codex

Donatien a levé l'attente en demandant d'améliorer le décor, le réalisme et les détails des pièces, le cadrage iPhone en Mode Scène et la navigation à la molette. Priorités : fluidité et chargement rapide depuis Vercel. Périmètre limité au showcase, sans édition des GUI CH5 ou de leurs copies générées.

La version Vercel initialement lue correspondait au fichier de `571f7c76` (72 458 octets). L'ancienne règle CSS excluait explicitement le Mode Scène du décalage à gauche. Le nouveau moteur porte la version `2026-09-16-atlas-1`. Architecture et limites dans `apps/showcase/docs/plan3d.md`, preuves locales dans `Claude outputs/codex-plan3d/`.

**Publication vérifiée : `5a54237f` poussé sur main le 16/09/2026.** Vercel sert les trois modules et les trois textures avec les mêmes empreintes SHA-256 que les fichiers locaux. 32 contrôles fonctionnels passés, 24 captures, build/lint avec code 0. Mesure sur le site public via AMD Radeon 890M / Direct3D11, fenêtre 1280×609, DPR 1,5 : 55,7 images/s sur six secondes ; première scène rendue à 3 734 ms à froid dans cet essai ; ressources 3D transférées ~323 Ko. Le rendu logiciel SwiftShader du navigateur de test est nettement plus lent et n'est pas représentatif de cette mesure accélérée. Le réalisme progresse, sans prétendre atteindre le rendu photographique demandé. Planche : `Claude outputs/codex-plan3d/planche-codex.png`.

Les modifications locales CH5/SIMPL préexistantes et la suppression préexistante de `apps/showcase/correctifs-crestrongui.patch` sont hors lot et ne doivent pas être incluses dans sa publication. L'enregistrement du service worker absent a été retiré dans le cadre de cette reprise fonctionnelle, sans ajouter de cache hors ligne.

## Dernier complément — lot 3D du 16 septembre

Donatien a transmis ses demandes de détails 3D, le compte rendu Claude, une nouvelle version de « 00 — État actuel » et la planche `Claude outputs/planche-plan3d-details.png`. Synthèse avec provenance : `docs/SUIVI-3D-2026-09-16.md`.

- HEAD local revérifié : **571f7c76**, 16/09/2026 11:00:27 +02:00, après `5635e92c`. Le commit est présent ; publication Vercel et batterie `p3d_v5.mjs` sont rapportées par Claude, non revérifiées par Codex.
- Lot annoncé : relief montagne unique sans superposition, fenêtres/motorisations visibles, luminosité couplée aux scènes et aux occultations, TV détaillées. La planche fournie est une référence visuelle statique ; elle ne prouve pas l'absence de scintillement en mouvement.
- Nouveau défaut signalé hors lot : enregistrement de `/sw.js` absent, erreur « unsupported MIME type ». Choix retrait de l'enregistrement ou ajout d'un service worker **non tranché** ; ne pas corriger sur la seule base de ce compte rendu.
- Dernier document transmis : CPZ/LPZ rechargés le 16/09 ; CH5 dalle à recompiler. État rapporté, matériel non vérifié par Codex.
- Enregistrement du contexte seulement : l'attente d'un nouvel ordre pour modifier le site reste applicable.

## Ce qui a été récupéré

- Archive originale : `C:/Users/donat/Desktop/docs-md.zip`, 24 846 octets ; laissée intacte.
- Les huit documents Markdown ont été lus et copiés sans modification dans `docs/reprise-codex/2026-09-16/`. `manifest.json` en consigne les empreintes SHA-256.
- Guide importé accessible : `C:/Users/donat/.codex/plugins/cache/claude-cowork/anthropic-skills/1.0.0/skills/crestron-ch5-gui/SKILL.md`.
- Deux conversations importées portent le titre exact « CH5 Villa Crans » : identifiants `01a09294-fecf-7b13-8186-de40678c5419` et `01a09294-ff9d-7d22-84eb-19f34ee1d617`. Seules leurs dernières séquences ont été consultées ; ne pas prétendre avoir lu tout leur historique.
- Aucune conversation distincte nommée « Crestron CH5 Cowork » provenant de Claude n'a été identifiée dans la liste consultée. Le projet ChatGPT de ce nom existe, mais son dossier `sources/` était vide à la vérification.
- Le dépôt réel et ses instructions récentes sont présents sur ce laptop ; aucune récupération de code depuis Vercel n'a été nécessaire.

## Carte du projet

| Élément | Emplacement / rôle |
|---|---|
| Dépôt Git unique | `C:/dev/crestron/repo`, remote `https://github.com/donafcna/Crestronshowcase.git`, branche `main` |
| Site public | `https://crestrongui.vercel.app/`, code `apps/showcase` |
| GUI + backend C# slot 1 | `projects/villa-crans/ch5` ; `Backend/Backend/ControlSystem.cs` |
| SIMPL slot 2 | `projects/villa-crans/simpl`, génération `contract/generate_slot2.js` |
| Contexte GUI récent | `projects/villa-crans/ch5/CONTEXTE-CLAUDE.md` et `CHANGELOG.md` |
| Contexte site | `apps/showcase/CLAUDE.md`, `README.md` (journal) |
| Instructions Codex | `AGENTS.md` à la racine du dépôt |

Les anciens dossiers sont sous `C:/dev/crestron/_OBSOLETE_villacrans-ch5` et `_OBSOLETE_villacrans-simpl`. Ne pas les utiliser comme source active.

## Intention et workflow

Vitrine publique et outil de démonstration commerciale Fréquence TV : rendez-vous, devis/appels d'offres, salons, envoi d'un lien, manipulation autonome par le prospect. Supports d'usage : iPad, laptop, iPhone. Montrer la valeur des interfaces CH5 modernes et limiter les maquettes spécifiques à chaque affaire.

Une source GUI, deux modes : déploiement avec C# / SIMPL pour les appareils réels ; showcase avec feedback frontend et curseur de démonstration. Flux : GUI source → vérification → synchronisation du showcase → vérification du site → publication dans une tâche qui la prévoit. CH5Z / CPZ / LPZ ont leur propre chaîne de compilation et de recette.

Site React 19 / Vite 8, lint oxlint. Éditorial dans `src/data/projects.js` et `company.js`. Langues FR/EN/DE, interfaces réelles ou concepts, liens profonds, QR, fiches produits, mode mobile `#demo`, PWA. L'export du 11 septembre recense 18 interfaces ; ce nombre n'a pas été recompté dans le code lors de cette reprise.

## Consignes directes de Donatien — 16 septembre 2026, après la reprise

- **Mémorisation autorisée, implémentation en attente** : Donatien copie ses derniers prompts Claude et a demandé de ne rien faire avant nouvel ordre. Il a ensuite explicitement demandé de les conserver dans le contexte/instructions. Aucun changement du site, essai 3D ou déploiement n'est demandé par cette transcription.
- **Vocabulaire confirmé** : `docs/VOCABULAIRE-MODES.md` reprend la référence qu'il a fournie. Mode normal, Mode Scène, Plein écran et F11 sont distincts. Plein écran = GUI seule dans un nouvel onglet, dalle/tablette uniquement, jamais smartphone ; `/3`, `/4`, Échap. Taille réelle / Responsive uniquement en Mode Scène. Références : TSW-1070 10,1 pouces 1920 × 1200, iPad A16 11 pouces, iPhone 16 Pro ; Mode Dev avec mesures, règle 100 mm, retours.json.
- **Périmètre des plans 3D** : fond du site showcase Vercel uniquement ; rien ne doit changer dans les GUI des châssis Dalle, Tablette et Smartphone, ni dans le CH5 de déploiement.
- **Intention 3D transmise** : villa aussi réaliste que possible, reprenant les pièces listées dans le GUI ; sélection d'une pièce → zoom en 3D vers cette pièce ; lumières, TV, haut-parleurs, climatisation/thermostat visibles ; commandes du GUI → animations correspondantes (scènes lumineuses, TV allumée/éteinte, interface Apple TV affichée sur la TV et pilotée par la télécommande du GUI). Il s'agit d'une demande historique à conserver, pas d'une nouvelle validation de son exécution complète.
- **Retour arrière souhaité** : reprendre la version de référence si les essais 3D échouent. La capture mentionnée et l'identifiant exact de cette version n'ont pas été fournis dans cette conversation ; ne pas attribuer arbitrairement ce rôle à HEAD.
- **Dernier prompt transmis : vidéo par défaut, 3D sur cas spécifiques**. Pour le petit écran du laptop Lenovo (environ 14 pouces selon Donatien), activer les plans 3D seulement lorsque le châssis Smartphone est sélectionné. C'est le support choisi dans le showcase, pas une détection de téléphone visiteur.
- **Placement dans ce cas** : châssis Smartphone le plus à gauche possible, centrage de la pièce également décalé à gauche pour éviter qu'elle soit derrière QR Code, Fiche PDF ou le sélecteur de châssis. Cadrer dans l'espace effectivement libre.
- **Cas futurs** : Donatien poursuivra les essais sur différentes tailles d'écran et indiquera les combinaisons autorisées. Aucun breakpoint CSS ni dimension exacte n'est encore fixé. Ne pas étendre la 3D à tous les écrans sur la seule base de la sélection Smartphone.
- **Écart observé à examiner lors d'une reprise autorisée** : le code lu précédemment autorise `phone` à toute largeur. Cette observation reste distincte de la demande portant sur des tailles d'écran spécifiques.

## Relevé initial sur disque le 16 septembre — avant le lot 571f7c76

- HEAD local au premier relevé : `5635e92c`, 16/09/2026 10:36:14 +02:00, « Site : vidéo par défaut, plan 3D seulement pour le châssis Smartphone (PLAN3D_RULES), châssis calé à gauche ». Remplacé ensuite par `571f7c76`, voir le complément en tête.
- `origin/main` localement mémorisé ne présente pas d'avance/retard dans `git status`. Aucun fetch ni contrôle du serveur GitHub effectué : cela ne prouve pas l'état distant actuel.
- Plusieurs modifications locales préexistantes : archive CH5Z, fichiers de version/build, QR, config copiée, fichiers SIMPL et sauvegardes. Elles doivent être préservées ; aucune n'a été créée ou corrigée par cette reprise.
- `ch5/version.json` et `ch5/src/version.js` indiquent **1.0.177** ; `src/build_date.json` indique `16/09/2026 05:58:56`.
- `ch5/villa_config.json` indique `meta.mode=deploiement`, `meta.version=1.0.170`, contrat **v4**, `blocsPiecesGui.actif=false`. L'écart des versions est constaté, pas corrigé.
- `apps/showcase/public/showcases/villa-gemini-frequencetv/version.js` contient **v-test**. Ne pas présenter cela comme une version de production vérifiée.
- Code C# : présence de `RouteGlobalDigitalToActiveRoom`, `RouteGlobalAnalogToActiveRoom` et routage vers la pièce active. Générateur SIMPL : pilotages globaux et bloc CVC réduit par pièce.
- Code site : `PLAN3D_RULES = [{ device: "phone" }]` pour Villa Crans ; `showEmbedTool=false` par défaut.
- Aucun build, test navigateur, push, contrôle de production ou déploiement sur CP4/TSW effectué pendant cette reprise documentaire.

## Informations dépassées et contradictions à conserver visibles

| Sujet | Ancienne information | État récent / règle de reprise |
|---|---|---|
| Joins | Export v2 ; mémoire du 11 septembre v3 par pièce | Contrat v4 dans la config et le code : pilotages globaux, routage de la pièce active ; ne pas réactiver v3 |
| Versions | Export 1.0.166 / 1.0.168 | Fichiers source locaux 1.0.177, config racine 1.0.170, showcase v-test : distinguer chaque artefact |
| Compilation CPZ / LPZ | Tableaux : à recompiler | Dernier paragraphe du contexte : rechargés par Donatien le 16/09 ; installation réelle non vérifiée ici |
| CH5 | Journal : 1.0.177 à compiler | Fichiers de build modifiés et archive présente ; leur correspondance aux derniers changements et à l'appareil reste à établir |
| Vercel | Ancienne mémoire : repo non connecté, CLI manuelle | Notes récentes : Git `main` déclenche Vercel ; intégration distante non inspectée ici |
| Accès Git | Anciennes limites du proxy et bundles Claude | Spécifiques à l'ancien environnement ; ne pas supposer qu'elles s'appliquent à Codex |
| Arborescence | Desktop/VillaCrans ; showcase décrit comme clone séparé | Un seul dépôt à `C:/dev/crestron/repo` confirmé par Git |
| Outils de démo | Présentation / Plein écran en barre ; démo réservée au PC | Code relevé : QR / Fiche PDF, bouton Plein écran masqué ; définition ensuite confirmée par Donatien dans VOCABULAIRE-MODES.md, dalle/tablette uniquement |
| 3D | Absente des exports ; ancien essai dans la GUI | Fond du site uniquement, vidéo par défaut ; demande confirmée : cas écran/support validés, Lenovo petit écran + Smartphone ; code observé phone toutes largeurs à distinguer |
| Test 3D | CLAUDE.md propose encore de vérifier une toile sur wallpanel | Contradictoire avec la règle phone actuelle ; adapter les vérifications au comportement demandé |

Le fichier `docs/03_CONTRAT_JOINS.md` est signalé encore en v3 par le contexte du dépôt. Le relire et le mettre en cohérence lors d'une tâche sur le contrat ; ne pas changer le comportement pour se conformer à une doc ancienne.

## Règles à maintenir

Les consignes actives sont réunies dans `AGENTS.md`. Points sensibles : correction des composants partagés, source GUI unique, aucune modification directe de la copie générée, cohérence entre supports, absence de son et de défilement hors exceptions, SVG, contraste 4:1, cibles tactiles ≥40 px, trois thèmes, preuves visuelles et recette sur les modes/supports concernés.

Le protocole Claude comprend un cadrage préalable pour les tâches >30 minutes et l'autonomie après accord. Une reprise documentaire autorisée ne constitue pas une demande de déploiement. La prochaine tâche doit conserver les décisions et autorisations explicites de Donatien.

## Références à charger selon la prochaine tâche

- Contrat, configuration, SIMPL, recette : `projects/villa-crans/ch5/docs/01_SPECIFICATION.md` à `09_RECETTE_SUPPORTS_PHYSIQUES.md`, uniquement les sections pertinentes. Ces documents ont été localisés, pas intégralement relus pendant cette reprise.
- Recette prioritaire historique : deux supports affichant simultanément deux pièces ; feedback et joins des télécommandes ; versions réellement installées.
- Reste historique à revalider : noms de test dans la config, documentation joins v4, câblage/recette slot 2, cohérence des quatre artefacts.
- Site/marketing : contact à confirmer, médias FTV, Analytics, petits écrans, distribution mobile ; statut actuel de ces TODO non vérifié.
- UI : directions Obsidienne / Atelier clair / Spectre, FTV Home réinterprété aux couleurs FTV. Les 67 captures Crestron Home et les anciens artefacts de mood board sont mentionnés mais absents du ZIP ; les retrouver uniquement si la tâche les requiert.
- Les documents `21-directions-graphiques.md`, `31-instructions-projet.md` et `journal/` sont cités dans l'ancienne mémoire mais ne figurent pas dans les huit fichiers exportés. Une partie de leur contenu est couverte par `40-references-ui` et `30-protocole-travail` ; l'exhaustivité historique n'est pas garantie.

## Entretien du contexte

Conserver les huit exports et leur manifeste intacts. Mettre à jour ce point d'entrée, le contexte du périmètre et son journal à la fin des travaux significatifs. Distinguer systématiquement : demandé, écrit, testé, compilé, publié et vérifié sur matériel. Les résultats rapportés par Claude restent historiques tant qu'ils n'ont pas été reproduits.


## 20/09/2026 — reprise « Maquette 3D bijouterie »

Donatien a demandé de reprendre et continuer. Dernières consignes retrouvées : TSW-1070 en graphiques HTML/CSS sans modèle 3D ; passages bâbord et tribord du yacht de l'arrière vers l'avant à tous les niveaux. Réalisé dans le showcase VCA/Sunrays : cartes HTML/CSS sur dalle, fond 3D Smartphone conservé, dix passages conceptuels dégagés dans les coupes et inclus dans le glTF. 214 contrôles ciblés et 43 contrôles de fond Smartphone (50 états) réussis ; build/lint réussis avec avertissements préexistants. Documentation et preuves : `apps/showcase/docs/vca-sunrays.md`, `docs/verification/2026-09-20-panels-passages/`. Aucun matériel déployé.


## 21/09/2026 — reprise Centralisation iPhone et publication Vercel

Demande explicite de Donatien : publier sur Vercel la mise à jour fournie dans le paquet C1. La source commune `projects/villa-crans/ch5/src/iphone.html` reçoit le diagnostic `CENT-20260921-1`. Sa copie publique est régénérée par la fonction `patch_html` de `scripts/sync-villa-crans.py`, limitée à cette page pour conserver les autres évolutions déjà présentes. Seul le bloc de diagnostic change ; boutons natifs CH5, joins, styles, configuration de démonstration et moteur `local-feedback.js` conservés.

La mesure démarre à la pression, conserve les retards jusqu’à 45 secondes, distingue callback/DOM/frame et exclut les appuis ambigus ou sur un état déjà actif. Le bandeau reste masqué par défaut, cinq appuis sur Centralisation pour l’afficher. En mode showcase, les diagnostics restent locaux : aucun envoi sur le sériel 100. Cette publication ne démontre pas la disparition du retard sur l’iPhone relié au CP4.

Vérifications : build et lint réussis (avertissements existants), 14 tests du diagnostic réussis, syntaxe des scripts inline et identité des attributs des boutons contrôlées. La batterie générale donne 39/43, avec les quatre mêmes échecs sur le commit initial inchangé : configuration `meta.version=1.0.201` contre profil de qualification `1.0.196`. Le profil de qualification matériel n’a pas été assoupli pour publier la vitrine. Chromium se ferme par SIGSEGV avant le chargement ; aucun résultat de rendu, de contraste ou de recette Safari/iPhone n’est revendiqué. Les écrans de présentation et fiches commerciales ne changent pas. Preuves : `docs/verification/2026-09-21-centralisation-c1/` à la racine.

Artefacts : source iPhone C1 et showcase mis à jour ; aucun CH5Z, CPZ ou LPZ compilé ou envoyé. Le C# C1 reste dans le paquet remis à Donatien et n’est pas ajouté au dépôt par cette publication du site. Le correctif matériel complet conserve son installation et sa recette séparées.


## 26/09/2026 — Hotel Brassus iPhone, vitrine 2.1.1

Demande explicite : adaptation portrait et ouverture Hôtellerie sur Hotel Brassus / Smartphone avec maquette 3D. Dalle TSW, PC/XPanel et Tablette : GUI CH5 original et vidéo de fond. Adaptation dédiée `phone.html/css/js`, commandes locales sans transport matériel, sept espaces, trois thèmes Original/Clair/Sombre conservés, scènes/circuits, volume/sources/mute, stores avec arrêt et consigne. États conservés entre espaces durant la session. Cette adaptation web ne constitue pas un CH5Z livré au matériel. Source CH5 de l'hôtel et copie native inchangées.

La maquette ouvre en vue globale, puis suit le niveau d'un espace sélectionné ou d'une commande d'éclairage. Éclairages synchronisés, molette de zoom, cadrage entre le téléphone et la colonne en modes normal/Scène. Les limites architecturales de la maquette restent celles documentées au lot 2.1.0. Aucun modèle 3D chargé en fond sur les trois grands supports.


## 26/09/2026 — Référence Smartphone commune : grand iPhone

À la demande explicite de Donatien, tous les projets utilisent le grand format portrait iPhone 18 Pro Max (Apple FR vérifié le 26/09/2026 : https://www.apple.com/fr/iphone-18-pro/specs/). Écran 6,9 pouces, 1320 × 2868 pixels, boîtier 78 × 163,4 mm. Configuration partagée `src/data/devices.js` : écran 440 × 956 unités CSS, GUI 440 × 863 après zones réservées de présentation 59/34, boîtier graphique 488 × 1022. La taille physique calibrée et le Mode Scène utilisent cette même configuration. Remplace la référence iPhone 16 Pro antérieure ; aucune variante par projet.


## 26/09/2026 — Accès mobile exclusivement simplifié, vitrine 2.1.2

Demande de Donatien : smartphones et tablettes affichent seulement le catalogue tactile et son lecteur de GUI. Le choix est fait avant tout rendu du site complet, pour toutes les routes, paramètres et ancien hash #site. Les liens #demo/projet restent utilisables et le retour ouvre le catalogue. Suppression du bouton « Ouvrir le site complet » dans le catalogue et la page indisponible. Les ordinateurs conservent le site complet. Détection iOS/Android et iPad avec user-agent de bureau ; rotation iPad maintenue en tablette.

## 26/09/2026 — Hotel Brassus, enveloppe et caméra 2.1.3

Enveloppe extérieure inspirée du bâtiment réel ajoutée à la maquette interprétée. Vue complète avec murs, vitrages, bois, toitures/terrasses végétalisées, liaisons inclinées et photovoltaïque ; coupe au passage dans un espace. Caméra par zone avec transitions de type Villa Crans. Molette vers le bas : bâtiment complet en un geste. Molette vers le haut : zoom progressif sur la dernière zone. Sources visuelles officielles Hôtel des Horlogers/BIG/CCHE et Swiss Arc documentées dans `apps/showcase/docs/hotel-brassus.md`.

## 26/09/2026 — Auditorium Richmond, lumière et vidéo 2.1.4

Ajout de quinze faisceaux/projecteurs et seize bandeaux LED synchronisés dans le modèle 3D. Les changements de scène et de couleur utilisent un fondu interpolé de quatre secondes. Sur Smartphone, l'enregistrement est intégré à la carte PTZ ; la prévisualisation d'estrade suit pan, tilt, recentrage et zoom. La page Écran propose quatre simulations cohérentes jusque sur la texture du mur LED 3D : climat, présentatrice fictive du journal de 20 h, salle live et logo officiel Fréquence TV. Build, lint, interactions, absence de défilement interne, contenu 3D et durée du fondu vérifiés localement.

L'Étoile Club utilise un menu de zone sous son titre. La molette choisit uniquement la vue bâtiment ou la dernière salle sélectionnée, avec interpolation de caméra. L'onglet Espaces est remplacé par Écran ; quatre sources vidéo modifient directement la texture du modèle 3D. Les aperçus sous les boutons sont supprimés sur les Smartphones du club et de l'auditorium. Les enseignes propres aux salles du club sont placées derrière l'écran vidéo afin de ne pas masquer la source active.

## 26/09/2026 — Hotel Brassus, éclairages et rideaux 2.1.5

Ajout dans toutes les pièces de 783 éléments lumineux (corniches, spots, appliques, balises basses et luminaires suspendus), avec vingt sources volumétriques. Les scènes 0/35/70/100 % agissent sur la pièce sélectionnée. Cycle automatique de dix secondes jour puis dix secondes nuit. Les deux stores de Bar, Restaurant et Séminaires animent des rideaux sur les vitrages. Navigation réduite à deux vues : bâtiment complet ou dernière pièce centrée. Recette locale : niveaux 0/100 %, progression des rideaux, cadrages 150/30 et bascule jour/nuit vérifiés sans erreur JavaScript.

## 26/09/2026 — Filtre de secteurs mobile 2.1.6

Ajout au catalogue tactile d'un sélecteur de secteurs sous le logo Fréquence TV. Le filtre conserve uniquement les projets compatibles avec le téléphone ou la tablette et appartenant au secteur choisi. Le libellé « Interfaces Crestron CH5 — Frequence TV » devient « Interface Crestron CH5 » dans les trois langues du catalogue.
