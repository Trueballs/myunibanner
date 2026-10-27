import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "The story behind Myunibanner",
  description: "Why I built Myunibanner, how it works, and what I learned along the way.",
};

export default function AboutPage() {
  return <div className="min-h-screen bg-[#F8FAFC] text-slate-900">
    <Header />
    <main className="mx-auto w-full max-w-7xl px-6 pb-20 pt-14 sm:pt-20 md:px-12">
      <header className="text-center">
        <p className="text-sm text-slate-500">A project by Oscar</p>
        <h1 className="mt-4 text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl">A better banner.<br /><span className="text-blue-600">Less effort.</span></h1>
        <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-slate-600 sm:text-lg">I built Myunibanner to help students create a university LinkedIn banner in a few clicks.</p>
      </header>
      <div className="mt-12 space-y-9 sm:mt-14 sm:space-y-10">
        <section aria-labelledby="why">
          <h2 id="why" className="text-xl font-bold">Why I made it</h2>
          <p className="mt-3 leading-relaxed text-slate-600">Finding a sharp university logo, a good campus photo and putting them together in Photoshop takes more effort than it should. AI can help, but you still need to check the logo and adjust the result.</p>
          <p className="mt-3 leading-relaxed text-slate-600">I wanted to bring those steps into one place: choose your school, pick a design and download. The goal was a banner in about a minute.</p>
        </section>
        <section aria-labelledby="build">
          <h2 id="build" className="text-xl font-bold">How it works</h2>
          <p className="mt-3 leading-relaxed text-slate-600">Logos and campus photos are prepared ahead of time so the editor can load smaller files. You see changes live, your draft stays on your device, and the finished banner exports in your browser as a 1584 × 396 PNG. No account needed.</p>
          <dl className="mt-5 grid gap-x-5 gap-y-3 border-l-2 border-blue-100 pl-4 text-sm sm:grid-cols-[7rem_1fr]">
            <dt className="font-medium text-slate-900">Written in</dt>
            <dd className="-mt-2 leading-relaxed text-slate-600 sm:mt-0">TypeScript and JavaScript, with HTML and CSS</dd>
            <dt className="font-medium text-slate-900">Built with</dt>
            <dd className="-mt-2 leading-relaxed text-slate-600 sm:mt-0">Next.js, React and Tailwind CSS</dd>
            <dt className="font-medium text-slate-900">Under the hood</dt>
            <dd className="-mt-2 leading-relaxed text-slate-600 sm:mt-0">Sharp for image preparation, html-to-image for export, IndexedDB for drafts. Hosted on Vercel.</dd>
          </dl>
        </section>
        <section aria-labelledby="learned">
          <h2 id="learned" className="text-xl font-bold">What I learned</h2>
          <p className="mt-3 leading-relaxed text-slate-600">I tried selling access to schools, but the schools I approached were not willing to pay. Something useful for students was not necessarily a budget priority for a university.</p>
          <p className="mt-3 leading-relaxed text-slate-600">Next time, I would test willingness to pay earlier. For now, I’m keeping the tool simple and working on better asset coverage and reliability.</p>
        </section>
      </div>
      <div className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-4 border-t border-slate-200 pt-8">
        <Link href="/build" className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-700">Create your banner <ArrowUpRight size={17} /></Link>
        <a href="https://www.linkedin.com/in/oscar-wold-skaarderud-613644340" target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-slate-600 hover:text-blue-600">Get in touch ↗</a>
      </div>
      <p className="mt-7 text-xs leading-relaxed text-slate-500">An independent project. Not affiliated with or endorsed by the universities shown.</p>
    </main>
    <Footer />
  </div>;
}
