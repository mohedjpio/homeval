'use client'
import Link from 'next/link'
import { useState } from 'react'

const NAV = [
  { id: 'overview',     label: 'Overview' },
  { id: 'auth',         label: 'Authentication' },
  { id: 'endpoints',    label: 'Endpoints' },
  { id: 'ml',           label: 'ML Model' },
  { id: 'schema',       label: 'Database Schema' },
  { id: 'architecture', label: 'Architecture' },
  { id: 'deploy',       label: 'Deployment' },
  { id: 'errors',       label: 'Error Codes' },
]

const Code = ({ children }: { children: React.ReactNode }) => (
  <code className="bg-[#085041] text-[#9FE1CB] px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>
)

const Block = ({ lang = '', children }: { lang?: string; children: React.ReactNode }) => (
  <div className="rounded-xl overflow-hidden mb-4 border border-[#085041]">
    {lang && <div className="bg-[#085041]/60 px-4 py-1.5 text-[10px] text-[#9FE1CB]/60 font-mono uppercase tracking-widest">{lang}</div>}
    <pre className="bg-[#04342c] text-[#9FE1CB] p-4 text-xs font-mono overflow-x-auto leading-relaxed">{children}</pre>
  </div>
)

const Method = ({ m }: { m: string }) => {
  const c: Record<string, string> = {
    GET: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    POST: 'bg-green-500/20 text-green-300 border-green-500/30',
    PUT: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    DELETE: 'bg-red-500/20 text-red-300 border-red-500/30',
  }
  return <span className={`inline-block px-2 py-0.5 rounded border text-xs font-mono font-bold ${c[m]}`}>{m}</span>
}

const Endpoint = ({ method, path, desc, auth = true, body }: { method: string; path: string; desc: string; auth?: boolean; body?: string }) => {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-[#085041] rounded-xl mb-3 overflow-hidden">
      <button onClick={() => setOpen(v => !v)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#085041]/30 transition-colors text-left">
        <Method m={method} />
        <code className="text-[#9FE1CB] text-xs font-mono flex-1">{path}</code>
        {auth && <span className="text-[10px] bg-brand-500/20 text-brand-300 border border-brand-500/30 px-2 py-0.5 rounded font-mono">AUTH</span>}
        <span className="text-[#9FE1CB]/40 text-xs ml-2">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="border-t border-[#085041] px-4 py-4 bg-[#04342c]/50">
          <p className="text-[#9FE1CB]/70 text-xs mb-3">{desc}</p>
          {body && <Block lang="json">{body}</Block>}
        </div>
      )}
    </div>
  )
}

const H2 = ({ id, children }: { id: string; children: React.ReactNode }) => (
  <h2 id={id} className="font-display text-xl text-white mt-12 mb-5 pb-2 border-b border-[#085041] scroll-mt-24">{children}</h2>
)

const H3 = ({ children }: { children: React.ReactNode }) => (
  <h3 className="font-semibold text-[#9FE1CB] text-sm mt-6 mb-3">{children}</h3>
)

const P = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[#9FE1CB]/70 text-sm leading-relaxed mb-3">{children}</p>
)

const Note = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-brand-500/10 border border-brand-500/20 rounded-xl p-4 text-xs text-brand-300 leading-relaxed mb-4 flex gap-2">
    <span className="shrink-0">ℹ️</span><span>{children}</span>
  </div>
)

const Warn = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 text-xs text-yellow-300 leading-relaxed mb-4 flex gap-2">
    <span className="shrink-0">⚠️</span><span>{children}</span>
  </div>
)

