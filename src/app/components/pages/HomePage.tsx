import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { usePageContent } from '../storyblok';
import { SEO } from '../SEO';
import { PublicHero, PublicGallery, PublicCTA } from '../PublicSections';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { RegionalSection } from '../RegionalSection';
import { GoogleReviewsGrid } from '../GoogleReviews';

export function HomePage() {
  const { lang } = useLanguage();
  const { getText: text, getAsset: asset } = usePageContent('home', lang);
  return <>
    <SEO title="Mario Schubert Photography" description={text('hero_intro', '')} canonical="/" lang={lang} />
    <PublicHero page="home" home image="https://ik.imagekit.io/r2yqrg6np/Wedding/Paarfotos/E00A5635-2.jpg" />
    <PublicGallery page="home" gallery="hochzeit" />
    <section className="public-section public-soft"><div className="public-inner public-narrow"><h2>{text('philosophy_title', '')}</h2><p>{text('philosophy_text', '')}</p>
      <div className="public-actions"><Link to="/hochzeiten" className="public-text-link">{text('hero_secondary', '')}<ArrowRight size={16} /></Link></div>
    </div></section>
    <section className="public-section"><div className="public-inner public-split">
      <ImageWithFallback src={asset('about_image', 'https://ik.imagekit.io/r2yqrg6np/68e54c497a9dde9d00252dcb_WhatsApp%20Image%202025-09-16%20at%2022.32.17.avif')} alt={text('about_image_alt', 'Mario Schubert')} className="public-split-image" loading="lazy" />
      <div><h2>{text('about_title', '')}</h2><p>{text('about_text', '')}</p><div className="public-actions"><Link to="/ueber-mich" className="public-button">{text('about_cta', '')}<ArrowRight size={16} /></Link></div></div>
    </div></section>
    <section className="public-section public-soft"><div className="public-inner"><h2>{text('services_title', '')}</h2><div className="public-services">
      {[
        ['wedding', '/hochzeiten', 'https://ik.imagekit.io/r2yqrg6np/Wedding/Paarfotos/250830_LJ_151924_0405(LowRes).jpg'],
        ['animals', '/tierfotografie', 'https://ik.imagekit.io/r2yqrg6np/Tiere/20251019_R52_1038_(WebRes).jpg'],
        ['portrait', '/portrait', 'https://ik.imagekit.io/r2yqrg6np/Other/R52_0832.jpg'],
      ].map(([key, link, image]) => <article key={key}>
        <Link to={link}><ImageWithFallback src={asset(key + '_image', image)} alt={text(key + '_image_alt', '')} className="public-service-image" loading="lazy" /></Link>
        <h3>{text(key + '_title', '')}</h3><p>{text(key + '_desc', '')}</p><Link to={link} className="public-text-link">{text('view_more', '')}<ArrowRight size={16} /></Link>
      </article>)}
    </div></div></section>
    <RegionalSection />
    <GoogleReviewsGrid count={3} topic="wedding" />
    <PublicCTA page="home" category="wedding" />
  </>;
}
