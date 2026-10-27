import type { LogoVariant } from './catalogue';

export function luminance(hex: string): number {
  const h = hex.slice(1);
  const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  const rgb = [0, 2, 4].map(i => {
    const c = parseInt(full.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
}

export function contrastRatio(a: string, b: string): number {
  const x = luminance(a), y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

export function autoPanelColor(logo: Pick<LogoVariant, 'isLight' | 'logoColor' | 'preferredBg'> | null, colors: string[]): string {
  if (!colors.length) throw new Error('Auto background requires a school palette');
  if (!logo) return colors[0];
  const ink = logo.logoColor || (logo.isLight ? '#FFFFFF' : '#000000');
  // Preferences are hints, never exemptions from contrast checking.
  const preferred = colors.find(c => c.toLowerCase() === logo.preferredBg?.toLowerCase());
  const candidates = [...new Set([preferred, ...colors].filter((c): c is string => !!c))];
  const readable = candidates.filter(c => contrastRatio(ink, c) >= 4.5);
  if (readable.length) return readable[0];
  // Never invent a colour outside the school's palette to meet a threshold.
  return candidates.reduce((best, c) => contrastRatio(ink, c) > contrastRatio(ink, best) ? c : best);
}
