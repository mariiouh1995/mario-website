import { useState, useEffect } from "react";

/**
 * Hook to fetch dynamic packages from Google Sheets via Vercel serverless function.
 *
 * Includes localStorage caching (1 hour) as fallback, and falls back
 * to hardcoded defaults if the API is unavailable.
 */

// ── Types ──
export interface PackageData {
  name: string;
  price: string;
  subtitle: string;
  subtitleEn: string;
  features: string[];
  featuresEn: string[];
  highlight: boolean;
}

export interface AddOnData {
  textDe: string;
  textEn: string;
}

interface PackagesResponse {
  weddingPhoto: PackageData[];
  weddingVideo: PackageData[];
  weddingAddons: AddOnData[];
  portrait: PackageData[];
  animals: PackageData[];
  fetchedAt: string;
  source: "sheets" | "fallback";
}

interface PackagesState {
  data: PackagesResponse | null;
  loading: boolean;
  error: string | null;
}

const CACHE_KEY = "marioschub_packages";
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in ms

// ── Hardcoded fallback data (matches current website content) ──
const FALLBACK_DATA: PackagesResponse = {
  weddingPhoto: [
    {
      name: "STANDESAMT",
      price: "890\u20AC",
      subtitle: "(Freitag bis Montag)",
      subtitleEn: "(Friday to Monday)",
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
      highlight: false,
    },
    {
      name: "ESSENTIAL",
      price: "ab 2.090\u20AC",
      subtitle: "Hier geht\u2019s los!",
      subtitleEn: "Let\u2019s go!",
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
      highlight: false,
    },
    {
      name: "SIGNATURE",
      price: "ab 2.590\u20AC",
      subtitle: "Der Klassiker.",
      subtitleEn: "The classic.",
      features: ["8h Reportage", "600+ bearbeitete Bilder", "20 Bilder binnen 48h"],
      featuresEn: ["8h reportage", "600+ edited images", "20 images within 48h"],
      highlight: true,
    },
    {
      name: "SIGNATURE PLUS+",
      price: "ab 3.190\u20AC",
      subtitle: "F\u00FCr Paare, die \u201Ealles wollen\u201C.",
      subtitleEn: "For couples who want it all.",
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
      highlight: false,
    },
  ],
  weddingVideo: [
    {
      name: "CLIP",
      price: "1.000\u20AC",
      subtitle: "H\u00E4lt die wichtigsten Stationen eurer Hochzeit fest",
      subtitleEn: "Captures the key moments of your wedding",
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
      highlight: false,
    },
    {
      name: "VIDEO",
      price: "1.800\u20AC",
      subtitle: "Die umfassende Begleitung von eurem Hochzeitstag",
      subtitleEn: "Comprehensive coverage of your wedding day",
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
      subtitle: "Der Standard f\u00FCr Paare, die ihre Hochzeit in allen Facetten festgehalten haben m\u00F6chten",
      subtitleEn: "The standard for couples who want every facet captured",
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
      highlight: false,
    },
  ],
  weddingAddons: [
    { textDe: "After-Wedding-Shooting (ca. 3h, 80 Bilder): 520\u20AC", textEn: "After-wedding shooting (approx. 3h, 80 images): 520\u20AC" },
    { textDe: "Mini-Video: 400\u20AC", textEn: "Mini video: 400\u20AC" },
    { textDe: "Probe-Shooting: 200\u20AC", textEn: "Trial shooting: 200\u20AC" },
    { textDe: "Drohnenaufnahmen, 10 Bilder: 200\u20AC", textEn: "Drone shots, 10 images: 200\u20AC" },
    { textDe: "Plotter: 50\u20AC", textEn: "Plotter: 50\u20AC" },
  ],
  portrait: [
    {
      name: "MINI",
      price: "190\u20AC",
      subtitle: "Perfekt f\u00FCr ein schnelles Shooting",
      subtitleEn: "Perfect for a quick shoot",
      features: ["ca. 30 Min. Shooting", "10 bearbeitete Bilder", "Online-Galerie", "1 Location"],
      featuresEn: ["approx. 30 min shoot", "10 edited images", "Online gallery", "1 location"],
      highlight: false,
    },
    {
      name: "CLASSIC",
      price: "ab 350\u20AC",
      subtitle: "Der Allrounder",
      subtitleEn: "The all-rounder",
      features: [
        "ca. 1 Stunde Shooting",
        "25 bearbeitete Bilder",
        "Online-Galerie",
        "bis zu 2 Locations",
        "Outfitwechsel m\u00F6glich",
      ],
      featuresEn: [
        "approx. 1 hour shoot",
        "25 edited images",
        "Online gallery",
        "up to 2 locations",
        "Outfit change possible",
      ],
      highlight: true,
    },
    {
      name: "PREMIUM",
      price: "ab 550\u20AC",
      subtitle: "F\u00FCr besondere Anl\u00E4sse",
      subtitleEn: "For special occasions",
      features: [
        "ca. 2 Stunden Shooting",
        "50+ bearbeitete Bilder",
        "Online-Galerie",
        "Mehrere Locations",
        "Outfitwechsel inklusive",
        "10 Sneak Peeks binnen 48h",
      ],
      featuresEn: [
        "approx. 2 hour shoot",
        "50+ edited images",
        "Online gallery",
        "Multiple locations",
        "Outfit changes included",
        "10 sneak peeks within 48h",
      ],
      highlight: false,
    },
  ],
  animals: [],
  fetchedAt: new Date().toISOString(),
  source: "fallback",
};

function getCachedData(): PackagesResponse | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_DURATION) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

function setCachedData(data: PackagesResponse) {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ data, timestamp: Date.now() })
    );
  } catch {
    // localStorage might be full or unavailable
  }
}

export function usePackages(): PackagesState & { packages: PackagesResponse } {
  const [state, setState] = useState<PackagesState>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    // Check cache first
    const cached = getCachedData();
    if (cached) {
      setState({ data: cached, loading: false, error: null });
      return;
    }

    let cancelled = false;

    async function fetchPackages() {
      try {
        const response = await fetch("/api/get-packages");
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data: PackagesResponse = await response.json();

        if (!cancelled) {
          setCachedData(data);
          setState({ data, loading: false, error: null });
        }
      } catch (err: any) {
        console.warn("Failed to fetch packages from API, using fallback:", err.message);
        if (!cancelled) {
          setState({
            data: null,
            loading: false,
            error: err.message,
          });
        }
      }
    }

    fetchPackages();

    return () => {
      cancelled = true;
    };
  }, []);

  // Always return usable data – either from API or fallback
  return {
    ...state,
    packages: state.data || FALLBACK_DATA,
  };
}
