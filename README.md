# HomeVal — Full Railway Deployment

Egyptian Real Estate ML Valuation SaaS — both frontend and backend on Railway.

## Architecture

```
Railway Project
├── homeval-backend   (FastAPI + ML)   → Python Dockerfile
└── homeval-frontend  (Next.js)        → Node.js Dockerfile
```

Both services live in the same Railway project and communicate over the internet
via their public Railway URLs.

---

## Deploy in 4 steps

### Step 1 — Supabase (database)

1. Create a project at **supabase.com** (free tier)
2. SQL Editor → paste all of `supabase/migrations.sql` → Run
3. Authentication → Providers → Email → Enable
4. Note these values from Settings → API:
   - Project URL
   - `anon` / public key
   - `service_role` key
   - JWT Secret

---

### Step 2 — Railway: Backend service

1. **railway.app** → New Project → Deploy from GitHub → select your repo
2. Service settings → **Root Directory** → `backend`
3. Service → Variables → add:

```
SUPABASE_URL          = https://xxxx.supabase.co
SUPABASE_SERVICE_KEY  = eyJ...  (service_role key)
SUPABASE_JWT_SECRET   = your-jwt-secret
GROQ_API_KEY          = gsk_...  (from console.groq.com)
ALLOWED_ORIGINS_RAW   = https://YOUR-FRONTEND.railway.app,http://localhost:3000
ML_MODEL_PATH         = ml/model.pkl
```

4. Settings → Domains → **Generate Domain** → copy the URL
   (looks like `homeval-backend-production.railway.app`)
5. Test: `curl https://YOUR-BACKEND.railway.app/health`
   → should return `{"status":"ok","version":"1.0.0"}`

---

### Step 3 — Railway: Frontend service

1. Same project → **New Service** → GitHub → same repo
2. Service settings → **Root Directory** → `frontend`
3. Service → Variables → add:

```
NEXT_PUBLIC_SUPABASE_URL       = https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY  = eyJ...  (anon/public key — NOT service_role)
NEXT_PUBLIC_API_URL            = https://YOUR-BACKEND.railway.app
```

   ⚠️  These are baked into the JS bundle during Docker build.
   After changing them you MUST redeploy the frontend service.

4. Settings → Domains → **Generate Domain**
5. Copy the frontend URL (e.g. `homeval-frontend-production.railway.app`)

---

### Step 4 — Wire them together

**Update backend CORS** — go back to the backend service → Variables:
```
ALLOWED_ORIGINS_RAW = https://homeval-frontend-production.railway.app,http://localhost:3000
```
(Railway will auto-redeploy after saving)

**Update Supabase auth** — Supabase dashboard → Authentication → URL Configuration:
- Site URL: `https://homeval-frontend-production.railway.app`
- Redirect URLs: add `https://homeval-frontend-production.railway.app/**`

---

## How NEXT_PUBLIC_ env vars work in Docker

Next.js bakes `NEXT_PUBLIC_*` variables into the JavaScript bundle **at build time**.
This means:

- They must exist as Railway Variables **before** you deploy the frontend
- If you change them, you must **redeploy** the frontend service
- They are NOT secret — they are embedded in the browser JS
- Never put secret keys (Supabase service_role, Groq key) as NEXT_PUBLIC_

The `Dockerfile` declares them as `ARG`, which tells Docker to accept them
from Railway's build environment:

```dockerfile
ARG NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
```

Railway automatically passes all service Variables as Docker build args.

---

## Local development

```bash
# Backend
cd backend
cp .env.example .env         # fill in your values
pip install -r requirements.txt
uvicorn main:app --reload    # runs on http://localhost:8000

# Frontend
cd frontend
cp .env.local.example .env.local   # fill in your values
npm install
npm run dev                  # runs on http://localhost:3000
```

---

## Project structure

```
homeval/
├── backend/                 # FastAPI + ML
│   ├── main.py
│   ├── app/
│   │   ├── config.py
│   │   ├── routers/         # predict, analytics, chat, auth, admin
│   │   ├── services/        # ml_service, groq_service, db_service, auth_service
│   │   └── models/          # Pydantic schemas
│   ├── ml/
│   │   ├── model.pkl        # trained HistGradientBoostingRegressor
│   │   └── pipeline.py      # training code
│   ├── Dockerfile
│   └── railway.json
│
├── frontend/                # Next.js 14
│   ├── app/
│   │   ├── (auth)/          # login, register
│   │   └── (dashboard)/     # dashboard, predict, chat, history, settings
│   ├── lib/
│   │   ├── api.ts           # typed API client + supabase client
│   │   └── utils.ts         # formatEGP, formatUSD, cn
│   ├── Dockerfile           # multi-stage: build → slim runner
│   └── railway.json
│
└── supabase/
    └── migrations.sql       # full schema + RLS policies
```
