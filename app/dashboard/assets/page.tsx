'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'
import { Shield, Globe, FileText, Code, Lightbulb, Tag, Plus, Search, Loader2, Check, Clock, AlertTriangle, ChevronRight } from 'lucide-react'

const typeIcons: Record<string, any> = { trademark: Tag, patent: Lightbulb, copyright: FileText, trade_secret: Shield, domain: Globe, code: Code }
const typeColors: Record<string, string> = { trademark: 'bg-purple-100 text-purple-600', patent: 'bg-amber-100 text-amber-600', copyright: 'bg-blue-100 text-blue-600', trade_secret: 'bg-emerald-100 text-emerald-600', domain: 'bg-indigo-100 text-indigo-600', code: 'bg-gray-100 text-gray-600' }
const statusColors: Record<string, string> = { registered: 'bg-emerald-100 text-emerald-700', pending: 'bg-amber-100 text-amber-700', filed: 'bg-blue-100 text-blue-700', at_risk: 'bg-red-100 text-red-700', protected: 'bg-emerald-100 text-emerald-700' }

export default function AssetsPage() {
  const supabase = createClientComponentClient()
  const [assets, setAssets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const loadAssets = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setLoading(false); return }

      const { data: projects } = await supabase.from('projects').select('id, name').eq('founder_id', session.user.id)
      if (!projects?.length) { setLoading(false); return }

      const projectMap = Object.fromEntries(projects.map(p => [p.id, p]))
      const { data: items } = await supabase.from('protection_items').select('*').in('project_id', projects.map(p => p.id)).order('created_at', { ascending: false })

      if (items) setAssets(items.map(item => ({ ...item, project: projectMap[item.project_id] })))
      setLoading(false)
    }
    loadAssets()
  }, [supabase])

  const filteredAssets = assets.filter(a => a.item_name.toLowerCase().includes(searchQuery.toLowerCase()))
  const stats = {
    total: assets.length,
    protected: assets.filter(a => ['registered', 'protected', 'filed'].includes(a.status)).length,
    pending: assets.filter(a => a.status === 'pending').length,
    atRisk: assets.filter(a => a.status === 'at_risk').length,
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-violet-600" /></div>

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">IP Assets</h1>
          <p className="text-gray-500 mt-1">All your intellectual property across projects</p>
        </div>
        <Link href="/dashboard/projects/new" className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg font-medium">
          <Plus className="w-4 h-4" /> Add Project
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border p-4 flex items-center gap-3">
          <div className="p-2 bg-violet-100 rounded-lg"><Shield className="w-5 h-5 text-violet-600" /></div>
          <div><p className="text-2xl font-bold">{stats.total}</p><p className="text-sm text-gray-500">Total Assets</p></div>
        </div>
        <div className="bg-white rounded-xl border p-4 flex items-center gap-3">
          <div className="p-2 bg-emerald-100 rounded-lg"><Check className="w-5 h-5 text-emerald-600" /></div>
          <div><p className="text-2xl font-bold">{stats.protected}</p><p className="text-sm text-gray-500">Protected</p></div>
        </div>
        <div className="bg-white rounded-xl border p-4 flex items-center gap-3">
          <div className="p-2 bg-amber-100 rounded-lg"><Clock className="w-5 h-5 text-amber-600" /></div>
          <div><p className="text-2xl font-bold">{stats.pending}</p><p className="text-sm text-gray-500">Pending</p></div>
        </div>
        <div className="bg-white rounded-xl border p-4 flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg"><AlertTriangle className="w-5 h-5 text-red-600" /></div>
          <div><p className="text-2xl font-bold">{stats.atRisk}</p><p className="text-sm text-gray-500">At Risk</p></div>
        </div>
      </div>

      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search assets..." className="w-full pl-10 pr-4 py-2 border rounded-lg" />
      </div>

      {filteredAssets.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center">
          <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No IP assets yet</h3>
          <p className="text-gray-500 mb-6">Start by creating a project</p>
          <Link href="/dashboard/projects/new" className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg"><Plus className="w-4 h-4" /> Create Project</Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full">
            <thead><tr className="border-b bg-gray-50">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Asset</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Type</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Project</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
            </tr></thead>
            <tbody>
              {filteredAssets.map((asset) => {
                const Icon = typeIcons[asset.item_type] || Shield
                return (
                  <tr key={asset.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${typeColors[asset.item_type] || 'bg-gray-100'}`}><Icon className="w-4 h-4" /></div>
                      <span className="font-medium">{asset.item_name}</span>
                    </td>
                    <td className="py-3 px-4 text-sm capitalize">{asset.item_type?.replace('_', ' ')}</td>
                    <td className="py-3 px-4"><Link href={`/dashboard/projects/${asset.project_id}`} className="text-sm text-violet-600">{asset.project?.name}</Link></td>
                    <td className="py-3 px-4"><span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColors[asset.status] || 'bg-gray-100'}`}>{asset.status?.replace('_', ' ')}</span></td>
                    <td className="py-3 px-4 text-right"><Link href={`/dashboard/projects/${asset.project_id}`} className="text-sm text-gray-500 hover:text-violet-600 flex items-center justify-end gap-1">View<ChevronRight className="w-4 h-4" /></Link></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}