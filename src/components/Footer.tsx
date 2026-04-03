"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Globe, ChevronDown, Check, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const LANGUAGES = ["English", "Spanish", "Chinese", "Hindi", "Arabic", "French", "Portuguese"];
const COUNTRIES = ["United Kingdom", "Norway"];

export default function Footer() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState("English");
  const [selectedCountry, setSelectedCountry] = useState("United Kingdom");
  const [searchQuery, setSearchQuery] = useState("");
  const settingsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const savedData = localStorage.getItem("lnbg_user_data");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.language) setSelectedLang(parsed.language);
        if (parsed.country) setSelectedCountry(parsed.country);
      } catch (e) {}
    }

    const handleUserDataUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        if (customEvent.detail.language) setSelectedLang(customEvent.detail.language);
        if (customEvent.detail.country) setSelectedCountry(customEvent.detail.country);
      }
    };

    window.addEventListener("lnbg_user_data_updated", handleUserDataUpdate as EventListener);
    return () => window.removeEventListener("lnbg_user_data_updated", handleUserDataUpdate as EventListener);
  }, []);

  const handleLangSelect = (lang: string) => {
    setSelectedLang(lang);
    if (typeof window !== "undefined") {
      const existing = localStorage.getItem("lnbg_user_data");
      const data = existing ? JSON.parse(existing) : {};
      data.language = lang;
      localStorage.setItem("lnbg_user_data", JSON.stringify(data));
      window.dispatchEvent(new CustomEvent("lnbg_user_data_updated", { detail: data }));
    }
  };

  const handleCountrySelect = (country: string) => {
    setSelectedCountry(country);
    setIsSettingsOpen(false);
    setSearchQuery("");
    if (typeof window !== "undefined") {
      const existing = localStorage.getItem("lnbg_user_data");
      const data = existing ? JSON.parse(existing) : {};
      data.country = country;
      localStorage.setItem("lnbg_user_data", JSON.stringify(data));
      window.dispatchEvent(new CustomEvent("lnbg_user_data_updated", { detail: data }));
    }
  };

  return (
    <footer className="relative z-10 w-full mt-auto px-4 md:px-8">
      <div className="bg-[#1B2D7A] w-full pt-10 pb-8 px-6 md:px-8 shadow-2xl flex flex-col rounded-3xl relative">
        <div className="max-w-6xl mx-auto w-full">
          <div className="flex flex-col xl:flex-row justify-between w-full mb-8 lg:mb-12 gap-16 xl:gap-8">
            {/* Left side: English + Copyright */}
            <div className="flex flex-col text-white/60 shrink-0">
              <div className="relative" ref={settingsRef}>
                <button
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                  className={`flex items-center gap-2 mb-8 xl:mb-12 pb-3 border-b transition-colors ${isSettingsOpen ? 'text-white border-white/40' : 'border-white/10 hover:text-white hover:border-white/20'}`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span className="text-xs font-semibold uppercase tracking-widest">{selectedLang}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${isSettingsOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isSettingsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute left-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[110]"
                    >
                      <div className="p-4 bg-gray-50 border-b border-gray-100">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3 text-left">Language</h3>
                        <div className="grid grid-cols-2 gap-1.5">
                          {LANGUAGES.map(lang => (
                            <button
                              key={lang}
                              onClick={() => handleLangSelect(lang)}
                              className={`text-left px-3 py-2 rounded-lg text-xs font-bold transition-colors ${selectedLang === lang ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                            >
                              {lang}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3 text-left">Country of Study</h3>
                        <div className="relative mb-3">
                          <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search countries..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-[#0F1629] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-sans"
                          />
                        </div>
                        <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
                          {COUNTRIES.filter(c => c.toLowerCase().includes(searchQuery.toLowerCase())).map(country => (
                            <button
                              key={country}
                              onClick={() => handleCountrySelect(country)}
                              className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-colors ${selectedCountry === country ? 'bg-gray-100 text-[#0F1629]' : 'text-gray-500 hover:bg-gray-50'}`}
                            >
                              {country}
                              {selectedCountry === country && <Check className="w-3.5 h-3.5 text-blue-600" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex gap-3 items-start mt-auto">
                {/* LinkedIn and Copyright removed per request */}
              </div>
            </div>

            {/* Right side: Links Matrix & Giant Logo */}
            <div className="flex flex-col w-full xl:max-w-[520px] 2xl:max-w-[560px] xl:ml-auto">
              <div className="flex flex-row justify-between w-full text-[10px] lg:text-[11px] leading-[1.8] text-[#8e8e8e] flex-wrap sm:flex-nowrap gap-y-12">
                <div className="flex flex-col gap-2 w-max shrink-0 sm:ml-auto">
                  <h4 className="font-semibold text-white mb-3 text-[11px] lg:text-[12px] uppercase tracking-widest">
                    Navigation
                  </h4>
                  <button onClick={() => router.push("/about")} className="hover:text-white transition-colors text-left text-[11px] font-semibold uppercase tracking-widest">
                    About Us
                  </button>
                  <button onClick={() => router.push("/universities")} className="hover:text-white transition-colors text-left text-[11px] font-semibold uppercase tracking-widest">
                    For Universities
                  </button>
                  <button onClick={() => router.push("/privacy")} className="hover:text-white transition-colors text-left text-[11px] font-semibold uppercase tracking-widest">
                    Privacy Policy
                  </button>
                  <button onClick={() => router.push("/terms")} className="hover:text-white transition-colors text-left text-[11px] font-semibold uppercase tracking-widest">
                    Terms of Service
                  </button>
                  <a href="mailto:oscar.w.skaarderud@gmail.com" className="hover:text-white transition-colors text-left text-[11px] font-semibold uppercase tracking-widest">
                    Contact
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
  );
}
