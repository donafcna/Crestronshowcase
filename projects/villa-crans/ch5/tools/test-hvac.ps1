param([string]$SimplFile)
$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
Add-Type -Path (Join-Path $root 'Backend/Backend/HvacState.cs')
$a = [VillaFrequenceTvAutomation.HvacState]::new()
$b = [VillaFrequenceTvAutomation.HvacState]::new()
$checks = 0
function Check($value, $name) { if (-not $value) { throw $name }; $script:checks++ }
foreach ($fan in 0..3) {
    Check ($a.Apply(95 + $fan)) 'Fan command handled'
    Check ($a.Fan -eq $fan) 'Fan value'
    $selected = @(95..98 | Where-Object { $a.Selected($_) })
    Check ($selected.Count -eq 1 -and $selected[0] -eq (95 + $fan)) 'Fan interlock'
}
Check ($a.Apply(94) -and -not $a.Enabled -and $a.Selected(94) -and -not $a.Selected(93)) 'OFF interlock'
Check ($a.Fan -eq 3) 'OFF preserves fan'
Check ($b.Enabled -and $b.Fan -eq 0) 'Room isolation'
Check ($a.Apply(93) -and $a.Enabled -and $a.Fan -eq 3) 'ON restores fan'
Check (-not $a.SetFan(65535) -and $a.Fan -eq 3) 'Reject invalid hardware fan value'
$a.Enabled = $false
Check ($a.Selected(94)) 'Falling physical power return'
Check ($a.SetFan(1) -and -not $a.Enabled) 'Fan return never powers an OFF unit'
Check (-not $a.Apply(92)) 'Alarm offsets untouched'
$cfg = Get-Content (Join-Path $root 'villa_config.json') -Raw | ConvertFrom-Json
Check ($cfg.contrat.blocsPiecesGui.actif -eq $false) 'Contract v4 retained'
$mapping = $cfg.contrat.blocsPiecesGui.mapping
foreach ($i in 0..5) {
    $join = [string](610 + $i)
    Check ($mapping.digital.$join -eq 93+$i) "Digital mapping $join"
    Check (@($cfg.contrat.signauxGlobaux | Where-Object { $_.type -eq 'digital' -and $_.join -eq [int]$join }).Count -eq 1) "Whitelist $join"
}
Check ($mapping.analog.'61' -eq 33) 'Fan analog mapping, separate from measured temperature +32'
if ($SimplFile) {
    $smw = [IO.File]::ReadAllText((Resolve-Path $SimplFile),[Text.Encoding]::GetEncoding(28591))
    $signals = @{}
    foreach ($m in [regex]::Matches($smw,'ObjTp=Sg\r?\nH=(\d+)\r?\nNm=([^\r\n]+)')) { $signals[$m.Groups[2].Value] = $m.Groups[1].Value }
    $eisc = [regex]::Match($smw,'ObjTp=Sm\r?\nH=21\r?\n[\s\S]*?\r?\n\]').Value
    $names = 'On','Off','Fan_Auto','Fan_Low','Fan_Medium','Fan_High'
    foreach ($i in 0..5) { Check ($eisc -match ('(?m)^O'+(610+$i)+'='+$signals['HVAC_'+$names[$i]+'_Cmd']+'\r?$')) ('Debugger command '+$names[$i]) }
    foreach ($p in @($cfg.pieces | Where-Object { $_.intersystem -ne $false -and $_.actif -ne $false -and $_.pilotages.cvc.actif -ne $false })) {
        $prefix='R{0:D2}_' -f [int]$p.id; $base=1000+([int]$p.id-1)*100
        Check ($eisc -match ('(?m)^I'+($base+93)+'='+$signals[$prefix+'HVAC_On_Actual']+'\r?$')) ($prefix+'power actual return')
        Check ($signals.ContainsKey($prefix+'HVAC_FanSpeed_Actual#')) ($prefix+'fan actual return')
        Check ($signals.ContainsKey($prefix+'HVAC_FanSpeed_fb#')) ($prefix+'fan target')
    }
}
Write-Output "$checks HVAC checks passed"
