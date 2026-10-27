import test from 'node:test';
import assert from 'node:assert/strict';
import registry from '../src/data/brand-colors.json';
import { catalogue } from '../src/lib/catalogue';
import { ALL_UNIVERSITIES } from '../src/data/universities';
import { validateDraft } from '../src/lib/banner-draft';

type Review = { status: string; colors?: string[]; sources: string[] };
const schools = registry.schools as Record<string, Review>;
const campuses = registry.campuses as Record<string, Review>;

test('Every school is reviewed; every campus uses its documented palette without stale logo overrides', () => {
  assert.deepEqual(Object.keys(schools).sort(), ALL_UNIVERSITIES.map(s => s.domain).sort());
  for (const [id, brand] of Object.entries(catalogue)) {
    const review = campuses[id] || schools[brand.domain];
    assert.ok(review.sources.length, id);
    if (review.status === 'source-verified' || review.status === 'website-verified') {
      assert.ok(review.colors?.length, id);
      assert.deepEqual(brand.colors, review.colors, id);
    }
    assert.ok(brand.colors.length >= 2, id);
    assert.equal(new Set(brand.colors.map(c => c.toUpperCase())).size, brand.colors.length, id);
    for (const color of brand.colors) assert.match(color, /^#[0-9A-Fa-f]{6}$/, id);
    for (const logo of brand.logos) {
      if (logo.preferredBg) assert.ok(brand.colors.some(c => c.toLowerCase() === logo.preferredBg!.toLowerCase()), id);
    }
  }
});

test('Known copied palettes and retired colours cannot return through generated data or saved drafts', () => {
  for (const brand of Object.values(catalogue)) {
    assert.notEqual(brand.colors.map(c => c.toLowerCase()).join(','), '#003865,#c8a327,#ffffff');
  }
  assert.equal(catalogue['usn.no'].colors[0], '#7800F0');
  assert.equal(catalogue['oslomet.no'].colors[0], '#FFDC00');
  assert.ok(!catalogue['uio.no'].colors.includes('#B60000'));
  assert.equal(validateDraft({ version: 1, tint: '#005696' }, catalogue['usn.no'])?.tint, null);
  assert.equal(validateDraft({ version: 1, tint: '#7800F0' }, catalogue['usn.no'])?.tint, '#7800F0');
});
