import { useState } from "react";
import { ArrowRight, Check, Camera, Heart, Users, Sparkles, Music, Cake, PartyPopper, Star, ChevronDown } from "lucide-react";
import { useLanguage } from "../LanguageContext";
import { SectionReveal } from "../SectionReveal";
import { SEO } from "../SEO";
import { Lightbox, useLightbox } from "../Lightbox";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { useContactModal } from "../ContactModal";
import { ParallaxHero } from "../ParallaxHero";

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

  const weddingGallery = [
    { src: IMAGES.galleryBride, alt: "Braut beim Getting Ready – Hochzeitsfotografie Innsbruck, Tirol" },
    { src: IMAGES.photo1, alt: "Elegante Hochzeitszeremonie in Tirol – Hochzeitsfotograf Mario Schubert" },
    { src: IMAGES.galleryBouquet, alt: "Brautstrauss Detailaufnahme – Hochzeitsfotografie Innsbruck" },
    { src: IMAGES.galleryDance, alt: "Erster Tanz als Ehepaar – Hochzeitsreportage Bayern" },
    { src: IMAGES.photo2, alt: "Emotionales Brautportrait – authentische Hochzeitsfotografie Alpen" },
    { src: IMAGES.galleryCeremony, alt: "Outdoor Hochzeitszeremonie in den Bergen – Hochzeitsfotograf Tirol" },
    { src: IMAGES.details, alt: "Eheringe Detailfoto – Hochzeitsfotografie Innsbruck Mario Schubert" },
    { src: IMAGES.video, alt: "Hochzeitsfeier und Tanz – Hochzeitsvideograf Innsbruck und Bayern" },
    { src: IMAGES.hero, alt: "Romantisches Brautpaar Outdoor – Hochzeitsfotograf Tirol und Bayern" },
  ];

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

  const photoPackages = [
    {
      name: "STANDESAMT",
      price: "890\u20AC",
      subtitle: "(Freitag bis Montag)",
      features: [
        "3h Begleitung (Ankunft, Trauung, Gratulation, Mini-Shooting)",
        "ca. 200 Bilder",
        "Onlinegalerie",
      ],
      featuresEn: [
        "3h accompaniment (arrival, ceremony, congratulations, mini-shooting)",
        "approx. 200 images",
        "Online gallery",
      ],
    },
    {
      name: "ESSENTIAL",
      price: "ab 2.090\u20AC",
      subtitle: lang === "de" ? "Hier geht's los!" : "Let's go!",
      features: [
        "6h Reportage",
        "ca. 400 bearbeitete Bilder in passwortgesch\u00FCtzter Onlinegalerie",
        "20 Bilder binnen 72h",
      ],
      featuresEn: [
        "6h reportage",
        "approx. 400 edited images in password-protected online gallery",
        "20 images within 72h",
      ],
    },
    {
      name: "SIGNATURE",
      price: "ab 2.590\u20AC",
      subtitle: lang === "de" ? "Der Klassiker." : "The classic.",
      features: [
        "8h Reportage",
        "600+ bearbeitete Bilder",
        "20 Bilder binnen 48h",
      ],
      featuresEn: [
        "8h reportage",
        "600+ edited images",
        "20 images within 48h",
      ],
      highlight: true,
    },
    {
      name: "SIGNATURE PLUS+",
      price: "ab 3.190\u20AC",
      subtitle:
        lang === "de"
          ? "F\u00FCr Paare, die \u201Ealles wollen\"."
          : "For couples who want it all.",
      features: [
        "8h Hochzeitsbegleitung",
        "600+ bearbeitete Bilder",
        "20 Bilder binnen 48h",
        "PLUS+ Minivideo 2\u20133 Min, +100 Fotos extra",
      ],
      featuresEn: [
        "8h wedding accompaniment",
        "600+ edited images",
        "20 images within 48h",
        "PLUS+ Mini video 2-3 min, +100 extra photos",
      ],
    },
  ];

  const videoPackages = [
    {
      name: "CLIP",
      price: "1.000\u20AC",
      subtitle:
        lang === "de"
          ? "H\u00E4lt die wichtigsten Stationen eurer Hochzeit fest"
          : "Captures the key moments of your wedding",
      features: [
        "Trauung, Gratulation und Paarshooting",
        "emotionales Highlight-Video (2\u20133 Min.)",
        "Full-HD Qualit\u00E4t und eurer Wunschlied (1 Lied)",
      ],
      featuresEn: [
        "Ceremony, congratulations and couple shooting",
        "emotional highlight video (2-3 min.)",
        "Full-HD quality and your song of choice (1 song)",
      ],
    },
    {
      name: "VIDEO",
      price: "1.800\u20AC",
      subtitle:
        lang === "de"
          ? "Die umfassende Begleitung von eurem Hochzeitstag"
          : "Comprehensive coverage of your wedding day",
      features: [
        "Getting Ready, Trauung, Gratulation, Paarshooting, Festessen und Tanz",
        "5-7 Minuten Video",
        "4K Aufl\u00F6sung",
        "4 Liedern nach eurem Wunsch",
      ],
      featuresEn: [
        "Getting Ready, ceremony, congratulations, couple shooting, dinner and dance",
        "5-7 minute video",
        "4K resolution",
        "4 songs of your choice",
      ],
      highlight: true,
    },
    {
      name: "FILM",
      price: "2.500\u20AC",
      subtitle:
        lang === "de"
          ? "Der Standard f\u00FCr Paare, die ihre Hochzeit in allen Facetten festgehalten haben m\u00F6chten"
          : "The standard for couples who want every facet captured",
      features: [
        "Alles aus \"Video\" plus Hochzeitstorte, Er\u00F6ffnungstanz, Party bis 0 Uhr",
        "8-10 Min Video",
        "Drohnenaufnahmen (falls erlaubt)",
        "Rohmaterial, Trauung & Reden in voller L\u00E4nge mit Ton",
        "6 Lieder und pers\u00F6nliches Kennenlernen",
      ],
      featuresEn: [
        "Everything from \"Video\" plus wedding cake, first dance, party until midnight",
        "8-10 min video",
        "Drone footage (if permitted)",
        "Raw material, ceremony & speeches in full length with audio",
        "6 songs and personal meeting",
      ],
    },
  ];

  const addOns = lang === "de"
    ? [
        "After-Wedding-Shooting (ca. 3h, 80 Bilder): 520\u20AC",
        "Mini-Video: 400\u20AC",
        "Probe-Shooting: 200\u20AC",
        "Drohnenaufnahmen, 10 Bilder: 200\u20AC",
        "Plotter: 50\u20AC",
      ]
    : [
        "After-wedding shooting (approx. 3h, 80 images): 520\u20AC",
        "Mini video: 400\u20AC",
        "Trial shooting: 200\u20AC",
        "Drone shots, 10 images: 200\u20AC",
        "Plotter: 50\u20AC",
      ];

  const shotListItems = lang === "de"
    ? [
        { icon: Sparkles, title: "Getting Ready", text: "Die aufgeregte Vorbereitung, letzte Handgriffe, Emotionen vor dem gro\u00DFen Moment" },
        { icon: Heart, title: "Trauung", text: "Das Ja-Wort, der Ringtausch, die Tr\u00E4nen der Freude \u2013 alles ungestellt und echt" },
        { icon: Users, title: "Gratulation & G\u00E4ste", text: "Umarmungen, Freudentr\u00E4nen, die Gratulationen der Liebsten" },
        { icon: Camera, title: "Paarshooting", text: "Zeit nur f\u00FCr euch zwei \u2013 entspannt, nat\u00FCrlich, in der sch\u00F6nsten Kulisse" },
        { icon: Cake, title: "Festessen & Torte", text: "Die Tischdekoration, die Reden, das Anschneiden der Hochzeitstorte" },
        { icon: Music, title: "Er\u00F6ffnungstanz", text: "Euer erster Tanz als Ehepaar \u2013 einer der emotionalsten Momente des Tages" },
        { icon: PartyPopper, title: "Feier & Party", text: "Wenn die Stimmung steigt, die Tanzfl\u00E4che voll ist und alle feiern" },
      ]
    : [
        { icon: Sparkles, title: "Getting Ready", text: "The excited preparation, final touches, emotions before the big moment" },
        { icon: Heart, title: "Ceremony", text: "The vows, the ring exchange, tears of joy \u2013 all unposed and real" },
        { icon: Users, title: "Congratulations & Guests", text: "Hugs, happy tears, congratulations from loved ones" },
        { icon: Camera, title: "Couple Shooting", text: "Time just for you two \u2013 relaxed, natural, in the most beautiful setting" },
        { icon: Cake, title: "Dinner & Cake", text: "Table decoration, speeches, cutting the wedding cake" },
        { icon: Music, title: "First Dance", text: "Your first dance as a married couple \u2013 one of the most emotional moments" },
        { icon: PartyPopper, title: "Celebration & Party", text: "When the mood rises, the dance floor is full and everyone celebrates" },
      ];

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
                    fontFamily: "'Cormorant Garamond', serif",
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
                    fontFamily: "'Cormorant Garamond', serif",
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
                  fontFamily: "'Cormorant Garamond', serif",
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
                        fontFamily: "'Cormorant Garamond', serif",
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
                fontFamily: "'Cormorant Garamond', serif",
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
            {(activeTab === "photo" ? photoPackages : videoPackages).map(
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
                        fontFamily: "'Cormorant Garamond', serif",
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
                    fontFamily: "'Cormorant Garamond', serif",
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
              className="text-center mb-16"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(2rem, 4vw, 3rem)",
                fontWeight: 300,
                letterSpacing: "0.1em",
              }}
            >
              GET INSPIRED
            </h2>
          </SectionReveal>

          <div className="columns-2 md:columns-3 gap-3 md:gap-4">
            {weddingGallery.map((img, i) => (
              <SectionReveal key={i} delay={i * 0.06}>
                <motion.div
                  className="mb-3 md:mb-4 break-inside-avoid overflow-hidden cursor-pointer"
                  onClick={() => openLightbox(i)}
                  whileHover={{ scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    whileHover={{ scale: 1.08 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <ImageWithFallback
                      src={img.src}
                      alt={img.alt}
                      className={`w-full object-cover ${i % 3 === 0 ? "aspect-[3/4]" : "aspect-square"}`}
                    />
                  </motion.div>
                </motion.div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Wedding Testimonials */}
      <section className="py-24 md:py-32 bg-[#f8f7f5] px-4">
        <div className="max-w-6xl mx-auto">
          <SectionReveal>
            <div className="text-center mb-16">
              <p
                className="text-[0.75rem] tracking-[0.3em] uppercase text-black/40 mb-4"
                style={{ fontWeight: 400 }}
              >
                {lang === "de" ? "KUNDENSTIMMEN" : "TESTIMONIALS"}
              </p>
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "clamp(2rem, 4vw, 3rem)",
                  fontWeight: 300,
                }}
              >
                {lang === "de" ? "Das sagen meine Paare" : "What my couples say"}
              </h2>
            </div>
          </SectionReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {(lang === "de"
              ? [
                  {
                    text: "Mario hat unsere Hochzeit so eingefangen, wie wir sie erlebt haben – echt, emotional und wunderschön. Wir schauen uns die Bilder immer wieder an.",
                    name: "Sarah & Thomas",
                    detail: "Hochzeit in Innsbruck, 2025",
                  },
                  {
                    text: "Wir hatten eine kleine Berghochzeit und Mario hat jeden Moment perfekt festgehalten. Er war so unauffällig, dass wir oft vergessen haben, dass er da war – und das merkt man an den Bildern.",
                    name: "Julia & Markus",
                    detail: "Elopement am Achensee, 2024",
                  },
                  {
                    text: "Das Kombi-Paket aus Foto und Video war die beste Entscheidung! Der Film bringt uns jedes Mal zum Weinen – im besten Sinne.",
                    name: "Anna & Florian",
                    detail: "Hochzeit in München, 2025",
                  },
                ]
              : [
                  {
                    text: "Mario captured our wedding exactly as we experienced it – real, emotional and beautiful. We look at the photos again and again.",
                    name: "Sarah & Thomas",
                    detail: "Wedding in Innsbruck, 2025",
                  },
                  {
                    text: "We had a small mountain wedding and Mario captured every moment perfectly. He was so unobtrusive we often forgot he was there – and you can tell from the photos.",
                    name: "Julia & Markus",
                    detail: "Elopement at Lake Achensee, 2024",
                  },
                  {
                    text: "The photo and video combo package was the best decision! The film makes us cry every time – in the best way.",
                    name: "Anna & Florian",
                    detail: "Wedding in Munich, 2025",
                  },
                ]
            ).map((review, i) => (
              <SectionReveal key={review.name} delay={i * 0.12}>
                <div className="bg-white p-8 h-full flex flex-col">
                  <div className="flex gap-1 mb-5">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} size={14} className="text-black/70 fill-black/70" />
                    ))}
                  </div>
                  <p
                    className="text-black/60 text-[0.88rem] flex-1 mb-6"
                    style={{ lineHeight: 1.75, fontWeight: 300, fontStyle: "italic" }}
                  >
                    "{review.text}"
                  </p>
                  <div>
                    <p className="text-[0.85rem]" style={{ fontWeight: 500 }}>{review.name}</p>
                    <p className="text-black/40 text-[0.78rem]" style={{ fontWeight: 300 }}>{review.detail}</p>
                  </div>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Wedding FAQ */}
      <section className="py-24 md:py-32 px-4">
        <div className="max-w-3xl mx-auto">
          <SectionReveal>
            <div className="text-center mb-16">
              <p
                className="text-[0.75rem] tracking-[0.3em] uppercase text-black/40 mb-4"
                style={{ fontWeight: 400 }}
              >
                FAQ
              </p>
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "clamp(2rem, 4vw, 3rem)",
                  fontWeight: 300,
                }}
              >
                {lang === "de" ? "Häufige Fragen zur Hochzeitsfotografie" : "Wedding Photography FAQ"}
              </h2>
            </div>
          </SectionReveal>
          <div className="flex flex-col">
            {(lang === "de"
              ? [
                  { q: "Wie viele Bilder erhalte ich?", a: "Das hängt vom Paket ab – bei einer 8-stündigen Reportage erhaltet ihr ca. 600+ bearbeitete Bilder. Jedes einzelne wird von mir persönlich bearbeitet." },
                  { q: "Können wir ein Probshooting machen?", a: "Ja, sehr gerne! Ein Engagement- oder Kennenlernshooting empfehle ich sogar, damit ihr euch vor der Kamera wohlfühlt und wir uns kennenlernen." },
                  { q: "Fotografierst du auch im Ausland?", a: "Auf jeden Fall! Destination Weddings sind etwas Besonderes. Ob Italien, Kroatien oder die Schweiz – ich bin überall dabei." },
                  { q: "Wann bekommen wir die Bilder?", a: "Sneak Peeks innerhalb von 48–72 Stunden, die vollständige Galerie innerhalb von 4–6 Wochen." },
                  { q: "Können wir Foto und Video kombinieren?", a: "Ja! Das Signature Plus+ Paket beinhaltet beides. Alternativ könnt ihr jedes Video-Paket separat dazubuchen – fragt einfach an." },
                ]
              : [
                  { q: "How many photos will I receive?", a: "That depends on the package – for an 8-hour reportage you'll receive about 600+ edited images. Each one is personally edited by me." },
                  { q: "Can we do a trial shoot?", a: "Yes, absolutely! I actually recommend an engagement or get-to-know shoot so you feel comfortable in front of the camera." },
                  { q: "Do you shoot abroad?", a: "Definitely! Destination weddings are something special. Whether Italy, Croatia or Switzerland – I'm there." },
                  { q: "When do we get the photos?", a: "Sneak peeks within 48–72 hours, the complete gallery within 4–6 weeks." },
                  { q: "Can we combine photo and video?", a: "Yes! The Signature Plus+ package includes both. Alternatively, you can add any video package separately – just ask." },
                ]
            ).map((faq, i) => (
              <SectionReveal key={i} delay={i * 0.06}>
                <div className="border-b border-black/10">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between py-5 px-1 bg-transparent border-none cursor-pointer text-left group"
                  >
                    <span
                      className="text-[0.92rem] pr-4 group-hover:text-black transition-colors"
                      style={{ fontWeight: 400, color: openFaq === i ? "black" : "rgba(0,0,0,0.7)" }}
                    >
                      {faq.q}
                    </span>
                    <ChevronDown
                      size={18}
                      className="flex-shrink-0 text-black/30 transition-transform duration-300"
                      style={{ transform: openFaq === i ? "rotate(180deg)" : "rotate(0deg)" }}
                    />
                  </button>
                  <div
                    className="overflow-hidden transition-all duration-300"
                    style={{ maxHeight: openFaq === i ? "300px" : "0px", opacity: openFaq === i ? 1 : 0 }}
                  >
                    <p
                      className="text-black/50 text-[0.87rem] pb-5 px-1"
                      style={{ lineHeight: 1.75, fontWeight: 300 }}
                    >
                      {faq.a}
                    </p>
                  </div>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 md:py-32 bg-black text-white">
        <div className="max-w-3xl mx-auto text-center px-4">
          <SectionReveal>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
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
        images={weddingGallery}
        initialIndex={index}
        open={open}
        onClose={closeLightbox}
      />
    </>
  );
}