'use client'

import { useState, useEffect, useRef } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { 
  Shield, Sparkles, Loader2, CheckCircle2, ArrowRight,
  Globe, Twitter, FileText, AlertTriangle, Zap, Rocket
} from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  isAction?: boolean
  actionResults?: ActionResult[]
}

interface ActionResult {
  type: 'domain' | 'social' | 'trademark' | 'document'
  status: 'checking' | 'done'
  summary?: string
  details?: any
}

export default function ProactiveOnboarding() {
  const [step, setStep] = useState<'intro' | 'company' | 'working' | 'results'>('intro')
  const [companyName, setCompanyName] = useState('')
  const [productName, setProductName] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isWorking, setIsWorking] = useState(false)
  const [results, setResults] = useState<{
    domains: any
    social: any
    trademark: any
  } | null>(null)
  
  const supabase = createClientComponentClient()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Start with eager greeting
    setMessages([{
      id: '1',
      role: 'assistant',
      content: `👋 Hey! I'm your IP Protection Assistant, and I'm **super excited** to help you secure your startup's intellectual property!

Here's the deal: I'm not just going to give you a checklist and wish you luck. I'm going to **actually do the work** for you.

Give me your company name and I'll immediately:
🔍 Search trademark databases for conflicts
🌐 Check domain availability across 8+ TLDs
📱 Scan social media for handle availability
📋 Start building your IP protection profile

**What's your company or product name?**`
    }])
  }, [])

  const handleSubmitName = async () => {
    if (!companyName.trim()) return
    
    setIsWorking(true)
    setStep('working')

    // Add user message
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'user',
      content: companyName
    }])

    // Add working message
    setMessages(prev => [...prev, {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: `Perfect! **${companyName}** - great name! 🚀

Let me get to work. I'm running multiple checks simultaneously...`,
      isAction: true,
      actionResults: [
        { type: 'trademark', status: 'checking' },
        { type: 'domain', status: 'checking' },
        { type: 'social', status: 'checking' },
      ]
    }])

    // Actually do the work via API
    try {
      const response = await fetch('/api/ai/onboarding-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          companyName: companyName.trim(),
          productName: productName.trim() || companyName.trim()
        })
      })

      const data = await response.json()
      setResults(data.results)

      // Update with results
      setMessages(prev => {
        const newMessages = [...prev]
        // Remove the "working" message
        newMessages.pop()
        return [...newMessages, {
          id: Date.now().toString(),
          role: 'assistant',
          content: data.response
        }]
      })

      setStep('results')
    } catch (error) {
      console.error('Onboarding scan error:', error)
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Hmm, I hit a snag with some of the automated checks. But no worries - I can still help you manually! Let me show you what to check...`
      }])
    } finally {
      setIsWorking(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl mb-4">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold mb-2">IP Protection Scan</h1>
          <p className="text-slate-400">Let's secure your startup in the next 5 minutes</p>
        </div>

        {/* Chat Interface */}
        <div className="bg-slate-900/50 border border-white/10 rounded-2xl overflow-hidden">
          {/* Messages */}
          <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] ${message.role === 'user' ? '' : ''}`}>
                  {message.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-violet-500/20 rounded-lg flex items-center justify-center">
                        <Sparkles className="w-3 h-3 text-violet-400" />
                      </div>
                      <span className="text-xs text-violet-400 font-medium">IP Assistant</span>
                    </div>
                  )}
                  
                  <div className={`rounded-2xl px-5 py-4 ${
                    message.role === 'user' 
                      ? 'bg-violet-600 text-white' 
                      : 'bg-slate-800/80 text-slate-100'
                  }`}>
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content.split('**').map((part, i) => 
                        i % 2 === 1 ? <strong key={i} className="text-white">{part}</strong> : part
                      )}
                    </div>

                    {/* Action Results */}
                    {message.actionResults && (
                      <div className="mt-4 space-y-3">
                        {message.actionResults.map((result, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-xl">
                            {result.status === 'checking' ? (
                              <Loader2 className="w-5 h-5 text-violet-400 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                            )}
                            <span className="text-sm">
                              {result.type === 'trademark' && 'Searching trademark databases...'}
                              {result.type === 'domain' && 'Checking domain availability...'}
                              {result.type === 'social' && 'Scanning social media handles...'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isWorking && (
              <div className="flex justify-start">
                <div className="bg-slate-800/80 rounded-2xl px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" />
                      <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                    <span className="text-sm text-slate-400">Running scans...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          {step === 'intro' && (
            <div className="p-4 border-t border-white/10">
              <div className="flex gap-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmitName()}
                  placeholder="Enter your company or product name..."
                  className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
                  autoFocus
                />
                <button
                  onClick={handleSubmitName}
                  disabled={!companyName.trim() || isWorking}
                  className="px-6 py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-medium transition-colors flex items-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  Scan
                </button>
              </div>
              <p className="mt-2 text-xs text-slate-500 text-center">
                I'll check trademarks, domains, and social handles instantly
              </p>
            </div>
          )}

          {/* Results Actions */}
          {step === 'results' && results && (
            <div className="p-4 border-t border-white/10">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => window.location.href = '/checklist'}
                  className="flex-1 px-6 py-3 bg-violet-600 hover:bg-violet-500 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Rocket className="w-4 h-4" />
                  Continue to Full Checklist
                </button>
                <button
                  onClick={() => {
                    setStep('intro')
                    setCompanyName('')
                    setResults(null)
                    setMessages([messages[0]])
                  }}
                  className="px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-medium transition-colors"
                >
                  Scan Another Name
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        {step === 'results' && results && (
          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="bg-slate-900/50 border border-white/10 rounded-xl p-4 text-center">
              <Globe className="w-6 h-6 text-violet-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">
                {results.domains?.available?.length || 0}
              </p>
              <p className="text-xs text-slate-400">Domains Available</p>
            </div>
            <div className="bg-slate-900/50 border border-white/10 rounded-xl p-4 text-center">
              <Twitter className="w-6 h-6 text-violet-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">
                {results.social?.filter((s: any) => s.available)?.length || 0}
              </p>
              <p className="text-xs text-slate-400">Handles Available</p>
            </div>
            <div className="bg-slate-900/50 border border-white/10 rounded-xl p-4 text-center">
              <Shield className="w-6 h-6 text-violet-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">
                {results.trademark?.riskLevel === 'low' ? '✓' : '⚠️'}
              </p>
              <p className="text-xs text-slate-400">Trademark Status</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
