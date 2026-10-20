import assert from 'node:assert/strict';
process.loadEnvFile('.env.local');
const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:5180';
const headers = { 'Content-Type': 'application/json', 'x-admin-password': process.env.ADMIN_PASSWORD };
const bypass = process.env.TEST_VERCEL_BYPASS ? { 'x-vercel-protection-bypass': process.env.TEST_VERCEL_BYPASS } : {};
async function request(action, options = {}) {
  const response = await fetch(`${base}/api/website?action=${action}`, { ...options, headers: { ...(options.headers || headers), ...bypass }, signal: AbortSignal.timeout(45000) });
  const data = await response.json();
  return { status: response.status, data };
}
assert.equal((await request('admin', { headers: {} })).status, 401);
const initial = await request('admin');
assert.equal(initial.status, 200);
assert.ok(initial.data.draft.stories.length > 600);
const before = (await request('public')).data.document;
let revision = initial.data.revision;
try {
  const temporary = structuredClone(initial.data.draft);
  const framing = { desktop: { x: 50, y: 0 }, mobile: { x: 100, y: 50 } };
  temporary.media[0] = { ...temporary.media[0], framing };
  temporary.edits.push({ id: 'cms-api-check', selector: '#cms-test-never-rendered', page: '/', lang: 'de', kind: 'text', index: 0, original: '', value: 'API verification' });
  const saved = await request('save', { method: 'POST', body: JSON.stringify({ document: temporary, revision }) });
  assert.equal(saved.status, 200);
  revision = saved.data.revision;
  assert.deepEqual(saved.data.draft.media[0].framing, framing, 'Image positions are saved without losing device-specific values');
  assert.deepEqual((await request('public')).data.document, before, 'Saving a draft must not change the public website');
  assert.equal((await request('save', { method: 'POST', body: JSON.stringify({ document: temporary, revision: initial.data.revision }) })).status, 409, 'Stale drafts must not overwrite changes');
  console.log('Website API verified: authentication, imported content, draft isolation and concurrent edit protection.');
} finally {
  const restored = await request('save', { method: 'POST', body: JSON.stringify({ document: initial.data.draft, revision }) });
  assert.equal(restored.status, 200, 'Original draft restored');
}
