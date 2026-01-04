'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Shield, Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, Chrome, Server, Users } from 'lucide-react'

function SignupForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const router = useRouter()
  const searchParams = useSearchParams()
  const plan = searchParams.get('plan')
  const supabase = createClientComponentClient()

  const isPro = plan === 'pro'

  // Redirect to Stripe checkout after signup for Pro plan
  const redirectToStripeCheckout = async () => {
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
      } else {
        // Fallback to dashboard if checkout fails
        router.push('/dashboard')
      }
    } catch (err) {
      console.error('Stripe redirect error:', err)
      router.push('/dashboard')
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback${isPro ? '?plan=pro' : ''}`,
        },
      })

      if (error) throw error

      if (data.user && !data.session) {
        // Email confirmation required
        setMessage('Check your email for a confirmation link!')
      } else if (data.session) {
        // Auto-confirmed (e.g., in development)
        if (isPro) {
          await redirectToStripeCheckout()
        } else {
          router.push('/dashboard')
        }
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    setGoogleLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback${isPro ? '?plan=pro' : ''}`,
        },
      })

      if (error) throw error
    } catch (err: any) {
      setError(err.message || 'Google sign up failed')
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-5 relative overflow-hidden">
      {/* Ambient glow effects */}
      <div className="absolute -top-1/4 -left-1/4 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-1/4 -right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">LaunchReady</span>
          </Link>
        </div>

        {/* Plan indicator */}
        {isPro && (
          <div className="mb-6 p-4 bg-violet-500/10 border border-violet-500/30 rounded-xl text-center">
            <div className="flex items-center justify-center gap-2 text-violet-300 mb-1">
              <Server className="w-4 h-4" />
              <span className="font-semibold">Pro Plan Selected</span>
            </div>
            <p className="text-sm text-violet-400/70">$30/month • Dedicated infrastructure</p>
          </div>
        )}

        <div className="glass bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-10 shadow-2xl shadow-black/20">
          <h1 className="text-2xl font-semibold text-white text-center mb-2">
            Create Your Account
          </h1>
          <p className="text-slate-400 text-center mb-8 text-sm">
            Start protecting your startup's IP today
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm">
              {message}
            </div>
          )}

          {/* Google Sign Up */}
          <button
            onClick={handleGoogleSignup}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white text-slate-900 rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-wait mb-6"
          >
            {googleLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Chrome className="w-5 h-5" />
                Continue with Google
              </>
            )}
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700/50"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-slate-900/60 text-slate-500">or</span>
            </div>
          </div>

          <form onSubmit={handleSignup}>
            <div className="mb-5">
              <label className="block text-xs font-medium text-violet-400 uppercase tracking-widest mb-3">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  className="w-full pl-12 pr-4 py-3 text-white bg-slate-800/50 border border-slate-700/50 rounded-lg outline-none transition-all placeholder:text-slate-500 focus:border-violet-500/50 focus:bg-slate-800/80 focus:ring-2 focus:ring-violet-500/20"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-medium text-violet-400 uppercase tracking-widest mb-3">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  required
                  minLength={8}
                  className="w-full pl-12 pr-12 py-3 text-white bg-slate-800/50 border border-slate-700/50 rounded-lg outline-none transition-all placeholder:text-slate-500 focus:border-violet-500/50 focus:bg-slate-800/80 focus:ring-2 focus:ring-violet-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="mt-2 text-xs text-slate-500">Minimum 8 characters</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 text-sm font-semibold uppercase tracking-widest text-white bg-gradient-to-r from-violet-600 to-purple-600 rounded-lg transition-all hover:from-violet-500 hover:to-purple-500 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-500/25 disabled:opacity-50 disabled:cursor-wait disabled:hover:translate-y-0 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link href="/login" className="text-violet-400 hover:text-violet-300 transition-colors">
              Sign in
            </Link>
          </p>
        </div>

        {/* Plan comparison link */}
        {!isPro && (
          <p className="mt-6 text-center text-sm text-slate-500">
            Need dedicated infrastructure?{' '}
            <Link href="/signup?plan=pro" className="text-violet-400 hover:text-violet-300 transition-colors">
              Start with Pro →
            </Link>
          </p>
        )}

        {/* Terms */}
        <p className="mt-6 text-center text-xs text-slate-600">
          By creating an account, you agree to our{' '}
          <a href="/terms" className="text-slate-500 hover:text-slate-400">Terms of Service</a>{' '}
          and{' '}
          <a href="/privacy" className="text-slate-500 hover:text-slate-400">Privacy Policy</a>
        </p>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    }>
      <SignupForm />
    </Suspense>
  )
}
