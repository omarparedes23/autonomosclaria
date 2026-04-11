import { getInvoices, updateInvoiceStatus } from '@/lib/actions/invoices'
import Link from 'next/link'
import { DispatchButton } from './DispatchButton'
import FinancialInsights from './FinancialInsights'

function formatCurrency(cents: number) {
  return (cents / 100).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })
}

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

export default async function DashboardPage(props: {
  searchParams: Promise<{ month?: string; year?: string }>
}) {
  const searchParams = await props.searchParams
  const now = new Date()

  const month = searchParams.month ? parseInt(searchParams.month) : now.getMonth() + 1
  const year = searchParams.year ? parseInt(searchParams.year) : now.getFullYear()

  const invoices = await getInvoices({ month, year })

  const totalIncome = invoices?.reduce((acc, inv) => acc + inv.taxable_base_cents, 0) || 0
  const totalIva = invoices?.reduce((acc, inv) => acc + inv.iva_quota_cents, 0) || 0
  const pendingInvoices = invoices?.filter(i => i.status === 'pending') || []

  // Year options: current year and 3 previous
  const years = Array.from({ length: 4 }, (_, i) => now.getFullYear() - i)

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link href="/dashboard/invoices/new" className="bg-black text-white px-4 py-2 rounded-lg font-medium">
          + Nueva Factura
        </Link>
      </div>

      {/* Filters */}
      <form method="GET" className="flex items-center gap-3 mb-6">
        <select
          name="month"
          defaultValue={month}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-black"
        >
          {MONTHS.map((name, i) => (
            <option key={i + 1} value={i + 1}>{name}</option>
          ))}
        </select>
        <select
          name="year"
          defaultValue={year}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-black"
        >
          {years.map(y => (
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

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h2 className="text-sm font-medium text-gray-500 mb-1">Ingresos (Base Imponible)</h2>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalIncome)}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h2 className="text-sm font-medium text-gray-500 mb-1">IVA Acumulado</h2>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalIva)}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h2 className="text-sm font-medium text-gray-500 mb-1">Facturas Pendientes</h2>
          <p className="text-3xl font-bold text-gray-900">{pendingInvoices.length}</p>
        </div>
      </div>

      <FinancialInsights />

      <h2 className="text-xl font-bold mb-4">
        Facturas — {MONTHS[month - 1]} {year}
      </h2>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
            <tr>
              <th className="px-6 py-4">Número</th>
              <th className="px-6 py-4">Cliente</th>
              <th className="px-6 py-4">Fecha</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4 text-right">Total</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {invoices?.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No hay facturas en {MONTHS[month - 1]} {year}.
                </td>
              </tr>
            )}
            {invoices?.map((inv) => (
              <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium">
                  <div className="flex items-center gap-2">
                    <Link href={`/dashboard/invoices/${inv.id}`} className="hover:underline">
                      {inv.invoice_number}
                    </Link>
                    {(inv as any).rectificative && (
                      <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded">R</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">{inv.cl_clients?.name || 'Cliente Eliminado'}</td>
                <td className="px-6 py-4">{new Date(inv.issue_date).toLocaleDateString('es-ES')}</td>
                <td className="px-6 py-4">
                  <form action={async () => {
                    'use server'
                    await updateInvoiceStatus(inv.id, inv.status === 'pending' ? 'paid' : 'pending')
                  }}>
                    <button type="submit" title="Cambiar estado" className={`px-2 py-1 rounded-full text-xs font-semibold cursor-pointer transition-opacity hover:opacity-70 ${
                      inv.status === 'paid' ? 'bg-green-100 text-green-700' :
                      inv.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {inv.status.toUpperCase()}
                    </button>
                  </form>
                </td>
                <td className="px-6 py-4 text-right font-bold">{formatCurrency(inv.total_cents)}</td>
                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  <a href={`/api/pdf/${inv.id}`} target="_blank" className="text-gray-600 hover:text-black border border-gray-300 px-3 py-1 rounded-md text-xs transition-colors">
                    PDF
                  </a>
                  <DispatchButton invoiceId={inv.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
