import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const plan = requestUrl.searchParams.get('plan')

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Exchange code for session
    await supabase.auth.exchangeCodeForSession(code)
  }

  // If plan=pro, redirect to Stripe checkout page
  if (plan === 'pro') {
    return NextResponse.redirect(new URL('/checkout/pro', requestUrl.origin))
  }

  // Default: redirect to dashboard
  return NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
}