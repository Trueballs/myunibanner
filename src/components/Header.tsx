"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Menu, X, ArrowLeft, Globe, ChevronDown, Check, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useLanguage } from "@/context/LanguageContext";

const LANGUAGES = ["English", "Norwegian"];
const COUNTRIES = ["United Kingdom", "Norway"];

interface HeaderProps {
  showStartButton?: boolean;
  activeBrand?: { name: string; logo: string } | null;
}

export default function Header({ showStartButton = false, activeBrand = null }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("United Kingdom");
  const [searchQuery, setSearchQuery] = useState("");
  const settingsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { language: selectedLang, setLanguage, t } = useLanguage();

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
        if (parsed.country) setSelectedCountry(parsed.country);
      } catch (e) {}
    }

    const handleUserDataUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        if (customEvent.detail.country) setSelectedCountry(customEvent.detail.country);
      }
    };

    window.addEventListener("lnbg_user_data_updated", handleUserDataUpdate as EventListener);
    return () => window.removeEventListener("lnbg_user_data_updated", handleUserDataUpdate as EventListener);
  }, []);

  const handleLangSelect = (lang: string) => {
    setLanguage(lang as "English" | "Norwegian");
    setIsSettingsOpen(false);
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
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-[#4ECBA8] animate-pulse" />
              <span className="text-white/70 text-[10px] font-black uppercase tracking-[0.15em] whitespace-nowrap">
                {t("header.badge")}
              </span>
            </div>
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

          {/* Country / Flag Selector */}
          <div className="relative" ref={settingsRef}>
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-colors border ${isSettingsOpen ? 'bg-white/10 border-white/20' : 'border-transparent hover:bg-white/5'} text-white/90`}
            >
              <span className="text-xl leading-none">
                {selectedCountry === "Norway" ? "🇳🇴" : "🇬🇧"}
              </span>
              <ChevronDown className={`w-3 h-3 transition-transform ${isSettingsOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isSettingsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute right-0 top-full mt-3 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-[102]"
                >
                  <div className="p-3">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 px-1">Country of Study</h3>
                    {[
                      { name: "United Kingdom", flag: "🇬🇧" },
                      { name: "Norway", flag: "🇳🇴" },
                    ].map(({ name, flag }) => (
                      <button
                        key={name}
                        onClick={() => handleCountrySelect(name)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-colors ${selectedCountry === name ? 'bg-[#1e2d78]/8 text-[#1e2d78]' : 'text-gray-600 hover:bg-gray-50'}`}
                      >
                        <span className="text-2xl leading-none">{flag}</span>
                        <span>{name}</span>
                        {selectedCountry === name && <Check className="w-3.5 h-3.5 text-[#1e2d78] ml-auto" />}
                      </button>
                    ))}
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
