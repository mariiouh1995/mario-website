import { ParallaxHero } from "../ParallaxHero";
import { GoogleReviewSingle } from "../GoogleReviews";
import { ArrowRight, Star, Heart, Users, Baby, PartyPopper } from "lucide-react";
import { useLanguage } from "../LanguageContext";
import { SectionReveal } from "../SectionReveal";
import { SEO } from "../SEO";
import { Lightbox, useLightbox } from "../Lightbox";
import { motion } from "motion/react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { useContactModal } from "../ContactModal";
import { useShuffledGallery } from "../useShuffledGallery";
import { useImages } from "../useImages";
import { MasonryGrid } from "../MasonryGrid";
import { FAQSection } from "../FAQSection";
import { getFAQsByCategories, PAGE_FAQ_CATEGORIES } from "../faqData";

const IMAGES = {
  hero: "https://ik.imagekit.io/r2yqrg6np/Tiere/20251019_Hundeshooting-4431_(WebRes).jpg?updatedAt=1772999913745",
  couple: "https://ik.imagekit.io/r2yqrg6np/Wedding/Getting%20Ready/20251004_8D2A0221_(WebRes).jpg?updatedAt=1773002917508",
  family: "https://ik.imagekit.io/r2yqrg6np/Wedding/Paarfotos/250830_LJ_153525_0450(LowRes).jpg?updatedAt=1773007047995",
  baptism: "https://ik.imagekit.io/r2yqrg6np/Other/20251019_Hundeshooting-2363_(WebRes).jpg?updatedAt=1773014105249",
  coupleSunset: "https://images.unsplash.com/photo-1769050349380-7ee061d43ef9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3VwbGUlMjBwb3J0cmFpdCUyMHN1bnNldCUyMHJvbWFudGljJTIwb3V0ZG9vcnN8ZW58MXx8fHwxNzcyOTk3NTMzfDA&ixlib=rb-4.1.0&q=80&w=1080",
  familyAutumn: "https://images.unsplash.com/photo-1768509196851-16084e78f6ac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYW1pbHklMjBwb3J0cmFpdCUyMG91dGRvb3IlMjBhdXR1bW4lMjBuYXR1cmFsfGVufDF8fHx8MTc3Mjk5NzUzM3ww&ixlib=rb-4.1.0&q=80&w=1080",
  baptismChurch: "https://images.unsplash.com/photo-1765947386414-5e63c7887830?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWJ5JTIwYmFwdGlzbSUyMGNocmlzdGVuaW5nJTIwY2VyZW1vbnklMjBjaHVyY2h8ZW58MXx8fHwxNzcyOTk3NTM0fDA&ixlib=rb-4.1.0&q=80&w=1080",
  coupleLaughing: "https://images.unsplash.com/photo-1768468104186-368aeb7a266a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3VwbGUlMjBsYXVnaGluZyUyMG91dGRvb3IlMjBlbmdhZ2VtZW50JTIwcGhvdG98ZW58MXx8fHwxNzcyOTk3NTM0fDA&ixlib=rb-4.1.0&q=80&w=1080",
};

