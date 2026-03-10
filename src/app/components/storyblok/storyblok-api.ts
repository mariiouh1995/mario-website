/**
 * Storyblok Content Delivery API helper.
 *
 * Uses the REST API directly (no SDK dependency for data fetching),
 * so it works with or without the full @storyblok/react bridge.
 *
 * Includes localStorage caching (5 min) and graceful fallback.
 */

import { STORYBLOK_TOKEN, isStoryblokConfigured, getContentVersion } from "./storyblok-init";

const API_BASE = "https://api.storyblok.com/v2/cdn";
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes (reduced API calls to avoid rate limits)

interface StoryblokResponse<T = any> {
  stories: Array<{
    name: string;
    slug: string;
    full_slug: string;
    content: T;
    uuid: string;
    created_at: string;
    published_at: string;
  }>;
  cv: number;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

/**
 * Fetch a single URL with retry logic for 429 rate limits.
 */
async function fetchWithRetry(url: string, retries = 3, baseDelay = 1000): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const response = await fetch(url);

    if (response.status === 429 && attempt < retries) {
      // Exponential backoff: 1s, 2s, 4s
      const delay = baseDelay * Math.pow(2, attempt);
      console.warn(`[Storyblok] Rate limited (429), retrying in ${delay}ms… (attempt ${attempt + 1}/${retries})`);
      await new Promise((r) => setTimeout(r, delay));
      continue;
    }

    return response;
  }

  // Should not reach here, but just in case
  return fetch(url);
}

/**
 * Fetch stories from a Storyblok folder.
 *
 * @param startsWith  Folder path, e.g. "packages/" or "gallery/"
 * @param cacheKey    localStorage cache key
 * @param perPage     Number of items per page (max 100)
 */
export async function fetchStoryblokStories<T = any>(
  startsWith: string,
  cacheKey: string,
  perPage = 100
): Promise<StoryblokResponse<T>["stories"] | null> {
  if (!isStoryblokConfigured()) return null;

  // Check localStorage cache
  const cached = getCache<StoryblokResponse<T>["stories"]>(cacheKey);
  if (cached) return cached;

  try {
    const version = getContentVersion();
    const url = new URL(`${API_BASE}/stories`);
    url.searchParams.set("token", STORYBLOK_TOKEN);
    url.searchParams.set("version", version);
    url.searchParams.set("starts_with", startsWith);
    url.searchParams.set("per_page", String(perPage));
    url.searchParams.set("sort_by", "content.sort_order:asc");

    const response = await fetchWithRetry(url.toString());

    if (!response.ok) {
      throw new Error(`Storyblok API returned ${response.status}`);
    }

    const json: StoryblokResponse<T> = await response.json();

    // Handle pagination sequentially with delay to avoid rate limits
    const total = parseInt(response.headers.get("Total") || "0", 10);
    let allStories = [...json.stories];

    if (total > perPage) {
      const pages = Math.ceil(total / perPage);

      for (let page = 2; page <= pages; page++) {
        // Small delay between requests to stay under rate limit (5 req/s)
        if (page > 2) {
          await new Promise((r) => setTimeout(r, 250));
        }

        const pageUrl = new URL(url.toString());
        pageUrl.searchParams.set("page", String(page));
        const res = await fetchWithRetry(pageUrl.toString());

        if (res.ok) {
          const pageJson: StoryblokResponse<T> = await res.json();
          allStories = [...allStories, ...pageJson.stories];
        }
      }
    }

    // Cache the result
    setCache(cacheKey, allStories);

    return allStories;
  } catch (err) {
    console.warn(`[Storyblok] Failed to fetch "${startsWith}":`, err);
    return null;
  }
}

/**
 * Fetch a single story by slug.
 */
export async function fetchStoryblokStory<T = any>(
  slug: string,
  cacheKey: string
): Promise<{ content: T; name: string } | null> {
  if (!isStoryblokConfigured()) return null;

  const cached = getCache<{ content: T; name: string }>(cacheKey);
  if (cached) return cached;

  try {
    const version = getContentVersion();
    const url = `${API_BASE}/stories/${slug}?token=${STORYBLOK_TOKEN}&version=${version}`;
    const response = await fetchWithRetry(url);

    if (!response.ok) {
      throw new Error(`Storyblok API returned ${response.status}`);
    }

    const json = await response.json();
    const result = { content: json.story.content as T, name: json.story.name };

    setCache(cacheKey, result);
    return result;
  } catch (err) {
    console.warn(`[Storyblok] Failed to fetch story "${slug}":`, err);
    return null;
  }
}

// ── localStorage cache helpers ──

function getCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(`sb_${key}`);
    if (!raw) return null;

    const entry: CacheEntry<T> = JSON.parse(raw);
    if (Date.now() - entry.timestamp > CACHE_DURATION) {
      localStorage.removeItem(`sb_${key}`);
      return null;
    }

    return entry.data;
  } catch {
    return null;
  }
}

function setCache<T>(key: string, data: T): void {
  try {
    const entry: CacheEntry<T> = { data, timestamp: Date.now() };
    localStorage.setItem(`sb_${key}`, JSON.stringify(entry));
  } catch {
    // localStorage full or unavailable
  }
}

/**
 * Clear all Storyblok caches from localStorage.
 * Useful for admin/debug.
 */
export function clearStoryblokCache(): void {
  const keys = Object.keys(localStorage).filter((k) => k.startsWith("sb_"));
  keys.forEach((k) => localStorage.removeItem(k));
  console.info(`[Storyblok] Cleared ${keys.length} cache entries`);
}