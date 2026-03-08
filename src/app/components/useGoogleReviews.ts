import { useState, useEffect } from "react";

export interface GoogleReview {
  author: string;
  rating: number;
  text: string;
  relativeTime: string;
  timestamp: number;
  photoUrl?: string;
  language?: string;
}

export interface GoogleReviewsData {
  reviews: GoogleReview[];
  averageRating: number;
  totalReviews: number;
  businessName: string;
  fetchedAt: string;
  source: "google" | "fallback";
}

const CACHE_KEY = "marioschub_google_reviews";
const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days in ms

// Fallback reviews – used when API is not yet configured or fails
// These are placeholders until real Google reviews are connected
const FALLBACK_DATA: GoogleReviewsData = {
  reviews: [
    {
      author: "Sarah & Thomas",
      rating: 5,
      text: "Mario hat unsere Hochzeit so eingefangen, wie wir sie erlebt haben – echt, emotional und wunderschön. Wir schauen uns die Bilder immer wieder an und bekommen jedes Mal Gänsehaut.",
      relativeTime: "vor 3 Monaten",
      timestamp: Date.now() / 1000 - 90 * 86400,
    },
    {
      author: "Julia & Markus",
      rating: 5,
      text: "Wir hatten eine kleine Berghochzeit und Mario hat jeden Moment perfekt festgehalten. Er war so unauffällig, dass wir oft vergessen haben, dass er da war – und das merkt man an den Bildern.",
      relativeTime: "vor 5 Monaten",
      timestamp: Date.now() / 1000 - 150 * 86400,
    },
    {
      author: "Lisa M.",
      rating: 5,
      text: "Das Shooting mit unserem Hund war mega! Mario hat so eine ruhige Art, dass selbst unser aufgedrehter Golden Retriever total entspannt war. Die Bilder sind der Wahnsinn.",
      relativeTime: "vor 4 Monaten",
      timestamp: Date.now() / 1000 - 120 * 86400,
    },
    {
      author: "Anna & Florian",
      rating: 5,
      text: "Das Kombi-Paket aus Foto und Video war die beste Entscheidung! Der Film bringt uns jedes Mal zum Weinen – im besten Sinne.",
      relativeTime: "vor 2 Monaten",
      timestamp: Date.now() / 1000 - 60 * 86400,
    },
    {
      author: "Familie Berger",
      rating: 5,
      text: "Wir hatten ein Familienshooting mit unseren drei Kindern – ich dachte, das wird Chaos. Aber Mario hat aus dem Chaos die schönsten Momente gezaubert. Absolut empfehlenswert!",
      relativeTime: "vor 6 Monaten",
      timestamp: Date.now() / 1000 - 180 * 86400,
    },
  ],
  averageRating: 5.0,
  totalReviews: 5,
  businessName: "Mario Schubert Fotografie",
  fetchedAt: new Date().toISOString(),
  source: "fallback",
};

function getCachedReviews(): GoogleReviewsData | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const parsed = JSON.parse(cached);
    const fetchedAt = new Date(parsed.fetchedAt).getTime();

    // Check if cache is still valid (30 days)
    if (Date.now() - fetchedAt < CACHE_DURATION) {
      return parsed;
    }

    // Cache expired
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
 * Hook to fetch Google Reviews.
 *
 * Flow:
 * 1. Check localStorage cache (30 days)
 * 2. If no cache, fetch from /api/google-reviews (Vercel serverless function)
 * 3. If API fails (not configured yet), fall back to hardcoded reviews
 *
 * @param filterMinRating - Only return reviews with this minimum rating (default: 4)
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
          // Cache in localStorage
          setCachedReviews(json);

          if (!cancelled) {
            setData(json);
            setLoading(false);
          }
          return;
        }
      } catch (err) {
        // API not available or not configured – expected during development
        console.info(
          "Google Reviews API not available, using fallback reviews.",
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
    businessName: data.businessName,
    source: data.source,
    loading,
    error,
  };
}
