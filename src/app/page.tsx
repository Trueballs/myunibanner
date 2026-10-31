/* eslint-disable @next/next/no-img-element -- Assets are pre-sized at build time; banner export also needs native image elements. */
"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import HeroVisualization from "@/components/HeroVisualization";
import showcase from "@/data/showcase.json";
import { AnimatePresence,motion } from "framer-motion";
import { X, ImageOff, Search, Scissors, Sparkles } from "lucide-react";
import { useEffect,useState } from "react";

export default function Home() {

  const [selectedBanner, setSelectedBanner] = useState<string | null>(null);

  const banners = showcase.map((img, index) => ({ id: index + 1, img }));

  const [placeholdersIndex, setPlaceholdersIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholdersIndex((prev) => prev + 1);
    }, 25000); // 5x slower: Shift focus every 25 seconds
    return () => clearInterval(timer);
  }, []);

  const handleOpenOnboarding = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("lnbg_open_onboarding"));
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-lexend w-full overflow-x-hidden text-slate-900 selection:bg-blue-100 selection:text-blue-700 relative">
      

      {/* FULL WIDTH COLUMN */}
      <main className="w-full flex flex-col bg-transparent relative z-10">
 
        {/* ─── TOP NAVIGATION ─── */}
        <Header />

        {/* ─── HERO SECTION ─── */}
        <section className="relative z-20 overflow-visible">
          {/* Removed ambient glows for cleaner look */}
 
          <div className="w-full max-w-7xl mx-auto px-6 md:px-12 pt-20 md:pt-36 pb-16 md:pb-24">
            {/* SIDE-BY-SIDE Layout: Content Left, Comparison Visual Right */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20 relative">
              
              {/* ── LEFT CONTENT: HEADING & CTA ── */}
              <div
                className="flex flex-col items-center text-center lg:items-start lg:text-left max-w-3xl lg:w-[50%] z-10"
              >
                <h1 className="font-lexend font-extrabold leading-[1.1] tracking-tight text-[#1a1c20]
                  text-[32px] sm:text-[42px] md:text-[50px] lg:text-[60px] mb-10">
                  The perfect finishing touch <br />
                  for <span className="text-blue-600">your profile.</span>
                </h1>

                <div className="w-full lg:w-max flex justify-center lg:justify-start group">
                  <button
                    onClick={handleOpenOnboarding}
                    className="px-10 md:px-12 py-5 md:py-6 bg-blue-600 text-white font-bold text-[18px] md:text-[20px] rounded-full hover:bg-blue-700 transition-all duration-300 shadow-lg flex items-center justify-center gap-4 active:scale-95"
                  >
                    Create your banner
                    <svg viewBox="0 0 24 24" className="w-6 md:w-7 h-6 md:h-7 fill-none stroke-current stroke-3" strokeWidth={3}>
                      <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* ── RIGHT CONTENT: THE VISUALIZATION ── */}
              <div className="w-full lg:w-[60%] lg:-mr-32 xl:-mr-40 flex justify-center lg:justify-end items-center pointer-events-none">
                <HeroVisualization />
              </div>
            </div>
          </div>
        </section>

        {/* ── LOGO CLOUD ── */}
        <section className="w-full bg-transparent overflow-hidden py-0">
          <div className="w-full max-w-7xl mx-auto px-6 md:px-12">
            <div className="flex flex-wrap items-center justify-center gap-12 md:gap-20 opacity-30 grayscale contrast-125">
              {[
                { name: "BI", src: "/logos/bi gray.png" },
                { name: "Reading", src: "/logos/reading gray.png" },
                { name: "Imperial", src: "/logos/imper gray .png" },
                { name: "NTNU", src: "/logos/ntnu gray.png" },
              ].map((logo) => (
                <div key={logo.name} className="flex items-center h-24 md:h-48">
                  <img 
                    src={logo.src} 
                    alt={logo.name} loading="lazy" decoding="async"
                    className="h-full w-auto object-contain max-w-[500px]" 
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── THE PROBLEM ── */}
        <section className="bg-transparent w-full pt-16 pb-24 md:pt-20 md:pb-32">
          <div className="w-full max-w-7xl mx-auto px-6 md:px-12">
            <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
                Doing it yourself is a <span className="text-blue-600">grind</span>.
              </h2>
              <p className="text-slate-500 text-xl md:text-2xl font-medium mt-6 leading-relaxed">
                To make one decent LinkedIn banner by hand, you have to:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: ImageOff, title: "Hunt for a campus photo", text: "Dig through Google Images for a high-resolution shot of your university that isn't blurry, watermarked or random." },
                { icon: Search, title: "Track down the official logo", text: "Find a clean, correctly-coloured version of your school's logo, usually buried somewhere on their website." },
                { icon: Scissors, title: "Fight with Photoshop", text: "Crop, layer and align everything to LinkedIn's exact banner size, then hope it actually looks professional." },
              ].map((step, i) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="bg-white/80 backdrop-blur-md p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-white flex flex-col items-start text-left"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-8">
                      <Icon className="w-7 h-7 text-slate-700" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-2xl mb-4">{step.title}</h3>
                    <p className="text-slate-600 text-lg font-medium leading-relaxed">{step.text}</p>
                  </motion.div>
                );
              })}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="mt-12 md:mt-16 bg-blue-600 rounded-[2.5rem] p-10 md:p-16 text-center flex flex-col items-center"
            >
              <div className="flex items-center gap-2 text-blue-100 font-semibold mb-5">
                <Sparkles className="w-5 h-5" />
                <span>One search. No Photoshop.</span>
              </div>
              <h3 className="text-3xl md:text-4xl font-extrabold text-white leading-tight max-w-2xl">
                Myunibanner does all of it in about a minute.
              </h3>
              <p className="text-blue-100 text-xl font-medium mt-5 max-w-xl leading-relaxed">
                Search your school, pick a layout, and download a professional banner. The photo and the logo are already built in.
              </p>
              <button
                onClick={handleOpenOnboarding}
                className="mt-10 bg-white text-blue-600 font-bold text-lg px-10 py-4 rounded-full hover:scale-[1.03] transition-transform"
              >
                Create your banner
              </button>
            </motion.div>
          </div>
        </section>

        {/* ── BANNERS SHOWCASE ── */}
        <section className="bg-transparent w-full py-12 md:py-24 overflow-hidden">
          <div className="w-full max-w-7xl mx-auto px-6 md:px-12 text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
              Banners that <span className="text-blue-600">Myunibanner</span> created
            </h2>
          </div>
          
          {/* MOBILE: Vertical Stack */}
          <div className="flex md:hidden flex-col gap-6 px-6">
            {banners.map((banner) => (
              <div key={banner.id} className="w-full aspect-[4/1] rounded-2xl overflow-hidden shadow-lg border-2 border-white bg-white">
                <img loading="lazy" decoding="async" width={1000} height={250} src={banner.img} alt={`Banner ${banner.id}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>

          {/* DESKTOP: Animated Carousel */}
          <div className="hidden md:flex relative w-full h-[400px] items-center justify-center">
            <div className="relative flex items-center justify-center h-full w-full max-w-7xl">
              <AnimatePresence initial={false}>
                {[-2, -1, 0, 1, 2].map((offset) => {
                  const virtualIndex = placeholdersIndex + offset;
                  const bannerIndex = ((virtualIndex % banners.length) + banners.length) % banners.length;
                  const banner = banners[bannerIndex];
                  const isCenter = offset === 0;

                  return (
                    <motion.div
                      key={`${banner.id}-${virtualIndex}`}
                      initial={false}
                      animate={{ 
                        opacity: isCenter ? 1 : Math.abs(offset) > 1 ? 0 : 0.6, 
                        scale: isCenter ? 1.15 : 0.85,
                        zIndex: isCenter ? 20 : 10,
                        x: offset * 900,
                      }}
                      transition={{
                        duration: 2.5,
                        ease: [0.32, 0.72, 0, 1]
                      }}
                      onClick={() => setPlaceholdersIndex(virtualIndex)}
                      className="absolute flex-shrink-0 w-[800px] aspect-[4/1] rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white bg-white cursor-pointer transition-shadow hover:shadow-blue-100/50"
                    >
                      <img loading="lazy" decoding="async" width={1000} height={250} src={banner.img} alt={`Banner ${bannerIndex}`} className="w-full h-full object-cover" />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* ── FINAL CTA SECTION ── */}
        <section className="bg-transparent w-full px-6 md:px-12 py-12 md:py-20">
          <div className="w-full max-w-7xl mx-auto flex flex-col items-center justify-center text-center">
            {/* Content Only */}
            <div className="flex flex-col items-center text-center max-w-3xl">
              <h2 className="text-4xl md:text-[50px] font-extrabold tracking-tight text-slate-900 mb-8 leading-[1.1]">
                <span className="text-blue-600">Transform your profile</span> <br />
                with just one click
              </h2>
              <p className="text-xl md:text-3xl text-slate-500 font-medium mb-12 leading-relaxed">
                Join other students building <br />
                truly professional LinkedIn profiles.
              </p>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent("lnbg_open_onboarding"))}
                className="px-12 py-6 bg-blue-600 text-white font-bold text-[20px] rounded-full hover:bg-blue-700 transition-all duration-300 shadow-lg flex items-center justify-center gap-4 active:scale-95"
              >
                Try it now
                <svg viewBox="0 0 24 24" className="w-7 h-7 fill-none stroke-current stroke-3" strokeWidth={3}>
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </section>

        <Footer />
      </main>

      {/* ── ZOOM MODAL ── */}
      <AnimatePresence>
        {selectedBanner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedBanner(null)}
            className="fixed inset-0 z-[999] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6 cursor-zoom-out"
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              className="relative w-full max-w-6xl aspect-[3/1] rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white"
              onClick={(e) => e.stopPropagation()}
            >
              <img src={selectedBanner} alt="Focused Banner" className="w-full h-full object-cover" />
              <button 
                onClick={() => setSelectedBanner(null)}
                className="absolute top-6 right-6 p-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full text-white transition-all hover:scale-110 active:scale-90"
              >
                <X className="w-6 h-6" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
