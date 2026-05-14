'use client'

/**
 * Analytics Guide Page
 * Detailed documentation for every metric, chart, and analysis section
 * in the Market Analytics dashboard.
 */

import { useState } from 'react'

// ── Data ─────────────────────────────────────────────────────────────────────

/** Tab-level section with multiple analysis items */
const SECTIONS = [
  {
    id: 'descriptive',
    label: 'Descriptive',
    icon: '◈',
    color: 'brand',
    description: 'Overall market snapshot — prices, distributions, and property composition.',
    analyses: [
      {
        title: 'KPI Cards (Top Row)',
        chart: 'Number cards',
        icon: '🔢',
        what: 'A row of key performance indicators: average price, median price, price per m², rental yield, ROI, total listings, overpriced %, demand score, ML model R², and compound %.',
        why: 'Provides an instant, scannable summary of the entire market without needing to interpret any chart.',
        benefits: 'Allows buyers, sellers, and investors to orient themselves in seconds — is the market expensive? Yielding well? Mostly compounds?',
        how: 'Each card shows a headline number and a sub-label. Green = positive signal, orange = caution, red = risk. "EGP NaN" means analytics are still loading.',
        usecase: 'An investor opening the dashboard sees AVG PRICE = EGP 4.2M and YIELD = 6.1%. They immediately know whether the market fits their return requirement before diving deeper.',
      },
      {
        title: 'Price by Area (Top 20)',
        chart: 'Vertical bar chart',
        icon: '📊',
        what: 'Bar chart showing the average listed price (EGP) for the top 20 highest-priced Egyptian areas, sorted descending.',
        why: 'Location is the primary driver of property value in Egypt. Visualising this makes inter-area comparisons instant.',
        benefits: 'Helps buyers shortlist affordable areas and helps investors identify premium zones before drilling into specifics.',
        how: 'X-axis = area name (rotated 45°). Y-axis = average price in EGP. Each bar is colour-coded from the brand palette. Taller bar = more expensive area.',
        usecase: 'A buyer with a budget of EGP 3M scans the chart, sees that Zamalek and Maadi are well above budget, and focuses their search on Nasr City and Heliopolis instead.',
      },
      {
        title: 'Price Distribution Histogram',
        chart: 'Histogram',
        icon: '📉',
        what: 'Distribution of all 30,000 listing prices across 40 bins from EGP 0 to EGP 25M.',
        why: 'Raw averages hide the shape of the market. The histogram reveals whether prices are clustered (normal market) or spread (fragmented market).',
        benefits: 'Investors can see where the majority of supply sits, and identify thin/thick price segments.',
        how: 'X-axis = price bucket (millions EGP). Y-axis = number of listings in that bucket. A tall, narrow bell = concentrated market; a wide flat curve = fragmented market.',
        usecase: 'The histogram shows a strong peak at 2–4M EGP. A developer building 5M+ units notes that supply at that level is thin — a potential market gap.',
      },
      {
        title: 'Property Type Mix',
        chart: 'Donut / Pie chart',
        icon: '🍩',
        what: 'Proportion of each property type (Apartment, Villa, Studio, Duplex, Penthouse, Townhouse) across all listings.',
        why: 'Type mix affects price benchmarks — comparing a studio to a villa average is misleading. This gives context.',
        benefits: 'Buyers understand whether their target type is rare or common; developers gauge competitive supply.',
        how: 'Each slice = one property type. Larger slice = more common. Hover to see exact count and percentage.',
        usecase: 'The chart shows Studios are only 10% of inventory. A rental investor notes this scarcity could support premium yield for studio units.',
      },
      {
        title: 'Price Range Buckets',
        chart: 'Horizontal bar chart',
        icon: '🪣',
        what: 'Count of listings in 6 price brackets: <1M, 1–3M, 3–5M, 5–10M, 10–20M, 20M+.',
        why: 'Complements the histogram with a cleaner, reader-friendly segmentation tied to real buyer budget ranges.',
        benefits: 'Financial advisors and mortgage brokers can instantly see how much supply exists in each lending bracket.',
        how: 'Y-axis = price bracket. X-axis = number of listings. Longer bar = more supply. The 1–3M bar is typically the largest (mid-market dominance).',
        usecase: 'A bank product team building a 5M EGP mortgage product checks the 3–5M bar — if small, demand for their product may be limited.',
      },
    ],
  },
  {
    id: 'univariate',
    label: 'Univariate',
    icon: '📐',
    color: 'blue',
    description: 'Statistical deep-dive into each individual variable.',
    analyses: [
      {
        title: 'Statistical Summary Table',
        chart: 'Numeric table',
        icon: '🔬',
        what: 'For each numeric field (price, area, price/m², bedrooms, bathrooms, age, distances, yield, ROI, amenity score), shows: mean, median, std dev, min, max, Q25, Q75, skewness, kurtosis.',
        why: 'Univariate stats are the foundation of any data analysis. Understanding individual distributions prevents misinterpretation of charts.',
        benefits: 'Data scientists and analysts can spot skewed distributions that affect model performance. Investors compare median vs mean to detect outlier distortion.',
        how: 'Rows = metrics. Columns = variables. Highlighted cells = unusually high or low values. Skewness > 1 = right-skewed (outliers at high end); < -1 = left-skewed.',
        usecase: 'Price skewness of 2.8 tells an analyst the mean is pulled up by luxury listings — they use median instead for typical market reporting.',
      },
      {
        title: 'Distribution Histograms (Per Variable)',
        chart: 'Small multiples — histograms',
        icon: '📊',
        what: 'Individual histograms for: price, sqm rate, area, yield, metro distance, and building age.',
        why: 'Each variable has a unique distribution shape that affects how it should be modelled and interpreted.',
        benefits: 'Reveals outliers, bimodality (two distinct market segments), and data quality issues (e.g. a spike at zero).',
        how: 'X-axis = variable value range. Y-axis = count. Look for: bell curve (normal), right tail (skewed), cliff edge (data cap or rounding).',
        usecase: 'The area histogram shows a spike at 120 m² — the most common apartment size. A developer building 120 m² units knows they are targeting peak market demand.',
      },
    ],
  },
  {
    id: 'multivariate',
    label: 'Multivariate',
    icon: '🔗',
    color: 'purple',
    description: 'How variables relate to each other — correlations and cross-tabulations.',
    analyses: [
      {
        title: 'Correlation Matrix Heatmap',
        chart: 'Heatmap grid',
        icon: '🌡️',
        what: 'A 10×10 grid showing the Pearson correlation coefficient between every pair of numeric variables (Price, Size, Beds, Baths, Floor, Age, CenterDist, MetroDist, Amenities, Price/m²).',
        why: 'Understanding which variables move together helps predict price drivers and avoids double-counting in analysis.',
        benefits: 'Investors identify the strongest price drivers. Model builders detect multicollinearity.',
        how: 'Dark green = strong positive correlation (both increase together). Dark red = strong negative. White = no relationship. Price-Size is typically the strongest positive pair.',
        usecase: 'The heatmap shows MetroDist and Price have correlation -0.42 — properties farther from the metro are cheaper. An investor targets near-metro properties expecting price appreciation as new lines open.',
      },
      {
        title: 'Condition × Finishing Heatmap',
        chart: 'Cross-tab heatmap',
        icon: '🎨',
        what: 'Average price for every combination of property condition (5 levels) and finishing type (3 levels), rendered as a colour grid.',
        why: 'Condition and finishing interact — a Fully Finished + Excellent property is worth far more than the sum of each factor independently.',
        benefits: 'Helps renovation investors quantify the value of upgrading both condition and finishing simultaneously.',
        how: 'Rows = condition level. Columns = finishing type. Darker cell = higher average price. The top-right cell (Excellent + Fully Finished) is always darkest.',
        usecase: 'A landlord sees that upgrading from Core & Shell to Fully Finished in a "Good" condition property adds EGP 800K on average — justifying a renovation budget of up to EGP 500K.',
      },
      {
        title: 'Furnished × Finishing Heatmap',
        chart: 'Cross-tab heatmap',
        icon: '🛋️',
        what: 'Average price for every combination of furnishing level (3) and finishing type (3).',
        why: 'Furnishing and finishing are often conflated. Separating them shows which one contributes more to price.',
        benefits: 'Sellers can decide whether to invest in furnishing vs finishing upgrades to maximise sale price.',
        how: 'Same reading as the condition heatmap. Compare the "Furnished + Fully Finished" cell vs "Furnished + Core & Shell" to isolate finishing value.',
        usecase: 'The heatmap reveals furnished units in Core & Shell buildings sell for less than unfurnished Fully Finished units — confirming finishing type outweighs furnishing in buyer preferences.',
      },
    ],
  },
  {
    id: 'diagnostic',
    label: 'Diagnostic',
    icon: '⚠️',
    color: 'yellow',
    description: 'Risk flags, outliers, and overpriced property detection.',
    analyses: [
      {
        title: 'Overpriced Listings by Area',
        chart: 'Bar chart',
        icon: '🚨',
        what: 'Percentage of listings in each area priced more than 15% above the area\'s median sqm rate.',
        why: 'Identifies areas with inflated listing prices — useful for buyer negotiation and seller benchmarking.',
        benefits: 'Buyers avoid overpaying; sellers price competitively; agents identify negotiation leverage.',
        how: 'Y-axis = % of listings overpriced. A bar above 30% = risky area with many inflated listings. Below 10% = fairly priced market.',
        usecase: 'The chart shows 38% of Ain Sokhna listings are overpriced. A buyer negotiates hard, using the market rate data to counter-offer 12% below asking price.',
      },
      {
        title: 'Bedrooms × Bathrooms Heatmap',
        chart: 'Cross-tab heatmap',
        icon: '🛏️',
        what: 'Average price for every bed/bath combination (e.g. 3 bed / 2 bath vs 3 bed / 3 bath).',
        why: 'Bathroom count is often underrated in valuations. This heatmap shows its independent contribution.',
        benefits: 'Developers can see whether adding an extra bathroom to a 3-bed unit meaningfully increases value.',
        how: 'Rows = bedroom count. Columns = bathroom count. Darker = higher price. Diagonal cells (equal beds + baths) are usually lightest — atypical configuration.',
        usecase: 'The heatmap shows a 4-bed / 4-bath unit is worth 22% more than a 4-bed / 2-bath unit. A developer installs en-suite bathrooms in all bedrooms of a new project.',
      },
    ],
  },
  {
    id: 'predictive',
    label: 'Predictive',
    icon: '🤖',
    color: 'teal',
    description: 'ML model performance and feature importance analysis.',
    analyses: [
      {
        title: 'Feature Importance',
        chart: 'Horizontal bar chart',
        icon: '🎯',
        what: 'The relative importance of each input variable to the RandomForest analytics model, expressed as a percentage of total importance.',
        why: 'Explains which factors actually drive price — validating (or challenging) conventional wisdom.',
        benefits: 'Focuses buyer/seller attention on the variables that matter most. Guides data collection priorities.',
        how: 'X-axis = importance %. Longer bar = more influential. Typically: area_sqm is #1, followed by location and sqm_market_rate. Building age and distances are lower.',
        usecase: 'Feature importance shows "distance_to_metro" ranks #5. A developer acquires land near a planned metro station, predicting future appreciation.',
      },
      {
        title: 'Price vs Size Scatter',
        chart: 'Scatter plot',
        icon: '⚡',
        what: 'Each dot is one of 600 sampled listings, plotting area (m²) on X against price (EGP) on Y. Colour = property type.',
        why: 'Visualises the size-price relationship and shows how much variance exists at each size level.',
        benefits: 'Buyers can benchmark specific properties against the cluster to spot underpriced outliers.',
        how: 'X-axis = size (m²). Y-axis = price (EGP). Dots cluster along a rising line. Dots above the cluster = overpriced; below = underpriced. Colour shows type.',
        usecase: 'A buyer finds a 150 m² apartment priced at EGP 2.1M. The scatter shows comparable units cluster at 3.5–4M EGP — a strong buying signal.',
      },
      {
        title: 'Price vs Metro Distance Scatter',
        chart: 'Scatter plot',
        icon: '🚇',
        what: '500 sampled listings plotted with metro distance (km) on X and price (EGP) on Y.',
        why: 'Tests the conventional wisdom that metro proximity adds value in Egyptian cities.',
        benefits: 'Quantifies metro premium so buyers and investors can price location advantages accurately.',
        how: 'X-axis = km from metro. Y-axis = price. A downward trend (cluster shifts lower as distance increases) confirms metro premium. Flat = metro doesn\'t matter in that market.',
        usecase: 'The scatter confirms a clear downward trend. An investor systematically targets properties within 1 km of metro stations in New Cairo.',
      },
    ],
  },
  {
    id: 'investment',
    label: 'Investment',
    icon: '💰',
    color: 'green',
    description: 'ROI, rental yield, compound premium, and amenity value analysis.',
    analyses: [
      {
        title: 'ROI by Area',
        chart: 'Bar chart',
        icon: '📈',
        what: 'Average Return on Investment (%) for each area, calculated as (market_value − price) / price × 100.',
        why: 'Not all cheap areas are good investments — ROI normalises for price level and shows genuine value opportunity.',
        benefits: 'Investors rank areas by value-for-money rather than absolute price, revealing hidden opportunities in secondary markets.',
        how: 'Y-axis = ROI %. Taller bar = better investment value relative to asking price. Bars above 8% = above-average opportunity.',
        usecase: 'Badr City shows ROI of 12% vs Zamalek at 3%. An investor allocates budget to Badr City for income properties rather than Zamalek for capital growth.',
      },
      {
        title: 'Amenity Premium Analysis',
        chart: 'Grouped bar chart',
        icon: '🏊',
        what: 'For each amenity (pool, gym, security, elevator, balcony, compound), shows the average price WITH vs WITHOUT that feature, and the premium percentage.',
        why: 'Amenities have costs — this quantifies whether the market actually rewards each one in the sale price.',
        benefits: 'Developers make evidence-based decisions about which amenities to include. Buyers know which upgrades to prioritise.',
        how: 'Each group = one amenity. Blue bar = without, Green bar = with. The gap = premium in EGP. The % label = return on that feature.',
        usecase: 'The chart shows a pool adds 18% to price but costs EGP 200K to build. On a EGP 3M unit, 18% = EGP 540K uplift — a profitable upgrade.',
      },
      {
        title: 'Compound vs Non-Compound Premium',
        chart: 'Bar chart by area',
        icon: '🏘️',
        what: 'For each area, shows average price inside a compound vs outside, and the compound premium %.',
        why: 'Compound premium varies widely by area — in some areas it is 30%, in others near zero.',
        benefits: 'Investors choose between compound and non-compound assets based on local premiums. Developers decide whether to build within a gated community.',
        how: 'Each area has two bars: orange (non-compound) and green (compound). The larger the gap, the bigger the premium. Check premium % labels.',
        usecase: 'New Administrative Capital shows a 28% compound premium. A developer launches a gated community project there, pricing units at a 25% premium to standalone.',
      },
      {
        title: 'Rental Yield by Area',
        chart: 'Bar chart',
        icon: '🏦',
        what: 'Estimated annual rental yield (%) by area, calculated as (annual rent estimate) / price × 100.',
        why: 'Capital growth and rental income are different investment strategies. Yield maps the income-return geography.',
        benefits: 'Buy-to-let investors identify which areas generate the best rental income relative to purchase price.',
        how: 'Y-axis = yield %. Higher bar = better rental income return. Tourist/resort areas (Hurghada, Ain Sokhna) typically show highest yields.',
        usecase: 'Hurghada shows 9.2% yield vs Cairo areas averaging 5%. An investor buys a holiday unit in Hurghada for short-term rental income.',
      },
    ],
  },
  {
    id: 'location',
    label: 'Location',
    icon: '📍',
    color: 'indigo',
    description: 'Area-by-area comparison, market heat index, and distance impact.',
    analyses: [
      {
        title: 'Area Comparison Table',
        chart: 'Sortable data table',
        icon: '🗺️',
        what: 'A detailed table with one row per area showing: avg price, median price, sqm rate, listing count, avg ROI, avg yield, overpriced %, metro distance, demand score, and HOT/WARM/COLD tag.',
        why: 'Charts are great for trends; tables are necessary for precise comparisons and due diligence.',
        benefits: 'Investors can sort by any column to find the best area for their specific criteria.',
        how: 'Click any column header to sort. HOT = demand score > 66, WARM = 33–66, COLD = below 33. Red overpriced % = proceed with caution.',
        usecase: 'An investor sorts by yield descending, then cross-checks that the top-yielding areas also have low overpriced % — confirming genuine market value.',
      },
      {
        title: 'Price vs Distance to Center',
        chart: 'Bar chart by distance band',
        icon: '🎯',
        what: 'Average price grouped by bands of distance from Cairo city center: <5km, 5–10km, 10–15km, 15–20km, 20–30km, 30km+.',
        why: 'The urban price gradient is a fundamental real estate concept. Measuring it empirically validates (or challenges) conventional assumptions.',
        benefits: 'Buyers understand how far their budget takes them from the city centre.',
        how: 'X-axis = distance band. Y-axis = avg price. A descending staircase confirms the urban premium. Flat or rising at 20km+ = new urban nodes forming.',
        usecase: 'The chart shows prices actually rise at 40–50km (New Administrative Capital effect). A buyer in that range isn\'t getting a discount — they\'re buying into a new premium zone.',
      },
      {
        title: 'Market Heat Bubble Chart',
        chart: 'Bubble scatter plot',
        icon: '🔥',
        what: 'Each bubble = one area. X-axis = ROI, Y-axis = rental yield, bubble size = listing count, colour = HOT/WARM/COLD.',
        why: 'Combines four dimensions (ROI, yield, supply, temperature) into one visual — the most information-dense chart on the dashboard.',
        benefits: 'The ideal investment zone is top-right (high ROI + high yield) with a large bubble (liquid market).',
        how: 'Top-right = best investment profile. Red bubble = HOT market (high demand). Large bubble = more supply (less liquidity risk). Hover for exact stats.',
        usecase: 'A fund manager spots a mid-size green bubble in the top-right quadrant. They identify this as a WARM but high-return area, allocating capital before it heats up.',
      },
      {
        title: 'Box Plot by Area',
        chart: 'Box and whisker plot',
        icon: '📦',
        what: 'For each area, shows the P10, P25, median, P75, and P90 price distribution as a box plot.',
        why: 'Averages hide price spread. A wide box = volatile market. A narrow box = consistent pricing.',
        benefits: 'Negotiators use P10–P25 as realistic low offers. Sellers price above P75 for premium positioning.',
        how: 'Box = P25 to P75 (interquartile range). Line inside box = median. Whiskers = P10 and P90. Outlier dots beyond whiskers = luxury or distressed outliers.',
        usecase: 'The Zamalek box shows P25 = EGP 8M and P75 = EGP 22M — an enormous range. A buyer knows there are occasional value opportunities well below the average.',
      },
    ],
  },
  {
    id: 'risk',
    label: 'Risk',
    icon: '⚡',
    color: 'red',
    description: 'Market risk scores, volatility indicators, and overpricing flags.',
    analyses: [
      {
        title: 'Overpriced % by Area',
        chart: 'Ranked bar chart',
        icon: '🚩',
        what: 'Areas ranked by what percentage of their listings are priced more than 15% above the local sqm market rate.',
        why: 'High overpriced % = speculative or inflated market = higher buyer risk and slower transaction velocity.',
        benefits: 'Risk-averse buyers avoid high-overpriced-% areas. Bargain hunters target them knowing negotiation room exists.',
        how: 'Y-axis = % overpriced. Red threshold line at 25%. Areas above = elevated risk. Sort from worst to best to see the riskiest markets.',
        usecase: 'A first-time buyer sees their target area is 42% overpriced — they broaden their search to a neighbouring area at 11%, reducing overpayment risk.',
      },
      {
        title: 'Price Volatility by Area',
        chart: 'Bar chart (std dev)',
        icon: '📉',
        what: 'Standard deviation of listing prices within each area — a measure of price spread and market stability.',
        why: 'High std dev = unpredictable market = harder to value, harder to finance, harder to exit.',
        benefits: 'Conservative investors prioritise low-volatility areas. Speculators target high-volatility areas for potential outsized returns.',
        how: 'Y-axis = std dev in EGP millions. Taller bar = wider price spread. Compare to the area\'s median price to contextualise (high std dev on cheap area = chaotic; on expensive area = expected).',
        usecase: 'Two areas have similar median prices. Area A has std dev 1.2M, Area B has 3.8M. A pension fund buys in Area A for predictable valuation; a speculator targets Area B.',
      },
    ],
  },
]

