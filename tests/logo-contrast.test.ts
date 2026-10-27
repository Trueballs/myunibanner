import test from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import BannerCanvas, { type Layout } from '../src/components/BannerCanvas';
import { catalogue } from '../src/lib/catalogue';
import { autoPanelColor, contrastRatio } from '../src/lib/logo-contrast';

function assertPaletteChoice(ink: string, panel: string, colors: string[]) {
  assert.ok(colors.includes(panel), 'Auto must stay inside the school palette');
  const best = Math.max(...colors.map(c => contrastRatio(ink, c)));
  assert.ok(contrastRatio(ink, panel) >= Math.min(4.5, best));
}

test('Auto never adds colours, including through preferences or low-contrast fallback', () => {
  assert.equal(autoPanelColor({isLight:true, logoColor:'#FFFFFF', preferredBg:'#000000'}, ['#E0112B','#FFFFFF']), '#E0112B');
  assert.equal(autoPanelColor({isLight:false, logoColor:'#F43131', preferredBg:'#000000'}, ['#E0112B','#FFFFFF']), '#FFFFFF');
  assert.equal(autoPanelColor({isLight:true, logoColor:'#FFFFFF'}, ['#FFFFFF']), '#FFFFFF');
});

test('The exact red LSE variant requested by the user receives white', () => {
  const brand = catalogue['lse.ac.uk'];
  const logo = brand.logos.find(l => l.thumbnail.endsWith('logo-thumb-450c908c71152893a838.png'))!;
  assert.ok(logo);
  assert.equal(autoPanelColor(logo, brand.colors), '#FFFFFF');
});

test('All school/campus logo variants use their palette in Auto; white artwork cannot land on white', async () => {
  const pixels = new Map<string, boolean>();
  for (const [id, brand] of Object.entries(catalogue)) {
    for (const logo of brand.logos) {
      const panel = autoPanelColor(logo, brand.colors);
      assertPaletteChoice(logo.logoColor!, panel, brand.colors);
      if (!pixels.has(logo.url)) {
        const {data} = await sharp('public' + logo.url).resize(128,128,{fit:'inside'}).ensureAlpha().raw().toBuffer({resolveWithObject:true});
        let white=0, ink=0;
        for(let i=0;i<data.length;i+=4) {
          if(data[i+3]<128) continue;
          ink++;
          if(Math.min(data[i],data[i+1],data[i+2])>230) white++;
        }
        pixels.set(logo.url, ink>0 && white/ink>0.75);
      }
      if(pixels.get(logo.url)) {
        assert.ok(logo.isLight, id + '/' + logo.filename);
        assert.ok(contrastRatio('#FFFFFF', panel) > 1, id + '/' + logo.filename);
      }
    }
  }
});

test('LSE white wordmark is classified by its lettering, not its red accent', () => {
  const brand=catalogue['lse.ac.uk'];
  const logo=brand.logos.find(l=>l.filename==='lse logo - tedkst.png')!;
  assert.ok(logo.isLight);
  assert.ok(contrastRatio('#FFFFFF', autoPanelColor(logo, brand.colors)) >= 4.5);
  assert.notEqual(autoPanelColor(logo, brand.colors).toUpperCase(), '#FFFFFF');
});

test('Every available logo renders with a palette-only Auto panel in every supported layout', () => {
  const seen = new Set<string>();
  for (const brand of Object.values(catalogue)) {
    brand.logos.forEach((logo, logoIndex) => {
      const key = brand.domain + logo.url + brand.colors.join(',');
      if (seen.has(key)) return;
      seen.add(key);
      for (let layout = 0; layout <= (brand.domain === 'ucl.ac.uk' ? 8 : 7); layout++) {
        const html = renderToStaticMarkup(React.createElement(BannerCanvas, {
          brand, logoIndex, imgIndex: 0, layout: layout as Layout, tintIndex: -1,
        }));
        const panel = html.match(/data-logo-panel="(#[a-fA-F0-9]+)"/)?.[1];
        assert.ok(panel, key + ': ' + layout);
        assertPaletteChoice(logo.logoColor!, panel!, brand.colors);
      }
    });
  }
});
