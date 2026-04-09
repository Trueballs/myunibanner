"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Menu, X, ArrowLeft, Search, Linkedin, Twitter, Instagram } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useLanguage } from "@/context/LanguageContext";


interface HeaderProps {
  showStartButton?: boolean;
  showBackButton?: boolean;
  activeBrand?: { name: string; logo: string } | null;
}

export default function Header({ showStartButton = false, showBackButton = false, activeBrand = null }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("United Kingdom");
  const router = useRouter();
  const { language: selectedLang, setLanguage, t } = useLanguage();


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


  return (
    <header className="w-full z-[100] relative">
      <div className="w-full px-0 py-2 sm:py-3 flex items-center justify-between relative">
        <div className="flex items-center">
          <span className="text-[#1e2d78] font-black font-outfit text-xl md:text-2xl lg:text-[24px] tracking-[0.05em] leading-none cursor-pointer" onClick={() => router.push("/")}>Myunibanner</span>
        </div>

        <div className="flex items-center gap-4">


          <div className="flex items-center gap-3 md:gap-4 ml-2">
            <div className="hidden sm:flex items-center gap-3 mr-2">
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-[#1e2d78]/70 hover:text-[#1e2d78] transition-all duration-300 hover:-translate-y-1 hover:scale-110 active:scale-95">
                <Linkedin className="w-4 h-4 md:w-5 md:h-5" />
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-[#1e2d78]/70 hover:text-[#1e2d78] transition-all duration-300 hover:-translate-y-1 hover:scale-110 active:scale-95">
                <Twitter className="w-4 h-4 md:w-5 md:h-5" />
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-[#1e2d78]/70 hover:text-[#1e2d78] transition-all duration-300 hover:-translate-y-1 hover:scale-110 active:scale-95">
                <Instagram className="w-4 h-4 md:w-5 md:h-5" />
              </a>
            </div>

            <a 
              href="mailto:oscar.w.skaarderud@gmail.com"
              className="bg-white border border-gray-200 text-[#1e2d78] text-[10px] font-black font-outfit px-4 py-2.5 rounded-xl uppercase tracking-wider flex items-center justify-center hover:border-[#1e2d78] hover:bg-[#1e2d78]/5 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 active:scale-95 shadow-sm flex-shrink-0"
            >
              Contact
            </a>
          </div>

          {showBackButton && (
            <button 
              onClick={() => router.push("/")}
              className="bg-white border border-gray-200 text-[#1e2d78] text-[10px] font-black px-4 py-2.5 rounded-xl uppercase tracking-wider flex items-center gap-2 hover:border-[#1e2d78] transition-all active:scale-95 shadow-sm flex-shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#1e2d78]" /> Back
            </button>
          )}

          {showStartButton && (
            <button 
              onClick={() => router.push("/")}
              className="bg-white border border-gray-200 text-[#1e2d78] text-[10px] font-black px-4 py-2.5 rounded-xl uppercase tracking-wider flex items-center gap-2 hover:border-[#1e2d78] transition-all active:scale-95 shadow-sm flex-shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Start Designing
            </button>
          )}
        </div>
      </div>
      <div className="w-full border-b border-gray-300 shadow-sm" />
    </header>
  );
}
