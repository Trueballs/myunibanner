"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Menu, X, ArrowLeft, Globe, ChevronDown, Check, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const LANGUAGES = ["English", "Spanish", "Chinese", "Hindi", "Arabic", "French", "Portuguese"];
const COUNTRIES = ["United Kingdom", "Norway"];

interface HeaderProps {
  showStartButton?: boolean;
  activeBrand?: { name: string; logo: string } | null;
}

export default function Header({ showStartButton = false, activeBrand = null }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
    
    // Initial read
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
    <header className="w-full px-4 md:px-8 z-[100] relative">
      <div className="w-full bg-[#1e2d78] rounded-3xl px-4 sm:px-6 md:px-8 py-4 md:py-5 flex items-center justify-between shadow-lg relative mt-3 md:mt-2">
        <div className="flex items-center gap-8">
          <span className="text-white font-black text-2xl md:text-3xl lg:text-[32px] tracking-[0.2em] leading-none mb-[-2px] mr-4 cursor-pointer" onClick={() => router.push("/")}>LNBG</span>
          
          <nav className="hidden lg:flex items-center gap-6">
            <button onClick={() => router.push("/about")} className="text-white/70 hover:text-white text-[11px] font-black uppercase tracking-widest transition-colors">About Us</button>
            <button onClick={() => router.push("/universities")} className="text-white/70 hover:text-white text-[11px] font-black uppercase tracking-widest transition-colors">For Universities</button>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {showStartButton && (
            <button 
              onClick={() => router.push("/")}
              className="bg-white text-[#1e2d78] text-[10px] font-black px-4 py-2.5 rounded-full uppercase tracking-wider flex items-center gap-2 hover:bg-blue-50 transition-all active:scale-95 shadow-md flex-shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Start Designing
            </button>
          )}

          {activeBrand && (
            <div className="flex items-center gap-2 bg-white/10 pl-1.5 pr-2.5 py-1.5 rounded-full border border-white/20">
              <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center p-0.5 overflow-hidden flex-shrink-0">
                 <img src={activeBrand.logo} alt="" className="w-full h-full object-contain" />
              </div>
              <span className="text-white text-[11px] font-bold hidden md:block whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{activeBrand.name}</span>
              <button onClick={() => router.push('/')} className="ml-1 text-white/50 hover:text-white transition-colors flex-shrink-0" title="Change university">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Region / Language Settings */}
          <div className="relative" ref={settingsRef}>
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-colors border ${isSettingsOpen ? 'bg-white/10 border-white/20' : 'border-transparent hover:bg-white/5'} text-white/90`}
            >
              <Globe className="w-4 h-4" />
              <span className="text-[11px] font-black uppercase tracking-widest hidden sm:block">
                {selectedLang}
              </span>
              <ChevronDown className={`w-3 h-3 transition-transform ${isSettingsOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Desktop Settings Dropdown */}
            <AnimatePresence>
              {isSettingsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute right-0 top-full mt-3 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-[102]"
                >
                  <div className="p-4 bg-gray-50 border-b border-gray-100">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">Language</h3>
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
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">Country of Study</h3>
                    <div className="relative mb-3">
                      <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search countries..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-[#111827] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
                      {COUNTRIES.filter(c => c.toLowerCase().includes(searchQuery.toLowerCase())).map(country => (
                        <button
                          key={country}
                          onClick={() => handleCountrySelect(country)}
                          className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-colors ${selectedCountry === country ? 'bg-gray-100 text-[#111827]' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                          {country}
                          {selectedCountry === country && <Check className="w-3.5 h-3.5 text-blue-600" />}
                        </button>
                      ))}
                      {COUNTRIES.filter(c => c.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                        <p className="text-xs text-center text-gray-400 py-2 italic font-medium">No countries found.</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden text-white p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-full left-0 right-0 mt-2 bg-[#1e2d78] rounded-2xl p-6 shadow-2xl lg:hidden flex flex-col gap-4 border border-white/10 z-[101]"
            >
              <button 
                onClick={() => { setIsMenuOpen(false); router.push("/about"); }}
                className="text-white/90 text-left font-bold uppercase tracking-widest py-3 border-b border-white/10"
              >
                About Us
              </button>
              <button 
                onClick={() => { setIsMenuOpen(false); router.push("/universities"); }}
                className="text-white/90 text-left font-bold uppercase tracking-widest py-3"
              >
                For Universities
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
