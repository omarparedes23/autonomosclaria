'use client'

import { useTransition } from 'react'
import { cancelSubscription } from '@/lib/actions/stripe'

export default function CancelButton() {
  const [isPending, startTransition] = useTransition()

  const handleClick = () => {
    if (!confirm('¿Seguro que quieres cancelar? Seguirás con Pro hasta el final del período actual.')) return
    startTransition(async () => {
      const result = await cancelSubscription()
      if (result.error) alert(result.error)
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
    >
      {isPending ? 'Cancelando...' : 'Cancelar suscripción'}
    </button>
  )
}
