import test from 'node:test';
import assert from 'node:assert/strict';
import { validateDraft } from '../src/lib/banner-draft';
import { catalogue } from '../src/lib/catalogue';

const brand = catalogue['bi.no-Oslo'];
test('Draft restores selections by asset identity and preserves the photo', () => {
  const draft = { version: 1, layout: 5, image: brand.images[1], logo: brand.logos[1].url,
    tint: brand.colors[0], logoScale: 1.25, logoPos: 'center', customImage: 'data:image/jpeg;base64,YQ==' };
  assert.deepEqual(validateDraft(draft, brand), draft);
});
test('Outdated or corrupt drafts cannot select missing assets or inject remote uploads', () => {
  assert.equal(validateDraft(null, brand), null);
  assert.equal(validateDraft({version: 99}, brand), null);
  const draft = validateDraft({version:1, text:'x'.repeat(100), subtitle:'y'.repeat(100), layout:8,
    image:'/missing.png',logo:'/missing.svg',tint:'bad',textSize:Infinity,customImage:'https://example.com/track.png'}, brand)!;
  assert.ok(!('text' in draft)); assert.ok(!('subtitle' in draft));
  assert.equal(draft.layout,0);assert.equal(draft.image,null);assert.equal(draft.logo,null);
  assert.equal(draft.tint,null);assert.equal(draft.customImage,null);
});
