import { useState, useEffect } from "react";
import { fetchStoryblokStories } from "./storyblok/storyblok-api";
import { isStoryblokConfigured } from "./storyblok/storyblok-init";

/**
 * Hook to fetch dynamic packages.
 *
 * Priority:
 * 1. localStorage cache (1 hour)
 * 2. Storyblok CMS (if configured via VITE_STORYBLOK_TOKEN)
 * 3. Google Sheets API (legacy fallback via /api/get-packages)
 * 4. Hardcoded fallback data
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
  source: "sheets" | "fallback" | "storyblok";
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
      name: "ESSENTIAL",
      price: "ab 2.090€",
      subtitle: "Für kleinere Hochzeiten & ruhigere Feiern.",
      subtitleEn: "For smaller weddings & quieter celebrations.",
      features: [
        "6 Stunden fotografische Begleitung",
        "400 vollständig bearbeitete Bilder",
        "72h bis zur Sneak Peak (20 Bilder)",
        "Private Nutzungsrechte & Download-Galerie",
        "Anfahrt im Umkreis von 20 km (um Innsbruck) inklusive",
        "Zusatzstunde je 320€",
      ],
      featuresEn: [
        "6 hours of photography coverage",
        "400 fully edited images",
        "72h to sneak peek (20 images)",
        "Private usage rights & download gallery",
        "Travel within 20 km (around Innsbruck) included",
        "Additional hour: 320€ each",
      ],
      highlight: false,
    },
    {
      name: "SIGNATURE",
      price: "ab 2.590€",
      subtitle: "Alle wichtigen Momente.",
      subtitleEn: "All the important moments.",
      features: [
        "8 Stunden fotografische Begleitung",
        "600 vollständig bearbeitete Bilder",
        "48h bis zur Sneak Peak (20 Bilder)",
        "Private Nutzungsrechte & Download-Galerie",
        "Anfahrt im Umkreis von 30 km (um Innsbruck) inklusive",
        "Zusatzstunde je 300€",
      ],
      featuresEn: [
        "8 hours of photography coverage",
        "600 fully edited images",
        "48h to sneak peek (20 images)",
        "Private usage rights & download gallery",
        "Travel within 30 km (around Innsbruck) included",
        "Additional hour: 300€ each",
      ],
      highlight: true,
    },
    {
      name: "SIGNATURE PLUS+",
      price: "ab 3.290€",
      subtitle: "Foto, Video & Entertainment.",
      subtitleEn: "Photo, video & entertainment.",
      features: [
        "8 Stunden fotografische Begleitung",
        "700 vollständig bearbeitete Bilder",
        "Highlight-Video (90–120 Sek)",
        "dasSpieglein – Fotospiegel",
        "Zusatzstunde je 300€",
        "Ersparnis gegenüber Einzelbuchung: ca. 400 €",
      ],
      featuresEn: [
        "8 hours of photography coverage",
        "700 fully edited images",
        "Highlight video (90–120 sec)",
        "dasSpieglein – photo mirror",
        "Additional hour: 300€ each",
        "Savings vs. individual booking: approx. 400€",
      ],
      highlight: false,
    },
    {
      name: "CLASSIC",
      price: "ab 3.090€",
      subtitle: "Mehr Zeit, mehr Momente.",
      subtitleEn: "More time, more moments.",
      features: [
        "10 Stunden fotografische Begleitung",
        "700 vollständig bearbeitete Bilder",
        "48h bis zur Sneak Peak (25 Bilder)",
        "Private Nutzungsrechte & Download-Galerie",
        "Anfahrt im Umkreis von 30 km (um Innsbruck) inklusive",
        "Zusatzstunde je 290€",
      ],
      featuresEn: [
        "10 hours of photography coverage",
        "700 fully edited images",
        "48h to sneak peek (25 images)",
        "Private usage rights & download gallery",
        "Travel within 30 km (around Innsbruck) included",
        "Additional hour: 290€ each",
      ],
      highlight: false,
    },
    {
      name: "COMPLETE",
      price: "ab 3.490€",
      subtitle: "Von Früh bis Spät.",
      subtitleEn: "From dawn to dusk.",
      features: [
        "12 Stunden fotografische Begleitung",
        "900 vollständig bearbeitete Bilder",
        "48h bis zur Sneak Peak (30 Bilder)",
        "Private Nutzungsrechte & Download-Galerie",
        "Anfahrt im Umkreis von 50 km (um Innsbruck) inklusive",
        "Zusatzstunde je 250€",
      ],
      featuresEn: [
        "12 hours of photography coverage",
        "900 fully edited images",
        "48h to sneak peek (30 images)",
        "Private usage rights & download gallery",
        "Travel within 50 km (around Innsbruck) included",
        "Additional hour: 250€ each",
      ],
      highlight: false,
    },
  ],
  weddingVideo: [
    {
      name: "ESSENTIAL VIDEO",
      price: "ab 1.500€",
      subtitle: "Die wichtigsten Momente.",
      subtitleEn: "The most important moments.",
      features: [
        "6 Stunden videografische Begleitung",
        "2–3 Minuten Videolänge (Hoch- oder Querformat)",
        "FULL-HD Qualität",
        "1 Musiktitel eurer Wahl",
        "Farbkorrektur & professioneller Schnitt",
        "Anfahrt im Umkreis von 20 km inklusive",
        "Zusatzstunde je 200€",
      ],
      featuresEn: [
        "6 hours of videography coverage",
        "2–3 minute video (portrait or landscape format)",
        "FULL-HD quality",
        "1 music track of your choice",
        "Color correction & professional editing",
        "Travel within 20 km included",
        "Additional hour: 200€ each",
      ],
      highlight: false,
    },
    {
      name: "SIGNATURE VIDEO",
      price: "ab 2.350€",
      subtitle: "Die umfassende Videobegleitung.",
      subtitleEn: "Comprehensive video coverage.",
      features: [
        "8 Stunden videografische Begleitung",
        "5–7 Min. Cinematischer Film (Querformat)",
        "4K Ultra-HD Aufnahmen",
        "4 Songs eurer Wahl",
        "Drohnenaufnahmen eurer Location",
        "Anfahrt im Umkreis von 50 km inklusive",
        "Zusatzstunde je 200€",
        "Optional: Ton (Stimmen, Reden, Atmosphäre)",
      ],
      featuresEn: [
        "8 hours of videography coverage",
        "5–7 min cinematic film (landscape format)",
        "4K Ultra-HD footage",
        "4 songs of your choice",
        "Drone footage of your location",
        "Travel within 50 km included",
        "Additional hour: 200€ each",
        "Optional: audio (voices, speeches, atmosphere)",
      ],
      highlight: true,
    },
    {
      name: "COMPLETE VIDEO",
      price: "ab 2.900€",
      subtitle: "Die umfassende Videobegleitung.",
      subtitleEn: "The comprehensive video coverage.",
      features: [
        "10–12 Stunden videografische Begleitung",
        "8–10 Min. Cinematischer Film (Querformat)",
        "4K Ultra-HD Aufnahmen",
        "6 Songs eurer Wahl",
        "Umfangreiche Drohnenaufnahmen eurer Location",
        "Anfahrt im Umkreis von 50 km inklusive",
        "Zusatzstunde je 200€",
        "Optional: Gesprochene Worte, Reden oder Gelübde im Film",
      ],
      featuresEn: [
        "10–12 hours of videography coverage",
        "8–10 min cinematic film (landscape format)",
        "4K Ultra-HD footage",
        "6 songs of your choice",
        "Extensive drone footage of your location",
        "Travel within 50 km included",
        "Additional hour: 200€ each",
        "Optional: spoken words, speeches or vows in the film",
      ],
      highlight: false,
    },
  ],
  weddingAddons: [
    { textDe: "After-Wedding-Shooting (ca. 3h, 80 Bilder): 520€", textEn: "After-wedding shooting (approx. 3h, 80 images): 520€" },
    { textDe: "Mini-Video: 400€", textEn: "Mini video: 400€" },
    { textDe: "Probe-Shooting: 200€", textEn: "Trial shooting: 200€" },
    { textDe: "Drohnenaufnahmen, 10 Bilder: 200€", textEn: "Drone shots, 10 images: 200€" },
    { textDe: "Plotter: 50€", textEn: "Plotter: 50€" },
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
        // Priority 1: Storyblok CMS
        if (isStoryblokConfigured()) {
          const sbData = await fetchPackagesFromStoryblok();
          if (sbData && !cancelled) {
            setCachedData(sbData);
            setState({ data: sbData, loading: false, error: null });
            return;
          }
        }

        // Priority 2: Google Sheets API (legacy)
        const response = await fetch("/api/get-packages");
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data: PackagesResponse = await response.json();

        if (!cancelled) {
          setCachedData(data);
          setState({ data, loading: false, error: null });
        }
      } catch (err: any) {
        console.warn("Failed to fetch packages, using fallback:", err.message);
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

// ── Storyblok data mapper ──

interface StoryblokPackageContent {
  name: string;
  price: string;
  subtitle: string;
  subtitle_en: string;
  features: string; // newline-separated
  features_en: string; // newline-separated
  highlight: boolean;
  category: string; // "wedding-photo" | "wedding-video" | "portrait" | "animals"
  sort_order: number;
}

interface StoryblokAddonContent {
  text_de: string;
  text_en: string;
  sort_order: number;
}

async function fetchPackagesFromStoryblok(): Promise<PackagesResponse | null> {
  try {
    const [packageStories, addonStories] = await Promise.all([
      fetchStoryblokStories<StoryblokPackageContent>("packages/", "packages"),
      fetchStoryblokStories<StoryblokAddonContent>("addons/", "addons"),
    ]);

    if (!packageStories || packageStories.length === 0) return null;

    const weddingPhoto: PackageData[] = [];
    const weddingVideo: PackageData[] = [];
    const portrait: PackageData[] = [];
    const animals: PackageData[] = [];

    for (const story of packageStories) {
      const c = story.content;
      const pkg: PackageData = {
        name: c.name || story.name,
        price: c.price || "",
        subtitle: c.subtitle || "",
        subtitleEn: c.subtitle_en || c.subtitle || "",
        features: (c.features || "").split("\n").filter(Boolean),
        featuresEn: (c.features_en || "").split("\n").filter(Boolean),
        highlight: !!c.highlight,
      };

      switch (c.category) {
        case "wedding-photo":
          weddingPhoto.push(pkg);
          break;
        case "wedding-video":
          weddingVideo.push(pkg);
          break;
        case "portrait":
          portrait.push(pkg);
          break;
        case "animals":
          animals.push(pkg);
          break;
      }
    }

    const weddingAddons: AddOnData[] = (addonStories || []).map((s) => ({
      textDe: s.content.text_de || "",
      textEn: s.content.text_en || "",
    }));

    return {
      weddingPhoto,
      weddingVideo,
      weddingAddons,
      portrait,
      animals,
      fetchedAt: new Date().toISOString(),
      source: "storyblok",
    };
  } catch (err) {
    console.warn("[Storyblok] Failed to map package data:", err);
    return null;
  }
}