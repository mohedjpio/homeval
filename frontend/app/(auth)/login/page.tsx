'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authLogin } from '@/lib/api'
import { saveAuth } from '@/lib/auth'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function LoginPage() {
  const router = useRouter()
  const [email,    setEmail]   = useState('')
  const [pass,     setPass]    = useState('')
  const [loading,  setLoad]    = useState(false)
  const [error,    setError]   = useState('')
  const [dbStatus, setDb]      = useState<'unknown'|'ok'|'error'>('unknown')

  async function checkDB() {
    try {
      const r = await fetch(`${API}/api/v1/auth/check`)
      const d = await r.json()
      setDb(d.status === 'ok' ? 'ok' : 'error')
      if (d.status !== 'ok') setError(`DB error: ${d.detail || 'Cannot connect to Supabase'}`)
    } catch {
      setDb('error')
      setError('Backend not running — start start.bat first')
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault(); setLoad(true); setError('')
    try {
      const { token, user } = await authLogin(email.trim(), pass)
      saveAuth(token, user)
      router.push('/dashboard')
    } catch (err: any) {
      const detail = err?.response?.data?.detail
      if (detail) setError(detail)
      else if (err?.code === 'ERR_NETWORK' || err?.message?.includes('Network'))
        setError('Cannot reach backend. Make sure the HomeVal Backend window is open on port 8000.')
      else setError(err?.message || 'Sign in failed')
      setLoad(false)
    }
  }

  return (
    <div className="min-h-screen min-h-[100dvh] bg-sand-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm animate-fade-up">

        {/* Logo */}
        <div className="text-center mb-8 sm:mb-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <path d="M3 10L10 3L17 10V17H13V13H7V17H3V10Z" fill="white"/>
              </svg>
            </div>
            <span className="font-display text-2xl text-brand-700">HomeVal</span>
          </Link>
          <p className="text-sand-600 text-sm">Egyptian Real Estate Intelligence</p>
        </div>

        <div className="bg-white rounded-2xl border border-sand-200 p-6 sm:p-8 shadow-sm">
          <h1 className="font-display text-2xl text-brand-900 mb-6">Sign in</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-sand-600 mb-1.5">Email</label>
              <input
                type="email" value={email} onChange={e=>setEmail(e.target.value)}
                required autoComplete="email" placeholder="you@example.com"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-sand-600 mb-1.5">Password</label>
              <input
                type="password" value={pass} onChange={e=>setPass(e.target.value)}
                required autoComplete="current-password" placeholder="••••••••"
                className="w-full"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                <p className="text-red-600 text-sm leading-snug">{error}</p>
                {error.includes('Invalid email or password') && (
                  <p className="text-red-400 text-xs mt-1">
                    <Link href="/register" className="underline">Register a new account →</Link>
                  </p>
                )}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-60 text-sm sm:text-base">
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm text-sand-600 mt-6">
            No account?{' '}
            <Link href="/register" className="text-brand-600 font-medium hover:underline">Create one</Link>
          </p>

          {/* Debug helper */}
          <div className="mt-4 pt-4 border-t border-sand-100 text-center">
            <button type="button" onClick={checkDB}
              className="text-xs text-sand-400 hover:text-sand-600 transition-colors py-1 min-h-[36px]">
              {dbStatus==='unknown'?'Check backend connection →':dbStatus==='ok'?'✓ Backend connected':'✗ Backend connection failed'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
