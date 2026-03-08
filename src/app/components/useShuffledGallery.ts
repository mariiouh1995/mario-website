import { useMemo } from "react";

/**
 * Fisher-Yates shuffle – returns a new shuffled copy on every mount (page load).
 * The empty dependency array inside useMemo ensures the order stays stable
 * for the lifetime of the component but reshuffles on navigation / remount.
 */
export function useShuffledGallery<T>(images: T[]): T[] {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => {
    const arr = [...images];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, []); // intentionally empty – reshuffle on remount only
}
