import type { ReactNode } from "react";
import { ArrowRight, Check, Frame, Images, Printer, Sparkles, Wand2 } from "lucide-react";
import { SEO } from "../SEO";
import { useLanguage } from "../LanguageContext";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { useContactModal } from "../ContactModal";

const HERO_IMAGE = "https://cdn.prod.website-files.com/67d45717a7cd9b02a896c0bb/67d70ecbbdc39846b09a8825_0W9A1828.jpg";
const DETAIL_IMAGE = "https://cdn.prod.website-files.com/67d45717a7cd9b02a896c0bb/67d70ecb452edbfb7573540f_0W9A1835.jpg";
const FRAME_IMAGE = "https://cdn.prod.website-files.com/67d45717a7cd9b02a896c0bb/67d70ecb9a541f31a772b946_0W9A1851.jpg";

const packages = [
  { name: "Basic", price: "490 EUR", text: "Fotospiegel bis 23:00 Uhr, Sofortdrucke, Onlinegalerie, individuelles Screen- und Drucklayout, LED- oder Goldrahmen." },
  { name: "Hochzeit", price: "690 EUR", text: "Open-end, ca. 400 Sofortdrucke, individuelles Design, Onlinegalerie und Abbau am Folgetag." },
  { name: "Kombi", price: "450 EUR", text: "Nur in Kombination mit meiner Fotografie buchbar. Die Buchungsdauer entspricht der Dauer der Fotobegleitung." },
  { name: "Business", price: "640 EUR", text: "Für Firmenfeiern, Branding, Firmenlogo/CI, Animation und Onlinegalerie." },
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
              Für Hochzeit, Party und Business.
            </h2>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            {packages.map((pkg) => (
              <article key={pkg.name} className="bg-white border border-black/10 p-5">
                <Sparkles className="w-5 h-5 text-black/40 mb-5" />
                <h3 className="text-xl font-semibold">{pkg.name}</h3>
                <p className="mt-3 text-lg">{pkg.price}</p>
                <p className="mt-4 text-sm text-black/60 leading-relaxed">{pkg.text}</p>
              </article>
            ))}
          </div>
          <p className="mt-5 text-xs text-black/45">Anfahrt in und um Innsbruck inklusive, ab 20 km 0,60 EUR/km. Individuelle Pakete auf Anfrage.</p>
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
    </>
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
