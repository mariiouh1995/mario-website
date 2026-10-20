import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router';
import { businessSchema, publicPaths, SITE_ORIGIN, seoPages } from '../../content/seo';
import { useLanguage } from './LanguageContext';
import { useSiteDocument } from '../../content/use-site-document';
import { getSeo } from '../../content/seo';
export function StructuredData() {
  const { pathname } = useLocation();
  const { lang } = useLanguage();
  const seo = getSeo(pathname, lang, useSiteDocument());
  if (!publicPaths.includes(pathname)) return <Helmet><title>Mario Schubert | Kundenbereich</title><meta name="robots" content="noindex,nofollow" /></Helmet>;
  const graph = businessSchema();
  graph['@graph'].push({ '@type': 'WebPage', '@id': seo!.canonical + '#page', url: seo!.canonical, name: seo!.title, description: seo!.description, inLanguage: lang === 'de' ? 'de-AT' : 'en', isPartOf: { '@id': SITE_ORIGIN + '/#website' }, about: { '@id': SITE_ORIGIN + '/#business' } } as any);
  if (pathname !== '/') graph['@graph'].push({ '@type': 'BreadcrumbList', '@id': SITE_ORIGIN + pathname + '#breadcrumb', itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Mario Schubert', item: SITE_ORIGIN + '/' },
    { '@type': 'ListItem', position: 2, name: seoPages[pathname].label, item: SITE_ORIGIN + pathname },
  ] } as any);
  return <Helmet><script type="application/ld+json">{JSON.stringify(graph).replace(/</g, '\\u003c')}</script></Helmet>;
}
