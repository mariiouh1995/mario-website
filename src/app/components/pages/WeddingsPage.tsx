import { useWeddingPackages } from "../usePackagesFormatted";
import { useImages } from "../useImages";
import { useShuffledGallery } from "../useShuffledGallery";
import { ParallaxHero } from "../ParallaxHero";
import { GoogleReviewsGrid } from "../GoogleReviews";
import { useState, useMemo, useCallback } from "react";
import { ArrowRight, Check, Camera, Heart, Users, Sparkles, Music, Cake, PartyPopper, Star, ChevronDown, Download } from "lucide-react";
import { useLanguage } from "../LanguageContext";
import { SectionReveal } from "../SectionReveal";
import { SEO } from "../SEO";
import { Lightbox, useLightbox } from "../Lightbox";
import { motion, useScroll, useTransform } from "motion/react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { useContactModal } from "../ContactModal";
import { MasonryGrid } from "../MasonryGrid";
import { FAQSection } from "../FAQSection";
import { getFAQsByCategories, PAGE_FAQ_CATEGORIES } from "../faqData";

const IMAGES = {
  hero: "https://images.unsplash.com/photo-1765615197726-6d2a157620fb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwY291cGxlJTIwb3V0ZG9vciUyMHJvbWFudGljfGVufDF8fHx8MTc3Mjk5NTc4OXww&ixlib=rb-4.1.0&q=80&w=1080",
  photo1: "https://images.unsplash.com/photo-1767986012138-4893f40932d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwY2VyZW1vbnklMjBlbGVnYW50fGVufDF8fHx8MTc3Mjk2MzYwN3ww&ixlib=rb-4.1.0&q=80&w=1080",
  photo2: "https://images.unsplash.com/photo-1677691257001-8bfd91e288ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwYnJpZGUlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzI5ODc4OTB8MA&ixlib=rb-4.1.0&q=80&w=1080",
  video: "https://images.unsplash.com/photo-1633978555421-1e67d524b227?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwZGFuY2UlMjBmaXJzdCUyMHJlY2VwdGlvbnxlbnwxfHx8fDE3NzI5OTU3OTR8MA&ixlib=rb-4.1.0&q=80&w=1080",
  details: "https://images.unsplash.com/photo-1768843831654-d54ea7f38c45?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwcmluZ3MlMjBkZXRhaWwlMjBjbG9zZXxlbnwxfHx8fDE3NzI5OTU3OTN8MA&ixlib=rb-4.1.0&q=80&w=1080",
  galleryBride: "https://images.unsplash.com/photo-1632378464836-a6a856632552?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwZ2V0dGluZyUyMHJlYWR5JTIwYnJpZGUlMjBwcmVwYXJhdGlvbnxlbnwxfHx8fDE3NzI5OTc1MzJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
  galleryBouquet: "https://images.unsplash.com/photo-1684244177286-8625c54bce6d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwYm91cXVldCUyMGJyaWRlJTIwZGV0YWlsfGVufDF8fHx8MTc3Mjk5NzUzMnww&ixlib=rb-4.1.0&q=80&w=1080",
  galleryCeremony: "https://images.unsplash.com/photo-1769812344337-ec16a1b7cef8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwY2VyZW1vbnklMjBvdXRkb29yJTIwZWxlZ2FudHxlbnwxfHx8fDE3NzI5OTc1MzF8MA&ixlib=rb-4.1.0&q=80&w=1080",
  galleryDance: "https://images.unsplash.com/photo-1704455308461-1e18a7e11d28?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwY291cGxlJTIwZmlyc3QlMjBkYW5jZSUyMHJlY2VwdGlvbnxlbnwxfHx8fDE3NzI5OTc1MzJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
};

