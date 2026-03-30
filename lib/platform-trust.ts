/**
 * Platform Trust — Self-contained trust client for LaunchReady
 *
 * Provides rate limiting, permission checks, audit logging, and metering
 * against the shared platform-trust Supabase instance.
 *
 * Env vars required:
 *   PLATFORM_TRUST_SUPABASE_URL
 *   PLATFORM_TRUST_SERVICE_KEY
 *   PLATFORM_TRUST_PROJECT_ID
 *
 * Fail-open: if env vars are missing or DB errors occur, requests pass through.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// ── Config ──────────────────────────────────────────────────
const TRUST_URL = () => process.env.PLATFORM_TRUST_SUPABASE_URL || ''
const TRUST_KEY = () => process.env.PLATFORM_TRUST_SERVICE_KEY || ''
const PROJECT_ID = () => process.env.PLATFORM_TRUST_PROJECT_ID || ''

let _client: SupabaseClient | null = null

function getClient(): SupabaseClient | null {
  if (!TRUST_URL() || !TRUST_KEY() || !PROJECT_ID()) return null
  if (!_client) _client = createClient(TRUST_URL(), TRUST_KEY())
  return _client
}

// ── Helpers ─────────────────────────────────────────────────
function hashData(data: unknown): string | null {
  if (data === undefined || data === null) return null
  const json = typeof data === 'string' ? data : JSON.stringify(data)
  // Use Web Crypto API (available in Edge Runtime / middleware)
  // For audit hashing we do a simple inline approach
  let hash = 0
  for (let i = 0; i < json.length; i++) {
    const char = json.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return `hash:${Math.abs(hash).toString(16)}`
}

const WINDOW_SECONDS: Record<string, number> = { minute: 60, hour: 3600, day: 86400 }

// ── Rate Limiting ───────────────────────────────────────────
async function checkRateLimit(
  client: SupabaseClient,
  agentId: string
): Promise<{ allowed: boolean; retry_after?: number }> {
  try {
    const { data: limits } = await client
      .from('rate_limits')
      .select('*')
      .eq('project_id', PROJECT_ID())
      .in('agent_id', [agentId, '*'])
      .order('window_type')

    if (!limits?.length) return { allowed: true }
    const now = new Date()

    for (const limit of limits) {
      const windowEnd = new Date(
        new Date(limit.window_start).getTime() + WINDOW_SECONDS[limit.window_type] * 1000
      )

      if (now >= windowEnd) {
        await client
          .from('rate_limits')
          .update({
            current_count: 1,
            window_start: now.toISOString(),
            updated_at: now.toISOString(),
          })
          .eq('id', limit.id)
        continue
      }

      if (limit.current_count >= limit.max_requests) {
        return {
          allowed: false,
          retry_after: Math.ceil((windowEnd.getTime() - now.getTime()) / 1000),
        }
      }

      await client
        .from('rate_limits')
        .update({
          current_count: limit.current_count + 1,
          updated_at: now.toISOString(),
        })
        .eq('id', limit.id)
        .eq('current_count', limit.current_count) // optimistic lock
    }
    return { allowed: true }
  } catch (err) {
    console.error('[platform-trust] Rate limit check failed:', err)
    return { allowed: true } // fail open
  }
}

// ── Permission Check ────────────────────────────────────────
async function checkPermission(
  client: SupabaseClient,
  agentId: string,
  scope: string,
  operation: string
): Promise<{ allowed: boolean; requires_approval: boolean }> {
  try {
    const { data: policy } = await client
      .from('permission_policies')
      .select('*')
      .eq('project_id', PROJECT_ID())
      .in('agent_id', [agentId, '*'])
      .eq('scope', scope)
      .eq('operation', operation)
      .limit(1)
      .single()

    if (!policy) return { allowed: false, requires_approval: false }
    return { allowed: true, requires_approval: policy.requires_approval }
  } catch (err) {
    console.error('[platform-trust] Permission check failed:', err)
    return { allowed: true, requires_approval: false } // fail open
  }
}

// ── Audit Logging ───────────────────────────────────────────
async function logAudit(
  client: SupabaseClient,
  agentId: string,
  toolName: string,
  operationType: string,
  status: string,
  input?: unknown,
  output?: unknown,
  durationMs?: number
): Promise<string | null> {
  try {
    const { data } = await client
      .from('audit_log')
      .insert({
        project_id: PROJECT_ID(),
        agent_id: agentId,
        tool_name: toolName,
        operation_type: operationType,
        input_hash: hashData(input),
        output_hash: hashData(output),
        status,
        duration_ms: durationMs || null,
        requires_human_approval: status === 'pending_approval',
      } as never)
      .select('id')
      .single()
    return data?.id || null
  } catch (err) {
    console.error('[platform-trust] Audit log write failed:', err)
    return null // fail open
  }
}

// ── Public API: trustGate ───────────────────────────────────
/**
 * Full trust gate: rate limit + permission check + approval gate.
 * Returns null if the request should proceed, or a NextResponse to short-circuit.
 */
