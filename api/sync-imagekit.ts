import type { VercelRequest, VercelResponse } from "@vercel/node";
import { resolveSiteAsset } from '../src/content/media.js';

/** Import new ImageKit images into the website draft without changing existing entries. */

// ── Folder → Page/Category Mapping ──
interface FolderMapping {
  imagekitPath: string;
  page: string;
  category: string;
}

const FOLDER_MAPPINGS: FolderMapping[] = [
  { imagekitPath: "/Wedding/Getting Ready", page: "hochzeit", category: "getting-ready" },
  { imagekitPath: "/Wedding/Standesamt", page: "hochzeit", category: "standesamt" },
  { imagekitPath: "/Wedding/kirchliche Trauung", page: "hochzeit", category: "kirchliche-trauung" },
  { imagekitPath: "/Wedding/(freie) Trauung", page: "hochzeit", category: "freie-trauung" },
  { imagekitPath: "/Wedding/Paarfotos", page: "hochzeit", category: "paarshooting" },
  { imagekitPath: "/Wedding/Abend-Party", page: "hochzeit", category: "party" },
  { imagekitPath: "/Tiere", page: "tiere", category: "" },
  { imagekitPath: "/Other", page: "portrait", category: "" },
];

// ── SEO Alt-Tag Templates (DE / EN) ──
// Multiple variants per category for natural variation
interface AltTemplates {
  de: string[];
  en: string[];
}

