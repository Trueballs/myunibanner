import data from '@/data/catalogue.json';

export type LogoVariant = {
  url: string; thumbnail: string; source: string; filename: string; hasBg: boolean;
  width: number; height: number; inkCoverage: number;
  isIcon: boolean; isText: boolean; score: number; isLight: boolean;
  logoColor?: string | null; preferredBg?: string | null;
};
export type BrandData = {
  name: string; fullName: string; domain: string; campus: string | null;
  logo: string; fullLogo: string; iconLogo?: string; logoHasBg: boolean;
  logos: LogoVariant[]; colors: string[]; fonts: string[]; images: string[];
  thumbnails: Record<string, string>; imageSources: Record<string, string>; available: boolean;
};
export const catalogue = data as unknown as Record<string, BrandData>;
export const assetCacheHeaders = { 'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800' };
