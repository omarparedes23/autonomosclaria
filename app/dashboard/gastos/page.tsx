import { getGastos, deleteGasto } from '@/lib/actions/gastos'
import Link from 'next/link'

const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4']
const QUARTER_LABEL: Record<string, string> = {
  Q1: '1er Trimestre (Ene–Mar)',
  Q2: '2º Trimestre (Abr–Jun)',
  Q3: '3er Trimestre (Jul–Sep)',
  Q4: '4º Trimestre (Oct–Dic)',
}

const CATEGORIA_LABEL: Record<string, string> = {
  oficina:      'Oficina',
  software:     'Software',
  hardware:     'Hardware',
  telefono:     'Teléfono',
  transporte:   'Transporte',
  dietas:       'Dietas',
  formacion:    'Formación',
  publicidad:   'Publicidad',
  suministros:  'Suministros',
  autonomo:     'Cuota autónomo',
  otros:        'Otros',
}

function formatCurrency(cents: number) {
  return (cents / 100).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })
}

function getCurrentQuarter() {
  const m = new Date().getMonth() + 1
  return m <= 3 ? 'Q1' : m <= 6 ? 'Q2' : m <= 9 ? 'Q3' : 'Q4'
}

export default async function GastosPage(props: {
  searchParams: Promise<{ quarter?: string; year?: string }>
}) {
  const sp = await props.searchParams
  const now = new Date()
  const quarter = QUARTERS.includes(sp.quarter ?? '') ? (sp.quarter as string) : getCurrentQuarter()
  const year = sp.year ? parseInt(sp.year, 10) : now.getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i)

  const gastos = await getGastos(quarter, year)

  const totalImporte = gastos.reduce((acc, g) => acc + g.importe_cents, 0)
  const totalIvaSoportado = gastos.reduce((acc, g) => acc + Math.round(g.iva_soportado_cents * g.deducible_percent / 100), 0)
  const totalBaseDeducible = gastos.reduce((acc, g) => acc + Math.round(g.base_imponible_cents * g.deducible_percent / 100), 0)

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Gastos Deducibles</h1>
          <p className="text-gray-500 text-sm mt-1">Gastos profesionales para el {QUARTER_LABEL[quarter]} {year}</p>
        </div>
        <Link href="/dashboard/gastos/new" className="bg-black text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors">
          + Nuevo Gasto
        </Link>
      </div>

      {/* Quarter filter */}
      <form method="GET" className="flex items-center gap-3 mb-8">
        <select
          name="quarter"
          defaultValue={quarter}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-black"
        >
          {QUARTERS.map((q) => (
            <option key={q} value={q}>{QUARTER_LABEL[q]}</option>
          ))}
        </select>
        <select
          name="year"
          defaultValue={year}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-black"
        >
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        <button
          type="submit"
          className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          Filtrar
        </button>
      </form>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {[
          { label: 'Total gastos (con IVA)', value: formatCurrency(totalImporte) },
          { label: 'IVA soportado deducible', value: formatCurrency(totalIvaSoportado) },
          { label: 'Base deducible', value: formatCurrency(totalBaseDeducible) },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      {/* Gastos table */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs font-medium">
            <tr>
              <th className="px-6 py-3 text-left">Fecha</th>
              <th className="px-6 py-3 text-left">Descripción</th>
              <th className="px-6 py-3 text-left">Categoría</th>
              <th className="px-6 py-3 text-right">Importe</th>
              <th className="px-6 py-3 text-right">IVA soportado</th>
              <th className="px-6 py-3 text-right">Deducible</th>
              <th className="px-6 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {gastos.map((g) => (
              <tr key={g.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-3">{new Date(g.fecha).toLocaleDateString('es-ES')}</td>
                <td className="px-6 py-3 font-medium">
                  {g.descripcion}
                  {g.justificacion && (
                    <p className="text-xs text-gray-400 font-normal mt-0.5">{g.justificacion}</p>
                  )}
                </td>
                <td className="px-6 py-3">
                  <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                    {CATEGORIA_LABEL[g.categoria] ?? g.categoria}
                  </span>
                </td>
                <td className="px-6 py-3 text-right">{formatCurrency(g.importe_cents)}</td>
                <td className="px-6 py-3 text-right">{formatCurrency(g.iva_soportado_cents)}</td>
                <td className="px-6 py-3 text-right">
                  <span className={`font-semibold ${g.deducible_percent < 100 ? 'text-amber-600' : ''}`}>
                    {g.deducible_percent}%
                  </span>
                </td>
                <td className="px-6 py-3 text-right">
                  <form action={async () => {
                    'use server'
                    await deleteGasto(g.id)
                  }}>
                    <button type="submit" className="text-red-600 font-medium hover:underline text-xs">
                      Borrar
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {gastos.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                  No hay gastos registrados para {QUARTER_LABEL[quarter]} {year}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
