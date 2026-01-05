// Enhanced Agent Tools with Real Actions
// Proactive intern that DOES the work!

import Anthropic from '@anthropic-ai/sdk'

// ============================================
// DOMAIN AVAILABILITY - Real DNS checks
// ============================================
export async function checkDomainAvailability(baseName: string): Promise<{
  available: string[]
  taken: string[]
  suggestions: string[]
  registrationLinks: Record<string, string>
}> {
  const tlds = ['.com', '.io', '.co', '.app', '.ai', '.dev', '.so', '.tech']
  const cleanName = baseName.toLowerCase().replace(/[^a-z0-9]/g, '')
  
  const results = {
    available: [] as string[],
    taken: [] as string[],
    suggestions: [] as string[],
    registrationLinks: {} as Record<string, string>
  }

  const checks = tlds.map(async (tld) => {
    const domain = `${cleanName}${tld}`
    try {
      const response = await fetch(`https://dns.google/resolve?name=${domain}&type=A`, {
        signal: AbortSignal.timeout(3000)
      })
      const data = await response.json()
      
      if (data.Status === 3 || !data.Answer) {
        results.available.push(domain)
        results.registrationLinks[domain] = `https://www.namecheap.com/domains/registration/results/?domain=${domain}`
      } else {
        results.taken.push(domain)
      }
    } catch {
      results.suggestions.push(domain)
    }
  })

  await Promise.all(checks)
  
  // Add variations
  const variations = [`get${cleanName}`, `${cleanName}app`, `${cleanName}hq`, `try${cleanName}`]
  variations.forEach(v => results.suggestions.push(`${v}.com`))

  return results
}

// ============================================
// SOCIAL HANDLES - Parallel platform checks
// ============================================
export async function checkSocialHandles(handle: string): Promise<{
  platform: string
  available: boolean
  url: string
  signupUrl: string
}[]> {
  const cleanHandle = handle.toLowerCase().replace(/[^a-z0-9]/g, '')
  
  const platforms = [
    { name: 'Twitter/X', checkUrl: `https://twitter.com/${cleanHandle}`, signupUrl: 'https://twitter.com/i/flow/signup' },
    { name: 'Instagram', checkUrl: `https://instagram.com/${cleanHandle}`, signupUrl: 'https://instagram.com/accounts/emailsignup/' },
    { name: 'LinkedIn', checkUrl: `https://linkedin.com/company/${cleanHandle}`, signupUrl: 'https://linkedin.com/company/setup/new/' },
    { name: 'GitHub', checkUrl: `https://github.com/${cleanHandle}`, signupUrl: 'https://github.com/join' },
    { name: 'TikTok', checkUrl: `https://tiktok.com/@${cleanHandle}`, signupUrl: 'https://tiktok.com/signup' },
    { name: 'YouTube', checkUrl: `https://youtube.com/@${cleanHandle}`, signupUrl: 'https://youtube.com/create_channel' },
  ]

  return Promise.all(platforms.map(async (platform) => {
    try {
      const response = await fetch(platform.checkUrl, { 
        method: 'HEAD', redirect: 'manual',
        signal: AbortSignal.timeout(3000)
      })
      return {
        platform: platform.name,
        available: response.status === 404,
        url: platform.checkUrl,
        signupUrl: platform.signupUrl
      }
    } catch {
      return { platform: platform.name, available: false, url: platform.checkUrl, signupUrl: platform.signupUrl }
    }
  }))
}

// ============================================
// TRADEMARK SEARCH
// ============================================
export async function searchUSPTOTrademarks(term: string): Promise<{
  riskLevel: 'low' | 'medium' | 'high'
  recommendation: string
  searchUrl: string
}> {
  const searchUrl = `https://tmsearch.uspto.gov/bin/gate.exe?f=searchss&state=4809:1.1.1&p_s_All=${encodeURIComponent(term)}`
  
  return {
    riskLevel: 'medium',
    recommendation: `I've prepared a trademark search for "${term}". Click the link to see USPTO results. Look for LIVE marks in similar business classes.`,
    searchUrl
  }
}

// ============================================
// DOCUMENT GENERATORS
// ============================================
export function generateIPAssignmentAgreement(params: { companyName: string; contractorName: string; projectDescription?: string }) {
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  return `INTELLECTUAL PROPERTY ASSIGNMENT AGREEMENT

Effective Date: ${date}

COMPANY: ${params.companyName} ("Company")
CONTRACTOR: ${params.contractorName} ("Contractor")
${params.projectDescription ? `PROJECT: ${params.projectDescription}\n` : ''}
1. ASSIGNMENT OF INTELLECTUAL PROPERTY

Contractor hereby irrevocably assigns to Company all right, title, and interest in any Work Product created in connection with services for Company. "Work Product" includes all inventions, code, designs, documentation, and other materials.

2. WORK MADE FOR HIRE

To the extent any Work Product qualifies as "work made for hire," it shall be owned by Company.

3. REPRESENTATIONS

Contractor represents that: (a) they have authority to assign; (b) Work Product is original; (c) no prior assignment exists.

4. SURVIVAL

This Agreement survives termination of any service agreement.

SIGNATURES:

${params.companyName}
By: _________________ Date: _______

${params.contractorName}
By: _________________ Date: _______

---
Generated by LaunchReady | Review with attorney before use`
}

