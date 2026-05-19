'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'
import { predictPrice, PredictionInput } from '@/lib/api'
import { formatEGP, formatUSD } from '@/lib/utils'

const LOCATIONS = [
  '6th of October City','Ain Sokhna','Aswan','Badr City','Dokki',
  'El Shorouk City','Heliopolis','Hurghada','Ismailia','Luxor',
  'Maadi','Mansoura','Mohandessin','Mostakbal City','Nasr City',
  'New Administrative Capital','New Mansoura','Obour City','Port Said',
  'Sheikh Zayed','Shubra','Suez','Tanta','Zamalek','Alexandria',
]
const PROPERTY_TYPES = ['Apartment','Villa','Studio','Duplex','Penthouse','Townhouse']
const CONDITIONS     = ['Needs Renovation','Fair','Good','New','Excellent']
const FINISHINGS     = ['Core & Shell','Semi Finished','Fully Finished']
const FURNISHINGS    = ['Unfurnished','Partially Furnished','Furnished']
const VIEWS          = ['Street','City','Garden','Pool','Sea/Lake']

const DEFAULTS: PredictionInput = {
  area_sqm: 120, rooms: 3, bathrooms: 2,
  location: 'New Administrative Capital', property_type: 'Apartment',
  condition: 'Good', finishing: 'Fully Finished', furnishing: 'Unfurnished', view: 'City',
  has_elevator: true, has_parking: true, has_garden: false, has_pool: false,
  has_gym: false, has_security: false, has_balcony: true, is_compound: false,
  parking_spaces: 1, garden_sqm: 0,
  floor: 3, building_age_years: 3, floor_to_ceiling_height_m: 2.9,
}

