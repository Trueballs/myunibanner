"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronRight, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { searchUniversities, University } from "@/data/universities";

const LANGUAGES = ["English", "Spanish", "Chinese", "Hindi", "Arabic", "French", "Portuguese"];
const COUNTRIES = ["United Kingdom", "Norway", "United States", "Canada", "Australia", "New Zealand", "Ireland"];
const DEGREES = ["Bachelor (BA)", "BSc", "Master (MA)", "MSc", "MBA", "PhD", "Exchange", "Other"];
const YEARS = ["1st Year", "2nd Year", "3rd / Final Year", "Alumni / Grad"];
const INDUSTRIES = ["Tech & IT", "Finance & Banking", "Consulting", "Marketing", "Law", "Healthcare", "Engineering", "Other"];

export default function OnboardingModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  // University Search State
  const [uniQuery, setUniQuery] = useState("");
  const [uniSuggestions, setUniSuggestions] = useState<University[]>([]);
  const [selectedCampusUni, setSelectedCampusUni] = useState<University | null>(null);

  // Data
  const [data, setData] = useState({
    country: "",
    language: "English",
    degree: "",
    year: "",
    industry: "",
  });

  useEffect(() => {
    // 1. Load initial data from localStorage
    const savedData = localStorage.getItem("lnbg_user_data");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setData(prev => ({ ...prev, ...parsed }));
      } catch (e) {}
    }

    // 2. Auto-open logic for NEW users
    const hasCompleted = localStorage.getItem("lnbg_onboarding_done");
    let timer: NodeJS.Timeout;
    if (!hasCompleted) {
      timer = setTimeout(() => setIsOpen(true), 1500);
    }

    // 3. Manual open logic (clicking the button)
    const handleOpen = () => {
      // Re-load data when manually opened to be sure it's fresh
      const freshData = localStorage.getItem("lnbg_user_data");
      if (freshData) {
        try { setData(prev => ({ ...prev, ...JSON.parse(freshData) })); } catch (e) {}
      }
      setUniQuery("");
      setUniSuggestions([]);
      setStep(1);
      setIsOpen(true);
    };

    // 4. Sync with other components (e.g. Header/Footer country change)
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setData(prev => ({ ...prev, ...customEvent.detail }));
      }
    };

    window.addEventListener("lnbg_open_onboarding", handleOpen);
    window.addEventListener("lnbg_user_data_updated", handleUpdate as EventListener);
    
    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener("lnbg_open_onboarding", handleOpen);
      window.removeEventListener("lnbg_user_data_updated", handleUpdate as EventListener);
    };
  }, []);

  const completeOnboardingData = () => {
    localStorage.setItem("lnbg_onboarding_done", "true");
    localStorage.setItem("lnbg_user_data", JSON.stringify(data));
    
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("lnbg_user_data_updated", { detail: data }));
    }
  };

  const nextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    } else if (step === 3) {
      completeOnboardingData();
      setStep(4);
    }
  };

  const skipOnboarding = () => {
    completeOnboardingData();
    setStep(4); // Skip straight to the university search
  };

  const handleUniSearch = (val: string) => {
    try {
      setUniQuery(val || "");
      if (!val || !val.trim()) {
        setUniSuggestions([]);
        return;
      }
      const results = searchUniversities(val, data?.country, 10);
      setUniSuggestions(results || []);
    } catch (error) {
      console.error("Search error:", error);
      setUniSuggestions([]);
    }
  };

  const goToBuild = (domain: string, campus?: string) => {
    setIsOpen(false);
    let url = `/build?domain=${encodeURIComponent(domain.trim())}`;
    if (campus) url += `&campus=${encodeURIComponent(campus)}`;
    router.push(url);
  };

  const handleUniSubmit = (uni: University) => {
    if (uni.campuses && uni.campuses.length > 0) {
      setSelectedCampusUni(uni);
      setStep(5);
    } else {
      goToBuild(uni.domain);
    }
  };

  const filteredCountries = COUNTRIES.filter(c => c.toLowerCase().includes(searchQuery.toLowerCase()));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] bg-[#1e2d78]/60 backdrop-blur-sm flex items-center justify-center p-4">
      {/* Click outside background area to close only if step 4 */}
      <div className="absolute inset-0" onClick={() => { if (step === 4) setIsOpen(false); }} />

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.95 }}
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh] relative flex flex-col"
        >
          {/* Header */}
          {step < 4 && (
            <div className="bg-gray-50 border-b border-gray-100 flex items-center justify-between px-6 py-4">
              <div className="flex gap-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-blue-600' : i < step ? 'w-4 bg-blue-200' : 'w-4 bg-gray-200'}`} />
                ))}
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Step {step} of 3</p>
            </div>
          )}
          {step === 4 && (
            <div className="bg-gray-50 border-b border-gray-100 flex items-center justify-between px-6 py-4">
              <div className="flex gap-2">
                <div className="h-1.5 rounded-full transition-all duration-300 w-8 bg-blue-600" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Search</p>
            </div>
          )}

          <div className="p-6 md:p-8">
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-[#1e2d78] tracking-tight mb-2">Welcome! Where do you study?</h2>
                  <p className="text-gray-500 text-sm">We use this to curate universities and localize your experience.</p>
                </div>

                {/* Country Search */}
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Country of Study</p>
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search countries..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-[#111827] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-1 max-h-32 overflow-y-auto mb-6 pr-2">
                    {filteredCountries.map(country => (
                      <button
                        key={country}
                        onClick={() => setData({ ...data, country })}
                        className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${data.country === country ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
                      >
                        {country}
                        {data.country === country && <Check className="w-4 h-4 text-white" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Language (Secondary) */}
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Platform Language</p>
                  <div className="flex flex-wrap gap-2">
                    {LANGUAGES.map(lang => (
                      <button
                        key={lang}
                        onClick={() => setData({ ...data, language: lang })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${data.language === lang ? 'bg-[#1e2d78] text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-[#1e2d78] tracking-tight mb-2">Tell us about your studies</h2>
                  <p className="text-gray-500 text-sm">This helps us understand our user base for future features.</p>
                </div>

                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Degree Type</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-6">
                    {DEGREES.map(deg => (
                      <button
                        key={deg}
                        onClick={() => setData({ ...data, degree: deg })}
                        className={`px-3 py-3 rounded-xl text-xs font-bold transition-all border ${data.degree === deg ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}
                      >
                        {deg}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Current Year</p>
                  <div className="grid grid-cols-2 gap-2">
                    {YEARS.map(yr => (
                      <button
                        key={yr}
                        onClick={() => setData({ ...data, year: yr })}
                        className={`px-3 py-3 rounded-xl text-xs font-bold transition-all border ${data.year === yr ? 'bg-[#1e2d78] border-[#1e2d78] text-white shadow-md' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}
                      >
                        {yr}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-[#1e2d78] tracking-tight mb-2">What's your career goal?</h2>
                  <p className="text-gray-500 text-sm">We'll use this to safely match you with relevant career opportunities later.</p>
                </div>

                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Target Industry</p>
                  <div className="grid grid-cols-2 gap-2">
                    {INDUSTRIES.map(ind => (
                      <button
                        key={ind}
                        onClick={() => setData({ ...data, industry: ind })}
                        className={`px-3 py-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-between ${data.industry === ind ? 'bg-[#e0f7f0] border-[#4ECBA8] text-[#1e2d78] shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}
                      >
                        {ind}
                        {data.industry === ind && <Check className="w-4 h-4 text-[#4ECBA8]" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6 h-[320px] flex flex-col">
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-[#1e2d78] tracking-tight mb-2">Which school do you go to?</h2>
                  <p className="text-gray-500 text-sm">Search for your university to generate a custom banner.</p>
                </div>

                <div className="relative z-50 flex-1 flex flex-col">
                  <div className="relative">
                    <Search className="absolute left-4 top-3.5 w-5 h-5 text-[#1e2d78]" />
                    <input
                      type="text"
                      placeholder="Search for your university..."
                      value={uniQuery}
                      onChange={(e) => handleUniSearch(e.target.value)}
                      autoFocus
                      autoComplete="off"
                      autoCorrect="off"
                      spellCheck="false"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && uniQuery.trim()) {
                          if (uniSuggestions.length > 0) handleUniSubmit(uniSuggestions[0]);
                          else goToBuild(uniQuery.trim());
                        }
                      }}
                      className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-[15px] font-semibold text-[#111827] placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-[#1e2d78] transition-all shrink-0"
                    />
                  </div>
                  
                  {uniSuggestions && uniSuggestions.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] z-50 overflow-y-auto mt-2 max-h-[192px]">
                      {uniSuggestions.map((uni) => {
                        if (!uni || !uni.domain || !uni.name) return null;
                        return (
                          <button
                            key={uni.domain}
                            onClick={() => handleUniSubmit(uni)}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-blue-50/60 border-b border-gray-50 last:border-0"
                          >
                            <div className="w-8 h-8 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                              <img
                                src={`/${uni.root || ""}/${uni.folder || ""}/logo-search/${uni.logoSearch || ""}`}
                                alt={uni.name}
                                className="w-5 h-5 object-contain"
                                onError={(e) => {
                                  // Fallback to clearbit if local fails
                                  const target = e.target as HTMLImageElement;
                                  if (!target.src.includes('clearbit')) {
                                    target.src = `https://logo.clearbit.com/${uni.domain}`;
                                  } else {
                                    target.style.display = 'none';
                                  }
                                }}
                              />
                            </div>
                            <div>
                              <div className="font-bold text-[13px] text-[#111827] leading-tight">{uni.name}</div>
                              <div className="text-[11px] text-gray-500 font-medium">{uni.domain}</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                
                {uniQuery.trim() && uniSuggestions.length === 0 && (
                  <button 
                    onClick={() => goToBuild(uniQuery.trim())}
                    className="w-full mt-4 bg-[#1e2d78] text-white px-4 py-3 rounded-xl text-sm font-bold shadow-md hover:bg-blue-900 transition-colors"
                  >
                    Continue with "{uniQuery}"
                  </button>
                )}
              </div>
            )}
            {step === 5 && selectedCampusUni && (
              <div className="space-y-6 flex flex-col">
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-[#1e2d78] tracking-tight mb-2">Which campus or school?</h2>
                  <p className="text-gray-500 text-sm">Select your specific branch for {selectedCampusUni.name}.</p>
                </div>
                
                <div className="grid grid-cols-1 gap-2 overflow-y-auto max-h-[192px]">
                  {selectedCampusUni.campuses?.map(campus => (
                    <button
                      key={campus}
                      onClick={() => goToBuild(selectedCampusUni.domain, campus)}
                      className="w-full text-left px-4 py-3 rounded-xl text-[13px] font-bold transition-all border bg-white border-gray-200 text-[#111827] hover:border-[#1e2d78] hover:bg-blue-50/60 shadow-sm flex items-center justify-between"
                    >
                      {campus}
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer actions */}
          <div className="p-6 md:p-8 pt-0 mt-4 flex justify-between items-center">
            {step === 1 ? (
              <button 
                onClick={() => skipOnboarding()} 
                className="text-gray-400 hover:text-gray-600 text-xs font-bold px-2 py-2 transition-colors uppercase tracking-widest"
              >
                Skip
              </button>
            ) : (
              <button 
                onClick={() => setStep(step - 1)} 
                className="text-gray-400 hover:text-gray-600 text-xs font-bold px-2 py-2 transition-colors uppercase tracking-widest flex items-center gap-1"
              >
                <ChevronRight className="w-4 h-4 rotate-180" /> Back
              </button>
            )}

            {step < 4 && (
              <button
                onClick={nextStep}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all shadow-md active:scale-95 ${
                  (step === 1 && !data.country) || (step === 2 && (!data.degree || !data.year)) || (step === 3 && !data.industry)
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                    : 'bg-[#1e2d78] text-white hover:bg-blue-900'
                }`}
                disabled={(step === 1 && !data.country) || (step === 2 && (!data.degree || !data.year)) || (step === 3 && !data.industry)}
              >
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
