import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { usePageContent } from '../storyblok';
import { SEO } from '../SEO';
import { PublicCTA } from '../PublicSections';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { RegionalSection } from '../RegionalSection';

export function AboutPage() {
  const { lang } = useLanguage();
  const { getText: text, getAsset: asset } = usePageContent('about', lang);
  return <>
    <SEO title="Über Mario Schubert" description={text('text1', '')} canonical="/ueber-mich" lang={lang} />
    <section className="public-section"><div className="public-inner public-split">
      <div><h1 className="text-3xl md:text-4xl font-normal leading-tight mb-8">{text('heading', '')}</h1><p>{text('text1', '')}</p><h2 className="mt-10">{text('philosophy_title', '')}</h2><p>{text('text2', '')}</p><p>{text('text3', '')}</p></div>
      <ImageWithFallback src={asset('portrait_image', 'https://ik.imagekit.io/r2yqrg6np/68e54c497a9dde9d00252dcb_WhatsApp%20Image%202025-09-16%20at%2022.32.17.avif')} alt={text('portrait_alt', 'Mario Schubert')} className="public-split-image" fetchPriority="high" />
    </div></section>
    <RegionalSection />
    <section className="public-section public-soft"><div className="public-inner public-split">
      <ImageWithFallback src={asset('mario_action_image', asset('portrait_image', ''))} alt={text('action_alt', '')} className="public-split-image" loading="lazy" />
      <div><h2>{text('passion_title', '')}</h2><p>{text('passion_text1', '')}</p><p>{text('passion_text2', '')}</p><div className="public-actions"><Link to="/tierfotografie" className="public-text-link">{text('passion_cta', lang === 'de' ? 'Tierfotografie entdecken' : 'Explore animal photography')}<ArrowRight size={16} /></Link><a className="public-text-link" href="https://www.wyldworks.de/" target="_blank" rel="noopener noreferrer">wyldworks.de<ArrowRight size={16} /></a></div></div>
    </div></section>
    <PublicCTA page="about" />
  </>;
}
