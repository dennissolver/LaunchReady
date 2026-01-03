'use client'

import Link from 'next/link'
import { 
  Shield, AlertTriangle, Clock, CheckCircle2, ArrowRight, 
  Zap, Lock, FileCheck, Mic, Github, Globe, Database,
  ChevronDown, X, Sparkles, TrendingUp, Play
} from 'lucide-react'

// Horror stories / stats
const horrorStats = [
  { stat: '72%', label: 'of startups have IP that could be protected but isn\'t' },
  { stat: '$2.5M', label: 'average cost of trademark litigation' },
  { stat: '12 months', label: 'patent window after public disclosure (then it\'s gone forever)' },
  { stat: '43%', label: 'of founders don\'t know they need IP assignments from contractors' },
]

const dangerCards = [
  {
    icon: AlertTriangle,
    title: 'Someone registers YOUR brand name',
    description: 'While you\'re busy building, someone else trademarks your product name. Now you face a rebrand or a lawsuit.',
    color: 'red',
  },
  {
    icon: Clock,
    title: 'Patent window silently closes',
    description: 'You deployed to production 13 months ago. Your innovative algorithm? Now unpatentable. Forever.',
    color: 'amber',
  },
  {
    icon: X,
    title: 'Contractor owns your code',
    description: 'That freelancer who built your MVP? Without an IP assignment, they legally own everything they wrote.',
    color: 'red',
  },
  {
    icon: TrendingUp,
    title: 'Due diligence nightmare',
    description: 'Investors ask for your IP portfolio. You have... a domain receipt and a Figma file?',
    color: 'amber',
  },
]

const features = [
  {
    icon: Mic,
    title: 'Voice-Guided Discovery',
    description: 'Our AI assistant interviews you about your project, understands what you\'ve built, and identifies every protection you need.',
  },
  {
    icon: Github,
    title: 'Automatic Evidence Capture',
    description: 'Connect GitHub, Vercel, Supabase and more. We automatically build a timestamped evidence trail from day one.',
  },
  {
    icon: Shield,
    title: 'IP Protection Checklist',
    description: 'See exactly what\'s protected (green), what\'s pending (yellow), and what\'s at risk (red). Never miss a deadline.',
  },
  {
    icon: FileCheck,
    title: 'Lawyer-Ready Packages',
    description: 'When you need to file, we prepare complete documentation. Your lawyer gets everything, you save thousands.',
  },
  {
    icon: Globe,
    title: 'Domain & Brand Launch',
    description: 'Register domains, generate logos, check social handles. Launch your brand from one platform.',
  },
  {
    icon: Database,
    title: 'Investor Data Room',
    description: 'One-click creation of secure, trackable data rooms for due diligence. Show investors you\'re serious.',
  },
]

