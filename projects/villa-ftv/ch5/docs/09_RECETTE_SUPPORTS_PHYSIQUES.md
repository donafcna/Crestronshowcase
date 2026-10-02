# Recette sur supports physiques — v1.0.167 (contrat de joins v3)

Dalle Crestron TSW-1070 · iPad · iPhone · XPanel. À faire après `.\deploy.ps1` (GUI) et la compilation
de `ControlSystem.cs` dans SIMPL# Pro.

## 0. Le test qui compte

C'est le test que le site vitrine ne pouvait pas faire, et la raison d'être du contrat v3.

| # | Geste | Attendu |
|---|-------|---------|
| 0.1 | Dalle sur **Salle de jeux**, iPad sur **Chambre papa**, en même temps | Chacun garde sa pièce ; aucun des deux ne change de pièce tout seul |
| 0.2 | Sur la dalle, appuyer sur la scène « CINÉMA » | Seule la Salle de jeux réagit ; l'iPad ne bouge pas |
| 0.3 | Sur l'iPad, monter le volume | Seule la Chambre papa réagit ; le volume de la dalle ne bouge pas |
| 0.4 | Depuis SIMPL, forcer le feedback de scène de la pièce 3 | Seul l'iPad allume le bouton ; la dalle reste inchangée |
| 0.5 | Ajouter l'iPhone sur une **troisième** pièce et rejouer 0.2 à 0.4 | Idem, les trois restent indépendants |
| 0.6 | Armer la partition d'alarme 1 depuis n'importe lequel | **Les trois** affichent la partition armée (exception voulue) |
| 0.7 | Activer un preset global depuis n'importe lequel | **Les trois** affichent le preset actif (exception voulue) |

En cas de doute, ouvrir la console du navigateur (XPanel) et taper `VillaJoins.table()` : la réponse
donne la pièce courante, la base du bloc et la liste complète des joins physiques utilisés.

## 1. Vérifications rapides avant de commencer

