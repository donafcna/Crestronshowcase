param(
    [string]$Backend = (Join-Path $PSScriptRoot '../../projects/villa-crans/ch5/Backend/Backend/ControlSystem.cs'),
    [Parameter(Mandatory=$true)][string]$Output
)
$ErrorActionPreference = 'Stop'
$source = [IO.File]::ReadAllText((Resolve-Path -LiteralPath $Backend))
$start = $source.IndexOf('private void MirrorSignalToEisc(')
$open = $source.IndexOf('{', $start)
$depth = 1; $end = $open + 1
while ($depth -gt 0 -and $end -lt $source.Length) {
    if ($source[$end] -eq '{') { $depth++ }
    if ($source[$end] -eq '}') { $depth-- }
    $end++
}
if ($start -lt 0 -or $depth -ne 0) { throw 'Méthode MirrorSignalToEisc introuvable' }
$method = $source.Substring($start, $end - $start)
$tables = [regex]::Matches($source, 'private static readonly Dictionary<ushort, uint> V4(?:Digital|Analog)Offsets\s*=\s*new Dictionary<ushort, uint>\s*\{[\s\S]*?\};')
if ($tables.Count -ne 2) { throw 'Tables de routage C# introuvables' }
$tableCode = ($tables | ForEach-Object { $_.Value }) -join [Environment]::NewLine
# Exécuter le vrai corps C# avec des objets de signaux minimaux, sans SDK ni CP4.
# Ceci reproduit la sélection EISC ; ce n'est pas une preuve du transport matériel.
$prefix = @'
using System;
using System.Collections.Generic;
public enum eSigType { Bool, UShort, String }
public class Signal { public uint Number; public eSigType Type; public bool BoolValue; public ushort UShortValue; public string StringValue; }
public class SigEventArgs { public Signal Sig = new Signal(); }
public class Signals {
  private Dictionary<uint,Signal> values = new Dictionary<uint,Signal>();
  public Signal this[uint i] { get { if(!values.ContainsKey(i)) values[i] = new Signal(); return values[i]; } }
}
public class BasicTriList { public uint ID; public Signals BooleanInput = new Signals(), UShortInput = new Signals(), StringInput = new Signals(); }
public class Wellness { public bool Available = true; public ushort SaunaMin=600, SaunaMax=1000, HumidityMin=90, HumidityMax=100; }
public class Room { public Wellness Wellness = new Wellness(); }
public class RoutingHarness {
  private BasicTriList _eisc = new BasicTriList();
  private Dictionary<uint,int> _activeRoomPerDevice = new Dictionary<uint,int>();
  private Dictionary<int,Room> _roomsRegistry = new Dictionary<int,Room>();
  private Dictionary<int,bool> _roomEiscEnabled = new Dictionary<int,bool>();
  private const uint RoomBlockBase = 1000, RoomBlockSize = 100, RoomBlockMaxRoom = 30, AlarmCodeEntryJoin = 43;
  private int DefaultRoomForPanel(uint id) { return 1; }
  private bool IsGlobalMirrorSignal(eSigType type, uint join) { return true; }
  public ushort Run(uint join, bool analog) {
    var panelA = new BasicTriList { ID = 3 };
    _activeRoomPerDevice[3] = 1; _activeRoomPerDevice[5] = 2;
    _roomsRegistry[1] = new Room(); _roomsRegistry[2] = new Room();
    _eisc.UShortInput[10].UShortValue = 2;
    var args = new SigEventArgs { Sig = new Signal { Number = join, Type = analog ? eSigType.UShort : eSigType.Bool, BoolValue = true, UShortValue = 1234 } };
    MirrorSignalToEisc(panelA, args);
    return _eisc.UShortInput[10].UShortValue;
  }
'@
Add-Type -TypeDefinition ($prefix + [Environment]::NewLine + $tableCode + [Environment]::NewLine + $method + [Environment]::NewLine + '}')
$cases = @()
foreach ($join in @(151,51,61,211,500,530,560,610,200,251)) {
    $actual = ([RoutingHarness]::new()).Run($join,$false)
    $cases += [ordered]@{type='digital';join=$join;expectedRoom=1;actualRoom=$actual;passed=($actual -eq 1)}
}
foreach ($join in @(21,31,52,71,61,254)) {
    $actual = ([RoutingHarness]::new()).Run($join,$true)
    $cases += [ordered]@{type='analog';join=$join;expectedRoom=1;actualRoom=$actual;passed=($actual -eq 1)}
}
foreach ($join in @(41,301,401,410,250)) {
    $actual = ([RoutingHarness]::new()).Run($join,$false)
    $cases += [ordered]@{type='global-digital';join=$join;expectedRoom=2;actualRoom=$actual;passed=($actual -eq 2)}
}
$actual = ([RoutingHarness]::new()).Run(53,$true)
$cases += [ordered]@{type='feedback-only-analog';join=53;expectedRoom=2;actualRoom=$actual;passed=($actual -eq 2)}
$report = [ordered]@{
    timestamp=[DateTime]::UtcNow.ToString('o');
    backend=(Resolve-Path -LiteralPath $Backend).Path;
    sha256=(Get-FileHash -LiteralPath $Backend -Algorithm SHA256).Hash;
    scope='Corps C# réel, doubles des objets de signaux ; aucun appel au CP4, aucune preuve de timing matériel';
    scenario='A affiche pièce 1 ; B a sélectionné pièce 2 sur EISC ; A émet sa commande sans changer de pièce';
    cases=$cases;
    passed=@($cases | Where-Object {$_.passed}).Count;
    failed=@($cases | Where-Object {-not $_.passed}).Count
}
$parent = Split-Path -Parent $Output
if ($parent) { [IO.Directory]::CreateDirectory($parent) | Out-Null }
$report | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $Output -Encoding utf8
Write-Output "$($report.passed) routages corrects ; $($report.failed) routages incorrects dans ce scénario simulé."
if ($report.failed) { exit 1 }
