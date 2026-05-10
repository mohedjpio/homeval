'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authRegister } from '@/lib/api'
import { saveAuth } from '@/lib/auth'

export default function RegisterPage() {
  const router = useRouter()
  const [email,   setEmail]  = useState('')
  const [pass,    setPass]   = useState('')
  const [name,    setName]   = useState('')
  const [loading, setLoad]   = useState(false)
  const [error,   setError]  = useState('')

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault(); setLoad(true); setError('')
    try {
      const { token, user } = await authRegister(email.trim(), pass, name.trim())
      saveAuth(token, user)
      router.push('/dashboard')
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
        err?.message ||
        'Registration failed — check that the backend is running on http://localhost:8000'
      )
      setLoad(false)
    }
  }

  return (
    <div className="min-h-screen min-h-[100dvh] bg-sand-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm animate-fade-up">

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
          <h1 className="font-display text-2xl text-brand-900 mb-6">Create account</h1>
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-sand-600 mb-1.5">Full name</label>
              <input value={name} onChange={e=>setName(e.target.value)} required placeholder="Ahmed Hassan" className="w-full"/>
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-sand-600 mb-1.5">Email</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required autoComplete="email" placeholder="you@example.com" className="w-full"/>
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-sand-600 mb-1.5">Password</label>
              <input type="password" value={pass} onChange={e=>setPass(e.target.value)} required autoComplete="new-password" placeholder="min 8 characters" minLength={8} className="w-full"/>
            </div>
            {error && <p className="text-red-600 text-sm bg-red-50 rounded-xl px-4 py-3 leading-snug">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-60 text-sm sm:text-base">
              {loading ? 'Creating account…' : 'Get started — no email needed'}
            </button>
          </form>
          <p className="text-center text-sm text-sand-600 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-brand-600 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
