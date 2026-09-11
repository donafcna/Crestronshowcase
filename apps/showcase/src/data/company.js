// Coordonnées et identité de l'entreprise affichées sur le site (contact,
// fiches PDF, balises SEO). À maintenir par le marketing — un seul endroit.
//
// ⚠ TODO marketing : confirmer l'adresse e-mail de contact (celle affichée sur
// frequence-tv.ch est masquée contre les robots, elle n'a pas pu être vérifiée).
export const company = {
  name: "Fréquence TV",
  legalName: "Fréquence TV SA",
  tagline: {
    fr: "Étude, fourniture, intégration et maintenance de systèmes audiovisuels et domotiques en Suisse romande.",
    en: "Design, supply, integration and maintenance of audiovisual and home-automation systems in French-speaking Switzerland.",
    de: "Planung, Lieferung, Integration und Wartung von Audiovisions- und Smart-Home-Systemen in der Westschweiz.",
  },
  website: "https://frequence-tv.ch",
  email: "info@frequence-tv.ch",
  phone: "+41 22 369 42 02",
  phoneHref: "tel:+41223694202",
  showrooms: [
    {
      city: "Genève",
      address: "Rue du Rhône 59, 1204 Genève – Suisse",
      hours: {
        fr: "Lundi – Vendredi : 10h – 18h · Samedi : 10h – 17h30",
        en: "Monday – Friday: 10am – 6pm · Saturday: 10am – 5:30pm",
        de: "Montag – Freitag: 10–18 Uhr · Samstag: 10–17.30 Uhr",
      },
      mapUrl: "https://maps.google.com/?q=Rue+du+Rh%C3%B4ne+59,+1204+Gen%C3%A8ve",
    },
    {
      city: "Nyon",
      address: "Champ-Colin 2A, 1260 Nyon – Suisse",
      hours: {
        fr: "Lundi – Jeudi : 8h – 12h / 13h30 – 18h30 · Vendredi : 8h – 12h / 13h30 – 17h",
        en: "Monday – Thursday: 8am – 12pm / 1:30pm – 6:30pm · Friday: 8am – 12pm / 1:30pm – 5pm",
        de: "Montag – Donnerstag: 8–12 / 13.30–18.30 Uhr · Freitag: 8–12 / 13.30–17 Uhr",
      },
      mapUrl: "https://maps.google.com/?q=Champ-Colin+2A,+1260+Nyon",
    },
  ],
  social: {
    linkedin: "https://www.linkedin.com/company/7249847",
    instagram: "https://www.instagram.com/frequencetv/",
    facebook: "https://www.facebook.com/profile.php?id=100092144504001",
  },
};

// URL publique du site vitrine (utilisée pour les QR codes, le partage, le
// sitemap et les balises Open Graph).
export const SITE_URL = "https://crestrongui.vercel.app";
