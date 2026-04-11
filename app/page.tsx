import Link from 'next/link'
import { DM_Serif_Display } from 'next/font/google'

const serif = DM_Serif_Display({
  weight: '400',
  subsets: ['latin'],
  style: ['normal', 'italic'],
})

export default function Home() {
  return (
    <div className="min-h-screen bg-[#080808] text-white">

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-16 py-5 border-b border-white/[0.07]">
        <span className={`${serif.className} text-2xl tracking-tight`}>Claria</span>
        <div className="flex items-center gap-3 md:gap-5">
          <Link
            href="/login"
            className="text-sm text-white/50 hover:text-white transition-colors hidden sm:block"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/register"
            className="text-sm bg-white text-black px-5 py-2 rounded-full hover:bg-white/90 transition-colors font-medium"
          >
            Empieza gratis
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 md:px-16 pt-20 md:pt-32 pb-24 md:pb-36">
        <div className="max-w-5xl mx-auto">
          <p className="text-[10px] tracking-[0.3em] text-white/30 uppercase font-mono mb-10">
            Facturación · Autónomos · España
          </p>
          <h1
            className={`${serif.className} text-[clamp(3rem,8vw,7rem)] leading-[0.88] tracking-tight`}
          >
            La facturación más simple
            <br />
            para{' '}
            <em className="text-white/40">autónomos digitales</em>
          </h1>
          <p className="text-white/45 text-lg md:text-xl max-w-xl font-light leading-relaxed mt-10 mb-12">
            Crea facturas profesionales, controla tu IVA trimestral y mantén tus
            cuentas al día. Sin complicaciones.
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-white text-black px-7 py-3.5 rounded-full font-semibold text-sm hover:bg-white/90 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Empieza gratis
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-white/60 border border-white/15 px-7 py-3.5 rounded-full text-sm hover:border-white/40 hover:text-white transition-all"
            >
              Iniciar sesión
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-white/[0.07]">
        <div className="max-w-5xl mx-auto px-6 md:px-16 py-20">
          <p className="text-[10px] tracking-[0.3em] text-white/30 uppercase font-mono mb-14">
            Funcionalidades
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/[0.07] border border-white/[0.07]">
            {[
              {
                icon: '🧾',
                title: 'Facturas en segundos',
                desc: 'Crea y envía facturas PDF por email directamente desde la plataforma.',
              },
              {
                icon: '📊',
                title: 'Control fiscal',
                desc: 'IVA trimestral y tramos IRPF en tiempo real. Siempre al día con Hacienda.',
              },
              {
                icon: '🤖',
                title: 'Sin gestoría',
                desc: 'Todo lo que necesitas en un solo lugar. Diseñado para el autónomo digital.',
              },
            ].map((f) => (
              <div
                key={f.title}
                className="p-8 md:p-10 hover:bg-white/[0.02] transition-colors"
              >
                <span className="text-2xl mb-5 block">{f.icon}</span>
                <h3 className="text-[15px] font-semibold mb-3 tracking-tight">
                  {f.title}
                </h3>
                <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="border-t border-white/[0.07]">
        <div className="max-w-5xl mx-auto px-6 md:px-16 py-20">
          <p className="text-[10px] tracking-[0.3em] text-white/30 uppercase font-mono mb-14">
            Precios
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl">

            {/* Free */}
            <div className="border border-white/[0.1] p-8 rounded-2xl flex flex-col">
              <p className="text-[10px] tracking-[0.3em] text-white/30 uppercase font-mono mb-6">
                Free
              </p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-bold font-mono tracking-tight">0€</span>
                <span className="text-white/30 text-xs">/mes</span>
              </div>
              <p className="text-white/30 text-xs mb-7">Gratis para siempre</p>
              <ul className="space-y-2.5 mb-8 flex-1">
                {['3 facturas al mes', 'Clientes ilimitados', 'PDF profesional'].map(
                  (item) => (
                    <li key={item} className="flex items-center gap-2.5 text-sm text-white/55">
                      <span className="w-[3px] h-[3px] rounded-full bg-white/30 shrink-0" />
                      {item}
                    </li>
                  ),
                )}
              </ul>
              <Link
                href="/register"
                className="block text-center border border-white/15 py-2.5 rounded-full text-sm text-white/70 hover:border-white/40 hover:text-white transition-all"
              >
                Empezar gratis
              </Link>
            </div>

            {/* Pro */}
            <div className="bg-white text-black p-8 rounded-2xl flex flex-col">
              <p className="text-[10px] tracking-[0.3em] text-black/35 uppercase font-mono mb-6">
                Pro
              </p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-bold font-mono tracking-tight">9€</span>
                <span className="text-black/35 text-xs">/mes</span>
              </div>
              <p className="text-black/35 text-xs mb-7">Sin permanencia</p>
              <ul className="space-y-2.5 mb-8 flex-1">
                {[
                  { text: 'Facturas ilimitadas' },
                  { text: 'IA de gastos', badge: 'Próximamente' },
                  { text: 'Soporte prioritario' },
                ].map((item) => (
                  <li key={item.text} className="flex items-center gap-2.5 text-sm text-black/65">
                    <span className="w-[3px] h-[3px] rounded-full bg-black/30 shrink-0" />
                    {item.text}
                    {item.badge && (
                      <span className="text-[9px] bg-black/8 text-black/45 px-2 py-0.5 rounded-full font-mono tracking-wide">
                        {item.badge}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
              <Link
                href="/pricing"
                className="block text-center bg-black text-white py-2.5 rounded-full text-sm hover:bg-black/80 transition-colors"
              >
                Empezar con Pro
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.07] px-6 md:px-16 py-7">
        <p className="text-[11px] text-white/25 font-mono">
          Claria © 2026 — Facturación para autónomos españoles
        </p>
      </footer>

    </div>
  )
}
