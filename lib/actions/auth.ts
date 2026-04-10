'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '../supabase/server'
import { sendWelcomeEmail } from './email'

export async function loginUser(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/login?error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/dashboard')
  redirect('/dashboard')
}

export async function signupUser(formData: FormData) {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirm_password') as string

  if (password !== confirmPassword) {
    redirect('/register?error=' + encodeURIComponent('Las contraseñas no coinciden'))
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  })

  if (error) {
    redirect('/register?error=' + encodeURIComponent(error.message))
  }

  await sendWelcomeEmail(email, name)

  revalidatePath('/dashboard')
  redirect('/dashboard/onboarding')
}

export async function logoutUser() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  
  redirect('/login')
}
