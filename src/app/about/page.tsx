"use client";

import { useRouter } from "next/navigation";
import { Mail, Linkedin, Sparkles, Rocket, Users, Globe } from "lucide-react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function AboutPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-[#F5F4F1] font-sans flex justify-center w-full px-4 md:px-8 xl:px-12 py-4 md:py-6 gap-6 xl:gap-8 box-border overflow-x-hidden">
            <main className="w-full xl:w-[60%] flex flex-col shrink-0 relative bg-[#F5F4F1]">
                {/* ─── TOP NAVIGATION ─── */}
                <Header showStartButton />

                {/* ─── ABOUT PAGE CONTENT ─── */}
                <section className="pt-10 md:pt-12 xl:pt-16 pb-32 px-4 max-w-4xl mx-auto space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="space-y-12"
                    >
                        {/* Mission Box */}
                        <div className="bg-white rounded-[2.5rem] p-8 md:p-14 shadow-sm border border-gray-100 ring-1 ring-black/[0.02] relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                            
                            <div className="inline-flex items-center gap-2 mb-10 border-b border-gray-50 pb-4 w-full">
                                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Our Mission</h3>
                            </div>
                            
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#1B2D7A] uppercase tracking-tighter leading-[0.95] mb-8">
                                Leveling the <br/>playing field.
                            </h1>
                            <p className="text-gray-500 font-medium text-lg leading-relaxed max-w-2xl">
                                We believe every student deserves to look professional from day one. LNBG was built to automate the branding process, giving every graduate a fair chance at a professional first impression.
                            </p>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 pt-12 border-t border-gray-50">
                                {[
                                    { icon: Rocket, title: "Speed", desc: "Branding in seconds." },
                                    { icon: Users, title: "Access", desc: "No design skills needed." },
                                    { icon: Globe, title: "Global", desc: "Supporting UK & Norway." }
                                ].map((item, i) => (
                                    <div key={i} className="space-y-2">
                                        <item.icon className="w-5 h-5 text-blue-500 mb-2" />
                                        <h4 className="font-bold text-[#1B2D7A] text-sm uppercase tracking-tight">{item.title}</h4>
                                        <p className="text-xs text-gray-400 font-medium leading-relaxed">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Founder Card */}
                        <div className="bg-white rounded-[2.5rem] p-8 md:p-14 shadow-sm border border-gray-100 ring-1 ring-black/[0.02] flex flex-col md:flex-row items-center gap-10 md:gap-16 relative overflow-hidden">
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full -ml-16 -mb-16 blur-2xl opacity-50" />
                            
                            <div className="relative shrink-0">
                                <img 
                                    src="/oscar.jpg" 
                                    alt="Oscar Wold Skaarderud" 
                                    className="w-40 h-40 md:w-56 md:h-56 object-cover rounded-3xl shadow-xl border-4 border-white transition-all duration-500 hover:scale-[1.02]"
                                />
                                <div className="absolute -bottom-3 -right-3 bg-white px-3 py-1.5 rounded-xl shadow-lg border border-gray-100 flex items-center gap-2">
                                    <span className="text-lg leading-none">🇳🇴</span>
                                    <span className="text-[9px] font-black text-[#1B2D7A] uppercase tracking-widest">Founder</span>
                                </div>
                            </div>
                            
                            <div className="flex-1 text-center md:text-left relative z-10">
                                <div className="mb-6">
                                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Meet the Founder</h3>
                                    <h2 className="text-3xl font-black text-[#1B2D7A] uppercase tracking-tighter">Oscar Wold Skaarderud</h2>
                                </div>
                                <p className="text-gray-500 font-medium text-[16px] leading-relaxed mb-8">
                                    I'm a Norwegian student at <span className="text-[#1B2D7A] font-bold">Henley Business School</span>. I built LNBG to give every student a fair chance at a professional first impression. Your brand is your future—let's make it count.
                                </p>
                                
                                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                    <a 
                                        href="https://www.linkedin.com/in/oscar-wold-skaarderud-613644340/" 
                                        target="_blank" rel="noopener noreferrer"
                                        className="px-8 py-4 bg-[#1B2D7A] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[#4ECBA8] transition-all hover:-translate-y-1 shadow-md w-full sm:w-auto"
                                    >
                                        <Linkedin className="w-3.5 h-3.5" /> Follow LinkedIn
                                    </a>
                                    <a 
                                        href="mailto:oscar.w.skaarderud@gmail.com" 
                                        className="px-8 py-4 bg-white text-gray-500 border-2 border-gray-100 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:border-gray-300 transition-all hover:-translate-y-1 shadow-sm w-full sm:w-auto"
                                    >
                                        <Mail className="w-3.5 h-3.5" /> Message me
                                    </a>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </section>

                {/* ── SECTION 3: FOOTER ── */}
                <section className="bg-[#F5F4F1] w-full transition-all duration-500 overflow-hidden">
                    <Footer />
                </section>
            </main>
        </div>
    );
}
