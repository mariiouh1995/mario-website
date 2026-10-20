export type SiteStory = { name: string; slug: string; full_slug: string; uuid: string; content: Record<string, any>; [key: string]: any };
export type SiteEdit = { id: string; page: string; lang: string; selector: string; kind: 'text' | 'attribute'; index?: number; attribute?: string; original: string; value: string; sourceStory?: string; sourceField?: string };
export type SiteMedia = { url: string; name: string; type: 'image' | 'video'; alt?: string };
export type SiteDocument = { stories: SiteStory[]; edits: SiteEdit[]; media: SiteMedia[]; capturedAt: string };

export const removedService = /spieglein|fotospiegel|photo\s*mirror|fotobox|photo\s*booth/i;
const pricePattern = /(?:ab\s*|from\s*)?(?:€\s*\d[\d.,]*|\d[\d.,]*\s*(?:€|EUR(?:O)?S?\b))/gi;
export const inquiryPrice = (lang = 'de') => lang === 'en' ? 'On request' : 'Auf Anfrage';

export function cleanPublicText(value: string, lang = 'de') {
  return value.replace(pricePattern, inquiryPrice(lang));
}

// Apply the public catalogue policy even to imported content and stale caches.
export function publicStories(stories: SiteStory[]) {
  return stories.filter(story => {
    const c = story.content;
    if (['addon', 'faq_item'].includes(c.component)) return !removedService.test(JSON.stringify(c));
    if (c.component === 'package') return !removedService.test(c.name || story.name);
    return true;
  }).map(story => {
    const content = { ...story.content };
    if (content.component === 'faq_item' && /Preisspanne|price range/i.test(`${content.question_de} ${content.question_en}`)) {
      content.answer_de = 'Meine Preise erhaltet ihr auf Anfrage. Erzählt mir von euren Plänen, dann stelle ich euch ein persönliches Angebot zusammen.';
      content.answer_en = 'Prices are available on request. Tell me about your plans and I will prepare a personal offer for you.';
    }
    if (content.component === 'package') {
      if (!content.category) content.category = ['wedding-photo', 'wedding-video', 'animals', 'portrait'].find(category => story.full_slug.endsWith('-' + category)) || '';
      content.price = 'Auf Anfrage';
      for (const field of ['features', 'features_en']) {
        if (typeof content[field] === 'string') content[field] = content[field].split('\n').filter((line: string) => !removedService.test(line)).join('\n');
      }
    }
    for (const [key, value] of Object.entries(content)) {
      if (typeof value === 'string' && !/^https?:/.test(value) && key !== '_editable') content[key] = cleanPublicText(value, key.endsWith('_en') ? 'en' : 'de');
    }
    return { name: story.name, uuid: story.uuid, slug: story.slug, full_slug: story.full_slug, content };
  });
}

export function validMediaUrl(value: string) {
  if (value.startsWith('/') && !value.startsWith('//')) return true;
  try { return new URL(value).protocol === 'https:'; } catch { return false; }
}

export function validateSiteDocument(input: unknown): asserts input is SiteDocument {
  const doc = input as SiteDocument;
  if (!doc || !Array.isArray(doc.stories) || !Array.isArray(doc.edits) || !Array.isArray(doc.media)) throw new Error('Ungültiger Website-Inhalt.');
  if (doc.stories.length > 10000 || doc.edits.length > 20000 || doc.media.length > 10000) throw new Error('Zu viele Einträge.');
  const ids = new Set<string>();
  for (const story of doc.stories) {
    if (!story || typeof story.full_slug !== 'string' || !story.content || typeof story.content !== 'object' || Array.isArray(story.content)) throw new Error('Ungültiger Inhaltseintrag.');
    if (ids.has(story.full_slug)) throw new Error('Doppelter Inhaltseintrag.');
    ids.add(story.full_slug);
  }
  for (const edit of doc.edits) {
    if (!edit || !['text', 'attribute'].includes(edit.kind) || typeof edit.id !== 'string' || typeof edit.selector !== 'string' || typeof edit.original !== 'string' || typeof edit.value !== 'string' || !['de', 'en'].includes(edit.lang) || !(edit.page === '*' || edit.page?.startsWith('/')) || edit.value.length > 50000) throw new Error('Ungültige Seitenänderung.');
    if (edit.kind === 'attribute') {
      if (!['src', 'href', 'poster', 'alt', 'title', 'placeholder', 'aria-label'].includes(edit.attribute || '')) throw new Error('Ungültiges Attribut.');
      if (['src', 'poster'].includes(edit.attribute!) && !validMediaUrl(edit.value)) throw new Error('Bitte eine gültige Medienadresse verwenden.');
      if (edit.attribute === 'href' && !/^(https?:\/\/|mailto:|tel:|#|\/(?!\/))/.test(edit.value)) throw new Error('Ungültiger Link.');
    }
  }
  for (const medium of doc.media) if (!medium || !validMediaUrl(medium.url) || !['image', 'video'].includes(medium.type)) throw new Error('Ungültiges Medium.');
}

export function collectMedia(stories: SiteStory[]): SiteMedia[] {
  const media = new Map<string, SiteMedia>();
  const visit = (value: unknown, name: string) => {
    if (typeof value === 'string' && /^https?:\/\//.test(value) && /\.(?:avif|webp|jpe?g|png|gif|svg|mp4|webm|mov)(?:[?#]|$)/i.test(value)) {
      media.set(value, { url: value, name, type: /\.(mp4|webm|mov)(?:[?#]|$)/i.test(value) ? 'video' : 'image' });
    } else if (Array.isArray(value)) value.forEach(item => visit(item, name));
    else if (value && typeof value === 'object') Object.entries(value).forEach(([key, item]) => visit(item, `${name} ${key}`));
  };
  stories.forEach(story => visit(story.content, story.name));
  return [...media.values()];
}
