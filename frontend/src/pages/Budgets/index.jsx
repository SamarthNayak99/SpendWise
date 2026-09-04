import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { budgetsApi } from '../../api/budgets'
import { categoriesApi } from '../../api/categories'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import './Budgets.css'

const now = new Date()
const CUR_MONTH = now.getMonth() + 1
const CUR_YEAR = now.getFullYear()

export default function Budgets() {
  const { user } = useAuth()
  const currency = user?.currency_symbol || '₹'
  const [budgetStatus, setBudgetStatus] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [form, setForm] = useState({ category_id: '', amount: '', month: CUR_MONTH, year: CUR_YEAR, alert_threshold: 0.8 })
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [month, setMonth] = useState(CUR_MONTH)
  const [year, setYear] = useState(CUR_YEAR)

  const fetchData = async () => {
    try {
      const [statusRes, catRes] = await Promise.all([
        budgetsApi.status({ month, year }),
        categoriesApi.list(),
      ])
      setBudgetStatus(statusRes.data)
      setCategories(catRes.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [month, year])

  const openAdd = () => {
    setEditTarget(null)
    setForm({ category_id: '', amount: '', month, year, alert_threshold: 0.8 })
    setFormError('')
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    setFormError('')
    try {
      const payload = { ...form, amount: parseFloat(form.amount), alert_threshold: parseFloat(form.alert_threshold) }
      if (editTarget) {
        await budgetsApi.update(editTarget.id, { amount: payload.amount, alert_threshold: payload.alert_threshold })
      } else {
        await budgetsApi.create(payload)
      }
      setModalOpen(false)
      fetchData()
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Something went wrong.')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await budgetsApi.delete(id)
      fetchData()
    } catch (e) { console.error(e) }
  }

  const fmt = (n) => `${currency}${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`

  const getProgressColor = (pct) => {
    if (pct >= 100) return 'var(--red)'
    if (pct >= 80) return 'var(--yellow)'
    return 'var(--green)'
  }

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1 className="page-title">Budgets</h1>
          <p className="page-subtitle">Set monthly limits and track your progress</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
          <select id="budget-month-filter" className="filter-select" value={month} onChange={e => setMonth(Number(e.target.value))}>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i+1} value={i+1}>{new Date(2000, i).toLocaleString('en', { month: 'long' })}</option>
            ))}
          </select>
          <select id="budget-year-filter" className="filter-select" value={year} onChange={e => setYear(Number(e.target.value))}>
            {[2023, 2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <Button id="add-budget-btn" variant="primary" onClick={openAdd}>+ Set Budget</Button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
      ) : budgetStatus.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-16) 0', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '3rem' }}>🎯</p>
          <p style={{ marginTop: 'var(--space-4)' }}>No budgets set for this month.</p>
          <Button id="add-first-budget-btn" variant="primary" onClick={openAdd} style={{ marginTop: 'var(--space-4)' }}>
            Set your first budget
          </Button>
        </div>
      ) : (
        <div className="budgets-grid">
          {budgetStatus.map(b => {
            const color = getProgressColor(b.percentage)
            return (
              <div key={b.id} className={`budget-card ${b.is_over_budget ? 'budget-card--over' : b.is_over_threshold ? 'budget-card--warn' : ''}`}>
                <div className="budget-card-header">
                  <div className="budget-cat-info">
                    <span className="budget-cat-icon" style={{ background: `${b.category.color}20`, color: b.category.color }}>
                      {b.category.icon}
                    </span>
                    <span className="budget-cat-name">{b.category.name}</span>
                  </div>
                  <div className="budget-actions">
                    {b.is_over_threshold && !b.is_over_budget && (
                      <span className="budget-warn-badge">⚠️ Alert</span>
                    )}
                    {b.is_over_budget && (
                      <span className="budget-danger-badge">🔴 Over</span>
                    )}
                    <button id={`delete-budget-${b.id}`} className="action-btn action-btn--danger" onClick={() => handleDelete(b.id)}>🗑️</button>
                  </div>
                </div>

                <div className="budget-amounts">
                  <span className="budget-spent">{fmt(b.spent_amount)}</span>
                  <span className="budget-of"> / {fmt(b.budget_amount)}</span>
                </div>

                {/* Progress bar */}
                <div className="budget-progress-track">
                  <div
                    className="budget-progress-fill"
                    style={{
                      width: `${Math.min(b.percentage, 100)}%`,
                      background: color,
                    }}
                  />
                </div>

                <div className="budget-footer">
                  <span style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)' }}>
                    {b.percentage.toFixed(1)}% used
                  </span>
                  <span style={{ color: b.remaining >= 0 ? 'var(--green)' : 'var(--red)', fontSize: 'var(--font-size-xs)', fontWeight: 600 }}>
                    {b.remaining >= 0 ? `${fmt(b.remaining)} left` : `${fmt(Math.abs(b.remaining))} over`}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editTarget ? 'Edit Budget' : 'Set Budget'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button id="budget-submit-btn" variant="primary" loading={formLoading} onClick={handleSubmit}>
              {editTarget ? 'Save' : 'Set Budget'}
            </Button>
          </>
        }
      >
        {formError && <div className="auth-error">{formError}</div>}
        <form id="budget-form" className="auth-form" onSubmit={handleSubmit}>
          {!editTarget && (
            <div className="form-group">
              <label className="form-label">Category</label>
              <select id="budget-category-input" className="form-select" value={form.category_id}
                onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))} required>
                <option value="">Select Category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </div>
          )}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Budget Amount ({currency})</label>
              <input id="budget-amount-input" type="number" step="0.01" min="1" className="form-input"
                placeholder="5000.00" value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Alert at (%)</label>
              <input id="budget-threshold-input" type="number" min="10" max="100" className="form-input"
                placeholder="80" value={Math.round(form.alert_threshold * 100)}
                onChange={e => setForm(f => ({ ...f, alert_threshold: Number(e.target.value) / 100 }))} />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  )
}
