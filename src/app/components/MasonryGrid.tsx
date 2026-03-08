import { useMemo, useCallback } from "react";
import { motion } from "motion/react";
import { SectionReveal } from "./SectionReveal";

interface GalleryImage {
  src: string;
  alt: string;
  category?: string;
  tall?: boolean;
}

interface MasonryGridProps {
  images: GalleryImage[];
  openLightbox: (index: number) => void;
  /** How many items are in the "first page" for staggered animation */
  initialPageSize?: number;
  columns?: { mobile: number; tablet: number; desktop: number };
  gap?: number;
}

/**
 * Distributes items into columns using shortest-column-first algorithm
 * based on pre-known aspect ratios. No DOM measurement needed.
 */
function distributeToColumns(
  images: GalleryImage[],
  numColumns: number
): number[][] {
  const columns: number[][] = Array.from({ length: numColumns }, () => []);
  const heights: number[] = new Array(numColumns).fill(0);

  for (let i = 0; i < images.length; i++) {
    // Find shortest column
    let minIdx = 0;
    for (let c = 1; c < numColumns; c++) {
      if (heights[c] < heights[minIdx]) minIdx = c;
    }
    columns[minIdx].push(i);
    // Tall (3:4) → height factor 1.33, square → 1.0
    const isTall = images[i].tall !== undefined ? images[i].tall : i % 3 === 0;
    heights[minIdx] += isTall ? 4 / 3 : 1;
  }

  return columns;
}

export function MasonryGrid({
  images,
  openLightbox,
  initialPageSize = 20,
  columns: colConfig = { mobile: 2, tablet: 2, desktop: 3 },
  gap = 12,
}: MasonryGridProps) {
  // Pre-compute distributions for each breakpoint
  const distributions = useMemo(() => ({
    mobile: distributeToColumns(images, colConfig.mobile),
    tablet: distributeToColumns(images, colConfig.tablet),
    desktop: distributeToColumns(images, colConfig.desktop),
  }), [images, colConfig.mobile, colConfig.tablet, colConfig.desktop]);

  const getAspectClass = useCallback((img: GalleryImage, idx: number) => {
    const isTall = img.tall !== undefined ? img.tall : idx % 3 === 0;
    return isTall ? "aspect-[3/4]" : "aspect-square";
  }, []);

  const renderItem = useCallback((itemIdx: number) => {
    const img = images[itemIdx];
    if (!img) return null;

    return (
      <SectionReveal
        delay={itemIdx < initialPageSize ? Math.min(itemIdx * 0.04, 0.4) : 0}
      >
        <motion.div
          className="overflow-hidden cursor-pointer"
          onClick={() => openLightbox(itemIdx)}
          whileHover={{ scale: 0.98 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            whileHover={{ scale: 1.08 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <img
              src={img.src}
              alt={img.alt}
              loading="lazy"
              className={`w-full object-cover ${getAspectClass(img, itemIdx)}`}
              onError={(e) => {
                const parent = e.currentTarget.closest("[data-masonry-item]") as HTMLElement;
                if (parent) parent.style.display = "none";
              }}
            />
          </motion.div>
        </motion.div>
      </SectionReveal>
    );
  }, [images, openLightbox, initialPageSize, getAspectClass]);

  const renderColumns = useCallback((cols: number[][]) => (
    <div className="flex" style={{ gap }}>
      {cols.map((colItems, colIdx) => (
        <div key={colIdx} className="flex-1 flex flex-col" style={{ gap }}>
          {colItems.map((itemIdx) => (
            <div key={`${images[itemIdx]?.src}-${itemIdx}`} data-masonry-item>
              {renderItem(itemIdx)}
            </div>
          ))}
        </div>
      ))}
    </div>
  ), [gap, renderItem, images]);

  return (
    <>
      {/* Mobile */}
      <div className="md:hidden">
        {renderColumns(distributions.mobile)}
      </div>
      {/* Tablet */}
      <div className="hidden md:block lg:hidden">
        {renderColumns(distributions.tablet)}
      </div>
      {/* Desktop */}
      <div className="hidden lg:block">
        {renderColumns(distributions.desktop)}
      </div>
    </>
  );
}
