import fs from 'node:fs/promises';
import postgres from 'postgres';
import { applyRelaunch } from '../src/content/relaunch.ts';
import { seoPages } from '../src/content/seo.ts';
import { validateSiteDocument } from '../src/content/site-content.ts';
process.loadEnvFile('.env.local');
const db = postgres(process.env.MARIO_DATABASE_URL || process.env.DATABASE_URL, { ssl: 'require', prepare: false, max: 1 });
const apply = process.argv.includes('--apply');
try {
  await db.begin(async tx => {
    const [row] = await tx`SELECT * FROM mario_website_content WHERE id='website' FOR UPDATE`;
    if (!row) throw new Error('Website document missing');
    const result = {};
    let changed = false;
    for (const column of ['draft', 'published']) {
      const original = typeof row[column] === 'string' ? JSON.parse(row[column]) : row[column];
      const next = applyRelaunch(original);
      for (const [path, page] of Object.entries(seoPages)) {
        if (original.stories.find(story => story.full_slug === 'pages/home')?.content.relaunch_version === 1) continue;
        if (['/impressum', '/datenschutz'].includes(path)) continue;
        const story = next.stories.find(story => story.full_slug === 'pages/' + page.key);
        if (story) Object.assign(story.content, { seo_title_de: page.title, seo_description_de: page.description, seo_title_en: page.titleEn, seo_description_en: page.descriptionEn });
      }
      validateSiteDocument(next);
      result[column] = next;
      changed ||= JSON.stringify(original) !== JSON.stringify(next);
    }
    console.log(JSON.stringify({ apply, changed, revision: row.revision, stories: result.published.stories.length, publicPhotoPackages: result.published.stories.filter(story => story.content.component === 'package' && story.content.category === 'wedding-photo' && story.content.public_visible).map(story => story.content.name), customerDataTouched: false }));
    if (!apply || !changed) return;
    await fs.mkdir('backups/website', { recursive: true });
    await fs.writeFile(`backups/website/before-relaunch-${Date.now()}.json`, JSON.stringify(row));
    await tx`UPDATE mario_website_content SET draft=${JSON.stringify(result.draft)}::jsonb, published=${JSON.stringify(result.published)}::jsonb, revision=revision+1, published_at=now(), updated_at=now() WHERE id='website'`;
  });
} finally { await db.end(); }
