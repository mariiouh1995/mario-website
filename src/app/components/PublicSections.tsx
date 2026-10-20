import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight, Plus } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { usePageContent } from './storyblok';
import { useLanguage } from './LanguageContext';
import { useContactModal, type InquiryCategory } from './ContactModal';
import { useImages } from './useImages';
import { MasonryGrid } from './MasonryGrid';
import { Lightbox, useLightbox } from './Lightbox';
import { useSiteDocument } from '../../content/use-site-document';
import '../../styles/public-pages.css';

export function PublicHero({ page, image, contain = false, home = false }: { page: string; image: string; contain?: boolean; home?: boolean }) {
  const { lang } = useLanguage();
  const { getText, getAsset, bindText } = usePageContent(page, lang);
  const category: InquiryCategory = page === 'animals' ? 'animal' : page === 'portrait' ? 'portrait' : 'wedding';
  const { openContact } = useContactModal();
  return <section className={`public-hero ${home ? 'public-hero-home' : ''}`}>
    <ImageWithFallback src={getAsset('hero_image', image)} alt={getText('hero_alt', '')} fetchPriority="high" className={`public-hero-image ${(home || page === 'weddings') ? 'public-hero-desktop' : ''} ${contain ? 'public-hero-contain' : ''}`} />
    {(home || page === 'weddings') && <ImageWithFallback src={getAsset('hero_mobile_image', image)} alt="" fetchPriority="high" className="public-hero-image public-hero-mobile" />}
    <div className="public-hero-shade" />
    <div className="public-hero-copy">
      <h1 {...bindText('hero_title')}>{getText('hero_title', 'Mario Schubert Photography')}</h1>
      <p className="public-hero-tagline" {...bindText(home ? 'hero_tagline' : 'hero_subtitle')}>{getText(home ? 'hero_tagline' : 'hero_subtitle', '')}</p>
      {home && <p className="public-hero-intro" {...bindText('hero_intro')}>{getText('hero_intro', '')}</p>}
      <div className="public-actions">
        <button {...bindText(home ? 'hero_cta' : 'cta_button')} className="public-button public-button-light" onClick={() => openContact(category)}>{getText(home ? 'hero_cta' : 'cta_button', lang === 'de' ? 'Anfragen' : 'Enquire')}<ArrowRight size={17} /></button>
        {home && <Link {...bindText('hero_secondary')} className="public-text-link" to="/hochzeiten">{getText('hero_secondary', '')}<ArrowRight size={16} /></Link>}
      </div>
    </div>
  </section>;
}

export function PublicCTA({ page, category = 'general' }: { page: string; category?: InquiryCategory }) {
  const { lang } = useLanguage();
  const { getText, bindText } = usePageContent(page, lang);
  const { openContact } = useContactModal();
  return <section className="public-section public-cta"><div className="public-inner public-narrow">
    <h2 {...bindText('cta_title')}>{getText('cta_title', '')}</h2><p {...bindText('cta_text')}>{getText('cta_text', '')}</p>
    <div className="public-actions"><button {...bindText('cta_button')} className="public-button public-button-light" onClick={() => openContact(category)}>{getText('cta_button', lang === 'de' ? 'Anfragen' : 'Enquire')}<ArrowRight size={17} /></button>
      <Link className="public-text-link" to={`/kontakt?thema=${category}`}>{lang === 'de' ? 'Zur Kontaktseite' : 'Go to contact page'}<ArrowRight size={16} /></Link></div>
  </div></section>;
}

export function PublicFAQ({ page, count }: { page: string; count: number }) {
  const { lang } = useLanguage();
  const { getText, bindText } = usePageContent(page, lang);
  const document = useSiteDocument();
  const migrated = document.stories.find(story => story.full_slug === 'pages/home')?.content.relaunch_version === 1;
  const stories = document.stories.filter(story => story.content.component === 'faq_item' && story.content.public_visible !== false && story.content.relaunch_page === page).sort((a, b) => Number(a.content.sort_order) - Number(b.content.sort_order));
  if (migrated && !stories.length) return null;
  return <section className="public-section public-soft"><div className="public-inner public-narrow"><h2 {...bindText('faq_title')}>{getText('faq_title', '')}</h2>
    <div className="public-faq">{(migrated ? stories : Array.from({ length: count }, () => null)).map((story, index) => <details key={story?.full_slug || index}>
      <summary><h3 {...(story ? { 'data-cms-source-story': story.full_slug, 'data-cms-source-field': `question_${lang}` } : bindText(`faq${index + 1}_question`))}>{story ? story.content[`question_${lang}`] : getText(`faq${index + 1}_question`, '')}</h3><Plus size={18} aria-hidden="true" /></summary>
      <p {...(story ? { 'data-cms-source-story': story.full_slug, 'data-cms-source-field': `answer_${lang}` } : bindText(`faq${index + 1}_answer`))}>{story ? story.content[`answer_${lang}`] : getText(`faq${index + 1}_answer`, '')}</p>
    </details>)}</div>
  </div></section>;
}

const weddingCategories = ['paarshooting', 'freie-trauung', 'kirchliche-trauung', 'getting-ready', 'standesamt', 'party'];
const categoryLabels = [['Alle', 'All'], ['Paarporträts', 'Couple portraits'], ['Freie Trauung', 'Outdoor ceremony'], ['Kirchliche Trauung', 'Church ceremony'], ['Getting Ready', 'Getting ready'], ['Standesamt', 'Civil ceremony'], ['Feier', 'Celebration']];
export function PublicGallery({ page, gallery, filter = false, id }: { page: string; gallery: 'hochzeit' | 'tiere' | 'portrait'; filter?: boolean; id?: string }) {
  const { lang } = useLanguage();
  const { getText } = usePageContent(page, lang);
  const { getImagesForPage } = useImages();
  const [category, setCategory] = useState('all');
  const [count, setCount] = useState(12);
  const { open, index, openLightbox, closeLightbox } = useLightbox();
  const images = useMemo(() => getImagesForPage(gallery, undefined, lang).filter(image => category === 'all' || image.category === category), [getImagesForPage, gallery, lang, category]);
  return <section id={id} className="public-section"><div className="public-inner">
    <div className="public-section-heading"><h2>{getText(page === 'home' ? 'inspired_title' : 'gallery_title', '')}</h2><p>{getText('gallery_intro', '')}</p></div>
    {filter && <div className="public-filters" aria-label={lang === 'de' ? 'Galerie filtern' : 'Filter gallery'}>{['all', ...weddingCategories].map((key, i) => <button key={key} aria-pressed={category === key} onClick={() => { setCategory(key); setCount(12); }}>{getText(`gallery_filter_${key}`, categoryLabels[i][lang === 'de' ? 0 : 1])}</button>)}</div>}
    <MasonryGrid images={images.slice(0, count)} openLightbox={openLightbox} />
    {count < images.length && <div className="public-actions public-center"><button className="public-button" onClick={() => setCount(value => value + 12)}>{getText('load_more', lang === 'de' ? 'Weitere Bilder ansehen' : 'View more photographs')}<Plus size={16} /></button></div>}
    <Lightbox images={images} initialIndex={index} open={open} onClose={closeLightbox} />
  </div></section>;
}
