import { useCallback } from "react";
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

export function MasonryGrid({
  images,
  openLightbox,
  initialPageSize = 20,
  columns: colConfig = { mobile: 2, tablet: 2, desktop: 3 },
  gap = 12,
}: MasonryGridProps) {
  const renderItem = useCallback(
    (img: GalleryImage, itemIdx: number) => {
      if (!img) return null;

      return (
        <div
          key={`${img.src}-${itemIdx}`}
          className="break-inside-avoid"
          style={{ marginBottom: gap }}
        >
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
                  className="w-full block"
                  style={{ display: "block" }}
                  onError={(e) => {
                    const parent = e.currentTarget.closest(".break-inside-avoid") as HTMLElement;
                    if (parent) parent.style.display = "none";
                  }}
                />
              </motion.div>
            </motion.div>
          </SectionReveal>
        </div>
      );
    },
    [openLightbox, initialPageSize, gap]
  );

  return (
    <>
      {/* Mobile */}
      <div
        className="md:hidden"
        style={{
          columnCount: colConfig.mobile,
          columnGap: gap,
        }}
      >
        {images.map((img, i) => renderItem(img, i))}
      </div>
      {/* Tablet */}
      <div
        className="hidden md:block lg:hidden"
        style={{
          columnCount: colConfig.tablet,
          columnGap: gap,
        }}
      >
        {images.map((img, i) => renderItem(img, i))}
      </div>
      {/* Desktop */}
      <div
        className="hidden lg:block"
        style={{
          columnCount: colConfig.desktop,
          columnGap: gap,
        }}
      >
        {images.map((img, i) => renderItem(img, i))}
      </div>
    </>
  );
}
