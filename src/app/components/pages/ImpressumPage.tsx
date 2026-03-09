import { useLanguage } from "../LanguageContext";
import { SEO } from "../SEO";
import { SectionReveal } from "../SectionReveal";
import { motion } from "motion/react";

export function ImpressumPage() {
  const { lang } = useLanguage();

  return (
    <>
      <SEO
        title={lang === "de" ? "Impressum | Mario Schubert Photography" : "Imprint | Mario Schubert Photography"}
        description={lang === "de"
          ? "Impressum von Mario Schubert Fotografie, Innsbruck, Tirol. Angaben gemäß §5 TMG."
          : "Legal notice of Mario Schubert Photography, Innsbruck, Tyrol."}
        canonical="/impressum"
        lang={lang}
        keywords="Impressum Mario Schubert, Fotograf Innsbruck Kontakt, Imprint"
      />

      {/* Hero */}
      <section className="py-24 md:py-32 bg-[#f8f7f5]">
        <div className="max-w-3xl mx-auto text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <p
              className="text-[0.75rem] tracking-[0.3em] uppercase text-black/40 mb-4"
              style={{ fontWeight: 400 }}
            >
              {lang === "de" ? "RECHTLICHES" : "LEGAL"}
            </p>
            <h1
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(2.5rem, 6vw, 4rem)",
                fontWeight: 300,
                lineHeight: 1.1,
              }}
            >
              {lang === "de" ? "Impressum" : "Imprint"}
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <SectionReveal>
            <div className="space-y-8">
              <div>
                <h2
                  className="mb-4"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "1.6rem",
                    fontWeight: 600,
                  }}
                >
                  {lang === "de" ? "Angaben gemäß §5 TMG" : "Information according to §5 TMG"}
                </h2>
                <div className="space-y-1">
                  <p className="text-black/70 text-[0.9rem]" style={{ fontWeight: 400 }}>
                    Mario Schubert Fotografie
                  </p>
                  <p className="text-black/60 text-[0.9rem]" style={{ lineHeight: 1.7, fontWeight: 300 }}>
                    Bäckerbühelgasse 14<br />
                    6020 Innsbruck<br />
                    Austria
                  </p>
                </div>
              </div>

              <div>
                <h3
                  className="mb-3"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "1.3rem",
                    fontWeight: 600,
                  }}
                >
                  {lang === "de" ? "Kontakt" : "Contact"}
                </h3>
                <div className="space-y-1">
                  <p className="text-black/60 text-[0.9rem]" style={{ lineHeight: 1.7, fontWeight: 300 }}>
                    Tel: <a href="tel:+4915155338029" className="text-black/70 no-underline hover:text-black transition-colors">+49 151 55338029</a>
                  </p>
                  <p className="text-black/60 text-[0.9rem]" style={{ lineHeight: 1.7, fontWeight: 300 }}>
                    Mail: <a href="mailto:servus@marioschub.com" className="text-black/70 no-underline hover:text-black transition-colors">servus@marioschub.com</a>
                  </p>
                </div>
              </div>

              <div className="pt-8 border-t border-black/10">
                <p className="text-black/40 text-[0.8rem]" style={{ lineHeight: 1.7, fontWeight: 300 }}>
                  {lang === "de"
                    ? "Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV: Mario Schubert, Bäckerbühelgasse 14, 6020 Innsbruck, Austria."
                    : "Responsible for content according to § 55 Abs. 2 RStV: Mario Schubert, Bäckerbühelgasse 14, 6020 Innsbruck, Austria."}
                </p>
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>
    </>
  );
}