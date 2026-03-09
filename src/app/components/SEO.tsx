import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  lang?: string;
  keywords?: string;
}

const BASE_URL = "https://marioschub.com";

// Camera emoji favicon as SVG data URI
const FAVICON_SVG = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">📷</text></svg>`;

const DEFAULT_OG_IMAGE = "https://ik.imagekit.io/r2yqrg6np/Wedding/Paarfotos/E00A5635-2.jpg?tr=w-1200,h-630,fo-auto";

/** Append ImageKit transform for OG-optimized 1200x630 crop */
function getOgImageUrl(src?: string): string {
  if (!src) return DEFAULT_OG_IMAGE;
  if (src.includes("ik.imagekit.io")) {
    const separator = src.includes("?") ? "&" : "?";
    return `${src}${separator}tr=w-1200,h-630,fo-auto`;
  }
  return src;
}

export function SEO({
  title,
  description,
  canonical,
  ogImage,
  lang = "de",
  keywords,
}: SEOProps) {
  const fullTitle = title.includes("Mario Schubert")
    ? title
    : `${title} | Mario Schubert Photography`;
  const url = canonical ? `${BASE_URL}${canonical}` : BASE_URL;

  return (
    <Helmet
      htmlAttributes={{ lang }}
    >
      <title>{fullTitle}</title>
      <link rel="icon" type="image/svg+xml" href={FAVICON_SVG} />
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={url} />
      <meta property="og:site_name" content="Mario Schubert Photography" />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      {<meta property="og:image" content={getOgImageUrl(ogImage)} />}
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      {<meta property="og:image:alt" content={fullTitle} />}
      <meta property="og:locale" content={lang === "de" ? "de_AT" : "en_US"} />
      <meta property="og:locale:alternate" content={lang === "de" ? "en_US" : "de_AT"} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {<meta name="twitter:image" content={getOgImageUrl(ogImage)} />}
      {<meta name="twitter:image:alt" content={fullTitle} />}
      <meta name="geo.region" content="AT-7" />
      <meta name="geo.placename" content="Innsbruck" />
    </Helmet>
  );
}