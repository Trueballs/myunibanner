import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import vm from 'node:vm';
import ts from 'typescript';
import sharp from 'sharp';
import { normalizeLogo } from './normalize-logo.mjs';

const root = process.cwd();
const publicDir = path.join(root, 'public');
const generated = path.join(publicDir, 'generated');
await fs.mkdir(generated, { recursive: true });
const context = { exports: {} };
vm.runInNewContext(ts.transpileModule(await fs.readFile('src/data/universities.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText, context);
const schools = context.exports.ALL_UNIVERSITIES;
const brandColors = JSON.parse(await fs.readFile('src/data/brand-colors.json', 'utf8'));
for (const school of schools) {
  if (!brandColors.schools[school.domain]) throw new Error(`Missing colour review: ${school.domain}`);
}
const catalogue = {};
const availability = {};
const excluded = [];
const derived = new Map();
const metadataCache = new Map();
const normalizedLogos = new Map();
async function normalizedLogo(file) {
  if (!normalizedLogos.has(file)) normalizedLogos.set(file, normalizeLogo(await fs.readFile(file)));
  return normalizedLogos.get(file);
}

async function readJson(file) {
  try { return JSON.parse(await fs.readFile(file, 'utf8')); } catch { return null; }
}
async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
  const files = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name, 'en'))) {
    if (entry.name.startsWith('.')) continue;
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(file));
    else if (/\.(png|jpe?g|webp|avif|svg)$/i.test(entry.name)) files.push(file);
  }
  return files;
}

async function derivative(file, kind) {
  const key = `${file}:${kind}`;
  if (derived.has(key)) return derived.get(key);
  const task = (async () => {
    const input = await fs.readFile(file);
    const isLogo = ['logo', 'logo-thumb', 'icon'].includes(kind);
    const hash = crypto.createHash('sha256').update(input).update(`${isLogo ? 'logo-normalized-v2' : 'asset-v1'}:${kind}`).digest('hex').slice(0, 20);
    const extension = kind === 'photo' || kind === 'thumb' || kind === 'showcase' ? 'webp' : 'png';
    const url = `/generated/${kind}-${hash}.${extension}`;
    const dest = path.join(publicDir, url);
    try { await fs.access(dest); return url; } catch { /* Generate once per content hash. */ }
    const pixels = isLogo ? (await normalizedLogo(file)).buffer : input;
    let image = sharp(pixels, { limitInputPixels: 100_000_000 }).rotate();
    if (kind === 'thumb') image = image.resize(160, 100, { fit: 'cover' }).webp({ quality: 75 });
    else if (kind === 'photo') image = image.resize({ width: 2000, withoutEnlargement: true }).webp({ quality: 88 });
    else if (kind === 'showcase') image = image.resize({ width: 1000, withoutEnlargement: true }).webp({ quality: 80 });
    else if (kind === 'logo-thumb') image = image.resize(160, 96, { fit: 'inside', withoutEnlargement: true }).png();
    else if (kind === 'icon') image = image.resize(96, 96, { fit: 'inside', withoutEnlargement: true }).png();
    else image = image.resize(1000, 600, { fit: 'inside', withoutEnlargement: true }).png();
    await image.toFile(dest);
    return url;
  })();
  derived.set(key, task);
  return task;
}

async function logoMetadata(file) {
  if (metadataCache.has(file)) return metadataCache.get(file);
  const { data, info } = await sharp((await normalizedLogo(file)).buffer).resize(256, 256, { fit: 'inside' }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const buckets = new Map();
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) continue;
    const key = [data[i], data[i + 1], data[i + 2]].map(c => Math.floor(c / 32)).join(',');
    const bucket = buckets.get(key) || { weight: 0, rgb: [0, 0, 0] };
    const weight = data[i + 3] / 255;
    bucket.weight += weight;
    for (let j = 0; j < 3; j++) bucket.rgb[j] += data[i + j] * weight;
    buckets.set(key, bucket);
  }
  const dominant = [...buckets.values()].sort((a, b) => b.weight - a.weight)[0];
  const rgb = dominant ? dominant.rgb.map(c => Math.round(c / dominant.weight)) : [0, 0, 0];
  const logoColor = '#' + rgb.map(c => c.toString(16).padStart(2, '0')).join('');
  const corners = [0, info.width - 1, (info.height - 1) * info.width, info.width * info.height - 1];
  const hasBg = corners.every(p => data[p * 4 + 3] > 240);
  const result = { hasBg, logoColor, isLight: 0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2] > 140 };
  metadataCache.set(file, result);
  return result;
}

