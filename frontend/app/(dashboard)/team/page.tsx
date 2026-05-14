'use client'

/**
 * Developer Team Page
 * Displays all BusCo project team members with professional cards.
 * Team data is stored in a structured array for easy maintenance.
 */

// ── Team Data ────────────────────────────────────────────────────────────────
// Add or remove members here — the UI renders automatically.
const TEAM: {
  id: string
  name: string
  nameAr: string
  role: 'Leader' | 'Member'
  specialty: string
  initials: string
  color: string
  photo: string
  github?: string
  linkedin?: string
}[] = [
  {
    id: '2220367',
    name: 'Mohamed Hassan Mohamed Khalifa',
    nameAr: 'محمد حسن محمد خليفة',
    role: 'Leader',
    specialty: 'Project Lead & Architecture',
    initials: 'MH',
    color: 'from-brand-500 to-brand-700',
    photo: '/team/2220367.jpg',
  },
  {
    id: '2220448',
    name: 'Madeeha Alaa Eldin Yasla',
    nameAr: 'مديحة علاء الدين يسلا',
    role: 'Member',
    specialty: 'Frontend Development',
    initials: 'MA',
    color: 'from-violet-500 to-violet-700',
    photo: '/team/2220448.jpg',
  },
  {
    id: '2220192',
    name: 'Sami Jamal Kamel Qabeel',
    nameAr: 'سامي جمال كامل قابيل',
    role: 'Member',
    specialty: 'Backend Development',
    initials: 'SJ',
    color: 'from-blue-500 to-blue-700',
    photo: '/team/2220192.jpg',
  },
  {
    id: '2220436',
    name: 'Mohamed Essam Mahmoud Adel',
    nameAr: 'محمد عصام محمود عادل',
    role: 'Member',
    specialty: 'Machine Learning',
    initials: 'ME',
    color: 'from-amber-500 to-amber-700',
    photo: '/team/2220436.jpg',
  },
  {
    id: '2220183',
    name: 'Ziad Mamdouh Elsayed Mahmoud',
    nameAr: 'زياد ممدوح السيد محمود',
    role: 'Member',
    specialty: 'Data Engineering',
    initials: 'ZM',
    color: 'from-rose-500 to-rose-700',
    photo: '/team/2220183.jpg',
  },
  {
    id: '2220470',
    name: 'Mustafa Jamal Kamel Qabeel',
    nameAr: 'مصطفى جمال كامل قابيل',
    role: 'Member',
    specialty: 'Database & API',
    initials: 'MQ',
    color: 'from-teal-500 to-teal-700',
    photo: '/team/2220470.jpg',
  },
  {
    id: '2220532',
    name: 'Yousef Adel Ahmed Zaki',
    nameAr: 'يوسف عادل أحمد ذكي',
    role: 'Member',
    specialty: 'UI/UX Design',
    initials: 'YA',
    color: 'from-indigo-500 to-indigo-700',
    photo: '/team/2220532.jpg',
  },
]

// ── Role Badge ───────────────────────────────────────────────────────────────
function RoleBadge({ role }: { role: 'Leader' | 'Member' }) {
  return role === 'Leader' ? (
    <span className="inline-flex items-center gap-1 bg-brand-50 text-brand-700 border border-brand-200 text-xs font-semibold px-2.5 py-1 rounded-full">
      <span className="text-amber-500">★</span> Team Leader
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 bg-sand-100 text-sand-600 text-xs font-medium px-2.5 py-1 rounded-full">
      Member
    </span>
  )
}

