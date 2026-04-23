'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/api'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/dashboard', label: 'Analytics',   icon: '◈' },
  { href: '/predict',   label: 'Predict',      icon: '◎' },
  { href: '/chat',      label: 'AI Assistant', icon: '◇' },
  { href: '/history',   label: 'History',      icon: '◫' },
  { href: '/settings',  label: 'Settings',     icon: '◉' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter()
  const pathname = usePathname()
  const [user, setUser]       = useState<any>(null)
  const [checking, setCheck]  = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      setUser(session.user)
      setCheck(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session) router.push('/login')
      else setUser(session.user)
    })
    return () => subscription.unsubscribe()
  }, [router])

  if (checking) return (
    <div className="min-h-screen bg-sand-50 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="flex min-h-screen bg-sand-50">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-sand-200 flex flex-col fixed inset-y-0 z-30">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-sand-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <path d="M3 10L10 3L17 10V17H13V13H7V17H3V10Z" fill="white" strokeWidth="0.5" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-display text-xl text-brand-700">HomeVal</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV.map(({ href, label, icon }) => (
            <Link
              key={href} href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors',
                pathname === href
                  ? 'bg-brand-50 text-brand-700 font-medium'
                  : 'text-sand-600 hover:bg-sand-100 hover:text-sand-900'
              )}
            >
              <span className="text-base leading-none">{icon}</span>
              {label}
            </Link>
          ))}
        </nav>

        {/* User */}
        <div className="px-4 py-4 border-t border-sand-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-sm font-medium flex-shrink-0">
              {user?.email?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-sand-900 truncate">{user?.user_metadata?.full_name || 'User'}</p>
              <p className="text-xs text-sand-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => supabase.auth.signOut()}
            className="mt-3 w-full text-xs text-sand-500 hover:text-red-500 transition-colors text-left px-1"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 ml-56 p-8 min-h-screen">
        {children}
      </main>
    </div>
  )
}
