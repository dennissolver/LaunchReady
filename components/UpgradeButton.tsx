'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

interface UpgradeButtonProps {
  children: React.ReactNode
  className?: string
  priceId?: string
}

export function UpgradeButton({ children, className, priceId }: UpgradeButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleClick = async () => {
    setLoading(true)

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          priceId: priceId || process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID 
        }),
      })

      const data = await response.json()

      if (response.status === 401) {
        // Not logged in - redirect to signup with plan
        router.push('/signup?plan=pro')
        return
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      console.error('Checkout error:', err)
      // Fallback to signup page
      router.push('/signup?plan=pro')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={className}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  )
}
