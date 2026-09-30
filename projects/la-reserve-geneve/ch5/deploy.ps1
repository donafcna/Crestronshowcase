# Deploiement La Reserve Geneve (GUI CH5 seul : les programmes SIMPL existants restent en place, aucun C#).
#   .\deploy.ps1                          -> archives CH5 des 3 espaces (dist\reserve-bar.ch5z, -fitness, -lodge)
#   .\deploy.ps1 -Espace bar -Target web  -> Web XPanel sur le CP3 (https://<CP3>/reserve-bar/index.html)
#   .\deploy.ps1 -Espace lodge -Target mobile -> projet Crestron One (nom de projet reserve-lodge)
# Options : -CP3Host <ip>. Source unique : ..\reserve_config.json. Fichier ASCII + BOM (PowerShell 5.1).
param(
    [ValidateSet('all', 'bar', 'fitness', 'lodge')]
    [string]$Espace = 'all',
    [ValidateSet('build', 'web', 'mobile')]
    [string]$Target = 'build',
    [string]$CP3Host
)
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$proj = Split-Path -Parent $root
$ch5Cli = Join-Path $root 'node_modules\@crestron\ch5-utilities-cli\build\index.js'
$compat = Join-Path $root 'tools\ch5-compat.js'
if (Test-Path 'C:\Program Files\nodejs\node.exe') { $env:Path = 'C:\Program Files\nodejs;' + $env:Path }
if (-not (Test-Path $ch5Cli)) { throw "ch5-cli introuvable : npm install dans $root" }
$py = (Get-Command python -ErrorAction SilentlyContinue); if (-not $py) { $py = Get-Command py }
$list = if ($Espace -eq 'all') { @('bar', 'fitness', 'lodge') } else { @($Espace) }
foreach ($e in $list) {
    Write-Host "[$e] build.py --espace $e (mode deploiement)" -ForegroundColor Cyan
    & $py.Source (Join-Path $proj 'tools\build.py') --espace $e --mode deploiement
    if ($LASTEXITCODE -ne 0) { throw "reserve_config.json refuse" }
    foreach ($js in Get-ChildItem (Join-Path $root 'src\js') -Filter '*.js' | Where-Object { $_.Name -notin @('ch5-components.js', 'webxpanel.js') }) {
        & node --check $js.FullName; if ($LASTEXITCODE -ne 0) { throw "JavaScript invalide : $($js.Name)" }
    }
    Push-Location $root
    try {
        & node --require $compat $ch5Cli archive -p "reserve-$e" -d src -o dist | Out-Null
        if ($LASTEXITCODE -ne 0) { throw "Echec ch5-cli archive" }
        Write-Host "  dist\reserve-$e.ch5z" -ForegroundColor Green
        if ($Target -ne 'build') {
            if (-not $CP3Host) { throw "-CP3Host requis pour -Target $Target" }
            & node --require $compat $ch5Cli deploy -H $CP3Host -t $Target -p "dist\reserve-$e.ch5z"
        }
    } finally { Pop-Location }
}
# Remet ch5\src sur l'espace par defaut du JSON
& $py.Source (Join-Path $proj 'tools\build.py') | Out-Null
