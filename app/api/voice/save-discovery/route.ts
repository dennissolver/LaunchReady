import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { NextRequest, NextResponse } from 'next/server'

// Parse conversation transcript to extract IP items and their status
function parseTranscriptFindings(transcript: string): Array<{
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
  
  const text = transcript.toLowerCase()
  
  // Brand & Trademarks
  if (text.includes('company name') || text.includes('business name')) {
    const status = text.includes('trademark') && (text.includes('registered') || text.includes('filed')) ? 'protected' : 
                   text.includes('critical') || text.includes('someone else') || text.includes('taken') ? 'critical' : 
                   text.includes('should') || text.includes('need to') ? 'at_risk' : 'not_started'
    findings.push({
      item_key: 'company_name_tm',
      item_name: 'Company Name Trademark',
      item_type: 'trademark',
      status,
    })
  }
  
  if (text.includes('product name') || text.includes('app name') || text.includes('brand name')) {
    const status = text.includes('registered') || text.includes('trademarked') ? 'protected' : 
                   text.includes('filed') || text.includes('pending') ? 'pending' :
                   text.includes('critical') || text.includes('urgent') ? 'critical' : 
                   text.includes('should') || text.includes('need') ? 'at_risk' : 'not_started'
    findings.push({
      item_key: 'product_name_tm',
      item_name: 'Product Name Trademark',
      item_type: 'trademark',
      status,
    })
  }
  
  if (text.includes('logo')) {
    const status = text.includes('registered') || text.includes('trademarked') ? 'protected' : 
                   text.includes('designed') || text.includes('have a logo') ? 'pending' : 
                   text.includes('need') ? 'at_risk' : 'not_started'
    findings.push({
      item_key: 'logo_tm',
      item_name: 'Logo Trademark',
      item_type: 'trademark',
      status,
    })
  }
  
  if (text.includes('domain')) {
    const status = text.includes('secured') || text.includes('registered') || text.includes('own') || text.includes('bought') ? 'protected' : 
                   text.includes('need') || text.includes('should') ? 'at_risk' : 'not_started'
    findings.push({
      item_key: 'domain',
      item_name: 'Domain Name',
      item_type: 'domain',
      status,
    })
  }

  if (text.includes('social') || text.includes('handle') || text.includes('instagram') || text.includes('twitter')) {
    const status = text.includes('secured') || text.includes('have') || text.includes('consistent') ? 'protected' : 
                   text.includes('need') || text.includes('should') ? 'at_risk' : 'not_started'
    findings.push({
      item_key: 'social_handles',
      item_name: 'Social Media Handles',
      item_type: 'social',
      status,
    })
  }
  
  // Patents
  if (text.includes('patent') || text.includes('algorithm') || text.includes('invention') || 
      text.includes('unique') || text.includes('novel') || text.includes('innovative')) {
    let status = 'not_started'
    let notes = undefined
    
    if (text.includes('filed') || text.includes('provisional')) {
      status = 'pending'
    } else if (text.includes('granted') || text.includes('patented')) {
      status = 'protected'
    } else if (text.includes('month') && (text.includes('window') || text.includes('deadline') || text.includes('left'))) {
      // Check for urgency in patent window
      const monthMatch = text.match(/(\d+)\s*month/)
      if (monthMatch) {
        const months = parseInt(monthMatch[1])
        if (months <= 3) {
          status = 'critical'
          notes = `Patent window: ${months} months remaining - ACT NOW`
        } else if (months <= 6) {
          status = 'at_risk'
          notes = `Patent window: ${months} months remaining`
        } else {
          status = 'pending'
          notes = `Patent window: ${months} months remaining`
        }
      } else {
        status = 'at_risk'
        notes = 'Patent deadline approaching'
      }
    } else if (text.includes('disclosed') || text.includes('public') || text.includes('launched')) {
      status = 'at_risk'
      notes = 'Public disclosure detected - check patent eligibility'
    } else if (text.includes('unique') || text.includes('novel') || text.includes('invented')) {
      status = 'at_risk'
      notes = 'Potential patentable innovation identified'
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
  if (text.includes('contractor') || text.includes('freelancer') || text.includes('outsource')) {
    const hasAssignment = text.includes('assignment') && (text.includes('signed') || text.includes('have') || text.includes('yes'))
    const noAssignment = text.includes('no') && text.includes('assignment') || 
                         text.includes('didn\'t') || text.includes('don\'t have') ||
                         text.includes('never signed')
    
    const status = hasAssignment ? 'protected' :
                   noAssignment ? 'critical' : 'at_risk'
    
    findings.push({
      item_key: 'contractor_ip',
      item_name: 'Contractor IP Assignment',
      item_type: 'contract',
      status,
      notes: status === 'critical' ? 'URGENT: Missing IP assignments from contractors' : undefined,
    })
  }
  
  if (text.includes('employee')) {
    const status = text.includes('agreement') && (text.includes('sign') || text.includes('have')) ? 'protected' : 
                   text.includes('no agreement') || text.includes('don\'t') ? 'at_risk' : 'not_started'
    findings.push({
      item_key: 'employee_ip',
      item_name: 'Employee IP Agreement',
      item_type: 'contract',
      status,
    })
  }
  
  if (text.includes('co-founder') || text.includes('cofounder') || text.includes('partner') || text.includes('founder agreement')) {
    const hasAgreement = text.includes('agreement') && (text.includes('have') || text.includes('signed') || text.includes('yes'))
    const noAgreement = text.includes('no agreement') || text.includes('don\'t have') || text.includes('haven\'t')
    
    const status = hasAgreement ? 'protected' :
                   noAgreement ? 'critical' : 'at_risk'
    findings.push({
      item_key: 'cofounder_ip',
      item_name: 'Co-founder IP Agreement',
      item_type: 'contract',
      status,
      notes: status === 'critical' ? 'URGENT: No founder agreement in place' : undefined,
    })
  }
  
  if (text.includes('nda') || text.includes('non-disclosure') || text.includes('confidential')) {
    const status = text.includes('have') || text.includes('use') || text.includes('signed') || text.includes('yes') ? 'protected' : 
                   text.includes('no') || text.includes('don\'t') ? 'at_risk' : 'not_started'
    findings.push({
      item_key: 'nda',
      item_name: 'NDA Templates',
      item_type: 'contract',
      status,
    })
  }
  
  // Open source / Code
  if (text.includes('open source') || text.includes('gpl') || text.includes('license') || text.includes('mit') || text.includes('apache')) {
    const status = text.includes('gpl') && (text.includes('proprietary') || text.includes('commercial')) ? 'critical' :
                   text.includes('mit') || text.includes('apache') || text.includes('permissive') ? 'protected' : 
                   text.includes('not sure') || text.includes('don\'t know') ? 'at_risk' : 'pending'
    findings.push({
      item_key: 'code_copyright',
      item_name: 'Source Code Copyright',
      item_type: 'copyright',
      status,
      notes: text.includes('gpl') ? 'GPL license detected - review compatibility' : undefined,
    })
  }
  
  // Trade secrets
  if (text.includes('trade secret') || text.includes('confidential') || text.includes('secret sauce') || text.includes('proprietary')) {
    const status = text.includes('policy') || text.includes('protected') || text.includes('secure') ? 'protected' : 
                   text.includes('should') || text.includes('need') ? 'at_risk' : 'not_started'
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
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  try {
    // Verify user is authenticated
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { project_id, transcript, metadata } = body

    if (!project_id || !transcript) {
      return NextResponse.json({ error: 'Missing project_id or transcript' }, { status: 400 })
    }

    // Verify project ownership
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', project_id)
      .eq('founder_id', session.user.id)
      .single()

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Parse the transcript to extract findings
    const findings = parseTranscriptFindings(transcript)

    if (findings.length === 0) {
      // No specific findings, but still log the discovery session
      await supabase
        .from('evidence_events')
        .insert({
          project_id,
          event_type: 'voice_discovery',
          event_title: 'Voice IP Discovery Session',
          event_description: 'Completed voice discovery session - no specific items identified',
          event_timestamp: new Date().toISOString(),
          metadata: {
            transcript_length: transcript.length,
            ...metadata,
          },
        })

      return NextResponse.json({ 
        success: true, 
        message: 'Discovery session recorded',
        items_updated: 0,
      })
    }

    // Save/update each finding
    const results = []
    const statusPriority: Record<string, number> = {
      critical: 1, at_risk: 2, pending: 3, in_progress: 4, protected: 5, registered: 5, not_started: 6
    }

    for (const finding of findings) {
      // Check if item exists
      const { data: existing } = await supabase
        .from('protection_items')
        .select('id, status')
        .eq('project_id', project_id)
        .eq('item_type', finding.item_key)
        .maybeSingle()

      if (existing) {
        // Only update if new status is more urgent (lower priority number)
        const currentPriority = statusPriority[existing.status] || 6
        const newPriority = statusPriority[finding.status] || 6
        
        if (newPriority < currentPriority) {
          const { data, error } = await supabase
            .from('protection_items')
            .update({
              status: finding.status,
              notes: finding.notes || null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existing.id)
            .select()
            .single()

          if (!error && data) results.push(data)
        } else {
          results.push(existing) // Item exists but not updated
        }
      } else {
        // Create new item
        const { data, error } = await supabase
          .from('protection_items')
          .insert({
            project_id,
            item_name: finding.item_name,
            item_type: finding.item_key,
            status: finding.status,
            notes: finding.notes || null,
          })
          .select()
          .single()

        if (!error && data) results.push(data)
      }
    }

    // Log the discovery session as evidence
    await supabase
      .from('evidence_events')
      .insert({
        project_id,
        event_type: 'voice_discovery',
        event_title: 'Voice IP Discovery Session',
        event_description: `Completed voice discovery - identified ${results.length} IP items`,
        event_timestamp: new Date().toISOString(),
        metadata: {
          findings_count: results.length,
          findings_summary: findings.map(f => ({ item: f.item_name, status: f.status })),
          ...metadata,
        },
      })

    // Mark project discovery as completed
    await supabase
      .from('projects')
      .update({ 
        discovery_completed: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', project_id)

    return NextResponse.json({ 
      success: true, 
      items_updated: results.length,
      findings: results.map(r => ({ id: r.id, name: r.item_name, status: r.status })),
    })

  } catch (error) {
    console.error('Save discovery error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
