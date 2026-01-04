
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Shield } from 'lucide-react'

export default function CheckoutProPage() {
  const router = useRouter()
  const [error, setError] = useState('')

  useEffect(() => {
    const redirectToStripe = async () => {
      try {
        const response = await fetch('/api/stripe/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID
          }),
        })

        const data = await response.json()

        if (response.status === 401) {
          // Not logged in
          router.push('/login')
          return
        }

        if (!response.ok) {
          throw new Error(data.error || 'Failed to create checkout session')
        }

        if (data.url) {
          window.location.href = data.url
        } else {
          throw new Error('No checkout URL returned')
        }
      } catch (err: any) {
        console.error('Checkout error:', err)
        setError(err.message || 'Something went wrong')
      }
    }

    redirectToStripe()
  }, [router])

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-5">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-xl font-semibold text-white mb-2">Checkout Error</h1>
          <p className="text-slate-400 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-violet-600 hover:bg-violet-500 rounded-lg text-white font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <Loader2 className="w-8 h-8 animate-spin text-violet-500 mx-auto mb-4" />
        <p className="text-slate-400">Redirecting to checkout...</p>
      </div>
    </div>
  )
}