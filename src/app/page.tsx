"use client";

import { useState, useRef, useEffect } from "react";
import { Download, X, Mail, Heart, Search, Paintbrush, Plus, Minus, User, Menu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Home() {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleOpenOnboarding = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("lnbg_open_onboarding"));
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F4F1] font-sans flex justify-center w-full px-4 md:px-8 xl:px-12 py-4 md:py-6 gap-6 xl:gap-8 box-border overflow-x-hidden">

      {/* CENTRAL COLUMN */}
      <main className="w-full xl:w-[60%] flex flex-col shrink-0 relative bg-[#F5F4F1]">

        {/* ─── TOP NAVIGATION ─── */}
        <Header />

        {/* ─── HERO SECTION ─── */}
        <section className="relative z-20 bg-[#F5F4F1]">

          <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pt-10 md:pt-12 xl:pt-16 pb-10 md:pb-14">

            {/* UNIFIED Layout: Heading on top, Animation centered, Search below */}
            <div className="flex flex-col items-center gap-0">

              {/* ── TOP CONTENT: MAIN HEADING ── */}
              <motion.div
                className="w-full text-center mb-12 md:mb-16"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="font-black leading-[1.1] tracking-tighter text-[#1B2D7A] uppercase w-full max-w-3xl mx-auto
                  text-4xl md:text-5xl lg:text-5xl">
                  Stop looking like every other graduate.
                </h1>
              </motion.div>

              {/* ── MIDDLE CONTENT: OVERLAPPING ANIMATION ── */}
              <div className="w-full shrink-0 flex justify-center items-center pt-0 pb-0 overflow-visible">
                <div className="relative flex items-center justify-center scale-75 md:scale-85">
                  
                  {/* BEFORE — Bottom layer, shifted left */}
                  <motion.div
                    className="z-10 -mr-32 md:-mr-40"
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="relative shadow-[0_12px_40px_rgba(30,45,120,0.1)] rounded-[1.25rem] w-[240px] md:w-[380px] aspect-[4/3] flex-shrink-0 bg-white border border-gray-100/50 scale-[0.85] md:scale-100">
                      <div className="absolute -top-10 left-2 z-40 inline-flex items-center gap-2 bg-[#FFF8E6] text-[10px] md:text-sm font-bold px-4 md:px-6 py-1.5 md:py-2 rounded-full shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-[#FFD166]" />
                        <span className="text-[#FFD166] leading-none">Before</span>
                      </div>
                      <div className="rounded-[1.25rem] overflow-hidden bg-white flex flex-col h-full">
                        <div className="h-[44px] md:h-[60px] relative flex-shrink-0" style={{ background: "linear-gradient(135deg, #b0bec5, #cfd8dc)" }}>
                          <div className="absolute left-6 bottom-0 translate-y-1/2 w-[40px] md:w-[56px] h-[40px] md:h-[56px] rounded-full bg-white p-1 shadow-sm z-10">
                            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face" className="w-full h-full rounded-full object-cover" alt="Profile" />
                          </div>
                        </div>
                        <div className="pt-8 md:pt-10 px-4 md:px-6 pb-3 md:pb-5 flex-1 text-left flex flex-col justify-center">
                          <p className="font-bold text-[#0F1629] text-[16px] md:text-[19px] leading-tight">Oliver Smith <span className="font-normal text-gray-400 text-[10px] md:text-[13px]">· 1st</span></p>
                          <p className="text-gray-300 text-[10px] md:text-[13px] mt-1">--</p>
                          <p className="text-gray-400 text-[9px] md:text-[12px] mt-3">United Kingdom · <span className="text-[#0A66C2] font-semibold">Contact info</span></p>
                          <div className="flex gap-2 mt-auto pt-2">
                            <span className="px-4 md:px-6 py-1.5 md:py-2.5 bg-[#0A66C2] text-white text-[9px] md:text-[12px] rounded-full font-semibold shadow-sm">✈ Message</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* AFTER — Top layer, overlapping significantly */}
                  <motion.div
                    className="z-20"
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="relative shadow-[0_32px_80px_rgba(30,45,120,0.3)] rounded-[1.25rem] w-[240px] md:w-[380px] aspect-[4/3] flex-shrink-0 bg-white ring-1 ring-[#1B2D7A]/5 scale-[0.95] md:scale-110 translate-y-[-10px]">
                      <div className="absolute -top-10 left-12 z-40 inline-flex items-center gap-2 bg-[#e0f7f0] text-[10px] md:text-sm font-bold px-4 md:px-6 py-1.5 md:py-2 rounded-full shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-[#4ECBA8]" />
                        <span className="text-[#4ECBA8] leading-none">After</span>
                      </div>
                      <div className="rounded-[1.25rem] overflow-hidden bg-white h-full flex flex-col border border-gray-100">
                        <div className="h-[44px] md:h-[60px] relative flex-shrink-0" style={{ background: "#1d4696" }}>
                          <div className="absolute inset-0 flex">
                            <div className="w-1/2 h-full relative overflow-hidden">
                              <img src="/henley-building.jpg" alt="Henley" className="absolute inset-0 w-full h-full object-cover" />
                            </div>
                            <div className="w-1/2 h-full flex items-center justify-end pr-3" style={{ background: "#1d4696" }}>
                              <div className="text-right">
                                <p className="text-white font-extrabold text-[11px] md:text-[14px] leading-tight">Henley</p>
                                <p className="text-white font-bold text-[8px] md:text-[11px] leading-tight">Business School</p>
                                <p className="text-blue-100 text-[4px] md:text-[7px] tracking-widest mt-1 uppercase opacity-80">UNIV. OF READING</p>
                              </div>
                            </div>
                          </div>
                          <div className="absolute top-0 bottom-0 left-1/2 w-[1px]" style={{ background: "#c8a800" }} />
                          <div className="absolute left-6 bottom-0 translate-y-1/2 w-[40px] md:w-[56px] h-[40px] md:h-[56px] rounded-full bg-white p-1 shadow-md z-20">
                            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face" className="w-full h-full rounded-full object-cover" alt="Profile" />
                          </div>
                        </div>
                        <div className="pt-8 md:pt-10 px-4 md:px-6 pb-3 md:pb-5 flex-1 text-left flex flex-col justify-center">
                          <p className="font-bold text-[#0F1629] text-[16px] md:text-[19px] leading-tight">Oliver Smith <span className="font-normal text-gray-400 text-[10px] md:text-[13px]">· 1st</span></p>
                          <p className="text-gray-600 text-[10px] md:text-[13px] mt-1 leading-tight font-medium">MBA Student at Henley Business School</p>
                          <p className="text-gray-400 text-[9px] md:text-[12px] mt-3">United Kingdom · <span className="text-[#0A66C2] font-semibold">Contact info</span></p>
                          <div className="flex gap-2 mt-auto pt-2">
                            <span className="px-4 md:px-6 py-1.5 md:py-2.5 bg-[#0A66C2] text-white text-[9px] md:text-[12px] rounded-full font-semibold shadow-sm">✈ Message</span>
                            <span className="px-4 md:px-6 py-1.5 md:py-2.5 border-[1.5px] border-gray-300 text-gray-600 text-[9px] md:text-[12px] rounded-full font-semibold">More</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                </div>
              </div>

              {/* ── BOTTOM CONTENT: SUBTEXT & SEARCH ── */}
              <motion.div
                className="flex flex-col items-center w-full mt-4 md:mt-6"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <p className="text-[14px] sm:text-[16px] md:text-[17px] text-gray-500 font-medium !text-center max-w-[420px] mx-auto mb-6 md:mb-8 leading-relaxed px-4">
                  Get your custom LinkedIn banner in seconds.
                </p>

                <div className="w-full max-w-[280px] mx-auto flex flex-col px-4">
                  <button
                    onClick={handleOpenOnboarding}
                    className="px-8 py-4 sm:py-5 bg-[#2F52D4] text-white font-black text-[13px] md:text-[15px] uppercase tracking-[0.15em] rounded-full hover:bg-[#4ECBA8] hover:shadow-[0_8px_30px_rgba(78,203,168,0.4)] active:scale-95 active:shadow-md transition-all duration-300 w-full"
                  >
                    GET MY BANNER
                  </button>
                </div>

                <p className="text-gray-400 text-[11px] font-semibold mt-4 !text-center w-full">
                  Takes 5 seconds. No account required.
                </p>
              </motion.div>

            </div>

          </div>

        </section>

        {/* ── LOGO MARQUEE STRIP ── */}
        <div className="relative z-10 w-full px-4 md:px-8 pb-12">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-center text-4xl md:text-5xl font-black tracking-tighter text-[#0F1629] uppercase mb-16">
              Trusted by students at
            </h2>
            <div className="bg-[#1B2D7A] w-full rounded-[2rem] shadow-[0_12px_40px_rgba(0,0,0,0.1)] overflow-hidden py-6 border border-white/5">
              <div
                className="relative overflow-hidden w-full flex items-center"
                style={{
                  maskImage: "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
                  WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
                }}
              >
                <style>{`
                  @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
                  .marquee-track { display: flex; align-items: center; width: max-content; animation: marquee 24s linear infinite; }
                `}</style>
                <div className="marquee-track">
                  {[
                    { slug: "loughborough", h: 80 }, { slug: "durham", h: 150 }, { slug: "exeter", h: 150 }, { slug: "oxford", h: 100 }, { slug: "lse", h: 170 },
                    { slug: "loughborough", h: 80 }, { slug: "durham", h: 150 }, { slug: "exeter", h: 150 }, { slug: "oxford", h: 100 }, { slug: "lse", h: 170 },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-center flex-shrink-0 w-[240px] md:w-[calc((100vw-4rem)/3)] xl:w-[384px] px-8" style={{ height: 130 }}>
                      <img src={`/marquee-logos/${item.slug}.png`} alt={item.slug} style={{ height: item.h > 130 ? 130 : item.h, width: "auto", maxWidth: "100%", objectFit: "contain", opacity: 1 }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── SECTION 2.25: HOW IT WORKS ── */}
        <section className="bg-[#F5F4F1] w-full px-4 md:px-8 border-t border-gray-100">
          <div className="max-w-6xl mx-auto py-12">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-[#0F1629] text-center mb-16 uppercase">
              HOW TO USE OUR SERVICE
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
              {/* Card 1 */}
              <div className="bg-[#E8E6FF] rounded-[2rem] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-300">
                <div className="relative w-32 h-24 mx-auto mb-8 mt-2 flex items-center justify-center">
                  <div className="absolute top-2 right-8 w-14 h-14 bg-blue-400 rounded-full" />
                  <div className="absolute bottom-4 left-6 w-16 h-12 bg-[#0A66C2] rounded-full" />
                  <div className="absolute bottom-4 right-6 w-12 h-10 bg-[#0A66C2] rounded-full" />
                  <div className="absolute bottom-0 right-4 w-12 h-12 bg-white/40 backdrop-blur-xl border-2 border-white/50 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.1)] flex items-center justify-center z-10">
                    <Search
                      className="w-5 h-5 text-[#1B2D7A]"
                      strokeWidth={2.5}
                    />
                  </div>
                </div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">
                  Step 1
                </p>
                <h3 className="text-xl font-bold text-[#0F1629] mb-3">
                  Find Your University
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Search for your UK university to instantly load the official
                  logo and brand colors from our database.
                </p>
              </div>

              {/* Card 2 */}
              <div className="bg-[#E8E6FF] rounded-[2rem] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-300">
                <div className="relative w-32 h-24 mx-auto mb-8 mt-2 flex items-center justify-center">
                  <div className="absolute w-20 h-14 bg-gradient-to-r from-blue-500 to-[#0A66C2] rounded-xl shadow-lg" />
                  <div className="absolute w-16 h-10 bg-white/40 backdrop-blur-xl border-2 border-white/50 rounded-lg shadow-[0_8px_32px_rgba(0,0,0,0.1)] flex items-center justify-center z-10">
                    <Paintbrush
                      className="w-5 h-5 text-[#1B2D7A]"
                      strokeWidth={2.5}
                    />
                  </div>
                </div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">
                  Step 2
                </p>
                <h3 className="text-xl font-bold text-[#0F1629] mb-3">
                  Customize Style
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Choose from professional layout templates and add your
                  personalized headline to stand out.
                </p>
              </div>

              {/* Card 3 */}
              <div className="bg-[#E8E6FF] rounded-[2rem] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-300">
                <div className="relative w-32 h-24 mx-auto mb-8 mt-2 flex flex-col items-center justify-center">
                  <div className="absolute top-4 left-6 w-10 h-8 bg-blue-400 rounded-t-lg" />
                  <div className="absolute top-8 w-20 h-14 bg-[#0A66C2] rounded-lg" />
                  <div className="absolute bottom-0 w-24 h-12 bg-white/50 backdrop-blur-xl border-2 border-white/50 rounded-lg shadow-[0_8px_32px_rgba(0,0,0,0.1)] z-10 flex items-center justify-center">
                    <Download
                      className="w-5 h-5 text-[#1B2D7A]"
                      strokeWidth={2.5}
                    />
                  </div>
                </div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">
                  Step 3
                </p>
                <h3 className="text-xl font-bold text-[#0F1629] mb-3">
                  Export Banner
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Once you are happy with the preview, one-click export to get
                  your high-resolution PNG, ready for LinkedIn.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 2.75: FAQ ── */}
        <section className="bg-[#F5F4F1] w-full px-4 md:px-8 overflow-hidden">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-12 md:gap-24 pt-12 pb-24">
            {/* Left: Heading */}
            <div className="md:w-1/3 pt-4">
              <h2 className="text-7xl md:text-8xl font-black tracking-tighter text-[#0F1629] uppercase leading-[0.8]">
                FAQ
              </h2>
            </div>

            {/* Right: Accordion Items */}
            <div className="md:w-2/3 flex flex-col gap-4">
              {[
                {
                  q: "How does LNBackground work?",
                  a: "Search for your university, choose a design, add your headline, and export your banner in one click. Our tool automatically fetches official logos and brand colors so you don't have to design anything manually.",
                },
                {
                  q: "Is the service really free?",
                  a: "Yes, LNBackground is completely free for students and professionals in the UK who want to upgrade their LinkedIn profile quickly and professionally.",
                },
                {
                  q: "Does it work for my university?",
                  a: "We currently support over 130 UK universities with their official logos and brand colors integrated directly into our tool.",
                  button: "Check if your school is registered"
                },
                {
                  q: "What format will I receive the banner in?",
                  a: "You will receive a high-resolution .png file, perfectly tailored to LinkedIn's official dimensions (1584 x 396 pixels).",
                },
                {
                  q: "Do I need an account to use the tool?",
                  a: "No, you can generate and download your banner immediately without needing to log in or share any personal data.",
                },
                {
                  q: "Can I use the tool on mobile?",
                  a: "Absolutely! The site is fully responsive, though we recommend using a desktop for the best overall user experience.",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="bg-[#E8E6FF] rounded-[1.5rem] md:rounded-[2rem] overflow-hidden transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-gray-100/50"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full px-8 py-7 md:py-9 flex items-center justify-between text-left group"
                  >
                    <span className="text-lg md:text-xl font-bold text-[#0F1629] group-hover:text-[#0A66C2] transition-colors pr-8">
                      {item.q}
                    </span>
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                      {openFaq === idx ? (
                        <Minus
                          className="w-6 h-6 text-gray-400"
                          strokeWidth={1}
                        />
                      ) : (
                        <Plus className="w-6 h-6 text-gray-400" strokeWidth={1} />
                      )}
                    </div>
                  </button>
                  <AnimatePresence initial={false}>
                    {openFaq === idx && (
                      <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                          duration: 0.3,
                          ease: [0.04, 0.62, 0.23, 0.98],
                        }}
                      >
                        <div className="px-8 pb-10 md:pb-12 pt-0">
                          <p className="text-gray-500 text-base md:text-lg leading-relaxed max-w-2xl font-medium mb-6">
                            {item.a}
                          </p>
                          {item.button && (
                            <button className="px-6 py-2.5 bg-[#2F52D4] text-white text-sm font-bold rounded-full shadow-sm hover:bg-[#4ECBA8] transition-colors flex items-center gap-2">
                              <span>{item.button}</span>
                              <Search className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SECTION 3: FOOTER ── */}
        <section className="bg-[#F5F4F1] w-full transition-all duration-500 overflow-hidden">
          <Footer />
        </section>
      </main>

    </div>
  );
}
