
# Mario Schubert Website and CRM

The public website, customer portal and admin run in the existing Vercel project.
Website content is managed under **Admin > Website**, not through Storyblok.

## Development

Use Node.js 24, `npm ci` and `npm run dev`. The local preview runs at
`http://127.0.0.1:5180` and includes the local API handlers. Create `.env.local`
from the existing Vercel environment. These values are server secrets and must
never use a `VITE_` prefix or be committed. A production database connection means
local CRM edits affect real records.

`npm run build` builds both the browser app and server-rendered public pages.
The Vercel routes intentionally render public pages before checking static files.

## Content and Data

- Website drafts and published content use the `mario_website_content` Neon table.
- Save updates only the draft; Publish updates the public website. Concurrent
  changes are rejected rather than overwritten. Public content caches for up to
  five seconds; the captured website is an availability fallback, not CRM mock data.
- Text and media can be selected in the preview. Packages, FAQs,
  reviews and SEO fields are also editable under Inhalte.
- Select a page image (or an empty area of its hero background) to adjust its
  position with the 9-point grid. Desktop and mobile positions are independent,
  stored with the media record, and follow the draft/publish workflow. Reset
  restores the curated default. Gallery photos retain their full aspect ratio.
- Admin > Website > Galerien manages wedding, animal and portrait gallery images:
  upload or select media, replace images, edit descriptions/categories, reorder,
  and remove images. Imported duplicates are handled as one image per gallery.
  Removing a gallery image keeps its media file available elsewhere. All changes
  remain in the draft until Publish. Gallery order is no longer randomized.
- New media uploads go directly to Vercel Blob using `BLOB_READ_WRITE_TOKEN`.
  ImageKit sync adds images to the draft without deleting manually edited content.
- Public packages show prices on request. Historical CRM services, prices,
  payments, offers, portal tokens and Google Drive integrations are preserved.

## Consent and Verification

The existing GA4 property is `G-YPBWYFCNYX`; `VITE_GA_MEASUREMENT_ID` can override
it. Analytics and YouTube require separate opt-in. Admin, portal, offer and editor
preview routes are not tracked. Consent expires after 180 days and can be withdrawn.

Run `npm run test:website` for unit tests. With the local API running, use
`node tests/seo.mjs`, `node tests/website-api.mjs`, `node tests/crm-read.mjs`,
`node tests/website-browser.mjs` and `node tests/consent-browser.mjs` for integration
checks. The browser upload test removes its temporary Blob afterward. Tests do
not send customer emails. Backups, credentials and screenshots are gitignored.

`node tests/ui-regressions.mjs` checks modal keyboard controls, responsive CRM
views and gallery editing without saving changes. `node tests/ui-audit.mjs`
captures the eight public pages at four widths and checks layout geometry.
Set `TEST_BASE_URL` for regression tests and `UI_AUDIT_BASE_URL` for the audit;
the gallery regression test defaults to the local port 5181.
`node tests/image-framing-editor.mjs` exercises the 9-point controls without
saving; `node tests/image-framing.mjs` captures original/cropped image comparisons.

Consent controls do not replace verification of the business's provider contracts,
Analytics account settings or the completeness of its legal disclosures.
