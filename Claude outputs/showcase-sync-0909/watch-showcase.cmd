@echo off
REM Surveillance automatique : laisse cette fenetre ouverte, et chaque fois que Claude
REM depose un showcase.bundle dans ce dossier, il est applique et pousse sans intervention.
title Surveillance showcase.bundle
echo Surveillance de %~dp0showcase.bundle ... (Ctrl+C pour arreter)
:loop
if exist "%~dp0showcase.bundle" (
  echo.
  echo [%date% %time%] Nouveau bundle detecte, push en cours...
  call "%~dp0push-showcase.cmd" auto
  if exist "%~dp0showcase.bundle" (
    echo Echec : bundle renomme en showcase.failed.bundle, voir le message ci-dessus.
    move /y "%~dp0showcase.bundle" "%~dp0showcase.failed.bundle" >nul
  )
)
timeout /t 10 /nobreak >nul
goto loop
