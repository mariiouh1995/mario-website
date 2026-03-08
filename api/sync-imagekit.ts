import type { VercelRequest, VercelResponse } from "@vercel/node";
import { google } from "googleapis";

/**
 * Vercel Serverless Function: Sync ImageKit → Google Sheets "Bilder" Tab
 *
 * Reads all image files from predefined ImageKit folders, maps them to
 * page/category, generates SEO-optimized alt tags (DE/EN), and writes
 * everything into the Google Sheet "Bilder" tab.
 *
 * Required Environment Variables in Vercel:
 *   IMAGEKIT_PRIVATE_KEY            – ImageKit Private API Key
 *   GOOGLE_SERVICE_ACCOUNT_EMAIL    – Service Account Email
 *   GOOGLE_SERVICE_ACCOUNT_KEY      – Service Account Private Key (PEM, with \n)
 *   GOOGLE_SHEET_ID                 – The Google Sheet ID
 *   SYNC_SECRET                     – (Optional) Secret token to protect the endpoint
 *   ADMIN_PASSWORD                  – (Optional) Admin password to protect the endpoint
 *
 * Endpoint: POST /api/sync-imagekit
 * Optional Header: x-sync-secret: <SYNC_SECRET>
 */

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
async function getSheetsAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

  if (!email) {
    throw new Error(
      "Missing GOOGLE_SERVICE_ACCOUNT_EMAIL environment variable"
    );
  }
  if (!key) {
    throw new Error(
      "Missing GOOGLE_SERVICE_ACCOUNT_KEY environment variable"
    );
  }

  // Robust key parsing: handles both single-line (literal \n) and multi-line (real newlines)
  let privateKey = key;
  if (privateKey.includes("\\n")) {
    // Key has literal \n characters → replace with real newlines
    privateKey = privateKey.replace(/\\n/g, "\n");
  }
  // If key was pasted as multi-line in Vercel, it already has real newlines → works as-is

  // Validate it looks like a PEM key
  if (!privateKey.includes("-----BEGIN") || !privateKey.includes("PRIVATE KEY")) {
    throw new Error(
      "GOOGLE_SERVICE_ACCOUNT_KEY does not look like a valid PEM private key. " +
      "Make sure to paste the FULL key including -----BEGIN PRIVATE KEY----- and -----END PRIVATE KEY-----"
    );
  }

  const auth = new google.auth.JWT(email, undefined, privateKey, [
    "https://www.googleapis.com/auth/spreadsheets",
  ]);

  // Explicitly authorize to catch auth errors early
  try {
    await auth.authorize();
  } catch (authErr: any) {
    throw new Error(
      `Google Service Account auth failed: ${authErr?.message}. ` +
      "Check that GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_SERVICE_ACCOUNT_KEY are correct, " +
      "and that the key hasn't expired."
    );
  }

  return auth;
}

// ── Main Handler ──
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-sync-secret");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  // ── Optional secret protection ──
  const syncSecret = process.env.SYNC_SECRET;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const provided =
    req.headers["x-sync-secret"] ||
    (req.body && req.body.password) ||
    (req.body && req.body.secret);

  // Must match either SYNC_SECRET or ADMIN_PASSWORD
  const isAuthed =
    (syncSecret && provided === syncSecret) ||
    (adminPassword && provided === adminPassword);

  if (!isAuthed && (syncSecret || adminPassword)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // ── Validate env vars ──
  const imagekitKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const sheetId = process.env.GOOGLE_SHEET_ID;

  if (!imagekitKey) {
    return res.status(500).json({
      error: "Missing IMAGEKIT_PRIVATE_KEY environment variable",
    });
  }
  if (!sheetId) {
    return res.status(500).json({
      error: "Missing GOOGLE_SHEET_ID environment variable",
    });
  }

  try {
    console.log("🔄 Starting ImageKit → Google Sheets sync...");

    // ── Step 1: Fetch all images from ImageKit ──
    const allRows: string[][] = [];
    const folderStats: Record<string, number> = {};
    const folderErrors: Record<string, string> = {};

    for (const mapping of FOLDER_MAPPINGS) {
      console.log(`📂 Fetching: ${mapping.imagekitPath}`);

      try {
        const files = await listImageKitFolder(imagekitKey, mapping.imagekitPath);
        folderStats[mapping.imagekitPath] = files.length;

        // Determine the alt-tag key (category for wedding, page for others)
        const altKey = mapping.category || mapping.page;

        files.forEach((file, index) => {
          const altDe = getAltTag(altKey, index, "de");
          const altEn = getAltTag(altKey, index, "en");

          allRows.push([
            mapping.page,
            mapping.category,
            file.url,
            altDe,
            altEn,
          ]);
        });
      } catch (folderErr: any) {
        console.error(`❌ Error fetching ${mapping.imagekitPath}:`, folderErr?.message);
        folderErrors[mapping.imagekitPath] = folderErr?.message || "Unknown error";
        folderStats[mapping.imagekitPath] = 0;
      }
    }

    console.log(
      `✅ Found ${allRows.length} total images across ${FOLDER_MAPPINGS.length} folders`
    );

    if (Object.keys(folderErrors).length > 0) {
      console.warn("⚠️ Some folders had errors:", folderErrors);
    }

    // ── Step 2: Write to Google Sheets ──
    const auth = await getSheetsAuth();
    const sheets = google.sheets({ version: "v4", auth });

    // Clear existing data (keep header row)
    await sheets.spreadsheets.values.clear({
      spreadsheetId: sheetId,
      range: "'Bilder'!A2:E",
    });

    // Write header + all rows
    if (allRows.length > 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: "'Bilder'!A1:E1",
        valueInputOption: "RAW",
        requestBody: {
          values: [["Seite", "Kategorie", "Bild-URL", "Alt_DE", "Alt_EN"]],
        },
      });

      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `'Bilder'!A2:E${allRows.length + 1}`,
        valueInputOption: "RAW",
        requestBody: {
          values: allRows,
        },
      });
    }

    console.log(`📝 Wrote ${allRows.length} rows to Google Sheets "Bilder" tab`);

    // ── Response ──
    return res.status(200).json({
      success: true,
      message: `Synced ${allRows.length} images from ImageKit to Google Sheets`,
      syncedAt: new Date().toISOString(),
      folderStats,
      folderErrors: Object.keys(folderErrors).length > 0 ? folderErrors : undefined,
      totalImages: allRows.length,
    });
  } catch (error: any) {
    console.error("❌ Sync error:", error?.message || error);
    return res.status(500).json({
      error: "Sync failed",
      details: error?.message,
      stack: process.env.NODE_ENV !== "production" ? error?.stack : undefined,
    });
  }
}