import { Helmet } from "react-helmet-async";

/** LocalBusiness + Photographer JSON-LD for AI/Search engine optimization */
export function StructuredData() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["LocalBusiness", "Photographer", "ProfessionalService"],
        "@id": "https://www.marioschubert.com/#business",
        name: "Mario Schubert Fotografie",
        alternateName: "Mario Schubert Photography",
        description:
          "Professioneller Hochzeitsfotograf und Videograf in Innsbruck, Tirol. Spezialisiert auf zeitlose Hochzeitsreportagen, Tierfotografie, Couple Shootings und Familienfotos. Aktiv in Tirol, Bayern, München und den Alpen.",
        url: "https://www.marioschubert.com",
        logo: "https://ik.imagekit.io/r2yqrg6np/68e54b92f722d45170d60f24_Logo%20MS.svg",
        image: "https://www.marioschubert.com/og-image.jpg",
        telephone: "+43015155338029",
        email: "servus@marioschub.com",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Bäckerbühelgasse 14",
          addressLocality: "Innsbruck",
          postalCode: "6020",
          addressRegion: "Tirol",
          addressCountry: "AT",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: 47.2692,
          longitude: 11.4041,
        },
        areaServed: [
          {
            "@type": "State",
            name: "Tirol",
            containedInPlace: { "@type": "Country", name: "Austria" },
          },
          {
            "@type": "State",
            name: "Bayern",
            containedInPlace: { "@type": "Country", name: "Germany" },
          },
          { "@type": "City", name: "Innsbruck" },
          { "@type": "City", name: "München" },
          { "@type": "City", name: "Salzburg" },
          { "@type": "City", name: "Garmisch-Partenkirchen" },
          { "@type": "City", name: "Kitzbühel" },
        ],
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Fotografie & Videografie Dienstleistungen",
          itemListElement: [
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Hochzeitsfotografie",
                description:
                  "Zeitlose, authentische Hochzeitsreportagen. Dokumentarischer Stil, cineastische Bearbeitung. Pakete ab 890€.",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Hochzeitsvideografie",
                description:
                  "Emotionale Hochzeitsfilme in Full-HD und 4K. Highlight-Videos und Langfassungen. Pakete ab 1.000€.",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Tierfotografie",
                description:
                  "Professionelle Tier- und Haustierfotografie. Hunde, Pferde, Katzen. Studio ab 190€, Outdoor ab 260€.",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Couple Shooting / Paarshooting",
                description:
                  "Authentische Paarfotos für Verlobungen, Jahrestage oder einfach so. Natürlich und ungezwungen.",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Familienfotografie & Taufe",
                description:
                  "Familienmomente festgehalten: Familienportraits, Taufen, Babyshootings und besondere Anlässe.",
              },
            },
          ],
        },
        priceRange: "€€",
        currenciesAccepted: "EUR",
        paymentAccepted: "Cash, Bank Transfer",
        openingHoursSpecification: {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
          opens: "08:00",
          closes: "20:00",
        },
        sameAs: [
          "https://www.instagram.com/marioschubert",
        ],
        knowsLanguage: ["de", "en"],
        founder: {
          "@type": "Person",
          name: "Mario Schubert",
          jobTitle: "Fotograf & Videograf",
          knowsAbout: [
            "Hochzeitsfotografie",
            "Hochzeitsvideografie",
            "Tierfotografie",
            "Hundefotografie",
            "Pferdefotografie",
            "Portraitfotografie",
            "Couple Shooting",
            "Familienfotografie",
          ],
        },
      },
      {
        "@type": "WebSite",
        "@id": "https://www.marioschubert.com/#website",
        url: "https://www.marioschubert.com",
        name: "Mario Schubert Photography",
        description:
          "Hochzeitsfotograf & Videograf in Innsbruck, Tirol. Zeitlose Hochzeitsreportagen, Tierfotografie, Portraits und mehr.",
        publisher: {
          "@id": "https://www.marioschubert.com/#business",
        },
        inLanguage: ["de-AT", "en"],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "Wo ist Mario Schubert als Hochzeitsfotograf verfügbar?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Mario Schubert ist hauptsächlich in Innsbruck, Tirol und Bayern (München, Garmisch) tätig. Innerhalb von 20 km um Innsbruck fallen keine Anfahrtskosten an. Darüber hinaus berechnet er 60ct/km. Destination Weddings weltweit auf Anfrage.",
            },
          },
          {
            "@type": "Question",
            name: "Was kostet ein Hochzeitsfotograf in Innsbruck?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Hochzeitsfotografie-Pakete bei Mario Schubert starten ab 890€ (Standesamt, 3h) bis zu 3.190€ (Signature Plus+ mit 8h Begleitung, 600+ Bildern und Minivideo). Individuelle Angebote auf Anfrage.",
            },
          },
          {
            "@type": "Question",
            name: "Bietet Mario Schubert auch Tierfotografie an?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Ja! Tierfotografie im Tageslichtstudio ab 190€ (10 Bilder) oder Outdoor ab 260€ (20 Bilder). Hunde, Pferde, Katzen und weitere Tiere. Kombi-Angebote mit Besitzer möglich.",
            },
          },
          {
            "@type": "Question",
            name: "Wie ist der Stil von Mario Schubert?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Natürlich, cineastisch und zeitlos. Mario arbeitet dokumentarisch – keine gestellten Posen, sondern echte Momente. Die Bearbeitung hat einen Editorial-Look mit filmischem Touch.",
            },
          },
        ],
      },
    ],
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  );
}
