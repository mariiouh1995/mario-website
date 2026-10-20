import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router';
import { businessSchema, publicPaths, SITE_ORIGIN, seoPages } from '../../content/seo';
export function StructuredData() {
  const { pathname } = useLocation();
  if (!publicPaths.includes(pathname)) return <Helmet><title>Mario Schubert | Kundenbereich</title><meta name="robots" content="noindex,nofollow" /></Helmet>;
  const graph = businessSchema();
  if (pathname !== '/') graph['@graph'].push({ '@type': 'BreadcrumbList', '@id': SITE_ORIGIN + pathname + '#breadcrumb', itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Mario Schubert', item: SITE_ORIGIN + '/' },
    { '@type': 'ListItem', position: 2, name: seoPages[pathname].label, item: SITE_ORIGIN + pathname },
  ] } as any);
  return <Helmet><script type="application/ld+json">{JSON.stringify(graph).replace(/</g, '\\u003c')}</script></Helmet>;
}