const testimonialPlaceholders = [
  {
    quote: "I had no idea my first public deployment started a 12-month patent countdown. LaunchReady caught it with 47 days to spare.",
    author: "Sarah Chen",
    role: "Founder, TechFlow",
  },
  {
    quote: "We discovered 3 contractors had never signed IP assignments. Could have killed our Series A.",
    author: "Marcus Johnson", 
    role: "CTO, DataSync",
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">LaunchReady</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#problem" className="text-sm text-gray-400 hover:text-white transition-colors">The Problem</a>
              <a href="#solution" className="text-sm text-gray-400 hover:text-white transition-colors">Solution</a>
              <a href="#features" className="text-sm text-gray-400 hover:text-white transition-colors">Features</a>
              <Link 
                href="/login"
                className="text-sm text-gray-300 hover:text-white transition-colors"
              >
                Log In
              </Link>
              <Link 
                href="/signup"
                className="px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg text-sm font-medium transition-colors"
              >
                Get Started Free
              </Link>
            </div>
            {/* Mobile menu */}
            <div className="md:hidden flex items-center gap-3">
              <Link 
                href="/login"
                className="text-sm text-gray-300"
              >
                Log In
              </Link>
              <Link 
                href="/signup"
                className="px-3 py-1.5 bg-violet-600 rounded-lg text-sm font-medium"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 hero-gradient opacity-50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/20 via-transparent to-transparent" />
        
        {/* Animated grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f12_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f12_1px,transparent_1px)] bg-[size:64px_64px]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-300 text-sm mb-8">
              <Sparkles className="w-4 h-4" />
              <span>100% Free for Founders</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              Protect Your Ideas{' '}
              <span className="text-gradient">Before Someone Else Does</span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
              Most founders don't realise their IP is at risk until it's too late. 
              LaunchReady uses AI to discover what you've built, capture evidence automatically, 
              and ensure every protection is in place.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-lg"
              >
                Start Protecting Your IP
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#solution"
                className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5" />
                See How It Works
              </a>
            </div>

            {/* Trust indicators */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                <span>Bank-level encryption</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>SOC 2 compliant</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-6 h-6 text-gray-500" />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-slate-900/50 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {horrorStats.map((item, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl font-bold text-gradient mb-2">{item.stat}</div>
                <div className="text-sm text-gray-400">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section id="problem" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              The IP Nightmares <span className="text-red-400">No One Warned You About</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Every week, founders discover they've made critical mistakes that could cost them their company.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {dangerCards.map((card, i) => (
              <div 
                key={i} 
                className={`p-6 rounded-2xl border card-hover ${
                  card.color === 'red' 
                    ? 'bg-red-500/5 border-red-500/20' 
                    : 'bg-amber-500/5 border-amber-500/20'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                  card.color === 'red' ? 'bg-red-500/20' : 'bg-amber-500/20'
                }`}>
                  <card.icon className={`w-6 h-6 ${
                    card.color === 'red' ? 'text-red-400' : 'text-amber-400'
                  }`} />
                </div>
                <h3 className="text-xl font-semibold mb-2">{card.title}</h3>
                <p className="text-gray-400">{card.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-2xl font-semibold text-gray-300 mb-4">
              The worst part? <span className="text-white">These are all preventable.</span>
            </p>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section id="solution" className="py-24 bg-gradient-to-b from-slate-900/50 to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-300 text-sm mb-6">
              <Zap className="w-4 h-4" />
              <span>Introducing LaunchReady</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Your AI-Powered <span className="text-gradient">IP Protection System</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Think of it as Stripe Atlas for intellectual property. We guide you through protecting your ideas, 
              automate evidence capture, and prepare everything your lawyers need.
            </p>
          </div>

          {/* How it works */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <div className="w-16 h-16 bg-violet-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-violet-400">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Talk to Our AI</h3>
              <p className="text-gray-400">Our voice agent asks about your project, what you've built, and what platforms you use. It takes 5 minutes.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-violet-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-violet-400">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">We Capture Everything</h3>
              <p className="text-gray-400">Connect your dev tools. We automatically pull timestamps, commits, deployments — building your evidence vault.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-violet-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-violet-400">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">See Your IP Status</h3>
              <p className="text-gray-400">Your protection checklist shows green for protected, red for at risk. Take action with one click.</p>
            </div>
          </div>

          {/* CTA in solution */}
          <div className="text-center">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-xl font-semibold transition-all text-lg"
            >
              Get Started — It's Free
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything You Need to <span className="text-gradient">Launch Protected</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10 card-hover">
                <div className="w-12 h-12 bg-violet-500/20 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-violet-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Founders Who Avoided Disaster</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {testimonialPlaceholders.map((t, i) => (
              <div key={i} className="p-8 rounded-2xl bg-white/5 border border-white/10">
                <p className="text-lg text-gray-300 mb-6">"{t.quote}"</p>
                <div>
                  <p className="font-semibold">{t.author}</p>
                  <p className="text-sm text-gray-500">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Don't Let Your Hard Work <span className="text-red-400">Become Someone Else's</span>
          </h2>
          <p className="text-xl text-gray-400 mb-10">
            Join thousands of founders who are protecting their ideas with LaunchReady. It's free to get started.
          </p>

          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-xl font-semibold transition-all text-xl"
          >
            Start Protecting Your IP — Free
            <ArrowRight className="w-6 h-6" />
          </Link>

          <p className="mt-6 text-sm text-gray-500">
            No credit card required. Set up in under 5 minutes.
          </p>
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
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="mailto:hello@launchready.io" className="hover:text-white transition-colors">Contact</a>
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
