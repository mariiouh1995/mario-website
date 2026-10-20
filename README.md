
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

## October 2026 Editorial Update

- Public pages keep the same React/Vite, Neon, Blob and Vercel architecture.
  `/kontakt` and the contact modal share one form and the existing enquiry APIs.
  The CRM must confirm storage before success is shown; a failed notification
  email does not erase a saved enquiry. Phone is optional, and location, scope,
  package interest and open dates are retained. Analytics events contain only
  an allowlisted enquiry category, never form values, and require consent.
- Texts live in the existing page stories. New FAQ entries use the FAQ manager;
  `relaunch_page` selects `weddings`, `animals` or `portrait`. `public_visible`
  controls public package/FAQ/review visibility. Wedding testimonials use topic
  `wedding`; original quotations are not rewritten or presented as a current
  Google aggregate rating. Public packages still show prices on request.
- Home and wedding heroes have separately editable `hero_mobile_image` assets.
  Both assets also support the existing 9-point positioning controls. Old videos,
  package records and business statistics are retained in the CMS but not
  advertised where they make unconfirmed or conflicting promises.
- `node --import tsx scripts/relaunch-content.mjs` previews the one-time content
  migration. `--apply` backs up the complete website row before atomically
  updating draft and published documents. It never modifies CRM records and
  does not reset subsequent edits. Apply only with the matching code deployed.
- `node --import tsx tests/relaunch-browser.mjs` checks the public pages and
  intercepts all test submissions and emails. `tests/relaunch-editor.mjs` checks
  new content editing without saving. Set `RELAUNCH_FIXTURE=1` only for the Vite
  development server before migrating content. `tests/inquiry-api.mjs` creates
  and deletes six clearly marked CRM test enquiries without calling email APIs.
- Prices, binding delivery times, travel allowances, staffing, studio availability,
  publication permissions and external Search Console/Business profiles still
  require Mario's factual confirmation. No speculative regional case studies or
  new price suggestions were published.
