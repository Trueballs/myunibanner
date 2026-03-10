"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { Download, RefreshCw, ChevronLeft, ChevronRight, X, Shuffle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toPng } from "html-to-image";
import { useSearchParams, useRouter } from "next/navigation";

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

type Layout = 0 | 1 | 2 | 3 | 4 | 5;

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

/* ═══════════════════════════════════════════════════════════════
   LOGO RENDERER
   Handles transparent, opaque-bg, and needs-invert scenarios
═══════════════════════════════════════════════════════════════ */
function SmartLogo({
    src, hasBg, isLight = true, panelColor, h = 100, maxW = 280,
}: {
    src: string; hasBg?: boolean; isLight?: boolean; panelColor: string; h?: number; maxW?: number;
}) {
    const [err, setErr] = useState(false);
    if (err || !src) return null;
    const panelDark = isDark(panelColor);

    // Opaque-bg logo: show in a beautiful padded glass badge to prevent rigid ugly boxes
    if (hasBg) {
        return (
            <div style={{
                background: "rgba(255,255,255,0.95)",
                padding: "12px 24px",
                borderRadius: "16px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: panelDark ? "0 8px 32px rgba(0,0,0,0.3)" : "0 4px 16px rgba(0,0,0,0.08)",
                border: "1px solid rgba(255,255,255,0.8)"
            }}>
                <img src={src} alt="University logo"
                    crossOrigin="anonymous"
                    style={{
                        height: h * 0.85, width: "auto", maxWidth: maxW,
                        objectFit: "contain", display: "block",
                        mixBlendMode: "multiply" // Knocks out the pure white BG of the JPEG perfectly against the card
                    }}
                    onError={() => setErr(true)} />
            </div>
        );
    }

    // Transparent logo: invert ONLY IF the panel needs a contrast change
    // panelDark && !isLight -> make it white
    // !panelDark && isLight -> make it black
    let needsInvertWhite = false;
    let needsInvertBlack = false;

    if (panelDark && !isLight) needsInvertWhite = true;
    else if (!panelDark && isLight) needsInvertBlack = true;

    return (
        <img src={src} alt="University logo"
            crossOrigin="anonymous"
            style={{
                height: h, width: "auto", maxWidth: maxW,
                objectFit: "contain", display: "block",
                filter: needsInvertWhite ? "brightness(0) invert(1)" : (needsInvertBlack ? "brightness(0)" : "drop-shadow(0px 2px 2px rgba(0,0,0,0.15))"),
            }}
            onError={() => setErr(true)} />
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

/* ═══════════════════════════════════════════════════════════════
   LAYOUT 0 — "SPLIT"
   Classic 40/60 vertical split: solid brand panel LEFT (clear
   of avatar zone by design), full campus photo RIGHT.
   Logo sits large, centered in the left panel.
   Inspired by: Princeton / Dartmouth
═══════════════════════════════════════════════════════════════ */
function L0({ brand, text, img }: { brand: BrandData; text: string; img?: string }) {
    const primary = brand.colors[0] ?? "#003865";
    const accent = brand.colors[1] ?? "#ffffff";
    const textCol = contrastText(primary);
    const font = getFont(brand.fonts?.[0]);

    // Split photo to LEFT (hides part under danger zone), brand panel RIGHT
    const LEFT_W = 600;

    const textLogo = brand.logos.find(l => l.isText) ?? brand.logos[0];
    const iconLogo = brand.logos.find(l => l.isIcon);
    const logoSrc = textLogo?.url ?? brand.fullLogo;
    const logoHasBg = textLogo?.hasBg ?? brand.logoHasBg;

    return (
        <div className="absolute inset-0 overflow-hidden" style={{ background: primary }}>

            {/* Z0 — Campus photo (LEFT side, safely sits under avatar) */}
            {img && (
                <div className="absolute top-0 bottom-0 left-0" style={{ width: LEFT_W }}>
                    <img src={img} alt="" className="w-full h-full object-cover"
                        crossOrigin="anonymous"
                        style={{ objectPosition: "center center" }} />
                    {/* Gradient blend into right panel */}
                    <div className="absolute inset-0"
                        style={{ background: `linear-gradient(to left, ${primary} 0%, transparent 40%)` }} />
                </div>
            )}

            {/* Z1 — Right solid brand panel (100% inside safe zone) */}
            <div className="absolute top-0 bottom-0 right-0 flex flex-col items-center justify-center gap-6 overflow-hidden"
                style={{ left: LEFT_W, background: primary, zIndex: 10, padding: "32px 56px" }}>

                {/* Ghost crest — decorative */}
                <GhostCrest iconLogo={iconLogo} primary={primary} opacity={0.15}
                    style={{ position: "absolute", bottom: -20, right: -20, height: 380, width: "auto", objectFit: "contain", zIndex: 0 }} />

                {/* DOMINANT logo */}
                <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <SmartLogo src={logoSrc} hasBg={logoHasBg} isLight={textLogo?.isLight} panelColor={primary} h={130} maxW={400} />
                </div>

                {/* Accent divider */}
                <div style={{
                    height: 4, width: 52,
                    background: accent === primary ? `rgba(255,255,255,0.4)` : accent,
                    borderRadius: 4, position: "relative", zIndex: 1,
                }} />

                {/* Headline text */}
                {text && (
                    <p style={{
                        color: textCol, fontSize: 22, fontWeight: 800, lineHeight: 1.25,
                        textAlign: "center", maxWidth: 460, margin: 0,
                        position: "relative", zIndex: 1, letterSpacing: "-0.01em",
                        fontFamily: font
                    }}>
                        {text}
                    </p>
                )}
            </div>

            {/* Thin accent seam at panel edge */}
            <div className="absolute top-0 bottom-0"
                style={{ left: LEFT_W - 1, width: 6, background: accent === primary ? "rgba(255,255,255,0.2)" : accent, zIndex: 11 }} />
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
function L1({ brand, text, img }: { brand: BrandData; text: string; img?: string }) {
    const primary = brand.colors[0] ?? "#003b71";
    const accent = brand.colors[1] ?? "#ffb800";
    const font = getFont(brand.fonts?.[0]);

    // For the overlay: use the dark version of primary
    const overlayHex = blendHex(primary, "#000000", 0.3);

    const textLogo = brand.logos.find(l => l.isText) ?? brand.logos[0];
    const iconLogo = brand.logos.find(l => l.isIcon);
    const logoSrc = textLogo?.url ?? brand.fullLogo;
    const logoHasBg = textLogo?.hasBg ?? brand.logoHasBg;

    return (
        <div className="absolute inset-0 overflow-hidden">

            {/* Z0 — Full bleed photo */}
            {img
                ? <img src={img} alt="" crossOrigin="anonymous" className="absolute inset-0 w-full h-full object-cover"
                    style={{ objectPosition: "center center" }} />
                : <div className="absolute inset-0" style={{ background: primary }} />
            }

            {/* Z1 — Dual gradient overlay */}
            <div className="absolute inset-0" style={{
                background: `
                    linear-gradient(to top, ${overlayHex}ee 0%, transparent 60%),
                    linear-gradient(to left, ${primary}f0 0%, ${primary}40 45%, transparent 70%)
                `,
                zIndex: 1,
            }} />

            {/* Z2 — Right-side logo zone (safe) */}
            <div className="absolute top-0 bottom-0 right-0 flex flex-col items-center justify-center gap-5"
                style={{ width: "38%", zIndex: 3, padding: "24px 40px" }}>

                {/* Ghost crest behind logo */}
                <GhostCrest iconLogo={iconLogo} primary={primary} opacity={0.3}
                    style={{ position: "absolute", right: -10, top: -10, height: 320, width: "auto", objectFit: "contain" }} />

                <SmartLogo src={logoSrc} hasBg={logoHasBg} isLight={textLogo?.isLight} panelColor={primary} h={140} maxW={460} />
            </div>

            {/* Z3 — Text: safely positioned CLEAR of 568 danger zone */}
            {text && (
                <div className="absolute"
                    style={{ bottom: 42, left: 600, zIndex: 4, maxWidth: 520 }}>
                    {/* 7px horizontal accent bar */}
                    <div style={{ width: 56, height: 6, background: accent, marginBottom: 16 }} />
                    <p style={{
                        color: "#ffffff", fontSize: 24, fontWeight: 900,
                        lineHeight: 1.2, letterSpacing: "-0.02em",
                        textShadow: "0 2px 12px rgba(0,0,0,0.6)",
                        margin: 0, fontFamily: font
                    }}>
                        {text}
                    </p>
                </div>
            )}
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
function L2({ brand, text, img }: { brand: BrandData; text: string; img?: string }) {
    const primary = brand.colors[0] ?? "#1a1a4b";
    const accent = brand.colors[1] ?? "#e8c048";
    const textCol = contrastText(primary);
    const font = getFont(brand.fonts?.[0]);

    // Panel occupies right 36%, starting safely past X=1000
    const PANEL_W = 570;
    const SKEW_PX = 48; // extra width on left for the angled edge

    const textLogo = brand.logos.find(l => l.isText) ?? brand.logos[0];
    const iconLogo = brand.logos.find(l => l.isIcon);
    const logoSrc = textLogo?.url ?? brand.fullLogo;
    const logoHasBg = textLogo?.hasBg ?? brand.logoHasBg;

    return (
        <div className="absolute inset-0 overflow-hidden">

            {/* Z0 — Full campus photo */}
            {img
                ? <img src={img} alt="" crossOrigin="anonymous" className="absolute inset-0 w-full h-full object-cover"
                    style={{ objectPosition: "30% center" }} />
                : <div className="absolute inset-0" style={{ background: "#1e2533" }} />
            }

            {/* Z1 — Subtle dark scrim over the photo half */}
            <div className="absolute inset-0" style={{
                background: "linear-gradient(to right, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.05) 55%, transparent 70%)",
                zIndex: 1,
            }} />

            {/* Z2 — Right panel with angled left edge (safely avoids danger zone) */}
            <div className="absolute top-0 bottom-0 right-0 flex flex-col justify-center overflow-hidden"
                style={{
                    width: PANEL_W + SKEW_PX,
                    background: primary,
                    clipPath: `polygon(${SKEW_PX}px 0, 100% 0, 100% 100%, 0 100%)`,
                    zIndex: 10,
                    padding: `32px 40px 32px ${SKEW_PX + 40}px`,
                    gap: 20,
                }}>

                {/* Ghost crest */}
                {iconLogo && (
                    <img src={iconLogo.url} alt="" crossOrigin="anonymous"
                        style={{
                            position: "absolute", bottom: 0, right: -10,
                            height: 340, width: "auto", objectFit: "contain",
                            opacity: 0.12, filter: isDark(primary) ? "brightness(0) invert(1)" : "none",
                            zIndex: 0, pointerEvents: "none",
                        }}
                        onError={() => { }} />
                )}

                {/* Logo — dominant */}
                <SmartLogo src={logoSrc} hasBg={logoHasBg} isLight={textLogo?.isLight} panelColor={primary} h={150} maxW={460} />

                {/* Accent divider */}
                <div style={{ height: 4, width: 56, background: accent === primary ? "rgba(255,255,255,0.4)" : accent, borderRadius: 4 }} />

                {text && (
                    <p style={{
                        color: textCol, fontSize: 20, fontWeight: 800, lineHeight: 1.25,
                        maxWidth: PANEL_W - 60, margin: 0, letterSpacing: "-0.01em",
                        fontFamily: font
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
function L3({ brand, text, img }: { brand: BrandData; text: string; img?: string }) {
    const primary = brand.colors[0] ?? "#003865";
    const secondary = brand.colors[1] ?? "#88bbdd";
    const accent = brand.colors[2] ?? brand.colors[1] ?? "#ffdd00";
    const font = getFont(brand.fonts?.[0]);

    const rightDark = isDark(secondary);

    // Swap Left/Right logic to avoid Danger Zone
    // LEFT is photo/secondary panel (will be partially covered by avatar)
    // RIGHT is pure brand display with Logo + Text (100% safe)

    // Left width exactly covers the danger zone + padding, 
    // pushing all critical content to the right
    const LEFT_W = 600;

    const textLogo = brand.logos.find(l => l.isText) ?? brand.logos[0];
    const iconLogo = brand.logos.find(l => l.isIcon);
    const logoSrc = textLogo?.url ?? brand.fullLogo;
    const logoHasBg = textLogo?.hasBg ?? brand.logoHasBg;

    return (
        <div className="absolute inset-0 overflow-hidden flex">

            {/* Z0 — LEFT: Secondary colour / photo panel */}
            <div className="relative flex flex-col justify-center overflow-hidden flex-shrink-0"
                style={{ width: LEFT_W, background: secondary }}>

                {/* Optional faint photo strictly on the left */}
                {img && (
                    <>
                        <img src={img} alt="" crossOrigin="anonymous" className="absolute inset-0 w-full h-full object-cover"
                            style={{ objectPosition: "center center" }} />
                        <div className="absolute inset-0" style={{ background: `${secondary}d0` }} />
                    </>
                )}

                {/* Ghost crest decoration sitting behind where the avatar would be */}
                <GhostCrest iconLogo={iconLogo} primary={secondary} opacity={0.35}
                    style={{ position: "absolute", top: 20, right: -40, height: 380, width: "auto", objectFit: "contain", zIndex: 0 }} />
            </div>

            {/* Accent seam */}
            <div style={{ width: 6, background: accent === primary ? "rgba(255,255,255,0.25)" : accent, flexShrink: 0, zIndex: 12 }} />

            {/* Z0 — RIGHT: Brand colour logo panel (Fully safe zone) */}
            <div className="relative flex flex-col items-center justify-center overflow-hidden flex-1"
                style={{ background: primary, gap: 20, padding: "32px 56px" }}>

                <div style={{
                    position: "absolute", inset: 0, zIndex: 0,
                    background: `radial-gradient(circle at 110% 50%, ${isDark(primary) ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)"} 0%, transparent 70%)`,
                }} />

                {/* HUGE logo — safely centered in the right panel */}
                <div style={{ position: "relative", zIndex: 1 }}>
                    <SmartLogo src={logoSrc} hasBg={logoHasBg} isLight={textLogo?.isLight} panelColor={primary} h={140} maxW={600} />
                </div>

                {/* Accent dot-row decoration */}
                <div style={{ position: "relative", zIndex: 1, display: "flex", gap: 8 }}>
                    {[0, 1, 2].map(i => (
                        <div key={i} style={{
                            width: i === 1 ? 28 : 10, height: 5, borderRadius: 999,
                            background: accent === primary ? "rgba(255,255,255,0.35)" : accent,
                        }} />
                    ))}
                </div>

                {/* Headline text */}
                {text && (
                    <p style={{
                        color: contrastText(primary), fontSize: 24, fontWeight: 800,
                        lineHeight: 1.15, letterSpacing: "-0.01em", textAlign: "center",
                        margin: 0, marginTop: 16, maxWidth: 600, position: "relative", zIndex: 1,
                        fontFamily: font
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
function L4({ brand, text, img }: { brand: BrandData; text: string; img?: string }) {
    const primary = brand.colors[0] ?? "#1a1a4b";
    const accent = brand.colors[2] ?? brand.colors[1] ?? "#fff";
    const font = getFont(brand.fonts?.[0]);

    const textLogo = brand.logos.find(l => l.isText) ?? brand.logos[0];
    const iconLogo = brand.logos.find(l => l.isIcon);
    const logoSrc = textLogo?.url ?? brand.fullLogo;
    const logoHasBg = textLogo?.hasBg ?? brand.logoHasBg;

    return (
        <div className="absolute inset-0 overflow-hidden" style={{ background: primary }}>
            {/* Background Image & Gradient Blur */}
            {img && <img src={img} alt="" crossOrigin="anonymous" className="absolute inset-0 w-full h-full object-cover" />}
            <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${primary}e6 0%, ${primary}99 100%)`, backdropFilter: "blur(4px)" }} />

            {/* Left Decorative Shape (avoids Danger Zone) */}
            <div className="absolute left-0 top-0 bottom-0 flex" style={{ width: 568, zIndex: 0 }}>
                {iconLogo && (
                    <GhostCrest iconLogo={iconLogo} primary={primary} opacity={0.25}
                        style={{ position: "absolute", bottom: -50, right: -50, height: 400, width: "auto", objectFit: "contain" }} />
                )}
            </div>

            {/* Floating Glass Box on Right (100% safe) */}
            <div className="absolute right-10 flex flex-col items-center justify-center shadow-xl"
                style={{
                    top: 40, bottom: 40, width: 900,
                    background: isDark(primary) ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.8)",
                    backdropFilter: "blur(16px)",
                    borderRadius: 24, border: `1px solid ${isDark(primary) ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)"}`,
                    zIndex: 10, padding: 40, gap: 16
                }}>
                <SmartLogo src={logoSrc} hasBg={logoHasBg} isLight={textLogo?.isLight} panelColor={primary} h={130} maxW={600} />
                <div style={{ width: 120, height: 3, background: accent, borderRadius: 2, margin: "16px 0" }} />
                {text && (
                    <p style={{
                        color: contrastText(primary), fontSize: 26, fontWeight: 700, margin: 0,
                        fontFamily: font, letterSpacing: "-0.01em", textAlign: "center"
                    }}>{text}</p>
                )}
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   LAYOUT 5 — "ELEGANT STRIPE"
   Massive watermark in the middle, and a sharp solid panel splitting the 
   right side cleanly. Very modern.
═══════════════════════════════════════════════════════════════ */
function L5({ brand, text, img }: { brand: BrandData; text: string; img?: string }) {
    const primary = brand.colors[0] ?? "#000000";
    const accent = brand.colors[1] ?? "#ffffff";
    const font = getFont(brand.fonts?.[0]);

    const textLogo = brand.logos.find(l => l.isText) ?? brand.logos[0];
    const iconLogo = brand.logos.find(l => l.isIcon);
    const logoSrc = textLogo?.url ?? brand.fullLogo;
    const logoHasBg = textLogo?.hasBg ?? brand.logoHasBg;

    return (
        <div className="absolute inset-0 overflow-hidden flex" style={{ background: primary }}>
            {/* Giant Centered Watermark */}
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden" style={{ zIndex: 0 }}>
                {img && <img src={img} alt="" crossOrigin="anonymous" className="absolute inset-0 w-full h-full object-cover opacity-30" />}
                {iconLogo && <GhostCrest iconLogo={iconLogo} primary={primary} opacity={0.3} style={{ height: "180%", minWidth: 600, objectFit: "contain" }} />}
                <div className="absolute inset-0" style={{ background: `radial-gradient(circle at center, transparent 30%, ${primary} 90%)` }} />
            </div>

            {/* Right safe zone panel block */}
            <div className="absolute right-0 top-0 bottom-0 bg-white" style={{ width: 660, zIndex: 10, clipPath: 'polygon(60px 0, 100% 0, 100% 100%, 0 100%)' }}>
                <div className="w-full h-full flex flex-col justify-center gap-6" style={{ padding: "0 60px 0 100px", zIndex: 10 }}>
                    <div style={{ paddingLeft: 32, borderLeft: `6px solid ${primary}` }}>
                        <SmartLogo src={logoSrc} hasBg={logoHasBg} isLight={textLogo?.isLight} panelColor={"#ffffff"} h={110} maxW={500} />
                        {text && (
                            <p style={{
                                color: contrastText("#ffffff"), fontSize: 24, fontWeight: 800, margin: 0,
                                marginTop: 24, fontFamily: font, letterSpacing: "-0.01em"
                            }}>{text}</p>
                        )}
                    </div>
                </div>
            </div>
            {/* Accent colored line riding the clipped border */}
            <div className="absolute right-0 top-0 bottom-0" style={{ width: 660, zIndex: 11, background: 'transparent', clipPath: 'polygon(60px 0, 66px 0, 6px 100%, 0 100%)' }}>
                <div className="w-full h-full" style={{ background: accent }}></div>
            </div>
        </div>
    );
}


/* ═══════════════════════════════════════════════════════════════
   BANNER WRAPPER — routes to the right layout
═══════════════════════════════════════════════════════════════ */
function BannerCanvas({
    brand, text, layout, imgIndex,
    showDangerZone,
}: {
    brand: BrandData; text: string; layout: Layout; imgIndex: number; showDangerZone?: boolean;
}) {
    const img = brand.images.length > 0
        ? brand.images[imgIndex % brand.images.length]
        : undefined;

    const p = { brand, text, img };

    return (
        <>
            {layout === 0 && <L0 {...p} />}
            {layout === 1 && <L1 {...p} />}
            {layout === 2 && <L2 {...p} />}
            {layout === 3 && <L3 {...p} />}
            {layout === 4 && <L4 {...p} />}
            {layout === 5 && <L5 {...p} />}

            {/* Dev-only: Danger Zone overlay (hidden at export) */}
            {showDangerZone && (
                <div
                    data-no-export="true"
                    style={{
                        position: "absolute",
                        left: DZ_X, top: DZ_Y,
                        width: DZ_W, height: DZ_H,
                        border: "2px dashed rgba(255,0,0,0.6)",
                        background: "rgba(255,0,0,0.08)",
                        zIndex: 999, pointerEvents: "none",
                    }}>
                    <span style={{
                        position: "absolute", top: 6, left: 10,
                        color: "rgba(255,0,0,0.7)", fontSize: 11, fontWeight: 700,
                        fontFamily: "monospace", textTransform: "uppercase",
                    }}>
                        ⚠ Avatar Danger Zone
                    </span>
                </div>
            )}
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
                    <div style={{ width: "60%", height: 4, background: a, borderRadius: 2, opacity: 0.8 }} />
                </div>
                <div style={{ flex: 1, background: `${c}22`, position: "relative" }}>
                    <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #ddd 0%, #bbb 100%)" }} />
                </div>
            </div>
        ),
    },
    {
        label: "Immersive",
        preview: (c, a) => (
            <div className="w-full h-full overflow-hidden" style={{ position: "relative", background: "#888" }}>
                <div style={{ position: "absolute", inset: 0, zIndex: 1, background: `linear-gradient(to left, ${c}ee 30%, transparent 70%)` }} />
                <div style={{ position: "absolute", right: "15%", top: "50%", transform: "translateY(-50%)", width: "18%", height: 3, background: a, zIndex: 2, borderRadius: 2 }} />
            </div>
        ),
    },
    {
        label: "Bold Stripe",
        preview: (c, a) => (
            <div className="w-full h-full overflow-hidden flex" style={{ background: "#999" }}>
                <div style={{ flex: 1 }} />
                <div style={{ width: "38%", background: c, clipPath: "polygon(12px 0, 100% 0, 100% 100%, 0 100%)", display: "flex", alignItems: "center", paddingLeft: 16 }}>
                    <div style={{ width: "50%", height: 3, background: a, borderRadius: 2 }} />
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
                <div style={{ width: 2, background: a }} />
                <div style={{ flex: 1, background: a + "44", display: "flex", alignItems: "center", paddingLeft: 10 }}>
                    <div style={{ width: "60%", height: 4, background: c, borderRadius: 2, opacity: 0.5 }} />
                </div>
            </div>
        ),
    },
    {
        label: "Glass Panels",
        preview: (c, a) => (
            <div className="w-full h-full relative overflow-hidden flex items-center justify-end" style={{ background: c }}>
                <div style={{ position: "absolute", right: 4, top: 4, bottom: 4, width: "60%", background: "rgba(255,255,255,0.4)", borderRadius: 4, border: "1px solid rgba(255,255,255,0.5)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 2 }}>
                    <div style={{ width: "50%", height: 2, background: "white", borderRadius: 2 }} />
                    <div style={{ width: 6, height: 1, background: a, borderRadius: 2 }} />
                </div>
            </div>
        ),
    },
    {
        label: "Elegant Stripe",
        preview: (c, a) => (
            <div className="w-full h-full overflow-hidden flex" style={{ background: c }}>
                <div style={{ flex: 1 }} />
                <div style={{ width: "45%", position: "relative", background: "white", clipPath: "polygon(8px 0, 100% 0, 100% 100%, 0 100%)", display: "flex", alignItems: "center", paddingLeft: 16 }}>
                    <div style={{ width: "50%", height: 2, background: c, borderRadius: 2 }} />
                    <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 8, background: a, clipPath: "polygon(8px 0, 9px 0, 1px 100%, 0 100%)" }} />
                </div>
            </div>
        ),
    },
];

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════ */
const LAYOUTS = [0, 1, 2, 3, 4, 5];

function BuilderContent() {
    const params = useSearchParams();
    const router = useRouter();
    const bannerRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [brand, setBrand] = useState<BrandData | null>(null);
    const [text, setText] = useState("MSc Computer Science");
    const [layout, setLayout] = useState<Layout>(0);
    const [imgIndex, setImgIndex] = useState(0);
    const [scale, setScale] = useState(1);
    const [loading, setLoading] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [showDangerZone, setShowDangerZone] = useState(true);

    // Dynamic Google Font Injection
    const fontUrl = brand?.fonts?.[0]
        ? `https://fonts.googleapis.com/css2?family=${brand.fonts[0].replace(/\s+/g, "+")}:wght@400;700;800;900&display=swap`
        : null;

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
        if (!domain) return;
        setLoading(true);
        fetch(`/api/brand?q=${encodeURIComponent(domain)}`)
            .then(r => r.json())
            .then((data: BrandData) => {
                setBrand(data);
                setImgIndex(0);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [params]);

    // ── Layout navigation ─────────────────────────────────────
    const prevLayout = () => setLayout(l => ((l - 1 + LAYOUTS.length) % LAYOUTS.length) as Layout);
    const nextLayout = () => setLayout(l => ((l + 1) % LAYOUTS.length) as Layout);

    // ── Photo navigation ──────────────────────────────────────
    const prevImg = () => setImgIndex(i => Math.max(0, i - 1));
    const nextImg = () => {
        if (!brand) return;
        setImgIndex(i => (i + 1) % brand.images.length);
    };
    const randomImg = () => {
        if (!brand || brand.images.length <= 1) return;
        setImgIndex(Math.floor(Math.random() * brand.images.length));
    };

    // ── Download ──────────────────────────────────────────────
    const download = useCallback(async () => {
        if (!bannerRef.current || !brand) return;
        setIsDownloading(true);
        try {
            // Temporarily hide the danger zone overlay
            const overlays = bannerRef.current.querySelectorAll("[data-no-export]");
            overlays.forEach(el => ((el as HTMLElement).style.visibility = "hidden"));

            const url = await toPng(bannerRef.current, {
                cacheBust: true,
                pixelRatio: 1,
                width: W,
                height: H,
                style: { transform: "none" },
                // quality 0.95 keeps it well under LinkedIn's 8 MB limit
            });

            overlays.forEach(el => ((el as HTMLElement).style.visibility = ""));

            const a = document.createElement("a");
            a.href = url;
            a.download = `lnbg-${brand.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}.png`;
            a.click();
        } catch (e) {
            console.error("Export failed:", e);
        } finally {
            setIsDownloading(false);
        }
    }, [brand]);

    const primary = brand?.colors?.[0] ?? "#1e2d78";
    const accent = brand?.colors?.[1] ?? "#88aaff";
    const textOnPrimary = contrastText(primary);

    return (
        <div className="min-h-screen pb-32" style={{ background: "#f0f2f5" }}>
            {/* Inject Google Font dynamically so html-to-image can render it */}
            {fontUrl && <link href={fontUrl} rel="stylesheet" crossOrigin="anonymous" />}

            {/* ── NAV ─────────────────────────────────────────── */}
            <header className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
                <button
                    onClick={() => router.push("/")}
                    className="font-black text-2xl tracking-[0.15em] hover:opacity-60 transition-opacity"
                    style={{ color: "#1e2d78" }}>
                    LNBG
                </button>
                {brand && (
                    <button
                        onClick={() => router.push("/")}
                        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors">
                        <X className="w-3.5 h-3.5" /> Start over
                    </button>
                )}
            </header>

            <div className="max-w-6xl mx-auto px-6 space-y-6">

                {/* ── BANNER PREVIEW ──────────────────────────── */}
                <section>
                    <div className="flex items-center gap-2 mb-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Live Preview</span>
                        <span className="ml-auto text-[10px] text-gray-300 font-mono">1584 × 396 px</span>
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
                                        <AnimatePresence mode="wait">
                                            <motion.div
                                                key={`${layout}-${imgIndex}`}
                                                className="absolute inset-0"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.18 }}>
                                                <BannerCanvas
                                                    brand={brand}
                                                    text={text}
                                                    layout={layout}
                                                    imgIndex={imgIndex}
                                                    showDangerZone={showDangerZone}
                                                />
                                            </motion.div>
                                        </AnimatePresence>
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

                        {/* LinkedIn profile mock-up */}
                        <div className="relative px-8 pt-14 pb-6 bg-white border-t border-gray-100">
                            <div className="absolute left-8 -top-10 w-20 h-20 rounded-full bg-white ring-2 ring-gray-200 shadow overflow-hidden">
                                <img
                                    src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=160&h=160&fit=crop&crop=face"
                                    alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex items-end justify-between flex-wrap gap-3">
                                <div>
                                    <p className="font-bold text-gray-900">Your Name <span className="font-normal text-gray-400 text-sm">· 1st</span></p>
                                    <p className="text-gray-500 text-sm mt-0.5">
                                        {text || (brand ? `${brand.name} Graduate` : "Your headline here")}
                                    </p>
                                    <p className="text-blue-600 text-xs font-semibold mt-1">500+ connections</p>
                                </div>
                                <div className="flex gap-2">
                                    <button className="px-5 py-1.5 rounded-full text-white text-sm font-bold" style={{ background: "#0A66C2" }}>Message</button>
                                    <button className="px-4 py-1.5 rounded-full border border-gray-300 text-gray-600 text-sm font-bold">More</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── CONTROLS ────────────────────────────────── */}
                <div className="grid md:grid-cols-2 gap-5">

                    {/* LEFT — University & Headline */}
                    <div className="bg-white rounded-2xl p-7 shadow-sm ring-1 ring-black/5 space-y-6">

                        {/* University selector */}
                        <div>
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">
                                <span className="w-5 h-5 rounded-full text-white text-[9px] flex items-center justify-center font-black"
                                    style={{ background: primary }}>01</span>
                                University
                            </label>
                            {loading
                                ? <div className="h-14 rounded-xl bg-gray-100 animate-pulse" />
                                : brand
                                    ? (
                                        <div className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-200 bg-gray-50">
                                            <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center shadow-sm overflow-hidden flex-shrink-0">
                                                <img src={brand.logo} alt="" className="w-full h-full object-contain p-1"
                                                    onError={e => (e.currentTarget.style.display = "none")} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-gray-900 text-sm truncate">{brand.fullName}</p>
                                                <p className="text-gray-400 text-xs">{brand.domain}</p>
                                            </div>
                                            <button onClick={() => router.push("/")}
                                                className="p-1.5 hover:bg-red-50 hover:text-red-400 rounded-lg transition-colors text-gray-300">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )
                                    : (
                                        <button onClick={() => router.push("/")}
                                            className="w-full h-14 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 text-sm hover:border-gray-400 transition-colors">
                                            ← Search a university on the home page
                                        </button>
                                    )
                            }
                        </div>

                        {/* Headline input */}
                        <AnimatePresence>
                            {brand && (
                                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">
                                        <span className="w-5 h-5 rounded-full text-white text-[9px] flex items-center justify-center font-black"
                                            style={{ background: primary }}>02</span>
                                        Your Headline
                                    </label>
                                    <textarea
                                        value={text}
                                        onChange={e => setText(e.target.value)}
                                        placeholder={`e.g. MSc Computer Science · ${brand.name}`}
                                        maxLength={80}
                                        rows={2}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:border-transparent resize-none placeholder:text-gray-300 transition-all"
                                        style={{ "--tw-ring-color": primary } as React.CSSProperties}
                                    />
                                    <p className="text-right text-xs text-gray-300 mt-1">{text.length}/80</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Brand colours palette */}
                        {brand?.colors && (
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Brand Colours</p>
                                <div className="flex gap-2 flex-wrap">
                                    {brand.colors.map((c, i) => (
                                        <div key={i} className="flex flex-col items-center gap-1">
                                            <div className="w-9 h-9 rounded-xl shadow-sm ring-1 ring-black/10"
                                                style={{ background: c }} />
                                            <span className="text-[9px] text-gray-400 font-mono">{c}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT — Layout, Photo, Download */}
                    <div className="bg-white rounded-2xl p-7 shadow-sm ring-1 ring-black/5 flex flex-col gap-6">

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
                                        <div className="flex flex-1 gap-1">
                                            {([0, 1, 2, 3, 4, 5] as Layout[]).map(l => (
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
                                    <p className="text-xs text-gray-400 mt-1.5">Style {layout + 1} of {LAYOUTS.length}</p>
                                </div>

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
                                            {brand.images.length > 1 && (
                                                <button onClick={randomImg}
                                                    className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:border-gray-400 transition-colors text-gray-400"
                                                    title="Random photo">
                                                    <Shuffle className="w-3.5 h-3.5" />
                                                </button>
                                            )}
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

                                {/* Dev toggle: danger zone */}
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <div className="relative w-8 h-4">
                                        <input type="checkbox" className="sr-only"
                                            checked={showDangerZone}
                                            onChange={e => setShowDangerZone(e.target.checked)} />
                                        <div className="w-8 h-4 rounded-full transition-colors"
                                            style={{ background: showDangerZone ? "#ef4444" : "#d1d5db" }} />
                                        <div className="absolute top-0.5 rounded-full w-3 h-3 bg-white shadow transition-transform"
                                            style={{ left: showDangerZone ? "calc(100% - 14px)" : 2 }} />
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                        Show safe zones
                                    </span>
                                </label>
                            </>
                        )}

                        {/* Download button */}
                        <div className="mt-auto space-y-2">
                            <button
                                onClick={brand ? download : () => router.push("/")}
                                disabled={isDownloading}
                                className="w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50 hover:opacity-90 active:scale-[0.98]"
                                style={{ background: primary, color: textOnPrimary }}>
                                {isDownloading
                                    ? <><RefreshCw className="w-4 h-4 animate-spin" /> Generating…</>
                                    : <><Download className="w-4 h-4" /> Download Banner (.png)</>}
                            </button>
                            <p className="text-center text-[11px] text-gray-400">
                                1584 × 396 px · LinkedIn optimised · Free · Under 8 MB
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
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
