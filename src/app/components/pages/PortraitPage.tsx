import { useLanguage } from '../LanguageContext';
import { usePageContent } from '../storyblok';
import { SEO } from '../SEO';
import { PublicHero, PublicGallery, PublicFAQ, PublicCTA } from '../PublicSections';

export function PortraitPage() {
  const { lang } = useLanguage();
  const { getText: text } = usePageContent('portrait', lang);
  return <>
    <SEO title="Paare & Porträts | Mario Schubert" description={text('intro', '')} canonical="/portrait" lang={lang} />
    <PublicHero page="portrait" image="https://ik.imagekit.io/r2yqrg6np/Other/R52_0832.jpg" contain />
    <section className="public-section"><div className="public-inner public-narrow"><p>{text('intro', '')}</p></div></section>
    <section className="public-section public-soft"><div className="public-inner public-services">{['couple', 'family', 'private'].map(key => <div key={key}><h2>{text(key + '_title', '')}</h2><p>{text(key + '_text', '')}</p></div>)}</div></section>
    <PublicGallery page="portrait" gallery="portrait" />
    <section className="public-section"><div className="public-inner public-narrow"><h2>{text('packages_title', '')}</h2><p>{text('packages_intro', '')}</p><p className="public-price">{text('price_label', lang === 'de' ? 'Auf Anfrage' : 'On request')}</p><p>{text('travel_note', '')}</p><a className="public-text-link" href="https://www.wyldworks.de/" target="_blank" rel="noopener noreferrer">{text('business_cta', lang === 'de' ? 'Foto & Video für Unternehmen: wyldworks.de' : 'Photography & video for businesses: wyldworks.de')}</a></div></section>
    <PublicFAQ page="portrait" count={3} />
    <PublicCTA page="portrait" category="portrait" />
  </>;
}
