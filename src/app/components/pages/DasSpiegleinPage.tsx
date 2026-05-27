import type { ReactNode } from "react";
import { ArrowRight, Check, Frame, Images, Printer, Sparkles, Wand2 } from "lucide-react";
import { SEO } from "../SEO";
import { useLanguage } from "../LanguageContext";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { useContactModal } from "../ContactModal";

const HERO_IMAGE = "https://www.dasspieglein.com/images/WhatsApp-Image-2025-10-14-at-02.11.18.jpeg";
const DETAIL_IMAGE = "https://www.dasspieglein.com/images/WhatsApp-Image-2025-10-13-at-21.55.22.jpeg";
const FRAME_IMAGE = "https://cdn.prod.website-files.com/67098b5beaec4e7a5a355c74/68ed4eceb551a7a7d9a53d35_dfad6ae5-f61c-4cb8-9e32-724ce88c92c6.jpg";

const PRINT_IMAGES = [
  "https://www.dasspieglein.com/images/8543e13e-dc66-4ae6-944a-64acd522ad06.jpg",
  "https://www.dasspieglein.com/images/5415d7b4-aaeb-4c0b-adfb-8acfec8cd4e9.jpg",
  "https://www.dasspieglein.com/images/05b3d232-4ce6-4a12-bbdf-ad184a833ce0.jpg",
  "https://www.dasspieglein.com/images/WhatsApp-Image-2025-10-14-at-00.37.13.jpeg",
  "https://www.dasspieglein.com/images/WhatsApp-Image-2025-10-14-at-00.11.00.jpeg",
  "https://www.dasspieglein.com/images/WhatsApp-Image-2025-10-14-at-00.42.16.jpeg",
  "https://www.dasspieglein.com/images/WhatsApp-Image-2025-10-14-at-00.41.09.jpeg",
];

const packages = [
  {
    name: "Kombi Buchung",
    price: "450 EUR",
    label: "das Spieglein mit Foto- oder Videobuchung",
    text: "Der Vorteilspreis, wenn ihr bei mir auch eure Hochzeitsbegleitung mit Foto oder Video gebucht habt.",
  },
  {
    name: "Solobuchung",
    price: "890 EUR",
    label: "das Spieglein alleine",
    text: "Perfekt, wenn ihr nur das Spieglein für eure Hochzeit, Party oder euer Event buchen möchtet.",
  },
];

const inclusions = [
  "Rundum-Service mit Aufbau, Abbau und kurzer Einführung",
  "Sofortdrucke als 10x15 cm Foto oder Filmstreifen",
  "Alle Bilder digital in einer Onlinegalerie",
  "Individuelles Begrüßungsbild und Drucklayout",
  "LED- oder Goldrahmen passend zu eurem Stil",
  "Requisiten wie Hüte, Brillen und Schilder",
];

