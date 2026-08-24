# Deploiement Villa Crans : CH5 -> TSW (192.168.1.48) et programme C# -> CP4 (192.168.1.200)
# Usage :
#   .\deploy.ps1                 -> build CH5 + deploiement TSW + CP4
#   .\deploy.ps1 -Target tsw     -> uniquement la TSW
#   .\deploy.ps1 -Target cp4     -> uniquement le CP4
#   .\deploy.ps1 -SkipBuild      -> sans recompiler l'archive CH5
# Les identifiants sont lus dans deploy.secrets.psd1 (jamais commite).

param(
    [ValidateSet('all', 'tsw', 'cp4', 'config')]
    [string]$Target = 'all',
    [switch]$SkipBuild
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path

# Node.js systeme en tete de PATH (necessaire pour npx ch5-cli dans les contextes a PATH obsolete)
if (Test-Path 'C:\Program Files\nodejs\node.exe') {
    $env:Path = 'C:\Program Files\nodejs;' + $env:Path
}

# --- Identifiants ---
$secretsFile = Join-Path $root 'deploy.secrets.psd1'
if (-not (Test-Path $secretsFile)) {
    throw "Fichier d'identifiants introuvable : $secretsFile"
}
$S = Import-PowerShellDataFile $secretsFile
foreach ($k in @('TSW', 'CP4')) {
    if ($S[$k].User -eq 'REMPLACEZ_MOI' -or $S[$k].Password -eq 'REMPLACEZ_MOI') {
        throw "Renseignez User/Password pour $k dans deploy.secrets.psd1"
    }
}

function Get-HostKeyArgs {
    param($Device)
    # -hostkey rend plink/pscp totalement non-interactifs (pas de cache ni de question)
    $hkArgs = @()
    foreach ($hk in $Device.HostKeys) { $hkArgs += @('-hostkey', $hk) }
    return $hkArgs
}

function Send-ConsoleCommands {
    param($Device, [string[]]$Commands)
    # Envoie des commandes console Crestron via plink (la session se ferme sur 'bye')
    # Ligne vide en tete : la console Crestron corrompt la 1re ligne recue pendant son init
    $stdin = "`r`n" + (($Commands + 'bye') -join "`r`n") + "`r`n"
    $hk = Get-HostKeyArgs $Device
    # EAP 'Continue' local : en 5.1, le stderr des exe natifs redirige en ErrorRecord fatal avec 'Stop'
    $prevEap = $ErrorActionPreference; $ErrorActionPreference = 'Continue'
    $out = $stdin | & plink -batch -ssh -no-antispoof @hk -pw $Device.Password "$($Device.User)@$($Device.Host)" 2>&1 | ForEach-Object { "$_" }
    $ErrorActionPreference = $prevEap
    # Le code de sortie plink n'est pas fiable ici (252 meme en succes) : on analyse la sortie.
    $joined = $out -join "`n"
    if ($joined -notmatch 'Disconnecting Bye') {
        throw "Session console incomplete sur $($Device.Host) : $($out -join ' | ')"
    }
    # Seuls les refus de commande console comptent (pas les [ERROR] des logs applicatifs relayes)
    $errCount = @($out | Where-Object { $_ -match '^ERROR:' }).Count
    if ($errCount -gt 1) {
        # 1 erreur max toleree : celle de la ligne sacrificielle corrompue
        throw "Commande refusee par $($Device.Host) : $($out -join ' | ')"
    }
    return $out
}

function Copy-ToDevice {
    param($Device, [string]$LocalFile, [string]$RemotePath)
    $hk = Get-HostKeyArgs $Device
    $prevEap = $ErrorActionPreference; $ErrorActionPreference = 'Continue'
    $out = & pscp -batch @hk -pw $Device.Password $LocalFile "$($Device.User)@$($Device.Host):$RemotePath" 2>&1 | ForEach-Object { "$_" }
    $ErrorActionPreference = $prevEap
    if ($LASTEXITCODE -ne 0) {
        throw "Echec transfert vers $($Device.Host) : $($out -join ' | ')"
    }
    Write-Host "  Transfert OK -> $($Device.Host):$RemotePath"
}

# --- Build CH5 ---
if (-not $SkipBuild -and $Target -notin @('cp4', 'config')) {
    Write-Host "[1/3] Compilation de l'archive CH5 (villaftv.ch5z)..." -ForegroundColor Cyan
    # Increment automatique de la version (version.json -> src/version.js, affichee par le GUI)
    $verFile = Join-Path $root 'version.json'
    $ver = '1.0.149'
    if (Test-Path $verFile) { try { $ver = (Get-Content $verFile -Raw -Encoding UTF8 | ConvertFrom-Json).version } catch {} }
    $vParts = $ver.Split('.')
    $vParts[2] = [string]([int]$vParts[2] + 1)
    $newVer = $vParts -join '.'
    $utf8NoBom = New-Object System.Text.UTF8Encoding $false
    [System.IO.File]::WriteAllText($verFile, "{`n  `"version`": `"$newVer`"`n}`n", $utf8NoBom)
    [System.IO.File]::WriteAllText((Join-Path $root 'src\version.js'), "window.appVersion = 'v$newVer';", $utf8NoBom)
    [System.IO.File]::WriteAllText((Join-Path $root 'src\build_date.json'), "{`"compileDate`":`"$((Get-Date).ToString('dd/MM/yyyy HH:mm:ss'))`"}", $utf8NoBom)
    Write-Host "  Version : v$newVer" -ForegroundColor Cyan

    # Embarquer la configuration dans le projet CH5 (source par defaut du GUI sans liaison CP4).
    # Version .js en <script> obligatoire : fetch() est bloque en contexte local sur les dalles.
    $cfgSrc = Join-Path $root 'villa_config.json'
    if (Test-Path $cfgSrc) {
        Copy-Item $cfgSrc (Join-Path $root 'src\villa_config.json') -Force
        $cfgJson = Get-Content $cfgSrc -Raw -Encoding UTF8
        [System.IO.File]::WriteAllText((Join-Path $root 'src\villa_config.js'), "window.villaConfigEmbedded = $cfgJson;", (New-Object System.Text.UTF8Encoding $false))
    }
    Push-Location $root
    try {
        npx ch5-cli archive -p villaftv -d src -o dist | Out-Null
        if ($LASTEXITCODE -ne 0) { throw "Echec de ch5-cli archive" }
    } finally { Pop-Location }
    Write-Host "  Archive OK : dist\villaftv.ch5z"
}

# --- TSW ---
if ($Target -in @('all', 'tsw')) {
    Write-Host "[2/3] Deploiement CH5 sur la TSW $($S.TSW.Host)..." -ForegroundColor Cyan
    $ch5z = Join-Path $root 'dist\villaftv.ch5z'
    if (-not (Test-Path $ch5z)) { throw "Archive introuvable : $ch5z" }
    Copy-ToDevice -Device $S.TSW -LocalFile $ch5z -RemotePath '/display/villaftv.ch5z'
    Write-Host "  Chargement du projet (PROJECTLOAD)..."
    Send-ConsoleCommands -Device $S.TSW -Commands @('PROJECTLOAD') | Out-Null
    Write-Host "  TSW : projet charge." -ForegroundColor Green
}

# --- CONFIG SEULE : envoi de villa_config.json au CP4 + redemarrage du programme (sans recharger le cpz) ---
if ($Target -eq 'config') {
    Write-Host "[config] Envoi de villa_config.json sur le CP4 $($S.CP4.Host)..." -ForegroundColor Cyan
    $villaCfg = Join-Path $root 'villa_config.json'
    if (-not (Test-Path $villaCfg)) { throw "villa_config.json introuvable a la racine du projet" }

    # Validation JSON avant envoi (evite de charger une config corrompue)
    try { Get-Content $villaCfg -Raw -Encoding UTF8 | ConvertFrom-Json | Out-Null }
    catch { throw "villa_config.json invalide : $($_.Exception.Message)" }

    # Resynchroniser les copies embarquees du GUI (prises en compte au prochain build TSW)
    Copy-Item $villaCfg (Join-Path $root 'src\villa_config.json') -Force
    $cfgJson = Get-Content $villaCfg -Raw -Encoding UTF8
    [System.IO.File]::WriteAllText((Join-Path $root 'src\villa_config.js'), "window.villaConfigEmbedded = $cfgJson;", (New-Object System.Text.UTF8Encoding $false))

    Copy-ToDevice -Device $S.CP4 -LocalFile $villaCfg -RemotePath '/user/villa_config.json'
    Write-Host "  Redemarrage du programme (progreset) pour recharger la configuration..."
    Send-ConsoleCommands -Device $S.CP4 -Commands @('progreset -p:01') | Out-Null
    Write-Host "  Configuration rechargee - les panels la recevront a la reconnexion." -ForegroundColor Green
    Write-Host "Deploiement termine." -ForegroundColor Green
    exit 0
}

# --- CP4 ---
if ($Target -in @('all', 'cp4')) {
    Write-Host "[3/3] Chargement du programme C# sur le CP4 $($S.CP4.Host)..." -ForegroundColor Cyan

    # Configuration de dimensionnement du GUI (lue par le programme au boot, transmise au CH5)
    $villaCfg = Join-Path $root 'villa_config.json'
    if (Test-Path $villaCfg) {
        Copy-ToDevice -Device $S.CP4 -LocalFile $villaCfg -RemotePath '/user/villa_config.json'
    } else {
        Write-Host "  Attention : villa_config.json absent, dimensionnement historique conserve." -ForegroundColor Yellow
    }

    $cpz = Join-Path $root 'Backend\Backend\bin\Debug\Villaftv.cpz'
    if (-not (Test-Path $cpz)) { throw "Programme introuvable : $cpz (compilez depuis Visual Studio)" }
    $slot = $S.CP4.Slot
    if (-not $slot) { $slot = '01' }
    Copy-ToDevice -Device $S.CP4 -LocalFile $cpz -RemotePath "/program$slot/Villaftv.cpz"
    Write-Host "  Chargement du programme (progload -p:$slot)..."
    Send-ConsoleCommands -Device $S.CP4 -Commands @("progload -p:$slot") | Out-Null
    Write-Host "  CP4 : programme recharge (slot $slot)." -ForegroundColor Green
}

Write-Host "Deploiement termine." -ForegroundColor Green
exit 0
