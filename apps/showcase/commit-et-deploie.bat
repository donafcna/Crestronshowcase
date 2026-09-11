@echo off
title Commit + deploiement Crestron GUI Showcase
cd /d "%~dp0"
echo ============================================
echo  Commit + deploiement du Crestron GUI Showcase
echo  Dossier : %CD%
echo ============================================
echo.
if exist funny.mp3 del /q funny.mp3
if exist "public\showcases\villa-gemini-frequencetv\funny.mp3" del /q "public\showcases\villa-gemini-frequencetv\funny.mp3"
echo [1/4] Ajout des fichiers modifies...
git add -A
echo.
echo [2/4] Commit...
git commit -m "Demo auto : curseur precis (portail), faders appui+glissement, attente iframe CH5 ; son cache widget meteo retire ; SW v3" -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>" -m "Claude-Session: https://claude.ai/code/session_01A4Tx9YCYEHGbaaFfwYEHGb"
if errorlevel 1 echo (rien a committer ou commit refuse - on continue)
echo.
echo [3/4] Push vers GitHub...
git push
echo.
echo [4/4] Deploiement Vercel en production...
call npx vercel --prod
echo.
echo ============================================
echo  Termine. Pense a recharger le site avec Ctrl+F5.
echo ============================================
pause
