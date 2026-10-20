import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { chromium, expect } from '@playwright/test';
import { applyRelaunch } from '../src/content/relaunch.ts';
const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:5182';
const fixture = process.env.RELAUNCH_FIXTURE === '1';
const browser = await chromium.launch();
const context = await browser.newContext();
const errors = [];
context.on('page', page => page.on('pageerror', error => errors.push(error.message)));
if (fixture) await context.route('**/api/website?action=public', async route => {
  const response = await route.fetch(); const data = await response.json();
  await route.fulfill({ response, json: { ...data, document: applyRelaunch(data.document) } });
});
await context.addInitScript(() => { try { localStorage.setItem('ms-cookie-consent', JSON.stringify({ version: 2, necessary: true, analytics: false, externalMedia: false, timestamp: new Date().toISOString() })); } catch {} });
await fs.mkdir('test-results/relaunch', { recursive: true });
const page = await context.newPage();
page.setDefaultTimeout(30000);
try {
  for (const width of [1440, 768, 390, 360]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ['/', '/hochzeiten', '/tierfotografie', '/portrait', '/ueber-mich', '/destination-wedding', '/kontakt']) {
      await page.goto(base + path, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('h1')).not.toHaveText('');
      await page.waitForFunction(() => [...document.querySelectorAll('main img')].filter(image => { const box = image.getBoundingClientRect(); return box.width > 0 && box.top < innerHeight && box.bottom > 0; }).every(image => image.complete && image.naturalWidth > 0));
      const reject = page.getByRole('button', { name: 'Alle ablehnen', exact: true });
      if (await reject.isVisible()) await reject.click();
      assert.equal(await page.locator('h1').count(), 1, path + ' one heading');
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 2), false, path + ' no overflow at ' + width);
      if ([1440, 390].includes(width)) await page.screenshot({ path: `test-results/relaunch/${path.replaceAll('/', '') || 'home'}-${width}.png` });
      assert.equal(await page.locator('video[autoplay]').count(), 0, 'No autoplay hero');
      const mainText = await page.locator('main').innerText();
      assert.equal(/in Innsbruck hängen geblieben|76\+|420\+|Bright & Airy|True to Life|48h bis|25% Anzahlung|um Innsbruck inklusive|Golden Hour/.test(mainText), false, path + ' no stale assertions');
      if (path === '/hochzeiten') {
        assert.equal(await page.locator('#packages .public-option').count(), 3);
        assert.equal(await page.locator('#packages').getByText('Auf Anfrage', { exact: true }).count(), 3);
        await page.locator('#packages').screenshot({ path: `test-results/relaunch/packages-${width}.png` });
      }
    }
  }
  const requests = [];
  let fail = true;
  await context.route('**/api/submit-inquiry', async route => {
    requests.push({ type: 'crm', data: route.request().postDataJSON() });
    await route.fulfill({ status: fail ? 500 : 200, json: fail ? { error: 'Test failure' } : { success: true, inquiry: { id: 'test-only' } } });
  });
  await context.route('**/api/send-email', async route => { requests.push({ type: 'mail', data: route.request().postDataJSON() }); await route.fulfill({ status: 500, json: { error: 'Test mail failure' } }); });
  await page.goto(base + '/kontakt?thema=wedding');
  await page.locator('#contact-name').fill('Lisa & Armin');
  await page.locator('#contact-email').fill('qa@example.com');
  await page.locator('#contact-date').fill('noch offen');
  await page.locator('#contact-location').fill('Söll');
  await page.locator('#contact-message').fill('Wir interessieren uns für Foto und Film.');
  await page.locator('input[name=privacy]').check();
  await page.locator('form button[type=submit]').click();
  await page.getByRole('alert').waitFor();
  assert.equal(await page.locator('#contact-name').inputValue(), 'Lisa & Armin');
  assert.equal(requests.some(request => request.type === 'mail'), false, 'No mail when CRM fails');
  fail = false;
  await page.locator('form button[type=submit]').click();
  await page.getByRole('status').filter({ hasText: 'Danke für eure Nachricht.' }).waitFor();
  await expect.poll(() => requests.filter(request => request.type === 'mail').length).toBe(1);
  assert.equal(requests[1].data.phone, '');
  assert.equal(requests[1].data.locationAddress, 'Söll');
  assert.equal(requests[1].data.date, 'noch offen');
  for (const topic of ['wedding-photo', 'wedding-film', 'wedding-both', 'animal', 'portrait', 'general']) {
    await page.goto(base + '/kontakt');
    await page.locator('#contact-topic').selectOption(topic);
    await page.locator('#contact-name').fill('QA Kunde');
    await page.locator('#contact-email').fill('qa@example.com');
    if (topic.startsWith('wedding')) { await page.locator('#contact-date').fill('noch offen'); await page.locator('#contact-location').fill('noch offen'); }
    await page.locator('#contact-message').fill('Test, nicht gesendet.');
    await page.locator('input[name=privacy]').check();
    await page.locator('form button[type=submit]').click();
    await page.getByRole('status').filter({ hasText: 'Danke für eure Nachricht.' }).waitFor();
  }
  await page.goto(base + '/hochzeiten');
  await page.locator('#packages article').first().getByRole('button').click();
  const dialog = page.getByRole('dialog', { name: 'Erzählt mir von euren Plänen', exact: true });
  await dialog.waitFor();
  assert.equal(await dialog.locator('#contact-package').inputValue(), 'Standesamt');
  for (let i = 0; i < 20; i++) { await page.keyboard.press('Tab'); assert.equal(await page.evaluate(() => Boolean(document.activeElement.closest('[role=dialog]'))), true); }
  await page.keyboard.press('Escape');
  await dialog.waitFor({ state: 'hidden' });
  assert.deepEqual(errors, []);
  console.log('Relaunch UI verified: 7 pages at 4 widths, no overflow/autoplay/stale claims, three packages, shared form, all six enquiry topics, optional phone, error preservation, CRM-first success, package context and modal keyboard access. No mail or lead was sent.');
} finally { await browser.close(); }
