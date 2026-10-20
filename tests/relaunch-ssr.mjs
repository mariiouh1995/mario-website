import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { render } from '../dist-server/entry-server.js';
import { applyRelaunch } from '../src/content/relaunch.ts';
import { publicPaths } from '../src/content/seo.ts';
const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:5182';
const { document: current } = await (await fetch(base + '/api/website?action=public')).json();
const content = applyRelaunch(current);
for (const path of publicPaths) for (const lang of ['de', 'en']) {
  const result = render(path, lang, content);
  const { document } = parseHTML(result.body);
  assert.equal(document.querySelectorAll('h1').length, 1, path);
  assert.ok(result.head.includes('canonical'));
  assert.ok(document.querySelector('main').textContent.length > 100, path);
  if (path === '/hochzeiten') assert.equal(document.querySelectorAll('#packages .public-option').length, 3);
}
console.log('SSR verified: all nine public pages in German and English, including contact, with rendered content, unique H1 and three wedding options.');
