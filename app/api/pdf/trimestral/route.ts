export const runtime = 'nodejs'

import { createClient } from '@/lib/supabase/server'
import { getQuarterInvoices } from '@/lib/actions/trimestral'
import { getQuarterDates } from '@/lib/utils/quarters'
import { TrimestralPDF } from '@/components/TrimestralPDF'
import { renderToStream } from '@react-pdf/renderer'
import React from 'react'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const quarter = searchParams.get('quarter') ?? 'Q1'
  const year = parseInt(searchParams.get('year') ?? String(new Date().getFullYear()), 10)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const [invoices, profileRes] = await Promise.all([
    getQuarterInvoices(quarter, year),
    supabase.from('cl_users').select('plan, name, nif, fiscal_address').eq('id', user.id).single(),
  ])

  const profile = profileRes.data

  if (profile?.plan !== 'pro') {
    return new Response('Esta función está disponible en el plan Pro.', { status: 403 })
  }

  // Compute summary
  const totalBase = invoices.reduce((acc, inv) => acc + inv.taxable_base_cents, 0)
  const totalIva = invoices.reduce((acc, inv) => acc + inv.iva_quota_cents, 0)
  const totalIrpf = invoices.reduce((acc, inv) => acc + (inv.irpf_retention_cents ?? 0), 0)

  const ivaBreakdown: Record<string, { base: number; iva: number }> = {}
  for (const inv of invoices) {
    const items = (inv as any).cl_invoice_items ?? []
    for (const item of items) {
      const rate = String(item.iva_rate)
      if (!ivaBreakdown[rate]) ivaBreakdown[rate] = { base: 0, iva: 0 }
      const base = item.quantity * item.unit_price_cents
      ivaBreakdown[rate].base += base
      ivaBreakdown[rate].iva += Math.round(base * (item.iva_rate / 100))
    }
  }

  try {
    const stream = await renderToStream(
      React.createElement(TrimestralPDF, {
        quarter,
        year,
        profile,
        invoices: invoices as any,
        totalBase,
        totalIva,
        totalIrpf,
        ivaBreakdown,
      }) as any
    )

    const buffers: Buffer[] = []
    await new Promise<void>((resolve, reject) => {
      stream.on('data', (d: Buffer) => buffers.push(d))
      stream.on('end', resolve)
      stream.on('error', reject)
    })

    const buffer = Buffer.concat(buffers)
    const filename = `resumen-trimestral-${quarter}-${year}.pdf`

    return new Response(buffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (err: any) {
    return new Response(`PDF generation failed: ${err.message}`, { status: 500 })
  }
}
