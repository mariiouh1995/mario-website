import { useState } from "react";
import { ArrowRight, Check, Star, ChevronDown, Heart, Leaf, Sun, Camera as CameraIcon } from "lucide-react";
import { useLanguage } from "../LanguageContext";
import { SectionReveal } from "../SectionReveal";
import { SEO } from "../SEO";
import { Lightbox, useLightbox } from "../Lightbox";
import { motion } from "motion/react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { useContactModal } from "../ContactModal";
import { ParallaxHero } from "../ParallaxHero";

const IMAGES = {
  hero: "https://images.unsplash.com/photo-1767381392938-c95d24cd5873?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb2clMjBwb3J0cmFpdCUyMHByb2Zlc3Npb25hbCUyMHBob3RvZ3JhcGh5fGVufDF8fHx8MTc3Mjk5NTc5MXww&ixlib=rb-4.1.0&q=80&w=1080",
  dogs: "https://images.unsplash.com/photo-1727379819078-65e02ff69f5c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb2xkZW4lMjByZXRyaWV2ZXIlMjBoYXBweSUyMG91dGRvb3J8ZW58MXx8fHwxNzcyOTk1Nzk0fDA&ixlib=rb-4.1.0&q=80&w=1080",
  horses: "https://images.unsplash.com/photo-1603985724731-287f8d5faf7e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3JzZSUyMHBvcnRyYWl0JTIwb3V0ZG9vcnxlbnwxfHx8fDE3NzI5OTU3OTF8MA&ixlib=rb-4.1.0&q=80&w=1080",
  cats: "https://images.unsplash.com/photo-1643866223072-30bbf814bb89?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXQlMjBwb3J0cmFpdCUyMHByb2Zlc3Npb25hbHxlbnwxfHx8fDE3NzI5OTU3OTN8MA&ixlib=rb-4.1.0&q=80&w=1080",
};

