import { assetCacheHeaders,catalogue } from '@/lib/catalogue';
import { NextResponse } from 'next/server';

export function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const domain = params.get('domain')?.trim().toLowerCase();
  const file = params.get('file')?.normalize('NFC');
  const brand = domain ? catalogue[domain] : undefined;
  if (!brand?.available) return new Response('Logo unavailable', { status: 404 });
  const variants = Object.values(catalogue).filter(b => b.domain === domain).flatMap(b => b.logos);
  const logo = file ? variants.find(l => l.filename.normalize('NFC') === file || l.filename.split('/').pop()?.normalize('NFC') === file) : brand.logos[0];
  if (!logo) return new Response('Logo unavailable', { status: 404 });
  return NextResponse.redirect(new URL(logo.url, request.url), { status: 307, headers: assetCacheHeaders });
}
