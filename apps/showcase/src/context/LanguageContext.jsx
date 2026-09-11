import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { translations } from "../data/translations";
import { uiTranslations, SUPPORTED_LANGS } from "../data/uiTranslations";

const LanguageContext = createContext(undefined);

// Dictionnaires fusionnés : uiTranslations (nouveaux textes) prime sur
// translations.js (textes historiques). Seules FR / EN / DE sont exposées
// publiquement — les autres langues de translations.js ne sont pas relues.
const buildDict = (lang) => ({
  ...(translations[lang] || {}),
  ...(uiTranslations[lang] || {}),
});

const DICTS = Object.fromEntries(SUPPORTED_LANGS.map((l) => [l, buildDict(l)]));

const detectLang = () => {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get("lang");
    if (fromUrl && SUPPORTED_LANGS.includes(fromUrl)) return fromUrl;
    const saved = localStorage.getItem("app_lang");
    if (saved && SUPPORTED_LANGS.includes(saved)) return saved;
  } catch {
    /* localStorage indisponible (navigation privée, iframe...) */
  }
  const browserLang = (navigator.language || navigator.userLanguage || "").substring(0, 2).toLowerCase();
  return SUPPORTED_LANGS.includes(browserLang) ? browserLang : "fr";
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(detectLang);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const changeLanguage = (newLang) => {
    if (!SUPPORTED_LANGS.includes(newLang)) return;
    setLang(newLang);
    try {
      localStorage.setItem("app_lang", newLang);
    } catch {
      /* ignore */
    }
    try {
      document.querySelectorAll("iframe").forEach((iframe) => {
        if (iframe.contentWindow) {
          iframe.contentWindow.postMessage({ action: "changeLanguage", lang: newLang }, "*");
        }
      });
    } catch (err) {
      console.warn("Failed to propagate language to iframe", err);
    }
  };

  const value = useMemo(() => {
    const dict = DICTS[lang] || DICTS.fr;
    const t = (key) => dict[key] || DICTS.en[key] || DICTS.fr[key] || String(key);
    return { lang, changeLanguage, t, supportedLangs: SUPPORTED_LANGS };
  }, [lang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation must be used within LanguageProvider");
  }
  return context;
};
