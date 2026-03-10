/**
 * Storyblok CMS Initialization
 *
 * This file initializes the Storyblok SDK for the entire app.
 * The access token should be set as an environment variable:
 *   VITE_STORYBLOK_TOKEN=your_preview_or_public_token
 *
 * In Vercel, add this as an environment variable.
 *
 * Content Types to create in Storyblok:
 *
 * 1. "package" (Content Type)
 *    - name (text)
 *    - price (text)
 *    - subtitle (text)
 *    - subtitle_en (text)
 *    - features (textarea) — one feature per line
 *    - features_en (textarea) — one feature per line
 *    - highlight (boolean)
 *    - category (single-option: wedding-photo, wedding-video, portrait, animals)
 *    - sort_order (number)
 *
 * 2. "addon" (Content Type)
 *    - text_de (text)
 *    - text_en (text)
 *    - sort_order (number)
 *
 * 3. "gallery_image" (Content Type)
 *    - page (single-option: hochzeit, tiere, portrait, home, about)
 *    - category (text) — e.g. "standesamt", "getting-ready", "paarshooting"
 *    - image_url (text) — ImageKit URL
 *    - alt_de (text)
 *    - alt_en (text)
 *    - sort_order (number)
 *
 * 4. "review" (Content Type)
 *    - author (text)
 *    - rating (number)
 *    - text (textarea)
 *    - text_en (textarea)
 *    - sort_order (number)
 *
 * 5. "faq_item" (Content Type)
 *    - question_de (text)
 *    - question_en (text)
 *    - answer_de (textarea or richtext)
 *    - answer_en (textarea or richtext)
 *    - category (single-option: allgemein, hochzeit, tierfotografie, portrait, buchung)
 *    - sort_order (number)
 *
 * 6. "page_content" (Content Type) — optional, for managing page texts
 *    - page_key (text) — e.g. "home", "weddings", "animals"
 *    - seo_title_de (text)
 *    - seo_title_en (text)
 *    - seo_description_de (textarea)
 *    - seo_description_en (textarea)
 *    - seo_keywords (text)
 *    - hero_image (text — ImageKit URL)
 *    - hero_video (text — optional video URL)
 *    - sections (blocks) — nested bloks for page sections
 *
 * Folder structure in Storyblok:
 *   /packages/     — all package stories
 *   /addons/       — all addon stories
 *   /gallery/      — all gallery image stories
 *   /reviews/      — all review stories
 *   /faqs/         — all FAQ stories
 *   /pages/        — optional page content stories
 */

import { storyblokInit, apiPlugin } from "@storyblok/react";

// Access token from environment variable
const STORYBLOK_TOKEN = import.meta.env.VITE_STORYBLOK_TOKEN || "";

// Detect if we're in Storyblok Visual Editor (preview mode)
const isPreview =
  typeof window !== "undefined" &&
  window.location.search.includes("_storyblok");

/**
 * Initialize Storyblok SDK.
 * Call this once at app startup (in App.tsx).
 */
export function initStoryblok() {
  if (!STORYBLOK_TOKEN) {
    console.info(
      "[Storyblok] No token found (VITE_STORYBLOK_TOKEN). Using fallback data."
    );
    return;
  }

  storyblokInit({
    accessToken: STORYBLOK_TOKEN,
    use: [apiPlugin],
    bridge: isPreview, // Enable bridge only in Visual Editor
    apiOptions: {
      region: "eu", // Change to "us" if your space is in the US region
    },
  });

  console.info("[Storyblok] Initialized", isPreview ? "(preview)" : "(published)");
}

/**
 * Whether Storyblok is configured (token is present).
 */
export function isStoryblokConfigured(): boolean {
  return !!STORYBLOK_TOKEN;
}

/**
 * Get the content version based on environment.
 * "draft" for preview/development, "published" for production.
 */
export function getContentVersion(): "draft" | "published" {
  if (isPreview) return "draft";
  if (import.meta.env.DEV) return "draft";
  return "published";
}

export { STORYBLOK_TOKEN };
