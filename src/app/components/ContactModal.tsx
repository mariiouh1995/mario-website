import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Send, CheckCircle, Loader2 } from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { usePackages } from './usePackages';
import { usePageContent } from './storyblok';
import { trackLeadEvent } from './analytics';
import '../../styles/public-pages.css';

export type InquiryCategory = 'wedding' | 'animal' | 'portrait' | 'general';
type Topic = 'wedding-photo' | 'wedding-film' | 'wedding-both' | 'animal' | 'portrait' | 'general';
const topics: [Topic, string, string][] = [
  ['wedding-photo', 'Hochzeit Foto', 'Wedding photography'], ['wedding-film', 'Hochzeit Film', 'Wedding film'], ['wedding-both', 'Hochzeit Foto + Film', 'Wedding photography + film'],
  ['animal', 'Tierfotografie', 'Animal photography'], ['portrait', 'Paare & Porträts', 'Couples & portraits'], ['general', 'Sonstiges', 'Other'],
];
const ContactContext = createContext<{ openContact: (category?: InquiryCategory, service?: string, topic?: Topic) => void; closeContact: () => void }>({ openContact: () => {}, closeContact: () => {} });
export const useContactModal = () => useContext(ContactContext);

export function ContactForm({ category = 'general', service = '', initialTopic }: { category?: InquiryCategory; service?: string; initialTopic?: Topic }) {
  const { lang } = useLanguage();
  const { getText: text } = usePageContent('contact', lang);
  const { packages } = usePackages();
  const [topic, setTopic] = useState<Topic>(initialTopic || (category === 'wedding' ? 'wedding-photo' : category));
  const [selected, setSelected] = useState(service);
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const started = useRef(false);
  const wedding = topic.startsWith('wedding');
  const options = topic === 'animal' ? packages.animals : topic === 'portrait' ? packages.portrait : wedding && topic !== 'wedding-film' ? packages.weddingPhoto : [];
  const eventType = topic.startsWith('wedding') ? 'wedding' : topic;
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === 'sending') return;
    const values = Object.fromEntries(new FormData(event.currentTarget));
    const scope = String(values.scope || '');
    const message = [String(values.message || '').trim(), scope && `Gewünschter Umfang: ${scope}`, values.meeting && `Kennenlernen gewünscht: ${values.meeting}`].filter(Boolean).join('\n\n');
    const payload = { name: String(values.name).trim(), email: String(values.email).trim(), phone: String(values.phone || '').trim(), date: String(values.date || '').trim(), locationAddress: String(values.location || '').trim(), interests: [topics.find(row => row[0] === topic)![1]], message, foundVia: String(values.foundVia || ''), selectedPackages: selected ? [{ name: selected, price: lang === 'de' ? 'Auf Anfrage' : 'On request' }] : [], selectedAddons: [], weddingGuide: values.guide === 'on', estimatedTotal: '', website: String(values.website || '') };
    setStatus('sending');
    try {
      const response = await fetch('/api/submit-inquiry', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), signal: AbortSignal.timeout(45000) });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error('Inquiry not saved');
      setStatus('success');
      trackLeadEvent('form_submit_success', eventType);
      // Notify only after the CRM has confirmed receipt; a mail failure never loses a lead.
      void fetch('/api/send-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), signal: AbortSignal.timeout(30000), keepalive: true }).catch(() => {});
    } catch { setStatus('error'); }
  };
  if (status === 'success') return <div className="public-form-success" role="status" tabIndex={-1}><CheckCircle size={32} aria-hidden="true" /><h2>{text('success_title', '')}</h2><p>{text('success_text', '')}</p></div>;
  return <form className="public-form" onSubmit={submit} onChange={() => { if (!started.current) { started.current = true; trackLeadEvent('form_start', eventType); } }} aria-busy={status === 'sending'}>
    <div className="public-honeypot" aria-hidden="true"><label htmlFor="contact-website">Website</label><input id="contact-website" name="website" autoComplete="off" tabIndex={-1} /></div>
    <div><label htmlFor="contact-topic">{text('topic_label', '')}</label><select id="contact-topic" name="topic" value={topic} onChange={event => { setTopic(event.target.value as Topic); setSelected(''); }}>{topics.map(([key, de, en]) => <option key={key} value={key}>{text('topic_' + key, lang === 'de' ? de : en)}</option>)}</select></div>
    <div className="public-form-grid">
      <div><label htmlFor="contact-name">{text('name_label', '')} *</label><input id="contact-name" name="name" required autoComplete="name" maxLength={160} /></div>
      <div><label htmlFor="contact-email">{text('email_label', '')} *</label><input id="contact-email" name="email" type="email" required autoComplete="email" maxLength={254} /></div>
    </div>
    <div><label htmlFor="contact-phone">{text('phone_label', '')}</label><input id="contact-phone" name="phone" type="tel" autoComplete="tel" maxLength={80} /></div>
    <div className="public-form-grid">
      <div><label htmlFor="contact-date">{text('date_label', '')}{wedding && ' *'}</label><input id="contact-date" name="date" required={wedding} maxLength={120} aria-describedby="contact-date-help" /><p id="contact-date-help" className="public-form-help">{text('date_help', '')}</p></div>
      <div><label htmlFor="contact-location">{text('location_label', '')}{wedding && ' *'}</label><input id="contact-location" name="location" required={wedding} maxLength={300} /></div>
    </div>
    {wedding && <div><label htmlFor="contact-scope">{text('scope_label', '')}</label><select id="contact-scope" name="scope"><option value="">{text('scope_open', lang === 'de' ? 'Noch offen' : 'Not decided yet')}</option>{['2–4 h', '6–8 h', '10–12 h'].map(value => <option key={value}>{value}</option>)}</select></div>}
    {options.length > 0 && <div><label htmlFor="contact-package">{text('package_label', '')}</label><select id="contact-package" value={selected} onChange={event => setSelected(event.target.value)}><option value="">{text('package_open', lang === 'de' ? 'Noch offen / individuell' : 'Not decided / individual')}</option>{options.map(pkg => <option key={pkg.name} value={pkg.name}>{lang === 'de' ? pkg.name : pkg.nameEn}</option>)}</select></div>}
    <div><label htmlFor="contact-message">{text('message_label', '')} *</label><textarea id="contact-message" name="message" required maxLength={5000} aria-describedby="contact-message-help" /><p id="contact-message-help" className="public-form-help">{text('message_help', '')}</p></div>
    <div><label htmlFor="contact-meeting">{text('meeting_label', '')}</label><input id="contact-meeting" name="meeting" maxLength={200} /></div>
    {wedding && <label className="public-checkbox"><input type="checkbox" name="guide" /><span>{text('guide_label', '')}</span></label>}
    <label className="public-checkbox"><input type="checkbox" name="privacy" required /><span>{text('privacy_text', '')} <a href="/datenschutz" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">{text('privacy_link', '')}</a> *</span></label>
    {status === 'error' && <p role="alert" className="public-error">{text('error_text', '')} <a href="mailto:servus@marioschub.com">servus@marioschub.com</a></p>}
    <button type="submit" disabled={status === 'sending'} className="public-button">{status === 'sending' ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}{text(status === 'sending' ? 'sending' : 'submit', '')}</button>
  </form>;
}

