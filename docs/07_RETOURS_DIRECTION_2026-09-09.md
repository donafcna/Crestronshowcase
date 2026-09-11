# 07 — Retours de la direction (09.09.2026)

Source : e-mail d'Antoine Dändliker du 09.09.2026 à 16h54 après revue de l'interface sur le
site showcase (« *Globalement, l'interface est réussie […] il reste plusieurs petites
corrections avant de la présenter comme une version finalisée* »).

Appliqué le 09.09.2026 dans le projet **VillaCrans** (`src/index.html`, `src/iphone.html`,
`villa_config.json`) et dans la copie embarquée du **showcase**
(`public/showcases/villa-gemini-frequencetv/`, branche `retours-direction-0909`).

État : **code modifié, non compilé, non déployé** — `deploy.ps1` puis validation sur la dalle
TSW-1070 et le XPanel restent à faire (voir § Recette).

---

## 1. Scènes d'éclairage : enregistrement et rappel fonctionnels (mode démo inclus)

> *« Chaque scène doit mémoriser les niveaux d'éclairage et les positions des stores, puis
> restituer visuellement ces valeurs lors de son rappel. Ajouter une confirmation après
> l'enregistrement et le rappel de la scène. »*

Implémenté dans un module autonome `VillaUX` (fin de `src/index.html`, bloc
`<script>` commenté « Retours direction du 09.09.2026 »). Il fonctionne aussi bien sur la
dalle / le XPanel (CP4) qu'en démo sans automate.

