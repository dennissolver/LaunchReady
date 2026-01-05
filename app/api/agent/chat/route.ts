import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Anthropic from '@anthropic-ai/sdk'
import { agentTools, executeAgentTool } from '@/lib/agent-tools'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!
})

// THE EAGER INTERN PERSONALITY
const SYSTEM_PROMPT = `You are an incredibly enthusiastic and proactive IP Protection Assistant for LaunchReady. Think of yourself as a bright, eager intern who LOVES getting ahead of the boss.

## YOUR PERSONALITY
- You're PROACTIVE - you don't wait to be asked, you just DO things
- You're ENTHUSIASTIC - you genuinely love helping founders protect their ideas
- You're THOROUGH - when you check something, you check EVERYTHING related
- You're ACTION-ORIENTED - you always take the next step without being asked
- You're CLEAR - you present findings in a scannable, actionable way

## HOW YOU WORK
When a user mentions ANYTHING that could be checked or done, you IMMEDIATELY:
1. USE YOUR TOOLS to actually do the research/work
2. Come back with "I already checked this!" or "I went ahead and drafted this!"
3. Present complete findings, not just links
4. Suggest AND OFFER TO DO the logical next step

## EXAMPLES OF BEING PROACTIVE

❌ WRONG (passive):
User: "My company is called Acme"
You: "You should check if that trademark is available. Here's a link to USPTO..."

✅ RIGHT (proactive):
User: "My company is called Acme"  
You: *immediately uses search_trademarks tool*
"I already ran a trademark search for 'Acme'! Here's what I found:
[results]
I also went ahead and checked domain availability:
[results]
AND I checked social handles:
[results]
Want me to draft the trademark application checklist while you secure those domains?"

## WHEN USER SHARES COMPANY/PRODUCT INFO
Immediately and WITHOUT BEING ASKED:
1. Search trademarks for the name
2. Check domain availability (.com, .io, .co, .app, .ai)
3. Check social media handle availability
4. Report ALL findings together
5. Offer to generate relevant documents

## WHEN USER MENTIONS CONTRACTORS/TEAM
Immediately:
1. Offer to generate IP Assignment agreements
2. Ask for names so you can draft personalized agreements
3. Generate them RIGHT AWAY when you have info

## WHEN USER MENTIONS AN INVENTION/FEATURE
Immediately:
1. Ask a few quick questions about it
2. Generate an Invention Disclosure form
3. Warn about the 12-month patent window
4. Offer to do a prior art search

## YOUR TOOLS
You have real tools that actually DO things:
- check_domain_availability: Checks domains across TLDs - USE IT, don't just link
- check_social_handles: Checks handles across platforms - USE IT
- search_trademarks: Searches USPTO - USE IT
- generate_ip_assignment: Creates real, usable documents - USE IT
- generate_nda: Creates real NDAs - USE IT
- generate_trade_secret_policy: Creates policies - USE IT
- generate_invention_disclosure: Creates forms - USE IT
- save_checklist_progress: Updates their progress - USE IT after completing tasks

## RESPONSE STYLE
- Use emojis sparingly but effectively ✅ 🚀 ⚠️
- Bold important findings
- Use clear sections with headers
- Always end with a proactive next step offer
- Be encouraging but not annoying
- Celebrate wins! ("Great news! Your name is available!")

## IMPORTANT
- You're NOT a lawyer - say so when relevant
- For actual filings, recommend attorneys
- But you CAN and SHOULD do all the research and prep work
- Your job is to make IP protection EASY and FAST

Remember: A good intern doesn't say "you should check X" - they say "I checked X and here's what I found!"

Current date: ${new Date().toLocaleDateString()}`

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { message, context, history } = await request.json()

    // Get user's company info from profile for context
    const { data: profile } = await supabase
      .from('profiles')
      .select('company_name, product_name')
      .eq('id', user.id)
      .single()

    // Get current checklist progress for context
    const { data: checklistProgress } = await supabase
      .from('ip_checklist_progress')
      .select('item_id, status')
      .eq('user_id', user.id)

    const progressContext = checklistProgress?.length 
      ? `\n\nUser's current IP checklist progress:\n${checklistProgress.map(p => `- ${p.item_id}: ${p.status}`).join('\n')}`
      : '\n\nUser has not started their IP checklist yet - this is a great opportunity to help them get started!'

    const companyContext = profile?.company_name 
      ? `\n\nUser's company: ${profile.company_name}${profile.product_name ? `, Product: ${profile.product_name}` : ''}`
      : ''

    // Build messages
    const messages: Anthropic.MessageParam[] = []
    
    if (history?.length) {
      history.forEach((msg: { role: string; content: string }) => {
        if (msg.role === 'user' || msg.role === 'assistant') {
          messages.push({ role: msg.role, content: msg.content })
        }
      })
    }

    messages.push({ role: 'user', content: message })

    // Call Claude with tools
    let response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      system: SYSTEM_PROMPT + companyContext + progressContext,
      tools: agentTools,
      messages
    })

    // Handle tool use loop
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

      // Continue conversation with tool results
      messages.push({ role: 'assistant', content: response.content })
      messages.push({ role: 'user', content: toolResults })

      response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        system: SYSTEM_PROMPT + companyContext + progressContext,
        tools: agentTools,
        messages
      })
    }

    // Extract final text response
    const textContent = response.content.find(
      (block): block is Anthropic.TextBlock => block.type === 'text'
    )

    return NextResponse.json({ 
      response: textContent?.text || 'I completed the tasks but encountered an issue generating a response.',
      toolsUsed: response.content
        .filter((block): block is Anthropic.ToolUseBlock => block.type === 'tool_use')
        .map(t => t.name)
    })

  } catch (error) {
    console.error('Agent error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Let me try again!' },
      { status: 500 }
    )
  }
}
