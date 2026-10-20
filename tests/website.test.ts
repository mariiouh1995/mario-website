import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cleanPublicText, publicStories, validateSiteDocument } from '../src/content/site-content';
import { parseConsent } from '../src/app/components/consent';
import { youtubeEmbedUrl } from '../src/content/youtube';

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
