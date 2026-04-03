'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home page immediately or after a short delay
    const timeout = setTimeout(() => {
      router.replace('/');
    }, 100);

    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <div className="min-h-screen bg-[#1e2d78] flex flex-col items-center justify-center text-white px-4">
      <div className="text-center animate-pulse">
        <h1 className="text-6xl font-black mb-4 tracking-tighter">LNBG</h1>
        <div className="w-12 h-1 bg-white/20 mx-auto mb-6 rounded-full" />
        <p className="text-white/60 font-medium uppercase tracking-[0.2em] text-xs">
          Redirecting to home...
        </p>
      </div>
    </div>
  );
}
