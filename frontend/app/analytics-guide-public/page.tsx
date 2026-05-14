'use client'

/**
 * Public Analytics Guide Page — accessible from landing page without login.
 * Explains every chart and metric in the HomeVal analytics dashboard.
 */

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { isLoggedIn } from '@/lib/auth'

// ── Analytics Sections Data ───────────────────────────────────────────────────
const SECTIONS = [
  {
    id: 'descriptive', label: 'Descriptive', icon: '◈',
    description: 'Overall market snapshot — prices, distributions, and property composition.',
    analyses: [
      { title: 'KPI Cards', chart: 'Number cards', icon: '🔢',
        what: 'A row of key performance indicators: average price, median, price/m², yield, ROI, total listings, overpriced %, demand score, ML R², and compound %.',
        why: 'Provides an instant scannable market summary without interpreting any chart.',
        benefits: 'Allows buyers, sellers, and investors to orient themselves in seconds.',
        how: 'Each card shows a headline number and sub-label. Green = positive signal, orange = caution, red = risk.',
        usecase: 'An investor sees AVG PRICE = EGP 4.2M and YIELD = 6.1% — immediately knows if the market fits their return requirement.' },
      { title: 'Price by Area (Top 20)', chart: 'Bar chart', icon: '📊',
        what: 'Average listed price (EGP) for the 20 highest-priced Egyptian areas, sorted descending.',
        why: 'Location is the primary price driver in Egypt. This makes inter-area comparisons instant.',
        benefits: 'Buyers shortlist affordable areas; investors identify premium zones.',
        how: 'X-axis = area name. Y-axis = average price EGP. Taller bar = more expensive area.',
        usecase: 'A buyer with a EGP 3M budget sees Zamalek is out of range and focuses on Nasr City instead.' },
      { title: 'Price Distribution', chart: 'Histogram', icon: '📉',
        what: 'Distribution of all 30,000 listing prices across 40 bins from EGP 0 to 25M.',
        why: 'Raw averages hide the shape of the market — histogram reveals clustering or fragmentation.',
        benefits: 'Investors see where majority supply sits and spot thin/thick price segments.',
        how: 'X-axis = price bucket (millions EGP). Y-axis = listing count. Tall narrow peak = concentrated market.',
        usecase: 'A developer notes a gap at 6–8M EGP — thin supply at that level represents a market opportunity.' },
      { title: 'Property Type Mix', chart: 'Donut chart', icon: '🍩',
        what: 'Proportion of each property type (Apartment, Villa, Studio, Duplex, Penthouse, Townhouse).',
        why: 'Type mix affects price benchmarks — averaging studios and villas is misleading.',
        benefits: 'Buyers understand scarcity of their target type; developers gauge competition.',
        how: 'Each slice = one type. Larger slice = more common. Hover for count and percentage.',
        usecase: 'Studios are 10% of inventory — a rental investor notes this scarcity could support premium yields.' },
      { title: 'Price Range Buckets', chart: 'Horizontal bar', icon: '🪣',
        what: 'Count of listings in 6 brackets: <1M, 1–3M, 3–5M, 5–10M, 10–20M, 20M+.',
        why: 'Cleaner segmentation tied to real buyer budget ranges.',
        benefits: 'Financial advisors instantly see supply in each lending bracket.',
        how: 'Longer bar = more supply. The 1–3M bar is typically largest (mid-market dominance).',
        usecase: 'A bank building a 5M EGP mortgage product checks the 3–5M bar to gauge demand for their product.' },
    ],
  },
  {
    id: 'univariate', label: 'Univariate', icon: '📐',
    description: 'Statistical deep-dive into each individual variable.',
    analyses: [
      { title: 'Statistical Summary', chart: 'Numeric table', icon: '🔬',
        what: 'For each numeric field shows: mean, median, std, min, max, Q25, Q75, skewness, kurtosis.',
        why: 'Foundation of any data analysis — understanding individual distributions prevents misinterpretation.',
        benefits: 'Data scientists spot skewed distributions; investors compare median vs mean to detect outlier distortion.',
        how: 'Skewness > 1 = right-skewed (luxury outliers pull up mean). Use median for typical market reporting.',
        usecase: 'Price skewness of 2.8 tells an analyst to use median not mean for typical market reports.' },
      { title: 'Distribution Histograms', chart: 'Small multiples', icon: '📊',
        what: 'Individual histograms for: price, sqm rate, area, yield, metro distance, building age.',
        why: 'Each variable has a unique shape affecting how it should be modelled and interpreted.',
        benefits: 'Reveals outliers, bimodal distributions (two market segments), and data quality issues.',
        how: 'Look for: bell curve (normal), right tail (skewed), cliff edge (data cap or rounding).',
        usecase: 'A spike at 120m² confirms this is the most common apartment size — peak market demand.' },
    ],
  },
  {
    id: 'multivariate', label: 'Multivariate', icon: '🔗',
    description: 'How variables relate to each other.',
    analyses: [
      { title: 'Correlation Matrix', chart: 'Heatmap grid', icon: '🌡️',
        what: '10×10 grid showing Pearson correlation between all numeric variable pairs.',
        why: 'Understanding which variables move together helps identify price drivers and avoid double-counting.',
        benefits: 'Investors find strongest price drivers; model builders detect multicollinearity.',
        how: 'Dark green = strong positive correlation. Dark red = strong negative. White = no relationship.',
        usecase: 'MetroDist correlation of -0.42 with price confirms metro proximity adds value — investor targets near-metro units.' },
      { title: 'Condition × Finishing', chart: 'Cross-tab heatmap', icon: '🎨',
        what: 'Average price for every combination of property condition (5 levels) × finishing type (3 levels).',
        why: 'Condition and finishing interact — combined effect exceeds the sum of each factor individually.',
        benefits: 'Renovation investors quantify the value of upgrading both simultaneously.',
        how: 'Darker cell = higher average price. Top-right cell (Excellent + Fully Finished) is always darkest.',
        usecase: 'A landlord sees upgrading to Fully Finished adds EGP 800K — justifying a EGP 500K renovation budget.' },
      { title: 'Furnished × Finishing', chart: 'Cross-tab heatmap', icon: '🛋️',
        what: 'Average price for every combination of furnishing level × finishing type.',
        why: 'Separates furnishing and finishing contributions to price — often conflated.',
        benefits: 'Sellers decide whether to invest in furnishing vs finishing to maximise sale price.',
        how: 'Compare "Furnished + Core & Shell" vs "Unfurnished + Fully Finished" to isolate finishing value.',
        usecase: 'Heatmap reveals finishing type outweighs furnishing in buyer preferences.' },
    ],
  },
  {
    id: 'investment', label: 'Investment', icon: '💰',
    description: 'ROI, rental yield, compound premium, and amenity value.',
    analyses: [
      { title: 'ROI by Area', chart: 'Bar chart', icon: '📈',
        what: 'Average Return on Investment (%) per area: (market_value − price) / price × 100.',
        why: 'Not all cheap areas are good investments — ROI normalises for price level.',
        benefits: 'Investors rank areas by value-for-money, revealing hidden opportunities in secondary markets.',
        how: 'Taller bar = better investment value. Bars above 8% = above-average opportunity.',
        usecase: 'Badr City ROI of 12% vs Zamalek at 3% — investor allocates to Badr City for income properties.' },
      { title: 'Amenity Premium', chart: 'Grouped bar chart', icon: '🏊',
        what: 'For each amenity (pool, gym, security, elevator, balcony, compound): price WITH vs WITHOUT and premium %.',
        why: 'Amenities have costs — this quantifies whether the market actually rewards each one.',
        benefits: 'Developers make evidence-based decisions on which amenities to include.',
        how: 'Each group = one amenity. Blue bar = without, green = with. The gap = EGP premium.',
        usecase: 'Pool adds 18% to price but costs EGP 200K — on a 3M unit, that\'s a EGP 540K uplift, profitable upgrade.' },
      { title: 'Compound Premium', chart: 'Bar chart by area', icon: '🏘️',
        what: 'Average price inside vs outside a compound per area, and the compound premium %.',
        why: 'Compound premium varies widely — in some areas 30%, others near zero.',
        benefits: 'Investors choose compound vs standalone based on local premiums.',
        how: 'Two bars per area: orange (non-compound), green (compound). Larger gap = bigger premium.',
        usecase: 'New Administrative Capital shows 28% compound premium — developer prices gated units accordingly.' },
      { title: 'Rental Yield by Area', chart: 'Bar chart', icon: '🏦',
        what: 'Estimated annual rental yield (%) per area: annual_rent_estimate / price × 100.',
        why: 'Capital growth and rental income are different strategies — yield maps the income geography.',
        benefits: 'Buy-to-let investors identify areas with best rental income relative to purchase price.',
        how: 'Higher bar = better rental income return. Tourist areas typically show highest yields.',
        usecase: 'Hurghada 9.2% yield vs Cairo average 5% — investor buys holiday unit for short-term rental.' },
    ],
  },
  {
    id: 'location', label: 'Location', icon: '📍',
    description: 'Area comparison, market heat index, and distance impact.',
    analyses: [
      { title: 'Area Comparison Table', chart: 'Sortable table', icon: '🗺️',
        what: 'One row per area: avg price, median, sqm rate, count, ROI, yield, overpriced %, metro dist, demand score, HOT/WARM/COLD.',
        why: 'Tables are necessary for precise comparisons and due diligence.',
        benefits: 'Investors sort by any column to find the best area for their specific criteria.',
        how: 'HOT = demand score > 66, WARM = 33–66, COLD = below 33. Red overpriced % = caution.',
        usecase: 'Investor sorts by yield descending, cross-checks low overpriced % — confirms genuine market value.' },
      { title: 'Market Heat Bubble Chart', chart: 'Bubble scatter', icon: '🔥',
        what: 'Each bubble = one area. X = ROI, Y = yield, size = listing count, colour = HOT/WARM/COLD.',
        why: 'Combines four dimensions into one visual — most information-dense chart on the dashboard.',
        benefits: 'Ideal investment zone is top-right (high ROI + high yield) with large bubble (liquid market).',
        how: 'Top-right = best investment profile. Red = HOT demand. Large bubble = more supply (less liquidity risk).',
        usecase: 'Fund manager spots a mid-size green bubble top-right — WARM but high-return area, allocates before it heats up.' },
      { title: 'Box Plot by Area', chart: 'Box and whisker', icon: '📦',
        what: 'For each area: P10, P25, median, P75, P90 price distribution.',
        why: 'Averages hide price spread. Wide box = volatile market. Narrow box = consistent pricing.',
        benefits: 'Negotiators use P10–P25 as realistic low offers. Sellers price above P75 for premium positioning.',
        how: 'Box = interquartile range (P25–P75). Line = median. Whiskers = P10 and P90.',
        usecase: 'Zamalek P25 = EGP 8M, P75 = EGP 22M — enormous range signals occasional below-average buying opportunities.' },
    ],
  },
  {
    id: 'risk', label: 'Risk', icon: '⚡',
    description: 'Risk scores, volatility, and overpricing flags.',
    analyses: [
      { title: 'Overpriced % by Area', chart: 'Ranked bar chart', icon: '🚩',
        what: 'Areas ranked by % of listings priced >15% above the local sqm market rate.',
        why: 'High overpriced % = speculative market = higher buyer risk, slower transaction velocity.',
        benefits: 'Risk-averse buyers avoid high-overpriced-% areas. Bargain hunters target them for negotiation room.',
        how: 'Y-axis = % overpriced. Areas above 25% = elevated risk.',
        usecase: 'Target area is 42% overpriced — buyer broadens search to neighbouring area at 11%, reducing risk.' },
      { title: 'Price Volatility by Area', chart: 'Std deviation bar', icon: '📉',
        what: 'Standard deviation of listing prices within each area — a measure of price spread and stability.',
        why: 'High std dev = unpredictable market = harder to value, finance, and exit.',
        benefits: 'Conservative investors prefer low-volatility areas. Speculators target high-volatility for outsized returns.',
        how: 'Y-axis = std dev in EGP millions. Compare to area\'s median price to contextualise.',
        usecase: 'Same median price: Area A std dev 1.2M vs Area B 3.8M — pension fund buys A, speculator targets B.' },
    ],
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
          <span className="text-sand-700 text-sm font-medium">Analytics Guide</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/team-public" className="text-sm text-sand-600 hover:text-brand-600 font-medium transition-colors hidden sm:block">Team</Link>
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

// ── Analysis Card ─────────────────────────────────────────────────────────────
function AnalysisCard({ a }: { a: typeof SECTIONS[0]['analyses'][0] }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="bg-white border border-sand-200 rounded-2xl overflow-hidden hover:border-brand-200 transition-all">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-sand-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl w-8 text-center">{a.icon}</span>
          <div>
            <p className="font-semibold text-sand-900 text-sm">{a.title}</p>
            <p className="text-sand-400 text-xs mt-0.5">{a.chart}</p>
          </div>
        </div>
        <span className={`text-sand-400 text-sm transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>▼</span>
      </button>
      {open && (
        <div className="border-t border-sand-100 px-5 py-5 space-y-4">
          {[
            { label: '📌 What it represents', text: a.what },
            { label: '🎯 Why it exists',       text: a.why },
            { label: '✅ Benefits',            text: a.benefits },
            { label: '📖 How to read it',      text: a.how },
            { label: '💼 Real use case',       text: a.usecase },
          ].map(({ label, text }) => (
            <div key={label}>
              <p className="text-xs font-semibold text-brand-600 mb-1">{label}</p>
              <p className="text-sand-600 text-sm leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AnalyticsGuidePublicPage() {
  const [authed, setAuthed] = useState(false)
  const [active, setActive] = useState(SECTIONS[0].id)
  useEffect(() => { if (isLoggedIn()) setAuthed(true) }, [])

  const section = SECTIONS.find(s => s.id === active)!
  const total = SECTIONS.reduce((n, s) => n + s.analyses.length, 0)

  return (
    <div className="min-h-screen bg-sand-50 font-body">
      <Nav authed={authed} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-100 rounded-full px-4 py-1.5 mb-4">
            <span className="w-2 h-2 rounded-full bg-brand-500"/>
            <span className="text-brand-700 text-xs font-semibold uppercase tracking-widest">Dashboard Documentation</span>
          </div>
          <h1 className="font-display text-4xl text-brand-900 mb-4">Analytics Guide</h1>
          <p className="text-sand-600 text-base leading-relaxed">
            A complete reference for every chart, metric, and analysis tab in the HomeVal Market Analytics dashboard.
          </p>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-4 flex-wrap">
          {[
            { v: String(SECTIONS.length), l: 'Dashboard tabs', icon: '◈' },
            { v: String(total),           l: 'Charts & metrics', icon: '📊' },
            { v: '30K',                   l: 'Data records', icon: '🗄️' },
            { v: '25',                    l: 'Egyptian cities', icon: '📍' },
          ].map(s => (
            <div key={s.l} className="bg-white border border-sand-200 rounded-xl px-5 py-3 flex items-center gap-3">
              <span className="text-lg">{s.icon}</span>
              <div>
                <p className="font-display text-xl text-brand-700">{s.v}</p>
                <p className="text-sand-500 text-xs">{s.l}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tab selector */}
        <div className="flex gap-2 flex-wrap justify-center">
          {SECTIONS.map(s => (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                active === s.id
                  ? 'bg-brand-500 text-white shadow-md'
                  : 'bg-white border border-sand-200 text-sand-600 hover:border-brand-200 hover:text-brand-600'
              }`}
            >
              <span>{s.icon}</span>
              <span>{s.label}</span>
              <span className={`text-xs rounded-full px-1.5 py-0.5 ${active === s.id ? 'bg-white/20 text-white' : 'bg-sand-100 text-sand-500'}`}>
                {s.analyses.length}
              </span>
            </button>
          ))}
        </div>

        {/* Active section */}
        <div>
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 className="font-display text-xl text-brand-900 flex items-center gap-2">
                <span>{section.icon}</span>{section.label} Tab
              </h2>
              <p className="text-sand-500 text-sm mt-0.5">{section.description}</p>
            </div>
            <span className="bg-brand-50 text-brand-600 text-xs font-semibold px-3 py-1.5 rounded-full border border-brand-100 shrink-0 ml-4">
              {section.analyses.length} {section.analyses.length === 1 ? 'chart' : 'charts'}
            </span>
          </div>
          <div className="space-y-3">
            {section.analyses.map(a => <AnalysisCard key={a.title} a={a} />)}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-brand-900 rounded-2xl p-8 text-white text-center">
          <h3 className="font-display text-2xl mb-2">See it live</h3>
          <p className="text-brand-200 text-sm mb-6 max-w-md mx-auto">
            All these analytics are powered by 30,000 real Egyptian property records — available instantly after signing up.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            {authed
              ? <Link href="/dashboard" className="bg-white text-brand-700 font-semibold text-sm px-6 py-3 rounded-xl hover:bg-brand-50 transition-colors">Open Dashboard →</Link>
              : <Link href="/register" className="bg-white text-brand-700 font-semibold text-sm px-6 py-3 rounded-xl hover:bg-brand-50 transition-colors">Try it free →</Link>
            }
            <Link href="/docs/user" className="border border-white/30 text-white font-medium text-sm px-6 py-3 rounded-xl hover:bg-white/10 transition-colors">Read user guide</Link>
          </div>
        </div>

      </div>

      {/* Footer */}
      <div className="border-t border-sand-200 py-8 text-center mt-4">
        <p className="text-xs text-sand-400">HomeVal v2.0 · Egypt Property Intelligence Platform</p>
      </div>
    </div>
  )
}
