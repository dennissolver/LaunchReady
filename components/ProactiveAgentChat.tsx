'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { 
  Sparkles, Send, Loader2, X, Maximize2, Minimize2,
  Zap, CheckCircle2, AlertTriangle, Download, ExternalLink,
  FileText, Shield, Lightbulb
} from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  toolsUsed?: string[]
  documents?: { name: string; content: string }[]
}

interface ProactiveAgentChatProps {
  initialPrompt?: string
  context?: string
  onClose?: () => void
  isExpanded?: boolean
  onToggleExpand?: () => void
}

// Quick action suggestions based on context
const QUICK_ACTIONS = [
  { label: '🔍 Check my brand availability', prompt: 'Check trademark, domain, and social handle availability for my company' },
  { label: '📝 Generate NDA', prompt: 'Generate an NDA template for my company' },
  { label: '📋 IP Assignment for contractor', prompt: 'Generate an IP assignment agreement for a contractor' },
  { label: '💡 Document an invention', prompt: 'Help me create an invention disclosure for a new feature I built' },
  { label: '🔒 Create trade secret policy', prompt: 'Generate a trade secret policy for my company' },
  { label: '📊 Show my IP status', prompt: 'What is the current status of my IP protection? What should I focus on next?' },
]

export default function ProactiveAgentChat({ 
  initialPrompt, 
  context,
  onClose,
  isExpanded = true,
  onToggleExpand
}: ProactiveAgentChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showQuickActions, setShowQuickActions] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const supabase = createClientComponentClient()
  const initialPromptSent = useRef(false)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Send message to agent
  const sendMessage = useCallback(async (messageText: string) => {
    if (!messageText.trim() || isLoading) return

    setShowQuickActions(false)
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText.trim()
    }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          context,
          history: messages.slice(-10)
        })
      })

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || 'I encountered an issue. Let me try again!',
        toolsUsed: data.toolsUsed
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (err) {
      console.error('Agent error:', err)
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Oops! I hit a snag. Let me try that again - could you repeat your request?"
      }])
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, messages, context])

  // Handle initial prompt
  useEffect(() => {
    if (initialPrompt && !initialPromptSent.current) {
      initialPromptSent.current = true
      sendMessage(initialPrompt)
    }
  }, [initialPrompt, sendMessage])

  // Initial greeting with proactive offer
  useEffect(() => {
    if (messages.length === 0 && !initialPrompt) {
      setMessages([{
        id: '1',
        role: 'assistant',
        content: "Hey! 👋 I'm your IP Protection Agent - think of me as your super eager intern who LOVES doing research!\n\n" +
          "**I don't just give you links - I actually DO the work:**\n" +
          "• Tell me your company name → I'll search trademarks, domains & socials\n" +
          "• Mention a contractor → I'll draft an IP assignment agreement\n" +
          "• Describe an invention → I'll create a disclosure form\n\n" +
          "What can I help you with? Or pick a quick action below! 👇"
      }])
    }
  }, [initialPrompt])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleQuickAction = (prompt: string) => {
    sendMessage(prompt)
  }

  // Format message content with markdown-like styling
  const formatContent = (content: string) => {
    // Split by code blocks first
    const parts = content.split(/(```[\s\S]*?```)/g)
    
    return parts.map((part, i) => {
      if (part.startsWith('```')) {
        // Code block
        const code = part.replace(/```\w*\n?/g, '').replace(/```$/g, '')
        return (
          <div key={i} className="my-3 relative group">
            <pre className="bg-slate-900 border border-slate-700 rounded-lg p-4 overflow-x-auto text-xs">
              <code className="text-slate-300">{code}</code>
            </pre>
            <button 
              onClick={() => navigator.clipboard.writeText(code)}
              className="absolute top-2 right-2 p-1.5 bg-slate-700 hover:bg-slate-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <FileText className="w-3 h-3" />
            </button>
          </div>
        )
      }
      
      // Regular text - handle markdown-like formatting
      return (
        <span key={i}>
          {part.split('\n').map((line, j) => {
            // Headers
            if (line.startsWith('## ')) {
              return <h3 key={j} className="text-base font-semibold text-white mt-4 mb-2">{line.replace('## ', '')}</h3>
            }
            if (line.startsWith('### ')) {
              return <h4 key={j} className="text-sm font-semibold text-white mt-3 mb-1">{line.replace('### ', '')}</h4>
            }
            
            // Bullet points
            if (line.startsWith('- ') || line.startsWith('• ')) {
              return (
                <div key={j} className="flex gap-2 my-1">
                  <span className="text-violet-400">•</span>
                  <span>{formatInlineText(line.slice(2))}</span>
                </div>
              )
            }
            
            // Numbered lists
            const numberedMatch = line.match(/^(\d+)\. (.+)/)
            if (numberedMatch) {
              return (
                <div key={j} className="flex gap-2 my-1">
                  <span className="text-violet-400 font-medium">{numberedMatch[1]}.</span>
                  <span>{formatInlineText(numberedMatch[2])}</span>
                </div>
              )
            }
            
            // Empty lines
            if (!line.trim()) {
              return <div key={j} className="h-2" />
            }
            
            // Regular paragraph
            return <p key={j} className="my-1">{formatInlineText(line)}</p>
          })}
        </span>
      )
    })
  }

  // Handle inline formatting (bold, links, etc.)
  const formatInlineText = (text: string) => {
    // Handle bold
    const parts = text.split(/(\*\*[^*]+\*\*)/g)
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>
      }
      
      // Handle links [text](url)
      const linkMatch = part.match(/\[([^\]]+)\]\(([^)]+)\)/)
      if (linkMatch) {
        return (
          <a 
            key={i} 
            href={linkMatch[2]} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-violet-400 hover:text-violet-300 underline inline-flex items-center gap-1"
          >
            {linkMatch[1]}
            <ExternalLink className="w-3 h-3" />
          </a>
        )
      }
      
      return part
    })
  }

  return (
    <div className={`
      flex flex-col bg-slate-900/95 backdrop-blur-lg border border-white/10 rounded-2xl overflow-hidden
      ${isExpanded ? 'h-[600px]' : 'h-auto'}
    `}>
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white flex items-center gap-2">
              IP Agent
              <span className="px-2 py-0.5 text-xs bg-emerald-500/20 text-emerald-400 rounded-full">Online</span>
            </h3>
            <p className="text-xs text-slate-400">Your proactive IP protection assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onToggleExpand && (
            <button
              onClick={onToggleExpand}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              {isExpanded ? <Minimize2 className="w-4 h-4 text-slate-400" /> : <Maximize2 className="w-4 h-4 text-slate-400" />}
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[90%] ${message.role === 'user' ? '' : 'flex gap-3'}`}>
              {message.role === 'assistant' && (
                <div className="w-8 h-8 bg-violet-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <Sparkles className="w-4 h-4 text-violet-400" />
                </div>
              )}
              <div>
                <div className={`rounded-2xl px-4 py-3 ${
                  message.role === 'user' 
                    ? 'bg-violet-600 text-white' 
                    : 'bg-slate-800 border border-slate-700/50 text-slate-100'
                }`}>
                  <div className="text-sm leading-relaxed">
                    {formatContent(message.content)}
                  </div>
                </div>
                
                {/* Show tools used */}
                {message.toolsUsed && message.toolsUsed.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2 ml-1">
                    {message.toolsUsed.map((tool, i) => (
                      <span 
                        key={i}
                        className="px-2 py-0.5 text-xs bg-violet-500/10 text-violet-400 rounded-full flex items-center gap-1"
                      >
                        <Zap className="w-3 h-3" />
                        {tool.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-violet-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-violet-400" />
              </div>
              <div className="bg-slate-800 border border-slate-700/50 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Working on it...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      {showQuickActions && messages.length <= 1 && (
        <div className="px-4 pb-2">
          <div className="flex flex-wrap gap-2">
            {QUICK_ACTIONS.slice(0, 4).map((action, i) => (
              <button
                key={i}
                onClick={() => handleQuickAction(action.prompt)}
                className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-violet-500/50 rounded-full transition-all"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-white/10 bg-slate-800/30">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything or tell me about your startup..."
            rows={1}
            className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-500 resize-none focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
