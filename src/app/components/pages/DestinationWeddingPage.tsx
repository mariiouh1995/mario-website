import { useLanguage } from '../LanguageContext';
import { usePageContent } from '../storyblok';
import { SEO } from '../SEO';
import { PublicHero, PublicCTA } from '../PublicSections';

export function DestinationWeddingPage() {
  const { lang } = useLanguage();
  const { getText: text } = usePageContent('destination', lang);
  return <>
    <SEO title="Destination Wedding | Mario Schubert" description={text('intro', '')} canonical="/destination-wedding" lang={lang} />
    <PublicHero page="destination" image="https://ik.imagekit.io/r2yqrg6np/Wedding/Paarfotos/E00A5635-2.jpg" />
    <section className="public-section"><div className="public-inner public-narrow"><p>{text('intro', '')}</p></div></section>
    <section className="public-section public-soft"><div className="public-inner public-narrow"><h2>{text('planning_title', '')}</h2><p>{text('planning_text', '')}</p></div></section>
    <section className="public-section"><div className="public-inner public-narrow"><h2>{text('process_title', '')}</h2><p>{text('process_text', '')}</p></div></section>
    <PublicCTA page="destination" category="wedding" />
  </>;
}
