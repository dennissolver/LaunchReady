import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

// Use service role for webhook (no user session)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.supabase_user_id

        if (userId && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          )

          const subData = subscription as unknown as { current_period_end?: number }
          const periodEnd = subData.current_period_end

          await supabase
            .from('profiles')
            .update({
              plan: 'pro',
              stripe_subscription_id: subscription.id,
              stripe_subscription_status: subscription.status,
              stripe_current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
            })
            .eq('id', userId)

          console.log(`User ${userId} upgraded to Pro`)
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.supabase_user_id

        if (userId) {
          const plan = subscription.status === 'active' ? 'pro' : 'free'

          const subData = subscription as unknown as { current_period_end?: number }
          const periodEnd = subData.current_period_end

          await supabase
            .from('profiles')
            .update({
              plan,
              stripe_subscription_status: subscription.status,
              stripe_current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
            })
            .eq('id', userId)

          console.log(`User ${userId} subscription updated to ${subscription.status}`)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.supabase_user_id

        if (userId) {
          await supabase
            .from('profiles')
            .update({
              plan: 'free',
              stripe_subscription_status: 'canceled',
              stripe_subscription_id: null,
            })
            .eq('id', userId)

          console.log(`User ${userId} subscription cancelled, downgraded to Free`)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as unknown as { subscription?: string }
        const subscriptionId = invoice.subscription

        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)
          const userId = subscription.metadata?.supabase_user_id

          if (userId) {
            await supabase
              .from('profiles')
              .update({
                stripe_subscription_status: 'past_due',
              })
              .eq('id', userId)

            console.log(`User ${userId} payment failed`)
          }
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}