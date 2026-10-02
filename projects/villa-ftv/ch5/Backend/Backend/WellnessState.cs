namespace VillaFrequenceTvAutomation
{
    // Independent circuits. OFF by default; measured values are unknown until a driver reply.
    public sealed class WellnessState
    {
        public bool Available { get; set; }
        public bool SaunaOn { get; set; }
        public bool HammamOn { get; set; }
        public ushort SaunaTarget { get; private set; }
        public ushort HumidityTarget { get; private set; }
        public ushort SaunaActual { get; private set; }
        public ushort HumidityActual { get; private set; }
        public bool HasSaunaActual { get; private set; }
        public bool HasHumidityActual { get; private set; }
        public ushort SaunaMin = 600, SaunaMax = 1000, HumidityMin = 90, HumidityMax = 100;
        public WellnessState() { SaunaTarget = 800; HumidityTarget = 95; }
        public bool Apply(uint offset)
        {
            if (!Available || offset < 11 || offset > 18) return false;
            if (offset == 11) SaunaOn = true;
            if (offset == 12) SaunaOn = false;
            if (offset == 13) SetValue(34, (ushort)System.Math.Min(SaunaMax, SaunaTarget + 10));
            if (offset == 14) SetValue(34, (ushort)System.Math.Max(SaunaMin, SaunaTarget - 10));
            if (offset == 15) HammamOn = true;
            if (offset == 16) HammamOn = false;
            if (offset == 17) SetValue(35, (ushort)System.Math.Min(HumidityMax, HumidityTarget + 1));
            if (offset == 18) SetValue(35, (ushort)System.Math.Max(HumidityMin, HumidityTarget - 1));
            return true;
        }
        public bool SetValue(uint offset, ushort value)
        {
            if (!Available) return false;
            if (offset == 34 && value >= SaunaMin && value <= SaunaMax) SaunaTarget = value;
            else if (offset == 35 && value >= HumidityMin && value <= HumidityMax) HumidityTarget = value;
            else if (offset == 36 && value <= 1500) { SaunaActual = value; HasSaunaActual = true; }
            else if (offset == 37 && value <= 100) { HumidityActual = value; HasHumidityActual = true; }
            else return false;
            return true;
        }
        public bool Selected(uint offset)
        {
            return Available && (offset == 11 ? SaunaOn : offset == 12 ? !SaunaOn : offset == 15 ? HammamOn : offset == 16 && !HammamOn);
        }
        public ushort Value(uint offset)
        {
            return offset == 34 ? SaunaTarget : offset == 35 ? HumidityTarget : offset == 36 ? SaunaActual : HumidityActual;
        }
        public string Text(uint offset)
        {
            if (!Available || (offset == 36 && !HasSaunaActual) || (offset == 37 && !HasHumidityActual)) return "--";
            return (offset == 34 || offset == 36) ? (Value(offset) / 10.0).ToString("F1", System.Globalization.CultureInfo.InvariantCulture) : Value(offset).ToString();
        }
    }
}