export function WeddingsPage() {
  const { t, lang } = useLanguage();
  const [activeTab, setActiveTab] = useState<"photo" | "video">("photo");
  const { open, index, openLightbox, closeLightbox } = useLightbox();
  const { openContact } = useContactModal();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [galleryCategory, setGalleryCategory] = useState<string>("all");
  const { getImagesForPage } = useImages();

  // Reset visibleCount when category changes
  const GALLERY_PAGE_SIZE = 20;
  const [visibleCount, setVisibleCount] = useState(GALLERY_PAGE_SIZE);

  const galleryCategories = [
    { key: "all", label: { de: "Alle", en: "All" } },
    { key: "paarshooting", label: { de: "Paarshooting", en: "Couple Shoot" } },
    { key: "freie-trauung", label: { de: "Freie Trauung", en: "Outdoor Ceremony" } },
    { key: "kirchliche-trauung", label: { de: "Kirchliche Trauung", en: "Church Ceremony" } },
    { key: "getting-ready", label: { de: "Getting Ready", en: "Getting Ready" } },
    { key: "standesamt", label: { de: "Standesamt", en: "Civil Ceremony" } },
    { key: "party", label: { de: "Party", en: "Party" } },
  ];

  // Get all wedding images from Google Sheets (with fallback)
  const weddingGallery = useMemo(
    () => getImagesForPage("hochzeit", undefined, lang),
    [getImagesForPage, lang]
  );

  // Shuffle gallery on mount for varied display each page load
  const shuffledGallery = useShuffledGallery(weddingGallery);

  // Filter by selected category
  const filteredGallery = useMemo(
    () => galleryCategory === "all" ? shuffledGallery : shuffledGallery.filter((img) => img.category === galleryCategory),
    [shuffledGallery, galleryCategory]
  );

  // Visible slice for Load More
  const visibleGallery = useMemo(
    () => filteredGallery.slice(0, visibleCount),
    [filteredGallery, visibleCount]
  );

  const hasMore = visibleCount < filteredGallery.length;

  // Reset visible count when filter changes
  const handleCategoryChange = useCallback((key: string) => {
    setGalleryCategory(key);
    setVisibleCount(GALLERY_PAGE_SIZE);
  }, []);

  const seo = lang === "de"
    ? {
        title: "Hochzeitsfotograf Innsbruck & Tirol | Mario Schubert Photography",
        description: "Hochzeitsfotografie & Videografie in Innsbruck, Tirol und Bayern. Zeitlose, authentische Hochzeitsreportagen. Natuerlich, cineastisch, emotional. Jetzt anfragen!",
        keywords: "Hochzeitsfotograf Innsbruck, Hochzeitsfotografie Tirol, Hochzeitsvideograf Bayern, Hochzeitsfotograf Muenchen, Wedding Photographer Austria, Hochzeitsreportage Alpen",
      }
    : {
        title: "Wedding Photographer Innsbruck & Tyrol | Mario Schubert Photography",
        description: "Wedding photography & videography in Innsbruck, Tyrol and Bavaria. Timeless, authentic wedding reportages. Natural, cinematic, emotional. Inquire now!",
        keywords: "wedding photographer Innsbruck, wedding photography Tyrol, wedding videographer Bavaria, wedding photographer Munich, destination wedding Alps",
      };

  const { photoPackages: weddingPhotoPackages, videoPackages: weddingVideoPackages, addOns, shotListItems } = useWeddingPackages(lang);

  const handleLoadMore = useCallback(() => {
    setVisibleCount((prev) => prev + GALLERY_PAGE_SIZE);
  }, []);

  return (
    <>
      <SEO
        title={seo.title}
        description={seo.description}
        canonical="/hochzeiten"
        keywords={seo.keywords}
        lang={lang}
        ogImage={IMAGES.hero}
      />

      {/* Hero */}
      <ParallaxHero
        imageSrc={IMAGES.hero}
        imageAlt="Hochzeitspaar bei romantischem Outdoor-Shooting in den Tiroler Alpen – Hochzeitsfotograf Mario Schubert Innsbruck"
        preTitle={t.weddings.heroTitle}
        title={t.weddings.heroSubtitle}
      />

      {/* Wedding Photography */}
      <section className="py-24 md:py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <SectionReveal>
              <div>
                <p
                  className="text-[0.75rem] tracking-[0.3em] uppercase text-black/40 mb-4"
                  style={{ fontWeight: 400 }}
                >
                  {t.weddings.photoTitle}
                </p>
                <h2
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: "clamp(2rem, 4vw, 3.5rem)",
                    fontWeight: 700,
                    lineHeight: 1.05,
                    marginBottom: "1.5rem",
                  }}
                >
                  {t.weddings.photoHeading}
                </h2>
                <p
                  className="text-black/55 text-[0.9rem] mb-8"
                  style={{ lineHeight: 1.8, fontWeight: 300 }}
                >
                  {t.weddings.photoText}
                </p>
                <a
                  href="#packages"
                  className="inline-flex items-center gap-2 text-black border border-black px-8 py-3 text-[0.8rem] tracking-[0.15em] uppercase no-underline hover:bg-black hover:text-white transition-all duration-300"
                  style={{ fontWeight: 400 }}
                >
                  {t.weddings.photoPackages}
                </a>
              </div>
            </SectionReveal>
            <SectionReveal delay={0.2}>
              <div className="grid grid-cols-2 gap-3">
                <ImageWithFallback
                  src={IMAGES.photo1}
                  alt="Elegante Hochzeitszeremonie in Tirol – zeitlose Hochzeitsfotografie von Mario Schubert Innsbruck"
                  className="w-full aspect-[3/4] object-cover"
                />
                <ImageWithFallback
                  src={IMAGES.photo2}
                  alt="Emotionales Brautportrait – authentische Hochzeitsfotografie in den Alpen"
                  className="w-full aspect-[3/4] object-cover mt-12"
                />
              </div>
            </SectionReveal>
          </div>
        </div>
      </section>

      {/* Wedding Videography */}
      <section className="py-24 md:py-32 bg-[#f8f7f5] px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <SectionReveal>
              <div className="order-2 lg:order-1 grid grid-cols-2 gap-3">
                <ImageWithFallback
                  src={IMAGES.video}
                  alt="Erster Tanz bei Hochzeitsfeier – Hochzeitsvideografie Bayern und Tirol"
                  className="w-full aspect-[3/4] object-cover mt-12"
                />
                <ImageWithFallback
                  src={IMAGES.details}
                  alt="Eheringe Detailaufnahme – Hochzeitsfotograf Innsbruck Detailfotografie"
                  className="w-full aspect-[3/4] object-cover"
                />
              </div>
            </SectionReveal>
            <SectionReveal delay={0.2}>
              <div className="order-1 lg:order-2">
                <p
                  className="text-[0.75rem] tracking-[0.3em] uppercase text-black/40 mb-4"
                  style={{ fontWeight: 400 }}
                >
                  {t.weddings.videoTitle}
                </p>
                <h2
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: "clamp(2rem, 4vw, 3.5rem)",
                    fontWeight: 700,
                    lineHeight: 1.05,
                    marginBottom: "1.5rem",
                  }}
                >
                  {t.weddings.videoHeading}
                </h2>
                <p
                  className="text-black/55 text-[0.9rem] mb-8"
                  style={{ lineHeight: 1.8, fontWeight: 300 }}
                >
                  {t.weddings.videoText}
                </p>
                <a
                  href="#packages"
                  className="inline-flex items-center gap-2 text-black border border-black px-8 py-3 text-[0.8rem] tracking-[0.15em] uppercase no-underline hover:bg-black hover:text-white transition-all duration-300"
                  style={{ fontWeight: 400 }}
                >
                  {t.weddings.videoPackages}
                </a>
              </div>
            </SectionReveal>
          </div>
        </div>
      </section>

      {/* Shot List / Aufnahmeliste */}
      <section className="py-24 md:py-32 px-4">
        <div className="max-w-5xl mx-auto">
          <SectionReveal>
            <div className="text-center mb-16">
              <p
                className="text-[0.75rem] tracking-[0.3em] uppercase text-black/40 mb-4"
                style={{ fontWeight: 400 }}
              >
                {t.weddings.shotListTitle}
              </p>
              <h2
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: "clamp(2rem, 4vw, 3rem)",
                  fontWeight: 300,
                }}
              >
                {t.weddings.shotListSubtitle}
              </h2>
            </div>
          </SectionReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {shotListItems.map((item, i) => (
              <SectionReveal key={item.title} delay={i * 0.08}>
                <div className="flex gap-4">
                  <div className="w-10 h-10 shrink-0 border border-black/10 flex items-center justify-center mt-1">
                    <item.icon size={18} className="text-black/35" />
                  </div>
                  <div>
                    <h3
                      className="mb-1"
                      style={{
                        fontFamily: "'Montserrat', sans-serif",
                        fontSize: "1.2rem",
                        fontWeight: 600,
                      }}
                    >
                      {item.title}
                    </h3>
                    <p
                      className="text-black/50 text-[0.82rem]"
                      style={{ lineHeight: 1.6, fontWeight: 300 }}
                    >
                      {item.text}
                    </p>
                  </div>
                </div>
              </SectionReveal>
            ))}
          </div>

          <SectionReveal delay={0.5}>
            <p
              className="text-center text-black/40 text-[0.82rem] mt-12 max-w-xl mx-auto"
              style={{ lineHeight: 1.7, fontWeight: 300, fontStyle: "italic" }}
            >
              {lang === "de"
                ? "Nat\u00FCrlich ist jede Hochzeit anders \u2013 wir stimmen den Ablauf vorher gemeinsam ab, damit ich genau die Momente einfange, die euch wichtig sind."
                : "Of course every wedding is different \u2013 we coordinate the schedule together beforehand so I capture exactly the moments that matter to you."}
            </p>
          </SectionReveal>
        </div>
      </section>

      {/* Packages */}
      <section id="packages" className="py-24 md:py-32 bg-[#f8f7f5] px-4">
        <div className="max-w-7xl mx-auto">
          <SectionReveal>
            <h2
              className="text-center mb-12"
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontSize: "clamp(2rem, 4vw, 3rem)",
                fontWeight: 300,
              }}
            >
              {t.weddings.packagesTitle}
            </h2>

            {/* Tabs */}
            <div className="flex justify-center gap-4 mb-8">
              <button
                onClick={() => setActiveTab("photo")}
                className={`px-6 py-3 text-[0.8rem] tracking-[0.1em] uppercase transition-all duration-300 cursor-pointer ${
                  activeTab === "photo"
                    ? "bg-black text-white border border-black"
                    : "bg-transparent text-black border border-black/20 hover:border-black"
                }`}
                style={{ fontWeight: 400 }}
              >
                {t.weddings.photoPackages}
              </button>
              <button
                onClick={() => setActiveTab("video")}
                className={`px-6 py-3 text-[0.8rem] tracking-[0.1em] uppercase transition-all duration-300 cursor-pointer ${
                  activeTab === "video"
                    ? "bg-black text-white border border-black"
                    : "bg-transparent text-black border border-black/20 hover:border-black"
                }`}
                style={{ fontWeight: 400 }}
              >
                {t.weddings.videoPackages}
              </button>
            </div>

            <p
              className="text-center text-black/40 text-[0.8rem] mb-12"
              style={{ fontWeight: 300 }}
            >
              {activeTab === "photo"
                ? t.weddings.travelNote
                : t.weddings.travelNoteVideo}
            </p>
          </SectionReveal>

          {/* Package Cards */}
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 ${
              activeTab === "photo" ? "lg:grid-cols-4" : "lg:grid-cols-3"
            } gap-6`}
          >
            {(activeTab === "photo" ? weddingPhotoPackages : weddingVideoPackages).map(
              (pkg, i) => (
                <SectionReveal key={pkg.name} delay={i * 0.1}>
                  <div
                    className={`bg-white p-6 md:p-8 border transition-shadow hover:shadow-lg h-full flex flex-col ${
                      (pkg as any).highlight
                        ? "border-black"
                        : "border-black/10"
                    }`}
                  >
                    <p
                      className="text-[0.7rem] tracking-[0.2em] uppercase text-black/40 mb-3"
                      style={{ fontWeight: 400 }}
                    >
                      {pkg.name}
                    </p>
                    <p
                      className="mb-2"
                      style={{
                        fontFamily: "'Montserrat', sans-serif",
                        fontSize: "2rem",
                        fontWeight: 600,
                        lineHeight: 1.1,
                      }}
                    >
                      {pkg.price}
                    </p>
                    <p
                      className="text-black/50 text-[0.8rem] mb-6"
                      style={{ fontWeight: 300, fontStyle: "italic" }}
                    >
                      {pkg.subtitle}
                    </p>
                    <div className="flex flex-col gap-3 flex-1">
                      {(lang === "de" ? pkg.features : pkg.featuresEn).map(
                        (feature, fi) => (
                          <div key={fi} className="flex gap-2">
                            <Check
                              size={14}
                              className="text-black/30 mt-1 shrink-0"
                            />
                            <span
                              className="text-black/60 text-[0.8rem]"
                              style={{ lineHeight: 1.5, fontWeight: 300 }}
                            >
                              {feature}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </SectionReveal>
              )
            )}
          </div>

          {/* Add-ons (only for photo) */}
          {activeTab === "photo" && (
            <SectionReveal>
              <div className="mt-12 bg-white border border-black/10 p-8 md:p-12 max-w-2xl mx-auto">
                <p
                  className="text-[0.7rem] tracking-[0.2em] uppercase text-black/40 mb-3 text-center"
                  style={{ fontWeight: 400 }}
                >
                  {t.weddings.addOnsTitle}
                </p>
                <h3
                  className="text-center mb-8"
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: "1.8rem",
                    fontWeight: 400,
                  }}
                >
                  {t.weddings.addOnsHeading}
                </h3>
                <div className="flex flex-col gap-3">
                  {addOns.map((addon, i) => (
                    <div key={i} className="flex gap-2">
                      <Check
                        size={14}
                        className="text-black/30 mt-1 shrink-0"
                      />
                      <span
                        className="text-black/60 text-[0.85rem]"
                        style={{ lineHeight: 1.5, fontWeight: 300 }}
                      >
                        {addon}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </SectionReveal>
          )}

          {/* Book CTA */}
          <SectionReveal>
            <div className="text-center mt-12">
              <button
                onClick={() => openContact("wedding")}
                className="inline-flex items-center gap-2 text-black border border-black px-10 py-4 text-[0.8rem] tracking-[0.15em] uppercase bg-transparent cursor-pointer hover:bg-black hover:text-white transition-all duration-300"
                style={{ fontWeight: 400 }}
              >
                {t.weddings.bookNow}
                <ArrowRight size={14} />
              </button>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* Wedding Gallery */}
      <section className="py-24 md:py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <SectionReveal>
            <h2
              className="text-center mb-6"
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontSize: "clamp(2rem, 4vw, 3rem)",
                fontWeight: 300,
                letterSpacing: "0.1em",
              }}
            >
              GET INSPIRED
            </h2>
          </SectionReveal>

          {/* Subtle Category Filter */}
          <SectionReveal>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-14">
              {galleryCategories.map((category) => (
                <button
                  key={category.key}
                  onClick={() => handleCategoryChange(category.key)}
                  className="bg-transparent border-none cursor-pointer px-1 py-2 transition-all duration-300"
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: "0.78rem",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    fontWeight: galleryCategory === category.key ? 500 : 300,
                    color: galleryCategory === category.key ? "black" : "rgba(0,0,0,0.35)",
                    borderBottom: galleryCategory === category.key ? "1px solid black" : "1px solid transparent",
                  }}
                >
                  {lang === "de" ? category.label.de : category.label.en}
                </button>
              ))}
            </div>
          </SectionReveal>

          <MasonryGrid
            images={visibleGallery}
            openLightbox={openLightbox}
          />

          {/* Load More Button */}
          {hasMore && (
            <div className="text-center mt-8">
              <button
                onClick={handleLoadMore}
                className="inline-flex items-center gap-2 text-black border border-black px-8 py-3 text-[0.8rem] tracking-[0.15em] uppercase bg-transparent cursor-pointer hover:bg-black hover:text-white transition-all duration-300"
                style={{ fontWeight: 400 }}
              >
                {t.weddings.loadMore}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Wedding Testimonials */}
      <GoogleReviewsGrid
        count={3}
        title={lang === "de" ? "Das sagen meine Paare" : "What my couples say"}
      />

      {/* Wedding FAQ */}
      <FAQSection
        categories={getFAQsByCategories(PAGE_FAQ_CATEGORIES.weddings)}
        title={{ de: "Häufige Fragen zur Hochzeitsfotografie", en: "Wedding Photography FAQ" }}
      />

      {/* Wedding Guide Download CTA */}
      <section className="py-20 md:py-28 bg-[#f8f7f5] px-4">
        <div className="max-w-3xl mx-auto">
          <SectionReveal>
            <div className="relative border border-black/10 bg-white p-8 sm:p-12 md:p-16 text-center overflow-hidden">
              {/* Decorative corner accents */}
              <div className="absolute top-4 left-4 w-8 h-8 border-t border-l border-black/15" />
              <div className="absolute top-4 right-4 w-8 h-8 border-t border-r border-black/15" />
              <div className="absolute bottom-4 left-4 w-8 h-8 border-b border-l border-black/15" />
              <div className="absolute bottom-4 right-4 w-8 h-8 border-b border-r border-black/15" />

              <p
                className="text-[0.7rem] tracking-[0.35em] uppercase text-black/35 mb-4"
                style={{ fontWeight: 400 }}
              >
                {lang === "de" ? "Kostenloser Download" : "Free Download"}
              </p>
              <h2
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: "clamp(1.6rem, 3.5vw, 2.5rem)",
                  fontWeight: 300,
                  lineHeight: 1.15,
                  marginBottom: "1rem",
                }}
              >
                Wedding Guide
              </h2>
              <p
                className="text-black/35 text-[0.82rem] mb-2"
                style={{ fontWeight: 300, fontStyle: "italic" }}
              >
                {lang === "de" ? "Saison 2026/27" : "Season 2026/27"}
              </p>
              <p
                className="text-black/50 text-[0.88rem] max-w-md mx-auto mb-10"
                style={{ lineHeight: 1.75, fontWeight: 300 }}
              >
                {lang === "de"
                  ? "Alle Infos zu meinen Paketen, meinem Stil und wertvolle Tipps für eure Hochzeitsplanung \u2013 kompakt zusammengefasst."
                  : "All the info about my packages, my style and valuable tips for your wedding planning \u2013 in one compact guide."}
              </p>
              <a
                href="https://ik.imagekit.io/r2yqrg6np/WeddingGuide_MarioSchubert_Saison26_27_compressed.pdf?updatedAt=1773007904883"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-black text-white px-10 py-4 text-[0.8rem] tracking-[0.15em] uppercase no-underline hover:bg-black/80 transition-all duration-300"
                style={{ fontWeight: 400 }}
              >
                <Download size={16} />
                {lang === "de" ? "Guide herunterladen" : "Download Guide"}
              </a>
              <p
                className="text-black/25 text-[0.72rem] mt-6"
                style={{ fontWeight: 300 }}
              >
                PDF · {lang === "de" ? "Kostenlos & unverbindlich" : "Free & no strings attached"}
              </p>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* CTA */}
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
              {t.weddings.ctaTitle}
            </h2>
            <p
              className="text-white/50 text-[0.9rem] mb-10"
              style={{ lineHeight: 1.8, fontWeight: 300 }}
            >
              {t.weddings.ctaText}
            </p>
            <button
              onClick={() => openContact("wedding")}
              className="inline-flex items-center gap-2 text-white border border-white/40 px-8 py-3 text-[0.8rem] tracking-[0.15em] uppercase bg-transparent cursor-pointer hover:bg-white hover:text-black transition-all duration-300"
              style={{ fontWeight: 400 }}
            >
              {t.weddings.ctaButton}
              <ArrowRight size={14} />
            </button>
          </SectionReveal>
        </div>
      </section>

      {/* Lightbox */}
      <Lightbox
        images={filteredGallery}
        initialIndex={index}
        open={open}
        onClose={closeLightbox}
      />
    </>
  );
}