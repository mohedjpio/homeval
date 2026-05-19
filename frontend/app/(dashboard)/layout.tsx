'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { getUser, clearAuth, isLoggedIn, User } from '@/lib/auth'
import { avatarUrl } from '@/lib/cloudinary'

const NAV = [
  { href:'/dashboard',       label:'Analytics',  icon:'◈' },
  { href:'/predict',         label:'Predict',    icon:'◎' },
  { href:'/chat',            label:'AI Chat',    icon:'◇' },
  { href:'/history',         label:'History',    icon:'◫' },
  { href:'/settings',        label:'Settings',   icon:'◉' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter()
  const pathname = usePathname()
  const [user,       setUser]       = useState<User | null>(null)
  const [ready,      setReady]      = useState(false)
  const [sidebarOpen,setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!isLoggedIn()) { router.push('/login'); return }
    setUser(getUser()); setReady(true)
  }, [router])

  // Close sidebar on route change
  useEffect(() => { setSidebarOpen(false) }, [pathname])

  // Close sidebar on Escape
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') setSidebarOpen(false) }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [])

  function handleSignOut() { clearAuth(); router.push('/login') }

  if (!ready) return (
    <div className="min-h-screen bg-sand-50 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"/>
    </div>
  )

  const avatar   = user?.avatar_url || (user ? avatarUrl(user.id, 64) : '')
  const initials = user?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="px-4 py-4 border-b border-sand-100 flex-shrink-0">
        <Link href="/" className="flex items-center gap-2" onClick={()=>setSidebarOpen(false)}>
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <path d="M3 10L10 3L17 10V17H13V13H7V17H3V10Z" fill="white"/>
            </svg>
          </div>
          <span className="font-display text-xl text-brand-700">HomeVal</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, label, icon }) => (
          <Link key={href} href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors min-h-[44px]',
              pathname === href
                ? 'bg-brand-50 text-brand-700 font-medium'
                : 'text-sand-600 hover:bg-sand-100 active:bg-sand-200'
            )}>
            <span className="text-base leading-none w-5 text-center flex-shrink-0">{icon}</span>
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-sand-100 flex-shrink-0 safe-bottom">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-100 flex-shrink-0 overflow-hidden">
            {avatar
              ? <img src={avatar} alt="avatar" className="w-full h-full object-cover" onError={e=>{(e.target as HTMLImageElement).style.display='none'}}/>
              : <div className="w-full h-full flex items-center justify-center text-brand-700 text-sm font-medium">{initials}</div>
            }
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-sand-900 truncate">{user?.full_name || 'User'}</p>
            <p className="text-xs text-sand-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button onClick={handleSignOut}
          className="mt-3 w-full text-xs text-sand-500 hover:text-red-500 transition-colors text-left px-1 py-1 min-h-[32px]">
          Sign out
        </button>
      </div>
    </>
  )

  return (
    <div className="flex min-h-screen bg-sand-50">

      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-29 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar — desktop: fixed, mobile: slide-over ── */}
      <aside className={cn(
        'flex flex-col bg-white border-r border-sand-200 fixed inset-y-0 z-30 transition-transform duration-300',
        'w-56',
        // Desktop: always visible
        'lg:translate-x-0',
        // Mobile/tablet: slide in/out
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        <SidebarContent/>
      </aside>

      {/* ── Mobile top bar ── */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-20 bg-white border-b border-sand-200 h-14 flex items-center px-4 gap-3">
        <button
          onClick={() => setSidebarOpen(true)}
          className="w-9 h-9 rounded-lg border border-sand-200 flex items-center justify-center text-sand-600 hover:bg-sand-50 active:bg-sand-100 flex-shrink-0"
          aria-label="Open menu"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M2 4h14M2 9h14M2 14h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
              <path d="M3 10L10 3L17 10V17H13V13H7V17H3V10Z" fill="white"/>
            </svg>
          </div>
          <span className="font-display text-lg text-brand-700">HomeVal</span>
        </Link>
        {/* Active page label */}
        <span className="ml-auto text-xs text-sand-400 capitalize">
          {NAV.find(n => n.href === pathname)?.label || NAV.find(n => pathname.startsWith(n.href))?.label || ''}
        </span>
      </div>

      {/* ── Main content ── */}
      <main className={cn(
        'flex-1 min-h-screen',
        'lg:ml-56',           // desktop: offset for sidebar
        'pt-14 lg:pt-0',      // mobile: offset for top bar
        'px-3 py-3 sm:px-5 sm:py-4 lg:px-8 lg:py-6', // responsive padding
      )}>
        {children}
      </main>
    </div>
  )
}
