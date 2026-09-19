# Affiche la version des programmes charges sur le CP4 (slot 01 = C#, slot 02 = SIMPL).
# Lecture seule : aucune ecriture, aucun rechargement.
# Usage :
#   powershell -ExecutionPolicy Bypass -File "C:\dev\crestron\repo\projects\villa-crans\ch5\tools\version-cp4.ps1"
#   ... -CP4Host 192.168.3.109   -> banc de test du bureau
# Identifiants lus dans deploy.secrets.psd1 (jamais affiches).

param(
    [string]$CP4Host
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)

$secretsFile = Join-Path $root 'deploy.secrets.psd1'
if (-not (Test-Path $secretsFile)) { throw "Fichier d'identifiants introuvable : $secretsFile" }
$S = Import-PowerShellDataFile $secretsFile
$dev = $S.CP4
if ($CP4Host) { $dev = @{ Host = $CP4Host; User = $dev.User; Password = $dev.Password; HostKeys = $dev.HostKeys } }

$hkArgs = @()
foreach ($hk in $dev.HostKeys) { $hkArgs += @('-hostkey', $hk) }

# Ligne vide en tete : la console Crestron corrompt la 1re ligne recue pendant son init.
$stdin = "`r`n" + (@('progcomments -p:01', 'progcomments -p:02', 'bye') -join "`r`n") + "`r`n"

Write-Host "Interrogation du CP4 $($dev.Host)..." -ForegroundColor Cyan
$prevEap = $ErrorActionPreference; $ErrorActionPreference = 'Continue'
$out = $stdin | & plink -batch -ssh -no-antispoof @hkArgs -pw $dev.Password "$($dev.User)@$($dev.Host)" 2>&1 | ForEach-Object { "$_" }
$ErrorActionPreference = $prevEap

$joined = $out -join "`n"
if ($joined -notmatch 'Disconnecting Bye') { throw "Session console incomplete sur $($dev.Host) : $($out -join ' | ')" }

# Lignes utiles : nom du programme, date de compilation, version d'assembly.
$utiles = $out | Where-Object { $_ -match 'Program File|Compiled On|Compiler Rev|System Name|Program Boot|Friendly Name|Version|Slot' }
if ($utiles) { $utiles | ForEach-Object { Write-Host "  $_" } }
else { $out | ForEach-Object { Write-Host "  $_" } }

Write-Host ""
Write-Host "Reference : source C# = AssemblyInfo.cs, source CH5 = version.json." -ForegroundColor DarkGray
