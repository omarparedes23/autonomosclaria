import { getInvoice, updateInvoiceStatus } from '@/lib/actions/invoices'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { DispatchButton } from '../../DispatchButton'

export default async function InvoiceDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const invoice = await getInvoice(params.id);

  if (!invoice) redirect('/dashboard');

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <Link href="/dashboard" className="text-gray-500 hover:text-black hover:underline mb-4 inline-block">&larr; Volver al Dashboard</Link>
          <h1 className="text-3xl font-bold">Factura {invoice.invoice_number}</h1>
        </div>
        <div className="flex space-x-4">
          <a href={`/api/pdf/${invoice.id}`} target="_blank" className="bg-white border border-gray-300 text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-50 flex items-center">
            Descargar PDF
          </a>
          {invoice.status === 'pending' && (
            <>
              <form action={async () => {
                'use server'
                await updateInvoiceStatus(invoice.id, 'paid')
              }}>
                <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors">
                  Marcar como pagada
                </button>
              </form>
              <DispatchButton invoiceId={invoice.id} customClass="bg-black text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800" />
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="font-semibold text-gray-500 mb-4 uppercase text-sm tracking-wider">Detalles de Emisión</h3>
          <p className="text-3xl font-medium mb-1">{(invoice.total_cents / 100).toFixed(2)}€</p>
          <div className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold mb-4">
            {invoice.status.toUpperCase()}
          </div>
          <p className="text-sm text-gray-500 mt-4">Fecha de Creación: <span className="font-semibold text-gray-900">{new Date(invoice.issue_date).toLocaleDateString('es-ES')}</span></p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="font-semibold text-gray-500 mb-4 uppercase text-sm tracking-wider">Facturado a</h3>
          <p className="font-bold text-lg">{invoice.cl_clients?.name}</p>
          <p className="text-gray-600">NIF: {invoice.cl_clients?.nif}</p>
          <p className="text-gray-600">{invoice.cl_clients?.email}</p>
          <p className="text-gray-600 mt-2">{invoice.cl_clients?.address}</p>
        </div>
      </div>
      
      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 text-sm font-semibold">Concepto</th>
              <th className="p-4 text-sm font-semibold">Cantidad</th>
              <th className="p-4 text-sm font-semibold text-right">Monto</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {invoice.cl_invoice_items?.map((item: any) => (
              <tr key={item.id}>
                <td className="p-4 text-sm font-medium">{item.description}</td>
                <td className="p-4 text-sm text-gray-500">{item.quantity}</td>
                <td className="p-4 text-sm text-right font-medium">{((item.quantity * item.unit_price_cents) / 100).toFixed(2)}€</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
