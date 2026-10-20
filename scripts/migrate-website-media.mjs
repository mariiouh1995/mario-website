import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { put } from '@vercel/blob';
const inventory = JSON.parse(await fs.readFile('backups/live-site/media-inventory.json', 'utf8'));
let mapping = {};
try { mapping = JSON.parse(await fs.readFile('src/content/media-map.json', 'utf8')); } catch {}
const pending = inventory.filter(item => item.status === 200 && !mapping[item.url]);
const errors = [];
let count = 0;
await fs.mkdir('backups/media', { recursive: true });
await Promise.all(Array.from({ length: 3 }, async () => {
  while (pending.length) {
    const item = pending.shift();
    try {
      const response = await fetch(item.url, { signal: AbortSignal.timeout(120000) });
      if (!response.ok) throw new Error(String(response.status));
      const buffer = Buffer.from(await response.arrayBuffer());
      const name = decodeURIComponent(new URL(item.url).pathname.split('/').pop()).replace(/[^a-zA-Z0-9._-]/g, '-');
      const pathname = `website/import/${createHash('sha256').update(item.url).digest('hex').slice(0, 16)}-${name}`;
      await fs.writeFile(`backups/media/${pathname.split('/').pop()}`, buffer);
      const result = await put(pathname, buffer, { access: 'public', addRandomSuffix: false, contentType: response.headers.get('content-type') || item.type || undefined });
      mapping[item.url] = result.url;
      count++;
      // Persist after each file so an interrupted import can resume.
      await fs.writeFile('src/content/media-map.json', JSON.stringify(mapping, null, 2));
      if (count % 25 === 0) console.log(`Imported ${count} media files`);
    } catch (error) { errors.push({ url: item.url, error: error.message }); }
  }
}));
await fs.writeFile('src/content/media-map.json', JSON.stringify(mapping, null, 2));
await fs.writeFile('backups/media/import-errors.json', JSON.stringify(errors, null, 2));
console.log({ imported: count, total: Object.keys(mapping).length, errors: errors.length });
