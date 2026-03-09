import { useRef, useMemo, useState, useCallback } from "react";
import { ArrowRight, Camera, Film, Heart, MessageCircle, Sparkles } from "lucide-react";
import { Link } from "react-router";
import { useLanguage } from "../LanguageContext";
import { SectionReveal } from "../SectionReveal";
import { SEO } from "../SEO";
import { Lightbox, useLightbox } from "../Lightbox";
import { motion, useScroll, useTransform } from "motion/react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { useContactModal } from "../ContactModal";
import { ParallaxHero } from "../ParallaxHero";
import { GoogleReviewSingle } from "../GoogleReviews";
import { useShuffledGallery } from "../useShuffledGallery";
import { useImages } from "../useImages";
import { MasonryGrid } from "../MasonryGrid";

const LOGO_URL = "https://ik.imagekit.io/r2yqrg6np/68e54b92f722d45170d60f24_Logo%20MS.svg";

const IMAGES = {
  hero: "https://ik.imagekit.io/r2yqrg6np/Wedding/Paarfotos/E00A5635-2.jpg?updatedAt=1773007052923",
  wedding: "https://ik.imagekit.io/r2yqrg6np/Wedding/Paarfotos/250830_LJ_151924_0405(LowRes).jpg?updatedAt=1773007048480",
  animals: "https://ik.imagekit.io/r2yqrg6np/Tiere/20251019_R52_1038_(WebRes).jpg?updatedAt=1773000802084",
  portrait: "https://ik.imagekit.io/r2yqrg6np/Other/R52_0832.jpg?updatedAt=1773014105220",
  about: "https://ik.imagekit.io/r2yqrg6np/68e54c497a9dde9d00252dcb_WhatsApp%20Image%202025-09-16%20at%2022.32.17.avif",
};

