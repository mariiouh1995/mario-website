export const CONSENT_KEY = 'ms-cookie-consent';
export const CONSENT_VERSION = 2;
const lifetime = 180 * 24 * 60 * 60 * 1000;
export type Consent = { version: number; necessary: true; analytics: boolean; externalMedia: boolean; timestamp: string };
const listeners = new Set<() => void>();
let memory: Consent | null | undefined;

export function parseConsent(raw: string | null, now = Date.now()): Consent | null {
  try {
    const consent = JSON.parse(raw || 'null');
    const timestamp = Date.parse(consent?.timestamp);
    if (consent?.version !== CONSENT_VERSION || consent.necessary !== true || typeof consent.analytics !== 'boolean' || typeof consent.externalMedia !== 'boolean' || !Number.isFinite(timestamp) || timestamp > now || now - timestamp > lifetime) return null;
    return consent;
  } catch { return null; }
}
export function getConsent() {
  if (memory === undefined) { try { memory = parseConsent(localStorage.getItem(CONSENT_KEY)); } catch { memory = null; } }
  return memory;
}
export function subscribeConsent(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; }
export function saveConsent(choices: { analytics: boolean; externalMedia: boolean }) {
  memory = { version: CONSENT_VERSION, necessary: true, ...choices, timestamp: new Date().toISOString() };
  try { localStorage.setItem(CONSENT_KEY, JSON.stringify(memory)); } catch { /* Choices still apply for this page visit. */ }
  listeners.forEach(listener => listener());
  window.dispatchEvent(new Event('mario:consent'));
}
if (typeof window !== 'undefined') window.addEventListener('storage', event => {
  if (event.key === CONSENT_KEY || event.key === null) { memory = undefined; getConsent(); listeners.forEach(listener => listener()); window.dispatchEvent(new Event('mario:consent')); }
});
export const openConsentSettings = () => window.dispatchEvent(new Event('mario:consent-settings'));
