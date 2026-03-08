import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  lang?: string;
  keywords?: string;
}

const BASE_URL = "https://www.marioschubert.com";

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
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={url} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      <meta property="og:locale" content={lang === "de" ? "de_AT" : "en_US"} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}
      <meta name="geo.region" content="AT-7" />
      <meta name="geo.placename" content="Innsbruck" />
    </Helmet>
  );
}
