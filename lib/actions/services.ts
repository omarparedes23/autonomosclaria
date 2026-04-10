'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '../supabase/server'

// Valid IVA rates in Spain
const VALID_IVA_RATES = [21, 10, 4, 0]

export async function createServiceAction(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const description = formData.get('description') as string
  const iva_rate = parseInt(formData.get('iva') as string, 10)

  if (!VALID_IVA_RATES.includes(iva_rate)) {
    redirect('/dashboard/services/new?error=IVA+inválido')
  }

  const price_cents = Math.round(parseFloat(formData.get('price') as string) * 100)

  const { error } = await supabase.from('cl_services').insert({
    user_id: user.id,
    description,
    price_cents,
    iva_rate,
  })

  if (error) {
    redirect('/dashboard/services?error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/dashboard/services')
  revalidatePath('/dashboard/invoices/new')
  redirect('/dashboard/services')
}

export async function updateService(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const id = formData.get('id') as string
  const description = formData.get('description') as string
  const rawPrice = parseFloat(formData.get('price') as string)
  const iva_rate = parseInt(formData.get('iva') as string, 10)

  if (isNaN(rawPrice) || rawPrice <= 0) {
    redirect(`/dashboard/services/${id}/edit?error=Precio inválido`)
  }

  if (!VALID_IVA_RATES.includes(iva_rate)) {
    redirect(`/dashboard/services/${id}/edit?error=IVA inválido`)
  }

  const price_cents = Math.round(rawPrice * 100)

  const { error } = await supabase
    .from('cl_services')
    .update({ description, price_cents, iva_rate, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    redirect(`/dashboard/services/${id}/edit?error=` + encodeURIComponent(error.message))
  }

  revalidatePath('/dashboard/services')
  revalidatePath('/dashboard/invoices/new')
  redirect('/dashboard/services')
}

export async function deleteService(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('cl_services')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)
  
  revalidatePath('/dashboard/services')
  revalidatePath('/dashboard/invoices/new')
  return { success: true }
}

export async function getServices() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  const { data, error } = await supabase
    .from('cl_services')
    .select('*')
    .eq('user_id', user.id)
    .order('description')

  if (error) {
    console.error('Error fetching services:', error)
    return []
  }

  return data
}

export async function getService(id: string) {
  const supabase = await createClient()
  const { data } = await supabase.from('cl_services').select('*').eq('id', id).single()
  return data
}
