/**
 * Custom auth — JWT stored in localStorage.
 * No Supabase Auth. No email confirmation.
 */

const TOKEN_KEY = 'homeval_token'
const USER_KEY  = 'homeval_user'

export interface User {
  id:          string
  email:       string
  full_name:   string
  avatar_url?: string
  role:        string
  created_at:  string
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function getUser(): User | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export function saveAuth(token: string, user: User) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function isLoggedIn(): boolean {
  return !!getToken()
}
