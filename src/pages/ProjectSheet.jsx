import React, { useEffect, useRef } from "react";
import { Icons } from "../icons";
import { useTranslation } from "../context/LanguageContext";
import { projects, getDeviceById, getProjectText, getProjectName, getStatusLabel } from "../data/projects";
import { company, SITE_URL } from "../data/company";
import { useDemoSettings } from "../hooks/useDemoSettings";
import { Link, buildShowcasePath } from "../router";

// Fiche projet A4 imprimable : "Imprimer" → "Enregistrer en PDF" dans le
// navigateur donne un PDF propre (logo, statut, supports, points clés, QR
// code vers la démo en ligne, coordonnées). Sans bibliothèque PDF.
const TEXT = {
  fr: {
    sheet: "Fiche interface",
    client: "Client",
    year: "Année",
    sectors: "Secteur",
    devices: "Supports",
    features: "Points clés",
    demo: "Tester l'interface en ligne",
    scan: "Scannez pour ouvrir la démo interactive sur votre iPad ou smartphone.",
    print: "Imprimer / Enregistrer en PDF",
    back: "Retour à l'interface",
    contactTitle: "Votre interlocuteur",
    preparedFor: "Document préparé pour",
    tech: "Technologie : Crestron CH5 (HTML5 / CSS / JavaScript) · Processeurs Crestron 4-Series",
  },
  en: {
    sheet: "Interface sheet",
    client: "Client",
    year: "Year",
    sectors: "Sector",
    devices: "Devices",
    features: "Key points",
    demo: "Try the interface online",
    scan: "Scan to open the interactive demo on your iPad or smartphone.",
    print: "Print / Save as PDF",
    back: "Back to the interface",
    contactTitle: "Your contact",
    preparedFor: "Document prepared for",
    tech: "Technology: Crestron CH5 (HTML5 / CSS / JavaScript) · Crestron 4-Series processors",
  },
  de: {
    sheet: "Oberflächen-Datenblatt",
    client: "Kunde",
    year: "Jahr",
    sectors: "Branche",
    devices: "Geräte",
    features: "Kernpunkte",
    demo: "Oberfläche online testen",
    scan: "Scannen, um die interaktive Demo auf iPad oder Smartphone zu öffnen.",
    print: "Drucken / Als PDF speichern",
    back: "Zurück zur Oberfläche",
    contactTitle: "Ihr Ansprechpartner",
    preparedFor: "Dokument erstellt für",
    tech: "Technologie: Crestron CH5 (HTML5 / CSS / JavaScript) · Crestron-4-Series-Prozessoren",
  },
};

export default function ProjectSheet({ projectId }) {
  const { lang, t } = useTranslation();
  const tx = TEXT[lang] || TEXT.fr;
  const { clientName } = useDemoSettings();
  const project = projects.find((p) => p.id === projectId) || projects[0];
  const text = getProjectText(project, lang);
  const name = getProjectName(project, lang);
  const demoPath = buildShowcasePath({ sectorId: project.sectors[0], projectId: project.id });
  const demoUrl = `${SITE_URL}${demoPath}${clientName ? `?client=${encodeURIComponent(clientName)}` : ""}`;
  const qrRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    import("qrcode").then((QRCode) => {
      if (cancelled || !qrRef.current) return;
      QRCode.toCanvas(qrRef.current, demoUrl, { width: 180, margin: 1, color: { dark: "#0f172a", light: "#ffffff" } });
    });
    return () => {
      cancelled = true;
    };
  }, [demoUrl]);

  const deviceLabels = Array.from(
    new Set(project.devices.map((id) => getDeviceById(id)).filter(Boolean).map((d) => `${d.name}`))
  );

  const StatusIcon = project.status === "realisation" ? Icons.BadgeCheck : Icons.Sparkles;

  return (
    <div className="sheet-page">
      <div className="sheet-toolbar no-print">
        <Link to={demoPath} className="btn btn-secondary">
          <Icons.ArrowLeft size={16} />
          <span>{tx.back}</span>
        </Link>
        <button type="button" className="btn btn-primary" onClick={() => window.print()}>
          <Icons.Printer size={16} />
          <span>{tx.print}</span>
        </button>
      </div>

      <article className="sheet">
        <header className="sheet-header">
          <img src="/assets/logo-frequence-tv-5LGUrtbd.png" alt="Fréquence TV" className="sheet-logo" />
          <div className="sheet-header-text">
            <span className="sheet-kicker">{tx.sheet} · Crestron CH5</span>
            <h1>{name}</h1>
            <p className="sheet-status">
              <StatusIcon size={16} /> {getStatusLabel(project.status, lang)}
            </p>
          </div>
          <img src="/assets/logo-crestron-CSWzrfLt.png" alt="Crestron" className="sheet-logo crestron" />
        </header>

        {clientName && (
          <p className="sheet-prepared">
            {tx.preparedFor} <strong>{clientName}</strong>
          </p>
        )}

        <div className="sheet-hero">
          <img src={project.thumbnailUrl} alt="" />
          <p className="sheet-lead">{text.description}</p>
        </div>

        <div className="sheet-columns">
          <div className="sheet-main">
            <p className="sheet-details">{text.details}</p>
            <h2>{tx.features}</h2>
            <ul className="sheet-features">
              {text.features.map((f) => (
                <li key={f}>
                  <Icons.Check size={14} /> {f}
                </li>
              ))}
            </ul>
          </div>
          <aside className="sheet-side">
            <dl>
              <dt>{tx.client}</dt>
              <dd>{project.client}</dd>
              <dt>{tx.sectors}</dt>
              <dd>{project.sectors.map((s) => t(`sector_${s}_name`)).join(", ")}</dd>
              <dt>{tx.devices}</dt>
              <dd>{deviceLabels.join(" · ")}</dd>
              <dt>{tx.year}</dt>
              <dd>{project.year}</dd>
            </dl>
            <div className="sheet-qr">
              <canvas ref={qrRef} />
              <strong>{tx.demo}</strong>
              <small>{tx.scan}</small>
              <code>{demoUrl.replace(/^https?:\/\//, "")}</code>
            </div>
          </aside>
        </div>

        <footer className="sheet-footer">
          <div>
            <strong>{company.legalName}</strong>
            <br />
            {company.showrooms.map((s) => s.address).join(" · ")}
          </div>
          <div>
            {company.phone} · {company.email}
            <br />
            {company.website.replace(/^https?:\/\//, "")}
          </div>
          <div className="sheet-tech">{tx.tech}</div>
        </footer>
      </article>
    </div>
  );
}
