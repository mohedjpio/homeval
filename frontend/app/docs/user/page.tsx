'use client'
import Link from 'next/link'
import { useState } from 'react'

const NAV = [
  { id: 'start',     label: 'Getting Started' },
  { id: 'predict',   label: 'Price Prediction' },
  { id: 'analytics', label: 'Market Analytics' },
  { id: 'chat',      label: 'AI Assistant' },
  { id: 'history',   label: 'History' },
  { id: 'settings',  label: 'Settings' },
  { id: 'faq',       label: 'FAQ' },
]

const Step = ({ n, title, children }: { n: number; title: string; children: React.ReactNode }) => (
  <div className="flex gap-4 mb-6">
    <div className="flex flex-col items-center">
      <div className="w-8 h-8 rounded-full bg-brand-500 text-white text-sm font-bold flex items-center justify-center shrink-0">{n}</div>
      <div className="w-px flex-1 bg-brand-100 mt-2"/>
    </div>
    <div className="pb-6 flex-1">
      <p className="font-semibold text-sand-900 text-sm mb-1">{title}</p>
      <div className="text-sand-600 text-sm leading-relaxed">{children}</div>
    </div>
  </div>
)

const Tip = ({ emoji = '💡', children }: { emoji?: string; children: React.ReactNode }) => (
  <div className="bg-brand-50 border border-brand-100 rounded-xl p-4 text-sm text-brand-800 leading-relaxed mb-4 flex gap-2">
    <span className="shrink-0">{emoji}</span><span>{children}</span>
  </div>
)

const Warn = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800 leading-relaxed mb-4 flex gap-2">
    <span className="shrink-0">⚠️</span><span>{children}</span>
  </div>
)

const H2 = ({ id, children }: { id: string; children: React.ReactNode }) => (
  <h2 id={id} className="font-display text-2xl text-brand-900 mt-12 mb-6 pb-3 border-b-2 border-brand-100 scroll-mt-24">{children}</h2>
)

const H3 = ({ children }: { children: React.ReactNode }) => (
  <h3 className="font-semibold text-sand-900 text-base mt-6 mb-3">{children}</h3>
)

const P = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sand-600 text-sm leading-relaxed mb-3">{children}</p>
)

const Pill = ({ children }: { children: React.ReactNode }) => (
  <span className="bg-sand-100 text-sand-700 text-xs font-medium px-2.5 py-1 rounded-full">{children}</span>
)

