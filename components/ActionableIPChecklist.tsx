'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { 
  Shield, Check, X, ChevronRight, ChevronDown, ExternalLink,
  Sparkles, Building2, Lightbulb, FileText, Users, Lock,
  Loader2, CheckCircle2, Circle, AlertCircle, Clock, Upload,
  MessageSquare, ArrowRight, Info, Zap, HelpCircle
} from 'lucide-react'
import { checklistCategories, allChecklistItems, ChecklistItem, ChecklistAction } from '@/lib/checklist-data'

type ItemStatus = 'not-started' | 'in-progress' | 'done' | 'blocked' | 'skipped'

interface ItemProgress {
  item_id: string
  status: ItemStatus
  discovery_answer?: 'yes' | 'no' | 'unsure'
  evidence_value?: string
  notes?: string
  started_at?: string
  completed_at?: string
}

const iconMap: Record<string, any> = {
  Building2, Lightbulb, FileText, Users, Lock
}

const priorityColors = {
  critical: 'text-red-400 bg-red-500/10 border-red-500/30',
  high: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  medium: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  low: 'text-slate-400 bg-slate-500/10 border-slate-500/30'
}

interface ActionableChecklistProps {
  onAgentPrompt: (prompt: string, itemId: string) => void
}

export default function ActionableIPChecklist({ onAgentPrompt }: ActionableChecklistProps) {
  const [progress, setProgress] = useState<Record<string, ItemProgress>>({})
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['brand']))
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  
  const supabase = createClientComponentClient()

  // Load progress from Supabase
  useEffect(() => {
    loadProgress()
  }, [])

  const loadProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('ip_checklist_progress')
        .select('*')
        .eq('user_id', user.id)

      if (error) throw error

      const progressMap: Record<string, ItemProgress> = {}
      data?.forEach(item => {
        progressMap[item.item_id] = item
      })
      setProgress(progressMap)
    } catch (err) {
      console.error('Error loading progress:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateProgress = async (itemId: string, updates: Partial<ItemProgress>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('ip_checklist_progress')
        .upsert({
          user_id: user.id,
          item_id: itemId,
          ...progress[itemId],
          ...updates,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,item_id'
        })

      if (error) throw error

      setProgress(prev => ({
        ...prev,
        [itemId]: { ...prev[itemId], item_id: itemId, ...updates }
      }))
    } catch (err) {
      console.error('Error updating progress:', err)
    }
  }

  const logAction = async (itemId: string, action: ChecklistAction) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await supabase.from('ip_action_log').insert({
        user_id: user.id,
        item_id: itemId,
        action_type: action.type,
        action_label: action.label,
        action_url: action.url,
        agent_prompt: action.agentPrompt
      })
    } catch (err) {
      console.error('Error logging action:', err)
    }
  }

  const handleAction = async (item: ChecklistItem, action: ChecklistAction) => {
    setActionLoading(`${item.id}-${action.label}`)
    
    // Log the action
    await logAction(item.id, action)
    
    // Mark as in-progress if not started
    if (!progress[item.id] || progress[item.id].status === 'not-started') {
      await updateProgress(item.id, { 
        status: 'in-progress',
        started_at: new Date().toISOString()
      })
    }

    if (action.type === 'link') {
      window.open(action.url, '_blank')
    } else if (action.type === 'agent') {
      onAgentPrompt(action.agentPrompt || '', item.id)
    }

    setActionLoading(null)
  }

  const markAsDone = async (itemId: string) => {
    await updateProgress(itemId, {
      status: 'done',
      completed_at: new Date().toISOString()
    })
  }

  const toggleItemExpanded = (itemId: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev)
      if (next.has(itemId)) {
        next.delete(itemId)
      } else {
        next.add(itemId)
      }
      return next
    })
  }

  const toggleCategoryExpanded = (categoryId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      if (next.has(categoryId)) {
        next.delete(categoryId)
      } else {
        next.add(categoryId)
      }
      return next
    })
  }

  const getStatusIcon = (itemId: string) => {
    const status = progress[itemId]?.status || 'not-started'
    switch (status) {
      case 'done':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400" />
      case 'in-progress':
        return <Clock className="w-5 h-5 text-amber-400" />
      case 'blocked':
        return <AlertCircle className="w-5 h-5 text-red-400" />
      case 'skipped':
        return <X className="w-5 h-5 text-slate-500" />
      default:
        return <Circle className="w-5 h-5 text-slate-600" />
    }
  }

  const getStatusBg = (itemId: string) => {
    const status = progress[itemId]?.status || 'not-started'
    switch (status) {
      case 'done':
        return 'border-emerald-500/30 bg-emerald-500/5'
      case 'in-progress':
        return 'border-amber-500/30 bg-amber-500/5'
      case 'blocked':
        return 'border-red-500/30 bg-red-500/5'
      default:
        return 'border-slate-700/50 bg-slate-800/30'
    }
  }

  const getCategoryProgress = (categoryId: string) => {
    const category = checklistCategories.find(c => c.id === categoryId)
    if (!category) return { done: 0, total: 0, percentage: 0 }
    
    const done = category.items.filter(item => progress[item.id]?.status === 'done').length
    const total = category.items.length
    return { done, total, percentage: Math.round((done / total) * 100) }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">IP Protection Progress</h2>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400">{Object.values(progress).filter(p => p.status === 'done').length} Done</span>
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span className="text-amber-400">{Object.values(progress).filter(p => p.status === 'in-progress').length} In Progress</span>
            </span>
            <span className="flex items-center gap-2">
              <Circle className="w-4 h-4 text-slate-500" />
              <span className="text-slate-400">{allChecklistItems.length - Object.keys(progress).length} To Do</span>
            </span>
          </div>
        </div>
        
        {/* Overall progress bar */}
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
            style={{ width: `${(Object.values(progress).filter(p => p.status === 'done').length / allChecklistItems.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Categories */}
      {checklistCategories.map(category => {
        const IconComponent = iconMap[category.icon]
        const categoryProgress = getCategoryProgress(category.id)
        const isExpanded = expandedCategories.has(category.id)

        return (
          <div key={category.id} className="bg-slate-900/50 border border-white/10 rounded-2xl overflow-hidden">
            {/* Category Header */}
            <button
              onClick={() => toggleCategoryExpanded(category.id)}
              className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-violet-500/20 rounded-xl flex items-center justify-center">
                  {IconComponent && <IconComponent className="w-5 h-5 text-violet-400" />}
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-white">{category.title}</h3>
                  <p className="text-sm text-slate-400">{category.description}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-sm font-medium text-white">{categoryProgress.done}/{categoryProgress.total}</span>
                  <div className="w-24 h-1.5 bg-slate-700 rounded-full mt-1">
                    <div 
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${categoryProgress.percentage}%` }}
                    />
                  </div>
                </div>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
              </div>
            </button>

            {/* Category Items */}
            {isExpanded && (
              <div className="border-t border-white/10 divide-y divide-white/5">
                {category.items.map(item => {
                  const isItemExpanded = expandedItems.has(item.id)
                  const itemProgress = progress[item.id]

                  return (
                    <div key={item.id} className={`${getStatusBg(item.id)}`}>
                      {/* Item Header */}
                      <button
                        onClick={() => toggleItemExpanded(item.id)}
                        className="w-full p-4 flex items-center gap-4 hover:bg-white/5 transition-colors"
                      >
                        {getStatusIcon(item.id)}
                        
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-white">{item.label}</span>
                            <span className={`px-2 py-0.5 text-xs rounded-full border ${priorityColors[item.priority]}`}>
                              {item.priority}
                            </span>
                          </div>
                          <p className="text-sm text-slate-400">{item.description}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          {item.estimatedTime && (
                            <span className="text-xs text-slate-500">{item.estimatedTime}</span>
                          )}
                          <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${isItemExpanded ? 'rotate-90' : ''}`} />
                        </div>
                      </button>

                      {/* Expanded Item Content */}
                      {isItemExpanded && (
                        <div className="px-4 pb-4 pl-14 space-y-4">
                          {/* Guidance */}
                          <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                            <div className="flex items-start gap-3">
                              <Info className="w-5 h-5 text-violet-400 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="text-sm text-slate-300 leading-relaxed">{item.guidance}</p>
                                {item.cost && (
                                  <p className="text-xs text-slate-500 mt-2">
                                    Estimated cost: <span className="text-slate-400">{item.cost}</span>
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* What Agent Can Help With */}
                          <div>
                            <h4 className="text-xs uppercase tracking-wider text-violet-400 font-medium mb-2 flex items-center gap-2">
                              <Sparkles className="w-3 h-3" />
                              What I Can Help With
                            </h4>
                            <ul className="space-y-1">
                              {item.agentCanHelp.map((help, i) => (
                                <li key={i} className="text-sm text-slate-400 flex items-center gap-2">
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  {help}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* What User Must Do */}
                          <div>
                            <h4 className="text-xs uppercase tracking-wider text-amber-400 font-medium mb-2 flex items-center gap-2">
                              <Users className="w-3 h-3" />
                              What You Need To Do
                            </h4>
                            <ul className="space-y-1">
                              {item.userMustDo.map((task, i) => (
                                <li key={i} className="text-sm text-slate-400 flex items-center gap-2">
                                  <ArrowRight className="w-3 h-3 text-amber-400" />
                                  {task}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Action Buttons */}
                          <div className="pt-2">
                            <h4 className="text-xs uppercase tracking-wider text-slate-500 font-medium mb-3">
                              Take Action
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {item.actions.map((action, i) => {
                                const isLoading = actionLoading === `${item.id}-${action.label}`
                                
                                return (
                                  <button
                                    key={i}
                                    onClick={() => handleAction(item, action)}
                                    disabled={isLoading}
                                    className={`
                                      flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                                      ${action.type === 'agent' 
                                        ? 'bg-violet-600 hover:bg-violet-500 text-white' 
                                        : action.type === 'link'
                                        ? 'bg-slate-700 hover:bg-slate-600 text-white'
                                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600'
                                      }
                                      disabled:opacity-50 disabled:cursor-wait
                                    `}
                                  >
                                    {isLoading ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : action.type === 'agent' ? (
                                      <Sparkles className="w-4 h-4" />
                                    ) : action.type === 'link' ? (
                                      <ExternalLink className="w-4 h-4" />
                                    ) : action.type === 'upload' ? (
                                      <Upload className="w-4 h-4" />
                                    ) : (
                                      <FileText className="w-4 h-4" />
                                    )}
                                    {action.label}
                                  </button>
                                )
                              })}
                            </div>
                          </div>

                          {/* Mark as Complete */}
                          {itemProgress?.status !== 'done' && (
                            <div className="pt-4 border-t border-slate-700/50">
                              <button
                                onClick={() => markAsDone(item.id)}
                                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                Mark as Complete
                              </button>
                            </div>
                          )}

                          {/* Completed Badge */}
                          {itemProgress?.status === 'done' && (
                            <div className="pt-4 border-t border-emerald-500/20">
                              <div className="flex items-center gap-2 text-emerald-400">
                                <CheckCircle2 className="w-5 h-5" />
                                <span className="font-medium">Completed</span>
                                {itemProgress.completed_at && (
                                  <span className="text-sm text-emerald-400/60">
                                    on {new Date(itemProgress.completed_at).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
