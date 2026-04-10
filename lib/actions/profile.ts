'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '../supabase/server'
import { createServiceClient } from '../supabase/service'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const name = formData.get('name') as string
  const nif = formData.get('nif') as string
  const fiscal_address = formData.get('fiscal_address') as string

  let logo_url = formData.get('current_logo_url') as string | null

  // Handle Logo Upload
  const logoFile = formData.get('logo') as File | null
  
  if (logoFile && logoFile.size > 0) {
    if (!logoFile.type.startsWith('image/')) {
      return { error: 'El logo debe ser una imagen válida.' }
    }
    
    // Extensión simple (ej: image/png -> png)
    const fileExt = logoFile.type.split('/')[1] || 'png'
    const fileName = `${user.id}/logo_${Date.now()}.${fileExt}`

    // Upload to 'cl_logos' bucket
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('cl_logos')
      .upload(fileName, logoFile, {
        upsert: true,
        cacheControl: '3600'
      })

    if (uploadError) {
      return { error: `Fallo al subir Logo: ${uploadError.message}` }
    }

    // Get public URL logically
    const { data: { publicUrl } } = supabase.storage.from('cl_logos').getPublicUrl(fileName)
    logo_url = publicUrl
  }

  // Upsert profile data — use service client to bypass RLS on server action
  const serviceClient = createServiceClient()
  const { error } = await serviceClient.from('cl_users').upsert({
    id: user.id,
    name,
    nif,
    fiscal_address,
    logo_url
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/profile')
  return { success: true }
}

export async function getProfile() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('cl_users')
    .select('*')
    .eq('id', user.id)
    .single()
    
  return data
}
