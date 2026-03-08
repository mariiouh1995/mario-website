import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * Vercel Serverless Function: Google Reviews Proxy
 *
 * Fetches reviews from Google Places API and caches them via Vercel CDN for 30 days.
 *
 * Required Environment Variables in Vercel:
 *   GOOGLE_PLACES_API_KEY  – Google Cloud API Key with Places API enabled
 *   GOOGLE_PLACE_ID        – Mario's Google Business Place ID
 *                             (Find it: https://developers.google.com/maps/documentation/places/web-service/place-id)
 *
 * Endpoint: GET /api/google-reviews
 * Cache: 30 days via Vercel CDN (s-maxage=2592000)
 *
 * To force a refresh, redeploy or use ?refresh=true (optional, remove in production)
 */

interface GoogleReview {
  author_name: string;
  rating: number;
  text: string;
  relative_time_description: string;
  time: number;
  profile_photo_url?: string;
  language?: string;
}

interface GooglePlaceResult {
  result: {
    name: string;
    rating: number;
    user_ratings_total: number;
    reviews: GoogleReview[];
  };
  status: string;
}

export interface ReviewData {
  author: string;
  rating: number;
  text: string;
  relativeTime: string;
  timestamp: number;
  photoUrl?: string;
  language?: string;
}

export interface ReviewsResponse {
  reviews: ReviewData[];
  averageRating: number;
  totalReviews: number;
  businessName: string;
  fetchedAt: string;
  source: "google" | "fallback";
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow GET
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  if (!apiKey || !placeId) {
    console.error("Missing env vars:", {
      GOOGLE_PLACES_API_KEY: apiKey ? "SET" : "MISSING",
      GOOGLE_PLACE_ID: placeId ? "SET" : "MISSING",
    });
    return res.status(500).json({
      error: "Server configuration incomplete",
      details: {
        GOOGLE_PLACES_API_KEY: apiKey ? "set" : "MISSING",
        GOOGLE_PLACE_ID: placeId ? "set" : "MISSING",
      },
      hint: "Set GOOGLE_PLACES_API_KEY and GOOGLE_PLACE_ID in Vercel Environment Variables",
    });
  }

  try {
    // Google Places API – Place Details with reviews
    // Note: The API returns max 5 reviews. For more, consider the new Places API (v1).
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,user_ratings_total,reviews&reviews_sort=newest&language=de&key=${apiKey}`;

    const response = await fetch(url);

    if (!response.ok) {
      console.error("Google Places API HTTP error:", response.status, response.statusText);
      return res.status(502).json({
        error: "Google Places API HTTP error",
        status: response.status,
        statusText: response.statusText,
      });
    }

    const data: GooglePlaceResult = await response.json();

    if (data.status !== "OK") {
      console.error("Google Places API error:", data.status, JSON.stringify(data));
      return res.status(502).json({
        error: "Google Places API error",
        googleStatus: data.status,
        hint: data.status === "REQUEST_DENIED"
          ? "API key is invalid or Places API is not enabled in Google Cloud Console"
          : data.status === "INVALID_REQUEST"
          ? "Check GOOGLE_PLACE_ID – it may be incorrect"
          : data.status === "OVER_QUERY_LIMIT"
          ? "API quota exceeded – check billing in Google Cloud Console"
          : "Check Google Places API documentation for this status code",
      });
    }

    const reviews: ReviewData[] = (data.result.reviews || []).map((r) => ({
      author: r.author_name,
      rating: r.rating,
      text: r.text,
      relativeTime: r.relative_time_description,
      timestamp: r.time,
      photoUrl: r.profile_photo_url,
      language: r.language,
    }));

    const payload: ReviewsResponse = {
      reviews,
      averageRating: data.result.rating,
      totalReviews: data.result.user_ratings_total,
      businessName: data.result.name,
      fetchedAt: new Date().toISOString(),
      source: "google",
    };

    // Cache for 30 days on Vercel CDN, allow stale for 7 more days while revalidating
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=2592000, stale-while-revalidate=604800"
    );
    res.setHeader("Content-Type", "application/json");

    return res.status(200).json(payload);
  } catch (error) {
    console.error("Failed to fetch Google reviews:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}