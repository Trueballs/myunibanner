# Myunibanner

LinkedIn banners for UK and Norwegian university students. The editor and PNG download use the same `BannerCanvas` component at 1584 × 396 pixels. Custom photos and exports stay in the browser.

## Run and check

```sh
npm ci
npm run assets
npm run dev
npm run lint
npm test
npm run build
npm run start -- --hostname 127.0.0.1 --port 3086
node tests/http-smoke.mjs
```

`npm run build` regenerates assets automatically. The scripts invoke Node explicitly because this checkout's parent folder contains a colon, which breaks npm's usual executable PATH lookup.

## University assets

School definitions live in `src/data/universities.ts`. Original assets live beneath the school's `public/<root>/<folder>/` directory:

- `logo-search/`: small school-selection icon; `logoSearch` selects the preferred source.
- `Logo/`: banner logos, optionally grouped into campus subdirectories.
- `Bilder_HighRez/`: campus photos, grouped into campus subdirectories where applicable.

`npm run assets` checks image decoding, generates content-hashed static icons, logos, logo thumbnails, photo thumbnails and 2000-pixel previews, and writes `src/data/catalogue.json`, `availability.json` and `showcase.json`. Original images are preserved. Transparent and white outer padding is trimmed from derived logos; trimmed artwork fits the available box with its proportions preserved. Small/Normal occupy 70%/90% of that box; Large reaches 125%, with width caps for narrow panels. The blurrier duplicate King’s College wordmark is excluded. Small/Normal/Large use the same safe bounds in every layout, including UCL stripes. `src/data/cache/` is legacy colour/logo metadata input only; its old image URLs are not used at runtime. Exclusions are recorded in `audit/2026-10-27/asset-build.json`.

Add properly sourced institution/campus assets to the original directories and rebuild; do not edit generated files manually. A school with no decodable banner logos is marked unavailable. Schools with logos but no campus photos support a solid banner or a local photo upload. General Reading URLs select Reading University assets; Henley has its own campus record.

Generated filenames are immutable and served with long-lived cache headers. Keep generated files with source control for reproducible deploys. Do not delete old hashes from a running deployment while an older page may still reference them.

## Export and legacy endpoints

`src/lib/export-banner.ts` checks images and fonts before capturing the preview with `html-to-image`. Uploads accept JPG, PNG, WebP or AVIF up to 10 MB / 40 megapixels and resize locally. Gallery thumbnails never load full-resolution originals.

`/api/brand`, `/api/logo`, `/api/full-logo` and `/api/uni-image` resolve only known catalogue entries. The old server-render, download-proxy and Shopify endpoints return HTTP 410. No Shopify credentials are required by the application. The mock `/api/generate-layout` route is unrelated to the active editor.

## Verification and remaining content work

Automated checks cover all university/campus records, generated-image decoding and size budgets, all nine layout structures, failed-image export prevention, upload validation and retired/traversal routes. HTTP smoke tests target a local production server only.

There are currently 27 schools with banner assets shown in the picker. The 22 schools awaiting assets are hidden from the picker, including search and country filters; their records remain available for future asset work. USN and Innlandet still need official campus photos; uploads and solid backgrounds work for both. The fixes do not invent university imagery or substitute another institution's branding.

Before releasing, check the actual PNG download on desktop and mobile browsers, including Safari: Reading and Henley, the UCL stripe layout, a local upload, a failed image, keyboard school selection and a change of campus. Chrome desktop PNG export and responsive editor controls have been checked locally. Real mobile browsers and Safari still need release checks.

Production deployment is separate from the local build; no automatic push or Vercel deployment is performed by these commands.

Custom text has been removed from the editor and renderer. Legacy text fields are ignored when restoring drafts, while layout, logo, colours and photos are preserved. Mobile previews stay below the sticky header and can expand into a native dialog. Drafts (including prepared JPEG uploads) are saved per school/campus in IndexedDB; saves are serialized, assets are restored by URL, storage failures are surfaced, and reset can be undone during the session. Drafts are local to the browser and origin.

## Colour sources and project story

`src/data/brand-colors.json` is the canonical colour registry. It distinguishes published-guidance evidence, current official-website evidence, and pending confirmation. The asset build applies verified palettes to every campus and removes stale per-logo background overrides. Known copied blue/gold placeholders fall back to neutrals. See `audit/2026-10-27/colour-audit.md` for all 49 schools, before/after values, sources and remaining confirmation work. Do not overwrite generated catalogue colours manually.

`/about` is the employer-facing project case study, linked from the shared header. It explains the student problem, product flow, implementation and commercial lessons. Coverage figures are derived from the availability catalogue.

Auto background selection uses the dominant visible colour measured from each normalized logo, checks preferred backgrounds against a 4.5:1 contrast threshold, and otherwise chooses the highest-contrast colour within the school palette. It never adds a colour outside that palette. Photo-only layouts add a solid logo panel in Auto; UCL stripes follow the selected contrast colour. Regression checks cover every logo/layout pairing and independently identify predominantly white artwork. This checks the main artwork, not every accent in a multicolour logo.
