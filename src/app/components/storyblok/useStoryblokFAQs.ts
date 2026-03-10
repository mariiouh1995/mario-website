/**
 * Hook to optionally fetch FAQs from Storyblok.
 *
 * If Storyblok is configured and has FAQ data, it overrides the static faqData.ts.
 * Otherwise, falls back to the hardcoded FAQ data.
 *
 * Storyblok Content Type: "faq_item"
 *   - question_de (text)
 *   - question_en (text)
 *   - answer_de (textarea)
 *   - answer_en (textarea)
 *   - category (option: allgemein, hochzeit, video, pakete, vorbereitung, bearbeitung, lieferung, buchung, technik, storno)
 *   - sort_order (number)
 *
 * Folder: /faqs/
 */

import { useState, useEffect } from "react";
import { fetchStoryblokStories } from "./storyblok-api";
import { isStoryblokConfigured } from "./storyblok-init";
import { faqCategories, type FAQCategory, type FAQItem } from "../faqData";

interface StoryblokFAQContent {
  question_de: string;
  question_en: string;
  answer_de: string;
  answer_en: string;
  category: string;
  sort_order: number;
}

// Category labels (same as in faqData.ts)
const CATEGORY_LABELS: Record<string, { de: string; en: string }> = {
  allgemein: { de: "Allgemein", en: "General" },
  hochzeit: { de: "Hochzeit", en: "Wedding" },
  video: { de: "Video & Film", en: "Video & Film" },
  pakete: { de: "Pakete & Preise", en: "Packages & Pricing" },
  vorbereitung: { de: "Vorbereitung", en: "Preparation" },
  bearbeitung: { de: "Bearbeitung & Lieferung", en: "Editing & Delivery" },
  lieferung: { de: "Lieferung", en: "Delivery" },
  buchung: { de: "Buchung & Organisation", en: "Booking & Organization" },
  technik: { de: "Technik & Ausrüstung", en: "Equipment" },
  storno: { de: "Stornierung", en: "Cancellation" },
};

/**
 * Returns FAQ categories, enriched with Storyblok data if available.
 */
export function useStoryblokFAQs(): {
  categories: FAQCategory[];
  loading: boolean;
} {
  const [categories, setCategories] = useState<FAQCategory[]>(faqCategories);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isStoryblokConfigured()) return;

    let cancelled = false;
    setLoading(true);

    async function fetchFAQs() {
      try {
        const stories = await fetchStoryblokStories<StoryblokFAQContent>(
          "faqs/",
          "faqs"
        );

        if (!stories || stories.length === 0 || cancelled) {
          setLoading(false);
          return;
        }

        // Group by category
        const grouped: Record<string, FAQItem[]> = {};
        for (const s of stories) {
          const cat = s.content.category || "allgemein";
          if (!grouped[cat]) grouped[cat] = [];
          grouped[cat].push({
            q: {
              de: s.content.question_de || "",
              en: s.content.question_en || s.content.question_de || "",
            },
            a: {
              de: s.content.answer_de || "",
              en: s.content.answer_en || s.content.answer_de || "",
            },
          });
        }

        // Convert to FAQCategory array
        const sbCategories: FAQCategory[] = Object.entries(grouped).map(
          ([key, items]) => ({
            key,
            label: CATEGORY_LABELS[key] || { de: key, en: key },
            items,
          })
        );

        if (!cancelled && sbCategories.length > 0) {
          setCategories(sbCategories);
        }
      } catch (err) {
        console.warn("[Storyblok] Failed to fetch FAQs, using fallback:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchFAQs();
    return () => {
      cancelled = true;
    };
  }, []);

  return { categories, loading };
}
