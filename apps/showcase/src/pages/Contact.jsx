import React, { useState } from "react";
import { Icons } from "../icons";
import { useTranslation } from "../context/LanguageContext";
import { company } from "../data/company";
import { projects, sectors, getProjectName } from "../data/projects";
import { useDemoSettings } from "../hooks/useDemoSettings";

// Page contact / demande de démo. Sans back-end : le formulaire compose un
// e-mail (mailto) prérempli — rien à héberger, rien à maintenir. Si le
// marketing souhaite un vrai formulaire, brancher ici un service type
// Formspree / Vercel Function et remplacer `buildMailto`.
const TEXT = {
  fr: {
    tagline: "Parlons de votre projet",
    title: "Demander une démonstration",
    intro:
      "Une interface se juge en la manipulant. Venez la tester dans l'un de nos showrooms, ou recevez un lien de démonstration personnalisé pour votre projet.",
    formTitle: "Votre demande",
    name: "Votre nom",
    email: "Votre e-mail",
    phone: "Téléphone (facultatif)",
    sector: "Type de projet",
    sectorAny: "— Choisir —",
    interest: "Interface qui vous intéresse",
    interestAny: "— Aucune en particulier —",
    message: "Votre message",
    messagePlaceholder: "Décrivez votre projet en quelques mots : lieu, surface, équipements souhaités, délai…",
    send: "Envoyer la demande",
    sendHint: "Le bouton ouvre votre messagerie avec un e-mail prérempli.",
    showrooms: "Nos showrooms",
    hours: "Horaires",
    map: "Itinéraire",
    call: "Appeler",
    write: "Écrire",
    site: "Site Fréquence TV",
    subject: "Demande de démonstration interface Crestron CH5",
    subjectFor: "pour",
    bodyIntro: "Bonjour,\n\nJe souhaite une démonstration d'interface Crestron CH5.",
  },
  en: {
    tagline: "Let's talk about your project",
    title: "Request a demonstration",
    intro:
      "An interface is judged by using it. Come and try it in one of our showrooms, or receive a personalised demo link for your project.",
    formTitle: "Your request",
    name: "Your name",
    email: "Your e-mail",
    phone: "Phone (optional)",
    sector: "Project type",
    sectorAny: "— Choose —",
    interest: "Interface you are interested in",
    interestAny: "— None in particular —",
    message: "Your message",
    messagePlaceholder: "Describe your project in a few words: location, size, desired equipment, timeline…",
    send: "Send the request",
    sendHint: "The button opens your e-mail client with a pre-filled message.",
    showrooms: "Our showrooms",
    hours: "Opening hours",
    map: "Directions",
    call: "Call",
    write: "Write",
    site: "Fréquence TV website",
    subject: "Crestron CH5 interface demo request",
    subjectFor: "for",
    bodyIntro: "Hello,\n\nI would like a demonstration of a Crestron CH5 interface.",
  },
  de: {
    tagline: "Sprechen wir über Ihr Projekt",
    title: "Demonstration anfragen",
    intro:
      "Eine Oberfläche beurteilt man beim Bedienen. Testen Sie sie in einem unserer Showrooms oder erhalten Sie einen personalisierten Demo-Link für Ihr Projekt.",
    formTitle: "Ihre Anfrage",
    name: "Ihr Name",
    email: "Ihre E-Mail",
    phone: "Telefon (optional)",
    sector: "Projektart",
    sectorAny: "— Auswählen —",
    interest: "Oberfläche, die Sie interessiert",
    interestAny: "— Keine bestimmte —",
    message: "Ihre Nachricht",
    messagePlaceholder: "Beschreiben Sie Ihr Projekt kurz: Ort, Fläche, gewünschte Ausstattung, Zeitplan …",
    send: "Anfrage senden",
    sendHint: "Der Button öffnet Ihr E-Mail-Programm mit einer vorausgefüllten Nachricht.",
    showrooms: "Unsere Showrooms",
    hours: "Öffnungszeiten",
    map: "Route",
    call: "Anrufen",
    write: "Schreiben",
    site: "Website Fréquence TV",
    subject: "Anfrage Demonstration Crestron-CH5-Oberfläche",
    subjectFor: "für",
    bodyIntro: "Guten Tag,\n\nich wünsche eine Demonstration einer Crestron-CH5-Oberfläche.",
  },
};

const Icon = ({ name, size = 18 }) => {
  const C = Icons[name] || Icons.Circle;
  return <C size={size} />;
};

