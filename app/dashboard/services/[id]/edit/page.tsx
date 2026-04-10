import { getService, updateService } from '@/lib/actions/services'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function ServiceEditPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const service = await getService(params.id);

  if (!service) redirect('/dashboard/services');

  return (
    <div>
      <div className="mb-8">
        <Link href="/dashboard/services" className="text-gray-500 hover:text-black hover:underline mb-4 inline-block">&larr; Volver al Catálogo</Link>
        <h1 className="text-3xl font-bold">Editar Tarifa</h1>
      </div>

      <form action={updateService} className="space-y-6 max-w-xl bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <input type="hidden" name="id" value={service.id} />
        
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción de la tarifa</label>
            <input required type="text" name="description" defaultValue={service.description} className="w-full border border-gray-300 rounded-lg p-2.5" />
          </div>
          <div className="flex space-x-6">
            <div className="w-2/3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio Unitario (€)</label>
              <input required type="number" step="0.01" name="price" defaultValue={(service.price_cents / 100).toFixed(2)} className="w-full border border-gray-300 rounded-lg p-2.5" />
            </div>
            <div className="w-1/3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de IVA</label>
              <select name="iva" defaultValue={service.iva_rate} className="w-full border border-gray-300 rounded-lg p-2.5 bg-white">
                <option value={21}>21% (General)</option>
                <option value={10}>10% (Reducido)</option>
                <option value={4}>4% (Super)</option>
                <option value={0}>0% (Exento)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button type="submit" className="bg-black text-white px-6 py-2.5 rounded-lg font-medium hover:bg-gray-800">
            Actualizar Tarifa
          </button>
        </div>
      </form>
    </div>
  )
}