export async function trustGate(
  request: NextRequest,
  scope: string,
  operation: 'read' | 'write' | 'delete'
): Promise<NextResponse | null> {
  const client = getClient()
  if (!client) return null // not configured — pass through

  const agentId = request.headers.get('x-agent-id') || 'anonymous'
  const pathname = new URL(request.url).pathname

  // 1. Rate limit
  const rateResult = await checkRateLimit(client, agentId)
  if (!rateResult.allowed) {
    await logAudit(client, agentId, pathname, operation, 'rate_limited')
    return NextResponse.json(
      { error: 'Rate limit exceeded', retry_after: rateResult.retry_after },
      { status: 429, headers: { 'Retry-After': String(rateResult.retry_after || 60) } }
    )
  }

  // 2. Permission check
  const permResult = await checkPermission(client, agentId, scope, operation)
  if (!permResult.allowed) {
    await logAudit(client, agentId, pathname, operation, 'permission_denied')
    return NextResponse.json(
      { error: `Permission denied: no policy for scope="${scope}" operation="${operation}"` },
      { status: 403 }
    )
  }

  // 3. Approval gate
  if (permResult.requires_approval) {
    const auditId = await logAudit(client, agentId, pathname, operation, 'pending_approval')
    return NextResponse.json(
      { error: 'Approval required', audit_id: auditId, approve_at: 'platform-trust.vercel.app/dashboard/approvals' },
      { status: 202 }
    )
  }

  // Audit the pass-through (fire and forget)
  logAudit(client, agentId, pathname, operation, 'completed').catch(() => {})

  return null // proceed
}

// ── Public API: trustLog ────────────────────────────────────
/**
 * Log an audit event directly (for use inside route handlers).
 */
export async function trustLog(
  agentId: string,
  toolName: string,
  operationType: 'read' | 'write' | 'delete',
  status: 'completed' | 'failed' | 'pending_approval' | 'permission_denied' | 'rate_limited',
  options?: { input?: unknown; output?: unknown; durationMs?: number }
): Promise<string | null> {
  const client = getClient()
  if (!client) return null
  return logAudit(
    client, agentId, toolName, operationType, status,
    options?.input, options?.output, options?.durationMs
  )
}

// ── Public API: trustMeter ──────────────────────────────────
/**
 * Record a metering event (AI model usage, token consumption, etc.)
 */
export async function trustMeter(
  agentId: string,
  model: string,
  inputTokens: number,
  outputTokens: number,
  options?: { sessionId?: string }
): Promise<{ id: string; cost_usd: number } | null> {
  const client = getClient()
  if (!client) return null

  try {
    const { data, error } = await client
      .from('metering_events')
      .insert({
        project_id: PROJECT_ID(),
        session_id: options?.sessionId || null,
        agent_id: agentId,
        model,
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        cost_usd: 0, // cost calculated server-side by platform-trust
      } as never)
      .select('id, cost_usd')
      .single()

    if (error) {
      console.error('[platform-trust] Metering write failed:', error)
      return null
    }
    return { id: data.id, cost_usd: data.cost_usd }
  } catch (err) {
    console.error('[platform-trust] Metering write failed:', err)
    return null // fail open
  }
}
