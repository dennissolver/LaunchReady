import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'
import {
  Plus, FolderKanban, ArrowRight, CheckCircle2, Clock, AlertTriangle
} from 'lucide-react'

export default async function ProjectsPage() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  const { data: { session } } = await supabase.auth.getSession()

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('founder_id', session?.user?.id)
    .order('updated_at', { ascending: false })

  const statusColors: Record<string, string> = {
    idea: 'bg-gray-100 text-gray-700',
    building: 'bg-blue-100 text-blue-700',
    mvp: 'bg-violet-100 text-violet-700',
    launched: 'bg-emerald-100 text-emerald-700',
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-500 mt-1">Manage and protect your intellectual property</p>
        </div>
        <Link
          href="/dashboard/projects/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Project
        </Link>
      </div>

      {projects && projects.length > 0 ? (
        <div className="grid gap-4">
          {projects.map((project: any) => (
            <Link
              key={project.id}
              href={`/dashboard/projects/${project.id}`}
              className="flex items-center gap-4 p-5 bg-white rounded-xl border border-gray-200 hover:border-violet-200 hover:shadow-sm transition-all group"
            >
              <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center group-hover:bg-violet-200 transition-colors">
                <FolderKanban className="w-6 h-6 text-violet-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-semibold text-gray-900 truncate">{project.name}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[project.status]}`}>
                    {project.status}
                  </span>
                </div>
                {project.description && (
                  <p className="text-sm text-gray-500 truncate">{project.description}</p>
                )}
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-violet-600 transition-colors" />
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FolderKanban className="w-8 h-8 text-violet-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No projects yet</h2>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            Create your first project to start protecting your intellectual property.
          </p>
          <Link
            href="/dashboard/projects/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Your First Project
          </Link>
        </div>
      )}
    </div>
  )
}