/**
 * usePageContent Hook
 *
 * Fetches page-level text content from Storyblok and provides a getText()
 * helper that returns Storyblok values with automatic fallback to hardcoded translations.
 *
 * Usage:
 *   const { getText } = usePageContent("home", lang);
 *   <h1>{getText("hero_subtitle", t.home.heroSubtitle)}</h1>
 *
 * Storyblok setup:
 *   - Content Type: "page_content"
 *   - Folder: pages/
 *   - Story slugs: pages/home, pages/weddings, pages/animals, pages/portrait, pages/about
 *   - Field naming convention: {key}_de, {key}_en (e.g. hero_subtitle_de, hero_subtitle_en)
 *   - All fields should be type "text" or "textarea" in Storyblok
 *
 * The hook fetches the story once, caches it (via storyblok-api.ts localStorage cache),
 * and provides instant fallback to the hardcoded translation if:
 *   - Storyblok is not configured
 *   - The story doesn't exist
 *   - A specific field is empty or missing
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { fetchStoryblokStory } from "./storyblok-api";
import { isStoryblokConfigured } from "./storyblok-init";
import type { Language } from "../translations";

interface PageContentData {
  [key: string]: string | number | boolean | undefined;
}

interface UsePageContentReturn {
  /** Get a text value from Storyblok, falling back to the provided default */
  getText: (key: string, fallback: string) => string;
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

  return {
    getText,
    loading,
    hasContent: !!content,
  };
}