for (const school of schools) {
  const base = path.join(publicDir, school.root, school.folder);
  const logoRoot = path.join(base, 'Logo');
  const photoRoot = path.join(base, 'Bilder_HighRez');
  const allLogos = await walk(logoRoot);
  const allPhotos = await walk(photoRoot);
  const oldGeneral = await readJson(`src/data/cache/${school.domain}.json`);
  const known = [];
  for (const campus of [null, ...(school.campuses || [])]) {
    const old = await readJson(`src/data/cache/${school.domain}${campus ? `-${campus}` : ''}.json`);
    known.push(...(old?.logos || []));
  }
  let icon = null;
  const iconFiles = await walk(path.join(base, 'logo-search'));
  const preferredIcon = iconFiles.find(f => path.basename(f) === school.logoSearch);
  // Prefer a dark or coloured icon for the white school-picker background.
  const iconCandidates = [...new Set([preferredIcon, ...iconFiles].filter(Boolean))];
  iconCandidates.sort((a, b) => Number(/white|hvit/i.test(a)) - Number(/white|hvit/i.test(b)));
  for (const file of iconCandidates) {
    try { icon = await derivative(file, 'icon'); break; }
    catch (error) { excluded.push({ file: path.relative(publicDir, file), reason: String(error) }); }
  }

  for (const campus of [null, ...(school.campuses || [])]) {
    const id = school.domain + (campus ? `-${campus}` : '');
    const old = await readJson(`src/data/cache/${id}.json`) || oldGeneral;
    const colourReview = brandColors.campuses[id] || brandColors.schools[school.domain];
    const legacyColors = old?.colors || [];
    // The repeated blue/gold values were placeholders, not researched brand palettes.
    const knownPlaceholder = legacyColors.map(c => c.toLowerCase()).join(',') === '#003865,#c8a327,#ffffff';
    const colors = colourReview.colors || (knownPlaceholder || school.domain === 'uea.ac.uk'
      ? ['#FFFFFF', '#000000'] : legacyColors.length ? legacyColors : ['#FFFFFF', '#000000']);
    // A general Reading selection means Reading University, not a mixture of two brands.
    const effectiveCampus = campus || (school.domain === 'reading.ac.uk' ? 'Reading University' : null);
    const campusLogos = effectiveCampus ? allLogos.filter(f => path.relative(logoRoot, f).split(path.sep)[0].normalize('NFC') === effectiveCampus.normalize('NFC')) : [];
    const logoFiles = campusLogos.length ? campusLogos : allLogos;
    const logos = [];
    for (const file of logoFiles) {
      const filename = path.relative(logoRoot, file);
      if (school.domain === 'lse.ac.uk' && filename === 'lse-logo(1).jpg') {
        excluded.push({ file: path.relative(publicDir, file), reason: 'Logo variant removed at user request (thumbnail 83e3e42c5cb89bb0213c)' });
        continue;
      }
      // Visually verified duplicate: this SVG embeds a blurrier copy of the black wordmark.
      // Keep the sharper PNG and the distinct coloured crest; preserve original files.
      if (school.domain === 'kcl.ac.uk' && filename === 'Kcl-logo.svg') {
        excluded.push({ file: path.relative(publicDir, file), reason: 'Duplicate black wordmark; sharper logo - tekst black.png retained' });
        continue;
      }
      const previous = known.find(l => {
        const oldFile = new URL(l.url, 'https://assets.local').searchParams.get('file');
        return oldFile?.normalize('NFC') === filename.normalize('NFC');
      });
      if (/wide|campus|aerial|panorama|background/i.test(path.basename(file)) && !previous) continue;
      try {
        const url = await derivative(file, 'logo');
        const thumbnail = await derivative(file, 'logo-thumb');
        const metadata = await logoMetadata(file);
        const normalized = await normalizedLogo(file);
        logos.push({ ...previous, ...metadata, url, thumbnail, filename, width: normalized.width, height: normalized.height, inkCoverage: normalized.inkCoverage, source: `/${school.root}/${school.folder}/Logo/${filename}`,
          isIcon: previous?.isIcon ?? /icon|crest|emblem/i.test(filename),
          isText: previous?.isText ?? !/icon|crest|emblem/i.test(filename), score: previous?.score ?? 0 });
      } catch (error) { excluded.push({ file: path.relative(publicDir, file), reason: String(error) }); }
    }
    logos.sort((a, b) => b.score - a.score || a.filename.localeCompare(b.filename, 'en'));
    // Cached per-logo preferences must not silently reintroduce retired colours.
    for (const logo of logos) {
      if (logo.preferredBg && !colors.some(c => c.toLowerCase() === logo.preferredBg.toLowerCase())) delete logo.preferredBg;
    }
    const images = [], thumbnails = {}, imageSources = {};
    for (const file of allPhotos) {
      if (effectiveCampus && path.relative(photoRoot, file).split(path.sep)[0].normalize('NFC') !== effectiveCampus.normalize('NFC')) continue;
      if (/Victor_Meirelles|with logo/i.test(file)) {
        excluded.push({ file: path.relative(publicDir, file), reason: 'Excluded: unrelated painting or pre-branded image' }); continue;
      }
      try {
        const url = await derivative(file, 'photo');
        const thumb = await derivative(file, 'thumb');
        if (!images.includes(url)) images.push(url);
        thumbnails[url] = thumb;
        imageSources[url] = '/' + path.relative(publicDir, file);
      } catch (error) { excluded.push({ file: path.relative(publicDir, file), reason: String(error) }); }
    }
    const fullLogo = logos.find(l => l.isText) || logos[0];
    catalogue[id] = {
      name: school.short || school.name, fullName: school.name, domain: school.domain,
      campus, logo: icon || '', fullLogo: fullLogo?.url || '', iconLogo: logos.find(l => l.isIcon)?.url,
      logoHasBg: fullLogo?.hasBg || false, logos, images, thumbnails, imageSources,
      colors, colorStatus: colourReview.status, fonts: ['Lexend'],
      available: logos.length > 0,
    };
  }
  availability[school.domain] = { icon, available: catalogue[school.domain].available,
    photoCount: catalogue[school.domain].images.length, logoCount: catalogue[school.domain].logos.length };
}
const showcase = [];
for (const filename of ['linkedin-banner (3).png', 'linkedin-banner (4).png', 'linkedin-banner-reading.png', 'lnbg-reading (6).png']) {
  showcase.push(await derivative(path.join(publicDir, 'showcase-banners', filename), 'showcase'));
}
await fs.writeFile('src/data/catalogue.json', JSON.stringify(catalogue));
await fs.writeFile('src/data/availability.json', JSON.stringify(availability, null, 2));
await fs.writeFile('src/data/showcase.json', JSON.stringify(showcase));
await fs.mkdir('audit/2026-10-27', { recursive: true });
await fs.writeFile('audit/2026-10-27/asset-build.json', JSON.stringify({ records: Object.keys(catalogue).length,
  supportedSchools: Object.values(availability).filter(s => s.available).length,
  excluded: [...new Map(excluded.map(x => [x.file, x])).values()] }, null, 2));
console.log(`Built ${Object.keys(catalogue).length} records; ${Object.values(availability).filter(s => s.available).length}/${schools.length} schools have verified logos.`);
