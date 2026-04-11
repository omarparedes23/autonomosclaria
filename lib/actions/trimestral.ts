'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '../supabase/server'
import { getQuarterDates } from '../utils/quarters'

export async function getQuarterInvoices(quarter: string, year: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { start, end } = getQuarterDates(quarter, year)

  const { data } = await supabase
    .from('cl_invoices')
    .select(`*, cl_clients ( name ), cl_invoice_items ( * )`)
    .eq('user_id', user.id)
    .gte('issue_date', start)
    .lt('issue_date', end)
    .order('issue_date', { ascending: true })

  return data ?? []
}

export async function getAllQuartersWithInvoices() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('cl_invoices')
    .select('issue_date, taxable_base_cents, iva_quota_cents, id')
    .eq('user_id', user.id)
    .order('issue_date', { ascending: false })

  if (!data) return []

  const qMap: Record<string, { quarter: string; year: number; count: number; base: number; iva: number }> = {}

  for (const inv of data) {
    const d = new Date(inv.issue_date)
    const y = d.getFullYear()
    const m = d.getMonth() + 1
    const q = m <= 3 ? 'Q1' : m <= 6 ? 'Q2' : m <= 9 ? 'Q3' : 'Q4'
    const key = `${y}-${q}`
    if (!qMap[key]) qMap[key] = { quarter: q, year: y, count: 0, base: 0, iva: 0 }
    qMap[key].count++
    qMap[key].base += inv.taxable_base_cents
    qMap[key].iva += inv.iva_quota_cents
  }

  return Object.values(qMap).sort((a, b) =>
    b.year !== a.year ? b.year - a.year : b.quarter.localeCompare(a.quarter)
  )
}

export async function getQuarterlyDeclarations() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('cl_quarterly_declarations')
    .select('*')
    .eq('user_id', user.id)

  return data ?? []
}

export async function markQuarterDeclared(year: number, quarter: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('cl_quarterly_declarations')
    .upsert(
      { user_id: user.id, year, quarter, declared_at: new Date().toISOString() },
      { onConflict: 'user_id,year,quarter' }
    )

  if (error) return { error: error.message }
  revalidatePath('/dashboard/trimestral/historial')
  return { success: true }
}

export async function unmarkQuarterDeclared(year: number, quarter: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('cl_quarterly_declarations')
    .delete()
    .eq('user_id', user.id)
    .eq('year', year)
    .eq('quarter', quarter)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/trimestral/historial')
  return { success: true }
}
