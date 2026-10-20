import { useMemo } from 'react';
import { useSiteDocument } from '../../content/use-site-document';
import { cleanPublicText, removedService } from '../../content/site-content';
export interface PackageData { name: string; price: string; subtitle: string; subtitleEn: string; features: string[]; featuresEn: string[]; highlight: boolean }
export interface AddOnData { textDe: string; textEn: string }
export function usePackages() {
  const stories = useSiteDocument().stories;
  const packages = useMemo(() => {
    const result = { weddingPhoto: [] as PackageData[], weddingVideo: [] as PackageData[], portrait: [] as PackageData[], animals: [] as PackageData[], weddingAddons: [] as AddOnData[], source: 'website', fetchedAt: '' };
    const categories = { 'wedding-photo': 'weddingPhoto', 'wedding-video': 'weddingVideo', portrait: 'portrait', animals: 'animals' } as const;
    for (const story of [...stories].sort((a, b) => (Number(a.content.sort_order) || 0) - (Number(b.content.sort_order) || 0))) {
      const c = story.content;
      if (c.component === 'package' && !removedService.test(c.name || story.name)) {
        const target = categories[c.category as keyof typeof categories];
        const features = (value: unknown) => String(value || '').split('\n').filter(line => line.trim() && !removedService.test(line)).map(line => cleanPublicText(line));
        if (target) result[target].push({ name: c.name || story.name, price: 'Auf Anfrage', subtitle: cleanPublicText(c.subtitle || ''), subtitleEn: cleanPublicText(c.subtitle_en || c.subtitle || '', 'en'), features: features(c.features), featuresEn: features(c.features_en || c.features), highlight: Boolean(c.highlight) });
      }
      if (c.component === 'addon' && !removedService.test(JSON.stringify(c))) result.weddingAddons.push({ textDe: cleanPublicText(c.text_de || ''), textEn: cleanPublicText(c.text_en || c.text_de || '', 'en') });
    }
    return result;
  }, [stories]);
  return { data: packages, packages, loading: false, error: null };
}
