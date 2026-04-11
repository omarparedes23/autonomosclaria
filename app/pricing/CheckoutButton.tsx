'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CheckoutButton({ isLoggedIn }: { isLoggedIn: boolean }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleClick() {
    if (!isLoggedIn) {
      router.push('/register?redirect=/pricing')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Error al iniciar el pago')
        return
      }

      window.location.href = data.url
    } catch {
      setError('Error de conexión. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        className="w-full bg-black text-white py-3 rounded-full text-sm font-semibold hover:bg-black/80 transition-colors disabled:opacity-50"
      >
        {loading ? 'Redirigiendo...' : isLoggedIn ? 'Actualizar a Pro' : 'Empieza con Pro'}
      </button>
      {error && <p className="mt-3 text-xs text-red-500 text-center">{error}</p>}
    </div>
  )
}
