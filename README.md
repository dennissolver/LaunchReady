# LaunchReady Proactive IP Agent 🚀

A proactive AI agent that DOES the work, not just links to it. Think of it as an eager intern who comes back with "I already checked that for you!"

## What Makes It Proactive?

### ❌ Traditional Chatbot
```
User: "I need to check if my company name is available"
Bot: "Here are some links to check trademarks: [USPTO] [IP Australia]..."
```

### ✅ Proactive Agent
```
User: "My company is called Acme"
Agent: "I already ran the checks! Here's what I found:

🔍 TRADEMARK SEARCH
✅ "Acme" has LOW RISK - no exact matches in your category

🌐 DOMAIN AVAILABILITY  
✅ acme.io - Available! [Register Now]
❌ acme.com - Taken
✅ getacme.com - Available! [Register Now]

📱 SOCIAL HANDLES
✅ @acme available on: Twitter, TikTok, GitHub
❌ Taken on: Instagram, LinkedIn

📝 I also drafted an IP assignment template for any contractors.
Want me to check anything else?"
```

## Features

### 1. Automatic Research
When user mentions company/product name:
- Searches trademark databases
- Checks domain availability across TLDs
- Scans social media handle availability
- Reports everything together

### 2. Document Generation
Agent creates real, usable documents:
- IP Assignment Agreements
- NDA Templates (mutual & one-way)
- Trade Secret Policies
- Invention Disclosure Forms

### 3. Progress Tracking
- Saves to Supabase automatically
- Shows what's done, in-progress, and critical
- Agent knows context and suggests next steps

### 4. Proactive Personality
System prompt instructs Claude to:
- Take action without being asked
- Come back with results, not just links
- Suggest and offer next steps
- Be enthusiastic but not annoying

## Files Structure

```
app/
├── api/
│   └── agent/
│       └── chat/
│           └── route.ts      # Main agent API with tools
├── dashboard/
│   └── page.tsx              # Smart dashboard with agent
├── onboarding/
│   └── page.tsx              # Proactive onboarding flow
└── checklist/
    └── page.tsx              # IP checklist (from previous)

components/
└── ProactiveAgentChat.tsx    # Reusable agent chat component

lib/
└── agent-tools.ts            # Tool definitions & executors

supabase/
└── migrations/
    ├── create_ip_checklist_tables.sql
    └── add_company_info.sql
```

## Setup

### 1. Environment Variables

```bash
# .env.local
ANTHROPIC_API_KEY=sk-ant-xxx
NEXT_PUBLIC_SUPABASE_URL=xxx
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
```

### 2. Run Migrations

In Supabase SQL Editor, run:
- `create_ip_checklist_tables.sql`
- `add_company_info.sql`

### 3. Install Dependencies

```bash
npm install @anthropic-ai/sdk
```

### 4. Deploy

```bash
git add .
git commit -m "Add proactive IP agent"
git push
```

## How the Agent Works

### Tools Available

| Tool | What It Does |
|------|-------------|
| `check_domain_availability` | Checks DNS for domain availability across TLDs |
| `check_social_handles` | Checks if handles are taken on major platforms |
| `search_trademarks` | Searches USPTO for conflicts |
| `generate_ip_assignment` | Creates contractor IP agreement |
| `generate_nda` | Creates mutual or one-way NDA |
| `generate_trade_secret_policy` | Creates confidentiality policy |
| `generate_invention_disclosure` | Creates patent documentation form |
| `save_checklist_progress` | Updates user's progress in DB |

### Tool Loop

```
User Message
    ↓
Claude analyzes and decides to use tools
    ↓
Execute tools (domain check, trademark search, etc.)
    ↓
Return results to Claude
    ↓
Claude synthesizes and responds with actions taken
    ↓
Offer next steps proactively
```

## Personality Guidelines

The agent is instructed to:

1. **Be Proactive** - Don't wait to be asked
2. **Do the Work** - Use tools, don't just link
3. **Report Completely** - Give full results
4. **Suggest Next Steps** - Always offer to continue
5. **Be Enthusiastic** - Celebrate wins, encourage progress
6. **Know Limits** - Recommend attorneys for legal advice

## Extending

### Add New Tool

1. Add function to `lib/agent-tools.ts`
2. Add tool definition to `agentTools` array
3. Add case to `executeAgentTool` switch

Example:
```typescript
// In agent-tools.ts

export async function myNewTool(params: { ... }) {
  // Do something useful
  return results
}

// Add to agentTools array
{
  name: 'my_new_tool',
  description: 'Does something useful',
  input_schema: { ... }
}

// Add to executeAgentTool
case 'my_new_tool': {
  const result = await myNewTool(toolInput as MyParams)
  return formatResult(result)
}
```

## API Integrations to Add

For production, consider adding real API integrations:

- **Trademark**: USPTO API, TrademarkNow, Corsearch
- **Domains**: GoDaddy API, Namecheap API, Cloudflare
- **Social**: Buffer API for account creation
- **Documents**: DocuSign for e-signatures
- **Legal**: Connect to Clerky, Stripe Atlas, or law firm APIs

## License

MIT - Build something great! 🚀
