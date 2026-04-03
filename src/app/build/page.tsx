"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { Download, RefreshCw, ChevronLeft, ChevronRight, X, Shuffle, CheckCircle, Upload, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toBlob, toPng } from "html-to-image";

import { useSearchParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ALL_UNIVERSITIES } from "@/data/universities";

/* ═══════════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════════ */
type LogoVariant = {
    url: string;
    hasBg: boolean;
    isIcon: boolean;
    isText: boolean;
    score: number;
    filename: string;
    isLight?: boolean;
    logoColor?: string | null;
    preferredBg?: string | null;
};

type BrandData = {
    name: string;
    fullName: string;
    domain: string;
    logo: string;
    fullLogo: string;
    iconLogo?: string;
    logoHasBg: boolean;
    logos: LogoVariant[];
    colors: string[];
    fonts: string[];
    images: string[];
};

type Layout = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

/* ═══════════════════════════════════════════════════════════════
   LINKEDIN CANVAS CONSTANTS
   Absolute: 1584 × 396 px  (4:1 ratio)
   Danger Zone (avatar): x 0–568, y 132–396  →  keep EMPTY
   Safe Zone: centred 1128 × 300 px  (x 228–1356, y 48–348)
   Mobile margins: outer 64 px each side are cropped on mobile
═══════════════════════════════════════════════════════════════ */
const W = 1584;
const H = 396;

// Danger zone (avatar area) – nothing of value can sit here
const DZ_X = 0;
const DZ_Y = 132;
const DZ_W = 568;
const DZ_H = 264;

// Safe zone for all content
const SZ_X = 228;            // = (1584 - 1128) / 2
const SZ_Y = 48;             // = (396 - 300) / 2
const SZ_W = 1128;
const SZ_H = 300;

// Mobile-safe inner margin (content that appears on mobile)
const MOBILE_MARGIN = 64;

