import { useState, useCallback, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface LightboxImage {
  src: string;
  alt: string;
}

interface LightboxProps {
  images: LightboxImage[];
  initialIndex?: number;
  open: boolean;
  onClose: () => void;
}

export function Lightbox({ images, initialIndex = 0, open, onClose }: LightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    if (open) setCurrentIndex(initialIndex);
  }, [open, initialIndex]);

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [open, onClose, goNext, goPrev]);

  if (!open || images.length === 0) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/95" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 md:top-6 md:right-6 z-10 text-white/70 hover:text-white transition-colors bg-transparent border-none cursor-pointer p-2"
            aria-label="Close"
          >
            <X size={28} />
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-4 md:top-6 md:left-6 z-10 text-white/50 text-[0.8rem]" style={{ fontWeight: 300 }}>
            {currentIndex + 1} / {images.length}
          </div>

          {/* Prev button */}
          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              className="absolute left-2 md:left-6 z-10 text-white/50 hover:text-white transition-colors bg-transparent border-none cursor-pointer p-3"
              aria-label="Previous"
            >
              <ChevronLeft size={36} />
            </button>
          )}

          {/* Next button */}
          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              className="absolute right-2 md:right-6 z-10 text-white/50 hover:text-white transition-colors bg-transparent border-none cursor-pointer p-3"
              aria-label="Next"
            >
              <ChevronRight size={36} />
            </button>
          )}

          {/* Image */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative z-5 max-w-[92vw] max-h-[88vh] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={images[currentIndex].src}
                alt={images[currentIndex].alt}
                className="max-w-full max-h-[88vh] object-contain select-none"
                draggable={false}
              />
            </motion.div>
          </AnimatePresence>

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2 overflow-x-auto max-w-[90vw] px-4 py-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setCurrentIndex(i); }}
                  className={`shrink-0 w-12 h-12 md:w-16 md:h-16 overflow-hidden border-2 transition-all cursor-pointer bg-transparent p-0 ${
                    i === currentIndex ? "border-white opacity-100" : "border-transparent opacity-40 hover:opacity-70"
                  }`}
                >
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Hook for lightbox state */
export function useLightbox() {
  const [lightboxState, setLightboxState] = useState<{ open: boolean; index: number }>({
    open: false,
    index: 0,
  });

  const openLightbox = useCallback((index: number) => {
    setLightboxState({ open: true, index });
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxState({ open: false, index: 0 });
  }, []);

  return { ...lightboxState, openLightbox, closeLightbox };
}
