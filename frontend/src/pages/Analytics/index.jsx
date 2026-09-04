import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { analyticsApi } from '../../api/analytics'
import TrendChart from '../../components/charts/TrendChart'
import CategoryPieChart from '../../components/charts/CategoryPieChart'
import Button from '../../components/common/Button'
import './Analytics.css'

export default function Analytics() {
  const { user } = useAuth()
  const currency = user?.currency_symbol || '₹'
  const [trends, setTrends] = useState([])
  const [breakdown, setBreakdown] = useState([])
  const [months, setMonths] = useState(6)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [trendsRes, breakdownRes] = await Promise.all([
        analyticsApi.trends({ months }),
        analyticsApi.categoryBreakdown(),
      ])
      setTrends(trendsRes.data)
      setBreakdown(breakdownRes.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [months])

  const handleExport = async () => {
    setExporting(true)
    try {
      const res = await analyticsApi.export({})
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = 'spendwise_export.csv'
      a.click()
      window.URL.revokeObjectURL(url)
    } finally {
      setExporting(false)
    }
  }

  const totalSpent = breakdown.reduce((acc, b) => acc + b.total, 0)
  const fmt = (n) => `${currency}${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Deep dive into your financial patterns</p>
        </div>
        <Button id="export-csv-btn" variant="secondary" loading={exporting} onClick={handleExport}>
          📤 Export CSV
        </Button>
      </div>

      {/* Trend period selector */}
      <div className="analytics-controls">
        <span className="analytics-label">Trend period:</span>
        {[3, 6, 12].map(m => (
          <button
            key={m}
            id={`trend-period-${m}`}
            className={`period-btn ${months === m ? 'period-btn--active' : ''}`}
            onClick={() => setMonths(m)}
          >
            {m} months
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
      ) : (
        <>
          <div className="charts-grid">
            <div className="card">
              <h2 className="section-title">Income vs Expenses</h2>
              <TrendChart data={trends} currency={currency} />
            </div>
            <div className="card">
              <h2 className="section-title">Spending Breakdown</h2>
              <CategoryPieChart data={breakdown} currency={currency} />
            </div>
          </div>

          {/* Category breakdown table */}
          {breakdown.length > 0 && (
            <div className="card" style={{ marginTop: 'var(--space-6)' }}>
              <h2 className="section-title">Category Detail</h2>
              <div className="breakdown-list">
                {breakdown.map(b => (
                  <div key={b.category_id} className="breakdown-row">
                    <div className="breakdown-left">
                      <span className="breakdown-icon" style={{ background: `${b.color}20`, color: b.color }}>
                        {b.icon}
                      </span>
                      <div>
                        <p className="breakdown-name">{b.name}</p>
                        <p className="breakdown-pct">{b.percentage}% of total</p>
                      </div>
                    </div>
                    <div className="breakdown-right">
                      <div className="breakdown-bar-track">
                        <div
                          className="breakdown-bar-fill"
                          style={{ width: `${b.percentage}%`, background: b.color }}
                        />
                      </div>
                      <span className="breakdown-amount">{fmt(b.total)}</span>
                    </div>
                  </div>
                ))}
                <div className="breakdown-total">
                  <span>Total Expenses</span>
                  <span style={{ color: 'var(--orange)', fontWeight: 800 }}>{fmt(totalSpent)}</span>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
