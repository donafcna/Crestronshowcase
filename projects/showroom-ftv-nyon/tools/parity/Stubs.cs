// Stubs minimaux de l'API Crestron pour vérifier la compilation hors Visual Studio (jamais livrés).
using System;
namespace Crestron.SimplSharp {
  public enum eProgramStatusEventType { Stopping, Paused, Resumed }
  public delegate void ProgramStatusEventHandler(eProgramStatusEventType t);
  public static class CrestronEnvironment { public static event ProgramStatusEventHandler ProgramStatusEventHandler; static void X(){ProgramStatusEventHandler?.Invoke(0);} }
  public static class ErrorLog { public static void Error(string f, params object[] a){} }
  public enum ConsoleAccessLevelEnum { AccessOperator }
  public delegate void SimplSharpProConsoleCmdFunction(string s);
  public static class CrestronConsole { public static void PrintLine(string f, params object[] a){} public static void ConsoleCommandResponse(string f, params object[] a){} public static bool AddNewConsoleCommand(SimplSharpProConsoleCmdFunction f,string n,string h,ConsoleAccessLevelEnum l){return true;} }
  public class CCriticalSection { public void Enter(){} public void Leave(){} }
  public delegate void CTimerCallbackFunction(object o);
  public class CTimer : IDisposable { public CTimer(CTimerCallbackFunction f, long due){} public CTimer(CTimerCallbackFunction f, object o, long due, long rep){} public void Dispose(){} }
}
namespace Crestron.SimplSharpPro.CrestronThread { public static class Thread { public static int MaxNumberOfUserThreads { get; set; } } }
namespace Crestron.SimplSharpPro {
  public class CrestronControlSystem { public virtual void InitializeSystem(){} public static System.Collections.Generic.List<Crestron.SimplSharpPro.DeviceSupport.BasicTriList> All = new System.Collections.Generic.List<Crestron.SimplSharpPro.DeviceSupport.BasicTriList>(); }
  public class GenericBase { public uint ID { get; set; } public event OnlineStatusChangeEventHandler OnlineStatusChange; public eDeviceRegistrationUnRegistrationResponse Register(){ return 0; } public void GoOnline(){ OnlineStatusChange?.Invoke(this, new OnlineOfflineEventArgs{DeviceOnLine=true}); } }
  public delegate void OnlineStatusChangeEventHandler(GenericBase d, OnlineOfflineEventArgs a);
  public class OnlineOfflineEventArgs : EventArgs { public bool DeviceOnLine; }
  public enum eDeviceRegistrationUnRegistrationResponse { Success }
  public enum eSigType { Bool, UShort, String }
  public class Sig { public uint Number; public eSigType Type; public bool BoolValue; public ushort UShortValue; public string StringValue; }
  public class SigEventArgs : EventArgs { public Sig Sig; }
  public class BoolInputSig { public bool BoolValue { get; set; } }
  public class UShortInputSig { public ushort UShortValue { get; set; } }
  public class StringInputSig { public string StringValue { get; set; } }
  public class Coll<T> where T : new() { public readonly System.Collections.Generic.Dictionary<uint,T> D = new System.Collections.Generic.Dictionary<uint,T>(); public T this[uint i] { get { T v; if (!D.TryGetValue(i, out v)) { v = new T(); D[i] = v; } return v; } } }
}
namespace Crestron.SimplSharpPro.DeviceSupport {
  using Crestron.SimplSharpPro;
  public delegate void SigEventHandler(BasicTriList d, SigEventArgs a);
  public class BasicTriList : GenericBase { public event SigEventHandler SigChange; public void Fire(eSigType ty, uint j, bool b, ushort u){ SigChange?.Invoke(this, new SigEventArgs{ Sig = new Sig{ Number=j, Type=ty, BoolValue=b, UShortValue=u } }); } public Coll<BoolInputSig> BooleanInput = new Coll<BoolInputSig>(); public Coll<UShortInputSig> UShortInput = new Coll<UShortInputSig>(); public Coll<StringInputSig> StringInput = new Coll<StringInputSig>(); }
}
namespace Crestron.SimplSharpPro.EthernetCommunication { public class EthernetIntersystemCommunications : Crestron.SimplSharpPro.DeviceSupport.BasicTriList { public EthernetIntersystemCommunications(uint id, string ip, Crestron.SimplSharpPro.CrestronControlSystem cs){ ID = id; } } }
namespace Crestron.SimplSharpPro.UI {
  using Crestron.SimplSharpPro.DeviceSupport;
  public class Tsw1070GV : BasicTriList { public Tsw1070GV(uint id, Crestron.SimplSharpPro.CrestronControlSystem cs){ ID = id; } }
  public class XpanelForHtml5 : BasicTriList { public XpanelForHtml5(uint id, Crestron.SimplSharpPro.CrestronControlSystem cs){ ID = id; } }
  public class StrParam { public string Value { get; set; } }
  public class CrestronOne : BasicTriList { public CrestronOne(uint id, Crestron.SimplSharpPro.CrestronControlSystem cs){ ID = id; } public StrParam ParameterProjectName = new StrParam(); }
}
