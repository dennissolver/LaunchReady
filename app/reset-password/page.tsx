'use client'

import { useState } from 'react'
import { Lock, Eye, EyeOff, ArrowLeft, Loader2, CheckCircle2, ShieldCheck } from 'lucide-react'

export default function ResetPasswordConfirm() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const passwordRequirements = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Contains lowercase letter', met: /[a-z]/.test(password) },
    { label: 'Contains a number', met: /[0-9]/.test(password) },
  ]

  const allRequirementsMet = passwordRequirements.every(req => req.met)
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!allRequirementsMet) {
      setError('Please meet all password requirements')
      return
    }

    if (!passwordsMatch) {
      setError('Passwords do not match')
      return
    }

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
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-violet-500/20 to-purple-500/10 rounded-full flex items-center justify-center border border-violet-500/20">
                <Lock className="w-7 h-7 text-violet-400" />
              </div>

              <h1 className="text-3xl font-semibold text-white text-center mb-3 tracking-tight">
                Set New Password
              </h1>

              <p className="text-slate-400 text-center mb-8 text-sm leading-relaxed">
                Create a strong password for your account.
              </p>

              <form onSubmit={handleSubmit}>
                {error && (
                  <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <div className="mb-5">
                  <label className="block text-xs font-medium text-violet-400 uppercase tracking-widest mb-3">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter new password"
                      required
                      className="w-full px-5 py-4 pr-12 text-base text-white bg-slate-800/50 border border-slate-700/50 rounded-lg outline-none transition-all duration-300 placeholder:text-slate-500 focus:border-violet-500/50 focus:bg-slate-800/80 focus:ring-2 focus:ring-violet-500/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Password requirements */}
                <div className="mb-6 p-4 bg-slate-800/30 rounded-lg border border-slate-700/30">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Requirements</p>
                  <div className="grid grid-cols-2 gap-2">
                    {passwordRequirements.map((req, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${req.met ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700/50 text-slate-500'}`}>
                          {req.met && <CheckCircle2 className="w-3 h-3" />}
                        </div>
                        <span className={`text-xs ${req.met ? 'text-emerald-400' : 'text-slate-500'}`}>
                          {req.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-8">
                  <label className="block text-xs font-medium text-violet-400 uppercase tracking-widest mb-3">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      required
                      className={`w-full px-5 py-4 pr-12 text-base text-white bg-slate-800/50 border rounded-lg outline-none transition-all duration-300 placeholder:text-slate-500 focus:bg-slate-800/80 focus:ring-2 ${
                        confirmPassword.length > 0
                          ? passwordsMatch
                            ? 'border-emerald-500/50 focus:border-emerald-500/50 focus:ring-emerald-500/20'
                            : 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20'
                          : 'border-slate-700/50 focus:border-violet-500/50 focus:ring-violet-500/20'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {confirmPassword.length > 0 && !passwordsMatch && (
                    <p className="mt-2 text-xs text-red-400">Passwords do not match</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !allRequirementsMet || !passwordsMatch}
                  className="w-full py-4 px-6 text-sm font-semibold uppercase tracking-widest text-white bg-gradient-to-r from-violet-600 to-purple-600 rounded-lg transition-all duration-300 hover:from-violet-500 hover:to-purple-500 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Updating...
                    </span>
                  ) : 'Reset Password'}
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-slate-700/50 text-center">
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
              <div className="w-20 h-20 mx-auto mb-8 bg-gradient-to-br from-emerald-500/20 to-green-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
                <ShieldCheck className="w-9 h-9 text-emerald-400" />
              </div>

              <h2 className="text-2xl font-semibold text-white mb-4 tracking-tight">
                Password Updated!
              </h2>

              <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                Your password has been successfully reset. You can now sign in with your new password.
              </p>

              <a
                href="/login"
                className="inline-flex items-center justify-center gap-2 w-full py-4 px-6 text-sm font-semibold uppercase tracking-widest text-white bg-gradient-to-r from-violet-600 to-purple-600 rounded-lg transition-all duration-300 hover:from-violet-500 hover:to-purple-500 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-500/25"
              >
                Sign In Now
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