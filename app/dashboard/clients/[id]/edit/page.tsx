import { getClient, updateClient } from '@/lib/actions/clients'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function ClientEditPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const client = await getClient(params.id);

  if (!client) redirect('/dashboard/clients');

  return (
    <div>
      <div className="mb-8">
        <Link href="/dashboard/clients" className="text-gray-500 hover:text-black hover:underline mb-4 inline-block">&larr; Volver a Clientes</Link>
        <h1 className="text-3xl font-bold">Editar Cliente</h1>
      </div>

      <form action={updateClient} className="space-y-6 max-w-xl bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <input type="hidden" name="id" value={client.id} />
        
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre o Razón Social</label>
            <input required type="text" name="name" defaultValue={client.name} className="w-full border border-gray-300 rounded-lg p-2.5" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">NIF / CIF / DNI</label>
            <input required type="text" name="nif" defaultValue={client.nif} className="w-full border border-gray-300 rounded-lg p-2.5" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
            <input type="email" name="email" defaultValue={client.email} className="w-full border border-gray-300 rounded-lg p-2.5" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dirección Completa</label>
            <textarea name="address" rows={2} defaultValue={client.address} className="w-full border border-gray-300 rounded-lg p-2.5" />
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button type="submit" className="bg-black text-white px-6 py-2.5 rounded-lg font-medium hover:bg-gray-800">
            Actualizar Cliente
          </button>
        </div>
      </form>
    </div>
  )
}
