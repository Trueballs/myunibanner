import { ALL_UNIVERSITIES } from '@/data/universities';
import { catalogue } from '@/lib/catalogue';
import { NextResponse } from 'next/server';

export function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const query = (params.get('domain') || params.get('q') || '').trim().toLowerCase();
  if (!query) return NextResponse.json({ error: 'Choose a university to continue.' }, { status: 400 });
  const school = ALL_UNIVERSITIES.find(u => [u.domain, u.name, u.short, ...(u.aliases || [])].some(value => value?.toLowerCase() === query));
  if (!school) return NextResponse.json({ error: 'This university is not in our catalogue yet. Please choose a listed school.' }, { status: 404 });
  const campus = params.get('campus')?.normalize('NFC') || null;
  if (campus && !school.campuses?.some(c => c.normalize('NFC') === campus)) {
    return NextResponse.json({ error: 'This campus is not available for the selected university.' }, { status: 400 });
  }
  const brand = catalogue[school.domain + (campus ? `-${campus}` : '')];
  if (!brand?.available) return NextResponse.json({ error: 'We are still collecting verified assets for this university. Please choose another school or request yours.' }, { status: 422 });
  // Catalogue choices can change between builds; only hashed image files are immutable.
  return NextResponse.json(brand, { headers: { 'Cache-Control': 'no-store' } });
}