// ── Analysis Card ─────────────────────────────────────────────────────────────
function AnalysisCard({ analysis }: { analysis: typeof SECTIONS[0]['analyses'][0] }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="bg-white border border-sand-200 rounded-2xl overflow-hidden hover:border-brand-200 transition-all">
      {/* Header — always visible */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-sand-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl w-8 text-center">{analysis.icon}</span>
          <div>
            <p className="font-semibold text-sand-900 text-sm">{analysis.title}</p>
            <p className="text-sand-400 text-xs mt-0.5">{analysis.chart}</p>
          </div>
        </div>
        <span className={`text-sand-400 text-sm transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {/* Expanded content */}
      {open && (
        <div className="border-t border-sand-100 px-5 py-5 space-y-4">
          {[
            { label: '📌 What it represents', text: analysis.what },
            { label: '🎯 Why it exists',        text: analysis.why },
            { label: '✅ Benefits',             text: analysis.benefits },
            { label: '📖 How to read it',       text: analysis.how },
            { label: '💼 Real use case',        text: analysis.usecase },
          ].map(({ label, text }) => (
            <div key={label}>
              <p className="text-xs font-semibold text-brand-600 mb-1">{label}</p>
              <p className="text-sand-600 text-sm leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Section Tab Button ────────────────────────────────────────────────────────
function TabBtn({ section, active, onClick }: { section: typeof SECTIONS[0]; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
        active
          ? 'bg-brand-500 text-white shadow-md shadow-brand-200'
          : 'bg-white border border-sand-200 text-sand-600 hover:border-brand-200 hover:text-brand-600'
      }`}
    >
      <span>{section.icon}</span>
      <span>{section.label}</span>
      <span className={`text-xs rounded-full px-1.5 py-0.5 ${active ? 'bg-white/20 text-white' : 'bg-sand-100 text-sand-500'}`}>
        {section.analyses.length}
      </span>
    </button>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AnalyticsGuidePage() {
  const [activeSection, setActiveSection] = useState(SECTIONS[0].id)
  const section = SECTIONS.find(s => s.id === activeSection)!

  const totalAnalyses = SECTIONS.reduce((sum, s) => sum + s.analyses.length, 0)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-brand-500 text-lg">◈</span>
          <span className="text-xs font-semibold text-sand-400 uppercase tracking-widest">Dashboard Documentation</span>
        </div>
        <h1 className="font-display text-3xl text-brand-900 mb-2">Analytics Guide</h1>
        <p className="text-sand-600 text-sm max-w-xl leading-relaxed">
          A complete reference for every chart, metric, and analysis tab in the Market Analytics dashboard.
          Click any analysis to expand a full explanation.
        </p>
        <div className="flex gap-3 mt-4">
          <div className="bg-brand-50 border border-brand-100 rounded-xl px-4 py-2">
            <p className="font-display text-xl text-brand-700">{SECTIONS.length}</p>
            <p className="text-xs text-brand-600">Dashboard tabs</p>
          </div>
          <div className="bg-sand-100 border border-sand-200 rounded-xl px-4 py-2">
            <p className="font-display text-xl text-sand-800">{totalAnalyses}</p>
            <p className="text-xs text-sand-600">Charts & metrics</p>
          </div>
          <div className="bg-white border border-sand-200 rounded-xl px-4 py-2">
            <p className="font-display text-xl text-sand-800">30K</p>
            <p className="text-xs text-sand-600">Data points</p>
          </div>
        </div>
      </div>

      {/* Tab selector */}
      <div className="flex gap-2 flex-wrap">
        {SECTIONS.map(s => (
          <TabBtn key={s.id} section={s} active={activeSection === s.id} onClick={() => setActiveSection(s.id)} />
        ))}
      </div>

      {/* Active section */}
      <div>
        {/* Section header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="font-display text-xl text-brand-900 flex items-center gap-2">
              <span>{section.icon}</span>
              {section.label} Tab
            </h2>
            <p className="text-sand-500 text-sm mt-0.5">{section.description}</p>
          </div>
          <span className="bg-brand-50 text-brand-600 text-xs font-semibold px-3 py-1.5 rounded-full border border-brand-100 shrink-0">
            {section.analyses.length} {section.analyses.length === 1 ? 'analysis' : 'analyses'}
          </span>
        </div>

        {/* Analysis cards */}
        <div className="space-y-3">
          {section.analyses.map(a => <AnalysisCard key={a.title} analysis={a} />)}
        </div>
      </div>

      {/* Footer quick reference */}
      <div className="bg-brand-900 rounded-2xl p-6 text-white">
        <p className="text-brand-200 text-xs uppercase tracking-widest font-semibold mb-3">Quick Reference</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          {[
            ['Price formula', 'sqm_rate × area × multipliers'],
            ['ROI',           '(market_val - price) / price × 100'],
            ['Yield',         '(sqm_rate × area × 6%) / price × 100'],
            ['Overpriced',    'price > median_sqm_rate × area × 1.15'],
            ['Demand score',  'normalised sqm_rate (0–100 scale)'],
            ['HOT threshold', 'demand_score > 66'],
          ].map(([k, v]) => (
            <div key={k} className="bg-white/5 rounded-xl p-3">
              <p className="text-brand-300 font-semibold mb-1">{k}</p>
              <p className="text-brand-100 font-mono text-[10px] leading-relaxed">{v}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
