'use client'

import { useState } from 'react'
import { dispatchInvoiceEmail } from '@/lib/actions/email'

export function DispatchButton({ invoiceId, customClass }: { invoiceId: string; customClass?: string }) {
  const [loading, setLoading] = useState(false)

  const handleSend = async () => {
    setLoading(true)
    const result = await dispatchInvoiceEmail(invoiceId)
    setLoading(false)
    if (result.error) {
      alert(result.error)
    } else {
      alert('Factura enviada exitosamente.')
    }
  }

  return (
    <button 
      onClick={handleSend} 
      disabled={loading} 
      className={customClass ?? "text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md text-xs transition-colors disabled:opacity-50 ml-2"}
    >
      {loading ? 'Enviando...' : 'Email'}
    </button>
  )
}
