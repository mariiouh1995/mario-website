import fs from 'node:fs/promises';
const snapshot = JSON.parse(await fs.readFile('src/content/live-snapshot.json', 'utf8'));
const urls = new Set();
const scan = value => {
  if (typeof value === 'string' && /^https?:\/\//.test(value) && /\.(?:avif|webp|jpe?g|png|gif|svg|mp4|webm|mov)(?:[?#]|$)/i.test(value)) urls.add(value);
  else if (Array.isArray(value)) value.forEach(scan);
  else if (value && typeof value === 'object') Object.values(value).forEach(scan);
};
scan(snapshot.stories);
async function walk(directory) {
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const file = directory + '/' + entry.name;
    if (entry.isDirectory()) await walk(file);
    else if (/\.(tsx?|css)$/.test(file)) {
      const text = await fs.readFile(file, 'utf8');
      for (const match of text.matchAll(/https?:\/\/[^\s"'<>\x60]+/g)) {
        const url = match[0].replace(/[),;]+$/, '');
        if (/\.(?:avif|webp|jpe?g|png|gif|svg|mp4|webm|mov|ttf)(?:[?#]|$)/i.test(url)) urls.add(url);
      }
    }
  }
}
await walk('src/app');
const pending = [...urls];
const results = [];
await Promise.all(Array.from({ length: 5 }, async () => {
  while (pending.length) {
    const url = pending.shift();
    try {
      const response = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(15000) });
      results.push({ url, status: response.status, bytes: Number(response.headers.get('content-length') || 0), type: response.headers.get('content-type') });
    } catch { results.push({ url, status: 0, bytes: 0 }); }
  }
}));
await fs.writeFile('backups/live-site/media-inventory.json', JSON.stringify(results, null, 2));
console.log({ assets: results.length, megabytes: Math.round(results.reduce((sum, item) => sum + item.bytes, 0) / 1024 / 1024), unavailable: results.filter(item => item.status !== 200).length, hosts: [...new Set(results.map(item => new URL(item.url).host))] });
