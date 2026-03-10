/**
 * Storyblok CMS Integration
 *
 * This module provides the full Storyblok integration for marioschub.com.
 *
 * Setup:
 * 1. Create a Storyblok space at https://app.storyblok.com
 * 2. Add your access token as VITE_STORYBLOK_TOKEN in .env / Vercel env vars
 * 3. Create content types as documented in storyblok-init.ts
 * 4. Create folders: packages/, addons/, gallery/, reviews/, faqs/
 * 5. Add your content in Storyblok
 *
 * The integration is backward-compatible:
 * - If VITE_STORYBLOK_TOKEN is not set, the app uses Google Sheets API (legacy)
 * - If Storyblok fetch fails, it falls back to Google Sheets API
 * - If both fail, hardcoded fallback data is used
 *
 * Debug:
 * - Open browser console, look for "[Storyblok]" logs
 * - Call clearStoryblokCache() from console to clear all caches
 * - Add ?_storyblok to URL to enable Visual Editor bridge
 */

export { initStoryblok, isStoryblokConfigured } from "./storyblok-init";
export { fetchStoryblokStories, fetchStoryblokStory, clearStoryblokCache } from "./storyblok-api";
export { useStoryblokFAQs } from "./useStoryblokFAQs";
