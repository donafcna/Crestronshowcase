[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)][ValidateSet('gui','cp4','tsw')][string]$Etape,
    [string]$ProjectRoot = 'C:\dev\crestron\repo\projects\villa-crans',
    [string]$CP4Host = '192.168.1.200',
    [string]$TswHost = '192.168.1.16'
)
$ErrorActionPreference = 'Stop'
$ch5 = Join-Path $ProjectRoot 'ch5'
$deploy = Join-Path $ch5 'deploy.ps1'
$manifest = Get-Content -LiteralPath (Join-Path $PSScriptRoot 'manifest.json') -Raw -Encoding UTF8 | ConvertFrom-Json
if ($manifest.package_layout -ne 2) { throw 'Organisation du paquet incompatible. Extraire le ZIP actualise avant de lancer ce script.' }
foreach ($item in $manifest.files) {
    $target = Join-Path $ProjectRoot ($item.path.Replace('/', [IO.Path]::DirectorySeparatorChar))
    if ((Get-FileHash -LiteralPath $target -Algorithm SHA256).Hash -ne $item.candidate_sha256) {
        throw "Le candidat C1 n'est pas installe a l'identique : $target"
    }
}
if ($Etape -eq 'cp4') {
    # Le deploy.ps1 examine utilise CP4Host seulement pour -Target web.
    # Verifier la cible effective de cp4 avant toute operation ; ne pas afficher les identifiants.
    $settings = Import-PowerShellDataFile -LiteralPath (Join-Path $ch5 'deploy.secrets.psd1')
    if ($settings.CP4.Host -ne $CP4Host) {
        throw "La cible CP4 du fichier deploy.secrets.psd1 ne correspond pas a $CP4Host. Le deploy.ps1 examine ignore CP4Host pour -Target cp4. Corriger la cible avant l'envoi."
    }
    $cpz = Join-Path $ch5 'Backend\Backend\bin\Debug\Villaftv.cpz'
    if (-not (Test-Path -LiteralPath $cpz -PathType Leaf)) { throw 'CPZ absent. Regenerer Villaftv.sln dans SIMPL# Pro / Visual Studio en Debug.' }
    $source = Join-Path $ch5 'Backend\Backend\ControlSystem.cs'
    if ((Get-Item -LiteralPath $cpz).LastWriteTimeUtc -lt (Get-Item -LiteralPath $source).LastWriteTimeUtc) {
        throw 'CPZ anterieur au C# corrige. Regenerer la solution avant de deployer.'
    }
    & powershell -NoProfile -ExecutionPolicy Bypass -File $deploy -Target cp4 -CP4Host $CP4Host
    if ($LASTEXITCODE -ne 0) { throw 'Echec du deploiement CP4.' }
    Write-Host 'Verifier dans la console du CP4 le marqueur de demarrage CENT-20260921-1.'
} elseif ($Etape -eq 'gui') {
    & powershell -NoProfile -ExecutionPolicy Bypass -File $deploy -Target web -CP4Host $CP4Host
    if ($LASTEXITCODE -ne 0) { throw 'Echec du build/deploiement CH5 web.' }
} else {
    $ch5z = Join-Path $ch5 'dist\villaftv.ch5z'
    if (-not (Test-Path -LiteralPath $ch5z -PathType Leaf)) { throw 'CH5Z absent. Executer Etape gui en premier.' }
    if ((Get-Item -LiteralPath $ch5z).LastWriteTimeUtc -lt (Get-Item -LiteralPath (Join-Path $ch5 'src\iphone.html')).LastWriteTimeUtc) {
        throw 'CH5Z anterieur au correctif. Executer Etape gui en premier.'
    }
    & powershell -NoProfile -ExecutionPolicy Bypass -File $deploy -Target tsw -SkipBuild -TswHost $TswHost
    if ($LASTEXITCODE -ne 0) { throw 'Echec du deploiement TSW.' }
}
