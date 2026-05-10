"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { Download, RefreshCw, X, CheckCircle, Upload, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useSearchParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
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

type Layout = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

/* ═══════════════════════════════════════════════════════════════
   LINKEDIN CANVAS CONSTANTS
   Absolute: 1584 × 396 px  (4:1 ratio)
   Danger Zone (avatar): x 0–568, y 132–396  →  keep EMPTY
   Safe Zone: centred 1128 × 300 px  (x 228–1356, y 48–348)
   Mobile margins: outer 64 px each side are cropped on mobile
═══════════════════════════════════════════════════════════════ */
const W = 1584;
const H = 396;

const DZ_X = 0;
const DZ_Y = 132;
const DZ_W = 568;
const DZ_H = 264;

const SZ_X = 228;
const SZ_Y = 48;
const SZ_W = 1128;
const SZ_H = 300;

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

function contrastText(bg: string) { return isDark(bg) ? "#ffffff" : "#111111"; }

function blendHex(a: string, b: string, t: number): string {
    const [ar, ag, ab] = hexToRgb(a);
    const [br, bg2, bb] = hexToRgb(b);
    const r = Math.round(ar + (br - ar) * t);
    const g = Math.round(ag + (bg2 - ag) * t);
    const bl = Math.round(ab + (bb - ab) * t);
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${bl.toString(16).padStart(2, "0")}`;
}

function pickContrastPill(
    logoIsLight: boolean,
    panelColor: string,
    brandColors: string[],
): string | null {
    const panelLight = !isDark(panelColor);
    const logoBlends = (logoIsLight && panelLight) || (!logoIsLight && isDark(panelColor));
    if (!logoBlends) return null;

    let bestColor: string | null = null;
    let bestDist = 0;
    const pLuma = luma(panelColor);
    for (const c of brandColors) {
        const dist = Math.abs(luma(c) - pLuma);
        if (dist > bestDist) { bestDist = dist; bestColor = c; }
    }
    if (Math.abs(255 - pLuma) > bestDist) { bestColor = "#ffffff"; bestDist = Math.abs(255 - pLuma); }
    if (pLuma > bestDist) { bestColor = "#111111"; }

    return bestColor;
}

function colorsAreSimilar(hex1: string, hex2: string, threshold = 40): boolean {
    const [r1, g1, b1] = hexToRgb(hex1);
    const [r2, g2, b2] = hexToRgb(hex2);
    const dist = Math.sqrt(Math.pow(r2 - r1, 2) + Math.pow(g2 - g1, 2) + Math.pow(b2 - b1, 2));
    return dist < threshold;
}

function pickBestPanelColor(
    logoColor: string | null,
    logoIsLight: boolean,
    brandColors: string[],
    fallbackPrimary: string,
): string {
    let bestColor = fallbackPrimary;
    let bestScore = -Infinity;

    for (const c of brandColors) {
        const lumaDiff = Math.abs(luma(c) - ((logoColor ?? null) ? luma(logoColor!) : (logoIsLight ? 200 : 50)));
        const colorDist = (logoColor ?? null)
            ? (() => { const [r1,g1,b1] = hexToRgb(logoColor!); const [r2,g2,b2] = hexToRgb(c); return Math.sqrt((r2-r1)**2+(g2-g1)**2+(b2-b1)**2); })()
            : lumaDiff;
        const score = lumaDiff + colorDist * 0.5;
        if (score > bestScore) { bestScore = score; bestColor = c; }
    }

    if ((logoColor ?? null) && colorsAreSimilar(logoColor!, bestColor, 60)) {
        bestColor = logoIsLight ? '#111111' : '#ffffff';
    }
    return bestColor;
}

/* ═══════════════════════════════════════════════════════════════
   PREMIUM POLISH ELEMENTS
═══════════════════════════════════════════════════════════════ */
function GrainOverlay() {
    return (
        <div className="absolute inset-0 z-[100] pointer-events-none opacity-[0.03] mix-blend-overlay"
            style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                backgroundSize: '150px 150px',
            }}
        />
    );
}

function FrameOverlay() {
    return (
        <div className="absolute inset-[3px] z-[101] pointer-events-none border border-white/10 rounded-sm mix-blend-overlay" />
    );
}

function SmartLogo({
    src, hasBg, isLight = true, panelColor, h = 100, maxW = 280, brandColors = [], scale = 1, align = "center",
}: {
    src: string; hasBg?: boolean; isLight?: boolean; panelColor: string; h?: number | "auto"; maxW?: number; brandColors?: string[]; scale?: number; align?: "center" | "flex-start" | "flex-end";
}) {
    const [err, setErr] = useState(false);
    if (err || !src) return null;
    const panelDark = isDark(panelColor);

    return (
        <div style={{
            height: h === "auto" ? "auto" : (h as number) * scale,
            width: "fit-content",
            display: "flex",
            alignItems: align,
            justifyContent: "center",
            position: "relative"
        }}>
            <img src={src} alt="University logo"
                crossOrigin="anonymous"
                style={{
                    height: "100%", width: "auto", maxWidth: maxW * scale,
                    objectFit: "contain",
                    objectPosition: align === "center" ? "center" : `center ${align === "flex-start" ? "top" : "bottom"}`,
                    display: "block",
                    mixBlendMode: "normal",
                    filter: !hasBg ? "drop-shadow(0px 2px 2px rgba(0,0,0,0.15))" : "none",
                }}
                onError={() => setErr(true)} />
        </div>
    );
}

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

function getHeadlineFont(textStyle: "blocky" | "elegant" | "mono", domain?: string) {
    if (domain === "uib.no") {
        return "var(--font-crimson-text), 'Crimson Text', serif";
    }
    if (textStyle === "elegant") return "'Playfair Display', serif";
    if (textStyle === "mono") return "'JetBrains Mono', monospace";
    return "'Inter', sans-serif";
}

type LayoutProps = {
    brand: BrandData;
    text: string;
    img?: string;
    logoSrc: string;
    logoHasBg: boolean;
    logoIsLight?: boolean;
    primary: string;
    secondary: string;
    headlineColor: string;
    logoPos?: 'top' | 'bottom' | 'center';
    bgStyle?: 'none' | 'brand';
    tintIndex?: number;
    bgOpacity?: number;
    photoFilter?: string;
    logoScale?: number;
    textSize?: number;
    textStyle?: "blocky" | "elegant" | "mono";
};

/* ═══════════════════════════════════════════════════════════════
   LAYOUT 0 — "SPLIT"
═══════════════════════════════════════════════════════════════ */
function L0({ textSize = 1.0, textStyle = "blocky", logoScale = 1.0, brand, text, logoSrc, logoHasBg, logoIsLight, primary, img, headlineColor, photoFilter = "none" }: LayoutProps) {
    const font = getHeadlineFont(textStyle, brand.domain);
    const SPLIT_X = 620;

    return (
        <div className="absolute inset-0 overflow-hidden flex" style={{ background: primary }}>
            <div className="relative h-full overflow-hidden" style={{ width: SPLIT_X }}>
                {img ? (
                    <img src={img} alt="" className="w-full h-full object-cover" crossOrigin="anonymous" style={{ filter: photoFilter }} />
                ) : (
                    <div className="w-full h-full" style={{ background: primary, opacity: 0.1 }} />
                )}
            </div>
            <div className="w-[1px] h-full bg-white/10 z-20" />
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center gap-8 overflow-hidden">
                <SmartLogo src={logoSrc} hasBg={logoHasBg} isLight={logoIsLight} panelColor={primary} h={140} maxW={380} brandColors={brand.colors} scale={logoScale} />
                {text && (
                    <p style={{ color: headlineColor, fontSize: 26 * textSize, fontWeight: 900, lineHeight: 1.15, maxWidth: 480, margin: 0, letterSpacing: "-0.02em", fontFamily: font }}>
                        {text}
                    </p>
                )}
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   LAYOUT 1 — "IMMERSIVE"
═══════════════════════════════════════════════════════════════ */
function L1({ textSize = 1.0, textStyle = "blocky", logoScale = 1.0, brand, text, img, logoSrc, logoHasBg, logoIsLight, primary, headlineColor, bgOpacity = 100, tintIndex = 0, photoFilter = "none" }: LayoutProps) {
    const font = getHeadlineFont(textStyle, brand.domain);

    return (
        <div className="absolute inset-0 overflow-hidden bg-black">
            {img ? (
                <img src={img} alt="" crossOrigin="anonymous" className="absolute inset-0 w-full h-full object-cover" style={{ filter: photoFilter }} />
            ) : (
                <div className="absolute inset-0" style={{ background: primary }} />
            )}
            <div className="absolute inset-y-0 right-0 w-[550px] z-1" style={{ background: primary, opacity: 0.9 }} />
            <div className="absolute inset-y-0 right-0 w-[550px] flex flex-col items-center justify-center p-12 z-10 overflow-hidden">
                <div className="flex flex-col items-center gap-8">
                    <SmartLogo src={logoSrc} hasBg={logoHasBg} isLight={logoIsLight} panelColor={primary} h={140} maxW={380} brandColors={brand.colors} scale={logoScale} />
                    {text && (
                        <p style={{ color: headlineColor, fontSize: 26 * textSize, fontWeight: 900, lineHeight: 1.15, letterSpacing: "-0.02em", textAlign: "center", maxWidth: 400, margin: 0, fontFamily: font }}>
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
═══════════════════════════════════════════════════════════════ */
function L2({ textSize = 1.0, textStyle = "blocky", logoScale = 1.0, brand, text, img, logoSrc, logoHasBg, logoIsLight, primary, headlineColor, photoFilter = "none" }: LayoutProps) {
    const font = getHeadlineFont(textStyle, brand.domain);
    const PANEL_W = 580;

    return (
        <div className="absolute inset-0 overflow-hidden bg-black">
            {img && (
                <img src={img} alt="" crossOrigin="anonymous" className="absolute inset-0 w-full h-full object-cover" style={{ filter: photoFilter }} />
            )}
            <div className="absolute inset-y-0 right-0 flex flex-col items-center justify-center gap-8 overflow-hidden"
                style={{ width: PANEL_W, background: primary, zIndex: 10, padding: "48px", clipPath: 'polygon(60px 0, 100% 0, 100% 100%, 0 100%)' }}>
                <SmartLogo src={logoSrc} hasBg={logoHasBg} isLight={logoIsLight} panelColor={primary} h={140} maxW={380} brandColors={brand.colors} scale={logoScale} />
                {text && (
                    <p style={{ color: headlineColor, fontSize: 26 * textSize, fontWeight: 900, lineHeight: 1.15, textAlign: "center", maxWidth: 440, margin: 0, letterSpacing: "-0.02em", fontFamily: font }}>
                        {text}
                    </p>
                )}
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   LAYOUT 3 — "CENTRED BRAND"
═══════════════════════════════════════════════════════════════ */
function L3({ textSize = 1.0, textStyle = "blocky", logoScale = 1.0, brand, text, logoSrc, logoHasBg, logoIsLight, primary, headlineColor }: LayoutProps) {
    const font = getHeadlineFont(textStyle, brand.domain);

    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center overflow-hidden" style={{ background: primary }}>
            <div className="flex flex-col items-center gap-8" style={{ width: 660 }}>
                <SmartLogo src={logoSrc} hasBg={logoHasBg} isLight={logoIsLight} panelColor={primary} h={140} maxW={380} brandColors={brand.colors} scale={logoScale} />
                {text && (
                    <p style={{ color: headlineColor, fontSize: 28 * textSize, fontWeight: 900, lineHeight: 1.15, width: "100%", margin: 0, letterSpacing: "-0.02em", fontFamily: font }}>
                        {text}
                    </p>
                )}
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   LAYOUT 4 — "GLASS PANELS"
═══════════════════════════════════════════════════════════════ */
function L4({ textSize = 1.0, textStyle = "blocky", logoScale = 1.0, brand, text, logoSrc, logoHasBg, logoIsLight, logoPos = 'bottom', img, bgStyle = 'none', tintIndex = 0, photoFilter = "none" }: LayoutProps) {
    const font = getHeadlineFont(textStyle, brand.domain);

    return (
        <div className="absolute inset-0 overflow-hidden bg-black">
            {img && (
                <div className="absolute inset-0">
                    <img src={img} alt="" crossOrigin="anonymous"
                        className="absolute inset-0 w-full h-full object-cover" style={{ filter: photoFilter }} />
                    <div className="absolute inset-0 bg-black/20" />
                </div>
            )}
            <div className={`absolute z-20 flex flex-row-reverse gap-8 ${logoPos === "top" ? "items-start" : (logoPos === "center" ? "items-center" : "items-end")}`}
                style={{
                    right: 40,
                    top: logoPos === 'center' ? '50%' : (logoPos === 'top' ? 40 : 'auto'),
                    bottom: logoPos === 'bottom' ? 40 : 'auto',
                    transform: logoPos === 'center' ? 'translateY(-50%)' : 'none'
                }}>
                {logoSrc && (
                    <SmartLogo src={logoSrc} hasBg={logoHasBg} isLight={logoIsLight} panelColor="#000000" h={150} maxW={400} brandColors={brand.colors} scale={logoScale} align={logoPos === "top" ? "flex-start" : (logoPos === "center" ? "center" : "flex-end")} />
                )}
                {text && (
                    <div>
                        <p style={{ color: 'white', fontSize: 32 * textSize, fontWeight: 900, lineHeight: 1.1, letterSpacing: "-0.03em", margin: 0, fontFamily: font, textShadow: '0 2px 10px rgba(0,0,0,0.5)', maxWidth: 800, textAlign: "right" }}>
                            {text}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   LAYOUT 5 — "ELEGANT STRIPE"
═══════════════════════════════════════════════════════════════ */
function L5({ textSize = 1.0, textStyle = "blocky", logoScale = 1.0, brand, text, img, logoSrc, logoHasBg, logoIsLight, primary, headlineColor, bgOpacity = 100, tintIndex = 0, photoFilter = "none" }: LayoutProps) {
    const font = getHeadlineFont(textStyle, brand.domain);

    return (
        <div className="absolute inset-0 overflow-hidden flex bg-white">
            <div className="flex-1 relative overflow-hidden bg-black">
                {img && <img src={img} alt="" crossOrigin="anonymous" className="absolute inset-0 w-full h-full object-cover" style={{ filter: photoFilter }} />}
            </div>
            <div className="w-[500px] flex flex-col items-center justify-center p-12 text-center gap-10 z-10 overflow-hidden" style={{ background: primary }}>
                <SmartLogo src={logoSrc} hasBg={logoHasBg} isLight={logoIsLight} panelColor={primary} h={140} maxW={380} brandColors={brand.colors} scale={logoScale} />
                {text && (
                    <p style={{ color: headlineColor, fontSize: 24 * textSize, fontWeight: 900, lineHeight: 1.15, maxWidth: 400, margin: 0, fontFamily: font, letterSpacing: "-0.02em" }}>{text}</p>
                )}
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   LAYOUT 6 — "DIAGONAL GRADIENT"
═══════════════════════════════════════════════════════════════ */
function L6({ textSize = 1.0, textStyle = "blocky", logoScale = 1.0, brand, text, img, logoSrc, logoHasBg, logoIsLight, primary, headlineColor, photoFilter = "none" }: LayoutProps) {
    const font = getHeadlineFont(textStyle, brand.domain);

    return (
        <div className="absolute inset-0 overflow-hidden bg-white">
            {img && <img src={img} alt="" crossOrigin="anonymous" className="absolute inset-0 w-3/5 h-full object-cover" style={{ filter: photoFilter }} />}
            <div className="absolute top-0 bottom-0 right-0 flex flex-col items-center justify-center gap-8 p-16 overflow-hidden"
                style={{ width: "55%", background: primary, zIndex: 10, clipPath: 'polygon(120px 0, 100% 0, 100% 100%, 0 100%)' }}>
                <SmartLogo src={logoSrc} hasBg={logoHasBg} isLight={logoIsLight} panelColor={primary} h={120} maxW={360} brandColors={brand.colors} scale={logoScale} />
                {text && (
                    <p style={{ color: headlineColor, fontSize: 26 * textSize, fontWeight: 900, lineHeight: 1.15, maxWidth: 440, margin: 0, fontFamily: font, letterSpacing: "-0.02em", textAlign: "center" }}>{text}</p>
                )}
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   LAYOUT 7 — "CENTERED LOGO"
═══════════════════════════════════════════════════════════════ */
function L7({ textSize = 1.0, textStyle = "blocky", logoScale = 1.0, brand, text, img, logoSrc, logoHasBg, logoIsLight, primary, headlineColor, photoFilter = "none" }: LayoutProps) {
    return (
        <div className="absolute inset-0 overflow-hidden flex items-center justify-center bg-black">
            {img && (
                <div className="absolute inset-0">
                    <img src={img} alt="" crossOrigin="anonymous" className="absolute inset-0 w-full h-full object-cover" style={{ filter: photoFilter }} />
                    <div className="absolute inset-0 bg-black/10" />
                </div>
            )}
            <div className="relative z-10 flex flex-col items-center justify-center">
                <SmartLogo src={logoSrc} hasBg={logoHasBg} isLight={logoIsLight} panelColor="#000000" h={180} maxW={400} brandColors={brand.colors} scale={logoScale} />
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   LAYOUT 8 — "VERTICAL STRIPES" (UCL-specific)
═══════════════════════════════════════════════════════════════ */
const L8_STRIPE_IMAGES: Record<number, string> = {
    0: "/layout-assets/ucl-stripes-header dark purple.png",
    1: "/layout-assets/ucl-stripes-header light blue.png",
    2: "/layout-assets/ucl-stripes-header bright purple.png",
    3: "/layout-assets/ucl-stripes-header black.png",
    4: "/layout-assets/ucl-stripes-header white.png",
};

function L8({ logoScale = 1.0, brand, logoSrc, logoHasBg, logoIsLight, img, photoFilter = "none", tintIndex = 0 }: LayoutProps) {
    const effectiveTint = tintIndex < 0 ? 0 : tintIndex;
    const stripeSrc = L8_STRIPE_IMAGES[effectiveTint] ?? L8_STRIPE_IMAGES[0];
    const panelColor = brand.colors[effectiveTint] ?? "#361A54";
    const IMG_W = Math.round(672 * (H / 333));
    const LOGO_LEFT = W - IMG_W + Math.round(IMG_W * 0.53);
    const LOGO_W = W - LOGO_LEFT;
    return (
        <div className="absolute inset-0 overflow-hidden" style={{ width: W, height: H, background: panelColor }}>
            {img && (
                <img src={img} alt="" crossOrigin="anonymous"
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", filter: photoFilter }} />
            )}
            <img src={stripeSrc} alt=""
                style={{ position: "absolute", right: 0, top: 0, width: IMG_W, height: H, objectFit: "fill" }}
            />
            <div className="absolute flex items-center justify-center" style={{ left: LOGO_LEFT, top: 0, width: LOGO_W, height: H }}>
                <SmartLogo src={logoSrc} hasBg={logoHasBg} isLight={logoIsLight} panelColor={panelColor} h={200} maxW={360} brandColors={brand.colors} scale={logoScale} />
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   BANNER WRAPPER — routes to the right layout
═══════════════════════════════════════════════════════════════ */
function BannerCanvas({
    brand, text, layout, imgIndex, logoIndex,
    logoPos = 'bottom', bgStyle = 'none', tintIndex = 0, bgOpacity = 100, photoFilter = "none", logoScale = 1.0, textSize = 1.0, textStyle = "blocky", customImage = null,
}: {
    brand: BrandData; text: string; layout: Layout; imgIndex: number; logoIndex: number;
    logoPos?: 'top' | 'bottom' | 'center';
    bgStyle?: 'none' | 'brand';
    tintIndex?: number;
    bgOpacity?: number;
    photoFilter?: string;
    logoScale?: number;
    textSize?: number;
    textStyle?: "blocky" | "elegant" | "mono";
    customImage?: string | null;
}) {
    const img = customImage || (brand.images.length > 0
        ? brand.images[imgIndex % brand.images.length]
        : undefined);

    const noLogo = logoIndex === -1;
    const activeLogo = (brand.logos.length > 0 && !noLogo)
        ? brand.logos[logoIndex % brand.logos.length]
        : null;
    const logoSrc = noLogo ? "" : (activeLogo?.url ?? brand.fullLogo ?? "");
    const logoHasBg = activeLogo?.hasBg ?? brand.logoHasBg;
    const logoIsLight = activeLogo?.isLight !== false;
    const activeLogoColor = activeLogo?.logoColor;

    let primary = tintIndex !== -1
        ? brand.colors[tintIndex % brand.colors.length]
        : (activeLogo?.preferredBg ?? brand.colors[0] ?? "#003865");
    let secondary = brand.colors[1] ?? (isDark(primary) ? "#ffffff" : "#111111");

    if (primary === secondary && brand.colors.length > 1) {
        secondary = brand.colors.find(c => c !== primary) || secondary;
    }

    if (tintIndex === -1 && layout !== 8 && !activeLogo?.preferredBg) {
        const brightnessMismatch = logoIsLight ? !isDark(primary) : isDark(primary);
        const colorTooSimilar = activeLogoColor ? colorsAreSimilar(activeLogoColor, primary, 60) : false;

        if (brightnessMismatch || colorTooSimilar) {
            primary = pickBestPanelColor(activeLogoColor ?? null, logoIsLight, brand.colors, primary);
            secondary = brand.colors.find(c => c !== primary) ?? (isDark(primary) ? "#ffffff" : "#111111");
        }
    }

    let headlineColor = logoIsLight ? "#ffffff" : (activeLogoColor || brand.colors[0] || "#111111");
    if (isDark(headlineColor) === isDark(primary)) {
        headlineColor = contrastText(primary);
    }

    const p = { brand, text, img, logoSrc, logoHasBg, logoIsLight, primary, secondary, headlineColor, logoPos, bgStyle, tintIndex, bgOpacity, photoFilter, logoScale, textSize, textStyle };

    return (
        <div className="w-full h-full relative overflow-hidden bg-white">
            {layout === 0 && <L0 {...p} />}
            {layout === 1 && <L1 {...p} />}
            {layout === 2 && <L2 {...p} />}
            {layout === 3 && <L3 {...p} />}
            {layout === 4 && <L4 {...p} />}
            {layout === 5 && <L5 {...p} />}
            {layout === 6 && <L6 {...p} />}
            {layout === 7 && <L7 {...p} />}
            {layout === 8 && <L8 {...p} />}

            <GrainOverlay />
            <FrameOverlay />
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   LAYOUT THUMBNAILS
═══════════════════════════════════════════════════════════════ */
const PHOTO = "#8fa3b8";
const THUMB_CONFIGS: { label: string; preview: (color: string, accent: string) => React.ReactNode }[] = [
    {
        label: "Split",
        preview: (c, a) => (
            <div className="w-full h-full flex overflow-hidden">
                <div style={{ width: "40%", background: c }} />
                <div style={{ flex: 1, background: PHOTO }} />
            </div>
        ),
    },
    {
        label: "Immersive",
        preview: (c, a) => (
            <div className="w-full h-full overflow-hidden" style={{ position: "relative", background: PHOTO }}>
                <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to left, ${c}f0 20%, transparent 65%)` }} />
            </div>
        ),
    },
    {
        label: "Bold Stripe",
        preview: (c, a) => (
            <div className="w-full h-full overflow-hidden flex" style={{ background: PHOTO }}>
                <div style={{ flex: 1 }} />
                <div style={{ width: "38%", background: c, clipPath: "polygon(12px 0, 100% 0, 100% 100%, 0 100%)" }} />
            </div>
        ),
    },
    {
        label: "Centred Brand",
        preview: (c, a) => (
            <div className="w-full h-full flex overflow-hidden">
                <div style={{ width: "48%", background: c, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ width: "55%", height: "28%", background: `rgba(255,255,255,0.3)`, borderRadius: 2 }} />
                </div>
                <div style={{ flex: 1, background: a + "55", display: "flex", alignItems: "center", paddingLeft: 8 }}>
                    <div style={{ width: "60%", height: "12%", background: `${a}99`, borderRadius: 1 }} />
                </div>
            </div>
        ),
    },
    {
        label: "Glass Panels",
        preview: (c, a) => (
            <div className="w-full h-full overflow-hidden" style={{ position: "relative", background: PHOTO }}>
                <div style={{ position: "absolute", left: "6%", top: "18%", width: "36%", height: "64%", background: `${c}cc`, borderRadius: 2 }} />
                <div style={{ position: "absolute", right: "6%", top: "18%", width: "36%", height: "64%", background: "rgba(255,255,255,0.28)", borderRadius: 2 }} />
            </div>
        ),
    },
    {
        label: "Elegant Stripe",
        preview: (c, a) => (
            <div className="w-full h-full overflow-hidden flex" style={{ background: c }}>
                <div style={{ flex: 1 }} />
                <div style={{ width: "45%", background: "white", clipPath: "polygon(8px 0, 100% 0, 100% 100%, 0 100%)", display: "flex", alignItems: "center", paddingLeft: 14 }}>
                    <div style={{ width: "55%", height: "22%", background: `${c}55`, borderRadius: 1 }} />
                </div>
            </div>
        ),
    },
    {
        label: "Diagonal",
        preview: (c, a) => (
            <div className="w-full h-full overflow-hidden" style={{ position: "relative", background: PHOTO }}>
                <div style={{ position: "absolute", inset: 0, background: `linear-gradient(125deg, transparent 35%, ${c}f0 52%, ${c} 62%)` }} />
            </div>
        ),
    },
    {
        label: "Centered Logo",
        preview: (c, a) => (
            <div className="w-full h-full overflow-hidden" style={{ position: "relative", background: PHOTO }}>
                <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.25)" }} />
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ width: "52%", height: "22%", background: "rgba(255,255,255,0.85)", borderRadius: 1 }} />
                </div>
            </div>
        ),
    },
    {
        label: "Vertical Stripes",
        preview: (c) => (
            <div className="w-full h-full overflow-hidden" style={{ position: "relative", background: `${c}33` }}>
                <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "48%", background: c, opacity: 0.9 }} />
                <div style={{ position: "absolute", right: "8%", top: "20%", width: "28%", height: "60%", background: "rgba(255,255,255,0.25)", borderRadius: 1 }} />
            </div>
        ),
    },
];

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════ */
const LAYOUTS = [0, 1, 2, 3, 4, 5, 6, 7, 8];

