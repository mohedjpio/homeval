'use client'

/**
 * HomeVal v2 — Interactive Presentation Page
 * Isolated module: does NOT import from or modify any other dashboard/app code.
 * Route: /presentation
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────

const CHAPTERS = [
  { id: 'hero',         label: 'Home',          num: '00' },
  { id: 'overview',     label: 'Overview',       num: '01' },
  { id: 'architecture', label: 'Architecture',   num: '02' },
  { id: 'ml',           label: 'ML & Data',      num: '03' },
  { id: 'security',     label: 'Security',       num: '04' },
  { id: 'closing',      label: 'Future',         num: '05' },
]

const STATS = [
  { value: 30000, label: 'Property Records', suffix: '+', prefix: '' },
  { value: 32,    label: 'Engineered Features', suffix: '',  prefix: '' },
  { value: 25,    label: 'Egyptian Cities', suffix: '+', prefix: '' },
  { value: 17,    label: 'Chart Types', suffix: '+', prefix: '' },
]

const FEATURES = [
  {
    icon: '◈',
    title: 'ML Price Prediction',
    desc: '32-feature HistGradientBoostingRegressor returns EGP price, USD equivalent, ±8% confidence band, price/m², and percentile rank.',
    color: 'from-emerald-500/20 to-teal-500/20',
    border: 'border-emerald-500/30',
    glow: 'shadow-emerald-500/10',
  },
  {
    icon: '◎',
    title: 'Market Analytics',
    desc: '30+ chart types including histograms, heatmaps, scatter plots, correlation matrices, and feature importance bars.',
    color: 'from-blue-500/20 to-indigo-500/20',
    border: 'border-blue-500/30',
    glow: 'shadow-blue-500/10',
  },
  {
    icon: '◇',
    title: 'AI Property Assistant',
    desc: 'Groq LLaMA-3.3-70B chatbot with Egypt-specific real estate context. Supports custom user API keys.',
    color: 'from-violet-500/20 to-purple-500/20',
    border: 'border-violet-500/30',
    glow: 'shadow-violet-500/10',
  },
  {
    icon: '◫',
    title: 'Prediction History',
    desc: 'Every valuation persisted to Supabase. Users browse, delete, and compare historical predictions over time.',
    color: 'from-amber-500/20 to-orange-500/20',
    border: 'border-amber-500/30',
    glow: 'shadow-amber-500/10',
  },
  {
    icon: '⊕',
    title: 'Custom Authentication',
    desc: 'Independent bcrypt + HS256 JWT system. No Supabase Auth dependency. Full control over token format.',
    color: 'from-rose-500/20 to-pink-500/20',
    border: 'border-rose-500/30',
    glow: 'shadow-rose-500/10',
  },
]

const TIERS = [
  {
    num: '01',
    title: 'Presentation Layer',
    tech: ['Next.js 15 App Router', 'React 19 · Tailwind CSS', 'Recharts · Axios · SWR', 'Port 3000 · Railway'],
    color: 'from-emerald-400 to-teal-400',
    bg: 'from-emerald-950/80 to-teal-950/80',
    border: 'border-emerald-500/30',
  },
  {
    num: '02',
    title: 'Application Layer',
    tech: ['FastAPI Python 3.11', 'Uvicorn · Pydantic v2', 'Auth · Predict · Analytics', 'Port 8000 · Railway'],
    color: 'from-blue-400 to-indigo-400',
    bg: 'from-blue-950/80 to-indigo-950/80',
    border: 'border-blue-500/30',
  },
  {
    num: '03',
    title: 'Data Layer',
    tech: ['Supabase PostgreSQL 15', '5 tables · Full RLS', 'users · predictions · sessions', 'service_role key only'],
    color: 'from-violet-400 to-purple-400',
    bg: 'from-violet-950/80 to-purple-950/80',
    border: 'border-violet-500/30',
  },
]

const ML_PARAMS = [
  { param: 'max_iter',         value: '200',   note: 'Convergence on 20K rows' },
  { param: 'learning_rate',    value: '0.05',  note: 'Prevents overfitting' },
  { param: 'max_depth',        value: '6',     note: '64-leaf interactions' },
  { param: 'min_samples_leaf', value: '20',    note: 'Regularization' },
  { param: 'l2_regularization',value: '0.1',   note: 'Variance reduction' },
  { param: 'random_state',     value: '42',    note: 'Reproducibility' },
]

const FLOW_STEPS = [
  { n: '01', title: 'Register/Login',       desc: 'bcrypt.hashpw(cost=12) → password_hash stored in Supabase' },
  { n: '02', title: 'JWT Issued',           desc: 'HS256 signed, 7-day expiry, stored in localStorage' },
  { n: '03', title: 'Every Request',        desc: 'HTTPBearer → decode_token → get_user_id UUID' },
  { n: '04', title: 'Token Expiry',         desc: '401 → clearAuth() → redirect to /login' },
]

const PREDICT_FLOW = [
  'User Form → Axios POST /api/proxy/predict',
  'Next.js Proxy → FastAPI /api/v1/predict + JWT',
  'Pydantic Validation → MLService @lru_cache',
  '32-Feature Array → HistGBR → log_price',
  'expm1() → EGP price + confidence → Supabase',
]

const SECURITY_LAYERS = [
  { icon: '🔐', title: 'Password Hashing',   desc: 'bcrypt cost 12, ~300ms per hash' },
  { icon: '🔑', title: 'JWT Security',        desc: 'HS256, 256-bit secret, 7-day expiry' },
  { icon: '🛡️', title: 'Database Security',   desc: 'RLS deny-all, service_role only' },
  { icon: '🔒', title: 'API Security',        desc: 'CORS allowlist, Pydantic validation' },
  { icon: '🔏', title: 'Data Protection',     desc: 'password_hash stripped from all responses' },
]

const TEAM = [
  { id: '2220367', name: 'Mohamed Hassan',       role: 'Leader', initials: 'MH', color: 'from-emerald-500 to-teal-600' },
  { id: '2220448', name: 'Madeeha Alaa',         role: 'Frontend', initials: 'MA', color: 'from-violet-500 to-purple-600' },
  { id: '2220192', name: 'Sami Jamal',           role: 'Backend', initials: 'SJ', color: 'from-blue-500 to-indigo-600' },
  { id: '2220436', name: 'Mahmoud Essam',        role: 'ML', initials: 'ME', color: 'from-amber-500 to-orange-600' },
  { id: '2220183', name: 'Ziad Mamdouh',         role: 'Data', initials: 'ZM', color: 'from-rose-500 to-pink-600' },
  { id: '2220470', name: 'Mustafa Jamal',        role: 'Database', initials: 'MQ', color: 'from-teal-500 to-cyan-600' },
  { id: '2220409', name: 'Mohamed Maher',        role: 'UI/UX', initials: 'MM', color: 'from-indigo-500 to-blue-600' },
]

// ─────────────────────────────────────────────────────────────────────────────
// HOOKS
// ─────────────────────────────────────────────────────────────────────────────

function useScrollProgress() {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement
      const scrolled = el.scrollTop
      const total = el.scrollHeight - el.clientHeight
      setProgress(total > 0 ? (scrolled / total) * 100 : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return progress
}

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true) }, { threshold })
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, inView }
}

function useActiveSection() {
  const [active, setActive] = useState('hero')
  useEffect(() => {
    const ids = CHAPTERS.map(c => c.id)
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id) })
    }, { threshold: 0.4 })
    ids.forEach(id => { const el = document.getElementById(id); if (el) obs.observe(el) })
    return () => obs.disconnect()
  }, [])
  return active
}

function useCounter(target: number, active: boolean, duration = 1800) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!active) return
    const start = performance.now()
    const frame = (now: number) => {
      const t = Math.min((now - start) / duration, 1)
      const ease = 1 - Math.pow(1 - t, 3)
      setCount(Math.round(ease * target))
      if (t < 1) requestAnimationFrame(frame)
    }
    requestAnimationFrame(frame)
  }, [active, target, duration])
  return count
}

// ─────────────────────────────────────────────────────────────────────────────
// SMALL COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function Particle({ style }: { style: React.CSSProperties }) {
  return <div className="absolute rounded-full bg-emerald-400/10 blur-xl pointer-events-none" style={style} />
}

function GlowBadge({ children, color = 'emerald' }: { children: React.ReactNode; color?: string }) {
  const map: Record<string, string> = {
    emerald: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
    blue:    'bg-blue-500/10 border-blue-500/30 text-blue-300',
    violet:  'bg-violet-500/10 border-violet-500/30 text-violet-300',
  }
  return (
    <span className={`inline-flex items-center gap-1.5 border rounded-full px-3 py-1 text-xs font-medium ${map[color] || map.emerald}`}>
      {children}
    </span>
  )
}

function SectionHeading({ tag, title, sub }: { tag: string; title: React.ReactNode; sub?: string }) {
  return (
    <div className="text-center mb-12 sm:mb-16">
      <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-5">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-emerald-300 text-xs font-semibold uppercase tracking-[0.15em]">{tag}</span>
      </div>
      <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-white mb-4 leading-tight">{title}</h2>
      {sub && <p className="text-white/50 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">{sub}</p>}
    </div>
  )
}

function AnimSection({ id, children, className = '' }: { id: string; children: React.ReactNode; className?: string }) {
  const { ref, inView } = useInView()
  return (
    <section id={id} ref={ref}
      className={`transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}>
      {children}
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// STAT COUNTER CARD
// ─────────────────────────────────────────────────────────────────────────────

function StatCard({ stat, active }: { stat: typeof STATS[0]; active: boolean }) {
  const count = useCounter(stat.value, active)
  return (
    <div className="relative bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6 text-center backdrop-blur-sm hover:bg-white/8 hover:border-emerald-500/30 transition-all group">
      <div className="absolute inset-0 rounded-2xl bg-emerald-500/0 group-hover:bg-emerald-500/5 transition-all" />
      <p className="font-display text-3xl sm:text-4xl lg:text-5xl text-white mb-1">
        {stat.prefix}{count.toLocaleString()}{stat.suffix}
      </p>
      <p className="text-white/50 text-xs sm:text-sm font-medium">{stat.label}</p>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function PresentationPage() {
  const progress   = useScrollProgress()
  const active     = useActiveSection()
  const [menuOpen, setMenuOpen] = useState(false)
  const statsRef   = useRef<HTMLDivElement>(null)
  const [statsVisible, setStatsVisible] = useState(false)

  useEffect(() => {
    if (!statsRef.current) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsVisible(true) }, { threshold: 0.3 })
    obs.observe(statsRef.current)
    return () => obs.disconnect()
  }, [])

  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setMenuOpen(false)
  }, [])

  // Floating particles (memoized positions)
  const particles = [
    { width: 200, height: 200, top: '10%', left: '5%', opacity: 0.6 },
    { width: 300, height: 300, top: '30%', right: '8%', opacity: 0.4 },
    { width: 150, height: 150, top: '60%', left: '20%', opacity: 0.5 },
    { width: 250, height: 250, bottom: '20%', right: '15%', opacity: 0.3 },
    { width: 180, height: 180, top: '80%', left: '50%', opacity: 0.4 },
  ]

  return (
    <div className="min-h-screen bg-[#030a06] text-white font-body selection:bg-emerald-500/30 overflow-x-hidden">

      {/* ── Scroll progress bar ── */}
      <div className="fixed top-0 left-0 right-0 h-0.5 z-[100] bg-white/5">
        <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-100"
          style={{ width: `${progress}%` }} />
      </div>

      {/* ── Sticky Nav ── */}
      <nav className="fixed top-1 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-4xl">
        <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl px-4 sm:px-6 h-14 flex items-center justify-between shadow-2xl shadow-black/50">

          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <svg width="13" height="13" viewBox="0 0 20 20" fill="none">
                <path d="M3 10L10 3L17 10V17H13V13H7V17H3V10Z" fill="white"/>
              </svg>
            </div>
            <span className="font-display text-base text-white">HomeVal <span className="text-emerald-400">v2</span></span>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {CHAPTERS.map(c => (
              <button key={c.id} onClick={() => scrollTo(c.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  active === c.id
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}>
                {c.label}
              </button>
            ))}
          </div>

          {/* CTA + hamburger */}
          <div className="flex items-center gap-2">
            <Link href="/register"
              className="hidden sm:inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-lg shadow-emerald-500/30">
              Try it free →
            </Link>
            <button onClick={() => setMenuOpen(v => !v)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 text-white/70 hover:text-white hover:bg-white/10 transition-all">
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="mt-1.5 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-3 shadow-2xl">
            {CHAPTERS.map(c => (
              <button key={c.id} onClick={() => scrollTo(c.id)}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all mb-0.5 ${
                  active === c.id ? 'bg-emerald-500/20 text-emerald-300' : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}>
                <span className="text-white/30 font-mono text-xs mr-2">{c.num}</span>{c.label}
              </button>
            ))}
            <div className="border-t border-white/10 mt-2 pt-2">
              <Link href="/register" onClick={() => setMenuOpen(false)}
                className="block text-center bg-emerald-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl">
                Try it free →
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ═══════════════════════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════════════════════ */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 pt-20">

        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/40 via-[#030a06] to-[#030a06]" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px]" />
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-teal-500/8 rounded-full blur-[80px]" />
          <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-blue-500/8 rounded-full blur-[80px]" />
        </div>

        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        {/* Floating particles */}
        {particles.map((p, i) => <Particle key={i} style={{ ...p } as React.CSSProperties} />)}

        {/* Content */}
        <div className="relative text-center max-w-5xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-5 py-2 mb-8 animate-fade-up">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-300 text-sm font-semibold tracking-widest uppercase">Technical Documentation</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          {/* Main heading */}
          <h1 className="font-display leading-none mb-6" style={{ animationDelay: '0.1s' }}>
            <span className="block text-5xl sm:text-7xl lg:text-8xl xl:text-9xl text-white">HOMEVAL</span>
            <span className="block text-3xl sm:text-5xl lg:text-6xl xl:text-7xl bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent mt-2">V2</span>
          </h1>

          <p className="text-white/60 text-base sm:text-xl lg:text-2xl max-w-2xl mx-auto mb-3 leading-relaxed">
            AI-Powered Egyptian Real Estate Valuation Platform
          </p>
          <p className="text-white/30 text-xs sm:text-sm font-mono tracking-widest mb-10">
            NEXT.JS 15 · FASTAPI · SUPABASE · HISTGBR · GROQ LLAMA-3.3-70B
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16">
            <button onClick={() => scrollTo('overview')}
              className="group inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-8 py-4 rounded-2xl transition-all shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-0.5">
              Explore Platform
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
            <Link href="/register"
              className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-semibold px-8 py-4 rounded-2xl transition-all">
              Get Started Free
            </Link>
          </div>

          {/* Scroll indicator */}
          <div className="flex flex-col items-center gap-2 text-white/30 animate-bounce">
            <span className="text-xs tracking-widest uppercase">Scroll to explore</span>
            <div className="w-5 h-8 border border-white/20 rounded-full flex items-start justify-center p-1">
              <div className="w-1 h-2 bg-white/40 rounded-full animate-bounce" />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          OVERVIEW
      ═══════════════════════════════════════════════════════════ */}
      <AnimSection id="overview" className="py-24 sm:py-32 px-4">
        <div className="max-w-6xl mx-auto">

          <SectionHeading
            tag="Chapter 01 — Platform Overview"
            title={<>The Egyptian<br /><span className="text-emerald-400">Real Estate</span> Problem</>}
            sub="Severe information asymmetry across Egypt's property market — solved with ML."
          />

          {/* Problem / Solution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-16">
            <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-lg">⚠️</div>
                <h3 className="font-semibold text-white text-lg">The Problem</h3>
              </div>
              <p className="text-white/60 text-sm leading-relaxed mb-4">
                The Egyptian property market suffers from severe information gaps. Sellers price arbitrarily, buyers lack reliable references, and agents quote wildly different figures for comparable units.
              </p>
              <p className="text-white/40 text-sm leading-relaxed">
                Traditional appraisals take days, are expensive, and remain inaccessible to ordinary buyers.
              </p>
            </div>
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-lg">✅</div>
                <h3 className="font-semibold text-white text-lg">The Solution</h3>
              </div>
              <div className="space-y-2">
                {['Instant ML valuations with ±8% confidence', 'Transparent price/m² benchmarks', 'Investment metrics: ROI, rental yield', 'AI assistant with Egypt-specific context', 'Full prediction history tracking'].map((s, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-white/70">
                    <span className="text-emerald-400 text-xs">▶</span>{s}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Target Users */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-20">
            {[
              { emoji: '🏠', title: 'Homebuyers', desc: 'Researching fair prices' },
              { emoji: '📈', title: 'Investors', desc: 'Screening locations for ROI' },
              { emoji: '🏢', title: 'Developers', desc: 'Comparative market analysis' },
              { emoji: '🔬', title: 'Researchers', desc: 'Studying housing market' },
            ].map((u, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5 text-center hover:border-emerald-500/30 hover:bg-white/8 transition-all">
                <div className="text-2xl mb-2">{u.emoji}</div>
                <p className="font-semibold text-white text-sm mb-1">{u.title}</p>
                <p className="text-white/40 text-xs">{u.desc}</p>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div ref={statsRef} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-20">
            {STATS.map((s, i) => <StatCard key={i} stat={s} active={statsVisible} />)}
          </div>

          {/* Features */}
          <h3 className="text-center text-white/40 text-xs uppercase tracking-widest font-semibold mb-8">Core Feature Set</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <div key={i} className={`relative bg-gradient-to-br ${f.color} border ${f.border} rounded-2xl p-5 sm:p-6 hover:-translate-y-1 hover:shadow-xl ${f.glow} transition-all duration-300 backdrop-blur-sm`}>
                <div className="text-2xl mb-3">{f.icon}</div>
                <h4 className="font-semibold text-white text-sm sm:text-base mb-2">{f.title}</h4>
                <p className="text-white/60 text-xs sm:text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </AnimSection>

      {/* ═══════════════════════════════════════════════════════════
          ARCHITECTURE
      ═══════════════════════════════════════════════════════════ */}
      <AnimSection id="architecture" className="py-24 sm:py-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-950/10 to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto relative">

          <SectionHeading
            tag="Chapter 02 — System Architecture"
            title={<>3-Tier <span className="text-emerald-400">Architecture</span></>}
            sub="Stateless backend, external managed database, API proxy pattern eliminates CORS."
          />

          {/* Three tiers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
            {TIERS.map((t, i) => (
              <div key={i} className={`relative bg-gradient-to-br ${t.bg} border ${t.border} rounded-2xl p-6 sm:p-8 backdrop-blur-sm hover:-translate-y-1 transition-all duration-300`}>
                {/* Tier number */}
                <div className={`inline-flex items-center gap-2 bg-gradient-to-r ${t.color} bg-clip-text text-transparent font-display text-sm font-bold mb-4`}>
                  TIER {t.num}
                </div>
                <h3 className="font-semibold text-white text-lg mb-4">{t.title}</h3>
                <div className="space-y-2">
                  {t.tech.map((tech, j) => (
                    <div key={j} className="flex items-center gap-2 text-xs sm:text-sm text-white/70">
                      <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${t.color} flex-shrink-0`} />
                      {tech}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* External services */}
          <div className="bg-white/3 border border-white/10 rounded-2xl p-5 sm:p-8 mb-16">
            <p className="text-white/40 text-xs uppercase tracking-widest font-semibold mb-5 text-center">External Services</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: '⚡', name: 'Groq API',    desc: 'LLaMA-3.3-70B inference', color: 'text-yellow-400' },
                { icon: '☁️', name: 'Cloudinary', desc: 'Avatar CDN & storage',     color: 'text-blue-400' },
                { icon: '🚂', name: 'Railway',    desc: 'Hosting & deployment',      color: 'text-purple-400' },
                { icon: '🛢️', name: 'Supabase',  desc: 'PostgreSQL 15 + RLS',       color: 'text-green-400' },
              ].map((s, i) => (
                <div key={i} className="text-center p-3 sm:p-4 bg-white/3 rounded-xl hover:bg-white/6 transition-all border border-white/5">
                  <div className="text-xl sm:text-2xl mb-2">{s.icon}</div>
                  <p className={`font-semibold text-xs sm:text-sm ${s.color}`}>{s.name}</p>
                  <p className="text-white/40 text-[10px] sm:text-xs mt-0.5">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Auth + prediction flow side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Auth flow */}
            <div className="bg-white/3 border border-white/10 rounded-2xl p-5 sm:p-6">
              <p className="text-white/40 text-xs uppercase tracking-widest font-semibold mb-5">Custom JWT Auth Flow</p>
              <div className="space-y-3">
                {FLOW_STEPS.map((s, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center justify-center flex-shrink-0">{s.n}</div>
                    <div>
                      <p className="text-white text-sm font-medium">{s.title}</p>
                      <p className="text-white/40 text-xs mt-0.5">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Prediction flow */}
            <div className="bg-white/3 border border-white/10 rounded-2xl p-5 sm:p-6">
              <p className="text-white/40 text-xs uppercase tracking-widest font-semibold mb-5">Prediction Data Flow</p>
              <div className="space-y-2 mb-5">
                {PREDICT_FLOW.map((step, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded bg-blue-500/20 border border-blue-500/30 text-blue-300 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i+1}</div>
                    <p className="text-white/70 text-xs sm:text-sm font-mono leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[['~1-3ms', 'Inference Time'], ['32', 'Features'], ['±8%', 'Confidence'], ['3-Layer', 'Fallback']].map(([v, l]) => (
                  <div key={l} className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
                    <p className="text-emerald-300 font-display text-lg">{v}</p>
                    <p className="text-white/40 text-[10px]">{l}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tech stack table */}
          <div className="mt-8 bg-white/3 border border-white/10 rounded-2xl overflow-hidden">
            <div className="px-5 sm:px-6 py-4 border-b border-white/10">
              <p className="text-white/40 text-xs uppercase tracking-widest font-semibold">Technology Stack</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm min-w-[500px]">
                <thead>
                  <tr className="bg-white/3">
                    {['Layer', 'Technology', 'Version', 'Purpose'].map(h => (
                      <th key={h} className="text-left px-4 sm:px-6 py-3 text-white/40 font-semibold uppercase tracking-wide text-[10px] sm:text-xs">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Frontend', 'Next.js',     '15.5.15', 'App Router, API proxy, SSR'],
                    ['Frontend', 'React',        '19',      'Concurrent rendering'],
                    ['Frontend', 'TypeScript',   '5.x',     'Type safety, API contracts'],
                    ['Frontend', 'Recharts',     '2.12.7',  '30+ chart types'],
                    ['Backend',  'FastAPI',       '0.115.0', 'Async ASGI framework'],
                    ['Backend',  'Pydantic v2',   '2.8.2',   'Rust-backed validation'],
                    ['Backend',  'scikit-learn',  '1.5.2',   'HistGBR model'],
                    ['Backend',  'bcrypt+PyJWT',  'Latest',  'Auth & token management'],
                  ].map(([layer, tech, ver, purpose], i) => (
                    <tr key={i} className={`border-t border-white/5 hover:bg-white/3 transition-colors ${i % 2 === 0 ? '' : 'bg-white/2'}`}>
                      <td className="px-4 sm:px-6 py-3">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${layer === 'Frontend' ? 'bg-blue-500/20 text-blue-300' : 'bg-emerald-500/20 text-emerald-300'}`}>{layer}</span>
                      </td>
                      <td className="px-4 sm:px-6 py-3 text-white font-medium">{tech}</td>
                      <td className="px-4 sm:px-6 py-3 text-white/40 font-mono">{ver}</td>
                      <td className="px-4 sm:px-6 py-3 text-white/60">{purpose}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </AnimSection>

      {/* ═══════════════════════════════════════════════════════════
          ML & DATA
      ═══════════════════════════════════════════════════════════ */}
      <AnimSection id="ml" className="py-24 sm:py-32 px-4">
        <div className="max-w-6xl mx-auto">

          <SectionHeading
            tag="Chapter 03 — Data & Machine Learning"
            title={<>30K Dataset &<br /><span className="text-emerald-400">HistGBR Model</span></>}
            sub="32-feature engineering pipeline with HistGradientBoostingRegressor achieving R²=0.95–0.98."
          />

          {/* ML performance stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-12">
            {[
              { val: '0.95-0.98', label: 'R² Score',        color: 'emerald' },
              { val: '~500K',     label: 'MAE (EGP)',        color: 'blue' },
              { val: '0.94-0.97', label: '5-Fold CV R²',     color: 'violet' },
              { val: '1-3ms',     label: 'Inference Time',   color: 'amber' },
            ].map((m, i) => {
              const colors: Record<string, string> = {
                emerald: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-300',
                blue:    'from-blue-500/20 to-indigo-500/20 border-blue-500/30 text-blue-300',
                violet:  'from-violet-500/20 to-purple-500/20 border-violet-500/30 text-violet-300',
                amber:   'from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-300',
              }
              return (
                <div key={i} className={`bg-gradient-to-br ${colors[m.color]} border rounded-2xl p-5 sm:p-6 text-center`}>
                  <p className={`font-display text-2xl sm:text-3xl mb-1 ${colors[m.color].split(' ').pop()}`}>{m.val}</p>
                  <p className="text-white/50 text-xs">{m.label}</p>
                </div>
              )
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
            {/* Hyperparams */}
            <div className="bg-white/3 border border-white/10 rounded-2xl overflow-hidden">
              <div className="px-5 sm:px-6 py-4 border-b border-white/10 flex items-center gap-2">
                <span className="text-emerald-400">⚙️</span>
                <p className="text-white/40 text-xs uppercase tracking-widest font-semibold">Hyperparameters</p>
              </div>
              <div className="divide-y divide-white/5">
                {ML_PARAMS.map((p, i) => (
                  <div key={i} className="flex items-center justify-between px-5 sm:px-6 py-3 hover:bg-white/3 transition-colors">
                    <span className="text-white/60 text-xs sm:text-sm font-mono">{p.param}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-white text-xs sm:text-sm font-mono font-bold">{p.value}</span>
                      <span className="text-white/30 text-xs hidden sm:inline">{p.note}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Feature engineering */}
            <div className="bg-white/3 border border-white/10 rounded-2xl overflow-hidden">
              <div className="px-5 sm:px-6 py-4 border-b border-white/10 flex items-center gap-2">
                <span className="text-blue-400">🔬</span>
                <p className="text-white/40 text-xs uppercase tracking-widest font-semibold">Feature Engineering Pipeline</p>
              </div>
              <div className="divide-y divide-white/5">
                {[
                  { feat: 'log_area',      formula: 'log1p(area_sqm)',     purpose: 'Diminishing returns' },
                  { feat: 'area_sq',       formula: 'area_sqm ** 2',       purpose: 'Non-linear curves' },
                  { feat: 'bed_bath',      formula: 'bedrooms × baths',    purpose: 'Interaction term' },
                  { feat: 'amenity_score', formula: 'sum(6 booleans)',     purpose: 'Composite index' },
                  { feat: 'luxury_flag',   formula: 'binary cross-feature',purpose: 'Luxury signal' },
                  { feat: 'new_building',  formula: '1 if age ≤ 2',        purpose: 'New premium' },
                ].map((f, i) => (
                  <div key={i} className="px-5 sm:px-6 py-2.5 hover:bg-white/3 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-emerald-300 text-xs font-mono font-bold">{f.feat}</span>
                        <span className="text-white/30 text-xs font-mono ml-2">{f.formula}</span>
                      </div>
                      <span className="text-white/40 text-xs shrink-0">{f.purpose}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Analytics dashboard KPIs */}
          <div className="bg-gradient-to-br from-emerald-950/50 to-teal-950/50 border border-emerald-500/20 rounded-2xl p-6 sm:p-8">
            <p className="text-emerald-300 text-xs uppercase tracking-widest font-semibold mb-6 text-center">Analytics Dashboard — Key Metrics</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[['14', 'KPI Cards'], ['17', 'Chart Types'], ['8', 'Auto Insights'], ['25+', 'Cities Covered']].map(([v, l]) => (
                <div key={l} className="text-center p-3 bg-white/5 rounded-xl border border-white/10">
                  <p className="font-display text-2xl text-emerald-300">{v}</p>
                  <p className="text-white/40 text-xs mt-0.5">{l}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { icon: '🚇', val: '+15%', label: 'Metro Premium (<1km)' },
                { icon: '🏊', val: '+12%', label: 'Pool Premium' },
                { icon: '🏘️', val: '+10%', label: 'Compound Premium' },
              ].map((m, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                  <span className="text-xl">{m.icon}</span>
                  <div>
                    <p className="text-emerald-300 font-bold text-sm">{m.val}</p>
                    <p className="text-white/40 text-xs">{m.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AnimSection>

      {/* ═══════════════════════════════════════════════════════════
          SECURITY
      ═══════════════════════════════════════════════════════════ */}
      <AnimSection id="security" className="py-24 sm:py-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/10 to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto relative">

          <SectionHeading
            tag="Chapter 04 — Security & Deployment"
            title={<>Production-Grade<br /><span className="text-blue-400">Security</span></>}
            sub="Five-layer security architecture with Railway deployment and self-healing ML."
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
            {/* Security layers */}
            <div className="space-y-3">
              {SECURITY_LAYERS.map((s, i) => (
                <div key={i} className="flex items-start gap-4 p-4 sm:p-5 bg-white/3 border border-white/10 rounded-2xl hover:border-blue-500/30 hover:bg-white/5 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-lg flex-shrink-0">{s.icon}</div>
                  <div>
                    <p className="text-white font-semibold text-sm mb-0.5">{s.title}</p>
                    <p className="text-white/50 text-xs sm:text-sm">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Deployment */}
            <div className="space-y-4">
              <div className="bg-white/3 border border-white/10 rounded-2xl p-5 sm:p-6">
                <p className="text-white/40 text-xs uppercase tracking-widest font-semibold mb-4">Railway Deployment</p>
                <div className="space-y-3">
                  {[
                    { icon: '⚛️', title: 'Service 1 — Frontend', desc: 'Next.js 15 · Port 3000 · Nixpacks builder', color: 'bg-blue-500/10 border-blue-500/20' },
                    { icon: '🐍', title: 'Service 2 — Backend', desc: 'FastAPI · Uvicorn · Port 8000 · Procfile', color: 'bg-emerald-500/10 border-emerald-500/20' },
                  ].map((s, i) => (
                    <div key={i} className={`${s.color} border rounded-xl p-4 flex items-start gap-3`}>
                      <span className="text-xl">{s.icon}</span>
                      <div>
                        <p className="text-white font-semibold text-sm">{s.title}</p>
                        <p className="text-white/50 text-xs mt-0.5 font-mono">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Scalability */}
              <div className="bg-white/3 border border-white/10 rounded-2xl p-5 sm:p-6">
                <p className="text-white/40 text-xs uppercase tracking-widest font-semibold mb-4">Scalability</p>
                <div className="space-y-2">
                  {['Stateless frontend — horizontal scaling via Railway replicas', 'Stateless backend — JWT auth, no server sessions', 'ML model 7MB per process — each replica loads independently', 'Supabase PgBouncer — thousands of concurrent users'].map((s, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-white/60">
                      <span className="text-emerald-400 mt-0.5 shrink-0">▶</span>{s}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Challenges solved */}
          <div className="bg-gradient-to-br from-amber-950/30 to-orange-950/30 border border-amber-500/20 rounded-2xl p-5 sm:p-8">
            <p className="text-amber-300 text-xs uppercase tracking-widest font-semibold mb-5 text-center">Key Challenges Solved</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { prob: 'numpy ABI mismatch', sol: 'auto-retrain on startup' },
                { prob: 'CORS between services', sol: 'Next.js API proxy pattern' },
                { prob: 'JSON NaN values', sol: 'sanitize() recursive cleaner' },
                { prob: 'Analytics slow load', sol: '@lru_cache module singleton' },
                { prob: 'Chat context loss', sol: 'Full history replay per request' },
                { prob: 'PKL version lock', sol: '3-layer self-healing ML fallback' },
              ].map((c, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-3 sm:p-4">
                  <p className="text-red-400 text-xs font-mono mb-1">{c.prob}</p>
                  <p className="text-white/30 text-xs">→</p>
                  <p className="text-emerald-300 text-xs font-medium mt-0.5">{c.sol}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AnimSection>

      {/* ═══════════════════════════════════════════════════════════
          TEAM
      ═══════════════════════════════════════════════════════════ */}
      <AnimSection id="team" className="py-20 sm:py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <SectionHeading tag="BusCo Project 2026" title={<>Meet the <span className="text-emerald-400">Team</span></>} />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {TEAM.map((m, i) => (
              <div key={i} className="group bg-white/3 border border-white/10 rounded-2xl p-4 text-center hover:border-emerald-500/30 hover:-translate-y-1 transition-all">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${m.color} flex items-center justify-center font-display text-lg text-white font-bold mx-auto mb-3 shadow-lg`}>
                  {m.initials}
                </div>
                <p className="text-white text-xs font-semibold leading-tight">{m.name}</p>
                <p className="text-white/40 text-[10px] mt-0.5">{m.role}</p>
                <p className="text-white/20 text-[9px] font-mono mt-1">{m.id}</p>
              </div>
            ))}
          </div>
        </div>
      </AnimSection>

      {/* ═══════════════════════════════════════════════════════════
          CLOSING / FUTURE
      ═══════════════════════════════════════════════════════════ */}
      <AnimSection id="closing" className="py-24 sm:py-32 px-4 relative overflow-hidden">

        {/* Glow background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-4xl mx-auto relative text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-5 py-2 mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-300 text-sm font-semibold tracking-widest uppercase">Production Ready</span>
          </div>

          <h2 className="font-display text-4xl sm:text-6xl lg:text-7xl text-white mb-4 leading-tight">
            THE FUTURE OF<br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              PROPERTY VALUATION
            </span>
          </h2>

          <p className="text-white/50 text-base sm:text-lg max-w-xl mx-auto mb-12 leading-relaxed">
            Egypt&apos;s most advanced ML-powered real estate platform. Instant valuations, deep market analytics, and AI-driven insights.
          </p>

          {/* Final stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-14">
            {[
              { val: 'R²>0.95', label: 'Model Accuracy' },
              { val: '<1s',     label: 'Inference Speed' },
              { val: '30+',     label: 'Chart Types' },
              { val: '25+',     label: 'Egyptian Cities' },
            ].map((s, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-emerald-500/30 hover:bg-white/8 transition-all">
                <p className="font-display text-2xl sm:text-3xl text-white mb-1">{s.val}</p>
                <p className="text-white/40 text-xs">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Stack badges */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {['NEXT.JS 15', 'FASTAPI', 'SUPABASE', 'HISTGBR', 'GROQ LLAMA-3.3-70B', 'RAILWAY'].map(t => (
              <GlowBadge key={t}>{t}</GlowBadge>
            ))}
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register"
              className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-white font-bold px-10 py-4 rounded-2xl transition-all shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-0.5 text-sm sm:text-base">
              Start Using HomeVal
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
            <Link href="/docs"
              className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/15 hover:border-white/25 text-white font-semibold px-10 py-4 rounded-2xl transition-all text-sm sm:text-base">
              Read Documentation
            </Link>
          </div>
        </div>
      </AnimSection>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-8 px-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center">
            <svg width="11" height="11" viewBox="0 0 20 20" fill="none">
              <path d="M3 10L10 3L17 10V17H13V13H7V17H3V10Z" fill="white"/>
            </svg>
          </div>
          <span className="font-display text-white/60 text-sm">HomeVal v2</span>
        </div>
        <p className="text-white/20 text-xs font-mono">BusCo Project · 2026 · Egypt Property Intelligence</p>
        <div className="flex justify-center gap-4 mt-4">
          <Link href="/" className="text-white/30 hover:text-white/60 text-xs transition-colors">Home</Link>
          <Link href="/docs" className="text-white/30 hover:text-white/60 text-xs transition-colors">Docs</Link>
          <Link href="/team-public" className="text-white/30 hover:text-white/60 text-xs transition-colors">Team</Link>
          <Link href="/register" className="text-white/30 hover:text-white/60 text-xs transition-colors">Register</Link>
        </div>
      </footer>

      {/* ── Floating back to top ── */}
      <button
        onClick={() => scrollTo('hero')}
        className="fixed bottom-6 right-6 w-10 h-10 bg-emerald-500/20 hover:bg-emerald-500/40 border border-emerald-500/30 rounded-xl flex items-center justify-center text-emerald-300 hover:text-white transition-all shadow-lg z-40 backdrop-blur-sm"
        style={{ opacity: progress > 10 ? 1 : 0, pointerEvents: progress > 10 ? 'auto' : 'none', transition: 'opacity 0.3s, background 0.2s' }}>
        ↑
      </button>

    </div>
  )
}
