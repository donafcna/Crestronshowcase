@echo off
title Correctifs Crestron GUI Showcase + deploiement
cd /d "%~dp0"
echo ============================================
echo  Applique les correctifs (.patch) puis deploie
echo  Dossier : %CD%
echo ============================================
echo.
set FOUND=0
for %%P in (*.patch) do (
    set FOUND=1
    echo [patch] %%P
    git apply --binary "%%P"
    if errorlevel 1 (
        echo.
        echo ERREUR : %%P ne s'applique pas ^(deja applique, ou fichiers modifies localement^).
        echo Rien n'a ete change, rien n'a ete committe.
        pause
        exit /b 1
    )
    del /q "%%P"
)
if %FOUND%==0 (
    echo Aucun fichier .patch a cote de ce script.
    pause
    exit /b 1
)
echo.
echo [2/4] Commit...
git add -A
git commit -m "Verre depoli distinct du theme Sombre ; Toutes les UIs retire ; supports ordre fixe + TSW-1080 retire + libelle Dalle TSW ; Crestron Home marges + textes ; Chalet Zermatt icone + selecteur ; Home Cinema, Carouge, Palace Geneve textes ; Villa Leman photos de pieces" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>" -m "Claude-Session: https://claude.ai/code/session_01A4Tx9YCYEHGbaaFfwYEHGb"
echo.
echo [3/4] Push vers GitHub...
git push
echo.
echo [4/4] Deploiement Vercel en production...
call npx vercel --prod
echo.
echo ============================================
echo  Termine. Recharge le site avec Ctrl+F5.
echo ============================================
pause
