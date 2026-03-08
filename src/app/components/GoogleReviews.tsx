import { Star } from "lucide-react";
import { SectionReveal } from "./SectionReveal";
import { useGoogleReviews, type GoogleReview } from "./useGoogleReviews";
import { useLanguage } from "./LanguageContext";

/**
 * Single testimonial card – used in grid layouts (3 columns)
 */
function ReviewCard({ review, delay = 0 }: { review: GoogleReview; delay?: number }) {
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
          "{review.text}"
        </p>
        <div>
          <p className="text-[0.85rem]" style={{ fontWeight: 500 }}>
            {review.author}
          </p>
          <p
            className="text-black/40 text-[0.78rem]"
            style={{ fontWeight: 300 }}
          >
            {review.relativeTime}
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
        "{review.text}"
      </p>
      <p className="text-black/40 text-[0.82rem]" style={{ fontWeight: 400 }}>
        — {review.author}
        {review.relativeTime ? `, ${review.relativeTime}` : ""}
      </p>
    </div>
  );
}

/**
 * Google rating badge – shows average rating + total count + Google branding
 */
function GoogleRatingBadge({
  averageRating,
  totalReviews,
  source,
}: {
  averageRating: number;
  totalReviews: number;
  source: "google" | "fallback";
}) {
  const { lang } = useLanguage();

  if (source === "fallback") return null;

  return (
    <div className="flex items-center justify-center gap-3 mt-8">
      <div className="flex items-center gap-1.5">
        {/* Google "G" logo as text */}
        <svg width="18" height="18" viewBox="0 0 24 24" className="shrink-0">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
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
        {lang === "de" ? "Google Bewertungen" : "Google Reviews"}
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
  const { reviews, averageRating, totalReviews, source } = useGoogleReviews(4);

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

        <GoogleRatingBadge
          averageRating={averageRating}
          totalReviews={totalReviews}
          source={source}
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
  const { reviews, averageRating, totalReviews, source } = useGoogleReviews(4);

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
          <GoogleRatingBadge
            averageRating={averageRating}
            totalReviews={totalReviews}
            source={source}
          />
        </SectionReveal>
      </div>
    </section>
  );
}
