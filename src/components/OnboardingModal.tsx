/* eslint-disable @next/next/no-img-element -- Assets are pre-sized at build time; banner export also needs native image elements. */
"use client";

import availability from "@/data/availability.json";
import { ALL_UNIVERSITIES,University } from "@/data/universities";
import { ChevronRight,Search,X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect,useRef,useState } from "react";

export default function OnboardingModal() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("");
  const [campusSchool, setCampusSchool] = useState<University | null>(null);
  const [recent, setRecent] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const open = () => {
      openerRef.current = document.activeElement as HTMLElement;
      setQuery(""); setCampusSchool(null);
      try { setRecent(localStorage.getItem("lnbg_last_school")); } catch { /* Storage is optional. */ }
      dialogRef.current?.showModal();
      inputRef.current?.focus();
    };
    window.addEventListener("lnbg_open_onboarding", open);
    return () => window.removeEventListener("lnbg_open_onboarding", open);
  }, []);

  const close = () => dialogRef.current?.close();
  const go = (school: University, campus?: string) => {
    try { localStorage.setItem("lnbg_last_school", school.domain); } catch { /* Storage is optional. */ }
    const params = new URLSearchParams({ domain: school.domain });
    if (campus) params.set("campus", campus);
    close();
    router.push(`/build?${params}`);
  };
  const choose = (school: University) => {
    if (school.campuses && school.campuses.length > 1) setCampusSchool(school);
    else go(school, school.campuses?.[0]);
  };
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const schools = ALL_UNIVERSITIES.filter(school => {
    if (!availability[school.domain as keyof typeof availability]?.available) return false;
    if (country && school.country !== country) return false;
    const text = [school.name, school.short, school.domain, ...(school.aliases || []), ...(school.campuses || [])].join(" ").toLowerCase();
    return words.every(word => text.includes(word));
  }).sort((a, b) => {
    return Number(b.domain === recent) - Number(a.domain === recent) || a.name.localeCompare(b.name);
  });

  return (
    <dialog ref={dialogRef} aria-labelledby="school-picker-title"
      onClose={() => openerRef.current?.focus()}
      onClick={event => { if (event.target === event.currentTarget) close(); }}
      className="m-auto w-[calc(100%_-_2rem)] max-w-xl max-h-[85dvh] rounded-3xl border-0 p-0 shadow-2xl backdrop:bg-slate-900/50 backdrop:backdrop-blur-sm">
      <div className="flex max-h-[85dvh] flex-col bg-white text-slate-900">
        <div className="flex items-start justify-between gap-4 p-6 pb-4">
          <div>
            <h2 id="school-picker-title" className="text-2xl font-bold">{campusSchool ? "Choose your campus" : "Find your university"}</h2>
            <p className="mt-1 text-sm text-slate-500">{campusSchool?.name || "Pick your school, customise your banner, and download."}</p>
          </div>
          <button type="button" onClick={close} aria-label="Close university picker" className="rounded-full p-2 hover:bg-slate-100"><X size={20} /></button>
        </div>
        {campusSchool ? (
          <div className="overflow-y-auto p-6 pt-0">
            <button type="button" onClick={() => setCampusSchool(null)} className="mb-4 text-sm font-semibold text-blue-600">← All universities</button>
            {campusSchool.campuses?.map(campus => (
              <button type="button" key={campus} onClick={() => go(campusSchool, campus)} className="mb-2 flex w-full items-center justify-between rounded-xl border border-slate-200 p-4 text-left hover:bg-blue-50">
                {campus}<ChevronRight size={18} />
              </button>
            ))}
          </div>
        ) : <>
          <div className="space-y-3 px-6 pb-4">
            <label className="relative block">
              <span className="sr-only">Search universities or campuses</span>
              <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
              <input ref={inputRef} value={query} onChange={event => setQuery(event.target.value)}
                onKeyDown={event => { if (event.key === 'Enter') { const school = schools.find(s => availability[s.domain as keyof typeof availability].available); if (school) choose(school); } }}
                placeholder="University, abbreviation or campus…" className="w-full rounded-xl border border-slate-200 py-3 pl-12 pr-4 focus:border-blue-600 focus:outline-2 focus:outline-blue-200" />
            </label>
            <label className="flex items-center gap-3 text-sm text-slate-600">Country
              <select value={country} onChange={event => setCountry(event.target.value)} className="min-w-0 flex-1 rounded-lg border border-slate-200 p-2">
                <option value="">All countries</option><option>United Kingdom</option><option>Norway</option>
              </select>
            </label>
          </div>
          <div className="overflow-y-auto border-t border-slate-100" aria-label="University results">
            {schools.map(school => {
              const asset = availability[school.domain as keyof typeof availability];
              return <button type="button" key={school.domain} disabled={!asset.available} onClick={() => choose(school)}
                className="flex w-full items-center gap-4 border-b border-slate-100 px-6 py-4 text-left hover:enabled:bg-blue-50 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-xs font-bold">
                  {asset.icon ? <img src={asset.icon} width={96} height={96} loading="lazy" alt="" className="h-9 w-9 object-contain" /> : (school.short || school.name).slice(0, 3).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1"><span className="block text-sm font-bold">{school.name}</span>
                  <span className="block text-xs text-slate-500">{school.domain === recent ? "Your recent university" : asset.photoCount === 0 ? "Logo available · upload your own campus photo" : school.country}</span>
                </span>
                {asset.available && <ChevronRight size={18} />}
              </button>;
            })}
            {schools.length === 0 && <p className="p-6 text-sm text-slate-500" role="status">No universities match your search. Try another name or country.</p>}
          </div>
          <div className="p-4 text-center text-sm"><a className="font-semibold text-blue-600 underline" href="mailto:oscar.w.skaarderud@gmail.com?subject=University%20asset%20request">Missing your school or campus? Request it here</a></div>
        </>}
      </div>
    </dialog>
  );
}
