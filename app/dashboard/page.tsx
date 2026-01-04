import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'
import { 
  Plus, Shield, AlertTriangle, Clock, CheckCircle2, AlertCircle,
  FolderKanban, FileBox, ArrowRight, Mic, User
} from 'lucide-react'

export default async function DashboardPage() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })
  
  const { data: { session } } = await supabase.auth.getSession()

  // Get user's projects
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('founder_id', session?.user?.id)
    .order('updated_at', { ascending: false })
    .limit(10)

  // Get ALL protection items across all user's projects
  const projectIds = projects?.map(p => p.id) || []
  const { data: allProtectionItems } = projectIds.length > 0 
    ? await supabase
        .from('protection_items')
        .select('*')
        .in('project_id', projectIds)
    : { data: [] }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session?.user?.id)
    .single()

  const hasProjects = projects && projects.length > 0
  const firstName = profile?.full_name?.split(' ')[0] || 'there'
  
  // Check if profile needs completion
  const profileNeedsCompletion = !profile?.onboarding_completed || !profile?.full_name

  // Calculate overall stats across ALL projects
  const allStatuses = allProtectionItems?.map(i => i.status) || []
  const overallStats = {
    critical: allStatuses.filter(s => s === 'critical').length,
    atRisk: allStatuses.filter(s => s === 'at_risk').length,
    pending: allStatuses.filter(s => ['pending', 'in_progress'].includes(s)).length,
    protected: allStatuses.filter(s => ['protected', 'registered'].includes(s)).length,
    totalProjects: projects?.length || 0,
  }

  // Calculate per-project stats
  const getProjectStats = (projectId: string) => {
    const items = allProtectionItems?.filter(i => i.project_id === projectId) || []
    const statuses = items.map(i => i.status)
    return {
      critical: statuses.filter(s => s === 'critical').length,
      atRisk: statuses.filter(s => s === 'at_risk').length,
      pending: statuses.filter(s => ['pending', 'in_progress'].includes(s)).length,
      protected: statuses.filter(s => ['protected', 'registered'].includes(s)).length,
      total: items.length,
    }
  }

  // Calculate health score
  const totalTracked = overallStats.critical + overallStats.atRisk + overallStats.pending + overallStats.protected
  const overallHealthScore = totalTracked > 0 
    ? Math.round((overallStats.protected / totalTracked) * 100)
    : 0

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {firstName}!
        </h1>
        <p className="text-gray-500 mt-1">
          Here's an overview of your IP protection status.
        </p>
      </div>

      {/* Profile Completion Banner */}
      {profileNeedsCompletion && (
        <Link 
          href="/dashboard/onboarding"
          className="block mb-6 p-4 bg-violet-50 border border-violet-200 rounded-xl hover:bg-violet-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-violet-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-violet-900">Complete your profile</h3>
              <p className="text-sm text-violet-700">
                Add your contact details so we can keep you updated on important IP deadlines.
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-violet-400" />
          </div>
        </Link>
      )}

      {!hasProjects ? (
        // Empty state - onboarding
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-violet-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Let's protect your first project
          </h2>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            Start by telling us about your project. Our AI will help identify what 
            intellectual property you have and what protections you need.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard/projects/new"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Your First Project
            </Link>
            <Link
              href="/dashboard/voice"
              className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-medium transition-colors"
            >
              <Mic className="w-5 h-5 text-violet-600" />
              Start with Voice Discovery
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Critical Alert Banner */}
          {overallStats.critical > 0 && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-red-900">Critical Action Required</h3>
                  <p className="text-sm text-red-700 mt-1">
                    You have {overallStats.critical} critical item{overallStats.critical > 1 ? 's' : ''} across your projects that need{overallStats.critical === 1 ? 's' : ''} immediate attention.
                  </p>
                </div>
                <Link 
                  href="#projects"
                  className="text-sm font-medium text-red-700 hover:text-red-800 whitespace-nowrap"
                >
                  View details →
                </Link>
              </div>
            </div>
          )}

          {/* Overall Stats Grid - Traffic Light Style */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className={`bg-white rounded-xl border-2 p-5 ${overallStats.critical > 0 ? 'border-red-300' : 'border-gray-200'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${overallStats.critical > 0 ? 'bg-red-100' : 'bg-gray-100'}`}>
                  <AlertCircle className={`w-5 h-5 ${overallStats.critical > 0 ? 'text-red-600' : 'text-gray-400'}`} />
                </div>
                <div>
                  <p className={`text-2xl font-bold ${overallStats.critical > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                    {overallStats.critical}
                  </p>
                  <p className="text-sm text-gray-500">Critical</p>
                </div>
              </div>
            </div>
            
            <div className={`bg-white rounded-xl border-2 p-5 ${overallStats.atRisk > 0 ? 'border-red-200' : 'border-gray-200'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${overallStats.atRisk > 0 ? 'bg-red-50' : 'bg-gray-100'}`}>
                  <AlertTriangle className={`w-5 h-5 ${overallStats.atRisk > 0 ? 'text-red-500' : 'text-gray-400'}`} />
                </div>
                <div>
                  <p className={`text-2xl font-bold ${overallStats.atRisk > 0 ? 'text-red-500' : 'text-gray-400'}`}>
                    {overallStats.atRisk}
                  </p>
                  <p className="text-sm text-gray-500">At Risk</p>
                </div>
              </div>
            </div>
            
            <div className={`bg-white rounded-xl border-2 p-5 ${overallStats.pending > 0 ? 'border-amber-200' : 'border-gray-200'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${overallStats.pending > 0 ? 'bg-amber-100' : 'bg-gray-100'}`}>
                  <Clock className={`w-5 h-5 ${overallStats.pending > 0 ? 'text-amber-600' : 'text-gray-400'}`} />
                </div>
                <div>
                  <p className={`text-2xl font-bold ${overallStats.pending > 0 ? 'text-amber-600' : 'text-gray-400'}`}>
                    {overallStats.pending}
                  </p>
                  <p className="text-sm text-gray-500">In Progress</p>
                </div>
              </div>
            </div>
            
            <div className={`bg-white rounded-xl border-2 p-5 ${overallStats.protected > 0 ? 'border-emerald-200' : 'border-gray-200'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${overallStats.protected > 0 ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                  <CheckCircle2 className={`w-5 h-5 ${overallStats.protected > 0 ? 'text-emerald-600' : 'text-gray-400'}`} />
                </div>
                <div>
                  <p className={`text-2xl font-bold ${overallStats.protected > 0 ? 'text-emerald-600' : 'text-gray-400'}`}>
                    {overallStats.protected}
                  </p>
                  <p className="text-sm text-gray-500">Protected</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                  <FolderKanban className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{overallStats.totalProjects}</p>
                  <p className="text-sm text-gray-500">Projects</p>
                </div>
              </div>
            </div>
          </div>

          {/* Health Score Banner */}
          {totalTracked > 0 && (
            <div className={`mb-8 p-5 rounded-xl border-2 ${
              overallHealthScore >= 70 ? 'bg-emerald-50 border-emerald-200' :
              overallHealthScore >= 40 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`font-semibold ${
                    overallHealthScore >= 70 ? 'text-emerald-900' :
                    overallHealthScore >= 40 ? 'text-amber-900' : 'text-red-900'
                  }`}>
                    Overall IP Health Score
                  </h3>
                  <p className={`text-sm mt-1 ${
                    overallHealthScore >= 70 ? 'text-emerald-700' :
                    overallHealthScore >= 40 ? 'text-amber-700' : 'text-red-700'
                  }`}>
                    {overallHealthScore >= 70 
                      ? "Great job! Most of your IP is protected." 
                      : overallHealthScore >= 40 
                        ? "You're making progress. Keep working on those pending items."
                        : "Your IP needs attention. Focus on critical and at-risk items."}
                  </p>
                </div>
                <div className={`text-4xl font-bold ${
                  overallHealthScore >= 70 ? 'text-emerald-600' :
                  overallHealthScore >= 40 ? 'text-amber-600' : 'text-red-600'
                }`}>
                  {overallHealthScore}%
                </div>
              </div>
            </div>
          )}

          {/* Projects with Status Indicators */}
          <div id="projects" className="bg-white rounded-2xl border border-gray-200 mb-8">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Your Projects</h2>
              <Link
                href="/dashboard/projects"
                className="text-sm text-violet-600 hover:text-violet-500 font-medium flex items-center gap-1"
              >
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {projects.map((project: any) => {
                const projectStats = getProjectStats(project.id)
                const hasIssues = projectStats.critical > 0 || projectStats.atRisk > 0
                
                return (
                  <Link
                    key={project.id}
                    href={`/dashboard/projects/${project.id}`}
                    className={`flex items-center gap-4 p-5 hover:bg-gray-50 transition-colors ${
                      projectStats.critical > 0 ? 'bg-red-50/30' : ''
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      projectStats.critical > 0 ? 'bg-red-100' :
                      projectStats.atRisk > 0 ? 'bg-amber-100' :
                      projectStats.protected > 0 ? 'bg-emerald-100' : 'bg-violet-100'
                    }`}>
                      <FolderKanban className={`w-5 h-5 ${
                        projectStats.critical > 0 ? 'text-red-600' :
                        projectStats.atRisk > 0 ? 'text-amber-600' :
                        projectStats.protected > 0 ? 'text-emerald-600' : 'text-violet-600'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{project.name}</p>
                      <p className="text-sm text-gray-500 capitalize">{project.status}</p>
                    </div>
                    
                    {/* Traffic Light Indicators */}
                    <div className="flex items-center gap-3">
                      {projectStats.critical > 0 && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-red-100 rounded-full">
                          <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                          <span className="text-xs font-medium text-red-700">{projectStats.critical}</span>
                        </div>
                      )}
                      {projectStats.atRisk > 0 && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-red-50 rounded-full">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                          <span className="text-xs font-medium text-red-600">{projectStats.atRisk}</span>
                        </div>
                      )}
                      {projectStats.pending > 0 && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-amber-100 rounded-full">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span className="text-xs font-medium text-amber-700">{projectStats.pending}</span>
                        </div>
                      )}
                      {projectStats.protected > 0 && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-emerald-100 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-xs font-medium text-emerald-700">{projectStats.protected}</span>
                        </div>
                      )}
                      {projectStats.total === 0 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                          {project.discovery_completed ? 'No items' : 'Setup Needed'}
                        </span>
                      )}
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/dashboard/projects/new"
              className="flex items-center gap-4 p-5 bg-white rounded-xl border border-gray-200 hover:border-violet-200 hover:bg-violet-50/50 transition-colors group"
            >
              <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center group-hover:bg-violet-200 transition-colors">
                <Plus className="w-6 h-6 text-violet-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Add New Project</p>
                <p className="text-sm text-gray-500">Protect another idea</p>
              </div>
            </Link>
            <Link
              href="/dashboard/voice"
              className="flex items-center gap-4 p-5 bg-white rounded-xl border border-gray-200 hover:border-violet-200 hover:bg-violet-50/50 transition-colors group"
            >
              <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center group-hover:bg-violet-200 transition-colors">
                <Mic className="w-6 h-6 text-violet-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Voice Discovery</p>
                <p className="text-sm text-gray-500">Talk to our AI guide</p>
              </div>
            </Link>
            <Link
              href="/dashboard/assets"
              className="flex items-center gap-4 p-5 bg-white rounded-xl border border-gray-200 hover:border-violet-200 hover:bg-violet-50/50 transition-colors group"
            >
              <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center group-hover:bg-violet-200 transition-colors">
                <FileBox className="w-6 h-6 text-violet-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Upload Assets</p>
                <p className="text-sm text-gray-500">Add logos, designs</p>
              </div>
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
