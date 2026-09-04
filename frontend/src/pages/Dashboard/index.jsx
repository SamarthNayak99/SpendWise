import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { analyticsApi } from '../../api/analytics'
import { budgetsApi } from '../../api/budgets'
import StatCard from '../../components/common/StatCard'
import TrendChart from '../../components/charts/TrendChart'
import CategoryPieChart from '../../components/charts/CategoryPieChart'
import './Dashboard.css'

export default function Dashboard() {
  const { user } = useAuth()
  const [dashboard, setDashboard] = useState(null)
  const [trends, setTrends] = useState([])
  const [breakdown, setBreakdown] = useState([])
  const [budgetStatus, setBudgetStatus] = useState([])
  const [loading, setLoading] = useState(true)

  const currency = user?.currency_symbol || '₹'
  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [dashRes, trendsRes, breakdownRes, budgetRes] = await Promise.all([
          analyticsApi.dashboard({ month, year }),
          analyticsApi.trends({ months: 6 }),
          analyticsApi.categoryBreakdown(),
          budgetsApi.status({ month, year }),
        ])
        setDashboard(dashRes.data)
        setTrends(trendsRes.data)
        setBreakdown(breakdownRes.data)
        setBudgetStatus(budgetRes.data)
      } catch (err) {
        console.error('Dashboard fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [month, year])

  const fmt = (n) => `${currency}${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner" />
        <p>Loading your dashboard...</p>
      </div>
    )
  }

  const overBudget = budgetStatus.filter(b => b.is_over_threshold)

  return (
    <div className="dashboard animate-fadeIn">
      {/* Budget Alerts */}
      {overBudget.length > 0 && (
        <div className="alert-banner">
          <span className="alert-icon">⚠️</span>
          <span>
            <strong>{overBudget.length} budget{overBudget.length > 1 ? 's' : ''}</strong> approaching limit this month:{' '}
            {overBudget.map(b => b.category.name).join(', ')}
          </span>
        </div>
      )}

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard
          label="Total Balance"
          value={fmt(dashboard?.balance)}
          subtext="All time"
          accent={dashboard?.balance >= 0 ? 'green' : 'red'}
          icon="💰"
        />
        <StatCard
          label="This Month Income"
          value={fmt(dashboard?.month?.income)}
          subtext={`${new Date(year, month - 1).toLocaleString('en', { month: 'long' })} ${year}`}
          accent="green"
          icon="📥"
        />
        <StatCard
          label="This Month Expenses"
          value={fmt(dashboard?.month?.expenses)}
          subtext={`${new Date(year, month - 1).toLocaleString('en', { month: 'long' })} ${year}`}
          accent="orange"
          icon="📤"
        />
        <StatCard
          label="Savings Rate"
          value={`${dashboard?.month?.savings_rate?.toFixed(1) || 0}%`}
          subtext="Income vs Expenses"
          accent={dashboard?.month?.savings_rate > 20 ? 'green' : 'orange'}
          icon="📊"
        />
      </div>

      {/* Charts Row */}
      <div className="charts-grid" style={{ marginTop: 'var(--space-6)' }}>
        <div className="card">
          <h2 className="section-title">Monthly Trends</h2>
          <TrendChart data={trends} currency={currency} />
        </div>
        <div className="card">
          <h2 className="section-title">Spending by Category</h2>
          <CategoryPieChart data={breakdown} currency={currency} />
        </div>
      </div>

      {/* Recent Expenses */}
      <div className="card" style={{ marginTop: 'var(--space-6)' }}>
        <h2 className="section-title">Recent Transactions</h2>
        {dashboard?.recent_expenses?.length === 0 ? (
          <p className="empty-state">No transactions yet. <a href="/expenses">Add your first expense →</a></p>
        ) : (
          <div className="recent-list">
            {dashboard?.recent_expenses?.map(e => (
              <div key={e.id} className="recent-item">
                <div className="recent-item-left">
                  <span
                    className="recent-icon"
                    style={{ background: e.category?.color ? `${e.category.color}20` : 'var(--bg-surface-2)' }}
                  >
                    {e.category?.icon || '💰'}
                  </span>
                  <div>
                    <p className="recent-title">{e.title}</p>
                    <p className="recent-meta">
                      {e.category?.name || 'Uncategorized'} · {e.date}
                    </p>
                  </div>
                </div>
                <span className={`recent-amount ${e.type === 'income' ? 'recent-amount--income' : 'recent-amount--expense'}`}>
                  {e.type === 'income' ? '+' : '-'}{fmt(e.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
