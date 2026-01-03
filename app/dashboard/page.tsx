import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'
import { 
  Plus, Shield, AlertTriangle, Clock, CheckCircle2, 
  FolderKanban, FileBox, ArrowRight, Mic
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
    .limit(5)

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session?.user?.id)
    .single()

  const hasProjects = projects && projects.length > 0
  const firstName = profile?.full_name?.split(' ')[0] || 'there'

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
            <button className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-medium transition-colors">
              <Mic className="w-5 h-5 text-violet-600" />
              Start with Voice Discovery
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                  <p className="text-sm text-gray-500">Protected</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                  <p className="text-sm text-gray-500">Pending</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                  <p className="text-sm text-gray-500">At Risk</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                  <FolderKanban className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
                  <p className="text-sm text-gray-500">Projects</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Projects */}
          <div className="bg-white rounded-2xl border border-gray-200 mb-8">
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
              {projects.map((project: any) => (
                <Link
                  key={project.id}
                  href={`/dashboard/projects/${project.id}`}
                  className="flex items-center gap-4 p-5 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                    <FolderKanban className="w-5 h-5 text-violet-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{project.name}</p>
                    <p className="text-sm text-gray-500 capitalize">{project.status}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                      {project.discovery_completed ? 'Discovery Complete' : 'Setup Needed'}
                    </span>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/dashboard/projects/new"
              className="flex items-center gap-4 p-5 bg-white rounded-xl border border-gray-200 hover:border-violet-200 hover:bg-violet-50/50 transition-colors group"
            >
              <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center group-hover:bg-violet-200 transition-colors">
                <Plus className="w-6 h-6 text-violet-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Add New Project</p>
                <p className="text-sm text-gray-500">Protect another idea or product</p>
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
                <p className="text-sm text-gray-500">Add logos, documents, or designs</p>
              </div>
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
