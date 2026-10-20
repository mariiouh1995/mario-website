import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { useContactModal } from './ContactModal';
import { usePageContent } from './storyblok';

export function RegionalSection({ wedding = false }: { wedding?: boolean }) {
  const { lang } = useLanguage();
  const { getText: text } = usePageContent('region', lang);
  const { openContact } = useContactModal();
  return <section className="public-section"><div className="public-inner">
    <div className="public-section-heading"><h2>{text('title', '')}</h2><p>{text('intro', '')}</p></div>
    <div className="public-services">{[1, 2, 3].map(index => <div key={index}><h3>{text(`area${index}_title`, '')}</h3><p>{text(`area${index}_text`, '')}</p></div>)}</div>
    <div className="public-actions"><button className="public-text-link" onClick={() => openContact(wedding ? 'wedding' : 'general')}>{text('cta', '')}<ArrowRight size={16} /></button><Link className="public-text-link" to={wedding ? '/destination-wedding' : '/hochzeiten'}>{text(wedding ? 'destination_link' : 'wedding_link', '')}<ArrowRight size={16} /></Link></div>
  </div></section>;
}
