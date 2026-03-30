import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { trustGate } from '@/lib/platform-trust'

// ── Platform Trust: scope mapping for /api/* routes ─────────
function resolveScope(pathname: string, method: string): { scope: string; operation: 'read' | 'write' } | null {
  // /api/ai/*
  if (pathname.startsWith('/api/ai/chat')) return { scope: 'ai_chat', operation: 'write' }
  if (pathname.startsWith('/api/ai/onboarding-scan')) return { scope: 'ai_scan', operation: 'write' }

  // /api/agent/*
  if (pathname.startsWith('/api/agent/')) return { scope: 'agent', operation: 'write' }

  // /api/voice/*
  if (pathname.startsWith('/api/voice/')) return { scope: 'voice', operation: 'write' }

  // /api/documents/*
  if (pathname.startsWith('/api/documents/')) return { scope: 'documents', operation: method === 'GET' ? 'read' : 'write' }

  // /api/describe-url
  if (pathname.startsWith('/api/describe-url')) return { scope: 'describe_url', operation: 'read' }

  // /api/stripe/*
  if (pathname.startsWith('/api/stripe/')) return { scope: 'billing', operation: 'write' }

  // /api/projects/*
  if (pathname.startsWith('/api/projects/')) return { scope: 'protection', operation: method === 'GET' ? 'read' : 'write' }

  // Other /api/*
  if (pathname.startsWith('/api/')) return { scope: 'projects', operation: 'read' }

  return null
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const pathname = req.nextUrl.pathname

  // ── Platform Trust gate for API routes ────────────────────
  if (pathname.startsWith('/api/')) {
    const resolved = resolveScope(pathname, req.method)
    if (resolved) {
      const blocked = await trustGate(req, resolved.scope, resolved.operation)
      if (blocked) return blocked
    }
    // API routes don't need auth redirect logic — return early
    return res
  }

  // ── Existing auth middleware for pages ─────────────────────
  const supabase = createMiddlewareClient({ req, res })

  // Refresh session if expired
  const { data: { session } } = await supabase.auth.getSession()

  // Protected routes - require auth
  const protectedPaths = ['/dashboard']
  const isProtectedPath = protectedPaths.some(path =>
    pathname.startsWith(path)
  )

  // Redirect to login if accessing protected route without session
  if (isProtectedPath && !session) {
    const redirectUrl = new URL('/login', req.url)
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect to dashboard if already logged in and accessing auth pages
  const authPaths = ['/login', '/signup']
  const isAuthPath = authPaths.some(path =>
    pathname === path
  )

  if (isAuthPath && session) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return res
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
    '/signup',
    '/api/:path*',
  ],
}
