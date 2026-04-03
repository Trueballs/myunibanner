"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Globe, ChevronDown, Check, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";

const LANGUAGES = ["English", "Spanish", "Chinese", "Hindi", "Arabic", "French", "Portuguese"];
const COUNTRIES = ["United Kingdom", "Norway"];

export default function Footer() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("United Kingdom");
  const [searchQuery, setSearchQuery] = useState("");
  const settingsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { t } = useLanguage();

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

  const handleLangSelect = (lang: string) => {};


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
      <div className="bg-[#1e2d78] w-full py-12 px-8 md:px-12 shadow-2xl flex flex-col rounded-3xl relative">
        <div className="max-w-6xl mx-auto w-full">
          <div className="flex flex-col xl:flex-row justify-between items-center w-full gap-6 xl:gap-4">
            {/* Left: Creator */}
            <div className="flex flex-col text-white/50 shrink-0">
              <a href="mailto:oscar.wold.skaarderud@gmail.com" className="group flex flex-col">
                <span className="text-[14px] md:text-[18px] font-black text-white uppercase tracking-tighter leading-none group-hover:text-[#4ECBA8] transition-colors">
                  {t("footer.created")}
                </span>
                <span className="text-[9px] md:text-[10px] font-bold text-white/30 uppercase tracking-[0.3em] mt-1.5 group-hover:text-white/50 transition-colors">
                  oscar.wold.skaarderud@gmail.com
                </span>
              </a>
            </div>

            {/* Right: Nav links */}
            <div className="flex flex-col gap-2 text-[10px] lg:text-[11px] leading-[1.8] text-[#8e8e8e] items-end">
              <h4 className="font-semibold text-white mb-1 text-[11px] lg:text-[12px] uppercase tracking-widest">
                {t("footer.nav")}
              </h4>
              <button onClick={() => router.push("/privacy")} className="hover:text-white transition-colors text-left text-[11px] font-semibold uppercase tracking-widest">
                {t("footer.privacy")}
              </button>
              <button onClick={() => router.push("/terms")} className="hover:text-white transition-colors text-left text-[11px] font-semibold uppercase tracking-widest">
                {t("footer.terms")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