// ── Sub-components ─────────────────────────────────────────────────────────
function SectionHeader({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <div className="w-7 h-7 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
        <svg className="w-3.5 h-3.5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon}/>
        </svg>
      </div>
      <h3 className="font-semibold text-sm text-brand-900 uppercase tracking-wide">{title}</h3>
    </div>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-medium text-sand-500 mb-1.5 uppercase tracking-wide">{children}</label>
}

function Toggle({ label, icon, checked, onChange }: { label: string; icon: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all select-none min-h-[44px]
        ${checked
          ? 'bg-brand-50 border-brand-200 text-brand-700'
          : 'bg-sand-50 border-sand-200 text-sand-600 hover:border-sand-300'}`}
    >
      <svg className={`w-3.5 h-3.5 flex-shrink-0 ${checked ? 'text-brand-500' : 'text-sand-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon}/>
      </svg>
      <span className="truncate">{label}</span>
      <div className={`ml-auto w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors
        ${checked ? 'bg-brand-500 border-brand-500' : 'border-sand-300'}`}>
        {checked && <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>}
      </div>
    </button>
  )
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white rounded-2xl border border-sand-200 p-3 sm:p-4">
      <p className="text-xs text-sand-400 uppercase tracking-wide mb-1">{label}</p>
      <p className="font-semibold text-brand-900 text-sm leading-tight">{value}</p>
      {sub && <p className="text-xs text-sand-400 mt-0.5">{sub}</p>}
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function PredictPage() {
  const [form,    setForm]    = useState<PredictionInput>(DEFAULTS)
  const [loading, setLoading] = useState(false)
  const [result,  setResult]  = useState<any>(null)
  const [error,   setError]   = useState('')
  const [step,    setStep]    = useState<'form'|'result'>('form')

  function set<K extends keyof PredictionInput>(key: K, value: PredictionInput[K]) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError('')
    try {
      const r = await predictPrice(form)
      setResult(r)
      setStep('result')
      setTimeout(() => document.getElementById('result-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Prediction failed. Make sure the backend is running.')
    } finally { setLoading(false) }
  }

  const amenityToggles = [
    { key: 'has_elevator',  label: 'Elevator',    icon: 'M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18z' },
    { key: 'has_balcony',   label: 'Balcony',      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { key: 'has_pool',      label: 'Pool',          icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6' },
    { key: 'has_gym',       label: 'Gym',           icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
    { key: 'has_security',  label: 'Security',      icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
    { key: 'has_garden',    label: 'Garden',        icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' },
    { key: 'is_compound',   label: 'In Compound',   icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    { key: 'has_parking',   label: 'Parking',       icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4' },
  ]

  return (
    <div className="w-full max-w-6xl mx-auto animate-fade-up overflow-x-hidden">

      {/* ── Header ── */}
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl text-brand-900 mb-1">Price Estimator</h1>
          <p className="text-sand-500 text-xs sm:text-sm">ML-powered valuation · Egypt · R²=0.987 · 32-feature model</p>
        </div>
        {result && (
          <button type="button" onClick={() => { setResult(null); setStep('form') }}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 text-xs text-sand-500 hover:text-brand-600 transition-colors px-3 py-1.5 rounded-lg border border-sand-200 hover:border-brand-200 bg-white">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
            New estimate
          </button>
        )}
      </div>

      <div className="flex flex-col xl:grid xl:grid-cols-5 gap-5 xl:gap-6">

        {/* ══ Form ═══════════════════════════════════════════════════ */}
        <form onSubmit={handleSubmit} className="xl:col-span-3 space-y-4">

          {/* Location & Type */}
          <div className="bg-white rounded-3xl border border-sand-200 p-5 sm:p-6 shadow-sm">
            <SectionHeader icon="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" title="Location & Type" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <FieldLabel>Location</FieldLabel>
                <select value={form.location} onChange={e => set('location', e.target.value)} className="w-full">
                  {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <FieldLabel>Property Type</FieldLabel>
                <select value={form.property_type} onChange={e => set('property_type', e.target.value)} className="w-full">
                  {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Dimensions */}
          <div className="bg-white rounded-3xl border border-sand-200 p-5 sm:p-6 shadow-sm">
            <SectionHeader icon="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" title="Dimensions" />
            <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-3">
              {[
                { label: 'Area (m²)',  key: 'area_sqm',  min: 20, max: 900 },
                { label: 'Bedrooms',   key: 'rooms',     min: 0,  max: 8  },
                { label: 'Bathrooms',  key: 'bathrooms', min: 0,  max: 8  },
              ].map(({ label, key, min, max }) => (
                <div key={key}>
                  <FieldLabel>{label}</FieldLabel>
                  <input type="number" min={min} max={max} value={(form as any)[key]}
                    onChange={e => set(key as any, +e.target.value)} className="w-full text-center font-semibold" />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              {[
                { label: 'Floor',          key: 'floor',                      min: 0, max: 60,  step: 1   },
                { label: 'Building Age',   key: 'building_age_years',         min: 0, max: 100, step: 1   },
                { label: 'Ceiling Ht (m)', key: 'floor_to_ceiling_height_m',  min: 2, max: 6,   step: 0.1 },
              ].map(({ label, key, min, max, step }) => (
                <div key={key}>
                  <FieldLabel>{label}</FieldLabel>
                  <input type="number" min={min} max={max} step={step} value={(form as any)[key]}
                    onChange={e => set(key as any, +e.target.value)} className="w-full text-center" />
                </div>
              ))}
            </div>
          </div>

          {/* Quality */}
          <div className="bg-white rounded-3xl border border-sand-200 p-5 sm:p-6 shadow-sm">
            <SectionHeader icon="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" title="Quality & Finishing" />
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {[
                { label: 'Condition', key: 'condition',  opts: CONDITIONS  },
                { label: 'Finishing', key: 'finishing',  opts: FINISHINGS  },
                { label: 'Furnished', key: 'furnishing', opts: FURNISHINGS },
                { label: 'View',      key: 'view',       opts: VIEWS       },
              ].map(({ label, key, opts }) => (
                <div key={key}>
                  <FieldLabel>{label}</FieldLabel>
                  <select value={(form as any)[key]} onChange={e => set(key as any, e.target.value)} className="w-full">
                    {opts.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Amenities */}
          <div className="bg-white rounded-3xl border border-sand-200 p-5 sm:p-6 shadow-sm">
            <SectionHeader icon="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" title="Amenities" />
            <div className="grid grid-cols-2 gap-2 sm:gap-2.5 mb-4">
              {amenityToggles.map(({ key, label, icon }) => (
                <Toggle key={key} label={label} icon={icon}
                  checked={!!(form as any)[key]}
                  onChange={v => set(key as any, v)} />
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-sand-100">
              <div>
                <FieldLabel>Parking Spaces</FieldLabel>
                <input type="number" min={0} max={10} value={form.parking_spaces ?? 0}
                  onChange={e => set('parking_spaces', +e.target.value)} className="w-full text-center" />
              </div>
              <div>
                <FieldLabel>Garden Size (m²)</FieldLabel>
                <input type="number" min={0} max={2000} value={form.garden_sqm ?? 0}
                  onChange={e => set('garden_sqm', +e.target.value)} className="w-full text-center" />
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
              <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-700 active:scale-[.99] text-white font-semibold py-4 rounded-2xl transition-all disabled:opacity-60 flex items-center justify-center gap-2.5 text-base shadow-md hover:shadow-lg">
            {loading ? (
              <><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/><span>Calculating…</span></>
            ) : (
              <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>Estimate Price</>
            )}
          </button>
        </form>

        {/* ══ Result panel ═══════════════════════════════════════════ */}
        <div id="result-panel" className="xl:col-span-2 space-y-4">
          {result ? (
            <div className="animate-fade-up space-y-4">

              {/* Main price card */}
              <div className="relative bg-brand-700 rounded-3xl p-5 sm:p-7 text-white overflow-hidden shadow-lg">
                {/* Background pattern */}
                <div className="absolute top-0 right-0 w-48 h-48 opacity-5">
                  <svg viewBox="0 0 100 100" fill="currentColor"><circle cx="80" cy="20" r="40"/><circle cx="20" cy="80" r="30"/></svg>
                </div>

                <div className="relative">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-brand-500/50 flex items-center justify-center">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                    </div>
                    <p className="text-brand-200 text-xs font-medium uppercase tracking-widest">Estimated Value</p>
                  </div>

                  <p className="font-display text-4xl sm:text-5xl mb-1 leading-tight">{formatEGP(result.predicted_price_egp)}</p>
                  <p className="text-brand-300 text-sm mb-5">{formatUSD(result.predicted_price_usd)}</p>

                  {/* Confidence bar */}
                  <div className="bg-brand-800/60 rounded-2xl p-3.5">
                    <p className="text-brand-300 text-xs mb-2.5 font-medium">Confidence range (±12%)</p>
                    <div className="relative h-2 bg-brand-600/50 rounded-full mb-2.5 overflow-hidden">
                      <div className="absolute inset-y-0 left-[12%] right-[12%] bg-gradient-to-r from-brand-300 to-brand-200 rounded-full" />
                      <div className="absolute inset-y-0 left-[50%] w-0.5 bg-white/60 rounded-full -translate-x-1/2" />
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-brand-300">{formatEGP(result.confidence_low)}</span>
                      <span className="text-white font-medium">{formatEGP(result.predicted_price_egp)}</span>
                      <span className="text-brand-300">{formatEGP(result.confidence_high)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-3">
                <StatCard label="Per m²" value={formatEGP(result.price_per_sqm)} />
                <StatCard label="USD Equivalent" value={formatUSD(result.predicted_price_usd)} />
              </div>

              {/* Location comparison */}
              {result.location_comparison && (
                <div className="bg-white rounded-3xl border border-sand-200 p-4 sm:p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-4 h-4 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                    <p className="text-xs font-semibold uppercase tracking-wide text-sand-500">Area Comparison</p>
                  </div>
                  <div className="space-y-2 mb-3">
                    {[
                      ['Area Median', formatEGP(result.location_comparison.area_median)],
                      ['Your Estimate', formatEGP(result.predicted_price_egp)],
                      ['Percentile', `${result.location_comparison.percentile}th`],
                    ].map(([l, v]) => (
                      <div key={l} className="flex justify-between items-center">
                        <span className="text-sand-500 text-xs">{l}</span>
                        <span className="font-semibold text-brand-900 text-xs">{v}</span>
                      </div>
                    ))}
                  </div>
                  <div className="h-2 bg-sand-100 rounded-full overflow-hidden">
                    <div className="h-2 bg-gradient-to-r from-brand-400 to-brand-600 rounded-full transition-all duration-700"
                      style={{ width: `${result.location_comparison.percentile}%` }} />
                  </div>
                  <p className="text-xs text-sand-400 mt-1.5 text-right">{result.location_comparison.percentile}th percentile in {form.location}</p>
                </div>
              )}

              {/* Model accuracy */}
              <div className="bg-white rounded-3xl border border-sand-200 p-4 sm:p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-4 h-4 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/></svg>
                  <p className="text-xs font-semibold uppercase tracking-wide text-sand-500">Model Accuracy</p>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-sand-50 rounded-xl p-2.5 border border-sand-100">
                    <p className="text-xs text-sand-400 mb-1">R²</p>
                    <p className="font-bold text-brand-700 text-base">{result.model_metrics?.r2?.toFixed(3)}</p>
                  </div>
                  <div className="bg-sand-50 rounded-xl p-2.5 border border-sand-100">
                    <p className="text-xs text-sand-400 mb-1">MAE</p>
                    <p className="font-semibold text-brand-900 text-xs">{formatEGP(result.model_metrics?.mae || 404363)}</p>
                  </div>
                  <div className="bg-sand-50 rounded-xl p-2.5 border border-sand-100">
                    <p className="text-xs text-sand-400 mb-1">RMSE</p>
                    <p className="font-semibold text-brand-900 text-xs">{formatEGP(result.model_metrics?.rmse || 600000)}</p>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white rounded-3xl border-2 border-dashed border-sand-200 p-8 sm:p-10 flex flex-col items-center justify-center text-center xl:min-h-[480px]">
              <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
              </div>
              <p className="font-semibold text-brand-900 mb-1.5">Ready to estimate</p>
              <p className="text-sand-500 text-sm max-w-[200px]">Fill in the property details and click <span className="text-brand-600 font-medium">Estimate Price</span></p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {['32 features', 'R²=0.987', 'Egypt-wide'].map(tag => (
                  <span key={tag} className="px-3 py-1 bg-sand-50 border border-sand-200 rounded-full text-xs text-sand-500">{tag}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
