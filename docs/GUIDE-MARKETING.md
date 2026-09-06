# Guide marketing — vitrine Crestron CH5

Site public : **https://crestrongui.vercel.app**

Ce guide s'adresse à l'équipe marketing / commerciale de Fréquence TV. Il explique
comment **utiliser** la vitrine en rendez-vous et comment **modifier son contenu**
sans connaissance technique particulière (un éditeur de texte suffit ; les
modifications sont publiées par Donatien via Git / Vercel).

---

## 1. Utiliser la vitrine en rendez-vous client

### Envoyer un lien précis
Chaque écran a sa propre adresse. Exemples :

| Ce que le client verra | Adresse |
|---|---|
| Accueil | `https://crestrongui.vercel.app/` |
| Toutes les interfaces | `/interfaces` |
| Un secteur (ex. hôtellerie) | `/interfaces/hotellerie` |
| Une interface précise | `/interfaces/residentiel/villa-gemini-frequencetv` |
| … sur un support précis | `/interfaces/residentiel/villa-gemini-frequencetv/phone` |
| Argumentaire « Pourquoi le CH5 ? » | `/pourquoi-ch5` |
| Contact / demande de démo | `/contact` |

Supports possibles en fin d'adresse : `phone`, `tablet`, `wallpanel` (TSW-1070),
`wallpanel_hd` (TSW-1080), `desktop` (Xpanel).

Le bouton **« Copier le lien »** au-dessus de l'appareil copie l'adresse exacte de
ce que vous regardez.

### Personnaliser au nom du client
Bouton **« Nom du client »** → saisir par ex. *Villa Dupont*. Le nom apparaît sur
l'appareil (barre d'adresse du Xpanel, titre), dans le lien copié, sur le QR code
et sur la fiche PDF. Le lien reste valable : `…/phone?client=Villa+Dupont`.

### Faire tester sur l'iPad ou le téléphone du client
Bouton **« QR code »** : le client scanne et ouvre la même interface sur son
appareil, avec le nom personnalisé.

### Mode présentation (salon, showroom, écran d'accueil)
Bouton **« Présentation »** : plein écran, puis défilement automatique de tous les
supports (7 s chacun) et de tous les projets du secteur affiché. `Échap` pour sortir.

Pour une tablette laissée en libre-service, ajoutez `?kiosk=1` à l'adresse
(ex. `https://crestrongui.vercel.app/interfaces/tous?kiosk=1`) : la présentation
démarre seule et **reprend après 45 s d'inactivité** si quelqu'un a touché l'écran.

### Produire du contenu (LinkedIn, brochure, devis)
- **« Capture »** : télécharge un PNG haute définition de l'interface dans son
  boîtier (dalle, iPad, iPhone ou Xpanel), fond transparent — prêt pour un post
  ou une présentation. Pour l'interface réelle *Villa Crans-Montana* (affichée dans
  un cadre isolé), utilisez « Ouvrir en plein écran » puis la capture d'écran de
  votre ordinateur.
- **« Fiche PDF »** : ouvre une fiche A4 (description, points clés, supports, QR
  code vers la démo, coordonnées). Cliquez « Imprimer / Enregistrer en PDF ».
- Les aperçus de liens (LinkedIn, WhatsApp, Teams) affichent automatiquement
  l'image `public/og-image.jpg`.

### Langues
Le sélecteur en haut à droite propose **FR / EN / DE**. La langue du visiteur est
détectée automatiquement ; on peut la forcer dans un lien avec `?lang=en`.

### Savoir ce que regardent les visiteurs
Le site est prêt pour **Vercel Web Analytics** (sans cookie, conforme RGPD). Il
suffit de l'activer une fois : Vercel → projet *crestrongui* → onglet
**Analytics** → *Enable*. Les pages, secteurs et projets les plus consultés
apparaissent ensuite dans ce même onglet.

---

## 2. Modifier le contenu

Tout le contenu éditorial est dans **deux fichiers** :

