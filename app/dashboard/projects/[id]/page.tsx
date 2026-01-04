import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, Shield, CheckCircle2, Clock, AlertTriangle,
  Plus, Mic, Github, FileBox, Users, Calendar, ExternalLink
} from 'lucide-react'

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })
  
  const { data: { session } } = await supabase.auth.getSession()

  // Get project
  const { data: project, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', params.id)
    .eq('founder_id', session?.user?.id)
    .single()

  if (error || !project) {
    notFound()
  }

  // Get protection items
  const { data: protectionItems } = await supabase
    .from('protection_items')
    .select('*')
    .eq('project_id', params.id)
    .order('created_at', { ascending: false })

  // Get evidence events
  const { data: evidenceEvents } = await supabase
    .from('evidence_events')
    .select('*')
    .eq('project_id', params.id)
    .order('event_timestamp', { ascending: false })
    .limit(5)

  // Get collaborators
  const { data: collaborators } = await supabase
    .from('collaborators')
    .select('*')
    .eq('project_id', params.id)

  const stats = {
    protected: protectionItems?.filter(i => i.status === 'registered').length || 0,
    pending: protectionItems?.filter(i => i.status === 'pending').length || 0,
    atRisk: protectionItems?.filter(i => ['not_started', 'urgent', 'expired'].includes(i.status)).length || 0,
    evidence: evidenceEvents?.length || 0,
    collaborators: collaborators?.length || 0,
  }

  const statusColors: Record<string, string> = {
    idea: 'bg-gray-100 text-gray-700',
    building: 'bg-blue-100 text-blue-700',
    mvp: 'bg-violet-100 text-violet-700',
    launched: 'bg-emerald-100 text-emerald-700',
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link 
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusColors[project.status]}`}>
                {project.status}
              </span>
            </div>
            {project.description && (
              <p className="text-gray-500 max-w-2xl">{project.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span className="text-sm text-gray-500">Protected</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.protected}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-amber-500" />
            <span className="text-sm text-gray-500">Pending</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className="text-sm text-gray-500">At Risk</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.atRisk}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <FileBox className="w-4 h-4 text-violet-500" />
            <span className="text-sm text-gray-500">Evidence</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.evidence}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-gray-500">Contributors</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.collaborators}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Protection Checklist */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">IP Protection Checklist</h2>
              <p className="text-xs text-gray-500 mt-0.5">Tracking tool only — for legal filings, we'll connect you with our partners</p>
            </div>
            <Link 
              href={`/dashboard/voice?project=${params.id}`}
              className="flex items-center gap-1 text-sm text-violet-600 hover:text-violet-500 font-medium"
            >
              <Mic className="w-4 h-4" />
              Voice Discovery
            </Link>
          </div>
          
          <div className="divide-y divide-gray-100">
            {/* Default checklist items - merged with any saved items */}
            {[
              { category: 'Brand & Trademarks', items: [
                { key: 'company_name_tm', name: 'Company Name Trademark', description: 'Register your company name as a trademark' },
                { key: 'product_name_tm', name: 'Product Name Trademark', description: 'Register your product/app name as a trademark' },
                { key: 'logo_tm', name: 'Logo Trademark', description: 'Register your logo design as a trademark' },
                { key: 'domain', name: 'Domain Name', description: 'Secure primary domain and key variations' },
                { key: 'social_handles', name: 'Social Media Handles', description: 'Secure consistent handles across platforms' },
              ]},
              { category: 'Patents & Inventions', items: [
                { key: 'provisional_patent', name: 'Provisional Patent', description: 'File provisional patent for unique innovations' },
                { key: 'patent_search', name: 'Prior Art Search', description: 'Search existing patents for conflicts' },
                { key: 'invention_disclosure', name: 'Invention Disclosure', description: 'Document all unique technical innovations' },
              ]},
              { category: 'Copyright & Content', items: [
                { key: 'code_copyright', name: 'Source Code Copyright', description: 'Register copyright for your codebase' },
                { key: 'design_copyright', name: 'UI/UX Design Copyright', description: 'Protect your interface designs' },
                { key: 'content_copyright', name: 'Content Copyright', description: 'Protect written content and documentation' },
              ]},
              { category: 'Contracts & Agreements', items: [
                { key: 'contractor_ip', name: 'Contractor IP Assignment', description: 'Ensure all contractor work is assigned to you' },
                { key: 'employee_ip', name: 'Employee IP Agreement', description: 'Have employees sign IP assignment agreements' },
                { key: 'cofounder_ip', name: 'Co-founder IP Agreement', description: 'Document IP ownership between founders' },
                { key: 'nda', name: 'NDA Templates', description: 'Have NDAs ready for sensitive discussions' },
              ]},
              { category: 'Trade Secrets', items: [
                { key: 'trade_secret_policy', name: 'Trade Secret Policy', description: 'Document what information is confidential' },
                { key: 'access_controls', name: 'Access Controls', description: 'Limit access to sensitive information' },
              ]},
            ].map((category) => (
              <div key={category.category}>
                <div className="px-4 py-3 bg-gray-50">
                  <h3 className="text-sm font-semibold text-gray-700">{category.category}</h3>
                </div>
                {category.items.map((item) => {
                  // Check if this item exists in the database
                  const existingItem = protectionItems?.find((p: any) => 
                    p.item_name.toLowerCase().includes(item.name.toLowerCase().split(' ')[0]) ||
                    p.item_type === item.key
                  )
                  const status = existingItem?.status || 'not_started'
                  
                  return (
                    <div key={item.key} className="p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {status === 'registered' || status === 'protected' ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                          ) : status === 'pending' || status === 'filed' ? (
                            <Clock className="w-5 h-5 text-amber-500" />
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{item.name}</p>
                            <p className="text-sm text-gray-500">{item.description}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded capitalize ${
                          status === 'registered' || status === 'protected' ? 'bg-emerald-100 text-emerald-700' :
                          status === 'pending' || status === 'filed' ? 'bg-amber-100 text-amber-700' :
                          'bg-gray-100 text-gray-500'
                        }`}>
                          {status === 'not_started' ? 'To Do' : status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-left transition-colors">
                <Github className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Connect GitHub</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-left transition-colors">
                <FileBox className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Upload Assets</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-left transition-colors">
                <Users className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Add Collaborators</span>
              </button>
            </div>
          </div>

          {/* Patent Deadline Alert */}
          {project.patent_deadline_au && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-amber-600" />
                <h3 className="font-semibold text-amber-900">Patent Deadline</h3>
              </div>
              <p className="text-sm text-amber-700 mb-2">
                Your 12-month patent window expires:
              </p>
              <p className="text-lg font-bold text-amber-900">
                {new Date(project.patent_deadline_au).toLocaleDateString('en-AU', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
          )}

          {/* Recent Evidence */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Recent Evidence</h3>
            {evidenceEvents && evidenceEvents.length > 0 ? (
              <div className="space-y-3">
                {evidenceEvents.map((event: any) => (
                  <div key={event.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-4 h-4 text-gray-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{event.event_title}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(event.event_timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No evidence captured yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
