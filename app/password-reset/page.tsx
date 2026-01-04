'use client'

import { useState } from 'react'
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react'

export default function PasswordReset() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-5 relative overflow-hidden">
      {/* Ambient glow effects */}
      <div className="absolute -top-1/4 -left-1/4 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-1/4 -right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Decorative line */}
        <div className="w-16 h-px bg-gradient-to-r from-transparent via-violet-500 to-transparent mx-auto mb-10 opacity-60" />

        <div className="glass bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-12 shadow-2xl shadow-black/20">
          {!submitted ? (
            <>
              <h1 className="text-3xl font-semibold text-white text-center mb-3 tracking-tight">
                Reset Password
              </h1>

              <p className="text-slate-400 text-center mb-10 text-sm leading-relaxed">
                Enter your email address and we'll send you a secure link to reset your password.
              </p>

              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label className="block text-xs font-medium text-violet-400 uppercase tracking-widest mb-3">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="w-full px-5 py-4 text-base text-white bg-slate-800/50 border border-slate-700/50 rounded-lg outline-none transition-all duration-300 placeholder:text-slate-500 focus:border-violet-500/50 focus:bg-slate-800/80 focus:ring-2 focus:ring-violet-500/20"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 px-6 text-sm font-semibold uppercase tracking-widest text-white bg-gradient-to-r from-violet-600 to-purple-600 rounded-lg transition-all duration-300 hover:from-violet-500 hover:to-purple-500 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-500/25 disabled:opacity-70 disabled:cursor-wait disabled:hover:translate-y-0"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </span>
                  ) : 'Send Reset Link'}
                </button>
              </form>

              <div className="mt-10 pt-8 border-t border-slate-700/50 text-center">
                <a
                  href="/login"
                  className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-violet-400 transition-colors duration-200"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Sign In
                </a>
              </div>
            </>
          ) : (
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-8 bg-gradient-to-br from-violet-500/20 to-purple-500/10 rounded-full flex items-center justify-center border border-violet-500/20">
                <Mail className="w-9 h-9 text-violet-400" />
              </div>

              <h2 className="text-2xl font-semibold text-white mb-4 tracking-tight">
                Check Your Email
              </h2>

              <p className="text-slate-400 text-sm mb-2 leading-relaxed">
                We've sent a password reset link to
              </p>
              <p className="text-violet-400 font-medium mb-8">
                {email}
              </p>

              <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                Didn't receive the email? Check your spam folder or{' '}
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-violet-400 hover:text-violet-300 transition-colors"
                >
                  try again
                </button>
              </p>

              <a
                href="/login"
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 px-6 py-3 border border-slate-700/50 rounded-lg hover:border-violet-500/50 hover:text-violet-400 transition-all duration-200"
              >
                Return to Sign In
              </a>
            </div>
          )}
        </div>

        {/* Bottom decorative element */}
        <div className="mt-10 text-center">
          <div className="inline-flex items-center gap-3 text-xs text-slate-600 tracking-wider">
            <span className="w-5 h-px bg-slate-700" />
            SECURED WITH 256-BIT ENCRYPTION
            <span className="w-5 h-px bg-slate-700" />
          </div>
        </div>
      </div>
    </div>
  )
}