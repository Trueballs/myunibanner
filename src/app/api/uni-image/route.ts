import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder') || '';
    const file = searchParams.get('file') || '';
    const root = searchParams.get('root') || 'uk-universities';

    if (!folder || !file) return new Response('Missing params', { status: 400 });

    const basePath = join(process.cwd(), 'public', root);
    const filePath = join(basePath, folder, 'Bilder_HighRez', file);
    
    // SIKKERHETSFIKS: Sikre at path-en faktsik starter med basePath for å forhindre Directory Traversal (LFI)
    if (!filePath.startsWith(basePath)) {
        return new Response('Forbidden', { status: 403 });
    }
    
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
