import { getInvoice } from '@/lib/actions/invoices'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import RectificarForm from './RectificarForm'

export default async function RectificarPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const invoice = await getInvoice(params.id)

  if (!invoice) redirect('/dashboard')
  if (invoice.rectificative) redirect(`/dashboard/invoices/${params.id}`)

  // Derive original IRPF rate from stored cents
  let irpfRate: 0 | 7 | 15 = 0
  if (invoice.irpf_retention_cents > 0 && invoice.taxable_base_cents > 0) {
    const rate = Math.round((invoice.irpf_retention_cents / invoice.taxable_base_cents) * 100)
    if (rate === 7) irpfRate = 7
    else if (rate >= 15) irpfRate = 15
  }

  const originalItems = (invoice.cl_invoice_items ?? []).map((item: any) => ({
    description: item.description as string,
    quantity: item.quantity as number,
    unit_price_cents: item.unit_price_cents as number,
    iva_rate: item.iva_rate as 0 | 4 | 10 | 21,
  }))

  return (
    <div>
      <div className="mb-8">
        <Link
          href={`/dashboard/invoices/${params.id}`}
          className="text-gray-400 hover:text-black transition-colors mb-4 inline-block"
        >
          ← Volver a factura {invoice.invoice_number}
        </Link>
        <h1 className="text-3xl font-bold">Emitir factura rectificativa</h1>
        <p className="text-gray-500 text-sm mt-1">
          Rectifica la factura <span className="font-medium text-gray-700">{invoice.invoice_number}</span>
        </p>
      </div>

      <RectificarForm
        originalId={params.id}
        originalNumber={invoice.invoice_number}
        originalItems={originalItems}
        originalIrpfRate={irpfRate}
      />
    </div>
  )
}
