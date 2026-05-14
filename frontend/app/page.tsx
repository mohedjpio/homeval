'use client'
export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { isLoggedIn } from '@/lib/auth'

const FEATURES = [
  { icon:'◎', title:'ML Price Estimation',    desc:'Instant valuations from 30,000+ Egyptian property records.',            color:'bg-brand-50 text-brand-600' },
  { icon:'◈', title:'Market Analytics',        desc:'Price trends, location comparisons, and investor-grade statistics.',   color:'bg-amber-50 text-amber-600' },
  { icon:'◇', title:'AI Property Assistant',   desc:'Ask anything about Egyptian real estate in Arabic or English.',        color:'bg-blue-50 text-blue-600'   },
  { icon:'◫', title:'Prediction History',      desc:'Every valuation saved to your account. Track and compare anytime.',   color:'bg-purple-50 text-purple-600'},
]

const LOCATIONS = [
  'New Cairo','Maadi','Zamalek','Sheikh Zayed','6th October',
  'Heliopolis','Nasr City','Rehab City','North Coast','Ain Sokhna',
  'Dokki','Mohandessin',
]

const STATS = [
  { value:'30,000+', label:'Property records' },
  { value:'35+',     label:'Egyptian cities'  },
  { value:'99%',     label:'Model accuracy'   },
  { value:'<1s',     label:'Valuation speed'  },
]