export function HomePage() {
  const { t, lang } = useLanguage();
  const { open, index, openLightbox, closeLightbox } = useLightbox();
  const { openContact } = useContactModal();
  const { getImagesForPage } = useImages();

  const GALLERY_PAGE_SIZE = 12;
  const [visibleCount, setVisibleCount] = useState(GALLERY_PAGE_SIZE);

  const seo = lang === "de"
    ? {
        title: "Mario Schubert Photography | Hochzeitsfotograf Innsbruck, Tirol & Bayern",
        description: "Zeitlose Hochzeitsfotografie & Videografie in Innsbruck, Tirol und Bayern. Tierfotografie, Portraits, Couple Shootings. Natuerlich, cineastisch, authentisch.",
        keywords: "Hochzeitsfotograf Innsbruck, Fotograf Tirol, Fotograf Bayern, Hochzeitsfotografie Muenchen, Tierfotografie Innsbruck, Couple Shooting Tirol",
      }
    : {
        title: "Mario Schubert Photography | Wedding Photographer Innsbruck, Tyrol & Bavaria",
        description: "Timeless wedding photography & videography in Innsbruck, Tyrol and Bavaria. Animal photography, portraits, couple shootings. Natural, cinematic, authentic.",
        keywords: "wedding photographer Innsbruck, photographer Tyrol, photographer Bavaria, wedding photography Munich, animal photography Innsbruck, couple shooting Tyrol",
      };

  const services = [
    {
      icon: Heart,
      title: t.home.weddingTitle,
      desc: t.home.weddingDesc,
      image: IMAGES.wedding,
      link: "/hochzeiten",
    },
    {
      icon: Camera,
      title: t.home.animalsTitle,
      desc: t.home.animalsDesc,
      image: IMAGES.animals,
      link: "/tierfotografie",
    },
    {
      icon: Film,
      title: t.home.portraitTitle,
      desc: t.home.portraitDesc,
      image: IMAGES.portrait,
      link: "/portrait",
    },
  ];

  // Home gallery: mix from all pages (hochzeit, tiere, portrait) with load more
  const allGalleryImages = useMemo(() => {
    const wedding = getImagesForPage("hochzeit", undefined, lang);
    const animals = getImagesForPage("tiere", undefined, lang);
    const portrait = getImagesForPage("portrait", undefined, lang);
    // Interleave: take from each category in round-robin
    const sources = [wedding, animals, portrait];
    const mixed: typeof wedding = [];
    const maxLen = Math.max(...sources.map(s => s.length));
    for (let i = 0; i < maxLen; i++) {
      for (const source of sources) {
        if (i < source.length) mixed.push(source[i]);
      }
    }
    return mixed;
  }, [getImagesForPage, lang]);

  const shuffledGallery = useShuffledGallery(allGalleryImages);
  const visibleGallery = useMemo(() => shuffledGallery.slice(0, visibleCount), [shuffledGallery, visibleCount]);
  const hasMoreGallery = visibleCount < shuffledGallery.length;

  const handleLoadMore = useCallback(() => {
    setVisibleCount(prev => prev + GALLERY_PAGE_SIZE);
  }, []);

  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroImageY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const heroTextY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <>
      <SEO
        title={seo.title}
        description={seo.description}
        canonical="/"
        keywords={seo.keywords}
        lang={lang}
        ogImage={IMAGES.hero}
      />

      {/* Hero Section */}
      <section ref={heroRef} className="relative h-screen min-h-[600px] overflow-hidden">
        <motion.div className="absolute inset-0" style={{ y: heroImageY }}>
          <ImageWithFallback
            src={IMAGES.hero}
            alt="Romantisches Brautpaar-Shooting in den Alpen – Hochzeitsfotograf Mario Schubert, Innsbruck Tirol"
            className="w-full h-[120%] object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
        </motion.div>

        <motion.div
          className="relative h-full flex flex-col items-center justify-center text-center px-4"
          style={{ y: heroTextY, opacity: heroOpacity }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center"
          >
            <p
              className="text-white/70 text-[0.75rem] tracking-[0.3em] uppercase mb-8"
              style={{ fontWeight: 400 }}
            >
              {t.home.heroSubtitle}
            </p>
            <img
              src={LOGO_URL}
              alt="Mario Schubert Photography – Hochzeitsfotograf und Videograf in Innsbruck, Tirol"
              className="h-16 md:h-24 w-auto mb-8 invert brightness-200"
            />
            <p
              className="text-white/60 text-[1rem] md:text-[1.15rem] mb-10"
              style={{ fontWeight: 300, letterSpacing: "0.05em" }}
            >
              {t.home.heroTagline}
            </p>
            <button
              onClick={() => openContact("general")}
              className="inline-flex items-center gap-2 text-white border border-white/40 px-8 py-3 text-[0.8rem] tracking-[0.15em] uppercase bg-transparent cursor-pointer hover:bg-white hover:text-black transition-all duration-300"
              style={{ fontWeight: 400 }}
            >
              {lang === "de" ? "Jetzt anfragen" : "Inquire now"}
              <ArrowRight size={16} />
            </button>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ opacity: heroOpacity }}
        >
          <div className="w-[1px] h-12 bg-white/30" />
        </motion.div>
      </section>

      {/* Services Section */}
      <section className="py-24 md:py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <SectionReveal>
            <p
              className="text-[0.75rem] tracking-[0.3em] uppercase text-black/40 text-center mb-4"
              style={{ fontWeight: 400 }}
            >
              {t.home.servicesTitle}
            </p>
          </SectionReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 mt-16">
            {services.map((service, i) => (
              <SectionReveal key={service.link} delay={i * 0.15}>
                <Link to={service.link} className="group block no-underline">
                  <div className="relative overflow-hidden aspect-[3/4] mb-6">
                    <motion.div
                      className="w-full h-full"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <ImageWithFallback
                        src={service.image}
                        alt={
                          service.link === "/hochzeiten"
                            ? "Elegante Hochzeitszeremonie – Hochzeitsfotografie Innsbruck, Tirol von Mario Schubert"
                            : service.link === "/tierfotografie"
                            ? "Professionelles Hundeportrait – Tierfotografie Innsbruck, Tirol von Mario Schubert"
                            : "Romantisches Couple Shooting – Portrait und Paarfotografie in Tirol von Mario Schubert"
                        }
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-500" />
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <service.icon size={18} className="text-black/55" />
                    <h3
                      className="text-[1.1rem] text-black"
                      style={{
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: 600,
                        fontSize: "1.4rem",
                      }}
                    >
                      {service.title}
                    </h3>
                  </div>
                  <p
                    className="text-black/65 text-[0.85rem] mb-4"
                    style={{ lineHeight: 1.7, fontWeight: 300 }}
                  >
                    {service.desc}
                  </p>
                  <span
                    className="inline-flex items-center gap-2 text-[0.78rem] tracking-[0.15em] uppercase text-black/75 group-hover:text-black transition-colors"
                    style={{ fontWeight: 400 }}
                  >
                    {t.home.viewMore}
                    <ArrowRight
                      size={14}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </span>
                </Link>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 md:py-24 bg-black text-white px-4">
        <div className="max-w-5xl mx-auto">
          <SectionReveal>
            <p
              className="text-white/40 text-[0.75rem] tracking-[0.3em] uppercase text-center mb-4"
              style={{ fontWeight: 400 }}
            >
              {lang === "de" ? "SO LÄUFT'S AB" : "HOW IT WORKS"}
            </p>
            <h2
              className="text-center mb-16"
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
                fontWeight: 300,
              }}
            >
              {lang === "de" ? "In 3 Schritten zu euren Bildern" : "3 steps to your images"}
            </h2>
          </SectionReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
            {[
              {
                icon: MessageCircle,
                step: "01",
                title: lang === "de" ? "Anfrage & Kennenlernen" : "Inquiry & Getting to know",
                text: lang === "de"
                  ? "Schreibt mir und erzählt mir von euch. In einem unverbindlichen Erstgespräch klären wir alle Fragen."
                  : "Write to me and tell me about yourselves. In a free initial conversation we'll clarify everything.",
              },
              {
                icon: Sparkles,
                step: "02",
                title: lang === "de" ? "Planung & Vorbereitung" : "Planning & Preparation",
                text: lang === "de"
                  ? "Gemeinsam planen wir euer Shooting – von der Location über den Zeitplan bis zur Stimmung."
                  : "Together we plan your shoot – from location to schedule to mood.",
              },
              {
                icon: Camera,
                step: "03",
                title: lang === "de" ? "Shooting & Ergebnis" : "Shoot & Results",
                text: lang === "de"
                  ? "Am Tag selbst seid ihr entspannt, ich fange alles ein. Innerhalb weniger Wochen erhaltet ihr eure Galerie."
                  : "On the day you relax, I capture everything. Within a few weeks you'll receive your gallery.",
              },
            ].map((item, i) => (
              <SectionReveal key={item.step} delay={i * 0.12}>
                <div className="text-center">
                  <div className="w-14 h-14 mx-auto mb-5 border border-white/15 flex items-center justify-center">
                    <item.icon size={22} className="text-white/65" />
                  </div>
                  <p className="text-white/55 text-[0.7rem] tracking-[0.3em] mb-2" style={{ fontWeight: 400 }}>
                    {item.step}
                  </p>
                  <h3
                    className="text-white mb-3"
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontSize: "1.3rem",
                      fontWeight: 600,
                    }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-white/55 text-[0.83rem]" style={{ lineHeight: 1.7, fontWeight: 300 }}>
                    {item.text}
                  </p>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-24 md:py-32 bg-[#f8f7f5]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <SectionReveal direction="left">
              <div className="relative">
                <ImageWithFallback
                  src={IMAGES.about}
                  alt="Fotograf Mario Schubert mit Kamera – Hochzeitsfotograf und Videograf aus Innsbruck, Tirol"
                  className="w-full aspect-[4/5] object-cover"
                />
                <motion.div
                  className="absolute -bottom-4 -right-4 w-24 h-24 border border-black/10"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                />
              </div>
            </SectionReveal>

            <SectionReveal delay={0.2} direction="right">
              <p
                className="text-[0.75rem] tracking-[0.3em] uppercase text-black/55 mb-4"
                style={{ fontWeight: 400 }}
              >
                {t.home.aboutPreTitle}
              </p>
              <h2
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: "clamp(2rem, 4vw, 3.2rem)",
                  fontWeight: 300,
                  lineHeight: 1.1,
                  marginBottom: "1.5rem",
                }}
              >
                {t.home.aboutTitle.split("Mario")[0]}
                <span style={{ fontWeight: 700 }}>Mario</span>
              </h2>
              <p
                className="text-black/75 text-[0.9rem] mb-6"
                style={{ lineHeight: 1.8, fontWeight: 300 }}
              >
                {t.home.aboutText}
              </p>
              <p
                className="text-black/75 text-[0.9rem] mb-8"
                style={{ lineHeight: 1.8, fontWeight: 300 }}
              >
                {t.home.philosophyText}
              </p>
              <Link
                to="/ueber-mich"
                className="inline-flex items-center gap-2 text-[0.8rem] tracking-[0.15em] uppercase text-black border border-black px-8 py-3 no-underline hover:bg-black hover:text-white transition-all duration-300"
                style={{ fontWeight: 400 }}
              >
                {t.home.aboutCta}
                <ArrowRight size={14} />
              </Link>
            </SectionReveal>
          </div>
        </div>
      </section>

      {/* Gallery / Get Inspired */}
      <section className="py-24 md:py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <SectionReveal>
            <h2
              className="text-center mb-16"
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontSize: "clamp(2rem, 4vw, 3rem)",
                fontWeight: 300,
                letterSpacing: "0.1em",
              }}
            >
              {t.home.inspiredTitle}
            </h2>
          </SectionReveal>

          <MasonryGrid
            images={visibleGallery}
            openLightbox={openLightbox}
            initialPageSize={visibleCount}
          />

          {hasMoreGallery && (
            <div className="text-center mt-8">
              <button
                onClick={handleLoadMore}
                className="inline-flex items-center gap-2 text-[0.8rem] tracking-[0.15em] uppercase text-black border border-black px-8 py-3 no-underline hover:bg-black hover:text-white transition-all duration-300 bg-transparent cursor-pointer"
                style={{ fontWeight: 400 }}
              >
                {lang === "de" ? "Mehr anzeigen" : "Load more"}
                <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>
      </section>

      <Lightbox
        images={shuffledGallery}
        initialIndex={index}
        open={open}
        onClose={closeLightbox}
      />

      {/* Testimonial Strip */}
      <GoogleReviewSingle bg="white" reviewIndex={0} />

      {/* Wyldworks – Corporate CTA */}
      <section className="py-14 md:py-16 bg-[#f8f7f5] px-4">
        <div className="max-w-4xl mx-auto">
          <SectionReveal>
            <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
              <div className="flex-shrink-0 w-12 h-12 border border-black/10 flex items-center justify-center">
                <img
                  src="https://ik.imagekit.io/r2yqrg6np/6851b6da73c459c55e3e5dd9_WYLDWORKS..svg"
                  alt="WYLDWORKS Logo"
                  className="w-8 h-8 object-contain"
                />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <p
                  className="text-[0.9rem] text-black/70 mb-1"
                  style={{ fontWeight: 400 }}
                >
                  {lang === "de"
                    ? "Foto & Video für Unternehmen?"
                    : "Photo & video for businesses?"}
                </p>
                <p
                  className="text-black/55 text-[0.82rem]"
                  style={{ lineHeight: 1.6, fontWeight: 300 }}
                >
                  {lang === "de"
                    ? "Employer Branding, Imagefilme, Events & Social Media Content – das läuft über meine Agentur."
                    : "Employer branding, image films, events & social media content – that's handled by my agency."}
                </p>
              </div>
              <a
                href="https://www.wyldworks.de/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 inline-flex items-center gap-2 text-[0.78rem] tracking-[0.12em] uppercase text-black/75 no-underline border-b border-black/20 pb-1 hover:text-black hover:border-black transition-colors"
                style={{ fontWeight: 400 }}
              >
                wyldworks.de
                <ArrowRight size={13} />
              </a>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-32 bg-black text-white">
        <div className="max-w-3xl mx-auto text-center px-4">
          <SectionReveal>
            <h2
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontSize: "clamp(2rem, 5vw, 3.5rem)",
                fontWeight: 300,
                lineHeight: 1.1,
                marginBottom: "1.5rem",
              }}
            >
              {t.home.ctaTitle}
            </h2>
            <p
              className="text-white/65 text-[0.9rem] mb-10 max-w-xl mx-auto"
              style={{ lineHeight: 1.8, fontWeight: 300 }}
            >
              {t.home.ctaText}
            </p>
            <button
              onClick={() => openContact("general")}
              className="inline-flex items-center gap-2 text-white border border-white/40 px-8 py-3 text-[0.8rem] tracking-[0.15em] uppercase bg-transparent cursor-pointer hover:bg-white hover:text-black transition-all duration-300"
              style={{ fontWeight: 400 }}
            >
              {t.home.ctaButton}
              <ArrowRight size={14} />
            </button>
          </SectionReveal>
        </div>
      </section>
    </>
  );
}