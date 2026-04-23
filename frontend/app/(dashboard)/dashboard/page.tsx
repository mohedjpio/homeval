'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { getLocations, getMarket } from '@/lib/api'
import { formatEGP, formatNumber } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface LocationStat { location: string; mean_price: number; median_price: number; std_price: number; count: number }
interface Market { total_listings: number; global_mean: number; global_median: number; locations_count: number; price_range_low: number; price_range_high: number }

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white rounded-xl border border-sand-200 p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-sand-500 mb-2">{label}</p>
      <p className="font-display text-2xl text-brand-900">{value}</p>
      {sub && <p className="text-xs text-sand-400 mt-1">{sub}</p>}
    </div>
  )
}

export default function DashboardPage() {
  const [locations, setLocations] = useState<LocationStat[]>([])
  const [market, setMarket]       = useState<Market | null>(null)
  const [loading, setLoading]     = useState(true)
  const [sortBy, setSortBy]       = useState<'mean_price' | 'count' | 'median_price'>('mean_price')

  useEffect(() => {
    Promise.all([getLocations(), getMarket()])
      .then(([locs, mkt]) => { setLocations(locs); setMarket(mkt) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const sorted = [...locations].sort((a, b) => b[sortBy] - a[sortBy]).slice(0, 15)
  const BRAND = '#1d9e75'
  const LIGHT = '#9FE1CB'

  if (loading) return (
    <div className="animate-fade-up space-y-6">
      <div className="h-8 w-48 shimmer rounded-lg" />
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-24 shimmer rounded-xl" />)}
      </div>
      <div className="h-72 shimmer rounded-2xl" />
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto animate-fade-up">
      <div className="mb-8">
        <h1 className="font-display text-3xl text-brand-900 mb-1">Market Analytics</h1>
        <p className="text-sand-600 text-sm">Egyptian real estate overview based on 30,000+ property records</p>
      </div>

      {/* KPI cards */}
      {market && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total listings"   value={formatNumber(market.total_listings)} sub="in dataset" />
          <StatCard label="Global median"    value={formatEGP(market.global_median)} sub="all locations" />
          <StatCard label="Global mean"      value={formatEGP(market.global_mean)} sub="all locations" />
          <StatCard label="Locations"        value={String(market.locations_count)} sub="tracked areas" />
        </div>
      )}

      {/* Chart */}
      <div className="bg-white rounded-2xl border border-sand-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-lg text-brand-800">Price by location</h2>
          <div className="flex gap-2">
            {(['mean_price','median_price','count'] as const).map(k => (
              <button
                key={k}
                onClick={() => setSortBy(k)}
                className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${sortBy === k ? 'bg-brand-500 text-white' : 'text-sand-600 bg-sand-100 hover:bg-sand-200'}`}
              >
                {k === 'mean_price' ? 'Mean' : k === 'median_price' ? 'Median' : 'Count'}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={sorted} margin={{ top: 4, right: 8, left: 8, bottom: 60 }}>
            <XAxis
              dataKey="location"
              tick={{ fontSize: 11, fill: '#7a7768' }}
              angle={-40}
              textAnchor="end"
              interval={0}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#7a7768' }}
              tickFormatter={v => sortBy === 'count' ? formatNumber(v) : `${(v/1e6).toFixed(1)}M`}
              width={56}
            />
            <Tooltip
              formatter={(v: number) => sortBy === 'count' ? formatNumber(v) : formatEGP(v)}
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e4e2d8' }}
            />
            <Bar dataKey={sortBy} radius={[4, 4, 0, 0]}>
              {sorted.map((_, i) => (
                <Cell key={i} fill={i === 0 ? BRAND : i < 3 ? '#5DCAA5' : LIGHT} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Location table */}
      <div className="bg-white rounded-2xl border border-sand-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-sand-100">
          <h2 className="font-display text-lg text-brand-800">Location statistics</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-sand-50 border-b border-sand-100">
              <tr>
                {['Location','Listings','Mean price','Median price','Std dev'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wide text-sand-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {locations.sort((a,b) => b.mean_price - a.mean_price).map((l, i) => (
                <tr key={l.location} className={`border-b border-sand-50 hover:bg-sand-50 transition-colors ${i % 2 === 0 ? '' : 'bg-sand-50/30'}`}>
                  <td className="px-5 py-3 font-medium text-brand-800">{l.location}</td>
                  <td className="px-5 py-3 text-sand-600">{formatNumber(l.count)}</td>
                  <td className="px-5 py-3 font-medium">{formatEGP(l.mean_price)}</td>
                  <td className="px-5 py-3">{formatEGP(l.median_price)}</td>
                  <td className="px-5 py-3 text-sand-500">{formatEGP(l.std_price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
