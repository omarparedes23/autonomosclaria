'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '../supabase/server'
import { createServiceClient } from '../supabase/service'

export async function saveOnboardingProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const name = formData.get('name') as string
  const nif = formData.get('nif') as string
  const fiscal_address = formData.get('fiscal_address') as string

  const serviceClient = createServiceClient()
  const { error } = await serviceClient.from('cl_users').upsert({
    id: user.id,
    name,
    nif,
    fiscal_address,
  })

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function saveOnboardingClient(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const name = formData.get('name') as string
  const email = formData.get('email') as string | null
  const nif = formData.get('nif') as string | null

  if (!name?.trim()) return { error: 'El nombre del cliente es obligatorio' }

  const { error } = await supabase.from('cl_clients').insert({
    user_id: user.id,
    name: name.trim(),
    email: email || null,
    nif: nif || null,
  })

  if (error) return { error: error.message }

  revalidatePath('/dashboard/clients')
  revalidatePath('/dashboard/invoices/new')
  return { success: true }
}
