import { useEffect, useState, useSyncExternalStore } from 'react';
import { Link } from 'react-router';
import { Cookie, X } from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { getConsent, openConsentSettings, saveConsent, subscribeConsent } from './consent';

export function CookieBanner({ preview = false }: { preview?: boolean }) {
  const { lang } = useLanguage();
  const consent = useSyncExternalStore(subscribeConsent, getConsent, () => null);
  const [opened, setOpened] = useState(false);
  const [details, setDetails] = useState(false);
  const [choices, setChoices] = useState({ analytics: consent?.analytics || false, externalMedia: consent?.externalMedia || false });
  const de = lang === 'de';
  useEffect(() => {
    const open = () => { const saved = getConsent(); setChoices({ analytics: saved?.analytics || false, externalMedia: saved?.externalMedia || false }); setDetails(true); setOpened(true); };
    window.addEventListener('mario:consent-settings', open);
    return () => window.removeEventListener('mario:consent-settings', open);
  }, []);
  const choose = (next: typeof choices) => { saveConsent(next); setOpened(false); setDetails(false); };
  const visible = (!consent && !preview) || opened;
  return <>
    <button type="button" data-cms-ignore onClick={openConsentSettings} className="fixed bottom-3 left-3 z-[9980] inline-flex items-center gap-2 rounded-md border border-black/15 bg-white px-3 py-2 text-xs text-black shadow-sm" title={de ? 'Cookie-Einstellungen' : 'Cookie settings'}><Cookie size={16} /><span className="hidden sm:inline">{de ? 'Cookie-Einstellungen' : 'Cookie settings'}</span></button>
    {visible && <section role="dialog" aria-modal="false" aria-labelledby="cookie-title" className="fixed bottom-0 left-0 right-0 z-[9998] max-h-[90vh] overflow-y-auto border-t border-black/15 bg-white p-5 shadow-xl md:p-7" data-cms-ignore>
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between gap-4"><h2 id="cookie-title" className="flex items-center gap-2 text-lg font-medium"><Cookie size={20} />{de ? 'Deine Privatsphäre' : 'Your privacy'}</h2>{(consent || preview) && <button onClick={() => setOpened(false)} aria-label={de ? 'Schließen' : 'Close'} className="p-2"><X size={18} /></button>}</div>
        <p className="mt-3 text-sm leading-relaxed text-black/65">{de ? 'Notwendige Funktionen und deine Auswahl werden ohne zusätzliche Zustimmung gespeichert. Google Analytics und externe Videos werden nur mit deiner Einwilligung geladen. Du kannst deine Auswahl jederzeit ändern.' : 'Necessary functions and your preferences are stored without additional consent. Google Analytics and external videos load only with your permission. You can change your choices at any time.'} <Link className="underline" to="/datenschutz">{de ? 'Datenschutz' : 'Privacy policy'}</Link></p>
        {details && <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <label className="flex items-start gap-2 text-sm"><input type="checkbox" checked disabled /><span>{de ? 'Notwendig' : 'Necessary'}<small className="mt-1 block text-black/55">{de ? 'Cookie-Auswahl und geschützte Kunden- / Adminbereiche.' : 'Privacy choices and protected customer / admin areas.'}</small></span></label>
          <label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={choices.analytics} onChange={event => setChoices({ ...choices, analytics: event.target.checked })} /><span>Google Analytics<small className="mt-1 block text-black/55">{de ? 'Freiwillige Reichweitenanalyse. Keine Werbepersonalisierung.' : 'Optional audience analytics. No advertising personalization.'}</small></span></label>
          <label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={choices.externalMedia} onChange={event => setChoices({ ...choices, externalMedia: event.target.checked })} /><span>{de ? 'Externe Videos' : 'External videos'}<small className="mt-1 block text-black/55">{de ? 'YouTube-Videos. Dabei werden Daten an Google übermittelt.' : 'YouTube videos. Loading transfers data to Google.'}</small></span></label>
        </div>}
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <button className="flex-1 rounded-md border border-black px-4 py-3 text-sm" onClick={() => choose({ analytics: false, externalMedia: false })}>{de ? 'Alle ablehnen' : 'Reject all'}</button>
          <button className="flex-1 rounded-md border border-black px-4 py-3 text-sm" onClick={() => details ? choose(choices) : setDetails(true)}>{details ? (de ? 'Auswahl speichern' : 'Save choices') : (de ? 'Einstellungen' : 'Settings')}</button>
          <button className="flex-1 rounded-md border border-black px-4 py-3 text-sm" onClick={() => choose({ analytics: true, externalMedia: true })}>{de ? 'Alle akzeptieren' : 'Accept all'}</button>
        </div>
      </div>
    </section>}
  </>;
}
