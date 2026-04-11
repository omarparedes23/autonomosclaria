'use client'

import { useState } from 'react'
import { createGasto } from '@/lib/actions/gastos'
import { getDeducibleDefault } from '@/lib/utils/gastos'
import Link from 'next/link'

const CATEGORIAS = [
  { value: 'oficina',     label: 'Oficina y material' },
  { value: 'software',    label: 'Software y suscripciones' },
  { value: 'hardware',    label: 'Hardware y equipamiento' },
  { value: 'telefono',    label: 'Teléfono e internet' },
  { value: 'transporte',  label: 'Transporte y desplazamientos' },
  { value: 'dietas',      label: 'Dietas y manutención' },
  { value: 'formacion',   label: 'Formación y cursos' },
  { value: 'publicidad',  label: 'Publicidad y marketing' },
  { value: 'suministros', label: 'Suministros (luz, agua...)' },
  { value: 'autonomo',    label: 'Cuota autónomo SS' },
  { value: 'otros',       label: 'Otros' },
]

const IVA_RATES = [21, 10, 4, 0]

function calcBase(importeTotal: number, ivaRate: number) {
  if (ivaRate === 0) return importeTotal
  return importeTotal / (1 + ivaRate / 100)
}

export default function GastoForm() {
  const today = new Date().toISOString().slice(0, 10)
  const [categoria, setCategoria] = useState('oficina')
  const [ivaRate, setIvaRate] = useState(21)
  const [importeTotal, setImporteTotal] = useState('')
  const [deduciblePercent, setDeduciblePercent] = useState(getDeducibleDefault('oficina'))

  const importeNum = parseFloat(importeTotal) || 0
  const baseNum = calcBase(importeNum, ivaRate)
  const ivaSoportadoNum = importeNum - baseNum

  function handleCategoriaChange(val: string) {
    setCategoria(val)
    setDeduciblePercent(getDeducibleDefault(val))
  }

  return (
    <form action={createGasto} className="space-y-6 max-w-xl bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
        <input
          required
          type="date"
          name="fecha"
          defaultValue={today}
          className="w-full border border-gray-300 rounded-lg p-2.5"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
        <input
          required
          type="text"
          name="descripcion"
          placeholder="Ej: Suscripción mensual Figma"
          className="w-full border border-gray-300 rounded-lg p-2.5"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
        <select
          required
          name="categoria"
          value={categoria}
          onChange={(e) => handleCategoriaChange(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-2.5 bg-white"
        >
          {CATEGORIAS.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Importe total (€ con IVA)</label>
          <input
            required
            type="number"
            name="importe_total"
            min="0"
            step="0.01"
            placeholder="121.00"
            value={importeTotal}
            onChange={(e) => setImporteTotal(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2.5"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de IVA</label>
          <select
            name="iva_rate"
            value={ivaRate}
            onChange={(e) => setIvaRate(parseInt(e.target.value, 10))}
            className="w-full border border-gray-300 rounded-lg p-2.5 bg-white"
          >
            {IVA_RATES.map((r) => (
              <option key={r} value={r}>{r}%</option>
            ))}
          </select>
        </div>
      </div>

      {/* Auto-calculated preview */}
      {importeNum > 0 && (
        <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-1.5 border border-gray-100">
          <div className="flex justify-between">
            <span className="text-gray-500">Base imponible</span>
            <span className="font-semibold">{baseNum.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">IVA soportado ({ivaRate}%)</span>
            <span className="font-semibold">{ivaSoportadoNum.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</span>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Deducibilidad (%)
          <span className="text-xs text-gray-400 font-normal ml-2">Preset según categoría, editable</span>
        </label>
        <select
          name="deducible_percent"
          value={deduciblePercent}
          onChange={(e) => setDeduciblePercent(parseInt(e.target.value, 10))}
          className="w-full border border-gray-300 rounded-lg p-2.5 bg-white"
        >
          <option value={100}>100% — Totalmente deducible</option>
          <option value={50}>50% — Parcialmente deducible</option>
          <option value={0}>0% — No deducible</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Justificación / nota
          <span className="text-xs text-gray-400 font-normal ml-2">Opcional</span>
        </label>
        <textarea
          name="justificacion"
          rows={2}
          placeholder="Ej: Factura nº INV-2026-001, uso profesional"
          className="w-full border border-gray-300 rounded-lg p-2.5"
        />
      </div>

      <div className="pt-2 flex justify-between items-center">
        <Link href="/dashboard/gastos" className="text-sm text-gray-500 hover:underline">
          Cancelar
        </Link>
        <button type="submit" className="bg-black text-white px-6 py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-colors">
          Guardar Gasto
        </button>
      </div>
    </form>
  )
}