const ALT_TEMPLATES: Record<string, AltTemplates> = {
  "getting-ready": {
    de: [
      "Getting Ready – Hochzeitsfotografie Innsbruck",
      "Braut Getting Ready – Hochzeitsfotograf Tirol",
      "Getting Ready Details – Mario Schubert Fotografie",
      "Hochzeit Vorbereitung – Hochzeitsfotografie Tirol",
      "Brautvorbereitung – Hochzeitsfotograf Innsbruck",
      "Getting Ready Momente – Hochzeitsfotografie Alpen",
      "Braut Vorbereitung – Hochzeitsfotograf Mario Schubert",
      "Getting Ready – Hochzeitsfotografie Bayern Tirol",
      "Hochzeit Getting Ready – Hochzeitsfotograf Innsbruck",
      "Getting Ready Emotionen – Hochzeitsfotografie Tirol",
      "Getting Ready Braut – Mario Schubert Fotografie",
      "Brautvorbereitung Details – Hochzeitsfotograf Tirol Bayern",
    ],
    en: [
      "Getting ready – Wedding photography Innsbruck",
      "Bride getting ready – Wedding photographer Tyrol",
      "Getting ready details – Mario Schubert Photography",
      "Wedding preparation – Wedding photography Tyrol",
      "Bridal preparation – Wedding photographer Innsbruck",
      "Getting ready moments – Alpine wedding photography",
      "Bride preparation – Wedding photographer Mario Schubert",
      "Getting ready – Wedding photography Bavaria Tyrol",
      "Wedding getting ready – Wedding photographer Innsbruck",
      "Getting ready emotions – Wedding photography Tyrol",
      "Getting ready bride – Mario Schubert Photography",
      "Bridal preparation details – Wedding photographer Tyrol Bavaria",
    ],
  },
  standesamt: {
    de: [
      "Standesamtliche Trauung – Hochzeitsfotografie Innsbruck",
      "Standesamt Hochzeit – Hochzeitsfotograf Tirol",
      "Standesamtliche Trauung – Mario Schubert Fotografie",
      "Standesamt Zeremonie – Hochzeitsfotograf Innsbruck",
      "Standesamt Hochzeitsfotografie Tirol",
      "Standesamtliche Trauung Bayern – Mario Schubert",
      "Standesamt Hochzeit Innsbruck Tirol",
      "Standesamtliche Trauung – Hochzeitsfotografie Alpen",
      "Standesamt Detailfoto – Hochzeitsfotograf Mario Schubert",
      "Standesamt Hochzeitsfotografie – Mario Schubert Tirol",
      "Standesamtliche Trauung Bayern – Hochzeitsfotografie",
      "Standesamt Zeremonie – Hochzeitsfotograf Innsbruck Tirol",
    ],
    en: [
      "Civil ceremony – Wedding photography Innsbruck",
      "Civil wedding – Wedding photographer Tyrol",
      "Civil ceremony – Mario Schubert Photography",
      "Civil ceremony – Wedding photographer Innsbruck",
      "Civil wedding photography Tyrol",
      "Civil ceremony Bavaria – Mario Schubert",
      "Civil wedding Innsbruck Tirol",
      "Civil ceremony – Alpine wedding photography",
      "Civil ceremony detail – Wedding photographer Mario Schubert",
      "Civil wedding photography – Mario Schubert Tyrol",
      "Civil ceremony Bavaria – Wedding photography",
      "Civil ceremony – Wedding photographer Innsbruck Tyrol",
    ],
  },
  "kirchliche-trauung": {
    de: [
      "Kirchliche Trauung – Hochzeitsfotografie Innsbruck",
      "Kirchliche Hochzeit – Hochzeitsfotograf Tirol",
      "Trauung in der Kirche – Mario Schubert Fotografie",
      "Kirchliche Trauung Tirol – Hochzeitsfotografie Alpen",
      "Hochzeit Kirche – Hochzeitsfotograf Innsbruck Tirol",
      "Kirchliche Zeremonie – Hochzeitsfotografie Bayern",
      "Trauung Kirche – Hochzeitsfotograf Mario Schubert",
      "Kirchliche Hochzeit Innsbruck – Hochzeitsfotografie",
      "Kirchliche Trauung – Hochzeitsfotograf Tirol Bayern",
      "Kirchliche Zeremonie Tirol – Mario Schubert Fotografie",
      "Kirchliche Trauung Alpen – Mario Schubert Fotografie",
      "Kirchliche Hochzeit Tirol – Hochzeitsfotograf Innsbruck",
    ],
    en: [
      "Church ceremony – Wedding photography Innsbruck",
      "Church wedding – Wedding photographer Tyrol",
      "Church ceremony – Mario Schubert Photography",
      "Church ceremony Tyrol – Alpine wedding photography",
      "Church wedding – Wedding photographer Innsbruck Tyrol",
      "Church ceremony – Wedding photography Bavaria",
      "Church ceremony – Wedding photographer Mario Schubert",
      "Church wedding Innsbruck – Wedding photography",
      "Church ceremony – Wedding photographer Tyrol Bavaria",
      "Church ceremony Tyrol – Mario Schubert Photography",
      "Church ceremony Alps – Mario Schubert Photography",
      "Church wedding Tyrol – Wedding photographer Innsbruck",
    ],
  },
  "freie-trauung": {
    de: [
      "Freie Trauung – Hochzeitsfotografie Innsbruck",
      "Freie Trauung im Freien – Hochzeitsfotograf Tirol",
      "Outdoor Zeremonie – Mario Schubert Fotografie",
      "Freie Trauung Tirol – Hochzeitsfotografie Alpen",
      "Freie Hochzeitszeremonie – Hochzeitsfotograf Innsbruck",
      "Freie Trauung – Hochzeitsfotografie Bayern",
      "Outdoor Hochzeit – Hochzeitsfotograf Mario Schubert",
      "Freie Trauung Innsbruck – Hochzeitsfotografie",
      "Freie Zeremonie – Hochzeitsfotograf Tirol Bayern",
      "Freie Trauung Alpen – Mario Schubert Fotografie",
      "Freie Hochzeit Tirol – Hochzeitsfotograf Innsbruck",
      "Freie Trauung – Hochzeitsfotografie Mario Schubert Tirol",
    ],
    en: [
      "Outdoor ceremony – Wedding photography Innsbruck",
      "Outdoor wedding ceremony – Wedding photographer Tyrol",
      "Outdoor ceremony – Mario Schubert Photography",
      "Outdoor ceremony Tyrol – Alpine wedding photography",
      "Free wedding ceremony – Wedding photographer Innsbruck",
      "Outdoor ceremony – Wedding photography Bavaria",
      "Outdoor wedding – Wedding photographer Mario Schubert",
      "Outdoor ceremony Innsbruck – Wedding photography",
      "Outdoor ceremony – Wedding photographer Tyrol Bavaria",
      "Outdoor ceremony Alps – Mario Schubert Photography",
      "Outdoor wedding Tyrol – Wedding photographer Innsbruck",
      "Outdoor ceremony – Mario Schubert Photography Tyrol",
    ],
  },
  paarshooting: {
    de: [
      "Paarshooting – Hochzeitsfotografie Innsbruck",
      "Brautpaar Fotoshooting – Hochzeitsfotograf Tirol",
      "Paarshooting Hochzeit – Mario Schubert Fotografie",
      "Couple Shooting Tirol – Hochzeitsfotografie Alpen",
      "Brautpaar Portraits – Hochzeitsfotograf Innsbruck",
      "Paarshooting – Hochzeitsfotografie Bayern",
      "Hochzeit Paarshooting – Hochzeitsfotograf Mario Schubert",
      "Brautpaar Shooting Innsbruck – Hochzeitsfotografie",
      "Paarshooting – Hochzeitsfotograf Tirol Bayern",
      "Paarshooting Alpen – Mario Schubert Fotografie",
      "Brautpaar Fotos Tirol – Hochzeitsfotograf Innsbruck",
      "Romantisches Paarshooting – Hochzeitsfotografie Tirol",
    ],
    en: [
      "Couple shoot – Wedding photography Innsbruck",
      "Bride and groom photoshoot – Wedding photographer Tyrol",
      "Couple shoot wedding – Mario Schubert Photography",
      "Couple shooting Tyrol – Alpine wedding photography",
      "Bridal couple portraits – Wedding photographer Innsbruck",
      "Couple shoot – Wedding photography Bavaria",
      "Wedding couple shoot – Wedding photographer Mario Schubert",
      "Couple shooting Innsbruck – Wedding photography",
      "Couple shoot – Wedding photographer Tyrol Bavaria",
      "Couple shoot Alps – Mario Schubert Photography",
      "Bridal couple photos Tyrol – Wedding photographer Innsbruck",
      "Romantic couple shoot – Wedding photography Tyrol",
    ],
  },
  party: {
    de: [
      "Hochzeitsparty – Hochzeitsfotografie Innsbruck",
      "Abendfeier Hochzeit – Hochzeitsfotograf Tirol",
      "Hochzeitsfeier – Mario Schubert Fotografie",
      "Party Hochzeit Tirol – Hochzeitsfotografie Alpen",
      "Hochzeitsparty Stimmung – Hochzeitsfotograf Innsbruck",
      "Abendfeier – Hochzeitsfotografie Bayern",
      "Erster Tanz – Hochzeitsfotograf Mario Schubert",
      "Hochzeitsparty Innsbruck – Hochzeitsfotografie",
      "Party Hochzeit – Hochzeitsfotograf Tirol Bayern",
      "Hochzeitsfeier Alpen – Mario Schubert Fotografie",
      "Abendprogramm Hochzeit – Hochzeitsfotograf Innsbruck",
      "Hochzeitsparty – Hochzeitsfotografie Mario Schubert Tirol",
    ],
    en: [
      "Wedding party – Wedding photography Innsbruck",
      "Wedding reception – Wedding photographer Tyrol",
      "Wedding celebration – Mario Schubert Photography",
      "Wedding party Tyrol – Alpine wedding photography",
      "Wedding party atmosphere – Wedding photographer Innsbruck",
      "Wedding reception – Wedding photography Bavaria",
      "First dance – Wedding photographer Mario Schubert",
      "Wedding party Innsbruck – Wedding photography",
      "Wedding party – Wedding photographer Tyrol Bavaria",
      "Wedding celebration Alps – Mario Schubert Photography",
      "Wedding evening – Wedding photographer Innsbruck",
      "Wedding party – Mario Schubert Photography Tyrol",
    ],
  },
  tiere: {
    de: [
      "Tierfotografie – Mario Schubert Innsbruck",
      "Tierfotograf Tirol – professionelle Tierfotos",
      "Tierfotografie Alpen – Mario Schubert Photography",
      "Tierportrait – Tierfotograf Innsbruck Tirol",
      "Professionelle Tierfotografie – Mario Schubert",
      "Tierfotografie Bayern Tirol – Mario Schubert",
      "Tierfotos Innsbruck – Tierfotograf Mario Schubert",
      "Tierfotografie – Fotograf Innsbruck Tirol",
      "Tierportrait Tirol – Mario Schubert Fotografie",
      "Tierfotografie Innsbruck – professionelle Tierportraits",
      "Tierfotograf Innsbruck – authentische Tierfotos",
      "Tierfotografie Alpen Tirol – Mario Schubert",
    ],
    en: [
      "Animal photography – Mario Schubert Innsbruck",
      "Animal photographer Tyrol – professional animal photos",
      "Animal photography Alps – Mario Schubert Photography",
      "Animal portrait – Animal photographer Innsbruck Tyrol",
      "Professional animal photography – Mario Schubert",
      "Animal photography Bavaria Tyrol – Mario Schubert",
      "Animal photos Innsbruck – Photographer Mario Schubert",
      "Animal photography – Photographer Innsbruck Tyrol",
      "Animal portrait Tyrol – Mario Schubert Photography",
      "Animal photography Innsbruck – professional portraits",
      "Animal photographer Innsbruck – authentic animal photos",
      "Animal photography Alps Tyrol – Mario Schubert",
    ],
  },
  portrait: {
    de: [
      "Portrait Fotografie – Mario Schubert Innsbruck",
      "Portraitfotograf Tirol – professionelle Portraits",
      "Portrait Shooting – Mario Schubert Photography",
      "Portraitfotografie Innsbruck – Mario Schubert",
      "Professionelles Portrait – Fotograf Innsbruck Tirol",
      "Portrait Shooting Tirol – Mario Schubert Fotografie",
      "Portraitfotografie – Fotograf Innsbruck",
      "Portrait Session – Mario Schubert Tirol",
      "Portraitfotograf Innsbruck – authentische Portraits",
      "Portrait Fotografie Tirol – Mario Schubert",
      "Professionelle Portraitfotografie – Innsbruck Tirol",
      "Portrait Fotoshooting – Mario Schubert Photography",
    ],
    en: [
      "Portrait photography – Mario Schubert Innsbruck",
      "Portrait photographer Tyrol – professional portraits",
      "Portrait session – Mario Schubert Photography",
      "Portrait photography Innsbruck – Mario Schubert",
      "Professional portrait – Photographer Innsbruck Tirol",
      "Portrait shooting Tyrol – Mario Schubert Photography",
      "Portrait photography – Photographer Innsbruck",
      "Portrait session – Mario Schubert Tirol",
      "Portrait photographer Innsbruck – authentic portraits",
      "Portrait photography Tyrol – Mario Schubert",
      "Professional portrait photography – Innsbruck Tirol",
      "Portrait photoshoot – Mario Schubert Photography",
    ],
  },
};

