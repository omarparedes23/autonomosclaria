'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '../supabase/server'

interface InvoiceLineItem {
  description: string;
  quantity: number;
  unit_price_cents: number;
  iva_rate: 21 | 10 | 4 | 0;
}

interface InvoicePayload {
  client_id: string;
  items: InvoiceLineItem[];
  apply_irpf: 0 | 15 | 7; 
}

export async function createInvoiceAction(payload: InvoicePayload) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  // Enforce free plan limit: max 3 invoices per calendar month
  const { data: profile } = await supabase
    .from('cl_users')
    .select('plan')
    .eq('id', user.id)
    .single()

  if (profile?.plan !== 'pro') {
    const now = new Date()
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
    const { count } = await supabase
      .from('cl_invoices')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('issue_date', monthStart)

    if ((count ?? 0) >= 3) {
      return {
        error: 'Has alcanzado el límite de 3 facturas mensuales del plan Free. Actualiza a Pro para crear facturas ilimitadas.',
        limitReached: true as const,
      }
    }
  }

  // Generate atomic sequential invoice number
  const { data: invoiceNumber, error: rpcError } = await supabase.rpc(
    'generate_invoice_number',
    { p_user_id: user.id }
  )

  if (rpcError || !invoiceNumber) {
    return { error: 'Failed to generate atomic invoice number: ' + rpcError?.message }
  }

  // Calculate totals strictly in cents
  let taxable_base_cents = 0;
  let iva_quota_cents = 0;

  const resolvedItems = payload.items.map((item) => {
    const itemTotalBase = item.quantity * Math.round(item.unit_price_cents);
    const itemIvaTotal = Math.round(itemTotalBase * (item.iva_rate / 100));

    taxable_base_cents += itemTotalBase;
    iva_quota_cents += itemIvaTotal;

    return {
      description: item.description,
      quantity: item.quantity,
      unit_price_cents: Math.round(item.unit_price_cents),
      iva_rate: item.iva_rate,
      total_cents: itemTotalBase + itemIvaTotal,
    }
  })

  // Apply IRPF optionally
  const irpf_retention_cents = Math.round(taxable_base_cents * (payload.apply_irpf / 100));
  
  // Total to pay
  const total_cents = taxable_base_cents + iva_quota_cents - irpf_retention_cents;

  // Insert Invoice
  const { data: invoiceData, error: invoiceError } = await supabase
    .from('cl_invoices')
    .insert({
      user_id: user.id,
      client_id: payload.client_id,
      invoice_number: invoiceNumber,
      status: 'pending',
      taxable_base_cents,
      iva_quota_cents,
      irpf_retention_cents,
      total_cents,
    })
    .select('id')
    .single()

  if (invoiceError) {
    return { error: invoiceError.message }
  }

  // Insert Line Items
  const itemsToInsert = resolvedItems.map(i => ({ ...i, invoice_id: invoiceData.id }));
  const { error: itemsError } = await supabase
    .from('cl_invoice_items')
    .insert(itemsToInsert)

  if (itemsError) {
    // In a production app, we would compensate or rollback here.
    return { error: itemsError.message }
  }

  revalidatePath('/dashboard')
  return { success: true, invoice_id: invoiceData.id, invoice_number: invoiceNumber }
}

export async function getInvoice(id: string) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('cl_invoices')
    .select(`
      *,
      cl_clients ( name, nif, email, address ),
      cl_invoice_items ( * ),
      cl_users ( * )
    `)
    .eq('id', id)
    .single()

  if (!data) return null

  // Fetch original invoice number for rectificativas
  if (data.rectificative && data.original_invoice_id) {
    const { data: orig } = await supabase
      .from('cl_invoices')
      .select('invoice_number')
      .eq('id', data.original_invoice_id)
      .single()
    return { ...data, original_invoice_number: orig?.invoice_number ?? null }
  }

  return data
}

export async function createRectificativeInvoice(
  originalId: string,
  payload: {
    motivo: string
    items: InvoiceLineItem[]
    apply_irpf: 0 | 7 | 15
  }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: original } = await supabase
    .from('cl_invoices')
    .select('id, invoice_number, client_id')
    .eq('id', originalId)
    .eq('user_id', user.id)
    .single()

  if (!original) return { error: 'Factura original no encontrada' }

  const year = new Date().getFullYear()
  const { count } = await supabase
    .from('cl_invoices')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('rectificative', true)
    .gte('issue_date', `${year}-01-01`)
    .lt('issue_date', `${year + 1}-01-01`)

  const seq = (count ?? 0) + 1
  const invoiceNumber = `R-${year}-${String(seq).padStart(3, '0')}`

  let taxable_base_cents = 0
  let iva_quota_cents = 0

  const resolvedItems = payload.items.map((item) => {
    const base = item.quantity * Math.round(item.unit_price_cents)
    const iva = Math.round(base * (item.iva_rate / 100))
    taxable_base_cents += base
    iva_quota_cents += iva
    return {
      description: item.description,
      quantity: item.quantity,
      unit_price_cents: Math.round(item.unit_price_cents),
      iva_rate: item.iva_rate,
      total_cents: base + iva,
    }
  })

  const irpf_retention_cents = Math.round(taxable_base_cents * (payload.apply_irpf / 100))
  const total_cents = taxable_base_cents + iva_quota_cents - irpf_retention_cents

  const { data: invoiceData, error: invoiceError } = await supabase
    .from('cl_invoices')
    .insert({
      user_id: user.id,
      client_id: original.client_id,
      invoice_number: invoiceNumber,
      status: 'pending',
      taxable_base_cents,
      iva_quota_cents,
      irpf_retention_cents,
      total_cents,
      rectificative: true,
      original_invoice_id: originalId,
      motivo_rectificacion: payload.motivo,
    })
    .select('id')
    .single()

  if (invoiceError) return { error: invoiceError.message }

  const { error: itemsError } = await supabase
    .from('cl_invoice_items')
    .insert(resolvedItems.map((i) => ({ ...i, invoice_id: invoiceData.id })))

  if (itemsError) return { error: itemsError.message }

  revalidatePath('/dashboard')
  revalidatePath(`/dashboard/invoices/${originalId}`)
  return { success: true, invoice_id: invoiceData.id, invoice_number: invoiceNumber }
}

export async function updateInvoiceStatus(id: string, status: 'pending' | 'paid') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('cl_invoices')
    .update({ status })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard')
  revalidatePath(`/dashboard/invoices/${id}`)
}

export async function getYearInvoices(year: number) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('cl_invoices')
    .select('taxable_base_cents, iva_quota_cents, issue_date, status')
    .gte('issue_date', `${year}-01-01`)
    .lt('issue_date', `${year + 1}-01-01`)
  return data ?? []
}

export async function getInvoices(filters?: { month?: number; year?: number }) {
  const supabase = await createClient()

  let query = supabase
    .from('cl_invoices')
    .select(`*, cl_clients ( name )`)
    .order('issue_date', { ascending: false })

  if (filters?.year && filters?.month) {
    const pad = (n: number) => String(n).padStart(2, '0')
    const start = `${filters.year}-${pad(filters.month)}-01`
    const nextMonth = filters.month === 12 ? 1 : filters.month + 1
    const nextYear = filters.month === 12 ? filters.year + 1 : filters.year
    const end = `${nextYear}-${pad(nextMonth)}-01`
    query = query.gte('issue_date', start).lt('issue_date', end)
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data
}
