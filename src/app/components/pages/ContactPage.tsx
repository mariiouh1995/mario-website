import { useSearchParams } from 'react-router';
import { Mail, Phone } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { usePageContent } from '../storyblok';
import { ContactForm, type InquiryCategory } from '../ContactModal';
import { SEO } from '../SEO';

export function ContactPage() {
  const { lang } = useLanguage();
  const { getText: text } = usePageContent('contact', lang);
  const [params] = useSearchParams();
  const requested = params.get('thema') || 'general';
  const category: InquiryCategory = ['wedding', 'animal', 'portrait'].includes(requested) ? requested as InquiryCategory : 'general';
  return <><SEO title="Kontakt | Mario Schubert" description={text('intro', '')} canonical="/kontakt" lang={lang} />
    <section className="public-section"><div className="public-inner public-narrow"><h1 className="text-3xl md:text-4xl font-normal leading-tight mb-6">{text('title', '')}</h1><p className="mb-10">{text('intro', '')}</p><ContactForm key={category} category={category} />
      <div className="public-notice"><h2>{text('direct_title', '')}</h2><div className="public-actions"><a href="mailto:servus@marioschub.com" className="public-text-link"><Mail size={18} />servus@marioschub.com</a><a href="tel:+4367763681543" className="public-text-link"><Phone size={18} />+43 67763681543</a></div></div>
    </div></section>
  </>;
}
