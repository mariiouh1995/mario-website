import { useLanguage } from '../LanguageContext';
import { usePageContent } from '../storyblok';
import { SEO } from '../SEO';
import { PublicHero, PublicGallery, PublicFAQ, PublicCTA } from '../PublicSections';
import { ImageWithFallback } from '../figma/ImageWithFallback';

export function AnimalsPage() {
  const { lang } = useLanguage();
  const { getText: text, getAsset: asset } = usePageContent('animals', lang);
  return <>
    <SEO title="Tierfotografie | Mario Schubert" description={text('intro', '')} canonical="/tierfotografie" lang={lang} />
    <PublicHero page="animals" image="https://ik.imagekit.io/r2yqrg6np/Tiere/20251019_R52_1038_(WebRes).jpg" />
    <section className="public-section"><div className="public-inner public-narrow"><p>{text('intro', '')}</p></div></section>
    <section className="public-section public-soft"><div className="public-inner public-split">
      <ImageWithFallback src={asset('outdoor_image', 'https://ik.imagekit.io/r2yqrg6np/Tiere/20251019_R52_1038_(WebRes).jpg')} alt={text('outdoor_alt', '')} className="public-split-image" loading="lazy" />
      <div><h2>{text('approach_title', '')}</h2><p>{text('approach_text', '')}</p><h3 className="mt-8">{text('packages_title', '')}</h3><p>{text('packages_intro', '')}</p><p>{text('travel_note', '')}</p></div>
    </div></section>
    <PublicGallery page="animals" gallery="tiere" />
    <PublicFAQ page="animals" count={5} />
    <PublicCTA page="animals" category="animal" />
  </>;
}
