# HomeVal v2 — Railway Deployment Guide

## Stack
- **Frontend**: Next.js 15 + Tailwind CSS → Railway service
- **Backend**: FastAPI (Python 3.11) → Railway service
- **Database**: Supabase (external, no Railway DB needed)
- **ML Model**: HistGradientBoostingRegressor (bundled as `housing_model.pkl`)
- **AI Chat**: Groq API

---

## 1 — Set up the database (one time)

1. Go to your Supabase project → SQL Editor
2. Paste the contents of `supabase/schema.sql`
3. Click **Run**

---

## 2 — Deploy to Railway

### Step 1 — Push to GitHub
```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/YOUR_USERNAME/homeval-v2.git
git push -u origin main
```

### Step 2 — Create Railway project
1. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**
2. Select your repo

### Step 3 — Backend service
- In Railway, click **Add Service** → your repo
- Set **Root Directory** to `backend`
- Add these **Environment Variables**:

| Variable | Value |
|---|---|
| `SUPABASE_URL` | `https://ekvoujikbybjvfinsack.supabase.co` |
| `SUPABASE_SERVICE_KEY` | your service_role key from Supabase |
| `JWT_SECRET` | run `python -c "import secrets; print(secrets.token_hex(32))"` |
| `JWT_EXPIRE_DAYS` | `7` |
| `GROQ_API_KEY` | your Groq API key |
| `ALLOWED_ORIGINS_RAW` | *(set after frontend deploys — see Step 5)* |
| `ML_MODEL_PATH` | `ml/housing_model.pkl` |

### Step 4 — Frontend service
- Click **Add Service** → your repo again
- Set **Root Directory** to `frontend`
- Add these **Environment Variables**:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | *(set after backend deploys — see Step 5)* |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | `dhpcylkn8` |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | `HouseValAvater` |

### Step 5 — Wire the two services together
After both services have a Railway URL:

1. Copy the **backend** Railway URL (e.g. `https://homeval-backend-production.up.railway.app`)
2. Set it as `NEXT_PUBLIC_API_URL` in the **frontend** service → redeploy frontend
3. Copy the **frontend** Railway URL (e.g. `https://homeval-frontend-production.up.railway.app`)
4. Set it as `ALLOWED_ORIGINS_RAW` in the **backend** service → redeploy backend

---

## Local Development

### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env        # fill in your real values
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env.local  # fill in your real values
npm run dev
```

Open http://localhost:3000

---

## How auth works
1. POST /api/v1/auth/register → bcrypt hash password → insert into users table → return JWT
2. POST /api/v1/auth/login → verify bcrypt hash → return JWT
3. Frontend stores JWT in localStorage
4. Every API call sends: Authorization: Bearer <token>
5. Backend verifies JWT signature on every request
6. No email confirmation required — register and use immediately
