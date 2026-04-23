'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { getPredictions, deletePrediction } from '@/lib/api'
import { formatEGP, formatUSD } from '@/lib/utils'

export default function HistoryPage() {
  const [preds, setPreds]   = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDel]  = useState<string | null>(null)

  async function load() {
    try { const d = await getPredictions(); setPreds(d.data || []) }
    catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function handleDelete(id: string) {
    setDel(id)
    try { await deletePrediction(id); setPreds(p => p.filter(x => x.id !== id)) }
    catch {}
    finally { setDel(null) }
  }

  if (loading) return (
    <div className="max-w-4xl mx-auto animate-fade-up space-y-3">
      <div className="h-8 w-40 shimmer rounded-lg mb-6" />
      {[...Array(5)].map((_,i) => <div key={i} className="h-20 shimmer rounded-xl" />)}
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto animate-fade-up">
      <div className="mb-8">
        <h1 className="font-display text-3xl text-brand-900 mb-1">Prediction History</h1>
        <p className="text-sand-600 text-sm">{preds.length} saved valuation{preds.length !== 1 ? 's' : ''}</p>
      </div>

      {preds.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-sand-300 p-16 text-center">
          <div className="w-14 h-14 rounded-full bg-sand-100 flex items-center justify-center text-2xl mx-auto mb-4">◫</div>
          <p className="text-sand-600">No predictions yet.<br />Head to the <a href="/predict" className="text-brand-600 font-medium hover:underline">Estimator</a> to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {preds.map(p => (
            <div key={p.id} className="bg-white rounded-xl border border-sand-200 px-5 py-4 flex items-center justify-between hover:border-sand-300 transition-colors">
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 flex-shrink-0 mt-0.5">◉</div>
                <div>
                  <p className="font-medium text-sand-900">
                    {p.property_type?.charAt(0).toUpperCase() + p.property_type?.slice(1)} · {p.location}
                  </p>
                  <p className="text-xs text-sand-500 mt-0.5">
                    {p.area_sqm} m² · {p.rooms} rooms · {p.bathrooms} bath · Floor {p.floor}
                    &nbsp;·&nbsp;{p.finishing?.replace(/_/g,' ')}
                  </p>
                  <p className="text-xs text-sand-400 mt-1">
                    {new Date(p.created_at).toLocaleDateString('en-EG', { day:'numeric', month:'short', year:'numeric' })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="font-display text-lg text-brand-700">{formatEGP(p.predicted_price_egp)}</p>
                  <p className="text-xs text-sand-400">{formatUSD(p.predicted_price_usd)}</p>
                </div>
                <button
                  onClick={() => handleDelete(p.id)}
                  disabled={deleting === p.id}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sand-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  {deleting === p.id ? '…' : '✕'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
