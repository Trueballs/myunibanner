/* eslint-disable @next/next/no-img-element -- Assets are pre-sized at build time; banner export also needs native image elements. */
"use client";
import { autoPanelColor } from "@/lib/logo-contrast";
import type { BrandData } from "@/lib/catalogue";
import { useState } from "react";

import { logoDisplaySize, type LogoMetrics } from "@/lib/logo-size";

export type Layout = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

/* ═══════════════════════════════════════════════════════════════
   LINKEDIN CANVAS CONSTANTS
   Absolute: 1584 × 396 px  (4:1 ratio)
   Danger Zone (avatar): x 0–568, y 132–396  →  keep EMPTY
   Safe Zone: centred 1128 × 300 px  (x 228–1356, y 48–348)
   Mobile margins: outer 64 px each side are cropped on mobile
═══════════════════════════════════════════════════════════════ */
const W = 1584;
const H = 396;




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
    src, hasBg, panelColor, h = 100, maxW = 280, scale = 1, align = "center", metrics, largeMaxW,
}: {
    src: string; largeMaxW?: number; metrics?: LogoMetrics; hasBg?: boolean; isLight?: boolean; panelColor: string; h?: number | "auto"; maxW?: number; brandColors?: string[]; scale?: number; align?: "center" | "flex-start" | "flex-end";
}) {
    const [failedSrc, setFailedSrc] = useState<string | null>(null);
    if (!src) return null;
    const err = failedSrc === src;
    const size = logoDisplaySize(metrics, maxW, h === "auto" ? 140 : h, scale, largeMaxW);

    return (
        <div data-logo-panel={panelColor} data-asset-error={err ? true : undefined} style={{
            height: size.height,
            width: size.width,
            flexShrink: 0,
            display: "flex",
            alignItems: align,
            justifyContent: "center",
            position: "relative"
        }}>
            <img src={src} alt="University logo"
                crossOrigin="anonymous"
                style={{
                    height: "100%", width: "100%",
                    objectFit: "contain",
                    objectPosition: align === "center" ? "center" : `center ${align === "flex-start" ? "top" : "bottom"}`,
                    display: err ? "none" : "block",
                    mixBlendMode: "normal",
                    filter: !hasBg ? "drop-shadow(0px 2px 2px rgba(0,0,0,0.15))" : "none",
                }}
                onError={() => setFailedSrc(src)} />
            {err && <span style={{ color: contrastText(panelColor), fontSize: 20 }}>Logo unavailable — choose another variant</span>}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   FONT HELPER
═══════════════════════════════════════════════════════════════ */

type LayoutProps = {
    brand: BrandData;
    img?: string;
    logoSrc: string;
    logoHasBg: boolean;
    logoIsLight?: boolean;
    primary: string;
    secondary: string;
    logoPos?: 'top' | 'bottom' | 'center';
    bgStyle?: 'none' | 'brand';
    tintIndex?: number;
    bgOpacity?: number;
    photoFilter?: string;
    logoScale?: number;
};

/* ═══════════════════════════════════════════════════════════════
   LAYOUT 0 — "SPLIT"
═══════════════════════════════════════════════════════════════ */
function L0({ logoScale = 1.0, brand, logoSrc, logoHasBg, logoIsLight, primary, img, photoFilter = "none" }: LayoutProps) {
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
                <SmartLogo metrics={brand.logos.find(logo => logo.url === logoSrc)} src={logoSrc} hasBg={logoHasBg} isLight={logoIsLight} panelColor={primary} h={140} maxW={380} brandColors={brand.colors} scale={logoScale} />
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   LAYOUT 1 — "IMMERSIVE"
═══════════════════════════════════════════════════════════════ */
function L1({ logoScale = 1.0, brand, img, logoSrc, logoHasBg, logoIsLight, primary, photoFilter = "none", tintIndex }: LayoutProps) {

    return (
        <div className="absolute inset-0 overflow-hidden bg-black">
            {img ? (
                <img src={img} alt="" crossOrigin="anonymous" className="absolute inset-0 w-full h-full object-cover" style={{ filter: photoFilter }} />
            ) : (
                <div className="absolute inset-0" style={{ background: primary }} />
            )}
            <div className="absolute inset-y-0 right-0 w-[550px] z-1" style={{ background: primary, opacity: tintIndex === -1 ? 1 : 0.9 }} />
            <div className="absolute inset-y-0 right-0 w-[550px] flex flex-col items-center justify-center p-12 z-10 overflow-hidden">
                <div className="flex flex-col items-center gap-8 w-full">
                    <SmartLogo largeMaxW={454} metrics={brand.logos.find(logo => logo.url === logoSrc)} src={logoSrc} hasBg={logoHasBg} isLight={logoIsLight} panelColor={primary} h={140} maxW={380} brandColors={brand.colors} scale={logoScale} />
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   LAYOUT 2 — "BOLD STRIPE"
═══════════════════════════════════════════════════════════════ */
function L2({ logoScale = 1.0, brand, img, logoSrc, logoHasBg, logoIsLight, primary, photoFilter = "none" }: LayoutProps) {
    const PANEL_W = 580;

    return (
        <div className="absolute inset-0 overflow-hidden bg-black">
            {img && (
                <img src={img} alt="" crossOrigin="anonymous" className="absolute inset-0 w-full h-full object-cover" style={{ filter: photoFilter }} />
            )}
            <div className="absolute inset-y-0 right-0 flex flex-col items-center justify-center gap-8 overflow-hidden"
                style={{ width: PANEL_W, background: primary, zIndex: 10, padding: "48px", clipPath: 'polygon(60px 0, 100% 0, 100% 100%, 0 100%)' }}>
                <SmartLogo largeMaxW={460} metrics={brand.logos.find(logo => logo.url === logoSrc)} src={logoSrc} hasBg={logoHasBg} isLight={logoIsLight} panelColor={primary} h={140} maxW={380} brandColors={brand.colors} scale={logoScale} />
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   LAYOUT 3 — "CENTRED BRAND"
═══════════════════════════════════════════════════════════════ */
function L3({ logoScale = 1.0, brand, logoSrc, logoHasBg, logoIsLight, primary }: LayoutProps) {

    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center overflow-hidden" style={{ background: primary }}>
            <div className="flex flex-col items-center gap-8" style={{ width: 660 }}>
                <SmartLogo metrics={brand.logos.find(logo => logo.url === logoSrc)} src={logoSrc} hasBg={logoHasBg} isLight={logoIsLight} panelColor={primary} h={140} maxW={380} brandColors={brand.colors} scale={logoScale} />
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   LAYOUT 4 — "GLASS PANELS"
═══════════════════════════════════════════════════════════════ */
function L4({ logoScale = 1.0, brand, logoSrc, logoHasBg, logoIsLight, logoPos = 'bottom', img, primary, tintIndex, photoFilter = "none" }: LayoutProps) {

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
                    background: tintIndex === -1 ? primary : undefined,
                    padding: tintIndex === -1 ? 16 : 0,
                    right: 40,
                    top: logoPos === 'center' ? '50%' : (logoPos === 'top' ? 40 : 'auto'),
                    bottom: logoPos === 'bottom' ? 40 : 'auto',
                    transform: logoPos === 'center' ? 'translateY(-50%)' : 'none'
                }}>
                {logoSrc && (
                    <SmartLogo metrics={brand.logos.find(logo => logo.url === logoSrc)} src={logoSrc} hasBg={logoHasBg} isLight={logoIsLight} panelColor={tintIndex === -1 ? primary : "#000000"} h={150} maxW={400} brandColors={brand.colors} scale={logoScale} align={logoPos === "top" ? "flex-start" : (logoPos === "center" ? "center" : "flex-end")} />
                )}
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   LAYOUT 5 — "ELEGANT STRIPE"
═══════════════════════════════════════════════════════════════ */
function L5({ logoScale = 1.0, brand, img, logoSrc, logoHasBg, logoIsLight, primary, photoFilter = "none" }: LayoutProps) {

    return (
        <div className="absolute inset-0 overflow-hidden flex bg-white">
            <div className="flex-1 relative overflow-hidden bg-black">
                {img && <img src={img} alt="" crossOrigin="anonymous" className="absolute inset-0 w-full h-full object-cover" style={{ filter: photoFilter }} />}
            </div>
            <div className="w-[500px] flex flex-col items-center justify-center p-12 text-center gap-10 z-10 overflow-hidden" style={{ background: primary }}>
                <SmartLogo largeMaxW={404} metrics={brand.logos.find(logo => logo.url === logoSrc)} src={logoSrc} hasBg={logoHasBg} isLight={logoIsLight} panelColor={primary} h={140} maxW={380} brandColors={brand.colors} scale={logoScale} />
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   LAYOUT 6 — "DIAGONAL GRADIENT"
═══════════════════════════════════════════════════════════════ */
function L6({ logoScale = 1.0, brand, img, logoSrc, logoHasBg, logoIsLight, primary, photoFilter = "none" }: LayoutProps) {

    return (
        <div className="absolute inset-0 overflow-hidden bg-white">
            {img && <img src={img} alt="" crossOrigin="anonymous" className="absolute inset-0 w-3/5 h-full object-cover" style={{ filter: photoFilter }} />}
            <div className="absolute top-0 bottom-0 right-0 flex flex-col items-center justify-center gap-8 p-16 overflow-hidden"
                style={{ width: "55%", background: primary, zIndex: 10, clipPath: 'polygon(120px 0, 100% 0, 100% 100%, 0 100%)' }}>
                <SmartLogo metrics={brand.logos.find(logo => logo.url === logoSrc)} src={logoSrc} hasBg={logoHasBg} isLight={logoIsLight} panelColor={primary} h={120} maxW={360} brandColors={brand.colors} scale={logoScale} />
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   LAYOUT 7 — "CENTERED LOGO"
═══════════════════════════════════════════════════════════════ */
function L7({ logoScale = 1.0, brand, img, logoSrc, logoHasBg, logoIsLight, primary, tintIndex, photoFilter = "none" }: LayoutProps) {
    return (
        <div className="absolute inset-0 overflow-hidden flex items-center justify-center bg-black">
            {img && (
                <div className="absolute inset-0">
                    <img src={img} alt="" crossOrigin="anonymous" className="absolute inset-0 w-full h-full object-cover" style={{ filter: photoFilter }} />
                    <div className="absolute inset-0 bg-black/10" />
                </div>
            )}
            <div className="relative z-10 flex flex-col items-center justify-center" style={{ background: tintIndex === -1 ? primary : undefined, padding: tintIndex === -1 ? 16 : 0 }}>
                <SmartLogo metrics={brand.logos.find(logo => logo.url === logoSrc)} src={logoSrc} hasBg={logoHasBg} isLight={logoIsLight} panelColor={tintIndex === -1 ? primary : "#000000"} h={180} maxW={400} brandColors={brand.colors} scale={logoScale} />
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

function L8({ logoScale = 1.0, brand, logoSrc, logoHasBg, logoIsLight, img, photoFilter = "none", tintIndex = 0, primary }: LayoutProps) {
    const effectiveTint = tintIndex < 0 ? Math.max(0, brand.colors.indexOf(primary)) : tintIndex;
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
                <SmartLogo largeMaxW={LOGO_W - 16} metrics={brand.logos.find(logo => logo.url === logoSrc)} src={logoSrc} hasBg={logoHasBg} isLight={logoIsLight} panelColor={panelColor} h={200} maxW={360} brandColors={brand.colors} scale={logoScale} />
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   LAYOUT 9 — "DIAGONAL WHITE"
   Photo on the left, diagonal cut into a clean white panel on the
   right holding the logo (e.g. BI navy mark on white).
═══════════════════════════════════════════════════════════════ */
function L9({ logoScale = 1.0, brand, img, logoSrc, logoHasBg, logoIsLight, photoFilter = "none" }: LayoutProps) {

    return (
        <div className="absolute inset-0 overflow-hidden bg-white">
            {img && <img src={img} alt="" crossOrigin="anonymous" className="absolute inset-0 w-3/5 h-full object-cover" style={{ filter: photoFilter }} />}
            <div className="absolute top-0 bottom-0 right-0 flex flex-col items-center justify-center gap-8 p-16 overflow-hidden"
                style={{ width: "55%", background: "#ffffff", zIndex: 10, clipPath: 'polygon(120px 0, 100% 0, 100% 100%, 0 100%)' }}>
                <SmartLogo metrics={brand.logos.find(logo => logo.url === logoSrc)} src={logoSrc} hasBg={logoHasBg} isLight={logoIsLight} panelColor="#ffffff" h={120} maxW={360} brandColors={brand.colors} scale={logoScale} />
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   BANNER WRAPPER — routes to the right layout
═══════════════════════════════════════════════════════════════ */
export default function BannerCanvas({
    brand, layout, imgIndex, logoIndex,
    logoPos = 'bottom', bgStyle = 'none', tintIndex = 0, bgOpacity = 100, photoFilter = "none", logoScale = 1.0, customImage = null,
}: {
    brand: BrandData; layout: Layout; imgIndex: number; logoIndex: number;
    logoPos?: 'top' | 'bottom' | 'center';
    bgStyle?: 'none' | 'brand';
    tintIndex?: number;
    bgOpacity?: number;
    photoFilter?: string;
    logoScale?: number;
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
    const primary = tintIndex === -1
        ? autoPanelColor(activeLogo, brand.colors)
        : brand.colors[tintIndex % brand.colors.length];
    const secondary = brand.colors.find(c => c !== primary) || contrastText(primary);

    const p = { brand, img, logoSrc, logoHasBg, logoIsLight, primary, secondary, logoPos, bgStyle, tintIndex, bgOpacity, photoFilter, logoScale };

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
            {layout === 9 && <L9 {...p} />}

            <GrainOverlay />
            <FrameOverlay />
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   LAYOUT THUMBNAILS
═══════════════════════════════════════════════════════════════ */
