'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { getToken } from '@/lib/auth'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  ScatterChart, Scatter, LineChart, Line, AreaChart, Area,
  PieChart, Pie, Cell, Legend, ReferenceLine,
} from 'recharts'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const C = ['#1d9e75','#F59E0B','#6366F1','#EF4444','#14B8A6','#EC4899','#8B5CF6','#F97316','#0EA5E9','#84CC16']

const fmt    = (n: number) => n>=1e6?`${(n/1e6).toFixed(1)}M`:n>=1e3?`${(n/1e3).toFixed(0)}K`:String(Math.round(n))
const fmtEGP = (n: number) => `EGP ${fmt(n)}`
const fmtPct = (n: number) => `${Number(n).toFixed(1)}%`

const Tip = ({ active, payload, label }: any) => {
  if (!active||!payload?.length) return null
  return (
    <div className="bg-white border border-sand-200 rounded-xl px-3 py-2 shadow-xl text-xs max-w-[200px]">
      <p className="font-semibold text-sand-700 mb-1 truncate">{label}</p>
      {payload.map((p:any,i:number)=>(
        <p key={i} style={{color:p.color}} className="truncate">
          {p.name}: {typeof p.value==='number'&&p.value>10000?fmtEGP(p.value):typeof p.value==='number'?p.value.toFixed(2):p.value}
        </p>
      ))}
    </div>
  )
}

function KPI({ label, value, sub, color='text-brand-600', icon }: any) {
  return (
    <div className="bg-white rounded-xl border border-sand-200 p-3 sm:p-4">
      <div className="flex justify-between items-start mb-1.5">
        <p className="text-xs uppercase tracking-wider text-sand-400 font-medium leading-tight">{label}</p>
        <span className="text-sm sm:text-base flex-shrink-0 ml-1">{icon}</span>
      </div>
      <p className={`font-display text-base sm:text-xl font-bold ${color} leading-tight`}>{value}</p>
      {sub && <p className="text-xs text-sand-400 mt-0.5 truncate">{sub}</p>}
    </div>
  )
}

function Card({ title, sub, children, full=false, className='' }: any) {
  return (
    <div className={`bg-white rounded-xl border border-sand-200 p-4 sm:p-5 ${full?'col-span-full':''} ${className}`}>
      <p className="font-display text-sm font-semibold text-brand-800 mb-0.5 leading-tight">{title}</p>
      {sub && <p className="text-xs text-sand-400 mb-3">{sub}</p>}
      {children}
    </div>
  )
}

function HeatCell({ value, min, max }: { value:number; min:number; max:number }) {
  const t  = max===min ? 0.5 : (value-min)/(max-min)
  const bg = value<0 ? `rgba(239,68,68,${Math.abs(value)})` : `rgba(29,158,117,${t})`
  const txt= Math.abs(t-0.5)>0.25 ? '#fff' : '#1c1c1a'
  return (
    <td style={{background:bg,color:txt}}
      className="text-center p-0.5 sm:p-1 border border-sand-50 font-mono cursor-default hover:opacity-80 transition-opacity"
      title={value.toFixed(3)} style={{background:bg,color:txt,fontSize:'10px',minWidth:'36px'}}>
      {value.toFixed(2)}
    </td>
  )
}

