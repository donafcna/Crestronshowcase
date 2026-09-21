# VCA / Sunrays : fond 3D derrière le smartphone

Correction demandée le 20 septembre 2026 à partir des captures fournies. Sur les deux routes `/phone`, la scène remplace la vidéo en fond de page. Châssis à gauche, caméra cadrée entre le téléphone et la colonne de droite, en Mode normal et Mode Scène. Une seule scène WebGL est chargée. Les autres supports et la démo mobile sans châssis conservent leur placement de la 3D.

43 contrôles réussis, 50 états vérifiés : trois thèmes, quatre onglets, deux modes, plus démos mobiles. Sélection dans les deux sens, changement de niveau, modification effective des matériaux lumineux, molette vue d’ensemble / pièce, priorité manuelle et cadrage après redimensionnement à 1366, 1591 et 1906 px. Contraste du texte GUI ≥4:1, absence de débordement de la GUI et cibles tactiles ≥40 px. Aucune exception JavaScript. Les boutons latéraux reçoivent un fond opaque pour rester lisibles sur les intérieurs clairs.

`comparaison.png` : avant puis Sombre/Clair/Verre en colonnes. Les autres captures montrent une pièce et le Mode Scène. Le avant correspond au build du commit `a2418e6`. Les médias et fontes externes sont bloqués pendant la recette locale ; le fond vidéo avant apparaît donc avec sa couleur de repli. Les scènes 3D sont servies localement. Captures PNG optimisées en palette 256 couleurs.

Build et lint réussis. Chromium avec WebGL logiciel ; Safari, iPhone physique et matériel Crestron non testés. Aucun nouveau dialogue modal dans ce lot. Le plein écran GUI `/3` est hors périmètre Smartphone. Les avertissements de lint préexistants sont conservés.

Reproduction : `npm run build`, `npm run lint`, puis `node scripts/test-luxury-background.mjs`. Le script accepte `PLAYWRIGHT_MODULE`, `BROWSER_EXE`, `BROWSER_ARGS`, `TEST_OUTPUT`, `BASE_URL` et `BASELINE_DIST`. Les chemins de runtime sont remplacés par `<checkout>` dans les logs.
