import { usePageContent } from "../storyblok";
import { getFAQsByCategories, PAGE_FAQ_CATEGORIES } from "../faqData";
import { GoogleReviewsGrid } from "../GoogleReviews";
import { useLanguage } from "../LanguageContext";
import { Camera, Film, Heart, Mail, Phone, MapPin, Clock, Users, Award, Video } from "lucide-react";
import { SectionReveal } from "../SectionReveal";
import { SEO } from "../SEO";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { useContactModal } from "../ContactModal";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { FAQSection } from "../FAQSection";

const HERO_VIDEO = "https://ik.imagekit.io/r2yqrg6np/Madeira%20Clip%20fu%CC%88r%20Webseite.mp4?updatedAt=1773024774420";

const IMAGES = {
  portrait: "https://ik.imagekit.io/r2yqrg6np/68e54c497a9dde9d00252dcb_WhatsApp%20Image%202025-09-16%20at%2022.32.17.avif",
  landscape: "https://images.unsplash.com/photo-1598108717314-363db712d358?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudGFpbiUyMGxhbmRzY2FwZSUyMGF1c3RyaWElMjBhbHBzfGVufDF8fHx8MTc3Mjk5NTc5NXww&ixlib=rb-4.1.0&q=80&w=1080",
  marioAction: "https://ik.imagekit.io/r2yqrg6np/6966a461e78df6320fd2fd1e_20251019_Hundeshooting-3528_(WebRes).jpg",
};

