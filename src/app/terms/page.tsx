"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Scale, Copyright, AlertTriangle, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function TermsPage() {
    const router = useRouter();

    const terms = [
        {
            icon: <Scale className="w-5 h-5" />,
            title: "Usage Agreement",
            content: "By using LNBG, you agree to generate and use the content for personal LinkedIn profile enhancement only. You may not use this tool for mass commercial distribution or any form of impersonation."
        },
        {
            icon: <Copyright className="w-5 h-5" />,
            title: "Intellectual Property",
            content: "All university logos, crests, and brand trademarks remain the exclusive property of their respective institutions. LNBG provides these assets as a service to students of these institutions and does not claim any ownership over university brand assets."
        },
        {
            icon: <AlertTriangle className="w-5 h-5" />,
            title: "Fair Use",
            content: "You are responsible for ensuring that your use of the generated banner complies with your institution's and LinkedIn's community guidelines. LNBG is a tool provided 'as-is' without warranties of any kind."
        }
    ];

    return (
        <div className="min-h-screen bg-[#F5F4F1] font-sans flex flex-col items-center w-full">
            <header className="w-full max-w-6xl px-4 md:px-8 z-50 relative mt-4">
                <div className="w-full bg-[#1B2D7A] rounded-3xl px-6 md:px-8 py-4 md:py-5 flex items-center justify-between shadow-lg">
                    <button onClick={() => router.push("/")} className="text-white font-black text-2xl md:text-3xl tracking-[0.2em] leading-none hover:opacity-80 transition-opacity">
                        LNBG
                    </button>
                    <button 
                        onClick={() => router.push("/")}
                        className="bg-white text-[#1B2D7A] text-[10px] font-black px-4 py-2.5 rounded-full uppercase tracking-wider flex items-center gap-2"
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
                    <h1 className="text-5xl md:text-7xl font-black text-[#1B2D7A] uppercase tracking-tighter mb-4">Terms of Service</h1>
                    <p className="text-gray-500 font-bold uppercase text-xs tracking-[0.3em]">Last Updated: March 2026</p>
                </motion.div>

                <div className="w-full grid gap-6">
                    {terms.map((term, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-gray-100"
                        >
                            <div className="flex items-center gap-4 mb-6 text-[#1B2D7A]">
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                                    {term.icon}
                                </div>
                                <h3 className="text-xl font-black uppercase tracking-tight">{term.title}</h3>
                            </div>
                            <p className="text-gray-600 font-medium leading-relaxed text-lg">
                                {term.content}
                            </p>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-16 bg-[#1B2D7A] text-white p-12 rounded-[3rem] w-full flex flex-col items-center">
                    <div className="w-16 h-16 bg-blue-600/30 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle className="w-8 h-8 text-blue-200" />
                    </div>
                    <h2 className="text-3xl font-black uppercase tracking-tight mb-4">Agreement</h2>
                    <p className="text-blue-100/70 max-w-md font-medium">By continuing to use LNBG, you agree to these simplified, student-first terms of service.</p>
                </div>
            </main>
        </div>
    );
}
