import availability from '@/data/availability.json';
import { ALL_UNIVERSITIES } from '@/data/universities';
import { assetCacheHeaders } from '@/lib/catalogue';
import { NextResponse } from 'next/server';

export function GET(request: Request) {
  const domain = new URL(request.url).searchParams.get('domain')?.toLowerCase().trim();
  const school = ALL_UNIVERSITIES.find(u => u.domain === domain);
  if (!school) return new Response('Unknown university', { status: 404 });
  const asset = availability[school.domain as keyof typeof availability];
  if (asset.icon) return NextResponse.redirect(new URL(asset.icon, request.url), { status: 307, headers: assetCacheHeaders });
  const initials = (school.short || school.name).replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase();
  return new Response(`<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"><rect width="96" height="96" rx="16" fill="#e2e8f0"/><text x="48" y="57" text-anchor="middle" fill="#334155" font-family="sans-serif" font-size="26" font-weight="bold">${initials}</text></svg>`, { headers: { ...assetCacheHeaders, 'Content-Type': 'image/svg+xml' } });
}