export default function DashboardPage() {
  const [data, setData] = useState<any>(null)
  const [tab,  setTab]  = useState('descriptive')
  const [err,  setErr]  = useState('')
  const [busy, setBusy] = useState(true)

  useEffect(() => {
    fetch(`${API}/api/v1/analytics`, { headers:{ Authorization:`Bearer ${getToken()}` } })
      .then(r=>r.json()).then(d=>{ setData(d); setBusy(false) })
      .catch(()=>{ setErr('Failed to load analytics. Is the backend running?'); setBusy(false) })
  }, [])

  const TABS = [
    { id:'descriptive',  label:'📊 Descriptive'  },
    { id:'univariate',   label:'📈 Univariate'   },
    { id:'multivariate', label:'🔗 Multivariate' },
    { id:'diagnostic',   label:'🔍 Diagnostic'   },
    { id:'predictive',   label:'🤖 Predictive'   },
    { id:'investment',   label:'💰 Investment'   },
    { id:'location',     label:'📍 Location'     },
    { id:'risk',         label:'⚠️ Risk'         },
    { id:'insights',     label:'💡 AI Insights'  },
  ]

  if (busy) return (
    <div className="space-y-4 animate-pulse">
      <div className="h-6 w-48 sm:w-64 bg-sand-200 rounded-lg"/>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-10 gap-2 sm:gap-3">
        {[...Array(10)].map((_,i)=><div key={i} className="h-16 sm:h-20 bg-sand-100 rounded-xl"/>)}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_,i)=><div key={i} className="h-48 sm:h-56 bg-sand-100 rounded-xl"/>)}
      </div>
    </div>
  )

  if (err||!data?.kpis) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3 text-center px-4">
      <p className="text-red-500 font-medium">{err||'Analytics unavailable'}</p>
      <p className="text-sand-500 text-sm">Ensure <code>egypt_home_pricing_30k.csv</code> is in <code>backend/ml/</code></p>
    </div>
  )

  const { kpis, univ, price_hist, sqm_hist, area_hist, yield_hist, metro_hist, age_hist,
    by_area, property_types, conditions, finishing, view_dist,
    price_buckets, cond_price, fin_price, view_price, furnished_price,
    bed_stats, year_price, floor_price, age_price, sqm_price, metro_price, center_price,
    corr_data, corr_labels, cond_fin, furn_fin, bed_bath,
    amenity_premium, compound_premium, area_box, bubble,
    scatter_sqm, scatter_metro, scatter_age,
    feature_importance, correlations, insights,
  } = data

  const sortedArea = [...(by_area||[])].sort((a:any,b:any)=>b.avg_price-a.avg_price)
  const roiSorted  = [...(by_area||[])].sort((a:any,b:any)=>b.avg_roi-a.avg_roi)

  return (
    <div className="w-full max-w-screen-2xl mx-auto space-y-4 sm:space-y-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="font-display text-xl sm:text-2xl text-brand-900">Market Analytics</h1>
          <p className="text-sand-400 text-xs mt-0.5">
            {kpis.total_props?.toLocaleString()} properties · R²={kpis.r2_score} · MAE={fmtEGP(kpis.mae)}
          </p>
        </div>
        <span className="flex items-center gap-2 bg-brand-50 border border-brand-100 text-brand-700 text-xs px-3 py-1.5 rounded-full font-medium self-start sm:self-auto whitespace-nowrap">
          <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse flex-shrink-0"/>
          Live · 30K Records
        </span>
      </div>

      {/* KPIs — 2 cols mobile → 5 cols tablet → 10 cols desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 xl:grid-cols-10 gap-2 sm:gap-3">
        <KPI label="Avg Price"     value={fmtEGP(kpis.avg_price)}          sub="All props"     icon="🏠" color="text-brand-600"/>
        <KPI label="Median"        value={fmtEGP(kpis.median_price)}        sub="50th pct"      icon="📊" color="text-brand-600"/>
        <KPI label="Price/m²"      value={fmtEGP(kpis.avg_price_per_sqm)}   sub="Market rate"   icon="📐" color="text-amber-600"/>
        <KPI label="Yield"         value={fmtPct(kpis.avg_yield)}           sub="Est. annual"   icon="💰" color="text-green-600"/>
        <KPI label="ROI"           value={fmtPct(kpis.avg_roi)}             sub="vs mkt value"  icon="📈" color="text-blue-600"/>
        <KPI label="Listings"      value={kpis.total_props?.toLocaleString()} sub="Total"       icon="🗂️" color="text-purple-600"/>
        <KPI label="Overpriced"    value={fmtPct(kpis.overpriced_pct)}      sub=">15% base"     icon="⚠️" color="text-red-500"/>
        <KPI label="Demand"        value={`${kpis.demand_score}/100`}       sub="Heat index"    icon="🔥" color="text-orange-500"/>
        <KPI label="Model R²"      value={kpis.r2_score}                    sub="ML accuracy"   icon="🧠" color="text-teal-600"/>
        <KPI label="Compound %"    value={fmtPct(kpis.compound_pct)}        sub="In compounds"  icon="🏘️" color="text-indigo-600"/>
      </div>

      {/* Tabs — horizontal scroll on mobile */}
      <div className="flex gap-1 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap scrollbar-none">
        {TABS.map(t => (
          <button key={t.id} onClick={()=>setTab(t.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex-shrink-0
              ${tab===t.id?'bg-brand-500 text-white shadow-sm':'bg-white border border-sand-200 text-sand-600 hover:border-brand-200 active:bg-sand-50'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── DESCRIPTIVE ─────────────────────────────────────────── */}
      {tab==='descriptive' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          <Card title="Price by Area (Top 20)" sub="Average EGP">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={sortedArea.slice(0,20)} margin={{top:4,right:4,left:0,bottom:100}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0efe9"/>
                <XAxis dataKey="area" tick={{fontSize:8}} angle={-45} textAnchor="end" interval={0}/>
                <YAxis tick={{fontSize:9}} tickFormatter={v=>`${(v/1e6).toFixed(0)}M`} width={34}/>
                <Tooltip content={<Tip/>}/>
                <Bar dataKey="avg_price" name="Avg Price" radius={[3,3,0,0]}>
                  {sortedArea.slice(0,20).map((_:any,i:number)=><Cell key={i} fill={C[i%C.length]}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card title="Price Distribution" sub="Histogram — millions EGP">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={price_hist} margin={{top:4,right:4,left:0,bottom:20}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0efe9"/>
                <XAxis dataKey="bin" tick={{fontSize:9}} tickFormatter={v=>`${v}M`}/>
                <YAxis tick={{fontSize:9}} tickFormatter={v=>v>=1000?`${(v/1000).toFixed(0)}K`:v} width={34}/>
                <Tooltip labelFormatter={l=>`~${l}M EGP`} formatter={(v:any)=>[v,'Count']}/>
                <Bar dataKey="count" radius={[2,2,0,0]}>
                  {(price_hist||[]).map((_:any,i:number)=><Cell key={i} fill={i<12?'#1d9e75':i<28?'#F59E0B':'#EF4444'}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card title="Property Type Mix" sub="Count by type">
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <div className="w-full sm:w-auto flex justify-center">
                <PieChart width={160} height={160}>
                  <Pie data={property_types||[]} dataKey="count" nameKey="property_type"
                    cx={80} cy={80} outerRadius={72}
                    label={({percent}:any)=>`${(percent*100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                    {(property_types||[]).map((_:any,i:number)=><Cell key={i} fill={C[i]}/>)}
                  </Pie>
                  <Tooltip/>
                </PieChart>
              </div>
              <div className="flex-1 w-full space-y-1.5">
                {(property_types||[]).map((t:any,i:number)=>(
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{background:C[i]}}/>
                      <span className="text-sand-600 truncate">{t.property_type}</span>
                    </div>
                    <span className="font-medium ml-2 flex-shrink-0">{t.count?.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card title="Buyer Segments" sub="Properties per budget range">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={price_buckets} layout="vertical" margin={{top:4,right:30,left:36,bottom:4}}>
                <XAxis type="number" tick={{fontSize:9}} tickFormatter={v=>v>=1000?`${(v/1000).toFixed(0)}K`:v}/>
                <YAxis dataKey="label" type="category" tick={{fontSize:10}} width={36}/>
                <Tooltip formatter={(v:any)=>[v.toLocaleString(),'Properties']}/>
                <Bar dataKey="count" radius={[0,4,4,0]}>
                  {price_buckets.map((_:any,i:number)=><Cell key={i} fill={C[i]}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card title="Condition Distribution" sub="Count by condition">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={conditions||[]} margin={{top:4,right:4,left:0,bottom:30}}>
                <XAxis dataKey="condition" tick={{fontSize:9}} angle={-20} textAnchor="end"/>
                <YAxis tick={{fontSize:9}} tickFormatter={v=>v>=1000?`${(v/1000).toFixed(0)}K`:v} width={34}/>
                <Tooltip/>
                <Bar dataKey="count" radius={[3,3,0,0]}>
                  {(conditions||[]).map((_:any,i:number)=><Cell key={i} fill={C[i]}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card title="Price by Year Built" sub="Market value over time">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={year_price||[]} margin={{top:4,right:4,left:0,bottom:4}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0efe9"/>
                <XAxis dataKey="year_built" tick={{fontSize:9}}/>
                <YAxis tick={{fontSize:9}} tickFormatter={v=>`${(v/1e6).toFixed(1)}M`} width={38}/>
                <Tooltip content={<Tip/>}/>
                <Area type="monotone" dataKey="price_egp" name="Avg Price" stroke="#1d9e75" fill="#d9f0e4" strokeWidth={2}/>
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          <Card title="Finishing Distribution">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={finishing||[]} margin={{top:4,right:4,left:0,bottom:30}}>
                <XAxis dataKey="finishing_type" tick={{fontSize:9}} angle={-20} textAnchor="end"/>
                <YAxis tick={{fontSize:9}} tickFormatter={v=>v>=1000?`${(v/1000).toFixed(0)}K`:v} width={34}/>
                <Tooltip/>
                <Bar dataKey="count" radius={[3,3,0,0]}>
                  {(finishing||[]).map((_:any,i:number)=><Cell key={i} fill={C[i]}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card title="View Type Distribution">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={view_dist||[]} margin={{top:4,right:4,left:0,bottom:30}}>
                <XAxis dataKey="view_type" tick={{fontSize:9}} angle={-20} textAnchor="end"/>
                <YAxis tick={{fontSize:9}} tickFormatter={v=>v>=1000?`${(v/1000).toFixed(0)}K`:v} width={34}/>
                <Tooltip/>
                <Bar dataKey="count" radius={[3,3,0,0]}>
                  {(view_dist||[]).map((_:any,i:number)=><Cell key={i} fill={C[i]}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card title="Supply by Area (Top 15)" sub="Listing count">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={sortedArea.slice(0,15)} layout="vertical" margin={{top:4,right:30,left:100,bottom:4}}>
                <XAxis type="number" tick={{fontSize:9}} tickFormatter={v=>v>=1000?`${(v/1000).toFixed(0)}K`:v}/>
                <YAxis dataKey="area" type="category" tick={{fontSize:8}} width={100}/>
                <Tooltip/>
                <Bar dataKey="count" name="Listings" radius={[0,3,3,0]} fill="#6366F1"/>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {/* ── UNIVARIATE ──────────────────────────────────────────── */}
      {tab==='univariate' && (
        <div className="space-y-4 sm:space-y-5">
          <Card title="Descriptive Statistics — All Numeric Variables" sub="Mean · Median · Std · Min · Max · Q1 · Q3 · Skew · Kurtosis">
            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
              <table className="w-full text-xs min-w-[700px]">
                <thead className="bg-brand-50">
                  <tr>
                    {['Variable','Mean','Median','Std','Min','Max','Q25','Q75','Skew','Kurt'].map(h=>(
                      <th key={h} className="text-left px-2 sm:px-3 py-2 text-brand-700 font-semibold uppercase tracking-wide border-b border-brand-100 whitespace-nowrap text-xs">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(univ||{}).map(([col, s]: any, i) => (
                    <tr key={col} className={`border-b border-sand-50 hover:bg-sand-50 ${i%2===0?'':'bg-sand-50/30'}`}>
                      <td className="px-2 sm:px-3 py-1.5 font-medium text-brand-800 whitespace-nowrap">{col.replace(/_/g,' ')}</td>
                      <td className="px-2 sm:px-3 py-1.5 text-sand-700">{col.includes('price')||col.includes('rate')?fmtEGP(s.mean):Number(s.mean).toLocaleString()}</td>
                      <td className="px-2 sm:px-3 py-1.5 text-sand-700">{col.includes('price')||col.includes('rate')?fmtEGP(s.median):Number(s.median).toLocaleString()}</td>
                      <td className="px-2 sm:px-3 py-1.5 text-sand-500">{Number(s.std).toLocaleString()}</td>
                      <td className="px-2 sm:px-3 py-1.5 text-sand-500">{Number(s.min).toLocaleString()}</td>
                      <td className="px-2 sm:px-3 py-1.5 text-sand-500">{Number(s.max).toLocaleString()}</td>
                      <td className="px-2 sm:px-3 py-1.5 text-sand-500">{Number(s.q25).toLocaleString()}</td>
                      <td className="px-2 sm:px-3 py-1.5 text-sand-500">{Number(s.q75).toLocaleString()}</td>
                      <td className={`px-2 sm:px-3 py-1.5 font-medium ${Math.abs(s.skew)>1?'text-amber-600':Math.abs(s.skew)>0.5?'text-amber-400':'text-green-600'}`}>{Number(s.skew).toFixed(3)}</td>
                      <td className={`px-2 sm:px-3 py-1.5 font-medium ${Math.abs(s.kurt)>3?'text-red-500':Math.abs(s.kurt)>1?'text-amber-500':'text-green-600'}`}>{Number(s.kurt).toFixed(3)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
            {[
              {title:'Area (m²) Distribution',   data:area_hist,   color:'#6366F1', fmt:(v:any)=>`${v}m²`,   sub:`Mean=${univ?.area_sqm?.mean}m²`},
              {title:'Price/m² Distribution',    data:sqm_hist,    color:'#F59E0B', fmt:(v:any)=>`${(v/1000).toFixed(0)}K`, sub:`Mean=${fmtEGP(univ?.price_per_sqm?.mean)}`},
              {title:'Rental Yield Distribution',data:yield_hist,  color:'#14B8A6', fmt:(v:any)=>`${v}%`,    sub:`Mean=${univ?.rental_yield?.mean?.toFixed(2)}%`},
              {title:'Distance to Metro',        data:metro_hist,  color:'#EC4899', fmt:(v:any)=>`${v}km`,   sub:`Mean=${univ?.distance_to_metro_km?.mean?.toFixed(1)}km`},
              {title:'Building Age Distribution',data:age_hist,    color:'#8B5CF6', fmt:(v:any)=>`${v}yr`,   sub:`Mean=${univ?.building_age_years?.mean?.toFixed(1)} yrs`},
              {title:'Bedroom Distribution',     data:bed_stats,   color:'#0EA5E9', fmt:(v:any)=>v, sub:'Count by bedroom'},
            ].map((h,i)=>(
              <Card key={i} title={h.title} sub={h.sub}>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={h.data} margin={{top:4,right:4,left:0,bottom:20}}>
                    <XAxis dataKey={i===5?'bedrooms':'bin'} tick={{fontSize:9}} tickFormatter={i===5?undefined:h.fmt}/>
                    <YAxis tick={{fontSize:9}} tickFormatter={v=>v>=1000?`${(v/1000).toFixed(0)}K`:v} width={34}/>
                    <Tooltip labelFormatter={i===5?undefined:(l:any)=>`~${h.fmt(l)}`} formatter={(v:any)=>[v,'Count']}/>
                    <Bar dataKey={i===5?'count':'count'} radius={[2,2,0,0]} fill={h.color}/>
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ── MULTIVARIATE ──────────────────────────────────────────── */}
      {tab==='multivariate' && (
        <div className="space-y-4 sm:space-y-5">
          <Card title="Correlation Heatmap (15×15)" sub="Pearson r — green=positive, red=negative">
            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
              <table className="border-collapse" style={{fontSize:'10px'}}>
                <thead>
                  <tr>
                    <th className="p-1 text-sand-400 font-normal text-right pr-2 w-16"/>
                    {(corr_labels||[]).map((l:string)=>(
                      <th key={l} className="p-1 text-sand-500 font-medium text-center" style={{minWidth:40}}>
                        <div style={{writingMode:'vertical-rl',transform:'rotate(180deg)',height:55,fontSize:9}}>{l}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(corr_labels||[]).map((row:string,ri:number)=>(
                    <tr key={row}>
                      <td className="pr-2 text-right text-sand-500 font-medium whitespace-nowrap" style={{fontSize:9}}>{row}</td>
                      {(corr_labels||[]).map((_:string,ci:number)=>{
                        const cell=(corr_data||[]).find((d:any)=>d.row===row&&d.col===corr_labels[ci])
                        return <HeatCell key={ci} value={cell?.value||0} min={-1} max={1}/>
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
            <Card title="Beds × Baths Price Cross" sub="Avg EGP matrix">
              <div className="overflow-x-auto">
                <table className="text-xs w-full border-collapse min-w-[260px]">
                  <thead>
                    <tr>
                      <th className="p-1.5 text-sand-500 text-left text-xs">Beds\Baths</th>
                      {[1,2,3,4,5].map(b=><th key={b} className="p-1.5 text-center text-sand-500 text-xs">{b}B</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {[1,2,3,4,5,6].map(beds=>(
                      <tr key={beds} className="border-t border-sand-50">
                        <td className="p-1.5 font-medium text-brand-700 text-xs">{beds} Bd</td>
                        {[1,2,3,4,5].map(baths=>{
                          const cell=(bed_bath||[]).find((d:any)=>d.bedrooms===beds&&d.bathrooms===baths)
                          const val=cell?.price_egp||0
                          const t=Math.min(1,val/15e6)
                          return (
                            <td key={baths} className="p-1 text-center rounded text-xs" title={val?fmtEGP(val):'—'}
                              style={{background:val?`rgba(29,158,117,${0.1+t*0.8})`:'#f9f9f7',color:t>0.5?'#fff':'#1c1c1a'}}>
                              {val?`${(val/1e6).toFixed(1)}M`:'—'}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card title="Condition × Finishing" sub="Avg price interaction">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={cond_fin||[]} margin={{top:4,right:4,left:0,bottom:50}}>
                  <XAxis dataKey="condition" tick={{fontSize:8}} angle={-30} textAnchor="end"/>
                  <YAxis tick={{fontSize:9}} tickFormatter={v=>`${(v/1e6).toFixed(1)}M`} width={36}/>
                  <Tooltip content={<Tip/>}/>
                  <Bar dataKey="price_egp" name="Avg Price" radius={[3,3,0,0]}>
                    {(cond_fin||[]).map((_:any,i:number)=><Cell key={i} fill={C[i%C.length]}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card title="Amenity Premium" sub="Price uplift per amenity">
              <div className="space-y-2.5">
                {(amenity_premium||[]).map((a:any,i:number)=>(
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-0.5">
                      <span className="font-medium text-sand-700">{a.feature}</span>
                      <span className={`font-bold ${a.premium_pct>0?'text-green-600':'text-red-500'}`}>
                        {a.premium_pct>0?'+':''}{a.premium_pct.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-3 bg-sand-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{width:`${Math.min(100,Math.abs(a.premium_pct)/50*100)}%`,background:a.premium_pct>0?'#1d9e75':'#EF4444'}}/>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Size vs Price Scatter" sub="600 sampled properties">
              <ResponsiveContainer width="100%" height={220}>
                <ScatterChart margin={{top:4,right:4,left:0,bottom:20}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0efe9"/>
                  <XAxis dataKey="area_sqm" name="Size" tick={{fontSize:9}} label={{value:'m²',position:'insideBottom',offset:-5,fontSize:10}}/>
                  <YAxis dataKey="price_egp" name="Price" tick={{fontSize:9}} tickFormatter={v=>`${(v/1e6).toFixed(0)}M`} width={36}/>
                  <Tooltip cursor={{strokeDasharray:'3 3'}}/>
                  <Scatter data={(scatter_sqm||[]).slice(0,200)} fill="#1d9e75" opacity={0.5} r={2.5}/>
                </ScatterChart>
              </ResponsiveContainer>
            </Card>

            <Card title="Floor vs Price" sub="Price by floor level">
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={(floor_price||[]).filter((_:any,i:number)=>i<20)} margin={{top:4,right:4,left:0,bottom:4}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0efe9"/>
                  <XAxis dataKey="floor_number" tick={{fontSize:9}}/>
                  <YAxis tick={{fontSize:9}} tickFormatter={v=>`${(v/1e6).toFixed(1)}M`} width={38}/>
                  <Tooltip content={<Tip/>}/>
                  <Area type="monotone" dataKey="price_egp" name="Avg Price" stroke="#8B5CF6" fill="#ede9fe" strokeWidth={2}/>
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            <Card title="Furnished × Finishing" sub="Interaction effect">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={furn_fin||[]} margin={{top:4,right:4,left:0,bottom:50}}>
                  <XAxis dataKey="furnished" tick={{fontSize:8}} angle={-20} textAnchor="end"/>
                  <YAxis tick={{fontSize:9}} tickFormatter={v=>`${(v/1e6).toFixed(1)}M`} width={36}/>
                  <Tooltip content={<Tip/>}/>
                  <Bar dataKey="price_egp" name="Avg Price" radius={[3,3,0,0]}>
                    {(furn_fin||[]).map((_:any,i:number)=><Cell key={i} fill={C[i%C.length]}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </div>
      )}

      {/* ── DIAGNOSTIC ────────────────────────────────────────────── */}
      {tab==='diagnostic' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          {[
            {title:'Metro Distance vs Price', data:metro_price,  key:'mean',  sub:'Proximity premium'},
            {title:'Center Distance vs Price',data:center_price, key:'mean',  sub:'City-center premium'},
            {title:'Building Age vs Price',   data:age_price,    key:'mean',  sub:'Age depreciation'},
            {title:'Size Band vs Price',      data:sqm_price,    key:'mean',  sub:'Size efficiency'},
            {title:'Condition vs Price',      data:cond_price,   key:'price_egp', sub:'Quality premium'},
            {title:'View Type vs Price',      data:view_price,   key:'price_egp', sub:'View premium'},
            {title:'Finishing vs Price',      data:fin_price,    key:'price_egp', sub:'Finishing impact'},
            {title:'Furnished vs Price',      data:furnished_price,key:'price_egp',sub:'Furnishing effect'},
          ].map((c,i)=>(
            <Card key={i} title={c.title} sub={c.sub}>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={c.data||[]} margin={{top:4,right:4,left:0,bottom:30}}>
                  <XAxis dataKey={c.data===metro_price||c.data===center_price||c.data===age_price||c.data===sqm_price?'band':'condition'in(c.data?.[0]||{})?'condition':'finishing_type'in(c.data?.[0]||{})?'finishing_type':'view_type'in(c.data?.[0]||{})?'view_type':'furnished'}
                    tick={{fontSize:8}} angle={-20} textAnchor="end"/>
                  <YAxis tick={{fontSize:9}} tickFormatter={v=>`${(v/1e6).toFixed(1)}M`} width={36}/>
                  <Tooltip content={<Tip/>}/>
                  <Bar dataKey={c.key} name="Avg Price" radius={[3,3,0,0]}>
                    {(c.data||[]).map((_:any,j:number)=><Cell key={j} fill={C[j%C.length]}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          ))}

          <Card title="Correlations with Price" sub="Pearson r ranked">
            <div className="space-y-1.5 pt-1">
              {(correlations||[]).sort((a:any,b:any)=>Math.abs(b.correlation)-Math.abs(a.correlation)).map((c:any,i:number)=>(
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs text-sand-500 w-28 truncate shrink-0">{c.feature.replace(/_/g,' ')}</span>
                  <div className="flex-1 h-3 bg-sand-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{width:`${Math.abs(c.correlation)*100}%`,background:c.correlation>0?'#1d9e75':'#EF4444'}}/>
                  </div>
                  <span className={`text-xs font-bold w-12 text-right ${c.correlation>0?'text-green-600':'text-red-500'}`}>
                    {c.correlation>0?'+':''}{c.correlation?.toFixed(3)}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Age vs Price Scatter" sub="Does age predict price?">
            <ResponsiveContainer width="100%" height={220}>
              <ScatterChart margin={{top:4,right:4,left:0,bottom:20}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0efe9"/>
                <XAxis dataKey="building_age_years" name="Age" tick={{fontSize:9}} label={{value:'Age (yrs)',position:'insideBottom',offset:-5,fontSize:10}}/>
                <YAxis dataKey="price_egp" name="Price" tick={{fontSize:9}} tickFormatter={v=>`${(v/1e6).toFixed(0)}M`} width={36}/>
                <Tooltip cursor={{strokeDasharray:'3 3'}}/>
                <Scatter data={(scatter_age||[]).slice(0,200)} fill="#8B5CF6" opacity={0.5} r={2.5}/>
              </ScatterChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {/* ── PREDICTIVE ────────────────────────────────────────────── */}
      {tab==='predictive' && (
        <div className="space-y-4 sm:space-y-5">
          <Card title="ML Feature Importance — Random Forest" sub={`R²=${kpis.r2_score} · MAE=${fmtEGP(kpis.mae)} · 100 trees · depth=10`}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={feature_importance||[]} layout="vertical" margin={{top:4,right:40,left:110,bottom:4}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0efe9"/>
                <XAxis type="number" tick={{fontSize:9}} tickFormatter={v=>`${v.toFixed(1)}%`}/>
                <YAxis dataKey="feature" type="category" tick={{fontSize:9}} width={110}/>
                <Tooltip formatter={(v:number)=>[`${v.toFixed(3)}%`,'Importance']}/>
                <Bar dataKey="importance" name="Importance" radius={[0,4,4,0]}>
                  {(feature_importance||[]).map((_:any,i:number)=>(
                    <Cell key={i} fill={i===0?'#1d9e75':i<3?'#5DCAA5':i<6?'#F59E0B':i<10?'#6366F1':'#EF4444'}/>
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {step:'01',title:'Preprocessing',bg:'bg-brand-50 border-brand-100',items:['30K Egyptian properties','Feature engineering: ROI, yield, price/m²','Label encode 6 categorical columns','80/20 train-test split']},
              {step:'02',title:'Random Forest',bg:'bg-amber-50 border-amber-100',items:[`R² = ${kpis.r2_score}`,`MAE = ${fmtEGP(kpis.mae)}`,'100 trees, max_depth=10','22 input features']},
              {step:'03',title:'Key Findings',bg:'bg-purple-50 border-purple-100',items:['sqm_market_rate = #1 (~48%)','area_sqm = #2 (~47%)','Together explain ~95%','Finishing & condition ~3%']},
            ].map(s=>(
              <div key={s.step} className={`${s.bg} border rounded-xl p-4`}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 bg-brand-500 text-white rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0">{s.step}</div>
                  <h3 className="font-semibold text-sand-800 text-sm">{s.title}</h3>
                </div>
                <ul className="space-y-1.5">
                  {s.items.map((item,i)=>(
                    <li key={i} className="flex items-start gap-1.5 text-xs text-sand-600">
                      <span className="text-brand-400 mt-0.5 shrink-0">•</span>{item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <Card title="Bedrooms vs Yield" sub="Which bedroom count maximizes return?">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={bed_stats||[]} margin={{top:4,right:30,left:0,bottom:4}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0efe9"/>
                <XAxis dataKey="bedrooms" tick={{fontSize:10}}/>
                <YAxis yAxisId="l" tick={{fontSize:9}} tickFormatter={v=>`${(v/1e6).toFixed(1)}M`} width={36}/>
                <YAxis yAxisId="r" orientation="right" tick={{fontSize:9}} tickFormatter={v=>`${v.toFixed(1)}%`} width={36}/>
                <Tooltip content={<Tip/>}/>
                <Bar yAxisId="l" dataKey="avg_price" name="Avg Price" radius={[3,3,0,0]} fill="#1d9e75"/>
                <Bar yAxisId="r" dataKey="avg_yield" name="Yield %" radius={[3,3,0,0]} fill="#F59E0B"/>
                <Legend wrapperStyle={{fontSize:10}}/>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {/* ── INVESTMENT ────────────────────────────────────────────── */}
      {tab==='investment' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          <Card title="ROI by Location" sub="Positive = undervalued vs market">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={roiSorted.slice(0,20)} margin={{top:4,right:4,left:0,bottom:100}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0efe9"/>
                <XAxis dataKey="area" tick={{fontSize:8}} angle={-45} textAnchor="end" interval={0}/>
                <YAxis tick={{fontSize:9}} tickFormatter={v=>`${v.toFixed(1)}%`} width={36}/>
                <Tooltip formatter={(v:number)=>[`${v.toFixed(2)}%`,'ROI']}/>
                <ReferenceLine y={0} stroke="#EF4444" strokeDasharray="4 4"/>
                <Bar dataKey="avg_roi" name="ROI %" radius={[3,3,0,0]}>
                  {roiSorted.slice(0,20).map((a:any,i:number)=><Cell key={i} fill={a.avg_roi>0?'#1d9e75':'#EF4444'}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card title="Rental Yield by Area" sub="Est. annual yield %">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={roiSorted.slice(0,20)} margin={{top:4,right:4,left:0,bottom:100}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0efe9"/>
                <XAxis dataKey="area" tick={{fontSize:8}} angle={-45} textAnchor="end" interval={0}/>
                <YAxis tick={{fontSize:9}} tickFormatter={v=>`${v.toFixed(1)}%`} width={36}/>
                <Tooltip formatter={(v:number)=>[`${v.toFixed(2)}%`,'Yield']}/>
                <Bar dataKey="avg_yield" name="Yield %" radius={[3,3,0,0]} fill="#F59E0B"/>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card title="Compound Premium by Area" sub="Extra cost % for compounds">
            <div className="space-y-2 overflow-y-auto max-h-64">
              {(compound_premium||[]).sort((a:any,b:any)=>b.premium_pct-a.premium_pct).slice(0,15).map((c:any,i:number)=>(
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className="text-sand-500 truncate w-24 shrink-0">{c.area}</span>
                  <div className="flex-1 h-2.5 bg-sand-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{width:`${Math.min(100,Math.abs(c.premium_pct)/100*100)}%`,background:c.premium_pct>0?'#1d9e75':'#EF4444'}}/>
                  </div>
                  <span className={`font-bold w-10 text-right shrink-0 ${c.premium_pct>0?'text-green-600':'text-red-500'}`}>
                    {c.premium_pct>0?'+':''}{c.premium_pct?.toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Price vs Yield Bubble" sub="Bottom-right = best investment">
            <ResponsiveContainer width="100%" height={250}>
              <ScatterChart margin={{top:4,right:4,left:0,bottom:20}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0efe9"/>
                <XAxis dataKey="avg_price" name="Avg Price" tick={{fontSize:9}} tickFormatter={v=>`${(v/1e6).toFixed(0)}M`} label={{value:'Avg Price',position:'insideBottom',offset:-5,fontSize:10}}/>
                <YAxis dataKey="avg_yield" name="Yield%" tick={{fontSize:9}} tickFormatter={v=>`${v.toFixed(1)}%`} label={{value:'Yield%',angle:-90,position:'insideLeft',fontSize:10}}/>
                <Tooltip cursor={{strokeDasharray:'3 3'}} content={({active,payload}:any)=>{
                  if(!active||!payload?.length) return null
                  const d=payload[0]?.payload
                  return <div className="bg-white border border-sand-200 rounded-lg px-3 py-2 shadow-lg text-xs">
                    <p className="font-bold truncate max-w-[140px]">{d?.area}</p>
                    <p>Price: {fmtEGP(d?.avg_price)}</p>
                    <p>Yield: {d?.avg_yield?.toFixed(2)}%</p>
                  </div>
                }}/>
                {['HOT','WARM','COLD'].map((h,i)=>(
                  <Scatter key={h} name={h} data={(bubble||[]).filter((d:any)=>d.hot_cold===h)} fill={['#EF4444','#F59E0B','#6366F1'][i]} opacity={0.8} r={5}/>
                ))}
                <Legend wrapperStyle={{fontSize:10}}/>
              </ScatterChart>
            </ResponsiveContainer>
          </Card>

          <Card title="Portfolio Allocation" sub="Top 5 by yield — suggested weighting">
            <div className="space-y-3 mt-1">
              {roiSorted.slice(0,5).map((a:any,i:number)=>(
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-sand-700 truncate mr-2">{a.area}</span>
                    <span className="text-green-600 font-bold shrink-0">{a.avg_yield?.toFixed(1)}%</span>
                  </div>
                  <div className="h-2.5 bg-sand-100 rounded-full">
                    <div className="h-2.5 rounded-full" style={{width:`${(5-i)*14+30}%`,background:C[i]}}/>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Price Range by Area" sub="p10–p90 box plot">
            <div className="overflow-y-auto max-h-64 space-y-2">
              {(area_box||[]).sort((a:any,b:any)=>b.p50-a.p50).slice(0,15).map((a:any,i:number)=>{
                const mn=a.p10; const mx=a.p90; const rng=mx-mn||1
                return (
                  <div key={i}>
                    <div className="flex justify-between text-xs text-sand-500 mb-0.5">
                      <span className="truncate w-28">{a.area}</span>
                      <span className="shrink-0 ml-1">{fmtEGP(a.p50)}</span>
                    </div>
                    <div className="relative h-2.5 bg-sand-100 rounded-full">
                      <div className="absolute h-full bg-brand-200 rounded-full" style={{left:`${(a.p25-mn)/rng*100}%`,width:`${(a.p75-a.p25)/rng*100}%`}}/>
                      <div className="absolute w-0.5 h-full bg-brand-600" style={{left:`${(a.p50-mn)/rng*100}%`}}/>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      )}

      {/* ── LOCATION ──────────────────────────────────────────────── */}
      {tab==='location' && (
        <div className="space-y-4 sm:space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
            <Card title="Price vs Metro Distance" sub="Proximity premium scatter">
              <ResponsiveContainer width="100%" height={230}>
                <ScatterChart margin={{top:4,right:4,left:0,bottom:20}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0efe9"/>
                  <XAxis dataKey="distance_to_metro_km" name="Metro km" tick={{fontSize:9}} label={{value:'Metro (km)',position:'insideBottom',offset:-5,fontSize:10}}/>
                  <YAxis dataKey="price_egp" name="Price" tick={{fontSize:9}} tickFormatter={v=>`${(v/1e6).toFixed(0)}M`} width={36}/>
                  <Tooltip cursor={{strokeDasharray:'3 3'}}/>
                  <Scatter data={(scatter_metro||[]).slice(0,200)} fill="#1d9e75" opacity={0.5} r={2.5}/>
                </ScatterChart>
              </ResponsiveContainer>
            </Card>

            <Card title="Metro Distance Premium" sub="Mean & median price by band">
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={metro_price||[]} margin={{top:4,right:4,left:0,bottom:4}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0efe9"/>
                  <XAxis dataKey="band" tick={{fontSize:9}}/>
                  <YAxis tick={{fontSize:9}} tickFormatter={v=>`${(v/1e6).toFixed(1)}M`} width={36}/>
                  <Tooltip content={<Tip/>}/>
                  <Bar dataKey="mean" name="Mean" radius={[3,3,0,0]} fill="#1d9e75"/>
                  <Bar dataKey="median" name="Median" radius={[3,3,0,0]} fill="#5DCAA5"/>
                  <Legend wrapperStyle={{fontSize:10}}/>
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card title="HOT / WARM / COLD Markets" sub="Demand score classification">
              <div className="space-y-3 mt-1">
                {['HOT','WARM','COLD'].map(status=>(
                  <div key={status}>
                    <p className={`text-xs font-bold mb-1 ${status==='HOT'?'text-red-500':status==='WARM'?'text-amber-500':'text-blue-500'}`}>{status}</p>
                    <div className="flex flex-wrap gap-1">
                      {(by_area||[]).filter((a:any)=>a.hot_cold===status).map((a:any)=>(
                        <span key={a.area} className={`text-xs px-1.5 py-0.5 rounded-full ${status==='HOT'?'bg-red-50 text-red-700':status==='WARM'?'bg-amber-50 text-amber-700':'bg-blue-50 text-blue-700'}`}>
                          {a.area}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <Card title="Location Intelligence — All 35 Areas" full>
            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
              <table className="w-full text-xs min-w-[900px]">
                <thead className="bg-brand-50">
                  <tr>
                    {['Area','Listings','Avg Price','Median','Yield%','ROI%','Metro km','Demand','Status','Overpriced%'].map(h=>(
                      <th key={h} className="text-left px-2 py-2 text-brand-700 font-semibold text-xs uppercase tracking-wide border-b border-brand-100 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(by_area||[]).map((a:any,i:number)=>(
                    <tr key={i} className={`border-b border-sand-50 hover:bg-sand-50 ${i%2?'bg-sand-50/30':''}`}>
                      <td className="px-2 py-1.5 font-medium text-brand-800 whitespace-nowrap">{a.area}</td>
                      <td className="px-2 py-1.5 text-sand-600">{a.count?.toLocaleString()}</td>
                      <td className="px-2 py-1.5 font-medium">{fmtEGP(a.avg_price)}</td>
                      <td className="px-2 py-1.5">{fmtEGP(a.median_price)}</td>
                      <td className="px-2 py-1.5 text-green-600 font-bold">{a.avg_yield?.toFixed(2)}%</td>
                      <td className={`px-2 py-1.5 font-bold ${a.avg_roi>0?'text-green-600':'text-red-500'}`}>{a.avg_roi?.toFixed(1)}%</td>
                      <td className="px-2 py-1.5 text-sand-500">{a.avg_dist_metro?.toFixed(1)}</td>
                      <td className="px-2 py-1.5">
                        <div className="flex items-center gap-1">
                          <div className="w-10 h-1.5 bg-sand-100 rounded-full shrink-0"><div className="h-full rounded-full bg-brand-500" style={{width:`${a.demand_score}%`}}/></div>
                          <span>{a.demand_score?.toFixed(0)}</span>
                        </div>
                      </td>
                      <td className="px-2 py-1.5">
                        <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${a.hot_cold==='HOT'?'bg-red-50 text-red-600':a.hot_cold==='WARM'?'bg-amber-50 text-amber-600':'bg-blue-50 text-blue-600'}`}>{a.hot_cold}</span>
                      </td>
                      <td className={`px-2 py-1.5 font-medium ${a.overpriced_pct>0.15?'text-red-500':'text-green-600'}`}>{(a.overpriced_pct*100).toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ── RISK ──────────────────────────────────────────────────── */}
      {tab==='risk' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          <Card title="Overpriced % by Area" sub=">15% above base_value_egp" className="sm:col-span-2">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={[...(by_area||[])].sort((a:any,b:any)=>b.overpriced_pct-a.overpriced_pct).slice(0,20)} margin={{top:4,right:4,left:0,bottom:100}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0efe9"/>
                <XAxis dataKey="area" tick={{fontSize:8}} angle={-45} textAnchor="end" interval={0}/>
                <YAxis tick={{fontSize:9}} tickFormatter={v=>`${(v*100).toFixed(0)}%`} width={36}/>
                <Tooltip formatter={(v:number)=>[`${(v*100).toFixed(1)}%`,'Overpriced']}/>
                <ReferenceLine y={kpis.overpriced_pct/100} stroke="#F59E0B" strokeDasharray="4 4" label={{value:'Avg',position:'right',fontSize:9}}/>
                <Bar dataKey="overpriced_pct" name="Overpriced %" radius={[3,3,0,0]}>
                  {[...(by_area||[])].sort((a:any,b:any)=>b.overpriced_pct-a.overpriced_pct).slice(0,20).map((a:any,i:number)=>(
                    <Cell key={i} fill={a.overpriced_pct>0.2?'#EF4444':a.overpriced_pct>0.138?'#F59E0B':'#1d9e75'}/>
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card title="Risk Summary">
            <div className="space-y-3 mt-1">
              {[
                {label:'Fairly priced',val:100-kpis.overpriced_pct,color:'#1d9e75'},
                {label:'Overpriced >15%',val:kpis.overpriced_pct,color:'#EF4444'},
                {label:'In compounds',val:kpis.compound_pct,color:'#6366F1'},
              ].map((r,i)=>(
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-sand-600">{r.label}</span>
                    <span className="font-bold">{r.val?.toFixed(1)}%</span>
                  </div>
                  <div className="h-2.5 bg-sand-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{width:`${r.val}%`,background:r.color}}/>
                  </div>
                </div>
              ))}
              <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
                <p className="text-xs font-semibold text-amber-700 mb-1">⚠️ Risk Insight</p>
                <p className="text-xs text-amber-600 leading-relaxed">Premium over 15% above base value = high negotiation potential.</p>
              </div>
              <div className="p-3 bg-green-50 rounded-xl border border-green-100">
                <p className="text-xs font-semibold text-green-700 mb-1">✅ Safe Zones</p>
                <p className="text-xs text-green-600 leading-relaxed">Target areas where overpriced% &lt;10%.</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ── AI INSIGHTS ───────────────────────────────────────────── */}
      {tab==='insights' && (
        <div className="space-y-4 sm:space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
            {(insights||[]).map((ins:any,i:number)=>(
              <div key={i} className="bg-white rounded-xl border border-sand-200 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{ins.icon}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ins.tag==='Risk'?'bg-red-50 text-red-600':ins.tag==='ROI'?'bg-green-50 text-green-600':ins.tag==='Model'?'bg-purple-50 text-purple-600':ins.tag==='Amenity'?'bg-amber-50 text-amber-600':ins.tag==='Value'?'bg-teal-50 text-teal-600':'bg-brand-50 text-brand-600'}`}>{ins.tag}</span>
                </div>
                <h3 className="font-semibold text-sand-800 text-sm mb-1 leading-snug">{ins.title}</h3>
                <p className="text-sand-500 text-xs leading-relaxed">{ins.text}</p>
              </div>
            ))}
          </div>

          <Card title="Complete 35-Area Investor Table" full>
            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
              <table className="w-full text-xs min-w-[900px]">
                <thead>
                  <tr className="bg-gradient-to-r from-brand-700 to-brand-600 text-white">
                    {['#','Area','Avg Price','Median','Price/m²','Yield%','ROI%','Listings','Metro','Demand','Status','Overpriced%'].map(h=>(
                      <th key={h} className="text-left px-2 py-2.5 font-medium whitespace-nowrap text-xs">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(by_area||[]).map((a:any,i:number)=>(
                    <tr key={i} className={`border-b border-sand-50 hover:bg-brand-50 transition-colors ${i%2?'bg-sand-50/40':''}`}>
                      <td className="px-2 py-1.5 text-sand-400 font-mono text-xs">{i+1}</td>
                      <td className="px-2 py-1.5 font-semibold text-brand-800 whitespace-nowrap text-xs">{a.area}</td>
                      <td className="px-2 py-1.5 font-medium text-xs">{fmtEGP(a.avg_price)}</td>
                      <td className="px-2 py-1.5 text-sand-600 text-xs">{fmtEGP(a.median_price)}</td>
                      <td className="px-2 py-1.5 text-xs">{fmtEGP(a.avg_price_sqm)}</td>
                      <td className="px-2 py-1.5 text-green-600 font-bold text-xs">{a.avg_yield?.toFixed(2)}%</td>
                      <td className={`px-2 py-1.5 font-bold text-xs ${a.avg_roi>0?'text-green-600':'text-red-500'}`}>{a.avg_roi?.toFixed(1)}%</td>
                      <td className="px-2 py-1.5 text-sand-500 text-xs">{a.count?.toLocaleString()}</td>
                      <td className="px-2 py-1.5 text-sand-500 text-xs">{a.avg_dist_metro?.toFixed(1)}</td>
                      <td className="px-2 py-1.5 text-xs">
                        <div className="flex items-center gap-1">
                          <div className="w-8 h-1.5 bg-sand-100 rounded-full shrink-0"><div className="h-full rounded-full bg-brand-500" style={{width:`${a.demand_score}%`}}/></div>
                          <span className="text-sand-600">{a.demand_score?.toFixed(0)}</span>
                        </div>
                      </td>
                      <td className="px-2 py-1.5">
                        <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${a.hot_cold==='HOT'?'bg-red-50 text-red-600':a.hot_cold==='WARM'?'bg-amber-50 text-amber-600':'bg-blue-50 text-blue-600'}`}>{a.hot_cold}</span>
                      </td>
                      <td className={`px-2 py-1.5 font-medium text-xs ${a.overpriced_pct>0.15?'text-red-500':'text-green-600'}`}>{(a.overpriced_pct*100).toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
