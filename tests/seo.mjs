import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:5180';
const headers = process.env.TEST_VERCEL_BYPASS ? { 'x-vercel-protection-bypass': process.env.TEST_VERCEL_BYPASS } : {};
const paths = ['/', '/hochzeiten', '/tierfotografie', '/portrait', '/ueber-mich', '/destination-wedding', '/impressum', '/datenschutz', '/kontakt'];
for (const path of paths) {
  const response = await fetch(base + path, { headers, signal: AbortSignal.timeout(45000) });
  assert.equal(response.status, 200, path);
  const { document } = parseHTML(await response.text());
  assert.equal(document.querySelectorAll('title').length, 1, path + ' unique title');
  assert.ok(document.querySelector('meta[name="description"]')?.getAttribute('content').length > 40);
  assert.equal(document.querySelector('link[rel="canonical"]').getAttribute('href'), 'https://www.marioschub.com' + path);
  assert.ok(document.getElementById('root').textContent.length > 500, path + ' server-rendered content');
  assert.equal(document.querySelectorAll('h1').length, 1, path + ' one H1');
  const schema = JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent);
  const business = schema['@graph'].find(item => item['@type'] === 'ProfessionalService');
  assert.equal(business.address.streetAddress, 'Hauning 30a');
  assert.equal(business.address.addressLocality, 'Söll');
  assert.ok(business.areaServed.some(area => area.name === 'Schliersee'));
}
const { document } = parseHTML(await (await fetch(base + '/hochzeiten?lang=en', { headers })).text());
assert.equal(document.documentElement.lang, 'en');
assert.equal(document.querySelector('link[rel="canonical"]').getAttribute('href'), 'https://www.marioschub.com/hochzeiten?lang=en');
const sitemap = await (await fetch(base + '/sitemap.xml', { headers })).text();
assert.equal((sitemap.match(/<url>/g) || []).length, 18);
assert.equal(/spieglein|kundenportal|angebot\//i.test(sitemap), false);
console.log('SEO verified: 9 server-rendered pages, unique metadata, headings, canonical and language links, business address, service regions and public-only sitemap.');
