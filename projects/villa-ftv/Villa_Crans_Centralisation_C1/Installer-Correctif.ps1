[CmdletBinding()]
param([string]$ProjectRoot = 'C:\dev\crestron\repo\projects\villa-crans')
$ErrorActionPreference = 'Stop'
$manifest = Get-Content -LiteralPath (Join-Path $PSScriptRoot 'manifest.json') -Raw -Encoding UTF8 | ConvertFrom-Json
if ($manifest.package_layout -ne 2) { throw 'Organisation du paquet incompatible. Extraire le ZIP actualise avant de lancer ce script.' }
$jobs = @()
foreach ($item in $manifest.files) {
    $relative = $item.path.Replace('/', [IO.Path]::DirectorySeparatorChar)
    $source = Join-Path (Join-Path $PSScriptRoot 'sources') $relative
    $target = Join-Path $ProjectRoot $relative
    if (-not (Test-Path -LiteralPath $source -PathType Leaf)) { throw "Candidat absent : $source" }
    if (-not (Test-Path -LiteralPath $target -PathType Leaf)) { throw "Source absente : $target" }
    $candidateHash = (Get-FileHash -LiteralPath $source -Algorithm SHA256).Hash
    if ($candidateHash -ne $item.candidate_sha256) { throw "Paquet modifie : $source" }
    $currentHash = (Get-FileHash -LiteralPath $target -Algorithm SHA256).Hash
    if ($currentHash -eq $item.candidate_sha256) { Write-Host "Deja installe : $target"; continue }
    if ($currentHash -ne $item.original_sha256) {
        throw "Fichier modifie depuis l'envoi a ChatGPT : $target. Aucun remplacement effectue. Comparer avec CHANGEMENTS.diff pour conserver les modifications recentes."
    }
    $jobs += [pscustomobject]@{ Source=$source; Target=$target; Relative=$relative; OriginalHash=$currentHash; CandidateHash=$candidateHash }
}
if ($jobs.Count -eq 0) { Write-Host 'Le correctif C1 est deja installe.'; exit 0 }
$backup = Join-Path $ProjectRoot ('_backups\centralisation-C1-' + (Get-Date -Format 'yyyyMMdd-HHmmss-fff'))
New-Item -ItemType Directory -Path $backup | Out-Null
foreach ($job in $jobs) {
    $copy = Join-Path $backup $job.Relative
    New-Item -ItemType Directory -Force -Path (Split-Path -Parent $copy) | Out-Null
    Copy-Item -LiteralPath $job.Target -Destination $copy
    if ((Get-FileHash -LiteralPath $copy -Algorithm SHA256).Hash -ne $job.OriginalHash) { throw "Sauvegarde non conforme : $copy" }
}
$changed = @()
try {
    foreach ($job in $jobs) {
        if ((Get-FileHash -LiteralPath $job.Target -Algorithm SHA256).Hash -ne $job.OriginalHash) { throw "Modification concurrente : $($job.Target)" }
        $changed += $job
        Copy-Item -LiteralPath $job.Source -Destination $job.Target -Force
        if ((Get-FileHash -LiteralPath $job.Target -Algorithm SHA256).Hash -ne $job.CandidateHash) { throw "Copie non conforme : $($job.Target)" }
    }
} catch {
    foreach ($job in $changed) {
        Copy-Item -LiteralPath (Join-Path $backup $job.Relative) -Destination $job.Target -Force
    }
    throw
}
Write-Host "Correctif C1 installe. Sauvegarde : $backup"
Write-Host 'Aucun build, aucun envoi au materiel. Suivre LIRE-MOI.md pour compiler et tester.'
