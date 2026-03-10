import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const BASE = join(process.cwd(), 'public', 'Universiteter test');

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder') || '';
    const file = searchParams.get('file') || '';

    if (!folder || !file) return new Response('Missing params', { status: 400 });

    const filePath = join(BASE, folder, 'Bilder_HighRez', file);
    if (!existsSync(filePath)) return new Response('Not found', { status: 404 });

    const ext = file.split('.').pop()!.toLowerCase();
    const contentType =
        ext === 'webp' ? 'image/webp' :
            ext === 'avif' ? 'image/avif' :
                ext === 'png' ? 'image/png' :
                    'image/jpeg';

    const buf = readFileSync(filePath);
    return new Response(buf, {
        headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=3600',
        },
    });
}