export function DasSpiegleinPage() {
  const { lang } = useLanguage();
  const { openContact } = useContactModal();

  return (
    <>
      <SEO
        title="das Spieglein | Fotospiegel für Hochzeiten & Events"
        description="das Spieglein ist mein Fotospiegel für Hochzeiten, Partys und Business-Events: Sofortdruck, Onlinegalerie, Requisiten, individuelle Designs und Rundum-Service."
        canonical="/das-spieglein"
        keywords="das Spieglein, Fotospiegel Hochzeit, Fotobox Innsbruck, Magic Mirror Hochzeit, Fotobox Tirol"
        lang={lang}
        ogImage={HERO_IMAGE}
      />

      <section className="relative min-h-[68vh] overflow-hidden bg-black text-white">
        <ImageWithFallback src={HERO_IMAGE} alt="das Spieglein Fotospiegel" className="absolute inset-0 w-full h-full object-cover opacity-70" />
        <div className="absolute inset-0 bg-black/35" />
        <div className="relative max-w-7xl mx-auto px-4 py-28 md:py-40">
          <p className="text-white/70 text-[0.75rem] tracking-[0.3em] uppercase mb-5">das Spieglein</p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(3rem, 8vw, 6.5rem)", fontWeight: 300, lineHeight: 0.95 }}>
            Die Fotobox<br />mit Wow-Faktor.
          </h1>
          <p className="mt-7 max-w-2xl text-white/75 leading-relaxed">
            Ein interaktiver Fotospiegel für Hochzeiten, Partys und Events: Gäste tippen, posen, lachen, drucken ihr Foto direkt aus und bekommen die Bilder später digital.
          </p>
        </div>
      </section>

      <section className="px-4 py-20 md:py-28 bg-[#f8f7f5]">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[0.9fr_1.1fr] gap-12 lg:gap-20 items-center">
          <div>
            <p className="text-[0.75rem] tracking-[0.3em] uppercase text-black/45 mb-4">Alles aus einer Hand</p>
            <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "clamp(2rem, 4vw, 3.5rem)", fontWeight: 700, lineHeight: 1.05 }}>
              Ohne Stress. Mit richtig viel Gaudi.
            </h2>
            <p className="mt-6 text-black/65 leading-relaxed">
              Ich bringe Fotospiegel, Zubehör und Requisiten mit. Das Design wird auf euren Anlass angepasst, der Aufbau läuft unkompliziert und eure Gäste können ihre Lieblingsmomente direkt mitnehmen.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Info icon={<Printer className="w-5 h-5" />} title="Sofortdruck" text="Foto machen, lachen und direkt als Ausdruck mitnehmen." />
            <Info icon={<Images className="w-5 h-5" />} title="Digitale Galerie" text="Alle Bilder stehen nach dem Event digital zur Verfügung." />
            <Info icon={<Wand2 className="w-5 h-5" />} title="Individuelles Design" text="Begrüßungsbildschirm und Drucklayout passend zu euch." />
            <Info icon={<Frame className="w-5 h-5" />} title="LED oder Gold" text="Ihr wählt den Rahmen, der zum Look eures Events passt." />
          </div>
        </div>
      </section>

      <section className="px-4 py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <ImageWithFallback src={DETAIL_IMAGE} alt="das Spieglein im Einsatz" className="w-full aspect-[4/5] object-cover" />
          <div>
            <p className="text-[0.75rem] tracking-[0.3em] uppercase text-black/45 mb-4">Immer inklusive</p>
            <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: 700, lineHeight: 1.05 }}>
              Alles, was Gäste wirklich nutzen.
            </h2>
            <div className="mt-7 grid gap-3">
              {inclusions.map((item) => (
                <div key={item} className="flex items-start gap-3 border border-black/8 bg-[#faf8f5] px-4 py-3">
                  <Check className="w-4 h-4 mt-0.5 text-black/55" />
                  <p className="text-sm text-black/65">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-20 md:py-28 bg-[#f8f7f5]">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mb-10">
            <p className="text-[0.75rem] tracking-[0.3em] uppercase text-black/45 mb-4">Pakete</p>
            <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "clamp(2rem, 4vw, 3.5rem)", fontWeight: 700, lineHeight: 1.05 }}>
              Zwei Pakete. Gleiche Leistung. Fair nach Buchung.
            </h2>
            <p className="mt-5 text-black/60 leading-relaxed">
              Beide Pakete enthalten Sofortdrucke, Onlinegalerie, Requisiten, individuelles Screen- und Drucklayout, Aufbau und Abbau. Günstiger wird es, wenn ich sowieso schon mit Foto oder Video bei euch vor Ort bin.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {packages.map((pkg) => (
              <article key={pkg.name} className="bg-white border border-black/10 p-5">
                <Sparkles className="w-5 h-5 text-black/40 mb-5" />
                <h3 className="text-xl font-semibold">{pkg.name}</h3>
                <p className="mt-2 text-sm text-black/45">{pkg.label}</p>
                <p className="mt-5 text-3xl font-semibold">{pkg.price}</p>
                <p className="mt-4 text-sm text-black/60 leading-relaxed">{pkg.text}</p>
                <div className="mt-5 grid gap-2 text-sm text-black/65">
                  {inclusions.slice(1, 6).map((item) => (
                    <p key={item} className="flex items-start gap-2"><Check className="w-4 h-4 mt-0.5 text-black/40" /> {item}</p>
                  ))}
                </div>
              </article>
            ))}
          </div>
          <p className="mt-5 text-xs text-black/45">Anfahrt in und um Innsbruck inklusive, ab 20 km 0,60 EUR/km. Individuelle Pakete auf Anfrage.</p>
        </div>
      </section>

      <section className="px-4 py-20 md:py-28 bg-[#f8f7f5] text-[#1f1b17] overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[1fr_0.9fr] gap-10 lg:gap-16 items-center">
          <div className="grid grid-cols-2 gap-4 h-[520px] md:h-[640px] overflow-hidden order-2 lg:order-1">
            <MarqueeColumn images={PRINT_IMAGES} />
            <MarqueeColumn images={[...PRINT_IMAGES].reverse()} reverse />
          </div>
          <div className="order-1 lg:order-2">
            <p className="text-black/45 text-[0.75rem] tracking-[0.3em] uppercase mb-4">Fotoausdrucke</p>
            <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "clamp(2rem, 4vw, 3.5rem)", fontWeight: 700, lineHeight: 1.05 }}>
              So individuell wie eure Party.
            </h2>
            <p className="mt-6 text-black/65 leading-relaxed">
              Die Ausdrucke gestalte ich passend zu euch: clean, verspielt, elegant oder mit Namen, Datum und Farben eurer Hochzeit. Eure Gäste nehmen direkt etwas mit, das nicht nach Standard-Fotobox aussieht.
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 py-20 md:py-28 bg-[#11100f] text-white">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[1fr_0.9fr] gap-10 lg:gap-16 items-center">
          <div>
            <p className="text-white/45 text-[0.75rem] tracking-[0.3em] uppercase mb-4">Kombi mit Hochzeitsreportage</p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2.5rem, 6vw, 5rem)", fontWeight: 300, lineHeight: 1 }}>
              Ich bringe die Kamera. Das Spieglein bringt die Party.
            </h2>
            <p className="mt-6 text-white/65 leading-relaxed">
              Besonders entspannt wird es, wenn Fotografie und Fotospiegel gemeinsam geplant werden. Dann passt der Ablauf zusammen und ihr habt Reportage, spontane Gästebilder und gedruckte Erinnerungen aus einer Hand.
            </p>
            <button onClick={openContact} className="mt-8 inline-flex items-center gap-2 border border-white px-8 py-3 text-[0.8rem] tracking-[0.15em] uppercase hover:bg-white hover:text-black transition-colors">
              Spieglein anfragen <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <ImageWithFallback src={FRAME_IMAGE} alt="das Spieglein Rahmen" className="w-full aspect-[4/5] object-cover" />
        </div>
      </section>

      <style>{`
        @keyframes spiegleinMarqueeUp {
          from { transform: translateY(0); }
          to { transform: translateY(-50%); }
        }
        @keyframes spiegleinMarqueeDown {
          from { transform: translateY(-50%); }
          to { transform: translateY(0); }
        }
        .spieglein-marquee-up {
          animation: spiegleinMarqueeUp 22s linear infinite;
        }
        .spieglein-marquee-down {
          animation: spiegleinMarqueeDown 24s linear infinite;
        }
      `}</style>
    </>
  );
}

function MarqueeColumn({ images, reverse = false }: { images: string[]; reverse?: boolean }) {
  const stack = [...images, ...images, ...images];
  return (
    <div className="relative overflow-hidden">
      <div className={`grid gap-4 ${reverse ? "spieglein-marquee-down" : "spieglein-marquee-up"}`}>
        {stack.map((image, index) => (
          <ImageWithFallback
            key={`${image}-${index}`}
            src={image}
            alt="Individuelles das Spieglein Foto- und Drucklayout"
            className="w-full aspect-[3/4] object-cover rounded-xl shadow-2xl shadow-black/20 bg-white/10"
          />
        ))}
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#f8f7f5] to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#f8f7f5] to-transparent" />
    </div>
  );
}

function Info({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <article className="bg-white border border-black/10 p-5">
      <div className="text-black/45 mb-4">{icon}</div>
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-black/60 leading-relaxed">{text}</p>
    </article>
  );
}
