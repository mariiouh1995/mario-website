import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
process.loadEnvFile('.env.local');
const base = process.env.UI_AUDIT_BASE_URL || 'https://www.marioschub.com';
const output = `test-results/ui-${process.env.UI_AUDIT_LABEL || 'before'}`;
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();
page.setDefaultNavigationTimeout(60000);
const issues = [];
page.on('pageerror', error => issues.push({ runtime: error.message }));
await page.goto(base, { waitUntil: 'domcontentloaded' });
await page.getByRole('button', { name: 'Alle ablehnen', exact: true }).click();
async function inspect(name) {
  const result = await page.evaluate(() => {
    const visible = element => { const r = element.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(element).visibility !== 'hidden'; };
    const overflow = [...document.querySelectorAll('main,main section,nav,footer,button,input,select,textarea')].filter(visible).filter(el => {
      const r = el.getBoundingClientRect(); return r.left < -2 || r.right > innerWidth + 2;
    }).slice(0, 12).map(el => ({ tag: el.tagName, classes: el.className, width: Math.round(el.getBoundingClientRect().width) }));
    const nav = document.querySelector('nav');
    const links = nav ? [...nav.querySelectorAll('a,button')].filter(visible) : [];
    const overlaps = links.flatMap((a, i) => links.slice(i + 1).filter(b => {
      const x = a.getBoundingClientRect(), y = b.getBoundingClientRect();
      return Math.min(x.right, y.right) - Math.max(x.left, y.left) > 2 && Math.min(x.bottom, y.bottom) - Math.max(x.top, y.top) > 2;
    }).map(b => [a.textContent, b.textContent]));
    const cta = [...document.querySelectorAll('button')].find(el => el.textContent.includes('Erzählt mir von euren Plänen'));
    return { documentOverflow: document.documentElement.scrollWidth > innerWidth + 2, overflow, overlaps, ctaRadius: cta && getComputedStyle(cta).borderRadius };
  });
  if (result.documentOverflow || result.overflow.length || result.overlaps.length || (result.ctaRadius && result.ctaRadius !== '0px')) issues.push({ name, ...result });
  await page.screenshot({ path: `${output}/${name}.png` });
}
try {
  for (const width of [360, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ['/', '/hochzeiten', '/tierfotografie', '/portrait', '/ueber-mich', '/destination-wedding', '/impressum', '/datenschutz']) {
      await page.goto(base + route, { waitUntil: 'domcontentloaded' });
      await page.locator('h1').first().waitFor();
      await inspect(`${route.replaceAll('/', '') || 'home'}-${width}`);
    }
  }
  await page.goto(base + '/admin', { waitUntil: 'domcontentloaded' });
  await page.locator('input[type=password]').fill(process.env.ADMIN_PASSWORD);
  await page.getByRole('button', { name: 'Anmelden', exact: true }).click();
  await page.getByRole('button', { name: 'Website', exact: true }).waitFor({ timeout: 60000 });
  await page.getByText('Lade CRM...', { exact: true }).waitFor({ state: 'hidden', timeout: 60000 });
  for (const width of [360, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.getByRole('button', { name: 'Dashboard', exact: true }).first().click();
    await inspect(`admin-dashboard-${width}`);
    const top = await page.locator('main > section').evaluate(el => el.getBoundingClientRect().top + scrollY);
    if (top > 800) issues.push({ name: `admin-content-${width}`, top });
    await page.getByRole('button', { name: 'Kalender', exact: true }).first().click();
    await inspect(`admin-calendar-${width}`);
    await page.getByRole('button', { name: 'Liste anzeigen', exact: true }).first().click();
    await inspect(`admin-customers-${width}`);
  }
  console.log(JSON.stringify(issues, null, 2));
  await fs.writeFile(`${output}/issues.json`, JSON.stringify(issues, null, 2));
} finally { await browser.close(); }
