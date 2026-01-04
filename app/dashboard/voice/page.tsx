'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Shield, Mic, Sparkles } from 'lucide-react'
import { ElevenLabsConversational } from '@/components/voice/ElevenLabsConversational'

export default function VoiceDiscoveryPage() {
  const searchParams = useSearchParams()
  const projectId = searchParams.get('project')

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link 
          href={projectId ? `/dashboard/projects/${projectId}` : '/dashboard'}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          {projectId ? 'Back to Project' : 'Back to Dashboard'}
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Voice Discovery</h1>
        <p className="text-gray-500 mt-1">
          Tell our AI about your project and we'll identify what IP you need to protect.
        </p>
      </div>

      {/* Legal Disclaimer Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
        <p className="text-sm text-amber-800 flex items-start gap-2">
          <span className="w-5 h-5 rounded-full bg-amber-200 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">i</span>
          <span>
            <strong>Educational guidance only.</strong> This AI assistant helps you understand IP concepts and identify potential protections. 
            This is not legal advice. For legal filings and contracts, we'll connect you with our specialist legal partners.
          </span>
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        {/* Intro */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Mic className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Let's discover your IP
          </h2>
          <p className="text-gray-500">
            I'll ask you a few questions about your project. Just speak naturally and I'll identify 
            trademarks, patents, domains, and other protections you might need.
          </p>
        </div>

        {/* What we'll cover */}
        <div className="bg-violet-50 rounded-xl p-4 mb-8">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-violet-600 mt-0.5" />
            <div>
              <p className="font-medium text-violet-900 mb-2">What we'll discover:</p>
              <ul className="text-sm text-violet-700 space-y-1">
                <li>• Brand names and logos that need trademark protection</li>
                <li>• Unique features or algorithms that could be patented</li>
                <li>• Domain names and social handles to secure</li>
                <li>• Contractor relationships that need IP assignments</li>
                <li>• Public disclosures that start patent deadlines</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Voice Component */}
        <ElevenLabsConversational
          metadata={{
            project_id: projectId || undefined,
            context: 'ip_discovery',
          }}
          onFieldExtracted={(field, value) => {
            console.log('Extracted:', field, value)
            // TODO: Save extracted fields to project
          }}
          onConversationEnd={(result) => {
            console.log('Conversation ended:', result)
            // TODO: Redirect to project with findings
          }}
        />

        {/* Privacy note */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="flex items-start gap-2 text-xs text-gray-500">
            <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>
              Your conversation is encrypted and processed securely. We only save the IP items 
              we discover, not the full conversation audio.
            </p>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="mt-6 grid sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="font-medium text-gray-900 mb-1">🎯 Be specific</p>
          <p className="text-sm text-gray-500">Mention product names, features, and any unique innovations.</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="font-medium text-gray-900 mb-1">📅 Include dates</p>
          <p className="text-sm text-gray-500">When did you first share publicly? Launch dates matter for patents.</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="font-medium text-gray-900 mb-1">👥 Mention contributors</p>
          <p className="text-sm text-gray-500">Freelancers, co-founders, employees — we'll check IP assignments.</p>
        </div>
      </div>
    </div>
  )
}