// ── ImageKit API ──
interface ImageKitFile {
  type: string;
  name: string;
  filePath: string;
  url: string;
  fileType: string;
  height?: number;
  width?: number;
}

async function listImageKitFolder(
  privateKey: string,
  path: string
): Promise<ImageKitFile[]> {
  const allFiles: ImageKitFile[] = [];
  let skip = 0;
  const limit = 100; // ImageKit max per request

  while (true) {
    const params = new URLSearchParams({
      path,
      limit: String(limit),
      skip: String(skip),
      sort: "ASC_NAME",
      type: "file",
    });

    const response = await fetch(
      `https://api.imagekit.io/v1/files?${params.toString()}`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(privateKey + ":").toString("base64")}`,
        },
      }
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `ImageKit API error for path "${path}": ${response.status} – ${text}`
      );
    }

    const files: ImageKitFile[] = await response.json();

    // Filter only image files
    const imageFiles = files.filter(
      (f) =>
        f.type === "file" &&
        /\.(jpg|jpeg|png|webp|gif|tiff?)$/i.test(f.name)
    );

    allFiles.push(...imageFiles);

    // If we got fewer than limit, we've reached the end
    if (files.length < limit) break;
    skip += limit;
  }

  return allFiles;
}

// ── Alt-Tag Generator ──
function getAltTag(
  category: string,
  index: number,
  lang: "de" | "en"
): string {
  // Use category key for alt templates; for tiere/portrait use page name
  const templateKey = category || "tiere"; // fallback shouldn't happen
  const templates = ALT_TEMPLATES[templateKey];

  if (!templates) {
    // Generic fallback
    return lang === "de"
      ? `Fotografie – Mario Schubert Innsbruck`
      : `Photography – Mario Schubert Innsbruck`;
  }

  const pool = lang === "de" ? templates.de : templates.en;
  return pool[index % pool.length];
}

// ── Google Sheets Auth (read+write) ──
// ── Main Handler ──
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const provided = req.headers['x-sync-secret'] || req.body?.password || req.body?.secret;
  if (!process.env.ADMIN_PASSWORD || (provided !== process.env.ADMIN_PASSWORD && (!process.env.SYNC_SECRET || provided !== process.env.SYNC_SECRET))) return res.status(401).json({ error: 'Unauthorized' });
  if (!process.env.IMAGEKIT_PRIVATE_KEY) return res.status(500).json({ error: 'IMAGEKIT_PRIVATE_KEY is not configured' });
  try {
    const { readWebsite, saveWebsite } = await import('./website-store.js');
    const site = await readWebsite();
    const errors: Record<string, string> = {};
    const incoming: Array<{ page: string; category: string; url: string; altDe: string; altEn: string }> = [];
    for (const mapping of FOLDER_MAPPINGS) {
      try {
        const files = await listImageKitFolder(process.env.IMAGEKIT_PRIVATE_KEY, mapping.imagekitPath);
        files.forEach((file, index) => incoming.push({ page: mapping.page, category: mapping.category, url: file.url, altDe: getAltTag(mapping.category || mapping.page, index, 'de'), altEn: getAltTag(mapping.category || mapping.page, index, 'en') }));
      } catch (error: any) { errors[mapping.imagekitPath] = error.message; }
    }
    if (!incoming.length) throw new Error('Keine Bilder abgerufen. Der vorhandene Stand bleibt erhalten.');
    const stories = [...site.draft.stories];
    let added = 0;
    incoming.forEach((image, index) => {
      if (stories.some(story => story.content.component === 'gallery_image' && resolveSiteAsset(story.content.image_url) === resolveSiteAsset(image.url) && story.content.page === image.page && story.content.category === image.category)) return;
      const uuid = crypto.randomUUID();
      stories.push({ uuid, slug: uuid, full_slug: 'gallery/' + uuid, name: image.altDe, content: { component: 'gallery_image', page: image.page, category: image.category, image_url: image.url, alt_de: image.altDe, alt_en: image.altEn, sort_order: index } });
      added++;
    });
    await saveWebsite({ ...site.draft, stories }, site.revision);
    return res.status(200).json({ success: true, added, totalImages: incoming.length, folderErrors: errors, message: 'Neue Bilder im Website-Entwurf gespeichert. Zum Veröffentlichen den Website-Bereich öffnen.' });
  } catch (error: any) { return res.status(error.statusCode || 500).json({ error: error.message || 'Bilder-Sync fehlgeschlagen' }); }
}
