import { useState, useEffect } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useLanguage } from "./LanguageContext";
import { Cookie, X } from "lucide-react";
import { updateGoogleConsent } from "./analytics";

const COOKIE_CONSENT_KEY = "ms-cookie-consent";

type ConsentState = {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
};

export function CookieBanner() {
  const { lang } = useLanguage();
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!stored) {
      // Small delay so it doesn't flash on first paint
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const saveConsent = (consent: ConsentState) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent));
    updateGoogleConsent(consent.analytics, consent.marketing);
    setVisible(false);
  };

  const acceptAll = () => {
    saveConsent({
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString(),
    });
  };

  const acceptSelected = () => {
    saveConsent({
      ...preferences,
      necessary: true,
      timestamp: new Date().toISOString(),
    });
  };

  const acceptNecessary = () => {
    saveConsent({
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
    });
  };

  const t = lang === "de"
    ? {
        title: "Cookie-Einstellungen",
        text: "Wir verwenden Cookies, um Ihnen die bestmögliche Erfahrung auf unserer Website zu bieten. Einige Cookies sind technisch notwendig, andere helfen uns, die Website zu verbessern.",
        acceptAll: "Alle akzeptieren",
        acceptSelected: "Auswahl bestätigen",
        rejectAll: "Nur notwendige",
        settings: "Einstellungen",
        necessary: "Notwendig",
        necessaryDesc: "Diese Cookies sind technisch erforderlich und können nicht deaktiviert werden.",
        analytics: "Analyse",
        analyticsDesc: "Helfen uns zu verstehen, wie Besucher unsere Website nutzen.",
        marketing: "Marketing",
        marketingDesc: "Ermöglichen personalisierte Werbung und Inhalte.",
        moreInfo: "Mehr in unserer",
        privacy: "Datenschutzerklärung",
      }
    : {
        title: "Cookie Settings",
        text: "We use cookies to provide you with the best possible experience on our website. Some cookies are technically necessary, others help us improve the website.",
        acceptAll: "Accept all",
        acceptSelected: "Confirm selection",
        rejectAll: "Necessary only",
        settings: "Settings",
        necessary: "Necessary",
        necessaryDesc: "These cookies are technically required and cannot be disabled.",
        analytics: "Analytics",
        analyticsDesc: "Help us understand how visitors use our website.",
        marketing: "Marketing",
        marketingDesc: "Enable personalized advertising and content.",
        moreInfo: "More in our",
        privacy: "Privacy Policy",
      };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-0 left-0 right-0 z-[9998] p-4 md:p-6"
        >
          <div className="max-w-2xl mx-auto bg-white border border-black/10 shadow-2xl shadow-black/10">
            <div className="p-6 md:p-8">
              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <Cookie size={20} className="text-black/40 shrink-0" />
                  <h3
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "1.3rem",
                      fontWeight: 600,
                    }}
                  >
                    {t.title}
                  </h3>
                </div>
                <button
                  onClick={acceptNecessary}
                  className="text-black/30 hover:text-black transition-colors bg-transparent border-none cursor-pointer p-1 shrink-0"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Text */}
              <p
                className="text-black/55 text-[0.82rem] mb-5"
                style={{ lineHeight: 1.7, fontWeight: 300 }}
              >
                {t.text}{" "}
                <Link
                  to="/datenschutz"
                  className="text-black/70 underline hover:text-black transition-colors"
                  onClick={() => setVisible(false)}
                >
                  {t.moreInfo} {t.privacy}
                </Link>
              </p>

              {/* Details toggle */}
              <AnimatePresence>
                {showDetails && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-black/10 pt-5 mb-5 space-y-4">
                      {/* Necessary */}
                      <label className="flex items-start gap-3 cursor-not-allowed">
                        <input
                          type="checkbox"
                          checked={true}
                          disabled
                          className="mt-1 accent-black"
                        />
                        <div>
                          <p className="text-[0.82rem] text-black/80" style={{ fontWeight: 500 }}>
                            {t.necessary}
                          </p>
                          <p className="text-[0.75rem] text-black/40" style={{ fontWeight: 300 }}>
                            {t.necessaryDesc}
                          </p>
                        </div>
                      </label>

                      {/* Analytics */}
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.analytics}
                          onChange={(e) =>
                            setPreferences((p) => ({ ...p, analytics: e.target.checked }))
                          }
                          className="mt-1 accent-black cursor-pointer"
                        />
                        <div>
                          <p className="text-[0.82rem] text-black/80" style={{ fontWeight: 500 }}>
                            {t.analytics}
                          </p>
                          <p className="text-[0.75rem] text-black/40" style={{ fontWeight: 300 }}>
                            {t.analyticsDesc}
                          </p>
                        </div>
                      </label>

                      {/* Marketing */}
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.marketing}
                          onChange={(e) =>
                            setPreferences((p) => ({ ...p, marketing: e.target.checked }))
                          }
                          className="mt-1 accent-black cursor-pointer"
                        />
                        <div>
                          <p className="text-[0.82rem] text-black/80" style={{ fontWeight: 500 }}>
                            {t.marketing}
                          </p>
                          <p className="text-[0.75rem] text-black/40" style={{ fontWeight: 300 }}>
                            {t.marketingDesc}
                          </p>
                        </div>
                      </label>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={acceptAll}
                  className="flex-1 bg-black text-white py-3 px-6 text-[0.78rem] tracking-[0.1em] uppercase cursor-pointer border border-black hover:bg-black/85 transition-all"
                  style={{ fontWeight: 400 }}
                >
                  {t.acceptAll}
                </button>
                {showDetails ? (
                  <button
                    onClick={acceptSelected}
                    className="flex-1 bg-transparent text-black py-3 px-6 text-[0.78rem] tracking-[0.1em] uppercase cursor-pointer border border-black/20 hover:border-black transition-all"
                    style={{ fontWeight: 400 }}
                  >
                    {t.acceptSelected}
                  </button>
                ) : (
                  <button
                    onClick={() => setShowDetails(true)}
                    className="flex-1 bg-transparent text-black py-3 px-6 text-[0.78rem] tracking-[0.1em] uppercase cursor-pointer border border-black/20 hover:border-black transition-all"
                    style={{ fontWeight: 400 }}
                  >
                    {t.settings}
                  </button>
                )}
                <button
                  onClick={acceptNecessary}
                  className="flex-1 bg-transparent text-black/50 py-3 px-6 text-[0.78rem] tracking-[0.1em] uppercase cursor-pointer border border-black/10 hover:border-black/30 transition-all"
                  style={{ fontWeight: 400 }}
                >
                  {t.rejectAll}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}