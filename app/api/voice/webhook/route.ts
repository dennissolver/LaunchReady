import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Initialize Supabase with service role for webhook (no user session)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Map agent assessment to status
function parseStatus(assessment: string): string {
  const lower = assessment.toLowerCase()
  
  if (lower.includes('critical') || lower.includes('urgent') || lower.includes('immediately')) {
    return 'critical'
  }
  if (lower.includes('at risk') || lower.includes('at-risk') || lower.includes('missing') || lower.includes('needed')) {
    return 'at_risk'
  }
  if (lower.includes('in progress') || lower.includes('pending') || lower.includes('filed') || lower.includes('started')) {
    return 'pending'
  }
  if (lower.includes('protected') || lower.includes('registered') || lower.includes('complete') || lower.includes('done') || lower.includes('good')) {
    return 'protected'
  }
  
  return 'not_started'
}

// Parse conversation transcript or summary to extract IP items
function parseConversationFindings(transcript: string, summary?: string): Array<{
  item_key: string
  item_name: string
  item_type: string
  status: string
  notes?: string
}> {
  const findings: Array<{
    item_key: string
    item_name: string
    item_type: string
    status: string
    notes?: string
  }> = []
  
  const text = (summary || transcript).toLowerCase()
  
  // Brand & Trademarks
  if (text.includes('company name') || text.includes('trademark')) {
    const status = text.includes('registered') ? 'protected' : 
                   text.includes('filed') ? 'pending' :
                   text.includes('critical') || text.includes('someone else') ? 'critical' : 'at_risk'
    findings.push({
      item_key: 'company_name_tm',
      item_name: 'Company Name Trademark',
      item_type: 'trademark',
      status,
    })
  }
  
  if (text.includes('product name') || text.includes('app name')) {
    const status = text.includes('registered') ? 'protected' : 
                   text.includes('filed') ? 'pending' :
                   text.includes('critical') ? 'critical' : 'at_risk'
    findings.push({
      item_key: 'product_name_tm',
      item_name: 'Product Name Trademark',
      item_type: 'trademark',
      status,
    })
  }
  
  if (text.includes('logo')) {
    const status = text.includes('registered') || text.includes('trademarked') ? 'protected' : 
                   text.includes('designed') ? 'pending' : 'at_risk'
    findings.push({
      item_key: 'logo_tm',
      item_name: 'Logo Trademark',
      item_type: 'trademark',
      status,
    })
  }
  
  if (text.includes('domain')) {
    const status = text.includes('secured') || text.includes('registered') || text.includes('own') ? 'protected' : 'at_risk'
    findings.push({
      item_key: 'domain',
      item_name: 'Domain Name',
      item_type: 'domain',
      status,
    })
  }
  
  // Patents
  if (text.includes('patent') || text.includes('algorithm') || text.includes('invention') || text.includes('unique') || text.includes('novel')) {
    let status = 'not_started'
    let notes = undefined
    
    if (text.includes('filed') || text.includes('provisional')) {
      status = 'pending'
    } else if (text.includes('granted') || text.includes('patented')) {
      status = 'protected'
    } else if (text.includes('12 month') || text.includes('window') || text.includes('deadline') || text.includes('urgent') || text.includes('critical')) {
      status = 'critical'
      // Try to extract deadline info
      const monthMatch = text.match(/(\d+)\s*month/)
      if (monthMatch) {
        notes = `Patent window: ${monthMatch[1]} months remaining`
      }
    } else if (text.includes('disclosed') || text.includes('public')) {
      status = 'at_risk'
      notes = 'Public disclosure detected - check patent eligibility'
    }
    
    findings.push({
      item_key: 'provisional_patent',
      item_name: 'Provisional Patent',
      item_type: 'patent',
      status,
      notes,
    })
  }
  
  // Copyright & Code
  if (text.includes('contractor') || text.includes('freelancer')) {
    const status = text.includes('assignment') && (text.includes('signed') || text.includes('have')) ? 'protected' :
                   text.includes('critical') || text.includes('own') ? 'critical' : 'at_risk'
    findings.push({
      item_key: 'contractor_ip',
      item_name: 'Contractor IP Assignment',
      item_type: 'contract',
      status,
      notes: status === 'critical' ? 'Missing IP assignments from contractors' : undefined,
    })
  }
  
  if (text.includes('employee')) {
    const status = text.includes('agreement') && text.includes('sign') ? 'protected' : 'at_risk'
    findings.push({
      item_key: 'employee_ip',
      item_name: 'Employee IP Agreement',
      item_type: 'contract',
      status,
    })
  }
  
  if (text.includes('co-founder') || text.includes('cofounder') || text.includes('founder agreement')) {
    const status = text.includes('agreement') && (text.includes('have') || text.includes('signed')) ? 'protected' :
                   text.includes('no agreement') || text.includes('missing') ? 'critical' : 'at_risk'
    findings.push({
      item_key: 'cofounder_ip',
      item_name: 'Co-founder IP Agreement',
      item_type: 'contract',
      status,
    })
  }
  
  if (text.includes('nda') || text.includes('non-disclosure')) {
    const status = text.includes('have') || text.includes('use') || text.includes('signed') ? 'protected' : 'at_risk'
    findings.push({
      item_key: 'nda',
      item_name: 'NDA Templates',
      item_type: 'contract',
      status,
    })
  }
  
  // Open source
  if (text.includes('open source') || text.includes('gpl') || text.includes('license')) {
    const status = text.includes('gpl') && text.includes('proprietary') ? 'critical' :
                   text.includes('mit') || text.includes('apache') ? 'protected' : 'pending'
    findings.push({
      item_key: 'code_copyright',
      item_name: 'Source Code Copyright',
      item_type: 'copyright',
      status,
      notes: text.includes('gpl') ? 'GPL license detected - review compatibility' : undefined,
    })
  }
  
  // Trade secrets
  if (text.includes('trade secret') || text.includes('confidential') || text.includes('secret sauce')) {
    const status = text.includes('policy') || text.includes('protected') ? 'protected' : 'at_risk'
    findings.push({
      item_key: 'trade_secret_policy',
      item_name: 'Trade Secret Policy',
      item_type: 'trade_secret',
      status,
    })
  }
  
  return findings
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // ElevenLabs webhook payload structure
    const {
      conversation_id,
      agent_id,
      metadata,
      transcript,
      summary,
      status: conversationStatus,
    } = body
    
    // Get project ID from metadata
    const projectId = metadata?.project_id
    
    if (!projectId) {
      // If no project ID, just log and return success
      console.log('Voice webhook received without project ID:', conversation_id)
      return NextResponse.json({ success: true, message: 'No project ID provided' })
    }
    
    // Verify project exists
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, founder_id')
      .eq('id', projectId)
      .single()
    
    if (projectError || !project) {
      console.error('Project not found:', projectId)
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }
    
    // Parse the conversation to extract findings
    const findings = parseConversationFindings(transcript || '', summary)
    
    if (findings.length === 0) {
      console.log('No IP items found in conversation:', conversation_id)
      return NextResponse.json({ success: true, message: 'No findings to save' })
    }
    
    // Save/update each finding
    const results = []
    for (const finding of findings) {
      // Check if item exists
      const { data: existing } = await supabase
        .from('protection_items')
        .select('id, status')
        .eq('project_id', projectId)
        .eq('item_type', finding.item_key)
        .maybeSingle()
      
      if (existing) {
        // Only update if new status is more urgent
        const statusPriority: Record<string, number> = {
          critical: 1, at_risk: 2, pending: 3, protected: 5, not_started: 6
        }
        
        if (statusPriority[finding.status] < statusPriority[existing.status]) {
          const { data, error } = await supabase
            .from('protection_items')
            .update({
              status: finding.status,
              notes: finding.notes,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existing.id)
            .select()
            .single()
          
          if (!error) results.push(data)
        }
      } else {
        // Create new item
        const { data, error } = await supabase
          .from('protection_items')
          .insert({
            project_id: projectId,
            item_name: finding.item_name,
            item_type: finding.item_key,
            status: finding.status,
            notes: finding.notes,
          })
          .select()
          .single()
        
        if (!error) results.push(data)
      }
    }
    
    // Log the conversation for reference
    await supabase
      .from('evidence_events')
      .insert({
        project_id: projectId,
        event_type: 'voice_discovery',
        event_title: 'Voice IP Discovery Session',
        event_description: summary || 'Completed voice discovery session',
        event_timestamp: new Date().toISOString(),
        metadata: {
          conversation_id,
          agent_id,
          findings_count: results.length,
        },
      })
    
    // Update project to mark discovery as completed
    await supabase
      .from('projects')
      .update({ 
        discovery_completed: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId)
    
    return NextResponse.json({ 
      success: true, 
      items_updated: results.length,
      findings: results,
    })
    
  } catch (error) {
    console.error('Voice webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Also support GET for webhook verification
export async function GET(request: NextRequest) {
  return NextResponse.json({ status: 'Voice webhook endpoint active' })
}
