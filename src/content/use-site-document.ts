import { useSyncExternalStore } from 'react';
import { getSiteDocument, subscribeSite } from './site-client';
export const useSiteDocument = () => useSyncExternalStore(subscribeSite, getSiteDocument, getSiteDocument);
