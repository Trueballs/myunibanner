"use client";

import { motion } from "framer-motion";
import { CheckCircle2, ShieldCheck, Zap, Globe, Cpu, Layout, FileCode, Server } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Section = ({ title, children, icon: Icon }: { title: string; children: React.ReactNode; icon: any }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="bg-white/80 backdrop-blur-xl border border-slate-200/50 p-8 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300"
  >
    <div className="flex items-center gap-4 mb-6">
      <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
        <Icon className="w-6 h-6" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
    </div>
    <div className="space-y-4 text-slate-600 leading-relaxed">
      {children}
    </div>
  </motion.div>
);

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header />
      
      <main className="max-w-5xl mx-auto px-6 py-20 md:py-32">
        {/* Hero Header */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-bold mb-6"
          >
            <Zap className="w-4 h-4" />
            Teknisk Gjennomgang
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight"
          >
            Hvordan fungerer <br />
            <span className="text-blue-600">LinkedIn Banner Generator?</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-slate-500 max-w-2xl mx-auto"
          >
            En dypere titt på teknologien bak det raskeste verktøyet for å oppgradere din profesjonelle profil.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Hva er det? */}
          <Section title="Hva er det?" icon={Layout}>
            <p>
              En spesialisert web-applikasjon designet for å skape profesjonelle bakgrunnsbilde for LinkedIn.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Laste opp JPG/PNG bilde
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Legge til tekst (tittel, undertittel)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Generere LinkedIn banner PNG
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Laste ned og lime direkte inn i LinkedIn
              </li>
            </ul>
          </Section>

          {/* Hvordan fungerer det? */}
          <Section title="Frontend Logikk" icon={Globe}>
            <p>
              Alt skjer lokalt i din nettleser via <strong>HTML5 Canvas</strong>. Vi sender aldri dine bilder til en server.
            </p>
            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl text-sm font-medium">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span>Lag 1</span>
                <span className="text-slate-400 font-normal">Bakgrunnsbilde (Ditt bilde)</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span>Lag 2</span>
                <span className="text-slate-400 font-normal">Svart overlay (Gjennomsiktig)</span>
              </div>
              <div className="flex justify-between">
                <span>Lag 3</span>
                <span className="text-slate-400 font-normal">Tekst (Tittel & Undertittel)</span>
              </div>
            </div>
          </Section>

          {/* Teknisk Stack */}
          <Section title="Teknisk Stack" icon={Cpu}>
            <div className="overflow-hidden rounded-2xl border border-slate-100">
              <table className="w-full text-left">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">Del</th>
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">Teknologi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 italic">
                  <tr>
                    <td className="px-4 py-3 text-sm">Frontend</td>
                    <td className="px-4 py-3 text-sm text-blue-600">HTML5 Canvas + Framer Motion</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm">Logikk</td>
                    <td className="px-4 py-3 text-sm text-blue-600">React + Next.js</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm">Backend</td>
                    <td className="px-4 py-3 text-sm text-blue-600">Node.js + Express</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm">Hosting</td>
                    <td className="px-4 py-3 text-sm text-blue-600">Vercel (Cloud Hosting)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Section>

          {/* Sikkerhet & Privacy */}
          <Section title="Sikkerhet & Personvern" icon={ShieldCheck}>
            <div className="space-y-4">
              <div className="flex gap-4 p-3 bg-green-50 rounded-2xl">
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                <p className="text-sm text-green-800">Ingen data lagres på server – alt prosesseres lokalt.</p>
              </div>
              <div className="flex gap-4 p-3 bg-green-50 rounded-2xl">
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                <p className="text-sm text-green-800">Ingen innlogging eller registrering kreves.</p>
              </div>
              <div className="flex gap-4 p-3 bg-green-50 rounded-2xl">
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                <p className="text-sm text-green-800">Ingen sporing eller cookies til annonsebruk.</p>
              </div>
            </div>
          </Section>
        </div>

        {/* Dataflow Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden"
        >
          {/* Abstract background blobs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-[100px] rounded-full" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/10 blur-[100px] rounded-full" />

          <h2 className="text-3xl font-bold mb-10 relative z-10 flex items-center gap-3">
             <Server className="w-8 h-8 text-blue-400" />
             Dataflyt
          </h2>

          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            {[
              { label: "Bruker", sub: "HTML Form" },
              { label: "JavaScript", sub: "Tegner" },
              { label: "Canvas", sub: "Element" },
              { label: "PNG-fil", sub: "Genereres" },
              { label: "Nedlasting", sub: "Lokalt" }
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center font-bold text-blue-400 border border-white/20">
                  {i + 1}
                </div>
                <div>
                  <p className="font-bold text-lg">{step.label}</p>
                  <p className="text-slate-400 text-sm">{step.sub}</p>
                </div>
                {i < 4 && (
                  <div className="hidden md:block absolute top-1/2 -translate-y-1/2 h-[2px] bg-gradient-to-r from-blue-500/50 to-transparent w-12" style={{ left: `calc(${20 * (i + 1)}% - 24px)` }} />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Files Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-white p-6 rounded-3xl border border-slate-200 flex items-center gap-4">
              <FileCode className="w-8 h-8 text-orange-500" />
              <div>
                <p className="font-bold text-slate-900">index.js</p>
                <p className="text-xs text-slate-500">Node.js Server</p>
              </div>
           </div>
           <div className="bg-white p-6 rounded-3xl border border-slate-200 flex items-center gap-4">
              <Zap className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="font-bold text-slate-900">package.json</p>
                <p className="text-xs text-slate-500">Libraries & Deps</p>
              </div>
           </div>
           <div className="bg-white p-6 rounded-3xl border border-slate-200 flex items-center gap-4">
              <Layout className="w-8 h-8 text-blue-500" />
              <div>
                <p className="font-bold text-slate-900">index.html</p>
                <p className="text-xs text-slate-500">Frontend UI</p>
              </div>
           </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