export function AnimalsPage() {
  const { t, lang } = useLanguage();
  const { open, index, openLightbox, closeLightbox } = useLightbox();
  const { openContact } = useContactModal();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const seo = lang === "de"
    ? {
        title: "Tierfotografie Innsbruck & Tirol | Hunde, Pferde & mehr | Mario Schubert",
        description: "Professionelle Tierfotografie in Innsbruck, Tirol und Bayern. Hundefotografie, Pferdefotografie, Studio & Outdoor. Ab 190 Euro. Jetzt Termin anfragen!",
        keywords: "Tierfotografie Innsbruck, Hundefotografie Tirol, Pferdefotografie Bayern, Tierfotograf Muenchen, Haustierfotografie Alpen, Tiershooting Innsbruck",
      }
    : {
        title: "Animal Photography Innsbruck & Tyrol | Dogs, Horses & more | Mario Schubert",
        description: "Professional animal photography in Innsbruck, Tyrol and Bavaria. Dog photography, horse photography, studio & outdoor. From 190 Euro. Inquire now!",
        keywords: "animal photography Innsbruck, dog photography Tyrol, horse photography Bavaria, pet photographer Munich, animal shooting Alps",
      };

  const studioPackage = lang === "de"
    ? {
        title: "Tierfotografie im Tageslicht\u00ADstudio",
        price: "190 \u20AC",
        features: [
          "ca. 30 Minuten im hellen Tageslicht-Studio",
          "10 professionell bearbeitete Bilder",
          "Weitere Bilder auf Anfrage buchbar",
          "Alle Bilder digital in voller Aufl\u00F6sung",
        ],
        note: "Auf Anfrage gibt es auch Kombi-Angebote (Tier + Besitzer). Zeitraum ist flexibel.",
      }
    : {
        title: "Animal Photography in Daylight Studio",
        price: "190 \u20AC",
        features: [
          "approx. 30 minutes in bright daylight studio",
          "10 professionally edited images",
          "Additional images available on request",
          "All images digital in full resolution",
        ],
        note: "Combo offers (pet + owner) available on request. Timing is flexible.",
      };

  const outdoorPackage = lang === "de"
    ? {
        title: "Outdoor Tierfotografie",
        price: "ab 260 \u20AC",
        features: [
          "ca. 1 Stunde Shooting an eurem Wunschort",
          "20 professionell bearbeitete Bilder",
          "Weitere Bilder auf Anfrage buchbar",
          "Alle Bilder digital in voller Aufl\u00F6sung",
          "Anfahrt bis 20km um Innsbruck inklusive",
        ],
        note: "Ab 20 km um Innsbruck berechne ich f\u00FCr die Anfahrt 60ct/Kilometer.",
      }
    : {
        title: "Outdoor Animal Photography",
        price: "from 260 \u20AC",
        features: [
          "approx. 1 hour shooting at your desired location",
          "20 professionally edited images",
          "Additional images available on request",
          "All images digital in full resolution",
          "Travel up to 20km around Innsbruck included",
        ],
        note: "Beyond 20 km from Innsbruck, I charge 60ct/kilometer for travel.",
      };

  const categories = [
    {
      title: t.animals.dogsTitle,
      text: t.animals.dogsText,
      image: IMAGES.dogs,
      imageAlt: "Dog photography",
    },
    {
      title: t.animals.horsesTitle,
      text: t.animals.horsesText,
      image: IMAGES.horses,
      imageAlt: "Horse photography",
    },
    {
      title: t.animals.otherTitle,
      text: t.animals.otherText,
      image: IMAGES.cats,
      imageAlt: "Pet photography",
    },
  ];

  const galleryImages = [
    { src: IMAGES.dogs, alt: "Dog photography 1" },
    { src: IMAGES.horses, alt: "Horse photography" },
    { src: IMAGES.cats, alt: "Cat photography" },
    { src: IMAGES.hero, alt: "Animal photography" },
    { src: IMAGES.dogs, alt: "Dog photography 2" },
    { src: IMAGES.horses, alt: "Horse photography 2" },
  ];

  return (
    <>
      <SEO
        title={seo.title}
        description={seo.description}
        canonical="/tierfotografie"
        keywords={seo.keywords}
        lang={lang}
        ogImage={IMAGES.hero}
      />

      {/* Hero */}
      <ParallaxHero
        imageSrc={IMAGES.hero}
        imageAlt="Professionelle Tierfotografie – Hundeportrait Outdoor in Tirol"
        preTitle={t.animals.heroTitle}
        title={t.animals.heroSubtitle}
      />

      {/* Intro */}
      <section className="py-20 md:py-28 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <SectionReveal>
            <p
              className="text-black/55 text-[1rem] md:text-[1.1rem]"
              style={{ lineHeight: 1.9, fontWeight: 300 }}
            >
              {t.animals.intro}
            </p>
          </SectionReveal>
        </div>
      </section>

      {/* Packages Section */}
      <section className="py-24 md:py-32 bg-[#f8f7f5] px-4">
        <div className="max-w-5xl mx-auto">
          <SectionReveal>
            <h2
              className="text-center mb-16"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(2rem, 4vw, 3rem)",
                fontWeight: 300,
              }}
            >
              {lang === "de" ? "Meine Pakete" : "My Packages"}
            </h2>
          </SectionReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Studio Package */}
            <SectionReveal>
              <div className="bg-white border border-black/10 overflow-hidden h-full flex flex-col">
                <div className="aspect-[4/3] overflow-hidden">
                  <ImageWithFallback
                    src={IMAGES.dogs}
                    alt="Studio Tierfotografie"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-8 flex flex-col flex-1">
                  <p
                    className="text-[0.7rem] tracking-[0.2em] uppercase text-black/40 mb-3"
                    style={{ fontWeight: 400 }}
                  >
                    STUDIO
                  </p>
                  <h3
                    className="mb-2"
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "1.5rem",
                      fontWeight: 600,
                      lineHeight: 1.2,
                    }}
                  >
                    {studioPackage.title}
                  </h3>
                  <p
                    className="mb-6"
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "2.2rem",
                      fontWeight: 600,
                      lineHeight: 1.1,
                    }}
                  >
                    {studioPackage.price}
                  </p>
                  <div className="flex flex-col gap-3 flex-1">
                    {studioPackage.features.map((feature, fi) => (
                      <div key={fi} className="flex gap-2">
                        <Check size={14} className="text-black/30 mt-1 shrink-0" />
                        <span
                          className="text-black/60 text-[0.85rem]"
                          style={{ lineHeight: 1.5, fontWeight: 300 }}
                        >
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p
                    className="text-black/40 text-[0.78rem] mt-6 pt-4 border-t border-black/5"
                    style={{ lineHeight: 1.6, fontWeight: 300, fontStyle: "italic" }}
                  >
                    {studioPackage.note}
                  </p>
                </div>
              </div>
            </SectionReveal>

            {/* Outdoor Package */}
            <SectionReveal delay={0.15}>
              <div className="bg-white border border-black h-full flex flex-col overflow-hidden">
                <div className="aspect-[4/3] overflow-hidden">
                  <ImageWithFallback
                    src={IMAGES.horses}
                    alt="Outdoor Tierfotografie"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-8 flex flex-col flex-1">
                  <p
                    className="text-[0.7rem] tracking-[0.2em] uppercase text-black/40 mb-3"
                    style={{ fontWeight: 400 }}
                  >
                    OUTDOOR
                  </p>
                  <h3
                    className="mb-2"
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "1.5rem",
                      fontWeight: 600,
                      lineHeight: 1.2,
                    }}
                  >
                    {outdoorPackage.title}
                  </h3>
                  <p
                    className="mb-6"
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "2.2rem",
                      fontWeight: 600,
                      lineHeight: 1.1,
                    }}
                  >
                    {outdoorPackage.price}
                  </p>
                  <div className="flex flex-col gap-3 flex-1">
                    {outdoorPackage.features.map((feature, fi) => (
                      <div key={fi} className="flex gap-2">
                        <Check size={14} className="text-black/30 mt-1 shrink-0" />
                        <span
                          className="text-black/60 text-[0.85rem]"
                          style={{ lineHeight: 1.5, fontWeight: 300 }}
                        >
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p
                    className="text-black/40 text-[0.78rem] mt-6 pt-4 border-t border-black/5"
                    style={{ lineHeight: 1.6, fontWeight: 300, fontStyle: "italic" }}
                  >
                    {outdoorPackage.note}
                  </p>
                </div>
              </div>
            </SectionReveal>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.map((cat, i) => (
        <section
          key={cat.title}
          className={`py-24 md:py-32 px-4 ${i % 2 === 0 ? "" : "bg-[#f8f7f5]"}`}
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
                    className="text-black/55 text-[0.9rem]"
                    style={{ lineHeight: 1.8, fontWeight: 300 }}
                  >
                    {cat.text}
                  </p>
                </div>
              </SectionReveal>
              <SectionReveal delay={0.2}>
                <div className={i % 2 === 1 ? "lg:order-1" : ""}>
                  <ImageWithFallback
                    src={cat.image}
                    alt={cat.imageAlt}
                    className="w-full aspect-[4/3] object-cover"
                  />
                </div>
              </SectionReveal>
            </div>
          </div>
        </section>
      ))}

      {/* GET INSPIRED Gallery with Lightbox */}
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
              <SectionReveal key={i} delay={i * 0.08}>
                <div
                  className="mb-3 md:mb-4 break-inside-avoid overflow-hidden group cursor-pointer"
                  onClick={() => openLightbox(i)}
                >
                  <ImageWithFallback
                    src={img.src}
                    alt={img.alt}
                    className={`w-full object-cover transition-transform duration-700 group-hover:scale-105 ${
                      i % 3 === 0 ? "aspect-[3/4]" : "aspect-square"
                    }`}
                  />
                </div>
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
                  ? "\"Das Shooting mit unserem Hund war mega! Mario hat so eine ruhige Art, dass selbst unser aufgedrehter Golden Retriever total entspannt war. Die Bilder sind der Wahnsinn.\""
                  : "\"The shoot with our dog was amazing! Mario has such a calm energy that even our hyper Golden Retriever was totally relaxed. The photos are incredible.\""}
              </p>
              <p className="text-black/40 text-[0.82rem]" style={{ fontWeight: 400 }}>
                — Lisa M., {lang === "de" ? "Hundeshooting" : "Dog Shoot"} 2024
              </p>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* Tips Section */}
      <section className="py-24 md:py-32 px-4">
        <div className="max-w-5xl mx-auto">
          <SectionReveal>
            <div className="text-center mb-16">
              <p
                className="text-[0.75rem] tracking-[0.3em] uppercase text-black/40 mb-4"
                style={{ fontWeight: 400 }}
              >
                {lang === "de" ? "TIPPS" : "TIPS"}
              </p>
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "clamp(2rem, 4vw, 3rem)",
                  fontWeight: 300,
                }}
              >
                {lang === "de" ? "So bereitet ihr euch vor" : "How to prepare"}
              </h2>
            </div>
          </SectionReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {(lang === "de"
              ? [
                  { icon: Heart, title: "Geduld mitbringen", text: "Tiere brauchen Zeit, um sich wohlzufühlen. Plant genug Puffer ein – Stress ist der größte Feind guter Bilder." },
                  { icon: Leaf, title: "Lieblingsort wählen", text: "Wo fühlt sich euer Tier am wohlsten? Der Lieblingspark, der Wald oder euer Garten – das merkt man an den Bildern." },
                  { icon: Sun, title: "Goldene Stunde", text: "Das beste Licht gibt es morgens oder abends. Ich empfehle Shootings 1–2 Stunden vor Sonnenuntergang." },
                  { icon: CameraIcon, title: "Leckerlis nicht vergessen", text: "Kleine Belohnungen sorgen für Aufmerksamkeit und glückliche Gesichter – euer Tier wird es lieben." },
                ]
              : [
                  { icon: Heart, title: "Be patient", text: "Animals need time to feel comfortable. Plan enough buffer – stress is the enemy of great photos." },
                  { icon: Leaf, title: "Choose favorite spot", text: "Where does your pet feel most at home? The favorite park, forest or your garden – it shows in the photos." },
                  { icon: Sun, title: "Golden hour", text: "The best light is in the morning or evening. I recommend shoots 1–2 hours before sunset." },
                  { icon: CameraIcon, title: "Don't forget treats", text: "Small rewards ensure attention and happy faces – your pet will love it." },
                ]
            ).map((tip, i) => (
              <SectionReveal key={tip.title} delay={i * 0.1}>
                <div className="text-center">
                  <div className="w-14 h-14 mx-auto mb-5 border border-black/10 flex items-center justify-center">
                    <tip.icon size={20} className="text-black/35" />
                  </div>
                  <h3
                    className="mb-2"
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "1.2rem",
                      fontWeight: 600,
                    }}
                  >
                    {tip.title}
                  </h3>
                  <p className="text-black/50 text-[0.82rem]" style={{ lineHeight: 1.7, fontWeight: 300 }}>
                    {tip.text}
                  </p>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Animal FAQ */}
      <section className="py-24 md:py-32 bg-[#f8f7f5] px-4">
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
                  { q: "Mein Tier ist sehr unruhig – geht das trotzdem?", a: "Klar! Ich bin sehr geduldig und habe Erfahrung mit allen Temperamenten. Wir lassen uns Zeit, und oft entstehen die besten Bilder gerade aus der Energie heraus." },
                  { q: "Kann ich auch mit auf die Bilder?", a: "Ja, sehr gerne! Mensch-Tier-Shootings sind sogar besonders schön, weil sie die Verbindung zwischen euch zeigen." },
                  { q: "Wie lange dauert ein Shooting?", a: "Im Studio ca. 30 Minuten, Outdoor ca. 1 Stunde. Aber es gibt keinen Zeitdruck – wir machen so lange, bis alles perfekt ist." },
                  { q: "Wo findet das Shooting statt?", a: "Entweder im hellen Tageslichtstudio in Innsbruck oder an eurem Wunschort: Wald, Wiese, Berge, euer Zuhause – ihr entscheidet." },
                ]
              : [
                  { q: "My pet is very restless – is that okay?", a: "Of course! I'm very patient and experienced with all temperaments. We take our time, and often the best photos come from that energy." },
                  { q: "Can I be in the photos too?", a: "Yes, absolutely! Human-animal shoots are especially beautiful because they show the bond between you." },
                  { q: "How long does a shoot take?", a: "In the studio about 30 minutes, outdoor about 1 hour. But there's no time pressure – we continue until everything is perfect." },
                  { q: "Where does the shoot take place?", a: "Either in the bright daylight studio in Innsbruck or at your desired location: forest, meadow, mountains, your home – you decide." },
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
              {t.animals.ctaTitle}
            </h2>
            <p
              className="text-white/50 text-[0.9rem] mb-10"
              style={{ lineHeight: 1.8, fontWeight: 300 }}
            >
              {t.animals.ctaText}
            </p>
            <button
              onClick={() => openContact("animal")}
              className="inline-flex items-center gap-2 text-white border border-white/40 px-8 py-3 text-[0.8rem] tracking-[0.15em] uppercase bg-transparent cursor-pointer hover:bg-white hover:text-black transition-all duration-300"
              style={{ fontWeight: 400 }}
            >
              {t.animals.ctaButton}
              <ArrowRight size={14} />
            </button>
          </SectionReveal>
        </div>
      </section>
    </>
  );
}