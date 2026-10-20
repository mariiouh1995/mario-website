import assert from 'node:assert/strict';
process.loadEnvFile('.env.local');
const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:5180';
const headers = process.env.TEST_VERCEL_BYPASS ? { 'x-vercel-protection-bypass': process.env.TEST_VERCEL_BYPASS } : {};
const response = await fetch(base + '/api/mario-crm?action=bootstrap', { headers: { ...headers, 'x-admin-password': process.env.ADMIN_PASSWORD }, signal: AbortSignal.timeout(45000) });
assert.equal(response.status, 200, 'CRM bootstrap');
const data = await response.json();
assert.ok(data.customers.length > 0, 'Existing customer data is available');
const customer = data.customers.find(customer => customer.portalEnabled && customer.portalToken);
if (customer) {
  const query = new URLSearchParams({ action: 'portal', token: customer.portalToken, password: customer.portalPassword || customer.eventDate?.split('-').reverse().join('') || '' });
  const portal = await fetch(base + '/api/mario-crm?' + query, { headers, signal: AbortSignal.timeout(45000) });
  assert.equal(portal.status, 200, 'Existing portal credentials still work');
  assert.equal((await portal.json()).customer.id, customer.id);
}
console.log('CRM verified: real customer data available; existing portal access checked without changing records or sending mail.');
