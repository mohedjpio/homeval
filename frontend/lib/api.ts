import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// ── Supabase — fully defensive, never throws on missing env vars ──────────
let _supabase: any = null

function createNoopClient() {
  return {
    auth: {
      getSession:          async () => ({ data: { session: null }, error: null }),
      onAuthStateChange:   (_: any, __: any) => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword:  async () => ({ data: null, error: { message: 'Not configured' } }),
      signUp:              async () => ({ data: null, error: { message: 'Not configured' } }),
      signOut:             async () => ({ error: null }),
    },
  }
}

export function getSupabase() {
  // Never run on server / build time
  if (typeof window === 'undefined') return createNoopClient()

  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !key) {
      console.error(
        '[HomeVal] NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing.\n' +
        'Go to Vercel → your project → Settings → Environment Variables and add them,\n' +
        'then redeploy.'
      )
      return createNoopClient()
    }

    try {
      // Static import is fine — Next.js bundles it client-side only
      const { createBrowserClient } = require('@supabase/ssr')
      _supabase = createBrowserClient(url, key)
    } catch (e) {
      console.error('[HomeVal] Failed to init Supabase client:', e)
      return createNoopClient()
    }
  }

  return _supabase
}

// Proxy — access .auth anywhere safely
export const supabase = new Proxy({} as any, {
  get(_target, prop) {
    return getSupabase()[prop as string]
  },
})

// ── Axios — auto-inject JWT ───────────────────────────────────────────────
const api = axios.create({ baseURL: `${API_URL}/api/v1` })

api.interceptors.request.use(async (config) => {
  if (typeof window !== 'undefined') {
    try {
      const { data } = await getSupabase().auth.getSession()
      if (data?.session?.access_token) {
        config.headers.Authorization = `Bearer ${data.session.access_token}`
      }
    } catch { /* ignore */ }
  }
  return config
})

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      getSupabase().auth.signOut().catch(() => {})
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ── Types ─────────────────────────────────────────────────────────────────
export interface PredictionInput {
  area_sqm: number; rooms: number; bathrooms: number; location: string
  condition: string; finishing: string; furnishing: string; floor: number
  has_elevator: boolean; has_parking: boolean; has_garden: boolean; has_pool: boolean
  view: string; property_type: string
}

export interface PredictionResponse {
  prediction_id: string
  predicted_price_egp: number; predicted_price_usd: number
  confidence_low: number; confidence_high: number; price_per_sqm: number
  location_comparison: { area_median: number; area_mean: number; percentile: number; price_per_sqm: number } | null
  model_metrics: { r2: number; mae: number; rmse: number }
  created_at: string
}

// ── API calls ─────────────────────────────────────────────────────────────
export const predictPrice     = (d: PredictionInput) => api.post<PredictionResponse>('/predict', d).then(r => r.data)
export const getLocations     = () => api.get('/analytics/locations').then(r => r.data)
export const getMarket        = () => api.get('/analytics/market').then(r => r.data)
export const getPredictions   = (limit = 20, offset = 0) => api.get(`/predictions?limit=${limit}&offset=${offset}`).then(r => r.data)
export const deletePrediction = (id: string) => api.delete(`/predictions/${id}`)
export const sendChat         = (message: string, sessionId?: string, context?: object) =>
  api.post('/chat', { message, session_id: sessionId, context }).then(r => r.data)
export const getChatSessions  = () => api.get('/chat/sessions').then(r => r.data)
export const getProfile       = () => api.get('/auth/me').then(r => r.data)
export const updateProfile    = (data: { full_name?: string; groq_api_key?: string }) =>
  api.put('/auth/me', data).then(r => r.data)

export default api
