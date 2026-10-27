import { NextResponse } from 'next/server';

// Retired endpoint. Banner downloads are generated on-device; no customer integration is used.
export function GET() {
  return NextResponse.json({ error: 'This endpoint has been retired. Please use the banner builder.' }, { status: 410 });
}
export const POST = GET;
