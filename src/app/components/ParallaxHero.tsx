import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface ParallaxHeroProps {
  imageSrc: string;
  imageAlt: string;
  preTitle?: string;
  title: React.ReactNode;
  height?: string;
  children?: React.ReactNode;
}

export function ParallaxHero({ imageSrc, imageAlt, preTitle, title, height = "h-[50vh] min-h-[320px] md:h-[70vh] md:min-h-[500px]", children }: ParallaxHeroProps) {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroImageY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const heroTextY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={heroRef} className={`relative ${height} overflow-hidden`}>
      <motion.div className="absolute inset-0" style={{ y: heroImageY }}>
        <ImageWithFallback
          src={imageSrc}
          alt={imageAlt}
          className="w-full h-[120%] object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
      </motion.div>
      <motion.div
        className="relative h-full flex flex-col items-center justify-center text-center px-4"
        style={{ y: heroTextY, opacity: heroOpacity }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          {preTitle && (
            <p
              className="text-white/70 text-[0.75rem] tracking-[0.3em] uppercase mb-4"
              style={{ fontWeight: 400 }}
            >
              {preTitle}
            </p>
          )}
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(2.5rem, 7vw, 5rem)",
              fontWeight: 300,
              lineHeight: 1,
              color: "white",
            }}
          >
            {title}
          </h1>
          {children}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{ opacity: heroOpacity }}
      >
        <div className="w-[1px] h-12 bg-white/30" />
      </motion.div>
    </section>
  );
}