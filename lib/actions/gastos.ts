'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '../supabase/server'
import { getQuarterDates } from '../utils/quarters'

export async function createGasto(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const fecha = formData.get('fecha') as string
  const descripcion = formData.get('descripcion') as string
  const categoria = formData.get('categoria') as string
  const importeTotal = parseFloat(formData.get('importe_total') as string)
  const ivaRate = parseInt(formData.get('iva_rate') as string, 10)
  const deduciblePercent = parseInt(formData.get('deducible_percent') as string, 10)
  const justificacion = (formData.get('justificacion') as string) || null

  const importeCents = Math.round(importeTotal * 100)
  const baseImponibleCents = Math.round(importeCents / (1 + ivaRate / 100))
  const ivaSoportadoCents = importeCents - baseImponibleCents

  const { error } = await supabase.from('cl_gastos').insert({
    user_id: user.id,
    fecha,
    descripcion,
    categoria,
    importe_cents: importeCents,
    base_imponible_cents: baseImponibleCents,
    iva_soportado_cents: ivaSoportadoCents,
    iva_rate: ivaRate,
    deducible_percent: deduciblePercent,
    justificacion,
  })

  if (error) {
    redirect('/dashboard/gastos/new?error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/dashboard/gastos')
  redirect('/dashboard/gastos')
}

export async function getGastos(quarter?: string, year?: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  let query = supabase
    .from('cl_gastos')
    .select('*')
    .eq('user_id', user.id)
    .order('fecha', { ascending: false })

  if (quarter && year) {
    const { start, end } = getQuarterDates(quarter, year)
    query = query.gte('fecha', start).lt('fecha', end)
  }

  const { data } = await query
  return data ?? []
}

export async function deleteGasto(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('cl_gastos')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/gastos')
  return { success: true }
}
