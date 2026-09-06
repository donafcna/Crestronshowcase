import React, { useEffect, useRef, useState } from "react";
import { Icons } from "../icons";
import { useTranslation } from "../context/LanguageContext";
import { useDemoSettings } from "../hooks/useDemoSettings";
import { SITE_URL } from "../data/company";

// Barre d'outils "démo" affichée au-dessus de l'appareil : partage du lien,
// QR code, mode présentation, fiche PDF, capture d'écran et personnalisation
// du nom du client. Tout est piloté par l'URL, donc reproductible.
export const DemoToolbar = ({
  project,
  shareUrl,
  onTogglePresentation,
  presenting,
  onCapture,
  capturing,
  sheetUrl,
  embedUrl,
}) => {
  const { t } = useTranslation();
  const { clientName, setClientName } = useDemoSettings();
  const [copied, setCopied] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [clientOpen, setClientOpen] = useState(false);
  const [draftName, setDraftName] = useState(clientName);
  const inputRef = useRef(null);

  useEffect(() => setDraftName(clientName), [clientName]);
  useEffect(() => {
    if (clientOpen) inputRef.current?.focus();
  }, [clientOpen]);

  const absoluteShareUrl = shareUrl.startsWith("http") ? shareUrl : `${SITE_URL}${shareUrl}`;

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

  const submitClient = (e) => {
    e.preventDefault();
    setClientName(draftName);
    setClientOpen(false);
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
          label={presenting ? t("tool_present_stop") : t("tool_present")}
          onClick={onTogglePresentation}
          active={presenting}
        />
      </div>
      <div className="demo-toolbar-group">
        <Btn icon="FileText" label={t("tool_sheet")} href={sheetUrl} />
        <Btn icon="Camera" label={capturing ? t("tool_capture_busy") : t("tool_capture")} onClick={onCapture} />
        {embedUrl && <Btn icon="ExternalLink" label={t("tool_open_tab")} href={embedUrl} />}
        <Btn
          icon="UserPen"
          label={clientName ? clientName : t("tool_client")}
          onClick={() => setClientOpen((v) => !v)}
          active={!!clientName || clientOpen}
        />
      </div>

      {clientOpen && (
        <form className="demo-client-popover glass-panel" onSubmit={submitClient}>
          <label htmlFor="demo-client-name">{t("tool_client")}</label>
          <input
            id="demo-client-name"
            ref={inputRef}
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            placeholder={t("tool_client_placeholder")}
            maxLength={40}
          />
          <small>{t("tool_client_hint")}</small>
          <div className="demo-client-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setDraftName("");
                setClientName("");
                setClientOpen(false);
              }}
            >
              {t("tool_client_clear")}
            </button>
            <button type="submit" className="btn btn-primary">
              OK
            </button>
          </div>
        </form>
      )}

      {qrOpen && <QrModal url={absoluteShareUrl} project={project} onClose={() => setQrOpen(false)} />}
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
