import { createClient } from '@supabase/supabase-js'
import { createClientComponentClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from './database.types'

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client-side Supabase client (for use in React components)
export const createBrowserClient = () => {
  return createClientComponentClient<Database>()
}

// Server-side Supabase client (for use in Server Components)
export const createServerClient = async () => {
  const cookieStore = await cookies()
  return createServerComponentClient<Database>({ cookies: () => cookieStore })
}

// Admin client with service role (for server-side operations that bypass RLS)
export const createAdminClient = () => {
  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Simple client for public operations (like waitlist)
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Type exports for convenience
export type { Database }
