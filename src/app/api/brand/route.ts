import { NextResponse } from 'next/server';
import { UK_UNIVERSITIES } from '@/data/universities';
import { existsSync, readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import sharp from 'sharp';

const BASE = join(process.cwd(), 'public', 'Universiteter test');

const DEFINITELY_NOT_LOGO = ['wide', 'campus', 'aerial', 'panorama', 'university college london', 'background'];
const GOOD_LOGO_KEYWORDS = ['tekst', 'text', 'horizontal', 'fullname', 'fullcolour', 'full-colour', 'full colour', 'manchester - logo', 'logo - tekst', 'imperial_logo', 'logo-tekst'];

function scoreFile(f: string): number {
    const fl = f.toLowerCase();
    if (DEFINITELY_NOT_LOGO.some(kw => fl.includes(kw))) return -999;
    let s = 0;
    if (GOOD_LOGO_KEYWORDS.some(kw => fl.includes(kw))) s += 100;
    if (fl.includes('icon')) s -= 10;
    if (fl.includes('crest')) s -= 5;
    // Prefer colour logos over black/monochrome
    if (fl.includes('colour') || fl.includes('color') || fl.includes('fullcolour') || fl.includes('full-colour')) s += 10;
    if (fl.includes('black') || fl.includes('white') || fl.includes('singlecolour') || fl.includes('monochrome')) s -= 10;
    if (fl.endsWith('.svg')) s += 20;
    if (fl.endsWith('.png')) s += 10;
    if (fl.endsWith('.webp')) s += 5;
    if (fl.endsWith('.jpg') || fl.endsWith('.jpeg')) s -= 5;
    return s;
}

/** Detect if a raster image (PNG/WebP) has a solid background via corner alpha sampling */
async function rasterHasBg(filePath: string): Promise<boolean> {
    try {
        const img = sharp(filePath);
        const { width, height, channels } = await img.metadata();
        if (!width || !height) return false;

        const PATCH = 6;
        const corners = [
            { left: 0, top: 0 },
            { left: Math.max(0, width - PATCH), top: 0 },
            { left: 0, top: Math.max(0, height - PATCH) },
            { left: Math.max(0, width - PATCH), top: Math.max(0, height - PATCH) },
        ];

        // No alpha channel = has an opaque background
        const hasAlphaChannel = channels && channels >= 4;

        let totalAlpha = 0;
        let totalR = 0, totalG = 0, totalB = 0;

        for (const corner of corners) {
            const raw = await sharp(filePath)
                .extract({ left: corner.left, top: corner.top, width: PATCH, height: PATCH })
                .raw()
                .toBuffer({ resolveWithObject: true });
            const data = raw.data;
            const stride = hasAlphaChannel ? 4 : 3;
            const pixCount = data.length / stride;
            let patchAlpha = 0;
            for (let i = 0; i < data.length; i += stride) {
                totalR += data[i];
                totalG += data[i + 1];
                totalB += data[i + 2];
                patchAlpha += hasAlphaChannel ? data[i + 3] : 255;
            }
            totalAlpha += patchAlpha / pixCount;
        }

        const avgAlpha = totalAlpha / corners.length;
        const isOpaque = !hasAlphaChannel || avgAlpha >= 240;
        return isOpaque; // opaque corners = has background, show logo as-is
    } catch {
        return false;
    }
}

/** Detect if a logo is primarily "light" colored (meaning it looks good on dark backgrounds without modifying it) */
async function imageIsLight(filePath: string): Promise<boolean> {
    try {
        const raw = await sharp(filePath).resize(32, 32, { fit: 'fill' }).raw().toBuffer({ resolveWithObject: true });
        const data = raw.data;
        const info = raw.info;
        const stride = info.channels;

        let totalLuma = 0;
        let count = 0;

        for (let i = 0; i < data.length; i += stride) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = stride >= 4 ? data[i + 3] : 255;

            // Only count pixels that are reasonably opaque
            if (a > 50) {
                const luma = 0.299 * r + 0.587 * g + 0.114 * b;
                totalLuma += luma;
                count++;
            }
        }

        if (count === 0) return true; // empty transparent image? default to true
        const avgLuma = totalLuma / count;
        return avgLuma > 125; // if avg brightness > 125, it's considered a "light" logo
    } catch {
        // Fallback or SVG parsing error
        const f = filePath.toLowerCase();
        if (f.includes('white') || f.includes('light') || f.includes('inv')) return true;
        if (f.includes('black') || f.includes('dark')) return false;
        return true;
    }
}



