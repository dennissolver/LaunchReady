import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { NextRequest, NextResponse } from 'next/server'

// Valid statuses with their priority (lower = more urgent)
const STATUS_PRIORITY: Record<string, number> = {
  critical: 1,
  at_risk: 2,
  pending: 3,
  in_progress: 4,
  protected: 5,
  registered: 5,
  not_started: 6,
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify project ownership
  const { data: project } = await supabase
    .from('projects')
    .select('id')
    .eq('id', params.id)
    .eq('founder_id', session.user.id)
    .single()

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  // Get all protection items for this project
  const { data: items, error } = await supabase
    .from('protection_items')
    .select('*')
    .eq('project_id', params.id)
    .order('created_at', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ items })
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify project ownership
  const { data: project } = await supabase
    .from('projects')
    .select('id')
    .eq('id', params.id)
    .eq('founder_id', session.user.id)
    .single()

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  const body = await request.json()
  const { item_key, item_name, item_type, status, jurisdiction, notes, deadline } = body

  // Validate status
  if (status && !STATUS_PRIORITY[status]) {
    return NextResponse.json({ 
      error: 'Invalid status. Must be: critical, at_risk, pending, in_progress, protected, registered, not_started' 
    }, { status: 400 })
  }

  // Check if item already exists (by item_key or item_name)
  const { data: existing } = await supabase
    .from('protection_items')
    .select('id')
    .eq('project_id', params.id)
    .or(`item_type.eq.${item_key},item_name.ilike.%${item_name}%`)
    .single()

  let result
  if (existing) {
    // Update existing item
    const { data, error } = await supabase
      .from('protection_items')
      .update({
        status: status || 'not_started',
        notes: notes || null,
        jurisdiction: jurisdiction || null,
        deadline: deadline || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    result = data
  } else {
    // Create new item
    const { data, error } = await supabase
      .from('protection_items')
      .insert({
        project_id: params.id,
        item_name: item_name,
        item_type: item_type || item_key,
        status: status || 'not_started',
        jurisdiction: jurisdiction || null,
        notes: notes || null,
        deadline: deadline || null,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    result = data
  }

  return NextResponse.json({ item: result })
}

// Bulk update multiple items at once
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify project ownership
  const { data: project } = await supabase
    .from('projects')
    .select('id')
    .eq('id', params.id)
    .eq('founder_id', session.user.id)
    .single()

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  const body = await request.json()
  const { items } = body // Array of items to upsert

  if (!Array.isArray(items)) {
    return NextResponse.json({ error: 'Items must be an array' }, { status: 400 })
  }

  const results = []
  const errors = []

  for (const item of items) {
    const { item_key, item_name, item_type, status, jurisdiction, notes, deadline } = item

    // Check if exists
    const { data: existing } = await supabase
      .from('protection_items')
      .select('id')
      .eq('project_id', params.id)
      .or(`item_type.eq.${item_key},item_name.ilike.%${item_name}%`)
      .maybeSingle()

    if (existing) {
      const { data, error } = await supabase
        .from('protection_items')
        .update({
          status: status || 'not_started',
          notes: notes || null,
          jurisdiction: jurisdiction || null,
          deadline: deadline || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single()

      if (error) errors.push({ item_name, error: error.message })
      else results.push(data)
    } else {
      const { data, error } = await supabase
        .from('protection_items')
        .insert({
          project_id: params.id,
          item_name: item_name,
          item_type: item_type || item_key,
          status: status || 'not_started',
          jurisdiction: jurisdiction || null,
          notes: notes || null,
          deadline: deadline || null,
        })
        .select()
        .single()

      if (error) errors.push({ item_name, error: error.message })
      else results.push(data)
    }
  }

  return NextResponse.json({ 
    items: results, 
    errors: errors.length > 0 ? errors : undefined 
  })
}
