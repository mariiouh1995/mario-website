import { useState, useEffect, useCallback } from "react";
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

/** Global camera shutter flash on CTA button clicks */
function useCameraFlashGlobal() {
  const handleClick = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const btn = target.closest("button, a") as HTMLElement | null;
    if (!btn) return;

    const cl = btn.className || "";
    // Only trigger on styled CTA buttons with padding (px-* py-*)
    const isCTA =
      (cl.includes("px-") && cl.includes("py-")) ||
      (cl.includes("px-") && cl.includes("bg-black"));
    // Skip non-CTA elements
    if (!isCTA) return;
    // Skip inside modals, lightbox, gallery filters
    if (
      btn.closest("[data-slot=dialog]") ||
      btn.closest(".lightbox-overlay") ||
      cl.includes("border-none") && !cl.includes("bg-black")
    ) return;

    const rect = btn.getBoundingClientRect();
    // Camera emoji
    const emoji = document.createElement("span");
    emoji.textContent = "\u{1F4F8}";
    emoji.style.cssText = `
      position:fixed;left:${rect.left + rect.width / 2}px;top:${rect.top - 4}px;
      transform:translate(-50%,-100%) scale(0.5) rotate(-15deg);
      font-size:1.5rem;pointer-events:none;z-index:99999;opacity:0;
      animation:camera-flash 550ms ease-out forwards;
    `;
    document.body.appendChild(emoji);
    // White flash overlay
    const flash = document.createElement("div");
    flash.style.cssText = `
      position:fixed;left:${rect.left}px;top:${rect.top}px;
      width:${rect.width}px;height:${rect.height}px;
      background:white;border-radius:12px;pointer-events:none;z-index:99998;opacity:0;
      animation:flash-overlay 350ms ease-out forwards;
    `;
    document.body.appendChild(flash);
    setTimeout(() => { emoji.remove(); flash.remove(); }, 700);
  }, []);

  useEffect(() => {
    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [handleClick]);
}

export function Layout() {
  const { t, lang, toggleLanguage } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const { openContact } = useContactModal();

  // Camera flash animation on CTA clicks
  useCameraFlashGlobal();

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
                      : "text-black/60 hover:text-black"
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
                className="text-[0.82rem] tracking-widest uppercase text-black/60 hover:text-black transition-colors cursor-pointer bg-transparent border-none"
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
              aria-label={menuOpen ? "Menu schliessen" : "Menu oeffnen"}
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
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="lg:hidden overflow-hidden bg-white border-t border-black/5"
            >
              <div className="px-4 py-6 flex flex-col">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMenuOpen(false)}
                    className={`text-[0.9rem] tracking-widest uppercase no-underline py-3 transition-colors ${
                      location.pathname === item.path
                        ? "text-black"
                        : "text-black/60"
                    }`}
                    style={{ fontWeight: 400, letterSpacing: "0.12em" }}
                  >
                    {item.label}
                  </Link>
                ))}
                <button
                  onClick={() => {
                    toggleLanguage();
                    setMenuOpen(false);
                  }}
                  className="text-[0.9rem] tracking-widest uppercase text-black/60 bg-transparent border-none cursor-pointer py-3 text-left w-full"
                  style={{ fontWeight: 400, letterSpacing: "0.12em" }}
                >
                  {t.nav.language}
                </button>
                <button
                  onClick={() => {
                    openContact(getInquiryScope());
                    setMenuOpen(false);
                  }}
                  className="mt-4 text-[0.82rem] tracking-[0.12em] uppercase bg-black text-white px-6 py-3 cursor-pointer border border-black hover:bg-transparent hover:text-black transition-all duration-300 w-full text-center"
                  style={{ fontWeight: 400 }}
                >
                  {lang === "de" ? "Anfrage" : "Inquire"}
                </button>
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
      <footer className="bg-black text-white py-16 md:py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            {/* Brand */}
            <div>
              <img
                src={LOGO_URL}
                alt="Mario Schubert Photography"
                className="h-8 w-auto mb-6 invert brightness-200"
              />
              <p
                className="text-white/40 text-[0.82rem] max-w-xs"
                style={{ lineHeight: 1.7, fontWeight: 300 }}
              >
                {lang === "de"
                  ? "Zeitlose Fotografie & Videografie in Innsbruck, Tirol und Bayern."
                  : "Timeless photography & videography in Innsbruck, Tyrol and Bavaria."}
              </p>
            </div>

            {/* Navigation */}
            <div>
              <p
                className="text-white/30 text-[0.7rem] tracking-[0.3em] uppercase mb-6"
                style={{ fontWeight: 400 }}
              >
                {lang === "de" ? "Navigation" : "Navigation"}
              </p>
              <div className="flex flex-col gap-3">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="text-white/50 text-[0.85rem] no-underline hover:text-white transition-colors"
                    style={{ fontWeight: 300 }}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div>
              <p
                className="text-white/30 text-[0.7rem] tracking-[0.3em] uppercase mb-6"
                style={{ fontWeight: 400 }}
              >
                {lang === "de" ? "Kontakt" : "Contact"}
              </p>
              <div className="flex flex-col gap-3">
                <a
                  href="mailto:servus@marioschub.com"
                  className="text-white/50 text-[0.85rem] no-underline hover:text-white transition-colors flex items-center gap-2"
                  style={{ fontWeight: 300 }}
                >
                  <Mail size={14} />
                  servus@marioschub.com
                </a>
                <a
                  href="https://instagram.com/marioschub"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/50 text-[0.85rem] no-underline hover:text-white transition-colors flex items-center gap-2"
                  style={{ fontWeight: 300 }}
                >
                  <Instagram size={14} />
                  @marioschub
                </a>
                <p
                  className="text-white/50 text-[0.85rem] flex items-center gap-2"
                  style={{ fontWeight: 300 }}
                >
                  <MapPin size={14} />
                  Innsbruck, Tirol
                </p>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-white/25 text-[0.75rem]" style={{ fontWeight: 300 }}>
              &copy; {new Date().getFullYear()} Mario Schubert Photography.{" "}
              {lang === "de" ? "Alle Rechte vorbehalten." : "All rights reserved."}
            </p>
            <div className="flex gap-6">
              <Link
                to="/impressum"
                className="text-white/25 text-[0.75rem] no-underline hover:text-white/50 transition-colors"
                style={{ fontWeight: 300 }}
              >
                {lang === "de" ? "Impressum" : "Imprint"}
              </Link>
              <Link
                to="/datenschutz"
                className="text-white/25 text-[0.75rem] no-underline hover:text-white/50 transition-colors"
                style={{ fontWeight: 300 }}
              >
                {lang === "de" ? "Datenschutz" : "Privacy"}
              </Link>
              <a
                href="https://ik.imagekit.io/r2yqrg6np/Allgemeine%20Gescha%CC%88ftsbedingungen%20_%20Stand%20Januar%202026.pdf?updatedAt=1773009281173"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/25 text-[0.75rem] no-underline hover:text-white/50 transition-colors"
                style={{ fontWeight: 300 }}
              >
                AGB
              </a>
            </div>
          </div>
        </div>
      </footer>

      <FloatingWhatsApp />
      <CookieBanner />
    </div>
  );
}