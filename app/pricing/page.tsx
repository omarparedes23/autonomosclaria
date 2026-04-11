import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import CheckoutButton from './CheckoutButton'

const FREE_FEATURES = [
  '3 facturas al mes',
  'PDF profesional',
  'Envío por email',
  'Clientes ilimitados',
]

const PRO_FEATURES = [
  'Facturas ilimitadas',
  'Resumen trimestral PDF',
  'Facturas rectificativas',
  'IA de gastos (próximamente)',
  'Soporte prioritario',
]

export default async function PricingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let userPlan: string | null = null
  if (user) {
    const { data } = await supabase
      .from('cl_users')
      .select('plan')
      .eq('id', user.id)
      .single()
    userPlan = data?.plan ?? 'free'
  }

  const isPro = userPlan === 'pro'

  return (
    <div className="min-h-screen bg-[#080808] text-white">

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-16 py-5 border-b border-white/[0.07]">
        <Link href="/" className="text-xl font-semibold tracking-tight">Claria</Link>
        <div className="flex items-center gap-3">
          {user ? (
            <Link href="/dashboard" className="text-sm text-white/60 hover:text-white transition-colors">
              Dashboard →
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm text-white/50 hover:text-white transition-colors">
                Iniciar sesión
              </Link>
              <Link href="/register" className="text-sm bg-white text-black px-5 py-2 rounded-full hover:bg-white/90 transition-colors font-medium">
                Empieza gratis
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Header */}
      <div className="text-center px-6 pt-20 pb-16">
        <p className="text-[10px] tracking-[0.3em] text-white/30 uppercase font-mono mb-6">Precios</p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          Simple y transparente
        </h1>
        <p className="text-white/45 text-lg max-w-md mx-auto">
          Empieza gratis. Actualiza cuando necesites más.
        </p>
      </div>

      {/* Cards */}
      <div className="max-w-3xl mx-auto px-6 pb-24 grid grid-cols-1 sm:grid-cols-2 gap-5">

        {/* Free */}
        <div className="border border-white/[0.1] p-8 rounded-2xl flex flex-col">
          <p className="text-[10px] tracking-[0.3em] text-white/30 uppercase font-mono mb-6">Free</p>
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-5xl font-bold font-mono tracking-tight">0€</span>
            <span className="text-white/30 text-sm">/mes</span>
          </div>
          <p className="text-white/30 text-xs mb-8">Para siempre</p>
          <ul className="space-y-3 mb-8 flex-1">
            {FREE_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm text-white/55">
                <span className="mt-[5px] w-[3px] h-[3px] rounded-full bg-white/30 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          {user && !isPro ? (
            <div className="text-center py-2.5 text-sm text-white/40 border border-white/10 rounded-full">
              Plan actual
            </div>
          ) : (
            <Link
              href={user ? '/dashboard' : '/register'}
              className="block text-center border border-white/15 py-2.5 rounded-full text-sm text-white/70 hover:border-white/40 hover:text-white transition-all"
            >
              {user ? 'Ir al dashboard' : 'Empezar gratis'}
            </Link>
          )}
        </div>

        {/* Pro */}
        <div className="bg-white text-black p-8 rounded-2xl flex flex-col">
          <p className="text-[10px] tracking-[0.3em] text-black/35 uppercase font-mono mb-6">Pro</p>
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-5xl font-bold font-mono tracking-tight">9€</span>
            <span className="text-black/35 text-sm">/mes</span>
          </div>
          <p className="text-black/35 text-xs mb-8">Sin permanencia</p>
          <ul className="space-y-3 mb-8 flex-1">
            {PRO_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm text-black/65">
                <span className="mt-[5px] w-[3px] h-[3px] rounded-full bg-black/30 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          {isPro ? (
            <div className="text-center py-2.5 text-sm text-black/50 bg-black/5 rounded-full font-medium">
              Plan actual ✓
            </div>
          ) : (
            <CheckoutButton isLoggedIn={!!user} />
          )}
        </div>

      </div>

      {/* Footer */}
      <footer className="border-t border-white/[0.07] px-6 md:px-16 py-7">
        <p className="text-[11px] text-white/25 font-mono">
          Claria © 2026 — Facturación para autónomos españoles
        </p>
      </footer>

    </div>
  )
}
