import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { translations, type Language, type Translations } from "./translations";

interface LanguageContextType {
  lang: Language;
  t: Translations;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "de",
  t: translations.de,
  toggleLanguage: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>("de");

  const toggleLanguage = useCallback(() => {
    setLang((prev) => (prev === "de" ? "en" : "de"));
  }, []);

  const t = translations[lang];

  return (
    <LanguageContext.Provider value={{ lang, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
