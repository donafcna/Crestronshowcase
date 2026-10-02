namespace VillaFrequenceTvAutomation
{
    // Independent of the Crestron runtime, shared by all room command/feedback paths.
    public sealed class HvacState
    {
        public bool Enabled { get; set; }
        public ushort Fan { get; private set; } // 0 Auto, 1 Low, 2 Medium, 3 High
        public HvacState() { Enabled = true; }
        public bool SetFan(ushort value)
        {
            if (value > 3) return false;
            Fan = value;
            return true;
        }
        public bool Apply(uint offset)
        {
            if (offset == 93) Enabled = true;
            else if (offset == 94) Enabled = false;
            else if (offset >= 95 && offset <= 98) SetFan((ushort)(offset - 95));
            else return false;
            return true;
        }
        public bool Selected(uint offset)
        {
            if (offset == 93) return Enabled;
            if (offset == 94) return !Enabled;
            return offset >= 95 && offset <= 98 && Fan == offset - 95;
        }
    }
}
