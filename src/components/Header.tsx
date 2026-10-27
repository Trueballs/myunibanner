/* eslint-disable @next/next/no-img-element -- Assets are pre-sized at build time; banner export also needs native image elements. */
"use client";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface HeaderProps {
  showStartButton?: boolean;
  showBackButton?: boolean;
  activeBrand?: { name: string; logo: string } | null;
}
export default function Header({ showStartButton = false, showBackButton = false }: HeaderProps) {
  return <header className="sticky top-0 z-[100] w-full border-b border-slate-900/15 bg-slate-50/90 backdrop-blur-md">
    <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-4 md:px-12 md:py-5">
      <Link href="/" aria-label="Myunibanner home" className="shrink-0">
        <img src="/assets/logo.png" alt="Myunibanner" width={1024} height={270} className="h-7 w-auto object-contain md:h-11" />
      </Link>
      <div className="flex items-center justify-end gap-2 md:gap-4">
        <Link href="/about" className="rounded-md px-1 py-2 text-xs font-semibold text-slate-600 hover:text-blue-600 focus-visible:outline-2 focus-visible:outline-blue-600 md:text-sm">About<span className="hidden sm:inline"> the project</span></Link>
        {showStartButton && <button type="button" onClick={() => window.dispatchEvent(new CustomEvent("lnbg_open_onboarding"))} className="rounded-full bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700 md:text-sm">Change school</button>}
        {showBackButton && <Link href="/" className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-3 py-2.5 text-xs font-bold text-slate-900 md:text-sm"><ArrowLeft size={16} /><span className="hidden sm:inline">Back</span></Link>}
        {!showStartButton && <a href="https://www.linkedin.com/in/oscar-wold-skaarderud-613644340" target="_blank" rel="noopener noreferrer" className="rounded-full bg-blue-600 px-3 py-2.5 text-xs font-bold text-white hover:bg-blue-700 md:px-5 md:text-sm">Contact</a>}
      </div>
    </div>
  </header>;
}
