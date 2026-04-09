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
    <footer className="w-full px-4 md:px-8 py-4 flex flex-col items-center">
      <div className="w-full max-w-5xl border-t border-gray-300 shadow-sm" />
      
      <div className="mt-6 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-[#1a1a1a] font-normal text-[15px]">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => router.push("/privacy")} 
            className="border-b-2 border-[#1a1a1a] pb-0.5 hover:opacity-70 transition-opacity cursor-pointer font-medium"
          >
            Privacy Policy
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => router.push("/terms")} 
            className="border-b-2 border-[#1a1a1a] pb-0.5 hover:opacity-70 transition-opacity cursor-pointer font-medium"
          >
            Terms of Service
          </button>
        </div>

        <div className="flex items-center gap-2">
          <a 
            href="mailto:oscar.w.skaarderud@gmail.com" 
            className="border-b-2 border-[#1a1a1a] pb-0.5 hover:opacity-70 transition-opacity cursor-pointer font-medium"
          >
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
