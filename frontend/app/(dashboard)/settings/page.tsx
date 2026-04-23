'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { getProfile, updateProfile } from '@/lib/api'

export default function SettingsPage() {
  const [fullName, setFullName]     = useState('')
  const [groqKey, setGroqKey]       = useState('')
  const [loading, setLoading]       = useState(true)
  const [saving, setSaving]         = useState(false)
  const [saved, setSaved]           = useState(false)
  const [error, setError]           = useState('')

  useEffect(() => {
    getProfile().then(p => {
      setFullName(p?.full_name || '')
      setGroqKey(p?.groq_api_key || '')
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setError(''); setSaved(false)
    try {
      await updateProfile({ full_name: fullName, groq_api_key: groqKey || undefined })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch { setError('Failed to save. Please try again.') }
    finally { setSaving(false) }
  }

  if (loading) return (
    <div className="max-w-xl mx-auto animate-fade-up space-y-4">
      <div className="h-8 w-32 shimmer rounded-lg mb-6" />
      <div className="h-48 shimmer rounded-2xl" />
    </div>
  )

  return (
    <div className="max-w-xl mx-auto animate-fade-up">
      <div className="mb-8">
        <h1 className="font-display text-3xl text-brand-900 mb-1">Settings</h1>
        <p className="text-sand-600 text-sm">Manage your profile and API keys</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile */}
        <div className="bg-white rounded-2xl border border-sand-200 p-6">
          <h2 className="font-display text-lg text-brand-800 mb-5">Profile</h2>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-sand-600 mb-1.5">Full name</label>
            <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Ahmed Hassan" />
          </div>
        </div>

        {/* API Keys */}
        <div className="bg-white rounded-2xl border border-sand-200 p-6">
          <h2 className="font-display text-lg text-brand-800 mb-2">Groq API Key</h2>
          <p className="text-sm text-sand-500 mb-5">
            The AI chat assistant uses Groq. Enter your own key to use your quota, or leave blank to use the platform default.{' '}
            <a href="https://console.groq.com" target="_blank" rel="noopener" className="text-brand-600 hover:underline">Get a free key →</a>
          </p>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-sand-600 mb-1.5">API Key</label>
            <input
              type="password"
              value={groqKey}
              onChange={e => setGroqKey(e.target.value)}
              placeholder="gsk_••••••••••••••••"
            />
            <p className="text-xs text-sand-400 mt-2">Stored encrypted. Never shared with third parties.</p>
          </div>
        </div>

        {error  && <p className="text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>}
        {saved  && <p className="text-brand-600 text-sm bg-brand-50 rounded-lg px-3 py-2">✓ Settings saved successfully</p>}

        <button
          type="submit" disabled={saving}
          className="w-full bg-brand-500 hover:bg-brand-600 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save settings'}
        </button>
      </form>
    </div>
  )
}
