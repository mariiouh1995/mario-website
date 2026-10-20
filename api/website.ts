import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readPublishedWebsite, readWebsite, saveWebsite } from './website-store.js';
import { publicPaths, SITE_ORIGIN } from '../src/content/seo.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const action = String(req.query.action || '');
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (req.method === 'GET' && action === 'not-found') {
      const { renderNotFound } = await import('./website-page.js');
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('X-Robots-Tag', 'noindex,follow');
      return res.status(404).send(await renderNotFound());
    }
    if (req.method === 'GET' && action === 'sitemap') {
      res.setHeader('Content-Type', 'application/xml; charset=utf-8');
      const links = publicPaths.map(path => `<url><loc>${SITE_ORIGIN}${path}</loc><xhtml:link rel="alternate" hreflang="de" href="${SITE_ORIGIN}${path}"/><xhtml:link rel="alternate" hreflang="en" href="${SITE_ORIGIN}${path}?lang=en"/></url><url><loc>${SITE_ORIGIN}${path}?lang=en</loc><xhtml:link rel="alternate" hreflang="de" href="${SITE_ORIGIN}${path}"/><xhtml:link rel="alternate" hreflang="en" href="${SITE_ORIGIN}${path}?lang=en"/></url>`).join('');
      return res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${links}</urlset>`);
    }
    if (req.method === 'GET' && action === 'page') {
      const path = String(req.query.path || '/');
      if (!publicPaths.includes(path)) return res.status(404).send('Not found');
      const language = req.query.lang === 'en' ? 'en' : 'de';
      const { renderWebsitePage } = await import('./website-page.js');
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(await renderWebsitePage(path, language, await readPublishedWebsite()));
    }
    if (req.method === 'GET' && action === 'public') return res.status(200).json({ document: await readPublishedWebsite() });
    if (action === 'upload' && req.method === 'POST') {
      const { handleUpload } = await import('@vercel/blob/client');
      const result = await handleUpload({
        body: req.body, request: req,
        onBeforeGenerateToken: async (pathname, clientPayload) => {
          const payload = JSON.parse(clientPayload || '{}');
          if (!process.env.ADMIN_PASSWORD || payload.password !== process.env.ADMIN_PASSWORD) throw new Error('Unauthorized');
          if (!pathname.startsWith('website/')) throw new Error('Ungültiger Upload-Pfad');
          return { allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime'], maximumSizeInBytes: 500 * 1024 * 1024, addRandomSuffix: true };
        },
        onUploadCompleted: async () => {},
      });
      return res.status(200).json(result);
    }
    if (!process.env.ADMIN_PASSWORD) return res.status(503).json({ error: 'ADMIN_PASSWORD ist nicht eingerichtet.' });
    if (req.headers['x-admin-password'] !== process.env.ADMIN_PASSWORD) return res.status(401).json({ error: 'Unauthorized' });
    if (action === 'admin' && req.method === 'GET') return res.status(200).json(await readWebsite());
    if (['save', 'publish', 'discard'].includes(action) && req.method === 'POST') {
      const document = action === 'discard' ? (await readWebsite()).published : req.body?.document;
      return res.status(200).json(await saveWebsite(document, req.body?.revision, action === 'publish'));
    }
    return res.status(404).json({ error: 'Unknown website action' });
  } catch (error: any) {
    console.error('website action failed', action, error.message);
    return res.status(error.statusCode || 500).json({ error: error.message || 'Website-Aktion fehlgeschlagen' });
  }
}
