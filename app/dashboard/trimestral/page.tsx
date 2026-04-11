import { getQuarterInvoices } from '@/lib/actions/trimestral'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4']
const QUARTER_LABEL: Record<string, string> = {
  Q1: '1er Trimestre (Ene–Mar)',
  Q2: '2º Trimestre (Abr–Jun)',
  Q3: '3er Trimestre (Jul–Sep)',
  Q4: '4º Trimestre (Oct–Dic)',
}

function formatCurrency(cents: number) {
  return (cents / 100).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })
}

function getCurrentQuarter() {
  const m = new Date().getMonth() + 1
  return m <= 3 ? 'Q1' : m <= 6 ? 'Q2' : m <= 9 ? 'Q3' : 'Q4'
}

export default async function TrimestralPage(props: {
  searchParams: Promise<{ quarter?: string; year?: string }>
}) {
  const sp = await props.searchParams
  const now = new Date()
  const quarter = QUARTERS.includes(sp.quarter ?? '') ? (sp.quarter as string) : getCurrentQuarter()
  const year = sp.year ? parseInt(sp.year, 10) : now.getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i)

  const invoices = await getQuarterInvoices(quarter, year)

  const totalBase = invoices.reduce((acc, inv) => acc + inv.taxable_base_cents, 0)
  const totalIva = invoices.reduce((acc, inv) => acc + inv.iva_quota_cents, 0)
  const totalIrpf = invoices.reduce((acc, inv) => acc + ((inv as any).irpf_retention_cents ?? 0), 0)

  // IVA breakdown by rate from line items
  const ivaBreakdown: Record<string, { base: number; iva: number }> = {}
  for (const inv of invoices) {
    const items: any[] = (inv as any).cl_invoice_items ?? []
    for (const item of items) {
      const rate = String(item.iva_rate)
      if (!ivaBreakdown[rate]) ivaBreakdown[rate] = { base: 0, iva: 0 }
      const base = item.quantity * item.unit_price_cents
      ivaBreakdown[rate].base += base
      ivaBreakdown[rate].iva += Math.round(base * (item.iva_rate / 100))
    }
  }

  const ivaRates = Object.keys(ivaBreakdown).sort((a, b) => Number(b) - Number(a))

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Resumen Trimestral</h1>
          <p className="text-gray-500 text-sm mt-1">Datos para el Modelo 303</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/trimestral/historial"
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Ver historial
          </Link>
          {invoices.length > 0 && (
            <a
              href={`/api/pdf/trimestral?quarter=${quarter}&year=${year}`}
              className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Descargar PDF
            </a>
          )}
        </div>
      </div>

      {/* Selector */}
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

      {invoices.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-12 text-center shadow-sm">
          <p className="text-gray-400 text-sm">No hay facturas en {QUARTER_LABEL[quarter]} {year}.</p>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
            {[
              { label: 'Nº Facturas', value: String(invoices.length) },
              { label: 'Base Imponible', value: formatCurrency(totalBase) },
              { label: 'IVA Repercutido', value: formatCurrency(totalIva) },
              { label: 'IRPF Retenido', value: formatCurrency(totalIrpf) },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
              </div>
            ))}
          </div>

          {/* IVA Breakdown */}
          {ivaRates.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm mb-8 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-700 text-sm">Desglose por tipo de IVA</h2>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs font-medium">
                  <tr>
                    <th className="px-6 py-3 text-left">Tipo IVA</th>
                    <th className="px-6 py-3 text-right">Base imponible</th>
                    <th className="px-6 py-3 text-right">Cuota IVA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {ivaRates.map((rate) => (
                    <tr key={rate}>
                      <td className="px-6 py-3 font-medium">{rate}%</td>
                      <td className="px-6 py-3 text-right">{formatCurrency(ivaBreakdown[rate].base)}</td>
                      <td className="px-6 py-3 text-right">{formatCurrency(ivaBreakdown[rate].iva)}</td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50 font-semibold">
                    <td className="px-6 py-3">Total</td>
                    <td className="px-6 py-3 text-right">{formatCurrency(totalBase)}</td>
                    <td className="px-6 py-3 text-right">{formatCurrency(totalIva)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Invoice list */}
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-700 text-sm">Facturas del período</h2>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs font-medium">
                <tr>
                  <th className="px-6 py-3 text-left">Nº Factura</th>
                  <th className="px-6 py-3 text-left">Cliente</th>
                  <th className="px-6 py-3 text-left">Fecha</th>
                  <th className="px-6 py-3 text-right">Base</th>
                  <th className="px-6 py-3 text-right">IVA</th>
                  <th className="px-6 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3 font-medium">
                      <Link href={`/dashboard/invoices/${inv.id}`} className="hover:underline">
                        {inv.invoice_number}
                      </Link>
                    </td>
                    <td className="px-6 py-3">{(inv as any).cl_clients?.name ?? '—'}</td>
                    <td className="px-6 py-3">{new Date(inv.issue_date).toLocaleDateString('es-ES')}</td>
                    <td className="px-6 py-3 text-right">{formatCurrency(inv.taxable_base_cents)}</td>
                    <td className="px-6 py-3 text-right">{formatCurrency(inv.iva_quota_cents)}</td>
                    <td className="px-6 py-3 text-right font-semibold">{formatCurrency(inv.total_cents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-gray-400 mt-4 text-center">
            Resumen orientativo. Consúltelo con su gestor para la presentación oficial del Modelo 303.
          </p>
        </>
      )}
    </div>
  )
}