export function AboutPage() {
  const { t, lang } = useLanguage();
  const { openContact } = useContactModal();
  const { getText } = usePageContent("about", lang);

  const seo = lang === "de"
    ? {
        title: "Ueber mich - Fotograf Mario Schubert | Innsbruck, Tirol & Bayern",
        description: "Lernt Mario Schubert kennen - euren Hochzeitsfotografen und Tierfotografen aus Innsbruck. Authentische, zeitlose Fotografie in Tirol, Bayern und darueber hinaus.",
        keywords: "Fotograf Innsbruck, Mario Schubert, Hochzeitsfotograf Tirol, Fotograf Bayern, Photographer Innsbruck, Tierfotograf Muenchen",
      }
    : {
        title: "About Me - Photographer Mario Schubert | Innsbruck, Tyrol & Bavaria",
        description: "Meet Mario Schubert - your wedding and animal photographer from Innsbruck. Authentic, timeless photography in Tyrol, Bavaria and beyond.",
        keywords: "photographer Innsbruck, Mario Schubert, wedding photographer Tyrol, photographer Bavaria, photographer Munich, animal photographer Alps",
      };

  const philosophyItems = [
    { icon: Camera, title: getText("philosophy1", t.about.philosophy1), text: getText("philosophy1_text", t.about.philosophy1Text) },
    { icon: Film, title: getText("philosophy2", t.about.philosophy2), text: getText("philosophy2_text", t.about.philosophy2Text) },
    { icon: Heart, title: getText("philosophy3", t.about.philosophy3), text: getText("philosophy3_text", t.about.philosophy3Text) },
  ];

  const content = lang === "de"
    ? {
        expectTitle: "Das erwartet Euch",
        expectText1: "Mein Ziel ist es, eure Geschichte so zu erzählen, wie sie wirklich ist: ehrlich, lebendig und voller Emotion. Kein steifes Posing, kein künstliches Lächeln – sondern echte Momente, die ihr so erlebt habt.",
        expectText2: "Jede Hochzeit, jedes Shooting ist einzigartig – und genauso behandle ich es auch. Ich nehme mir Zeit, euch kennenzulernen, eure Wünsche zu verstehen und eine vertrauensvolle Atmosphäre zu schaffen.",
        expectText3: "Mein Stil vereint natürliches Licht mit einem Hauch Editorial: ungezwungen, cineastisch und zeitlos. Eure Bilder sollen Erinnerungen sein, die euch auch in 20 Jahren noch genauso berühren wie am ersten Tag.",
        tagline: "natürlich. zeitlos. authentisch.",
        taglineBold: "FOTOGRAFIE",
        taglineDesc: "Bei der dokumentarischen Begleitung sind Posen und gestellte Aufnahmen ein absolutes No-Go. Mein Fokus liegt darauf, die echten Emotionen und natürlichen Momente festzuhalten.",
        // Stats
        statsTitle: "In Zahlen",
        stat1Num: "76+",
        stat1Label: "Hochzeiten begleitet",
        stat2Num: "420+",
        stat2Label: "Zufriedene Kunden",
        stat3Num: "11+",
        stat3Label: "Jahre Erfahrung",
        stat4Num: "140+",
        stat4Label: "Videos produziert",
        // Mario in Action section
        passionTitle: "Mehr als nur Hochzeiten",
        passionText1: "Neben Hochzeiten ist die Tierfotografie meine zweite große Leidenschaft. Ob im Studio oder in freier Natur – ich bringe die Persönlichkeit eures Vierbeiners in Bildern zum Ausdruck, die euch ein Leben lang begleiten.",
        passionText2: "Was mich antreibt? Die Freude in den Augen meiner Kunden, wenn sie ihre Bilder zum ersten Mal sehen. Jedes Shooting ist für mich eine neue Geschichte, die darauf wartet, erzählt zu werden.",
        passionCta: "Tierfotos entdecken",
        // Testimonials
        testimonialsTitle: "Was meine Kunden sagen",
        testimonials: [
          {
            text: "Mario hat unsere Hochzeit so eingefangen, wie wir sie erlebt haben – echt, emotional und wunderschön. Wir schauen uns die Bilder immer wieder an und bekommen jedes Mal Gänsehaut.",
            name: "Sarah & Thomas",
            detail: "Hochzeit in Innsbruck, 2025",
          },
          {
            text: "Das Shooting mit unserem Hund war mega! Mario hat so eine ruhige Art, dass selbst unser aufgedrehter Golden Retriever total entspannt war. Die Bilder sind der Wahnsinn.",
            name: "Lisa M.",
            detail: "Hundeshooting, 2024",
          },
          {
            text: "Wir hatten ein Familienshooting mit unseren drei Kindern – ich dachte, das wird Chaos. Aber Mario hat aus dem Chaos die schönsten Momente gezaubert. Absolut empfehlenswert!",
            name: "Familie Berger",
            detail: "Familienshooting, 2025",
          },
        ],
        // FAQ
        faqTitle: "Häufig gestellte Fragen",
        faqs: [
          {
            q: "Wie weit im Voraus soll ich buchen?",
            a: "Für Hochzeiten empfehle ich mindestens 6–12 Monate im Voraus zu buchen, da beliebte Termine schnell vergeben sind. Für andere Shootings reichen meist 2–4 Wochen.",
          },
          {
            q: "In welchem Gebiet bist du unterwegs?",
            a: "Meine Homebase ist Innsbruck, Tirol. Innerhalb von 20 km fallen keine Anfahrtskosten an. Darüber hinaus begleite ich euch gerne in ganz Tirol, Bayern, Salzburg und auch weiter – Destination Shootings sind kein Problem!",
          },
          {
            q: "Wann bekommen wir unsere Bilder?",
            a: "In der Regel erhaltet ihr eure fertig bearbeiteten Bilder innerhalb von 4–6 Wochen. Bei Hochzeiten bekommt ihr vorab ein paar Sneak Peeks innerhalb weniger Tage.",
          },
          {
            q: "Bietest du auch Videografie an?",
            a: "Ja! Neben Fotografie biete ich auch Hochzeitsvideografie an. Es gibt Kombi-Pakete aus Foto und Video, die preislich sehr attraktiv sind. Fragt einfach an!",
          },
          {
            q: "Was ist, wenn das Wetter schlecht ist?",
            a: "Kein Problem! Manche der schönsten Bilder entstehen bei Regen, Nebel oder dramatischen Wolken. Und falls ihr ein Outdoor-Shooting plant, finden wir gemeinsam einen Ersatztermin.",
          },
        ],
        // Contact
        contactPre: "KONTAKT",
        contactTitle: "Lass uns reden!",
        contactText: "Zusammen erstellen wir unvergessliche Erinnerungen für euch.",
        contactCta: "Unverbindlich anfragen",
        contactOrText: "Oder direkt erreichen:",
        // CTA Banner
        ctaBannerPre: "BEREIT?",
        ctaBannerTitle: "Eure Geschichte wartet darauf, erzählt zu werden.",
        ctaBannerSub: "Schreibt mir – die Erstberatung ist kostenlos und unverbindlich.",
        ctaBannerBtn: "Jetzt Kontakt aufnehmen",
      }
    : {
        expectTitle: "What to expect",
        expectText1: "My goal is to tell your story as it really is: honest, vibrant and full of emotion. No stiff posing, no artificial smiling – but real moments as you experienced them.",
        expectText2: "Every wedding, every shoot is unique – and that's exactly how I treat it. I take time to get to know you, understand your wishes and create a trusting atmosphere.",
        expectText3: "My style combines natural light with a touch of editorial: relaxed, cinematic and timeless. Your images should be memories that touch you just as much in 20 years as they do on day one.",
        tagline: "natural. timeless. authentic.",
        taglineBold: "PHOTOGRAPHY",
        taglineDesc: "In documentary coverage, poses and staged shots are an absolute no-go. My focus is on capturing real emotions and natural moments.",
        // Stats
        statsTitle: "By the numbers",
        stat1Num: "76+",
        stat1Label: "Weddings captured",
        stat2Num: "420+",
        stat2Label: "Happy clients",
        stat3Num: "11+",
        stat3Label: "Years of experience",
        stat4Num: "140+",
        stat4Label: "Videos produced",
        // Mario in Action section
        passionTitle: "More than just weddings",
        passionText1: "Besides weddings, animal photography is my second great passion. Whether in the studio or in the wild – I bring out the personality of your four-legged friend in images that will accompany you for a lifetime.",
        passionText2: "What drives me? The joy in my clients' eyes when they see their photos for the first time. Every shoot is a new story waiting to be told.",
        passionCta: "Discover animal photos",
        // Testimonials
        testimonialsTitle: "What my clients say",
        testimonials: [
          {
            text: "Mario captured our wedding exactly as we experienced it – real, emotional and beautiful. We look at the photos again and again and get goosebumps every time.",
            name: "Sarah & Thomas",
            detail: "Wedding in Innsbruck, 2025",
          },
          {
            text: "The shoot with our dog was amazing! Mario has such a calm energy that even our hyper Golden Retriever was totally relaxed. The photos are incredible.",
            name: "Lisa M.",
            detail: "Dog Shoot, 2024",
          },
          {
            text: "We had a family shoot with our three kids – I thought it would be chaos. But Mario turned the chaos into the most beautiful moments. Absolutely recommended!",
            name: "Berger Family",
            detail: "Family Shoot, 2025",
          },
        ],
        // FAQ
        faqTitle: "Frequently Asked Questions",
        faqs: [
          {
            q: "How far in advance should I book?",
            a: "For weddings, I recommend booking at least 6–12 months in advance as popular dates fill up quickly. For other shoots, 2–4 weeks is usually enough.",
          },
          {
            q: "What area do you cover?",
            a: "My home base is Innsbruck, Tyrol. Within 20 km there are no travel costs. Beyond that, I'm happy to accompany you throughout Tyrol, Bavaria, Salzburg and further – destination shoots are no problem!",
          },
          {
            q: "When do we receive our photos?",
            a: "Typically you'll receive your fully edited images within 4–6 weeks. For weddings, you'll get a few sneak peeks within a few days.",
          },
          {
            q: "Do you also offer videography?",
            a: "Yes! Besides photography, I also offer wedding videography. There are combo packages for photo and video that are very attractively priced. Just ask!",
          },
          {
            q: "What if the weather is bad?",
            a: "No problem! Some of the most beautiful images are created in rain, fog or dramatic clouds. And if you're planning an outdoor shoot, we'll find a backup date together.",
          },
        ],
        // Contact
        contactPre: "CONTACT",
        contactTitle: "Let's talk!",
        contactText: "Together we'll create unforgettable memories for you.",
        contactCta: "Get in touch – no strings attached",
        contactOrText: "Or reach me directly:",
        // CTA Banner
        ctaBannerPre: "READY?",
        ctaBannerTitle: "Your story is waiting to be told.",
        ctaBannerSub: "Write to me – the initial consultation is free and non-binding.",
        ctaBannerBtn: "Get in touch now",
      };

  const stats = [
    { icon: Users, num: content.stat1Num, label: content.stat1Label },
    { icon: Heart, num: content.stat2Num, label: content.stat2Label },
    { icon: Clock, num: content.stat3Num, label: content.stat3Label },
    { icon: Video, num: content.stat4Num, label: content.stat4Label },
  ];

  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroTextY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <>
      <SEO
        title={seo.title}
        description={seo.description}
        canonical="/ueber-mich"
        keywords={seo.keywords}
        lang={lang}
        ogImage={IMAGES.portrait}
      />

      {/* Video Hero */}
      <section ref={heroRef} className="relative h-[40vh] min-h-[280px] md:h-[70vh] md:min-h-[500px] overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          src={HERO_VIDEO}
        />
        <motion.div
          className="relative h-full flex flex-col items-center justify-center text-center px-4"
          style={{ y: heroTextY, opacity: heroOpacity }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            <p
              className="text-white/70 text-[0.75rem] tracking-[0.3em] uppercase mb-4"
              style={{ fontWeight: 400 }}
            >
              {getText("about_title", t.about.title)}
            </p>
            <h1
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(2.5rem, 7vw, 5rem)",
                fontWeight: 300,
                lineHeight: 1,
                color: "white",
              }}
            >
              {getText("heading", t.about.heading).split("Mario")[0]}
              <span style={{ fontWeight: 700 }}>Mario</span>
            </h1>
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

      {/* What to Expect */}
      <section className="py-24 md:py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <SectionReveal>
              <div>
                <h2
                  className="mb-8"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "clamp(2rem, 4vw, 3.2rem)",
                    fontWeight: 300,
                    lineHeight: 1.1,
                  }}
                >
                  {content.expectTitle.split(" ").slice(0, -1).join(" ")}{" "}
                  <span style={{ fontWeight: 700, fontStyle: "italic" }}>
                    {content.expectTitle.split(" ").slice(-1)}
                  </span>
                </h2>
                <p className="text-black/75 text-[0.9rem] mb-5" style={{ lineHeight: 1.8, fontWeight: 300 }}>
                  {getText("text1", t.about.text1)}
                </p>
                <p className="text-black/75 text-[0.9rem] mb-5" style={{ lineHeight: 1.8, fontWeight: 300 }}>
                  {getText("text2", t.about.text2)}
                </p>
                <p className="text-black/75 text-[0.9rem] mb-8" style={{ lineHeight: 1.8, fontWeight: 300 }}>
                  {getText("text3", t.about.text3)}
                </p>
                <button
                  onClick={() => openContact()}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white text-[0.82rem] tracking-[0.08em] uppercase cursor-pointer border-none hover:bg-black/80 transition-colors"
                  style={{ fontWeight: 400 }}
                >
                  {content.contactCta}
                </button>
              </div>
            </SectionReveal>
            <SectionReveal delay={0.2}>
              <div className="relative">
                <ImageWithFallback
                  src={IMAGES.portrait}
                  alt="Fotograf Mario Schubert – Hochzeitsfotograf und Tierfotograf aus Innsbruck, Tirol"
                  className="w-full aspect-[4/5] object-cover"
                />
                <div className="absolute -bottom-4 -right-4 w-32 h-32 border border-black/10" />
              </div>
            </SectionReveal>
          </div>
        </div>
      </section>

      {/* Stats / Social Proof Numbers */}
      <section className="py-16 md:py-20 bg-black text-white px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
            {stats.map((stat, i) => (
              <SectionReveal key={stat.label} delay={i * 0.1}>
                <div className="text-center">
                  <stat.icon size={22} className="mx-auto mb-3 text-white/40" />
                  <p
                    className="mb-1"
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "clamp(2rem, 4vw, 3rem)",
                      fontWeight: 300,
                      lineHeight: 1,
                    }}
                  >
                    {stat.num}
                  </p>
                  <p className="text-white/50 text-[0.78rem] tracking-wider uppercase" style={{ fontWeight: 300 }}>
                    {stat.label}
                  </p>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Mario in Action – Portrait Image + Text Side-by-Side */}
      <section className="py-24 md:py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <SectionReveal delay={0.1}>
              <div className="flex justify-center lg:justify-start">
                <div className="relative max-w-[380px] w-full">
                  <ImageWithFallback
                    src={IMAGES.marioAction}
                    alt="Mario Schubert bei einem Hundeshooting in Aktion – Tierfotograf Innsbruck"
                    className="w-full aspect-[3/4] object-cover"
                  />
                  {/* Decorative frame */}
                  <div className="absolute -top-3 -left-3 w-full h-full border border-black/10 -z-10" />
                </div>
              </div>
            </SectionReveal>
            <SectionReveal delay={0.2}>
              <div>
                <p
                  className="text-[0.75rem] tracking-[0.3em] uppercase text-black/55 mb-4"
                  style={{ fontWeight: 400 }}
                >
                  {lang === "de" ? "LEIDENSCHAFT" : "PASSION"}
                </p>
                <h2
                  className="mb-8"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
                    fontWeight: 300,
                    lineHeight: 1.15,
                  }}
                >
                  {content.passionTitle}
                </h2>
                <p className="text-black/75 text-[0.9rem] mb-5" style={{ lineHeight: 1.8, fontWeight: 300 }}>
                  {content.passionText1}
                </p>
                <p className="text-black/75 text-[0.9rem] mb-8" style={{ lineHeight: 1.8, fontWeight: 300 }}>
                  {content.passionText2}
                </p>
                <a
                  href="/tierfotografie"
                  className="inline-flex items-center gap-2 text-[0.82rem] tracking-[0.08em] uppercase text-black no-underline border-b border-black/30 pb-1 hover:border-black transition-colors"
                  style={{ fontWeight: 400 }}
                >
                  {content.passionCta} →
                </a>
              </div>
            </SectionReveal>
          </div>
        </div>
      </section>

      {/* Tagline Section */}
      <section className="py-20 md:py-28 bg-[#f8f7f5] px-4">
        <div className="max-w-4xl mx-auto">
          <SectionReveal>
            <div className="text-center mb-8">
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "clamp(1.8rem, 4vw, 3rem)",
                  fontWeight: 300,
                  lineHeight: 1.3,
                }}
              >
                {content.tagline.split(".").filter(Boolean).map((word, i) => (
                  <span key={i}>{word.trim()}. </span>
                ))}
                <br />
                <span style={{ fontWeight: 700, letterSpacing: "0.05em" }}>
                  {content.taglineBold}
                </span>
              </h2>
            </div>
            <p
              className="text-black/65 text-[0.88rem] text-center max-w-2xl mx-auto"
              style={{ lineHeight: 1.7, fontWeight: 300 }}
            >
              {content.taglineDesc}
            </p>
          </SectionReveal>
        </div>
      </section>

      {/* Philosophy / Work Approach */}
      <section className="py-24 md:py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <SectionReveal>
            <h2
              className="text-center mb-16"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(2rem, 4vw, 3rem)",
                fontWeight: 300,
              }}
            >
              {getText("philosophy_title", t.about.philosophyTitle)}
            </h2>
          </SectionReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {philosophyItems.map((item, i) => (
              <SectionReveal key={item.title} delay={i * 0.15}>
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-6 border border-black/10 flex items-center justify-center">
                    <item.icon size={24} className="text-black/55" />
                  </div>
                  <h3
                    className="mb-3"
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "1.4rem",
                      fontWeight: 600,
                    }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className="text-black/65 text-[0.85rem]"
                    style={{ lineHeight: 1.7, fontWeight: 300 }}
                  >
                    {item.text}
                  </p>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <GoogleReviewsGrid
        count={3}
        title={content.testimonialsTitle}
      />

      {/* FAQ Section */}
      <FAQSection
        categories={getFAQsByCategories(PAGE_FAQ_CATEGORIES.about)}
        title={{ de: "Häufig gestellte Fragen", en: "Frequently Asked Questions" }}
      />

      {/* Contact Section */}
      <section className="py-24 md:py-32 bg-[#f8f7f5] px-4">
        <div className="max-w-4xl mx-auto">
          <SectionReveal>
            <div className="text-center mb-4">
              <p
                className="text-[0.75rem] tracking-[0.3em] uppercase text-black/40 mb-4"
                style={{ fontWeight: 400 }}
              >
                {content.contactPre}
              </p>
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "clamp(2rem, 4vw, 3rem)",
                  fontWeight: 300,
                  marginBottom: "1rem",
                }}
              >
                {content.contactTitle}
              </h2>
              <p
                className="text-black/50 text-[0.9rem] mb-8"
                style={{ lineHeight: 1.8, fontWeight: 300 }}
              >
                {content.contactText}
              </p>

              {/* Primary CTA */}
              <button
                onClick={() => openContact()}
                className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white text-[0.82rem] tracking-[0.1em] uppercase cursor-pointer border-none hover:bg-black/80 transition-colors mb-10"
                style={{ fontWeight: 400 }}
              >
                {content.contactCta}
              </button>

              <p
                className="text-black/50 text-[0.78rem] mb-6 tracking-wider uppercase"
                style={{ fontWeight: 300 }}
              >
                {content.contactOrText}
              </p>
            </div>
          </SectionReveal>

          <SectionReveal delay={0.15}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:servus@marioschub.com"
                className="flex items-center justify-center gap-3 px-8 py-4 border border-black/10 hover:border-black/40 transition-all no-underline text-black group"
              >
                <Mail size={18} className="text-black/40 group-hover:text-black transition-colors" />
                <span className="text-[0.85rem]" style={{ fontWeight: 400 }}>E-Mail</span>
              </a>
              <a
                href="tel:+4915155338029"
                className="flex items-center justify-center gap-3 px-8 py-4 border border-black/10 hover:border-black/40 transition-all no-underline text-black group"
              >
                <Phone size={18} className="text-black/40 group-hover:text-black transition-colors" />
                <span className="text-[0.85rem]" style={{ fontWeight: 400 }}>
                  {lang === "de" ? "Telefon" : "Phone"}
                </span>
              </a>
              <a
                href="https://wa.me/4915155338029"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 px-8 py-4 border border-black/10 hover:border-black/40 transition-all no-underline text-black group"
              >
                <svg
                  className="text-black/40 group-hover:text-black transition-colors"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <span className="text-[0.85rem]" style={{ fontWeight: 400 }}>WhatsApp</span>
              </a>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="py-20 md:py-28 bg-black text-white px-4">
        <div className="max-w-5xl mx-auto text-center">
          <SectionReveal>
            <p
              className="text-white/40 text-[0.75rem] tracking-[0.3em] uppercase mb-5"
              style={{ fontWeight: 400 }}
            >
              {content.ctaBannerPre}
            </p>
            <h2
              className="mb-4"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(1.8rem, 4vw, 3rem)",
                fontWeight: 300,
                lineHeight: 1.2,
                letterSpacing: "0.02em",
              }}
            >
              {content.ctaBannerTitle}
            </h2>
            <p
              className="text-white/50 text-[0.88rem] mb-10"
              style={{ lineHeight: 1.7, fontWeight: 300 }}
            >
              {content.ctaBannerSub}
            </p>
            <button
              onClick={() => openContact()}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black text-[0.82rem] tracking-[0.1em] uppercase cursor-pointer border-none hover:bg-white/90 transition-colors"
              style={{ fontWeight: 400 }}
            >
              {content.ctaBannerBtn}
            </button>
          </SectionReveal>
        </div>
      </section>
    </>
  );
}