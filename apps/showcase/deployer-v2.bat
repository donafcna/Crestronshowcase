@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"
title Correctifs Crestron GUI Showcase

echo ================================================
echo  Applique les correctifs (.patch) puis deploie
echo  Dossier : %CD%
echo ================================================
echo.

REM ---------- 1. Localiser git.exe ----------
set "GIT="
where git >nul 2>&1 && set "GIT=git"

if not defined GIT if exist "%ProgramFiles%\Git\cmd\git.exe" set "GIT=%ProgramFiles%\Git\cmd\git.exe"
if not defined GIT if exist "%ProgramFiles(x86)%\Git\cmd\git.exe" set "GIT=%ProgramFiles(x86)%\Git\cmd\git.exe"
if not defined GIT if exist "%LOCALAPPDATA%\Programs\Git\cmd\git.exe" set "GIT=%LOCALAPPDATA%\Programs\Git\cmd\git.exe"
if not defined GIT for /d %%D in ("%LOCALAPPDATA%\GitHubDesktop\app-*") do (
    if exist "%%D\resources\app\git\cmd\git.exe" set "GIT=%%D\resources\app\git\cmd\git.exe"
)
if not defined GIT if exist "%LOCALAPPDATA%\Programs\Microsoft VS Code\resources\app\extensions\git\git.exe" set "GIT=%LOCALAPPDATA%\Programs\Microsoft VS Code\resources\app\extensions\git\git.exe"

if not defined GIT (
    echo ERREUR : git.exe est introuvable sur ce PC.
    echo.
    echo   Installe Git pour Windows : https://git-scm.com/download/win
    echo   ^(coche "Git from the command line and also from 3rd-party software"^)
    echo   puis relance ce fichier.
    echo.
    pause
    exit /b 1
)
echo [git] !GIT!
echo.

REM ---------- 2. Verifier le depot ----------
"!GIT!" rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 (
    echo ERREUR : %CD% n'est pas un depot git.
    echo Place ce .bat a la racine du depot Crestronshowcase.
    pause
    exit /b 1
)

REM ---------- 3. Appliquer les patchs ----------
set FOUND=0
for %%P in ("%~dp0*.patch") do (
    set FOUND=1
    echo [patch] %%~nxP
    "!GIT!" apply --binary --check "%%~fP" 2>nul
    if errorlevel 1 (
        echo.
        echo ERREUR : %%~nxP ne s'applique pas
        echo          ^(deja applique, ou fichiers modifies localement^).
        echo Rien n'a ete change, rien n'a ete committe.
        echo.
        echo Astuce : lance "git status" pour voir l'etat du depot.
        pause
        exit /b 1
    )
    "!GIT!" apply --binary "%%~fP"
    if errorlevel 1 (
        echo ERREUR lors de l'application de %%~nxP.
        pause
        exit /b 1
    )
    echo         OK
)

if "%FOUND%"=="0" (
    echo Aucun fichier .patch trouve dans %CD%.
    pause
    exit /b 1
)

echo.
echo [commit]
"!GIT!" add -A
"!GIT!" commit -m "Verre depoli distinct du theme Sombre ; Toutes les UIs retire ; supports, textes et marges" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>" -m "Claude-Session: https://claude.ai/code/session_01A4Tx9YCYEHGbaaFfwYEHGb"
if errorlevel 1 (
    echo ERREUR au commit.
    pause
    exit /b 1
)

echo.
echo [push]
"!GIT!" push
if errorlevel 1 (
    echo ERREUR au push ^(verifie tes identifiants GitHub^).
    pause
    exit /b 1
)

echo.
echo [deploiement Vercel]
echo Le push sur main declenche le deploiement automatique.
echo Suivi : https://vercel.com/dashboard
echo.
echo ================================================
echo  TERMINE - https://crestrongui.vercel.app/
echo ================================================
pause
