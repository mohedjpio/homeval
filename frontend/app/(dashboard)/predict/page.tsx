'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { predictPrice, getLocations, PredictionInput, PredictionResponse } from '@/lib/api'
import { formatEGP, formatUSD, formatNumber } from '@/lib/utils'

const CONDITIONS   = ['poor','fair','good','very_good','excellent']
const FINISHINGS   = ['unfinished','semi_finished','fully_finished','super_lux','ultra_lux']
const FURNISHINGS  = ['unfurnished','semi_furnished','fully_furnished']
const VIEWS        = ['none','garden','street','pool','sea','city']
const TYPES        = ['apartment','villa','duplex','studio','chalet','townhouse','penthouse']

const DEFAULTS: PredictionInput = {
  area_sqm: 120, rooms: 3, bathrooms: 2, location: '',
  condition: 'good', finishing: 'fully_finished', furnishing: 'unfurnished',
  floor: 2, has_elevator: false, has_parking: false, has_garden: false, has_pool: false,
  view: 'none', property_type: 'apartment',
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-medium uppercase tracking-wide text-sand-600 mb-1.5">{children}</label>
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="font-display text-base text-brand-700 mb-3 pb-2 border-b border-sand-100">{title}</h3>
      {children}
    </div>
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer py-1">
      <div
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-colors ${checked ? 'bg-brand-500' : 'bg-sand-200'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : ''}`} />
      </div>
      <span className="text-sm text-sand-700">{label}</span>
    </label>
  )
}

export default function PredictPage() {
  const [form, setForm]         = useState<PredictionInput>(DEFAULTS)
  const [locations, setLocs]    = useState<string[]>([])
  const [loading, setLoading]   = useState(false)
  const [result, setResult]     = useState<PredictionResponse | null>(null)
  const [error, setError]       = useState('')

  useEffect(() => {
    getLocations().then((data: any[]) => {
      const locs = data.map((d: any) => d.location).sort()
      setLocs(locs)
      setForm(f => ({ ...f, location: locs[0] || '' }))
    }).catch(() => {})
  }, [])

  function set<K extends keyof PredictionInput>(key: K, value: PredictionInput[K]) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const r = await predictPrice(form)
      setResult(r)
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Prediction failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto animate-fade-up">
      <div className="mb-8">
        <h1 className="font-display text-3xl text-brand-900 mb-1">Price Estimator</h1>
        <p className="text-sand-600 text-sm">ML-powered valuation using 30,000+ Egyptian property records</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-3 bg-white rounded-2xl border border-sand-200 p-6">

          <Section title="Location & Type">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Location</Label>
                <select value={form.location} onChange={e => set('location', e.target.value)}>
                  {locations.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <Label>Property type</Label>
                <select value={form.property_type} onChange={e => set('property_type', e.target.value)}>
                  {TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
                </select>
              </div>
            </div>
          </Section>

          <Section title="Dimensions">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Area (m²)</Label>
                <input type="number" min={10} max={10000} value={form.area_sqm} onChange={e => set('area_sqm', +e.target.value)} />
              </div>
              <div>
                <Label>Rooms</Label>
                <input type="number" min={0} max={20} value={form.rooms} onChange={e => set('rooms', +e.target.value)} />
              </div>
              <div>
                <Label>Bathrooms</Label>
                <input type="number" min={0} max={10} value={form.bathrooms} onChange={e => set('bathrooms', +e.target.value)} />
              </div>
            </div>
            <div className="mt-4">
              <Label>Floor</Label>
              <input type="number" min={0} max={60} value={form.floor} onChange={e => set('floor', +e.target.value)} className="w-1/3" />
            </div>
          </Section>

          <Section title="Quality">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Condition</Label>
                <select value={form.condition} onChange={e => set('condition', e.target.value)}>
                  {CONDITIONS.map(c => <option key={c} value={c}>{c.replace('_',' ')}</option>)}
                </select>
              </div>
              <div>
                <Label>Finishing</Label>
                <select value={form.finishing} onChange={e => set('finishing', e.target.value)}>
                  {FINISHINGS.map(f => <option key={f} value={f}>{f.replace(/_/g,' ')}</option>)}
                </select>
              </div>
              <div>
                <Label>Furnishing</Label>
                <select value={form.furnishing} onChange={e => set('furnishing', e.target.value)}>
                  {FURNISHINGS.map(f => <option key={f} value={f}>{f.replace('_',' ')}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-4">
              <Label>View</Label>
              <select value={form.view} onChange={e => set('view', e.target.value)} className="w-1/2">
                {VIEWS.map(v => <option key={v} value={v}>{v.charAt(0).toUpperCase()+v.slice(1)}</option>)}
              </select>
            </div>
          </Section>

          <Section title="Amenities">
            <div className="grid grid-cols-2 gap-1">
              <Toggle label="Elevator"   checked={form.has_elevator} onChange={v => set('has_elevator', v)} />
              <Toggle label="Parking"    checked={form.has_parking}  onChange={v => set('has_parking',  v)} />
              <Toggle label="Garden"     checked={form.has_garden}   onChange={v => set('has_garden',   v)} />
              <Toggle label="Pool"       checked={form.has_pool}     onChange={v => set('has_pool',     v)} />
            </div>
          </Section>

          {error && <p className="text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2 mb-4">{error}</p>}

          <button
            type="submit" disabled={loading || !form.location}
            className="w-full bg-brand-500 hover:bg-brand-600 text-white font-medium py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading
              ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>&nbsp;Calculating…</>
              : '◎ Estimate Price'
            }
          </button>
        </form>

        {/* Result Panel */}
        <div className="lg:col-span-2 space-y-4">
          {result ? (
            <div className="animate-fade-up space-y-4">
              {/* Main price card */}
              <div className="bg-brand-700 rounded-2xl p-6 text-white">
                <p className="text-brand-200 text-xs uppercase tracking-widest mb-2">Estimated value</p>
                <p className="font-display text-4xl mb-1">{formatEGP(result.predicted_price_egp)}</p>
                <p className="text-brand-300 text-sm">{formatUSD(result.predicted_price_usd)}</p>

                <div className="mt-5 pt-4 border-t border-brand-600">
                  <p className="text-brand-200 text-xs mb-1">Confidence range</p>
                  <div className="flex items-center gap-2 text-sm">
                    <span>{formatEGP(result.confidence_low)}</span>
                    <span className="flex-1 h-1.5 bg-brand-600 rounded-full relative">
                      <span className="absolute inset-y-0 left-1/4 right-1/4 bg-brand-300 rounded-full"/>
                    </span>
                    <span>{formatEGP(result.confidence_high)}</span>
                  </div>
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-xl border border-sand-200 p-4">
                  <p className="text-xs text-sand-500 mb-1">Per m²</p>
                  <p className="font-medium text-brand-900">{formatEGP(result.price_per_sqm)}</p>
                </div>
                <div className="bg-white rounded-xl border border-sand-200 p-4">
                  <p className="text-xs text-sand-500 mb-1">Model R²</p>
                  <p className="font-medium text-brand-900">{(result.model_metrics.r2 * 100).toFixed(1)}%</p>
                </div>
              </div>

              {/* Location comparison */}
              {result.location_comparison && (
                <div className="bg-white rounded-xl border border-sand-200 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-sand-500 mb-3">Area comparison</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-sand-600">Area median</span>
                      <span className="font-medium">{formatEGP(result.location_comparison.area_median)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sand-600">Percentile</span>
                      <span className="font-medium text-brand-600">{result.location_comparison.percentile}th</span>
                    </div>
                    {/* Percentile bar */}
                    <div className="h-2 bg-sand-100 rounded-full mt-2">
                      <div
                        className="h-2 bg-brand-500 rounded-full transition-all"
                        style={{ width: `${result.location_comparison.percentile}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Model metrics */}
              <div className="bg-white rounded-xl border border-sand-200 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-sand-500 mb-3">Model accuracy</p>
                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div><p className="text-xs text-sand-500">MAE</p><p className="font-medium">{formatEGP(result.model_metrics.mae)}</p></div>
                  <div><p className="text-xs text-sand-500">RMSE</p><p className="font-medium">{formatEGP(result.model_metrics.rmse)}</p></div>
                  <div><p className="text-xs text-sand-500">R²</p><p className="font-medium">{result.model_metrics.r2.toFixed(3)}</p></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-sand-300 p-8 flex flex-col items-center justify-center text-center h-full min-h-64">
              <div className="w-14 h-14 rounded-full bg-sand-100 flex items-center justify-center mb-4 text-2xl">◎</div>
              <p className="text-sand-600 text-sm">Fill in the form and click<br/><span className="text-brand-600 font-medium">Estimate Price</span> to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
