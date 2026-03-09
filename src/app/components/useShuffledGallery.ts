import { useMemo } from "react";

/**
 * Fisher-Yates shuffle – reshuffles when the images array identity changes
 * (e.g. API data replaces fallback). Uses only useMemo (single hook) to
 * keep hook count stable and avoid Rules of Hooks violations on HMR.
 */
export function useShuffledGallery<T>(images: T[]): T[] {
  return useMemo(() => {
    const arr = [...images];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [images]);
}
