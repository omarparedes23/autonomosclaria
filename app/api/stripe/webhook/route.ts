export const runtime = 'nodejs'

import { getStripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase/service'
import Stripe from 'stripe'

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return new Response('Missing stripe-signature header', { status: 400 })
  }

  const stripe = getStripe()
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    console.error('[stripe/webhook] Signature verification failed:', err.message)
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }

  const db = createServiceClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.user_id
        const subscriptionId = session.subscription as string
        const customerId = session.customer as string

        if (!userId || !subscriptionId) break

        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        // In Stripe API ≥ 2024-09-30, current_period_end moved to SubscriptionItem
        const subAny = subscription as any
        const periodEnd: number = subAny.current_period_end ?? subAny.items?.data?.[0]?.current_period_end ?? 0
        const expiresAt = new Date(periodEnd * 1000).toISOString()

        await db.from('cl_users').update({
          plan: 'pro',
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          plan_expires_at: expiresAt,
        }).eq('id', userId)

        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        const subAny = subscription as any
        const periodEnd: number = subAny.current_period_end ?? subAny.items?.data?.[0]?.current_period_end ?? 0
        const expiresAt = new Date(periodEnd * 1000).toISOString()
        const isActive = subscription.status === 'active' || subscription.status === 'trialing'

        await db.from('cl_users').update({
          plan: isActive ? 'pro' : 'free',
          stripe_subscription_id: isActive ? subscription.id : null,
          plan_expires_at: isActive ? expiresAt : null,
        }).eq('stripe_customer_id', customerId)

        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        await db.from('cl_users').update({
          plan: 'free',
          stripe_subscription_id: null,
          plan_expires_at: null,
        }).eq('stripe_customer_id', customerId)

        break
      }

      default:
        // Unhandled event types — ignore
        break
    }
  } catch (err: any) {
    console.error(`[stripe/webhook] Error handling ${event.type}:`, err.message)
    return new Response('Internal error', { status: 500 })
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
}
