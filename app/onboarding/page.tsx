'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { 
  Shield, Sparkles, ArrowRight, Building2, Package, Loader2,
  CheckCircle2, Globe, AtSign, FileText, Zap, Search
} from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  isLoading?: boolean
}

export default function ProactiveOnboarding() {
  const [step, setStep] = useState<'welcome' | 'company' | 'product' | 'working' | 'results'>('welcome')
  const [companyName, setCompanyName] = useState('')
  const [productName, setProductName] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isAgentWorking, setIsAgentWorking] = useState(false)
  const [results, setResults] = useState<{
    domains?: any
    socials?: any
    trademarks?: any
  }>({})
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Add assistant message with typing effect
  const addAssistantMessage = (content: string, delay = 500) => {
    return new Promise<void>((resolve) => {
      // Add loading message
      const loadingId = Date.now().toString()
      setMessages(prev => [...prev, { id: loadingId, role: 'assistant', content: '', isLoading: true }])
      
      setTimeout(() => {
        setMessages(prev => prev.map(m => 
          m.id === loadingId ? { ...m, content, isLoading: false } : m
        ))
        resolve()
      }, delay)
    })
  }

  // Start the onboarding
  const startOnboarding = async () => {
    setStep('company')
    await addAssistantMessage(
      "🚀 Awesome! Let's protect your startup's IP!\n\nFirst, what's your **company name**? I'll immediately check trademark availability, domains, and social handles for you!"
    )
  }

  // Handle company name submission
  const handleCompanySubmit = async () => {
    if (!companyName.trim()) return
    
    setMessages(prev => [...prev, { 
      id: Date.now().toString(), 
      role: 'user', 
      content: companyName 
    }])
    
    setStep('product')
    await addAssistantMessage(
      `Great name! 💪 And what's your **product or app** called? (Or just say "same" if it's the same as your company name)`
    )
  }

  // Handle product name and trigger agent
  const handleProductSubmit = async () => {
    if (!productName.trim()) return
    
    const actualProductName = productName.toLowerCase() === 'same' ? companyName : productName
    
    setMessages(prev => [...prev, { 
      id: Date.now().toString(), 
      role: 'user', 
      content: productName 
    }])
    
    // Save to profile
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('profiles').upsert({
        id: user.id,
        company_name: companyName,
        product_name: actualProductName,
        updated_at: new Date().toISOString()
      })
    }

    setStep('working')
    setIsAgentWorking(true)
    
    await addAssistantMessage(
      "Perfect! 🎯 Give me a moment - I'm going to check EVERYTHING for you right now:\n\n" +
      "🔍 Searching trademarks...\n" +
      "🌐 Checking domain availability...\n" +
      "📱 Scanning social media handles...\n\n" +
      "I'll be back in a few seconds with a complete report!"
    )

    // Trigger the proactive agent
    try {
      const response = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `My company is called "${companyName}" and my product is called "${actualProductName}". 
          
Please immediately:
1. Search for trademark conflicts for both names
2. Check domain availability for both names (.com, .io, .co, .app, .ai, etc.)
3. Check social media handle availability (@${companyName.toLowerCase().replace(/\s+/g, '')})

Do all of this NOW and give me a complete report. Don't ask questions - just do the research!`,
          context: 'onboarding'
        })
      })

      const data = await response.json()
      
      if (data.response) {
        await addAssistantMessage(data.response, 1000)
        
        // Add next steps
        await addAssistantMessage(
          "## What's Next?\n\n" +
          "I've saved all this to your dashboard. Here's what I recommend:\n\n" +
          "1. **Secure available domains NOW** - they can be taken any moment\n" +
          "2. **Create social accounts** on available platforms\n" +
          "3. **Let me generate your IP protection documents**\n\n" +
          "Ready to continue to your dashboard? I've got lots more to help you with! 🚀",
          800
        )
        
        setStep('results')
      }
    } catch (err) {
      console.error('Agent error:', err)
      await addAssistantMessage(
        "Hmm, I hit a snag with some of my searches. No worries though - let's head to your dashboard and I'll finish checking there!",
        500
      )
      setStep('results')
    }
    
    setIsAgentWorking(false)
  }

  const goToDashboard = () => {
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-slate-950/80 backdrop-blur-lg border-b border-white/10 z-50">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-semibold">LaunchReady</h1>
            <p className="text-sm text-slate-400">IP Protection Setup</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-24 pb-32">
        {/* Welcome Screen */}
        {step === 'welcome' && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-8">
              <Sparkles className="w-10 h-10" />
            </div>
            <h1 className="text-4xl font-bold mb-4">
              Let's Protect Your Startup! 🚀
            </h1>
            <p className="text-xl text-slate-400 mb-8 max-w-lg mx-auto">
              I'm your IP Protection Agent. Tell me about your company and I'll <strong>immediately</strong> check trademarks, domains, and social handles for you.
            </p>
            <button
              onClick={startOnboarding}
              className="px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-xl font-semibold text-lg transition-all flex items-center gap-2 mx-auto"
            >
              Let's Go!
              <ArrowRight className="w-5 h-5" />
            </button>
            
            <div className="mt-12 grid grid-cols-3 gap-4 text-sm text-slate-400">
              <div className="p-4 bg-white/5 rounded-xl">
                <Search className="w-6 h-6 text-violet-400 mx-auto mb-2" />
                <p>I'll search trademarks</p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl">
                <Globe className="w-6 h-6 text-violet-400 mx-auto mb-2" />
                <p>Check all domains</p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl">
                <AtSign className="w-6 h-6 text-violet-400 mx-auto mb-2" />
                <p>Scan social handles</p>
              </div>
            </div>
          </div>
        )}

        {/* Chat Interface */}
        {step !== 'welcome' && (
          <div className="space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] ${message.role === 'user' ? '' : 'flex gap-3'}`}>
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 bg-violet-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-violet-400" />
                    </div>
                  )}
                  <div className={`rounded-2xl px-5 py-4 ${
                    message.role === 'user' 
                      ? 'bg-violet-600' 
                      : 'bg-slate-800/80 border border-slate-700/50'
                  }`}>
                    {message.isLoading ? (
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    ) : (
                      <div className="text-sm whitespace-pre-wrap leading-relaxed prose prose-invert prose-sm max-w-none">
                        {message.content.split('**').map((part, i) => 
                          i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      {(step === 'company' || step === 'product') && (
        <div className="fixed bottom-0 left-0 right-0 bg-slate-950/95 backdrop-blur-lg border-t border-white/10 p-4">
          <div className="max-w-3xl mx-auto">
            <form 
              onSubmit={(e) => {
                e.preventDefault()
                if (step === 'company') handleCompanySubmit()
                else handleProductSubmit()
              }}
              className="flex gap-3"
            >
              <div className="flex-1 relative">
                {step === 'company' ? (
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                ) : (
                  <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                )}
                <input
                  type="text"
                  value={step === 'company' ? companyName : productName}
                  onChange={(e) => step === 'company' ? setCompanyName(e.target.value) : setProductName(e.target.value)}
                  placeholder={step === 'company' ? 'Enter your company name...' : 'Enter your product name...'}
                  className="w-full pl-12 pr-4 py-4 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={step === 'company' ? !companyName.trim() : !productName.trim()}
                className="px-6 py-4 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-medium transition-colors flex items-center gap-2"
              >
                {step === 'company' ? 'Next' : 'Check Everything!'}
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Working Indicator */}
      {step === 'working' && isAgentWorking && (
        <div className="fixed bottom-0 left-0 right-0 bg-slate-950/95 backdrop-blur-lg border-t border-white/10 p-6">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-4 text-violet-400">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="font-medium">Agent is researching... This usually takes 10-15 seconds</span>
            </div>
          </div>
        </div>
      )}

      {/* Results CTA */}
      {step === 'results' && (
        <div className="fixed bottom-0 left-0 right-0 bg-slate-950/95 backdrop-blur-lg border-t border-white/10 p-4">
          <div className="max-w-3xl mx-auto">
            <button
              onClick={goToDashboard}
              className="w-full py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2"
            >
              Continue to Dashboard
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
