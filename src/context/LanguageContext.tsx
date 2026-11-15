"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Language, translations, DashboardTranslations } from "@/data/translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: DashboardTranslations;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "EN",
  setLanguage: () => {},
  t: translations.EN,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("EN");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("admin_lang") as Language | null;
      if (saved === "EN" || saved === "DE") {
        setLanguageState(saved);
      }
    } catch (e) {
      console.error("Failed to read admin_lang from localStorage", e);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem("admin_lang", lang);
      window.dispatchEvent(new Event("storage"));
    } catch (e) {
      console.error("Failed to save admin_lang to localStorage", e);
    }
  };

  const t = translations[language] || translations.EN;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
}
