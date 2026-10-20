import type { SiteDocument } from './site-content.js';
import { resolveSiteAsset } from './media.js';
import { withRelaunchDefaults } from './relaunch.js';

export const SITE_ORIGIN = 'https://www.marioschub.com';
export const business = {
  name: 'Mario Schubert Fotografie', street: 'Hauning 30a', postalCode: '6306', city: 'Söll',
  telephone: '+4367763681543', email: 'servus@marioschub.com',
  areas: ['Kufstein', 'Kitzbühel', 'Wilder Kaiser', 'Söll', 'Ellmau', 'Going', 'Scheffau', 'Chiemsee', 'Tegernsee', 'Schliersee', 'Innsbruck', 'Tirol', 'Bayern'],
};
export const seoPages: Record<string, { key: string; label: string; title: string; description: string; titleEn: string; descriptionEn: string }> = {
  '/': { key: 'home', label: 'Startseite', title: 'Mario Schubert | Hochzeitsfotograf Wilder Kaiser & Tirol', description: 'Natürliche Hochzeitsfotografie und Filme aus Söll am Wilden Kaiser. Für Hochzeiten in Tirol, Kitzbühel, am Chiemsee, Tegernsee und Schliersee.', titleEn: 'Mario Schubert | Wedding Photographer in Tyrol & Bavaria', descriptionEn: 'Wedding photography and films from Söll near the Wilder Kaiser. For weddings in Tyrol and Bavaria, including Chiemsee, Tegernsee and Schliersee.' },
  '/hochzeiten': { key: 'weddings', label: 'Hochzeiten', title: 'Hochzeitsfotograf Wilder Kaiser & Kitzbühel | Mario Schubert', description: 'Echte Hochzeitsreportagen statt steifer Posen. Fotografie und Hochzeitsfilm aus Söll für Tirol, Kufstein und die bayerischen Seen. Persönliches Angebot auf Anfrage.', titleEn: 'Wedding Photographer in Tyrol & the Bavarian Lakes | Mario Schubert', descriptionEn: 'Natural wedding photography and films in Kufstein, Kitzbühel, the Wilder Kaiser, Chiemsee, Tegernsee and Schliersee. Request your personal offer.' },
  '/tierfotografie': { key: 'animals', label: 'Tierfotografie', title: 'Hundefotograf in Tirol & Kufstein | Mario Schubert', description: 'Natürliche Hundefotos und Tierporträts rund um den Wilden Kaiser, Kufstein und Kitzbühel. Entspannte Outdoor-Shootings von Söll aus anfragen.', titleEn: 'Animal Photography in Tyrol & Bavaria | Mario Schubert', descriptionEn: 'Natural portraits of dogs, horses and your animal companions around Kufstein, Kitzbühel, the Wilder Kaiser and Bavaria.' },
  '/portrait': { key: 'portrait', label: 'Paare & Porträts', title: 'Paarshooting & Porträtfotografie in Tirol | Mario Schubert', description: 'Entspannte Paarshootings, Familienfotos und Porträts in Tirol und Bayern. Persönlich, natürlich und ohne steife Posen. Jetzt Shooting anfragen.', titleEn: 'Couples, Family & Portrait Photography | Mario Schubert', descriptionEn: 'Relaxed couple sessions, family photos and portraits in Tyrol and Bavaria, from the Wilder Kaiser to Chiemsee, Tegernsee and Schliersee.' },
  '/ueber-mich': { key: 'about', label: 'Über mich', title: 'Über mich: Mario Schubert, Fotograf aus Söll in Tirol', description: 'Servus, ich bin Mario. Lernt mich und meine Arbeit als Fotograf und Videograf kennen. Zuhause in Söll, unterwegs in Tirol, Bayern und darüber hinaus.', titleEn: 'About Mario Schubert | Photographer from Söll, Tyrol', descriptionEn: 'Meet Mario, photographer and filmmaker based in Söll. Working across Tyrol, Bavaria and beyond, with a focus on natural moments and real stories.' },
  '/destination-wedding': { key: 'destination', label: 'Destination Wedding', title: 'Destination Wedding Fotograf | Mario Schubert', description: 'Hochzeitsfotografie außerhalb von Tirol und Bayern. Individuelle Planung von Begleitung, Anreise und Unterkunft. Persönliche Anfrage senden.', titleEn: 'Destination Wedding Photography & Films | Mario Schubert', descriptionEn: 'Wedding photography beyond Tyrol and Bavaria. Coverage, travel and accommodation planned individually. Send your personal enquiry.' },
  '/impressum': { key: 'imprint', label: 'Impressum', title: 'Impressum | Mario Schubert Fotografie, Söll', description: 'Kontakt und Anbieterangaben: Mario Schubert Fotografie, Hauning 30a, 6306 Söll, Tirol, Österreich.', titleEn: 'Legal Notice | Mario Schubert Photography, Söll', descriptionEn: 'Business and contact information: Mario Schubert Photography, Hauning 30a, 6306 Söll, Tyrol, Austria.' },
  '/datenschutz': { key: 'privacy', label: 'Datenschutz', title: 'Datenschutzerklärung | Mario Schubert Fotografie', description: 'Informationen über Datenschutz, Cookies, Kundenportal und freiwillige Webanalyse auf der Website von Mario Schubert.', titleEn: 'Privacy Policy | Mario Schubert Photography', descriptionEn: 'Information about privacy, cookies, the customer portal and optional analytics on Mario Schubert’s website.' },
  '/kontakt': { key: 'contact', label: 'Kontakt', title: 'Kontakt & Hochzeitsanfrage | Mario Schubert', description: 'Hochzeit, Tierfotografie oder persönliches Shooting anfragen. Mario Schubert aus Söll am Wilden Kaiser meldet sich persönlich bei euch.', titleEn: 'Contact & Wedding Enquiries | Mario Schubert', descriptionEn: 'Enquire about a wedding, animal photography or a personal session. Mario Schubert from Söll near the Wilder Kaiser will reply personally.' },
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
  return withRelaunchDefaults({ ...document, stories });
}
export function businessSchema() {
  return { '@context': 'https://schema.org', '@graph': [
    { '@type': 'ProfessionalService', '@id': SITE_ORIGIN + '/#business', name: business.name, url: SITE_ORIGIN + '/', description: 'Hochzeitsfotografie und Film aus Söll am Wilden Kaiser. Auch Porträts und Tierfotografie in Tirol und Bayern.', telephone: business.telephone, email: business.email, address: { '@type': 'PostalAddress', streetAddress: business.street, postalCode: business.postalCode, addressLocality: business.city, addressRegion: 'Tirol', addressCountry: 'AT' }, areaServed: business.areas.map(name => ({ '@type': 'Place', name })), sameAs: ['https://www.instagram.com/marioschub/'], founder: { '@id': SITE_ORIGIN + '/#mario' } },
    { '@type': 'WebSite', '@id': SITE_ORIGIN + '/#website', url: SITE_ORIGIN + '/', name: 'Mario Schubert Photography', publisher: { '@id': SITE_ORIGIN + '/#business' }, inLanguage: ['de-AT', 'en'] },
    { '@type': 'Person', '@id': SITE_ORIGIN + '/#mario', name: 'Mario Schubert', url: SITE_ORIGIN + '/ueber-mich', worksFor: { '@id': SITE_ORIGIN + '/#business' } },
  ] };
}
