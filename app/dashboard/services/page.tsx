import { getServices, deleteService } from '@/lib/actions/services'
import Link from 'next/link'

export default async function ServicesPage() {
  const services = await getServices()

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Catálogo de Servicios</h1>
        <Link href="/dashboard/services/new" className="bg-black text-white px-4 py-2 rounded-lg font-medium">
          + Nuevo Servicio
        </Link>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 text-sm font-semibold">Descripción</th>
              <th className="p-4 text-sm font-semibold">Precio</th>
              <th className="p-4 text-sm font-semibold">IVA</th>
              <th className="p-4 text-sm font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {services.map(s => (
              <tr key={s.id}>
                <td className="p-4 text-sm font-medium">{s.description}</td>
                <td className="p-4 text-sm">{(s.price_cents / 100).toFixed(2)}€</td>
                <td className="p-4 text-sm text-gray-500">{s.iva_rate}%</td>
                <td className="p-4 text-sm flex justify-end gap-2">
                  <Link href={`/dashboard/services/${s.id}/edit`} className="text-blue-600 font-medium px-2 py-1 hover:underline">Editar</Link>
                  <form action={async () => {
                    'use server'
                    await deleteService(s.id)
                  }}>
                    <button type="submit" className="text-red-600 font-medium px-2 py-1 hover:underline">Borrar</button>
                  </form>
                </td>
              </tr>
            ))}
            {services.length === 0 && (
              <tr>
                <td colSpan={4} className="p-10 text-center text-gray-500">Catálogo vacío. Añade tarifas predeterminadas.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
