"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { motion } from "framer-motion";
import { Eye,Lock,Shield } from "lucide-react";

export default function PrivacyPage() {

    const sections = [
        {
            icon: <Shield className="w-5 h-5" />,
            title: "Data Protection",
            content: "Myunibanner is built with privacy as a core principle. We do not require account registration, and we do not store any personal data or contact information unless you explicitly choose to contact us via email."
        },
        {
            icon: <Lock className="w-5 h-5" />,
            title: "Image Processing",
            content: "Your photos and banner are processed in your browser. Uploading a photo keeps it on your device, and the PNG is generated locally when you download it. We store your most recently selected university and automatically save banner drafts, including design choices and uploaded photos, in your browser on this device. Drafts are saved separately for each school and campus. Reset design replaces the saved draft with a blank design; clearing this site’s browser data removes local drafts."
        },
        {
            icon: <Eye className="w-5 h-5" />,
            title: "Cookies & Tracking",
            content: "We use Vercel Analytics to understand aggregate site usage. The site also loads a Google advertising script, and example avatars are fetched from DiceBear. Those providers receive browser requests and may process technical information such as your IP address. Your uploaded photos are not sent to them."
        }
    ];

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans w-full overflow-x-hidden">
            <Header showBackButton />
            <main className="w-full max-w-7xl mx-auto flex flex-col relative px-6 md:px-12">
                <div className="w-full max-w-3xl mx-auto pt-16 md:pt-24 pb-24 px-6">
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-12 border-b border-slate-200 pb-10"
                    >
                        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">Privacy Policy</h1>
                        <p className="text-slate-500 font-medium text-sm">Last Updated: October 2026</p>
                    </motion.div>
 
                    <div className="space-y-12">
                        {sections.map((sec, i) => (
                            <motion.section 
                                key={i}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className="prose prose-slate max-w-none"
                            >
                                <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4">{sec.title}</h2>
                                <p className="text-slate-600 leading-relaxed text-base md:text-lg">
                                    {sec.content}
                                </p>
                            </motion.section>
                        ))}
                    </div>

                    <div className="mt-20 pt-10 border-t border-slate-200">
                        <h2 className="text-xl font-bold text-slate-900 mb-4">Questions?</h2>
                        <p className="text-slate-600 mb-4">
                            If you have any concerns regarding your privacy at Myunibanner, reach out directly to Oscar:
                        </p>
                        <a href="mailto:oscar.w.skaarderud@gmail.com" className="text-blue-600 font-bold hover:underline">
                            oscar.w.skaarderud@gmail.com
                        </a>
                    </div>
                </div>

            </main>
            <Footer />
        </div>
    );
}
