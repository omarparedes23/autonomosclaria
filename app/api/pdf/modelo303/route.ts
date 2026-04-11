export const runtime = 'nodejs'

import { createClient } from '@/lib/supabase/server'
import { getQuarterInvoices } from '@/lib/actions/trimestral'
import { getGastos } from '@/lib/actions/gastos'
import { Modelo303PDF } from '@/components/Modelo303PDF'
import { renderToStream } from '@react-pdf/renderer'
import React from 'react'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const quarter = searchParams.get('quarter') ?? 'Q1'
  const year = parseInt(searchParams.get('year') ?? String(new Date().getFullYear()), 10)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const [invoices, gastos, profileRes] = await Promise.all([
    getQuarterInvoices(quarter, year),
    getGastos(quarter, year),
    supabase.from('cl_users').select('plan, name, nif, fiscal_address').eq('id', user.id).single(),
  ])

  const profile = profileRes.data

  if (profile?.plan !== 'pro') {
    return new Response('Esta función está disponible en el plan Pro.', { status: 403 })
  }

  // IVA devengado breakdown from invoice items
  const ivaByRate: Record<number, { base: number; cuota: number }> = {}
  for (const inv of invoices) {
    const items: any[] = (inv as any).cl_invoice_items ?? []
    for (const item of items) {
      const rate: number = item.iva_rate
      if (!ivaByRate[rate]) ivaByRate[rate] = { base: 0, cuota: 0 }
      const base = item.quantity * item.unit_price_cents
      ivaByRate[rate].base += base
      ivaByRate[rate].cuota += Math.round(base * (rate / 100))
    }
  }

  const c01 = ivaByRate[21]?.base ?? 0
  const c02 = ivaByRate[21]?.cuota ?? 0
  const c06 = ivaByRate[10]?.base ?? 0
  const c07 = ivaByRate[10]?.cuota ?? 0
  const c11 = ivaByRate[4]?.base ?? 0
  const c12 = ivaByRate[4]?.cuota ?? 0
  const c27 = c02 + c07 + c12

  // IVA soportado from gastos (deductible portion only)
  const c28 = gastos.reduce((acc, g) => acc + Math.round(g.base_imponible_cents * g.deducible_percent / 100), 0)
  const c29 = gastos.reduce((acc, g) => acc + Math.round(g.iva_soportado_cents * g.deducible_percent / 100), 0)

  const c46 = c27 - c29
  const c69 = c46

  const casillas = {
    c01_base21: c01,
    c02_cuota21: c02,
    c06_base10: c06,
    c07_cuota10: c07,
    c11_base4: c11,
    c12_cuota4: c12,
    c27_totalDevengado: c27,
    c28_baseDeducible: c28,
    c29_cuotaSoportada: c29,
    c46_diferencia: c46,
    c69_resultado: c69,
  }

  try {
    const stream = await renderToStream(
      React.createElement(Modelo303PDF, {
        quarter,
        year,
        profile,
        casillas,
      }) as any
    )

    const buffers: Buffer[] = []
    await new Promise<void>((resolve, reject) => {
      stream.on('data', (d: Buffer) => buffers.push(d))
      stream.on('end', resolve)
      stream.on('error', reject)
    })

    const buffer = Buffer.concat(buffers)
    const filename = `modelo303-${quarter}-${year}.pdf`

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
