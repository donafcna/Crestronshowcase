@echo off
setlocal
REM Argument "auto" : pas de pause (utilise par watch-showcase.cmd)
set AUTO=%1
REM Applique showcase.bundle (commits prepares par Claude) sur donafcna/Crestronshowcase main et pousse.
REM Le meme script sert a chaque mise a jour : Claude remplace showcase.bundle, tu double-cliques ici.
set REPO=%USERPROFILE%\Desktop\Crestronshowcase
set BUNDLE=%~dp0showcase.bundle
REM Menage : anciens scripts / bundles d'avant le script unique (ne servent plus)
for %%f in ("%~dp0push-showcase-demo.cmd" "%~dp0push-showcase-layout.cmd" "%~dp0showcase-demo-cursor.bundle" "%~dp0showcase-layout-dev.bundle" "%~dp0showcase-sync-v166.bundle") do if exist %%f del /q %%f
where git >nul 2>&1 || (
  if exist "C:\Program Files\Git\cmd\git.exe" set "PATH=C:\Program Files\Git\cmd;%PATH%"
)
where git >nul 2>&1 || (echo Git introuvable ^(ni dans le PATH, ni dans C:\Program Files\Git^) & call :halt & exit /b 1)
if not exist "%BUNDLE%" (echo Aucun showcase.bundle a cote de ce script : rien a pousser & call :halt & exit /b 1)
if not exist "%REPO%\.git" (
  echo Clonage de Crestronshowcase dans %REPO% ...
  git clone https://github.com/donafcna/Crestronshowcase.git "%REPO%" || (call :halt & exit /b 1)
)
cd /d "%REPO%"
git fetch origin main || (call :halt & exit /b 1)
git checkout -q main && git reset -q --hard origin/main
git bundle verify "%BUNDLE%" || (echo Ce bundle ne s'applique pas sur le main actuel ^(deja pousse ?^) & call :halt & exit /b 1)
git fetch "%BUNDLE%" main:refs/bundles/incoming || (call :halt & exit /b 1)
git merge --ff-only refs/bundles/incoming || (echo Fusion impossible en fast-forward : main a bouge depuis la preparation du bundle & call :halt & exit /b 1)
git push origin main || (call :halt & exit /b 1)
git update-ref -d refs/bundles/incoming
del /q "%BUNDLE%" 2>nul
echo.
echo Pousse OK : Vercel redeploie crestrongui.vercel.app dans 1 a 2 minutes. Le bundle a ete supprime.
call :halt
exit /b 0

:halt
if /i not "%AUTO%"=="auto" pause
exit /b 0
