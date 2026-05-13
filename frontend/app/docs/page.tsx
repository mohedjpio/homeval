'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { isLoggedIn } from '@/lib/auth'

export default function DocsLanding() {
  const [authed, setAuthed] = useState(false)
  useEffect(() => { if (isLoggedIn()) setAuthed(true) }, [])

  return (
    <div className="min-h-screen bg-sand-50 font-body">

      {/* Nav */}
      <nav className="bg-white/95 backdrop-blur border-b border-sand-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                <path d="M3 10L10 3L17 10V17H13V13H7V17H3V10Z" fill="white"/>
              </svg>
            </div>
            <span className="font-display text-xl text-brand-700">HomeVal</span>
            <span className="text-sand-300 mx-1">/</span>
            <span className="text-sand-600 text-sm font-medium">Docs</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/docs/user" className="text-sm text-sand-600 hover:text-brand-600 font-medium transition-colors">User Guide</Link>
            <Link href="/docs/tech" className="text-sm text-sand-600 hover:text-brand-600 font-medium transition-colors">API Docs</Link>
            {authed
              ? <Link href="/dashboard" className="bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">Dashboard</Link>
              : <Link href="/register" className="bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">Get started</Link>
            }
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-4xl mx-auto px-6 pt-20 pb-12 text-center">
        <div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-100 rounded-full px-4 py-1.5 mb-6">
          <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"/>
          <span className="text-brand-700 text-sm font-medium">HomeVal v2.0 Documentation</span>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl text-brand-900 mb-4 leading-tight">
          Everything you need<br/>to know about <span className="text-brand-500">HomeVal</span>
        </h1>
        <p className="text-sand-600 text-lg max-w-xl mx-auto leading-relaxed">
          Choose your path — step-by-step guides for users, or full API and architecture reference for developers.
        </p>
      </div>

      {/* Two cards */}
      <div className="max-w-4xl mx-auto px-6 pb-24 grid sm:grid-cols-2 gap-6">

        {/* User Docs */}
        <Link href="/docs/user" className="group bg-white border border-sand-200 rounded-2xl p-8 hover:border-brand-300 hover:shadow-xl transition-all duration-300 flex flex-col">
          <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:bg-brand-100 transition-colors">
            📖
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="font-display text-xl text-brand-900">User Guide</h2>
              <span className="bg-brand-50 text-brand-600 text-xs font-semibold px-2 py-0.5 rounded-full">For everyone</span>
            </div>
            <p className="text-sand-600 text-sm leading-relaxed mb-6">
              Learn how to use HomeVal — from running your first property valuation to interpreting market analytics and using the AI assistant.
            </p>
            <ul className="space-y-2 mb-6">
              {['Getting started & account setup','Running property valuations','Reading market analytics','Using the AI assistant','Managing your history'].map(i => (
                <li key={i} className="flex items-center gap-2 text-xs text-sand-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-400 shrink-0"/>
                  {i}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex items-center gap-2 text-brand-600 text-sm font-medium group-hover:gap-3 transition-all">
            Read User Guide
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </Link>

        {/* Tech Docs */}
        <Link href="/docs/tech" className="group bg-[#04342c] border border-[#085041] rounded-2xl p-8 hover:border-brand-400 hover:shadow-xl transition-all duration-300 flex flex-col">
          <div className="w-14 h-14 bg-[#085041] rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:bg-[#0f6e56] transition-colors">
            ⚙️
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="font-display text-xl text-white">API Reference</h2>
              <span className="bg-brand-500/20 text-[#9FE1CB] text-xs font-semibold px-2 py-0.5 rounded-full">For developers</span>
            </div>
            <p className="text-[#9FE1CB]/80 text-sm leading-relaxed mb-6">
              Full API reference, architecture overview, authentication flows, ML model details, database schema, and deployment guide.
            </p>
            <ul className="space-y-2 mb-6">
              {['REST API endpoints & schemas','Authentication & JWT flow','ML model architecture','Database schema (Supabase)','Self-hosting & deployment'].map(i => (
                <li key={i} className="flex items-center gap-2 text-xs text-[#9FE1CB]/70">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-400 shrink-0"/>
                  {i}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex items-center gap-2 text-[#9FE1CB] text-sm font-medium group-hover:gap-3 transition-all">
            Read API Docs
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </Link>

      </div>

      {/* Quick links */}
      <div className="max-w-4xl mx-auto px-6 pb-24">
        <p className="text-xs text-sand-400 uppercase tracking-widest font-semibold mb-4">Quick links</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href:'/docs/user#predict',   label:'How to predict',   icon:'◎' },
            { href:'/docs/user#chat',      label:'AI assistant',      icon:'◇' },
            { href:'/docs/tech#auth',      label:'Authentication',    icon:'🔐' },
            { href:'/docs/tech#endpoints', label:'All endpoints',     icon:'⊞' },
          ].map(l => (
            <Link key={l.href} href={l.href} className="bg-white border border-sand-200 rounded-xl px-4 py-3 flex items-center gap-2 text-sm text-sand-700 hover:border-brand-200 hover:text-brand-600 transition-all">
              <span>{l.icon}</span>{l.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-sand-200 py-8 text-center">
        <p className="text-xs text-sand-400">HomeVal v2.0 · Egypt Property Intelligence</p>
      </div>
    </div>
  )
}
