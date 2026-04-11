'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '../supabase/server'
import { getStripe } from '../stripe'

export async function cancelSubscription() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: profile } = await supabase
    .from('cl_users')
    .select('plan, stripe_subscription_id, plan_expires_at')
    .eq('id', user.id)
    .single()

  if (profile?.plan !== 'pro' || !profile.stripe_subscription_id) {
    return { error: 'No tienes una suscripción activa.' }
  }

  const stripe = getStripe()

  try {
    await stripe.subscriptions.update(profile.stripe_subscription_id, {
      cancel_at_period_end: true,
    })
  } catch (err: any) {
    return { error: err.message }
  }

  revalidatePath('/dashboard/billing')
  return { success: true }
}