- `src/data/projects.js` — secteurs, supports, projets (textes FR / EN / DE).
- `src/data/company.js` — coordonnées, showrooms, horaires, réseaux sociaux.

Les textes des pages « Pourquoi le CH5 ? », « Contact » et de la fiche PDF sont en
tête de leurs fichiers respectifs : `src/pages/WhyCH5.jsx`, `src/pages/Contact.jsx`,
`src/pages/ProjectSheet.jsx` (bloc `TEXT = { fr: …, en: …, de: … }`).
Les libellés de navigation sont dans `src/data/uiTranslations.js`.

### Corriger un texte
Ouvrir `src/data/projects.js`, chercher le projet (par son `id` ou son `name`),
modifier le texte entre les backticks `` ` `` dans la langue voulue. Ne pas
supprimer les virgules ni les backticks.

### Changer le statut d'un projet
`status: \`realisation\`` = projet livré par Fréquence TV (badge vert « Réalisation
Fréquence TV », mis en avant sur l'accueil).
`status: \`concept\`` = démonstration / étude de style.
**Ne passez un projet en `realisation` que si le client a accepté d'être cité.**
Le champ `client` est le libellé affiché ; restez générique pour les concepts.

### Ajouter un projet à partir d'une vraie interface CH5 (le plus simple)
1. Copier le dossier exporté du projet CH5 (`index.html`, `js/`, `themes/`…) dans
   `public/showcases/<identifiant>/` (identifiant sans accent ni espace, ex.
   `hotel-lausanne`). Si une version smartphone existe, la nommer `iphone.html`.
2. Dans `src/data/projects.js`, dupliquer le bloc de `villa-gemini-frequencetv`
   et adapter : `id`, `name`, `status`, `client`, `sectors`, `devices`, `year`,
   `embedUrl: \`/showcases/hotel-lausanne/index.html\``, `embedPhoneUrl` (ou
   supprimer la ligne), `thumbnailUrl`, et les textes FR / EN / DE.
3. Envoyer à Donatien pour publication.

### Ajouter un projet « simulateur » (interactif React)
Nécessite un développeur : ajouter l'entrée dans `projects.js` avec
`isInteractive: true` et créer le composant dans `src/components/simulators/`,
puis le référencer dans la table `SIMULATORS` de `src/components/Showcase.jsx`.

### Photos et vidéos
- Vignette de projet : `thumbnailUrl` (600 px de large environ). Aujourd'hui des
  photos Unsplash (licence libre) ; **préférer de vraies photos de chantiers
  Fréquence TV** déposées dans `public/assets/` (`thumbnailUrl: \`/assets/ma-photo.jpg\``).
- Vidéos de fond par secteur : `bgVideos` en bas de `projects.js` (fichiers Mixkit
  externes ; un dégradé prend le relais si la vidéo ne charge pas). Pour les
  héberger nous-mêmes : déposer un MP4 léger (< 5 Mo, 720p) dans `public/videos/`.
- Image d'aperçu des liens partagés : `public/og-image.jpg` (1200 × 630 px).

### Ajouter un secteur
Dans `sectors` (haut de `projects.js`) ajouter `{ id, name, iconName }`, puis les
libellés `sector_<id>_name` et `sector_<id>_desc` dans `src/data/translations.js`
(sections `fr`, `en`, `de`), et si possible une vidéo dans `bgVideos` et un dégradé
dans `bgGradients`. Les icônes disponibles : https://lucide.dev/icons (le nom doit
aussi être ajouté dans `src/icons.js`).

### Coordonnées
`src/data/company.js` : téléphone, e-mail, adresses, horaires, liens sociaux.
> ⚠ L'adresse e-mail `info@frequence-tv.ch` est une hypothèse (celle du site
> officiel est masquée) — **à confirmer** avant diffusion.

---

## 3. Publication

Le site est hébergé sur Vercel et se met à jour automatiquement à chaque `git push`
sur la branche `main` du dépôt GitHub `donafcna/Crestronshowcase`. La date de mise
à jour affichée en bas de la barre latérale est celle du dernier build.
