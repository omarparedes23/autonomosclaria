import { getAllQuartersWithInvoices, getQuarterlyDeclarations, markQuarterDeclared, unmarkQuarterDeclared } from '@/lib/actions/trimestral'
import Link from 'next/link'

const QUARTER_LABEL: Record<string, string> = {
  Q1: '1er Trim.', Q2: '2º Trim.', Q3: '3er Trim.', Q4: '4º Trim.',
}

function formatCurrency(cents: number) {
  return (cents / 100).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })
}

export default async function TrimestralHistorialPage() {
  const [quarters, declarations] = await Promise.all([
    getAllQuartersWithInvoices(),
    getQuarterlyDeclarations(),
  ])

  const declaredSet = new Set(
    declarations.map((d: any) => `${d.year}-${d.quarter}`)
  )

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/trimestral" className="text-gray-400 hover:text-black transition-colors">
          ← Volver
        </Link>
        <h1 className="text-3xl font-bold">Historial trimestral</h1>
      </div>

      {quarters.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-12 text-center shadow-sm">
          <p className="text-gray-400 text-sm">Aún no tienes facturas registradas.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs font-medium border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left">Trimestre</th>
                <th className="px-6 py-4 text-right">Facturas</th>
                <th className="px-6 py-4 text-right">Base Imponible</th>
                <th className="px-6 py-4 text-right">IVA</th>
                <th className="px-6 py-4 text-center">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {quarters.map((q) => {
                const key = `${q.year}-${q.quarter}`
                const isDeclared = declaredSet.has(key)
                return (
                  <tr key={key} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium">
                      {QUARTER_LABEL[q.quarter]} {q.year}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-600">{q.count}</td>
                    <td className="px-6 py-4 text-right">{formatCurrency(q.base)}</td>
                    <td className="px-6 py-4 text-right">{formatCurrency(q.iva)}</td>
                    <td className="px-6 py-4 text-center">
                      {isDeclared ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                          Declarado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                          Pendiente
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`/api/pdf/trimestral?quarter=${q.quarter}&year=${q.year}`}
                          className="text-xs border border-gray-300 px-3 py-1.5 rounded-md hover:bg-gray-50 transition-colors"
                        >
                          PDF
                        </a>
                        {isDeclared ? (
                          <form action={async () => {
                            'use server'
                            await unmarkQuarterDeclared(q.year, q.quarter)
                          }}>
                            <button
                              type="submit"
                              className="text-xs border border-gray-300 px-3 py-1.5 rounded-md hover:bg-gray-50 text-gray-500 transition-colors"
                            >
                              Desmarcar
                            </button>
                          </form>
                        ) : (
                          <form action={async () => {
                            'use server'
                            await markQuarterDeclared(q.year, q.quarter)
                          }}>
                            <button
                              type="submit"
                              className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-md hover:bg-green-700 transition-colors"
                            >
                              Marcar declarado
                            </button>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