// ── Member Card ───────────────────────────────────────────────────────────────
function MemberCard({ member }: { member: typeof TEAM[0] }) {
  return (
    <div className="group bg-white border border-sand-200 rounded-2xl overflow-hidden hover:shadow-xl hover:border-brand-200 hover:-translate-y-1 transition-all duration-300 flex flex-col">

      {/* Avatar header */}
      <div className={`relative bg-gradient-to-br ${member.color} p-8 flex flex-col items-center`}>
        {/* Decorative circles */}
        <div className="absolute top-2 right-3 w-16 h-16 rounded-full bg-white/10"/>
        <div className="absolute -bottom-3 -left-3 w-20 h-20 rounded-full bg-white/5"/>

        {/* Avatar — shows real photo if available, falls back to initials */}
        <div className="relative w-20 h-20 rounded-2xl shadow-lg mb-3">
          <img
            src={member.photo}
            alt={member.name}
            className="w-20 h-20 rounded-2xl object-cover border-2 border-white/30"
            onError={(e) => {
              // Fallback to initials div if image not found
              const target = e.currentTarget
              target.style.display = 'none'
              const fallback = target.nextElementSibling as HTMLElement
              if (fallback) fallback.style.display = 'flex'
            }}
          />
          {/* Initials fallback — hidden by default, shown if photo fails */}
          <div
            className={`absolute inset-0 rounded-2xl bg-white/20 backdrop-blur items-center justify-center border-2 border-white/30 hidden`}
          >
            <span className="font-display text-2xl text-white font-bold">{member.initials}</span>
          </div>
          {member.role === 'Leader' && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center shadow-md z-10">
              <span className="text-xs">★</span>
            </div>
          )}
        </div>

        {/* Role badge */}
        <RoleBadge role={member.role} />
      </div>

      {/* Info */}
      <div className="p-5 flex flex-col flex-1">
        {/* Name */}
        <h3 className="font-semibold text-sand-900 text-sm leading-tight mb-0.5 group-hover:text-brand-700 transition-colors">
          {member.name}
        </h3>
        <p className="text-sand-400 text-xs mb-3 font-body" dir="rtl">{member.nameAr}</p>

        {/* Specialty */}
        <div className="flex items-center gap-1.5 mb-4">
          <span className="text-brand-500 text-xs">◎</span>
          <span className="text-sand-600 text-xs">{member.specialty}</span>
        </div>

        {/* Divider */}
        <div className="border-t border-sand-100 pt-4 mt-auto">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-sand-400 uppercase tracking-widest font-semibold">Student ID</p>
              <p className="text-sand-700 text-sm font-mono font-semibold">{member.id}</p>
            </div>
            {/* Avatar placeholder — replace src with real photo URL */}
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${member.color} opacity-20 group-hover:opacity-40 transition-opacity`}/>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Stats Bar ─────────────────────────────────────────────────────────────────
function StatCard({ value, label, icon }: { value: string; label: string; icon: string }) {
  return (
    <div className="bg-white border border-sand-200 rounded-xl px-5 py-4 flex items-center gap-3">
      <span className="text-xl">{icon}</span>
      <div>
        <p className="font-display text-xl text-brand-700">{value}</p>
        <p className="text-sand-500 text-xs">{label}</p>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function TeamPage() {
  const leader = TEAM.find(m => m.role === 'Leader')!
  const members = TEAM.filter(m => m.role === 'Member')

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-10">

      {/* Page header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-brand-500 text-lg">◈</span>
          <span className="text-xs font-semibold text-sand-400 uppercase tracking-widest">BusCo Project</span>
        </div>
        <h1 className="font-display text-3xl text-brand-900 mb-2">Developer Team</h1>
        <p className="text-sand-600 text-sm max-w-lg">
          Meet the team behind HomeVal — a group of passionate engineers and designers building Egypt&apos;s smartest property valuation platform.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard value={String(TEAM.length)} label="Team members"   icon="👥" />
        <StatCard value="1"                   label="Team leader"    icon="⭐" />
        <StatCard value="6"                   label="Developers"     icon="💻" />
        <StatCard value="2024"                label="Project year"   icon="📅" />
      </div>

      {/* Leader spotlight */}
      <section>
        <h2 className="text-xs font-semibold text-sand-400 uppercase tracking-widest mb-4 flex items-center gap-2">
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

      {/* Members grid */}
      <section>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map(m => <MemberCard key={m.id} member={m} />)}
        </div>
      </section>

      {/* Project info footer */}
      <div className="bg-gradient-to-br from-brand-900 to-brand-700 rounded-2xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <p className="text-brand-200 text-xs uppercase tracking-widest font-semibold mb-1">About the Project</p>
          <h3 className="font-display text-xl mb-2">HomeVal — Egypt Property Intelligence</h3>
          <p className="text-brand-200 text-sm leading-relaxed max-w-md">
            AI-powered property valuation platform covering 25+ Egyptian cities, built with Next.js, FastAPI, and a custom ML model trained on 30,000+ listings.
          </p>
        </div>
        <div className="flex flex-col gap-2 shrink-0">
          {[
            ['Stack',    'Next.js + FastAPI'],
            ['ML Model', 'R² = 0.99'],
            ['Data',     '30,000+ records'],
            ['Areas',    '25 Egyptian cities'],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center gap-3">
              <span className="text-brand-300 text-xs w-16 shrink-0">{k}</span>
              <span className="text-white text-xs font-semibold">{v}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
