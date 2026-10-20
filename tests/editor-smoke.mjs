import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
process.loadEnvFile('.env.local');
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
await context.addInitScript(password => { sessionStorage.setItem('admin_auth', 'true'); sessionStorage.setItem('admin_pw', password); localStorage.setItem('ms-cookie-consent', JSON.stringify({ version: 2, necessary: true, analytics: false, externalMedia: false, timestamp: new Date().toISOString() })); }, process.env.ADMIN_PASSWORD);
const page = await context.newPage();
page.on('pageerror', error => console.log('Runtime:', error.message));
page.on('response', response => { if (response.url().includes('/api/website')) console.log('Website API:', response.status(), new URL(response.url()).search); });
try {
  await page.goto(process.env.TEST_BASE_URL || 'http://127.0.0.1:5180/admin', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.getByRole('button', { name: 'Website', exact: true }).click({ timeout: 60000 });
  await page.locator('.cms-toolbar').waitFor({ timeout: 60000 });
  await page.screenshot({ path: 'test-results/editor-debug.png' });
  console.log('Editor mounted; frames:', page.frames().map(frame => frame.url()));
  const frame = page.frameLocator('iframe[title="Website-Vorschau"]');
  await frame.locator('h1').first().waitFor({ timeout: 60000 });
  await frame.locator('section').first().locator('p').first().click();
  console.log('Selected fields:', await page.locator('.cms-pane textarea').count());
} catch (error) {
  console.log('CMS loading:', await page.locator('.cms-loading,.cms-error').allTextContents());
  await page.screenshot({ path: 'test-results/editor-failure.png' });
  throw error;
} finally { await browser.close(); }
