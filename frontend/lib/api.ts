import axios from 'axios'
import { getToken, clearAuth } from './auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const api = axios.create({ baseURL: `${API_URL}/api/v1` })

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(r => r, err => {
  if (err.response?.status === 401 && typeof window !== 'undefined') {
    clearAuth()
    window.location.href = '/login'
  }
  return Promise.reject(err)
})

// ── Auth ──────────────────────────────────────────────────────────
export const authRegister = (email: string, password: string, full_name: string) =>
  api.post('/auth/register', { email, password, full_name }).then(r => r.data)

export const authLogin = (email: string, password: string) =>
  api.post('/auth/login', { email, password }).then(r => r.data)

export const getProfile  = () => api.get('/auth/me').then(r => r.data)
export const updateProfile = (data: { full_name?: string; avatar_url?: string; groq_api_key?: string }) =>
  api.put('/auth/me', data).then(r => r.data)

// ── Predict ───────────────────────────────────────────────────────
export interface PredictionInput {
  // Core
  area_sqm: number; rooms: number; bathrooms: number
  location: string; property_type: string
  // Quality
  condition: string; finishing: string; furnishing: string; view: string
  // Basic amenities
  has_elevator: boolean; has_parking: boolean; has_garden: boolean; has_pool: boolean
  // Extended amenities
  has_gym?: boolean; has_security?: boolean; has_balcony?: boolean; is_compound?: boolean
  parking_spaces?: number; garden_sqm?: number
  // Building
  floor: number; building_age_years?: number; floor_to_ceiling_height_m?: number
  // Distances (optional — backend fills defaults)
  distance_to_center_km?: number; distance_to_metro_km?: number
}
export const predictPrice     = (d: PredictionInput) => api.post('/predict', d).then(r => r.data)
export const getPredictions   = (limit=20, offset=0)  => api.get(`/predictions?limit=${limit}&offset=${offset}`).then(r => r.data)
export const deletePrediction = (id: string)           => api.delete(`/predictions/${id}`)

// ── Analytics ─────────────────────────────────────────────────────
export const getLocations = () => api.get('/analytics/locations').then(r => r.data)
export const getMarket    = () => api.get('/analytics/market').then(r => r.data)

// ── Chat ──────────────────────────────────────────────────────────
export const sendChat        = (message: string, sessionId?: string, context?: object) =>
  api.post('/chat', { message, session_id: sessionId, context }).then(r => r.data)
export const getChatSessions  = () => api.get('/chat/sessions').then(r => r.data)
export const deleteChatSession = (id: string) => api.delete(`/chat/sessions/${id}`)

export default api
