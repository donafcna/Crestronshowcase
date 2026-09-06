import React, { useEffect, useState } from "react";
import { Icons } from "../icons";
import { useTranslation } from "../context/LanguageContext";

// Curseur animé de la démo automatique (dessiné par-dessus l'appareil).
export const DemoCursor = ({ cursor }) => (
  <div
    className={`demo-cursor ${cursor.visible ? "visible" : ""}`}
    style={{ transform: `translate(${cursor.x}px, ${cursor.y}px)` }}
    aria-hidden="true"
  >
    <span key={cursor.pulse} className="demo-cursor-pulse" />
    <span className="demo-cursor-dot" />
  </div>
);

// Chronomètre de reprise : anneau de progression (en %) + compte à rebours.
export const DemoCountdown = ({ resumeAt, total, onResumeNow }) => {
  const { t } = useTranslation();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(id);
  }, []);

  const remainingMs = Math.max(0, resumeAt - now);
  const seconds = Math.ceil(remainingMs / 1000);
  const pct = Math.max(0, Math.min(100, Math.round((remainingMs / total) * 100)));
  const R = 17;
  const C = 2 * Math.PI * R;

  return (
    <button type="button" className="demo-countdown glass-panel" onClick={onResumeNow} title={t("demo_resume_now")}>
      <svg className="demo-countdown-ring" viewBox="0 0 40 40" aria-hidden="true">
        <circle className="demo-countdown-track" cx="20" cy="20" r={R} />
        <circle
          className="demo-countdown-progress"
          cx="20"
          cy="20"
          r={R}
          strokeDasharray={C}
          strokeDashoffset={C * (1 - pct / 100)}
        />
        <text x="20" y="21.5" textAnchor="middle" dominantBaseline="middle" className="demo-countdown-pct">
          {pct}%
        </text>
      </svg>
      <span className="demo-countdown-text">
        <Icons.Presentation size={13} />
        {t("demo_resume_in").replace("{s}", String(seconds))}
      </span>
    </button>
  );
};
