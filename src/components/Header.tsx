"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
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
  const pathname = usePathname();
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
    <header className="w-full z-[100] sticky top-0 backdrop-blur-md border-b-[1px] border-slate-900/15 transition-all" style={{ backgroundColor: 'rgba(248, 250, 252, 0.85)' }}>
      <div className="w-full max-w-7xl mx-auto px-6 md:px-12 py-5 flex items-center justify-between">
        {/* LEFT: Logo */}
        <div className="flex items-center justify-start shrink-0">
          <img 
            src="/assets/logo.png" 
            alt="Myunibanner Logo" 
            className="h-7 md:h-11 w-auto cursor-pointer object-contain"
            onClick={() => router.push("/")}
          />
        </div>

        {/* RIGHT: Actions */}
        <div className="flex items-center justify-end gap-3 md:gap-4">
          {showBackButton && (
            <button
              onClick={() => router.push("/")}
              className="px-5 md:px-7 py-2 md:py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-[13px] md:text-sm rounded-full transition-all flex items-center gap-2 active:scale-95 border border-slate-200/50"
            >
              <ArrowLeft className="w-3.5 md:w-4 h-3.5 md:h-4" /> Back
            </button>
          )}

          <button
            onClick={() => window.open('https://www.linkedin.com/in/oscar-wold-skaarderud-613644340', '_blank')}
            className="px-5 md:px-7 py-2 md:py-2.5 bg-blue-600 text-white font-bold text-[13px] md:text-sm rounded-full transition-all shadow-md hover:bg-blue-700 active:scale-95"
          >
            Contact
          </button>
        </div>
      </div>
    </header>
  );
}
