Add-Type -AssemblyName System.Drawing
$encoder=[Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq 'image/jpeg'
$params=New-Object Drawing.Imaging.EncoderParameters(1)
$params.Param[0]=New-Object Drawing.Imaging.EncoderParameter([Drawing.Imaging.Encoder]::Quality,[long]92)
$items=Get-Content prototypes/villa-photo/assets-complete.json -Raw | ConvertFrom-Json
foreach($a in $items){
 foreach($suffix in @('','-off')){
  $source=if($suffix){$a.off}else{$a.source}
  $im=[Drawing.Image]::FromFile($source)
  try{$im.Save((Join-Path $PWD ('public/plan3d/villa-photo/'+$a.key+$suffix+'.jpg')),$encoder,$params)}finally{$im.Dispose()}
 }
 $duplicate=Join-Path $PWD ('public/plan3d/villa-photo/'+$a.key+'.png')
 if(Test-Path -LiteralPath $duplicate){Remove-Item -LiteralPath $duplicate}
}
$params.Dispose()