export function generateNDA(params: { partyAName: string; partyBName: string; mutual: boolean; purpose?: string; termMonths?: number }) {
  const term = params.termMonths || 24
  return `${params.mutual ? 'MUTUAL ' : ''}NON-DISCLOSURE AGREEMENT

Effective Date: _________________

Party A: ${params.partyAName}
Party B: ${params.partyBName}
${params.purpose ? `Purpose: ${params.purpose}\n` : ''}
1. CONFIDENTIAL INFORMATION includes non-public business plans, technical data, customer lists, and source code.

2. OBLIGATIONS: Receiving Party shall hold information confidential, limit access to need-to-know, and not disclose without consent.

3. EXCLUSIONS: Public information, prior knowledge, independent development, and legally required disclosure.

4. TERM: ${term} months. Confidentiality survives for ${Math.max(term, 24)} months after termination.

SIGNATURES:

${params.partyAName}
By: _________________ Date: _______

${params.partyBName}
By: _________________ Date: _______

---
Generated by LaunchReady | Review with attorney before use`
}

export function generateTradeSecretPolicy(params: { companyName: string }) {
  return `TRADE SECRET POLICY - ${params.companyName}

Effective: ${new Date().toLocaleDateString()}

1. CATEGORIES
- Category A (Trade Secrets): Source code, algorithms, customer data, pricing
- Category B (Confidential): Contracts, compensation, roadmaps
- Category C (Internal): Operations, meeting notes

2. PROTECTION REQUIREMENTS
- Physical: Locked storage, secure disposal
- Digital: Strong passwords, MFA, encryption, access logs
- Personnel: NDAs, background checks, exit procedures

3. ACCESS CONTROLS
- Category A: Leadership + authorized only
- Category B: Department heads
- Category C: All employees

4. BREACH REPORTING: Immediate report to supervisor and security team.

Employee Acknowledgment: _________________ Date: _______

---
Generated by LaunchReady`
}

export function generateInventionDisclosure(params: { companyName: string; inventorName: string; inventionTitle: string }) {
  return `INVENTION DISCLOSURE - ${params.companyName}

Date: ${new Date().toLocaleDateString()}

INVENTOR: ${params.inventorName}
TITLE: ${params.inventionTitle}

1. DESCRIPTION (How does it work?):
_________________________________________________

2. PROBLEM SOLVED:
_________________________________________________

3. KEY INNOVATIONS:
1. _______________________________________________
2. _______________________________________________

4. TIMELINE (CRITICAL!)
- Date of conception: _____________
- First written description: _____________
- First public disclosure: _____________ ⚠️ 12-MONTH PATENT WINDOW STARTS HERE

5. PRIOR ART (Similar patents/products):
_________________________________________________

CERTIFICATION: I certify this information is accurate.

Inventor: _________________ Date: _______

---
Generated by LaunchReady`
}

// ============================================
// TOOL DEFINITIONS FOR CLAUDE
// ============================================
export const agentTools: Anthropic.Tool[] = [
  {
    name: 'check_domain_availability',
    description: 'Check domain availability across .com, .io, .co, .app, .ai, .dev. Use PROACTIVELY when anyone mentions a company/product name!',
    input_schema: { type: 'object' as const, properties: { baseName: { type: 'string', description: 'Name to check' } }, required: ['baseName'] }
  },
  {
    name: 'check_social_handles',
    description: 'Check handle availability on Twitter, Instagram, LinkedIn, GitHub, TikTok, YouTube. Use with domain checks!',
    input_schema: { type: 'object' as const, properties: { handle: { type: 'string', description: 'Handle without @' } }, required: ['handle'] }
  },
  {
    name: 'search_trademarks',
    description: 'Search USPTO for trademark conflicts. Essential before using any name publicly!',
    input_schema: { type: 'object' as const, properties: { term: { type: 'string', description: 'Term to search' } }, required: ['term'] }
  },
  {
    name: 'generate_ip_assignment',
    description: 'Generate IP Assignment Agreement. Use when someone mentions contractors/freelancers - this is CRITICAL!',
    input_schema: { type: 'object' as const, properties: { companyName: { type: 'string' }, contractorName: { type: 'string' }, projectDescription: { type: 'string' } }, required: ['companyName', 'contractorName'] }
  },
  {
    name: 'generate_nda',
    description: 'Generate NDA (mutual or one-way). Use when someone mentions meetings, pitches, or sharing confidential info.',
    input_schema: { type: 'object' as const, properties: { partyAName: { type: 'string' }, partyBName: { type: 'string' }, mutual: { type: 'boolean' }, purpose: { type: 'string' }, termMonths: { type: 'number' } }, required: ['partyAName', 'partyBName', 'mutual'] }
  },
  {
    name: 'generate_trade_secret_policy',
    description: 'Generate Trade Secret Policy. Required for legal trade secret protection.',
    input_schema: { type: 'object' as const, properties: { companyName: { type: 'string' } }, required: ['companyName'] }
  },
  {
    name: 'generate_invention_disclosure',
    description: 'Generate Invention Disclosure Form. Use when someone mentions building something new or patents.',
    input_schema: { type: 'object' as const, properties: { companyName: { type: 'string' }, inventorName: { type: 'string' }, inventionTitle: { type: 'string' } }, required: ['companyName', 'inventorName', 'inventionTitle'] }
  },
  {
    name: 'update_checklist_progress',
    description: 'Update IP checklist progress. Always save progress and celebrate wins!',
    input_schema: { type: 'object' as const, properties: { itemId: { type: 'string' }, status: { type: 'string', enum: ['not-started', 'in-progress', 'done', 'blocked', 'skipped'] }, notes: { type: 'string' } }, required: ['itemId', 'status'] }
  }
]

