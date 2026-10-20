import fs from 'node:fs/promises';
import path from 'node:path';

const origin = 'https://www.marioschub.com';
const out = path.resolve('backups/live-site');
await fs.mkdir(out, { recursive: true });
const pages = ['/', '/hochzeiten', '/tierfotografie', '/portrait', '/ueber-mich', '/destination-wedding', '/impressum', '/datenschutz'];
const manifest = { capturedAt: new Date().toISOString(), origin, pages: [], stories: 0 };
let token = process.env.STORYBLOK_PUBLIC_TOKEN || '';
for (const page of pages) {
  const response = await fetch(new URL(page, origin));
  if (!response.ok) throw new Error(`Capture failed: ${page} (${response.status})`);
  const html = await response.text();
  const name = page === '/' ? 'home' : page.slice(1);
  await fs.writeFile(path.join(out, `${name}.html`), html);
  manifest.pages.push({ path: page, status: response.status });
  if (page !== '/') continue;
  for (const match of html.matchAll(/<script[^>]+src=["']([^"']+)/g)) {
    const url = new URL(match[1], origin);
    const js = await (await fetch(url)).text();
    await fs.writeFile(path.join(out, path.basename(url.pathname)), js);
    // The existing browser bundle includes the public delivery token.
    const candidate = js.match(/(?:const|let|var)\s+[\w$]+\s*=\s*["']([\w-]{20,})["'][;,][\s\S]{0,600}?(?:_storyblok|storyblokInit|No token found)/);
    if (!token && candidate) token = candidate[1];
    if (!token) {
      const at = js.indexOf('No token found');
      if (at > 0) {
        const candidates = [...js.slice(Math.max(0, at - 1200), at).matchAll(/["']([\w-]{20,})["']/g)];
        if (candidates.length) token = candidates[0][1];
      }
    }
  }
}
if (!token) throw new Error('Public Storyblok delivery token not found. Supply STORYBLOK_PUBLIC_TOKEN to complete capture.');
const stories = [];
for (let page = 1; ; page++) {
  const url = new URL('https://api.storyblok.com/v2/cdn/stories');
  url.search = new URLSearchParams({ token, version: 'published', per_page: '100', page: String(page) }).toString();
  let response;
  for (let attempt = 0; attempt < 6; attempt++) {
    response = await fetch(url);
    if (response.status !== 429) break;
    await new Promise(resolve => setTimeout(resolve, Math.min(2000 * 2 ** attempt, 30000)));
  }
  if (!response.ok) throw new Error(`Published content capture failed (${response.status})`);
  const data = await response.json();
  stories.push(...data.stories);
  if (data.stories.length < 100) break;
}
const seed = { capturedAt: manifest.capturedAt, origin, stories };
await fs.mkdir('src/content', { recursive: true });
await fs.writeFile('src/content/live-snapshot.json', JSON.stringify(seed, null, 2));
manifest.stories = stories.length;
await fs.writeFile(path.join(out, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log(JSON.stringify({ ...manifest, components: [...new Set(stories.map(s => s.content.component))] }, null, 2));
