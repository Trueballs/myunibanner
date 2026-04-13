"use client";

import { Scale, Copyright, AlertTriangle, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function TermsPage() {
    const terms = [
        {
            icon: <Scale className="w-5 h-5" />,
            title: "Usage Agreement",
            content: "By using Myunibanner, you agree to generate and use the content for personal LinkedIn profile enhancement only. You may not use this tool for mass commercial distribution or any form of impersonation."
        },
        {
            icon: <Copyright className="w-5 h-5" />,
            title: "Intellectual Property",
            content: "All university logos, crests, and brand trademarks remain the exclusive property of their respective institutions. Myunibanner provides these assets as a service to students of these institutions and does not claim any ownership over university brand assets."
        },
        {
            icon: <AlertTriangle className="w-5 h-5" />,
            title: "Fair Use",
            content: "You are responsible for ensuring that your use of the generated banner complies with your institution's and LinkedIn's community guidelines. Myunibanner is a tool provided 'as-is' without warranties of any kind."
        }
    ];

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col items-center w-full overflow-x-hidden">
            <Header showBackButton />
            <main className="w-full max-w-7xl flex flex-col relative px-4 md:px-8">
                <div className="w-full pt-12 md:pt-16 pb-24">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-16"
                    >
                        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-4">Terms of Service</h1>
                        <p className="text-slate-500 font-bold uppercase text-xs tracking-[0.3em]">Last Updated: April 2026</p>
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
                                <div className="flex items-center gap-4 mb-6 text-blue-600">
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

                    <div className="mt-16 bg-slate-900 text-white p-12 rounded-[3rem] w-full flex flex-col items-center">
                        <div className="w-16 h-16 bg-blue-600/30 rounded-full flex items-center justify-center mb-6">
                            <CheckCircle className="w-8 h-8 text-blue-200" />
                        </div>
                        <h2 className="text-3xl font-black uppercase tracking-tight mb-4">Agreement</h2>
                        <p className="text-blue-100/70 max-w-md font-medium text-center">By continuing to use Myunibanner, you agree to these simplified, student-first terms of service.</p>
                    </div>
                </div>

                <Footer />
            </main>
        </div>
    );
}
