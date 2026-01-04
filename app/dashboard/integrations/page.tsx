'use client'

import { useState } from 'react'
import { Github, GitBranch, Figma, Slack, FileText, Cloud, Plus, Loader2, AlertCircle } from 'lucide-react'

const integrations = [
  { id: 'github', name: 'GitHub', description: 'Capture commits and PRs as evidence', icon: Github, color: 'bg-gray-900', comingSoon: false },
  { id: 'gitlab', name: 'GitLab', description: 'Track merge requests and code history', icon: GitBranch, color: 'bg-orange-600', comingSoon: false },
  { id: 'figma', name: 'Figma', description: 'Document design iterations', icon: Figma, color: 'bg-purple-600', comingSoon: true },
  { id: 'slack', name: 'Slack', description: 'Capture dated discussions', icon: Slack, color: 'bg-[#4A154B]', comingSoon: true },
  { id: 'notion', name: 'Notion', description: 'Import product specs', icon: FileText, color: 'bg-gray-800', comingSoon: true },
  { id: 'google-drive', name: 'Google Drive', description: 'Connect documents for evidence', icon: Cloud, color: 'bg-blue-500', comingSoon: true },
]

export default function IntegrationsPage() {
  const [connecting, setConnecting] = useState<string | null>(null)

  const handleConnect = async (id: string) => {
    setConnecting(id)
    await new Promise(resolve => setTimeout(resolve, 1500))
    if (id === 'github') {
      window.open(`https://github.com/login/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID}&scope=repo,read:user`, '_blank')
    }
    setConnecting(null)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
        <p className="text-gray-500 mt-1">Connect your tools to capture evidence automatically</p>
      </div>

      <div className="bg-violet-50 border border-violet-100 rounded-xl p-4 mb-8 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-violet-600 mt-0.5" />
        <div>
          <p className="font-medium text-violet-900">Why connect your tools?</p>
          <p className="text-sm text-violet-700 mt-1">
            Integrations capture timestamped evidence of your work — commits, designs, documents — creating a defensible record for IP protection.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {integrations.map((integration) => {
          const Icon = integration.icon
          return (
            <div key={integration.id} className={`bg-white rounded-xl border p-5 ${integration.comingSoon ? 'opacity-60' : ''}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${integration.color}`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    {integration.name}
                    {integration.comingSoon && <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">Coming Soon</span>}
                  </h3>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">{integration.description}</p>
              <button
                onClick={() => handleConnect(integration.id)}
                disabled={integration.comingSoon || connecting === integration.id}
                className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  integration.comingSoon ? 'border border-gray-200 text-gray-400 cursor-not-allowed' : 'bg-violet-600 hover:bg-violet-500 text-white'
                }`}
              >
                {connecting === integration.id ? <><Loader2 className="w-4 h-4 animate-spin" /> Connecting...</> : integration.comingSoon ? 'Coming Soon' : <><Plus className="w-4 h-4" /> Connect</>}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}