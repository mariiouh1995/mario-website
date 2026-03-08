import { useState } from "react";
import { ArrowRight, Star, ChevronDown, Check, Heart, Users, Baby, PartyPopper } from "lucide-react";
import { useLanguage } from "../LanguageContext";
import { SectionReveal } from "../SectionReveal";
import { SEO } from "../SEO";
import { Lightbox, useLightbox } from "../Lightbox";
import { motion } from "motion/react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { useContactModal } from "../ContactModal";
import { ParallaxHero } from "../ParallaxHero";

const IMAGES = {
  hero: "https://images.unsplash.com/photo-1761334859630-611bdf32e3e0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3VwbGUlMjBzaG9vdGluZyUyMHJvbWFudGljfGVufDF8fHx8MTc3Mjk5NTc5Mnww&ixlib=rb-4.1.0&q=80&w=1080",
  couple: "https://images.unsplash.com/photo-1765615197726-6d2a157620fb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwY291cGxlJTIwb3V0ZG9vciUyMHJvbWFudGljfGVufDF8fHx8MTc3Mjk5NTc4OXww&ixlib=rb-4.1.0&q=80&w=1080",
  family: "https://images.unsplash.com/photo-1603367563698-67012943fd67?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYW1pbHklMjBwb3J0cmFpdCUyMG91dGRvb3IlMjBuYXR1cmFsfGVufDF8fHx8MTc3Mjk5NTc5Mnww&ixlib=rb-4.1.0&q=80&w=1080",
  baptism: "https://images.unsplash.com/photo-1765947383088-c05eeedbdba3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWJ5JTIwYmFwdGlzbSUyMGNlcmVtb255fGVufDF8fHx8MTc3Mjk5NTc5M3ww&ixlib=rb-4.1.0&q=80&w=1080",
  coupleSunset: "https://images.unsplash.com/photo-1769050349380-7ee061d43ef9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3VwbGUlMjBwb3J0cmFpdCUyMHN1bnNldCUyMHJvbWFudGljJTIwb3V0ZG9vcnN8ZW58MXx8fHwxNzcyOTk3NTMzfDA&ixlib=rb-4.1.0&q=80&w=1080",
  familyAutumn: "https://images.unsplash.com/photo-1768509196851-16084e78f6ac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYW1pbHklMjBwb3J0cmFpdCUyMG91dGRvb3IlMjBhdXR1bW4lMjBuYXR1cmFsfGVufDF8fHx8MTc3Mjk5NzUzM3ww&ixlib=rb-4.1.0&q=80&w=1080",
  baptismChurch: "https://images.unsplash.com/photo-1765947386414-5e63c7887830?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWJ5JTIwYmFwdGlzbSUyMGNocmlzdGVuaW5nJTIwY2VyZW1vbnklMjBjaHVyY2h8ZW58MXx8fHwxNzcyOTk3NTM0fDA&ixlib=rb-4.1.0&q=80&w=1080",
  coupleLaughing: "https://images.unsplash.com/photo-1768468104186-368aeb7a266a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3VwbGUlMjBsYXVnaGluZyUyMG91dGRvb3IlMjBlbmdhZ2VtZW50JTIwcGhvdG98ZW58MXx8fHwxNzcyOTk3NTM0fDA&ixlib=rb-4.1.0&q=80&w=1080",
};