async function getAllLogos(folder: string, domain: string): Promise<Array<{
    url: string; hasBg: boolean; isIcon: boolean; isText: boolean; score: number; filename: string;
}>> {
    const logoDir = join(BASE, folder, 'Logo');
    if (!existsSync(logoDir)) return [];
    const files = readdirSync(logoDir)
        .filter(f => /\.(png|svg|webp|jpg|jpeg)$/i.test(f) && !f.startsWith('.'))
        .filter(f => scoreFile(f) > -500);

    const results = await Promise.all(files.map(async (f) => {
        const fl = f.toLowerCase();
        const ext = f.split('.').pop()?.toLowerCase() ?? '';
        const isIcon = fl.includes('icon') || fl.includes('crest') || fl.includes('incon');
        const isText = !isIcon;

        let hasBg = ext === 'jpg' || ext === 'jpeg';
        if (!hasBg && (ext === 'png' || ext === 'webp')) {
            hasBg = await rasterHasBg(join(logoDir, f));
        }

        const isLight = await imageIsLight(join(logoDir, f));

        return {
            url: `/api/full-logo?domain=${domain}&file=${encodeURIComponent(f)}&v=${Date.now()}`,
            hasBg,
            isLight,
            isIcon,
            isText,
            score: scoreFile(f),
            filename: f,
        };
    }));

    return results.sort((a, b) => b.score - a.score);
}

function getImageFiles(folder: string): string[] {
    const dir = join(BASE, folder, 'Bilder_HighRez');
    if (!existsSync(dir)) return [];
    return readdirSync(dir)
        .filter(f => /\.(jpe?g|png|webp|avif)$/i.test(f) && !f.toLowerCase().includes('with logo'))
        .map(f => `/api/uni-image?folder=${encodeURIComponent(folder)}&file=${encodeURIComponent(f)}`);
}

function getBrand(folder: string) {
    const jsonDir = join(BASE, folder, 'Brand_Farger_Fonter');
    if (!existsSync(jsonDir)) return null;
    const file = readdirSync(jsonDir).find(f => f.endsWith('.json'));
    if (!file) return null;
    try {
        return JSON.parse(readFileSync(join(jsonDir, file), 'utf8'));
    } catch { return null; }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.toLowerCase().trim() || '';
    if (!query) return NextResponse.json({ error: 'No query' }, { status: 400 });

    const match =
        UK_UNIVERSITIES.find(u =>
            u.domain === query ||
            u.name.toLowerCase() === query ||
            u.short?.toLowerCase() === query
        ) ??
        UK_UNIVERSITIES.find(u =>
            u.name.toLowerCase().includes(query) ||
            u.short?.toLowerCase().includes(query) ||
            u.domain.toLowerCase().includes(query)
        );

    if (!match) {
        return NextResponse.json({ error: 'University not found' }, { status: 404 });
    }

    const brand = getBrand(match.folder);
    const images = getImageFiles(match.folder);
    const logos = await getAllLogos(match.folder, match.domain);
    const colors: string[] = brand?.colors?.map((c: { hex: string }) => c.hex) ?? ['#003865'];
    const fonts: string[] = brand?.fonts?.map((f: { name: string }) => f.name) ?? ['Inter'];

    const bestTextLogo = logos.find(l => l.isText) ?? logos[0];
    const bestIconLogo = logos.find(l => l.isIcon) ?? logos[logos.length - 1] ?? logos[0];

    return NextResponse.json({
        name: match.short || match.name,
        fullName: match.name,
        domain: match.domain,
        folder: match.folder,
        logo: `/api/logo?domain=${match.domain}`,
        fullLogo: bestTextLogo?.url ?? `/api/full-logo?domain=${match.domain}&v=${Date.now()}`,
        iconLogo: bestIconLogo?.url,
        logoHasBg: bestTextLogo?.hasBg ?? false,
        logos,
        colors,
        fonts,
        images,
    });
}
