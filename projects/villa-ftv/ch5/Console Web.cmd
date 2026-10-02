@echo off
title Console Web Villa Crans
rem Demarre le serveur de la Console Web (http://localhost:8090) et ouvre le navigateur.
cd /d "%~dp0"

set "LOG=%~dp0console_web_log.txt"
echo ===== %date% %time% - lancement Console Web.cmd ===== >> "%LOG%"

rem Chemin complet de node (le PATH n'est pas toujours a jour dans le contexte du double-clic)
set "NODE_EXE=C:\Program Files\nodejs\node.exe"
if not exist "%NODE_EXE%" set "NODE_EXE=node"
echo node utilise : %NODE_EXE% >> "%LOG%"

netstat -ano | findstr ":8090" | findstr "LISTENING" >nul 2>&1
if %errorlevel%==0 (
    echo port 8090 deja occupe - ouverture navigateur seulement >> "%LOG%"
    echo Le serveur tourne deja - ouverture de la page...
    start "" http://localhost:8090
    timeout /t 3 >nul
    exit /b
)

echo port libre - demarrage du serveur >> "%LOG%"
echo Demarrage du serveur Console Web...
echo Cette fenetre EST le serveur : la fermer arrete la Console Web.
start "" http://localhost:8090
"%NODE_EXE%" tools\console_server.js >> "%LOG%" 2>&1
echo node termine avec le code %errorlevel% >> "%LOG%"
echo.
echo Le serveur s'est arrete. Consultez console_web_log.txt pour le detail.
pause
