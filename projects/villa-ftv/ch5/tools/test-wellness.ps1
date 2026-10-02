param([string]$SimplFile)
$ErrorActionPreference='Stop'
$root=Split-Path $PSScriptRoot -Parent
Add-Type -Path (Join-Path $root 'Backend/Backend/WellnessState.cs')
$a=[VillaFrequenceTvAutomation.WellnessState]::new()
$b=[VillaFrequenceTvAutomation.WellnessState]::new()
$checks=0
function Check($value,$name){if(-not $value){throw $name};$script:checks++}
Check (-not $a.Apply(11)) 'Unavailable room ignores sauna command'
$a.Available=$true
Check (-not $a.SaunaOn -and -not $a.HammamOn) 'Independent equipment starts OFF'
Check ($a.Text(36) -eq '--' -and $a.Text(37) -eq '--') 'No fabricated physical measurements'
Check ($a.Apply(11) -and $a.Selected(11) -and -not $a.Selected(12)) 'Sauna ON interlock'
Check (-not $a.HammamOn -and -not $b.SaunaOn) 'Circuits and rooms independent'
Check ($a.Apply(15) -and $a.Selected(15) -and -not $a.Selected(16)) 'Hammam ON interlock'
foreach($command in @(13,14,17,18)){1..200|ForEach-Object{[void]$a.Apply($command)};Check ($a.SaunaTarget -ge 600 -and $a.SaunaTarget -le 1000 -and $a.HumidityTarget -ge 90 -and $a.HumidityTarget -le 100) 'Clamp repeated setpoint buttons'}
Check (-not $a.SetValue(34,599) -and -not $a.SetValue(34,1001)) 'Reject out-of-range sauna driver targets'
Check (-not $a.SetValue(35,89) -and -not $a.SetValue(35,101)) 'Reject out-of-range humidity targets'
Check ($a.SetValue(36,785) -and $a.Text(36) -eq '78.5') 'Temperature measured in tenths'
Check ($a.SetValue(37,98) -and $a.Text(37) -eq '98') 'Measured humidity percentage'
Check (-not $a.SetValue(37,65535) -and $a.HumidityActual -eq 98) 'Invalid feedback cannot corrupt display'
$a.SaunaOn=$false;$a.HammamOn=$false
Check ($a.Selected(12) -and $a.Selected(16) -and -not $a.Selected(11)) 'Falling equipment power returns'
Check (-not $a.Apply(93)) 'HVAC joins do not operate sauna'
$cfg=Get-Content (Join-Path $root 'villa_config.json') -Raw|ConvertFrom-Json
$map=$cfg.contrat.blocsPiecesGui.mapping
foreach($i in 0..7){$j=[string](620+$i);Check ($map.digital.$j -eq 11+$i) "Digital mapping $j"}
foreach($i in 0..3){$j=[string](62+$i);Check ($map.analog.$j -eq 34+$i -and $map.serial.$j -eq 44+$i) "Typed mapping $j"}
Check ($map.serial.'34' -eq 34) 'Existing HVAC text join preserved'
Check ($cfg.valeursParDefaut.cvc.consigneMinC -eq 16 -and $cfg.valeursParDefaut.cvc.consigneMaxC -eq 28) 'Ordinary HVAC range'
if($SimplFile){
 $smw=[IO.File]::ReadAllText((Resolve-Path $SimplFile),[Text.Encoding]::GetEncoding(28591));$signals=@{}
 foreach($m in [regex]::Matches($smw,'ObjTp=Sg\r?\nH=(\d+)\r?\nNm=([^\r\n]+)')){$signals[$m.Groups[2].Value]=$m.Groups[1].Value}
 $eisc=[regex]::Match($smw,'ObjTp=Sm\r?\nH=21\r?\n[\s\S]*?\r?\n\]').Value
 $n1=[int][regex]::Match($eisc,'n1O=(\d+)').Groups[1].Value;$n2=[int][regex]::Match($eisc,'n2I=(\d+)').Groups[1].Value
 $names='Sauna_On','Sauna_Off','Sauna_Up','Sauna_Down','Hammam_On','Hammam_Off','Hammam_Up','Hammam_Down'
 foreach($i in 0..7){Check ($eisc -match ('(?m)^O'+(620+$i)+'='+$signals[$names[$i]+'_Cmd']+'\r?$')) ('Debugger command '+$names[$i])}
 foreach($pair in @(@(2211,'R13_Sauna_On_Actual'),@(2215,'R13_Hammam_On_Actual'))){Check ($eisc -match ('(?m)^I'+$pair[0]+'='+$signals[$pair[1]]+'\r?$')) $pair[1]}
 $names='Sauna_Setpoint','Hammam_Humidity_Setpoint','Sauna_Temperature','Hammam_Humidity'
 foreach($i in 0..3){
  $prefix='R13_'+$names[$i]
  Check ($eisc -match ('(?m)^O'+($n1+2234+$i)+'='+$signals[$prefix+'_fb#']+'\r?$')) ($prefix+' target/feedback')
  Check ($eisc -match ('(?m)^I'+($n1+1+2234+$i)+'='+$signals[$prefix+'_Actual#']+'\r?$')) ($prefix+' driver input')
  Check ($eisc -match ('(?m)^O'+($n1+$n2-1+2244+$i)+'='+$signals[$prefix+'_fb$']+'\r?$')) ($prefix+' native text')
 }
}
Write-Output "$checks wellness checks passed"
