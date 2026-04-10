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

  return data
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
