import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { usePageContent } from '../storyblok';
import { SEO } from '../SEO';
import { PublicHero, PublicGallery, PublicFAQ, PublicCTA } from '../PublicSections';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { usePackages } from '../usePackages';
import { useContactModal } from '../ContactModal';
import { RegionalSection } from '../RegionalSection';
import { GoogleReviewsGrid } from '../GoogleReviews';
import { ConsentVideo } from '../ConsentVideo';

export function WeddingsPage() {
  const { lang } = useLanguage();
  const { getText: text, getAsset: asset } = usePageContent('weddings', lang);
  const { packages } = usePackages();
  const { openContact } = useContactModal();
  return <>
    <SEO title="Hochzeitsfotografie | Mario Schubert" description={text('intro', '')} canonical="/hochzeiten" lang={lang} />
    <PublicHero page="weddings" image="https://ik.imagekit.io/r2yqrg6np/Wedding/Paarfotos/250830_LJ_152738_0428(LowRes).jpg" />
    <section className="public-section"><div className="public-inner public-narrow"><p>{text('intro', '')}</p><div className="public-actions"><a href="#hochzeitsgalerie" className="public-text-link">{text('gallery_cta', lang === 'de' ? 'Hochzeitsfotos ansehen' : 'View wedding photographs')}<ArrowRight size={16} /></a><a href="#packages" className="public-text-link">{text('packages_title', '')}<ArrowRight size={16} /></a></div></div></section>
    <section className="public-section public-soft"><div className="public-inner public-split">
      <div><h2>{text('style_title', '')}</h2><p>{text('style_text', '')}</p><h3 className="mt-8">{text('story_title', '')}</h3><p>{text('story_text', '')}</p></div>
      <ImageWithFallback src={asset('photo1_image', 'https://ik.imagekit.io/r2yqrg6np/Wedding/Paarfotos/5048_IG.jpg')} alt={text('photo1_alt', '')} className="public-split-image" loading="lazy" />
    </div></section>
    <PublicGallery id="hochzeitsgalerie" page="weddings" gallery="hochzeit" filter />
    <section className="public-section public-soft"><div className="public-inner">
      <div className="public-section-heading"><h2>{text('video_heading', '')}</h2><p>{text('video_text', '')}</p><p>{text('video_note', '')}</p></div>
      <div className="public-video-grid">{['B5ncNtkQkKs', 'aD9G344Yt_o', 'OskCUn4h2cU', '87Ryj3JSUJc', 'EOk9GpvVlRk', '5QN0bcnPFFY'].map((id, index) => <div className="public-video" key={id}><ConsentVideo src={text(`gallery_video_${index + 1}_url`, `https://www.youtube-nocookie.com/embed/${id}?rel=0`)} title={text(`gallery_video_${index + 1}_title`, `Wedding Film ${index + 1}`)} loading="lazy" allowFullScreen /></div>)}</div>
      <div className="public-actions"><button className="public-button" onClick={() => openContact('wedding', '', 'wedding-both')}>{text('film_cta', '')}<ArrowRight size={16} /></button></div>
    </div></section>
    <section className="public-section" id="packages"><div className="public-inner">
      <div className="public-section-heading"><h2>{text('packages_title', '')}</h2><p>{text('packages_intro', '')}</p></div>
      <div className="public-options">{packages.weddingPhoto.map(pkg => <article className={`public-option ${pkg.highlight ? 'public-option-highlight' : ''}`} key={pkg.name}>
        <h3>{lang === 'de' ? pkg.name : pkg.nameEn}</h3><p>{lang === 'de' ? pkg.subtitle : pkg.subtitleEn}</p><ul>{(lang === 'de' ? pkg.features : pkg.featuresEn).map((feature, index) => <li key={index}>{feature}</li>)}</ul>
        <p className="public-price">{lang === 'de' ? 'Auf Anfrage' : 'On request'}</p><div className="public-actions"><button className="public-text-link" onClick={() => openContact('wedding', pkg.name)}>{text('packages_cta', '')}<ArrowRight size={16} /></button></div>
      </article>)}</div>
      <p className="public-notice">{text('travel_note', '')}</p>
      <div className="public-notice"><h3>{text('destination_title', '')}</h3><p>{text('destination_text', '')}</p><Link to="/destination-wedding" className="public-text-link">{text('destination_cta', '')}<ArrowRight size={16} /></Link></div>
    </div></section>
    <section className="public-section public-soft"><div className="public-inner public-narrow"><h2>{text('process_title', '')}</h2><ol className="public-process">{[1, 2, 3, 4, 5].map(index => <li key={index}><h3>{text(`process${index}_title`, '')}</h3><p>{text(`process${index}_text`, '')}</p></li>)}</ol><div className="public-notice"><h3>{text('timeline_title', '')}</h3><p>{text('timeline_intro', '')}</p></div></div></section>
    <GoogleReviewsGrid count={3} topic="wedding" />
    <RegionalSection wedding />
    <PublicFAQ page="weddings" count={8} />
    <PublicCTA page="weddings" category="wedding" />
  </>;
}
