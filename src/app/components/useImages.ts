import { useCallback, useMemo } from 'react';
import { useSiteDocument } from '../../content/use-site-document';
export interface ImageEntry { page: string; category: string; src: string; altDe: string; altEn: string }
export function clearImagesCache() {
  try { localStorage.removeItem('marioschub_images'); } catch {}
}
export function useImages() {
  const stories = useSiteDocument().stories;
  const images = useMemo<ImageEntry[]>(() => stories.filter(story => story.content.component === 'gallery_image')
    .sort((a, b) => (Number(a.content.sort_order) || 0) - (Number(b.content.sort_order) || 0))
    .map(story => { const c = story.content; return { page: String(c.page || '').toLowerCase(), category: String(c.category || '').toLowerCase(), src: c.image_url?.filename || c.image_url || '', altDe: c.alt_de || story.name, altEn: c.alt_en || c.alt_de || story.name }; }).filter(image => image.src), [stories]);
  const getImagesForPage = useCallback((page: string, category?: string, lang = 'de') => [...new Map(images.filter(image => image.page === page.toLowerCase() && (!category || image.category === category.toLowerCase())).map(image => [image.src, image])).values()].map(image => ({ src: image.src, alt: lang === 'de' ? image.altDe : image.altEn, category: image.category })), [images]);
  return { images, allImages: images, getImagesForPage, loading: false, error: null };
}