/* ═══════════════════════════════════════════════════════════════
   COLOR UTILITIES
═══════════════════════════════════════════════════════════════ */
function hexToRgb(hex: string): [number, number, number] {
    const h = hex.replace("#", "");
    const n = parseInt(h.length === 3 ? h.split("").map(c => c + c).join("") : h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function luma(hex: string) {
    const [r, g, b] = hexToRgb(hex);
    return 0.299 * r + 0.587 * g + 0.114 * b;
}
function isDark(hex: string) { return luma(hex) < 140; }

/** Pick contrasting text colour (black or white) for a given background */
function contrastText(bg: string) { return isDark(bg) ? "#ffffff" : "#111111"; }

/** Blend two hex colours at a ratio (0=a, 1=b) */
function blendHex(a: string, b: string, t: number): string {
    const [ar, ag, ab] = hexToRgb(a);
    const [br, bg2, bb] = hexToRgb(b);
    const r = Math.round(ar + (br - ar) * t);
    const g = Math.round(ag + (bg2 - ag) * t);
    const bl = Math.round(ab + (bb - ab) * t);
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${bl.toString(16).padStart(2, "0")}`;
}

/** Pick the best contrasting background colour from the brand palette.
 *  Returns null if no fix is needed (logo already contrasts with panel). */
function pickContrastPill(
    logoIsLight: boolean,
    panelColor: string,
    brandColors: string[],
): string | null {
    const panelLight = !isDark(panelColor);
    // Logo and panel are the same brightness class → logo invisible
    const logoBlends = (logoIsLight && panelLight) || (!logoIsLight && isDark(panelColor));
    if (!logoBlends) return null;

    // Find the brand colour with the maximum luma-distance from the panel
    let bestColor: string | null = null;
    let bestDist = 0;
    const pLuma = luma(panelColor);
    for (const c of brandColors) {
        const dist = Math.abs(luma(c) - pLuma);
        if (dist > bestDist) { bestDist = dist; bestColor = c; }
    }
    // Also consider pure white / black as fallbacks
    if (Math.abs(255 - pLuma) > bestDist) { bestColor = "#ffffff"; bestDist = Math.abs(255 - pLuma); }
    if (pLuma > bestDist) { bestColor = "#111111"; }

    return bestColor;
}

/** Check if two colors are too similar to each other */
function colorsAreSimilar(hex1: string, hex2: string, threshold = 40): boolean {
    const [r1, g1, b1] = hexToRgb(hex1);
    const [r2, g2, b2] = hexToRgb(hex2);
    const dist = Math.sqrt(Math.pow(r2 - r1, 2) + Math.pow(g2 - g1, 2) + Math.pow(b2 - b1, 2));
    return dist < threshold;
}

/* ═══════════════════════════════════════════════════════════════
   LOGO RENDERER
   Handles transparent, opaque-bg, and needs-invert scenarios.
   NEW RULE: if a transparent logo would be invisible against the
   panel (same brightness class), wrap it in a contrasting pill
   using the best brand colour.
═══════════════════════════════════════════════════════════════ */
function SmartLogo({
    src, hasBg, isLight = true, panelColor, h = 100, maxW = 280, brandColors = [],
}: {
    src: string; hasBg?: boolean; isLight?: boolean; panelColor: string; h?: number; maxW?: number; brandColors?: string[];
}) {
    const [err, setErr] = useState(false);
    if (err || !src) return null;
    const panelDark = isDark(panelColor);

    // We wrap the logo in a flex container of height 'h' to ensure 
    // vertical centering is consistent regardless of the logo file's 
    // internal aspect ratio or whitespace.
    return (
        <div style={{
            height: h,
            width: "fit-content", // Ensure it doesn't collapse to 0 in flex environments
            display: "flex",
            alignItems: "center",
            justifyContent: "center", 
            position: "relative"
        }}>
            <img src={src} alt="University logo"
                crossOrigin="anonymous"
                style={{
                    height: "100%", width: "auto", maxWidth: maxW,
                    objectFit: "contain", display: "block",
                    mixBlendMode: (hasBg && !panelDark) ? "multiply" : "normal",
                    filter: !hasBg ? "drop-shadow(0px 2px 2px rgba(0,0,0,0.15))" : "none",
                }}
                onError={() => setErr(true)} />
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   GHOST CREST HELPER
   Gracefully handles JPG (solid bg) and PNG crests for watermarking
═══════════════════════════════════════════════════════════════ */
function GhostCrest({ iconLogo, primary, style, opacity = 0.1 }: { iconLogo: any, primary: string, style: any, opacity?: number }) {
    if (!iconLogo) return null;
    const isDarkBg = isDark(primary);

    let filter = isDarkBg ? "brightness(0) invert(1)" : "brightness(0)";
    let mixBlendMode: any = "normal";

    if (iconLogo.hasBg) {
        if (isDarkBg) {
            filter = "grayscale(1) invert(1)";
            mixBlendMode = "screen";
        } else {
            filter = "grayscale(1)";
            mixBlendMode = "multiply";
        }
    }

    return (
        <img src={iconLogo.url} alt="" crossOrigin="anonymous"
            style={{ ...style, filter, mixBlendMode, pointerEvents: "none", opacity }}
            onError={() => { }} />
    );
}

/* ═══════════════════════════════════════════════════════════════
   FONT HELPER
═══════════════════════════════════════════════════════════════ */
function getFont(fontName?: string) {
    return fontName ? `"${fontName}", sans-serif` : "system-ui, sans-serif";
}

/* Shared props for all layout components */
type LayoutProps = {
    brand: BrandData;
    text: string;
    badge?: string;
    estDate?: string;
    statusTag?: string;
    img?: string;
    logoSrc: string;
    logoHasBg: boolean;
    logoIsLight?: boolean;
    primary: string;
    secondary: string;
    headlineColor: string;
    logoPos?: 'top' | 'bottom';
    bgStyle?: 'none' | 'brand';
    tintIndex?: number;
    bgOpacity?: number; // 0 to 100
};


/* ═══════════════════════════════════════════════════════════════
   CUSTOM VARIABLE HELPERS
═══════════════════════════════════════════════════════════════ */
function BadgeTag({ text, color }: { text?: string, color: string }) {
    if (!text) return null;
    return <div style={{ color, border: `1px solid ${color}40`, background: `${color}10`, padding: "6px 14px", borderRadius: 100, fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 16, position: "relative", zIndex: 1 }}>{text}</div>;
}
function EstDateTag({ text, color }: { text?: string, color: string }) {
    if (!text) return null;
    return <div style={{ color, opacity: 0.5, fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", marginTop: 12, position: "relative", zIndex: 1 }}>{text}</div>;
}
function StatusTagBadge({ text, bg, color }: { text?: string, bg: string, color: string }) {
    if (!text) return null;
    return <div style={{ background: bg, color, padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 800, display: "inline-block", position: "relative", zIndex: 1 }}>{text}</div>;
}

/* ═══════════════════════════════════════════════════════════════
   LAYOUT 0 — "SPLIT"
   Classic 40/60 vertical split: solid brand panel LEFT (clear
   of avatar zone by design), full campus photo RIGHT.
   Logo sits large, centered in the left panel.
   Inspired by: Princeton / Dartmouth
═══════════════════════════════════════════════════════════════ */
function L0({ brand, text, logoSrc, logoHasBg, logoIsLight, primary, img, headlineColor }: LayoutProps) {
    const font = getFont(brand.fonts?.[0]);
    const SPLIT_X = 620;

    return (
        <div className="absolute inset-0 overflow-hidden flex" style={{ background: primary }}>
            {/* Left: Campus Photo */}
            <div className="relative h-full overflow-hidden" style={{ width: SPLIT_X }}>
                {img ? (
                    <img src={img} alt="" className="w-full h-full object-cover" crossOrigin="anonymous" />
                ) : (
                    <div className="w-full h-full" style={{ background: primary, opacity: 0.1 }} />
                )}
            </div>

            {/* Sharp vertical border */}
            <div className="w-[1px] h-full bg-white/10 z-20" />

            {/* Right: Solid Brand Panel */}
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center gap-8">
                <SmartLogo src={logoSrc} hasBg={logoHasBg} isLight={logoIsLight} panelColor={primary} h={150} maxW={480} brandColors={brand.colors} />
                
                {text && (
                    <p style={{
                        color: headlineColor, fontSize: 26, fontWeight: 900, lineHeight: 1.15,
                        maxWidth: 480, margin: 0, letterSpacing: "-0.02em", fontFamily: font
                    }}>
                        {text}
                    </p>
                )}
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   LAYOUT 1 — "IMMERSIVE"
   Full-bleed campus photo fills everything.
   A strong gradient overlay on the RIGHT half hosts a huge logo.
   Text sits bottom-left (well inside safe zone, clear of avatar).
   Inspired by: UC Berkeley / Oxford
═══════════════════════════════════════════════════════════════ */
function L1({ brand, text, img, logoSrc, logoHasBg, logoIsLight, primary, headlineColor, bgOpacity = 100, tintIndex = 0 }: LayoutProps) {
    const tintColor = brand.colors[tintIndex % brand.colors.length] ?? primary;
    const font = getFont(brand.fonts?.[0]);

    return (
        <div className="absolute inset-0 overflow-hidden bg-black">
            {img ? (
                <img src={img} alt="" crossOrigin="anonymous" className="absolute inset-0 w-full h-full object-cover" />
            ) : (
                <div className="absolute inset-0" style={{ background: primary }} />
            )}

            {/* Very clean solid right-side panel (No gradient) */}
            <div className="absolute inset-y-0 right-0 w-[550px] z-1" style={{
                background: tintColor,
                opacity: 0.9,
            }} />

            <div className="absolute inset-y-0 right-0 w-[550px] flex flex-col items-center justify-center p-12 z-10">
                <div className="flex flex-col items-center gap-8">
                    <SmartLogo src={logoSrc} hasBg={logoHasBg} isLight={logoIsLight} panelColor={tintColor} h={140} maxW={400} brandColors={brand.colors} />
                    {text && (
                        <p style={{
                            color: headlineColor, fontSize: 26, fontWeight: 900,
                            lineHeight: 1.15, letterSpacing: "-0.02em",
                            textAlign: "center", maxWidth: 400, margin: 0, fontFamily: font
                        }}>
                            {text}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   LAYOUT 2 — "BOLD STRIPE"
   Full photo background. A bold diagonal-edged brand panel
   occupies the RIGHT ~35%, housing an enormous logo.
   Text anchored to the bottom of the panel.
   Inspired by: Edinburgh / Loughborough
═══════════════════════════════════════════════════════════════ */
function L2({ brand, text, img, logoSrc, logoHasBg, logoIsLight, primary, headlineColor }: LayoutProps) {
    const font = getFont(brand.fonts?.[0]);
    const PANEL_W = 580;

    return (
        <div className="absolute inset-0 overflow-hidden bg-black">
            {img && (
                <img src={img} alt="" crossOrigin="anonymous" className="absolute inset-0 w-full h-full object-cover" />
            )}

            <div className="absolute inset-y-0 right-0 flex flex-col items-center justify-center gap-8"
                style={{
                    width: PANEL_W, background: primary, zIndex: 10, padding: "48px",
                    clipPath: 'polygon(60px 0, 100% 0, 100% 100%, 0 100%)'
                }}>
                <SmartLogo src={logoSrc} hasBg={logoHasBg} isLight={logoIsLight} panelColor={primary} h={150} maxW={420} brandColors={brand.colors} />
                
                {text && (
                    <p style={{
                        color: headlineColor, fontSize: 26, fontWeight: 900, lineHeight: 1.15,
                        textAlign: "center", maxWidth: 440, margin: 0, letterSpacing: "-0.02em", fontFamily: font
                    }}>
                        {text}
                    </p>
                )}
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   LAYOUT 3 — "CENTRED BRAND"
   No photo — pure brand expression.
   Left: a large, centred text logo on the brand primary colour.
   Right: lighter secondary colour panel with headline text.
   Clean, formal, great for institutions without many photos.
   Inspired by: LSE / Imperial
═══════════════════════════════════════════════════════════════ */
function L3({ brand, text, logoSrc, logoHasBg, logoIsLight, primary, headlineColor }: LayoutProps) {
    const font = getFont(brand.fonts?.[0]);

    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center" style={{ background: primary }}>
            <div className="flex flex-col items-center gap-8" style={{ width: 660 }}>
                <SmartLogo src={logoSrc} hasBg={logoHasBg} isLight={logoIsLight} panelColor={primary} h={160} maxW={600} brandColors={brand.colors} />
                {text && (
                    <p style={{
                        color: headlineColor, fontSize: 28, fontWeight: 900, lineHeight: 1.15,
                        width: "100%", margin: 0, letterSpacing: "-0.02em", fontFamily: font
                    }}>
                        {text}
                    </p>
                )}
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   LAYOUT 4 — "GLASS PANELS"
   Two frosted glass panes floating over a vibrant, completely
   full-bleed campus image. Premium, polished software feel.
═══════════════════════════════════════════════════════════════ */
function L4({ brand, text, logoSrc, logoHasBg, logoIsLight, logoPos = 'bottom', img, bgStyle = 'none', tintIndex = 0 }: LayoutProps) {
    const font = getFont(brand.fonts?.[0]);
    const tintColor = brand.colors[tintIndex % brand.colors.length] ?? brand.colors[0];
    
    return (
        <div className="absolute inset-0 overflow-hidden bg-black">
            {/* Background image with configurable style */}
            {/* Background image - Crisp and clear */}
            {img && (
                <div className="absolute inset-0">
                    <img src={img} alt="" crossOrigin="anonymous" 
                        className="absolute inset-0 w-full h-full object-cover" />
                </div>
            )}
            
            {/* Removed vignette for cleaner look */}

            {/* University Identity - Locked to the corner for simple minimalist look */}
            <div className={`absolute z-20 flex items-center gap-6`}
                style={{ 
                    right: 40,
                    [logoPos === 'top' ? 'top' : 'bottom']: 30,
                }}>
                <div className="flex flex-row items-center">
                    <SmartLogo src={logoSrc} hasBg={logoHasBg} isLight={logoIsLight} panelColor="#000000" h={140} maxW={500} />
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   LAYOUT 5 — "ELEGANT STRIPE"
   Massive watermark in the middle, and a sharp solid panel splitting the 
   right side cleanly. Very modern.
═══════════════════════════════════════════════════════════════ */
function L5({ brand, text, img, logoSrc, logoHasBg, logoIsLight, primary, headlineColor, bgOpacity = 100, tintIndex = 0 }: LayoutProps) {
    const tintColor = brand.colors[tintIndex % brand.colors.length] ?? primary;
    const font = getFont(brand.fonts?.[0]);

    return (
        <div className="absolute inset-0 overflow-hidden flex bg-white">
            <div className="flex-1 relative overflow-hidden bg-black">
                {img && <img src={img} alt="" crossOrigin="anonymous" className="absolute inset-0 w-full h-full object-cover" />}
            </div>

            <div className="w-[500px] flex flex-col items-center justify-center p-12 text-center gap-10 z-10" style={{ background: primary }}>
                <SmartLogo src={logoSrc} hasBg={logoHasBg} isLight={logoIsLight} panelColor={primary} h={160} maxW={420} brandColors={brand.colors} />
                {text && (
                    <p style={{
                        color: headlineColor, fontSize: 24, fontWeight: 900, lineHeight: 1.15,
                        maxWidth: 400, margin: 0, fontFamily: font, letterSpacing: "-0.02em"
                    }}>{text}</p>
                )}
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   LAYOUT 6 — "DIAGONAL GRADIENT"
   Full diagonal split with bold gradient on right, photo on left.
   Inspired by: Modern tech branding
═══════════════════════════════════════════════════════════════ */
function L6({ brand, text, img, logoSrc, logoHasBg, logoIsLight, primary, headlineColor }: LayoutProps) {
    const font = getFont(brand.fonts?.[0]);

    return (
        <div className="absolute inset-0 overflow-hidden bg-white">
            {img && <img src={img} alt="" crossOrigin="anonymous" className="absolute inset-0 w-3/5 h-full object-cover" />}

            <div className="absolute top-0 bottom-0 right-0 flex flex-col items-center justify-center gap-8 p-16"
                style={{
                    width: "55%", background: primary, zIndex: 10,
                    clipPath: 'polygon(120px 0, 100% 0, 100% 100%, 0 100%)'
                }}>
                <SmartLogo src={logoSrc} hasBg={logoHasBg} isLight={logoIsLight} panelColor={primary} h={150} maxW={480} brandColors={brand.colors} />

                {text && (
                    <p style={{
                        color: headlineColor, fontSize: 26, fontWeight: 900,
                        lineHeight: 1.15, maxWidth: 440, margin: 0, fontFamily: font,
                        letterSpacing: "-0.02em", textAlign: "center"
                    }}>{text}</p>
                )}
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   LAYOUT 7 — "CENTERED LOGO"
   Full-bleed campus photo with a massive, centered logo.
   Simplicity and scale for maximum impact.
═══════════════════════════════════════════════════════════════ */
function L7({ brand, text, img, logoSrc, logoHasBg, logoIsLight, primary, headlineColor }: LayoutProps) {
    const font = getFont(brand.fonts?.[0]);
    
    return (
        <div className="absolute inset-0 overflow-hidden flex items-center justify-center bg-black">
            {img && (
                <div className="absolute inset-0">
                    <img src={img} alt="" crossOrigin="anonymous" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/10" />
                </div>
            )}
            
            <div className="relative z-10 flex flex-col items-center justify-center">
                <SmartLogo src={logoSrc} hasBg={logoHasBg} isLight={logoIsLight} panelColor="#000000" h={180} maxW={800} brandColors={brand.colors} />
            </div>
        </div>
    );
}


/* ═══════════════════════════════════════════════════════════════
   BANNER WRAPPER — routes to the right layout
═══════════════════════════════════════════════════════════════ */
function BannerCanvas({
    brand, text, badge, estDate, statusTag, layout, imgIndex, logoIndex,
    logoPos = 'bottom', bgStyle = 'none', tintIndex = 0, bgOpacity = 100
}: {
    brand: BrandData; text: string; badge?: string; estDate?: string; statusTag?: string; layout: Layout; imgIndex: number; logoIndex: number;
    logoPos?: 'top' | 'bottom';
    bgStyle?: 'none' | 'brand';
    tintIndex?: number;
    bgOpacity?: number;
}) {
    const img = brand.images.length > 0
        ? brand.images[imgIndex % brand.images.length]
        : undefined;

    // Resolve active logo from logoIndex
    const activeLogo = brand.logos.length > 0
        ? brand.logos[logoIndex % brand.logos.length]
        : null;
    const logoSrc = activeLogo?.url ?? brand.fullLogo;
    const logoHasBg = activeLogo?.hasBg ?? brand.logoHasBg;
    const logoIsLight = activeLogo?.isLight !== false;
    const activeLogoColor = activeLogo?.logoColor;

    let primary = activeLogo?.preferredBg ?? brand.colors[0] ?? "#003865";
    let secondary = brand.colors[1] ?? (isDark(primary) ? "#ffffff" : "#111111");

    // Ensure secondary isn't same as primary if we used preferredBg
    if (primary === secondary && brand.colors.length > 1) {
        secondary = brand.colors.find(c => c !== primary) || secondary;
    }

    // ── SMART CONTRAST & HUE-SYNC INJECTION ──────────────────────
    // NEW RULE: If a logo is blue, avoid blue backgrounds. More generally, 
    // force a switch if the logo color and background are too similar.
    const bgIsDark = isDark(primary);
    
    // Check for logo-background similarity
    const logoIsSimilar = activeLogoColor ? colorsAreSimilar(activeLogoColor, primary) : (!logoIsLight && isDark(primary)) || (logoIsLight && !isDark(primary));

    if ((!logoIsLight && bgIsDark) || logoIsSimilar) {
        // Dark logo (blue/black) on dark bg OR similar color -> Force LIGHT background
        // Prefer brand's own light color if available
        const brandLight = brand.colors.find(c => !isDark(c));
        primary = brandLight ?? "#ffffff";
        secondary = brand.colors.find(c => isDark(c) && c !== brand.colors[0]) ?? brand.colors[0];
    } else if (logoIsLight && !bgIsDark && !logoHasBg) {
        // Light logo on light background -> Force DARK background
        // If we have a preferredBg, we stay there as it's already dark
        if (!activeLogo?.preferredBg) {
            const brandDark = brand.colors.find(c => isDark(c));
            primary = brandDark ?? "#111111";
            secondary = brand.colors.find(c => !isDark(c) && c !== brand.colors[0]) ?? brand.colors[0];
        }
    }

    // ── HEADLINE COLOUR SYNC ──────────────────────────────
    // Priority: 1. Sampled logo color, 2. Primary brand color, 3. Black/White fallback
    let headlineColor = logoIsLight ? "#ffffff" : (activeLogoColor || brand.colors[0] || "#111111");

    // Safety: if matching the logo makes the text unreadable against 'primary', 
    // fall back to pure black/white contrast.
    if (isDark(headlineColor) === isDark(primary)) {
        headlineColor = contrastText(primary);
    }

    const p = { brand, text, badge, estDate, statusTag, img, logoSrc, logoHasBg, logoIsLight, primary, secondary, headlineColor, logoPos, bgStyle, tintIndex, bgOpacity };

    return (
        <>
            {layout === 0 && <L0 {...p} />}
            {layout === 1 && <L1 {...p} />}
            {layout === 2 && <L2 {...p} />}
            {layout === 3 && <L3 {...p} />}
            {layout === 4 && <L4 {...p} />}
            {layout === 5 && <L5 {...p} />}
            {layout === 6 && <L6 {...p} />}
            {layout === 7 && <L7 {...p} />}
        </>
    );
}

/* ═══════════════════════════════════════════════════════════════
   LAYOUT THUMBNAIL
═══════════════════════════════════════════════════════════════ */
const THUMB_CONFIGS: { label: string; preview: (color: string, accent: string) => React.ReactNode }[] = [
    {
        label: "Split",
        preview: (c, a) => (
            <div className="w-full h-full flex overflow-hidden">
                <div style={{ width: "40%", background: c, display: "flex", alignItems: "center", justifyContent: "center" }}>

                </div>
                <div style={{ flex: 1, background: `${c}22`, position: "relative" }}>
                    <div style={{ width: "100%", height: "100%", background: `linear-gradient(135deg, ${c}44 0%, ${c}11 100%)` }} />
                </div>
            </div>
        ),
    },
    {
        label: "Immersive",
        preview: (c, a) => (
            <div className="w-full h-full overflow-hidden" style={{ position: "relative", background: c }}>
                <div style={{ position: "absolute", inset: 0, zIndex: 1, background: `linear-gradient(to left, ${c}ee 30%, transparent 70%)` }} />

            </div>
        ),
    },
    {
        label: "Bold Stripe",
        preview: (c, a) => (
            <div className="w-full h-full overflow-hidden flex" style={{ background: `${c}33` }}>
                <div style={{ flex: 1 }} />
                <div style={{ width: "38%", background: c, clipPath: "polygon(12px 0, 100% 0, 100% 100%, 0 100%)", display: "flex", alignItems: "center", paddingLeft: 16 }}>

                </div>
            </div>
        ),
    },
    {
        label: "Centred Brand",
        preview: (c, a) => (
            <div className="w-full h-full flex overflow-hidden">
                <div style={{ width: "48%", background: c, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ width: "55%", height: "30%", background: `rgba(255,255,255,0.25)`, borderRadius: 2 }} />
                </div>

                <div style={{ flex: 1, background: a + "44", display: "flex", alignItems: "center", paddingLeft: 10 }}>

                </div>
            </div>
        ),
    },
    {
        label: "Minimalist Photo",
        preview: (c, a) => (
            <div className="w-full h-full relative overflow-hidden bg-white">
                <div style={{ position: "absolute", right: 6, bottom: 6, width: "30%", height: 3, background: c, borderRadius: 2 }} />
            </div>
        ),
    },
    {
        label: "Elegant Stripe",
        preview: (c, a) => (
            <div className="w-full h-full overflow-hidden flex" style={{ background: c }}>
                <div style={{ flex: 1 }} />
                <div style={{ width: "45%", position: "relative", background: "white", clipPath: "polygon(8px 0, 100% 0, 100% 100%, 0 100%)", display: "flex", alignItems: "center", paddingLeft: 16 }}>

                </div>
            </div>
        ),
    },
    {
        label: "Diagonal",
        preview: (c, a) => (
            <div className="w-full h-full overflow-hidden" style={{ position: "relative", background: `${c}33` }}>
                <div style={{ position: "absolute", inset: 0, background: `linear-gradient(125deg, transparent 35%, ${c}ee 50%, ${c} 60%)`, zIndex: 1 }} />

            </div>
        ),
    },
    {
        label: "Centered Logo",
        preview: (c, a) => (
            <div className="w-full h-full relative overflow-hidden bg-white flex items-center justify-center">
                <div style={{ width: "60%", height: "20%", background: c, borderRadius: 1 }} />
            </div>
        ),
    },
];

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════ */
const LAYOUTS = [0, 1, 2, 3, 4, 5, 6, 7];

function BuilderContent() {
    const params = useSearchParams();
    const router = useRouter();
    const bannerRef = useRef<HTMLDivElement>(null);
    const exportRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [brand, setBrand] = useState<BrandData | null>(null);
    const [text, setText] = useState("");
    const [badge, setBadge] = useState("");
    const [estDate, setEstDate] = useState("");
    const [statusTag, setStatusTag] = useState("");
    const [layout, setLayout] = useState<Layout>(0);
    const [imgIndex, setImgIndex] = useState(0);
    const [logoIndex, setLogoIndex] = useState(0);
    const [logoPos, setLogoPos] = useState<'top' | 'bottom'>('bottom');
    const [bgStyle, setBgStyle] = useState<'none' | 'brand'>('none');
    const [tintIndex, setTintIndex] = useState(0);
    const [bgOpacity, setBgOpacity] = useState(100);
    const [scale, setScale] = useState(1);
    const [loading, setLoading] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [showDownloadPopup, setShowDownloadPopup] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

    const [fontCss, setFontCss] = useState<string | null>(null);

    // Dynamic Google Font Injection (Safe inline method)
    useEffect(() => {
        const fontName = brand?.fonts?.[0];
        if (!fontName) return;
        
        let isMounted = true;
        const fontUrl = `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s+/g, "+")}:wght@400;700;800;900&display=swap`;
        
        fetch(fontUrl)
            .then(r => {
                if (!r.ok) throw new Error("Font fetch failed");
                return r.text();
            })
            .then(text => {
                if (!isMounted) return;
                // Only apply if it's a valid CSS file (avoiding 400 Bad Request HTML from Google)
                if (text.includes("@font-face")) {
                    setFontCss(text);
                } else {
                    setFontCss(null);
                }
            })
            .catch(e => {
                if (!isMounted) return;
                console.warn("Retrying font fetch via standard link (CORS or network issue)...", e);
                setFontCss(null);
            });
            
        return () => { isMounted = false; };
    }, [brand?.fonts]);

    // ── Scale banner to fit container ──────────────────────────
    useEffect(() => {
        const updateScale = () => {
            if (!containerRef.current) return;
            const available = containerRef.current.clientWidth;
            setScale(Math.min(1, available / W));
        };
        updateScale();
        window.addEventListener("resize", updateScale);
        return () => window.removeEventListener("resize", updateScale);
    }, []);

    // ── Fetch brand on domain param change ────────────────────
    useEffect(() => {
        const domain = params.get("domain");
        const campus = params.get("campus");
        if (!domain) return;
        
        let isMounted = true;
        setLoading(true);
        let path = `/api/brand?q=${encodeURIComponent(domain)}`;
        if (campus) path += `&campus=${encodeURIComponent(campus)}`;
        
        fetch(path)
            .then(r => {
                if (!r.ok) throw new Error(`Brand API error: ${r.status}`);
                return r.json();
            })
            .then((data: BrandData) => {
                if (!isMounted) return;
                setBrand(data);
                // Only reset indices if brand changes significantly or it's first load
                setImgIndex(0);
                setLogoIndex(0);
            })
            .catch(err => {
                if (!isMounted) return;
                console.error("Critical: Failed to fetch brand data:", err);
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        return () => { isMounted = false; };
    }, [params]);

    const changeCampus = (campus: string) => {
        const newParams = new URLSearchParams(params.toString());
        newParams.set("campus", campus);
        router.push(`/build?${newParams.toString()}`);
    };

    // ── Layout navigation ─────────────────────────────────────
    const prevLayout = () => setLayout(l => ((l - 1 + LAYOUTS.length) % LAYOUTS.length) as Layout);
    const nextLayout = () => setLayout(l => ((l + 1) % LAYOUTS.length) as Layout);

    // ── Photo navigation ──────────────────────────────────────
    const prevImg = () => setImgIndex(i => Math.max(0, i - 1));
    const nextImg = () => {
        if (!brand) return;
        setImgIndex(i => (i + 1) % brand.images.length);
    };

    // Find the university in the data to get available campuses
    const uniMetadata = ALL_UNIVERSITIES.find(u => u.domain === params.get("domain"));

    // ── Download ──────────────────────────────────────────────
    const handleDownload = async () => {
        if (!exportRef.current || !brand) return;
        setIsDownloading(true);
        try {
            await new Promise(r => setTimeout(r, 100)); // wait for layout paint
            
            // Standard pixel ratio creates an image exactly 1584x396. 
            // This prevents massive 4MB+ Base64 chunks that crash Vercel's Payload limits!
            const dataUrl = await toPng(exportRef.current, {
                pixelRatio: 1, 
                width: W,
                height: H,
                style: { transform: "none", visibility: "visible", display: "block" },
            });

            // Native Form Submit - Safe from Safari Javascript click-UUID bugs
            const form = document.createElement("form");
            form.method = "POST";
            form.action = "/api/download-banner";
            
            const input = document.createElement("input");
            input.type = "hidden";
            input.name = "dataUrl";
            input.value = dataUrl;
            
            form.appendChild(input);
            document.body.appendChild(form);
            form.submit();
            setTimeout(() => {
                if (document.body.contains(form)) {
                    document.body.removeChild(form);
                }
            }, 2000);

            setTimeout(() => setShowDownloadPopup(true), 400);
        } catch (e) {
            console.error("Export failed:", e);
            alert("Download failed — please try again.");
        } finally {
            setIsDownloading(false);
        }
    };

    const primary = brand?.colors?.[0] ?? "#1e2d78";
    const accent = brand?.colors?.[1] ?? "#88aaff";
    const textOnPrimary = contrastText(primary);

    return (
        <>
            <div className="min-h-screen bg-[#F5F4F1] font-sans flex justify-center w-full px-4 md:px-8 xl:px-12 py-4 md:py-6 box-border overflow-x-hidden">
                {/* Safe inline font CSS to prevent html-to-image CORS/SecurityError crashes */}
                {fontCss && <style dangerouslySetInnerHTML={{ __html: fontCss }} />}

                <main className="w-full xl:w-[60%] mx-auto flex flex-col shrink-0 relative bg-[#F5F4F1]">

                {/* ── NAV ─────────────────────────────────────────── */}
                <Header showStartButton={false} activeBrand={brand} />

                <div className="max-w-6xl mx-auto px-4 md:px-8 space-y-3 w-full mt-6 md:mt-8 xl:mt-10 mb-10 md:mb-12 xl:mb-16">

                    {/* ── BANNER PREVIEW ──────────────────────────── */}
                    <section className="sticky top-0 xl:top-4 z-40 pt-4 -mt-4 bg-[#F5F4F1]">


                        {/* Live Preview Indicator Container */}
                        <div className="flex items-center justify-end mb-2 mr-1">
                            <div className="flex items-center gap-2 opacity-60">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Live Preview</span>
                            </div>
                        </div>

                        <div className="rounded-2xl overflow-hidden shadow-xl ring-1 ring-black/10 bg-white">
                            {/* Banner canvas */}
                            <div ref={containerRef}
                                className="w-full relative"
                                style={{ height: brand ? H * scale : 160 }}>
                                {brand ? (
                                    <div style={{
                                        width: W, height: H,
                                        transform: `scale(${scale})`,
                                        transformOrigin: "top left",
                                        position: "relative",
                                    }}>
                                        <div ref={bannerRef} className="absolute inset-0">
                                            <BannerCanvas
                                                brand={brand}
                                                text={text}
                                                badge={badge}
                                                estDate={estDate}
                                                statusTag={statusTag}
                                                layout={layout}
                                                imgIndex={imgIndex}
                                                logoIndex={logoIndex}
                                                logoPos={logoPos}
                                                bgStyle={bgStyle}
                                                tintIndex={tintIndex}
                                                bgOpacity={bgOpacity}
                                            />
                                        </div>

                                        {/* ── MASTER BANNER (FOR EXPORT) ── */}
                                        {/* Hidden from view, keys ensure it updates instantly with NO transition states */}
                                        <div style={{ position: 'absolute', top: -9999, left: -9999, pointerEvents: 'none' }}>
                                            <div 
                                                ref={exportRef} 
                                                key={`export-${layout}-${imgIndex}-${logoIndex}`}
                                                style={{ width: W, height: H, position: 'relative' }}
                                            >
                                                <BannerCanvas
                                                    brand={brand}
                                                    text={text}
                                                    badge={badge}
                                                    estDate={estDate}
                                                    statusTag={statusTag}
                                                    layout={layout}
                                                    imgIndex={imgIndex}
                                                    logoIndex={logoIndex}
                                                    logoPos={logoPos}
                                                    bgStyle={bgStyle}
                                                    tintIndex={tintIndex}
                                                    bgOpacity={bgOpacity}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                        <p className="text-gray-400 text-base italic">
                                            {loading ? "Loading brand assets…" : "Search for your university to begin"}
                                        </p>
                                    </div>
                                )}
                            </div>

                        </div>
                    </section>

                    {/* ── CONTROLS ────────────────────────────────── */}
                    <div className="w-full bg-white rounded-2xl p-6 md:p-8 shadow-sm ring-1 ring-black/5 flex flex-col gap-8">
    {/* ── UNIFIED CONTROLS ── */}
    <div className="space-y-6">
        {/* Headline input */}
        <AnimatePresence>
            {brand && (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                        <span className="w-5 h-5 rounded-full text-white text-[9px] flex items-center justify-center font-black"
                            style={{ background: primary }}>01</span>
                        Personal Branding
                    </label>
                                        {/* ── THE HEADLINE ARCHITECT ──────────────── */}
                                        <div className="space-y-6">
                                            
                                            {/* Live Draft Card */}
                                            <div className="bg-white rounded-xl px-4 py-2 border border-gray-100 relative overflow-hidden shadow-sm">
                                                <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: primary }} />
                                                <div className="flex items-center justify-between mb-0.5 pl-1.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[9px] font-black uppercase tracking-[0.1em] text-gray-400">Headline Draft</span>
                                                        <span className={`text-[9px] font-mono ${text.length === 100 ? 'text-red-500' : 'text-gray-300'}`}>({text.length}/100)</span>
                                                    </div>
                                                    <button 
                                                        onClick={() => setText("")}
                                                        className="text-[9px] font-black text-gray-300 hover:text-red-400 transition-colors uppercase tracking-widest py-1"
                                                    >
                                                        Clear
                                                    </button>
                                                </div>
                                                <textarea
                                                    value={text}
                                                    onChange={e => setText(e.target.value)}
                                                    maxLength={100}
                                                    rows={1}
                                                    placeholder="Type your headline here..."
                                                    className="w-full bg-transparent text-[#111827] text-sm font-semibold focus:outline-none resize-none placeholder:text-gray-300 min-h-[22px] py-1 pl-1.5 leading-tight"
                                                />
                                            </div>

                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
    </div>
    <hr className="border-gray-100" />
    <div className="flex flex-col gap-6">
        {brand && (
                                <>
                                    {/* Layout picker */}
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Layout Style</p>
                                            <span className="text-xs text-gray-400">{THUMB_CONFIGS[layout].label}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={prevLayout}
                                                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:border-gray-400 transition-colors text-gray-400">
                                                <ChevronLeft className="w-4 h-4" />
                                            </button>
                                            <div className="flex gap-1 flex-1">
                                                {([0, 1, 2, 3, 4, 5, 6, 7] as Layout[]).map(l => (
                                                    <button key={l}
                                                        onClick={() => setLayout(l)}
                                                        className="flex-1 aspect-[4/1] rounded-lg overflow-hidden transition-all"
                                                        style={{
                                                            outline: layout === l ? `2px solid ${primary}` : "2px solid transparent",
                                                            outlineOffset: 2,
                                                        }}>
                                                        {THUMB_CONFIGS[l].preview(primary, accent)}
                                                    </button>
                                                ))}
                                            </div>
                                            <button onClick={nextLayout}
                                                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:border-gray-400 transition-colors text-gray-400">
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1.5">Style {layout + 1} of {LAYOUTS.length} · {THUMB_CONFIGS[layout].label}</p>
                                    </div>

                                    {layout === 4 && (
                                        <div className="space-y-4">
                                            {/* Logo Position Toggle */}
                                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 animate-in fade-in slide-in-from-top-2">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Logo Alignment</p>
                                                <div className="flex gap-2">
                                                    {(['top', 'bottom'] as const).map(pos => (
                                                        <button key={pos}
                                                            onClick={() => setLogoPos(pos)}
                                                            className="flex-1 py-2 rounded-lg border-2 text-xs font-bold capitalize transition-all"
                                                            style={{
                                                                borderColor: logoPos === pos ? primary : "#e5e7eb",
                                                                background: logoPos === pos ? `${primary}10` : "white",
                                                                color: logoPos === pos ? primary : "#6b7280"
                                                            }}>
                                                            {pos} Corner
                                                        </button>
                                                    ))}
    </div>
</div>
                                        </div>
                                    )}

                                    {/* Photo picker */}
                                    {brand.images.length > 0 && (
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Photo</p>
                                            <div className="flex items-center gap-2">
                                                <button onClick={prevImg}
                                                    className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:border-gray-400 transition-colors text-gray-400">
                                                    <ChevronLeft className="w-4 h-4" />
                                                </button>
                                                <div className="flex-1 h-14 rounded-xl overflow-hidden border border-gray-200 relative">
                                                    <img
                                                        src={brand.images[imgIndex % brand.images.length]}
                                                        alt=""
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <button onClick={nextImg}
                                                    className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:border-gray-400 transition-colors text-gray-400">
                                                    <ChevronRight className="w-4 h-4" />
                                                </button>
                                            </div>
                                            {brand.images.length > 1 && (
                                                <p className="text-xs text-gray-400 mt-1.5">
                                                    Photo {(imgIndex % brand.images.length) + 1} of {brand.images.length}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* Logo variant picker */}
                                    {brand.logos.length > 1 && (
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Logo Variant</p>
                                            <div className="flex gap-2 flex-wrap">
                                                {brand.logos.map((logo, i) => (
                                                    <button key={i}
                                                        onClick={() => setLogoIndex(i)}
                                                        className="w-16 h-16 rounded-xl border-2 flex items-center justify-center p-1.5 transition-all hover:shadow-md"
                                                        style={{
                                                            borderColor: logoIndex === i ? primary : "#e5e7eb",
                                                            background: logoIndex === i 
                                                                ? `${primary}10` 
                                                                : (logo.isLight ? "#333" : "#f9fafb"),
                                                        }}>
                                                        <img src={logo.url} alt={`Logo ${i + 1}`}
                                                            className="w-full h-full object-contain"
                                                            style={{
                                                                mixBlendMode: logo.hasBg ? "multiply" : undefined,
                                                            }}
                                                            onError={e => (e.currentTarget.style.display = "none")} />
                                                    </button>
                                                ))}
                                            </div>
                                            <p className="text-xs text-gray-400 mt-1.5">
                                                Logo {logoIndex + 1} of {brand.logos.length} · {brand.logos.length * LAYOUTS.length} total combinations
                                            </p>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Download button - Single True Button */}
                            <div className="mt-auto space-y-2">
                                <button
                                    onClick={brand ? handleDownload : () => router.push("/")}
                                    disabled={isDownloading}
                                    className="w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50 hover:opacity-90 active:scale-[0.98]"
                                    style={{ background: primary, color: textOnPrimary }}>
                                    {isDownloading
                                        ? <><RefreshCw className="w-4 h-4 animate-spin" /> Processing...</>
                                        : <><Download className="w-4 h-4" /> Download Banner</>}
                                </button>
                                <p className="text-center text-[11px] text-gray-400">
                                    LinkedIn optimised · Free · Sharp 1584x396 PNG
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <Footer />
                </main>
            </div>

            {/* DOWNLOAD INSTRUCTION POPUP */}
            <AnimatePresence>
                {showDownloadPopup && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 10 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 10 }}
                            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-gray-100 flex items-start justify-between">
                                <div>
                                    <h3 className="text-2xl font-black text-[#111827] flex items-center gap-2 mb-2">
                                        <CheckCircle className="w-6 h-6 text-green-500" />
                                        Success!
                                    </h3>
                                    <p className="text-sm text-gray-500 font-medium">
                                        Your banner has been saved to your <span className="text-[#111827] font-bold">Downloads</span> or <span className="text-[#111827] font-bold">Photos</span> app.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowDownloadPopup(false)}
                                    className="p-2 text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-6 bg-gray-50 overflow-y-auto space-y-6 flex-1">
                                <h4 className="text-xs font-black uppercase tracking-widest text-gray-400">How to update your LinkedIn</h4>

                                <div className="space-y-6">
                                    <div className="flex gap-4">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black flex-shrink-0 text-sm">1</div>
                                        <div>
                                            <p className="font-bold text-[#111827]">Go to your LinkedIn profile</p>
                                            <p className="text-sm text-gray-500 mt-0.5">Open the LinkedIn app or website and view your own profile.</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black flex-shrink-0 text-sm">2</div>
                                        <div className="flex-1">
                                            <p className="font-bold text-[#111827]">Click the pencil icon</p>
                                            <p className="text-sm text-gray-500 mt-0.5 mb-3">In the top right corner of your current banner area, click the edit icon.</p>

                                            {/* Visual mockup of LinkedIn banner area */}
                                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm relative overflow-hidden h-28 select-none">
                                                <div className="absolute inset-0 bg-blue-50"></div>
                                                <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center animate-pulse">
                                                    <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                </div>
                                                <div className="absolute -bottom-6 left-6 w-16 h-16 rounded-full border-4 border-white bg-gray-200 shadow-sm"></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black flex-shrink-0 text-sm">3</div>
                                        <div>
                                            <p className="font-bold text-[#111827]">Upload and apply</p>
                                            <p className="text-sm text-gray-500 mt-0.5">Select your downloaded image, position it, and click 'Apply'.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-4 border-t border-gray-100 bg-white">
                                <button
                                    onClick={() => setShowDownloadPopup(false)}
                                    className="w-full py-3.5 rounded-xl font-black text-sm uppercase tracking-widest bg-gray-900 text-white hover:bg-gray-800 transition-colors shadow-lg active:scale-95 transition-transform"
                                >
                                    Got it, thanks!
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

export default function BuildPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5] text-gray-400">
                Loading…
            </div>
        }>
            <BuilderContent />
        </Suspense>
    );
}
