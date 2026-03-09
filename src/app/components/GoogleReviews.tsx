import { Star } from "lucide-react";
import { SectionReveal } from "./SectionReveal";
import { useGoogleReviews, type GoogleReview } from "./useGoogleReviews";
import { useLanguage } from "./LanguageContext";

/**
 * Single testimonial card – used in grid layouts (3 columns)
 */
function ReviewCard({ review, delay = 0 }: { review: GoogleReview; delay?: number }) {
  const { lang } = useLanguage();
  const text = lang === "en" && review.textEn ? review.textEn : review.text;

  return (
    <SectionReveal delay={delay}>
      <div className="bg-white p-8 h-full flex flex-col">
        <div className="flex gap-1 mb-5">
          {[...Array(5)].map((_, j) => (
            <Star
              key={j}
              size={14}
              className={
                j < review.rating
                  ? "text-black/70 fill-black/70"
                  : "text-black/15"
              }
            />
          ))}
        </div>
        <p
          className="text-black/60 text-[0.88rem] flex-1 mb-6"
          style={{ lineHeight: 1.75, fontWeight: 300, fontStyle: "italic" }}
        >
          "{text}"
        </p>
        <div>
          <p className="text-[0.85rem]" style={{ fontWeight: 500 }}>
            {review.author}
          </p>
        </div>
      </div>
    </SectionReveal>
  );
}

/**
 * Single testimonial quote – used in centered single-review layouts
 */
function ReviewQuote({ review }: { review: GoogleReview }) {
  const { lang } = useLanguage();
  const text = lang === "en" && review.textEn ? review.textEn : review.text;

  return (
    <div className="text-center">
      <div className="flex justify-center gap-1 mb-5">
        {[...Array(5)].map((_, j) => (
          <Star
            key={j}
            size={14}
            className={
              j < review.rating
                ? "text-black/60 fill-black/60"
                : "text-black/15"
            }
          />
        ))}
      </div>
      <p
        className="text-black/55 text-[1.05rem] md:text-[1.15rem] mb-6 max-w-2xl mx-auto"
        style={{ lineHeight: 1.8, fontWeight: 300, fontStyle: "italic" }}
      >
        "{text}"
      </p>
      <p className="text-black/40 text-[0.82rem]" style={{ fontWeight: 400 }}>
        — {review.author}
      </p>
    </div>
  );
}

/**
 * Rating badge – shows star rating + total count
 */
function RatingBadge({
  averageRating,
  totalReviews,
}: {
  averageRating: number;
  totalReviews: number;
}) {
  const { lang } = useLanguage();

  if (totalReviews === 0) return null;

  return (
    <div className="flex items-center justify-center gap-3 mt-8">
      <div className="flex items-center gap-1.5">
        <div className="flex gap-0.5">
          {[...Array(5)].map((_, j) => (
            <Star
              key={j}
              size={12}
              className={
                j < Math.round(averageRating)
                  ? "text-amber-400 fill-amber-400"
                  : "text-black/15"
              }
            />
          ))}
        </div>
      </div>
      <p className="text-black/40 text-[0.75rem]" style={{ fontWeight: 400 }}>
        {averageRating.toFixed(1)} / 5 · {totalReviews}{" "}
        {lang === "de" ? "Bewertungen" : "Reviews"}
      </p>
    </div>
  );
}

// ──────────────────────────────────────────────
// EXPORTED SECTION COMPONENTS
// ──────────────────────────────────────────────

interface ReviewsSectionProps {
  /** How many reviews to show (default: 3) */
  count?: number;
  /** Section title override */
  title?: string;
  /** Section pre-title override */
  preTitle?: string;
  /** Background variant */
  bg?: "white" | "cream";
}

/**
 * Grid layout – shows 3 review cards in a grid (used on Weddings, About)
 */
export function GoogleReviewsGrid({
  count = 3,
  title,
  preTitle,
  bg = "cream",
}: ReviewsSectionProps) {
  const { lang } = useLanguage();
  const { reviews, averageRating, totalReviews } = useGoogleReviews(4);

  const displayReviews = reviews.slice(0, count);

  const defaultPreTitle = lang === "de" ? "KUNDENSTIMMEN" : "TESTIMONIALS";
  const defaultTitle = lang === "de" ? "Das sagen meine Kunden" : "What my clients say";

  return (
    <section
      className={`py-24 md:py-32 px-4 ${
        bg === "cream" ? "bg-[#f8f7f5]" : ""
      }`}
    >
      <div className="max-w-6xl mx-auto">
        <SectionReveal>
          <div className="text-center mb-16">
            <p
              className="text-[0.75rem] tracking-[0.3em] uppercase text-black/40 mb-4"
              style={{ fontWeight: 400 }}
            >
              {preTitle || defaultPreTitle}
            </p>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(2rem, 4vw, 3rem)",
                fontWeight: 300,
              }}
            >
              {title || defaultTitle}
            </h2>
          </div>
        </SectionReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {displayReviews.map((review, i) => (
            <ReviewCard key={review.author + i} review={review} delay={i * 0.12} />
          ))}
        </div>

        <RatingBadge
          averageRating={averageRating}
          totalReviews={totalReviews}
        />
      </div>
    </section>
  );
}

/**
 * Single quote layout – shows one centered review (used on Home, Animals, Portrait)
 */
export function GoogleReviewSingle({
  bg = "cream",
  /** Index of the review to show (picks from available reviews) */
  reviewIndex = 0,
}: {
  bg?: "white" | "cream";
  reviewIndex?: number;
}) {
  const { reviews, averageRating, totalReviews } = useGoogleReviews(4);

  const review = reviews[reviewIndex % reviews.length];

  if (!review) return null;

  return (
    <section
      className={`py-20 md:py-24 px-4 ${
        bg === "cream" ? "bg-[#f8f7f5]" : ""
      }`}
    >
      <div className="max-w-4xl mx-auto">
        <SectionReveal>
          <ReviewQuote review={review} />
          <RatingBadge
            averageRating={averageRating}
            totalReviews={totalReviews}
          />
        </SectionReveal>
      </div>
    </section>
  );
}
