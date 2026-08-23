@echo off
title Arret Console Web
rem Arrete le serveur de la Console Web (tout processus ecoutant sur le port 8090).

set FOUND=0
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":8090" ^| findstr "LISTENING"') do (
    set FOUND=1
    echo Arret du processus %%p...
    taskkill /PID %%p /F >nul 2>&1
)

if %FOUND%==0 (
    echo La Console Web n'etait pas lancee.
) else (
    echo Console Web arretee.
)
timeout /t 3 >nul
