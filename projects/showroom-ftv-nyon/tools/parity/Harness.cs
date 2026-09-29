using System; using System.Linq; using System.Reflection; using Crestron.SimplSharpPro; using Crestron.SimplSharpPro.DeviceSupport;
public static class Harness {
  public static void Main(string[] a) {
    var cs = new ShowroomNyon.ControlSystem(); cs.InitializeSystem();
    var panels = (System.Collections.Generic.List<BasicTriList>)typeof(ShowroomNyon.ControlSystem).GetField("_panels", BindingFlags.NonPublic|BindingFlags.Instance).GetValue(cs);
    var tsw = panels.First(p => p.ID == 3);
    tsw.GoOnline();
    foreach (var line in System.IO.File.ReadAllLines(a[0])) {
      var p = line.Split(' '); if (p.Length < 2) continue;
      if (p[0] == "b") { uint j = uint.Parse(p[1]); tsw.Fire(eSigType.Bool, j, true, 0); tsw.Fire(eSigType.Bool, j, false, 0); }
      else if (p[0] == "n") tsw.Fire(eSigType.UShort, uint.Parse(p[1]), false, ushort.Parse(p[2]));
    }
    foreach (var kv in tsw.BooleanInput.D.OrderBy(k => k.Key)) Console.WriteLine("b " + kv.Key + " " + (kv.Value.BoolValue ? 1 : 0));
    foreach (var kv in tsw.UShortInput.D.OrderBy(k => k.Key)) Console.WriteLine("n " + kv.Key + " " + kv.Value.UShortValue);
    foreach (var kv in tsw.StringInput.D.OrderBy(k => k.Key)) Console.WriteLine("s " + kv.Key + " " + (kv.Value.StringValue ?? ""));
  }
}
