import { renderToString } from 'react-dom/server';
import { StaticRouter, Routes, Route } from 'react-router';
import { HelmetProvider } from 'react-helmet-async';
import { LanguageProvider } from './app/components/LanguageContext';
import { ContactModalProvider } from './app/components/ContactModal';
import { Layout } from './app/components/Layout';
import { HomePage } from './app/components/pages/HomePage';
import { WeddingsPage } from './app/components/pages/WeddingsPage';
import { AnimalsPage } from './app/components/pages/AnimalsPage';
import { PortraitPage } from './app/components/pages/PortraitPage';
import { AboutPage } from './app/components/pages/AboutPage';
import { DestinationWeddingPage } from './app/components/pages/DestinationWeddingPage';
import { ImpressumPage } from './app/components/pages/ImpressumPage';
import { DatenschutzPage } from './app/components/pages/DatenschutzPage';
import { getSiteDocument, setSiteDocument } from './content/site-client';
import type { SiteDocument } from './content/site-content';

const pages = { '/': HomePage, '/hochzeiten': WeddingsPage, '/tierfotografie': AnimalsPage, '/portrait': PortraitPage, '/ueber-mich': AboutPage, '/destination-wedding': DestinationWeddingPage, '/impressum': ImpressumPage, '/datenschutz': DatenschutzPage };
// Rendering is synchronous: a request's document is never shared across an await.
export function render(path: string, language: 'de' | 'en', document: SiteDocument) {
  const original = getSiteDocument();
  const context: any = {};
  setSiteDocument(document);
  try {
    const body = renderToString(<HelmetProvider context={context}><LanguageProvider initialLanguage={language}><ContactModalProvider><StaticRouter location={path}><Routes><Route element={<Layout />}>{Object.entries(pages).map(([route, Page]) => <Route key={route} path={route} element={<Page />} />)}</Route></Routes></StaticRouter></ContactModalProvider></LanguageProvider></HelmetProvider>);
    const helmet = context.helmet;
    return { body, head: [helmet.title, helmet.meta, helmet.link, helmet.script].map(item => item.toString()).join('') };
  } finally { setSiteDocument(original); }
}