export function PortraitPage() {
  const { t, lang } = useLanguage();
  const { open, index, openLightbox, closeLightbox } = useLightbox();
  const { openContact } = useContactModal();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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

  const galleryImages = [
    { src: IMAGES.coupleSunset, alt: "Romantisches Couple Shooting bei Sonnenuntergang – Paarfotograf Tirol" },
    { src: IMAGES.family, alt: "Natuerliches Familienshooting Outdoor – Familienfotograf Innsbruck" },
    { src: IMAGES.baptismChurch, alt: "Taufe Zeremonie in der Kirche – Taufe Fotograf Innsbruck" },
    { src: IMAGES.coupleLaughing, alt: "Lachendes Paar beim Engagement Shooting – Couple Fotograf Bayern" },
    { src: IMAGES.familyAutumn, alt: "Familienportrait Herbst Outdoor – Familienfotografie Tirol" },
    { src: IMAGES.couple, alt: "Romantisches Paar Outdoor in den Alpen – Paarshooting Mario Schubert" },
    { src: IMAGES.hero, alt: "Couple Shooting Outdoor – Portrait und Paarfotografie Innsbruck" },
    { src: IMAGES.baptism, alt: "Taufe Fotografie – Babyfotograf und Eventfotograf Tirol" },
  ];

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

      {/* Pricing */}
      <section className="py-24 md:py-32 bg-[#f8f7f5] px-4">
        <div className="max-w-5xl mx-auto">
          <SectionReveal>
            <div className="text-center mb-16">
              <p
                className="text-[0.75rem] tracking-[0.3em] uppercase text-black/40 mb-4"
                style={{ fontWeight: 400 }}
              >
                {lang === "de" ? "PREISE" : "PRICING"}
              </p>
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "clamp(2rem, 4vw, 3rem)",
                  fontWeight: 300,
                }}
              >
                {lang === "de" ? "Meine Pakete" : "My Packages"}
              </h2>
            </div>
          </SectionReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {(lang === "de"
              ? [
                  {
                    name: "MINI",
                    price: "190\u20AC",
                    sub: "Perfekt für ein schnelles Shooting",
                    features: ["ca. 30 Min. Shooting", "10 bearbeitete Bilder", "Online-Galerie", "1 Location"],
                  },
                  {
                    name: "CLASSIC",
                    price: "ab 350\u20AC",
                    sub: "Der Allrounder",
                    features: ["ca. 1 Stunde Shooting", "25 bearbeitete Bilder", "Online-Galerie", "bis zu 2 Locations", "Outfitwechsel möglich"],
                    highlight: true,
                  },
                  {
                    name: "PREMIUM",
                    price: "ab 550\u20AC",
                    sub: "Für besondere Anlässe",
                    features: ["ca. 2 Stunden Shooting", "50+ bearbeitete Bilder", "Online-Galerie", "Mehrere Locations", "Outfitwechsel inklusive", "10 Sneak Peeks binnen 48h"],
                  },
                ]
              : [
                  {
                    name: "MINI",
                    price: "190\u20AC",
                    sub: "Perfect for a quick shoot",
                    features: ["approx. 30 min shoot", "10 edited images", "Online gallery", "1 location"],
                  },
                  {
                    name: "CLASSIC",
                    price: "from 350\u20AC",
                    sub: "The all-rounder",
                    features: ["approx. 1 hour shoot", "25 edited images", "Online gallery", "up to 2 locations", "Outfit change possible"],
                    highlight: true,
                  },
                  {
                    name: "PREMIUM",
                    price: "from 550\u20AC",
                    sub: "For special occasions",
                    features: ["approx. 2 hour shoot", "50+ edited images", "Online gallery", "Multiple locations", "Outfit changes included", "10 sneak peeks within 48h"],
                  },
                ]
            ).map((pkg, i) => (
              <SectionReveal key={pkg.name} delay={i * 0.12}>
                <div className={`bg-white p-8 h-full flex flex-col border transition-shadow hover:shadow-lg ${(pkg as any).highlight ? "border-black" : "border-black/10"}`}>
                  <p className="text-[0.7rem] tracking-[0.2em] uppercase text-black/40 mb-3" style={{ fontWeight: 400 }}>
                    {pkg.name}
                  </p>
                  <p className="mb-2" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2rem", fontWeight: 600, lineHeight: 1.1 }}>
                    {pkg.price}
                  </p>
                  <p className="text-black/50 text-[0.8rem] mb-6" style={{ fontWeight: 300, fontStyle: "italic" }}>
                    {pkg.sub}
                  </p>
                  <div className="flex flex-col gap-3 flex-1">
                    {pkg.features.map((f, fi) => (
                      <div key={fi} className="flex gap-2">
                        <Check size={14} className="text-black/30 mt-1 shrink-0" />
                        <span className="text-black/60 text-[0.8rem]" style={{ lineHeight: 1.5, fontWeight: 300 }}>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </SectionReveal>
            ))}
          </div>
          <SectionReveal>
            <div className="text-center mt-10">
              <p className="text-black/40 text-[0.8rem] mb-8" style={{ fontWeight: 300 }}>
                {lang === "de"
                  ? "Innerhalb 20 km um Innsbruck keine Anfahrtskosten. Darüber hinaus 60ct/km."
                  : "No travel costs within 20 km of Innsbruck. Beyond that, 60ct/km."}
              </p>
              <button
                onClick={() => openContact("portrait")}
                className="inline-flex items-center gap-2 text-black border border-black px-10 py-4 text-[0.8rem] tracking-[0.15em] uppercase bg-transparent cursor-pointer hover:bg-black hover:text-white transition-all duration-300"
                style={{ fontWeight: 400 }}
              >
                {lang === "de" ? "Jetzt buchen!" : "Book now!"}
                <ArrowRight size={14} />
              </button>
            </div>
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

          <div className="columns-2 md:columns-3 gap-3 md:gap-4">
            {galleryImages.map((img, i) => (
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

      <Lightbox
        images={galleryImages}
        initialIndex={index}
        open={open}
        onClose={closeLightbox}
      />

      {/* Testimonial */}
      <section className="py-20 md:py-24 bg-[#f8f7f5] px-4">
        <div className="max-w-4xl mx-auto">
          <SectionReveal>
            <div className="text-center">
              <div className="flex justify-center gap-1 mb-5">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} size={14} className="text-black/60 fill-black/60" />
                ))}
              </div>
              <p
                className="text-black/55 text-[1.05rem] md:text-[1.15rem] mb-6 max-w-2xl mx-auto"
                style={{ lineHeight: 1.8, fontWeight: 300, fontStyle: "italic" }}
              >
                {lang === "de"
                  ? "\"Wir hatten ein Familienshooting mit unseren drei Kindern – ich dachte, das wird Chaos. Aber Mario hat aus dem Chaos die schönsten Momente gezaubert. Absolut empfehlenswert!\""
                  : "\"We had a family shoot with our three kids – I thought it would be chaos. But Mario turned the chaos into the most beautiful moments. Absolutely recommended!\""}
              </p>
              <p className="text-black/40 text-[0.82rem]" style={{ fontWeight: 400 }}>
                — {lang === "de" ? "Familie Berger, Familienshooting" : "Berger Family, Family Shoot"} 2025
              </p>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* Portrait FAQ */}
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
                {lang === "de" ? "Häufige Fragen" : "Frequently Asked Questions"}
              </h2>
            </div>
          </SectionReveal>
          <div className="flex flex-col">
            {(lang === "de"
              ? [
                  { q: "Wie läuft ein Shooting ab?", a: "Wir treffen uns am vereinbarten Ort, lernen uns kurz kennen und legen dann entspannt los. Ich gebe euch Posing-Tipps, aber das meiste passiert ganz natürlich." },
                  { q: "Was soll ich anziehen?", a: "Schlichte, zeitlose Kleidung funktioniert am besten. Vermeidet große Logos oder sehr grelle Farben. Gerne könnt ihr 2–3 Outfits mitbringen." },
                  { q: "Können wir unsere Haustiere mitbringen?", a: "Na klar! Hunde, Katzen oder Pferde machen jedes Familienshooting noch besonderer." },
                  { q: "Ab welchem Alter fotografierst du Babys?", a: "Ab Geburt! Für Neugeborene empfehle ich die ersten 2 Wochen, für andere Baby-Shootings bin ich flexibel." },
                ]
              : [
                  { q: "How does a shoot work?", a: "We meet at the agreed location, get to know each other briefly and then start relaxed. I give posing tips, but most happens naturally." },
                  { q: "What should I wear?", a: "Simple, timeless clothing works best. Avoid large logos or very bright colors. Feel free to bring 2-3 outfits." },
                  { q: "Can we bring our pets?", a: "Of course! Dogs, cats or horses make every family shoot even more special." },
                  { q: "From what age do you photograph babies?", a: "From birth! For newborns I recommend the first 2 weeks, for other baby shoots I'm flexible." },
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