export function ContactModalProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ open: boolean; category: InquiryCategory; service: string; topic?: Topic; version: number }>({ open: false, category: 'general', service: '', version: 0 });
  const returnFocus = useRef<HTMLElement | null>(null);
  const { lang } = useLanguage();
  const { getText: text } = usePageContent('contact', lang);
  const openContact = useCallback((category: InquiryCategory = 'general', service = '', topic?: Topic) => { returnFocus.current = document.activeElement as HTMLElement; setState(prev => ({ open: true, category, service, topic, version: prev.version + 1 })); }, []);
  const closeContact = useCallback(() => setState(prev => ({ ...prev, open: false })), []);
  return <ContactContext.Provider value={{ openContact, closeContact }}>{children}
    <Dialog.Root open={state.open} onOpenChange={open => { if (!open) closeContact(); }}><Dialog.Portal><Dialog.Overlay className="public-contact-modal">
      <Dialog.Content className="public-contact-dialog" onCloseAutoFocus={event => { event.preventDefault(); returnFocus.current?.focus(); }}>
        <Dialog.Title>{text('title', '')}</Dialog.Title><Dialog.Description>{text('intro', '')}</Dialog.Description>
        <Dialog.Close className="public-contact-close" aria-label={lang === 'de' ? 'Schließen' : 'Close'}><X size={22} /></Dialog.Close>
        <ContactForm key={state.version} category={state.category} service={state.service} initialTopic={state.topic} />
      </Dialog.Content>
    </Dialog.Overlay></Dialog.Portal></Dialog.Root>
  </ContactContext.Provider>;
}
