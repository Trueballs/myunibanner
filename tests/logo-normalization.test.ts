import test from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { normalizeLogo } from '../scripts/normalize-logo.mjs';
import { logoDisplaySize } from '../src/lib/logo-size';
import { catalogue } from '../src/lib/catalogue';

const artwork = (padding: number, background = 'transparent', fill = '#003865') => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${120 + padding * 2}" height="${60 + padding * 2}"><rect width="100%" height="100%" fill="${background}"/><rect x="${padding}" y="${padding}" width="120" height="60" fill="${fill}"/></svg>`);

test('Transparent and white padding no longer change the displayed logo size', async () => {
  const reference = await normalizeLogo(artwork(0));
  const expected = logoDisplaySize(reference, 380, 140);
  for (const background of ['transparent', 'white']) {
    const padded = await normalizeLogo(artwork(90, background));
    const actual = logoDisplaySize(padded, 380, 140);
    assert.ok(padded.trimmed);
    // One-pixel edge protection on each side is below 2% at this source size.
    assert.ok(Math.abs(actual.width / expected.width - 1) < 0.02);
    assert.ok(Math.abs(actual.height / expected.height - 1) < 0.02);
  }
});

test('White artwork and intentional coloured backgrounds survive normalization', async () => {
  const white = await normalizeLogo(artwork(40, 'transparent', 'white'));
  assert.ok(white.width >= 120 && white.height >= 60);
  const stats = await sharp(white.buffer).stats();
  assert.ok(stats.channels[0].max === 255);
  const plate = await normalizeLogo(artwork(40, '#cc0011', 'white'));
  assert.equal(plate.width, 200);
  assert.equal(plate.height, 140);
  assert.equal(plate.trimmed, false);
});

test('Every logo fits every layout at Small, Normal and Large without distortion', () => {
  const variants = Object.values(catalogue).flatMap(brand => brand.logos);
  for (const logo of variants) {
    assert.ok(logo.width > 0 && logo.height > 0 && logo.inkCoverage > 0);
    for (const [maxWidth, maxHeight] of [[380, 140], [400, 150], [360, 120], [400, 180], [360, 200]]) {
      const small = logoDisplaySize(logo, maxWidth, maxHeight, 0.75);
      const normal = logoDisplaySize(logo, maxWidth, maxHeight, 1);
      const large = logoDisplaySize(logo, maxWidth, maxHeight, 1.25);
      assert.ok(Math.abs(Math.max(normal.width / maxWidth, normal.height / maxHeight) - 0.9) < 0.001, `Normal must fill its box: ${logo.filename}`);
      assert.ok(large.width <= maxWidth * 1.25 + 0.001 && large.height <= maxHeight * 1.25 + 0.001, logo.filename);
      assert.ok(Math.abs(large.width / normal.width - 1.25 / 0.9) < 0.001);
      for (const cap of [454, 460, 404, 359]) {
        const capped = logoDisplaySize(logo, maxWidth, maxHeight, 1.25, cap);
        assert.ok(capped.width <= cap && capped.height <= maxHeight * 1.25 + 0.001);
      }
      assert.ok(small.width < normal.width && normal.width < large.width, logo.filename);
      assert.ok(Math.abs(large.width / large.height - logo.width / logo.height) < 0.001, logo.filename);
    }
  }
});

test('King’s College offers one black wordmark and its distinct crest', () => {
  const logos = catalogue['kcl.ac.uk'].logos;
  assert.equal(logos.length, 2);
  assert.ok(logos.some(logo => logo.filename === 'logo - tekst black.png'));
  assert.ok(logos.some(logo => logo.isIcon));
});
