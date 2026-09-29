# Deploiement Showroom FTV Nyon (GUI CH5 + programme C# slot 1 + configuration JSON)
#   .\deploy.ps1                 -> build CH5 puis TSW + Web XPanel + Crestron One + CP4 (CPZ + JSON)
#   .\deploy.ps1 -Target tsw     -> uniquement la TSW-1070 (IP-ID 03)
#   .\deploy.ps1 -Target web     -> Web XPanel sur le serveur web du CP4 (https://<CP4>/showroomnyon/index.html, IP-ID 04)
#   .\deploy.ps1 -Target mobile  -> projet Crestron One (iPad IP-ID 05, iPhone IP-ID 06, projet showroomnyon)
#   .\deploy.ps1 -Target cp4     -> showroom_config.json dans /user + ShowroomNyon.cpz + progload
#   .\deploy.ps1 -Target config  -> showroom_config.json seul + progreset
# Options : -SkipBuild, -CP4Host <ip>, -TswHost <ip>.
# Source unique : ..\showroom_config.json (racine du projet). Identifiants : deploy.secrets.psd1 (gabarit deploy.secrets.example.psd1).
# Fichier en ASCII pur + BOM : PowerShell 5.1 lit sinon le fichier en cp1252.

param(
    [ValidateSet('all', 'tsw', 'cp4', 'config', 'web', 'mobile')]
    [string]$Target = 'all',
    [switch]$SkipBuild,
    [string]$CP4Host,
    [string]$TswHost
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$cfgFile = Join-Path $root '..\showroom_config.json'
$cpz = Join-Path $root '..\simpl-sharp\ShowroomNyon\bin\Debug\ShowroomNyon.cpz'
$ch5z = Join-Path $root 'dist\showroomnyon.ch5z'
$utf8NoBom = New-Object System.Text.UTF8Encoding $false

$ch5Cli = Join-Path $root 'node_modules\@crestron\ch5-utilities-cli\build\index.js'
$ch5Compat = Join-Path $root 'tools\ch5-compat.js'
function Invoke-Ch5Cli {
    param([string[]]$Arguments)
    if (-not (Test-Path $ch5Cli)) { throw "ch5-cli introuvable : $ch5Cli (npm install dans $root)" }
    if (Test-Path $ch5Compat) { & node '--require' $ch5Compat $ch5Cli @Arguments }
    else { & node $ch5Cli @Arguments }
}

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

function Test-InlineScripts {
    param([string]$HtmlFile)
    # Garde-fou : verifie la syntaxe (node --check) de chaque bloc <script> inline du HTML.
    # ch5-cli archive ne fait que zipper : un guillemet ou une accolade manquante (collage rate)
    # passerait sinon jusqu'a la dalle, ou le navigateur rejette silencieusement tout le bloc.
    $html = Get-Content $HtmlFile -Raw -Encoding UTF8
    $name = Split-Path -Leaf $HtmlFile
    $rx = [regex]'(?is)<script\b([^>]*)>(.*?)</script>'
    $utf8NoBom = New-Object System.Text.UTF8Encoding $false
    $tmp = Join-Path ([System.IO.Path]::GetTempPath()) 'showroom_script_check.js'
    $n = 0; $errors = @()
    foreach ($m in $rx.Matches($html)) {
        $attrs = $m.Groups[1].Value
        if ($attrs -match '\bsrc\s*=') { continue }                                         # scripts externes : pas concernes
        if ($attrs -match 'type\s*=\s*["'']([^"'']+)' -and $Matches[1] -notmatch 'javascript|module|ecmascript') { continue }  # JSON, templates...
        $code = $m.Groups[2].Value
        if ($code.Trim().Length -eq 0) { continue }
        $n++
        # Ligne du HTML ou commence le bloc (pour retrouver l'erreur : ligne HTML = ligne bloc + offset)
        $offset = ($html.Substring(0, $m.Index) -split "`n").Count
        [System.IO.File]::WriteAllText($tmp, $code, $utf8NoBom)
        $prevEap = $ErrorActionPreference; $ErrorActionPreference = 'Continue'
        $out = & node --check $tmp 2>&1 | ForEach-Object { "$_" }
        $ErrorActionPreference = $prevEap
        if ($LASTEXITCODE -ne 0) {
            $detail = ($out | Where-Object { $_ -match 'SyntaxError|^\s*\^|^[^:]*:\d+' } | Select-Object -First 4) -join ' | '
            $errors += "$name : bloc <script> no $n (debute ligne $offset du HTML, ajouter $offset aux lignes ci-dessous) -> $detail"
        }
    }
    Remove-Item $tmp -ErrorAction SilentlyContinue
    if ($errors.Count -gt 0) {
        throw ("JavaScript invalide, deploiement annule :`n  " + ($errors -join "`n  "))
    }
    Write-Host "  $name : $n bloc(s) <script> OK" -ForegroundColor Green
}


function Assert-Config {
    if (-not (Test-Path $cfgFile)) { throw "showroom_config.json introuvable : $cfgFile" }
    try { $c = Get-Content $cfgFile -Raw -Encoding UTF8 | ConvertFrom-Json }
    catch { throw "showroom_config.json invalide, deploiement annule : $($_.Exception.Message)" }
    if ($c.meta.mode -ne 'deploiement') { throw "meta.mode doit valoir 'deploiement' pour un processeur (valeur : $($c.meta.mode))" }
    return $c
}

# --- Build CH5 ---
if (-not $SkipBuild -and $Target -notin @('cp4', 'config')) {
    Write-Host "[1/4] Archive CH5 (showroomnyon.ch5z)..." -ForegroundColor Cyan
    $cfg = Assert-Config
    Write-Host "  showroom_config.json : JSON OK ($($cfg.pieces.Count) pieces)" -ForegroundColor Green
    foreach ($f in @('src\index.html', 'src\iphone.html')) { Test-InlineScripts (Join-Path $root $f) }
    foreach ($js in Get-ChildItem (Join-Path $root 'src\js') -Filter '*.js' | Where-Object { $_.Name -notin @('ch5-components.js', 'webxpanel.js') }) {
        $prevEap = $ErrorActionPreference; $ErrorActionPreference = 'Continue'
        $out = & node --check $js.FullName 2>&1 | ForEach-Object { "$_" }
        $ErrorActionPreference = $prevEap
        if ($LASTEXITCODE -ne 0) { throw "JavaScript invalide : js\$($js.Name) -> $($out -join ' | ')" }
    }
    Write-Host "  js\*.js : syntaxe OK" -ForegroundColor Green

    # Version : ch5\version.json incremente a chaque build, affichee dans Manage > Panel Settings
    $verFile = Join-Path $root 'version.json'
    $ver = '1.0.0'
    if (Test-Path $verFile) { try { $ver = (Get-Content $verFile -Raw -Encoding UTF8 | ConvertFrom-Json).version } catch {} }
    $vParts = $ver.Split('.'); $vParts[2] = [string]([int]$vParts[2] + 1); $newVer = $vParts -join '.'
    [System.IO.File]::WriteAllText($verFile, "{`n  `"version`": `"$newVer`"`n}`n", $utf8NoBom)
    [System.IO.File]::WriteAllText((Join-Path $root 'src\version.js'), "window.showroomVersion = `"$newVer`";`n", $utf8NoBom)
    if ($cfg.meta.version -ne $newVer) { Write-Host "  Attention : meta.version du JSON ($($cfg.meta.version)) differente du build ($newVer) : l'aligner." -ForegroundColor Yellow }
    Write-Host "  Version : $newVer" -ForegroundColor Cyan

    # Configuration embarquee (<script>, fetch() est bloque en contexte local sur les dalles)
    $cfgJson = Get-Content $cfgFile -Raw -Encoding UTF8
    [System.IO.File]::WriteAllText((Join-Path $root 'src\showroom_config.json'), $cfgJson, $utf8NoBom)
    [System.IO.File]::WriteAllText((Join-Path $root 'src\showroom_config.js'), "/* Copie generee par deploy.ps1 depuis showroom_config.json - ne pas editer. */`nwindow.showroomConfig = $cfgJson;`n", $utf8NoBom)
    Push-Location $root
    try {
        Invoke-Ch5Cli @('archive', '-p', 'showroomnyon', '-d', 'src', '-o', 'dist') | Out-Null
        if ($LASTEXITCODE -ne 0) { throw "Echec de ch5-cli archive" }
    } finally { Pop-Location }
    Write-Host "  Archive OK : dist\showroomnyon.ch5z" -ForegroundColor Green
}

# --- TSW ---
if ($Target -in @('all', 'tsw')) {
    $tsw = $S.TSW
    if ($TswHost) { $tsw = @{}; foreach ($k in $S.TSW.Keys) { $tsw[$k] = $S.TSW[$k] }; $tsw.Host = $TswHost }
    Write-Host "[2/4] CH5 sur la TSW $($tsw.Host)..." -ForegroundColor Cyan
    if (-not (Test-Path $ch5z)) { throw "Archive introuvable : $ch5z" }
    Copy-ToDevice -Device $tsw -LocalFile $ch5z -RemotePath '/display/showroomnyon.ch5z'
    Send-ConsoleCommands -Device $tsw -Commands @('PROJECTLOAD') | Out-Null
    Write-Host "  TSW : projet charge." -ForegroundColor Green
}

# --- WEB XPANEL ---
if ($Target -in @('all', 'web')) {
    $cibleWeb = if ($CP4Host) { $CP4Host } else { $S.CP4.Host }
    Write-Host "[web] Web XPanel sur le CP4 $cibleWeb..." -ForegroundColor Cyan
    if (-not (Test-Path $ch5z)) { throw "Archive introuvable : $ch5z" }
    Write-Host "  Identifiants SFTP du processeur demandes ci-dessous." -ForegroundColor Yellow
    Push-Location $root
    try { Invoke-Ch5Cli @('deploy', '-H', $cibleWeb, '-t', 'web', '-p', $ch5z) } finally { Pop-Location }
    $urlWeb = "https://$cibleWeb/showroomnyon/index.html"
    # ch5-cli sort en code 0 meme quand le deploiement echoue (l'ancien script annoncait donc
    # "Web XPanel OK" a tort). On verifie ce qui compte vraiment : la page repond-elle ?
    # 17.09.2026 : sur le CP4 192.168.1.200 la verification echouait avec "La connexion sous-jacente a
    # ete fermee : une erreur inattendue s'est produite lors de l'envoi" alors que le deploiement
    # avait reussi. Cause : un scriptblock PowerShell en ServerCertificateValidationCallback est
    # appele hors runspace par .NET et plante (piege connu de PowerShell 5.1). On installe donc un
    # rappel compile (Add-Type), on active TLS 1.1/1.2, et en dernier recours on interroge avec
    # curl.exe -k (livre avec Windows 10+). Un transport impossible n'est plus une erreur fatale :
    # seul un code HTTP different de 200 l'est.
    if (-not ('FtvTrustAll' -as [type])) {
        Add-Type -TypeDefinition @'
using System.Net;
using System.Net.Security;
using System.Security.Cryptography.X509Certificates;
public static class FtvTrustAll {
    public static bool Ok(object s, X509Certificate c, X509Chain ch, SslPolicyErrors e) { return true; }
    public static void Install() { ServicePointManager.ServerCertificateValidationCallback = Ok; }
    public static void Remove() { ServicePointManager.ServerCertificateValidationCallback = null; }
}
'@
    }
    $code = $null; $transport = $null
    try {
        [FtvTrustAll]::Install()
        [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12 -bor [System.Net.SecurityProtocolType]::Tls11
        $code = (Invoke-WebRequest -Uri $urlWeb -UseBasicParsing -TimeoutSec 20).StatusCode
    } catch {
        $transport = $_.Exception.Message
    } finally { [FtvTrustAll]::Remove() }
    if ($null -eq $code) {
        $curl = Get-Command curl.exe -ErrorAction SilentlyContinue
        if ($curl) {
            $out = & $curl.Source -k -s -o NUL -w '%{http_code}' --max-time 20 $urlWeb 2>$null
            if ($out -match '^\d{3}$') { $code = [int]$out }
        }
    }
    if ($null -eq $code) {
        Write-Warning "Deploiement web non confirme automatiquement sur $cibleWeb ($transport). Ouvrir $urlWeb dans un navigateur pour verifier."
    } elseif ($code -ne 200 -and $code -ne 302) {
        throw "Deploiement web non confirme sur $cibleWeb : $urlWeb repond $code"
    } else {
        Write-Host "  Web XPanel OK : $urlWeb" -ForegroundColor Green
    }
    # 22.09.2026 : un code 200 ne prouve rien, une copie perimee repond 200 aussi. L'iPhone est
    # reste trois jours sur 1.0.196 pendant que le script annoncait des deploiements reussis.
    # On lit la version reellement servie et on la compare a celle qui vient d'etre construite.
    $versionAttendue = (Get-Content (Join-Path $root 'version.json') -Raw | ConvertFrom-Json).version
    $urlVersion = "https://$cibleWeb/showroomnyon/version.js"
    $versionServie = $null
    try {
        [FtvTrustAll]::Install()
        $versionServie = (Invoke-WebRequest -Uri $urlVersion -UseBasicParsing -TimeoutSec 20).Content
    } catch { $versionServie = $null } finally { [FtvTrustAll]::Remove() }
    if (-not $versionServie) {
        $curl = Get-Command curl.exe -ErrorAction SilentlyContinue
        if ($curl) { $versionServie = & $curl.Source -k -s --max-time 20 $urlVersion 2>$null }
    }
    if ($versionServie -match "v?(\d+\.\d+\.\d+)") {
        $servie = $Matches[1]
        if ($servie -eq $versionAttendue) {
            Write-Host "  Version servie par le CP4 : $servie (= build)" -ForegroundColor Green
        } else {
            throw "Le CP4 sert encore la version $servie alors que le build est $versionAttendue : le deploiement web n'a pas pris (identifiants SFTP ?)."
        }
    } else {
        Write-Warning "Version servie illisible ($urlVersion) : verifier a la main que le CP4 sert bien $versionAttendue."
    }
    Write-Host "  GUI smartphone : https://$cibleWeb/showroomnyon/iphone.html" -ForegroundColor Green

        Write-Host "  GUI smartphone : https://$cibleWeb/showroomnyon/iphone.html" -ForegroundColor Green
    if ($Target -eq 'web') { Write-Host "Deploiement termine." -ForegroundColor Green; exit 0 }
}

# --- MOBILE (Crestron One) ---
if ($Target -in @('all', 'mobile')) {
    $cibleMobile = if ($CP4Host) { $CP4Host } else { $S.CP4.Host }
    Write-Host "[mobile] Projet Crestron One sur le CP4 $cibleMobile..." -ForegroundColor Cyan
    if (-not (Test-Path $ch5z)) { throw "Archive introuvable : $ch5z" }
    Write-Host "  Identifiants SFTP du processeur demandes ci-dessous." -ForegroundColor Yellow
    Push-Location $root
    try { Invoke-Ch5Cli @('deploy', '-H', $cibleMobile, '-t', 'mobile', '-p', $ch5z) } finally { Pop-Location }
    Write-Host "  Projet mobile envoye : forcer la fermeture de Crestron One puis le relancer, verifier la version dans Manage > Panel Settings." -ForegroundColor Green
    if ($Target -eq 'mobile') { Write-Host "Deploiement termine." -ForegroundColor Green; exit 0 }
}

# --- CONFIG SEULE ---
if ($Target -eq 'config') {
    Assert-Config | Out-Null
    Copy-ToDevice -Device $S.CP4 -LocalFile $cfgFile -RemotePath '/user/showroom_config.json'
    $slot = $S.CP4.Slot; if (-not $slot) { $slot = '01' }
    Send-ConsoleCommands -Device $S.CP4 -Commands @("progreset -p:$slot") | Out-Null
    Write-Host "  Configuration rechargee (progreset -p:$slot)." -ForegroundColor Green
    Write-Host "Deploiement termine." -ForegroundColor Green
    exit 0
}

# --- CP4 ---
if ($Target -in @('all', 'cp4')) {
    Write-Host "[4/4] Programme C# sur le CP4 $($S.CP4.Host)..." -ForegroundColor Cyan
    Assert-Config | Out-Null
    Copy-ToDevice -Device $S.CP4 -LocalFile $cfgFile -RemotePath '/user/showroom_config.json'
    if (-not (Test-Path $cpz)) { throw "Programme introuvable : $cpz (compiler ..\simpl-sharp\ShowroomNyon.sln dans Visual Studio)" }
    $slot = $S.CP4.Slot; if (-not $slot) { $slot = '01' }
    Copy-ToDevice -Device $S.CP4 -LocalFile $cpz -RemotePath "/program$slot/ShowroomNyon.cpz"
    Send-ConsoleCommands -Device $S.CP4 -Commands @("progload -p:$slot") | Out-Null
    Write-Host "  CP4 : programme recharge (slot $slot)." -ForegroundColor Green
}

Write-Host "Deploiement termine." -ForegroundColor Green
exit 0
