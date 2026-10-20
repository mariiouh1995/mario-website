import { useCallback } from 'react';
import { useSiteDocument } from '../../../content/use-site-document';
import type { Language } from '../translations';
import { ICON_MAP, type IconComponent } from './icon-map';

export function usePageContent(pageKey: string, lang: Language) {
  const content = useSiteDocument().stories.find(story => story.full_slug === `pages/${pageKey}`)?.content;
  const getText = useCallback((key: string, fallback: string): string => {
    const localized = content?.[`${key}_${lang}`];
    if (typeof localized === 'string') return localized;
    return typeof content?.[key] === 'string' ? content[key] : fallback;
  }, [content, lang]);
  const getAsset = useCallback((key: string, fallback: string): string => {
    const value = content?.[key];
    return typeof value === 'string' && value ? value : value?.filename || fallback;
  }, [content]);
  const getIcon = useCallback((key: string, fallback: IconComponent): IconComponent => {
    const name = String(content?.[key] || '').toLowerCase();
    return Object.entries(ICON_MAP).find(([key]) => key.toLowerCase() === name)?.[1] || fallback;
  }, [content]);
  return { getText, getAsset, getIcon, loading: false, hasContent: Boolean(content) };
}
