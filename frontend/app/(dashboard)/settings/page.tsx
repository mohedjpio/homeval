'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect, useRef } from 'react'
import { getProfile, updateProfile } from '@/lib/api'
import { getUser, saveAuth, getToken } from '@/lib/auth'
import { uploadAvatar } from '@/lib/cloudinary'

export default function SettingsPage() {
  const [fullName,    setFullName]    = useState('')
  const [loading,     setLoading]     = useState(true)
  const [saving,      setSaving]      = useState(false)
  const [saved,       setSaved]       = useState(false)
  const [error,       setError]       = useState('')
  // storedUrl  = URL saved in DB / localStorage (used on reload)
  // previewUrl = blob URL for instant local preview after picking a file
  const [storedUrl,   setStoredUrl]   = useState('')
  const [previewUrl,  setPreviewUrl]  = useState('')
  const [uploading,   setUploading]   = useState(false)
  const [avatarErr,   setAvatarErr]   = useState('')
  const [dragOver,    setDragOver]    = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const user    = getUser()

  // The img always shows previewUrl first (instant local blob), then storedUrl
  const displayUrl = previewUrl || storedUrl

  useEffect(() => {
    if (user?.avatar_url) setStoredUrl(user.avatar_url)
    getProfile()
      .then((p: any) => {
        setFullName(p?.full_name || '')
        if (p?.avatar_url) setStoredUrl(p.avatar_url)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function processFile(file: File) {
    if (!user) return
    if (!['image/jpeg','image/png','image/webp'].includes(file.type)) {
      setAvatarErr('Only JPG, PNG or WebP images are allowed'); return
    }
    if (file.size > 5 * 1024 * 1024) { setAvatarErr('File too large (max 5 MB)'); return }

    setAvatarErr('')

    // ── Step 1: show local blob preview IMMEDIATELY (no upload wait) ──
    const blob = URL.createObjectURL(file)
    setPreviewUrl(blob)

    // ── Step 2: upload in background ──
    setUploading(true)
    try {
      const url = await uploadAvatar(file, user.id)
      // Replace blob preview with the real Cloudinary URL
      setPreviewUrl('')
      setStoredUrl(url)
      // Persist to DB and localStorage
      await updateProfile({ avatar_url: url })
      const token = getToken()!
      saveAuth(token, { ...user, avatar_url: url })
    } catch (e: any) {
      // Upload failed — revert preview to the last stored URL
      setPreviewUrl('')
      setAvatarErr(e?.message || 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
      URL.revokeObjectURL(blob)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault(); setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setError(''); setSaved(false)
    try {
      await updateProfile({ full_name: fullName })
      saveAuth(getToken()!, { ...user!, full_name: fullName })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setError('Failed to save. Please try again.')
    } finally { setSaving(false) }
  }

  const initials    = fullName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-EG', { month: 'long', year: 'numeric' })
    : '—'

  if (loading) return (
    <div className="max-w-2xl mx-auto space-y-4 animate-fade-up pt-2">
      <div className="h-8 w-40 shimmer rounded-lg mb-8" />
      <div className="h-56 shimmer rounded-3xl" />
      <div className="h-44 shimmer rounded-3xl" />
      <div className="h-28 shimmer rounded-3xl" />
    </div>
  )

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-up pb-12">

      {/* ── Page header ── */}
      <div className="mb-8 sm:mb-10">
        <h1 className="font-display text-3xl sm:text-4xl text-brand-900 mb-1.5">Settings</h1>
        <p className="text-sand-600 text-sm">Manage your profile, photo, and account details</p>
      </div>

      <form onSubmit={handleSave} className="space-y-5">

        {/* ══ Avatar card ════════════════════════════════════════════ */}
        <div className="bg-white rounded-3xl border border-sand-200 overflow-hidden shadow-sm">
          <div className="px-6 pt-6 pb-4 border-b border-sand-100 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
            <h2 className="font-display text-lg text-brand-900">Profile photo</h2>
          </div>

          <div className="p-6 sm:p-7">
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-start sm:items-center">

              {/* Avatar circle — click or drag */}
              <div
                className={`relative flex-shrink-0 group cursor-pointer rounded-full transition-all duration-200 ${dragOver ? 'scale-105' : 'hover:scale-[1.03]'}`}
                onClick={() => !uploading && fileRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                {/* Glow ring */}
                <div className={`absolute -inset-1.5 rounded-full transition-opacity duration-300 bg-gradient-to-br from-brand-200 to-brand-500 ${dragOver ? 'opacity-40' : 'opacity-0 group-hover:opacity-30'}`} />

                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-brand-50 overflow-hidden border-2 border-sand-200 group-hover:border-brand-300 transition-colors">
                  {displayUrl ? (
                    <img
                      key={displayUrl}
                      src={displayUrl}
                      alt="avatar"
                      className="w-full h-full object-cover"
                      onError={() => { setPreviewUrl(''); setStoredUrl('') }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-brand-600 text-3xl font-display select-none">
                      {initials}
                    </div>
                  )}

                  {/* Overlay: spinner while uploading, camera icon on hover */}
                  <div className={`absolute inset-0 bg-brand-900/50 flex flex-col items-center justify-center gap-1 transition-opacity duration-200 ${uploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    {uploading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-white text-[10px] font-medium tracking-wide">CHANGE</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Upload progress ring */}
                {uploading && (
                  <div className="absolute -inset-1 rounded-full border-2 border-brand-400 border-t-transparent animate-spin" />
                )}
              </div>

              {/* Info + controls */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-brand-900 text-base mb-0.5 truncate">{fullName || 'Your Name'}</p>
                <p className="text-sand-500 text-sm mb-4 truncate">{user?.email}</p>

                <div className="flex flex-wrap gap-3 items-center">
                  <button
                    type="button"
                    onClick={() => !uploading && fileRef.current?.click()}
                    disabled={uploading}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-60 min-h-[40px]"
                  >
                    {uploading ? (
                      <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />Uploading…</>
                    ) : (
                      <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>Upload photo</>
                    )}
                  </button>
                  <span className="text-xs text-sand-400">JPG, PNG or WebP · max 5 MB</span>
                </div>

                {avatarErr && (
                  <div className="mt-3 flex items-start gap-2 bg-red-50 rounded-xl px-3 py-2.5 border border-red-100">
                    <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                    <p className="text-red-700 text-xs leading-snug">{avatarErr}</p>
                  </div>
                )}

                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileChange} />
              </div>
            </div>
          </div>
        </div>

        {/* ══ Profile card ════════════════════════════════════════════ */}
        <div className="bg-white rounded-3xl border border-sand-200 overflow-hidden shadow-sm">
          <div className="px-6 pt-6 pb-4 border-b border-sand-100 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
            <h2 className="font-display text-lg text-brand-900">Profile details</h2>
          </div>
          <div className="p-6 sm:p-7 space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-sand-500 mb-2">Full name</label>
              <div className="relative">
                <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Ahmed Hassan" className="w-full pl-4 pr-10" />
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sand-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-sand-500 mb-2">Email address</label>
              <div className="relative">
                <input value={user?.email || ''} disabled className="w-full pl-4 pr-10 opacity-50 cursor-not-allowed bg-sand-50" />
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sand-300 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
              </div>
              <p className="text-xs text-sand-400 mt-1.5 ml-1">Email address cannot be changed</p>
            </div>
          </div>
        </div>

        {/* ══ Account card ════════════════════════════════════════════ */}
        <div className="bg-white rounded-3xl border border-sand-200 overflow-hidden shadow-sm">
          <div className="px-6 pt-6 pb-4 border-b border-sand-100 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
            <h2 className="font-display text-lg text-brand-900">Account</h2>
          </div>
          <div className="p-6 sm:p-7">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', label: 'Member since', value: memberSince },
                { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', label: 'Account type', value: null, badge: user?.role || 'user' },
                { icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', label: 'Status', value: null, pulse: true },
              ].map(({ icon, label, value, badge, pulse }) => (
                <div key={label} className="bg-sand-50 rounded-2xl p-4 border border-sand-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3.5 h-3.5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon}/></svg>
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-sand-500">{label}</p>
                  </div>
                  {value && <p className="font-medium text-brand-900 text-sm">{value}</p>}
                  {badge && <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 text-xs font-semibold capitalize">{badge}</span>}
                  {pulse && <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse"/><p className="font-medium text-brand-700 text-sm">Active</p></div>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Feedback */}
        {error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-2xl px-4 py-3.5">
            <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
        {saved && (
          <div className="flex items-center gap-3 bg-brand-50 border border-brand-100 rounded-2xl px-4 py-3.5">
            <div className="w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center flex-shrink-0">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
            </div>
            <p className="text-brand-700 text-sm font-medium">Settings saved successfully</p>
          </div>
        )}

        <button type="submit" disabled={saving}
          className="w-full bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white font-medium py-3.5 rounded-2xl transition-all disabled:opacity-60 text-sm sm:text-base min-h-[52px] flex items-center justify-center gap-2 shadow-sm hover:shadow-md">
          {saving
            ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Saving…</>
            : <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>Save changes</>}
        </button>
      </form>
    </div>
  )
}
