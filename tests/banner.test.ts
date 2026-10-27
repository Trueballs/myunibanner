import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import BannerCanvas, { type Layout } from '../src/components/BannerCanvas';
import { catalogue } from '../src/lib/catalogue';
import { exportBanner, preparePhoto } from '../src/lib/export-banner';

function render(layout: Layout, domain = 'reading.ac.uk', customImage?: string) {
  return renderToStaticMarkup(React.createElement(BannerCanvas, {
    brand: catalogue[domain], layout, imgIndex: 0, logoIndex: 0, customImage,
  }));
}

test('All nine preview/export layouts contain the selected logo', () => {
  for (let layout = 0; layout <= 8; layout++) {
    const domain = layout === 8 ? 'ucl.ac.uk' : 'reading.ac.uk';
    const html = render(layout as Layout, domain);
    assert.ok(html.includes(catalogue[domain].logos[0].url), `layout ${layout}`);
    assert.ok(!html.includes('/api/full-logo'));
  }
});

test('Solid layout omits the photo, UCL stripes render, and photo layouts retain dark overlays', () => {
  const image = catalogue['reading.ac.uk'].images[0];
  assert.ok(!render(3).includes(image));
  assert.ok(render(8, 'ucl.ac.uk').includes('/layout-assets/ucl-stripes-header'));
  assert.ok(render(4).includes('bg-black/20'));
  assert.ok(render(7).includes('bg-black/10'));
  assert.ok(!render(7).includes('Class of 2027'));
  assert.ok(render(0, 'usn.no', 'data:image/png;base64,example').includes('data:image/png;base64,example'));
});

test('Failed photos stop export before any rasterisation', async () => {
  const saved = Object.getOwnPropertyDescriptor(globalThis, 'document');
  Object.defineProperty(globalThis, 'document', { configurable: true, value: { fonts: { ready: Promise.resolve() } } });
  try {
    const node = { querySelector: () => null, querySelectorAll: () => [{ decode: async () => { throw new Error('broken image'); } }] };
    await assert.rejects(exportBanner(node as unknown as HTMLElement), /selected image could not load/);
    const logoFailure = { querySelector: () => ({}), querySelectorAll: () => [] };
    await assert.rejects(exportBanner(logoFailure as unknown as HTMLElement), /selected logo could not load/);
  } finally {
    if (saved) Object.defineProperty(globalThis, 'document', saved);
    else Reflect.deleteProperty(globalThis, 'document');
  }
});

test('Uploads reject active image formats and oversized payloads before decoding', async () => {
  await assert.rejects(preparePhoto(new File(['<svg/>'], 'logo.svg', { type: 'image/svg+xml' })), /JPG, PNG/);
  await assert.rejects(preparePhoto(new File([new Uint8Array(11 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' })), /smaller than 10 MB/);
});

test('Legacy custom text cannot appear in any banner layout', () => {
  for (let layout = 0; layout <= 8; layout++) {
    const legacyProps = { brand: catalogue[layout === 8 ? 'ucl.ac.uk' : 'bi.no-Oslo'], layout: layout as Layout,
      text: 'Business student', subtitle: 'Finance · 2027', imgIndex: 0, logoIndex: 0 };
    const html = renderToStaticMarkup(React.createElement(BannerCanvas, legacyProps));
    assert.ok(!html.includes('Business student'));
    assert.ok(!html.includes('Finance · 2027'));
    assert.ok(!html.includes('data-banner-text'));
  }
});
