import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router';
import { useSiteDocument } from '../../content/use-site-document';
import { getSeo, SITE_ORIGIN } from '../../content/seo';
export function SEO({ title, description, canonical, ogImage, lang = 'de' }: { title: string; description: string; canonical?: string; ogImage?: string; lang?: string; keywords?: string }) {
  const { pathname } = useLocation();
  const seo = getSeo(canonical || pathname, lang, useSiteDocument());
  const heading = seo?.title || title;
  const text = seo?.description || description;
  const url = seo?.canonical || SITE_ORIGIN + pathname;
  const image = seo?.image || ogImage;
  return <Helmet htmlAttributes={{ lang }}>
    <title>{heading}</title><meta name="description" content={text} />
    <link rel="canonical" href={url} />
    <meta name="robots" content={seo ? 'index,follow,max-image-preview:large' : 'noindex,nofollow'} />
    {seo && <link rel="alternate" hrefLang="de" href={SITE_ORIGIN + (canonical || pathname)} />}
    {seo && <link rel="alternate" hrefLang="en" href={SITE_ORIGIN + (canonical || pathname) + '?lang=en'} />}
    <meta property="og:site_name" content="Mario Schubert Photography" />
    <meta property="og:type" content="website" /><meta property="og:title" content={heading} />
    <meta property="og:description" content={text} /><meta property="og:url" content={url} />
    <meta property="og:locale" content={lang === 'de' ? 'de_AT' : 'en_US'} />
    {image && <meta property="og:image" content={image} />}
    {image && <meta property="og:image:alt" content={heading} />}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={heading} /><meta name="twitter:description" content={text} />
    {image && <meta name="twitter:image" content={image} />}
  </Helmet>;
}