function BuilderContent() {
    const params = useSearchParams();
    const router = useRouter();
    const bannerRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [brand, setBrand] = useState<BrandData | null>(null);
    const [text, setText] = useState("");
    const [layout, setLayout] = useState<Layout>(0);
    const [imgIndex, setImgIndex] = useState(0);
    const [logoIndex, setLogoIndex] = useState(0);
    const [logoPos, setLogoPos] = useState<'top' | 'bottom' | 'center'>('bottom');
    const [bgStyle, setBgStyle] = useState<'none' | 'brand'>('none');
    const [tintIndex, setTintIndex] = useState(-1);
    const [bgOpacity, setBgOpacity] = useState(100);
    const [photoFilter] = useState("none");
    const [logoScale, setLogoScale] = useState(1.0);
    const [textSize] = useState(1.0);
    const [textStyle] = useState<"blocky" | "elegant" | "mono">("blocky");
    const [customImage, setCustomImage] = useState<string | null>(null);

    const [scale, setScale] = useState(1);
    const [loading, setLoading] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [showDownloadPopup, setShowDownloadPopup] = useState(false);

    useEffect(() => {
        if (showDownloadPopup) {
            document.body.style.overflow = 'hidden';
            document.body.style.height = '100dvh';
        } else {
            document.body.style.overflow = 'unset';
            document.body.style.height = 'auto';
        }
        return () => {
            document.body.style.overflow = 'unset';
            document.body.style.height = 'auto';
        };
    }, [showDownloadPopup]);

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
                setImgIndex(0);
                setLogoIndex(0);
                setLoading(false);
            })
            .catch(err => {
                if (!isMounted) return;
                console.error("Critical: Failed to fetch brand data:", err);
                setLoading(false);
            });

        return () => { isMounted = false; };
    }, [params]);

    const changeCampus = (campus: string) => {
        const newParams = new URLSearchParams(params.toString());
        newParams.set("campus", campus);
        router.push(`/build?${newParams.toString()}`);
    };

    const isUCL = params.get("domain") === "ucl.ac.uk";
    const availableLayouts = (isUCL ? [0, 1, 2, 3, 4, 5, 6, 7, 8] : [0, 1, 2, 3, 4, 5, 6, 7]) as Layout[];

    const prevLayout = () => setLayout(l => { const idx = availableLayouts.indexOf(l); const n = availableLayouts[(idx - 1 + availableLayouts.length) % availableLayouts.length]; if (n === 8 && logoScale > 1.0) setLogoScale(1.0); return n; });
    const nextLayout = () => setLayout(l => { const idx = availableLayouts.indexOf(l); const n = availableLayouts[(idx + 1) % availableLayouts.length]; if (n === 8 && logoScale > 1.0) setLogoScale(1.0); return n; });

    const uniMetadata = ALL_UNIVERSITIES.find(u => u.domain === params.get("domain"));

    const handleDownload = async () => {
        if (!brand) return;
        setIsDownloading(true);
        try {
            const filename = `linkedin-banner-${brand.name.toLowerCase().replace(/\s+/g, '-')}.png`;

            const activeLogo = brand.logos.length > 0
                ? brand.logos[logoIndex % brand.logos.length]
                : null;
            const logoIsLight = activeLogo?.isLight !== false;
            const activeLogoColor = activeLogo?.logoColor ?? null;

            let primaryHex = tintIndex !== -1
                ? brand.colors[tintIndex % brand.colors.length]
                : (activeLogo?.preferredBg ?? brand.colors[0] ?? '#003865');

            if (tintIndex === -1 && !activeLogo?.preferredBg) {
                const brightnessMismatch = logoIsLight ? !isDark(primaryHex) : isDark(primaryHex);
                const colorTooSimilar = activeLogoColor ? colorsAreSimilar(activeLogoColor, primaryHex, 60) : false;
                if (brightnessMismatch || colorTooSimilar) {
                    primaryHex = pickBestPanelColor(activeLogoColor, logoIsLight, brand.colors, primaryHex);
                }
            }

            let headlineColor = logoIsLight ? "#ffffff" : (activeLogoColor || brand.colors[0] || "#111111");
            if (isDark(headlineColor) === isDark(primaryHex)) {
                headlineColor = isDark(primaryHex) ? "#ffffff" : "#111111";
            }

            const imageUrl = customImage || (brand.images.length > 0
                ? brand.images[imgIndex % brand.images.length]
                : null);
            const logoUrl = activeLogo?.url ?? brand.fullLogo ?? null;

            const response = await fetch('/api/render-banner', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageUrl, logoUrl, primaryHex, layout, text, headlineColor, logoIsLight, photoFilter: "none", logoPos, logoScale, textSize }),
            });
            if (!response.ok) throw new Error(`Server render failed: ${response.status}`);
            const blob = await response.blob();

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            setTimeout(() => setShowDownloadPopup(true), 800);
        } catch (e) {
            console.error("Export failed:", e);
            alert("Download failed — please try again");
        } finally {
            setIsDownloading(false);
        }
    };

    const primary = brand?.colors?.[0] ?? "#1e2d78";
    const textOnPrimary = contrastText(primary);

    return (
        <>
        <div className="min-h-screen bg-slate-50 flex flex-col items-center w-full overflow-x-hidden">
            <Header showStartButton={false} showBackButton activeBrand={brand} />

            <main className="w-full xl:w-[1280px] flex flex-col shrink-0 relative px-4 md:px-8 xl:px-12 py-4 md:py-6">
                <div className="max-w-screen-2xl mx-auto space-y-4 w-full mt-2 md:mt-4 mb-10 md:mb-12 xl:mb-16">

                    {/* ── BANNER PREVIEW ──────────────────────────── */}
                    <section className="sticky top-0 xl:top-4 z-40 pt-4 -mt-4 bg-slate-50/80 backdrop-blur-sm">
                        <div className="flex items-center justify-end mb-2 mr-1">
                            <div className="flex items-center gap-2 opacity-80">
                                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(37,99,235,0.6)]" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Live Preview</span>
                            </div>
                        </div>

                        <div className="rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-slate-100 bg-white">
                            <div ref={containerRef} className="w-full relative" style={{ height: brand ? H * scale : 160 }}>
                                {brand ? (
                                    <div style={{ width: W, height: H, transform: `scale(${scale})`, transformOrigin: "top left", position: "relative" }}>
                                        <div ref={bannerRef} className="absolute inset-0">
                                            <BannerCanvas
                                                brand={brand}
                                                text={text}
                                                layout={layout}
                                                imgIndex={imgIndex}
                                                logoIndex={logoIndex}
                                                logoPos={logoPos}
                                                bgStyle={bgStyle}
                                                tintIndex={tintIndex}
                                                bgOpacity={bgOpacity}
                                                photoFilter="none"
                                                logoScale={logoScale}
                                                textSize={textSize}
                                                textStyle={textStyle}
                                                customImage={customImage}
                                            />
                                        </div>
                                        {/* Profile picture overlay — preview only, not included in download */}
                                        <div style={{
                                            position: "absolute",
                                            left: 34,
                                            top: H - 120,
                                            width: 240,
                                            height: 240,
                                            borderRadius: "50%",
                                            overflow: "hidden",
                                            border: "3px solid white",
                                            pointerEvents: "none",
                                            zIndex: 10,
                                        }}>
                                            <img src="/linkedin-profile-placeholder.svg" style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
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
                    <div className="w-full bg-white rounded-2xl p-6 md:p-8 shadow-[0_15px_40px_rgba(0,0,0,0.03)] border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                        {brand ? (
                            <>
                                {/* Column 1 */}
                                <div className="space-y-8 flex flex-col">
                                    <div>
                                        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Layout Style</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {availableLayouts.map(l => (
                                                <button key={l}
                                                    onClick={() => { setLayout(l); if (l === 8 && logoScale > 1.0) setLogoScale(1.0); }}
                                                    className="flex flex-col gap-1 active:scale-95 transition-all"
                                                    style={{ outline: 'none' }}>
                                                    <div className="w-full aspect-[4/1] rounded-lg overflow-hidden"
                                                        style={{
                                                            outline: layout === l ? `2.5px solid #2563EB` : "2px solid transparent",
                                                            outlineOffset: 2,
                                                        }}>
                                                        {THUMB_CONFIGS[l].preview(primary, brand.colors[1] || primary)}
                                                    </div>
                                                    <span className="text-[8px] font-black uppercase tracking-widest text-center w-full truncate leading-tight"
                                                        style={{ color: layout === l ? '#2563EB' : '#9ca3af' }}>
                                                        {THUMB_CONFIGS[l].label}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {layout === 4 && (
                                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 animate-in fade-in slide-in-from-top-2">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Logo Alignment</p>
                                            <div className="flex gap-2">
                                                {(['top', 'center', 'bottom'] as const).map(pos => (
                                                    <button key={pos}
                                                        onClick={() => setLogoPos(pos)}
                                                        className="flex-1 py-1.5 rounded-full border-2 text-[10px] font-bold capitalize transition-all"
                                                        style={{
                                                            borderColor: logoPos === pos ? primary : "#e5e7eb",
                                                            background: logoPos === pos ? `${primary}10` : "white",
                                                            color: logoPos === pos ? primary : "#6b7280"
                                                        }}>
                                                        {pos === 'top' ? 'Top Corner' : (pos === 'center' ? 'Center Point' : 'Bottom Corner')}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {brand.images.length > 0 && (
                                        <div>
                                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Campus Images</label>
                                            <div className="flex gap-2 flex-wrap items-center">
                                                <label className="w-11 h-7 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all group active:scale-95">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                const reader = new FileReader();
                                                                reader.onload = (event) => {
                                                                    setCustomImage(event.target?.result as string);
                                                                    setImgIndex(-1);
                                                                };
                                                                reader.readAsDataURL(file);
                                                            }
                                                        }}
                                                    />
                                                    <Upload className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
                                                </label>

                                                {customImage && (
                                                    <div className="relative group" style={{ width: 44, height: 28 }}>
                                                        <button
                                                            onClick={() => setImgIndex(-1)}
                                                            className="w-full h-full rounded-lg overflow-hidden transition-all hover:scale-110 active:scale-95 relative"
                                                            style={{ outline: imgIndex === -1 ? `3px solid #2563EB` : '2px solid transparent', outlineOffset: 2 }}>
                                                            <img src={customImage} alt="Uploaded" className="w-full h-full object-cover" />
                                                            {imgIndex === -1 && (
                                                                <div className="absolute inset-0 bg-blue-600/10 flex items-center justify-center">
                                                                    <Check className="w-3 h-3 text-blue-600 drop-shadow-sm font-bold" />
                                                                </div>
                                                            )}
                                                        </button>
                                                    </div>
                                                )}

                                                {brand.images.map((img, i) => (
                                                    <div key={i} className="relative group" style={{ width: 44, height: 28 }}>
                                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-150 ease-out scale-95 group-hover:scale-100 w-64 aspect-[4/1] rounded-xl overflow-hidden shadow-2xl border-2 border-white ring-1 ring-black/5">
                                                            <img src={img} alt="" className="w-full h-full object-cover" />
                                                        </div>
                                                        <button
                                                            onClick={() => { setImgIndex(i); setCustomImage(null); }}
                                                            className="w-full h-full rounded-lg overflow-hidden transition-all hover:scale-110 active:scale-95"
                                                            style={{ outline: imgIndex === i ? `3px solid #2563EB` : '2px solid transparent', outlineOffset: 2 }}>
                                                            <img src={img} alt="" className="w-full h-full object-cover" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                            {brand.images.length > 1 && (
                                                <p className="text-xs text-gray-400 mt-2">
                                                    {customImage ? "Custom image uploaded" : `Photo ${(imgIndex % brand.images.length) + 1} of ${brand.images.length} selected`}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Column 2 */}
                                <div className="space-y-8 flex flex-col pt-4 md:pt-0 pl-1">
                                    {brand.colors.length > 0 && (() => {
                                        const accentDisabled = layout === 4 || layout === 7;
                                        return (
                                            <div className={accentDisabled ? 'opacity-30 pointer-events-none grayscale' : ''}>
                                                <label className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest mb-2 transition-colors ${accentDisabled ? 'text-gray-300' : 'text-gray-400'}`}>
                                                    Background Color
                                                    {accentDisabled && <span className="ml-1 text-[9px] font-semibold text-gray-300 normal-case tracking-normal">— not available</span>}
                                                </label>
                                                <div className="flex gap-3 flex-wrap">
                                                    {brand.colors.map((c, i) => (
                                                        <button key={i} onClick={() => setTintIndex(tintIndex === i ? -1 : i)} className="w-10 h-10 rounded-full transition-all hover:scale-110 active:scale-95 relative" style={{ backgroundColor: c, boxShadow: tintIndex === i ? `0 0 0 3px #fbbf24, 0 0 0 5px #f59e0b, 0 4px 12px rgba(245, 158, 11, 0.4)` : '0 2px 4px rgba(0,0,0,0.05)' }} />
                                                    ))}
                                                    <button onClick={() => setTintIndex(-1)} className="w-10 h-10 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-gray-400 hover:text-gray-500 transition-all text-[10px] font-bold uppercase" style={{ background: tintIndex === -1 ? '#f3f4f6' : 'transparent', boxShadow: tintIndex === -1 ? `0 0 0 3px #fbbf24, 0 0 0 5px #f59e0b, 0 4px 12px rgba(245, 158, 11, 0.4)` : 'none' }}>
                                                        Auto
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    <div>
                                        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Logo Variants</label>
                                        <div className="flex gap-2 flex-wrap">
                                            {[...brand.logos].map((logo, i) => ({ logo, i })).sort((a, b) => {
                                                const ai = a.logo.isIcon ?? false; const bi = b.logo.isIcon ?? false;
                                                return ai === bi ? 0 : (ai ? 1 : -1);
                                            }).map(({ logo, i }) => (
                                                <button key={i} onClick={() => setLogoIndex(i)} className="w-14 h-14 rounded-lg border-2 flex items-center justify-center p-1.5 transition-all hover:shadow-md relative overflow-hidden" style={{ borderColor: logoIndex === i ? primary : "#e5e7eb", background: logo.isLight ? "#334155" : "#f1f5f9" }}>
                                                    <img src={logo.url} alt="" className="w-full h-full object-contain relative z-10" style={{ filter: 'none' }} onError={e => (e.currentTarget.style.display = "none")} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Logo Size</label>
                                        <div className="flex gap-2">
                                            {[
                                                { label: 'Small', val: 0.75 },
                                                { label: 'Normal', val: 1.0 },
                                                { label: 'Large', val: 1.25 }
                                            ].map(s => {
                                                const disabled = layout === 8 && s.val === 1.25;
                                                const active = Math.abs(logoScale - s.val) < 0.01;
                                                return (
                                                    <button key={s.label}
                                                        onClick={() => { if (!disabled) setLogoScale(s.val); }}
                                                        disabled={disabled}
                                                        className="flex-1 py-2.5 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest transition-all"
                                                        style={{
                                                            borderColor: disabled ? "#e5e7eb" : active ? primary : "#f3f4f6",
                                                            background: disabled ? "#f3f4f6" : active ? `${primary}10` : "#f9fafb",
                                                            color: disabled ? "#d1d5db" : active ? primary : "#9ca3af",
                                                            cursor: disabled ? "not-allowed" : "pointer",
                                                            opacity: disabled ? 0.5 : 1,
                                                        }}>
                                                        {s.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="mt-auto pt-6 space-y-2">
                                        <button onClick={brand ? handleDownload : () => router.push("/")} disabled={isDownloading} className="w-full py-5 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-500/20 disabled:opacity-50 hover:bg-blue-700 active:scale-95" style={{ background: '#2563EB', color: '#ffffff' }}>
                                            {isDownloading ? <><RefreshCw className="w-5 h-5 animate-spin" /> Processing...</> : <><Download className="w-5 h-5" /> Download Banner</>}
                                        </button>
                                        <p className="text-center text-[11px] text-gray-400">LinkedIn optimised · Sharp 1584x396 PNG</p>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="md:col-span-2 py-20 text-center text-gray-400 italic">
                                Search for your university to begin
                            </div>
                        )}
                    </div>
                </div>
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
                            <button onClick={() => setShowDownloadPopup(false)} className="p-2 text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 bg-gray-50 overflow-y-auto space-y-4 flex-1">
                            <h4 className="text-xs font-black uppercase tracking-widest text-gray-400">How to update your LinkedIn</h4>
                            <div className="space-y-4">
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
                                        <p className="text-sm text-gray-500 mt-0.5 mb-2">In the top right corner of your current banner area, click the edit icon.</p>
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

                        <div className="p-4 border-t border-gray-100 bg-white flex gap-3">
                            <button onClick={() => setShowDownloadPopup(false)} className="flex-1 py-3.5 rounded-full font-black text-[11px] uppercase tracking-widest border-2 border-gray-100 text-[#111827] hover:bg-gray-50 transition-colors active:scale-95">
                                Make another
                            </button>
                            <button onClick={() => router.push('/')} className="flex-1 py-3.5 rounded-full font-black text-[11px] uppercase tracking-widest bg-gray-900 text-white hover:bg-gray-800 transition-colors shadow-lg active:scale-95">
                                Back to Home
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
