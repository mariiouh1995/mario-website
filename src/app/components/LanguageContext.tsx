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

export function LanguageProvider({ children, initialLanguage = 'de' }: { children: ReactNode; initialLanguage?: Language }) {
  const [lang, setLang] = useState<Language>(() => typeof window === 'undefined' ? initialLanguage : new URLSearchParams(window.location.search).get('lang') === 'en' ? 'en' : 'de');

  const toggleLanguage = useCallback(() => {
    setLang((prev) => {
      const next = prev === 'de' ? 'en' : 'de';
      const url = new URL(window.location.href);
      if (next === 'en') url.searchParams.set('lang', 'en'); else url.searchParams.delete('lang');
      window.history.replaceState(window.history.state, '', url);
      return next;
    });
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
