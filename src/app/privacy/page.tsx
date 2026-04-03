"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Shield, Lock, Eye, Mail } from "lucide-react";
import { motion } from "framer-motion";

export default function PrivacyPage() {
    const router = useRouter();

    const sections = [
        {
            icon: <Shield className="w-5 h-5" />,
            title: "Data Protection",
            content: "LNBG is built with privacy as a core principle. We do not require account registration, and we do not store any personal data or contact information unless you explicitly choose to contact us via email."
        },
        {
            icon: <Lock className="w-5 h-5" />,
            title: "Image Processing",
            content: "The banners you generate are processed locally in your browser. When you click 'Export', our system generates the image on your device. We do not upload your generated banners to our servers."
        },
        {
            icon: <Eye className="w-5 h-5" />,
            title: "Cookies & Tracking",
            content: "We use minimal analytics to understand how many people are using our tool. This is completely anonymous and does not track you across other websites or identify you personally."
        }
    ];

    return (
        <div className="min-h-screen bg-[#F5F4F1] font-sans flex flex-col items-center w-full">
            <header className="w-full max-w-6xl px-4 md:px-8 z-50 relative mt-4">
                <div className="w-full bg-[#1e2d78] rounded-3xl px-6 md:px-8 py-4 md:py-5 flex items-center justify-between shadow-lg">
                    <button onClick={() => router.push("/")} className="text-white font-black text-2xl md:text-3xl tracking-[0.2em] hover:opacity-80 transition-opacity">
                        LNBG
                    </button>
                    <button 
                        onClick={() => router.push("/")}
                        className="bg-white text-[#1e2d78] text-[10px] font-black px-4 py-2.5 rounded-full uppercase tracking-wider flex items-center gap-2"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" /> Back
                    </button>
                </div>
            </header>

            <main className="w-full max-w-4xl px-6 py-16 md:py-24 flex flex-col items-center">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-5xl md:text-7xl font-black text-[#1e2d78] uppercase tracking-tighter mb-4">Privacy Policy</h1>
                    <p className="text-gray-500 font-bold uppercase text-xs tracking-[0.3em]">Last Updated: March 2026</p>
                </motion.div>

                <div className="w-full grid gap-6">
                    {sections.map((sec, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-gray-100"
                        >
                            <div className="flex items-center gap-4 mb-6 text-[#1e2d78]">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                    {sec.icon}
                                </div>
                                <h3 className="text-xl font-black uppercase tracking-tight">{sec.title}</h3>
                            </div>
                            <p className="text-gray-600 font-medium leading-relaxed text-lg">
                                {sec.content}
                            </p>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-16 bg-[#1e2d78] text-white p-12 rounded-[3rem] w-full text-center">
                    <h2 className="text-3xl font-black uppercase tracking-tight mb-4 text-blue-200">Got questions?</h2>
                    <p className="text-blue-100/70 mb-8 font-medium">If you have any concerns regarding your privacy at LNBG, reach out directly to Oscar.</p>
                    <a href="mailto:oscar.w.skaarderud@gmail.com" className="inline-flex items-center gap-2 text-white font-black text-xs uppercase tracking-widest border-b-2 border-white pb-1 hover:opacity-80 transition-opacity">
                        <Mail className="w-4 h-4" /> oscar.w.skaarderud@gmail.com
                    </a>
                </div>
            </main>
        </div>
    );
}
