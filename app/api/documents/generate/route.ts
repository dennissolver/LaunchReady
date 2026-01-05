import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { 
  generateIPAssignmentAgreement,
  generateNDA,
  generateTradeSecretPolicy,
  generateInventionDisclosure
} from '@/lib/agent-tools'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { documentType, params } = await request.json()

    let content = ''
    let filename = ''

    switch (documentType) {
      case 'ip-assignment':
        content = generateIPAssignmentAgreement(params)
        filename = `IP_Assignment_${params.contractorName.replace(/\s+/g, '_')}_${Date.now()}.txt`
        break
        
      case 'nda':
        content = generateNDA(params)
        filename = `NDA_${params.partyBName.replace(/\s+/g, '_')}_${Date.now()}.txt`
        break
        
      case 'trade-secret-policy':
        content = generateTradeSecretPolicy(params)
        filename = `Trade_Secret_Policy_${Date.now()}.txt`
        break
        
      case 'invention-disclosure':
        content = generateInventionDisclosure(params)
        filename = `Invention_Disclosure_${params.inventionTitle.replace(/\s+/g, '_')}_${Date.now()}.txt`
        break
        
      default:
        return NextResponse.json({ error: 'Unknown document type' }, { status: 400 })
    }

    // Store document record in database
    await supabase.from('generated_documents').insert({
      user_id: user.id,
      document_type: documentType,
      filename,
      params: params,
      created_at: new Date().toISOString()
    }).catch(() => {}) // Don't fail if table doesn't exist yet

    // Log the action
    await supabase.from('ip_action_log').insert({
      user_id: user.id,
      item_id: documentType,
      action_type: 'document_generated',
      action_label: filename,
      result: 'success'
    }).catch(() => {})

    // Return the document content
    return new NextResponse(content, {
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Document generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate document' },
      { status: 500 }
    )
  }
}

// GET endpoint to preview document without downloading
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const type = searchParams.get('type')
  
  const templates = {
    'ip-assignment': {
      name: 'IP Assignment Agreement',
      description: 'Assigns intellectual property rights from contractors/employees to your company',
      requiredFields: ['companyName', 'contractorName'],
      optionalFields: ['projectDescription', 'effectiveDate']
    },
    'nda': {
      name: 'Non-Disclosure Agreement',
      description: 'Protects confidential information shared between parties',
      requiredFields: ['partyAName', 'partyBName', 'mutual'],
      optionalFields: ['purpose', 'termMonths']
    },
    'trade-secret-policy': {
      name: 'Trade Secret Policy',
      description: 'Documents your company\'s confidential information protection practices',
      requiredFields: ['companyName'],
      optionalFields: []
    },
    'invention-disclosure': {
      name: 'Invention Disclosure Form',
      description: 'Documents an invention for potential patent filing',
      requiredFields: ['companyName', 'inventorName', 'inventionTitle'],
      optionalFields: []
    }
  }

  if (type && templates[type as keyof typeof templates]) {
    return NextResponse.json(templates[type as keyof typeof templates])
  }

  return NextResponse.json({ templates })
}
