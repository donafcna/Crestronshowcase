# 07 — QR codes par pièce (GUI web sans application Crestron)

Objectif : un QR code affiché dans chaque pièce ouvre, dans le navigateur du téléphone
qui l'a scanné, le GUI Villa Crans **déjà positionné sur cette pièce**, sans installer
l'application Crestron. Le GUI est servi par le **serveur web du CP4** (Web XPanel HTML5)
et se connecte au programme du slot 1 par WebSocket, exactement comme le XPanel `0x04`.

## 1. Principe

```
Téléphone (Wi-Fi villa)                          CP4 192.168.1.200
 scanne le QR "Cuisine"                            │
 https://192.168.1.200/villaftv/index.html         │  serveur web : /villaftv/ (le .ch5z déployé -t web)
        ?ipId=0x12&room=2 ──────────────────────►  │
 index.html : téléphone ? → iphone.html?ipId=0x12&room=2
 WebXPanel.initialize({ ipId: '0x12' }) ────────►  │  XpanelForHtml5(0x12) déclaré en C# (pièce 2)
                                        ◄────────  │  ONLINE → pièce forcée = 2, feedback pièce 2
 CONNECT_CIP → sélection locale de la pièce 2      │
```

| Élément | Fichier | Rôle |
|---|---|---|
| Générateur | `tools/gen_qr.js` | lit `villa_config.json`, écrit `qr/NN_<pièce>.png/.svg`, `qr/index.html` (planche imprimable A4), `qr/qr_manifest.json` |
| GUI | `src/index.html`, `src/iphone.html` | lit `?ipId=` (ou `?ipid=`), `?room=`, `?authtoken=` ; redirige tout **téléphone** (pas les tablettes) vers `iphone.html` en conservant les paramètres ; sélectionne la pièce à `CONNECT_CIP` |
| Backend | `Backend/Backend/ControlSystem.cs` | déclare un `XpanelForHtml5` par pièce sur l'IP-ID `0x10 + id` ; force la pièce dédiée à chaque passage ONLINE |
| Déploiement | `deploy.ps1 -Target web` | `ch5-cli deploy -t web` vers le CP4 puis `node tools/gen_qr.js` ; inclus dans `-Target all` |

## 2. Contrat IP-ID

| IP-ID | Usage |
|---|---|
| `0x03` TSW · `0x04` XPanel/debugger · `0x05` iPad · `0x06` iPhone | inchangés |
| `0x11` … `0x1F` | QR pièces 1 … 15 (jusqu'à `0x2E` pour 30 pièces) |
| `0xF0` | EISC slot 2, inchangé |

Le CP4 n'accepte **qu'un client par IP-ID** : un téléphone actif par pièce à la fois,
le scan suivant remplace le précédent. Les IP-ID sont créés dans la table IP du CP4 par
`Register()` au chargement du programme ; vérifier avec `iptable -p:01` sur la console.

Un XPanel QR est un panel comme un autre pour le slot 1 : il reçoit la configuration
(String 105/106), le feedback de sa pièce, et ses commandes s'appliquent à **sa** pièce
(`_activeRoomPerDevice`). L'utilisateur peut ensuite naviguer vers d'autres pièces depuis
le menu ; au prochain scan il revient sur la pièce du QR.

## 3. Mise en service

1. **Backend** : recompiler `Villaftv.cpz` (Visual Studio) puis `.\deploy.ps1 -Target cp4`.
2. **Web XPanel** : `.\deploy.ps1 -Target web` (build + `ch5-cli deploy -H 192.168.1.200 -t web dist\villaftv.ch5z`, identifiants lus dans `deploy.secrets.psd1`, puis génération des QR).
   Vérifier dans un navigateur PC : `https://192.168.1.200/villaftv/index.html?ipId=0x11&room=1`.
3. **Console CP4** (une fois) :
   - `ssl self` ou `ssl ca` — Web XPanel exige HTTPS.
   - `webserver allowsharedsession on` — évite les déconnexions de session avec un certificat auto-signé.
   - `webinit villaftv` (optionnel) — fait de `https://192.168.1.200/` un raccourci vers le projet.
4. **QR** : `npm install --save-dev qrcode` (une fois), puis `node tools/gen_qr.js --wifi "Nom du Wi-Fi"`.
   Imprimer `qr/index.html` (Ctrl+P, A4, 2 colonnes) ou utiliser les PNG/SVG individuels.

Options de `gen_qr.js` : `--base <url>` (défaut `https://192.168.1.200/villaftv/index.html`),
`--token <jeton>` (ajoute `&authtoken=`), `--wifi <nom>`, `--ipid-base 0x10`, `--size 600`, `--out qr`.

## 4. Points d'attention

- **Authentification du CP4.** Avec `authentication on` (défaut 4-Series), le navigateur est
  renvoyé sur `https://192.168.1.200/userlogin.html` au premier accès. Deux façons de
  l'éviter pour le client final : (a) passer un **jeton d'authentification** dans l'URL
  (`?authtoken=…`, supporté par le GUI et par `gen_qr.js --token` / `CP4.WebAuthToken` dans
  `deploy.secrets.psd1`) — le jeton se génère sur le CP4 (Toolbox → gestion des
  utilisateurs / groupes, cf. *4-Series Security Reference Guide*) ; (b) `userpageauth off`
  pour servir la page sans login. À trancher avec le client : un jeton dans un QR imprimé
  équivaut à une clé de la maison, à limiter à un groupe *User* sans droits d'administration.
- **Certificat auto-signé.** Le téléphone affiche un avertissement au premier scan (à
  accepter une fois par navigateur). Un certificat émis par une CA interne (`ssl ca`) ou
  un nom DNS local supprime l'avertissement.
- **Wi-Fi.** L'URL est en IP privée : le téléphone doit être sur le Wi-Fi de la villa. Un
  QR Wi-Fi (`WIFI:T:WPA;S:<ssid>;P:<mdp>;;`) à côté du QR pièce simplifie l'accueil des invités.
- **Le `.ch5z` déployé sur le CP4 est le même que celui de la TSW** : `-Target all` met
  désormais à jour TSW, Web XPanel et CP4 dans le même passage.
- **`src/iphone.html`** : le bloc `<script>` métier est actuellement mort (chaîne non
  terminée ligne ~1478, voir `06_TODO.md` P0). Tant qu'il n'est pas corrigé, la pièce est
  bien forcée côté CP4 mais le sélecteur de pièce local et les feedbacks iPhone ne
  fonctionnent pas. Le feedback de pièce iPhone n'est en outre abonné qu'aux joins 11-18
  (8 pièces) au lieu de 11-40.
- **Ancien `?ipid=`** : toujours accepté ; `?ipId=` (casse Crestron) est la forme des QR.
- Le `localStorage` du navigateur mémorise le dernier `ipId` scanné : ouvrir l'URL sans
  paramètre reprend l'IP-ID du dernier QR, ce qui est le comportement voulu.