export default function LandingPage() {
  const [authed,   setAuthed]   = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (isLoggedIn()) setAuthed(true)
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="min-h-screen bg-sand-50 font-body overflow-x-hidden">

      {/* ── Navbar ──────────────────────────────────────────────── */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled?'bg-white/95 backdrop-blur-md shadow-sm border-b border-sand-200':'bg-transparent'}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                <path d="M3 10L10 3L17 10V17H13V13H7V17H3V10Z" fill="white"/>
              </svg>
            </div>
            <span className="font-display text-xl text-brand-700">HomeVal</span>
          </div>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8 text-sm text-sand-600">
            <a href="#features"    className="hover:text-brand-600 transition-colors">Features</a>
            <a href="#how-it-works"className="hover:text-brand-600 transition-colors">How it works</a>
            <a href="#locations"   className="hover:text-brand-600 transition-colors">Coverage</a>
            <Link href="/docs/user"              className="hover:text-brand-600 transition-colors">Guide</Link>
            <Link href="/analytics-guide-public" className="hover:text-brand-600 transition-colors">Analytics</Link>
            <Link href="/team-public"            className="hover:text-brand-600 transition-colors">Team</Link>
            <Link href="/docs"                   className="hover:text-brand-600 transition-colors">Docs</Link>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-2 lg:gap-3 flex-shrink-0">
            {authed ? (
              <Link href="/dashboard" className="bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login"    className="text-sm text-sand-600 hover:text-brand-600 font-medium px-3 py-2">Sign in</Link>
                <Link href="/register" className="bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
                  Get started free
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg border border-sand-200 text-sand-600 hover:bg-sand-50 flex-shrink-0"
            onClick={() => setMenuOpen(v => !v)}
            aria-label="Toggle menu"
          >
            {menuOpen
              ? <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 2l14 14M16 2L2 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              : <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 4h14M2 9h14M2 14h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            }
          </button>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-sand-100 px-4 py-4 space-y-2 shadow-lg">
            <a href="#features"     onClick={()=>setMenuOpen(false)} className="block py-2.5 text-sm text-sand-600 hover:text-brand-600 border-b border-sand-50">Features</a>
            <a href="#how-it-works" onClick={()=>setMenuOpen(false)} className="block py-2.5 text-sm text-sand-600 hover:text-brand-600 border-b border-sand-50">How it works</a>
            <a href="#locations"    onClick={()=>setMenuOpen(false)} className="block py-2.5 text-sm text-sand-600 hover:text-brand-600 border-b border-sand-50">Coverage</a>
            <Link href="/docs/user"              onClick={()=>setMenuOpen(false)} className="block py-2.5 text-sm text-sand-600 hover:text-brand-600 border-b border-sand-50">Guide</Link>
            <Link href="/analytics-guide-public" onClick={()=>setMenuOpen(false)} className="block py-2.5 text-sm text-sand-600 hover:text-brand-600 border-b border-sand-50">Analytics</Link>
            <Link href="/team-public"            onClick={()=>setMenuOpen(false)} className="block py-2.5 text-sm text-sand-600 hover:text-brand-600 border-b border-sand-50">Team</Link>
            <Link href="/docs"                   onClick={()=>setMenuOpen(false)} className="block py-2.5 text-sm text-sand-600 hover:text-brand-600 border-b border-sand-50">Docs</Link>
            <div className="pt-2 flex flex-col gap-2">
              {authed ? (
                <Link href="/dashboard" className="block w-full text-center bg-brand-500 text-white font-medium py-2.5 rounded-xl text-sm" onClick={()=>setMenuOpen(false)}>
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/login"    className="block w-full text-center border border-sand-200 text-sand-700 font-medium py-2.5 rounded-xl text-sm" onClick={()=>setMenuOpen(false)}>Sign in</Link>
                  <Link href="/register" className="block w-full text-center bg-brand-500 text-white font-medium py-2.5 rounded-xl text-sm" onClick={()=>setMenuOpen(false)}>Get started free</Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="relative pt-24 sm:pt-32 pb-16 sm:pb-24 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-72 sm:w-96 h-72 sm:h-96 bg-brand-100 rounded-full opacity-40 blur-3xl"/>
          <div className="absolute top-60 -left-20 w-56 sm:w-72 h-56 sm:h-72 bg-amber-100 rounded-full opacity-30 blur-3xl"/>
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-100 rounded-full px-3 sm:px-4 py-1.5 mb-6 sm:mb-8">
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse flex-shrink-0"/>
            <span className="text-brand-700 text-xs sm:text-sm font-medium">Powered by 30,000+ Egyptian property records</span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl md:text-6xl text-brand-900 leading-tight mb-4 sm:mb-6 px-2">
            Know exactly what your<br className="hidden sm:block"/>
            <span className="text-brand-500"> Egyptian property</span> is worth
          </h1>

          <p className="text-sand-600 text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed px-2">
            HomeVal uses machine learning to give instant, accurate property valuations across Egypt — from New Cairo to the North Coast.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4 sm:px-0">
            <Link href="/register"
              className="w-full sm:w-auto bg-brand-500 hover:bg-brand-600 text-white font-medium text-base px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl transition-all hover:shadow-lg hover:shadow-brand-200 text-center">
              Get your free valuation →
            </Link>
            <Link href="/login"
              className="w-full sm:w-auto bg-white border border-sand-200 hover:border-brand-200 text-sand-700 font-medium text-base px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl transition-colors text-center">
              Sign in to dashboard
            </Link>
          </div>

          {/* Hero card */}
          <div className="mt-12 sm:mt-16 bg-white rounded-2xl border border-sand-200 shadow-xl p-4 sm:p-6 max-w-sm sm:max-w-lg mx-auto text-left">
            <div className="flex items-center justify-between mb-4">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-sand-500 uppercase tracking-wide mb-1">Sample valuation</p>
                <p className="font-medium text-sand-800 text-sm truncate">3BR Apartment · New Cairo · 150m²</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 text-lg flex-shrink-0 ml-3">◎</div>
            </div>
            <div className="bg-brand-700 rounded-xl p-3 sm:p-4 text-white mb-4">
              <p className="text-brand-200 text-xs mb-1">Estimated value</p>
              <p className="font-display text-2xl sm:text-3xl">EGP 6,800,000</p>
              <p className="text-brand-300 text-sm mt-0.5">≈ USD 137,373</p>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-3 text-sm">
              {[['Per m²','45,333 EGP'],['Confidence','±12%'],['Percentile','67th']].map(([l,v])=>(
                <div key={l} className="bg-sand-50 rounded-lg p-2 text-center">
                  <p className="text-sand-500 text-xs mb-0.5">{l}</p>
                  <p className="font-medium text-sand-800 text-xs sm:text-sm">{v}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ───────────────────────────────────────────── */}
      <section className="py-8 sm:py-12 bg-white border-y border-sand-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {STATS.map(s => (
              <div key={s.label} className="text-center">
                <p className="font-display text-3xl sm:text-4xl text-brand-600 mb-1">{s.value}</p>
                <p className="text-sand-500 text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────── */}
      <section id="features" className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="font-display text-3xl sm:text-4xl text-brand-900 mb-3 sm:mb-4">Everything you need to value property in Egypt</h2>
            <p className="text-sand-600 text-base sm:text-lg max-w-xl mx-auto">Four powerful tools in one platform — no spreadsheets, no agents, no guesswork.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {FEATURES.map(f => (
              <div key={f.title} className="bg-white rounded-2xl border border-sand-200 p-5 sm:p-7 hover:border-brand-200 hover:shadow-md transition-all">
                <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl ${f.color} flex items-center justify-center text-lg sm:text-xl mb-3 sm:mb-4`}>{f.icon}</div>
                <h3 className="font-display text-lg sm:text-xl text-brand-900 mb-2">{f.title}</h3>
                <p className="text-sand-600 leading-relaxed text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────── */}
      <section id="how-it-works" className="py-16 sm:py-24 px-4 sm:px-6 bg-white border-y border-sand-100">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="font-display text-3xl sm:text-4xl text-brand-900 mb-3 sm:mb-4">Get a valuation in 3 steps</h2>
            <p className="text-sand-600 text-base sm:text-lg">No paperwork. No waiting. No agent fees.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            {[
              {step:'01',title:'Create your account',desc:'Sign up free in under a minute. No credit card required.'},
              {step:'02',title:'Enter property details',desc:'Fill in location, size, condition, and amenities using our simple form.'},
              {step:'03',title:'Get instant valuation',desc:'Our ML model returns a price estimate, confidence range, and market comparison instantly.'},
            ].map(s => (
              <div key={s.step} className="flex sm:flex-col items-start sm:items-center sm:text-center gap-4 sm:gap-0">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-brand-500 text-white font-display text-base sm:text-lg flex items-center justify-center flex-shrink-0 sm:mb-5">
                  {s.step}
                </div>
                <div>
                  <h3 className="font-display text-lg sm:text-xl text-brand-900 mb-1 sm:mb-2">{s.title}</h3>
                  <p className="text-sand-600 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Locations ────────────────────────────────────────────── */}
      <section id="locations" className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="font-display text-3xl sm:text-4xl text-brand-900 mb-3 sm:mb-4">Covering Egypt&apos;s top property markets</h2>
            <p className="text-sand-600 text-base sm:text-lg">Full market data for 35+ locations across Egypt.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {LOCATIONS.map(loc => (
              <span key={loc} className="bg-white border border-sand-200 text-sand-700 text-xs sm:text-sm font-medium px-3 sm:px-4 py-1.5 sm:py-2 rounded-full hover:border-brand-300 hover:text-brand-600 transition-colors">
                {loc}
              </span>
            ))}
            <span className="bg-brand-50 border border-brand-100 text-brand-600 text-xs sm:text-sm font-medium px-3 sm:px-4 py-1.5 sm:py-2 rounded-full">
              + 23 more
            </span>
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-brand-700 rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-10 -right-10 w-32 sm:w-40 h-32 sm:h-40 bg-brand-600 rounded-full opacity-50"/>
              <div className="absolute -bottom-10 -left-10 w-24 sm:w-32 h-24 sm:h-32 bg-brand-800 rounded-full opacity-50"/>
            </div>
            <div className="relative">
              <h2 className="font-display text-2xl sm:text-4xl mb-3 sm:mb-4">Ready to value your property?</h2>
              <p className="text-brand-200 text-base sm:text-lg mb-6 sm:mb-8 max-w-md mx-auto">
                Join Egyptian property owners and investors using HomeVal.
              </p>
              <Link href="/register"
                className="inline-block bg-white text-brand-700 hover:bg-sand-50 font-medium text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl transition-colors">
                Create free account →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="border-t border-sand-200 py-8 sm:py-10 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                <path d="M3 10L10 3L17 10V17H13V13H7V17H3V10Z" fill="white"/>
              </svg>
            </div>
            <span className="font-display text-lg text-brand-700">HomeVal</span>
          </div>
          <p className="text-sand-500 text-sm text-center">Egyptian Real Estate Intelligence · {new Date().getFullYear()}</p>
          <div className="flex gap-4 sm:gap-6 text-sm text-sand-500">
            <Link href="/login"    className="hover:text-brand-600 transition-colors">Sign in</Link>
            <Link href="/register" className="hover:text-brand-600 transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
