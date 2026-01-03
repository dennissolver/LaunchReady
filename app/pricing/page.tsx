'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Shield, Check, X, ArrowRight, Sparkles,
  Server, Database, Lock, Users, Building2
} from 'lucide-react'

interface PlanFeature {
  text: string
  included: boolean
  note?: string
  highlight?: boolean
}

interface Plan {
  name: string
  price: string
  priceDetail: string
  description: string
  infrastructure: string
  cta: string
  ctaLink: string
  popular: boolean
  priceId?: string
  features: PlanFeature[]
}

const plans: Plan[] = [
  {
    name: 'Founder',
    price: 'Free',
    priceDetail: 'Forever',
    description: 'Perfect for solo founders and early-stage startups',
    infrastructure: 'Multi-tenant shared infrastructure',
    cta: 'Get Started Free',
    ctaLink: '/signup',
    popular: false,
    features: [
      { text: 'AI-powered IP discovery', included: true },
      { text: 'Voice-guided onboarding', included: true },
      { text: 'IP protection checklist', included: true },
      { text: 'Evidence capture from GitHub', included: true },
      { text: 'Trademark monitoring', included: true },
      { text: 'Patent deadline tracking', included: true },
      { text: 'Shared Supabase database', included: true, note: 'Enterprise-grade security' },
      { text: 'Shared Vercel hosting', included: true, note: 'Enterprise-grade security' },
      { text: 'Dedicated infrastructure', included: false },
      { text: 'Data isolation guarantee', included: false },
      { text: 'Custom domain', included: false },
      { text: 'Priority support', included: false },
    ],
  },
  {
    name: 'Pro',
    price: '$30',
    priceDetail: 'per month',
    description: 'For founders who need complete data isolation and dedicated resources',
    infrastructure: 'Dedicated segregated infrastructure',
    cta: 'Upgrade to Pro',
    ctaLink: '/signup?plan=pro',
    popular: true,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
    features: [
      { text: 'AI-powered IP discovery', included: true },
      { text: 'Voice-guided onboarding', included: true },
      { text: 'IP protection checklist', included: true },
      { text: 'Evidence capture from GitHub', included: true },
      { text: 'Trademark monitoring', included: true },
      { text: 'Patent deadline tracking', included: true },
      { text: 'Your own Supabase instance', included: true, highlight: true },
      { text: 'Your own Vercel deployment', included: true, highlight: true },
      { text: 'Complete data isolation', included: true, highlight: true },
      { text: 'Data isolation guarantee', included: true },
      { text: 'Custom domain support', included: true },
      { text: 'Priority support', included: true },
    ],
  },
]

const infrastructureComparison = [
  {
    aspect: 'Database',
    free: 'Shared Supabase (row-level security)',
    pro: 'Dedicated Supabase instance',
  },
  {
    aspect: 'Hosting',
    free: 'Shared Vercel deployment',
    pro: 'Dedicated Vercel project',
  },
  {
    aspect: 'Data Isolation',
    free: 'Logical isolation (RLS)',
    pro: 'Physical isolation',
  },
  {
    aspect: 'Compliance',
    free: 'SOC 2 (shared)',
    pro: 'SOC 2 + dedicated audit trail',
  },
  {
    aspect: 'Backups',
    free: 'Shared backup schedule',
    pro: 'Dedicated backup policy',
  },
]

