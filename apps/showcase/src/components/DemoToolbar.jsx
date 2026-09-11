import React, { useEffect, useRef, useState } from "react";
import { Icons } from "../icons";
import { useTranslation } from "../context/LanguageContext";
import { SITE_URL } from "../data/company";

// Outils "démo" : QR code, mode présentation, fiche PDF, plein écran. En Mode normal
// ils sont empilés dans la colonne de droite au-dessus des boutons de support
// (demande du 10.09.2026 : laisser toute la hauteur au châssis sur petit écran). Tout est piloté par l'URL, donc
// reproductible. (Le nom du client reste pilotable via ?client= dans l'URL.)
export const DemoToolbar = ({
  project,
  shareUrl,
  onTogglePresentation,
  presenting,
  sheetUrl,
  embedUrl,
  center = null, // légende du châssis (support · taille · échelle), sur la même ligne
  vertical = false, // Mode normal : boutons empilés dans la colonne de droite, au-dessus des supports
}) => {
  const { t } = useTranslation();
  const [qrOpen, setQrOpen] = useState(false);

  const absoluteShareUrl = shareUrl.startsWith("http") ? shareUrl : `${SITE_URL}${shareUrl}`;
  // Le QR code cible le mode démo mobile (#demo/<id>) : sur iPhone / iPad
  // l'interface s'ouvre en plein écran réel (version phone ou tablette
  // détectée automatiquement), pas la page du site avec le châssis simulé.
  const demoUrl = project?.id ? `${SITE_URL}/#demo/${project.id}` : absoluteShareUrl;


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
    <div className={`demo-toolbar ${vertical ? "demo-toolbar--vertical" : ""}`}>
      <div className="demo-toolbar-group">
        {/* « Copier le lien » retiré le 10.09.2026 (demande de Donatien) — le QR code et la fiche portent le lien */}
        <Btn icon="QrCode" label={t("tool_qr")} onClick={() => setQrOpen(true)} />
        <Btn
          icon={presenting ? "Square" : "Presentation"}
          label={t("tool_present")}
          title={presenting ? t("tool_present_stop") : t("tool_present")}
          onClick={onTogglePresentation}
          active={presenting}
        />
      </div>
      {center && <div className="demo-toolbar-center">{center}</div>}
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
