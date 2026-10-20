import { getConsent } from './consent';
import { publicPaths } from '../../content/seo';
const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-YPBWYFCNYX';
const validId = /^G-[A-Z0-9]+$/.test(measurementId);
const privateRoute = (path: string) => /^\/(admin|kundenportal|angebot)(\/|$)/.test(path);
let initialized = false;
let lastPage = '';
const allowed = () => validId && publicPaths.includes(location.pathname) && !new URLSearchParams(location.search).has('cms-preview') && getConsent()?.analytics === true;
const disabledKey = `ga-disable-${measurementId}`;
declare global { interface Window { dataLayer: any[]; gtag: (...args: any[]) => void; } }
function clearAnalyticsCookies() {
  const hosts = location.hostname.split('.');
  const domains = ['', location.hostname, ...hosts.map((_, index) => '.' + hosts.slice(index).join('.'))];
  for (const entry of document.cookie.split(';')) {
    const name = entry.trim().split('=')[0];
    if (!/^(_ga(?:_|$)|_gid$|_gat)/.test(name)) continue;
    for (const domain of domains) document.cookie = `${name}=; Max-Age=0; path=/${domain ? '; domain=' + domain : ''}; SameSite=Lax`;
  }
}
export function updateGoogleConsent() {
  (window as any)[disabledKey] = !allowed();
  if (!allowed()) {
    if (initialized) window.gtag?.('consent', 'update', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    clearAnalyticsCookies();
    return;
  }
  if (!initialized) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    window.gtag('consent', 'update', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    window.gtag('js', new Date());
    window.gtag('config', measurementId, { send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false, cookie_expires: 15552000, cookie_update: false, page_location: location.origin + location.pathname, page_referrer: '' });
    const script = document.createElement('script');
    script.id = 'mario-analytics';
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(measurementId);
    document.head.appendChild(script);
    initialized = true;
  } else window.gtag('consent', 'update', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
  trackPageView(location.pathname);
}
export function trackPageView(url: string, title?: string) {
  const path = url.split(/[?#]/)[0];
  if (!allowed() || privateRoute(path) || !initialized) return;
  if (lastPage === path) return;
  lastPage = path;
  window.gtag('event', 'page_view', { page_location: location.origin + path, page_title: title || document.title, send_to: measurementId });
}
export function restoreConsentFromStorage() { updateGoogleConsent(); }
export function trackLeadEvent(event: 'form_start' | 'form_submit_success', leadType: string) {
  if (!allowed() || !initialized || !['wedding', 'animal', 'portrait', 'general'].includes(leadType)) return;
  window.gtag('event', event, { lead_type: leadType, page_location: location.origin + location.pathname, send_to: measurementId });
}
if (typeof window !== 'undefined') window.addEventListener('mario:consent', updateGoogleConsent);
