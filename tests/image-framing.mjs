import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const base = process.env.TEST_BASE_URL || 'https://www.marioschub.com';
const label = process.env.IMAGE_AUDIT_LABEL || 'before';
const widths = (process.env.IMAGE_AUDIT_WIDTHS || '1440,390').split(',').map(Number);
const directory = `test-results/framing-${label}`;
await fs.mkdir(directory, { recursive: true });
const browser = await chromium.launch();
const context = await browser.newContext({ reducedMotion: 'reduce' });
const page = await context.newPage();
const records = [];
const errors = [];
page.on('pageerror', error => errors.push(error.message));
try {
  await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.getByRole('button', { name: 'Alle ablehnen', exact: true }).click({ timeout: 30000 });
  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ['/', '/hochzeiten', '/tierfotografie', '/portrait', '/ueber-mich', '/destination-wedding']) {
      await page.goto(base + route, { waitUntil: 'domcontentloaded', timeout: 60000 });
      if (await page.getByRole('button', { name: 'Alle ablehnen', exact: true }).isVisible()) await page.getByRole('button', { name: 'Alle ablehnen', exact: true }).click();
      await page.locator('h1').first().waitFor();
      const images = page.locator('main img:not([data-cms-gallery-image])');
      for (let i = 0; i < await images.count(); i++) {
        const image = images.nth(i);
        const box = await image.boundingBox();
        if (!box || box.width < 140 || box.height < 150) continue;
        await image.scrollIntoViewIfNeeded();
        const data = await image.evaluate(async element => {
          await element.decode().catch(() => {});
          const rect = element.getBoundingClientRect();
          return { src: element.currentSrc || element.src, alt: element.alt, natural: [element.naturalWidth, element.naturalHeight], size: [rect.width, rect.height], fit: getComputedStyle(element).objectFit, position: getComputedStyle(element).objectPosition, hero: element.closest('section')?.querySelector('h1') !== null };
        });
        if (data.natural[0] < 180) continue;
        const filename = `${route.replaceAll('/', '') || 'home'}-${i}-${width}.png`;
        const target = data.hero ? image.locator('xpath=ancestor::section[1]') : image;
        const buffer = await target.screenshot({ path: `${directory}/${filename}`, animations: 'disabled' });
        records.push({ route, index: i, width, ...data, capture: `data:image/png;base64,${buffer.toString('base64')}` });
      }
      await page.evaluate(() => scrollTo(0, 0));
      await page.screenshot({ path: `${directory}/${route.replaceAll('/', '') || 'home'}-hero-${width}.png`, animations: 'disabled' });
    }
  }
  await fs.writeFile(`${directory}/images.json`, JSON.stringify(records.map(({ capture, ...data }) => data), null, 2));
  const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
  for (const route of [...new Set(records.map(record => record.route))]) {
    const desktop = records.filter(record => record.route === route && record.width === 1440);
    const rows = desktop.map(item => {
      const mobile = records.find(record => record.route === route && record.index === item.index && record.width === 390);
      return `<article><h3>${escape(route)} · ${item.index}: ${escape(item.alt)}</h3><div class="row"><figure><img src="${escape(item.src)}"><figcaption>Original ${item.natural.join(' × ')}</figcaption></figure><figure><img src="${item.capture}"><figcaption>Desktop ${item.size.map(Math.round).join(' × ')} · ${item.position}</figcaption></figure><figure><img src="${mobile?.capture || item.capture}"><figcaption>Mobil · ${mobile?.position || '-'}</figcaption></figure></div></article>`;
    }).join('');
    const sheet = await context.newPage();
    await sheet.setViewportSize({ width: 1200, height: 900 });
    await sheet.setContent(`<html><head><style>body{margin:0;padding:16px;font:14px Arial;background:#f3f4f3;color:#1e2420}article{margin-bottom:16px;background:white;padding:12px}h3{font-size:14px;margin:0 0 8px}.row{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}figure{margin:0}img{width:100%;height:230px;object-fit:contain;background:#e4e7e4}figcaption{padding-top:6px}</style></head><body>${rows}</body></html>`);
    await sheet.locator('img').evaluateAll(elements => Promise.all(elements.map(element => element.decode().catch(() => {}))));
    await sheet.screenshot({ path: `${directory}/${route.replaceAll('/', '') || 'home'}-overview.png`, fullPage: true });
    await sheet.close();
  }
  console.log(JSON.stringify({ featuredImageViews: records.length, routes: 6, widths, errors }));
} finally { await browser.close(); }
