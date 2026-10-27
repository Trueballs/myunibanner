import type { BrandData } from './catalogue';
import type { Layout } from '../components/BannerCanvas';

export type BannerDraft = {
  version: 1;
  layout: Layout; image: string | null; logo: string | null; tint: string | null;
  logoScale: number; logoPos: 'top' | 'center' | 'bottom'; customImage: string | null;
};
export function validateDraft(value: unknown, brand: BrandData): BannerDraft | null {
  if (!value || typeof value !== 'object' || (value as BannerDraft).version !== 1) return null;
  const d = value as BannerDraft;
  return {
    version: 1,
    layout: Number.isInteger(d.layout) && d.layout >= 0 && d.layout <= (brand.domain === 'ucl.ac.uk' ? 8 : 7) ? d.layout : 0,
    image: brand.images.includes(d.image || '') ? d.image : null,
    logo: brand.logos.some(l => l.url === d.logo) ? d.logo : null,
    tint: brand.colors.includes(d.tint || '') ? d.tint : null,
    logoScale: [0.75, 1, 1.25].includes(d.logoScale) ? d.logoScale : 1,
    logoPos: ['top', 'center', 'bottom'].includes(d.logoPos) ? d.logoPos : 'bottom',
    customImage: typeof d.customImage === 'string' && d.customImage.length <= 15_000_000 && /^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(d.customImage) ? d.customImage : null,
  };
}
// IndexedDB keeps uploaded photos on this device without localStorage's small quota.
async function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('unibanner-drafts', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('drafts');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('Draft storage is blocked'));
  });
}
export async function readDraft(key: string): Promise<unknown> {
  const db = await database();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction('drafts', 'readonly');
      const request = tx.objectStore('drafts').get(key);
      tx.oncomplete = () => resolve(request.result);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } finally { db.close(); }
}
export async function writeDraft(key: string, draft: BannerDraft): Promise<void> {
  const db = await database();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('drafts', 'readwrite');
      tx.objectStore('drafts').put(draft, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } finally { db.close(); }
}
