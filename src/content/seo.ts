import type { SiteDocument } from './site-content.js';
import { resolveSiteAsset } from './media.js';

export const SITE_ORIGIN = 'https://www.marioschub.com';
export const business = {
  name: 'Mario Schubert Fotografie', street: 'Hauning 30a', postalCode: '6306', city: 'Söll',
  telephone: '+4367763681543', email: 'servus@marioschub.com',
  areas: ['Kufstein', 'Kitzbühel', 'Wilder Kaiser', 'Söll', 'Ellmau', 'Going', 'Scheffau', 'Chiemsee', 'Tegernsee', 'Schliersee', 'Innsbruck', 'Tirol', 'Bayern'],
};
export const seoPages: Record<string, { key: string; label: string; title: string; description: string; titleEn: string; descriptionEn: string }> = {
  '/': { key: 'home', label: 'Startseite', title: 'Mario Schubert | Fotograf in Kufstein, Kitzbühel & Tirol', description: 'Echte Momente in Foto und Video: Hochzeiten, Portraits und Tierfotografie. Aus Söll am Wilden Kaiser für Tirol, Chiemsee, Tegernsee und Schliersee.', titleEn: 'Mario Schubert | Photographer in Tyrol & Bavaria', descriptionEn: 'Wedding photography, films, portraits and animal photography. Based in Söll near the Wilder Kaiser, available across Tyrol and the Bavarian lakes.' },
  '/hochzeiten': { key: 'weddings', label: 'Hochzeiten', title: 'Hochzeitsfotograf Kufstein, Kitzbühel & Wilder Kaiser | Mario Schubert', description: 'Ich begleite eure Hochzeit in Foto und Video: am Wilden Kaiser, in Kufstein, Kitzbühel, am Chiemsee, Tegernsee und Schliersee. Persönliches Angebot auf Anfrage.', titleEn: 'Wedding Photographer in Tyrol & the Bavarian Lakes | Mario Schubert', descriptionEn: 'Natural wedding photography and films in Kufstein, Kitzbühel, the Wilder Kaiser, Chiemsee, Tegernsee and Schliersee. Request your personal offer.' },
  '/tierfotografie': { key: 'animals', label: 'Tierfotografie', title: 'Tierfotografie in Kufstein, Kitzbühel & Tirol | Mario Schubert', description: 'Tierportraits mit Persönlichkeit: Ich fotografiere Hunde, Pferde und eure tierischen Begleiter in Tirol und Bayern. Rund um Kufstein und den Wilden Kaiser.', titleEn: 'Animal Photography in Tyrol & Bavaria | Mario Schubert', descriptionEn: 'Natural portraits of dogs, horses and your animal companions around Kufstein, Kitzbühel, the Wilder Kaiser and Bavaria.' },
  '/portrait': { key: 'portrait', label: 'Portrait & mehr', title: 'Paarshooting, Familienfotos & Portraits in Tirol | Mario Schubert', description: 'Ungezwungene Paarshootings, Familienfotos und Portraits in Kufstein, Kitzbühel, am Wilden Kaiser und den bayerischen Seen. Erzählt mir von eurer Idee.', titleEn: 'Couples, Family & Portrait Photography | Mario Schubert', descriptionEn: 'Relaxed couple sessions, family photos and portraits in Tyrol and Bavaria, from the Wilder Kaiser to Chiemsee, Tegernsee and Schliersee.' },
  '/ueber-mich': { key: 'about', label: 'Über mich', title: 'Über mich: Mario Schubert, Fotograf aus Söll in Tirol', description: 'Servus, ich bin Mario. Lernt mich und meine Arbeit als Fotograf und Videograf kennen. Zuhause in Söll, unterwegs in Tirol, Bayern und darüber hinaus.', titleEn: 'About Mario Schubert | Photographer from Söll, Tyrol', descriptionEn: 'Meet Mario, photographer and filmmaker based in Söll. Working across Tyrol, Bavaria and beyond, with a focus on natural moments and real stories.' },
  '/destination-wedding': { key: 'destination', label: 'Destination Wedding', title: 'Destination Wedding: Hochzeitsfotografie im Ausland | Mario Schubert', description: 'Ihr heiratet im Ausland? Ich begleite euch mit Foto und Video zu eurer Destination Wedding. Persönliche Planung und ein individuelles Angebot auf Anfrage.', titleEn: 'Destination Wedding Photography & Films | Mario Schubert', descriptionEn: 'Getting married abroad? I will join you with photography and film for your destination wedding. Personal planning and a tailor-made offer on request.' },
  '/impressum': { key: 'imprint', label: 'Impressum', title: 'Impressum | Mario Schubert Fotografie, Söll', description: 'Kontakt und Anbieterangaben: Mario Schubert Fotografie, Hauning 30a, 6306 Söll, Tirol, Österreich.', titleEn: 'Legal Notice | Mario Schubert Photography, Söll', descriptionEn: 'Business and contact information: Mario Schubert Photography, Hauning 30a, 6306 Söll, Tyrol, Austria.' },
  '/datenschutz': { key: 'privacy', label: 'Datenschutz', title: 'Datenschutzerklärung | Mario Schubert Fotografie', description: 'Informationen über Datenschutz, Cookies, Kundenportal und freiwillige Webanalyse auf der Website von Mario Schubert.', titleEn: 'Privacy Policy | Mario Schubert Photography', descriptionEn: 'Information about privacy, cookies, the customer portal and optional analytics on Mario Schubert’s website.' },
};
export const publicPaths = Object.keys(seoPages);
export function getSeo(path: string, lang: string, document?: SiteDocument) {
  const page = seoPages[path];
  if (!page) return null;
  const content = document?.stories.find(story => story.full_slug === `pages/${page.key}`)?.content || {};
  const en = lang === 'en';
  return {
    title: content[`seo_title_${lang}`] || (en ? page.titleEn : page.title),
    description: content[`seo_description_${lang}`] || (en ? page.descriptionEn : page.description),
    image: resolveSiteAsset(content.seo_image?.filename || content.seo_image || 'https://ik.imagekit.io/r2yqrg6np/Wedding/Paarfotos/E00A5635-2.jpg'),
    canonical: SITE_ORIGIN + path + (en ? '?lang=en' : ''),
  };
}
export function withSeoFields(document: SiteDocument): SiteDocument {
  const stories = [...document.stories];
  for (const page of Object.values(seoPages)) {
    let index = stories.findIndex(story => story.full_slug === `pages/${page.key}`);
    if (index < 0) { index = stories.length; stories.push({ name: page.label, slug: page.key, full_slug: `pages/${page.key}`, uuid: `page-${page.key}`, content: { component: `page_${page.key}` } }); }
    const videos = page.key === 'weddings' ? Object.fromEntries(['B5ncNtkQkKs', 'aD9G344Yt_o', 'OskCUn4h2cU', '87Ryj3JSUJc', 'EOk9GpvVlRk', '5QN0bcnPFFY'].map((id, i) => [`gallery_video_${i + 1}_url`, `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`])) : {};
    stories[index] = { ...stories[index], content: { ...videos, seo_title_de: page.title, seo_description_de: page.description, seo_title_en: page.titleEn, seo_description_en: page.descriptionEn, seo_image: '', ...stories[index].content } };
  }
  return { ...document, stories };
}
export function businessSchema() {
  return { '@context': 'https://schema.org', '@graph': [
    { '@type': 'ProfessionalService', '@id': SITE_ORIGIN + '/#business', name: business.name, url: SITE_ORIGIN + '/', description: 'Fotografie und Videografie für Hochzeiten, Portraits und Tiere in Tirol und Bayern.', telephone: business.telephone, email: business.email, address: { '@type': 'PostalAddress', streetAddress: business.street, postalCode: business.postalCode, addressLocality: business.city, addressRegion: 'Tirol', addressCountry: 'AT' }, areaServed: business.areas.map(name => ({ '@type': 'Place', name })), sameAs: ['https://www.instagram.com/marioschub/'], founder: { '@type': 'Person', name: 'Mario Schubert' } },
    { '@type': 'WebSite', '@id': SITE_ORIGIN + '/#website', url: SITE_ORIGIN + '/', name: 'Mario Schubert Photography', publisher: { '@id': SITE_ORIGIN + '/#business' }, inLanguage: ['de-AT', 'en'] },
  ] };
}
