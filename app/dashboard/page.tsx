'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'
import { 
  Shield, Sparkles, CheckCircle2, AlertTriangle, Clock, ArrowRight,
  Globe, AtSign, FileText, Users, Lock, Lightbulb, ExternalLink,
  Building2, Zap, TrendingUp, AlertCircle, ChevronRight, Download
} from 'lucide-react'
import ProactiveAgentChat from '@/components/ProactiveAgentChat'

interface ChecklistProgress {
  item_id: string
  status: string
  completed_at?: string
}

interface ActionLog {
  id: string
  item_id: string
  action_type: string
  action_label: string
  result_data?: any
  created_at: string
}

export default function SmartDashboard() {
  const [profile, setProfile] = useState<any>(null)
  const [progress, setProgress] = useState<ChecklistProgress[]>([])
  const [recentActions, setRecentActions] = useState<ActionLog[]>([])
  const [showChat, setShowChat] = useState(false)
  const [chatPrompt, setChatPrompt] = useState<string | undefined>()
  const [loading, setLoading] = useState(true)
  
  const supabase = createClientComponentClient()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Load profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      setProfile(profileData)

      // Load checklist progress
      const { data: progressData } = await supabase
        .from('ip_checklist_progress')
        .select('*')
        .eq('user_id', user.id)
      setProgress(progressData || [])

      // Load recent actions
      const { data: actionsData } = await supabase
        .from('ip_action_log')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)
      setRecentActions(actionsData || [])

    } catch (err) {
      console.error('Error loading dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  const openAgentWithPrompt = (prompt: string) => {
    setChatPrompt(prompt)
    setShowChat(true)
  }

  // Calculate stats
  const totalItems = 18 // Total checklist items
  const completedItems = progress.filter(p => p.status === 'done').length
  const inProgressItems = progress.filter(p => p.status === 'in-progress').length
  const criticalMissing = ['company-name-tm', 'contractor-ip', 'cofounder-ip'].filter(
    id => !progress.find(p => p.item_id === id && p.status === 'done')
  )

  // Determine what to suggest next
  const getNextAction = () => {
    if (!profile?.company_name) {
      return {
        title: "Let's get started!",
        description: "Tell me about your company and I'll check trademarks, domains, and social handles",
        prompt: "I want to check if my company name is available for trademark, domain, and social handles",
        priority: 'high'
      }
    }
    
    if (criticalMissing.includes('contractor-ip')) {
      return {
        title: "Critical: Contractor IP Assignments",
        description: "Without signed IP assignments, contractors may own the code they wrote for you",
        prompt: "Help me create IP assignment agreements for my contractors",
        priority: 'critical'
      }
    }
    
    if (criticalMissing.includes('company-name-tm')) {
      return {
        title: "Protect your company name",
        description: "Your company name should be trademarked to prevent others from using it",
        prompt: `Search for trademark availability for "${profile?.company_name}" and help me start the registration process`,
        priority: 'high'
      }
    }
    
    return {
      title: "Continue your IP protection",
      description: `You've completed ${completedItems} of ${totalItems} items. Let's keep going!`,
      prompt: "What should I work on next for my IP protection?",
      priority: 'medium'
    }
  }

  const nextAction = getNextAction()

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-900/50 backdrop-blur-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-semibold">
                  {profile?.company_name ? `${profile.company_name} IP Dashboard` : 'LaunchReady'}
                </h1>
                <p className="text-sm text-slate-400">Your IP protection status</p>
              </div>
            </div>
            
            <button
              onClick={() => setShowChat(!showChat)}
              className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-xl font-medium transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Ask Agent
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Priority Action Card */}
            <div className={`rounded-2xl p-6 border ${
              nextAction.priority === 'critical' 
                ? 'bg-red-500/10 border-red-500/30' 
                : nextAction.priority === 'high'
                  ? 'bg-amber-500/10 border-amber-500/30'
                  : 'bg-violet-500/10 border-violet-500/30'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {nextAction.priority === 'critical' && (
                      <span className="px-2 py-0.5 text-xs bg-red-500 text-white rounded-full font-medium">CRITICAL</span>
                    )}
                    {nextAction.priority === 'high' && (
                      <span className="px-2 py-0.5 text-xs bg-amber-500 text-white rounded-full font-medium">IMPORTANT</span>
                    )}
                    <Zap className={`w-4 h-4 ${
                      nextAction.priority === 'critical' ? 'text-red-400' : 
                      nextAction.priority === 'high' ? 'text-amber-400' : 'text-violet-400'
                    }`} />
                    <span className="text-sm text-slate-400">Suggested Next Step</span>
                  </div>
                  <h2 className="text-xl font-semibold mb-2">{nextAction.title}</h2>
                  <p className="text-slate-400 mb-4">{nextAction.description}</p>
                  <button
                    onClick={() => openAgentWithPrompt(nextAction.prompt)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
                      nextAction.priority === 'critical'
                        ? 'bg-red-600 hover:bg-red-500 text-white'
                        : nextAction.priority === 'high'
                          ? 'bg-amber-600 hover:bg-amber-500 text-white'
                          : 'bg-violet-600 hover:bg-violet-500 text-white'
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                    Let's Do This
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Progress Overview */}
            <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-violet-400" />
                Protection Progress
              </h3>
              
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">Overall Completion</span>
                  <span className="font-medium">{Math.round((completedItems / totalItems) * 100)}%</span>
                </div>
                <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-500"
                    style={{ width: `${(completedItems / totalItems) * 100}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-emerald-500/10 rounded-xl">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-emerald-400">{completedItems}</p>
                  <p className="text-xs text-slate-400">Complete</p>
                </div>
                <div className="text-center p-3 bg-amber-500/10 rounded-xl">
                  <Clock className="w-6 h-6 text-amber-400 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-amber-400">{inProgressItems}</p>
                  <p className="text-xs text-slate-400">In Progress</p>
                </div>
                <div className="text-center p-3 bg-slate-500/10 rounded-xl">
                  <AlertCircle className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-slate-400">{totalItems - completedItems - inProgressItems}</p>
                  <p className="text-xs text-slate-400">To Do</p>
                </div>
              </div>

              <Link
                href="/checklist"
                className="mt-4 w-full flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-medium transition-colors"
              >
                View Full Checklist
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={() => openAgentWithPrompt('Generate an NDA template for my company')}
                className="p-4 bg-slate-900/50 border border-white/10 hover:border-violet-500/50 rounded-xl text-left transition-all group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-violet-500/20 rounded-lg flex items-center justify-center group-hover:bg-violet-500/30 transition-colors">
                    <FileText className="w-5 h-5 text-violet-400" />
                  </div>
                  <div>
                    <h4 className="font-medium">Generate NDA</h4>
                    <p className="text-xs text-slate-400">Mutual or one-way</p>
                  </div>
                </div>
                <p className="text-sm text-slate-500">I'll create a customized NDA template ready for signing</p>
              </button>

              <button
                onClick={() => openAgentWithPrompt('Generate an IP assignment agreement for a contractor')}
                className="p-4 bg-slate-900/50 border border-white/10 hover:border-violet-500/50 rounded-xl text-left transition-all group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center group-hover:bg-amber-500/30 transition-colors">
                    <Users className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="font-medium">IP Assignment</h4>
                    <p className="text-xs text-slate-400">For contractors</p>
                  </div>
                </div>
                <p className="text-sm text-slate-500">Secure IP rights from freelancers and contractors</p>
              </button>

              <button
                onClick={() => openAgentWithPrompt('Help me document an invention for potential patent filing')}
                className="p-4 bg-slate-900/50 border border-white/10 hover:border-violet-500/50 rounded-xl text-left transition-all group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors">
                    <Lightbulb className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="font-medium">Document Invention</h4>
                    <p className="text-xs text-slate-400">For patents</p>
                  </div>
                </div>
                <p className="text-sm text-slate-500">Create an invention disclosure form</p>
              </button>

              <button
                onClick={() => openAgentWithPrompt('Create a trade secret policy for my company')}
                className="p-4 bg-slate-900/50 border border-white/10 hover:border-violet-500/50 rounded-xl text-left transition-all group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                    <Lock className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-medium">Trade Secret Policy</h4>
                    <p className="text-xs text-slate-400">Protect secrets</p>
                  </div>
                </div>
                <p className="text-sm text-slate-500">Document what's confidential in your company</p>
              </button>
            </div>

            {/* Recent Agent Activity */}
            {recentActions.length > 0 && (
              <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-violet-400" />
                  Recent Agent Activity
                </h3>
                <div className="space-y-3">
                  {recentActions.slice(0, 5).map((action) => (
                    <div key={action.id} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl">
                      <div className="w-8 h-8 bg-violet-500/20 rounded-lg flex items-center justify-center">
                        <Zap className="w-4 h-4 text-violet-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{action.action_label || action.action_type}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(action.created_at).toLocaleDateString()} at {new Date(action.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                      {action.action_type === 'agent_chat' && (
                        <span className="px-2 py-0.5 text-xs bg-violet-500/20 text-violet-400 rounded-full">AI</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Agent Chat */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              {showChat ? (
                <ProactiveAgentChat
                  initialPrompt={chatPrompt}
                  onClose={() => {
                    setShowChat(false)
                    setChatPrompt(undefined)
                  }}
                  isExpanded={true}
                />
              ) : (
                <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-semibold mb-2">IP Agent Ready!</h3>
                    <p className="text-sm text-slate-400 mb-4">
                      I can search trademarks, check domains, generate documents, and guide you through the process.
                    </p>
                    <button
                      onClick={() => setShowChat(true)}
                      className="w-full py-3 bg-violet-600 hover:bg-violet-500 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      Start Conversation
                    </button>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <p className="text-xs text-slate-500 mb-3 font-medium">QUICK PROMPTS</p>
                    <div className="space-y-2">
                      {[
                        'Check my brand availability',
                        'Generate an NDA',
                        'What should I do next?'
                      ].map((prompt, i) => (
                        <button
                          key={i}
                          onClick={() => openAgentWithPrompt(prompt)}
                          className="w-full text-left p-2 text-sm text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                        >
                          → {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
