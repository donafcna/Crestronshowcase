import React, { useEffect, useRef, useState } from "react";
import { Icons } from "../icons";
import { useTranslation } from "../context/LanguageContext";
import { SITE_URL } from "../data/company";

// Barre d'outils "démo" affichée au-dessus de l'appareil : partage du lien,
// QR code, mode présentation, fiche PDF. Tout est piloté par l'URL, donc
// reproductible. (Le nom du client reste pilotable via ?client= dans l'URL.)
export const DemoToolbar = ({
  project,
  shareUrl,
  onTogglePresentation,
  presenting,
  sheetUrl,
  embedUrl,
}) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);

  const absoluteShareUrl = shareUrl.startsWith("http") ? shareUrl : `${SITE_URL}${shareUrl}`;
  // Le QR code cible le mode démo mobile (#demo/<id>) : sur iPhone / iPad
  // l'interface s'ouvre en plein écran réel (version phone ou tablette
  // détectée automatiquement), pas la page du site avec le châssis simulé.
  const demoUrl = project?.id ? `${SITE_URL}/#demo/${project.id}` : absoluteShareUrl;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(absoluteShareUrl);
    } catch {
      // Repli : sélection manuelle via prompt (navigateurs sans clipboard API)
      window.prompt(t("tool_share"), absoluteShareUrl);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const Btn = ({ icon, label, onClick, active, href, title }) => {
    const IconComp = Icons[icon] || Icons.Circle;
    const content = (
      <>
        <IconComp size={14} />
        <span>{label}</span>
      </>
    );
    if (href) {
      return (
        <a className={`demo-tool-btn ${active ? "active" : ""}`} href={href} target="_blank" rel="noopener" title={title || label}>
          {content}
        </a>
      );
    }
    return (
      <button type="button" className={`demo-tool-btn ${active ? "active" : ""}`} onClick={onClick} title={title || label}>
        {content}
      </button>
    );
  };

  return (
    <div className="demo-toolbar">
      <div className="demo-toolbar-group">
        <Btn icon={copied ? "Check" : "Link"} label={copied ? t("tool_share_done") : t("tool_share")} onClick={copyLink} active={copied} />
        <Btn icon="QrCode" label={t("tool_qr")} onClick={() => setQrOpen(true)} />
        <Btn
          icon={presenting ? "Square" : "Presentation"}
          label={t("tool_present")}
          title={presenting ? t("tool_present_stop") : t("tool_present")}
          onClick={onTogglePresentation}
          active={presenting}
        />
      </div>
      <div className="demo-toolbar-group">
        <Btn icon="FileText" label={t("tool_sheet")} href={sheetUrl} />
        {embedUrl && <Btn icon="ExternalLink" label={t("tool_open_tab")} href={embedUrl} />}
      </div>


      {qrOpen && <QrModal url={demoUrl} project={project} onClose={() => setQrOpen(false)} />}
    </div>
  );
};

const QrModal = ({ url, project, onClose }) => {
  const { t } = useTranslation();
  const canvasRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    import("qrcode").then((QRCode) => {
      if (cancelled || !canvasRef.current) return;
      QRCode.toCanvas(canvasRef.current, url, { width: 260, margin: 1, color: { dark: "#0f172a", light: "#ffffff" } });
    });
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      cancelled = true;
      window.removeEventListener("keydown", onKey);
    };
  }, [url, onClose]);

  return (
    <div className="demo-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="demo-modal glass-panel" onClick={(e) => e.stopPropagation()}>
        <h3>{t("qr_title")}</h3>
        <canvas ref={canvasRef} className="demo-qr-canvas" />
        <p className="demo-modal-project">{project?.name}</p>
        <p>{t("qr_text")}</p>
        <code className="demo-modal-url">{url}</code>
        <button type="button" className="btn btn-primary" onClick={onClose}>
          {t("qr_close")}
        </button>
      </div>
    </div>
  );
};
