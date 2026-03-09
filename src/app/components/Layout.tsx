import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router";
import { Menu, X, Instagram, Mail, MapPin } from "lucide-react";
import { useLanguage } from "./LanguageContext";
import { motion, AnimatePresence } from "motion/react";
import { ScrollToTop } from "./ScrollToTop";
import { CookieBanner } from "./CookieBanner";
import { StructuredData } from "./StructuredData";
import { FloatingWhatsApp } from "./FloatingWhatsApp";
import { useContactModal, type InquiryCategory } from "./ContactModal";

const LOGO_URL = "https://ik.imagekit.io/r2yqrg6np/68e54b92f722d45170d60f24_Logo%20MS.svg";

export function Layout() {
  const { t, lang, toggleLanguage } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const { openContact } = useContactModal();

  // Determine inquiry scope based on current route
  const getInquiryScope = (): InquiryCategory => {
    const path = location.pathname;
    if (path.startsWith("/hochzeiten")) return "wedding";
    if (path.startsWith("/tierfotografie")) return "animal";
    if (path.startsWith("/portrait")) return "portrait";
    return "general";
  };

  const navItems = [
    { path: "/", label: t.nav.home },
    { path: "/hochzeiten", label: t.nav.weddings },
    { path: "/tierfotografie", label: t.nav.animals },
    { path: "/portrait", label: t.nav.portrait },
    { path: "/ueber-mich", label: t.nav.about },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <StructuredData />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center no-underline"
              aria-label="Mario Schubert Photography - Startseite"
            >
              <img
                src={LOGO_URL}
                alt="Mario Schubert - Hochzeitsfotograf und Videograf in Innsbruck, Tirol"
                className="h-8 md:h-10 w-auto"
              />
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-8">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-[0.82rem] tracking-widest uppercase no-underline transition-colors relative ${
                    location.pathname === item.path
                      ? "text-black"
                      : "text-black/50 hover:text-black"
                  }`}
                  style={{ fontWeight: 400, letterSpacing: "0.12em" }}
                >
                  {item.label}
                  {location.pathname === item.path && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute -bottom-1 left-0 right-0 h-[1px] bg-black"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              ))}
              <button
                onClick={toggleLanguage}
                className="text-[0.82rem] tracking-widest uppercase text-black/50 hover:text-black transition-colors cursor-pointer bg-transparent border-none"
                style={{ fontWeight: 400, letterSpacing: "0.12em" }}
                aria-label={lang === "de" ? "Switch to English" : "Zu Deutsch wechseln"}
              >
                {t.nav.language}
              </button>
              <button
                onClick={() => openContact(getInquiryScope())}
                className="text-[0.78rem] tracking-[0.12em] uppercase bg-black text-white px-5 py-2 cursor-pointer border border-black hover:bg-transparent hover:text-black transition-all duration-300"
                style={{ fontWeight: 400 }}
              >
                {lang === "de" ? "Anfrage" : "Inquire"}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden bg-transparent border-none cursor-pointer p-2 text-black"
              aria-label={menuOpen ? "Menü schließen" : "Menü öffnen"}
            >
              <AnimatePresence mode="wait">
                {menuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X size={24} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu size={24} />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="lg:hidden bg-white border-t border-black/5 overflow-hidden"
            >
              <div className="px-4 py-6 flex flex-col gap-1">
                {navItems.map((item, i) => (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                  >
                    <Link
                      to={item.path}
                      onClick={() => setMenuOpen(false)}
                      className={`block text-[0.9rem] tracking-widest uppercase no-underline py-3 border-b border-black/5 ${
                        location.pathname === item.path
                          ? "text-black"
                          : "text-black/50"
                      }`}
                      style={{ fontWeight: 400, letterSpacing: "0.12em" }}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: navItems.length * 0.05, duration: 0.3 }}
                >
                  <button
                    onClick={() => {
                      toggleLanguage();
                      setMenuOpen(false);
                    }}
                    className="text-[0.9rem] tracking-widest uppercase text-black/50 bg-transparent border-none cursor-pointer py-3 text-left w-full"
                    style={{ fontWeight: 400, letterSpacing: "0.12em" }}
                  >
                    {lang === "de" ? "English" : "Deutsch"}
                  </button>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (navItems.length + 1) * 0.05, duration: 0.3 }}
                  className="mt-3"
                >
                  <button
                    onClick={() => {
                      openContact(getInquiryScope());
                      setMenuOpen(false);
                    }}
                    className="w-full text-[0.9rem] tracking-[0.12em] uppercase bg-black text-white py-3.5 cursor-pointer border border-black text-center"
                    style={{ fontWeight: 400 }}
                  >
                    {lang === "de" ? "Anfrage" : "Inquire"}
                  </button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main Content */}
      <main className="flex-1 pt-16 md:pt-20">
        <ScrollToTop />
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Brand */}
            <div>
              <div className="mb-4">
                <img
                  src={LOGO_URL}
                  alt="Mario Schubert Photography - Fotograf in Innsbruck, Tirol und Bayern"
                  className="h-10 w-auto invert brightness-200"
                />
              </div>
              <p className="text-white/50 text-[0.85rem]" style={{ lineHeight: 1.7 }}>
                {t.footer.tagline}
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <div className="flex flex-col gap-3">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="text-white/50 hover:text-white text-[0.85rem] no-underline transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div className="flex flex-col gap-3">
              <a
                href="mailto:servus@marioschub.com"
                className="text-white/50 hover:text-white text-[0.85rem] no-underline transition-colors flex items-center gap-2"
                aria-label="E-Mail an Mario Schubert senden"
              >
                <Mail size={14} /> servus@marioschub.com
              </a>
              <a
                href="https://instagram.com/marioschubert"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/50 hover:text-white text-[0.85rem] no-underline transition-colors flex items-center gap-2"
                aria-label="Mario Schubert auf Instagram folgen"
              >
                <Instagram size={14} /> @marioschubert
              </a>
              <span className="text-white/50 text-[0.85rem] flex items-center gap-2">
                <MapPin size={14} /> Innsbruck, Tirol
              </span>
            </div>
          </div>

          <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/30 text-[0.75rem]">
              &copy; {new Date().getFullYear()} Mario Schubert Photography. {t.footer.rights}
            </p>
            <div className="flex gap-6">
              <Link to="/datenschutz" className="text-white/30 hover:text-white/60 text-[0.75rem] no-underline transition-colors">
                {t.footer.privacy}
              </Link>
              <Link to="/impressum" className="text-white/30 hover:text-white/60 text-[0.75rem] no-underline transition-colors">
                {t.footer.imprint}
              </Link>
              <a
                href="https://ik.imagekit.io/r2yqrg6np/Allgemeine%20Gescha%CC%88ftsbedingungen%20_%20Stand%20Januar%202026.pdf?updatedAt=1773009281173"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/30 hover:text-white/60 text-[0.75rem] no-underline transition-colors"
              >
                {lang === "de" ? "AGB" : "Terms"}
              </a>
              <Link to="/admin" className="text-white/[0.12] hover:text-white/30 text-[0.75rem] no-underline transition-colors">
                Admin
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Cookie Banner */}
      <CookieBanner />
      {/* Floating WhatsApp */}
      <FloatingWhatsApp />
    </div>
  );
}