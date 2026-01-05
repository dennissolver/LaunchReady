import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { 
  checkDomainAvailability, 
  checkSocialHandles, 
  searchUSPTOTrademarks 
} from '@/lib/agent-tools'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { companyName, productName } = await request.json()
    
    if (!companyName) {
      return NextResponse.json({ error: 'Company name required' }, { status: 400 })
    }

    const baseName = companyName.toLowerCase().replace(/[^a-z0-9]/g, '')

    // Run all checks in parallel for speed! 🚀
    const [domainResults, socialResults, trademarkResults] = await Promise.all([
      checkDomainAvailability(baseName),
      checkSocialHandles(baseName),
      searchUSPTOTrademarks(companyName)
    ])

    // Save company name to profile
    await supabase
      .from('profiles')
      .update({ company_name: companyName })
      .eq('id', user.id)

    // Auto-populate checklist progress based on scan
    const checklistUpdates = []

    // If domains are available, mark as "needs action" (in-progress)
    if (domainResults.available.length > 0) {
      checklistUpdates.push({
        user_id: user.id,
        item_id: 'domain',
        status: 'in-progress',
        notes: `Found ${domainResults.available.length} available domains: ${domainResults.available.slice(0, 3).join(', ')}`,
        started_at: new Date().toISOString()
      })
    }

    // Same for social handles
    const availableSocial = socialResults.filter(s => s.available)
    if (availableSocial.length > 0) {
      checklistUpdates.push({
        user_id: user.id,
        item_id: 'social-handles',
        status: 'in-progress',
        notes: `Available on: ${availableSocial.map(s => s.platform).join(', ')}`,
        started_at: new Date().toISOString()
      })
    }

    // Trademark status
    checklistUpdates.push({
      user_id: user.id,
      item_id: 'company-name-tm',
      status: 'in-progress',
      notes: `Trademark risk: ${trademarkResults.riskLevel}. ${trademarkResults.recommendation}`,
      started_at: new Date().toISOString()
    })

    // Batch insert checklist progress
    if (checklistUpdates.length > 0) {
      await supabase
        .from('ip_checklist_progress')
        .upsert(checklistUpdates, { onConflict: 'user_id,item_id' })
    }

    // Create discovery session record
    await supabase
      .from('ip_discovery_sessions')
      .insert({
        user_id: user.id,
        status: 'completed',
        total_items: 18,
        items_done: 0,
        items_not_done: 0,
        items_unsure: 0,
        completed_at: new Date().toISOString()
      })

    // Generate the response
    const availableDomains = domainResults.available.slice(0, 5)
    const takenDomains = domainResults.taken.slice(0, 3)
    const availableHandles = socialResults.filter(s => s.available)
    const takenHandles = socialResults.filter(s => !s.available)

    let response = `## 🎯 IP Scan Complete for "${companyName}"

I just ran comprehensive checks across trademark databases, domain registrars, and social media platforms. Here's what I found:

---

### 🔍 Trademark Status: ${trademarkResults.riskLevel === 'low' ? '🟢 CLEAR' : trademarkResults.riskLevel === 'medium' ? '🟡 CAUTION' : '🔴 RISK'}

${trademarkResults.recommendation}

---

### 🌐 Domain Availability

**✅ Available Now** (grab these!)
${availableDomains.length > 0 
  ? availableDomains.map(d => `- **${d}** → [Register](https://www.namecheap.com/domains/registration/results/?domain=${d})`).join('\n')
  : '- None of the primary domains are available 😔'}

${takenDomains.length > 0 ? `**❌ Already Taken**
${takenDomains.map(d => `- ${d}`).join('\n')}` : ''}

---

### 📱 Social Media Handles

**✅ @${baseName} is available on:**
${availableHandles.length > 0 
  ? availableHandles.map(s => `- **${s.platform}** → [Create Account](${s.signupUrl})`).join('\n')
  : '- No platforms available 😔'}

${takenHandles.length > 0 ? `**❌ Already taken on:**
${takenHandles.map(s => `- ${s.platform}`).join('\n')}` : ''}

---

### 🚀 My Recommendations

Based on this scan, here's what I suggest doing **right now**:

${availableDomains.length > 0 ? `1. **Grab your domains immediately** - ${availableDomains[0]} ${availableDomains.length > 1 ? `and ${availableDomains[1]}` : ''} are available but could be taken any moment!` : '1. **Consider domain alternatives** - your primary name is taken'}

${availableHandles.length > 0 ? `2. **Secure social handles** - Create placeholder accounts on ${availableHandles.slice(0, 3).map(s => s.platform).join(', ')} before someone else does` : '2. **Research handle alternatives** - try variations like @get${baseName} or @${baseName}hq'}

${trademarkResults.riskLevel === 'low' ? `3. **File your trademark** - The name looks clear! I can help you start the trademark application process` : `3. **Review trademark conflicts** - Let's discuss the potential issues before you proceed`}

---

I've added these findings to your IP checklist. Want to continue securing your startup's IP? 

Click **Continue to Full Checklist** to work through all 18 protection areas with my help!`

    return NextResponse.json({
      response,
      results: {
        domains: domainResults,
        social: socialResults,
        trademark: trademarkResults
      }
    })
  } catch (error) {
    console.error('Onboarding scan error:', error)
    return NextResponse.json(
      { error: 'Scan failed. Please try again.' },
      { status: 500 }
    )
  }
}
