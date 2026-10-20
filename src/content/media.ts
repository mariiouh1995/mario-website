import urls from './media-map.json' with { type: 'json' };
const mapping: Record<string, string> = urls;
const canonical = (url: string) => {
  try { const parsed = new URL(url); return parsed.origin + decodeURIComponent(parsed.pathname); } catch { return url; }
};
const normalized = new Map(Object.entries(mapping).map(([source, target]) => [canonical(source), target]));
export const resolveSiteAsset = (url: string) => mapping[url] || normalized.get(canonical(url)) || url;
export function mapAssets<T>(value: T): T {
  if (typeof value === 'string') return resolveSiteAsset(value) as T;
  if (Array.isArray(value)) return value.map(mapAssets) as T;
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, mapAssets(item)])) as T;
  return value;
}