export default function TechDocs() {
  const [active, setActive] = useState('overview')

  const go = (id: string) => {
    setActive(id)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="min-h-screen bg-[#04342c] font-body">

      {/* Top nav */}
      <nav className="bg-[#04342c]/95 backdrop-blur border-b border-[#085041] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center">
                <svg width="13" height="13" viewBox="0 0 20 20" fill="none"><path d="M3 10L10 3L17 10V17H13V13H7V17H3V10Z" fill="white"/></svg>
              </div>
              <span className="font-display text-lg text-[#9FE1CB]">HomeVal</span>
            </Link>
            <span className="text-[#085041] text-lg">/</span>
            <Link href="/docs" className="text-[#9FE1CB]/50 text-sm hover:text-[#9FE1CB]">Docs</Link>
            <span className="text-[#085041] text-lg">/</span>
            <span className="text-[#9FE1CB] text-sm font-medium">API Reference</span>
          </div>
          <Link href="/docs/user" className="flex items-center gap-1.5 text-xs text-[#9FE1CB]/50 hover:text-[#9FE1CB] font-medium transition-colors border border-[#085041] px-3 py-1.5 rounded-lg hover:border-brand-500/40">
            ← User Guide
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 flex gap-8">

        {/* Sidebar */}
        <aside className="hidden lg:block w-48 shrink-0 sticky top-20 h-[calc(100vh-5rem)] py-8">
          <p className="text-[10px] font-semibold text-[#9FE1CB]/30 uppercase tracking-widest mb-4">API Reference</p>
          <nav className="space-y-0.5">
            {NAV.map(n => (
              <button key={n.id} onClick={() => go(n.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all font-mono ${
                  active === n.id ? 'bg-brand-500/20 text-[#9FE1CB] font-semibold' : 'text-[#9FE1CB]/50 hover:bg-[#085041]/50 hover:text-[#9FE1CB]'
                }`}>
                {n.label}
              </button>
            ))}
          </nav>
          <div className="mt-8 bg-[#085041] rounded-xl p-4">
            <p className="text-xs text-[#9FE1CB]/70 mb-1 font-mono">Base URL</p>
            <code className="text-[10px] text-[#9FE1CB] font-mono break-all">https://&lt;backend&gt;.up.railway.app</code>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 max-w-2xl py-8">

          {/* Header */}
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 bg-[#085041] rounded-full px-3 py-1 mb-4">
              <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse"/>
              <span className="text-[#9FE1CB]/70 text-xs font-mono uppercase tracking-widest">API Reference · v2.0</span>
            </div>
            <h1 className="font-display text-3xl text-white mb-3">HomeVal API Docs</h1>
            <P>Complete reference for the HomeVal REST API — authentication, endpoints, data models, ML architecture, and deployment.</P>
            <div className="flex gap-2 flex-wrap mt-4">
              {['REST','JWT Auth','Python 3.12','FastAPI','Supabase'].map(t => (
                <span key={t} className="bg-[#085041] text-[#9FE1CB]/70 text-xs font-mono px-2.5 py-1 rounded-full">{t}</span>
              ))}
            </div>
          </div>

          {/* Overview */}
          <H2 id="overview">Overview</H2>
          <P>All API routes are prefixed with <Code>/api/v1</Code>. Responses are JSON. Authentication uses Bearer JWT tokens.</P>

          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              ['Base URL',     'https://&lt;backend&gt;.up.railway.app'],
              ['Auth',         'Bearer JWT (Authorization header)'],
              ['Content-Type', 'application/json'],
              ['Token expiry', '7 days (configurable via JWT_EXPIRE_DAYS)'],
            ].map(([k, v]) => (
              <div key={k} className="bg-[#085041]/40 border border-[#085041] rounded-xl p-3">
                <p className="text-[10px] text-[#9FE1CB]/40 font-mono uppercase tracking-widest mb-1">{k}</p>
                <p className="text-xs text-[#9FE1CB] font-mono">{v}</p>
              </div>
            ))}
          </div>

          {/* Auth */}
          <H2 id="auth">Authentication</H2>
          <P>HomeVal uses a custom JWT auth system — no Supabase Auth, no email confirmation. Register → get a token → use it on every request.</P>

          <H3>Register</H3>
          <Block lang="http POST /api/v1/auth/register">{`{
  "email":     "user@example.com",
  "password":  "securepassword",
  "full_name": "Ahmed Hassan"    // optional
}

// 200 Response
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id":        "uuid-v4",
    "email":     "user@example.com",
    "full_name": "Ahmed Hassan",
    "avatar_url": null
  }
}`}</Block>

          <H3>Login</H3>
          <Block lang="http POST /api/v1/auth/login">{`{
  "email":    "user@example.com",
  "password": "securepassword"
}

// 200 Response
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "user":  { "id": "...", "email": "...", "full_name": "..." }
}`}</Block>

          <H3>Using the token</H3>
          <Block lang="http">{`// Include on every authenticated request:
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...`}</Block>

          <H3>Get / update profile</H3>
          <Block lang="http GET /api/v1/auth/me">{`// 200 Response
{
  "id":          "uuid",
  "email":       "user@example.com",
  "full_name":   "Ahmed Hassan",
  "avatar_url":  "https://res.cloudinary.com/..."
}`}</Block>
          <Block lang="http PUT /api/v1/auth/me">{`{
  "full_name":    "New Name",       // optional
  "avatar_url":   "https://...",    // optional
  "groq_api_key": "gsk_..."         // optional
}`}</Block>

          {/* Endpoints */}
          <H2 id="endpoints">All Endpoints</H2>

          <H3>Auth</H3>
          <Endpoint method="POST"   path="/api/v1/auth/register" auth={false} desc="Register a new user. Returns token immediately — no email confirmation." />
          <Endpoint method="POST"   path="/api/v1/auth/login"    auth={false} desc="Authenticate with email + password." />
          <Endpoint method="GET"    path="/api/v1/auth/me"       desc="Get the current user's profile." />
          <Endpoint method="PUT"    path="/api/v1/auth/me"       desc="Update profile fields (full_name, avatar_url, groq_api_key)." />

          <H3>Predictions</H3>
          <Endpoint method="POST" path="/api/v1/predict" desc="Run a property valuation. Body: PredictionInput. Saves result to DB."
            body={`{
  "area_sqm":       120,
  "rooms":          3,
  "bathrooms":      2,
  "location":       "Maadi",
  "property_type":  "Apartment",
  "condition":      "Good",
  "finishing":      "Fully Finished",
  "furnishing":     "Unfurnished",
  "view":           "City",
  "floor":          4,
  "has_elevator":   true,
  "has_parking":    true,
  "has_garden":     false,
  "has_pool":       false,
  // Optional:
  "has_gym":        false,
  "has_security":   true,
  "is_compound":    false,
  "building_age_years": 5
}

// Response
{
  "predicted_price_egp": 4800000,
  "predicted_price_usd": 96969,
  "confidence_low":      4224000,
  "confidence_high":     5376000,
  "price_per_sqm":       40000,
  "r2":   0.9909,
  "mae":  678737
}`}
          />
          <Endpoint method="GET"    path="/api/v1/predictions"      desc="List saved predictions. Query params: ?limit=20&offset=0" />
          <Endpoint method="DELETE" path="/api/v1/predictions/{id}" desc="Delete a prediction by UUID." />

          <H3>Analytics</H3>
          <Endpoint method="GET" path="/api/v1/analytics" desc="Full market analytics payload (30K records). Cached after first request (~10s cold start)." />
          <Endpoint method="GET" path="/api/v1/analytics/locations" desc="List of supported locations with market stats." />
          <Endpoint method="GET" path="/api/v1/analytics/market"    desc="Summary KPIs — avg price, yield, ROI, total listings." />

          <H3>Chat</H3>
          <Endpoint method="POST"   path="/api/v1/chat"              desc="Send a message to the AI assistant."
            body={`{
  "message":    "Which area has the best ROI?",
  "session_id": "uuid-or-null",  // null = new session
  "context":    {}               // optional prediction context
}`}
          />
          <Endpoint method="GET"    path="/api/v1/chat/sessions"      desc="List all chat sessions for the current user." />
          <Endpoint method="DELETE" path="/api/v1/chat/sessions/{id}" desc="Delete a session and all its messages." />

          <H3>Health</H3>
          <Endpoint method="GET" path="/health" auth={false} desc="Health check. Returns {status: 'ok'}. Used by Railway." />

          {/* ML Model */}
          <H2 id="ml">ML Model</H2>
          <P>The prediction engine uses a <Code>HistGradientBoostingRegressor</Code> from scikit-learn, trained on 20,000 synthetically generated Egyptian property records.</P>

          <H3>Training</H3>
          <div className="space-y-1 mb-4">
            {[
              ['Algorithm',    'HistGradientBoostingRegressor'],
              ['Training set', '17,000 records (85% split)'],
              ['Test set',     '3,000 records (15% split)'],
              ['R² score',     '0.9909 (explains 99% of price variance)'],
              ['MAE',          '~678,737 EGP'],
              ['Features',     '32 engineered features'],
              ['Target',       'log1p(price_egp) — log-transformed for normality'],
            ].map(([k, v]) => (
              <div key={k} className="grid grid-cols-[140px,1fr] gap-3 py-2 border-b border-[#085041] last:border-0 text-xs">
                <span className="text-[#9FE1CB]/50 font-mono">{k}</span>
                <span className="text-[#9FE1CB]">{v}</span>
              </div>
            ))}
          </div>

          <H3>Feature engineering (32 features)</H3>
          <Block lang="python">{`# Area features
area, log(area+1), area²

# Room features
bedrooms, bathrooms, beds×baths, beds+baths,
baths/beds, area/beds

# Quality encodings (ordinal)
condition_enc (0-4), finishing_enc (0-2),
furnished_enc (0-2), view_enc (0-4)

# Amenity flags
has_pool, has_gym, has_security, has_elevator,
has_balcony, is_compound, amenity_score,
parking_spaces, garden_sqm

# Building
floor_number, building_age_years, age²,
new_building (age≤2), floor_to_ceiling_height_m

# Distance
distance_to_center_km, distance_to_metro_km

# Market signals
luxury_flag, location_enc (0-24), title_enc (0-5)`}</Block>

          <H3>Auto-retraining</H3>
          <P>On startup, the backend tries to load <Code>ml/housing_model.pkl</Code>. If that fails (e.g. numpy version mismatch), it automatically retrains from synthetic data using <Code>_generate_training_data(n=20000)</Code> and saves a fresh pkl.</P>

          <Note>The analytics model (RandomForest on 30K real records) is separate from the prediction model. It runs on first analytics request and is cached in memory.</Note>

          {/* Schema */}
          <H2 id="schema">Database Schema</H2>
          <P>HomeVal uses Supabase (PostgreSQL). Run <Code>supabase/schema.sql</Code> once to set up all tables.</P>

          <H3>Tables</H3>
          <Block lang="sql">{`-- Users (custom auth — no Supabase Auth)
CREATE TABLE users (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email        TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,       -- bcrypt
  full_name    TEXT,
  avatar_url   TEXT,
  groq_api_key TEXT,                 -- encrypted
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- Predictions
CREATE TABLE predictions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES users(id) ON DELETE CASCADE,
  input_data   JSONB NOT NULL,       -- full PredictionInput
  result_data  JSONB NOT NULL,       -- full MLResult
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- Chat sessions
CREATE TABLE chat_sessions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  title      TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Chat messages
CREATE TABLE chat_messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role       TEXT CHECK (role IN ('user','assistant')),
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);`}</Block>

          {/* Architecture */}
          <H2 id="architecture">Architecture</H2>

          <Block lang="text">{`Browser
  │  HTTP (same-origin)
  ▼
Next.js Frontend (Railway)
  │  /api/proxy/[...path] → server-side route handler
  │  Reads API_URL env var at RUNTIME (not build time)
  │  Forwards to backend with Authorization header
  │
  │  HTTP (Railway private network or public URL)
  ▼
FastAPI Backend (Railway)
  │
  ├── /api/v1/auth/*      → auth_service (bcrypt + JWT)
  ├── /api/v1/predict     → ml_service (HistGradientBoosting)
  ├── /api/v1/analytics   → analytics router (pandas + RF)
  ├── /api/v1/chat        → groq_service (LLaMA 3)
  └── /api/v1/predictions → predictions router
  │
  ├── Supabase PostgreSQL  (users, predictions, chat)
  ├── Groq API             (LLaMA 3 chat completions)
  └── ml/housing_model.pkl (prediction model)
      ml/egypt_home_pricing_30k.csv (analytics data)`}</Block>

          <H3>Frontend proxy pattern</H3>
          <P>The Next.js frontend never calls the backend directly from the browser. All requests go through <Code>/api/proxy/[...path]</Code> — a server-side route handler that reads <Code>API_URL</Code> at runtime and forwards requests. This avoids CORS issues and the Next.js build-time environment variable limitation.</P>

          {/* Deploy */}
          <H2 id="deploy">Deployment</H2>
          <P>HomeVal is designed to run as two Railway services from a single GitHub repo.</P>

          <H3>Environment variables</H3>
          <Block lang="bash">{`# ── Backend service ──────────────────────────────────────
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key
JWT_SECRET=your_random_32_byte_hex_secret
JWT_EXPIRE_DAYS=7
GROQ_API_KEY=gsk_your_groq_key
ML_MODEL_PATH=ml/housing_model.pkl
ALLOWED_ORIGINS_RAW=https://your-frontend.up.railway.app

# ── Frontend service ──────────────────────────────────────
API_URL=https://your-backend.up.railway.app
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_preset`}</Block>

          <H3>Railway config files</H3>
          <Block lang="toml # backend/railway.toml">{`[build]
builder = "nixpacks"

[build.nixpacksPlan.phases.setup]
nixPkgs = ["python311"]

[deploy]
startCommand = "uvicorn main:app --host 0.0.0.0 --port $PORT"
healthcheckPath = "/health"
healthcheckTimeout = 30`}</Block>

          <Note>
            Set root directory to <Code>backend</Code> for the backend service and <Code>frontend</Code> for the frontend service in Railway → Settings → Source.
          </Note>

          {/* Errors */}
          <H2 id="errors">Error Codes</H2>
          <div className="space-y-1 mb-6">
            {[
              ['400', 'Bad Request',           'Missing or invalid request body fields.'],
              ['401', 'Unauthorized',           'Missing, expired, or invalid JWT token.'],
              ['404', 'Not Found',              'Resource does not exist or belongs to another user.'],
              ['422', 'Validation Error',       'Pydantic schema validation failed. Check field types.'],
              ['500', 'Internal Server Error',  'Unhandled exception — check backend Railway logs.'],
              ['502', 'Backend Unreachable',    'Frontend proxy could not connect to backend. Check API_URL env var.'],
            ].map(([code, name, desc]) => (
              <div key={code} className="flex gap-3 py-2.5 border-b border-[#085041] last:border-0 text-xs">
                <Code>{code}</Code>
                <span className="text-[#9FE1CB] font-semibold w-36 shrink-0">{name}</span>
                <span className="text-[#9FE1CB]/60">{desc}</span>
              </div>
            ))}
          </div>

          <H3>Error response format</H3>
          <Block lang="json">{`{
  "detail": "Error message here"
}

// Validation errors (422):
{
  "detail": [
    {
      "loc":  ["body", "area_sqm"],
      "msg":  "field required",
      "type": "value_error.missing"
    }
  ]
}`}</Block>

          {/* Footer */}
          <div className="mt-16 pt-8 border-t border-[#085041] flex items-center justify-between">
            <p className="text-xs text-[#9FE1CB]/30 font-mono">HomeVal v2.0 · API Reference</p>
            <Link href="/docs/user" className="text-xs text-brand-400 hover:text-brand-300 font-medium">← User Guide</Link>
          </div>

        </main>
      </div>
    </div>
  )
}
