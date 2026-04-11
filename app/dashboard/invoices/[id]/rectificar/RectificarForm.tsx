'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createRectificativeInvoice } from '@/lib/actions/invoices'

interface LineItem {
  description: string
  quantity: number
  unit_price_cents: number
  iva_rate: 0 | 4 | 10 | 21
}

interface Props {
  originalId: string
  originalNumber: string
  originalItems: LineItem[]
  originalIrpfRate: 0 | 7 | 15
}

const IVA_OPTIONS: Array<0 | 4 | 10 | 21> = [0, 4, 10, 21]
const IRPF_OPTIONS: Array<{ label: string; value: 0 | 7 | 15 }> = [
  { label: 'Sin IRPF (0%)', value: 0 },
  { label: '7%', value: 7 },
  { label: '15%', value: 15 },
]

export default function RectificarForm({ originalId, originalNumber, originalItems, originalIrpfRate }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [motivo, setMotivo] = useState('')
  const [tipo, setTipo] = useState<'total' | 'parcial'>('total')
  const [items, setItems] = useState<LineItem[]>(originalItems)
  const [irpf, setIrpf] = useState<0 | 7 | 15>(originalIrpfRate)

  const updateItem = (i: number, field: keyof LineItem, value: string | number) => {
    setItems((prev) => prev.map((item, idx) => idx === i ? { ...item, [field]: value } : item))
  }

  const addItem = () => {
    setItems((prev) => [...prev, { description: '', quantity: 1, unit_price_cents: 0, iva_rate: 21 }])
  }

  const removeItem = (i: number) => {
    setItems((prev) => prev.filter((_, idx) => idx !== i))
  }

  const activeItems = tipo === 'total' ? originalItems : items

  const totalBase = activeItems.reduce((acc, it) => acc + it.quantity * it.unit_price_cents, 0)
  const totalIva = activeItems.reduce((acc, it) => acc + Math.round(it.quantity * it.unit_price_cents * (it.iva_rate / 100)), 0)
  const totalIrpf = Math.round(totalBase * (irpf / 100))
  const total = totalBase + totalIva - totalIrpf

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!motivo.trim()) { setError('El motivo es obligatorio'); return }
    setError(null)
    startTransition(async () => {
      const result = await createRectificativeInvoice(originalId, {
        motivo: motivo.trim(),
        items: activeItems,
        apply_irpf: irpf,
      })
      if ('error' in result && result.error) {
        setError(result.error)
      } else if ('invoice_id' in result && result.invoice_id) {
        router.push(`/dashboard/invoices/${result.invoice_id}`)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      {/* Motivo */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
        <h2 className="font-semibold text-gray-700 mb-4 text-sm uppercase tracking-wide">Motivo de rectificación</h2>
        <textarea
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          required
          rows={3}
          placeholder="Describe el motivo de la rectificación..."
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-black transition-colors resize-none"
        />
      </div>

      {/* Tipo */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
        <h2 className="font-semibold text-gray-700 mb-4 text-sm uppercase tracking-wide">Tipo de rectificación</h2>
        <div className="flex gap-4">
          {(['total', 'parcial'] as const).map((t) => (
            <label
              key={t}
              className={`flex-1 border-2 rounded-xl p-4 cursor-pointer transition-all ${
                tipo === t ? 'border-black bg-gray-50' : 'border-gray-200'
              }`}
            >
              <input type="radio" className="sr-only" value={t} checked={tipo === t} onChange={() => { setTipo(t); if (t === 'parcial') setItems(originalItems) }} />
              <p className="font-semibold capitalize mb-1">{t === 'total' ? 'Total' : 'Parcial'}</p>
              <p className="text-xs text-gray-500">
                {t === 'total' ? 'Cancela completamente la factura original' : 'Modifica las líneas de la factura'}
              </p>
            </label>
          ))}
        </div>
      </div>

      {/* Line items */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
        <h2 className="font-semibold text-gray-700 mb-4 text-sm uppercase tracking-wide">Líneas de factura</h2>
        <div className="space-y-3">
          {(tipo === 'total' ? originalItems : items).map((item, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-center">
              <input
                className={`col-span-5 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black ${tipo === 'total' ? 'bg-gray-50 text-gray-400' : ''}`}
                value={item.description}
                onChange={(e) => updateItem(i, 'description', e.target.value)}
                disabled={tipo === 'total'}
                placeholder="Descripción"
              />
              <input
                className={`col-span-1 border border-gray-200 rounded-lg px-3 py-2 text-sm text-center focus:outline-none focus:border-black ${tipo === 'total' ? 'bg-gray-50 text-gray-400' : ''}`}
                type="number" min="1" step="1"
                value={item.quantity}
                onChange={(e) => updateItem(i, 'quantity', parseInt(e.target.value, 10) || 1)}
                disabled={tipo === 'total'}
              />
              <input
                className={`col-span-3 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black ${tipo === 'total' ? 'bg-gray-50 text-gray-400' : ''}`}
                type="number" min="0" step="1"
                value={(item.unit_price_cents / 100).toFixed(2)}
                onChange={(e) => updateItem(i, 'unit_price_cents', Math.round(parseFloat(e.target.value || '0') * 100))}
                disabled={tipo === 'total'}
                placeholder="Precio (€)"
              />
              <select
                className={`col-span-2 border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:border-black ${tipo === 'total' ? 'bg-gray-50 text-gray-400' : ''}`}
                value={item.iva_rate}
                onChange={(e) => updateItem(i, 'iva_rate', parseInt(e.target.value, 10))}
                disabled={tipo === 'total'}
              >
                {IVA_OPTIONS.map((r) => <option key={r} value={r}>{r}% IVA</option>)}
              </select>
              {tipo === 'parcial' && (
                <button
                  type="button"
                  onClick={() => removeItem(i)}
                  className="col-span-1 text-gray-400 hover:text-red-500 text-xs text-center transition-colors"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
        {tipo === 'parcial' && (
          <button
            type="button"
            onClick={addItem}
            className="mt-4 text-sm text-gray-500 border border-dashed border-gray-300 rounded-lg px-4 py-2 hover:border-black hover:text-black transition-all w-full"
          >
            + Añadir línea
          </button>
        )}
      </div>

      {/* IRPF + Totals */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-start gap-8">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Retención IRPF</label>
            <select
              value={irpf}
              onChange={(e) => setIrpf(parseInt(e.target.value, 10) as 0 | 7 | 15)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black"
            >
              {IRPF_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="text-right space-y-1 text-sm min-w-[200px]">
            <div className="flex justify-between gap-8">
              <span className="text-gray-500">Base imponible</span>
              <span>{(totalBase / 100).toFixed(2)} €</span>
            </div>
            <div className="flex justify-between gap-8">
              <span className="text-gray-500">IVA</span>
              <span>{(totalIva / 100).toFixed(2)} €</span>
            </div>
            {totalIrpf > 0 && (
              <div className="flex justify-between gap-8">
                <span className="text-gray-500">IRPF ({irpf}%)</span>
                <span>–{(totalIrpf / 100).toFixed(2)} €</span>
              </div>
            )}
            <div className="flex justify-between gap-8 pt-2 border-t border-gray-200 font-bold">
              <span>Total</span>
              <span>{(total / 100).toFixed(2)} €</span>
            </div>
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-lg">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="bg-black text-white px-6 py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {isPending ? 'Creando...' : 'Emitir factura rectificativa'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="border border-gray-300 px-6 py-2.5 rounded-lg font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
      </div>

    </form>
  )
}
