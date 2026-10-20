import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parseHTML } from 'linkedom';
import type { SiteDocument } from '../src/content/site-content.js';
import { resolveSiteAsset } from '../src/content/media.js';

let template: Promise<string> | undefined;
export async function renderNotFound() {
  template ||= readFile(join(process.cwd(), 'dist/index.html'), 'utf8');
  return (await template).replace('<!--website-head-->', '<title>Seite nicht gefunden | Mario Schubert</title><meta name="robots" content="noindex,follow">').replace('<div id="root"></div>', '<div id="root"><main style="padding:4rem;font-family:sans-serif"><h1>Seite nicht gefunden</h1><p>Diese Seite ist nicht mehr verfügbar.</p><a href="/">Zur Startseite von Mario Schubert</a></main></div>');
}
export async function renderWebsitePage(path: string, language: 'de' | 'en', content: SiteDocument) {
  template ||= readFile(join(process.cwd(), 'dist/index.html'), 'utf8');
  const { render } = await import('../dist-server/entry-server.js');
  const result = render(path, language, content);
  const { document } = parseHTML('<html><body><div id="root">' + result.body + '</div></body></html>');
  const root = document.getElementById('root')!;
  for (const edit of content.edits.filter(item => (item.page === path || item.page === '*') && item.lang === language)) {
    try {
      const element = document.querySelector(edit.selector);
      if (!element || !root.contains(element)) continue;
      if (edit.kind === 'text') {
        const node = element.childNodes[edit.index || 0];
        if (node?.nodeType === 3 && node.nodeValue === edit.original) node.nodeValue = edit.value;
      } else if (edit.attribute && element.getAttribute(edit.attribute) === edit.original) element.setAttribute(edit.attribute, edit.value);
    } catch { /* Outdated selectors do not break the public page. */ }
  }
  for (const element of root.querySelectorAll('img,video,source')) for (const attribute of ['src', 'poster']) {
    const value = element.getAttribute(attribute);
    if (value) element.setAttribute(attribute, resolveSiteAsset(value));
  }
  // Entrance animations must not make server-rendered content invisible without JS.
  for (const element of root.querySelectorAll('[style]')) if ((element as any).style.opacity === '0') { (element as any).style.opacity = '1'; (element as any).style.removeProperty('transform'); }
  const payload = JSON.stringify(content).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
  return (await template).replace('<html lang="de">', `<html lang="${language}">`)
    .replace('<!--website-head-->', result.head)
    .replace('<div id="root"></div>', root.outerHTML + `<script>window.__WEBSITE_DOCUMENT__=${payload}</script>`);
}
