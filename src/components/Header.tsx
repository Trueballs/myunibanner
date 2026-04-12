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
    <header className="w-full z-[100] relative">
      <div className="w-full px-8 md:px-16 xl:px-24 py-4 md:py-5 grid grid-cols-3 items-center">
        {/* LEFT: Logo */}
        <div className="flex items-center">
          <span
            className="text-[#1e2d78] font-black font-outfit uppercase text-xl md:text-2xl lg:text-[24px] tracking-[0.05em] leading-none cursor-pointer"
            onClick={() => router.push("/")}
          >
            MYUNIBANNER
          </span>
        </div>

        {/* CENTER: Nav links */}
        <nav className="hidden md:flex items-center justify-center gap-10">
          <a href="#how-it-works" className="text-[#1a1a1a] text-[14px] font-bold border-b-2 border-[#1a1a1a] pb-0.5 hover:opacity-70 transition-all">How it works</a>
          <a href="#faq" className="text-[#1a1a1a] text-[14px] font-bold border-b-2 border-[#1a1a1a] pb-0.5 hover:opacity-70 transition-all">FAQ</a>
          <a
            href="mailto:oscar.w.skaarderud@gmail.com"
            className="text-[#1a1a1a] text-[14px] font-bold border-b-2 border-[#1a1a1a] pb-0.5 hover:opacity-70 transition-all"
          >
            Contact
          </a>
        </nav>

        {/* RIGHT: CTA */}
        <div className="flex items-center justify-end gap-4">
          {!pathname.startsWith('/build') && (
            <button
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.dispatchEvent(new CustomEvent("lnbg_open_onboarding"));
                }
              }}
              className="bg-[#1e2d78] text-white text-[12px] font-black font-outfit px-5 py-2.5 rounded-full uppercase tracking-wider hover:bg-[#1a2663] transition-all active:scale-95 shadow-sm"
            >
              Get my banner
            </button>
          )}

          {showBackButton && (
            <button
              onClick={() => router.push("/")}
              className="bg-white border border-gray-200 text-[#1e2d78] text-[10px] font-black font-outfit px-4 py-2.5 rounded-full uppercase tracking-wider flex items-center gap-2 hover:border-[#1e2d78] transition-all active:scale-95 shadow-sm flex-shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#1e2d78]" /> Back
            </button>
          )}

          {showStartButton && (
            <button
              onClick={() => router.push("/")}
              className="bg-white border border-gray-200 text-[#1e2d78] text-[10px] font-black font-outfit px-4 py-2.5 rounded-full uppercase tracking-wider flex items-center gap-2 hover:border-[#1e2d78] transition-all active:scale-95 shadow-sm flex-shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Start Designing
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
