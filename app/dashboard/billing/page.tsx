import { createClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe'
import Link from 'next/link'
import CancelButton from './CancelButton'
import { redirect } from 'next/navigation'

export default async function BillingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('cl_users')
    .select('plan, stripe_subscription_id, plan_expires_at')
    .eq('id', user.id)
    .single()

  const plan = profile?.plan ?? 'free'
  const isPro = plan === 'pro'
  const expiresAt = profile?.plan_expires_at
    ? new Date(profile.plan_expires_at)
    : null

  // Fetch cancel_at_period_end from Stripe when subscription exists
  let cancelAtPeriodEnd = false
  if (isPro && profile?.stripe_subscription_id) {
    try {
      const stripe = getStripe()
      const sub = await stripe.subscriptions.retrieve(profile.stripe_subscription_id) as any
      cancelAtPeriodEnd = sub.cancel_at_period_end ?? false
    } catch {
      // Non-blocking — proceed with DB data
    }
  }

  return (
    <div className="max-w-xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Facturación</h1>
        <p className="text-gray-500 text-sm mt-1">Gestiona tu plan y suscripción.</p>
      </div>

      {/* Plan card */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-700">Plan actual</h2>
          {isPro ? (
            <span className="inline-flex items-center px-3 py-1 bg-black text-white text-xs font-semibold rounded-full">
              Pro ✓
            </span>
          ) : (
            <span className="inline-flex items-center px-3 py-1 border border-gray-200 text-gray-500 text-xs font-medium rounded-full">
              Free
            </span>
          )}
        </div>

        <div className="px-6 py-6">
          {isPro ? (
            <div className="space-y-4">
              {/* Billing info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Importe</p>
                  <p className="font-semibold text-gray-800">9,00 €/mes</p>
                </div>
                {expiresAt && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">
                      {cancelAtPeriodEnd ? 'Activo hasta' : 'Próximo cobro'}
                    </p>
                    <p className="font-semibold text-gray-800">
                      {expiresAt.toLocaleDateString('es-ES', {
                        day: 'numeric', month: 'long', year: 'numeric',
                      })}
                    </p>
                  </div>
                )}
              </div>

              {/* Status */}
              {cancelAtPeriodEnd ? (
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                  <p className="text-sm text-amber-800">
                    <span className="font-semibold">Cancelación programada.</span>{' '}
                    Tu plan Pro estará activo hasta el{' '}
                    <span className="font-semibold">
                      {expiresAt?.toLocaleDateString('es-ES', {
                        day: 'numeric', month: 'long', year: 'numeric',
                      })}
                    </span>
                    . Después pasarás al plan gratuito.
                  </p>
                </div>
              ) : (
                <div className="pt-2">
                  <CancelButton />
                  <p className="text-xs text-gray-400 mt-2">
                    La cancelación es efectiva al final del período actual. No se realizan reembolsos parciales.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500 text-sm mb-5">
                Estás en el plan gratuito. Actualiza para acceder a facturas ilimitadas, resúmenes trimestrales y más.
              </p>
              <Link
                href="/pricing"
                className="inline-block bg-black text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors"
              >
                Actualizar a Pro →
              </Link>
            </div>
          )}
        </div>
      </div>

      {isPro && (
        <p className="text-xs text-gray-400 text-center">
          ¿Tienes algún problema con tu facturación?{' '}
          <a href="mailto:soporte@claria.es" className="underline hover:text-gray-600">
            Contacta con soporte
          </a>
        </p>
      )}
    </div>
  )
}
