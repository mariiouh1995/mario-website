import type { ReactNode } from "react";
import { ArrowRight, CalendarDays, Globe2, Hotel, Plane, Sparkles } from "lucide-react";
import { SEO } from "../SEO";
import { useLanguage } from "../LanguageContext";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { useContactModal } from "../ContactModal";

const HERO_IMAGE = "https://ik.imagekit.io/r2yqrg6np/Wedding/Paarfotos/250830_LJ_152738_0428(LowRes).jpg?updatedAt=1773007053353";

const examples = [
  { place: "Mallorca", package: "Signature Fotografie", travel: "Reise 250 EUR", hotel: "Unterkunft 200 EUR", fee: "Blocking-Fee 500 EUR", total: "ca. 3.540 EUR" },
  { place: "Island", package: "Complete Fotografie", travel: "Reise 450 EUR", hotel: "Unterkunft 300 EUR", fee: "Blocking-Fee 800 EUR", total: "ca. 5.040 EUR" },
  { place: "Toskana", package: "Essential Fotografie", travel: "Reise 180 EUR", hotel: "Unterkunft 100 EUR", fee: "Blocking-Fee 300 EUR", total: "ca. 2.670 EUR" },
];

export function DestinationWeddingPage() {
  const { lang } = useLanguage();
  const { openContact } = useContactModal();

  return (
    <>
      <SEO
        title="Destination Wedding Fotograf | Mario Schubert Photography"
        description="Destination Wedding Fotografie und Video in Europa und weltweit, transparent kalkuliert mit Paket, Reise, Unterkunft und Blocking-Fee."
        canonical="/destination-wedding"
        keywords="Destination Wedding Fotograf, Hochzeit Mallorca Fotograf, Hochzeit Toskana Fotograf, Wedding Photographer Europe"
        lang={lang}
        ogImage={HERO_IMAGE}
      />

      <section className="relative min-h-[68vh] overflow-hidden bg-black text-white">
        <ImageWithFallback src={HERO_IMAGE} alt="Destination Wedding Fotografie" className="absolute inset-0 w-full h-full object-cover opacity-65" />
        <div className="absolute inset-0 bg-black/35" />
        <div className="relative max-w-7xl mx-auto px-4 py-28 md:py-40">
          <p className="text-white/70 text-[0.75rem] tracking-[0.3em] uppercase mb-5">Destination Wedding</p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(3rem, 8vw, 6.5rem)", fontWeight: 300, lineHeight: 0.95 }}>
            Überall dort,<br />wo eure Geschichte spielt.
          </h1>
          <p className="mt-7 max-w-2xl text-white/75 leading-relaxed">
            Ob in den Bergen, am Meer oder in einer kleinen Finca irgendwo im Süden: Ich begleite euch auch außerhalb von Tirol und Bayern mit Foto, Video und einem klaren, transparenten Reisekosten-Modell.
          </p>
        </div>
      </section>

      <section className="px-4 py-20 md:py-28 bg-[#f8f7f5]">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[0.9fr_1.1fr] gap-12 lg:gap-20">
          <div>
            <p className="text-[0.75rem] tracking-[0.3em] uppercase text-black/45 mb-4">So wird kalkuliert</p>
            <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "clamp(2rem, 4vw, 3.5rem)", fontWeight: 700, lineHeight: 1.05 }}>
              Euer Paket bleibt die Basis.
            </h2>
            <p className="mt-6 text-black/65 leading-relaxed">
              Für Destination Weddings wählt ihr zuerst ein Foto- oder Videopaket aus meiner Preisliste. Dazu kommen die tatsächlichen Reisekosten, eine Unterkunft bis maximal 100 EUR pro Nacht und eine Blocking-Fee für geblockte Reisetage.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Info icon={<Sparkles className="w-5 h-5" />} title="Paket nach Wahl" text="Essential, Signature, Classic, Complete oder Foto + Video, passend zu eurem Tag." />
            <Info icon={<Plane className="w-5 h-5" />} title="Reise transparent" text="Flug, Bahn, Auto oder Fähre werden realistisch und nachvollziehbar kalkuliert." />
            <Info icon={<Hotel className="w-5 h-5" />} title="Unterkunft" text="Wenn eine Übernachtung nötig ist, wird sie mit maximal 100 EUR pro Nacht angesetzt." />
            <Info icon={<CalendarDays className="w-5 h-5" />} title="Blocking-Fee" text="1 Nacht 300 EUR, 2 Nächte 500 EUR, 3+ Nächte 800 EUR." />
          </div>
        </div>
      </section>

      <section className="px-4 py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mb-10">
            <p className="text-[0.75rem] tracking-[0.3em] uppercase text-black/45 mb-4">Beispiele</p>
            <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "clamp(2rem, 4vw, 3.5rem)", fontWeight: 700, lineHeight: 1.05 }}>
              Damit ihr ein Gefühl für die Größenordnung bekommt.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {examples.map((example) => (
              <article key={example.place} className="border border-black/10 p-5 bg-[#faf8f5]">
                <Globe2 className="w-5 h-5 text-black/45 mb-5" />
                <h3 className="text-xl font-semibold">{example.place}</h3>
                <div className="mt-5 space-y-2 text-sm text-black/60">
                  <p>{example.package}</p>
                  <p>{example.travel}</p>
                  <p>{example.hotel}</p>
                  <p>{example.fee}</p>
                </div>
                <p className="mt-5 pt-5 border-t border-black/10 font-semibold">{example.total}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20 md:py-28 bg-[#11100f] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-white/45 text-[0.75rem] tracking-[0.3em] uppercase mb-4">Gut zu wissen</p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2.5rem, 6vw, 5rem)", fontWeight: 300, lineHeight: 1 }}>
            Ich reise in der Regel am Tag davor an und am Tag danach zurück.
          </h2>
          <p className="mt-6 text-white/65 leading-relaxed">
            So bleibt genug Puffer, damit euer Tag entspannt begleitet werden kann. Wenn ihr ein Day-After- oder After-Wedding-Shooting möchtet, lässt sich das direkt in die Reiseplanung integrieren.
          </p>
          <button onClick={openContact} className="mt-8 inline-flex items-center gap-2 border border-white px-8 py-3 text-[0.8rem] tracking-[0.15em] uppercase hover:bg-white hover:text-black transition-colors">
            Destination anfragen <ArrowRight className="w-4 h-4" />
          </button>
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
