/**
 * Google Analytics 4 – DSGVO-konform mit Consent Mode v2
 *
 * - gtag.js wird in index.html geladen mit consent: 'denied' als Default
 * - Erst wenn der User Analytics-Cookies akzeptiert, wird consent auf 'granted' gesetzt
 * - Page Views werden nur gesendet wenn analytics_storage granted ist
 */

const GA_MEASUREMENT_ID = "G-YPBWYFCNYX";
const COOKIE_CONSENT_KEY = "ms-cookie-consent";

// Type-safe gtag helper
function gtag(...args: any[]) {
  if (typeof window !== "undefined" && window.dataLayer) {
    window.dataLayer.push(arguments);
  }
}

// Extend Window for dataLayer
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

/**
 * Update Google Consent Mode based on user's cookie preferences.
 * Called when:
 *  1. User clicks a consent button in the CookieBanner
 *  2. On app load if consent was previously stored
 */
export function updateGoogleConsent(analytics: boolean, marketing: boolean) {
  gtag("consent", "update", {
    analytics_storage: analytics ? "granted" : "denied",
    ad_storage: marketing ? "granted" : "denied",
    ad_user_data: marketing ? "granted" : "denied",
    ad_personalization: marketing ? "granted" : "denied",
  });

  // If analytics was just granted, send the initial page view
  if (analytics) {
    gtag("event", "page_view", {
      page_location: window.location.href,
      page_title: document.title,
    });
  }
}

/**
 * Send a page_view event (called on route changes).
 * Only fires if analytics_storage is granted (GA handles this internally
 * via Consent Mode, but we also check localStorage as a safety net).
 */
export function trackPageView(url: string, title?: string) {
  try {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!stored) return;
    const consent = JSON.parse(stored);
    if (!consent.analytics) return;
  } catch {
    return;
  }

  gtag("event", "page_view", {
    page_location: `https://marioschub.com${url}`,
    page_title: title || document.title,
    send_to: GA_MEASUREMENT_ID,
  });
}

/**
 * Restore consent state from localStorage on app load.
 * This ensures returning visitors who already accepted get tracked immediately.
 */
export function restoreConsentFromStorage() {
  try {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!stored) return;
    const consent = JSON.parse(stored);
    updateGoogleConsent(consent.analytics ?? false, consent.marketing ?? false);
  } catch {
    // No stored consent or parse error – remain in default denied state
  }
}
