'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { getPredictions, deletePrediction } from '@/lib/api'
import { formatEGP, formatUSD } from '@/lib/utils'

export default function HistoryPage() {
  const [preds,   setPreds]   = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting,setDel]     = useState<string|null>(null)

  useEffect(() => {
    getPredictions()
      .then((d:any) => setPreds(d.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function handleDelete(id: string) {
    setDel(id)
    try { await deletePrediction(id); setPreds(p => p.filter(x => x.id !== id)) }
    catch {} finally { setDel(null) }
  }

  if (loading) return (
    <div className="max-w-3xl mx-auto space-y-3 animate-fade-up overflow-x-hidden">
      <div className="h-7 w-40 shimmer rounded-lg mb-6"/>
      {[...Array(5)].map((_,i) => <div key={i} className="h-20 sm:h-24 shimmer rounded-xl"/>)}
    </div>
  )

  return (
    <div className="w-full max-w-3xl mx-auto animate-fade-up overflow-x-hidden">
      <div className="mb-6 sm:mb-8">
        <h1 className="font-display text-2xl sm:text-3xl text-brand-900 mb-1">Prediction History</h1>
        <p className="text-sand-600 text-sm">
          {preds.length} saved valuation{preds.length !== 1 ? 's' : ''}
        </p>
      </div>

      {preds.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-sand-300 p-10 sm:p-16 text-center">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-sand-100 flex items-center justify-center text-xl sm:text-2xl mx-auto mb-4">◫</div>
          <p className="text-sand-600 text-sm">
            No predictions yet.<br/>
            Head to the{' '}
            <a href="/predict" className="text-brand-600 font-medium hover:underline">Estimator</a>{' '}
            to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-2 sm:space-y-3">
          {(preds||[]).map(p => (
            <div key={p.id}
              className="bg-white rounded-xl border border-sand-200 px-4 py-3 sm:px-5 sm:py-4 flex items-start sm:items-center justify-between gap-3 hover:border-sand-300 transition-colors">

              {/* Left — icon + details */}
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 flex-shrink-0 mt-0.5">
                  ◉
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sand-900 text-sm truncate">
                    {p.property_type?.charAt(0).toUpperCase() + p.property_type?.slice(1)} · {p.location}
                  </p>
                  <p className="text-xs text-sand-500 mt-0.5 truncate">
                    {p.area_sqm}m² · {p.rooms}BR · {p.bathrooms}BA
                    {p.floor != null ? ` · Floor ${p.floor}` : ''}
                    {p.finishing ? ` · ${p.finishing.replace(/_/g,' ')}` : ''}
                  </p>
                  <p className="text-xs text-sand-400 mt-1">
                    {new Date(p.created_at).toLocaleDateString('en-EG', { day:'numeric', month:'short', year:'numeric' })}
                  </p>
                </div>
              </div>

              {/* Right — price + delete */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="text-right">
                  <p className="font-display text-base sm:text-lg text-brand-700 whitespace-nowrap">
                    {formatEGP(p.predicted_price_egp)}
                  </p>
                  <p className="text-xs text-sand-400 whitespace-nowrap">
                    {formatUSD(p.predicted_price_usd)}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(p.id)}
                  disabled={deleting === p.id}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-sand-400 hover:text-red-500 hover:bg-red-50 active:bg-red-100 transition-colors disabled:opacity-50 flex-shrink-0"
                  aria-label="Delete prediction"
                >
                  {deleting === p.id ? (
                    <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"/>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
