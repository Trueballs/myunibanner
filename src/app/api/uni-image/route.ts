import { assetCacheHeaders,catalogue } from '@/lib/catalogue';
import { NextResponse } from 'next/server';

// Legacy URL compatibility: resolve only known manifest entries, never user-supplied filesystem paths.
export function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const root = params.get('root') || 'uk-universities';
  const folder = params.get('folder');
  const file = params.get('file');
  if (!['uk-universities', 'norske-universiteter'].includes(root) || !folder || !file) return new Response('Invalid image', { status: 400 });
  const source = `/${root}/${folder}/Bilder_HighRez/${file}`.normalize('NFC');
  for (const brand of Object.values(catalogue)) {
    const image = Object.entries(brand.imageSources).find(([, original]) => original.normalize('NFC') === source);
    if (image) return NextResponse.redirect(new URL(image[0], request.url), { status: 307, headers: assetCacheHeaders });
  }
  return new Response('Image unavailable', { status: 404 });
}
