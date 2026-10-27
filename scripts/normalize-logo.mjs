import sharp from 'sharp';

// Trim padding, never reshape artwork or remove an intentional coloured background.
export async function normalizeLogo(input) {
  const oriented = await sharp(input, { limitInputPixels: 100_000_000 }).rotate().png().toBuffer();
  const original = await sharp(oriented).metadata();
  const { data, info } = await sharp(oriented).resize(1024, 1024, { fit: 'inside', withoutEnlargement: true }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const corners = [0, width - 1, (height - 1) * width, width * height - 1];
  const whiteMatte = corners.every(p => data[p * 4 + 3] >= 250 && data[p * 4] >= 248 && data[p * 4 + 1] >= 248 && data[p * 4 + 2] >= 248);
  let left = width, top = height, right = -1, bottom = -1, ink = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const p = (y * width + x) * 4;
      if (data[p + 3] < 4) continue;
      if (whiteMatte && data[p] >= 248 && data[p + 1] >= 248 && data[p + 2] >= 248) continue;
      left = Math.min(left, x); right = Math.max(right, x);
      top = Math.min(top, y); bottom = Math.max(bottom, y);
      ink += data[p + 3] / 255;
    }
  }
  if (right < left || bottom < top) return { buffer: oriented, width: original.width, height: original.height, inkCoverage: 1, trimmed: false };
  const inkCoverage = Math.max(0.05, Math.min(1, ink / ((right - left + 1) * (bottom - top + 1))));
  // One analysis pixel of bleed preserves antialiased edges and fine strokes.
  const sx = original.width / width, sy = original.height / height;
  const x = Math.max(0, Math.floor((left - 1) * sx));
  const y = Math.max(0, Math.floor((top - 1) * sy));
  const endX = Math.min(original.width, Math.ceil((right + 2) * sx));
  const endY = Math.min(original.height, Math.ceil((bottom + 2) * sy));
  const bounds = { left: x, top: y, width: endX - x, height: endY - y };
  const buffer = await sharp(oriented).extract(bounds).png().toBuffer();
  return { buffer, width: bounds.width, height: bounds.height, inkCoverage,
    trimmed: bounds.width < original.width || bounds.height < original.height };
}
