'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'
import {
  ArrowLeft, ArrowRight, Loader2, Mic, Shield,
  Lightbulb, Hammer, Rocket, Building2, Globe, Sparkles, RefreshCw, Check
} from 'lucide-react'

const projectStages = [
  { value: 'idea', label: 'Just an idea', icon: Lightbulb, description: 'Conceptualizing and planning' },
  { value: 'building', label: 'Building', icon: Hammer, description: 'Actively developing' },
  { value: 'mvp', label: 'MVP Ready', icon: Rocket, description: 'Have a working prototype' },
  { value: 'launched', label: 'Launched', icon: Building2, description: 'Live with users' },
]

export default function NewProjectPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [aiGenerated, setAiGenerated] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [domain, setDomain] = useState('')
  const [status, setStatus] = useState('')
  const [description, setDescription] = useState('')
  const [problemStatement, setProblemStatement] = useState('')

  const generateDescription = async () => {
    if (!domain.trim()) return

    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch('/api/describe-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: domain }),
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      if (data.description) {
        setDescription(data.description)
        setAiGenerated(true)
      }
    } catch (err) {
      console.error('Failed to generate description:', err)
      // Don't show error to user, just let them write manually
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDomainBlur = () => {
    if (domain.trim() && !description.trim()) {
      generateDescription()
    }
  }

  const handleSubmit = async () => {
    if (!name || !status) {
      setError('Please fill in all required fields')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        throw new Error('Not authenticated')
      }

      const { data, error: insertError } = await supabase
        .from('projects')
        .insert({
          founder_id: session.user.id,
          name,
          status,
          description: description || null,
          problem_statement: problemStatement || null,
        })
        .select()
        .single()

      if (insertError) throw insertError

      // If domain was provided, create a domain protection item
      if (domain.trim()) {
        const cleanDomain = domain.trim().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]
        await supabase
          .from('protection_items')
          .insert({
            project_id: data.id,
            item_type: 'domain',
            item_name: cleanDomain,
            status: 'registered', // Assume it's registered since they have it
            external_url: domain.startsWith('http') ? domain : `https://${domain}`,
          })
      }

      // Redirect to project page
      router.push(`/dashboard/projects/${data.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project')
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Create a new project</h1>
        <p className="text-gray-500 mt-1">
          Tell us about what you're building so we can help protect it.
        </p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full transition-colors ${
              s <= step ? 'bg-violet-600' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What's your project called? *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., TourLingo, CloudDash, FitTrack"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gray-400" />
                  Domain name
                  <span className="text-xs text-gray-400 font-normal">(optional but recommended)</span>
                </div>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => {
                    setDomain(e.target.value)
                    setAiGenerated(false)
                  }}
                  onBlur={handleDomainBlur}
                  placeholder="e.g., myapp.com or https://myapp.com"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
                {domain && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {isGenerating ? (
                      <Loader2 className="w-5 h-5 text-violet-500 animate-spin" />
                    ) : aiGenerated ? (
                      <Check className="w-5 h-5 text-emerald-500" />
                    ) : null}
                  </div>
                )}
              </div>
              <p className="mt-1.5 text-xs text-gray-500">
                We'll analyze your site to auto-generate a description
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What stage is it at? *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {projectStages.map((stage) => (
                  <button
                    key={stage.value}
                    type="button"
                    onClick={() => setStatus(stage.value)}
                    className={`flex items-start gap-3 p-4 rounded-xl border-2 transition-colors text-left ${
                      status === stage.value
                        ? 'border-violet-600 bg-violet-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <stage.icon className={`w-5 h-5 mt-0.5 ${
                      status === stage.value ? 'text-violet-600' : 'text-gray-400'
                    }`} />
                    <div>
                      <p className={`font-medium ${
                        status === stage.value ? 'text-violet-900' : 'text-gray-900'
                      }`}>
                        {stage.label}
                      </p>
                      <p className="text-sm text-gray-500">{stage.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Describe your project in a sentence or two
                </label>
                {domain && (
                  <button
                    type="button"
                    onClick={generateDescription}
                    disabled={isGenerating}
                    className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-500 font-medium disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <RefreshCw className="w-3 h-3" />
                    )}
                    {isGenerating ? 'Generating...' : 'Regenerate with AI'}
                  </button>
                )}
              </div>
              <div className="relative">
                <textarea
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value)
                    setAiGenerated(false)
                  }}
                  placeholder="e.g., An app that provides real-time translation for tourists using AR glasses..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                />
                {aiGenerated && description && (
                  <div className="absolute top-2 right-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-violet-100 text-violet-700 text-xs rounded-full">
                      <Sparkles className="w-3 h-3" />
                      AI generated
                    </span>
                  </div>
                )}
              </div>
              {!description && domain && !isGenerating && (
                <button
                  type="button"
                  onClick={generateDescription}
                  className="mt-2 flex items-center gap-2 text-sm text-violet-600 hover:text-violet-500"
                >
                  <Sparkles className="w-4 h-4" />
                  Generate description from {domain.replace(/^https?:\/\//, '').split('/')[0]}
                </button>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What problem does it solve?
              </label>
              <textarea
                value={problemStatement}
                onChange={(e) => setProblemStatement(e.target.value)}
                placeholder="e.g., Tourists struggle to communicate in foreign countries, leading to missed experiences and frustration..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-violet-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Ready to protect {name}
            </h2>
            <p className="text-gray-500 mb-6">
              After creating your project, you can connect your development platforms
              to automatically capture evidence, or talk to our AI to discover your IP needs.
            </p>

            {domain && (
              <div className="bg-emerald-50 rounded-xl p-4 mb-4 flex items-center gap-3 text-left">
                <Globe className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <div>
                  <p className="font-medium text-emerald-900">Domain will be added</p>
                  <p className="text-sm text-emerald-700">{domain.replace(/^https?:\/\//, '').split('/')[0]}</p>
                </div>
              </div>
            )}

            <div className="bg-violet-50 rounded-xl p-4 mb-6 flex items-start gap-3 text-left">
              <Mic className="w-5 h-5 text-violet-600 mt-0.5" />
              <div>
                <p className="font-medium text-violet-900">Voice Discovery Available</p>
                <p className="text-sm text-violet-700">
                  Our AI can interview you to identify all the IP you need to protect.
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={step === 1 && (!name || !status)}
              className="flex items-center gap-2 px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Create Project
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}