import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const base = process.argv[2] || 'http://127.0.0.1:3086';
const target = new URL(base);
if (target.protocol !== 'http:' || !['localhost', '127.0.0.1'].includes(target.hostname)) throw new Error('Run smoke checks against a local server only.');
const catalogue = JSON.parse(await fs.readFile('src/data/catalogue.json', 'utf8'));
let checked = 0;
for (const data of Object.values(catalogue)) {
  const params = new URLSearchParams({ domain: data.domain });
  if (data.campus) params.set('campus', data.campus);
  const response = await fetch(`${base}/api/brand?${params}`);
  assert.equal(response.status, data.available ? 200 : 422);
  if (data.available) {
    const body = await response.json();
    assert.equal(body.fullLogo, data.fullLogo);
    assert.equal(response.headers.get('cache-control'), 'no-store');
  }
  checked++;
}
for (const route of ['/', '/build?domain=reading.ac.uk', '/privacy', '/terms']) {
  assert.equal((await fetch(base + route)).status, 200, route);
}
for (const route of ['/api/render-banner', '/api/download-banner', '/api/shopify-sync']) {
  const response = await fetch(base + route, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
  assert.equal(response.status, 410, route);
}
const image = catalogue['reading.ac.uk'].fullLogo;
const response = await fetch(base + image);
assert.equal(response.status, 200);
assert.equal(response.headers.get('content-type'), 'image/png');
assert.match(response.headers.get('cache-control'), /max-age=31536000.*immutable/);
const original = '/api/uni-image?root=..%2F..&folder=x&file=x';
assert.equal((await fetch(base + original)).status, 400);
const home = await (await fetch(base)).text();
assert.ok(home.includes('/generated/showcase-'));
assert.ok(!home.includes('/showcase-banners/'));
console.log(`Passed: ${checked} university/campus records, page responses, retired endpoints, static cache headers and traversal rejection.`);
