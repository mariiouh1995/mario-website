import type { SiteMedia, SiteStory } from './site-content';

export const galleryPages = { hochzeit: 'Hochzeiten', tiere: 'Tierfotografie', portrait: 'Portrait' };
export const weddingCategories = { paarshooting: 'Paarshooting', 'freie-trauung': 'Freie Trauung', 'kirchliche-trauung': 'Kirchliche Trauung', 'getting-ready': 'Getting Ready', standesamt: 'Standesamt', party: 'Abend-Party' };
export const galleryUrl = (story: SiteStory): string => story.content.image_url?.filename || story.content.image_url || '';
const isImage = (story: SiteStory, page: string) => story.content.component === 'gallery_image' && story.content.page === page;

export function galleryRows(stories: SiteStory[], page: string) {
  const sorted = stories.filter(story => isImage(story, page)).sort((a, b) => (Number(a.content.sort_order) || 0) - (Number(b.content.sort_order) || 0));
  const seen = new Set<string>();
  return sorted.filter(story => { const key = galleryUrl(story) || story.full_slug; if (seen.has(key)) return false; seen.add(key); return true; });
}

export function addGalleryImages(stories: SiteStory[], page: string, category: string, media: SiteMedia[]) {
  const urls = new Set(galleryRows(stories, page).map(galleryUrl));
  let order = Math.max(0, ...stories.filter(story => isImage(story, page)).map(story => Number(story.content.sort_order) || 0));
  const added = media.filter(item => item.type === 'image' && !urls.has(item.url) && Boolean(urls.add(item.url))).map(item => {
    const id = crypto.randomUUID();
    return { uuid: id, slug: id, full_slug: `gallery/${id}`, name: item.name, content: { component: 'gallery_image', page, category, image_url: item.url, alt_de: item.alt || item.name, alt_en: '', sort_order: ++order } } satisfies SiteStory;
  });
  return [...stories, ...added];
}

// Imported galleries contain duplicate records; an image action applies to all copies on that page.
export function changeGalleryImage(stories: SiteStory[], selected: SiteStory, changes: Record<string, unknown> | null) {
  return stories.flatMap(story => {
    if (!isImage(story, selected.content.page) || galleryUrl(story) !== galleryUrl(selected)) return [story];
    return changes ? [{ ...story, content: { ...story.content, ...changes } }] : [];
  });
}

export function moveGalleryImage(stories: SiteStory[], page: string, visibleIds: string[], id: string, direction: -1 | 1) {
  const index = visibleIds.indexOf(id), target = visibleIds[index + direction];
  if (index < 0 || !target) return stories;
  const rows = galleryRows(stories, page);
  const first = rows.findIndex(row => row.full_slug === id), second = rows.findIndex(row => row.full_slug === target);
  if (first < 0 || second < 0) return stories;
  [rows[first], rows[second]] = [rows[second], rows[first]];
  const orders = new Map(rows.map((row, i) => [galleryUrl(row), i + 1]));
  return stories.map(story => isImage(story, page) ? { ...story, content: { ...story.content, sort_order: orders.get(galleryUrl(story)) || 0 } } : story);
}
