import fs from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
const base = process.argv[2];
if (!base || !base.endsWith('.vercel.app')) throw new Error('An exact preview origin is required.');
const access = JSON.parse(await fs.readFile('.codex-local/access.json', 'utf8'));
const project = JSON.parse(await fs.readFile('.codex-local/project.json', 'utf8'));
const response = await fetch(`https://api.vercel.com/v9/projects/${project.id}?teamId=${project.teamId}`, { headers: { Authorization: 'Bearer ' + access.vercel } });
if (!response.ok) throw new Error('Cannot read preview access configuration.');
const data = await response.json();
const bypass = Object.entries(data.protectionBypass || {}).find(([, item]) => item.scope === 'automation-bypass')?.[0];
if (!bypass) throw new Error('No existing automation bypass is available.');
for (const test of ['seo.mjs', 'website-api.mjs', 'crm-read.mjs', 'website-browser.mjs', 'consent-browser.mjs']) {
  const result = spawnSync(process.execPath, ['tests/' + test], { stdio: 'inherit', env: { ...process.env, TEST_BASE_URL: base, TEST_VERCEL_BYPASS: bypass } });
  if (result.status !== 0) process.exit(result.status || 1);
}
