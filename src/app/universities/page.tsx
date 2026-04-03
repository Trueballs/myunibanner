"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Palette, GraduationCap, Layers, Globe, Image as ImageIcon, Mail, ShieldCheck, Check } from "lucide-react";
import { motion } from "framer-motion";
import { UK_UNIVERSITIES, NORWAY_UNIVERSITIES } from "@/data/universities";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useState, useEffect } from "react";

export default function UniversitiesPage() {
    const router = useRouter();
    const [currentCountry, setCurrentCountry] = useState("Norway");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedFilterCountry, setSelectedFilterCountry] = useState<"All" | "Norway" | "United Kingdom">("All");
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined") return;
        
        const savedData = localStorage.getItem("lnbg_user_data");
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                if (parsed.country) setCurrentCountry(parsed.country);
            } catch (e) {}
        }

        const handleUpdate = (e: Event) => {
            const customEvent = e as CustomEvent;
            if (customEvent.detail?.country) {
                setCurrentCountry(customEvent.detail.country);
            }
        };

        window.addEventListener("lnbg_user_data_updated", handleUpdate as EventListener);
        return () => window.removeEventListener("lnbg_user_data_updated", handleUpdate as EventListener);
    }, []);

    const unis = currentCountry === "Norway" ? NORWAY_UNIVERSITIES : UK_UNIVERSITIES;

    return (
        <div className="min-h-screen bg-[#F5F4F1] font-sans flex justify-center w-full px-4 md:px-8 xl:px-12 py-4 md:py-6 gap-6 xl:gap-8 box-border overflow-x-hidden">
            <main className="w-full xl:w-[60%] flex flex-col shrink-0 relative bg-[#F5F4F1]">
                {/* ─── TOP NAVIGATION ─── */}
                <Header showStartButton />

                {/* ─── ADD YOUR UNIVERSITY ─── */}
                <section className="pt-10 md:pt-12 xl:pt-16 pb-10 md:pb-14 px-4 md:px-8 text-center mx-auto space-y-16 w-full">
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="w-full flex flex-col items-center"
                    >
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-[#1B2D7A] uppercase tracking-tight leading-[0.95] mb-16">
                            Add your school <br/>to the system.
                        </h1>
                         {/* ─── INTEGRATED BRAND & ASSET GOVERNANCE ─── */}
                        <div className="bg-[#1B2D7A] rounded-[2.5rem] p-8 md:p-14 shadow-2xl text-left mb-16 w-full border border-white/10 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity duration-700 pointer-events-none">
                                <ShieldCheck className="w-96 h-96 -mr-24 -mt-24" />
                            </div>
                            
                            <div className="relative z-10 space-y-16">
                                {/* TOP: Brand Governance */}
                                <div className="space-y-10">
                                    <div>
                                        <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-4">Brand Governance</h3>
                                        <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none mb-6">We respect your identity.</h2>
                                        <p className="text-white/60 text-sm md:text-base font-medium max-w-2xl leading-relaxed">
                                            Instead of students creating non-compliant banners in Photoshop or Canva, we provide a structured tool that strictly follows your brand guidelines. We make professional representation easier and better for both students and schools—completely for free.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-white/90">
                                                <div className="w-5 h-5 bg-white/10 rounded flex items-center justify-center"><Check className="w-3 h-3 text-emerald-400" /></div>
                                                <h4 className="font-black uppercase text-[11px] tracking-wider">No Manipulation</h4>
                                            </div>
                                            <p className="text-white/40 text-[11px] font-medium leading-relaxed">We never stretch, distort, or draw on the emblem. Proportions are strictly maintained.</p>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-white/90">
                                                <div className="w-5 h-5 bg-white/10 rounded flex items-center justify-center"><Check className="w-3 h-3 text-emerald-400" /></div>
                                                <h4 className="font-black uppercase text-[11px] tracking-wider">Original Colors</h4>
                                            </div>
                                            <p className="text-white/40 text-[11px] font-medium leading-relaxed">Only official brand colors are used for backgrounds, typography, and accent elements.</p>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-white/90">
                                                <div className="w-5 h-5 bg-white/10 rounded flex items-center justify-center"><Check className="w-3 h-3 text-emerald-400" /></div>
                                                <h4 className="font-black uppercase text-[11px] tracking-wider">Contrast Management</h4>
                                            </div>
                                            <p className="text-white/40 text-[11px] font-medium leading-relaxed">Our AI automatically switches between full-color, black, and negative logo versions based on legal contrast rules.</p>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-white/90">
                                                <div className="w-5 h-5 bg-white/10 rounded flex items-center justify-center"><Check className="w-3 h-3 text-emerald-400" /></div>
                                                <h4 className="font-black uppercase text-[11px] tracking-wider">Hierarchical Integrity</h4>
                                            </div>
                                            <p className="text-white/40 text-[11px] font-medium leading-relaxed">We support faculty and department-specific branding while maintaining a consistent institutional parent identity.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="h-px bg-white/10 w-full" />

                                {/* BOTTOM: Required Assets */}
                                <div>
                                    <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-10">Required Assets for Integration</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-10">
                                        <div className="flex gap-4">
                                            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center shrink-0 text-white/90">
                                                <Palette className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-white uppercase text-[11px] tracking-wider mb-1">Brand Colors</h4>
                                                <p className="text-white/40 text-[11px] font-medium leading-relaxed">Primary and secondary brand colors in HEX format.</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center shrink-0 text-white/90">
                                                <GraduationCap className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-white uppercase text-[11px] tracking-wider mb-1">University Name</h4>
                                                <p className="text-white/40 text-[11px] font-medium leading-relaxed">The exact name you want displayed on the platform.</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center shrink-0 text-white/90">
                                                <Layers className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-white uppercase text-[11px] tracking-wider mb-1">Various Logos</h4>
                                                <p className="text-white/40 text-[11px] font-medium leading-relaxed">Official logos in high-res SVG or PNG (Transparent background).</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center shrink-0 text-white/90">
                                                <Globe className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-white uppercase text-[11px] tracking-wider mb-1">Favicon</h4>
                                                <p className="text-white/40 text-[11px] font-medium leading-relaxed">The icon used for website tabs and bookmarks.</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center shrink-0 text-white/90">
                                                <ImageIcon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-white uppercase text-[11px] tracking-wider mb-1">Campus Images</h4>
                                                <p className="text-white/40 text-[11px] font-medium leading-relaxed">High quality photos of your campus and iconic buildings.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="h-px bg-white/10 w-full" />

                                {/* BOTTOM: Contact */}
                                <div className="flex flex-col md:flex-row items-center justify-between gap-8 py-4">
                                    <div className="space-y-4 text-center md:text-left">
                                        <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Ready to join?</h3>
                                        <a 
                                            href="mailto:oscar.w.skaarderud@gmail.com" 
                                            className="text-2xl md:text-4xl lg:text-5xl font-black text-white hover:text-emerald-400 transition-colors tracking-tighter lowercase block break-all"
                                        >
                                            oscar.w.skaarderud@gmail.com
                                        </a>
                                    </div>
                                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-white/90 shrink-0">
                                        <Mail className="w-8 h-8" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ─── SEARCH & FILTER ─── */}
                        <div className="bg-white rounded-[2.5rem] p-8 md:p-14 shadow-sm border border-gray-100 w-full ring-1 ring-black/[0.02] text-left mb-16 space-y-8">
                            <div>
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Database Access</h3>
                                <h2 className="text-xl md:text-2xl font-black text-[#1B2D7A] uppercase tracking-tighter">Check if your school is registered.</h2>
                            </div>
                            
                            <div className="flex flex-col gap-6">
                                <div className="relative group">
                                    <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#1B2D7A] transition-colors" />
                                    <input 
                                        type="text" 
                                        placeholder="Search for university name or domain..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3.5 bg-gray-50/50 border border-gray-100 rounded-2xl text-[14px] font-bold text-[#1B2D7A] focus:outline-none focus:ring-2 focus:ring-[#1B2D7A]/5 focus:border-[#1B2D7A] transition-all placeholder:text-gray-300"
                                    />
                                </div>
                                
                                <div className="flex bg-gray-50/50 p-1 rounded-2xl border border-gray-100 w-fit">
                                    {[
                                        { id: "All", label: "All Countries", icon: Globe },
                                        { id: "Norway", label: "Norway", icon: Globe },
                                        { id: "United Kingdom", label: "United Kingdom", icon: Globe }
                                    ].map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setSelectedFilterCountry(tab.id as any)}
                                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all ${
                                                selectedFilterCountry === tab.id 
                                                    ? 'bg-[#1B2D7A] text-white shadow-lg' 
                                                    : 'text-gray-400 hover:text-[#1B2D7A] hover:bg-white'
                                            }`}
                                        >
                                            <tab.icon className={`w-3.5 h-3.5 ${selectedFilterCountry === tab.id ? 'text-white' : 'text-gray-400'}`} />
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-500">
                                {[...NORWAY_UNIVERSITIES, ...UK_UNIVERSITIES]
                                    .filter(u => (selectedFilterCountry === "All" || u.country === selectedFilterCountry))
                                    .filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || (u.short && u.short.toLowerCase().includes(searchQuery.toLowerCase())) || u.domain.toLowerCase().includes(searchQuery.toLowerCase()))
                                    .sort((a, b) => {
                                        if (!searchQuery) return 0;
                                        const aMatch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) || (a.short && a.short.toLowerCase().includes(searchQuery.toLowerCase()));
                                        const bMatch = b.name.toLowerCase().includes(searchQuery.toLowerCase()) || (b.short && b.short.toLowerCase().includes(searchQuery.toLowerCase()));
                                        if (aMatch && !bMatch) return -1;
                                        if (!aMatch && bMatch) return 1;
                                        return 0;
                                    })
                                    .slice(0, isExpanded ? undefined : 6)
                                    .map((uni) => (
                                    <motion.div 
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        key={uni.domain}
                                        className="group p-5 bg-gray-50/50 rounded-2xl border border-gray-100 hover:border-blue-200 hover:bg-white transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex items-center gap-5"
                                    >
                                        <div className="w-14 h-14 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center overflow-hidden grayscale group-hover:grayscale-0 transition-all shrink-0">
                                            <img 
                                                src={`/${uni.root}/${uni.folder}/logo-search/${uni.logoSearch}`} 
                                                alt={uni.name}
                                                className="w-10 h-10 object-contain"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.parentElement!.innerHTML = `<div class="font-black text-[10px] text-[#1B2D7A]">${uni.short || uni.name.charAt(0)}</div>`;
                                                }}
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[13px] font-black text-[#1B2D7A] uppercase truncate tracking-tight mb-0.5">{uni.short || uni.name}</p>
                                            <p className="text-[10px] text-gray-400 font-medium truncate opacity-60 tracking-wider">Active in {uni.country}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {([...NORWAY_UNIVERSITIES, ...UK_UNIVERSITIES]
                                .filter(u => (selectedFilterCountry === "All" || u.country === selectedFilterCountry))
                                .filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || (u.short && u.short.toLowerCase().includes(searchQuery.toLowerCase())) || u.domain.toLowerCase().includes(searchQuery.toLowerCase())).length > 6) && (
                                <button
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    className="w-full mt-10 py-4 bg-gray-50/80 hover:bg-gray-100 text-[#1B2D7A] text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl border border-gray-100 transition-all flex items-center justify-center gap-3 group"
                                >
                                    {isExpanded ? (
                                        <>Show Less <ArrowLeft className="w-3 h-3 rotate-90" /></>
                                    ) : (
                                        <>Show all registered schools <ArrowLeft className="w-3 h-3 rotate-[270deg] group-hover:translate-y-1 transition-transform" /></>
                                    )}
                                </button>
                            )}
                        </div>

                    </motion.div>
                </section>
                
                {/* ── SECTION 3: FOOTER ── */}
                <section className="bg-[#F5F4F1] w-full transition-all duration-500 overflow-hidden">
                    <Footer />
                </section>
            </main>
        </div>
    );
}
