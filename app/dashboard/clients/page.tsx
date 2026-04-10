import { getClients, deleteClient } from '@/lib/actions/clients'
import Link from 'next/link'

export default async function ClientsPage() {
  const clients = await getClients()

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Mis Clientes</h1>
        <Link href="/dashboard/clients/new" className="bg-black text-white px-4 py-2 rounded-lg font-medium">
          + Nuevo Cliente
        </Link>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 text-sm font-semibold">Razón Social</th>
              <th className="p-4 text-sm font-semibold">NIF</th>
              <th className="p-4 text-sm font-semibold space-x-2 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {clients.map(c => (
              <tr key={c.id}>
                <td className="p-4 text-sm font-medium">{c.name}</td>
                <td className="p-4 text-sm text-gray-500">{c.nif}</td>
                <td className="p-4 text-sm flex justify-end gap-2">
                  <Link href={`/dashboard/clients/${c.id}/edit`} className="text-blue-600 font-medium px-2 py-1 hover:underline">Editar</Link>
                  <form action={async () => {
                    'use server'
                    await deleteClient(c.id)
                  }}>
                    <button type="submit" className="text-red-600 font-medium px-2 py-1 hover:underline">Borrar</button>
                  </form>
                </td>
              </tr>
            ))}
            {clients.length === 0 && (
              <tr>
                <td colSpan={3} className="p-10 text-center text-gray-500">No tienes clientes aún.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
