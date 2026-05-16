'use client'

/**
 * Public Team Page — accessible from landing page without login.
 * Shows all BusCo project team members.
 */

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { isLoggedIn } from '@/lib/auth'

// ── Team Data ─────────────────────────────────────────────────────────────────
const TEAM = [
  {
    id: '2220367',
    name: 'Mohamed Hassan Mohamed Khalifa',
    nameAr: 'محمد حسن محمد خليفة',
    role: 'Leader' as const,
    specialty: 'Project Lead & Architecture',
    initials: 'MH',
    color: 'from-brand-500 to-brand-700',
    photo: '/team/2220367.jpg',
  },
  {
    id: '2220448',
    name: 'Madeeha Alaa Eldin Yasla',
    nameAr: 'مديحة علاء الدين يسلا',
    role: 'Member' as const,
    specialty: 'Frontend Development',
    initials: 'MA',
    color: 'from-violet-500 to-violet-700',
    photo: '/team/2220448.jpg',
  },
  {
    id: '2220192',
    name: 'Sami Jamal Kamel Qabeel',
    nameAr: 'سامي جمال كامل قابيل',
    role: 'Member' as const,
    specialty: 'Backend Development',
    initials: 'SJ',
    color: 'from-blue-500 to-blue-700',
    photo: '/team/2220192.jpg',
  },
  {
    id: '2220436',
    name: 'Mohamed Essam Mahmoud Adel',
    nameAr: 'محمد عصام محمود عادل',
    role: 'Member' as const,
    specialty: 'Machine Learning',
    initials: 'ME',
    color: 'from-amber-500 to-amber-700',
    photo: '/team/2220436.jpg',
  },
  {
    id: '2220183',
    name: 'Ziad Mamdouh Elsayed Mahmoud',
    nameAr: 'زياد ممدوح السيد محمود',
    role: 'Member' as const,
    specialty: 'Data Engineering',
    initials: 'ZM',
    color: 'from-rose-500 to-rose-700',
    photo: '/team/2220183.jpg',
  },
  {
    id: '2220470',
    name: 'Mustafa Jamal Kamel Qabeel',
    nameAr: 'مصطفى جمال كامل قابيل',
    role: 'Member' as const,
    specialty: 'Database & API',
    initials: 'MQ',
    color: 'from-teal-500 to-teal-700',
    photo: '/team/2220470.jpg',
  },
  {
    id: '2220409',
    name: 'Mohamed Maher Abu Arab',
    nameAr: 'محمد ماهر أبو عرب',
    role: 'Member' as const,
    specialty: 'UI/UX Design',
    initials: 'MM',
    color: 'from-indigo-500 to-indigo-700',
    photo: '/team/2220409.jpg',
  },
]

// ── Nav ───────────────────────────────────────────────────────────────────────
function Nav({ authed }: { authed: boolean }) {
  return (
    <nav className="bg-white/95 backdrop-blur border-b border-sand-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                <path d="M3 10L10 3L17 10V17H13V13H7V17H3V10Z" fill="white"/>
              </svg>
            </div>
            <span className="font-display text-xl text-brand-700">HomeVal</span>
          </Link>
          <span className="text-sand-300 mx-1">/</span>
          <span className="text-sand-700 text-sm font-medium">Team</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/analytics-guide-public" className="text-sm text-sand-600 hover:text-brand-600 font-medium transition-colors hidden sm:block">Analytics Guide</Link>
          <Link href="/docs" className="text-sm text-sand-600 hover:text-brand-600 font-medium transition-colors hidden sm:block">Docs</Link>
          {authed
            ? <Link href="/dashboard" className="bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">Dashboard</Link>
            : <Link href="/register" className="bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">Get started</Link>
          }
        </div>
      </div>
    </nav>
  )
}

