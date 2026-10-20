import { sql } from './crm-db.js';
import snapshot from '../src/content/live-snapshot.json' with { type: 'json' };
import { collectMedia, publicStories, validateSiteDocument, type SiteDocument } from '../src/content/site-content.js';
import { mapAssets } from '../src/content/media.js';
import { withSeoFields } from '../src/content/seo.js';

const seed: SiteDocument = { capturedAt: snapshot.capturedAt, stories: publicStories(snapshot.stories), edits: [], media: collectMedia(snapshot.stories) };
let schema: Promise<void> | undefined;
let publicCache: { document: SiteDocument; expires: number } | undefined;
async function ensureSchema() {
  if (!schema) schema = (async () => {
    await sql().begin(async db => {
      await db`SELECT pg_advisory_xact_lock(74839202)`;
      await db`CREATE TABLE IF NOT EXISTS mario_website_content (id text PRIMARY KEY, draft jsonb NOT NULL, published jsonb NOT NULL, revision integer NOT NULL DEFAULT 0, published_at timestamptz, updated_at timestamptz NOT NULL DEFAULT now())`;
      await db`INSERT INTO mario_website_content (id, draft, published) VALUES ('website', ${JSON.stringify(seed)}::jsonb, ${JSON.stringify(seed)}::jsonb) ON CONFLICT (id) DO NOTHING`;
    });
  })().catch(error => { schema = undefined; throw error; });
  await schema;
}
const json = (value: unknown): SiteDocument => typeof value === 'string' ? JSON.parse(value) : value as SiteDocument;
export async function readPublishedWebsite() {
  if (publicCache && publicCache.expires > Date.now()) return publicCache.document;
  try {
    await ensureSchema();
    const [row] = await sql()`SELECT published FROM mario_website_content WHERE id = 'website'`;
    const document = withSeoFields(mapAssets({ ...json(row.published), stories: publicStories(json(row.published).stories) }));
    publicCache = { document, expires: Date.now() + 5000 };
    return document;
  } catch (error) {
    console.error('Public CMS unavailable; serving last known website content');
    return publicCache?.document || withSeoFields(mapAssets(seed));
  }
}
export async function readWebsite() {
  await ensureSchema();
  const [row] = await sql()`SELECT draft, published, revision, published_at FROM mario_website_content WHERE id = 'website'`;
  return { draft: withSeoFields(mapAssets({ ...json(row.draft), stories: publicStories(json(row.draft).stories) })), published: withSeoFields(mapAssets({ ...json(row.published), stories: publicStories(json(row.published).stories) })), revision: row.revision as number, publishedAt: row.published_at };
}
export async function saveWebsite(document: unknown, revision: unknown, publish = false) {
  validateSiteDocument(document);
  if (!Number.isInteger(revision)) throw new Error('Die Website-Version fehlt. Bitte neu laden.');
  const normalized = { ...document, stories: publicStories(document.stories) };
  await ensureSchema();
  const rows = publish
    ? await sql()`UPDATE mario_website_content SET draft = ${JSON.stringify(normalized)}::jsonb, published = ${JSON.stringify(normalized)}::jsonb, revision = revision + 1, published_at = now(), updated_at = now() WHERE id = 'website' AND revision = ${revision as number} RETURNING revision, published_at`
    : await sql()`UPDATE mario_website_content SET draft = ${JSON.stringify(normalized)}::jsonb, revision = revision + 1, updated_at = now() WHERE id = 'website' AND revision = ${revision as number} RETURNING revision, published_at`;
  if (!rows.length) { const error = new Error('Die Website wurde zwischenzeitlich geändert. Bitte neu laden, bevor du speicherst.'); Object.assign(error, { statusCode: 409 }); throw error; }
  if (publish) publicCache = undefined;
  return { draft: normalized, revision: rows[0].revision, publishedAt: rows[0].published_at };
}
