import { NextResponse } from 'next/server';
import { existsSync, readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { ALL_UNIVERSITIES } from '@/data/universities';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const domain = (searchParams.get('domain') || '').toLowerCase().trim();

    if (!domain) {
        return new Response('No domain', { status: 400 });
    }

    const uni = ALL_UNIVERSITIES.find(u => u.domain === domain);
    if (!uni) {
        return NextResponse.redirect(`https://logo.clearbit.com/${domain}`);
    }

    const logoDir = join(process.cwd(), 'public', uni.root, uni.folder, 'logo-search');

    if (existsSync(logoDir)) {
        // Find any image file in the logo-search folder
        const files = readdirSync(logoDir).filter(f => /\.(jpe?g|png|svg|webp|ico)$/i.test(f));
        if (files.length > 0) {
            const filePath = join(logoDir, files[0]);
            const fileBuffer = readFileSync(filePath);
            const ext = files[0].split('.').pop()!.toLowerCase();
            const contentType =
                ext === 'svg' ? 'image/svg+xml' :
                    ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' :
                        ext === 'png' ? 'image/png' :
                            ext === 'webp' ? 'image/webp' :
                                'image/jpeg';
            return new Response(fileBuffer, {
                headers: {
                    'Content-Type': contentType,
                    'Cache-Control': 'public, max-age=3600, s-maxage=3600',
                },
            });
        }
    }

    // Fallback to Clearbit
    return NextResponse.redirect(`https://logo.clearbit.com/${domain}`);
}
