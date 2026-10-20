import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cleanPublicText, publicStories, validateSiteDocument } from '../src/content/site-content';
import { parseConsent } from '../src/app/components/consent';
import { youtubeEmbedUrl } from '../src/content/youtube';
import { getImageFraming, positionCss, setImageFraming, validImageFraming } from '../src/content/image-framing';

test('published packages hide prices and excluded services without changing customer records', () => {
  const stories: any[] = [
    { full_slug: 'packages/photo', name: 'Signature', content: { component: 'package', name: 'Signature', price: '3290', features: '8 Stunden\ndas Spieglein\n700 Bilder' } },
    { full_slug: 'addons/mirror', content: { component: 'addon', text_de: 'das Spieglein' } },
    { full_slug: 'faqs/mirror', content: { component: 'faq_item', question_de: 'Was ist das Spieglein?' } },
  ];
  const result = publicStories(stories);
  assert.equal(result.length, 1);
  assert.equal(result[0].content.price, 'Auf Anfrage');
  assert.equal(result[0].content.features, '8 Stunden\n700 Bilder');
  assert.equal(stories[0].content.price, '3290');
  assert.equal(cleanPublicText('ab 2.090€ / 500 EUR'), 'Auf Anfrage / Auf Anfrage');
});
test('editing validation prevents executable URLs and event handlers', () => {
  const base = { stories: [], edits: [], media: [], capturedAt: '' };
  assert.doesNotThrow(() => validateSiteDocument(base));
  const edit = { id: 'test', page: '/', lang: 'de', selector: '#root a', kind: 'attribute', original: '/', value: 'javascript:alert(1)', attribute: 'href' };
  assert.throws(() => validateSiteDocument({ ...base, edits: [edit] }));
  assert.throws(() => validateSiteDocument({ ...base, edits: [{ ...edit, attribute: 'onclick', value: 'alert(1)' }] }));
  assert.doesNotThrow(() => validateSiteDocument({ ...base, edits: [{ ...edit, page: '*', value: 'https://example.com' }] }));
});
test('legacy packages with empty category are assigned by their preserved slug', () => {
  const [story] = publicStories([{ full_slug: 'packages/signature-wedding-photo', name: 'Signature', content: { component: 'package', category: '', name: 'Signature' } } as any]);
  assert.equal(story.content.category, 'wedding-photo');
});
test('consent requires explicit versioned choices and expires after 180 days', () => {
  const now = Date.parse('2026-10-20T12:00:00Z');
  const value = { version: 2, necessary: true, analytics: false, externalMedia: false, timestamp: new Date(now).toISOString() };
  assert.deepEqual(parseConsent(JSON.stringify(value), now), value);
  assert.equal(parseConsent(JSON.stringify({ ...value, version: 1 }), now), null);
  assert.equal(parseConsent(JSON.stringify({ ...value, timestamp: '2025-01-01' }), now), null);
  assert.equal(parseConsent(JSON.stringify({ ...value, analytics: 'true' }), now), null);
  assert.equal(parseConsent('{broken'), null);
});
test('video URLs accept YouTube links without permitting arbitrary iframe origins', () => {
  assert.equal(youtubeEmbedUrl('https://youtu.be/B5ncNtkQkKs'), 'https://www.youtube-nocookie.com/embed/B5ncNtkQkKs?rel=0');
  assert.equal(youtubeEmbedUrl('https://www.youtube.com/watch?v=B5ncNtkQkKs'), 'https://www.youtube-nocookie.com/embed/B5ncNtkQkKs?rel=0');
  assert.equal(youtubeEmbedUrl('https://example.com/embed/B5ncNtkQkKs'), '');
  assert.equal(youtubeEmbedUrl('javascript:alert(1)'), '');
});
import { addGalleryImages, changeGalleryImage, galleryRows, galleryUrl, moveGalleryImage } from '../src/content/gallery';

test('public price replacement never consumes punctuation or the word eure', () => {
  for (const text of ['Euer Moment. Eure Bilder', 'Euer Tag, eure Geschichte', 'Anfrage, eure Wünsche', 'Everything, euros included']) assert.equal(cleanPublicText(text), text);
  assert.equal(cleanPublicText('Paket 550,50 € und 1.200 EUR'), 'Paket Auf Anfrage und Auf Anfrage');
});

test('gallery operations preserve page boundaries, handle imported duplicates and persist order', () => {
  const make = (id: string, page: string, url: string, order: number): any => ({ uuid: id, slug: id, full_slug: 'gallery/' + id, name: id, content: { component: 'gallery_image', page, image_url: url, sort_order: order } });
  const initial = [make('a', 'hochzeit', 'https://example.com/a.jpg', 1), make('b', 'hochzeit', 'https://example.com/b.jpg', 2), make('copy-a', 'hochzeit', 'https://example.com/a.jpg', 3), make('animal', 'tiere', 'https://example.com/a.jpg', 1)];
  assert.deepEqual(galleryRows(initial, 'hochzeit').map(row => row.slug), ['a', 'b']);
  const moved = moveGalleryImage(initial, 'hochzeit', ['gallery/a', 'gallery/b'], 'gallery/b', -1);
  assert.deepEqual(galleryRows(moved, 'hochzeit').map(row => row.slug), ['b', 'a']);
  const updated = changeGalleryImage(moved, initial[0], { image_url: 'https://example.com/c.jpg', category: 'party' });
  assert.equal(updated.filter(row => row.content.page === 'hochzeit' && galleryUrl(row) === 'https://example.com/c.jpg').length, 2);
  const deleted = changeGalleryImage(updated, galleryRows(updated, 'hochzeit')[1], null);
  assert.equal(galleryRows(deleted, 'hochzeit').length, 1);
  assert.equal(galleryRows(deleted, 'tiere').length, 1);
  const added = addGalleryImages(deleted, 'hochzeit', 'standesamt', [{ url: 'https://example.com/b.jpg', name: 'duplicate', type: 'image' }, { url: 'https://example.com/new.jpg', name: 'New', type: 'image' }]);
  assert.equal(galleryRows(added, 'hochzeit').length, 2);
  assert.equal(galleryRows(added, 'hochzeit')[1].content.category, 'standesamt');
  assert.equal(initial[0].content.sort_order, 1, 'source is not mutated');
});

test('image framing keeps desktop and mobile positions independent and restores defaults', () => {
  const url = 'https://example.com/portrait.jpg';
  const original: any[] = [{ url, name: 'Portrait', type: 'image' }];
  const framing = { desktop: { x: 50, y: 0 }, mobile: { x: 100, y: 50 } };
  const next = setImageFraming(original, url, framing);
  assert.deepEqual(getImageFraming(url, next), framing);
  assert.equal(positionCss(getImageFraming(url, next).mobile), '100% 50%');
  assert.equal(original[0].framing, undefined);
  assert.deepEqual(getImageFraming(url, setImageFraming(next, url)), { desktop: { x: 50, y: 50 }, mobile: { x: 50, y: 50 } });
  assert.equal(validImageFraming(framing), true);
  assert.equal(validImageFraming({ ...framing, mobile: { x: 101, y: 50 } }), false);
  assert.equal(validImageFraming({ ...framing, desktop: { x: NaN, y: 0 } }), false);
  assert.throws(() => validateSiteDocument({ stories: [], edits: [], media: [{ url, name: 'Invalid', type: 'image', framing: { desktop: { x: 0, y: 0 }, mobile: { x: 'url(script)', y: 0 } } }] }));
});
