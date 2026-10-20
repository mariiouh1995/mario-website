import { useSyncExternalStore, type IframeHTMLAttributes } from 'react';
import { Play } from 'lucide-react';
import { getConsent, openConsentSettings, subscribeConsent } from './consent';
import { useLanguage } from './LanguageContext';
import { youtubeEmbedUrl } from '../../content/youtube';

export function ConsentVideo(props: IframeHTMLAttributes<HTMLIFrameElement>) {
  const consent = useSyncExternalStore(subscribeConsent, getConsent, () => null);
  const { lang } = useLanguage();
  const src = youtubeEmbedUrl(props.src || '');
  if (consent?.externalMedia && src) return <div data-cms-video-src={props.src} className="absolute inset-0"><iframe {...props} src={src} referrerPolicy="no-referrer" /></div>;
  return <div data-cms-video-src={props.src} className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#f0f1ef] p-5 text-center text-black">
    <Play size={25} aria-hidden />
    <p className="text-sm">{src ? (lang === 'de' ? 'Dieses Video wird von YouTube geladen.' : 'This video is hosted by YouTube.') : (lang === 'de' ? 'Dieses Video ist derzeit nicht verfügbar.' : 'This video is currently unavailable.')}</p>
    {src && <button onClick={openConsentSettings} className="rounded-md border border-black/25 bg-white px-4 py-2 text-sm">{lang === 'de' ? 'Video-Einstellungen öffnen' : 'Open video settings'}</button>}
  </div>;
}
