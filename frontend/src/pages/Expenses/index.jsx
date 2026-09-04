import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import { expensesApi } from '../../api/expenses'
import { categoriesApi } from '../../api/categories'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import './Expenses.css'

const EMPTY_FORM = {
  title: '', amount: '', type: 'expense', date: new Date().toISOString().split('T')[0],
  category_id: '', notes: '', is_recurring: false,
}

export default function Expenses() {
  const { user } = useAuth()
  const currency = user?.currency_symbol || '₹'
  const [expenses, setExpenses] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [filters, setFilters] = useState({ type: '', search: '' })

  const fetchExpenses = useCallback(async () => {
    try {
      const params = {}
      if (filters.type) params.type = filters.type
      if (filters.search) params.search = filters.search
      const res = await expensesApi.list(params)
      setExpenses(res.data)
    } catch (e) {
      console.error(e)
    }
  }, [filters])

  useEffect(() => {
    const init = async () => {
      const [_, catRes] = await Promise.all([fetchExpenses(), categoriesApi.list()])
      setCategories(catRes.data)
      setLoading(false)
    }
    init()
  }, [])

  useEffect(() => { fetchExpenses() }, [filters])

  const openAdd = () => { setEditTarget(null); setForm(EMPTY_FORM); setFormError(''); setModalOpen(true) }
  const openEdit = (e) => {
    setEditTarget(e)
    setForm({
      title: e.title, amount: e.amount, type: e.type,
      date: e.date, category_id: e.category_id || '', notes: e.notes || '', is_recurring: e.is_recurring,
    })
    setFormError('')
    setModalOpen(true)
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    setFormLoading(true)
    setFormError('')
    try {
      const payload = { ...form, amount: parseFloat(form.amount), category_id: form.category_id || null }
      if (editTarget) {
        await expensesApi.update(editTarget.id, payload)
      } else {
        await expensesApi.create(payload)
      }
      setModalOpen(false)
      fetchExpenses()
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Something went wrong.')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await expensesApi.delete(deleteTarget.id)
      setDeleteTarget(null)
      fetchExpenses()
    } catch (e) { console.error(e) }
  }

  const fmt = (n) => `${currency}${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Expenses</h1>
          <p className="page-subtitle">Track your income and spending</p>
        </div>
        <Button id="add-expense-btn" variant="primary" onClick={openAdd}>+ Add Transaction</Button>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <input
          id="expense-search"
          className="filter-input"
          placeholder="🔍 Search transactions..."
          value={filters.search}
          onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
        />
        <select
          id="expense-type-filter"
          className="filter-select"
          value={filters.type}
          onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}
        >
          <option value="">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
      ) : expenses.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-16) 0', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '3rem' }}>📭</p>
          <p style={{ marginTop: 'var(--space-4)' }}>No transactions found.</p>
          <Button id="add-first-expense-btn" variant="primary" onClick={openAdd} style={{ marginTop: 'var(--space-4)' }}>
            Add your first transaction
          </Button>
        </div>
      ) : (
        <div className="card expense-table-card">
          <table className="expense-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Title</th>
                <th>Category</th>
                <th>Type</th>
                <th className="text-right">Amount</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map(e => (
                <tr key={e.id} className="expense-row">
                  <td className="expense-date">{e.date}</td>
                  <td className="expense-title">
                    <span>{e.title}</span>
                    {e.notes && <span className="expense-notes">{e.notes}</span>}
                  </td>
                  <td>
                    {e.category ? (
                      <span className="category-pill" style={{ background: `${e.category.color}20`, color: e.category.color }}>
                        {e.category.icon} {e.category.name}
                      </span>
                    ) : (
                      <span className="category-pill">—</span>
                    )}
                  </td>
                  <td>
                    <span className={`badge badge-${e.type}`}>{e.type}</span>
                  </td>
                  <td className={`expense-amount text-right ${e.type === 'income' ? 'text-green' : 'text-orange'}`}>
                    {e.type === 'income' ? '+' : '-'}{fmt(e.amount)}
                  </td>
                  <td className="text-right">
                    <div className="action-btns">
                      <button id={`edit-expense-${e.id}`} className="action-btn" onClick={() => openEdit(e)} title="Edit">✏️</button>
                      <button id={`delete-expense-${e.id}`} className="action-btn action-btn--danger" onClick={() => setDeleteTarget(e)} title="Delete">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editTarget ? 'Edit Transaction' : 'Add Transaction'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button id="expense-form-submit" variant="primary" loading={formLoading} onClick={handleSubmit}>
              {editTarget ? 'Save Changes' : 'Add Transaction'}
            </Button>
          </>
        }
      >
        {formError && <div className="auth-error">{formError}</div>}
        <form id="expense-form" className="auth-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Title</label>
              <input id="expense-title-input" className="form-input" placeholder="e.g. Groceries" value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Amount ({currency})</label>
              <input id="expense-amount-input" type="number" step="0.01" min="0.01" className="form-input"
                placeholder="0.00" value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Type</label>
              <select id="expense-type-input" className="form-select" value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input id="expense-date-input" type="date" className="form-input" value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select id="expense-category-input" className="form-select" value={form.category_id}
              onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}>
              <option value="">No Category</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Notes (optional)</label>
            <textarea id="expense-notes-input" className="form-textarea" placeholder="Any additional notes..."
              value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
        </form>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Transaction"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button id="confirm-delete-btn" variant="danger" onClick={handleDelete}>Delete</Button>
          </>
        }
      >
        <p style={{ color: 'var(--text-secondary)' }}>
          Are you sure you want to delete <strong style={{ color: 'var(--text-primary)' }}>{deleteTarget?.title}</strong>?
          This action cannot be undone.
        </p>
      </Modal>
    </div>
  )
}
