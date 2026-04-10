import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8 selection:bg-gray-800">
      <main className="max-w-3xl text-center space-y-8 fade-in zoom-in duration-1000">
        <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter">
          Claria.
        </h1>
        <p className="text-gray-400 text-lg md:text-2xl max-w-2xl mx-auto font-light leading-relaxed">
          Facturación profesional, cumplimiento tributario español y control absoluto. Minimalismo diseñado para tech freelancers.
        </p>
        <div className="pt-8">
          <Link 
            href="/dashboard"
            className="group relative inline-flex items-center justify-center px-8 py-4 font-semibold text-black bg-white rounded-full overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] active:scale-95"
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-br from-gray-100 via-white to-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"></span>
            <span className="relative flex items-center gap-2">
              Acceder a Claria
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </span>
          </Link>
        </div>
      </main>
      
      <footer className="absolute bottom-8 text-sm text-gray-600 font-light tracking-wide">
        &copy; {new Date().getFullYear()} Claria SaaS MVP.
      </footer>
    </div>
  )
}
