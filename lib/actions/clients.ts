'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '../supabase/server'

export async function createClientAction(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const name = formData.get('name') as string
  const nif = formData.get('nif') as string
  const email = formData.get('email') as string | null
  const address = formData.get('address') as string | null

  const { error } = await supabase.from('cl_clients').insert({
    user_id: user.id,
    name,
    nif,
    email,
    address,
  })

  if (error) {
    redirect('/dashboard/clients?error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/dashboard/clients')
  revalidatePath('/dashboard/invoices/new')
  redirect('/dashboard/clients')
}

export async function updateClient(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const nif = formData.get('nif') as string
  const email = formData.get('email') as string
  const address = formData.get('address') as string

  const { error } = await supabase
    .from('cl_clients')
    .update({ name, nif, email, address, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    redirect(`/dashboard/clients/${id}/edit?error=` + encodeURIComponent(error.message))
  }

  revalidatePath('/dashboard/clients')
  revalidatePath('/dashboard/invoices/new')
  redirect('/dashboard/clients')
}

export async function deleteClient(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('cl_clients')
    .update({ archived_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)
  
  revalidatePath('/dashboard/clients')
  revalidatePath('/dashboard/invoices/new')
  return { success: true }
}

export async function getClients() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  const { data, error } = await supabase
    .from('cl_clients')
    .select('*')
    .eq('user_id', user.id)
    .is('archived_at', null)
    .order('name')

  if (error) {
    console.error('Error fetching clients:', error)
    return []
  }

  return data
}

export async function getClient(id: string) {
  const supabase = await createClient()
  const { data } = await supabase.from('cl_clients').select('*').eq('id', id).single()
  return data
}