export function PortraitPage() {
  const { t, lang } = useLanguage();
  const { open, index, openLightbox, closeLightbox } = useLightbox();
  const { openContact } = useContactModal();
  const { getImagesForPage } = useImages();

  const seo = lang === "de"
    ? {
        title: "Portrait, Couple Shooting & Familienfotografie Innsbruck | Mario Schubert",
        description: "Couple Shootings, Familienfotografie, Taufe und private Anlaesse in Innsbruck, Tirol und Bayern. Authentische, emotionale Bilder. Jetzt anfragen!",
        keywords: "Couple Shooting Innsbruck, Familienfotografie Tirol, Portraitfotografie Bayern, Taufe Fotograf Muenchen, Familienshooting Alpen",
      }
    : {
        title: "Portrait, Couple Shooting & Family Photography Innsbruck | Mario Schubert",
        description: "Couple shootings, family photography, baptism and private occasions in Innsbruck, Tyrol and Bavaria. Authentic, emotional images. Inquire now!",
        keywords: "couple shooting Innsbruck, family photography Tyrol, portrait photography Bavaria, baptism photographer Munich, family shooting Alps",
      };

  const categories = [
    {
      title: t.portrait.coupleTitle,
      text: t.portrait.coupleText,
      image: IMAGES.couple,
      imageAlt: "Verliebtes Paar beim Couple Shooting in den Tiroler Alpen – Paarfotograf Mario Schubert Innsbruck",
    },
    {
      title: t.portrait.familyTitle,
      text: t.portrait.familyText,
      image: IMAGES.family,
      imageAlt: "Natuerliches Familienshooting Outdoor – Familienfotograf Innsbruck Tirol",
    },
    {
      title: t.portrait.privateTitle,
      text: t.portrait.privateText,
      image: IMAGES.baptism,
      imageAlt: "Taufe Zeremonie Fotografie – Eventfotograf Mario Schubert Bayern und Tirol",
    },
  ];

  // Pull portrait images from Google Sheet (ImageKit "Other" folder → page "portrait")
  // Falls back to hardcoded Unsplash images if API unavailable
  const fallbackImages = [
    { src: IMAGES.coupleSunset, alt: "Romantisches Couple Shooting bei Sonnenuntergang – Paarfotograf Tirol" },
    { src: IMAGES.family, alt: "Natuerliches Familienshooting Outdoor – Familienfotograf Innsbruck" },
    { src: IMAGES.baptismChurch, alt: "Taufe Zeremonie in der Kirche – Taufe Fotograf Innsbruck" },
    { src: IMAGES.coupleLaughing, alt: "Lachendes Paar beim Engagement Shooting – Couple Fotograf Bayern" },
    { src: IMAGES.familyAutumn, alt: "Familienportrait Herbst Outdoor – Familienfotografie Tirol" },
    { src: IMAGES.couple, alt: "Romantisches Paar Outdoor in den Alpen – Paarshooting Mario Schubert" },
    { src: IMAGES.hero, alt: "Couple Shooting Outdoor – Portrait und Paarfotografie Innsbruck" },
    { src: IMAGES.baptism, alt: "Taufe Fotografie – Babyfotograf und Eventfotograf Tirol" },
  ];

  const apiImages = getImagesForPage("portrait", undefined, lang);
  const rawGalleryImages = apiImages.length > 0 ? apiImages : fallbackImages;
  const galleryImages = useShuffledGallery(rawGalleryImages);

  return (
    <>
      <SEO
        title={seo.title}
        description={seo.description}
        canonical="/portrait"
        keywords={seo.keywords}
        lang={lang}
        ogImage={IMAGES.hero}
      />

      {/* Hero with Parallax */}
      <ParallaxHero
        imageSrc={IMAGES.hero}
        imageAlt="Romantisches Couple Shooting Outdoor – Portrait und Paarfotografie in Innsbruck, Tirol von Mario Schubert"
        preTitle={t.portrait.heroTitle}
        title={t.portrait.heroSubtitle}
      />

      {/* Intro */}
      <section className="py-20 md:py-28 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <SectionReveal>
            <p
              className="text-black/55 text-[1rem] md:text-[1.1rem]"
              style={{ lineHeight: 1.9, fontWeight: 300 }}
            >
              {t.portrait.intro}
            </p>
          </SectionReveal>
        </div>
      </section>

      {/* Categories */}
      {categories.map((cat, i) => (
        <section
          key={cat.title}
          className={`py-24 md:py-32 px-4 ${i % 2 === 1 ? "bg-[#f8f7f5]" : ""}`}
        >
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <SectionReveal>
                <div className={i % 2 === 1 ? "lg:order-2" : ""}>
                  <h2
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "clamp(2rem, 4vw, 3rem)",
                      fontWeight: 600,
                      lineHeight: 1.1,
                      marginBottom: "1.5rem",
                    }}
                  >
                    {cat.title}
                  </h2>
                  <p
                    className="text-black/55 text-[0.9rem] mb-6"
                    style={{ lineHeight: 1.8, fontWeight: 300 }}
                  >
                    {cat.text}
                  </p>
                  <button
                    onClick={() => openContact("portrait")}
                    className="inline-flex items-center gap-2 text-[0.8rem] tracking-[0.12em] uppercase text-black border-b border-black/30 pb-1 bg-transparent border-t-0 border-l-0 border-r-0 cursor-pointer hover:border-black transition-colors"
                    style={{ fontWeight: 400 }}
                  >
                    {lang === "de" ? "Jetzt anfragen" : "Inquire now"} →
                  </button>
                </div>
              </SectionReveal>
              <SectionReveal delay={0.2}>
                <div className={i % 2 === 1 ? "lg:order-1" : ""}>
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <ImageWithFallback
                      src={cat.image}
                      alt={cat.imageAlt}
                      className="w-full aspect-[4/3] object-cover"
                    />
                  </motion.div>
                </div>
              </SectionReveal>
            </div>
          </div>
        </section>
      ))}

      {/* Pricing → replaced with friendly "on request" section */}
      <section className="py-24 md:py-32 bg-[#f8f7f5] px-4">
        <div className="max-w-3xl mx-auto text-center">
          <SectionReveal>
            <p
              className="text-[0.75rem] tracking-[0.3em] uppercase text-black/40 mb-4"
              style={{ fontWeight: 400 }}
            >
              {lang === "de" ? "INDIVIDUELL & PERSÖNLICH" : "INDIVIDUAL & PERSONAL"}
            </p>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(2rem, 4vw, 3rem)",
                fontWeight: 300,
                marginBottom: "1.5rem",
              }}
            >
              {lang === "de" ? "Jedes Shooting ist einzigartig" : "Every shoot is unique"}
            </h2>
            <p
              className="text-black/55 text-[0.92rem] mb-4 max-w-2xl mx-auto"
              style={{ lineHeight: 1.9, fontWeight: 300 }}
            >
              {lang === "de"
                ? "Ob Couple Shooting, Familienportrait, Taufe oder ein ganz besonderer Anlass – ich schnüre für jedes Shooting ein individuelles Angebot, das perfekt zu euch passt. Keine starren Pakete, sondern genau das, was ihr braucht."
                : "Whether it's a couple shoot, family portrait, baptism or a special occasion – I create a custom offer for every shoot that's perfectly tailored to you. No rigid packages, just exactly what you need."}
            </p>
            <p
              className="text-black/40 text-[0.85rem] mb-10 max-w-xl mx-auto"
              style={{ lineHeight: 1.8, fontWeight: 300, fontStyle: "italic" }}
            >
              {lang === "de"
                ? "Schreibt mir einfach – ich melde mich innerhalb von 24 Stunden mit einem unverbindlichen Angebot bei euch."
                : "Just send me a message – I'll get back to you within 24 hours with a non-binding offer."}
            </p>
            <button
              onClick={() => openContact("portrait")}
              className="inline-flex items-center gap-2 text-black border border-black px-10 py-4 text-[0.8rem] tracking-[0.15em] uppercase bg-transparent cursor-pointer hover:bg-black hover:text-white transition-all duration-300"
              style={{ fontWeight: 400 }}
            >
              {lang === "de" ? "Unverbindlich anfragen" : "Inquire now"}
              <ArrowRight size={14} />
            </button>
          </SectionReveal>
        </div>
      </section>

      {/* Perfect For */}
      <section className="py-24 md:py-32 px-4">
        <div className="max-w-5xl mx-auto">
          <SectionReveal>
            <div className="text-center mb-16">
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "clamp(2rem, 4vw, 3rem)",
                  fontWeight: 300,
                }}
              >
                {lang === "de" ? "Perfekt für jeden Anlass" : "Perfect for every occasion"}
              </h2>
            </div>
          </SectionReveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {(lang === "de"
              ? [
                  { icon: Heart, title: "Couple Shootings", text: "Verlobung, Jahrestag oder einfach so" },
                  { icon: Users, title: "Familienshootings", text: "Mit Kindern, Großeltern oder der ganzen Bande" },
                  { icon: Baby, title: "Taufe & Baby", text: "Die ersten Monate festhalten" },
                  { icon: PartyPopper, title: "Events & Feiern", text: "Geburtstage, Jubiläen, Firmenfeiern" },
                ]
              : [
                  { icon: Heart, title: "Couple Shoots", text: "Engagement, anniversary or just because" },
                  { icon: Users, title: "Family Shoots", text: "With kids, grandparents or the whole gang" },
                  { icon: Baby, title: "Baptism & Baby", text: "Capture the first months" },
                  { icon: PartyPopper, title: "Events & Parties", text: "Birthdays, anniversaries, corporate events" },
                ]
            ).map((item, i) => (
              <SectionReveal key={item.title} delay={i * 0.1}>
                <div className="text-center">
                  <div className="w-14 h-14 mx-auto mb-4 border border-black/10 flex items-center justify-center">
                    <item.icon size={20} className="text-black/35" />
                  </div>
                  <h3
                    className="mb-1"
                    style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.15rem", fontWeight: 600 }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-black/45 text-[0.8rem]" style={{ lineHeight: 1.6, fontWeight: 300 }}>
                    {item.text}
                  </p>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
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

          <MasonryGrid
            images={galleryImages}
            openLightbox={openLightbox}
            initialPageSize={galleryImages.length}
          />
        </div>
      </section>

      <Lightbox
        images={galleryImages}
        initialIndex={index}
        open={open}
        onClose={closeLightbox}
      />

      {/* Testimonial */}
      <GoogleReviewSingle bg="cream" reviewIndex={4} />

      {/* Portrait FAQ */}
      <FAQSection
        categories={getFAQsByCategories(PAGE_FAQ_CATEGORIES.portrait)}
        title={{ de: "Häufige Fragen zu Portrait & Shootings", en: "Portrait & Shooting FAQ" }}
      />

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
              {t.portrait.ctaTitle}
            </h2>
            <p
              className="text-white/50 text-[0.9rem] mb-10"
              style={{ lineHeight: 1.8, fontWeight: 300 }}
            >
              {t.portrait.ctaText}
            </p>
            <button
              onClick={() => openContact("portrait")}
              className="inline-flex items-center gap-2 text-white border border-white/40 px-8 py-3 text-[0.8rem] tracking-[0.15em] uppercase bg-transparent cursor-pointer hover:bg-white hover:text-black transition-all duration-300"
              style={{ fontWeight: 400 }}
            >
              {t.portrait.ctaButton}
              <ArrowRight size={14} />
            </button>
          </SectionReveal>
        </div>
      </section>
    </>
  );
}