import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { DashboardNav } from '@/components/dashboard/DashboardNav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })
  
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  // Update last active timestamp (non-blocking)
  supabase
    .from('profiles')
    .update({ last_active_at: new Date().toISOString() })
    .eq('id', session.user.id)
    .then(() => {})

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <DashboardNav user={session.user} profile={profile} />
      <main className="lg:pl-64 flex-1 flex flex-col">
        <div className="p-6 lg:p-8 flex-1">
          {children}
        </div>
        {/* Legal Disclaimer */}
        <div className="lg:pl-0 border-t border-slate-200 bg-slate-100">
          <div className="max-w-6xl mx-auto px-6 lg:px-8 py-3">
            <p className="text-xs text-slate-500 flex items-center gap-2">
              <span className="w-4 h-4 rounded-full border border-slate-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0">i</span>
              <span>
                <strong className="text-slate-600">Not legal advice.</strong> LaunchReady provides educational guidance and IP tracking tools only. 
                For legal advice, filings, and contracts, we connect you with our specialist legal partners.
              </span>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
