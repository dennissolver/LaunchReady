'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Loader2, Shield } from 'lucide-react'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const plan = searchParams.get('plan')
  const supabase = createClientComponentClient()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the session
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Auth callback error:', error)
          router.push('/login?error=auth_failed')
          return
        }

        if (!session) {
          // No session yet, might still be processing
          // Wait a bit and check again
          await new Promise(resolve => setTimeout(resolve, 1000))
          const { data: { session: retrySession } } = await supabase.auth.getSession()
          
          if (!retrySession) {
            router.push('/login')
            return
          }
        }

        // Check if this is a Pro signup
        if (plan === 'pro') {
          // Redirect to Stripe checkout
          try {
            const response = await fetch('/api/stripe/checkout', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID 
              }),
            })

            const data = await response.json()

            if (data.url) {
              window.location.href = data.url
              return
            }
          } catch (stripeError) {
            console.error('Stripe checkout error:', stripeError)
          }
        }

        // Default: redirect to dashboard
        router.push('/dashboard')
      } catch (err) {
        console.error('Callback processing error:', err)
        router.push('/login?error=callback_failed')
      }
    }

    handleCallback()
  }, [router, searchParams, plan, supabase])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <Loader2 className="w-8 h-8 animate-spin text-violet-500 mx-auto mb-4" />
        <p className="text-slate-400">
          {plan === 'pro' ? 'Setting up your Pro account...' : 'Completing sign in...'}
        </p>
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}
