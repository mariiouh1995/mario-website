import assert from 'node:assert/strict';
import { chromium, expect } from '@playwright/test';
import { applyRelaunch } from '../src/content/relaunch.ts';
process.loadEnvFile('.env.local');
const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:5182';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
if (process.env.RELAUNCH_FIXTURE === '1') await page.route('**/api/website?action=admin', async route => {
  const response = await route.fetch(); const data = await response.json();
  await route.fulfill({ response, json: { ...data, draft: applyRelaunch(data.draft), published: applyRelaunch(data.published) } });
});
try {
  await page.goto(base + '/admin');
  await page.getByLabel('Admin-Passwort').fill(process.env.ADMIN_PASSWORD);
  await page.getByRole('button', { name: 'Anmelden', exact: true }).click();
  await page.getByRole('button', { name: 'Website', exact: true }).click({ timeout: 60000 });
  const frame = page.frameLocator('iframe[title="Website-Vorschau"]');
  await page.getByLabel('Seite', { exact: true }).selectOption('/');
  const heroCta = frame.locator('.public-hero button');
  const bottomCta = frame.locator('.public-cta button');
  await bottomCta.click({ timeout: 60000 });
  await page.getByLabel('Text', { exact: true }).first().fill('Anfrage CTA Test');
  await expect(bottomCta).toHaveText('Anfrage CTA Test');
  assert.notEqual(await heroCta.textContent(), 'Anfrage CTA Test', 'Identical CTA labels are bound to independent content fields');
  await page.getByLabel('Seite', { exact: true }).selectOption('/kontakt');
  await frame.locator('h1').click();
  await page.getByLabel('Text', { exact: true }).first().fill('Kontaktseite Test');
  await expect(frame.locator('h1')).toHaveText('Kontaktseite Test');
  await page.getByLabel('Seite', { exact: true }).selectOption('/hochzeiten');
  await frame.locator('.public-faq h3').first().click();
  await page.getByLabel('Text', { exact: true }).first().fill('FAQ Testfrage');
  await expect(frame.locator('.public-faq h3').first()).toHaveText('FAQ Testfrage');
  await page.getByRole('button', { name: 'Inhalte', exact: true }).click();
  await page.getByLabel('Inhaltsbereich', { exact: true }).selectOption('faqs');
  assert.ok((await page.getByLabel('Inhaltseintrag', { exact: true }).textContent()).includes('Fotografierst du auch kleine standesamtliche Hochzeiten?'));
  assert.deepEqual(errors, []);
  console.log('New CMS sections verified: contact page, independent CTA fields, FAQ live editing and FAQ manager. No draft saved.');
} catch (error) {
  await page.screenshot({ path: 'test-results/relaunch/editor-failure.png' }).catch(() => {});
  console.log('CMS diagnostics', { errors, status: await page.locator('.cms-loading,.cms-error').allTextContents() });
  throw error;
} finally { await browser.close(); }
