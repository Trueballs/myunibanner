"use client";

import { useState, useRef, useEffect } from "react";
import { Download, X, Mail, Heart, Search, Paintbrush, Plus, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { searchUniversities, type University } from "@/data/universities";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<University[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      )
        setShowDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    setActiveIndex(-1);
    setSelectedDomain(null);
    if (val.trim().length > 0) {
      const results = searchUniversities(val, 7);
      setSuggestions(results);
      setShowDropdown(results.length > 0);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown) {
      if (e.key === "Enter") handleGetBanner();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0) selectUniversity(suggestions[activeIndex]);
      else handleGetBanner();
    } else if (e.key === "Escape") setShowDropdown(false);
  };

  const selectUniversity = (uni: University) => {
    setQuery(uni.name);
    setSelectedDomain(uni.domain);
    setShowDropdown(false);
    setActiveIndex(-1);
    setSuggestions([]);
  };

  const handleGetBanner = () => {
    if (!query.trim()) return;
    setLoading(true);
    // If they explicitly clicked a dropdown item, we use that domain.
    // Otherwise we just pass the query string and let the build page figure it out.
    if (selectedDomain) {
      router.push(`/build?domain=${encodeURIComponent(selectedDomain)}`);
    } else {
      router.push(`/build?domain=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#f2f2f2] font-sans flex justify-center w-full px-4 md:px-8 xl:px-12 py-8 md:py-12 gap-6 xl:gap-8 box-border overflow-x-hidden">


      {/* CENTRAL COLUMN */}
      <main className="w-full xl:w-[60%] flex flex-col shrink-0 relative bg-[#f2f2f2]">

        {/* ─── TOP NAVIGATION ─── */}
        <header className="w-full px-4 md:px-8 z-50 relative -mt-8 md:-mt-12">
          <div className="w-full bg-[#1e2d78] rounded-b-3xl px-6 md:px-8 py-4 md:py-5 flex items-center justify-between shadow-lg">
            <span className="text-white font-black text-2xl md:text-3xl lg:text-[32px] tracking-[0.2em] leading-none mb-[-2px]">LNBG</span>

            {/* Tag (Moved from Hero) */}
            <div className="hidden sm:inline-flex items-center gap-1.5 md:gap-2 bg-white text-[#1e2d78] shadow-sm text-[9px] md:text-[11px] uppercase font-black px-3 md:px-5 py-2 md:py-2.5 rounded-full flex-shrink-0">
              <span className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-green-500 animate-pulse" />
              FREE · NO ACCOUNT · INSTANT DOWNLOAD
            </div>
          </div>
        </header>

        {/* ─── HERO SECTION ─── */}
        <section className="relative z-20 bg-[#f2f2f2]">

          <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pt-8 md:pt-12 xl:pt-16 pb-10 md:pb-14">

            {/* TWO-COLUMN on md+, single column on mobile */}
            <div className="flex flex-col md:flex-row md:items-center gap-0 md:gap-6 lg:gap-10">

              {/* ── LEFT COLUMN ── */}
              <motion.div
                className="flex flex-col items-start w-full md:w-[54%] shrink-0 pb-8 md:pb-0"
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                <h1 className="font-black leading-[0.88] tracking-[-0.04em] text-[#1e2d78] uppercase text-left w-full
                  text-[clamp(36px,8vw,76px)] mb-4 md:mb-6">
                  Stop looking like every other graduate.
                </h1>

                <p className="text-[14px] sm:text-[16px] md:text-[17px] text-gray-500 font-medium text-left max-w-[420px] mb-5 md:mb-6 leading-relaxed">
                  Get your custom LinkedIn banner in seconds.
                </p>

                <div className="w-full max-w-[520px] relative flex flex-col">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center bg-white rounded-3xl sm:rounded-full shadow-[0_8px_32px_rgba(30,45,120,0.1)] ring-1 ring-[#1e2d78]/10 p-1.5 focus-within:ring-2 focus-within:ring-[#1e2d78]/30 transition-all duration-300 relative z-20">
                    <div className="flex items-center flex-1 pl-4 sm:pl-5 py-3.5 sm:py-0">
                      <Search className="w-4 h-4 sm:w-5 sm:h-5 text-[#1e2d78] mr-3 flex-shrink-0" />
                      <input
                        ref={inputRef}
                        value={query}
                        onChange={(e) => handleQueryChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={() => query.trim() && suggestions.length > 0 && setShowDropdown(true)}
                        placeholder="Search for your university..."
                        className="flex-1 bg-transparent text-gray-900 text-[14px] sm:text-[15px] outline-none placeholder:text-gray-400 font-semibold w-full"
                      />
                    </div>
                    <button
                      onClick={handleGetBanner}
                      disabled={loading || !query.trim()}
                      className="px-5 py-3.5 sm:py-3 bg-[#1e2d78] text-white font-black text-[11px] uppercase tracking-widest rounded-2xl sm:rounded-full hover:bg-[#121c54] active:scale-95 transition-all duration-300 disabled:opacity-40 flex-shrink-0 shadow-md w-full sm:w-auto"
                    >
                      {loading ? "..." : "GET MY BANNER"}
                    </button>
                  </div>

                  <AnimatePresence>
                    {showDropdown && suggestions.length > 0 && (
                      <motion.div
                        ref={dropdownRef}
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.12 }}
                        className="absolute top-full text-left left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden"
                      >
                        {suggestions.map((uni, i) => (
                          <button
                            key={uni.domain}
                            onMouseDown={(e) => { e.preventDefault(); selectUniversity(uni); }}
                            className={cn("w-full flex items-center gap-3 px-4 py-3 text-left transition-colors", i === activeIndex ? "bg-blue-50" : "hover:bg-gray-50")}
                          >
                            <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                              <img
                                src={`/api/logo?domain=${uni.domain}`}
                                alt=""
                                className="w-6 h-6 object-contain"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = "none";
                                  (e.target as HTMLImageElement).parentElement!.innerHTML = `<span style="font-size:13px;font-weight:800;color:#94a3b8">${uni.name.charAt(0)}</span>`;
                                }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">{uni.name}</p>
                              <p className="text-xs text-gray-400">{uni.domain}</p>
                            </div>
                            {uni.short && <span className="text-xs text-gray-300 flex-shrink-0">{uni.short}</span>}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <p className="text-gray-400 text-[11px] font-semibold mt-3">
                  Takes 5 seconds. No account required.
                </p>
              </motion.div>

              {/* ── RIGHT COLUMN: Before / After Cards ── */}
              {/* On mobile: centered, stacked overlap. On md+: absolute-positioned in fixed-height container */}
              <div className="w-full md:w-[46%] shrink-0">

                {/* MOBILE layout (< md): inline stacked cards, centered */}
                <div className="flex md:hidden justify-center items-center pt-4 pb-6">
                  <div className="relative" style={{ width: 300, height: 280 }}>
                    {/* BEFORE — behind and rotated left */}
                    <motion.div
                      className="absolute z-10"
                      style={{ top: 24, left: 0 }}
                      initial={{ opacity: 0, x: -30, rotate: -8 }}
                      animate={{ opacity: 1, x: 0, rotate: -5 }}
                      transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <div className="absolute -top-7 left-2 z-40 inline-flex items-center gap-1.5 bg-[#FFD1D4] text-[10px] uppercase font-black px-3 py-1.5 rounded-full shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FF4D54]" />
                        <span className="text-[#FF4D54] leading-none tracking-wider">Before</span>
                      </div>
                      <div className="w-[165px] rounded-[1.25rem] bg-white shadow-[0_6px_24px_rgba(0,0,0,0.09)] flex flex-col border border-gray-100/80 overflow-hidden">
                        <div className="h-[60px] relative flex-shrink-0" style={{ background: "linear-gradient(135deg,#b0bec5,#cfd8dc)" }}>
                          <div className="absolute left-3 bottom-0 translate-y-1/2 w-[38px] h-[38px] rounded-full bg-white p-[2px] shadow-sm z-10">
                            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face" className="w-full h-full rounded-full object-cover" alt="Profile" />
                          </div>
                        </div>
                        <div className="pt-6 px-3 pb-3 text-left flex flex-col">
                          <p className="font-bold text-gray-900 text-[12px] leading-tight">Oliver Smith <span className="font-normal text-gray-400 text-[10px]">· 1st</span></p>
                          <p className="text-gray-300 text-[10px] mt-0.5">--</p>
                          <p className="text-gray-400 text-[9px] mt-1.5">United Kingdom · <span className="text-[#0A66C2] font-semibold">Contact info</span></p>
                          <p className="text-gray-400 text-[9px] mt-0.5">0 connections</p>
                          <div className="mt-2.5">
                            <span className="px-3 py-1 bg-[#0A66C2] text-white text-[9px] rounded-full font-semibold">✈ Message</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* AFTER — front and rotated right */}
                    <motion.div
                      className="absolute z-20"
                      style={{ top: 0, right: 0 }}
                      initial={{ opacity: 0, x: 30, rotate: 6 }}
                      animate={{ opacity: 1, x: 0, rotate: 3 }}
                      transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <div className="absolute -top-7 left-2 z-40 inline-flex items-center gap-1.5 bg-[#C5E8D3] text-[10px] uppercase font-black px-3 py-1.5 rounded-full shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#34A853]" />
                        <span className="text-[#34A853] leading-none tracking-wider">After</span>
                      </div>
                      <div className="w-[165px] rounded-[1.25rem] bg-white ring-1 ring-black/[0.07] flex flex-col overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,0.16)]">
                        <div className="h-[60px] relative flex-shrink-0" style={{ background: "#1d4696" }}>
                          <div className="absolute inset-0 flex">
                            <div className="w-1/2 h-full relative overflow-hidden">
                              <img src="/henley-building.jpg" alt="Henley" className="absolute inset-0 w-full h-full object-cover" />
                            </div>
                            <div className="w-1/2 h-full flex items-center justify-end pr-2" style={{ background: "#1d4696" }}>
                              <div className="text-right">
                                <p className="text-white font-extrabold text-[9px] leading-tight">Henley</p>
                                <p className="text-white font-bold text-[7px] mt-0.5">Business School</p>
                                <p className="text-blue-200 text-[5px] tracking-widest mt-0.5 uppercase">UNIV. OF READING</p>
                              </div>
                            </div>
                          </div>
                          <div className="absolute top-0 bottom-0 left-1/2 w-[2px]" style={{ background: "#c8a800" }} />
                          <div className="absolute left-3 bottom-0 translate-y-1/2 w-[38px] h-[38px] rounded-full bg-white p-[2px] shadow-md z-20">
                            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face" className="w-full h-full rounded-full object-cover" alt="Profile" />
                          </div>
                        </div>
                        <div className="pt-6 px-3 pb-3 text-left flex flex-col">
                          <div className="flex items-center gap-1 flex-wrap">
                            <p className="font-bold text-gray-900 text-[12px] leading-tight">Oliver Smith</p>
                            <div className="w-2.5 h-2.5 rounded-full bg-[#0A66C2] flex items-center justify-center flex-shrink-0">
                              <svg className="w-1.5 h-1.5 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" /></svg>
                            </div>
                            <span className="font-normal text-gray-400 text-[10px]">· 1st</span>
                          </div>
                          <p className="text-gray-600 text-[10px] mt-0.5 leading-snug font-medium">MBA Student at Henley Business School</p>
                          <p className="text-gray-400 text-[9px] mt-1.5">United Kingdom · <span className="text-[#0A66C2] font-semibold">Contact info</span></p>
                          <p className="text-gray-400 text-[9px] mt-0.5">500+ connections</p>
                          <div className="flex gap-1.5 mt-2.5">
                            <span className="px-3 py-1 bg-[#0A66C2] text-white text-[9px] rounded-full font-bold">✈ Message</span>
                            <span className="px-3 py-1 border border-gray-200 text-gray-500 text-[9px] rounded-full font-bold">More</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>

                {/* DESKTOP/TABLET layout (md+): absolute positioned in fixed-height container */}
                <div className="hidden md:block relative pr-6 lg:pr-10" style={{ height: 400 }}>

                  {/* BEFORE card */}
                  <motion.div
                    className="absolute left-0 z-10"
                    style={{ top: "50%", y: "-50%" }}
                    initial={{ opacity: 0, x: -50, rotate: -8 }}
                    animate={{ opacity: 1, x: 0, rotate: -5 }}
                    transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="absolute -top-8 left-3 z-40 inline-flex items-center gap-2 bg-[#FFD1D4] text-[11px] uppercase font-black px-4 py-2 rounded-full shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-[#FF4D54]" />
                      <span className="text-[#FF4D54] leading-none tracking-wider">Before</span>
                    </div>
                    <div className="w-[200px] lg:w-[230px] rounded-[1.5rem] bg-white shadow-[0_8px_40px_rgba(0,0,0,0.1)] flex flex-col border border-gray-100/80 overflow-hidden">
                      <div className="h-[72px] lg:h-[80px] relative flex-shrink-0" style={{ background: "linear-gradient(135deg,#b0bec5,#cfd8dc)" }}>
                        <div className="absolute left-4 bottom-0 translate-y-1/2 w-[44px] h-[44px] rounded-full bg-white p-[3px] shadow-sm z-10">
                          <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face" className="w-full h-full rounded-full object-cover" alt="Profile" />
                        </div>
                      </div>
                      <div className="pt-7 px-4 pb-4 text-left flex flex-col flex-1">
                        <p className="font-bold text-gray-900 text-[13px] leading-tight flex items-center gap-1">
                          Oliver Smith <span className="font-normal text-gray-400 text-[11px]">· 1st</span>
                        </p>
                        <p className="text-gray-300 text-[11px] mt-1">--</p>
                        <p className="text-gray-400 text-[10px] mt-2">United Kingdom · <span className="text-[#0A66C2] font-semibold">Contact info</span></p>
                        <p className="text-gray-400 text-[10px] mt-0.5">0 connections</p>
                        <div className="mt-3">
                          <span className="px-3.5 py-1.5 bg-[#0A66C2] text-white text-[10px] rounded-full font-semibold">✈ Message</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* AFTER card */}
                  <motion.div
                    className="absolute right-0 z-20"
                    style={{ top: "50%", y: "-48%" }}
                    initial={{ opacity: 0, x: 50, rotate: 8 }}
                    animate={{ opacity: 1, x: 0, rotate: 3 }}
                    transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="absolute -top-8 left-3 z-40 inline-flex items-center gap-2 bg-[#C5E8D3] text-[11px] uppercase font-black px-4 py-2 rounded-full shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-[#34A853]" />
                      <span className="text-[#34A853] leading-none tracking-wider">After</span>
                    </div>
                    <div className="w-[200px] lg:w-[240px] rounded-[1.5rem] bg-white ring-1 ring-black/[0.07] flex flex-col overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.18)]">
                      <div className="h-[72px] lg:h-[80px] relative flex-shrink-0" style={{ background: "#1d4696" }}>
                        <div className="absolute inset-0 flex">
                          <div className="w-1/2 h-full relative overflow-hidden">
                            <img src="/henley-building.jpg" alt="Henley" className="absolute inset-0 w-full h-full object-cover" />
                          </div>
                          <div className="w-1/2 h-full flex items-center justify-end pr-3" style={{ background: "#1d4696" }}>
                            <div className="text-right">
                              <p className="text-white font-extrabold text-[10px] leading-tight">Henley</p>
                              <p className="text-white font-bold text-[8px] mt-0.5">Business School</p>
                              <p className="text-blue-200 text-[6px] tracking-widest mt-1 uppercase">UNIV. OF READING</p>
                            </div>
                          </div>
                        </div>
                        <div className="absolute top-0 bottom-0 left-1/2 w-[2px]" style={{ background: "#c8a800" }} />
                        <div className="absolute left-4 bottom-0 translate-y-1/2 w-[44px] h-[44px] rounded-full bg-white p-[3px] shadow-md z-20">
                          <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face" className="w-full h-full rounded-full object-cover" alt="Profile" />
                        </div>
                      </div>
                      <div className="pt-7 px-4 pb-4 text-left flex flex-col flex-1">
                        <div className="flex items-center gap-1 flex-wrap">
                          <p className="font-bold text-gray-900 text-[13px] leading-tight">Oliver Smith</p>
                          <div className="w-3 h-3 rounded-full bg-[#0A66C2] flex items-center justify-center flex-shrink-0">
                            <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" /></svg>
                          </div>
                          <span className="font-normal text-gray-400 text-[11px]">· 1st</span>
                        </div>
                        <p className="text-gray-600 text-[11px] mt-1 leading-snug font-medium">MBA Student at Henley Business School</p>
                        <p className="text-gray-400 text-[10px] mt-2">United Kingdom · <span className="text-[#0A66C2] font-semibold">Contact info</span></p>
                        <p className="text-gray-400 text-[10px] mt-0.5">500+ connections</p>
                        <div className="flex gap-2 mt-3">
                          <span className="px-3.5 py-1.5 bg-[#0A66C2] text-white text-[10px] rounded-full font-bold">✈ Message</span>
                          <span className="px-3.5 py-1.5 border border-gray-200 text-gray-500 text-[10px] rounded-full font-bold">More</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                </div>
              </div>

            </div>

          </div>

        </section>

        {/* ── LOGO MARQUEE STRIP ── */}
        <div className="relative z-10 w-full px-4 md:px-8 pb-12">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-center text-4xl md:text-5xl font-black tracking-tighter text-gray-800 uppercase mb-16">
              Trusted by students at
            </h2>
            <div className="bg-[#1e2d78] w-full rounded-[2rem] shadow-[0_12px_40px_rgba(0,0,0,0.1)] overflow-hidden py-12 border border-white/5">
              <div
                className="relative overflow-hidden w-full flex items-center"
                style={{
                  maskImage: "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
                  WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
                }}
              >
                <style>{`
                  @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
                  .marquee-track { display: flex; align-items: center; width: max-content; animation: marquee 24s linear infinite; }
                `}</style>
                <div className="marquee-track">
                  {[
                    { slug: "loughborough", h: 48 }, { slug: "durham", h: 110 }, { slug: "exeter", h: 110 }, { slug: "oxford", h: 60 }, { slug: "lse", h: 125 },
                    { slug: "loughborough", h: 48 }, { slug: "durham", h: 110 }, { slug: "exeter", h: 110 }, { slug: "oxford", h: 60 }, { slug: "lse", h: 125 },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-center flex-shrink-0 w-[calc((100vw-4rem)/3)] xl:w-[384px]" style={{ height: 130 }}>
                      <img src={`/marquee-logos/${item.slug}.png`} alt={item.slug} style={{ height: item.h > 120 ? 120 : item.h, width: "auto", maxWidth: 300, objectFit: "contain", opacity: 1 }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── SECTION 2.25: HOW IT WORKS ── */}
        <section className="bg-[#f2f2f2] w-full px-4 md:px-8 border-t border-gray-100">
          <div className="max-w-6xl mx-auto py-12">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-gray-800 text-center mb-16 uppercase">
              HOW TO USE OUR SERVICE
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
              {/* Card 1 */}
              <div className="bg-white rounded-[2rem] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-300">
                <div className="relative w-32 h-24 mx-auto mb-8 mt-2 flex items-center justify-center">
                  <div className="absolute top-2 right-8 w-14 h-14 bg-blue-400 rounded-full" />
                  <div className="absolute bottom-4 left-6 w-16 h-12 bg-[#0A66C2] rounded-full" />
                  <div className="absolute bottom-4 right-6 w-12 h-10 bg-[#0A66C2] rounded-full" />
                  <div className="absolute bottom-0 right-4 w-12 h-12 bg-white/40 backdrop-blur-xl border-2 border-white/50 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.1)] flex items-center justify-center z-10">
                    <Search
                      className="w-5 h-5 text-[#1e2d78]"
                      strokeWidth={2.5}
                    />
                  </div>
                </div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">
                  Step 1
                </p>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Find Your University
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Search for your UK university to instantly load the official
                  logo and brand colors from our database.
                </p>
              </div>

              {/* Card 2 */}
              <div className="bg-white rounded-[2rem] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-300">
                <div className="relative w-32 h-24 mx-auto mb-8 mt-2 flex items-center justify-center">
                  <div className="absolute w-20 h-14 bg-gradient-to-r from-blue-500 to-[#0A66C2] rounded-xl shadow-lg" />
                  <div className="absolute w-16 h-10 bg-white/40 backdrop-blur-xl border-2 border-white/50 rounded-lg shadow-[0_8px_32px_rgba(0,0,0,0.1)] flex items-center justify-center z-10">
                    <Paintbrush
                      className="w-5 h-5 text-[#1e2d78]"
                      strokeWidth={2.5}
                    />
                  </div>
                </div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">
                  Step 2
                </p>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Customize Style
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Choose from professional layout templates and add your
                  personalized headline to stand out.
                </p>
              </div>

              {/* Card 3 */}
              <div className="bg-white rounded-[2rem] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-300">
                <div className="relative w-32 h-24 mx-auto mb-8 mt-2 flex flex-col items-center justify-center">
                  <div className="absolute top-4 left-6 w-10 h-8 bg-blue-400 rounded-t-lg" />
                  <div className="absolute top-8 w-20 h-14 bg-[#0A66C2] rounded-lg" />
                  <div className="absolute bottom-0 w-24 h-12 bg-white/50 backdrop-blur-xl border-2 border-white/50 rounded-lg shadow-[0_8px_32px_rgba(0,0,0,0.1)] z-10 flex items-center justify-center">
                    <Download
                      className="w-5 h-5 text-[#1e2d78]"
                      strokeWidth={2.5}
                    />
                  </div>
                </div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">
                  Step 3
                </p>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Export Banner
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Once you are happy with the preview, one-click export to get
                  your high-resolution PNG, ready for LinkedIn.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 2.5: LEARN MORE (VIDEO SHOWCASE) ── */}
        <section className="bg-[#f2f2f2] w-full px-4 md:px-8 overflow-hidden">
          <div className="max-w-6xl mx-auto w-full relative group py-12">
            <div className="bg-[#1e2d78] w-full rounded-[2.5rem] p-6 md:p-12 shadow-[0_32px_80px_rgba(30,45,120,0.2)] relative overflow-hidden flex flex-col items-center border border-white/5">
              {/* Glassmorphic Background Glows */}
              <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px] pointer-events-none" />
              <div className="absolute bottom-[-100px] left-[-100px] w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none" />

              {/* Header Content */}
              <div className="text-center relative z-10 w-full mb-12 mt-4 text-white">
                <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 uppercase">
                  See the Difference
                </h2>
                <p className="text-blue-100/90 font-medium max-w-2xl mx-auto text-lg leading-relaxed">
                  Watch how our tool completely transforms a blank profile into a
                  highly professional LinkedIn showcase in a single click.
                </p>
              </div>

              {/* Video Player Container */}
              <div className="w-full relative mt-4">
                {/* Video Wrapper */}
                <div className="relative w-full aspect-[16/10] md:aspect-video rounded-3xl overflow-hidden shadow-2xl border border-white/20 bg-[#1e2d78] group/video cursor-pointer">
                  <div className="absolute inset-0 w-full h-full bg-[#1e2d78] transition-transform duration-[1.5s] ease-out group-hover/video:scale-[1.03] flex items-center justify-center overflow-hidden pointer-events-none">
                    <div className="flex items-center h-full w-[170%] md:w-full justify-center scale-[0.85] md:scale-[0.92]">
                      {/* LEFT CARD (Before) */}
                      <div className="relative shadow-[0_12px_40px_rgba(0,0,0,0.15)] rounded-[1.5rem] md:rounded-[2rem] w-[340px] md:w-[460px] aspect-[4/3] flex-shrink-0 bg-white transition-transform duration-[1.5s] ease-out group-hover/video:-translate-x-4 border border-gray-100/50 mt-12 md:mt-16">
                        {/* Detached Before Tag */}
                        <div className="absolute -top-12 md:-top-14 left-2 md:left-4 z-40 inline-flex items-center gap-2 bg-[#FFD1D4] text-sm md:text-lg font-bold px-4 py-2 md:px-6 md:py-2.5 rounded-full shadow-sm">
                          <span className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-[#FF4D54]" />
                          <span className="text-[#FF4D54] leading-none">
                            Before
                          </span>
                        </div>

                        {/* Structure */}
                        <div className="rounded-[1.5rem] md:rounded-[2rem] overflow-hidden bg-white flex flex-col h-full">
                          <div
                            className="h-[76px] md:h-[100px] relative flex-shrink-0"
                            style={{
                              background:
                                "linear-gradient(135deg, #b0bec5, #cfd8dc)",
                            }}
                          >
                            <div className="absolute left-6 md:left-8 bottom-0 translate-y-1/2 w-[64px] h-[64px] md:w-[86px] md:h-[86px] rounded-full bg-white p-1 md:p-1.5 shadow-sm z-10">
                              <img
                                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face"
                                className="w-full h-full rounded-full object-cover"
                                alt="Profile"
                              />
                            </div>
                          </div>
                          <div className="pt-8 md:pt-12 px-6 md:px-8 pb-5 md:pb-6 flex-1 text-left flex flex-col justify-center">
                            <p className="font-bold text-gray-900 text-[18px] md:text-[24px] leading-tight">
                              Oliver Smith{" "}
                              <span className="font-normal text-gray-400 text-[13px] md:text-[16px]">
                                · 1st
                              </span>
                            </p>
                            <p className="text-gray-300 text-[13px] md:text-[16px] mt-1 md:mt-1.5">
                              --
                            </p>
                            <p className="text-gray-400 text-[12px] md:text-[15px] mt-2 md:mt-3">
                              United Kingdom ·{" "}
                              <span className="text-[#0A66C2] font-semibold">
                                Contact info
                              </span>
                            </p>
                            <p className="text-gray-400 text-[11px] md:text-[13px] mt-1 md:mt-1">
                              0 connections
                            </p>
                            <div className="flex gap-2 md:gap-3 mt-auto pt-2 md:pt-4">
                              <span className="px-4 md:px-6 py-1.5 md:py-2.5 bg-[#0A66C2] text-white text-[12px] md:text-[14px] rounded-full font-semibold shadow-sm">
                                ✈ Message
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* RIGHT CARD (After) */}
                      <div className="relative shadow-[0_24px_60px_rgba(0,0,0,0.3)] rounded-[1.5rem] md:rounded-[2rem] w-[340px] md:w-[460px] aspect-[4/3] flex-shrink-0 bg-white z-20 -ml-24 md:-ml-40 transition-transform duration-[1.5s] ease-out group-hover/video:translate-x-4 ring-1 ring-black/5 mt-12 md:mt-16">
                        {/* Detached After Tag */}
                        <div className="absolute -top-12 md:-top-14 left-4 md:left-6 z-40 inline-flex items-center gap-2 bg-[#C5E8D3] text-sm md:text-lg font-bold px-4 py-2 md:px-6 md:py-2.5 rounded-full shadow-sm">
                          <span className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-[#34A853]" />
                          <span className="text-[#34A853] leading-none">
                            After
                          </span>
                        </div>

                        {/* Structure */}
                        <div className="rounded-[1.5rem] md:rounded-[2rem] overflow-hidden bg-white h-full flex flex-col">
                          <div
                            className="h-[76px] md:h-[100px] relative flex-shrink-0"
                            style={{ background: "#1d4696" }}
                          >
                            <div className="absolute inset-0 flex">
                              <div className="w-1/2 h-full relative overflow-hidden">
                                <img
                                  src="/henley-building.jpg"
                                  alt="Henley"
                                  className="absolute inset-0 w-full h-full object-cover"
                                />
                              </div>
                              <div
                                className="w-1/2 h-full flex items-center justify-end pr-4 md:pr-6"
                                style={{ background: "#1d4696" }}
                              >
                                <div className="text-right">
                                  <p className="text-white font-extrabold text-[13px] md:text-[16px] leading-tight">
                                    Henley
                                  </p>
                                  <p className="text-white font-bold text-[11px] md:text-[13px] mt-0.5 md:mt-1">
                                    Business School
                                  </p>
                                  <p className="text-blue-200 text-[7px] md:text-[9px] tracking-widest mt-0.5 md:mt-1.5 uppercase">
                                    UNIV. OF READING
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div
                              className="absolute top-0 bottom-0 left-1/2 w-[2px] md:w-[3px]"
                              style={{ background: "#c8a800" }}
                            />
                            <div className="absolute left-6 md:left-8 bottom-0 translate-y-1/2 w-[64px] h-[64px] md:w-[86px] md:h-[86px] rounded-full bg-white p-1 md:p-1.5 shadow-md z-20">
                              <img
                                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face"
                                className="w-full h-full rounded-full object-cover"
                                alt="Profile"
                              />
                            </div>
                          </div>
                          <div className="pt-8 md:pt-12 px-6 md:px-8 pb-5 md:pb-6 flex-1 text-left flex flex-col justify-center">
                            <p className="font-bold text-gray-900 text-[18px] md:text-[24px] leading-tight">
                              Oliver Smith{" "}
                              <span className="font-normal text-gray-400 text-[13px] md:text-[16px]">
                                · 1st
                              </span>
                            </p>
                            <p className="text-gray-500 text-[13px] md:text-[15px] mt-1 md:mt-1.5 leading-tight">
                              MBA Student at Henley Business School
                            </p>
                            <p className="text-gray-400 text-[12px] md:text-[15px] mt-2 md:mt-3">
                              United Kingdom ·{" "}
                              <span className="text-[#0A66C2] font-semibold">
                                Contact info
                              </span>
                            </p>
                            <p className="text-gray-400 text-[11px] md:text-[13px] mt-1 md:mt-1">
                              500+ connections
                            </p>
                            <div className="flex gap-2 md:gap-3 mt-auto pt-2 md:pt-4">
                              <span className="px-4 md:px-6 py-1.5 md:py-2.5 bg-[#0A66C2] text-white text-[12px] md:text-[14px] rounded-full font-semibold shadow-sm">
                                ✈ Message
                              </span>
                              <span className="px-4 md:px-6 py-1.5 md:py-2.5 border-[1.5px] border-gray-300 text-gray-600 text-[12px] md:text-[14px] rounded-full font-semibold">
                                More
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Glassmorphic Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center shadow-[0_16px_40px_rgba(0,0,0,0.3)] border border-white/40 transition-transform duration-500 group-hover/video:scale-110">
                      <div className="w-0 h-0 border-t-[14px] border-t-transparent border-l-[24px] border-l-white border-b-[14px] border-b-transparent ml-2" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 2.75: FAQ ── */}
        <section className="bg-[#f2f2f2] w-full px-4 md:px-8 overflow-hidden">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-12 md:gap-24 pt-12 pb-24">
            {/* Left: Heading */}
            <div className="md:w-1/3 pt-4">
              <h2 className="text-7xl md:text-8xl font-black tracking-tighter text-gray-900 uppercase leading-[0.8]">
                FAQ
              </h2>
            </div>

            {/* Right: Accordion Items */}
            <div className="md:w-2/3 flex flex-col gap-4">
              {[
                {
                  q: "How does LNBackground work?",
                  a: "Search for your university, choose a design, add your headline, and export your banner in one click. Our tool automatically fetches official logos and brand colors so you don't have to design anything manually.",
                },
                {
                  q: "Is the service really free?",
                  a: "Yes, LNBackground is completely free for students and professionals in the UK who want to upgrade their LinkedIn profile quickly and professionally.",
                },
                {
                  q: "Does it work for my university?",
                  a: "We currently support over 130 UK universities with their official logos and brand colors integrated directly into our tool.",
                  button: "Check if your school is registered"
                },
                {
                  q: "What format will I receive the banner in?",
                  a: "You will receive a high-resolution .png file, perfectly tailored to LinkedIn's official dimensions (1584 x 396 pixels).",
                },
                {
                  q: "Do I need an account to use the tool?",
                  a: "No, you can generate and download your banner immediately without needing to log in or share any personal data.",
                },
                {
                  q: "Can I use the tool on mobile?",
                  a: "Absolutely! The site is fully responsive, though we recommend using a desktop for the best overall user experience.",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-[1.5rem] md:rounded-[2rem] overflow-hidden transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-gray-100/50"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full px-8 py-7 md:py-9 flex items-center justify-between text-left group"
                  >
                    <span className="text-lg md:text-xl font-bold text-gray-800 group-hover:text-[#0A66C2] transition-colors pr-8">
                      {item.q}
                    </span>
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                      {openFaq === idx ? (
                        <Minus
                          className="w-6 h-6 text-gray-400"
                          strokeWidth={1}
                        />
                      ) : (
                        <Plus className="w-6 h-6 text-gray-400" strokeWidth={1} />
                      )}
                    </div>
                  </button>
                  <AnimatePresence initial={false}>
                    {openFaq === idx && (
                      <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                          duration: 0.3,
                          ease: [0.04, 0.62, 0.23, 0.98],
                        }}
                      >
                        <div className="px-8 pb-10 md:pb-12 pt-0">
                          <p className="text-gray-500 text-base md:text-lg leading-relaxed max-w-2xl font-medium mb-6">
                            {item.a}
                          </p>
                          {item.button && (
                            <button className="px-6 py-2.5 bg-[#0A66C2] text-white text-sm font-bold rounded-full shadow-sm hover:bg-[#084d91] transition-colors flex items-center gap-2">
                              <span>{item.button}</span>
                              <Search className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SECTION 3: FOOTER ── */}
        <section className="bg-[#f2f2f2] w-full transition-all duration-500 overflow-hidden">
          <footer className="relative z-10 w-full mt-auto">
            <div
              className="bg-[#1e2d78] w-full pt-12 pb-10 px-10 md:px-14 shadow-[0_-10px_40px_rgba(30,45,120,0.2)] flex flex-col overflow-hidden"
              style={{
                borderTopLeftRadius: "2.5rem",
                borderTopRightRadius: "2.5rem",
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
              }}
            >
              <div className="max-w-6xl mx-auto w-full">
                <div className="flex flex-col xl:flex-row justify-between w-full mb-8 lg:mb-12 gap-16 xl:gap-8">
                  {/* Left side: English + Copyright */}
                  <div className="flex flex-col text-white/60 shrink-0">
                    <div className="flex items-center gap-2 mb-8 xl:mb-12 pb-3 border-b border-white/10 w-fit cursor-pointer hover:text-white transition-colors">
                      <span className="text-xs font-medium">English</span>
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        ></path>
                      </svg>
                    </div>

                    <div className="flex gap-3 items-start mt-auto">
                      <div className="w-8 h-8 rounded bg-[#0A66C2] flex shrink-0 items-center justify-center text-white font-bold text-xs mt-0.5">
                        in
                      </div>
                      <p className="max-w-[180px] text-[9px] leading-[1.6] text-white/40">
                        The most powerful free tool for creating professional
                        LinkedIn banners online.
                        <br />
                        <br />© Copyright 2026 LNBackground
                      </p>
                    </div>
                  </div>

                  {/* Right side: Links Matrix & Giant Logo */}
                  <div className="flex flex-col w-full xl:max-w-[520px] 2xl:max-w-[560px] xl:ml-auto">
                    <div className="flex flex-row justify-between w-full text-[10px] lg:text-[11px] leading-[1.8] text-[#8e8e8e] flex-wrap sm:flex-nowrap gap-y-12">
                      <div className="flex flex-col gap-2 w-max shrink-0">
                        <h4 className="font-semibold text-white mb-3 text-[11px] lg:text-[12px]">
                          Product
                        </h4>
                        <a href="#" className="hover:text-white transition-colors">
                          Feature Tour
                        </a>
                        <a href="#" className="hover:text-white transition-colors">
                          Pricing Options
                        </a>
                        <a href="#" className="hover:text-white transition-colors">
                          For Universities
                        </a>
                        <a href="#" className="hover:text-white transition-colors">
                          Enterprise API
                        </a>
                      </div>

                      <div className="flex flex-col gap-2 w-max shrink-0">
                        <h4 className="font-semibold text-white mb-3 text-[11px] lg:text-[12px]">
                          Resources
                        </h4>
                        <a href="#" className="hover:text-white transition-colors">
                          Blog
                        </a>
                        <a href="#" className="hover:text-white transition-colors">
                          Help Center
                        </a>
                        <a href="#" className="hover:text-white transition-colors">
                          LinkedIn Guides
                        </a>
                        <a href="#" className="hover:text-white transition-colors">
                          Banner Templates
                        </a>
                      </div>

                      <div className="flex flex-col gap-2 w-max shrink-0">
                        <h4 className="font-semibold text-white mb-3 text-[11px] lg:text-[12px]">
                          Company
                        </h4>
                        <a href="#" className="hover:text-white transition-colors">
                          About Us
                        </a>
                        <a href="#" className="hover:text-white transition-colors">
                          Careers
                        </a>
                        <a href="#" className="hover:text-white transition-colors">
                          Privacy Policy
                        </a>
                        <a href="#" className="hover:text-white transition-colors">
                          Terms of Service
                        </a>
                      </div>
                    </div>

                    {/* GIANT LOGO TEXT */}
                    <div className="w-full flex items-end justify-between mt-12 md:mt-24 select-none pointer-events-none">
                      <style>{`
                  .giant-letter {
                    font-size: clamp(60px, 14vw, 170px);
                    line-height: 0.8;
                    font-family: ui-sans-serif, system-ui, sans-serif;
                  }
                `}</style>
                      <span className="giant-letter font-black text-white">L</span>
                      <span className="giant-letter font-black text-white">N</span>
                      <span className="giant-letter font-black text-white">B</span>
                      <span className="giant-letter font-black text-white">G</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </footer>
        </section>
      </main>

    </div>
  );
}
