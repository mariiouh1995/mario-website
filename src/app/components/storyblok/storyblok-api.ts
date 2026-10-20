// Compatibility adapter for established page hooks. Data now comes from Mario's CMS.
import { getSiteDocument, loadSiteDocument } from '../../../content/site-client';

export async function fetchStoryblokStories<T = any>(startsWith: string, _cacheKey: string, _perPage = 100) {
  await loadSiteDocument();
  return getSiteDocument().stories
    .filter(story => story.full_slug.startsWith(startsWith))
    .sort((a, b) => Number(a.content.sort_order || 0) - Number(b.content.sort_order || 0)) as Array<{ name: string; slug: string; full_slug: string; content: T; uuid: string; created_at: string; published_at: string }>;
}
export async function fetchStoryblokStory<T = any>(slug: string, _cacheKey: string) {
  await loadSiteDocument();
  const story = getSiteDocument().stories.find(story => story.full_slug === slug);
  return story ? { content: story.content as T, name: story.name } : null;
}
export function clearStoryblokCache() {
  for (const key of Object.keys(localStorage)) if (key.startsWith('sb_')) localStorage.removeItem(key);
}
