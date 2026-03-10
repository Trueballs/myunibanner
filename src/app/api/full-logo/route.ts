import { existsSync, readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { UK_UNIVERSITIES } from '@/data/universities';
import sharp from 'sharp';

const BASE = join(process.cwd(), 'public', 'Universiteter test');

const DEFINITELY_NOT_LOGO = [
    'wide', 'campus', 'aerial', 'panorama', 'university college london', 'background',
];

const GOOD_LOGO_KEYWORDS = [
    'tekst', 'text', 'horizontal', 'fullname', 'fullcolour', 'full-colour',
    'full colour', 'manchester - logo', 'logo - tekst', 'imperial_logo - tekst',
    'logo - tekst', 'logo-tekst',
];

function scoreFile(filename: string): number {
    const fl = filename.toLowerCase();
    if (DEFINITELY_NOT_LOGO.some(kw => fl.includes(kw))) return -999;
    let score = 0;
    if (GOOD_LOGO_KEYWORDS.some(kw => fl.includes(kw))) score += 100;
    if (fl.includes('icon')) score -= 10;
    if (fl.includes('crest')) score -= 5;
    // Prefer colour logos over black/monochrome (better visibility on dark backgrounds)
    if (fl.includes('colour') || fl.includes('color') || fl.includes('fullcolour') || fl.includes('full-colour')) score += 10;
    if (fl.includes('black') || fl.includes('white') || fl.includes('singlecolour') || fl.includes('monochrome')) score -= 10;
    if (fl.endsWith('.svg')) score += 20;
    if (fl.endsWith('.png')) score += 10;
    if (fl.endsWith('.webp')) score += 5;
    if (fl.endsWith('.jpg') || fl.endsWith('.jpeg')) score -= 5;
    return score;
}

/**
 * Detects if a PNG has a solid (non-transparent) background.
 * Samples the four corners and if all have alpha >= 250, the image has a background.
 * Also returns the dominant background color as a hex string.
 */
async function detectPngBackground(filePath: string): Promise<{ hasBg: boolean; bgColor?: string }> {
    try {
        const img = sharp(filePath);
        const { width, height, channels } = await img.metadata();
        if (!width || !height || !channels) return { hasBg: false };

        const PATCH = 8;
        const corners = [
            { left: 0, top: 0 },
            { left: Math.max(0, width - PATCH), top: 0 },
            { left: 0, top: Math.max(0, height - PATCH) },
            { left: Math.max(0, width - PATCH), top: Math.max(0, height - PATCH) },
        ];

        const hasAlpha = channels >= 4;
        let totalAlpha = 0;
        let cornerR = 0, cornerG = 0, cornerB = 0;

        for (const corner of corners) {
            const { data } = await sharp(filePath)
                .extract({ left: corner.left, top: corner.top, width: PATCH, height: PATCH })
                .raw()
                .toBuffer({ resolveWithObject: true });

            const stride = hasAlpha ? 4 : 3;
            const pixelCount = data.length / stride;
            let patchAlpha = 0;
            for (let i = 0; i < data.length; i += stride) {
                cornerR += data[i];
                cornerG += data[i + 1];
                cornerB += data[i + 2];
                patchAlpha += hasAlpha ? data[i + 3] : 255;
            }
            totalAlpha += patchAlpha / pixelCount;
        }

        const avgAlpha = totalAlpha / corners.length;
        const isOpaque = !hasAlpha || avgAlpha >= 240;
        if (!isOpaque) return { hasBg: false };

        // Fully opaque background — get the color for reference
        const pixCount = corners.length * PATCH * PATCH;
        const r = Math.round(cornerR / pixCount);
        const g = Math.round(cornerG / pixCount);
        const b = Math.round(cornerB / pixCount);
        const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        return { hasBg: true, bgColor: hex };
    } catch {
        return { hasBg: false };
    }
}


export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const domain = (searchParams.get('domain') || '').toLowerCase().trim();
    const fileParam = searchParams.get('file') || '';

    if (!domain) return new Response('No domain', { status: 400 });

    const uni = UK_UNIVERSITIES.find(u => u.domain === domain);
    if (!uni) return new Response('Not found', { status: 404 });

    const logoDir = join(BASE, uni.folder, 'Logo');
    if (!existsSync(logoDir)) return new Response('No logo dir', { status: 404 });

    let chosen: string;

    if (fileParam) {
        const sanitized = fileParam.replace(/\.\./g, '').replace(/\//g, '');
        const allFiles = readdirSync(logoDir).filter(f => /\.(png|svg|webp|jpg|jpeg)$/i.test(f));
        const match = allFiles.find(f => f === sanitized || f === fileParam);
        if (!match) return new Response('File not found', { status: 404 });
        chosen = match;
    } else {
        const allFiles = readdirSync(logoDir)
            .filter(f => /\.(png|svg|webp|jpg|jpeg)$/i.test(f) && !f.startsWith('.'));
        if (allFiles.length === 0) return new Response('No logo', { status: 404 });
        const ranked = [...allFiles].sort((a, b) => scoreFile(b) - scoreFile(a));
        chosen = ranked[0];
    }

    const filePath = join(logoDir, chosen);
    if (!existsSync(filePath)) return new Response('File missing', { status: 404 });

    const ext = chosen.split('.').pop()!.toLowerCase();
    const contentType =
        ext === 'svg' ? 'image/svg+xml' :
            ext === 'webp' ? 'image/webp' :
                ext === 'png' ? 'image/png' :
                    'image/jpeg';

    // JPGs always have bg; for PNGs use sharp to detect
    let hasBg = ext === 'jpg' || ext === 'jpeg';
    let bgColor: string | undefined;

    if (ext === 'png' || ext === 'webp') {
        const result = await detectPngBackground(filePath);
        hasBg = result.hasBg;
        bgColor = result.bgColor;
    }

    const buf = readFileSync(filePath);
    return new Response(buf, {
        headers: {
            'Content-Type': contentType,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'X-Logo-File': chosen,
            'X-Logo-Score': String(scoreFile(chosen)),
            'X-Logo-HasBg': String(hasBg),
            ...(bgColor ? { 'X-Logo-BgColor': bgColor } : {}),
        },
    });
}
