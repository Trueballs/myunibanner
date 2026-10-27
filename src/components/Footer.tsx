export default function Footer() {
  return <footer className="w-full border-t border-slate-200 bg-slate-50/90 py-6 backdrop-blur-md md:py-12">
    <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-4 px-6 text-center md:flex-row md:px-12 md:text-left">
      <div className="text-sm font-medium text-slate-500">Created by <a href="https://oscarwoldskaarderud.dev" target="_blank" rel="noopener noreferrer" className="font-bold text-slate-900 hover:text-blue-600">Oscar</a></div>
      <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-slate-500">
        <a href="/privacy" className="hover:text-blue-600">Privacy</a><a href="/terms" className="hover:text-blue-600">Terms</a>
        <a href="mailto:oscar.w.skaarderud@gmail.com" className="hover:text-blue-600">Contact</a>
      </div>
    </div>
  </footer>;
}
