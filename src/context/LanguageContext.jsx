import React, { createContext, useContext, useState } from "react";
import { translations } from "../data/translations";

const LanguageContext = createContext(undefined);

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    const saved = localStorage.getItem("app_lang");
    if (saved && ["fr", "en", "de", "es", "ru", "ar", "zh"].includes(saved)) {
      return saved;
    }
    const browserLang = (navigator.language || navigator.userLanguage || "").substring(0, 2).toLowerCase();
    return ["fr", "en", "de", "es", "ru", "ar", "zh"].includes(browserLang) ? browserLang : "en";
  });

  const changeLanguage = (newLang) => {
    if (["fr", "en", "de", "es", "ru", "ar", "zh"].includes(newLang)) {
      setLang(newLang);
      localStorage.setItem("app_lang", newLang);
      try {
        document.querySelectorAll("iframe").forEach((iframe) => {
          if (iframe.contentWindow) {
            iframe.contentWindow.postMessage(
              { action: "changeLanguage", lang: newLang },
              "*"
            );
          }
        });
      } catch (err) {
        console.warn("Failed to propagate language to iframe", err);
      }
    }
  };

  const t = (key) => {
    const dict = translations[lang] || translations.en;
    return dict[key] || translations.en[key] || String(key);
  };

  return (
    <LanguageContext.Provider value={{ lang, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation must be used within LanguageProvider");
  }
  return context;
};
