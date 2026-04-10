import { getClients } from '@/lib/actions/clients'
import InvoiceBuilder from './InvoiceBuilder'

export default async function NewInvoicePage() {
  const clients = await getClients()

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Crear Nueva Factura</h1>
      {clients && clients.length > 0 ? (
        <InvoiceBuilder clients={clients} />
      ) : (
        <div className="bg-yellow-50 text-yellow-800 p-4 rounded">
          <p>Debes crear al menos un cliente antes de generar facturas.</p>
        </div>
      )}
    </div>
  )
}