export default function UserDocs() {
  const [active, setActive] = useState('start')

  const go = (id: string) => {
    setActive(id)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="min-h-screen bg-sand-50 font-body">

      {/* Top nav */}
      <nav className="bg-white/95 backdrop-blur border-b border-sand-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center">
                <svg width="13" height="13" viewBox="0 0 20 20" fill="none"><path d="M3 10L10 3L17 10V17H13V13H7V17H3V10Z" fill="white"/></svg>
              </div>
              <span className="font-display text-lg text-brand-700">HomeVal</span>
            </Link>
            <span className="text-sand-300">/</span>
            <Link href="/docs" className="text-sand-500 text-sm hover:text-brand-600">Docs</Link>
            <span className="text-sand-300">/</span>
            <span className="text-sand-800 text-sm font-medium">User Guide</span>
          </div>
          <Link href="/docs/tech" className="flex items-center gap-1.5 text-xs text-sand-500 hover:text-brand-600 font-medium transition-colors border border-sand-200 px-3 py-1.5 rounded-lg hover:border-brand-200">
            Switch to API Docs →
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 flex gap-8">

        {/* Sidebar */}
        <aside className="hidden lg:block w-52 shrink-0 sticky top-20 h-[calc(100vh-5rem)] py-8">
          <p className="text-xs font-semibold text-sand-400 uppercase tracking-widest mb-4">User Guide</p>
          <nav className="space-y-0.5">
            {NAV.map(n => (
              <button key={n.id} onClick={() => go(n.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                  active === n.id ? 'bg-brand-50 text-brand-700 font-medium' : 'text-sand-600 hover:bg-sand-100 hover:text-sand-900'
                }`}>
                {n.label}
              </button>
            ))}
          </nav>
          <div className="mt-8 bg-brand-500 rounded-xl p-4 text-white">
            <p className="font-semibold text-sm mb-1">Ready to start?</p>
            <p className="text-xs text-white/80 mb-3">Create your free account — no email confirmation.</p>
            <Link href="/register" className="block text-center bg-white text-brand-600 font-semibold text-xs py-2 rounded-lg hover:bg-brand-50 transition-colors">
              Get started free →
            </Link>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 max-w-2xl py-8">

          {/* Header */}
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-100 rounded-full px-3 py-1 mb-4">
              <span className="text-brand-500 text-sm">📖</span>
              <span className="text-brand-700 text-xs font-semibold uppercase tracking-wide">User Guide</span>
            </div>
            <h1 className="font-display text-3xl text-brand-900 mb-3">HomeVal User Guide</h1>
            <P>Learn how to value Egyptian properties, read market data, and get AI-powered insights — step by step.</P>
            <div className="flex gap-2 flex-wrap mt-4">
              <Pill>No setup required</Pill>
              <Pill>No email confirmation</Pill>
              <Pill>Arabic & English</Pill>
            </div>
          </div>

          {/* Getting Started */}
          <H2 id="start">Getting Started</H2>
          <P>HomeVal requires no installation. It runs entirely in your browser. Create an account and you can start valuing properties in under a minute.</P>

          <H3>Create your account</H3>
          <Step n={1} title="Go to the register page">
            Click <strong>Get started free</strong> on the homepage, or navigate to <code className="bg-sand-100 text-brand-700 px-1.5 py-0.5 rounded text-xs">/register</code>.
          </Step>
          <Step n={2} title="Fill in your details">
            Enter your full name, email address, and a password (minimum 8 characters).
          </Step>
          <Step n={3} title="You&apos;re in">
            No email confirmation needed — you are instantly logged in and redirected to the dashboard.
          </Step>

          <Tip>Your account is free. All features including market analytics, predictions, and AI chat are available immediately.</Tip>

          <H3>Dashboard overview</H3>
          <P>After logging in you land on the <strong>Market Analytics</strong> dashboard. The sidebar gives you access to all five sections:</P>
          <div className="grid grid-cols-1 gap-2 mb-6">
            {[
              { icon:'◈', name:'Analytics',    desc:'Market data, charts, and KPIs across all Egyptian cities.' },
              { icon:'◎', name:'Predict',       desc:'Run instant ML-powered property valuations.' },
              { icon:'◇', name:'AI Assistant',  desc:'Chat with an AI that knows the Egyptian property market.' },
              { icon:'◫', name:'History',       desc:'Browse all your past valuations.' },
              { icon:'◉', name:'Settings',      desc:'Update your profile, password, and API keys.' },
            ].map(s => (
              <div key={s.name} className="flex items-center gap-3 bg-white border border-sand-200 rounded-xl px-4 py-3">
                <span className="text-lg text-brand-500 w-6 text-center">{s.icon}</span>
                <div>
                  <span className="font-semibold text-sand-900 text-sm">{s.name}</span>
                  <span className="text-sand-500 text-xs ml-2">{s.desc}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Predict */}
          <H2 id="predict">Price Prediction</H2>
          <P>The prediction tool estimates market value for any Egyptian property using a machine learning model trained on 30,000+ listings.</P>

          <H3>How to run a valuation</H3>
          <Step n={1} title="Navigate to Predict">Click <strong>Predict</strong> in the sidebar.</Step>
          <Step n={2} title="Enter property details">
            Fill in the required fields — location, size, property type, condition, finishing, and amenities. All fields with a <span className="text-red-500">*</span> are required.
          </Step>
          <Step n={3} title="Click &quot;Estimate Value&quot;">
            The model returns a result in under a second.
          </Step>
          <Step n={4} title="Review your results">
            You will see the estimated price in EGP and USD, a confidence range (±12%), and price per m².
          </Step>

          <H3>Understanding the results</H3>
          <div className="bg-white border border-sand-200 rounded-2xl divide-y divide-sand-100 mb-6">
            {[
              ['Estimated Price',   'The model&apos;s best single-point estimate in EGP.'],
              ['USD Equivalent',    'Converted at a fixed rate of EGP 49.5 = USD 1.'],
              ['Confidence Range',  'The likely range the true market value falls within (±12%).'],
              ['Price per m²',      'Useful for comparing properties of different sizes.'],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-4 px-4 py-3">
                <span className="text-xs font-semibold text-sand-800 w-36 shrink-0">{k}</span>
                <span className="text-xs text-sand-600">{v}</span>
              </div>
            ))}
          </div>

          <Tip emoji="💾">Every valuation is saved automatically. Go to <strong>History</strong> to review or delete past predictions.</Tip>

          <H3>Supported locations</H3>
          <P>HomeVal covers 25 Egyptian areas:</P>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {['6th of October City','Ain Sokhna','Aswan','Badr City','Dokki','El Shorouk City',
              'Heliopolis','Hurghada','Ismailia','Luxor','Maadi','Mansoura','Mohandessin',
              'Mostakbal City','Nasr City','New Administrative Capital','New Mansoura',
              'Obour City','Port Said','Sheikh Zayed','Shubra','Suez','Tanta','Zamalek','Alexandria'
            ].map(l => <Pill key={l}>{l}</Pill>)}
          </div>

          {/* Analytics */}
          <H2 id="analytics">Market Analytics</H2>
          <P>The analytics dashboard gives you a professional view of the Egyptian property market based on 30,000 real listings across 25 cities.</P>

          <H3>Dashboard tabs</H3>
          <div className="space-y-1 mb-6">
            {[
              ['Descriptive',  'Overall market KPIs — average prices, distributions, and property mix.'],
              ['Univariate',   'Statistical breakdown of every numeric field (mean, median, std, skew).'],
              ['Multivariate', 'How variables relate — correlation matrix and cross-tab heatmaps.'],
              ['Diagnostic',   'Overpriced listings, outliers, and area risk flags.'],
              ['Predictive',   'ML model performance and feature importance ranking.'],
              ['Investment',   'ROI by area, rental yield estimates, compound and amenity premiums.'],
              ['Location',     'Area-by-area comparison — price per m², demand score, metro proximity.'],
              ['Risk',         'Market volatility, overpriced %, and risk scores by area.'],
              ['AI Insights',  'Auto-generated natural language takeaways from the data.'],
            ].map(([t, d]) => (
              <div key={t} className="grid grid-cols-[120px,1fr] gap-3 py-2.5 border-b border-sand-100 last:border-0 text-xs">
                <span className="font-semibold text-sand-800">{t}</span>
                <span className="text-sand-600">{d}</span>
              </div>
            ))}
          </div>

          <H3>What the KPIs mean</H3>
          <div className="space-y-1 mb-4">
            {[
              ['AVG PRICE',   'Mean listing price across all 30K properties.'],
              ['PRICE/M²',    'Average market rate per square metre.'],
              ['YIELD',       'Estimated annual rental return as % of property value.'],
              ['ROI',         'Expected return based on market rate vs asking price.'],
              ['OVERPRICED',  '% of listings priced >15% above the area&apos;s median rate.'],
              ['DEMAND',      'Heat index (0–100) based on sqm rate vs all other areas.'],
              ['MODEL R²',    'How much variance the analytics ML model explains (0–1).'],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-3 py-2 border-b border-sand-100 last:border-0 text-xs">
                <code className="bg-sand-100 text-brand-700 px-2 py-0.5 rounded font-mono w-28 shrink-0">{k}</code>
                <span className="text-sand-600">{v}</span>
              </div>
            ))}
          </div>

          <Warn>Analytics loads all 30K records on first request — allow up to 10 seconds on a fresh server start.</Warn>

          {/* Chat */}
          <H2 id="chat">AI Assistant</H2>
          <P>The AI assistant is powered by Groq (LLaMA 3) and has deep knowledge of the Egyptian property market. Ask it anything in Arabic or English.</P>

          <H3>What you can ask</H3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
            {[
              '"Is this flat fairly priced for Maadi?"',
              '"Which area gives the best rental yield?"',
              '"Compare Zamalek vs New Cairo prices"',
              '"What ROI can I expect on a studio?"',
              '"How does finishing type affect resale?"',
              '"What&apos;s the impact of metro proximity?"',
              '"Best areas for investment under 3M EGP?"',
              '"How are compound properties different?"',
            ].map(q => (
              <div key={q} className="bg-white border border-sand-200 rounded-lg px-3 py-2.5 text-xs text-sand-700 italic">{q}</div>
            ))}
          </div>

          <H3>Sessions</H3>
          <P>Conversations are grouped into sessions that persist across logins. Start a fresh session for each topic, or continue an existing one from the sidebar. You can delete sessions at any time.</P>

          <Tip emoji="🔑">If the AI returns an error, the Groq API key may need to be configured. Go to Settings to add your own key.</Tip>

          {/* History */}
          <H2 id="history">History</H2>
          <P>Every valuation you run is saved automatically. The History page shows all past predictions with the full input details and results.</P>

          <H3>What&apos;s saved</H3>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {['All input fields','Predicted price EGP & USD','Confidence range','Price per m²','Date & time','Property type & location'].map(i => (
              <div key={i} className="flex items-center gap-2 text-xs text-sand-600">
                <span className="w-4 h-4 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs shrink-0">✓</span>
                {i}
              </div>
            ))}
          </div>
          <Tip>History is stored in Supabase and linked to your account — it persists even if you clear your browser or switch devices.</Tip>

          {/* Settings */}
          <H2 id="settings">Settings</H2>

          <H3>Profile</H3>
          <P>Update your display name and avatar photo. Avatars are auto-generated from your user ID if you haven&apos;t uploaded one.</P>

          <H3>Groq API Key</H3>
          <P>Add your own Groq API key to get higher rate limits for the AI assistant. Your key is stored securely and never exposed to the browser. Get a free key at <strong>console.groq.com</strong>.</P>

          <H3>Password & Account</H3>
          <P>Change your password at any time. Deleting your account permanently removes all predictions, chat history, and personal data — this cannot be undone.</P>

          {/* FAQ */}
          <H2 id="faq">FAQ</H2>
          {[
            ['Do I need to verify my email?',
             'No. HomeVal uses a custom auth system — you are logged in immediately after registering with no email step.'],
            ['How accurate are the valuations?',
             'The ML model achieves R²=0.99 on training data. Treat predictions as market estimates — always do your own due diligence. The ±12% confidence range reflects real market uncertainty.'],
            ['Can I use HomeVal in Arabic?',
             'The AI assistant understands and responds in Arabic. The UI is currently in English only.'],
            ['Is HomeVal free?',
             'Yes, HomeVal is free to use. All features are available with a free account.'],
            ['My analytics show NaN — what do I do?',
             'This usually means the analytics data is still loading on the server. Wait 10 seconds and refresh the page.'],
            ['How do I delete a prediction?',
             'Go to History, find the prediction, and click the delete icon on the right side.'],
            ['What exchange rate is used for USD?',
             'A fixed rate of EGP 49.5 = USD 1 is used for display purposes only.'],
            ['How do I contact support?',
             'Open the AI assistant and describe your issue — or use the feedback form on the homepage.'],
          ].map(([q, a]) => (
            <details key={q as string} className="group border border-sand-200 rounded-xl mb-2 bg-white overflow-hidden">
              <summary className="flex items-center justify-between px-4 py-3.5 cursor-pointer text-sm font-medium text-sand-900 list-none hover:bg-sand-50 transition-colors">
                {q}
                <span className="text-sand-400 group-open:rotate-180 transition-transform ml-2 text-xs">▼</span>
              </summary>
              <div className="px-4 py-3 text-sm text-sand-600 leading-relaxed border-t border-sand-100 bg-sand-50">{a}</div>
            </details>
          ))}

          {/* Footer */}
          <div className="mt-16 pt-8 border-t border-sand-200 flex items-center justify-between">
            <p className="text-xs text-sand-400">HomeVal v2.0 · User Guide</p>
            <Link href="/docs/tech" className="text-xs text-brand-600 hover:underline font-medium">API Reference →</Link>
          </div>

        </main>
      </div>
    </div>
  )
}
