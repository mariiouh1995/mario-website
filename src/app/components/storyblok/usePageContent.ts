/**
 * usePageContent Hook
 *
 * Fetches page-level content from Storyblok and provides helpers:
 *   - getText(key, fallback)  – text / textarea fields (DE/EN)
 *   - getAsset(key, fallback) – asset fields (images, videos)
 *   - getIcon(key, fallback)  – icon name → Lucide component mapping
 *
 * Usage:
 *   const { getText, getAsset, getIcon } = usePageContent("home", lang);
 *   <h1>{getText("hero_subtitle", t.home.heroSubtitle)}</h1>
 *   <video src={getAsset("hero_video", FALLBACK_VIDEO)} />
 *   <DynamicIcon icon={getIcon("service1_icon", Heart)} />
 *
 * Storyblok setup (per-page content types):
 *   - Content Types: page_home, page_weddings, page_animals, page_portrait, page_about
 *   - Folder: pages/
 *   - Story slugs: pages/home, pages/weddings, pages/animals, pages/portrait, pages/about
 *   - Text fields: {key}_de, {key}_en (e.g. hero_subtitle_de, hero_subtitle_en)
 *   - Asset fields: {key} (e.g. hero_video, hero_image, photo1_image) – no _de/_en suffix needed
 *   - Icon fields: {key} as plain text with Lucide icon name (e.g. "Heart", "Camera")
 *
 * Falls back gracefully when:
 *   - Storyblok is not configured
 *   - The story doesn't exist yet
 *   - A specific field is empty or missing
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { fetchStoryblokStory } from "./storyblok-api";
import { isStoryblokConfigured } from "./storyblok-init";
import type { Language } from "../translations";
import { ICON_MAP, type IconComponent } from "./icon-map";

// Storyblok asset fields can be a string URL or an object { filename, alt, ... }
interface StoryblokAsset {
  filename?: string;
  alt?: string;
  title?: string;
  [key: string]: any;
}

interface PageContentData {
  [key: string]: string | number | boolean | StoryblokAsset | undefined;
}

interface UsePageContentReturn {
  /** Get a text value from Storyblok, falling back to the provided default */
  getText: (key: string, fallback: string) => string;
  /** Get an asset URL from Storyblok (image/video), falling back to the provided URL */
  getAsset: (key: string, fallbackUrl: string) => string;
  /** Get a Lucide icon component by Storyblok field name, falling back to default */
  getIcon: (key: string, fallback: IconComponent) => IconComponent;
  /** Whether content is still loading from Storyblok */
  loading: boolean;
  /** Whether Storyblok content was successfully loaded */
  hasContent: boolean;
}

export function usePageContent(
  pageKey: string,
  lang: Language
): UsePageContentReturn {
  const [content, setContent] = useState<PageContentData | null>(null);
  const [loading, setLoading] = useState(() => isStoryblokConfigured());
  const fetchedRef = useRef(false);

  useEffect(() => {
    // Only fetch once per pageKey
    if (fetchedRef.current) return;
    if (!isStoryblokConfigured()) {
      setLoading(false);
      return;
    }

    fetchedRef.current = true;

    fetchStoryblokStory<PageContentData>(
      `pages/${pageKey}`,
      `page_content_${pageKey}`
    )
      .then((result) => {
        if (result?.content) {
          setContent(result.content);
          console.info(
            `[Storyblok] Page content loaded for "${pageKey}"`,
            Object.keys(result.content).length,
            "fields"
          );
        }
      })
      .catch(() => {
        // Silently fall back to hardcoded translations
      })
      .finally(() => {
        setLoading(false);
      });
  }, [pageKey]);

  // ── getText: language-aware text lookup ──
  const getText = useCallback(
    (key: string, fallback: string): string => {
      if (!content) return fallback;

      // Try language-specific field first: e.g. hero_subtitle_de
      const langKey = `${key}_${lang}`;
      const langValue = content[langKey];
      if (typeof langValue === "string" && langValue.trim()) {
        return langValue;
      }

      // Try without language suffix (for language-independent fields)
      const plainValue = content[key];
      if (typeof plainValue === "string" && plainValue.trim()) {
        return plainValue;
      }

      return fallback;
    },
    [content, lang]
  );

  // ── getAsset: image/video URL from Storyblok asset field ──
  const getAsset = useCallback(
    (key: string, fallbackUrl: string): string => {
      if (!content) return fallbackUrl;

      const value = content[key];

      // Storyblok asset field → object with { filename: "https://..." }
      if (value && typeof value === "object" && "filename" in value) {
        const asset = value as StoryblokAsset;
        if (asset.filename && asset.filename.trim()) {
          return asset.filename;
        }
      }

      // Plain string URL (e.g. from a "text" field)
      if (typeof value === "string" && value.trim()) {
        return value;
      }

      return fallbackUrl;
    },
    [content]
  );

  // ── getIcon: Lucide icon name → component ──
  const getIcon = useCallback(
    (key: string, fallback: IconComponent): IconComponent => {
      if (!content) return fallback;

      const value = content[key];
      if (typeof value === "string" && value.trim()) {
        const iconName = value.trim();
        // Try exact match, then case-insensitive
        if (ICON_MAP[iconName]) return ICON_MAP[iconName];
        const lower = iconName.toLowerCase();
        const found = Object.entries(ICON_MAP).find(
          ([k]) => k.toLowerCase() === lower
        );
        if (found) return found[1];
      }

      return fallback;
    },
    [content]
  );

  return {
    getText,
    getAsset,
    getIcon,
    loading,
    hasContent: !!content,
  };
}
