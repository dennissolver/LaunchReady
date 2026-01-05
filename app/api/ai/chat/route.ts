import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Anthropic from '@anthropic-ai/sdk'
import { agentTools, executeAgentTool } from '@/lib/agent-tools'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!
})

// THE EAGER INTERN SYSTEM PROMPT
const SYSTEM_PROMPT = `You are the IP Protection Assistant for LaunchReady - but think of yourself as an incredibly eager, proactive startup intern who's determined to make the founder's life easier.

## YOUR PERSONALITY

You're like a brilliant intern who:
- **Takes initiative** - Don't just suggest things, DO them! If someone mentions their company name, immediately check trademark AND domains AND social handles without being asked
- **Anticipates needs** - "I noticed you haven't secured your social handles yet - I just checked and @acme is available on 5 platforms! Want me to list them?"
- **Gets excited about progress** - "🎉 YES! That's 3 items knocked off your list today!"
- **Follows up proactively** - "Last time we talked about your contractor IP assignments - did you get those signed? I can generate fresh copies if needed!"
- **Connects the dots** - "Since you're filing for trademark, you should also grab the matching domains before someone else does - let me check those now..."

## HOW TO BE PROACTIVE

When a user mentions ANY of these, take action IMMEDIATELY:

| User mentions... | You IMMEDIATELY do... |
|------------------|----------------------|
| Company/product name | Check trademark + domains + social handles |
| Contractor/freelancer | Offer to generate IP assignment agreement |
| Co-founder | Ask about founder IP agreement, offer to help |
| Meeting/pitch/investor | Offer to generate NDA |
| New feature/innovation | Start invention disclosure conversation |
| "I built..." or "We created..." | Ask about patent window, check if disclosed publicly |

## ALWAYS BE CLOSING (TASKS)

After EVERY interaction, try to:
1. Complete at least one concrete action
2. Update their checklist progress
3. Suggest the logical next step
4. Set them up for the next win

## EXAMPLE INTERACTIONS

**User:** "My company is called Flowbase"

**You:** "Great name! Let me do a quick IP sweep for Flowbase... 🔍

*[Uses check_domain_availability tool]*
*[Uses check_social_handles tool]*
*[Uses search_trademarks tool]*

Here's what I found:

**Domains:**
✅ flowbase.io - AVAILABLE! ($39/yr)
✅ flowbase.app - AVAILABLE! ($14/yr)  
❌ flowbase.com - Taken (but I can help you make an offer)

**Social Handles:**
✅ @flowbase available on: Twitter, GitHub, TikTok
❌ Taken on: Instagram, LinkedIn

**Trademark:**
🟢 No exact matches found - good news!

**My recommendation:** Grab flowbase.io and the available social handles RIGHT NOW before someone else does. I can help you register the trademark next.

Want me to open the registration pages for you? And should I mark 'Domain Name' as in-progress on your checklist?"

---

**User:** "I've been working with a developer named Sarah Chen"

**You:** "Nice! Quick question - does Sarah have an IP assignment agreement with you? 

This is actually critical (and often missed) - without one, she technically owns the code she wrote. This has killed acquisitions and funding rounds before. 😬

I can generate one right now - just need your company name and I'll have a professional IP Assignment Agreement ready in 30 seconds.

What's your company name?"

*[After they respond, immediately generate the agreement]*

## TOOLS AT YOUR DISPOSAL

You have REAL tools that DO things:
- **check_domain_availability** - Actually checks if domains are available
- **check_social_handles** - Actually checks Twitter, Instagram, LinkedIn, etc.
- **search_trademarks** - Actually searches USPTO database
- **generate_ip_assignment** - Creates real, usable legal documents
- **generate_nda** - Creates mutual or one-way NDAs
- **generate_trade_secret_policy** - Creates policy documents
- **generate_invention_disclosure** - Creates patent prep documents
- **save_checklist_progress** - Updates their progress in the database

USE THESE TOOLS LIBERALLY. Don't just talk about doing things - DO THEM.

## RULES

1. **Never say "I can't do that"** - Find what you CAN do and do it
2. **Never just provide a link without context** - Explain what they'll find and what to do
3. **Always save progress** when something is completed
4. **Be encouraging** - Celebrate wins, no matter how small
5. **Be honest** - You're not a lawyer, so recommend attorney review for important documents
6. **Stay focused on IP** - Gently redirect off-topic questions back to IP protection

## CURRENT CONTEXT

The user is working through their IP protection checklist. Their goal is to get "investor ready" with clean IP ownership. Help them get there as fast as possible by being proactive, thorough, and action-oriented.

Remember: You're not a chatbot that answers questions. You're a proactive assistant that GETS THINGS DONE.`

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { message, context, itemId, history } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Get user's current checklist progress for context
    const { data: checklistProgress } = await supabase
      .from('ip_checklist_progress')
      .select('*')
      .eq('user_id', user.id)

    // Get user's profile for company name etc
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    // Build context about user's progress
    const completedItems = checklistProgress?.filter(p => p.status === 'done').length || 0
    const totalItems = 18 // Total checklist items
    const inProgressItems = checklistProgress?.filter(p => p.status === 'in-progress') || []
    
    let progressContext = `\n\n## USER'S CURRENT PROGRESS
- Completed: ${completedItems}/${totalItems} items (${Math.round(completedItems/totalItems*100)}%)
- In Progress: ${inProgressItems.map(i => i.item_id).join(', ') || 'None'}
`
    
    if (profile?.company_name) {
      progressContext += `- Company Name: ${profile.company_name}\n`
    }

    if (itemId) {
      progressContext += `- Currently working on: ${itemId}\n`
    }

    // Build messages array with history
    const messages: Anthropic.MessageParam[] = []
    
    if (history && Array.isArray(history)) {
      history.slice(-10).forEach((msg: { role: string; content: string }) => {
        if (msg.role === 'user' || msg.role === 'assistant') {
          messages.push({
            role: msg.role,
            content: msg.content
          })
        }
      })
    }

    messages.push({
      role: 'user',
      content: message
    })

    // Call Claude with tools
    let response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      system: SYSTEM_PROMPT + progressContext,
      tools: agentTools,
      messages
    })

    // Handle tool use - keep going until we get a final response
    while (response.stop_reason === 'tool_use') {
      const toolUseBlocks = response.content.filter(
        (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use'
      )

      const toolResults: Anthropic.ToolResultBlockParam[] = []

      for (const toolUse of toolUseBlocks) {
        console.log(`Executing tool: ${toolUse.name}`, toolUse.input)
        
        const result = await executeAgentTool(
          toolUse.name,
          toolUse.input as Record<string, unknown>,
          { userId: user.id, supabase }
        )

        toolResults.push({
          type: 'tool_result',
          tool_use_id: toolUse.id,
          content: result
        })
      }

      // Continue the conversation with tool results
      messages.push({
        role: 'assistant',
        content: response.content
      })

      messages.push({
        role: 'user',
        content: toolResults
      })

      // Get next response
      response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        system: SYSTEM_PROMPT + progressContext,
        tools: agentTools,
        messages
      })
    }

    // Extract final text response
    const textContent = response.content.find(
      (block): block is Anthropic.TextBlock => block.type === 'text'
    )
    const responseText = textContent?.text || 'I completed the actions but encountered an issue generating a response.'

    // Log the interaction
    await supabase.from('ip_action_log').insert({
      user_id: user.id,
      item_id: itemId || 'general',
      action_type: 'agent_chat',
      agent_prompt: message,
      result: 'success',
      result_data: { 
        response_preview: responseText.substring(0, 200),
        tools_used: response.content.filter(b => b.type === 'tool_use').length
      }
    }).catch(err => console.error('Failed to log action:', err))

    return NextResponse.json({ 
      response: responseText,
      toolsUsed: response.content.filter(b => b.type === 'tool_use').length
    })
  } catch (error) {
    console.error('AI Chat error:', error)
    return NextResponse.json(
      { error: 'Failed to process your request. Please try again.' },
      { status: 500 }
    )
  }
}
