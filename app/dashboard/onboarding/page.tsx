'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Shield, ArrowRight, Loader2, User, Building, MapPin, Phone } from 'lucide-react'

const STARTUP_STAGES = [
  { value: 'idea', label: 'Idea stage - just getting started' },
  { value: 'building', label: 'Building - actively developing' },
  { value: 'mvp', label: 'MVP - have a working prototype' },
  { value: 'launched', label: 'Launched - product is live' },
  { value: 'scaling', label: 'Scaling - growing the business' },
  { value: 'established', label: 'Established - mature business' },
]

const FUNDING_STAGES = [
  { value: 'bootstrapped', label: 'Bootstrapped / Self-funded' },
  { value: 'pre_seed', label: 'Pre-seed' },
  { value: 'seed', label: 'Seed' },
  { value: 'series_a', label: 'Series A' },
  { value: 'series_b_plus', label: 'Series B+' },
  { value: 'profitable', label: 'Profitable / No funding needed' },
]

const TEAM_SIZES = [
  { value: 'solo', label: 'Solo founder' },
  { value: '2-5', label: '2-5 people' },
  { value: '6-10', label: '6-10 people' },
  { value: '11-25', label: '11-25 people' },
  { value: '26-50', label: '26-50 people' },
  { value: '50+', label: '50+ people' },
]

const HOW_HEARD = [
  { value: 'google', label: 'Google search' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'twitter', label: 'Twitter/X' },
  { value: 'friend', label: 'Friend or colleague' },
  { value: 'investor', label: 'Investor recommendation' },
  { value: 'accelerator', label: 'Accelerator/Incubator' },
  { value: 'event', label: 'Event or conference' },
  { value: 'podcast', label: 'Podcast' },
  { value: 'other', label: 'Other' },
]

const COUNTRIES = [
  { value: 'Australia', code: '+61' },
  { value: 'United States', code: '+1' },
  { value: 'United Kingdom', code: '+44' },
  { value: 'Canada', code: '+1' },
  { value: 'New Zealand', code: '+64' },
  { value: 'Singapore', code: '+65' },
  { value: 'Germany', code: '+49' },
  { value: 'France', code: '+33' },
  { value: 'India', code: '+91' },
  { value: 'Other', code: '' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    full_name: '',
    company_name: '',
    phone: '',
    phone_country_code: '+61',
    
    // Step 2: Location
    location_city: '',
    location_state: '',
    location_country: 'Australia',
    
    // Step 3: Business Context
    startup_stage: '',
    funding_stage: '',
    team_size: '',
    primary_industry: '',
    
    // Step 4: How they found us
    how_heard_about_us: '',
    linkedin_url: '',
    marketing_consent: false,
  })

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Auto-update phone country code when country changes
    if (field === 'location_country') {
      const country = COUNTRIES.find(c => c.value === value)
      if (country) {
        setFormData(prev => ({ ...prev, phone_country_code: country.code }))
      }
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          ...formData,
          onboarding_completed: true,
          onboarding_step: 4,
          terms_accepted_at: new Date().toISOString(),
          privacy_accepted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (updateError) throw updateError

      router.push('/dashboard')
    } catch (err) {
      console.error('Onboarding error:', err)
      setError(err instanceof Error ? err.message : 'Failed to save profile')
    } finally {
      setLoading(false)
    }
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.full_name.trim() !== ''
      case 2:
        return formData.location_country !== ''
      case 3:
        return formData.startup_stage !== ''
      case 4:
        return true
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-white">LaunchReady</span>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all ${
                s === step ? 'w-8 bg-violet-500' : 
                s < step ? 'w-8 bg-violet-400' : 'w-8 bg-gray-700'
              }`}
            />
          ))}
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Let's get to know you</h2>
                  <p className="text-sm text-gray-500">Basic contact information</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => updateField('full_name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    placeholder="John Smith"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={formData.company_name}
                    onChange={(e) => updateField('company_name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    placeholder="Acme Inc"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={formData.phone_country_code}
                      onChange={(e) => updateField('phone_country_code', e.target.value)}
                      className="px-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white"
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c.value} value={c.code}>{c.code}</option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      placeholder="412 345 678"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Step 2: Location */}
          {step === 2 && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Where are you based?</h2>
                  <p className="text-sm text-gray-500">Helps us show relevant IP information</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.location_country}
                    onChange={(e) => updateField('location_country', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.value}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State / Region
                  </label>
                  <input
                    type="text"
                    value={formData.location_state}
                    onChange={(e) => updateField('location_state', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    placeholder="Queensland"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.location_city}
                    onChange={(e) => updateField('location_city', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    placeholder="Brisbane"
                  />
                </div>
              </div>
            </>
          )}

          {/* Step 3: Business Context */}
          {step === 3 && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                  <Building className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">About your startup</h2>
                  <p className="text-sm text-gray-500">Helps us tailor IP recommendations</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    What stage is your startup? <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.startup_stage}
                    onChange={(e) => updateField('startup_stage', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white"
                  >
                    <option value="">Select stage...</option>
                    {STARTUP_STAGES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Funding stage
                  </label>
                  <select
                    value={formData.funding_stage}
                    onChange={(e) => updateField('funding_stage', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white"
                  >
                    <option value="">Select funding stage...</option>
                    {FUNDING_STAGES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Team size
                  </label>
                  <select
                    value={formData.team_size}
                    onChange={(e) => updateField('team_size', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white"
                  >
                    <option value="">Select team size...</option>
                    {TEAM_SIZES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Primary industry
                  </label>
                  <input
                    type="text"
                    value={formData.primary_industry}
                    onChange={(e) => updateField('primary_industry', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    placeholder="e.g. SaaS, FinTech, HealthTech"
                  />
                </div>
              </div>
            </>
          )}

          {/* Step 4: Final */}
          {step === 4 && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Almost done!</h2>
                  <p className="text-sm text-gray-500">Just a couple more questions</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    How did you hear about us?
                  </label>
                  <select
                    value={formData.how_heard_about_us}
                    onChange={(e) => updateField('how_heard_about_us', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white"
                  >
                    <option value="">Select...</option>
                    {HOW_HEARD.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    LinkedIn Profile (optional)
                  </label>
                  <input
                    type="url"
                    value={formData.linkedin_url}
                    onChange={(e) => updateField('linkedin_url', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.marketing_consent}
                      onChange={(e) => updateField('marketing_consent', e.target.checked)}
                      className="mt-1 w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
                    />
                    <span className="text-sm text-gray-600">
                      I'd like to receive occasional updates about IP protection tips, 
                      product updates, and founder resources. You can unsubscribe anytime.
                    </span>
                  </label>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500">
                    By continuing, you agree to our{' '}
                    <a href="/terms" className="text-violet-600 hover:underline">Terms of Service</a>
                    {' '}and{' '}
                    <a href="/privacy" className="text-violet-600 hover:underline">Privacy Policy</a>.
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium"
              >
                Back
              </button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-300 text-white rounded-xl font-medium transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Complete Setup
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Skip */}
        <div className="text-center mt-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-sm text-gray-400 hover:text-gray-300"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  )
}
