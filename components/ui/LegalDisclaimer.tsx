'use client'

import { Info } from 'lucide-react'

interface LegalDisclaimerProps {
  variant?: 'footer' | 'banner' | 'inline'
  className?: string
}

export function LegalDisclaimer({ variant = 'footer', className = '' }: LegalDisclaimerProps) {
  const content = (
    <>
      <strong>Not legal advice.</strong> LaunchReady provides educational guidance and IP tracking tools only. 
      For legal advice, filings, and contracts, we connect you with our specialist legal partners.
    </>
  )

  if (variant === 'banner') {
    return (
      <div className={`bg-slate-100 border-b border-slate-200 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 py-2">
          <p className="text-xs text-slate-600 flex items-center justify-center gap-1.5">
            <Info className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{content}</span>
          </p>
        </div>
      </div>
    )
  }

  if (variant === 'inline') {
    return (
      <div className={`flex items-start gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg ${className}`}>
        <Info className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-slate-600">{content}</p>
      </div>
    )
  }

  // Default: footer variant
  return (
    <div className={`border-t border-slate-200 bg-slate-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 py-3">
        <p className="text-xs text-slate-500 text-center flex items-center justify-center gap-1.5">
          <Info className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{content}</span>
        </p>
      </div>
    </div>
  )
}

// Dark variant for landing page
export function LegalDisclaimerDark({ className = '' }: { className?: string }) {
  return (
    <div className={`border-t border-white/10 bg-slate-900/50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 py-3">
        <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-1.5">
          <Info className="w-3.5 h-3.5 flex-shrink-0" />
          <span>
            <strong className="text-gray-400">Not legal advice.</strong> LaunchReady provides educational guidance and IP tracking tools only. 
            For legal advice, filings, and contracts, we connect you with our specialist legal partners.
          </span>
        </p>
      </div>
    </div>
  )
}