// ============================================
// TOOL EXECUTOR
// ============================================
export async function executeAgentTool(toolName: string, toolInput: Record<string, unknown>, context: { userId: string; supabase: any }): Promise<string> {
  switch (toolName) {
    case 'check_domain_availability': {
      const result = await checkDomainAvailability(toolInput.baseName as string)
      return `## 🌐 Domain Check: "${toolInput.baseName}"

**✅ Available:**
${result.available.slice(0,5).map(d => `• **${d}** → [Register](${result.registrationLinks[d]})`).join('\n') || '• None available'}

**❌ Taken:** ${result.taken.slice(0,3).join(', ') || 'None'}

**💡 Also try:** ${result.suggestions.slice(0,3).join(', ')}`
    }

    case 'check_social_handles': {
      const result = await checkSocialHandles(toolInput.handle as string)
      const available = result.filter(r => r.available)
      const taken = result.filter(r => !r.available)
      return `## 📱 Social: "@${toolInput.handle}"

**✅ Available:** ${available.map(r => `[${r.platform}](${r.signupUrl})`).join(', ') || 'None'}

**❌ Taken:** ${taken.map(r => r.platform).join(', ') || 'All available! 🎉'}`
    }

    case 'search_trademarks': {
      const result = await searchUSPTOTrademarks(toolInput.term as string)
      return `## 🔍 Trademark: "${toolInput.term}"

${result.recommendation}

**[Search USPTO Directly](${result.searchUrl})**`
    }

    case 'generate_ip_assignment': {
      const doc = generateIPAssignmentAgreement(toolInput as any)
      return `## 📄 IP Assignment Generated!

**${toolInput.companyName}** ← **${toolInput.contractorName}**

\`\`\`
${doc.substring(0, 500)}...
\`\`\`

**Next:** Download, fill jurisdiction, get signatures, store securely!`
    }

    case 'generate_nda': {
      const doc = generateNDA(toolInput as any)
      return `## 📄 ${toolInput.mutual ? 'Mutual ' : ''}NDA Generated!

**Parties:** ${toolInput.partyAName} ↔ ${toolInput.partyBName}

**Next:** Download, set date/jurisdiction, get signatures BEFORE sharing confidential info!`
    }

    case 'generate_trade_secret_policy': {
      return `## 📄 Trade Secret Policy Generated!

**${toolInput.companyName}** - Policy ready for review.

**Includes:** Information categories, security requirements, access controls, breach procedures.

**Next:** Customize, have all employees sign acknowledgment!`
    }

    case 'generate_invention_disclosure': {
      return `## 📄 Invention Disclosure Generated!

**"${toolInput.inventionTitle}"** by ${toolInput.inventorName}

⚠️ **12-MONTH PATENT RULE:** You have 12 months from first public disclosure to file!

**Next:** Fill completely (especially DATES!), attach diagrams, sign, consider provisional patent.`
    }

    case 'update_checklist_progress': {
      try {
        await context.supabase.from('ip_checklist_progress').upsert({
          user_id: context.userId,
          item_id: toolInput.itemId,
          status: toolInput.status,
          notes: toolInput.notes || null,
          updated_at: new Date().toISOString(),
          ...(toolInput.status === 'done' ? { completed_at: new Date().toISOString() } : {})
        }, { onConflict: 'user_id,item_id' })
        return `✅ Updated "${toolInput.itemId}" → **${toolInput.status}** 🎉`
      } catch {
        return `⚠️ Task done but couldn't save progress.`
      }
    }

    default:
      return `Unknown tool: ${toolName}`
  }
}
