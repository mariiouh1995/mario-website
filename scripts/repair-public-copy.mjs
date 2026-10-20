import fs from 'node:fs/promises';
import postgres from 'postgres';
process.loadEnvFile('.env.local');
const snapshot = JSON.parse(await fs.readFile('src/content/live-snapshot.json', 'utf8'));
const originals = new Map(snapshot.stories.map(story => [story.full_slug, story.content]));
const db = postgres(process.env.MARIO_DATABASE_URL || process.env.DATABASE_URL, { ssl: 'require', prepare: false, max: 1 });
const apply = process.argv.includes('--apply');
try {
  await db.begin(async transaction => {
    const [row] = await transaction`SELECT draft, published, revision FROM mario_website_content WHERE id = 'website' FOR UPDATE`;
    const changes = [];
    for (const column of ['draft', 'published']) {
      const document = typeof row[column] === 'string' ? JSON.parse(row[column]) : row[column];
      row[column] = document;
      for (const story of document.stories) for (const [field, value] of Object.entries(story.content)) {
        const original = originals.get(story.full_slug)?.[field];
        if (typeof value !== 'string' || typeof original !== 'string' || !/[\p{L}]Auf Anfrage|Auf Anfrage[\p{L}]/u.test(value)) continue;
        if (value !== original.replace(/[.,]+\s*eur/gi, 'Auf Anfrage')) throw new Error('Unexpected manual edit: ' + story.full_slug + '.' + field);
        changes.push({ column, story: story.full_slug, field });
        story.content[field] = original;
      }
    }
    console.log(JSON.stringify({ apply, changes }, null, 2));
    if (apply && changes.length) {
      const [backup] = await transaction`SELECT * FROM mario_website_content WHERE id = 'website'`;
      await fs.mkdir('backups/website', { recursive: true });
      await fs.writeFile(`backups/website/before-copy-repair-${Date.now()}.json`, JSON.stringify(backup));
      await transaction`UPDATE mario_website_content SET draft=${JSON.stringify(row.draft)}::jsonb, published=${JSON.stringify(row.published)}::jsonb, revision=revision+1, updated_at=now() WHERE id='website'`;
    }
  });
} finally { await db.end(); }