| # | Contrôle | Attendu |
|---|----------|---------|
| 1.1 | Libellé de version en bas du menu de gauche | `v1.0.167` |
| 1.2 | Console du navigateur (XPanel) | aucune erreur ; ligne `[VillaJoins] pièce N → bloc de joins ...` à chaque changement de pièce |
| 1.3 | `VillaJoins.actif` dans la console | `true` (si `false`, le `meta.mode` du `villa_config.json` embarqué n'est pas `deploiement`) |
| 1.4 | Changement de thème (Sombre / Clair / Verre dépoli) | aucun fond résiduel, textes lisibles partout |
| 1.5 | Aucun son nulle part, y compris triple-appui sur le widget météo | silence |

## 2. Nouveautés v1.0.167 à recetter en priorité

| # | Contrôle | Attendu |
|---|----------|---------|
| 2.1 | Fenêtre Stores → « Tout ouvrir / Demi-ouverture / Tout fermer » des **volets** | joins `base+1 / +2 / +3` pulsés (ils n'émettaient rien avant) |
| 2.2 | Idem **rideaux** | `base+4 / +5 / +6` |
| 2.3 | Idem **stores** | `base+7 / +8 / +9` |
| 2.4 | Pavé de code d'alarme, code correct | le sériel 43 part, la centrale répond sur le digital 44, l'écran des partitions s'ouvre |
| 2.5 | Pavé de code, code faux | digital 45, message « CODE INCORRECT » |
| 2.6 | Pavé de code, slot 2 non programmé | message « CENTRALE INJOIGNABLE (joins 43/44/45) » au bout de 2,5 s |
| 2.7 | Touche C du pavé | digital 46 pulsé, saisie effacée |
| 2.8 | iPhone : sélectionner les pièces 9 à 15 | le bouton de pièce s'allume en retour (ne marchait pas avant) |
| 2.9 | iPhone : boutons mute des télécommandes Apple TV et Swisscom | le mute bascule réellement |
| 2.10 | iPhone : touches rembobinage / avance de la télécommande Apple TV | joins 219 / 220 émis |
| 2.11 | Télécommande Swisscom, touche mute | join **563** émis (et non plus 55) |
| 2.12 | Dalle : sélectionner une source, vérifier la désélection des autres | l'interlock fonctionne dès le premier appui (il ne s'armait jamais sur la dalle) |

## 3. Table de référence des joins physiques par pièce

`joinPhysique = 1000 + (pieceId − 1) × 100 + offset`. Les joins ci-dessous sont ceux à surveiller dans
le debugger de SIMPL Windows.

### 3.1 Base de chaque pièce

| Pièce | Nom | Base | Plage | Intersystem |
|---|---|---|---|---|
| 1 | Salle de jeux | 1000 | 1000–1099 | oui |
| 2 | Chambre maman | 1100 | 1100–1199 | oui |
| 3 | Chambre papa | 1200 | 1200–1299 | oui |
| 4 | Suite amis | 1300 | 1300–1399 | non |
| 5 | Chambre amis | 1400 | 1400–1499 | non |
| 6 | Chambre 2 | 1500 | 1500–1599 | non |
| 7 | Bureau | 1600 | 1600–1699 | non |
| 8 | Home cinéma | 1700 | 1700–1799 | non |
| 9 | Chambre 3 | 1800 | 1800–1899 | non |
| 10 | Suite invités | 1900 | 1900–1999 | non |
| 11 | Terrasse & jardin | 2000 | 2000–2099 | non |
| 12 | Piscine & spa | 2100 | 2100–2199 | non |
| 13 | Sauna & hammam | 2200 | 2200–2299 | non |
| 14 | Pool house | 2300 | 2300–2399 | non |
| 15 | Garage & ateliers | 2400 | 2400–2499 | non |

### 3.2 Digitaux

| Offset | Fonction | Join logique (HTML) | P1 | P2 | P3 | P4 | P5 | P6 | P7 | P8 | P9 | P10 | P11 | P12 | P13 | P14 | P15 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| +1 | Volets : tout ouvrir | dig 61 | 1001 | 1101 | 1201 | 1301 | 1401 | 1501 | 1601 | 1701 | 1801 | 1901 | 2001 | 2101 | 2201 | 2301 | 2401 |
| +2 | Volets : demi-ouverture | dig 62 | 1002 | 1102 | 1202 | 1302 | 1402 | 1502 | 1602 | 1702 | 1802 | 1902 | 2002 | 2102 | 2202 | 2302 | 2402 |
| +3 | Volets : tout fermer | dig 63 | 1003 | 1103 | 1203 | 1303 | 1403 | 1503 | 1603 | 1703 | 1803 | 1903 | 2003 | 2103 | 2203 | 2303 | 2403 |
| +4 | Rideaux : tout ouvrir | dig 64 | 1004 | 1104 | 1204 | 1304 | 1404 | 1504 | 1604 | 1704 | 1804 | 1904 | 2004 | 2104 | 2204 | 2304 | 2404 |
| +5 | Rideaux : demi-ouverture | dig 65 | 1005 | 1105 | 1205 | 1305 | 1405 | 1505 | 1605 | 1705 | 1805 | 1905 | 2005 | 2105 | 2205 | 2305 | 2405 |
| +6 | Rideaux : tout fermer | dig 66 | 1006 | 1106 | 1206 | 1306 | 1406 | 1506 | 1606 | 1706 | 1806 | 1906 | 2006 | 2106 | 2206 | 2306 | 2406 |
| +7 | Stores : tout ouvrir | dig 67 | 1007 | 1107 | 1207 | 1307 | 1407 | 1507 | 1607 | 1707 | 1807 | 1907 | 2007 | 2107 | 2207 | 2307 | 2407 |
| +8 | Stores : demi-ouverture | dig 68 | 1008 | 1108 | 1208 | 1308 | 1408 | 1508 | 1608 | 1708 | 1808 | 1908 | 2008 | 2108 | 2208 | 2308 | 2408 |
| +9 | Stores : tout fermer | dig 69 | 1009 | 1109 | 1209 | 1309 | 1409 | 1509 | 1609 | 1709 | 1809 | 1909 | 2009 | 2109 | 2209 | 2309 | 2409 |
| +21 | Scène éclairage 1 (OFF) | dig 51 | 1021 | 1121 | 1221 | 1321 | 1421 | 1521 | 1621 | 1721 | 1821 | 1921 | 2021 | 2121 | 2221 | 2321 | 2421 |
| +22 | Scène éclairage 2 | dig 52 | 1022 | 1122 | 1222 | 1322 | 1422 | 1522 | 1622 | 1722 | 1822 | 1922 | 2022 | 2122 | 2222 | 2322 | 2422 |
| +23 | Scène éclairage 3 | dig 53 | 1023 | 1123 | 1223 | 1323 | 1423 | 1523 | 1623 | 1723 | 1823 | 1923 | 2023 | 2123 | 2223 | 2323 | 2423 |
| +24 | Scène éclairage 4 | dig 54 | 1024 | 1124 | 1224 | 1324 | 1424 | 1524 | 1624 | 1724 | 1824 | 1924 | 2024 | 2124 | 2224 | 2324 | 2424 |
| +35 | Consigne +0,5 °C | dig 49 | 1035 | 1135 | 1235 | 1335 | 1435 | 1535 | 1635 | 1735 | 1835 | 1935 | 2035 | 2135 | 2235 | 2335 | 2435 |
| +36 | Consigne −0,5 °C | dig 50 | 1036 | 1136 | 1236 | 1336 | 1436 | 1536 | 1636 | 1736 | 1836 | 1936 | 2036 | 2136 | 2236 | 2336 | 2436 |
| +41 | Scène de stores 1 | dig 201 | 1041 | 1141 | 1241 | 1341 | 1441 | 1541 | 1641 | 1741 | 1841 | 1941 | 2041 | 2141 | 2241 | 2341 | 2441 |
| +42 | Scène de stores 2 | dig 202 | 1042 | 1142 | 1242 | 1342 | 1442 | 1542 | 1642 | 1742 | 1842 | 1942 | 2042 | 2142 | 2242 | 2342 | 2442 |
| +43 | Scène de stores 3 | dig 203 | 1043 | 1143 | 1243 | 1343 | 1443 | 1543 | 1643 | 1743 | 1843 | 1943 | 2043 | 2143 | 2243 | 2343 | 2443 |
| +44 | Scène de stores 4 | dig 204 | 1044 | 1144 | 1244 | 1344 | 1444 | 1544 | 1644 | 1744 | 1844 | 1944 | 2044 | 2144 | 2244 | 2344 | 2444 |
| +45 | Extinction A/V de la pièce | dig 200 | 1045 | 1145 | 1245 | 1345 | 1445 | 1545 | 1645 | 1745 | 1845 | 1945 | 2045 | 2145 | 2245 | 2345 | 2445 |
| +50 | Mute audio | dig 55 | 1050 | 1150 | 1250 | 1350 | 1450 | 1550 | 1650 | 1750 | 1850 | 1950 | 2050 | 2150 | 2250 | 2350 | 2450 |
| +51 | Source OFF | dig 150 | 1051 | 1151 | 1251 | 1351 | 1451 | 1551 | 1651 | 1751 | 1851 | 1951 | 2051 | 2151 | 2251 | 2351 | 2451 |
| +52 | Source vidéo 1 | dig 151 | 1052 | 1152 | 1252 | 1352 | 1452 | 1552 | 1652 | 1752 | 1852 | 1952 | 2052 | 2152 | 2252 | 2352 | 2452 |
| +53 | Source vidéo 2 | dig 152 | 1053 | 1153 | 1253 | 1353 | 1453 | 1553 | 1653 | 1753 | 1853 | 1953 | 2053 | 2153 | 2253 | 2353 | 2453 |
| +54 | Source vidéo 3 | dig 153 | 1054 | 1154 | 1254 | 1354 | 1454 | 1554 | 1654 | 1754 | 1854 | 1954 | 2054 | 2154 | 2254 | 2354 | 2454 |
| +55 | Source vidéo 4 | dig 154 | 1055 | 1155 | 1255 | 1355 | 1455 | 1555 | 1655 | 1755 | 1855 | 1955 | 2055 | 2155 | 2255 | 2355 | 2455 |
| +56 | Musique sur les haut-parleurs | dig 155 | 1056 | 1156 | 1256 | 1356 | 1456 | 1556 | 1656 | 1756 | 1856 | 1956 | 2056 | 2156 | 2256 | 2356 | 2456 |
| +57 | L'audio suit la vidéo | dig 156 | 1057 | 1157 | 1257 | 1357 | 1457 | 1557 | 1657 | 1757 | 1857 | 1957 | 2057 | 2157 | 2257 | 2357 | 2457 |
| +58 | Lecteur : lecture / pause | dig 251 | 1058 | 1158 | 1258 | 1358 | 1458 | 1558 | 1658 | 1758 | 1858 | 1958 | 2058 | 2158 | 2258 | 2358 | 2458 |
| +59 | Lecteur : suivant | dig 252 | 1059 | 1159 | 1259 | 1359 | 1459 | 1559 | 1659 | 1759 | 1859 | 1959 | 2059 | 2159 | 2259 | 2359 | 2459 |
| +60 | Lecteur : précédent | dig 253 | 1060 | 1160 | 1260 | 1360 | 1460 | 1560 | 1660 | 1760 | 1860 | 1960 | 2060 | 2160 | 2260 | 2360 | 2460 |
| +61 | Moteur 1 : monter | dig 81 | 1061 | 1161 | 1261 | 1361 | 1461 | 1561 | 1661 | 1761 | 1861 | 1961 | 2061 | 2161 | 2261 | 2361 | 2461 |
| +62 | Moteur 1 : stop | dig 82 | 1062 | 1162 | 1262 | 1362 | 1462 | 1562 | 1662 | 1762 | 1862 | 1962 | 2062 | 2162 | 2262 | 2362 | 2462 |
| +63 | Moteur 1 : descendre | dig 83 | 1063 | 1163 | 1263 | 1363 | 1463 | 1563 | 1663 | 1763 | 1863 | 1963 | 2063 | 2163 | 2263 | 2363 | 2463 |
| +64 | Moteur 2 : monter | dig 84 | 1064 | 1164 | 1264 | 1364 | 1464 | 1564 | 1664 | 1764 | 1864 | 1964 | 2064 | 2164 | 2264 | 2364 | 2464 |
| +65 | Moteur 2 : stop | dig 85 | 1065 | 1165 | 1265 | 1365 | 1465 | 1565 | 1665 | 1765 | 1865 | 1965 | 2065 | 2165 | 2265 | 2365 | 2465 |
| +66 | Moteur 2 : descendre | dig 86 | 1066 | 1166 | 1266 | 1366 | 1466 | 1566 | 1666 | 1766 | 1866 | 1966 | 2066 | 2166 | 2266 | 2366 | 2466 |
| +67 | Moteur 3 : monter | dig 87 | 1067 | 1167 | 1267 | 1367 | 1467 | 1567 | 1667 | 1767 | 1867 | 1967 | 2067 | 2167 | 2267 | 2367 | 2467 |
| +68 | Moteur 3 : stop | dig 88 | 1068 | 1168 | 1268 | 1368 | 1468 | 1568 | 1668 | 1768 | 1868 | 1968 | 2068 | 2168 | 2268 | 2368 | 2468 |
| +69 | Moteur 3 : descendre | dig 89 | 1069 | 1169 | 1269 | 1369 | 1469 | 1569 | 1669 | 1769 | 1869 | 1969 | 2069 | 2169 | 2269 | 2369 | 2469 |
| +70 | Moteur 4 : monter | dig 90 | 1070 | 1170 | 1270 | 1370 | 1470 | 1570 | 1670 | 1770 | 1870 | 1970 | 2070 | 2170 | 2270 | 2370 | 2470 |
| +71 | Moteur 4 : stop | dig 91 | 1071 | 1171 | 1271 | 1371 | 1471 | 1571 | 1671 | 1771 | 1871 | 1971 | 2071 | 2171 | 2271 | 2371 | 2471 |
| +72 | Moteur 4 : descendre | dig 92 | 1072 | 1172 | 1272 | 1372 | 1472 | 1572 | 1672 | 1772 | 1872 | 1972 | 2072 | 2172 | 2272 | 2372 | 2472 |
| +73 | Moteur 5 : monter | dig 93 | 1073 | 1173 | 1273 | 1373 | 1473 | 1573 | 1673 | 1773 | 1873 | 1973 | 2073 | 2173 | 2273 | 2373 | 2473 |
| +74 | Moteur 5 : stop | dig 94 | 1074 | 1174 | 1274 | 1374 | 1474 | 1574 | 1674 | 1774 | 1874 | 1974 | 2074 | 2174 | 2274 | 2374 | 2474 |
| +75 | Moteur 5 : descendre | dig 95 | 1075 | 1175 | 1275 | 1375 | 1475 | 1575 | 1675 | 1775 | 1875 | 1975 | 2075 | 2175 | 2275 | 2375 | 2475 |
| +76 | Moteur 6 : monter | dig 96 | 1076 | 1176 | 1276 | 1376 | 1476 | 1576 | 1676 | 1776 | 1876 | 1976 | 2076 | 2176 | 2276 | 2376 | 2476 |
| +77 | Moteur 6 : stop | dig 97 | 1077 | 1177 | 1277 | 1377 | 1477 | 1577 | 1677 | 1777 | 1877 | 1977 | 2077 | 2177 | 2277 | 2377 | 2477 |
| +78 | Moteur 6 : descendre | dig 98 | 1078 | 1178 | 1278 | 1378 | 1478 | 1578 | 1678 | 1778 | 1878 | 1978 | 2078 | 2178 | 2278 | 2378 | 2478 |

### 3.3 Analogiques

| Offset | Fonction | Join logique (HTML) | P1 | P2 | P3 | P4 | P5 | P6 | P7 | P8 | P9 | P10 | P11 | P12 | P13 | P14 | P15 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| +21 | Niveau master éclairage | ana 21 | 1021 | 1121 | 1221 | 1321 | 1421 | 1521 | 1621 | 1721 | 1821 | 1921 | 2021 | 2121 | 2221 | 2321 | 2421 |
| +31 | Consigne de température ×10 | ana 31 | 1031 | 1131 | 1231 | 1331 | 1431 | 1531 | 1631 | 1731 | 1831 | 1931 | 2031 | 2131 | 2231 | 2331 | 2431 |
| +51 | Source vidéo active | ana 51 | 1051 | 1151 | 1251 | 1351 | 1451 | 1551 | 1651 | 1751 | 1851 | 1951 | 2051 | 2151 | 2251 | 2351 | 2451 |
| +52 | Volume multimédia | ana 52 | 1052 | 1152 | 1252 | 1352 | 1452 | 1552 | 1652 | 1752 | 1852 | 1952 | 2052 | 2152 | 2252 | 2352 | 2452 |
| +53 | Source audio des haut-parleurs | ana 53 | 1053 | 1153 | 1253 | 1353 | 1453 | 1553 | 1653 | 1753 | 1853 | 1953 | 2053 | 2153 | 2253 | 2353 | 2453 |
| +54 | Volume du lecteur média | ana 254 | 1054 | 1154 | 1254 | 1354 | 1454 | 1554 | 1654 | 1754 | 1854 | 1954 | 2054 | 2154 | 2254 | 2354 | 2454 |
| +71 | Niveau du circuit 1 | ana 71 | 1071 | 1171 | 1271 | 1371 | 1471 | 1571 | 1671 | 1771 | 1871 | 1971 | 2071 | 2171 | 2271 | 2371 | 2471 |
| +72 | Niveau du circuit 2 | ana 72 | 1072 | 1172 | 1272 | 1372 | 1472 | 1572 | 1672 | 1772 | 1872 | 1972 | 2072 | 2172 | 2272 | 2372 | 2472 |
| +73 | Niveau du circuit 3 | ana 73 | 1073 | 1173 | 1273 | 1373 | 1473 | 1573 | 1673 | 1773 | 1873 | 1973 | 2073 | 2173 | 2273 | 2373 | 2473 |
| +74 | Niveau du circuit 4 | ana 74 | 1074 | 1174 | 1274 | 1374 | 1474 | 1574 | 1674 | 1774 | 1874 | 1974 | 2074 | 2174 | 2274 | 2374 | 2474 |
| +75 | Niveau du circuit 5 | ana 75 | 1075 | 1175 | 1275 | 1375 | 1475 | 1575 | 1675 | 1775 | 1875 | 1975 | 2075 | 2175 | 2275 | 2375 | 2475 |
| +76 | Niveau du circuit 6 | ana 76 | 1076 | 1176 | 1276 | 1376 | 1476 | 1576 | 1676 | 1776 | 1876 | 1976 | 2076 | 2176 | 2276 | 2376 | 2476 |
| +77 | Niveau du circuit 7 | ana 77 | 1077 | 1177 | 1277 | 1377 | 1477 | 1577 | 1677 | 1777 | 1877 | 1977 | 2077 | 2177 | 2277 | 2377 | 2477 |
| +78 | Niveau du circuit 8 | ana 78 | 1078 | 1178 | 1278 | 1378 | 1478 | 1578 | 1678 | 1778 | 1878 | 1978 | 2078 | 2178 | 2278 | 2378 | 2478 |
| +79 | Niveau du circuit 9 | ana 79 | 1079 | 1179 | 1279 | 1379 | 1479 | 1579 | 1679 | 1779 | 1879 | 1979 | 2079 | 2179 | 2279 | 2379 | 2479 |
| +80 | Niveau du circuit 10 | ana 80 | 1080 | 1180 | 1280 | 1380 | 1480 | 1580 | 1680 | 1780 | 1880 | 1980 | 2080 | 2180 | 2280 | 2380 | 2480 |

### 3.4 Sériels

| Offset | Fonction | Join logique (HTML) | P1 | P2 | P3 | P4 | P5 | P6 | P7 | P8 | P9 | P10 | P11 | P12 | P13 | P14 | P15 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| +10 | Nom de la pièce | ser 10 | 1010 | 1110 | 1210 | 1310 | 1410 | 1510 | 1610 | 1710 | 1810 | 1910 | 2010 | 2110 | 2210 | 2310 | 2410 |
| +32 | Température actuelle | ser 32 | 1032 | 1132 | 1232 | 1332 | 1432 | 1532 | 1632 | 1732 | 1832 | 1932 | 2032 | 2132 | 2232 | 2332 | 2432 |
| +33 | Mode CVC | ser 33 | 1033 | 1133 | 1233 | 1333 | 1433 | 1533 | 1633 | 1733 | 1833 | 1933 | 2033 | 2133 | 2233 | 2333 | 2433 |
| +34 | Consigne formatée | ser 34 | 1034 | 1134 | 1234 | 1334 | 1434 | 1534 | 1634 | 1734 | 1834 | 1934 | 2034 | 2134 | 2234 | 2334 | 2434 |

## 4. Joins qui restent communs à toute la villa

| Plage | Fonction | Pourquoi c'est commun |
|---|---|---|
| digital 11-40 | Piece.Select | selection de la piece : par nature globale |
| analog 10 | Piece.Active | piece affichee par le panel : par nature globale. ATTENTION : le seriel 10 (Piece.Nom) n'est PAS une exception, il est traduit en base+10 et chaque panel lit le nom de SA piece. |
| digital 301-312 | Alarme.Partition | EXCEPTION DEMANDEE : les etats des partitions d'alarme 1..4 sont communs a toute la villa |
| digital 401-411 + serial 420 | Global.* / Presets.Sauvegarde | EXCEPTION DEMANDEE : les presets globaux sont communs a toute la villa |
| digital 41-48 | Alarme.General / Alarme.Code | la centrale d'alarme est unique pour la villa |
| digital 211-220 / 500-527 / 530-557 / 560-600 | AV.Telecommande.* | une commande de telecommande vise l'APPAREIL SOURCE (Apple TV, Sky Q, box IPTV, Swisscom), pas la piece : dupliquer par piece n'aurait pas de sens et couterait 15 x 130 joins |
| serial 99-106, digital/analog 250 | Systeme.* / Config.* | signaux systeme et transport de configuration |
| analog 240 / analog 260 / digital 261 | Systeme.*Dalle | materiel propre a la dalle TSW principale |
| digital 56 | Meteo.EasterEgg | widget global |

## 5. Ce qui n'a pas pu être vérifié sans matériel

- La compilation de `ControlSystem.cs` (aucun compilateur SIMPL# Pro dans l'environnement de travail).
- L'aller-retour réel d'un signal : le navigateur headless n'a pas de pont Crestron, seul le
  **nom de signal interne** de chaque composant CH5 a pu être contrôlé (52/52 verts, y compris
  après changement de pièce).
- La chaîne d'alarme 43/44/45/46 dépend du programme du slot 2, qui reste à écrire.

## 6. Défauts d'ergonomie préexistants, non traités dans cette version

Identiques avant et après la v1.0.167 — à traiter en un lot séparé.

1. iPhone : léger scroll horizontal parasite sur la page principale.
2. 5 à 6 cibles tactiles sous 40 px sur la dalle (bouton 32×32 de la barre d'outils, boutons 92×38,
   104×38, 146×38) et 6 sur l'iPhone (`popup-trigger-btn` 38×32, boutons 65×32 et 113×36).
3. iPad : les libellés « Chambre maman » et « Terrasse & jardin » sont tronqués à l'ellipse dans le
   menu de gauche.
4. iPhone : le libellé « DÉSACTIVER » du mode vacances est tronqué en « DÉSAC… ».
5. Console : un `<path>` SVG d'engrenage déclenche un avertissement « attribute d: Expected number »
   (12 occurrences du même tracé), sans effet visible.

