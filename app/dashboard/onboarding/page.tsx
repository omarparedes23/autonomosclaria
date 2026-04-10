'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { saveOnboardingProfile, saveOnboardingClient } from '@/lib/actions/onboarding'

const STEPS = [
  { number: 1, label: 'Perfil fiscal' },
  { number: 2, label: 'Primer cliente' },
  { number: 3, label: 'Primera factura' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleProfileSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await saveOnboardingProfile(formData)
      if (result.error) {
        setError(result.error)
      } else {
        setStep(2)
      }
    })
  }

  function handleClientSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await saveOnboardingClient(formData)
      if (result.error) {
        setError(result.error)
      } else {
        setStep(3)
      }
    })
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-12">

      {/* Header */}
      <div className="w-full max-w-lg mb-10">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-mono text-gray-400 tracking-wide uppercase">
            Paso {step} de {STEPS.length}
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            Saltar →
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-[2px] bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-black rounded-full transition-all duration-500"
            style={{ width: `${(step / STEPS.length) * 100}%` }}
          />
        </div>

        {/* Step labels */}
        <div className="flex justify-between mt-3">
          {STEPS.map((s) => (
            <span
              key={s.number}
              className={`text-[11px] font-mono transition-colors ${
                s.number === step
                  ? 'text-black font-semibold'
                  : s.number < step
                  ? 'text-gray-400'
                  : 'text-gray-300'
              }`}
            >
              {s.label}
            </span>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="w-full max-w-lg bg-white border border-gray-100 rounded-2xl shadow-sm p-8">

        {/* Step 1: Profile */}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-semibold mb-1 tracking-tight">
              Completa tu perfil fiscal
            </h2>
            <p className="text-sm text-gray-400 mb-8">
              Esta información aparecerá en tus facturas.
            </p>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Nombre completo o razón social
                </label>
                <input
                  name="name"
                  type="text"
                  placeholder="Pedro Sánchez Freelance"
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-black transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">NIF / NIE</label>
                <input
                  name="nif"
                  type="text"
                  placeholder="12345678A"
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-black transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Dirección fiscal
                </label>
                <input
                  name="fiscal_address"
                  type="text"
                  placeholder="Calle Mayor 1, 28001 Madrid"
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-black transition-colors"
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 bg-black text-white py-2.5 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {isPending ? 'Guardando…' : 'Continuar'}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Saltar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 2: First client */}
        {step === 2 && (
          <div>
            <h2 className="text-xl font-semibold mb-1 tracking-tight">
              Añade tu primer cliente
            </h2>
            <p className="text-sm text-gray-400 mb-8">
              A quien le facturas. Puedes añadir más después.
            </p>
            <form onSubmit={handleClientSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Nombre del cliente *
                </label>
                <input
                  name="name"
                  type="text"
                  placeholder="Empresa S.L."
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-black transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Email
                  <span className="text-gray-300 ml-1">(opcional)</span>
                </label>
                <input
                  name="email"
                  type="email"
                  placeholder="cliente@empresa.com"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-black transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  NIF / CIF
                  <span className="text-gray-300 ml-1">(opcional)</span>
                </label>
                <input
                  name="nif"
                  type="text"
                  placeholder="B12345678"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-black transition-colors"
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 bg-black text-white py-2.5 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {isPending ? 'Guardando…' : 'Continuar'}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Saltar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 3: First invoice */}
        {step === 3 && (
          <div className="text-center py-4">
            <div className="text-4xl mb-5">🎉</div>
            <h2 className="text-xl font-semibold mb-2 tracking-tight">
              ¡Todo listo!
            </h2>
            <p className="text-sm text-gray-400 mb-8 max-w-sm mx-auto leading-relaxed">
              Ya puedes crear tu primera factura. Tarda menos de un minuto.
            </p>
            <div className="flex flex-col gap-3 max-w-xs mx-auto">
              <a
                href="/dashboard/invoices/new"
                className="w-full bg-black text-white py-2.5 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                Crear primera factura
              </a>
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full border border-gray-200 text-gray-500 py-2.5 rounded-full text-sm hover:border-gray-400 hover:text-gray-700 transition-all"
              >
                Ir al dashboard
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