export default function Contact() {
  const { lang, t } = useTranslation();
  const tx = TEXT[lang] || TEXT.fr;
  const { clientName } = useDemoSettings();
  const [form, setForm] = useState({ name: clientName || "", email: "", phone: "", sector: "", interest: "", message: "" });

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const buildMailto = () => {
    const interest = projects.find((p) => p.id === form.interest);
    const subject = `${tx.subject}${form.sector ? ` – ${t(`sector_${form.sector}_name`)}` : ""}${
      interest ? ` (${getProjectName(interest, lang)})` : ""
    }`;
    const lines = [
      tx.bodyIntro,
      "",
      `${tx.name}: ${form.name}`,
      `${tx.email}: ${form.email}`,
      form.phone ? `${tx.phone}: ${form.phone}` : null,
      form.sector ? `${tx.sector}: ${t(`sector_${form.sector}_name`)}` : null,
      interest ? `${tx.interest}: ${getProjectName(interest, lang)} – ${window.location.origin}/interfaces/tous/${interest.id}` : null,
      "",
      form.message,
    ].filter((l) => l !== null);
    return `mailto:${company.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;
  };

  const submit = (e) => {
    e.preventDefault();
    window.location.href = buildMailto();
  };

  return (
    <div className="dashboard-container page-contact fade-in">
      <section className="dashboard-hero">
        <div className="hero-text-block wide">
          <span className="hero-tagline">{tx.tagline}</span>
          <h1>{tx.title}</h1>
          <p>{tx.intro}</p>
          <div className="hero-actions">
            <a href={company.phoneHref} className="btn btn-primary">
              <Icon name="Phone" size={16} />
              <span>{company.phone}</span>
            </a>
            <a href={`mailto:${company.email}`} className="btn btn-secondary">
              <Icon name="Mail" size={16} />
              <span>{company.email}</span>
            </a>
            <a href={company.website} target="_blank" rel="noopener" className="btn btn-secondary">
              <Icon name="Globe" size={16} />
              <span>{tx.site}</span>
            </a>
          </div>
        </div>
      </section>

      <div className="contact-layout">
        <form className="glass-panel contact-form" onSubmit={submit}>
          <h2>{tx.formTitle}</h2>
          <div className="contact-grid">
            <label>
              <span>{tx.name}</span>
              <input required value={form.name} onChange={update("name")} autoComplete="name" />
            </label>
            <label>
              <span>{tx.email}</span>
              <input required type="email" value={form.email} onChange={update("email")} autoComplete="email" />
            </label>
            <label>
              <span>{tx.phone}</span>
              <input type="tel" value={form.phone} onChange={update("phone")} autoComplete="tel" />
            </label>
            <label>
              <span>{tx.sector}</span>
              <select value={form.sector} onChange={update("sector")}>
                <option value="">{tx.sectorAny}</option>
                {sectors.map((s) => (
                  <option key={s.id} value={s.id}>
                    {t(`sector_${s.id}_name`)}
                  </option>
                ))}
              </select>
            </label>
            <label className="span-2">
              <span>{tx.interest}</span>
              <select value={form.interest} onChange={update("interest")}>
                <option value="">{tx.interestAny}</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {getProjectName(p, lang)}
                  </option>
                ))}
              </select>
            </label>
            <label className="span-2">
              <span>{tx.message}</span>
              <textarea rows={5} value={form.message} onChange={update("message")} placeholder={tx.messagePlaceholder} />
            </label>
          </div>
          <div className="contact-submit">
            <button type="submit" className="btn btn-primary">
              <Icon name="Send" size={16} />
              <span>{tx.send}</span>
            </button>
            <small>{tx.sendHint}</small>
          </div>
        </form>

        <aside className="contact-side">
          <h2 className="section-heading">{tx.showrooms}</h2>
          {company.showrooms.map((s) => (
            <div key={s.city} className="glass-panel showroom-card">
              <h3>
                <Icon name="MapPin" size={16} /> {s.city}
              </h3>
              <p>{s.address}</p>
              <p className="showroom-hours">
                <Icon name="Clock" size={14} /> {s.hours[lang] || s.hours.fr}
              </p>
              <a href={s.mapUrl} target="_blank" rel="noopener" className="btn btn-secondary">
                <Icon name="ArrowRight" size={14} />
                <span>{tx.map}</span>
              </a>
            </div>
          ))}
          <div className="contact-social">
            {company.social.linkedin && (
              <a href={company.social.linkedin} target="_blank" rel="noopener" className="btn btn-secondary">
                <Icon name="ExternalLink" size={14} />
                <span>LinkedIn</span>
              </a>
            )}
            {company.social.instagram && (
              <a href={company.social.instagram} target="_blank" rel="noopener" className="btn btn-secondary">
                <Icon name="ExternalLink" size={14} />
                <span>Instagram</span>
              </a>
            )}
            {company.social.facebook && (
              <a href={company.social.facebook} target="_blank" rel="noopener" className="btn btn-secondary">
                <Icon name="ExternalLink" size={14} />
                <span>Facebook</span>
              </a>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
