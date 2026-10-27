// Export the same DOM used by the preview. Photos never leave the student's browser.
export async function exportBanner(node: HTMLElement): Promise<Blob> {
  const ready = async () => {
    await document.fonts.ready;
    if (node.querySelector('[data-asset-error]')) throw new Error('A selected logo could not load. Choose another logo and try again.');
    await Promise.all(Array.from(node.querySelectorAll('img')).map(async image => {
      try { await image.decode(); } catch { throw new Error('A selected image could not load. Choose another image and try again.'); }
      if (!image.naturalWidth) throw new Error('A selected image is unavailable. Please choose another.');
    }));
  };
  await withTimeout(ready(), 15000, 'Images are still loading. Please try again in a moment.');
  const { toBlob } = await import('html-to-image');
  const blob = await withTimeout(toBlob(node, {
    width: 1584, height: 396, canvasWidth: 1584, canvasHeight: 396,
    pixelRatio: 1, cacheBust: false, preferredFontFormat: 'woff2',
    style: { transform: 'none', margin: '0' },
  }), 30000, 'The download took too long. Try a smaller photo.');
  if (!blob || blob.size === 0) throw new Error('The banner could not be created. Please try again.');
  return blob;
}

async function withTimeout<T>(task: Promise<T>, ms: number, message: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([task, new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error(message)), ms); })]);
  } finally { clearTimeout(timer); }
}

export async function preparePhoto(file: File): Promise<string> {
  if (!['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(file.type)) {
    throw new Error('Please choose a JPG, PNG, WebP or AVIF photo.');
  }
  if (file.size > 10 * 1024 * 1024) throw new Error('Please choose a photo smaller than 10 MB.');
  let image: ImageBitmap;
  try { image = await createImageBitmap(file); } catch { throw new Error('This photo could not be opened. Try a JPG or PNG.'); }
  try {
    if (image.width * image.height > 40_000_000) throw new Error('Please choose a photo smaller than 40 megapixels.');
    const scale = Math.min(1, 2000 / Math.max(image.width, image.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Your browser could not prepare this image.');
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.92);
  } finally { image.close(); }
}
