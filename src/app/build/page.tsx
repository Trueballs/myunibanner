/* eslint-disable @next/next/no-img-element -- Assets are pre-sized at build time; banner export also needs native image elements. */
"use client";

import { AnimatePresence,motion } from "framer-motion";
import { Check,CheckCircle,Download,RefreshCw,Upload,X } from "lucide-react";
import { Suspense,useCallback,useEffect,useMemo,useRef,useState } from "react";

import BannerCanvas,{ type Layout } from "@/components/BannerCanvas";
import { readDraft, writeDraft, validateDraft, type BannerDraft } from "@/lib/banner-draft";
import Header from "@/components/Header";
import type { BrandData } from "@/lib/catalogue";
import { exportBanner,preparePhoto } from "@/lib/export-banner";
import { useRouter,useSearchParams } from "next/navigation";

/* ═══════════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════════ */
const W = 1584, H = 396;

const PHOTO = "#8fa3b8";
const THUMB_CONFIGS: { label: string; preview: (color: string, accent: string) => React.ReactNode }[] = [
    {
        label: "Split",
        preview: (c) => (
            <div className="w-full h-full flex overflow-hidden">
                <div style={{ width: "40%", background: PHOTO }} />
                <div style={{ flex: 1, background: c, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ width: "50%", height: "22%", background: "rgba(255,255,255,0.35)", borderRadius: 2 }} />
                </div>
            </div>
        ),
    },
    {
        label: "Immersive",
        preview: (c) => (
            <div className="w-full h-full overflow-hidden" style={{ position: "relative", background: PHOTO }}>
                <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to left, ${c}f0 20%, transparent 65%)` }} />
            </div>
        ),
    },
    {
        label: "Bold Stripe",
        preview: (c) => (
            <div className="w-full h-full overflow-hidden flex" style={{ background: PHOTO }}>
                <div style={{ flex: 1 }} />
                <div style={{ width: "38%", background: c, clipPath: "polygon(12px 0, 100% 0, 100% 100%, 0 100%)" }} />
            </div>
        ),
    },
    {
        label: "Centred Brand",
        preview: (c) => (
            <div className="w-full h-full flex items-center justify-center overflow-hidden" style={{ background: c }}>
                <div style={{ width: "46%", height: "30%", background: "rgba(255,255,255,0.35)", borderRadius: 2 }} />
            </div>
        ),
    },
    {
        label: "Corner Logo",
        preview: () => (
            <div className="w-full h-full overflow-hidden" style={{ position: "relative", background: PHOTO }}>
                <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.15)" }} />
                <div style={{ position: "absolute", right: "7%", bottom: "16%", width: "34%", height: "26%", background: "rgba(255,255,255,0.85)", borderRadius: 2 }} />
            </div>
        ),
    },
    {
        label: "Elegant Stripe",
        preview: (c) => (
            <div className="w-full h-full overflow-hidden flex" style={{ background: "white" }}>
                <div style={{ flex: 1, background: PHOTO }} />
                <div style={{ width: "32%", background: c, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ width: "55%", height: "22%", background: "rgba(255,255,255,0.35)", borderRadius: 1 }} />
                </div>
            </div>
        ),
    },
    {
        label: "Diagonal",
        preview: (c) => (
            <div className="w-full h-full overflow-hidden" style={{ position: "relative", background: PHOTO }}>
                <div style={{ position: "absolute", inset: 0, background: c, clipPath: "polygon(55% 0, 100% 0, 100% 100%, 42% 100%)" }} />
                <div style={{ position: "absolute", right: "9%", top: "40%", width: "30%", height: "20%", background: "rgba(255,255,255,0.35)", borderRadius: 1 }} />
            </div>
        ),
    },
    {
        label: "Centered Logo",
        preview: () => (
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

function BuilderContent() {
    const params = useSearchParams();
    const router = useRouter();
    const bannerRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [brand, setBrand] = useState<BrandData | null>(null);
    const [layout, setLayout] = useState<Layout>(0);
    const [imgIndex, setImgIndex] = useState(0);
    const [logoIndex, setLogoIndex] = useState(0);
    const [logoPos, setLogoPos] = useState<'top' | 'bottom' | 'center'>('bottom');
    const bgStyle = 'none' as const;
    const [tintIndex, setTintIndex] = useState(-1);
    const bgOpacity = 100;
    const [logoScale, setLogoScale] = useState(1.0);
    const [draftStatus, setDraftStatus] = useState('Loading draft…');
    const [resetBackup, setResetBackup] = useState<BannerDraft | null>(null);
    const saveQueue = useRef(Promise.resolve());
    const expandedPreview = useRef<HTMLDialogElement>(null);
    const draftKey = `${params.get('domain') || ''}:${params.get('campus') || ''}`;
    const [customImage, setCustomImage] = useState<string | null>(null);
    const applyDraft = useCallback((draft: BannerDraft, data: BrandData) => {
        setLayout(draft.layout);
        setImgIndex(Math.max(0, data.images.indexOf(draft.image || '')));
        setLogoIndex(Math.max(0, data.logos.findIndex(l => l.url === draft.logo)));
        setTintIndex(draft.tint ? data.colors.indexOf(draft.tint) : -1);
        setLogoScale(draft.logoScale); setLogoPos(draft.logoPos); setCustomImage(draft.customImage);
    }, []);

    const [scale, setScale] = useState(1);
    const [loading, setLoading] = useState(Boolean(params.get("domain")));
    const [error, setError] = useState("");
    const [imageProcessing, setImageProcessing] = useState(false);
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
        const observer = new ResizeObserver(updateScale);
        if (containerRef.current) observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const domain = params.get("domain");
        const campus = params.get("campus");
        if (!domain) return;

        let isMounted = true;
        const controller = new AbortController();
        let path = `/api/brand?q=${encodeURIComponent(domain)}`;
        if (campus) path += `&campus=${encodeURIComponent(campus)}`;

        fetch(path, { signal: controller.signal, cache: 'no-store' })
            .then(async r => {
                const data = await r.json();
                if (!r.ok) throw new Error(data.error || "We could not load this university. Please try again.");
                return data;
            })
            .then(async (data: BrandData) => {
                let saved: BannerDraft | null = null;
                try { saved = validateDraft(await readDraft(draftKey), data); }
                catch { /* Saving below will surface storage availability without blocking editing. */ }
                if (!isMounted) return;
                if (saved) applyDraft(saved, data);
                setBrand(data);
                setLoading(false);
            })
            .catch(err => {
                if (!isMounted) return;
                setError(err instanceof Error ? err.message : "We could not load this university.");
                setLoading(false);
            });

        return () => { isMounted = false; controller.abort(); };
    }, [params, draftKey, applyDraft]);


    const draft = useMemo<BannerDraft>(() => ({
        version: 1, layout,
        image: brand?.images[imgIndex] || null, logo: brand?.logos[logoIndex]?.url || null,
        tint: tintIndex >= 0 ? brand?.colors[tintIndex] || null : null,
        logoScale, logoPos, customImage,
    }), [layout, brand, imgIndex, logoIndex, tintIndex, logoScale, logoPos, customImage]);
    useEffect(() => {
        if (!brand) return;
        let current = true;
        // Queue writes so rapid typing cannot let an older save overwrite a newer edit.
        queueMicrotask(() => { if (current) setDraftStatus('Saving…'); });
        saveQueue.current = saveQueue.current.catch(() => {}).then(() => writeDraft(draftKey, draft));
        void saveQueue.current.then(() => { if (current) setDraftStatus('Saved on this device'); },
            () => { if (current) setDraftStatus('Could not save on this device. Keep this tab open.'); });
        return () => { current = false; };
    }, [brand, draftKey, draft]);

    const isUCL = params.get("domain") === "ucl.ac.uk";
    const availableLayouts = (isUCL ? [0, 1, 2, 3, 4, 5, 6, 7, 8] : [0, 1, 2, 3, 4, 5, 6, 7]) as Layout[];



    const handleDownload = async () => {
        if (!brand || !bannerRef.current) return;
        setIsDownloading(true);
        setError("");
        try {
            const blob = await exportBanner(bannerRef.current);
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `linkedin-banner-${brand.domain}.png`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            // Safari needs the object URL to remain available while the download starts.
            setTimeout(() => URL.revokeObjectURL(url), 60000);
            setShowDownloadPopup(true);
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : "Download failed. Please try again.");
        } finally {
            setIsDownloading(false);
        }
    };

    const primary = brand?.colors?.[0] ?? "#1e2d78";
    const bannerOptions = { layout, imgIndex, logoIndex,
        logoPos, bgStyle, tintIndex, bgOpacity, photoFilter: 'none', logoScale, customImage };

    return (
        <>
        <div className="min-h-screen bg-slate-50 flex flex-col items-center w-full overflow-x-clip">
            <Header showStartButton showBackButton activeBrand={brand} />

            <main className="w-full xl:w-[1280px] flex flex-col shrink-0 relative px-4 md:px-8 xl:px-12 py-4 md:py-6">
                <div className="max-w-screen-2xl mx-auto space-y-4 w-full mt-2 md:mt-4 mb-10 md:mb-12 xl:mb-16">

                    {/* ── BANNER PREVIEW ──────────────────────────── */}
                    <section aria-label="Banner preview" className="sticky top-[70px] md:static z-40 pt-4 -mt-4 bg-slate-50/80 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-2 mr-1">
                            <button type="button" onClick={() => expandedPreview.current?.showModal()} disabled={!brand} className="rounded-lg px-2 py-1 text-xs font-semibold text-blue-700 focus-visible:ring-2">Expand preview</button>
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
                                            <BannerCanvas brand={brand} {...bannerOptions} />
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

                    {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}{!brand && <button type="button" onClick={() => window.location.reload()} className="ml-3 font-bold underline">Retry</button>}</div>}
                    {/* ── CONTROLS ────────────────────────────────── */}
                    <fieldset disabled={isDownloading || imageProcessing} className="min-w-0 w-full bg-white rounded-2xl p-6 md:p-8 shadow-[0_15px_40px_rgba(0,0,0,0.03)] border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                        {brand ? (
                            <>
                                {/* Column 1 */}
                                <div className="space-y-8 flex flex-col">
                                    <div>
                                        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Layout Style</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {availableLayouts.map(l => (
                                                <button key={l}
                                                    aria-pressed={layout === l}
                                                    onClick={() => setLayout(l)}
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

                                    {(
                                        <div>
                                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Campus Images</label>
                                            <div className="flex gap-2 flex-wrap items-center">
                                                <label className="w-11 h-7 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all group active:scale-95">
                                                    <input
                                                        type="file"
                                                        accept="image/jpeg,image/png,image/webp,image/avif"
                                                        aria-label="Upload your campus photo"
                                                        disabled={imageProcessing || isDownloading}
                                                        className="hidden"
                                                        onChange={async (event) => {
                                                            const file = event.target.files?.[0];
                                                            event.target.value = "";
                                                            if (!file) return;
                                                            setImageProcessing(true); setError("");
                                                            try {
                                                                setCustomImage(await preparePhoto(file));
                                                                setImgIndex(-1);
                                                            } catch (cause) {
                                                                setError(cause instanceof Error ? cause.message : "This image could not be opened.");
                                                            } finally { setImageProcessing(false); }
                                                        }}
                                                    />
                                                    <Upload className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
                                                </label>

                                                {customImage && (
                                                    <div className="relative group" style={{ width: 44, height: 28 }}>
                                                        <button
                                                            aria-label="Select uploaded campus photo" onClick={() => setImgIndex(-1)}
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
                                                        <button
                                                            aria-label={`Select campus photo ${i + 1}`} aria-pressed={!customImage && imgIndex === i}
                                                            onClick={() => { setImgIndex(i); setCustomImage(null); }}
                                                            className="w-full h-full rounded-lg overflow-hidden transition-all hover:scale-110 active:scale-95"
                                                            style={{ outline: imgIndex === i ? `3px solid #2563EB` : '2px solid transparent', outlineOffset: 2 }}>
                                                            <img src={brand.thumbnails[img] || img} alt="" width={160} height={100} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                            {brand.images.length === 0 && <p className="mt-2 text-xs text-slate-500">No campus photos yet. Upload your own, or use the solid-colour layout.</p>}
                                            {imageProcessing && <p role="status" className="mt-2 text-sm text-slate-500">Preparing photo…</p>}
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
                                                        <button key={i} aria-label={`Use background colour ${c}`} aria-pressed={tintIndex === i} onClick={() => setTintIndex(tintIndex === i ? -1 : i)} className="w-10 h-10 rounded-full transition-all hover:scale-110 active:scale-95 relative" style={{ backgroundColor: c, boxShadow: tintIndex === i ? `0 0 0 3px #fbbf24, 0 0 0 5px #f59e0b, 0 4px 12px rgba(245, 158, 11, 0.4)` : '0 2px 4px rgba(0,0,0,0.05)' }} />
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
                                                <button key={i} aria-label={`Use logo variant ${i + 1}`} aria-pressed={logoIndex === i} onClick={() => setLogoIndex(i)} className="w-14 h-14 rounded-lg border-2 flex items-center justify-center p-1.5 transition-all hover:shadow-md relative overflow-hidden" style={{ borderColor: logoIndex === i ? primary : "#e5e7eb", background: logo.isLight ? "#334155" : "#f1f5f9" }}>
                                                    <img src={logo.thumbnail || logo.url} alt="" className="w-full h-full object-contain relative z-10" style={{ filter: 'none' }} loading="lazy" decoding="async" />
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
                                                const active = Math.abs(logoScale - s.val) < 0.01;
                                                return (
                                                    <button key={s.label}
                                                        onClick={() => setLogoScale(s.val)}
                                                        aria-pressed={active}
                                                        className="flex-1 py-2.5 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest transition-all"
                                                        style={{
                                                            borderColor: active ? primary : "#f3f4f6",
                                                            background: active ? `${primary}10` : "#f9fafb",
                                                            color: active ? primary : "#9ca3af",
                                                            cursor: "pointer",
                                                        }}>
                                                        {s.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-xs text-slate-500">
                                        <p role="status">{draftStatus}</p>
                                        <div className="flex gap-4">
                                            <button type="button" className="underline" onClick={() => {
                                                setResetBackup(draft);
                                                applyDraft({ ...draft, layout: 0, image: null, logo: null, tint: null, logoScale: 1, logoPos: 'bottom', customImage: null }, brand);
                                            }}>Reset design</button>
                                            {resetBackup && <button type="button" className="font-semibold text-blue-700 underline" onClick={() => { applyDraft(resetBackup, brand); setResetBackup(null); }}>Undo reset</button>}
                                        </div>
                                    </div>
                                    <div className="mt-auto pt-6 space-y-2">
                                        <button onClick={brand ? handleDownload : () => router.push("/")} disabled={isDownloading || imageProcessing} className="w-full py-5 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-500/20 disabled:opacity-50 hover:bg-blue-700 active:scale-95" style={{ background: '#2563EB', color: '#ffffff' }}>
                                            {isDownloading ? <><RefreshCw className="w-5 h-5 animate-spin" /> Processing...</> : <><Download className="w-5 h-5" /> Download Banner</>}
                                        </button>
                                        <p className="text-center text-[11px] text-gray-400">LinkedIn optimised · Sharp 1584x396 PNG</p>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="md:col-span-2 py-20 text-center text-gray-400 italic">
                                <button type="button" onClick={() => window.dispatchEvent(new CustomEvent("lnbg_open_onboarding"))} className="font-semibold text-blue-600 underline">Choose your university</button>
                            </div>
                        )}
                    </fieldset>
                </div>
            </main>
        </div>

        <dialog ref={expandedPreview} aria-label="Expanded banner preview" className="fixed inset-0 m-auto w-[96vw] max-w-[1600px] rounded-2xl bg-white p-4 shadow-xl backdrop:bg-black/60">
            <div className="mb-4 flex items-center justify-between gap-4"><div><h2 className="font-semibold">Your banner, up close</h2><p className="text-sm text-slate-500">Swipe sideways to inspect the details on a small screen.</p></div><button type="button" onClick={() => expandedPreview.current?.close()} className="rounded-lg border px-4 py-2">Close preview</button></div>
            <div className="overflow-x-auto rounded-lg"><div style={{ width: W, height: H }}>{brand && <BannerCanvas brand={brand} {...bannerOptions} />}</div></div>
        </dialog>
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
                                    Banner ready!
                                </h3>
                                <p className="text-sm text-gray-500 font-medium">
                                    Your download is ready. Check your browser downloads, or save the image if your browser opens a preview.
                                </p>
                            </div>
                            <button aria-label="Close download instructions" onClick={() => setShowDownloadPopup(false)} className="p-2 text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors">
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
                                        <p className="text-sm text-gray-500 mt-0.5">Select your downloaded image, position it, and click &quot;Apply&quot;.</p>
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

function CampusBuilder() {
    const params = useSearchParams();
    return <BuilderContent key={`${params.get("domain") || ""}:${params.get("campus") || ""}`} />;
}

export default function BuildPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5] text-gray-400">
                Loading…
            </div>
        }>
            <CampusBuilder />
        </Suspense>
    );
}