| Geste | Effet |
|---|---|
| **Appui long ≈ 1,2 s** sur une scène (onglet Lumières ou fenêtre Circuits) | Enregistre pour la pièce active : niveaux des 10 circuits (71-80) **et** position visuelle des 6 moteurs (0 = ouvert … 1 = fermé). Toast « 💾 Scène « REPAS » enregistrée ». |
| Bouton **💾** à côté d'une scène (fenêtre Circuits) | Même chose (compatibilité avec l'ancien bouton, `saveCurrentScene(1..4)`). |
| **Appui simple** sur une scène | Le `<ch5-button>` envoie le join comme avant (51-54) ; 120 ms plus tard le module remet les curseurs aux niveaux mémorisés, **publie les analogiques 71-80** (le CP4 reprend donc les niveaux) et anime les stores. Toast « ✔ Scène « REPAS » rappelée » (ou « … activée » si rien n'est mémorisé). |
| Point vert ● sur une scène | Une mémoire existe pour cette scène dans la pièce active. |

Détails :

- Stockage `localStorage`, clé `villa_scene_<idPièce>_<1..4>`, contenu
  `{ lights: { "71": 36044, … }, blinds: { "1": 1, "3": 0.5, … }, ts }`. La mémoire est donc
  **par périphérique** (dalle, XPanel, iPad ont chacun la leur) — c'est le compromis retenu
  pour ne pas toucher au C#. Une centralisation côté CP4 (sériel 420 ou nouveau join) est
  possible plus tard.
- L'instantané est pris **au `pointerdown`**, avant que le `<ch5-button>` n'envoie le join
  (le processeur — ou le moteur de démo — applique la scène dès l'appui).
- Les événements synthétiques (démo automatique du showcase) déclenchent bien le rappel et
  les toasts, mais jamais l'ouverture d'une fenêtre.
- Le moteur de démo du showcase (`js/local-feedback.js`) lit la même clé `localStorage` et
  applique les niveaux mémorisés au lieu de ses presets, et ne désélectionne plus une scène
  quand un curseur renvoie la valeur qu'il a déjà.
- Le C# (`ControlSystem.cs`) est inchangé : une scène y règle toujours `LightLevel1`
  (master) ; les circuits suivent les analogiques 71-80 publiés par le GUI au rappel.

## 2. Premier appui sur une source = activation + télécommande

> *« Premier appui sur la source → activation + ouverture immédiate de la télécommande
> correspondante. »*

`window.selectSourceSim` est enveloppé par le module : après l'activation (inchangée),
il ouvre `openSourceControlModal('appletv' | 'skyq' | 'swisscom' | 'iptv')` pour les
joins 151-154 et le **lecteur média** pour MUSIQUE (155). Anti-rebond 800 ms (un appui
déclenche plusieurs appels dans le code existant) ; uniquement sur un événement utilisateur
réel (`isTrusted`). Les roues crantées sous les sources restent fonctionnelles.

`iphone.html` : même comportement dans `generateDynamicUI` (sources 1-4 ; la musique n'a
pas de télécommande sur iPhone).

## 3. Fil d'actualités → bandeau « État de la villa »

> *« Le fil d'actualités Le Monde et le bandeau « Dernières actualités » détournent
> l'attention. Je les supprimerais ou les remplacerais par des informations utiles :
> alarmes, portes ouvertes, météo, consommation ou état technique. »*

- **Supprimé** : face B « RSS » du widget météo, l'alternance météo/RSS (6 s), `fetchLiveRss`,
  `mockArticles`, le proxy `api.allorigins.win` et le bandeau défilant (`marquee`). Le widget
  météo (Open-Meteo, Nyon) reste affiché en permanence.
- **Ajouté** : bandeau statique `#news-banner` (même identifiant, donc le réglage
  `widgets.bandeauActualites` de `villa_config.json` continue de l'afficher/masquer),
  rempli par `VillaUX.renderStatus()` à partir des **retours réels** :

| Élément | Source |
|---|---|
| 🔒/🔓 Alarme désactivée / partielle (n/4) / armée | digitaux 301-312 (partitions) |
| 🚪 Portes : … | sériel **111** (hors contrat, optionnel : masqué si vide) |
| 📺 Source active ou « Multimédia en veille » | digitaux 151-155 |
| 🌡️ 21.5 → 22.0 °C | sériels 32 / 34 |
| ⚡ Conso : … | sériel **112** (hors contrat, optionnel : masqué si vide) |
| ✅/⚠️ Processeur connecté / hors ligne · 🧪 Mode démonstration | `isCp4Connected` (XPanel) ou premier retour non nul (dalle) ; `window.Villa` = démo |
| 🏷️ v1.0.xxx | `window.appVersion` |

  Les sériels 111/112 sont à câbler côté C# / SIMPL si l'on veut « portes ouvertes » et
  « consommation » sur site (le showcase les simule). Tant qu'ils sont vides, rien ne
  s'affiche : **aucune donnée fictive sur la dalle**.

## 4. Majuscules uniformisées (sentence case)

> *« Uniformiser les majuscules : Salle à manger, Suite parentale, Suite invités, Contrôle
> global, Mode actif, Consigne demandée, Dernières actualités. »*

- Libellés HTML de `index.html` / `iphone.html` (boutons d'entête, cartes, overlays,
  partitions d'alarme, presets globaux, noms de pièces de repli).
- Les 5 dictionnaires `translations` (FR/EN/ES/DE/RU ; l'allemand garde ses majuscules de
  substantifs).
- `villa_config.json` : `valeursParDefaut` (icônes, circuits, scènes de stores, moteurs),
  noms des pièces / circuits / scènes, et **clés + valeurs** de `traductions` (la clé est le
  nom français : elle doit suivre la même casse, sinon la traduction ne matche plus).
  Les libellés tout en majuscules (OFF, CINÉMA, REPAS, TOTAL, CHAUFFAGE) et les acronymes
  (LED, TV, HVAC) sont conservés. Copies `src/villa_config.json` / `src/villa_config.js`
  régénérées à l'identique de ce que fait `deploy.ps1`.
- « Dernières Actualités » n'existe plus (remplacé par « État de la villa »).

## 5. Traductions

> *« Voir les problèmes de traduction. »*

- **32 nouvelles clés** dans les 5 langues : `alarm_btn`, `cameras_btn`, `global_btn`,
  `scenes_title`, `scenes_hint`, `source_ctrl_title`, `media_title`, `media_volume`,
  `security_*`, `cameras_title`, `global_*` (titres et descriptions du Contrôle global),
  `status_*` (bandeau d'état), `scene_saved` / `scene_recalled` / `scene_activated`.
  Les libellés correspondants portent désormais `data-i18n` (ils restaient en français
  quelle que soit la langue).
- `ru.active_piece` était `"PIECE ACTIVE :"` (non traduit) → « АКТИВНАЯ КОМНАТА : ».
- `iphone.html` : dictionnaire `ru` tronqué **réparé** (12 clés + fermeture de
  `translations`). C'était le bug P0 de l'audit du 02.09 : tout le script métier iPhone
  était rejeté par le navigateur.
- Reste à faire (hors périmètre de ce lot) : le panneau **Admin** et le **Lecteur média**
  (titres de morceaux) restent en français ; le nom de la pièce du sériel 10 arrive en
  majuscules depuis le C# (`Piece.Nom`), donc « SALON » dans l'entête quelle que soit la
  langue.

## 6. Sons cachés supprimés (demande de Donatien, 09.09.2026 soir)

- `index.html` : plus de `onclick` sur le widget météo (au passage : `openWeatherWebsite`
  n'était jamais défini dans le projet source → `TypeError` à chaque appui, bug P5 de
  l'audit ; et l'attribut `style` dupliqué du `<div>` est corrigé) ni sur le titre
  « Sélection de la source audio et vidéo » (`playAudioDemo`). `weatherWidgetClicked`,
  `playFunnySound`, `playSynthSound` et la balise `<audio id="funny-audio">` sont retirés.
  Le join 56 (`Meteo.EasterEgg`) n'est donc plus émis par le GUI.
- `iphone.html` : triple tap sur la météo, `playFunnySound` / `playSynthSound` et `<audio>` retirés.
- `src/funny.mp3` peut être supprimé du projet (plus référencé) — il reste dans l'archive
  tant que le fichier est dans `src/`.

---

## Recette à faire sur site

| # | Test | Attendu |
|---|---|---|
| 1 | Dalle : régler 2 circuits + descendre un volet, appui long 1,2 s sur REPAS | Toast « enregistrée », point vert sur REPAS, curseurs inchangés |
| 2 | Modifier les circuits, remonter le volet, appui simple sur REPAS | Curseurs reviennent aux niveaux mémorisés, volet redescend, toast « rappelée », feedback REPAS allumé (join 53) |
| 3 | XPanel sur la même pièce | Le CP4 a bien repris les niveaux (curseurs alignés) ; la mémoire de scène du XPanel est indépendante de celle de la dalle |
| 4 | Appui sur SKY Q | Source active + télécommande SKY Q ouverte ; MUSIQUE → lecteur média |
| 5 | Bandeau bas | Alarme selon les partitions, source active, température → consigne, « Processeur connecté », version ; pas de « Portes » ni « Conso » tant que 111/112 sont vides |
| 6 | Langues EN / DE / RU | Boutons d'entête, télécommande, sécurité, contrôle global, bandeau et toasts traduits |
| 7 | iPhone (0x06) | Le GUI répond (console CP4 incluse) ; appui sur une source ouvre la télécommande |
| 8 | Démo automatique du showcase | Les scènes et toasts fonctionnent, aucune fenêtre ne s'ouvre toute seule |

## Fichiers modifiés

| Fichier | Modification |
|---|---|
| `src/index.html` | face RSS + bandeau + code RSS retirés ; bandeau d'état ; libellés ; dictionnaires ; CSS ; module `VillaUX` (fin de page) ; sons cachés retirés |
| `src/iphone.html` | dictionnaire `ru` réparé ; source → télécommande ; libellés ; son caché retiré |
| `villa_config.json`, `src/villa_config.json`, `src/villa_config.js` | sentence case (566 libellés), descriptions des widgets, `dateModification` |
| `docs/06_TODO.md` | entrées cochées / ajoutées |
| showcase `public/showcases/villa-gemini-frequencetv/{index,iphone}.html`, `config.js`, `config.json`, `js/local-feedback.js` | mêmes retours sur la copie v1.0.149 (joins v1 21-24) + overlays télécommande / lecteur média réinjectés |
