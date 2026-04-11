'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createInvoiceAction } from '@/lib/actions/invoices'

interface FormItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: string; // raw string input, converted to cents on submit
  iva_rate: 21 | 10 | 4 | 0;
}

// Passed props should have clients[] to select from.
export default function InvoiceBuilder({ clients }: { clients: any[] }) {
  const router = useRouter()
  const [clientId, setClientId] = useState('')
  const [irpf, setIrpf] = useState<0 | 15 | 7>(0)
  const [loading, setLoading] = useState(false)
  const [limitReached, setLimitReached] = useState(false)
  const [items, setItems] = useState<FormItem[]>([
    { id: 'initial', description: '', quantity: 1, unit_price: '', iva_rate: 21 }
  ])

  const addLine = () => setItems([...items, { id: Date.now().toString(), description: '', quantity: 1, unit_price: '', iva_rate: 21 }])

  const updateLine = (id: string, field: keyof FormItem, value: any) => {
    setItems(items.map((i) => (i.id === id ? { ...i, [field]: value } : i)))
  }

  const submitInvoice = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clientId) return alert('Por favor, selecciona un cliente.')

    const invalidPrice = items.some(i => !(parseFloat(i.unit_price) > 0))
    if (invalidPrice) return alert('El precio de cada línea debe ser mayor que 0.')

    setLoading(true)
    const payload = {
      client_id: clientId,
      apply_irpf: irpf,
      items: items.map(i => ({
        description: i.description,
        quantity: i.quantity,
        unit_price_cents: Math.round(parseFloat(i.unit_price) * 100),
        iva_rate: i.iva_rate
      }))
    }

    const result = await createInvoiceAction(payload)
    setLoading(false)

    if (result.error) {
      if ('limitReached' in result && result.limitReached) {
        setLimitReached(true)
      } else {
        alert(result.error)
      }
    } else {
      router.push('/dashboard')
    }
  }

  if (limitReached) {
    return (
      <div className="max-w-md bg-amber-50 border border-amber-200 rounded-xl p-8 text-center">
        <p className="text-2xl mb-3">🔒</p>
        <h2 className="font-semibold text-gray-800 mb-2">Límite mensual alcanzado</h2>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          Has creado 3 facturas este mes con el plan Free.<br />
          Actualiza a Pro para crear facturas ilimitadas.
        </p>
        <Link
          href="/pricing"
          className="inline-block bg-black text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors"
        >
          Ver planes →
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={submitInvoice} className="max-w-4xl space-y-6">
      <div className="flex gap-4">
        <select required className="border p-2 rounded" value={clientId} onChange={e => setClientId(e.target.value)}>
          <option value="" disabled>Seleccione un Cliente...</option>
          {clients?.map((cl: any) => (
            <option key={cl.id} value={cl.id}>{cl.name}</option>
          ))}
        </select>
        
        <select className="border p-2 rounded" value={irpf} onChange={e => setIrpf(Number(e.target.value) as any)}>
          <option value={0}>Sin IRPF (0%)</option>
          <option value={7}>IRPF Reducido (7%)</option>
          <option value={15}>IRPF General (15%)</option>
        </select>
      </div>

      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={item.id} className="flex gap-4 items-center bg-gray-50 p-4 rounded">
            <input type="text" required placeholder="Concepto/Descripción" className="w-1/3 border p-2 rounded" value={item.description} onChange={(e) => updateLine(item.id, 'description', e.target.value)} />
            <input type="number" required min="1" step="1" className="w-24 border p-2 rounded" value={item.quantity} onChange={(e) => updateLine(item.id, 'quantity', Number(e.target.value))} />
            <div className="flex items-center">
              <input type="number" required min="0.01" step="0.01" placeholder="0.00" className="w-32 border p-2 rounded" value={item.unit_price} onChange={(e) => updateLine(item.id, 'unit_price', e.target.value)} />
              <span className="ml-2">€</span>
            </div>
            <select className="border p-2 rounded" value={item.iva_rate} onChange={(e) => updateLine(item.id, 'iva_rate', Number(e.target.value))}>
              <option value={21}>IVA 21%</option>
              <option value={10}>IVA 10%</option>
              <option value={4}>IVA 4%</option>
              <option value={0}>IVA 0%</option>
            </select>
            {index > 0 && <button type="button" onClick={() => setItems(items.filter(i => i.id !== item.id))} className="text-red-500 font-bold p-2">✕</button>}
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        <button type="button" onClick={addLine} className="bg-gray-200 px-4 py-2 rounded">+ Agregar Línea</button>
        <button type="submit" disabled={loading} className="bg-black text-white px-6 py-2 rounded">
          {loading ? 'Generando...' : 'Generar Factura'}
        </button>
      </div>
    </form>
  )
}
