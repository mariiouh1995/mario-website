import { useState, useEffect } from "react";
import { useLanguage } from "./LanguageContext";

export interface GoogleReview {
  author: string;
  rating: number;
  text: string;
  textEn: string;
}

export interface GoogleReviewsData {
  reviews: GoogleReview[];
  averageRating: number;
  totalReviews: number;
  fetchedAt: string;
  source: "sheets" | "fallback";
}

const CACHE_KEY = "marioschub_google_reviews";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes (matches API cache)

// Fallback reviews – used when API is not available
const FALLBACK_DATA: GoogleReviewsData = {
  reviews: [
    {
      author: "Sarah & Thomas",
      rating: 5,
      text: "Mario hat unsere Hochzeit so eingefangen, wie wir sie erlebt haben – echt, emotional und wunderschön. Wir schauen uns die Bilder immer wieder an und bekommen jedes Mal Gänsehaut.",
      textEn: "Mario captured our wedding exactly as we experienced it – authentic, emotional and beautiful. We look at the photos again and again and get goosebumps every time.",
    },
    {
      author: "Julia & Markus",
      rating: 5,
      text: "Wir hatten eine kleine Berghochzeit und Mario hat jeden Moment perfekt festgehalten. Er war so unauffällig, dass wir oft vergessen haben, dass er da war – und das merkt man an den Bildern.",
      textEn: "We had a small mountain wedding and Mario captured every moment perfectly. He was so unobtrusive that we often forgot he was there – and you can see it in the photos.",
    },
    {
      author: "Lisa M.",
      rating: 5,
      text: "Das Shooting mit unserem Hund war mega! Mario hat so eine ruhige Art, dass selbst unser aufgedrehter Golden Retriever total entspannt war. Die Bilder sind der Wahnsinn.",
      textEn: "The shoot with our dog was amazing! Mario has such a calm manner that even our hyper Golden Retriever was totally relaxed. The photos are incredible.",
    },
    {
      author: "Anna & Florian",
      rating: 5,
      text: "Das Kombi-Paket aus Foto und Video war die beste Entscheidung! Der Film bringt uns jedes Mal zum Weinen – im besten Sinne.",
      textEn: "The photo and video combo package was the best decision! The film makes us cry every time – in the best way.",
    },
    {
      author: "Familie Berger",
      rating: 5,
      text: "Wir hatten ein Familienshooting mit unseren drei Kindern – ich dachte, das wird Chaos. Aber Mario hat aus dem Chaos die schönsten Momente gezaubert. Absolut empfehlenswert!",
      textEn: "We had a family shoot with our three kids – I thought it would be chaos. But Mario created the most beautiful moments out of the chaos. Absolutely recommended!",
    },
  ],
  averageRating: 5.0,
  totalReviews: 5,
  fetchedAt: new Date().toISOString(),
  source: "fallback",
};

function getCachedReviews(): GoogleReviewsData | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const parsed = JSON.parse(cached);
    const fetchedAt = new Date(parsed.fetchedAt).getTime();

    if (Date.now() - fetchedAt < CACHE_DURATION) {
      return parsed;
    }

    localStorage.removeItem(CACHE_KEY);
    return null;
  } catch {
    return null;
  }
}

function setCachedReviews(data: GoogleReviewsData): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // localStorage full or unavailable – ignore
  }
}

/**
 * Hook to fetch Reviews from Google Sheets.
 *
 * Flow:
 * 1. Check localStorage cache (5 min)
 * 2. If no cache, fetch from /api/google-reviews (reads "Reviews" tab)
 * 3. If API fails, fall back to hardcoded reviews
 */
export function useGoogleReviews(filterMinRating = 4) {
  const [data, setData] = useState<GoogleReviewsData>(FALLBACK_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchReviews() {
      // 1. Check localStorage cache
      const cached = getCachedReviews();
      if (cached) {
        if (!cancelled) {
          setData(cached);
          setLoading(false);
        }
        return;
      }

      // 2. Fetch from API
      try {
        const res = await fetch("/api/google-reviews");

        if (!res.ok) {
          throw new Error(`API returned ${res.status}`);
        }

        const json: GoogleReviewsData = await res.json();

        if (json.reviews && json.reviews.length > 0) {
          setCachedReviews(json);

          if (!cancelled) {
            setData(json);
            setLoading(false);
          }
          return;
        }
      } catch (err) {
        console.info(
          "Reviews API not available, using fallback reviews.",
          err
        );
        if (!cancelled) {
          setError("API not available");
        }
      }

      // 3. Fall back to hardcoded reviews
      if (!cancelled) {
        setData(FALLBACK_DATA);
        setLoading(false);
      }
    }

    fetchReviews();

    return () => {
      cancelled = true;
    };
  }, []);

  // Filter by minimum rating
  const filteredReviews = data.reviews.filter(
    (r) => r.rating >= filterMinRating
  );

  return {
    reviews: filteredReviews,
    allReviews: data.reviews,
    averageRating: data.averageRating,
    totalReviews: data.totalReviews,
    source: data.source,
    loading,
    error,
  };
}
