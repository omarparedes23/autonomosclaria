import { createClientAction } from '@/lib/actions/clients'
import Link from 'next/link'

export default function ClientFormPage() {
  return (
    <div>
      <div className="mb-8">
        <Link href="/dashboard/clients" className="text-gray-500 hover:text-black hover:underline mb-4 inline-block">&larr; Volver a Clientes</Link>
        <h1 className="text-3xl font-bold">Crear / Editar Cliente</h1>
      </div>

      <form action={createClientAction} className="space-y-6 max-w-xl bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre o Razón Social</label>
            <input required type="text" name="name" className="w-full border border-gray-300 rounded-lg p-2.5" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">NIF / CIF / DNI</label>
            <input required type="text" name="nif" className="w-full border border-gray-300 rounded-lg p-2.5" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
            <input type="email" name="email" className="w-full border border-gray-300 rounded-lg p-2.5" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dirección Completa</label>
            <textarea name="address" rows={2} className="w-full border border-gray-300 rounded-lg p-2.5" />
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button type="submit" className="bg-black text-white px-6 py-2.5 rounded-lg font-medium hover:bg-gray-800">
            Guardar Cliente
          </button>
        </div>
      </form>
    </div>
  )
}
