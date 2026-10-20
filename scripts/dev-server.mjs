import http from 'node:http';
import fs from 'node:fs';
import { createServer } from 'vite';
import path from 'node:path';
import { publicPaths } from '../src/content/seo.ts';
if (fs.existsSync('.env.local')) process.loadEnvFile('.env.local');
const built = process.argv.includes('--built');
const vite = built ? null : await createServer({ server: { middlewareMode: true }, appType: 'spa' });
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (built && (publicPaths.includes(url.pathname) || url.pathname === '/sitemap.xml')) {
    url.searchParams.set('action', url.pathname === '/sitemap.xml' ? 'sitemap' : 'page');
    url.searchParams.set('path', url.pathname);
    url.pathname = '/api/website';
  }
  if (!url.pathname.startsWith('/api/')) {
    if (vite) return vite.middlewares(req, res);
    const root = path.resolve('dist');
    let file = path.resolve(root, '.' + decodeURIComponent(url.pathname));
    if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(root, 'index.html');
    const types = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.ttf': 'font/ttf', '.png': 'image/png' };
    res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
    return fs.createReadStream(file).pipe(res);
  }
  try {
    const chunks = [];
    let size = 0;
    for await (const chunk of req) { size += chunk.length; if (size > 4_000_000) throw new Error('Request too large'); chunks.push(chunk); }
    req.query = Object.fromEntries(url.searchParams);
    req.body = size ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {};
    res.status = code => { res.statusCode = code; return res; };
    res.json = data => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(data)); return res; };
    res.send = data => { res.end(data); return res; };
    const handlers = { '/api/website': '../api/website.ts', '/api/mario-crm': '../api/mario-crm.ts', '/api/admin-verify': '../api/admin-verify.ts', '/api/submit-inquiry': '../api/submit-inquiry.ts', '/api/send-email': '../api/send-email.ts' };
    const handler = handlers[url.pathname];
    if (!handler) return res.status(404).json({ error: 'Not found' });
    await (await import(handler)).default(req, res);
  } catch (error) { console.error(error.message); if (!res.headersSent) res.writeHead(500, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: error.message })); }
});
const port = Number(process.env.PORT || 5180);
server.listen(port, '127.0.0.1', () => console.log(`Website preview: http://127.0.0.1:${port}`));
