// Showroom FTV Nyon — état tenu par le slot 1 (une instance par pièce).
// Règles identiques à ch5/src/js/local-feedback.js (vitrine) : toute modification se fait des deux côtés.

using System;
using System.Collections.Generic;
using System.Linq;

namespace ShowroomNyon
{
    public class MusicState
    {
        public int Service;          // 0 = arrêt
        public bool Playing;
        public int Fav;
        public int Track = 1;        // 1..n de musique.pistes
        public int Position;         // s
        public int Volume = 30;      // 0-100
        public bool Muted, Like, Dislike, Shuffle, Repeat;
        public bool Sleep;
        public int SleepMinutes;     // réglage
        public int SleepLeftS;       // décompte
    }

    public class RoomState
    {
        public readonly RoomConfig Cfg;
        public readonly int[] Levels;     // 0-100 %
        public readonly int[] Last;       // dernier niveau non nul (bascule)
        public int Scene;                 // 0 = aucune
        public readonly MusicState Music = new MusicState();
        public int VideoSource;           // 0 = arrêt
        public int VideoVolume = 30;

        public RoomState(RoomConfig cfg)
        {
            Cfg = cfg;
            Levels = cfg.Circuits.Select(c => c.InitialPct).ToArray();
            Last = cfg.Circuits.Select(c => 100).ToArray();
            Music.Volume = cfg.AudioInitialVolume;
            VideoVolume = cfg.VideoInitialVolume;
        }

        public static int Clamp(int v, int lo = 0, int hi = 100) { return Math.Max(lo, Math.Min(hi, v)); }
        public int LightsOnCount { get { return Levels.Count(v => v > 0); } }
        public bool MediaOn { get { return (Cfg.AudioActive && Music.Service > 0) || (Cfg.VideoActive && VideoSource > 0); } }

        public int LevelFor(int i, int pct) { return Cfg.Circuits[i].Dimmable ? Clamp(pct) : (pct > 0 ? 100 : 0); }

        public void SetLevel(int i, int pct)
        {
            if (i < 0 || i >= Levels.Length) return;
            Levels[i] = LevelFor(i, pct);
            if (Levels[i] > 0) Last[i] = Levels[i];
        }

        public void SetAll(int pct) { for (int i = 0; i < Levels.Length; i++) SetLevel(i, pct); Scene = 0; }

        public void ApplyScene(int idx)
        {
            if (idx < 1 || idx > Cfg.Scenes.Count) return;
            var sc = Cfg.Scenes[idx - 1];
            for (int i = 0; i < Levels.Length; i++) SetLevel(i, i < sc.Levels.Count ? sc.Levels[i] : 0);
            Scene = idx;
        }

        public void Toggle(int i)
        {
            if (i < 0 || i >= Levels.Length) return;
            if (Levels[i] > 0) { Last[i] = Levels[i]; Levels[i] = 0; }
            else Levels[i] = Last[i] > 0 ? Last[i] : 100;
            Scene = 0;
        }

        public void Dim(int delta) { for (int i = 0; i < Levels.Length; i++) SetLevel(i, Levels[i] + delta); Scene = 0; }

        public void MusicOff() { Music.Service = 0; Music.Playing = false; Music.Fav = 0; Music.Sleep = false; Music.SleepLeftS = 0; }

        public void Off() { SetAll(0); MusicOff(); VideoSource = 0; }
    }
}
