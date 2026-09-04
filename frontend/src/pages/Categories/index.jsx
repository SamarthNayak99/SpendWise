import { useState, useEffect } from 'react'
import { categoriesApi } from '../../api/categories'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import './Categories.css'

const EMOJI_OPTIONS = ['🍔','🚗','🛍️','🎮','💊','🏠','⚡','📚','✈️','💼','💻','📈','💰','🎵','☕','🏋️','🐾','🎁','📱','🎨']
const COLOR_OPTIONS = ['#4ade80','#f97316','#3b82f6','#a855f7','#ec4899','#ef4444','#f59e0b','#06b6d4','#10b981','#8b5cf6','#22d3ee','#84cc16']

const EMPTY_FORM = { name: '', icon: '💰', color: '#4ade80' }

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')

  const fetchCategories = async () => {
    try {
      const res = await categoriesApi.list()
      setCategories(res.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCategories() }, [])

  const openAdd = () => { setEditTarget(null); setForm(EMPTY_FORM); setFormError(''); setModalOpen(true) }
  const openEdit = (cat) => {
    setEditTarget(cat)
    setForm({ name: cat.name, icon: cat.icon, color: cat.color })
    setFormError('')
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    setFormError('')
    try {
      if (editTarget) {
        await categoriesApi.update(editTarget.id, form)
      } else {
        await categoriesApi.create(form)
      }
      setModalOpen(false)
      fetchCategories()
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Something went wrong.')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await categoriesApi.delete(deleteTarget.id)
      setDeleteTarget(null)
      fetchCategories()
    } catch (e) { console.error(e) }
  }

  const userCats = categories.filter(c => !c.is_default)
  const defaultCats = categories.filter(c => c.is_default)

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1 className="page-title">Categories</h1>
          <p className="page-subtitle">Organize your spending</p>
        </div>
        <Button id="add-category-btn" variant="primary" onClick={openAdd}>+ New Category</Button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
      ) : (
        <>
          {userCats.length > 0 && (
            <>
              <h2 className="section-title">My Categories</h2>
              <div className="categories-grid" style={{ marginBottom: 'var(--space-8)' }}>
                {userCats.map(cat => (
                  <div key={cat.id} className="category-card" style={{ borderColor: `${cat.color}40` }}>
                    <div className="category-card-icon" style={{ background: `${cat.color}20`, color: cat.color }}>
                      {cat.icon}
                    </div>
                    <p className="category-card-name">{cat.name}</p>
                    <div className="category-card-actions">
                      <button id={`edit-cat-${cat.id}`} className="action-btn" onClick={() => openEdit(cat)}>✏️</button>
                      <button id={`delete-cat-${cat.id}`} className="action-btn action-btn--danger" onClick={() => setDeleteTarget(cat)}>🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <h2 className="section-title">Default Categories</h2>
          <div className="categories-grid">
            {defaultCats.map(cat => (
              <div key={cat.id} className="category-card category-card--default" style={{ borderColor: `${cat.color}30` }}>
                <div className="category-card-icon" style={{ background: `${cat.color}20`, color: cat.color }}>
                  {cat.icon}
                </div>
                <p className="category-card-name">{cat.name}</p>
                <span className="category-card-badge">Default</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editTarget ? 'Edit Category' : 'New Category'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button id="category-submit-btn" variant="primary" loading={formLoading} onClick={handleSubmit}>
              {editTarget ? 'Save' : 'Create'}
            </Button>
          </>
        }
      >
        {formError && <div className="auth-error">{formError}</div>}
        <form id="category-form" className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Name</label>
            <input id="category-name-input" className="form-input" placeholder="e.g. Fitness"
              value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label className="form-label">Icon (Emoji)</label>
            <div className="emoji-grid">
              {EMOJI_OPTIONS.map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  className={`emoji-btn ${form.icon === emoji ? 'emoji-btn--active' : ''}`}
                  onClick={() => setForm(f => ({ ...f, icon: emoji }))}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Color</label>
            <div className="color-grid">
              {COLOR_OPTIONS.map(color => (
                <button
                  key={color}
                  type="button"
                  className={`color-btn ${form.color === color ? 'color-btn--active' : ''}`}
                  style={{ background: color }}
                  onClick={() => setForm(f => ({ ...f, color }))}
                  title={color}
                />
              ))}
            </div>
            <div className="color-preview" style={{ marginTop: 'var(--space-2)' }}>
              <span className="category-pill" style={{ background: `${form.color}20`, color: form.color, fontSize: 'var(--font-size-sm)' }}>
                {form.icon} {form.name || 'Preview'}
              </span>
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Category"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button id="confirm-delete-cat-btn" variant="danger" onClick={handleDelete}>Delete</Button>
          </>
        }
      >
        <p style={{ color: 'var(--text-secondary)' }}>
          Delete <strong style={{ color: 'var(--text-primary)' }}>{deleteTarget?.icon} {deleteTarget?.name}</strong>?
          Expenses in this category will become uncategorized.
        </p>
      </Modal>
    </div>
  )
}
