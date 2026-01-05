// IP Checklist Items with Actions
// Each item has: what the agent can do, what the user must do, and direct action links

export type ItemStatus = 'not-started' | 'in-progress' | 'done' | 'blocked' | 'skipped'

export interface ChecklistAction {
  type: 'link' | 'agent' | 'upload' | 'form'
  label: string
  description: string
  url?: string  // For external links
  agentPrompt?: string  // What to tell the agent to do
}

export interface ChecklistItem {
  id: string
  label: string
  description: string
  category: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  question: string  // Discovery question
  guidance: string  // Detailed explanation
  agentCanHelp: string[]  // What the AI can do
  userMustDo: string[]  // What requires human action
  actions: ChecklistAction[]
  evidenceType?: 'file' | 'url' | 'text' | 'date'  // How to prove completion
  estimatedTime?: string
  cost?: string
}

export interface ChecklistCategory {
  id: string
  title: string
  icon: string
  description: string
  items: ChecklistItem[]
}

export const checklistCategories: ChecklistCategory[] = [
  {
    id: 'brand',
    title: 'Brand & Trademarks',
    icon: 'Building2',
    description: 'Protect your company and product names',
    items: [
      {
        id: 'company-name-tm',
        label: 'Company Name Trademark',
        description: 'Register your company name as a trademark',
        category: 'brand',
        priority: 'critical',
        question: "Have you registered your company name as a trademark?",
        guidance: "A trademark protects your company name from being used by competitors. Without it, someone else could register your name and force you to rebrand.",
        agentCanHelp: [
          "Search trademark databases to check if your name is available",
          "Identify similar existing trademarks that might conflict",
          "Explain the registration process for your jurisdiction",
          "Generate a trademark application checklist",
          "Connect you with our trademark attorney partners"
        ],
        userMustDo: [
          "Decide which jurisdictions to register in",
          "Pay the registration fees",
          "Sign the application documents",
          "Respond to any office actions"
        ],
        actions: [
          {
            type: 'agent',
            label: 'Search Trademark Availability',
            description: 'I\'ll search USPTO, IP Australia, and EUIPO for your company name',
            agentPrompt: 'Search for trademark availability for my company name across major jurisdictions'
          },
          {
            type: 'link',
            label: 'USPTO (USA)',
            description: 'Search & file US trademarks',
            url: 'https://www.uspto.gov/trademarks'
          },
          {
            type: 'link',
            label: 'IP Australia',
            description: 'Search & file Australian trademarks',
            url: 'https://www.ipaustralia.gov.au/trade-marks'
          },
          {
            type: 'link',
            label: 'EUIPO (Europe)',
            description: 'Search & file EU trademarks',
            url: 'https://euipo.europa.eu/ohimportal/en/trade-marks'
          },
          {
            type: 'agent',
            label: 'Connect with Trademark Attorney',
            description: 'Get matched with a trademark specialist from our partner network',
            agentPrompt: 'Connect me with a trademark attorney to help file my company name trademark'
          }
        ],
        evidenceType: 'text',
        estimatedTime: '2-6 months',
        cost: '$250-$500 per jurisdiction'
      },
      {
        id: 'product-name-tm',
        label: 'Product Name Trademark',
        description: 'Register your product/app name as a trademark',
        category: 'brand',
        priority: 'high',
        question: "Have you trademarked your product or app name?",
        guidance: "Your product name is often more valuable than your company name. If you're building a SaaS, app, or consumer product, protect the name customers know you by.",
        agentCanHelp: [
          "Check if your product name is available as a trademark",
          "Identify potential conflicts with existing marks",
          "Suggest alternative names if conflicts exist",
          "Explain class categories for your product type"
        ],
        userMustDo: [
          "Choose which product names to prioritize",
          "Select trademark classes",
          "File the application",
          "Pay registration fees"
        ],
        actions: [
          {
            type: 'agent',
            label: 'Search Product Name',
            description: 'Check if your product name is available for trademark',
            agentPrompt: 'Search for trademark availability for my product name'
          },
          {
            type: 'agent',
            label: 'Suggest Trademark Classes',
            description: 'I\'ll recommend the right classes for your product type',
            agentPrompt: 'What trademark classes should I register my product under?'
          },
          {
            type: 'link',
            label: 'WIPO Nice Classification',
            description: 'Browse trademark classes',
            url: 'https://www.wipo.int/classifications/nice/en/'
          }
        ],
        evidenceType: 'text',
        estimatedTime: '2-6 months',
        cost: '$250-$500 per jurisdiction'
      },
      {
        id: 'logo-tm',
        label: 'Logo Trademark',
        description: 'Register your logo design as a trademark',
        category: 'brand',
        priority: 'medium',
        question: "Have you registered your logo as a trademark?",
        guidance: "Logo trademarks protect the visual identity of your brand. This is separate from your word marks (company/product names).",
        agentCanHelp: [
          "Check if similar logos are already trademarked",
          "Explain the difference between word marks and design marks",
          "Guide you through logo trademark requirements"
        ],
        userMustDo: [
          "Finalize your logo design",
          "Prepare high-resolution logo files",
          "File the design mark application"
        ],
        actions: [
          {
            type: 'agent',
            label: 'Check Logo Requirements',
            description: 'Learn what\'s needed for a logo trademark',
            agentPrompt: 'What are the requirements for trademarking my logo?'
          },
          {
            type: 'upload',
            label: 'Upload Logo Files',
            description: 'Upload your logo for our records'
          }
        ],
        evidenceType: 'file',
        estimatedTime: '2-6 months',
        cost: '$250-$500 per jurisdiction'
      },
      {
        id: 'domain',
        label: 'Domain Name',
        description: 'Secure primary domain and key variations',
        category: 'brand',
        priority: 'critical',
        question: "Have you secured your primary domain and key variations?",
        guidance: "Beyond your main .com, consider securing .io, .co, .app, and common misspellings. Domain squatters can hold your brand hostage.",
        agentCanHelp: [
          "Check domain availability across TLDs",
          "Identify which variations you should secure",
          "Find domains that might be squatting on your brand",
          "Suggest domain registrars with best prices"
        ],
        userMustDo: [
          "Purchase the domains",
          "Set up auto-renewal",
          "Configure DNS if needed"
        ],
        actions: [
          {
            type: 'agent',
            label: 'Check Domain Availability',
            description: 'I\'ll search for your domain across all major TLDs',
            agentPrompt: 'Check domain availability for my company/product name across .com, .io, .co, .app, .ai and common variations'
          },
          {
            type: 'link',
            label: 'Namecheap',
            description: 'Search & register domains',
            url: 'https://www.namecheap.com/'
          },
          {
            type: 'link',
            label: 'Cloudflare Registrar',
            description: 'At-cost domain registration',
            url: 'https://www.cloudflare.com/products/registrar/'
          },
          {
            type: 'link',
            label: 'Google Domains',
            description: 'Simple domain management',
            url: 'https://domains.google/'
          }
        ],
        evidenceType: 'url',
        estimatedTime: '10 minutes',
        cost: '$10-$50 per domain/year'
      },
      {
        id: 'social-handles',
        label: 'Social Media Handles',
        description: 'Secure consistent handles across platforms',
        category: 'brand',
        priority: 'high',
        question: "Have you secured consistent social media handles?",
        guidance: "Secure your brand name on major platforms even if you don't plan to use them immediately. Handle squatting is common.",
        agentCanHelp: [
          "Check handle availability across all major platforms",
          "Identify which platforms are most important for your industry",
          "Suggest alternative handles if your name is taken"
        ],
        userMustDo: [
          "Create accounts on each platform",
          "Set up basic profile information",
          "Enable 2FA on all accounts"
        ],
        actions: [
          {
            type: 'agent',
            label: 'Check Handle Availability',
            description: 'Search for your handle across all major platforms',
            agentPrompt: 'Check if my brand name is available as a handle on Twitter/X, Instagram, LinkedIn, TikTok, YouTube, Facebook, and GitHub'
          },
          {
            type: 'link',
            label: 'Namechk',
            description: 'Check username across 100+ platforms',
            url: 'https://namechk.com/'
          },
          {
            type: 'link',
            label: 'Twitter/X',
            description: 'Create Twitter account',
            url: 'https://twitter.com/i/flow/signup'
          },
          {
            type: 'link',
            label: 'LinkedIn',
            description: 'Create company page',
            url: 'https://www.linkedin.com/company/setup/new/'
          },
          {
            type: 'link',
            label: 'Instagram',
            description: 'Create Instagram account',
            url: 'https://www.instagram.com/accounts/emailsignup/'
          }
        ],
        evidenceType: 'url',
        estimatedTime: '30 minutes',
        cost: 'Free'
      }
    ]
  },
  {
    id: 'patents',
    title: 'Patents & Inventions',
    icon: 'Lightbulb',
    description: 'Protect your technical innovations',
    items: [
      {
        id: 'provisional-patent',
        label: 'Provisional Patent',
        description: 'File provisional patent for unique innovations',
        category: 'patents',
        priority: 'critical',
        question: "Have you filed a provisional patent for any unique innovations?",
        guidance: "A provisional patent gives you 12 months of 'patent pending' status while you develop your invention. It's cheaper than a full patent and establishes your priority date.",
        agentCanHelp: [
          "Identify what aspects of your product might be patentable",
          "Explain the provisional patent process",
          "Help you document your invention",
          "Generate an invention disclosure document",
          "Connect you with a patent attorney"
        ],
        userMustDo: [
          "Decide if your innovation is worth patenting",
          "Work with a patent attorney on claims",
          "File the provisional application",
          "File full patent within 12 months"
        ],
        actions: [
          {
            type: 'agent',
            label: 'Assess Patentability',
            description: 'I\'ll help identify what parts of your product might be patentable',
            agentPrompt: 'Help me assess what aspects of my product might be patentable'
          },
          {
            type: 'agent',
            label: 'Generate Invention Disclosure',
            description: 'Create a document describing your invention',
            agentPrompt: 'Help me create an invention disclosure document for my innovation'
          },
          {
            type: 'link',
            label: 'USPTO Patent Center',
            description: 'File US provisional patent',
            url: 'https://patentcenter.uspto.gov/'
          },
          {
            type: 'link',
            label: 'IP Australia Patents',
            description: 'File Australian provisional patent',
            url: 'https://www.ipaustralia.gov.au/patents'
          },
          {
            type: 'agent',
            label: 'Connect with Patent Attorney',
            description: 'Get matched with a patent specialist',
            agentPrompt: 'Connect me with a patent attorney to help file my provisional patent'
          }
        ],
        evidenceType: 'text',
        estimatedTime: '1-3 months to file',
        cost: '$1,500-$5,000 with attorney'
      },
      {
        id: 'prior-art',
        label: 'Prior Art Search',
        description: 'Search existing patents for conflicts',
        category: 'patents',
        priority: 'high',
        question: "Have you done a prior art search?",
        guidance: "Before filing a patent, you need to know what's already out there. A prior art search reveals existing patents that might conflict with or invalidate your claims.",
        agentCanHelp: [
          "Search patent databases for similar inventions",
          "Identify potential conflicts",
          "Explain what the existing patents cover",
          "Suggest ways to differentiate your invention"
        ],
        userMustDo: [
          "Review the search results",
          "Work with attorney to refine claims",
          "Decide whether to proceed with patent"
        ],
        actions: [
          {
            type: 'agent',
            label: 'Run Prior Art Search',
            description: 'I\'ll search patent databases for similar inventions',
            agentPrompt: 'Run a prior art search for my invention and identify potential conflicts'
          },
          {
            type: 'link',
            label: 'Google Patents',
            description: 'Free patent search',
            url: 'https://patents.google.com/'
          },
          {
            type: 'link',
            label: 'USPTO Patent Search',
            description: 'Official US patent database',
            url: 'https://ppubs.uspto.gov/pubwebapp/'
          },
          {
            type: 'link',
            label: 'Espacenet',
            description: 'European patent database',
            url: 'https://worldwide.espacenet.com/'
          }
        ],
        evidenceType: 'file',
        estimatedTime: '1-2 weeks',
        cost: 'Free (DIY) or $500-$2,000 (professional)'
      },
      {
        id: 'invention-disclosure',
        label: 'Invention Disclosure',
        description: 'Document all unique technical innovations',
        category: 'patents',
        priority: 'medium',
        question: "Have you documented your unique technical innovations?",
        guidance: "Even if you don't file a patent immediately, documenting your inventions with timestamps creates evidence of when you invented something. This can be crucial in disputes.",
        agentCanHelp: [
          "Create invention disclosure templates",
          "Help you articulate what makes your invention unique",
          "Timestamp and store your disclosures securely",
          "Identify inventions you might have overlooked"
        ],
        userMustDo: [
          "Describe your inventions in detail",
          "Sign and date disclosures",
          "Store securely with timestamps"
        ],
        actions: [
          {
            type: 'agent',
            label: 'Create Invention Disclosure',
            description: 'I\'ll help you document your invention properly',
            agentPrompt: 'Help me create an invention disclosure document. Ask me questions about my invention.'
          },
          {
            type: 'form',
            label: 'Invention Disclosure Form',
            description: 'Fill out our structured disclosure form'
          }
        ],
        evidenceType: 'file',
        estimatedTime: '1-2 hours per invention',
        cost: 'Free'
      }
    ]
  },
  {
    id: 'copyright',
    title: 'Copyright & Content',
    icon: 'FileText',
    description: 'Protect your code and creative works',
    items: [
      {
        id: 'source-code',
        label: 'Source Code Copyright',
        description: 'Register copyright for your codebase',
        category: 'copyright',
        priority: 'medium',
        question: "Have you registered copyright for your source code?",
        guidance: "Copyright exists automatically when you write code, but registration provides additional legal benefits including the ability to sue for statutory damages.",
        agentCanHelp: [
          "Explain copyright registration process",
          "Help prepare your code submission",
          "Identify what code to register",
          "Generate copyright notices"
        ],
        userMustDo: [
          "Decide what code to register",
          "Prepare code deposit",
          "File with copyright office",
          "Pay registration fee"
        ],
        actions: [
          {
            type: 'agent',
            label: 'Generate Copyright Notice',
            description: 'Create proper copyright notices for your code',
            agentPrompt: 'Generate appropriate copyright notices for my source code files'
          },
          {
            type: 'link',
            label: 'US Copyright Office',
            description: 'Register US copyright',
            url: 'https://www.copyright.gov/registration/'
          },
          {
            type: 'agent',
            label: 'Prepare Code Deposit',
            description: 'Help prepare your code for registration',
            agentPrompt: 'How do I prepare my source code for copyright registration?'
          }
        ],
        evidenceType: 'text',
        estimatedTime: '3-6 months',
        cost: '$45-$65 per registration'
      },
      {
        id: 'ui-ux',
        label: 'UI/UX Design Copyright',
        description: 'Protect your interface designs',
        category: 'copyright',
        priority: 'low',
        question: "Have you protected your UI/UX designs?",
        guidance: "Your interface designs can be protected by copyright. This covers the visual elements, not the underlying functionality.",
        agentCanHelp: [
          "Explain what UI elements can be protected",
          "Help document your designs",
          "Generate design registration checklist"
        ],
        userMustDo: [
          "Prepare design screenshots/files",
          "File copyright registration",
          "Pay registration fee"
        ],
        actions: [
          {
            type: 'agent',
            label: 'What Can Be Protected?',
            description: 'Learn what UI elements are protectable',
            agentPrompt: 'What aspects of my UI/UX design can be protected by copyright?'
          },
          {
            type: 'upload',
            label: 'Upload Design Files',
            description: 'Store your design files as evidence'
          }
        ],
        evidenceType: 'file',
        estimatedTime: '3-6 months',
        cost: '$45-$65 per registration'
      },
      {
        id: 'content',
        label: 'Content Copyright',
        description: 'Protect written content and documentation',
        category: 'copyright',
        priority: 'low',
        question: "Have you protected your written content?",
        guidance: "Blog posts, documentation, marketing copy, and other written content is automatically protected by copyright, but registration provides additional benefits.",
        agentCanHelp: [
          "Identify valuable content to protect",
          "Add copyright notices",
          "Track content creation dates"
        ],
        userMustDo: [
          "Decide what content to register",
          "File registration if desired"
        ],
        actions: [
          {
            type: 'agent',
            label: 'Add Copyright Notices',
            description: 'Generate copyright notices for your content',
            agentPrompt: 'Help me add appropriate copyright notices to my website and documentation'
          }
        ],
        evidenceType: 'text',
        estimatedTime: '3-6 months',
        cost: '$45-$65 per registration'
      }
    ]
  },
  {
    id: 'contracts',
    title: 'Contracts & Agreements',
    icon: 'Users',
    description: 'Secure IP ownership from contributors',
    items: [
      {
        id: 'contractor-ip',
        label: 'Contractor IP Assignment',
        description: 'Ensure all contractor work is assigned to you',
        category: 'contracts',
        priority: 'critical',
        question: "Do you have IP assignment agreements with all contractors?",
        guidance: "By default, contractors OWN the IP they create for you. Without a signed IP assignment, they could claim ownership of your code, designs, or content. This is a deal-killer for investors.",
        agentCanHelp: [
          "List all contractors who've worked on your project",
          "Generate IP assignment agreements",
          "Explain what should be in the agreement",
          "Track which contractors have signed"
        ],
        userMustDo: [
          "Identify all past and current contractors",
          "Get agreements signed by each contractor",
          "Store signed agreements securely"
        ],
        actions: [
          {
            type: 'agent',
            label: 'List My Contractors',
            description: 'I\'ll help you identify everyone who needs to sign',
            agentPrompt: 'Help me create a list of all contractors and freelancers who have worked on my project'
          },
          {
            type: 'agent',
            label: 'Generate IP Assignment',
            description: 'Create an IP assignment agreement template',
            agentPrompt: 'Generate an IP assignment agreement template for my contractors'
          },
          {
            type: 'link',
            label: 'DocuSign',
            description: 'Send agreements for e-signature',
            url: 'https://www.docusign.com/'
          },
          {
            type: 'agent',
            label: 'Track Signatures',
            description: 'Track which contractors have signed',
            agentPrompt: 'Help me track which contractors have signed IP assignment agreements'
          }
        ],
        evidenceType: 'file',
        estimatedTime: '1-2 weeks to collect',
        cost: 'Free (template) or $200-$500 (attorney review)'
      },
      {
        id: 'employee-ip',
        label: 'Employee IP Agreement',
        description: 'Have employees sign IP assignment agreements',
        category: 'contracts',
        priority: 'critical',
        question: "Have all employees signed IP assignment agreements?",
        guidance: "Employment contracts should include IP assignment clauses. In some jurisdictions, employee-created IP automatically belongs to the employer, but a signed agreement removes ambiguity.",
        agentCanHelp: [
          "Generate employee IP agreement templates",
          "Explain jurisdiction-specific requirements",
          "Track which employees have signed"
        ],
        userMustDo: [
          "Get agreements signed by all employees",
          "Include in new hire onboarding",
          "Store signed agreements securely"
        ],
        actions: [
          {
            type: 'agent',
            label: 'Generate Employee IP Agreement',
            description: 'Create an IP clause for employment contracts',
            agentPrompt: 'Generate an IP assignment clause for my employee contracts'
          },
          {
            type: 'agent',
            label: 'Check My Jurisdiction',
            description: 'Learn the rules for your location',
            agentPrompt: 'What are the employee IP ownership rules in my jurisdiction?'
          }
        ],
        evidenceType: 'file',
        estimatedTime: '1-2 weeks',
        cost: 'Free (template) or $200-$500 (attorney review)'
      },
      {
        id: 'cofounder-ip',
        label: 'Co-founder IP Agreement',
        description: 'Document IP ownership between founders',
        category: 'contracts',
        priority: 'critical',
        question: "Is IP ownership clearly documented between founders?",
        guidance: "If you have co-founders, you need a written agreement about who owns what IP, especially if one founder leaves. This should be in your founders agreement or shareholders agreement.",
        agentCanHelp: [
          "Explain key IP terms for founder agreements",
          "Generate discussion checklist",
          "Identify potential issues to address"
        ],
        userMustDo: [
          "Discuss IP ownership with co-founders",
          "Get agreement in writing",
          "Include in company formation docs"
        ],
        actions: [
          {
            type: 'agent',
            label: 'IP Discussion Checklist',
            description: 'Topics to cover with your co-founders',
            agentPrompt: 'Create a checklist of IP topics I need to discuss and agree on with my co-founders'
          },
          {
            type: 'link',
            label: 'Stripe Atlas',
            description: 'Company formation with legal docs',
            url: 'https://stripe.com/atlas'
          },
          {
            type: 'link',
            label: 'Clerky',
            description: 'Startup legal documents',
            url: 'https://www.clerky.com/'
          }
        ],
        evidenceType: 'file',
        estimatedTime: '1-2 weeks',
        cost: 'Free (DIY) or $1,000-$3,000 (attorney)'
      },
      {
        id: 'nda',
        label: 'NDA Templates',
        description: 'Have NDAs ready for sensitive discussions',
        category: 'contracts',
        priority: 'high',
        question: "Do you have NDA templates ready?",
        guidance: "Before discussing your product with potential partners, investors, or hires, have a non-disclosure agreement ready. Most investors won't sign NDAs, but partners and potential hires should.",
        agentCanHelp: [
          "Generate mutual and one-way NDA templates",
          "Explain when to use NDAs",
          "Customize NDAs for your situation"
        ],
        userMustDo: [
          "Decide when to use NDAs",
          "Have counterparties sign before disclosing",
          "Store signed NDAs"
        ],
        actions: [
          {
            type: 'agent',
            label: 'Generate NDA Template',
            description: 'Create a customized NDA template',
            agentPrompt: 'Generate an NDA template for my startup. I need both mutual and one-way versions.'
          },
          {
            type: 'agent',
            label: 'When to Use an NDA?',
            description: 'Learn when NDAs are appropriate',
            agentPrompt: 'When should I use an NDA and when is it not necessary or appropriate?'
          }
        ],
        evidenceType: 'file',
        estimatedTime: '1 hour',
        cost: 'Free (template) or $200-$500 (attorney review)'
      }
    ]
  },
  {
    id: 'secrets',
    title: 'Trade Secrets',
    icon: 'Lock',
    description: 'Protect confidential information',
    items: [
      {
        id: 'trade-secret-policy',
        label: 'Trade Secret Policy',
        description: 'Document what information is confidential',
        category: 'secrets',
        priority: 'high',
        question: "Do you have a documented trade secret policy?",
        guidance: "For information to qualify as a trade secret, you must take reasonable steps to keep it secret. A documented policy is evidence that you're treating the information as confidential.",
        agentCanHelp: [
          "Identify what qualifies as a trade secret",
          "Generate a trade secret policy",
          "Create confidential information categories",
          "Document your protection measures"
        ],
        userMustDo: [
          "Identify your trade secrets",
          "Implement the policy",
          "Train employees on the policy"
        ],
        actions: [
          {
            type: 'agent',
            label: 'Identify Trade Secrets',
            description: 'I\'ll help identify what should be protected',
            agentPrompt: 'Help me identify what information in my business qualifies as a trade secret'
          },
          {
            type: 'agent',
            label: 'Generate Trade Secret Policy',
            description: 'Create a policy document',
            agentPrompt: 'Generate a trade secret policy for my startup'
          }
        ],
        evidenceType: 'file',
        estimatedTime: '2-4 hours',
        cost: 'Free (DIY) or $500-$1,000 (attorney)'
      },
      {
        id: 'access-controls',
        label: 'Access Controls',
        description: 'Limit access to sensitive information',
        category: 'secrets',
        priority: 'high',
        question: "Do you have access controls for sensitive information?",
        guidance: "Trade secret protection requires limiting who can access the information. This means access controls on code repos, documents, and systems containing confidential information.",
        agentCanHelp: [
          "Audit current access controls",
          "Recommend access control improvements",
          "Generate access control checklist",
          "Review who has access to what"
        ],
        userMustDo: [
          "Implement access controls",
          "Regular access reviews",
          "Revoke access when people leave"
        ],
        actions: [
          {
            type: 'agent',
            label: 'Audit Access Controls',
            description: 'Review who has access to what',
            agentPrompt: 'Help me audit access controls for my sensitive information and code repositories'
          },
          {
            type: 'agent',
            label: 'Access Control Checklist',
            description: 'Get a checklist of controls to implement',
            agentPrompt: 'Create an access control checklist for protecting my trade secrets'
          },
          {
            type: 'link',
            label: 'GitHub Access Settings',
            description: 'Manage repo access',
            url: 'https://github.com/settings/repositories'
          }
        ],
        evidenceType: 'text',
        estimatedTime: '2-4 hours',
        cost: 'Free'
      }
    ]
  }
]

// Flatten all items for easy access
export const allChecklistItems = checklistCategories.flatMap(cat => cat.items)

// Get item by ID
export const getItemById = (id: string) => allChecklistItems.find(item => item.id === id)

// Get category by ID
export const getCategoryById = (id: string) => checklistCategories.find(cat => cat.id === id)
