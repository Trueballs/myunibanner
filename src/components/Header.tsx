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
    <header className="w-full z-[100] sticky top-0 bg-white/70 backdrop-blur-md border-b-[1px] border-slate-900/15 transition-all">
      <div className="w-full max-w-7xl mx-auto px-6 md:px-12 py-5 flex items-center justify-between">
        {/* LEFT: Logo */}
        <div className="flex items-center justify-start">
          <span
            className="text-slate-900 font-extrabold font-lexend text-[22px] md:text-[25px] tracking-tight cursor-pointer lowercase"
            onClick={() => router.push("/")}
          >
            myunibanner
          </span>
        </div>

        {/* RIGHT: Actions */}
        <div className="flex items-center justify-end gap-6">
          {showBackButton && (
            <button
              onClick={() => router.push("/")}
              className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-sm rounded-xl transition-all flex items-center gap-2 active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" /> Back to home
            </button>
          )}

          <button
            onClick={() => window.open('https://www.linkedin.com/in/oscar-wold-skaarderud-613644340', '_blank')}
            className="px-8 py-3 bg-blue-600 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-blue-500/20 hover:bg-blue-700 active:scale-95"
          >
            Contact
          </button>
        </div>
      </div>
    </header>
  );
}
