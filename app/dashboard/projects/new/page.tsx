'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'
import { 
  ArrowLeft, ArrowRight, Loader2, Mic, Shield,
  Lightbulb, Hammer, Rocket, Building2
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
  const [error, setError] = useState<string | null>(null)
  
  // Form state
  const [name, setName] = useState('')
  const [status, setStatus] = useState('')
  const [description, setDescription] = useState('')
  const [problemStatement, setProblemStatement] = useState('')

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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Describe your project in a sentence or two
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., An app that provides real-time translation for tourists using AR glasses..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
              />
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