// ── Member Card ───────────────────────────────────────────────────────────────
function MemberCard({ member }: { member: typeof TEAM[0] }) {
  return (
    <div className="group bg-white border border-sand-200 rounded-2xl overflow-hidden hover:shadow-xl hover:border-brand-200 hover:-translate-y-1 transition-all duration-300 flex flex-col">
      {/* Gradient header */}
      <div className={`relative bg-gradient-to-br ${member.color} p-8 flex flex-col items-center`}>
        <div className="absolute top-2 right-3 w-16 h-16 rounded-full bg-white/10"/>
        <div className="absolute -bottom-3 -left-3 w-20 h-20 rounded-full bg-white/5"/>

        {/* Avatar with photo fallback */}
        <div className="relative w-20 h-20 rounded-2xl shadow-lg mb-3">
          <img
            src={member.photo}
            alt={member.name}
            className="w-20 h-20 rounded-2xl object-cover border-2 border-white/30"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
              const fb = e.currentTarget.nextElementSibling as HTMLElement
              if (fb) fb.style.display = 'flex'
            }}
          />
          <div className="absolute inset-0 rounded-2xl bg-white/20 backdrop-blur items-center justify-center border-2 border-white/30 hidden">
            <span className="font-display text-2xl text-white font-bold">{member.initials}</span>
          </div>
          {member.role === 'Leader' && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center shadow-md z-10">
              <span className="text-xs">★</span>
            </div>
          )}
        </div>

        {/* Role badge */}
        {member.role === 'Leader' ? (
          <span className="inline-flex items-center gap-1 bg-white/20 text-white border border-white/30 text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur">
            <span className="text-amber-300">★</span> Team Leader
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 bg-white/10 text-white/90 text-xs font-medium px-2.5 py-1 rounded-full">
            Member
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-semibold text-sand-900 text-sm leading-tight mb-0.5 group-hover:text-brand-700 transition-colors">
          {member.name}
        </h3>
        <p className="text-sand-400 text-xs mb-3" dir="rtl">{member.nameAr}</p>

        <div className="flex items-center gap-1.5 mb-4">
          <span className="text-brand-500 text-xs">◎</span>
          <span className="text-sand-600 text-xs">{member.specialty}</span>
        </div>

        <div className="border-t border-sand-100 pt-4 mt-auto flex items-center justify-between">
          <div>
            <p className="text-[10px] text-sand-400 uppercase tracking-widest font-semibold">Student ID</p>
            <p className="text-sand-700 text-sm font-mono font-semibold">{member.id}</p>
          </div>
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${member.color} opacity-20 group-hover:opacity-40 transition-opacity`}/>
        </div>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function TeamPublicPage() {
  const [authed, setAuthed] = useState(false)
  useEffect(() => { if (isLoggedIn()) setAuthed(true) }, [])

  const leader = TEAM.find(m => m.role === 'Leader')!
  const members = TEAM.filter(m => m.role === 'Member')

  return (
    <div className="min-h-screen bg-sand-50 font-body">
      <Nav authed={authed} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-12">

        {/* Page header */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-100 rounded-full px-4 py-1.5 mb-4">
            <span className="w-2 h-2 rounded-full bg-brand-500"/>
            <span className="text-brand-700 text-xs font-semibold uppercase tracking-widest">BusCo Project · 2026</span>
          </div>
          <h1 className="font-display text-4xl text-brand-900 mb-4">Meet the Team</h1>
          <p className="text-sand-600 text-base leading-relaxed">
            The engineers and designers behind HomeVal — Egypt&apos;s AI-powered property valuation platform.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
          {[
            { value: '7',    label: 'Team members', icon: '👥' },
            { value: '1',    label: 'Team leader',  icon: '⭐' },
            { value: '2026', label: 'Project year', icon: '📅' },
            { value: '30K',  label: 'Data records', icon: '📊' },
          ].map(s => (
            <div key={s.label} className="bg-white border border-sand-200 rounded-xl px-4 py-4 flex items-center gap-3">
              <span className="text-xl">{s.icon}</span>
              <div>
                <p className="font-display text-xl text-brand-700">{s.value}</p>
                <p className="text-sand-500 text-xs">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Leader */}
        <section>
          <h2 className="text-xs font-semibold text-sand-400 uppercase tracking-widest mb-5 flex items-center gap-2">
            <span className="text-amber-500">★</span> Team Leader
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <MemberCard member={leader} />
          </div>
        </section>

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 border-t border-sand-200"/>
          <span className="text-xs text-sand-400 font-semibold uppercase tracking-widest">Team Members</span>
          <div className="flex-1 border-t border-sand-200"/>
        </div>

        {/* Members */}
        <section>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map(m => <MemberCard key={m.id} member={m} />)}
          </div>
        </section>

        {/* Project footer card */}
        <div className="bg-gradient-to-br from-brand-900 to-brand-700 rounded-2xl p-6 sm:p-10 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
          <div>
            <p className="text-brand-200 text-xs uppercase tracking-widest font-semibold mb-2">About the Project</p>
            <h3 className="font-display text-2xl mb-3">HomeVal — Egypt Property Intelligence</h3>
            <p className="text-brand-200 text-sm leading-relaxed max-w-md">
              AI-powered property valuation platform covering 25+ Egyptian cities.
              Built with Next.js 15, FastAPI, Supabase, and a custom ML model trained on 30,000+ listings.
            </p>
            <div className="flex gap-3 mt-5 flex-wrap">
              {authed
                ? <Link href="/dashboard" className="bg-white text-brand-700 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-brand-50 transition-colors">Open Dashboard →</Link>
                : <Link href="/register" className="bg-white text-brand-700 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-brand-50 transition-colors">Try it free →</Link>
              }
              <Link href="/docs" className="border border-white/30 text-white font-medium text-sm px-5 py-2.5 rounded-xl hover:bg-white/10 transition-colors">View Docs</Link>
            </div>
          </div>
          <div className="flex flex-col gap-2.5 shrink-0">
            {[
              ['Stack',    'Next.js + FastAPI'],
              ['ML Model', 'R² = 0.99'],
              ['Data',     '30,000+ records'],
              ['Areas',    '25 Egyptian cities'],
              ['Year',     '2026'],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center gap-3">
                <span className="text-brand-300 text-xs w-16 shrink-0">{k}</span>
                <span className="text-white text-xs font-semibold">{v}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Footer */}
      <div className="border-t border-sand-200 py-8 text-center mt-12">
        <p className="text-xs text-sand-400">HomeVal v2.0 · BusCo Project 2026 · Egypt Property Intelligence</p>
      </div>
    </div>
  )
}
