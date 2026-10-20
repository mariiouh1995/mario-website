import { collectMedia, publicStories, type SiteDocument } from './site-content';
import { mapAssets } from './media';
import { withSeoFields } from './seo';

export const initialSiteDocument: SiteDocument = withSeoFields(mapAssets({
  capturedAt: '',
  stories: [],
  edits: [],
  media: [],
}));
let current = initialSiteDocument;
let loaded: Promise<SiteDocument> | undefined;
const listeners = new Set<() => void>();
export const getSiteDocument = () => current;
export function setSiteDocument(doc: SiteDocument) { current = withSeoFields(doc); listeners.forEach(listener => listener()); }
export function subscribeSite(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; }
export function loadSiteDocument() {
  if (typeof window !== 'undefined' && (window as any).__WEBSITE_DOCUMENT__) {
    setSiteDocument((window as any).__WEBSITE_DOCUMENT__);
    delete (window as any).__WEBSITE_DOCUMENT__;
    loaded = Promise.resolve(current);
    return loaded;
  }
  if (!loaded) loaded = fetch('/api/website?action=public', { signal: AbortSignal.timeout(8000) })
    .then(async response => { if (!response.ok) throw new Error('Website-Inhalte nicht erreichbar'); return (await response.json()).document as SiteDocument; })
    .then(doc => { setSiteDocument(doc); return doc; })
    .catch(async () => {
      const { default: snapshot } = await import('./live-snapshot.json');
      const fallback = mapAssets({ capturedAt: snapshot.capturedAt, stories: publicStories(snapshot.stories), edits: [], media: collectMedia(snapshot.stories) });
      setSiteDocument(fallback);
      return current;
    });
  return loaded;
}
