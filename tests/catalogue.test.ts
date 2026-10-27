import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { catalogue } from '../src/lib/catalogue';
import availability from '../src/data/availability.json';
import { ALL_UNIVERSITIES } from '../src/data/universities';
import { GET as brand } from '../src/app/api/brand/route';
import { GET as logo } from '../src/app/api/logo/route';
import { GET as fullLogo } from '../src/app/api/full-logo/route';
import { GET as photo } from '../src/app/api/uni-image/route';
import { POST as retiredRender } from '../src/app/api/render-banner/route';
import { GET as retiredShopify } from '../src/app/api/shopify-sync/route';

const request = (route: string) => new Request(`https://unibanner.test${route}`);

test('Every advertised school/campus resolves honestly, including unavailable schools', async () => {
  for (const school of ALL_UNIVERSITIES) {
    const ready = availability[school.domain as keyof typeof availability].available;
    for (const campus of [null, ...(school.campuses || [])]) {
      const params = new URLSearchParams({ domain: school.domain });
      if (campus) params.set('campus', campus);
      const response = brand(request(`/api/brand?${params}`));
      assert.equal(response.status, ready ? 200 : 422, `${school.domain}/${campus}`);
      if (ready) {
        const body = await response.json();
        assert.ok(body.logos.length, school.domain);
        assert.ok(body.fullLogo.startsWith('/generated/'));
      }
    }
    const icon = logo(request(`/api/logo?domain=${school.domain}`));
    assert.ok([200, 307].includes(icon.status));
    assert.ok(!icon.headers.get('location')?.includes('clearbit'));
  }
});

test('Every generated image exists, fully decodes, and stays inside size budgets', async () => {
  const urls = new Set<string>();
  for (const data of Object.values(catalogue)) {
    for (const url of [data.logo, data.fullLogo, ...data.logos.flatMap(l => [l.url, l.thumbnail]), ...data.images, ...Object.values(data.thumbnails)].filter(Boolean)) urls.add(url);
    assert.ok(!Object.values(data.imageSources).some(s => /Victor_Meirelles/i.test(s)));
  }
  for (const url of urls) {
    assert.match(url, /^\/generated\/(icon|logo-thumb|logo|photo|thumb)-[a-f0-9]{20}\.(png|webp)$/);
    const file = path.join(process.cwd(), 'public', url);
    const info = await sharp(file).metadata();
    await sharp(file).resize(8, 8).raw().toBuffer();
    assert.ok((info.width || 0) <= 2000, url);
    const size = (await stat(file)).size;
    if (url.includes('/thumb-')) assert.ok(size < 15_000, `${url}: ${size}`);
    if (url.includes('/photo-')) assert.ok(size < 1_500_000, `${url}: ${size}`);
  }
});

test('Reading has a working default; UCL only exposes current photos; empty galleries retain logos', () => {
  assert.ok(catalogue['reading.ac.uk'].logos.length > 0);
  assert.deepEqual(catalogue['reading.ac.uk'].images, catalogue['reading.ac.uk-Reading University'].images);
  assert.ok(catalogue['reading.ac.uk-Henley Business School'].logos.every(l => l.filename.startsWith('Henley Business School/')));
  assert.ok(catalogue['ucl.ac.uk'].images.length > 0);
  assert.ok(!Object.values(catalogue['ucl.ac.uk'].imageSources).some(s => s.includes('161214_UCL_Bartlett_011.jpg')));
  for (const domain of ['usn.no', 'inn.no']) {
    assert.ok(catalogue[domain].available);
    assert.ok(catalogue[domain].logos.length);
  }
});

test('Invalid campuses and legacy traversal/remote URLs cannot access files or servers', () => {
  assert.equal(brand(request('/api/brand?domain=reading.ac.uk&campus=../../secret')).status, 400);
  assert.equal(brand(request('/api/brand?domain=not-a-school.example')).status, 404);
  assert.equal(logo(request('/api/logo?domain=not-a-school.example')).status, 404);
  assert.equal(fullLogo(request('/api/full-logo?domain=reading.ac.uk&file=../../secret')).status, 404);
  assert.equal(photo(request('/api/uni-image?root=../../&folder=x&file=secret')).status, 400);
  assert.equal(photo(request('/api/uni-image?folder=Reading&file=../../secret')).status, 404);
  assert.equal(photo(request('/api/uni-image?folder=Reading&file=https://example.com/a.png')).status, 404);
  assert.equal(retiredRender().status, 410);
  assert.equal(retiredShopify().status, 410);
});

test('Legacy known assets redirect to static same-origin files', () => {
  const reading = catalogue['reading.ac.uk'];
  const url = Object.values(reading.imageSources)[0];
  const file = url.split('/Bilder_HighRez/')[1];
  const params = new URLSearchParams({ root: 'uk-universities', folder: 'Reading', file });
  const response = photo(request(`/api/uni-image?${params}`));
  assert.equal(response.status, 307);
  assert.match(response.headers.get('location')!, /^https:\/\/unibanner.test\/generated\/photo-/);
  assert.equal(fullLogo(request('/api/full-logo?domain=reading.ac.uk')).status, 307);
});

test('Showcase payload is below 150 KB total', async () => {
  const files: string[] = JSON.parse(await readFile('src/data/showcase.json', 'utf8'));
  let bytes = 0;
  for (const url of files) bytes += (await stat(path.join('public', url))).size;
  assert.ok(bytes < 150_000, `${bytes} bytes`);
});

test('The 27 previously supported schools cannot silently lose their logos', () => {
  const domains = ['imperial.ac.uk', 'kcl.ac.uk', 'lse.ac.uk', 'manchester.ac.uk', 'ucl.ac.uk', 'reading.ac.uk', 'cam.ac.uk', 'lboro.ac.uk', 'bath.ac.uk', 'bham.ac.uk', 'bristol.ac.uk', 'liverpool.ac.uk', 'uea.ac.uk', 'le.ac.uk', 'ntnu.no', 'uit.no', 'usn.no', 'nord.no', 'oslomet.no', 'inn.no', 'bi.no', 'uio.no', 'uib.no', 'uis.no', 'uia.no', 'nmbu.no', 'nhh.no'];
  for (const domain of domains) assert.ok(catalogue[domain]?.available && catalogue[domain].logos.length, domain);
});
