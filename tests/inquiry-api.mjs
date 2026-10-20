import assert from 'node:assert/strict';
process.loadEnvFile('.env.local');
const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:5182';
const ids = [];
const post = (path, data, admin = false) => fetch(base + path, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(admin ? { 'x-admin-password': process.env.ADMIN_PASSWORD } : {}) }, body: JSON.stringify(data), signal: AbortSignal.timeout(45000) });
try {
  assert.equal((await post('/api/submit-inquiry', { name: 'Bad', email: 'bad' })).status, 400);
  for (const interest of ['Hochzeit Foto', 'Hochzeit Film', 'Hochzeit Foto + Film', 'Tierfotografie', 'Paare & Porträts', 'Sonstiges']) {
    const data = { name: 'AUTOMATISCHER WEBSITE TEST', email: `website-qa-${Date.now()}@example.invalid`, phone: '', interests: [interest], date: 'noch offen', locationAddress: 'Testort Söll (kein echter Termin)', message: 'Automatischer Integrationstest. Wird sofort gelöscht.', selectedPackages: [{ name: 'Testleistung', price: 'Auf Anfrage' }] };
    const response = await post('/api/submit-inquiry', data);
    assert.equal(response.status, 200);
    const result = await response.json();
    if (result.inquiry?.id) ids.push(result.inquiry.id);
    assert.ok(result.success && result.inquiry?.id);
    assert.equal(result.inquiry.locationAddress, data.locationAddress);
    assert.equal(result.inquiry.category, interest);
    assert.equal(result.inquiry.phone, '');
    assert.equal(result.inquiry.selectedPackages[0].name, 'Testleistung');
  }
  console.log('Real CRM storage verified for all six enquiry types, optional phone, open date, location and package. No email endpoint called.');
} finally {
  for (const id of ids) { const response = await post('/api/mario-crm?action=delete-inquiry', { id }, true); assert.equal(response.status, 200, 'Temporary QA enquiry removed'); }
  console.log('Temporary integration-test enquiries removed.');
}