export default function PricingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const handleSubscribe = async (priceId: string) => {
    setLoading(priceId)
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      })

      const data = await response.json()

      if (data.error) {
        if (response.status === 401) {
          router.push('/signup?plan=pro')
          return
        }
        throw new Error(data.error)
      }

      window.location.href = data.url
    } catch (error) {
      console.error('Subscription error:', error)
      alert('Failed to start subscription. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">LaunchReady</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sm text-gray-300 hover:text-white">
                Log In
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg text-sm font-medium"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            Simple, Transparent <span className="text-gradient">Pricing</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Start free with enterprise-grade security. Upgrade for dedicated infrastructure
            and complete data isolation.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-8 ${
                  plan.popular 
                    ? 'bg-gradient-to-b from-violet-500/20 to-indigo-500/10 border-2 border-violet-500/50' 
                    : 'bg-white/5 border border-white/10'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-gray-400">{plan.priceDetail}</span>
                  </div>
                  <p className="text-gray-400 text-sm">{plan.description}</p>
                </div>

                {/* Infrastructure badge */}
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm mb-6 ${
                  plan.popular 
                    ? 'bg-violet-500/20 text-violet-300' 
                    : 'bg-white/10 text-gray-300'
                }`}>
                  {plan.popular ? <Server className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                  {plan.infrastructure}
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                          feature.highlight ? 'text-emerald-400' : 'text-emerald-500'
                        }`} />
                      ) : (
                        <X className="w-5 h-5 mt-0.5 flex-shrink-0 text-gray-600" />
                      )}
                      <span className={`${
                        feature.included 
                          ? feature.highlight ? 'text-white font-medium' : 'text-gray-300' 
                          : 'text-gray-600'
                      }`}>
                        {feature.text}
                        {feature.note && (
                          <span className="text-xs text-gray-500 block">{feature.note}</span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {plan.priceId ? (
                  <button
                    onClick={() => handleSubscribe(plan.priceId!)}
                    disabled={loading === plan.priceId}
                    className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white' 
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    {loading === plan.priceId ? (
                      'Loading...'
                    ) : (
                      <>
                        {plan.cta}
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                ) : (
                  <Link
                    href={plan.ctaLink}
                    className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white' 
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    {plan.cta}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Infrastructure Comparison */}
      <section className="py-24 bg-slate-900/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Infrastructure <span className="text-gradient">Comparison</span>
            </h2>
            <p className="text-gray-400">
              Understand the difference between shared and dedicated infrastructure
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-3 gap-4 p-4 bg-white/5 border-b border-white/10 font-semibold">
              <div>Aspect</div>
              <div className="text-center">Founder (Free)</div>
              <div className="text-center text-violet-400">Pro ($30/mo)</div>
            </div>
            {infrastructureComparison.map((row, i) => (
              <div
                key={i}
                className={`grid grid-cols-3 gap-4 p-4 ${
                  i < infrastructureComparison.length - 1 ? 'border-b border-white/5' : ''
                }`}
              >
                <div className="font-medium text-gray-300">{row.aspect}</div>
                <div className="text-center text-gray-400 text-sm">{row.free}</div>
                <div className="text-center text-emerald-400 text-sm">{row.pro}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Enterprise-Grade Security <span className="text-gradient">On Both Plans</span>
            </h2>
            <p className="text-gray-400">
              Your IP data is protected with the same security standards used by Fortune 500 companies
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
              <Lock className="w-10 h-10 text-violet-400 mb-4" />
              <h3 className="font-semibold mb-2">Encryption</h3>
              <p className="text-sm text-gray-400">AES-256 encryption at rest, TLS 1.3 in transit</p>
            </div>
            <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
              <Database className="w-10 h-10 text-violet-400 mb-4" />
              <h3 className="font-semibold mb-2">Row-Level Security</h3>
              <p className="text-sm text-gray-400">Supabase RLS ensures data isolation even on shared plans</p>
            </div>
            <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
              <Building2 className="w-10 h-10 text-violet-400 mb-4" />
              <h3 className="font-semibold mb-2">SOC 2 Compliant</h3>
              <p className="text-sm text-gray-400">Infrastructure certified for enterprise security standards</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-slate-900/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            Frequently Asked <span className="text-gradient">Questions</span>
          </h2>

          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="font-semibold mb-2">Is the Free plan really free forever?</h3>
              <p className="text-gray-400 text-sm">Yes. The Founder plan is free forever with no credit card required. We believe every founder deserves IP protection.</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="font-semibold mb-2">What's the difference between shared and dedicated infrastructure?</h3>
              <p className="text-gray-400 text-sm">On the Free plan, your data is stored in our shared database with row-level security ensuring strict isolation. On Pro, you get your own dedicated Supabase instance and Vercel deployment — complete physical separation.</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="font-semibold mb-2">Is the shared database secure?</h3>
              <p className="text-gray-400 text-sm">Absolutely. We use Supabase's row-level security (RLS) which is the same technology used by banks and healthcare companies. Your data is cryptographically isolated — other users cannot access it even if they tried.</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="font-semibold mb-2">Can I upgrade later?</h3>
              <p className="text-gray-400 text-sm">Yes, you can upgrade to Pro at any time. We'll migrate your data to your dedicated infrastructure seamlessly.</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="font-semibold mb-2">Can I cancel my Pro subscription?</h3>
              <p className="text-gray-400 text-sm">Yes, cancel anytime. You'll continue to have Pro access until the end of your billing period, then you'll be moved back to the Free plan.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold">LaunchReady</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
            </div>
            <p className="text-sm text-gray-500">
              © 2026 LaunchReady. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}