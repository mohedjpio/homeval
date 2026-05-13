'use client'
import { useState } from 'react'

const SECTIONS = [
  { id: 'overview',    label: 'Overview',         icon: '◈' },
  { id: 'dashboard',  label: 'Analytics',         icon: '◎' },
  { id: 'predict',    label: 'Price Prediction',  icon: '◇' },
  { id: 'chat',       label: 'AI Assistant',      icon: '◫' },
  { id: 'history',    label: 'History',           icon: '◉' },
  { id: 'settings',   label: 'Settings',          icon: '⊕' },
  { id: 'api',        label: 'API Reference',     icon: '⊞' },
  { id: 'faq',        label: 'FAQ',               icon: '⊟' },
]

const Badge = ({ c, children }: { c: string; children: React.ReactNode }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${c}`}>{children}</span>
)

const Code = ({ children }: { children: React.ReactNode }) => (
  <code className="bg-sand-100 text-brand-700 px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>
)

const Block = ({ children }: { children: React.ReactNode }) => (
  <pre className="bg-[#04342c] text-[#9FE1CB] rounded-xl p-4 text-xs font-mono overflow-x-auto leading-relaxed">{children}</pre>
)

const Card = ({ icon, title, desc }: { icon: string; title: string; desc: string }) => (
  <div className="bg-white border border-sand-200 rounded-xl p-4 flex gap-3 hover:border-brand-200 hover:shadow-sm transition-all">
    <span className="text-2xl mt-0.5">{icon}</span>
    <div>
      <p className="font-semibold text-sand-900 text-sm">{title}</p>
      <p className="text-sand-600 text-xs mt-0.5 leading-relaxed">{desc}</p>
    </div>
  </div>
)

const Endpoint = ({ method, path, desc, auth = true }: { method: string; path: string; desc: string; auth?: boolean }) => {
  const colors: Record<string, string> = {
    GET: 'bg-blue-100 text-blue-700',
    POST: 'bg-green-100 text-green-700',
    PUT: 'bg-yellow-100 text-yellow-700',
    DELETE: 'bg-red-100 text-red-700',
  }
  return (
    <div className="flex items-start gap-3 py-3 border-b border-sand-100 last:border-0">
      <Badge c={colors[method] || 'bg-sand-100 text-sand-700'}>{method}</Badge>
      <div className="flex-1 min-w-0">
        <Code>{path}</Code>
        <p className="text-sand-600 text-xs mt-1">{desc}</p>
      </div>
      {auth && <Badge c="bg-brand-50 text-brand-600">Auth</Badge>}
    </div>
  )
}

const Section = ({ id, title, children }: { id: string; title: string; children: React.ReactNode }) => (
  <section id={id} className="mb-16 scroll-mt-8">
    <h2 className="font-display text-2xl text-brand-900 mb-6 pb-3 border-b-2 border-brand-100">{title}</h2>
    {children}
  </section>
)

const H3 = ({ children }: { children: React.ReactNode }) => (
  <h3 className="font-semibold text-sand-900 text-base mt-6 mb-3">{children}</h3>
)

const P = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sand-600 text-sm leading-relaxed mb-3">{children}</p>
)

const Tip = ({ type = 'tip', children }: { type?: 'tip' | 'warning' | 'info'; children: React.ReactNode }) => {
  const styles = {
    tip:     'bg-brand-50 border-brand-200 text-brand-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info:    'bg-blue-50 border-blue-200 text-blue-800',
  }
  const icons = { tip: '💡', warning: '⚠️', info: 'ℹ️' }
  return (
    <div className={`border rounded-xl p-4 text-xs leading-relaxed mb-4 ${styles[type]}`}>
      <span className="mr-2">{icons[type]}</span>{children}
    </div>
  )
}

export default function DocsPage() {
  const [active, setActive] = useState('overview')

  const scrollTo = (id: string) => {
    setActive(id)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="flex gap-0 min-h-screen bg-sand-50">

      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-56 shrink-0 sticky top-0 h-screen bg-white border-r border-sand-200 py-6 px-3">
        <div className="px-3 mb-6">
          <p className="text-xs font-semibold text-sand-400 uppercase tracking-widest">Documentation</p>
        </div>
        <nav className="flex flex-col gap-0.5">
          {SECTIONS.map(s => (
            <button
              key={s.id}
              onClick={() => scrollTo(s.id)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left transition-all ${
                active === s.id
                  ? 'bg-brand-50 text-brand-700 font-medium'
                  : 'text-sand-600 hover:bg-sand-50 hover:text-sand-900'
              }`}
            >
              <span className="text-base">{s.icon}</span>
              {s.label}
            </button>
          ))}
        </nav>
        <div className="mt-auto px-3">
          <div className="bg-brand-50 rounded-xl p-3">
            <p className="text-xs font-semibold text-brand-700 mb-1">HomeVal v2.0</p>
            <p className="text-xs text-brand-600 leading-relaxed">Egypt property valuation platform powered by ML & AI.</p>
          </div>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 max-w-3xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center text-white font-display text-lg">H</div>
            <div>
              <h1 className="font-display text-3xl text-brand-900">HomeVal Docs</h1>
              <p className="text-sand-600 text-sm">Complete guide to the platform</p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Badge c="bg-brand-100 text-brand-700">v2.0</Badge>
            <Badge c="bg-green-100 text-green-700">● Live</Badge>
            <Badge c="bg-sand-100 text-sand-700">30K Records</Badge>
            <Badge c="bg-blue-100 text-blue-700">ML Powered</Badge>
          </div>
        </div>

        {/* ── Overview ─────────────────────────────────────────── */}
        <Section id="overview" title="Overview">
          <P>
            HomeVal is an AI-powered Egyptian real estate valuation platform. It combines
            a machine learning pricing model trained on 30,000+ properties with an AI
            assistant, interactive market analytics, and a full prediction history — giving
            buyers, sellers, and investors a data-driven edge in the Egyptian property market.
          </P>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            <Card icon="◈" title="Market Analytics" desc="Deep-dive dashboards on 25+ Egyptian cities — prices, yields, ROI, heatmaps, and more." />
            <Card icon="◎" title="Price Prediction" desc="ML model predicts property value from 15+ inputs with ±12% confidence interval." />
            <Card icon="◇" title="AI Assistant" desc="Groq-powered chat agent answers market questions using your prediction context." />
            <Card icon="◫" title="History & Tracking" desc="Save and compare every valuation you run across sessions." />
          </div>

          <H3>Tech Stack</H3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-sand-100">
                  <th className="text-left px-3 py-2 text-sand-600 font-semibold rounded-tl-lg">Layer</th>
                  <th className="text-left px-3 py-2 text-sand-600 font-semibold">Technology</th>
                  <th className="text-left px-3 py-2 text-sand-600 font-semibold rounded-tr-lg">Purpose</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Frontend', 'Next.js 15 + Tailwind CSS', 'UI, routing, server proxy'],
                  ['Backend', 'FastAPI (Python 3.12)', 'REST API, ML inference'],
                  ['Database', 'Supabase (PostgreSQL)', 'Users, predictions, sessions'],
                  ['ML Model', 'HistGradientBoostingRegressor', 'Price prediction (R²=0.99)'],
                  ['AI Chat', 'Groq API (LLaMA 3)', 'Natural language Q&A'],
                  ['Auth', 'Custom JWT + bcrypt', 'No email confirmation needed'],
                  ['Images', 'Cloudinary', 'User avatars'],
                  ['Hosting', 'Railway', 'Frontend + Backend services'],
                ].map(([l, t, p]) => (
                  <tr key={l} className="border-b border-sand-100 hover:bg-sand-50">
                    <td className="px-3 py-2 font-medium text-sand-800">{l}</td>
                    <td className="px-3 py-2"><Code>{t}</Code></td>
                    <td className="px-3 py-2 text-sand-600">{p}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* ── Analytics ─────────────────────────────────────────── */}
        <Section id="dashboard" title="Market Analytics">
          <P>
            The analytics dashboard provides a comprehensive view of the Egyptian property
            market using 30,000 real listings. Data is computed once on backend startup and
            cached in memory for instant subsequent loads.
          </P>

          <H3>Dashboard Tabs</H3>
          <div className="space-y-2 mb-6">
            {[
              ['Descriptive',   'KPI cards, price distributions, property type mix, area rankings'],
              ['Univariate',    'Statistical summaries — mean, median, std, skewness, kurtosis for all numeric fields'],
              ['Multivariate',  'Correlation matrix, cross-tab heatmaps (condition × finishing, furnished × type)'],
              ['Diagnostic',    'Outlier detection, overpriced listings, risk flags by area'],
              ['Predictive',    'ML feature importance, price vs size scatter, model performance metrics'],
              ['Investment',    'ROI by area, rental yield, compound premium, amenity value uplift'],
              ['Location',      'Area comparison table, hot/cold market index, distance-to-metro impact'],
              ['Risk',          'Overpriced %, market volatility, area risk scores'],
              ['AI Insights',   'Auto-generated market insights from the data — best ROI areas, premiums, anomalies'],
            ].map(([tab, desc]) => (
              <div key={tab} className="flex gap-3 py-2 border-b border-sand-100 last:border-0">
                <span className="w-28 shrink-0 font-medium text-xs text-sand-800">{tab}</span>
                <span className="text-xs text-sand-600">{desc}</span>
              </div>
            ))}
          </div>

          <H3>Key Metrics Explained</H3>
          <div className="space-y-2">
            {[
              ['AVG PRICE',    'Mean price across all 30K listings in EGP'],
              ['PRICE/M²',     'Average price per square metre (sqm_market_rate_egp from dataset)'],
              ['YIELD',        'Estimated annual rental yield = (sqm_rate × area × 6%) / price'],
              ['ROI',          'Return on investment = (market_value − price) / price × 100'],
              ['OVERPRICED',   'Listings priced >15% above the area median sqm rate'],
              ['DEMAND',       'Heat index: normalised sqm rate across all areas (0–100)'],
              ['MODEL R²',     'Explained variance of the RandomForest analytics model'],
              ['COMPOUND %',   'Percentage of listings inside gated compound developments'],
            ].map(([k, v]) => (
              <div key={k} className="grid grid-cols-[130px,1fr] gap-3 py-2 border-b border-sand-100 last:border-0 text-xs">
                <Code>{k}</Code>
                <span className="text-sand-600">{v}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Predict ────────────────────────────────────────────── */}
        <Section id="predict" title="Price Prediction">
          <P>
            Enter property details and the ML model returns an instant valuation with a
            confidence range. The model is a <Code>HistGradientBoostingRegressor</Code> trained
            on 20,000 synthetic records generated from Egyptian market pricing rules (R²=0.99).
          </P>

          <H3>Input Fields</H3>
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-sand-100">
                  <th className="text-left px-3 py-2 text-sand-600 font-semibold">Field</th>
                  <th className="text-left px-3 py-2 text-sand-600 font-semibold">Type</th>
                  <th className="text-left px-3 py-2 text-sand-600 font-semibold">Required</th>
                  <th className="text-left px-3 py-2 text-sand-600 font-semibold">Notes</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['area_sqm',        'number',  '✓', 'Property size in m²'],
                  ['rooms',           'integer', '✓', 'Number of bedrooms'],
                  ['bathrooms',       'integer', '✓', 'Number of bathrooms'],
                  ['location',        'enum',    '✓', '25 Egyptian areas'],
                  ['property_type',   'enum',    '✓', 'Apartment, Villa, Studio, etc.'],
                  ['condition',       'enum',    '✓', 'Needs Renovation → Excellent'],
                  ['finishing',       'enum',    '✓', 'Core & Shell → Fully Finished'],
                  ['furnishing',      'enum',    '✓', 'Unfurnished → Furnished'],
                  ['view',            'enum',    '✓', 'Street, City, Garden, Pool, Sea'],
                  ['floor',           'integer', '✓', 'Floor number (0 = ground)'],
                  ['has_elevator',    'boolean', '✓', '—'],
                  ['has_parking',     'boolean', '✓', '—'],
                  ['has_garden',      'boolean', '✓', '—'],
                  ['has_pool',        'boolean', '✓', '—'],
                  ['has_gym',         'boolean', '—', 'Optional extended amenity'],
                  ['has_security',    'boolean', '—', 'Optional extended amenity'],
                  ['is_compound',     'boolean', '—', 'Gated community flag'],
                  ['building_age_years','number','—', 'Defaults to 5 if omitted'],
                ].map(([f, t, r, n]) => (
                  <tr key={f} className="border-b border-sand-100 hover:bg-sand-50">
                    <td className="px-3 py-2"><Code>{f}</Code></td>
                    <td className="px-3 py-2 text-sand-600">{t}</td>
                    <td className="px-3 py-2 text-center">{r}</td>
                    <td className="px-3 py-2 text-sand-600">{n}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <H3>Output Fields</H3>
          <div className="space-y-2 mb-4">
            {[
              ['predicted_price_egp',  'Point estimate in Egyptian Pounds'],
              ['predicted_price_usd',  'Converted at EGP/USD = 49.5'],
              ['confidence_low',       'Lower bound (−12% of estimate)'],
              ['confidence_high',      'Upper bound (+12% of estimate)'],
              ['price_per_sqm',        'EGP per m²'],
            ].map(([k, v]) => (
              <div key={k} className="grid grid-cols-[180px,1fr] gap-3 py-2 border-b border-sand-100 last:border-0 text-xs">
                <Code>{k}</Code><span className="text-sand-600">{v}</span>
              </div>
            ))}
          </div>

          <Tip type="info">
            Predictions are saved automatically to your History. Use the AI Assistant to ask follow-up questions about any valuation.
          </Tip>

          <H3>Supported Locations (25 areas)</H3>
          <div className="flex flex-wrap gap-1.5">
            {['6th of October City','Ain Sokhna','Aswan','Badr City','Dokki','El Shorouk City',
              'Heliopolis','Hurghada','Ismailia','Luxor','Maadi','Mansoura','Mohandessin',
              'Mostakbal City','Nasr City','New Administrative Capital','New Mansoura',
              'Obour City','Port Said','Sheikh Zayed','Shubra','Suez','Tanta','Zamalek','Alexandria'
            ].map(loc => (
              <span key={loc} className="bg-white border border-sand-200 text-sand-700 text-xs px-2 py-1 rounded-full">{loc}</span>
            ))}
          </div>
        </Section>

        {/* ── Chat ───────────────────────────────────────────────── */}
        <Section id="chat" title="AI Assistant">
          <P>
            The AI assistant is powered by Groq (LLaMA 3) and has full context of the Egyptian
            property market. It can answer questions about valuations, market trends, investment
            opportunities, and interpret your prediction results.
          </P>

          <H3>What you can ask</H3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
            {[
              '🏠 "Is this property fairly priced for Maadi?"',
              '📈 "Which area has the best rental yield?"',
              '🔍 "Compare Zamalek vs New Cairo pricing"',
              '💰 "What ROI can I expect on a studio?"',
              '🏗️ "Does finishing type affect resale value?"',
              '📊 "What\'s the impact of being near the metro?"',
            ].map(q => (
              <div key={q} className="bg-white border border-sand-200 rounded-lg px-3 py-2 text-xs text-sand-700">{q}</div>
            ))}
          </div>

          <H3>Session Management</H3>
          <P>
            Conversations are grouped into sessions. Each session stores the full message
            history. You can start a new session at any time or delete old ones from the
            chat sidebar. Sessions are tied to your account and persist across logins.
          </P>

          <Tip type="warning">
            The AI assistant requires a valid Groq API key to be configured by the platform
            administrator. If chat returns errors, contact your admin to verify <Code>GROQ_API_KEY</Code>.
          </Tip>
        </Section>

        {/* ── History ────────────────────────────────────────────── */}
        <Section id="history" title="History">
          <P>
            Every prediction you run is automatically saved with the full input parameters
            and result. The History page lets you browse, review, and delete past valuations.
          </P>

          <H3>Stored per prediction</H3>
          <div className="grid grid-cols-2 gap-2 text-xs mb-4">
            {['Property details (all inputs)','Predicted price EGP & USD',
              'Confidence range','Price per m²','Timestamp','Location & type'].map(i => (
              <div key={i} className="flex items-center gap-2 text-sand-600">
                <span className="text-brand-500">✓</span>{i}
              </div>
            ))}
          </div>

          <Tip>
            Predictions are stored in Supabase and linked to your user ID — they persist even if you clear your browser.
          </Tip>
        </Section>

        {/* ── Settings ───────────────────────────────────────────── */}
        <Section id="settings" title="Settings">
          <H3>Profile</H3>
          <P>Update your display name and avatar. Avatars are hosted on Cloudinary and auto-generated from your user ID if none is uploaded.</P>

          <H3>API Key</H3>
          <P>
            You can provide your own Groq API key in Settings. This overrides the platform
            key for your account, giving you higher rate limits and dedicated capacity.
            The key is stored encrypted in Supabase and never exposed to the frontend.
          </P>

          <H3>Account</H3>
          <P>Change your password or delete your account. Account deletion removes all stored predictions and chat sessions permanently.</P>
        </Section>

        {/* ── API Reference ──────────────────────────────────────── */}
        <Section id="api" title="API Reference">
          <P>
            All endpoints are under <Code>{'https://<backend-url>/api/v1'}</Code>.
            Authenticated endpoints require a Bearer token in the <Code>Authorization</Code> header.
          </P>

          <H3>Authentication</H3>
          <div className="bg-white border border-sand-200 rounded-xl divide-y divide-sand-100 mb-6">
            <Endpoint method="POST" path="/api/v1/auth/register" desc="Register a new user. Returns JWT token immediately — no email confirmation." auth={false} />
            <Endpoint method="POST" path="/api/v1/auth/login"    desc="Login with email + password. Returns JWT token." auth={false} />
            <Endpoint method="GET"  path="/api/v1/auth/me"       desc="Get current user profile." />
            <Endpoint method="PUT"  path="/api/v1/auth/me"       desc="Update profile (full_name, avatar_url, groq_api_key)." />
          </div>

          <H3>Prediction</H3>
          <div className="bg-white border border-sand-200 rounded-xl divide-y divide-sand-100 mb-6">
            <Endpoint method="POST"   path="/api/v1/predict"         desc="Run a property valuation. Saves to history automatically." />
            <Endpoint method="GET"    path="/api/v1/predictions"      desc="List saved predictions (paginated: ?limit=20&offset=0)." />
            <Endpoint method="DELETE" path="/api/v1/predictions/{id}" desc="Delete a saved prediction by ID." />
          </div>

          <H3>Analytics</H3>
          <div className="bg-white border border-sand-200 rounded-xl divide-y divide-sand-100 mb-6">
            <Endpoint method="GET" path="/api/v1/analytics" desc="Full market analytics payload. Cached after first request." />
            <Endpoint method="GET" path="/api/v1/analytics/locations" desc="List of supported locations with stats." />
            <Endpoint method="GET" path="/api/v1/analytics/market"    desc="Market summary KPIs." />
          </div>

          <H3>Chat</H3>
          <div className="bg-white border border-sand-200 rounded-xl divide-y divide-sand-100 mb-6">
            <Endpoint method="POST"   path="/api/v1/chat"              desc="Send a message. Optionally pass session_id and context object." />
            <Endpoint method="GET"    path="/api/v1/chat/sessions"      desc="List all chat sessions for the current user." />
            <Endpoint method="DELETE" path="/api/v1/chat/sessions/{id}" desc="Delete a chat session and all its messages." />
          </div>

          <H3>Example — Predict Request</H3>
          <Block>{`POST /api/v1/predict
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "area_sqm": 120,
  "rooms": 3,
  "bathrooms": 2,
  "location": "Maadi",
  "property_type": "Apartment",
  "condition": "Good",
  "finishing": "Fully Finished",
  "furnishing": "Unfurnished",
  "view": "City",
  "floor": 4,
  "has_elevator": true,
  "has_parking": true,
  "has_garden": false,
  "has_pool": false
}

// Response
{
  "predicted_price_egp": 4800000,
  "predicted_price_usd": 96969,
  "confidence_low": 4224000,
  "confidence_high": 5376000,
  "price_per_sqm": 40000,
  "r2": 0.9909,
  "mae": 678737
}`}</Block>

          <H3>Example — Register</H3>
          <Block>{`POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "full_name": "Ahmed Hassan"
}

// Response
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "Ahmed Hassan"
  }
}`}</Block>
        </Section>

        {/* ── FAQ ────────────────────────────────────────────────── */}
        <Section id="faq" title="FAQ">
          {[
            ['Do I need to confirm my email after registering?',
             'No. HomeVal uses a custom auth system — register and you\'re instantly logged in. No email confirmation required.'],
            ['How accurate is the price prediction?',
             'The ML model achieves R²=0.99 on training data. Real-world accuracy depends on market conditions and data freshness. Always treat predictions as estimates with a ±12% confidence range.'],
            ['Where does the market data come from?',
             'The analytics dashboard is powered by a dataset of 30,000 Egyptian property listings (egypt_home_pricing_30k.csv) covering 25 areas with 30 features each.'],
            ['Why do I see NaN or empty charts sometimes?',
             'This usually means the analytics is still loading. The first request after a server restart takes ~5–10 seconds to compute. Refresh the page after a moment.'],
            ['Is my data private?',
             'Yes. Predictions and chat sessions are stored in Supabase linked to your user ID. No data is shared with third parties.'],
            ['Can I use my own Groq API key?',
             'Yes — go to Settings and enter your Groq API key. It will override the platform key for your account.'],
            ['What currencies are supported?',
             'Prices are displayed in EGP (Egyptian Pounds) and USD. The exchange rate is fixed at EGP 49.5 = USD 1.'],
            ['How do I delete my account?',
             'Go to Settings → Account → Delete Account. This permanently removes all your data including predictions and chat history.'],
          ].map(([q, a]) => (
            <details key={q as string} className="group border border-sand-200 rounded-xl mb-2 bg-white overflow-hidden">
              <summary className="flex items-center justify-between px-4 py-3 cursor-pointer text-sm font-medium text-sand-900 list-none hover:bg-sand-50 transition-colors">
                {q}
                <span className="text-sand-400 group-open:rotate-180 transition-transform text-xs ml-2">▼</span>
              </summary>
              <div className="px-4 py-3 text-xs text-sand-600 leading-relaxed border-t border-sand-100 bg-sand-50">
                {a}
              </div>
            </details>
          ))}
        </Section>

        {/* Footer */}
        <div className="border-t border-sand-200 pt-8 pb-16 text-center">
          <p className="text-xs text-sand-400">HomeVal v2.0 · Egypt Property Intelligence Platform</p>
          <p className="text-xs text-sand-300 mt-1">Built with Next.js, FastAPI, Supabase & Groq</p>
        </div>

      </main>
    </div>
  )
}
